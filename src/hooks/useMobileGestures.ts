"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SwipeConfig {
  threshold?: number;
  velocity?: number;
  preventDefault?: boolean;
}

interface SwipeState {
  startX: number;
  startY: number;
  startTime: number;
  isTracking: boolean;
}

interface GestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPinchStart?: () => void;
  onPinchEnd?: () => void;
  onPinch?: (scale: number) => void;
}

export function useMobileGestures(
  elementRef: React.RefObject<HTMLElement | null>,
  callbacks: GestureCallbacks,
  config: SwipeConfig = {}
) {
  const {
    threshold = 50,
    velocity = 0.3,
    preventDefault = true,
  } = config;

  const swipeState = useRef<SwipeState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    isTracking: false,
  });

  const tapState = useRef({
    lastTapTime: 0,
    tapCount: 0,
    longPressTimer: null as NodeJS.Timeout | null,
  });

  const pinchState = useRef({
    startDistance: 0,
    isPinching: false,
  });

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        swipeState.current = {
          startX: touch.clientX,
          startY: touch.clientY,
          startTime: Date.now(),
          isTracking: true,
        };

        // Long press detection
        tapState.current.longPressTimer = setTimeout(() => {
          if (swipeState.current.isTracking) {
            callbacks.onLongPress?.();
            swipeState.current.isTracking = false;
          }
        }, 500);
      } else if (e.touches.length === 2) {
        // Pinch start
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        pinchState.current.startDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        pinchState.current.isPinching = true;
        callbacks.onPinchStart?.();
      }
    },
    [callbacks]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (preventDefault && swipeState.current.isTracking) {
        e.preventDefault();
      }

      // Clear long press timer on move
      if (tapState.current.longPressTimer) {
        clearTimeout(tapState.current.longPressTimer);
        tapState.current.longPressTimer = null;
      }

      // Handle pinch
      if (e.touches.length === 2 && pinchState.current.isPinching) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const scale = distance / pinchState.current.startDistance;
        callbacks.onPinch?.(scale);
      }
    },
    [callbacks, preventDefault]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      // Clear long press timer
      if (tapState.current.longPressTimer) {
        clearTimeout(tapState.current.longPressTimer);
        tapState.current.longPressTimer = null;
      }

      if (!swipeState.current.isTracking) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - swipeState.current.startX;
      const deltaY = touch.clientY - swipeState.current.startY;
      const deltaTime = Date.now() - swipeState.current.startTime;

      // Calculate velocity
      const velocityX = Math.abs(deltaX) / deltaTime;
      const velocityY = Math.abs(deltaY) / deltaTime;

      // Determine if it's a swipe or tap
      const isHorizontalSwipe =
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > threshold &&
        velocityX > velocity;

      const isVerticalSwipe =
        Math.abs(deltaY) > Math.abs(deltaX) &&
        Math.abs(deltaY) > threshold &&
        velocityY > velocity;

      if (isHorizontalSwipe) {
        if (deltaX > 0) {
          callbacks.onSwipeRight?.();
        } else {
          callbacks.onSwipeLeft?.();
        }
      } else if (isVerticalSwipe) {
        if (deltaY > 0) {
          callbacks.onSwipeDown?.();
        } else {
          callbacks.onSwipeUp?.();
        }
      } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        // It's a tap
        const now = Date.now();
        const timeSinceLastTap = now - tapState.current.lastTapTime;

        if (timeSinceLastTap < 300) {
          // Double tap
          callbacks.onDoubleTap?.();
          tapState.current.tapCount = 0;
        } else {
          // Single tap (delay to check for double tap)
          tapState.current.tapCount = 1;
          setTimeout(() => {
            if (tapState.current.tapCount === 1) {
              callbacks.onTap?.();
            }
            tapState.current.tapCount = 0;
          }, 300);
        }

        tapState.current.lastTapTime = now;
      }

      swipeState.current.isTracking = false;

      // Handle pinch end
      if (pinchState.current.isPinching) {
        pinchState.current.isPinching = false;
        callbacks.onPinchEnd?.();
      }
    },
    [callbacks, threshold, velocity]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart, { passive: !preventDefault });
    element.addEventListener("touchmove", handleTouchMove, { passive: !preventDefault });
    element.addEventListener("touchend", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);
}

// Hook for pull-to-refresh
export function usePullToRefresh(
  elementRef: React.RefObject<HTMLElement | null>,
  onRefresh: () => Promise<void>,
  config: { threshold?: number; maxPull?: number } = {}
) {
  const { threshold = 80, maxPull = 120 } = config;
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start pull if at top of element
      if (element.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;

      const deltaY = e.touches[0].clientY - startY.current;
      if (deltaY > 0) {
        e.preventDefault();
        const dampedDelta = Math.min(deltaY * 0.5, maxPull);
        setPullDistance(dampedDelta);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;

      isPulling.current = false;

      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
      }

      setPullDistance(0);
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [elementRef, onRefresh, threshold, maxPull, pullDistance, isRefreshing]);

  return { pullDistance, isRefreshing };
}

// Hook for horizontal scroll snap (for carousels)
export function useScrollSnap(
  elementRef: React.RefObject<HTMLElement | null>,
  itemWidth: number
) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const newIndex = Math.round(element.scrollLeft / itemWidth);
        setActiveIndex(newIndex);
      }, 50);
    };

    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [elementRef, itemWidth]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const element = elementRef.current;
      if (!element) return;

      element.scrollTo({
        left: index * itemWidth,
        behavior: "smooth",
      });
    },
    [elementRef, itemWidth]
  );

  return { activeIndex, scrollToIndex };
}

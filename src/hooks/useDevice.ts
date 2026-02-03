"use client";

import { useState, useEffect, useCallback } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";
export type Orientation = "portrait" | "landscape";

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  isTouch: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  orientation: Orientation;
  screenWidth: number;
  screenHeight: number;
  breakpoint: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

function getBreakpoint(width: number): DeviceInfo["breakpoint"] {
  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
}

function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.md) return "mobile";
  if (width < BREAKPOINTS.lg) return "tablet";
  return "desktop";
}

function detectTouch(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

function detectIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function detectAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        deviceType: "desktop",
        isTouch: false,
        isIOS: false,
        isAndroid: false,
        orientation: "landscape",
        screenWidth: 1920,
        screenHeight: 1080,
        breakpoint: "xl",
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = getDeviceType(width);

    return {
      isMobile: deviceType === "mobile",
      isTablet: deviceType === "tablet",
      isDesktop: deviceType === "desktop",
      deviceType,
      isTouch: detectTouch(),
      isIOS: detectIOS(),
      isAndroid: detectAndroid(),
      orientation: width > height ? "landscape" : "portrait",
      screenWidth: width,
      screenHeight: height,
      breakpoint: getBreakpoint(width),
    };
  });

  const updateDeviceInfo = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = getDeviceType(width);

    setDeviceInfo({
      isMobile: deviceType === "mobile",
      isTablet: deviceType === "tablet",
      isDesktop: deviceType === "desktop",
      deviceType,
      isTouch: detectTouch(),
      isIOS: detectIOS(),
      isAndroid: detectAndroid(),
      orientation: width > height ? "landscape" : "portrait",
      screenWidth: width,
      screenHeight: height,
      breakpoint: getBreakpoint(width),
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial check
    updateDeviceInfo();

    // Debounced resize handler
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateDeviceInfo, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", updateDeviceInfo);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", updateDeviceInfo);
      clearTimeout(resizeTimer);
    };
  }, [updateDeviceInfo]);

  return deviceInfo;
}

// Hook for media query matching
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Convenience hooks for common breakpoints
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

export function useIsTouch(): boolean {
  return useMediaQuery("(pointer: coarse)");
}

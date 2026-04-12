"use client";

import { useState, useRef, type ReactNode, type ButtonHTMLAttributes, type TouchEvent } from "react";

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "default" | "outline";
  size?: "sm" | "md" | "lg" | "touch";
  fullWidth?: boolean;
  ripple?: boolean;
  haptic?: boolean;
  className?: string;
}

export function TouchButton({
  children,
  variant = "primary",
  size = "touch",
  fullWidth = false,
  ripple = true,
  haptic = true,
  className,
  onTouchStart,
  onTouchEnd,
  onClick,
  ...props
}: TouchButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  const triggerHaptic = () => {
    if (haptic && typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleTouchStart = (e: TouchEvent<HTMLButtonElement>) => {
    if (ripple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const id = rippleId.current++;

      setRipples((prev) => [...prev, { x, y, id }]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }

    triggerHaptic();
    onTouchStart?.(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic();
    onClick?.(e);
  };

  const variantStyles = {
    primary: "bg-[#3B82F6] text-white hover:bg-[#2563EB] active:bg-[#1D4ED8]950",
    secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 active:bg-[#1D4ED8]100",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-[#1D4ED8]200",
    danger: "bg-red-600 text-white hover:bg-red-500 active:bg-red-700",
    default: "bg-[#3B82F6] text-white hover:bg-[#2563EB] active:bg-[#1D4ED8]950",
    outline: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 active:bg-[#1D4ED8]100",
  };

  const sizeStyles = {
    sm: "h-9 px-3 text-sm min-w-[44px]",
    md: "h-11 px-4 text-sm min-w-[44px]",
    lg: "h-12 px-6 text-base min-w-[48px]",
    touch: "h-12 min-h-[48px] px-5 text-base min-w-[48px] sm:h-11 sm:px-4 sm:text-sm",
  };

  return (
    <button
      ref={buttonRef}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium",
        "transition-all duration-150 ease-out",
        "active:scale-[0.98] touch-manipulation",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]400 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripple && (
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute animate-ripple rounded-full bg-white/30"
              style={{
                left: ripple.x,
                top: ripple.y,
                transform: "translate(-50%, -50%)",
                width: "200%",
                paddingTop: "200%",
              }}
            />
          ))}
        </span>
      )}
    </button>
  );
}

// Touch-friendly card component
interface TouchCardProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  className?: string;
  href?: string;
}

export function TouchCard({
  children,
  onPress,
  onLongPress,
  className,
  href,
}: TouchCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    setIsPressed(true);

    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
        setIsPressed(false);
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = () => {
    if (!longPressTimer.current) {
      onPress?.();
    }
  };

  const content = (
    <div
      className={cn(
        "relative rounded-2xl border border-gray-200 bg-white p-4",
        "transition-all duration-150 ease-out",
        "active:scale-[0.98] touch-manipulation",
        isPressed && "scale-[0.98] bg-gray-50",
        onPress && "cursor-pointer hover:border-gray-300",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={handleClick}
    >
      {children}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

// Touch-friendly input wrapper
interface TouchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function TouchInput({
  label,
  error,
  helperText,
  className,
  ...props
}: TouchInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5",
          "text-base text-gray-900 placeholder:text-gray-400",
          "transition-all duration-150 ease-out",
          "focus:border-[#3B82F6]900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]900/10",
          "min-h-[48px] sm:min-h-[44px] sm:py-3 sm:text-sm",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

// Bottom sheet component for mobile
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  height?: "auto" | "sm" | "md" | "lg" | "full";
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  height = "auto",
}: BottomSheetProps) {
  const heightStyles = {
    auto: "max-h-[80vh]",
    sm: "h-[30vh]",
    md: "h-[50vh]",
    lg: "h-[70vh]",
    full: "h-[90vh]",
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white",
          "animate-slide-up shadow-2xl",
          heightStyles[height]
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        {title && (
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </>
  );
}

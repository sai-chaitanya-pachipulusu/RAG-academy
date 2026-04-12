"use client";

import { useState, useRef, useEffect, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";

function cn(...classes: Array<string | undefined | false | null | 0 | 0n | "">) {
  return classes.filter(Boolean).join(" ");
}

// Mobile-optimized input component
interface MobileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

export function MobileInput({
  label,
  error,
  helperText,
  icon,
  className,
  ...props
}: MobileInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "w-full rounded-xl border bg-white transition-all duration-200-all duration-200",
            "text-base text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-[#3B82F6]900/10",
            "min-h-[52px] px-4 py-3.5",
            "sm:min-h-[48px] sm:py-3 sm:text-sm",
            icon && "pl-12",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              : isFocused
              ? "border-[#3B82F6]"
              : "border-gray-200",
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

// Mobile-optimized textarea
interface MobileTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  minRows?: number;
  maxRows?: number;
}

export function MobileTextarea({
  label,
  error,
  helperText,
  minRows = 4,
  maxRows = 10,
  className,
  ...props
}: MobileTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = "auto";
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, minRows * 24),
        maxRows * 24
      );
      textarea.style.height = `${newHeight}px`;
    };

    textarea.addEventListener("input", adjustHeight);
    adjustHeight();

    return () => textarea.removeEventListener("input", adjustHeight);
  }, [minRows, maxRows]);

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        ref={textareaRef}
        rows={minRows}
        className={cn(
          "w-full resize-none rounded-xl border bg-white transition-all duration-200-all duration-200",
          "text-base text-gray-900 placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-[#3B82F6]900/10",
          "min-h-[120px] px-4 py-3.5",
          "sm:min-h-[100px] sm:py-3 sm:text-sm",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
            : isFocused
            ? "border-[#3B82F6]"
            : "border-gray-200",
          className
        )}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

// Mobile-optimized select
interface MobileSelectOption {
  value: string;
  label: string;
}

interface MobileSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: MobileSelectOption[];
}

export function MobileSelect({
  label,
  error,
  helperText,
  options,
  className,
  ...props
}: MobileSelectProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={cn(
            "w-full appearance-none rounded-xl border bg-white transition-all duration-200-all duration-200",
            "text-base text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-[#3B82F6]900/10",
            "min-h-[52px] px-4 py-3.5 pr-12",
            "sm:min-h-[48px] sm:py-3 sm:text-sm",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              : isFocused
              ? "border-[#3B82F6]"
              : "border-gray-200",
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom arrow */}
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

// Mobile-optimized checkbox
interface MobileCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export function MobileCheckbox({
  label,
  description,
  className,
  ...props
}: MobileCheckboxProps) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-4", className)}>
      <div className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center">
        <input
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            "h-7 w-7 rounded-lg border-2 transition-all duration-200-all duration-200",
            "border-gray-300 bg-white",
            "peer-checked:border-[#3B82F6] peer-checked:bg-gray-900",
            "peer-focus:ring-2 peer-focus:ring-[#3B82F6]900/20"
          )}
        >
          <svg
            className="h-full w-full scale-0 text-white transition-all duration-200-transform duration-200 peer-checked:scale-100 cursor-pointer"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
      <div className="flex-1 pt-0.5">
        <span className="text-base font-medium text-gray-900">{label}</span>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
    </label>
  );
}

// Mobile-optimized radio button
interface MobileRadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export function MobileRadio({
  label,
  description,
  className,
  ...props
}: MobileRadioProps) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-4", className)}>
      <div className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center">
        <input
          type="radio"
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            "h-7 w-7 rounded-full border-2 transition-all duration-200-all duration-200",
            "border-gray-300 bg-white",
            "peer-checked:border-[#3B82F6] peer-checked:bg-gray-900",
            "peer-focus:ring-2 peer-focus:ring-[#3B82F6]900/20"
          )}
        >
          <div className="h-full w-full scale-0 rounded-full bg-white transition-all duration-200-transform duration-200 peer-checked:scale-50 cursor-pointer" />
        </div>
      </div>
      <div className="flex-1 pt-0.5">
        <span className="text-base font-medium text-gray-900">{label}</span>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
    </label>
  );
}

// Form section for mobile
interface MobileFormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function MobileFormSection({
  title,
  description,
  children,
  className,
}: MobileFormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// Mobile form actions (sticky bottom)
interface MobileFormActionsProps {
  children: ReactNode;
  className?: string;
}

export function MobileFormActions({
  children,
  className,
}: MobileFormActionsProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 -mx-4 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-lg",
        "sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {children}
      </div>
    </div>
  );
}

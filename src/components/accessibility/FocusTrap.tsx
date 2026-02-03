/**
 * Focus Trap Component
 * Traps focus within a modal or dialog for keyboard navigation
 */

"use client";

import { useEffect, useRef, ReactNode } from "react";

interface FocusTrapProps {
  children: ReactNode;
  isActive: boolean;
  onEscape?: () => void;
}

export function FocusTrap({ children, isActive, onEscape }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the first focusable element in the trap
      const container = containerRef.current;
      if (container) {
        const focusableElements = getFocusableElements(container);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }

      // Handle escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && onEscape) {
          onEscape();
        }
        if (e.key === "Tab") {
          handleTabKey(e);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        // Restore focus
        previousFocusRef.current?.focus();
      };
    }
  }, [isActive, onEscape]);

  const handleTabKey = (e: KeyboardEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return Array.from(
    container.querySelectorAll(selectors.join(", "))
  ).filter((el) => {
    // Filter out hidden elements
    const style = window.getComputedStyle(el as Element);
    return style.display !== "none" && style.visibility !== "hidden";
  }) as HTMLElement[];
}

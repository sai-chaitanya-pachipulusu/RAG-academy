/**
 * Accessibility Provider Component
 * Manages accessibility settings and features
 */

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ============================================
// Types
// ============================================

export interface AccessibilitySettings {
  // Visual
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  
  // Motor
  keyboardNavigation: boolean;
  focusIndicator: 'default' | 'high-visibility' | 'custom';
  
  // Cognitive
  readingGuide: boolean;
  simplifiedUI: boolean;
  
  // Screen reader
  screenReaderOptimized: boolean;
  announcePageChanges: boolean;
  
  // Other
  dyslexiaFriendlyFont: boolean;
  lineHeight: 'compact' | 'normal' | 'relaxed';
  wordSpacing: 'normal' | 'wide';
}

export type AccessibilitySettingKey = keyof AccessibilitySettings;

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: AccessibilitySettingKey, value: any) => void;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  isAccessibilityMode: boolean;
}

// ============================================
// Default Settings
// ============================================

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  colorBlindMode: 'none',
  keyboardNavigation: false,
  focusIndicator: 'default',
  readingGuide: false,
  simplifiedUI: false,
  screenReaderOptimized: false,
  announcePageChanges: true,
  dyslexiaFriendlyFont: false,
  lineHeight: 'normal',
  wordSpacing: 'normal',
};

// ============================================
// Context
// ============================================

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}

// ============================================
// Provider Component
// ============================================

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("rag-academy-accessibility");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch {
        // Invalid stored settings, ignore
      }
    }

    // Check for system preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prefersHighContrast = window.matchMedia("(prefers-contrast: high)").matches;
    
    if (prefersReducedMotion || prefersHighContrast) {
      setSettings((prev) => ({
        ...prev,
        reducedMotion: prefersReducedMotion || prev.reducedMotion,
        highContrast: prefersHighContrast || prev.highContrast,
      }));
    }

    setIsInitialized(true);
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("rag-academy-accessibility", JSON.stringify(settings));
    }
  }, [settings, isInitialized]);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // High contrast
    if (settings.highContrast) {
      root.classList.add("a11y-high-contrast");
    } else {
      root.classList.remove("a11y-high-contrast");
    }

    // Large text
    if (settings.largeText) {
      root.classList.add("a11y-large-text");
      root.style.fontSize = "120%";
    } else {
      root.classList.remove("a11y-large-text");
      root.style.fontSize = "";
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add("a11y-reduced-motion");
    } else {
      root.classList.remove("a11y-reduced-motion");
    }

    // Color blind mode
    root.classList.remove(
      "a11y-protanopia",
      "a11y-deuteranopia",
      "a11y-tritanopia",
      "a11y-achromatopsia"
    );
    if (settings.colorBlindMode !== 'none') {
      root.classList.add(`a11y-${settings.colorBlindMode}`);
    }

    // Dyslexia friendly font
    if (settings.dyslexiaFriendlyFont) {
      root.classList.add("a11y-dyslexia-font");
    } else {
      root.classList.remove("a11y-dyslexia-font");
    }

    // Line height
    root.classList.remove("a11y-line-compact", "a11y-line-normal", "a11y-line-relaxed");
    root.classList.add(`a11y-line-${settings.lineHeight}`);

    // Word spacing
    root.classList.remove("a11y-word-normal", "a11y-word-wide");
    root.classList.add(`a11y-word-${settings.wordSpacing}`);

    // Keyboard navigation
    if (settings.keyboardNavigation) {
      root.classList.add("a11y-keyboard-nav");
    } else {
      root.classList.remove("a11y-keyboard-nav");
    }

    // Focus indicator
    root.classList.remove("a11y-focus-default", "a11y-focus-high", "a11y-focus-custom");
    root.classList.add(`a11y-focus-${settings.focusIndicator}`);

    // Screen reader optimizations
    if (settings.screenReaderOptimized) {
      root.classList.add("a11y-screen-reader");
    } else {
      root.classList.remove("a11y-screen-reader");
    }

    // Simplified UI
    if (settings.simplifiedUI) {
      root.classList.add("a11y-simplified");
    } else {
      root.classList.remove("a11y-simplified");
    }
  }, [settings]);

  const updateSetting = (key: AccessibilitySettingKey, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const isAccessibilityMode = Object.entries(settings).some(
    ([key, value]) => key !== 'announcePageChanges' && value !== defaultSettings[key as AccessibilitySettingKey]
  );

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        updateSettings,
        resetSettings,
        isAccessibilityMode,
      }}
    >
      {children}
      {settings.readingGuide && <ReadingGuide />}
      <AccessibilityStyles />
    </AccessibilityContext.Provider>
  );
}

// ============================================
// Reading Guide Component
// ============================================

function ReadingGuide() {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 z-50 h-8 bg-yellow-200/20"
      style={{ top: position - 16 }}
    />
  );
}

// ============================================
// Accessibility Styles
// ============================================

function AccessibilityStyles() {
  return (
    <style jsx global>{`
      /* High Contrast Mode */
      .a11y-high-contrast {
        --color-bg: #000000;
        --color-text: #ffffff;
        --color-border: #ffffff;
        --color-primary: #ffff00;
        --color-secondary: #00ffff;
      }

      .a11y-high-contrast body {
        background-color: var(--color-bg) !important;
        color: var(--color-text) !important;
      }

      .a11y-high-contrast * {
        border-color: var(--color-border) !important;
      }

      .a11y-high-contrast a {
        color: var(--color-primary) !important;
        text-decoration: underline !important;
      }

      .a11y-high-contrast button {
        background-color: var(--color-bg) !important;
        color: var(--color-text) !important;
        border: 2px solid var(--color-text) !important;
      }

      /* Reduced Motion */
      .a11y-reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }

      /* Dyslexia Friendly Font */
      .a11y-dyslexia-font body {
        font-family: "OpenDyslexic", "Comic Sans MS", sans-serif !important;
        letter-spacing: 0.05em;
      }

      /* Line Height */
      .a11y-line-compact body {
        line-height: 1.2;
      }

      .a11y-line-relaxed body {
        line-height: 2;
      }

      /* Word Spacing */
      .a11y-word-wide body {
        word-spacing: 0.3em;
      }

      /* Keyboard Navigation - Visible Focus */
      .a11y-keyboard-nav *:focus,
      .a11y-focus-high *:focus {
        outline: 3px solid #0066cc !important;
        outline-offset: 2px !important;
      }

      /* Simplified UI */
      .a11y-simplified .decorative,
      .a11y-simplified [data-decorative="true"] {
        display: none !important;
      }

      .a11y-simplified main {
        max-width: 80ch;
        margin: 0 auto;
      }

      /* Screen Reader Only */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* Skip Link */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        z-index: 100;
      }

      .skip-link:focus {
        top: 0;
      }

      /* Color Blindness Filters */
      .a11y-protanopia {
        filter: url('#protanopia');
      }

      .a11y-deuteranopia {
        filter: url('#deuteranopia');
      }

      .a11y-tritanopia {
        filter: url('#tritanopia');
      }

      .a11y-achromatopsia {
        filter: grayscale(100%);
      }
    `}</style>
  );
}

// ============================================
// Accessibility Controls Component
// ============================================

export function AccessibilityControls() {
  const { settings, updateSetting, resetSettings, isAccessibilityMode } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all ${
          isAccessibilityMode
            ? 'bg-blue-600 text-white'
            : 'bg-white text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
        }`}
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>

      {/* Controls Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Accessibility</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close accessibility panel"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Visual Section */}
            <section>
              <h4 className="mb-2 text-xs font-medium uppercase text-zinc-500">Visual</h4>
              <div className="space-y-2">
                <Toggle
                  label="High Contrast"
                  checked={settings.highContrast}
                  onChange={(v) => updateSetting('highContrast', v)}
                />
                <Toggle
                  label="Large Text"
                  checked={settings.largeText}
                  onChange={(v) => updateSetting('largeText', v)}
                />
                <Toggle
                  label="Reduced Motion"
                  checked={settings.reducedMotion}
                  onChange={(v) => updateSetting('reducedMotion', v)}
                />
                <Toggle
                  label="Dyslexia Friendly Font"
                  checked={settings.dyslexiaFriendlyFont}
                  onChange={(v) => updateSetting('dyslexiaFriendlyFont', v)}
                />
              </div>
            </section>

            {/* Cognitive Section */}
            <section>
              <h4 className="mb-2 text-xs font-medium uppercase text-zinc-500">Cognitive</h4>
              <div className="space-y-2">
                <Toggle
                  label="Reading Guide"
                  checked={settings.readingGuide}
                  onChange={(v) => updateSetting('readingGuide', v)}
                />
                <Toggle
                  label="Simplified UI"
                  checked={settings.simplifiedUI}
                  onChange={(v) => updateSetting('simplifiedUI', v)}
                />
              </div>
            </section>

            {/* Motor Section */}
            <section>
              <h4 className="mb-2 text-xs font-medium uppercase text-zinc-500">Motor</h4>
              <div className="space-y-2">
                <Toggle
                  label="Keyboard Navigation"
                  checked={settings.keyboardNavigation}
                  onChange={(v) => updateSetting('keyboardNavigation', v)}
                />
              </div>
            </section>

            {/* Reset */}
            <button
              onClick={resetSettings}
              className="w-full rounded-lg border border-zinc-200 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Toggle Component
// ============================================

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

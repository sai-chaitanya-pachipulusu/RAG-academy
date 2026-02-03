/**
 * Performance Monitoring
 * Tracks Core Web Vitals and custom performance metrics
 */

// ============================================
// Types
// ============================================

export interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
  INP?: number; // Interaction to Next Paint

  // Custom metrics
  challengeLoadTime?: number;
  codeExecutionTime?: number;
  searchResponseTime?: number;
  
  // Navigation
  navigationStart: number;
  domContentLoaded: number;
  windowLoad: number;
}

export interface PerformanceReport {
  url: string;
  timestamp: number;
  metrics: PerformanceMetrics;
  userAgent: string;
  connection?: string;
}

// ============================================
// Core Web Vitals Monitoring
// ============================================

export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Wait for page to be fully loaded
  if (document.readyState === 'complete') {
    observeMetrics();
  } else {
    window.addEventListener('load', observeMetrics);
  }
}

function observeMetrics() {
  // Largest Contentful Paint (LCP)
  observeLCP();
  
  // First Input Delay (FID)
  observeFID();
  
  // Cumulative Layout Shift (CLS)
  observeCLS();
  
  // First Contentful Paint (FCP)
  observeFCP();
  
  // Time to First Byte (TTFB)
  observeTTFB();
  
  // Interaction to Next Paint (INP)
  observeINP();
}

function observeLCP() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      
      // Report LCP
      reportMetric('LCP', lastEntry.startTime);
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // LCP not supported
  }
}

function observeFID() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as PerformanceEntry & { processingStart: number; startTime: number };
        const delay = fidEntry.processingStart - fidEntry.startTime;
        reportMetric('FID', delay);
      }
    });

    observer.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    // FID not supported
  }
}

function observeCLS() {
  if (!('PerformanceObserver' in window)) return;

  let clsValue = 0;
  let clsEntries: PerformanceEntry[] = [];

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only count layout shifts without recent user input
        const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!layoutShiftEntry.hadRecentInput) {
          clsEntries.push(entry);
          clsValue += layoutShiftEntry.value;
        }
      }
      
      reportMetric('CLS', clsValue);
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // CLS not supported
  }
}

function observeFCP() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          const paintEntry = entry as PerformanceEntry & { startTime: number };
          reportMetric('FCP', paintEntry.startTime);
        }
      }
    });

    observer.observe({ entryTypes: ['paint'] });
  } catch (e) {
    // FCP not supported
  }
}

function observeTTFB() {
  if (typeof window === 'undefined') return;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    const ttfb = navigation.responseStart - navigation.startTime;
    reportMetric('TTFB', ttfb);
  }
}

function observeINP() {
  if (!('PerformanceObserver' in window)) return;

  let inpValue = 0;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as PerformanceEntry & { duration: number; interactionId: number };
        // INP is the longest interaction
        if (eventEntry.duration > inpValue) {
          inpValue = eventEntry.duration;
          reportMetric('INP', inpValue);
        }
      }
    });

    observer.observe({ entryTypes: ['event'] });
  } catch (e) {
    // INP not supported
  }
}

// ============================================
// Custom Metrics
// ============================================

export function measureChallengeLoadTime(challengeSlug: string): () => void {
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    reportMetric('challengeLoadTime', duration, { challengeSlug });
  };
}

export function measureCodeExecution<T>(
  fn: () => T,
  challengeSlug: string
): T {
  const startTime = performance.now();
  const result = fn();
  const duration = performance.now() - startTime;
  
  reportMetric('codeExecutionTime', duration, { challengeSlug });
  
  return result;
}

export async function measureAsyncCodeExecution<T>(
  fn: () => Promise<T>,
  challengeSlug: string
): Promise<T> {
  const startTime = performance.now();
  const result = await fn();
  const duration = performance.now() - startTime;
  
  reportMetric('codeExecutionTime', duration, { challengeSlug });
  
  return result;
}

// ============================================
// Metric Reporting
// ============================================

function reportMetric(
  name: string,
  value: number,
  metadata?: Record<string, string>
) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`, metadata);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Queue for batch sending
    queueMetric(name, value, metadata);
  }

  // Store in localStorage for debugging
  storeMetric(name, value);
}

const metricQueue: { name: string; value: number; metadata?: Record<string, string>; timestamp: number }[] = [];

function queueMetric(
  name: string,
  value: number,
  metadata?: Record<string, string>
) {
  metricQueue.push({
    name,
    value,
    metadata,
    timestamp: Date.now(),
  });

  // Flush queue if it gets too large
  if (metricQueue.length >= 10) {
    flushMetrics();
  }
}

function flushMetrics() {
  if (metricQueue.length === 0) return;

  const metrics = [...metricQueue];
  metricQueue.length = 0;

  // Send to your analytics endpoint
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/performance', JSON.stringify({ metrics }));
  }
}

function storeMetric(name: string, value: number) {
  try {
    const key = `perf-${name}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({ value, timestamp: Date.now() });
    
    // Keep only last 100 entries
    if (existing.length > 100) {
      existing.shift();
    }
    
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {
    // Ignore storage errors
  }
}

// ============================================
// Performance Budget Checking
// ============================================

const PERFORMANCE_BUDGETS = {
  LCP: 2500, // 2.5s
  FID: 100,  // 100ms
  CLS: 0.1,  // 0.1
  FCP: 1800, // 1.8s
  TTFB: 800, // 800ms
  INP: 200,  // 200ms
};

export function checkPerformanceBudget(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const budget = PERFORMANCE_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS];
  if (!budget) return 'good';

  if (value <= budget) return 'good';
  if (value <= budget * 2) return 'needs-improvement';
  return 'poor';
}

// ============================================
// Resource Loading Optimization
// ============================================

export function preloadResource(href: string, as: string) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

export function prefetchResource(href: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

// ============================================
// Code Splitting Helpers
// ============================================

export function lazyLoadComponent(importFn: () => Promise<any>, delay = 0) {
  return new Promise((resolve) => {
    if (delay > 0) {
      setTimeout(() => {
        resolve(importFn());
      }, delay);
    } else {
      // Use requestIdleCallback if available
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          resolve(importFn());
        });
      } else {
        setTimeout(() => {
          resolve(importFn());
        }, 1);
      }
    }
  });
}

// ============================================
// Memory Monitoring
// ============================================

export function getMemoryUsage(): { used: number; total: number; limit: number } | null {
  const memory = (performance as any).memory;
  if (!memory) return null;

  return {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    limit: memory.jsHeapSizeLimit,
  };
}

// ============================================
// Long Task Monitoring
// ============================================

export function initLongTaskMonitoring() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const longTask = entry as PerformanceEntry & { duration: number };
        if (longTask.duration > 50) {
          console.warn('[Performance] Long task detected:', longTask.duration.toFixed(2), 'ms');
          // Report to analytics
          reportMetric('longTask', longTask.duration);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    // Long task API not supported
  }
}

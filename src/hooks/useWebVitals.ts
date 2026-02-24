/**
 * useWebVitals.ts
 * 🚀 Core Web Vitals Monitoring Hook
 * 
 * Tracks and reports:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * 
 * @see https://web.dev/vitals/
 */

import { useEffect } from 'react';
import { logger } from '@/services/logger-service';

// ============================================================================
// TYPES
// ============================================================================

interface Metric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
}

type ReportHandler = (metric: Metric) => void;

// ============================================================================
// THRESHOLDS (Google's recommended values)
// ============================================================================

const THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 },        // ms
    FID: { good: 100, poor: 300 },          // ms
    CLS: { good: 0.1, poor: 0.25 },         // score
    FCP: { good: 1800, poor: 3000 },        // ms
    TTFB: { good: 800, poor: 1800 },        // ms
};

// ============================================================================
// UTILS
// ============================================================================

/**
 * Get metric rating based on thresholds
 */
const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
};

/**
 * Send metric to analytics
 */
const sendToAnalytics = (metric: Metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
        logger.info(`${emoji} [Web Vital] ${metric.name}:`, {
            value: `${metric.value.toFixed(2)}ms`,
            rating: metric.rating,
            id: metric.id
        });
    }

    // Send to analytics service (Google Analytics, DataDog, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            metric_id: metric.id,
            metric_value: metric.value,
            metric_delta: metric.delta,
            metric_rating: metric.rating,
        });
    }
};

// ============================================================================
// WEB VITALS MEASUREMENT
// ============================================================================

/**
 * Measure LCP (Largest Contentful Paint)
 */
const measureLCP = (onReport: ReportHandler) => {
    if (typeof window === 'undefined') return;

    try {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;

            if (lastEntry) {
                const metric: Metric = {
                    name: 'LCP',
                    value: lastEntry.renderTime || lastEntry.loadTime,
                    rating: getRating('LCP', lastEntry.renderTime || lastEntry.loadTime),
                    delta: lastEntry.renderTime || lastEntry.loadTime,
                    id: `lcp-${Date.now()}`,
                };
                onReport(metric);
            }
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
        // LCP not supported
    }
};

/**
 * Measure FID (First Input Delay)
 */
const measureFID = (onReport: ReportHandler) => {
    if (typeof window === 'undefined') return;

    try {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
                const metric: Metric = {
                    name: 'FID',
                    value: entry.processingStart - entry.startTime,
                    rating: getRating('FID', entry.processingStart - entry.startTime),
                    delta: entry.processingStart - entry.startTime,
                    id: `fid-${Date.now()}`,
                };
                onReport(metric);
            });
        });

        observer.observe({ type: 'first-input', buffered: true });
    } catch (error) {
        // FID not supported
    }
};

/**
 * Measure CLS (Cumulative Layout Shift)
 */
const measureCLS = (onReport: ReportHandler) => {
    if (typeof window === 'undefined') return;

    let clsValue = 0;
    let clsEntries: any[] = [];

    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                    clsValue += (entry as any).value;
                    clsEntries.push(entry);
                }
            }

            const metric: Metric = {
                name: 'CLS',
                value: clsValue,
                rating: getRating('CLS', clsValue),
                delta: clsValue,
                id: `cls-${Date.now()}`,
            };
            onReport(metric);
        });

        observer.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
        // CLS not supported
    }
};

/**
 * Measure FCP (First Contentful Paint)
 */
const measureFCP = (onReport: ReportHandler) => {
    if (typeof window === 'undefined') return;

    try {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
                if (entry.name === 'first-contentful-paint') {
                    const metric: Metric = {
                        name: 'FCP',
                        value: entry.startTime,
                        rating: getRating('FCP', entry.startTime),
                        delta: entry.startTime,
                        id: `fcp-${Date.now()}`,
                    };
                    onReport(metric);
                }
            });
        });

        observer.observe({ type: 'paint', buffered: true });
    } catch (error) {
        // FCP not supported
    }
};

/**
 * Measure TTFB (Time to First Byte)
 */
const measureTTFB = (onReport: ReportHandler) => {
    if (typeof window === 'undefined') return;

    try {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
                const metric: Metric = {
                    name: 'TTFB',
                    value: entry.responseStart - entry.requestStart,
                    rating: getRating('TTFB', entry.responseStart - entry.requestStart),
                    delta: entry.responseStart - entry.requestStart,
                    id: `ttfb-${Date.now()}`,
                };
                onReport(metric);
            });
        });

        observer.observe({ type: 'navigation', buffered: true });
    } catch (error) {
        // TTFB not supported
    }
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useWebVitals Hook
 * Automatically tracks Core Web Vitals
 * 
 * @example
 * // In App.tsx or Layout component:
 * useWebVitals();
 */
export const useWebVitals = () => {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleReport: ReportHandler = (metric) => {
            sendToAnalytics(metric);
        };

        // Measure all vitals
        measureLCP(handleReport);
        measureFID(handleReport);
        measureCLS(handleReport);
        measureFCP(handleReport);
        measureTTFB(handleReport);

    }, []);
};

export default useWebVitals;

/**
 * Performance Monitor Tests
 * Phase 1.3: Performance Measurement Tests
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { performanceMonitor } from '../performance-monitor';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.reset();
  });

  it('should track Firestore reads', () => {
    expect(performanceMonitor.getFirestoreReads()).toBe(0);
    
    performanceMonitor.incrementFirestoreRead();
    performanceMonitor.incrementFirestoreRead();
    
    expect(performanceMonitor.getFirestoreReads()).toBe(2);
  });

  it('should track Firestore writes', () => {
    expect(performanceMonitor.getFirestoreWrites()).toBe(0);
    
    performanceMonitor.incrementFirestoreWrite();
    
    expect(performanceMonitor.getFirestoreWrites()).toBe(1);
  });

  it('should measure component render time', () => {
    performanceMonitor.measureComponentRender('ProfilePage', 150);
    
    const metrics = performanceMonitor.getMetricsByName('component_render');
    expect(metrics).toHaveLength(1);
    expect(metrics[0].value).toBe(150);
    expect(metrics[0].metadata?.component).toBe('ProfilePage');
  });

  it('should measure API call time', () => {
    performanceMonitor.measureAPICall('getUserProfile', 200, true);
    
    const metrics = performanceMonitor.getMetricsByName('api_call');
    expect(metrics).toHaveLength(1);
    expect(metrics[0].value).toBe(200);
    expect(metrics[0].metadata?.api).toBe('getUserProfile');
    expect(metrics[0].metadata?.success).toBe(true);
  });

  it('should provide summary report', () => {
    performanceMonitor.incrementFirestoreRead();
    performanceMonitor.incrementFirestoreRead();
    performanceMonitor.incrementFirestoreWrite();
    performanceMonitor.measureComponentRender('TestComponent', 100);
    
    const summary = performanceMonitor.getSummary();
    
    expect(summary.firestoreReads).toBe(2);
    expect(summary.firestoreWrites).toBe(1);
    expect(summary.averageRenderTime).toBe(100);
  });

  it('should reset metrics', () => {
    performanceMonitor.incrementFirestoreRead();
    performanceMonitor.incrementFirestoreWrite();
    
    expect(performanceMonitor.getFirestoreReads()).toBe(1);
    
    performanceMonitor.reset();
    
    expect(performanceMonitor.getFirestoreReads()).toBe(0);
    expect(performanceMonitor.getFirestoreWrites()).toBe(0);
    expect(performanceMonitor.getMetrics()).toHaveLength(0);
  });

  it('should export metrics as JSON', () => {
    performanceMonitor.incrementFirestoreRead();
    performanceMonitor.measureComponentRender('TestComponent', 100);
    
    const exported = performanceMonitor.exportMetrics();
    const parsed = JSON.parse(exported);
    
    expect(parsed.summary).toBeDefined();
    expect(parsed.metrics).toBeDefined();
    expect(parsed.exportedAt).toBeDefined();
  });
});


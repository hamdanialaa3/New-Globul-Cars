import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
}

class PerformanceService {
  private static instance: PerformanceService;
  private metrics: PerformanceMetrics[] = [];
  private observers: ((metrics: PerformanceMetrics) => void)[] = [];

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  startMonitoring() {
    // Monitor Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTI();
  }

  private observeLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.recordMetric('LCP', lastEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  private observeFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('FID', (entry as any).processingStart - entry.startTime);
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  private observeCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.recordMetric('CLS', clsValue);
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private observeFCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('FCP', entry.startTime);
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
    }
  }

  private observeTTI() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('TTI', entry.startTime);
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    }
  }

  private recordMetric(name: string, value: number) {
    const metric = {
      name,
      value,
      timestamp: new Date().toISOString()
    };

    // Store metric
    this.metrics.push(metric as any);

    // Notify observers
    this.observers.forEach(observer => {
      observer({
        loadTime: value,
        renderTime: 0,
        memoryUsage: this.getMemoryUsage(),
        networkLatency: 0
      });
    });

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric - ${name}:`, value);
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  subscribe(callback: (metrics: PerformanceMetrics) => void) {
    this.observers.push(callback);
    
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const performanceService = PerformanceService.getInstance();

// Performance Monitor Component
export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start monitoring
    performanceService.startMonitoring();

    // Subscribe to metrics updates
    const unsubscribe = performanceService.subscribe((newMetrics) => {
      setMetrics(prevMetrics => {
        // Only update if metrics actually changed
        if (!prevMetrics || 
            prevMetrics.loadTime !== newMetrics.loadTime ||
            prevMetrics.renderTime !== newMetrics.renderTime ||
            prevMetrics.memoryUsage !== newMetrics.memoryUsage ||
            prevMetrics.networkLatency !== newMetrics.networkLatency) {
          return newMetrics;
        }
        return prevMetrics;
      });
    });

    // Show monitor in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }

    return unsubscribe;
  }, []);

  if (!isVisible || !metrics) {
    return null;
  }

  return (
    <MonitorContainer>
      <MonitorHeader>
        <MonitorTitle>Performance Monitor</MonitorTitle>
        <CloseButton onClick={() => setIsVisible(false)}>×</CloseButton>
      </MonitorHeader>
      
      <MetricsGrid>
        <MetricItem>
          <MetricLabel>Load Time</MetricLabel>
          <MetricValue>{metrics.loadTime.toFixed(2)}ms</MetricValue>
        </MetricItem>
        
        <MetricItem>
          <MetricLabel>Memory Usage</MetricLabel>
          <MetricValue>{metrics.memoryUsage.toFixed(2)}MB</MetricValue>
        </MetricItem>
        
        <MetricItem>
          <MetricLabel>Network Latency</MetricLabel>
          <MetricValue>{metrics.networkLatency.toFixed(2)}ms</MetricValue>
        </MetricItem>
      </MetricsGrid>
    </MonitorContainer>
  );
};

// Styled Components
const MonitorContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  z-index: 9999;
  min-width: 200px;
`;

const MonitorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const MonitorTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: bold;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MetricsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MetricItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MetricLabel = styled.span`
  color: #ccc;
`;

const MetricValue = styled.span`
  color: #4ade80;
  font-weight: bold;
`;

export default PerformanceMonitor;
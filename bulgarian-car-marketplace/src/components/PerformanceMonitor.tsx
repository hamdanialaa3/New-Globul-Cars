// src/components/PerformanceMonitor.tsx
// Performance monitoring component for tracking app performance metrics

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
}

const MonitorContainer = styled.div<{ visible: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  font-family: monospace;
  z-index: 9999;
  display: ${props => props.visible ? 'block' : 'none'};
  max-width: 300px;
`;

const MetricItem = styled.div`
  margin: 2px 0;
  display: flex;
  justify-content: space-between;
`;

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Track page load time
    const loadTime = performance.now();
    setMetrics(prev => ({ ...prev, loadTime }));

    // Track render time
    const renderStart = performance.now();
    setTimeout(() => {
      const renderTime = performance.now() - renderStart;
      setMetrics(prev => ({ ...prev, renderTime }));
    }, 0);

    // Track memory usage (if available)
    if ('memory' in performance) {
      const memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
      setMetrics(prev => ({ ...prev, memoryUsage }));
    }

    // Track network requests
    let networkRequests = 0;
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      networkRequests++;
      setMetrics(prev => ({ ...prev, networkRequests }));
      return originalFetch.apply(this, args);
    };

    // Keyboard shortcut to toggle visibility (Ctrl+Shift+P)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <MonitorContainer visible={visible}>
      <div><strong>Performance Monitor</strong></div>
      <div>Press Ctrl+Shift+P to toggle</div>
      <hr style={{ margin: '5px 0', borderColor: '#555' }} />
      <MetricItem>
        <span>Load Time:</span>
        <span>{metrics.loadTime.toFixed(2)}ms</span>
      </MetricItem>
      <MetricItem>
        <span>Render Time:</span>
        <span>{metrics.renderTime.toFixed(2)}ms</span>
      </MetricItem>
      <MetricItem>
        <span>Memory:</span>
        <span>{metrics.memoryUsage.toFixed(2)} MB</span>
      </MetricItem>
      <MetricItem>
        <span>Network:</span>
        <span>{metrics.networkRequests} requests</span>
      </MetricItem>
    </MonitorContainer>
  );
};

export default PerformanceMonitor;
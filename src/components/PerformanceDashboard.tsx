/**
 * Performance Metrics Dashboard
 * Real-time display of Core Web Vitals and cache performance
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number;
  FID?: number;
  CLS?: number;
  FCP?: number;
  TTFB?: number;
  
  // Cache metrics
  cacheHitRate?: number;
  totalRequests?: number;
  cacheHits?: number;
  cacheMisses?: number;
  
  // Page load metrics
  loadTime?: number;
  domContentLoaded?: number;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Collect initial metrics
    collectMetrics();

    // Update metrics every 5 seconds
    const interval = setInterval(collectMetrics, 5000);

    // Listen for keyboard shortcut (Ctrl+Shift+P)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const collectMetrics = () => {
    const newMetrics: PerformanceMetrics = {};

    // Get Web Vitals
    if ((window as any).webVitalsTracker) {
      const vitals = (window as any).webVitalsTracker.getMetrics();
      newMetrics.LCP = vitals.LCP;
      newMetrics.FID = vitals.FID;
      newMetrics.CLS = vitals.CLS;
      newMetrics.FCP = vitals.FCP;
      newMetrics.TTFB = vitals.TTFB;
    }

    // Get Cache Analytics
    if ((window as any).cacheAnalytics) {
      const overall = (window as any).cacheAnalytics.getOverallMetrics();
      newMetrics.cacheHitRate = overall.hitRate;
      newMetrics.totalRequests = overall.totalRequests;
      newMetrics.cacheHits = overall.cacheHits;
      newMetrics.cacheMisses = overall.cacheMisses;
    }

    // Get Page Load Metrics
    if (performance.timing) {
      const timing = performance.timing;
      newMetrics.loadTime = timing.loadEventEnd - timing.navigationStart;
      newMetrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    }

    setMetrics(newMetrics);
  };

  const getRating = (metric: string, value?: number): string => {
    if (value === undefined) return 'pending';

    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 600, poor: 1500 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const formatValue = (value?: number, unit: string = 'ms', decimals: number = 0): string => {
    if (value === undefined) return '—';
    return `${value.toFixed(decimals)}${unit}`;
  };

  if (!isVisible) {
    return (
      <ToggleButton onClick={() => setIsVisible(true)} title="Show Performance Dashboard (Ctrl+Shift+P)">
        📊
      </ToggleButton>
    );
  }

  return (
    <Container>
      <Header>
        <Title>⚡ Performance Metrics</Title>
        <CloseButton onClick={() => setIsVisible(false)}>✕</CloseButton>
      </Header>

      <Section>
        <SectionTitle>Core Web Vitals</SectionTitle>
        
        <MetricRow rating={getRating('LCP', metrics.LCP)}>
          <MetricLabel>LCP (Largest Contentful Paint)</MetricLabel>
          <MetricValue>{formatValue(metrics.LCP)}</MetricValue>
          <MetricTarget>Target: {'<'} 2.5s</MetricTarget>
        </MetricRow>

        <MetricRow rating={getRating('FID', metrics.FID)}>
          <MetricLabel>FID (First Input Delay)</MetricLabel>
          <MetricValue>{formatValue(metrics.FID)}</MetricValue>
          <MetricTarget>Target: {'<'} 100ms</MetricTarget>
        </MetricRow>

        <MetricRow rating={getRating('CLS', metrics.CLS)}>
          <MetricLabel>CLS (Cumulative Layout Shift)</MetricLabel>
          <MetricValue>{formatValue(metrics.CLS, '', 3)}</MetricValue>
          <MetricTarget>Target: {'<'} 0.1</MetricTarget>
        </MetricRow>

        <MetricRow rating={getRating('FCP', metrics.FCP)}>
          <MetricLabel>FCP (First Contentful Paint)</MetricLabel>
          <MetricValue>{formatValue(metrics.FCP)}</MetricValue>
          <MetricTarget>Target: {'<'} 1.8s</MetricTarget>
        </MetricRow>

        <MetricRow rating={getRating('TTFB', metrics.TTFB)}>
          <MetricLabel>TTFB (Time to First Byte)</MetricLabel>
          <MetricValue>{formatValue(metrics.TTFB)}</MetricValue>
          <MetricTarget>Target: {'<'} 600ms</MetricTarget>
        </MetricRow>
      </Section>

      <Section>
        <SectionTitle>Cache Performance</SectionTitle>
        
        <CacheStats>
          <StatBox>
            <StatValue>{formatValue(metrics.cacheHitRate, '%', 1)}</StatValue>
            <StatLabel>Hit Rate</StatLabel>
          </StatBox>
          <StatBox>
            <StatValue>{metrics.totalRequests || 0}</StatValue>
            <StatLabel>Total Requests</StatLabel>
          </StatBox>
          <StatBox>
            <StatValue>{metrics.cacheHits || 0}</StatValue>
            <StatLabel>Hits</StatLabel>
          </StatBox>
          <StatBox>
            <StatValue>{metrics.cacheMisses || 0}</StatValue>
            <StatLabel>Misses</StatLabel>
          </StatBox>
        </CacheStats>
      </Section>

      <Section>
        <SectionTitle>Page Load</SectionTitle>
        
        <MetricRow>
          <MetricLabel>Load Time</MetricLabel>
          <MetricValue>{formatValue(metrics.loadTime)}</MetricValue>
        </MetricRow>

        <MetricRow>
          <MetricLabel>DOM Content Loaded</MetricLabel>
          <MetricValue>{formatValue(metrics.domContentLoaded)}</MetricValue>
        </MetricRow>
      </Section>

      <Footer>
        Press <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>P</Kbd> to toggle
      </Footer>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  font-family: 'Martica', Arial, sans-serif;
`;

const ToggleButton = styled.button`
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  z-index: 9999;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
`;

const Section = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

interface MetricRowProps {
  rating?: string;
}

const MetricRow = styled.div<MetricRowProps>`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: ${props => {
    if (props.rating === 'good') return '#d1fae5';
    if (props.rating === 'needs-improvement') return '#fef3c7';
    if (props.rating === 'poor') return '#fee2e2';
    return '#f9fafb';
  }};
  border-left: 3px solid ${props => {
    if (props.rating === 'good') return '#10b981';
    if (props.rating === 'needs-improvement') return '#f59e0b';
    if (props.rating === 'poor') return '#ef4444';
    return '#d1d5db';
  }};

  &:last-child {
    margin-bottom: 0;
  }
`;

const MetricLabel = styled.div`
  font-size: 13px;
  color: #374151;
  font-weight: 500;
`;

const MetricValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  text-align: right;
`;

const MetricTarget = styled.div`
  font-size: 11px;
  color: #6b7280;
  text-align: right;
`;

const CacheStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const StatBox = styled.div`
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Footer = styled.div`
  padding: 12px 20px;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
  text-align: center;
  font-size: 12px;
  color: #6b7280;
`;

const Kbd = styled.kbd`
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 11px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

export default PerformanceDashboard;

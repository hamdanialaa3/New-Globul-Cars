/**
 * AI Pipeline Metrics & Feedback Loop
 * جمع المقاييس وحلقة التغذية الراجعة
 * 
 * يتتبع:
 * - معدل نجاح التحقق من المخرجات
 * - متوسط عدد المحاولات
 * - معدل فشل الوسائط
 * - أوقات الاستجابة
 */

import { logger } from '../logger-service';

export interface AIMetrics {
  // Schema validation metrics
  schemaValidation: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    avgFixAttempts: number;
  };
  
  // Retry metrics
  retries: {
    totalOperations: number;
    operationsWithRetry: number;
    avgRetriesPerOperation: number;
    maxRetries: number;
    retryRate: number;
  };
  
  // Media pre-check metrics
  mediaChecks: {
    totalImages: number;
    validImages: number;
    failedImages: number;
    failureRate: number;
    commonFailures: Record<string, number>;
  };
  
  // Latency metrics
  latency: {
    avgResponseMs: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
    timeouts: number;
  };
  
  // Provider metrics
  providers: {
    gemini: ProviderMetrics;
    deepseek: ProviderMetrics;
    openai: ProviderMetrics;
  };
  
  // Time period
  periodStart: Date;
  periodEnd: Date;
}

interface ProviderMetrics {
  requests: number;
  successes: number;
  failures: number;
  avgLatencyMs: number;
  totalTokens: number;
  estimatedCost: number;
}

interface MetricEvent {
  type: 'validation' | 'retry' | 'media' | 'latency' | 'provider';
  timestamp: Date;
  data: Record<string, any>;
}

/**
 * In-memory metrics collector (for development/demo)
 * In production, replace with proper metrics service (Prometheus, CloudWatch, etc.)
 */
class AIMetricsCollector {
  private events: MetricEvent[] = [];
  private maxEvents = 10000;
  private periodStart: Date = new Date();
  
  /**
   * Record a schema validation result
   */
  recordValidation(data: {
    passed: boolean;
    errorCount: number;
    fixAttempts: number;
    processingTimeMs: number;
  }) {
    this.addEvent('validation', data);
  }
  
  /**
   * Record a retry operation
   */
  recordRetry(data: {
    operationName: string;
    attemptCount: number;
    wasSuccessful: boolean;
    totalDelayMs: number;
    errorCategory?: string;
  }) {
    this.addEvent('retry', data);
  }
  
  /**
   * Record media pre-check result
   */
  recordMediaCheck(data: {
    totalUrls: number;
    validCount: number;
    failedCount: number;
    failures: Array<{ type: string; count: number }>;
    totalCheckTimeMs: number;
  }) {
    this.addEvent('media', data);
  }
  
  /**
   * Record LLM call latency
   */
  recordLatency(data: {
    provider: 'gemini' | 'deepseek' | 'openai';
    operationType: string;
    latencyMs: number;
    tokensUsed: number;
    wasTimeout: boolean;
    wasSuccessful: boolean;
  }) {
    this.addEvent('latency', data);
    this.addEvent('provider', {
      provider: data.provider,
      latencyMs: data.latencyMs,
      tokensUsed: data.tokensUsed,
      success: data.wasSuccessful
    });
  }
  
  /**
   * Get aggregated metrics
   */
  getMetrics(): AIMetrics {
    const validation = this.events.filter(e => e.type === 'validation');
    const retries = this.events.filter(e => e.type === 'retry');
    const media = this.events.filter(e => e.type === 'media');
    const latency = this.events.filter(e => e.type === 'latency');
    const provider = this.events.filter(e => e.type === 'provider');
    
    return {
      schemaValidation: this.aggregateValidation(validation),
      retries: this.aggregateRetries(retries),
      mediaChecks: this.aggregateMedia(media),
      latency: this.aggregateLatency(latency),
      providers: this.aggregateProviders(provider),
      periodStart: this.periodStart,
      periodEnd: new Date()
    };
  }
  
  /**
   * Get diagnostic summary for troubleshooting
   */
  getDiagnostics(): string[] {
    const metrics = this.getMetrics();
    const issues: string[] = [];
    
    // Schema validation issues
    if (metrics.schemaValidation.passRate < 0.8) {
      issues.push(`⚠️ Low schema pass rate: ${(metrics.schemaValidation.passRate * 100).toFixed(1)}% (target: >80%)`);
    }
    
    // Retry issues
    if (metrics.retries.retryRate > 0.3) {
      issues.push(`⚠️ High retry rate: ${(metrics.retries.retryRate * 100).toFixed(1)}% operations need retry`);
    }
    
    // Media issues
    if (metrics.mediaChecks.failureRate > 0.2) {
      issues.push(`⚠️ High media failure rate: ${(metrics.mediaChecks.failureRate * 100).toFixed(1)}%`);
      const topFailure = Object.entries(metrics.mediaChecks.commonFailures)
        .sort((a, b) => b[1] - a[1])[0];
      if (topFailure) {
        issues.push(`   Top failure: ${topFailure[0]} (${topFailure[1]} occurrences)`);
      }
    }
    
    // Latency issues
    if (metrics.latency.p95Ms > 10000) {
      issues.push(`⚠️ High P95 latency: ${metrics.latency.p95Ms}ms`);
    }
    
    if (metrics.latency.timeouts > 0) {
      issues.push(`⚠️ ${metrics.latency.timeouts} timeout(s) detected`);
    }
    
    if (issues.length === 0) {
      issues.push('✅ All metrics within normal ranges');
    }
    
    return issues;
  }
  
  /**
   * Reset metrics for new period
   */
  reset() {
    this.events = [];
    this.periodStart = new Date();
    logger.info('AI metrics reset');
  }
  
  // Private helpers
  
  private addEvent(type: MetricEvent['type'], data: Record<string, any>) {
    this.events.push({ type, timestamp: new Date(), data });
    
    // Trim old events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents / 2);
    }
  }
  
  private aggregateValidation(events: MetricEvent[]) {
    const total = events.length;
    const passed = events.filter(e => e.data.passed).length;
    const avgFix = events.length > 0 
      ? events.reduce((sum, e) => sum + (e.data.fixAttempts || 0), 0) / events.length 
      : 0;
    
    return {
      total,
      passed,
      failed: total - passed,
      passRate: total > 0 ? passed / total : 1,
      avgFixAttempts: avgFix
    };
  }
  
  private aggregateRetries(events: MetricEvent[]) {
    const total = events.length;
    const withRetry = events.filter(e => e.data.attemptCount > 1).length;
    const avgRetries = total > 0
      ? events.reduce((sum, e) => sum + e.data.attemptCount, 0) / total
      : 0;
    const maxRetries = events.length > 0
      ? Math.max(...events.map(e => e.data.attemptCount))
      : 0;
    
    return {
      totalOperations: total,
      operationsWithRetry: withRetry,
      avgRetriesPerOperation: avgRetries,
      maxRetries,
      retryRate: total > 0 ? withRetry / total : 0
    };
  }
  
  private aggregateMedia(events: MetricEvent[]) {
    const totalImages = events.reduce((sum, e) => sum + e.data.totalUrls, 0);
    const validImages = events.reduce((sum, e) => sum + e.data.validCount, 0);
    const failedImages = totalImages - validImages;
    
    const commonFailures: Record<string, number> = {};
    for (const event of events) {
      for (const failure of event.data.failures || []) {
        commonFailures[failure.type] = (commonFailures[failure.type] || 0) + failure.count;
      }
    }
    
    return {
      totalImages,
      validImages,
      failedImages,
      failureRate: totalImages > 0 ? failedImages / totalImages : 0,
      commonFailures
    };
  }
  
  private aggregateLatency(events: MetricEvent[]) {
    const latencies = events.map(e => e.data.latencyMs).sort((a, b) => a - b);
    const timeouts = events.filter(e => e.data.wasTimeout).length;
    
    if (latencies.length === 0) {
      return { avgResponseMs: 0, p50Ms: 0, p95Ms: 0, p99Ms: 0, timeouts: 0 };
    }
    
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];
    
    return {
      avgResponseMs: Math.round(avg),
      p50Ms: p50,
      p95Ms: p95,
      p99Ms: p99,
      timeouts
    };
  }
  
  private aggregateProviders(events: MetricEvent[]): AIMetrics['providers'] {
    const providers: AIMetrics['providers'] = {
      gemini: this.emptyProviderMetrics(),
      deepseek: this.emptyProviderMetrics(),
      openai: this.emptyProviderMetrics()
    };
    
    for (const event of events) {
      const providerName = event.data.provider as keyof AIMetrics['providers'];
      if (providerName in providers) {
        const p = providers[providerName];
        p.requests++;
        if (event.data.success) p.successes++;
        else p.failures++;
        p.totalTokens += event.data.tokensUsed || 0;
        // Recalculate average
        p.avgLatencyMs = (p.avgLatencyMs * (p.requests - 1) + event.data.latencyMs) / p.requests;
      }
    }
    
    // Estimate costs
    providers.gemini.estimatedCost = providers.gemini.totalTokens * 0.00001;  // ~$0.01/1K tokens
    providers.deepseek.estimatedCost = providers.deepseek.totalTokens * 0.000001;  // ~$0.001/1K tokens
    providers.openai.estimatedCost = providers.openai.totalTokens * 0.00003;  // ~$0.03/1K tokens
    
    return providers;
  }
  
  private emptyProviderMetrics(): ProviderMetrics {
    return {
      requests: 0,
      successes: 0,
      failures: 0,
      avgLatencyMs: 0,
      totalTokens: 0,
      estimatedCost: 0
    };
  }
}

// Singleton instance
export const aiMetrics = new AIMetricsCollector();

/**
 * Quick console report
 */
export function printMetricsReport() {
  const metrics = aiMetrics.getMetrics();
  const diagnostics = aiMetrics.getDiagnostics();
  
  // Using logger instead of console.log
  logger.info('=== AI Pipeline Metrics Report ===');
  logger.info(`Period: ${metrics.periodStart.toISOString()} - ${metrics.periodEnd.toISOString()}`);
  logger.info('');
  logger.info('Schema Validation:', metrics.schemaValidation);
  logger.info('Retries:', metrics.retries);
  logger.info('Media Checks:', metrics.mediaChecks);
  logger.info('Latency:', metrics.latency);
  logger.info('');
  logger.info('Diagnostics:');
  diagnostics.forEach(d => logger.info(`  ${d}`));
  
  return { metrics, diagnostics };
}

/**
 * Monitoring Configuration
 * تكوين مراقبة الأداء والأخطاء
 * 
 * @module MonitoringConfig
 * @description تكوين شامل لـ Sentry, Datadog, وأدوات المراقبة الأخرى
 */

import { logger } from '../services/logger-service';

// ================ Interfaces ================

export interface MonitoringConfig {
  sentry: SentryConfig;
  datadog: DatadogConfig;
  customMetrics: CustomMetricsConfig;
  alerts: AlertsConfig;
}

export interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
  enabled: boolean;
}

export interface DatadogConfig {
  applicationId: string;
  clientToken: string;
  site: string;
  service: string;
  env: string;
  version: string;
  sampleRate: number;
  trackInteractions: boolean;
  trackResources: boolean;
  trackLongTasks: boolean;
  enabled: boolean;
}

export interface CustomMetricsConfig {
  aiResponseTime: MetricThreshold;
  aiCostPerRequest: MetricThreshold;
  aiAccuracyScore: MetricThreshold;
  userSatisfaction: MetricThreshold;
}

export interface MetricThreshold {
  warning: number;
  critical: number;
  unit: string;
}

export interface AlertsConfig {
  email: string[];
  slack: {
    webhookUrl: string;
    channel: string;
  };
  telegram: {
    botToken: string;
    chatId: string;
  };
}

// ================ Configuration ================

export const monitoringConfig: MonitoringConfig = {
  // Sentry Configuration
  sentry: {
    dsn: process.env.REACT_APP_SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1, // 10% من الطلبات يتم تتبعها
    replaysSessionSampleRate: 0.1, // 10% من الجلسات يتم تسجيلها
    replaysOnErrorSampleRate: 1.0, // 100% من الجلسات مع أخطاء
    enabled: process.env.NODE_ENV === 'production'
  },

  // Datadog RUM Configuration
  datadog: {
    applicationId: process.env.REACT_APP_DATADOG_APP_ID || '',
    clientToken: process.env.REACT_APP_DATADOG_CLIENT_TOKEN || '',
    site: 'datadoghq.eu', // موقع أوروبا
    service: 'bulgarski-mobili',
    env: process.env.NODE_ENV || 'development',
    version: process.env.REACT_APP_VERSION || '1.0.0',
    sampleRate: 100, // 100% من الجلسات
    trackInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    enabled: process.env.NODE_ENV === 'production'
  },

  // Custom AI Metrics
  customMetrics: {
    aiResponseTime: {
      warning: 3000, // 3 ثواني
      critical: 5000, // 5 ثواني
      unit: 'ms'
    },
    aiCostPerRequest: {
      warning: 0.05, // 5 سنت
      critical: 0.10, // 10 سنت
      unit: 'USD'
    },
    aiAccuracyScore: {
      warning: 0.7, // 70%
      critical: 0.5, // 50%
      unit: 'percentage'
    },
    userSatisfaction: {
      warning: 3.5, // تقييم 3.5/5
      critical: 3.0, // تقييم 3.0/5
      unit: 'rating'
    }
  },

  // Alerts Configuration
  alerts: {
    email: [
      'admin@mobilebg.eu',
      'tech@mobilebg.eu'
    ],
    slack: {
      webhookUrl: process.env.REACT_APP_SLACK_WEBHOOK || '',
      channel: '#ai-alerts'
    },
    telegram: {
      botToken: process.env.REACT_APP_TELEGRAM_BOT_TOKEN || '',
      chatId: process.env.REACT_APP_TELEGRAM_CHAT_ID || ''
    }
  }
};

// ================ Sentry Integration ================

export const initializeSentry = async () => {
  if (!monitoringConfig.sentry.enabled) {
    logger.info('Sentry disabled in development mode');
    return;
  }

  try {
    // Lazy load Sentry only in production
    const Sentry = await import('@sentry/react');
    
    Sentry.init({
      dsn: monitoringConfig.sentry.dsn,
      environment: monitoringConfig.sentry.environment,
      tracesSampleRate: monitoringConfig.sentry.tracesSampleRate,
      
      // Session Replay
      replaysSessionSampleRate: monitoringConfig.sentry.replaysSessionSampleRate,
      replaysOnErrorSampleRate: monitoringConfig.sentry.replaysOnErrorSampleRate,
      
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false
        })
      ],

      // Filter out non-critical errors
      beforeSend(event, hint) {
        const error = hint.originalException;
        
        // تجاهل أخطاء الشبكة المؤقتة
        if (error && typeof error === 'object' && 'message' in error) {
          const message = (error as any).message?.toLowerCase() || '';
          if (message.includes('network') || message.includes('timeout')) {
            return null;
          }
        }
        
        return event;
      }
    });

    logger.info('Sentry initialized successfully', {
      environment: monitoringConfig.sentry.environment
    });
  } catch (error) {
    logger.error('Failed to initialize Sentry', error as Error);
  }
};

// ================ Datadog RUM Integration ================

export const initializeDatadog = async () => {
  if (!monitoringConfig.datadog.enabled) {
    logger.info('Datadog disabled in development mode');
    return;
  }

  try {
    const { datadogRum } = await import('@datadog/browser-rum');

    datadogRum.init({
      applicationId: monitoringConfig.datadog.applicationId,
      clientToken: monitoringConfig.datadog.clientToken,
      site: monitoringConfig.datadog.site,
      service: monitoringConfig.datadog.service,
      env: monitoringConfig.datadog.env,
      version: monitoringConfig.datadog.version,
      sessionSampleRate: monitoringConfig.datadog.sampleRate,
      sessionReplaySampleRate: 20, // 20% من الجلسات يتم تسجيلها
      trackUserInteractions: monitoringConfig.datadog.trackInteractions,
      trackResources: monitoringConfig.datadog.trackResources,
      trackLongTasks: monitoringConfig.datadog.trackLongTasks,
      defaultPrivacyLevel: 'mask-user-input' // حماية البيانات الحساسة
    });

    datadogRum.startSessionReplayRecording();

    logger.info('Datadog RUM initialized successfully', {
      service: monitoringConfig.datadog.service,
      environment: monitoringConfig.datadog.env
    });
  } catch (error) {
    logger.error('Failed to initialize Datadog', error as Error);
  }
};

// ================ Custom Metrics Tracking ================

export class MetricsTracker {
  private static instance: MetricsTracker;

  static getInstance(): MetricsTracker {
    if (!this.instance) {
      this.instance = new MetricsTracker();
    }
    return this.instance;
  }

  /**
   * تتبع وقت استجابة AI
   */
  async trackAIResponseTime(featureType: string, responseTime: number): Promise<void> {
    const threshold = monitoringConfig.customMetrics.aiResponseTime;

    // إرسال إلى Datadog
    if (monitoringConfig.datadog.enabled) {
      try {
        const { datadogRum } = await import('@datadog/browser-rum');
        datadogRum.addAction('ai_response_time', {
          feature: featureType,
          response_time: responseTime,
          unit: 'ms'
        });
      } catch (error) {
        logger.error('Failed to send metrics to Datadog', error as Error);
      }
    }

    // تحقق من التنبيهات
    if (responseTime > threshold.critical) {
      this.sendAlert('critical', `AI response time critical: ${responseTime}ms for ${featureType}`);
    } else if (responseTime > threshold.warning) {
      this.sendAlert('warning', `AI response time high: ${responseTime}ms for ${featureType}`);
    }
  }

  /**
   * تتبع تكلفة AI
   */
  async trackAICost(featureType: string, cost: number): Promise<void> {
    const threshold = monitoringConfig.customMetrics.aiCostPerRequest;

    if (cost > threshold.critical) {
      this.sendAlert('critical', `AI cost critical: $${cost} for ${featureType}`);
    } else if (cost > threshold.warning) {
      this.sendAlert('warning', `AI cost high: $${cost} for ${featureType}`);
    }
  }

  /**
   * تتبع دقة AI
   */
  async trackAIAccuracy(featureType: string, accuracy: number): Promise<void> {
    const threshold = monitoringConfig.customMetrics.aiAccuracyScore;

    if (accuracy < threshold.critical) {
      this.sendAlert('critical', `AI accuracy critical: ${accuracy} for ${featureType}`);
    } else if (accuracy < threshold.warning) {
      this.sendAlert('warning', `AI accuracy low: ${accuracy} for ${featureType}`);
    }
  }

  /**
   * تتبع رضا المستخدمين
   */
  async trackUserSatisfaction(featureType: string, rating: number): Promise<void> {
    const threshold = monitoringConfig.customMetrics.userSatisfaction;

    if (rating < threshold.critical) {
      this.sendAlert('critical', `User satisfaction critical: ${rating}/5 for ${featureType}`);
    } else if (rating < threshold.warning) {
      this.sendAlert('warning', `User satisfaction low: ${rating}/5 for ${featureType}`);
    }
  }

  /**
   * إرسال تنبيه
   */
  private async sendAlert(severity: 'warning' | 'critical', message: string): Promise<void> {
    logger.warn(`[ALERT ${severity.toUpperCase()}] ${message}`);

    // إرسال إلى Slack (محاكاة)
    if (monitoringConfig.alerts.slack.webhookUrl) {
      try {
        // TODO: Implement actual Slack webhook
        logger.info('Slack alert sent', { severity, message });
      } catch (error) {
        logger.error('Failed to send Slack alert', error as Error);
      }
    }

    // إرسال إلى Telegram (محاكاة)
    if (monitoringConfig.alerts.telegram.botToken) {
      try {
        // TODO: Implement actual Telegram bot
        logger.info('Telegram alert sent', { severity, message });
      } catch (error) {
        logger.error('Failed to send Telegram alert', error as Error);
      }
    }

    // إرسال إلى Email (محاكاة)
    if (monitoringConfig.alerts.email.length > 0) {
      try {
        // TODO: Implement actual email sending
        logger.info('Email alert sent', { 
          severity, 
          message, 
          recipients: monitoringConfig.alerts.email 
        });
      } catch (error) {
        logger.error('Failed to send email alert', error as Error);
      }
    }
  }
}

// ================ Performance Observer ================

export const initializePerformanceObserver = () => {
  if (typeof window === 'undefined') return;

  try {
    // مراقبة Long Tasks (مهام تستغرق أكثر من 50ms)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          logger.warn('Long task detected', {
            duration: entry.duration,
            name: entry.name,
            entryType: entry.entryType
          });
        }
      }
    });

    observer.observe({ entryTypes: ['longtask', 'measure'] });

    logger.info('Performance observer initialized');
  } catch (error) {
    logger.error('Failed to initialize performance observer', error as Error);
  }
};

// ================ Exports ================

export const metricsTracker = MetricsTracker.getInstance();

export const initializeMonitoring = async () => {
  await Promise.all([
    initializeSentry(),
    initializeDatadog(),
    initializePerformanceObserver()
  ]);

  logger.info('Monitoring systems initialized', {
    sentry: monitoringConfig.sentry.enabled,
    datadog: monitoringConfig.datadog.enabled
  });
};

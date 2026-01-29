// Cloud Services Configuration
// Manages AWS, Google Gemini AI, Security, and Payment integrations

import { logger } from './logger-service';

export interface ServiceConfig {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  status: 'active' | 'inactive' | 'needs-setup';
  features: string[];
  featuresAr: string[];
  icon: string;
  setupUrl?: string;
  docsUrl?: string;
  apiKey?: string;
  config?: Record<string, any>;
}

class CloudServicesConfigService {
  private services: Map<string, ServiceConfig> = new Map();

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    // AWS Analytics
    this.services.set('aws-analytics', {
      id: 'aws-analytics',
      name: 'AWS Analytics',
      nameAr: 'تحليلات AWS المتقدمة',
      description: 'Advanced analytics and business intelligence',
      descriptionAr: 'تحليلات متقدمة وذكاء الأعمال',
      status: 'active',
      features: ['QuickSight', 'Kinesis', 'Personalize'],
      featuresAr: ['QuickSight', 'Kinesis', 'Personalize'],
      icon: '📊',
      setupUrl: 'https://console.aws.amazon.com/quicksight',
      docsUrl: 'https://docs.aws.amazon.com/quicksight'
    });

    // Google Gemini AI
    this.services.set('gemini-ai', {
      id: 'gemini-ai',
      name: 'Google Gemini AI',
      nameAr: 'ذكاء جوجل الاصطناعي',
      description: 'AI-powered car image analysis',
      descriptionAr: 'تحليل صور السيارات بالذكاء الاصطناعي',
      status: 'active',
      features: ['Image analysis', 'Car recognition'],
      featuresAr: ['تحليل الصور', 'التعرف على السيارات'],
      icon: '🤖',
      setupUrl: 'https://makersuite.google.com/app/apikey',
      docsUrl: 'https://ai.google.dev/docs'
    });

    // Security & Compliance
    this.services.set('security', {
      id: 'security',
      name: 'Security & Compliance',
      nameAr: 'الأمان والامتثال',
      description: 'Security and legal compliance',
      descriptionAr: 'الأمان والامتثال للقوانين',
      status: 'active',
      features: ['WAF', 'Macie', 'GDPR compliance'],
      featuresAr: ['WAF', 'Macie', 'الامتثال لـ GDPR'],
      icon: '🔒',
      setupUrl: 'https://console.aws.amazon.com/wafv2',
      docsUrl: 'https://docs.aws.amazon.com/waf'
    });

    // Stripe Payments
    this.services.set('stripe', {
      id: 'stripe',
      name: 'Stripe Payments',
      nameAr: 'مدفوعات Stripe',
      description: 'Secure payment processing',
      descriptionAr: 'معالجة المدفوعات الآمنة',
      status: 'active',
      features: ['Payment processing', 'Subscriptions'],
      featuresAr: ['معالجة المدفوعات', 'الاشتراكات'],
      icon: '💳',
      setupUrl: 'https://dashboard.stripe.com',
      docsUrl: 'https://stripe.com/docs'
    });
  }

  getService(id: string): ServiceConfig | undefined {
    return this.services.get(id);
  }

  getAllServices(): ServiceConfig[] {
    return Array.from(this.services.values());
  }

  updateServiceStatus(id: string, status: 'active' | 'inactive' | 'needs-setup'): boolean {
    const service = this.services.get(id);
    if (service) {
      service.status = status;
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  updateServiceConfig(id: string, config: Record<string, any>): boolean {
    const service = this.services.get(id);
    if (service) {
      service.config = { ...service.config, ...config };
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  activateService(id: string, apiKey?: string): boolean {
    const service = this.services.get(id);
    if (service) {
      service.status = 'active';
      if (apiKey) {
        service.apiKey = apiKey;
      }
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  deactivateService(id: string): boolean {
    const service = this.services.get(id);
    if (service) {
      service.status = 'inactive';
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  private saveToLocalStorage() {
    const data = Array.from(this.services.entries());
    localStorage.setItem('cloud-services-config', JSON.stringify(data));
  }

  loadFromLocalStorage() {
    const stored = localStorage.getItem('cloud-services-config');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        data.forEach(([key, value]: [string, ServiceConfig]) => {
          const service = this.services.get(key);
          if (service) {
            Object.assign(service, value);
          }
        });
      } catch (error) {
        logger.error('Failed to load services config from localStorage', error as Error);
      }
    }
  }
}

export const cloudServicesConfig = new CloudServicesConfigService();
cloudServicesConfig.loadFromLocalStorage();

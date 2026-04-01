// src/services/security/secret-manager.service.ts
// Secret Manager Service — Secure API key management
// Centralizes all API key access with rotation support

import { serviceLogger } from '../logger-service';

// ─── Types ───────────────────────────────────────────────────────────

interface SecretDefinition {
  key: string;
  envVar: string;
  required: boolean;
  description: string;
  rotationDays?: number;
}

interface SecretValidationResult {
  key: string;
  isSet: boolean;
  isValid: boolean;
  description: string;
  warning?: string;
}

// ─── Secret Registry ─────────────────────────────────────────────────

const SECRET_REGISTRY: SecretDefinition[] = [
  {
    key: 'firebase_api_key',
    envVar: 'VITE_FIREBASE_API_KEY',
    required: true,
    description: 'Firebase API Key',
  },
  {
    key: 'firebase_auth_domain',
    envVar: 'VITE_FIREBASE_AUTH_DOMAIN',
    required: true,
    description: 'Firebase Auth Domain',
  },
  {
    key: 'firebase_project_id',
    envVar: 'VITE_FIREBASE_PROJECT_ID',
    required: true,
    description: 'Firebase Project ID',
  },
  {
    key: 'algolia_app_id',
    envVar: 'VITE_ALGOLIA_APP_ID',
    required: true,
    description: 'Algolia App ID',
  },
  {
    key: 'algolia_api_key',
    envVar: 'VITE_ALGOLIA_API_KEY',
    required: true,
    description: 'Algolia Search API Key',
  },
  {
    key: 'stripe_public_key',
    envVar: 'VITE_STRIPE_PUBLISHABLE_KEY',
    required: true,
    description: 'Stripe Publishable Key',
  },
  {
    key: 'google_maps_key',
    envVar: 'VITE_GOOGLE_MAPS_API_KEY',
    required: false,
    description: 'Google Maps API Key',
  },
  {
    key: 'sentry_dsn',
    envVar: 'VITE_SENTRY_DSN',
    required: false,
    description: 'Sentry DSN',
  },
  {
    key: 'recaptcha_site_key',
    envVar: 'VITE_RECAPTCHA_SITE_KEY',
    required: false,
    description: 'reCAPTCHA Site Key',
  },
  {
    key: 'hcaptcha_site_key',
    envVar: 'VITE_HCAPTCHA_SITE_KEY',
    required: false,
    description: 'hCaptcha Site Key',
  },
  {
    key: 'gemini_api_key',
    envVar: 'VITE_GEMINI_API_KEY',
    required: false,
    description: 'Google Gemini AI Key',
  },
  {
    key: 'deepseek_api_key',
    envVar: 'VITE_DEEPSEEK_API_KEY',
    required: false,
    description: 'DeepSeek AI Key',
  },
  {
    key: 'openai_api_key',
    envVar: 'VITE_OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API Key',
  },
  {
    key: 'upstash_redis_url',
    envVar: 'VITE_UPSTASH_REDIS_URL',
    required: false,
    description: 'Upstash Redis URL',
  },
  {
    key: 'upstash_redis_token',
    envVar: 'VITE_UPSTASH_REDIS_TOKEN',
    required: false,
    description: 'Upstash Redis Token',
  },
  {
    key: 'carvertical_api_key',
    envVar: 'VITE_CARVERTICAL_API_KEY',
    required: false,
    description: 'carVertical History API Key',
    rotationDays: 90,
  },
  {
    key: 'viber_bot_token',
    envVar: 'VITE_VIBER_BOT_TOKEN',
    required: false,
    description: 'Viber Bot Token',
  },
  {
    key: 'electromaps_api_key',
    envVar: 'VITE_ELECTROMAPS_API_KEY',
    required: false,
    description: 'Electromaps EV Charging API Key',
  },
];

// ─── Service ─────────────────────────────────────────────────────────

class SecretManagerService {
  private static instance: SecretManagerService;
  private secrets: Map<string, string> = new Map();
  private validated = false;

  private constructor() {}

  static getInstance(): SecretManagerService {
    if (!SecretManagerService.instance) {
      SecretManagerService.instance = new SecretManagerService();
    }
    return SecretManagerService.instance;
  }

  /**
   * Initialize and load all secrets from environment
   */
  initialize(): void {
    for (const def of SECRET_REGISTRY) {
      const value = import.meta.env[def.envVar];
      if (value) {
        this.secrets.set(def.key, value);
      }
    }
    this.validated = true;
    serviceLogger.info('SecretManager initialized', {
      secretsLoaded: this.secrets.size,
    });
  }

  /**
   * Get a secret value by key — never returns undefined for required secrets
   */
  getSecret(key: string): string | undefined {
    return this.secrets.get(key);
  }

  /**
   * Check if a secret is configured
   */
  hasSecret(key: string): boolean {
    return this.secrets.has(key);
  }

  /**
   * Validate all secrets and return status report
   */
  validateSecrets(): SecretValidationResult[] {
    return SECRET_REGISTRY.map(def => {
      const value = this.secrets.get(def.key);
      const isSet = !!value;
      const isValid = isSet && value!.length > 5;
      let warning: string | undefined;

      if (def.required && !isSet) {
        warning = `CRITICAL: Required secret "${def.description}" is not configured`;
      } else if (!isSet && !def.required) {
        warning = `Optional secret "${def.description}" not configured — feature disabled`;
      }

      return {
        key: def.key,
        isSet,
        isValid,
        description: def.description,
        warning,
      };
    });
  }

  /**
   * Get security audit summary
   */
  getAuditSummary(): {
    total: number;
    configured: number;
    missing: number;
    criticalMissing: string[];
    optionalMissing: string[];
  } {
    const results = this.validateSecrets();
    const criticalMissing = results
      .filter(
        r => !r.isSet && SECRET_REGISTRY.find(d => d.key === r.key)?.required
      )
      .map(r => r.description);
    const optionalMissing = results
      .filter(
        r => !r.isSet && !SECRET_REGISTRY.find(d => d.key === r.key)?.required
      )
      .map(r => r.description);

    return {
      total: SECRET_REGISTRY.length,
      configured: results.filter(r => r.isSet).length,
      missing: results.filter(r => !r.isSet).length,
      criticalMissing,
      optionalMissing,
    };
  }
}

export const secretManager = SecretManagerService.getInstance();

// hCaptcha Service - Free Alternative to Google reCAPTCHA
// 🔒 SECURED: Secret key verification moved to Cloud Functions (server-side only)
// Client-side only handles token generation, NOT verification

import { serviceLogger } from './logger-service';

export interface CaptchaResult {
  success: boolean;
  token?: string;
  error?: string;
}

export interface CaptchaOptions {
  siteKey: string;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  language?: string;
}

export class BulgarianCaptchaService {
  private siteKey: string;
  private theme: 'light' | 'dark' = 'light';
  private size: 'normal' | 'compact' = 'normal';
  private language: string = 'bg'; // Bulgarian by default

  constructor(options: CaptchaOptions) {
    this.siteKey = options.siteKey;
    this.theme = options.theme || 'light';
    this.size = options.size || 'normal';
    this.language = options.language || 'bg';
  }

  // Update configuration
  updateConfig(options: Partial<CaptchaOptions>) {
    if (options.siteKey) this.siteKey = options.siteKey;
    if (options.theme) this.theme = options.theme;
    if (options.size) this.size = options.size;
    if (options.language) this.language = options.language;
  }

  /**
   * Verify captcha token via Cloud Function (server-side)
   * 🔒 SECURITY FIX: The secret key is NEVER exposed to the client.
   * Instead, we call a Cloud Function that has access to the secret
   * via environment variables or Secret Manager.
   */
  async verifyToken(token: string): Promise<CaptchaResult> {
    try {
      if (!token) {
        return { success: false, error: 'No captcha token provided' };
      }

      // Call Cloud Function to verify the token server-side
      // The Cloud Function has access to the hCaptcha secret key
      const response = await fetch('/api/verifyCaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error(`Verification request failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: data.success,
        token: data.success ? token : undefined,
        error: data.success ? undefined : data.error || 'Verification failed'
      };
    } catch (error) {
      serviceLogger.error('Captcha verification error', error as Error);
      return {
        success: false,
        error: 'Network error during verification'
      };
    }
  }

  // Get current configuration
  getConfig(): CaptchaOptions {
    return {
      siteKey: this.siteKey,
      theme: this.theme,
      size: this.size,
      language: this.language
    };
  }

  // Check if captcha is properly configured
  isConfigured(): boolean {
    return Boolean(this.siteKey && this.siteKey !== 'your-hcaptcha-site-key');
  }

  // Get site key
  getSiteKey(): string {
    return this.siteKey;
  }

  // Set theme
  setTheme(theme: 'light' | 'dark') {
    this.theme = theme;
  }

  // Set size
  setSize(size: 'normal' | 'compact') {
    this.size = size;
  }

  // Set language
  setLanguage(language: string) {
    this.language = language;
  }
}

// Utility functions
export const verifyCaptcha = async (token: string): Promise<CaptchaResult> => {
  const service = new BulgarianCaptchaService({
    siteKey: import.meta.env.VITE_HCAPTCHA_SITE_KEY || ''
  });
  return await service.verifyToken(token);
};

export const createCaptchaService = (options: CaptchaOptions): BulgarianCaptchaService => {
  return new BulgarianCaptchaService(options);
};

// Default instance
const defaultCaptchaService = new BulgarianCaptchaService({
  siteKey: import.meta.env.VITE_HCAPTCHA_SITE_KEY || '',
  theme: 'light',
  size: 'normal',
  language: 'bg'
});

export default defaultCaptchaService;

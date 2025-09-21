// hCaptcha Service - Free Alternative to Google reCAPTCHA
// خدمة hCaptcha - بديل مجاني لـ Google reCAPTCHA

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

  // Verify captcha token on server side
  async verifyToken(token: string): Promise<CaptchaResult> {
    try {
      const secretKey = process.env.REACT_APP_HCAPTCHA_SECRET_KEY || '';

      if (!secretKey) {
        console.warn('hCaptcha secret key not configured');
        return { success: false, error: 'Secret key not configured' };
      }

      const response = await fetch('https://hcaptcha.com/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      });

      const data = await response.json();

      return {
        success: data.success,
        token: data.success ? token : undefined,
        error: data.success ? undefined : data['error-codes']?.join(', ') || 'Verification failed'
      };
    } catch (error) {
      console.error('Captcha verification error:', error);
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
    siteKey: process.env.REACT_APP_HCAPTCHA_SITE_KEY || ''
  });
  return await service.verifyToken(token);
};

export const createCaptchaService = (options: CaptchaOptions): BulgarianCaptchaService => {
  return new BulgarianCaptchaService(options);
};

// Default instance
const defaultCaptchaService = new BulgarianCaptchaService({
  siteKey: process.env.REACT_APP_HCAPTCHA_SITE_KEY || 'your-hcaptcha-site-key',
  theme: 'light',
  size: 'normal',
  language: 'bg'
});

export default defaultCaptchaService;
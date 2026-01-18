// src/services/security-service.ts
// Advanced Security Service for Koli One

import { errorHandler } from './error-handling-service';
import { rateLimiter } from './rate-limiting-service';
import { serviceLogger } from './logger-service';

export interface SecurityConfig {
  enableCSRFProtection: boolean;
  enableXSSProtection: boolean;
  enableSQLInjectionProtection: boolean;
  enableRateLimiting: boolean;
  enableIPBlocking: boolean;
}

export interface SecurityThreat {
  type: 'xss' | 'sql_injection' | 'csrf' | 'brute_force' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: Date;
  details: Record<string, any>;
}

export class SecurityService {
  private static instance: SecurityService;
  private threats: SecurityThreat[] = [];
  private blockedIPs = new Set<string>();
  private suspiciousIPs = new Map<string, number>();
  private readonly MAX_THREATS = 1000;
  private readonly SUSPICIOUS_THRESHOLD = 5;

  private constructor() {
    this.initializeSecurityHeaders();
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Sanitize HTML to prevent XSS
   */
  public sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Detect XSS attempts
   */
  public detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /eval\(/gi,
      /expression\(/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Detect SQL injection attempts
   */
  public detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(UNION\s+SELECT)/gi,
      /(OR\s+1\s*=\s*1)/gi,
      /(AND\s+1\s*=\s*1)/gi,
      /('|"|;|--|\*|\/\*|\*\/)/g
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Generate CSRF token
   */
  public generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate CSRF token
   */
  public validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken;
  }

  /**
   * Log security threat
   */
  public logThreat(threat: SecurityThreat): void {
    this.threats.unshift(threat);

    // Maintain max size
    if (this.threats.length > this.MAX_THREATS) {
      this.threats = this.threats.slice(0, this.MAX_THREATS);
    }

    // Log to error handler
    errorHandler.logError(new Error(`Security threat: ${threat.type}`), {
      action: 'security_threat',
      severity: threat.severity,
      additionalData: threat
    });

    // Track suspicious IPs
    if (threat.source) {
      const count = (this.suspiciousIPs.get(threat.source) || 0) + 1;
      this.suspiciousIPs.set(threat.source, count);

      // Block IP if too many threats
      if (count >= this.SUSPICIOUS_THRESHOLD) {
        this.blockIP(threat.source);
      }
    }
  }

  /**
   * Block IP address
   */
  public blockIP(ip: string): void {
    this.blockedIPs.add(ip);
    serviceLogger.warn('Blocked IP', { ip });
  }

  /**
   * Check if IP is blocked
   */
  public isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  /**
   * Validate input for security threats
   */
  public validateInput(input: string, source: string = 'unknown'): {
    isValid: boolean;
    threats: string[];
  } {
    const threats: string[] = [];

    if (this.detectXSS(input)) {
      threats.push('xss');
      this.logThreat({
        type: 'xss',
        severity: 'high',
        source,
        timestamp: new Date(),
        details: { input: input.substring(0, 100) }
      });
    }

    if (this.detectSQLInjection(input)) {
      threats.push('sql_injection');
      this.logThreat({
        type: 'sql_injection',
        severity: 'critical',
        source,
        timestamp: new Date(),
        details: { input: input.substring(0, 100) }
      });
    }

    return {
      isValid: threats.length === 0,
      threats
    };
  }

  /**
   * Get security statistics
   */
  public getSecurityStats(): {
    totalThreats: number;
    threatsByType: Record<string, number>;
    threatsBySeverity: Record<string, number>;
    blockedIPs: number;
    suspiciousIPs: number;
    recentThreats: SecurityThreat[];
  } {
    const threatsByType: Record<string, number> = {};
    const threatsBySeverity: Record<string, number> = {};

    this.threats.forEach(threat => {
      threatsByType[threat.type] = (threatsByType[threat.type] || 0) + 1;
      threatsBySeverity[threat.severity] = (threatsBySeverity[threat.severity] || 0) + 1;
    });

    return {
      totalThreats: this.threats.length,
      threatsByType,
      threatsBySeverity,
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      recentThreats: this.threats.slice(0, 10)
    };
  }

  /**
   * Initialize security headers
   */
  private initializeSecurityHeaders(): void {
    if (typeof window === 'undefined') return;

    // Add security-related meta tags
    const metaTags = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'SAMEORIGIN' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
    ];

    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.httpEquiv = tag.name;
      meta.content = tag.content;
      document.head.appendChild(meta);
    });
  }

  /**
   * Hash sensitive data
   */
  public async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate secure random string
   */
  public generateSecureRandom(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance();

// Helper functions
export const sanitizeHTML = (html: string): string => {
  return securityService.sanitizeHTML(html);
};

export const validateSecureInput = (input: string, source?: string) => {
  return securityService.validateInput(input, source);
};

export const generateCSRFToken = (): string => {
  return securityService.generateCSRFToken();
};

// Unique Owner Service - نظام الحماية الفريد للمالك الوحيد
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import { getAuth, getIdTokenResult, signOut, User } from 'firebase/auth';

export interface UniqueOwnerSession {
  email: string;
  name: string;
  role: 'admin';
  permissions: string[];
  loginTime: Date;
  isUnique: boolean;
  sessionId: string;
  lastActivity: Date;
  securityLevel: 'maximum';
  accessLog: Array<{
    action: string;
    timestamp: Date;
    ip?: string;
    userAgent?: string;
  }>;
}

export interface SecurityLog {
  action: string;
  timestamp: Date;
  details: any;
  ip?: string;
  userAgent?: string;
  location?: string;
}

export class UniqueOwnerService {
  private static instance: UniqueOwnerService;
  private static readonly LOCAL_ADMIN_SESSION_KEY = 'super_admin_local_session';
  private static readonly LOGIN_ATTEMPTS_KEY = 'admin_login_attempts';
  private static readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes idle timeout
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
  private static readonly ADMIN_EMAILS: string[] = (
    import.meta.env.VITE_ADMIN_EMAILS || ''
  ).split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);
  private static readonly OWNER_SECRET: string = import.meta.env.VITE_OWNER_SECRET || '';
  private currentSession: UniqueOwnerSession | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    // Intentionally empty: admin auth is handled via Firebase Auth + role checks
    this.startIdleMonitor();
  }

  public static getInstance(): UniqueOwnerService {
    if (!UniqueOwnerService.instance) {
      UniqueOwnerService.instance = new UniqueOwnerService();
    }
    return UniqueOwnerService.instance;
  }

  // تحقق من صلاحيات الأدمن عبر Firebase Auth + دور المستخدم
  private async isAdminUser(user: User): Promise<boolean> {
    const email = user.email?.trim().toLowerCase();
    if (email && UniqueOwnerService.ADMIN_EMAILS.includes(email)) {
      return true;
    }
    try {
      const token = await getIdTokenResult(user, true);
      if (token?.claims?.admin === true) {
        return true;
      }

      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      return snap.exists() && snap.data()?.role === 'admin';
    } catch (error) {
      serviceLogger.warn('Admin role check failed', { error });
      return false;
    }
  }

  // إنشاء جلسة أدمن بعد تسجيل الدخول عبر Firebase
  public async startAdminSession(user: User): Promise<boolean> {
    const isAdmin = await this.isAdminUser(user);
    if (!isAdmin) {
      await this.logSecurityEvent('failed_authentication', {
        email: user.email,
        timestamp: new Date(),
      });
      return false;
    }

    const sessionId = this.generateUniqueSessionId();
    const session: UniqueOwnerSession = {
      email: user.email || 'unknown',
      name: user.displayName || 'Admin',
      role: 'admin',
      permissions: ['all'],
      loginTime: new Date(),
      isUnique: true,
      sessionId,
      lastActivity: new Date(),
      securityLevel: 'maximum',
      accessLog: [],
    };

    this.currentSession = session;
    await this.logSecurityEvent('successful_authentication', {
      email: user.email,
      sessionId,
    });
    return true;
  }

  // التحقق من الجلسة النشطة
  public async validateCurrentSession(): Promise<boolean> {
    try {
      const localSession = this.getLocalAdminSession();
      if (localSession) {
        this.currentSession = localSession;
        return true;
      }

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return false;

      const isAdmin = await this.isAdminUser(user);
      if (!isAdmin) {
        await this.logout();
        return false;
      }

      const sessionId = this.generateUniqueSessionId();
      this.currentSession = {
        email: user.email || 'unknown',
        name: user.displayName || 'Admin',
        role: 'admin',
        permissions: ['all'],
        loginTime: new Date(),
        isUnique: true,
        sessionId,
        lastActivity: new Date(),
        securityLevel: 'maximum',
        accessLog: [],
      };

      return true;
    } catch (error) {
      serviceLogger.error('Error validating session', error as Error);
      await this.logout();
      return false;
    }
  }

  // تسجيل الخروج
  public async logout(): Promise<void> {
    if (this.currentSession) {
      await this.logSecurityEvent('logout', {
        sessionId: this.currentSession.sessionId,
        duration: Date.now() - this.currentSession.loginTime.getTime(),
      });
    }

    this.currentSession = null;
    localStorage.removeItem(UniqueOwnerService.LOCAL_ADMIN_SESSION_KEY);
    try {
      await signOut(getAuth());
    } catch (error) {
      serviceLogger.warn('Failed to sign out admin user', { error });
    }
  }

  // تحقق من بيانات دخول المالك الثابتة
  public validateOwnerCredentials(email: string, password: string): { success: boolean; locked?: boolean; remainingMinutes?: number } {
    // Check lockout first
    const lockStatus = this.checkLockout();
    if (lockStatus.locked) {
      return { success: false, locked: true, remainingMinutes: lockStatus.remainingMinutes };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isOwnerEmail = UniqueOwnerService.ADMIN_EMAILS.includes(normalizedEmail);
    const valid = isOwnerEmail && UniqueOwnerService.OWNER_SECRET !== '' && password === UniqueOwnerService.OWNER_SECRET;

    if (!valid) {
      this.recordFailedAttempt(normalizedEmail);
      const afterLock = this.checkLockout();
      return { success: false, locked: afterLock.locked, remainingMinutes: afterLock.remainingMinutes };
    }

    // Reset attempts on success
    this.resetLoginAttempts();
    return { success: true };
  }

  // Rate limiting — record failed login attempt
  private recordFailedAttempt(email: string): void {
    try {
      const raw = localStorage.getItem(UniqueOwnerService.LOGIN_ATTEMPTS_KEY);
      const data = raw ? JSON.parse(raw) : { attempts: [], lockedUntil: null };
      data.attempts.push({ email, timestamp: Date.now() });
      // Keep only the last 10 attempts
      if (data.attempts.length > 10) {
        data.attempts = data.attempts.slice(-10);
      }

      // If max attempts reached, set lockout
      const recentAttempts = data.attempts.filter(
        (a: { timestamp: number }) => Date.now() - a.timestamp < UniqueOwnerService.LOCKOUT_DURATION_MS
      );
      if (recentAttempts.length >= UniqueOwnerService.MAX_LOGIN_ATTEMPTS) {
        data.lockedUntil = Date.now() + UniqueOwnerService.LOCKOUT_DURATION_MS;
      }

      localStorage.setItem(UniqueOwnerService.LOGIN_ATTEMPTS_KEY, JSON.stringify(data));

      this.logSecurityEvent('failed_login_attempt', {
        email,
        attemptCount: recentAttempts.length,
        locked: recentAttempts.length >= UniqueOwnerService.MAX_LOGIN_ATTEMPTS,
      });
    } catch {
      // best-effort
    }
  }

  // Check if account is locked out
  private checkLockout(): { locked: boolean; remainingMinutes?: number } {
    try {
      const raw = localStorage.getItem(UniqueOwnerService.LOGIN_ATTEMPTS_KEY);
      if (!raw) return { locked: false };
      const data = JSON.parse(raw);
      if (data.lockedUntil && Date.now() < data.lockedUntil) {
        return {
          locked: true,
          remainingMinutes: Math.ceil((data.lockedUntil - Date.now()) / 60000),
        };
      }
      // Lockout expired — clear it
      if (data.lockedUntil && Date.now() >= data.lockedUntil) {
        this.resetLoginAttempts();
      }
      return { locked: false };
    } catch {
      return { locked: false };
    }
  }

  // Reset login attempts after successful login
  private resetLoginAttempts(): void {
    localStorage.removeItem(UniqueOwnerService.LOGIN_ATTEMPTS_KEY);
  }

  // Session idle timeout monitor
  private startIdleMonitor(): void {
    const resetTimer = () => {
      if (this.idleTimer) clearTimeout(this.idleTimer);
      if (!this.currentSession) return;
      this.idleTimer = setTimeout(() => {
        serviceLogger.warn('Admin session expired due to inactivity');
        this.logout();
      }, UniqueOwnerService.SESSION_TIMEOUT_MS);
    };

    if (typeof window !== 'undefined') {
      ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt =>
        window.addEventListener(evt, resetTimer, { passive: true })
      );
    }
  }

  // Check if session has timed out
  public isSessionTimedOut(): boolean {
    if (!this.currentSession) return true;
    const elapsed = Date.now() - this.currentSession.lastActivity.getTime();
    return elapsed > UniqueOwnerService.SESSION_TIMEOUT_MS;
  }

  // إنشاء جلسة أدمن محلية لا تعتمد على Firebase Auth
  public async startLocalAdminSession(email: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();
    const isOwnerEmail = UniqueOwnerService.ADMIN_EMAILS.includes(normalizedEmail);

    if (!isOwnerEmail) {
      await this.logSecurityEvent('failed_authentication', {
        email: normalizedEmail,
        reason: 'local-admin-email-mismatch',
        timestamp: new Date(),
      });
      return false;
    }

    const sessionId = this.generateUniqueSessionId();
    const session: UniqueOwnerSession = {
      email: normalizedEmail,
      name: 'Alaa Hamid',
      role: 'admin',
      permissions: ['all'],
      loginTime: new Date(),
      isUnique: true,
      sessionId,
      lastActivity: new Date(),
      securityLevel: 'maximum',
      accessLog: [],
    };

    this.currentSession = session;
    localStorage.setItem(
      UniqueOwnerService.LOCAL_ADMIN_SESSION_KEY,
      JSON.stringify({
        email: session.email,
        sessionId: session.sessionId,
        loginTime: session.loginTime.toISOString(),
      })
    );

    await this.logSecurityEvent('successful_authentication', {
      email: normalizedEmail,
      sessionId,
      mode: 'local-admin-session',
    });
    return true;
  }

  // الحصول على الجلسة الحالية
  public getCurrentSession(): UniqueOwnerSession | null {
    return this.currentSession;
  }

  // تسجيل نشاط الأمان
  public async logSecurityEvent(action: string, details: any): Promise<void> {
    try {
      const securityLog: SecurityLog = {
        action,
        timestamp: new Date(),
        details,
        ip: await this.getClientIP(),
        userAgent: navigator.userAgent,
        location: await this.getClientLocation(),
      };

      // حفظ في localStorage للوصول السريع
      const existingLogs = JSON.parse(
        localStorage.getItem('securityLogs') || '[]'
      );
      existingLogs.push(securityLog);

      // الاحتفاظ بآخر 100 سجل فقط
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }

      localStorage.setItem('securityLogs', JSON.stringify(existingLogs));

      // محاولة حفظ في Firestore (اختياري)
      try {
        const logRef = doc(collection(db, 'security_logs'));
        await setDoc(logRef, {
          ...securityLog,
          timestamp: serverTimestamp(),
        });
      } catch (firestoreError) {
        serviceLogger.warn('Could not save to Firestore', {
          action,
          error: firestoreError,
        });
      }
    } catch (error) {
      serviceLogger.error('Error logging security event', error as Error, {
        action,
      });
    }
  }

  // الحصول على سجلات الأمان
  public getSecurityLogs(): SecurityLog[] {
    try {
      return JSON.parse(localStorage.getItem('securityLogs') || '[]');
    } catch (error) {
      serviceLogger.error('Error getting security logs', error as Error);
      return [];
    }
  }

  // إنشاء معرف جلسة فريد
  private generateUniqueSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `unique_owner_${timestamp}_${random}`;
  }

  // Session storage removed for security (use Firebase Auth instead)

  private getLocalAdminSession(): UniqueOwnerSession | null {
    try {
      const raw = localStorage.getItem(
        UniqueOwnerService.LOCAL_ADMIN_SESSION_KEY
      );
      if (!raw) return null;

      const parsed = JSON.parse(raw) as {
        email?: string;
        sessionId?: string;
        loginTime?: string;
      };

      const parsedEmail = parsed.email?.trim().toLowerCase();
      const isOwnerEmail = parsedEmail
        ? UniqueOwnerService.ADMIN_EMAILS.includes(parsedEmail)
        : false;

      if (!isOwnerEmail) return null;

      return {
        email: parsed.email,
        name: 'Alaa Hamid',
        role: 'admin',
        permissions: ['all'],
        loginTime: parsed.loginTime ? new Date(parsed.loginTime) : new Date(),
        isUnique: true,
        sessionId: parsed.sessionId || this.generateUniqueSessionId(),
        lastActivity: new Date(),
        securityLevel: 'maximum',
        accessLog: [],
      };
    } catch {
      return null;
    }
  }

  private async saveSessionToStorage(
    session: UniqueOwnerSession
  ): Promise<void> {
    try {
      localStorage.setItem(
        UniqueOwnerService.LOCAL_ADMIN_SESSION_KEY,
        JSON.stringify({
          email: session.email,
          sessionId: session.sessionId,
          loginTime: session.loginTime.toISOString(),
        })
      );
    } catch {
      // no-op
    }
  }

  // الحصول على عنوان IP (محاكاة)
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  // الحصول على الموقع (محاكاة)
  private async getClientLocation(): Promise<string> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return `${data.locationData?.cityName}, ${data.country}` || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  // تحديث آخر نشاط
  public async updateLastActivity(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.lastActivity = new Date();
      await this.saveSessionToStorage(this.currentSession);
    }
  }

  // التحقق من صلاحيات فريدة
  public hasUniquePermission(permission: string): boolean {
    return this.currentSession?.permissions.includes('all') || false;
  }

  // إحصائيات الأمان
  public getSecurityStats(): {
    totalLogins: number;
    lastLogin: Date | null;
    securityEvents: number;
    sessionDuration: number;
  } {
    const logs = this.getSecurityLogs();
    const loginEvents = logs.filter(
      log => log.action === 'successful_authentication'
    );
    const lastLogin =
      loginEvents.length > 0
        ? new Date(Math.max(...loginEvents.map(log => log.timestamp.getTime())))
        : null;

    const sessionDuration = this.currentSession
      ? Date.now() - this.currentSession.loginTime.getTime()
      : 0;

    return {
      totalLogins: loginEvents.length,
      lastLogin,
      securityEvents: logs.length,
      sessionDuration,
    };
  }
}

export const uniqueOwnerService = UniqueOwnerService.getInstance();

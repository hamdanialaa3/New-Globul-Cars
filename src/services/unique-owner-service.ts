// Unique Owner Service - نظام الحماية الفريد للمالك الوحيد
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
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
  private currentSession: UniqueOwnerSession | null = null;

  private constructor() {
    // Intentionally empty: admin auth is handled via Firebase Auth + role checks
  }

  public static getInstance(): UniqueOwnerService {
    if (!UniqueOwnerService.instance) {
      UniqueOwnerService.instance = new UniqueOwnerService();
    }
    return UniqueOwnerService.instance;
  }

  // تحقق من صلاحيات الأدمن عبر Firebase Auth + دور المستخدم
  private async isAdminUser(user: User): Promise<boolean> {
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
      await this.logSecurityEvent('failed_authentication', { email: user.email, timestamp: new Date() });
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
      accessLog: []
    };

    this.currentSession = session;
    await this.logSecurityEvent('successful_authentication', { email: user.email, sessionId });
    return true;
  }

  // التحقق من الجلسة النشطة
  public async validateCurrentSession(): Promise<boolean> {
    try {
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
        accessLog: []
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
        duration: Date.now() - this.currentSession.loginTime.getTime()
      });
    }

    this.currentSession = null;
    try {
      await signOut(getAuth());
    } catch (error) {
      serviceLogger.warn('Failed to sign out admin user', { error });
    }
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
        location: await this.getClientLocation()
      };

      // حفظ في localStorage للوصول السريع
      const existingLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
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
          timestamp: serverTimestamp()
        });
      } catch (firestoreError) {
        serviceLogger.warn('Could not save to Firestore', { action, error: firestoreError });
      }

    } catch (error) {
      serviceLogger.error('Error logging security event', error as Error, { action });
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
    const loginEvents = logs.filter(log => log.action === 'successful_authentication');
    const lastLogin = loginEvents.length > 0 ?
      new Date(Math.max(...loginEvents.map(log => log.timestamp.getTime()))) : null;

    const sessionDuration = this.currentSession ?
      Date.now() - this.currentSession.loginTime.getTime() : 0;

    return {
      totalLogins: loginEvents.length,
      lastLogin,
      securityEvents: logs.length,
      sessionDuration
    };
  }
}

export const uniqueOwnerService = UniqueOwnerService.getInstance();


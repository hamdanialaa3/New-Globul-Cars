// Unique Owner Service - نظام الحماية الفريد للمالك الوحيد
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

export interface UniqueOwnerSession {
  email: string;
  name: string;
  role: 'unique_owner';
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
  private readonly UNIQUE_OWNER_EMAIL = 'alaa.hamdani@yahoo.com';
  private readonly UNIQUE_OWNER_PASSWORD = 'Alaa1983';
  private currentSession: UniqueOwnerSession | null = null;

  public static getInstance(): UniqueOwnerService {
    if (!UniqueOwnerService.instance) {
      UniqueOwnerService.instance = new UniqueOwnerService();
    }
    return UniqueOwnerService.instance;
  }

  // التحقق من هوية المالك الفريد
  public async authenticateUniqueOwner(email: string, password: string): Promise<boolean> {
    if (email !== this.UNIQUE_OWNER_EMAIL || password !== this.UNIQUE_OWNER_PASSWORD) {
      await this.logSecurityEvent('failed_authentication', { email, timestamp: new Date() });
      return false;
    }

    // إنشاء جلسة فريدة
    const sessionId = this.generateUniqueSessionId();
    const session: UniqueOwnerSession = {
      email: this.UNIQUE_OWNER_EMAIL,
      name: 'Alaa Hamid',
      role: 'unique_owner',
      permissions: ['all'],
      loginTime: new Date(),
      isUnique: true,
      sessionId,
      lastActivity: new Date(),
      securityLevel: 'maximum',
      accessLog: []
    };

    this.currentSession = session;
    await this.saveSessionToStorage(session);
    await this.logSecurityEvent('successful_authentication', { email, sessionId });
    
    return true;
  }

  // التحقق من الجلسة النشطة
  public async validateCurrentSession(): Promise<boolean> {
    try {
      const storedSession = localStorage.getItem('superAdminSession');
      if (!storedSession) return false;

      const session = JSON.parse(storedSession);
      if (!session.isUnique || session.email !== this.UNIQUE_OWNER_EMAIL) {
        await this.logout();
        return false;
      }

      // التحقق من انتهاء الجلسة (24 ساعة)
      const loginTime = new Date(session.loginTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        await this.logout();
        return false;
      }

      this.currentSession = session;
      return true;
    } catch (error) {
      console.error('Error validating session:', error);
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
    localStorage.removeItem('superAdminSession');
    localStorage.removeItem('adminUser');
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
        console.warn('Could not save to Firestore:', firestoreError);
      }

    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  // الحصول على سجلات الأمان
  public getSecurityLogs(): SecurityLog[] {
    try {
      return JSON.parse(localStorage.getItem('securityLogs') || '[]');
    } catch (error) {
      console.error('Error getting security logs:', error);
      return [];
    }
  }

  // إنشاء معرف جلسة فريد
  private generateUniqueSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `unique_owner_${timestamp}_${random}`;
  }

  // حفظ الجلسة في التخزين المحلي
  private async saveSessionToStorage(session: UniqueOwnerSession): Promise<void> {
    localStorage.setItem('superAdminSession', JSON.stringify(session));
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
      return `${data.city}, ${data.country}` || 'unknown';
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


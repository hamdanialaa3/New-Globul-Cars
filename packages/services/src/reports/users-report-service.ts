// src/services/reports/users-report-service.ts
// خدمة تصدير تقارير المستخدمين

import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@globul-cars/services/firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';

export interface UserReportData {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  profileType: 'private' | 'dealer' | 'company';
  createdAt: Date;
  lastLogin?: Date;
  city?: string;
  activeListings?: number;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
}

export class UsersReportService {
  private static instance: UsersReportService;

  static getInstance(): UsersReportService {
    if (!UsersReportService.instance) {
      UsersReportService.instance = new UsersReportService();
    }
    return UsersReportService.instance;
  }

  /**
   * جلب جميع المستخدمين
   */
  async getAllUsers(filters?: {
    profileType?: 'private' | 'dealer' | 'company';
    city?: string;
    verifiedOnly?: boolean;
  }): Promise<UserReportData[]> {
    try {
      let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

      // إضافة فلاتر
      if (filters?.profileType) {
        q = query(q, where('profileType', '==', filters.profileType));
      }

      if (filters?.city) {
        q = query(q, where('city', '==', filters.city));
      }

      if (filters?.verifiedOnly) {
        q = query(q, where('verifiedEmail', '==', true));
      }

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          phoneNumber: data.phoneNumber || '',
          profileType: data.profileType || 'private',
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
          city: data.city || '',
          activeListings: data.stats?.activeListings || 0,
          verifiedEmail: data.verifiedEmail || false,
          verifiedPhone: data.verifiedPhone || false,
        };
      });
    } catch (error) {
      serviceLogger.error('Error fetching users for report', error as Error);
      throw error;
    }
  }

  /**
   * تصدير المستخدمين إلى CSV
   */
  async exportToCSV(users: UserReportData[]): Promise<string> {
    const headers = [
      'UID',
      'البريد الإلكتروني',
      'الاسم',
      'رقم الهاتف',
      'نوع الحساب',
      'المدينة',
      'الإعلانات النشطة',
      'البريد مُتحقق',
      'الهاتف مُتحقق',
      'تاريخ التسجيل',
      'آخر دخول'
    ];

    const rows = users.map(user => [
      user.uid,
      user.email,
      user.displayName,
      user.phoneNumber || '-',
      this.translateProfileType(user.profileType),
      user.city || '-',
      user.activeListings?.toString() || '0',
      user.verifiedEmail ? 'نعم' : 'لا',
      user.verifiedPhone ? 'نعم' : 'لا',
      user.createdAt.toLocaleDateString('bg-BG'),
      user.lastLogin?.toLocaleDateString('bg-BG') || '-'
    ]);

    const csvContent = [
      '\uFEFF' + headers.join(','), // BOM for Excel UTF-8
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * تصدير إلى JSON
   */
  async exportToJSON(users: UserReportData[]): Promise<string> {
    return JSON.stringify(users, null, 2);
  }

  /**
   * تصدير إلى Excel (HTML Table يفتح في Excel)
   */
  async exportToExcel(users: UserReportData[]): Promise<string> {
    const headers = [
      'UID', 'البريد الإلكتروني', 'الاسم', 'رقم الهاتف', 
      'نوع الحساب', 'المدينة', 'الإعلانات النشطة',
      'البريد مُتحقق', 'الهاتف مُتحقق', 'تاريخ التسجيل', 'آخر دخول'
    ];

    const rows = users.map(user => `
      <tr>
        <td>${user.uid}</td>
        <td>${user.email}</td>
        <td>${user.displayName}</td>
        <td>${user.phoneNumber || '-'}</td>
        <td>${this.translateProfileType(user.profileType)}</td>
        <td>${user.city || '-'}</td>
        <td>${user.activeListings || 0}</td>
        <td>${user.verifiedEmail ? 'نعم' : 'لا'}</td>
        <td>${user.verifiedPhone ? 'نعم' : 'لا'}</td>
        <td>${user.createdAt.toLocaleDateString('bg-BG')}</td>
        <td>${user.lastLogin?.toLocaleDateString('bg-BG') || '-'}</td>
      </tr>
    `).join('');

    return `
      <html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; direction: rtl; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #4CAF50; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * تحميل التقرير
   */
  downloadReport(content: string, filename: string, type: 'csv' | 'json' | 'xls') {
    const mimeTypes = {
      csv: 'text/csv;charset=utf-8;',
      json: 'application/json',
      xls: 'application/vnd.ms-excel'
    };

    const blob = new Blob([content], { type: mimeTypes[type] });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.${type}`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * ترجمة نوع البروفايل
   */
  private translateProfileType(type: string): string {
    const translations: { [key: string]: string } = {
      'private': 'خاص',
      'dealer': 'معرض',
      'company': 'شركة'
    };
    return translations[type] || type;
  }

  /**
   * إحصائيات سريعة
   */
  async getUserStatistics(): Promise<{
    total: number;
    private: number;
    dealer: number;
    company: number;
    verified: number;
    unverified: number;
  }> {
    try {
      const users = await this.getAllUsers();
      
      return {
        total: users.length,
        private: users.filter(u => u.profileType === 'private').length,
        dealer: users.filter(u => u.profileType === 'dealer').length,
        company: users.filter(u => u.profileType === 'company').length,
        verified: users.filter(u => u.verifiedEmail).length,
        unverified: users.filter(u => !u.verifiedEmail).length,
      };
    } catch (error) {
      serviceLogger.error('Error getting user statistics', error as Error);
      throw error;
    }
  }
}

export const usersReportService = UsersReportService.getInstance();


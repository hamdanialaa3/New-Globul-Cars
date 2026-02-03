// Super Admin - Visitor Analytics Service
// Tracks visitor behavior, geo-location, devices, and traffic sources

import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';

interface PageView {
  path: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  userAgent: string;
  referrer: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser?: string;
  os?: string;
  screenResolution?: string;
  language?: string;
  geoLocation?: {
    country: string;
    city?: string;
  };
}

interface VisitorMetrics {
  realTimeVisitors: number;
  totalVisitorsToday: number;
  geographicDistribution: Array<{
    country: string;
    visitors: number;
    percentage: number;
  }>;
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  browserStats: Map<string, number>;
  topPages: Array<{
    path: string;
    views: number;
    percentage: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
}

class VisitorAnalyticsService {
  async trackPageView(path: string, userId?: string): Promise<void> {
    try {
      const sessionId = this.getOrCreateSessionId();
      const deviceInfo = this.detectDevice();

      const pageView: Record<string, unknown> = {
        path,
        userId: userId || null,
        sessionId,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct',
        deviceType: deviceInfo.type,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language
      };

      await addDoc(collection(db, 'page_views'), pageView);
    } catch (error) {
      serviceLogger.error('Error tracking page view', error as Error, { path, userId });
    }
  }

  async getRealTimeVisitors(): Promise<number> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const q = query(
        collection(db, 'page_views'),
        where('timestamp', '>=', fiveMinutesAgo)
      );

      const snapshot = await getDocs(q);
      const sessions = new Set(snapshot.docs.map((doc: any) => doc.data().sessionId));
      
      return sessions.size;
    } catch (error) {
      serviceLogger.error('Error getting real-time visitors', error as Error);
      return 0;
    }
  }

  async getVisitorMetrics(): Promise<VisitorMetrics> {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, 'page_views'),
        where('timestamp', '>=', todayStart),
        limit(1000)
      );

      const snapshot = await getDocs(q);
      const views = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          path: data.path || '/',
          sessionId: data.sessionId || 'unknown',
          deviceType: data.deviceType || 'desktop',
          referrer: data.referrer || 'direct',
          geoLocation: data.geoLocation,
          timestamp: data.timestamp?.toDate?.() || new Date()
        };
      });

      const realTimeVisitors = await this.getRealTimeVisitors();
      const totalVisitorsToday = new Set(views.map((v: any) => v.sessionId)).size;
      const geoDistribution = this.calculateGeoDistribution(views);
      const deviceStats = this.calculateDeviceStats(views);
      const topPages = this.calculateTopPages(views);
      const trafficSources = this.calculateTrafficSources(views);

      return {
        realTimeVisitors,
        totalVisitorsToday,
        geographicDistribution: geoDistribution,
        deviceStats,
        browserStats: new Map(),
        topPages,
        trafficSources
      };
    } catch (error) {
      serviceLogger.error('Error getting visitor metrics', error as Error);
      return this.getDefaultMetrics();
    }
  }

    private calculateGeoDistribution(views: PageView[]): Array<{ country: string; visitors: number; percentage: number }> {
    const countries: { [key: string]: Set<string> } = {};
    
    views.forEach(view => {
      const country = view.geoLocation?.country || 'Bulgaria';
      if (!countries[country]) {
        countries[country] = new Set();
      }
      countries[country].add(view.sessionId);
    });

    const total = new Set(views.map(v => v.sessionId)).size;
    
    return Object.entries(countries)
      .map(([country, sessions]) => ({
        country,
        visitors: sessions.size,
        percentage: Math.round((sessions.size / total) * 100)
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);
  }

    private calculateDeviceStats(views: PageView[]): { mobile: number; desktop: number; tablet: number } {
    const devices = { mobile: 0, desktop: 0, tablet: 0 };
    const sessions: { [key: string]: string } = {};

    views.forEach(view => {
      if (!sessions[view.sessionId]) {
        sessions[view.sessionId] = view.deviceType || 'desktop';
        devices[view.deviceType as keyof typeof devices]++;
      }
    });

    return devices;
  }

    private calculateTopPages(views: PageView[]): Array<{ path: string; views: number; percentage: number }> {
    const pages: { [key: string]: number } = {};
    
    views.forEach(view => {
      pages[view.path] = (pages[view.path] || 0) + 1;
    });

    const total = views.length;
    
    return Object.entries(pages)
      .map(([path, count]) => ({
        path,
        views: count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

    private calculateTrafficSources(views: PageView[]): Array<{ source: string; visitors: number; percentage: number }> {
    const sources: { [key: string]: Set<string> } = {};
    
    views.forEach(view => {
      const source = this.extractSource(view.referrer);
      if (!sources[source]) {
        sources[source] = new Set();
      }
      sources[source].add(view.sessionId);
    });

    const total = new Set(views.map((v: any) => v.sessionId)).size;
    
    return Object.entries(sources)
      .map(([source, sessions]) => ({
        source,
        visitors: sessions.size,
        percentage: Math.round((sessions.size / total) * 100)
      }))
      .sort((a, b) => b.visitors - a.visitors);
  }

  private extractSource(referrer: string): string {
    if (!referrer || referrer === 'direct') return 'Direct';
    if (referrer.includes('google')) return 'Google';
    if (referrer.includes('facebook')) return 'Facebook';
    if (referrer.includes('instagram')) return 'Instagram';
    return 'Other';
  }

  private detectDevice(): { type: 'mobile' | 'desktop' | 'tablet'; browser?: string; os?: string } {
    const ua = navigator.userAgent;
    
    let type: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (/mobile/i.test(ua)) type = 'mobile';
    if (/tablet|ipad/i.test(ua)) type = 'tablet';

    let browser = 'Unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return { type, browser, os };
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('visitor_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('visitor_session_id', sessionId);
    }
    return sessionId;
  }

  private getDefaultMetrics(): VisitorMetrics {
    return {
      realTimeVisitors: 0,
      totalVisitorsToday: 0,
      geographicDistribution: [],
      deviceStats: { mobile: 0, desktop: 0, tablet: 0 },
      browserStats: new Map(),
      topPages: [],
      trafficSources: []
    };
  }
}

export const visitorAnalyticsService = new VisitorAnalyticsService();
export type { PageView, VisitorMetrics };


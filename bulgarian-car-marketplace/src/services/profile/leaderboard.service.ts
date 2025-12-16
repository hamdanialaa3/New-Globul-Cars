/**
 * Leaderboard Service
 * Manages leaderboards and rankings
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';
import type {
  Leaderboard,
  LeaderboardEntry,
  LeaderboardRank,
  LeaderboardCategory,
  LeaderboardPeriod
} from '../../types/profile-enhancements.types';
import { transactionsService } from './transactions.service';
import { pointsLevelsService } from './points-levels.service';

export class LeaderboardService {
  private static instance: LeaderboardService;
  private readonly collectionName = 'leaderboards';
  private readonly ranksCollection = 'leaderboardRanks';

  private constructor() {}

  public static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    category: LeaderboardCategory,
    period: LeaderboardPeriod,
    limitCount: number = 100
  ): Promise<Leaderboard> {
    try {
      // Try to get cached leaderboard
      const leaderboardRef = doc(
        db,
        this.collectionName,
        `${category}_${period}`
      );
      const leaderboardSnap = await getDoc(leaderboardRef);

      if (leaderboardSnap.exists()) {
        const data = leaderboardSnap.data() as Leaderboard;
        // Check if cache is fresh (less than 1 hour old)
        const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date();
        const now = new Date();
        const hoursSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);

        if (hoursSinceUpdate < 1) {
          return data;
        }
      }

      // Generate fresh leaderboard
      return await this.generateLeaderboard(category, period, limitCount);
    } catch (error) {
      serviceLogger.error('Error getting leaderboard:', error);
      return {
        category,
        period,
        entries: [],
        updatedAt: serverTimestamp() as any
      };
    }
  }

  /**
   * Generate leaderboard from data
   */
  private async generateLeaderboard(
    category: LeaderboardCategory,
    period: LeaderboardPeriod,
    limitCount: number
  ): Promise<Leaderboard> {
    try {
      let entries: LeaderboardEntry[] = [];

      switch (category) {
        case 'total_sales':
          entries = await this.getSalesLeaderboard(period, limitCount);
          break;
        case 'total_revenue':
          entries = await this.getRevenueLeaderboard(period, limitCount);
          break;
        case 'total_points':
          entries = await this.getPointsLeaderboard(period, limitCount);
          break;
        default:
          entries = [];
      }

      // Save to cache only if we have valid entries
      if (entries.length > 0) {
        try {
          const leaderboardRef = doc(
            db,
            this.collectionName,
            `${category}_${period}`
          );
          await setDoc(leaderboardRef, {
            category,
            period,
            entries,
            updatedAt: serverTimestamp()
          });
        } catch (cacheError) {
          // Log cache error but continue - we still have the data
          serviceLogger.warn('Failed to cache leaderboard, but returning data:', cacheError);
        }
      }

      return {
        category,
        period,
        entries,
        updatedAt: serverTimestamp() as any
      };
    } catch (error) {
      serviceLogger.error('Error generating leaderboard:', error);
      return {
        category,
        period,
        entries: [],
        updatedAt: serverTimestamp() as any
      };
    }
  }

  /**
   * Get sales leaderboard
   */
  private async getSalesLeaderboard(
    period: LeaderboardPeriod,
    limitCount: number
  ): Promise<LeaderboardEntry[]> {
    try {
      // Get all transactions for the period
      const startDate = this.getPeriodStartDate(period);
      const transactions = await transactionsService.getUserTransactions('', {
        limitCount: 10000
      });

      // Filter by period
      const filteredTransactions = transactions.filter(t => {
        const saleDate = t.saleDate?.toDate ? t.saleDate.toDate() : new Date(t.saleDate);
        return saleDate >= startDate && t.status === 'completed';
      });

      // Group by user and count
      const userSales = new Map<string, number>();
      filteredTransactions.forEach(t => {
        const count = userSales.get(t.userId) || 0;
        userSales.set(t.userId, count + 1);
      });

      // Convert to entries (would need user data for displayName, avatarUrl)
      const entries: LeaderboardEntry[] = Array.from(userSales.entries())
        .map(([userId, value], index) => ({
          userId,
          displayName: `User ${userId.substring(0, 8)}`, // Placeholder
          value,
          rank: index + 1,
          change: 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limitCount)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

      return entries;
    } catch (error) {
      serviceLogger.error('Error getting sales leaderboard:', error);
      return [];
    }
  }

  /**
   * Get revenue leaderboard
   */
  private async getRevenueLeaderboard(
    period: LeaderboardPeriod,
    limitCount: number
  ): Promise<LeaderboardEntry[]> {
    try {
      const startDate = this.getPeriodStartDate(period);
      const transactions = await transactionsService.getUserTransactions('', {
        limitCount: 10000
      });

      const filteredTransactions = transactions.filter(t => {
        const saleDate = t.saleDate?.toDate ? t.saleDate.toDate() : new Date(t.saleDate);
        return saleDate >= startDate && t.status === 'completed';
      });

      const userRevenue = new Map<string, number>();
      filteredTransactions.forEach(t => {
        const revenue = userRevenue.get(t.userId) || 0;
        userRevenue.set(t.userId, revenue + (t.salePrice || 0));
      });

      const entries: LeaderboardEntry[] = Array.from(userRevenue.entries())
        .map(([userId, value], index) => ({
          userId,
          displayName: `User ${userId.substring(0, 8)}`,
          value,
          rank: index + 1,
          change: 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limitCount)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

      return entries;
    } catch (error) {
      serviceLogger.error('Error getting revenue leaderboard:', error);
      return [];
    }
  }

  /**
   * Get points leaderboard
   */
  private async getPointsLeaderboard(
    period: LeaderboardPeriod,
    limitCount: number
  ): Promise<LeaderboardEntry[]> {
    try {
      // Get all user points
      const pointsQuery = query(
        collection(db, 'userPoints'),
        orderBy('totalPoints', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(pointsQuery);
      const entries: LeaderboardEntry[] = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
          userId: data.userId,
          displayName: `User ${data.userId.substring(0, 8)}`,
          value: data.totalPoints || 0,
          rank: index + 1,
          change: 0
        };
      });

      return entries;
    } catch (error) {
      serviceLogger.error('Error getting points leaderboard:', error);
      return [];
    }
  }

  /**
   * Get user's rank
   */
  async getUserRank(
    userId: string,
    category: LeaderboardCategory,
    period: LeaderboardPeriod
  ): Promise<LeaderboardRank | null> {
    try {
      if (!userId) return null;

      const rankRef = doc(
        db,
        this.ranksCollection,
        `${userId}_${category}_${period}`
      );
      const rankSnap = await getDoc(rankRef);

      if (!rankSnap.exists()) {
        return null;
      }

      return rankSnap.data() as LeaderboardRank;
    } catch (error) {
      serviceLogger.error('Error getting user rank:', error);
      return null;
    }
  }

  /**
   * Get period start date
   */
  private getPeriodStartDate(period: LeaderboardPeriod): Date {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'weekly':
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        return new Date(now.getTime() - daysToMonday * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'all_time':
        return new Date(0);
      default:
        return new Date(0);
    }
  }
}

export const leaderboardService = LeaderboardService.getInstance();


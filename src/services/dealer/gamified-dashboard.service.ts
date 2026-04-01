// src/services/dealer/gamified-dashboard.service.ts
// Gamified B2B Dashboard Engine — Dealer heatmaps, velocity scores, badges, MRR analytics
// Transforms dealer experience with competitive gamification + data-driven insights

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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';

// ─── Types ───────────────────────────────────────────────────────────

export type DealerTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type BadgeCategory =
  | 'speed'
  | 'quality'
  | 'volume'
  | 'trust'
  | 'innovation'
  | 'community';

export interface DealerGamificationProfile {
  dealerId: string;
  displayName: string;
  tier: DealerTier;
  xp: number;
  level: number;
  xpToNextLevel: number;
  badges: DealerBadge[];
  streaks: DealerStreak[];
  velocityScore: number;
  trustScore: number;
  qualityScore: number;
  monthlyRank: number;
  totalDealersRanked: number;
  stats: DealerPerformanceStats;
  lastUpdated: Date;
}

export interface DealerBadge {
  id: string;
  name: string;
  nameBg: string;
  description: string;
  descriptionBg: string;
  category: BadgeCategory;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
  earnedAt: Date;
  isNew: boolean;
}

export interface DealerStreak {
  type: 'daily_login' | 'daily_listing' | 'response_time' | 'sales';
  currentCount: number;
  bestCount: number;
  isActive: boolean;
  lastActivity: Date;
}

export interface DealerPerformanceStats {
  // Volume metrics
  totalListings: number;
  activeListings: number;
  soldThisMonth: number;
  soldThisQuarter: number;
  soldAllTime: number;

  // Speed metrics
  avgDaysToSell: number;
  avgResponseTimeMins: number;
  responseRate: number; // 0-100

  // Quality metrics
  avgListingScore: number; // 0-100
  photosPerListing: number;
  descriptionCompleteness: number; // 0-100
  returnRate: number; // % of buyers who had issues

  // Financial metrics
  totalRevenue: number;
  mrr: number; // Monthly recurring revenue from subscription
  avgSalePrice: number;
  profitMargin: number; // estimated %

  // Engagement metrics
  profileViews: number;
  listingViews: number;
  leadsGenerated: number;
  conversionRate: number; // leads / views
}

export interface DemandHeatmapData {
  category: string;
  categoryBg: string;
  make: string;
  model?: string;
  demandScore: number; // 0-100
  searchVolume: number;
  avgTimeToSell: number;
  avgPrice: number;
  supplyCount: number;
  trend: 'rising' | 'stable' | 'falling';
  regions: RegionDemand[];
}

export interface RegionDemand {
  region: string;
  regionBg: string;
  demandScore: number;
  searchVolume: number;
  supplyCount: number;
}

export interface VelocityReport {
  dealerId: string;
  period: 'week' | 'month' | 'quarter';
  velocityScore: number; // 0-100
  inventoryTurnover: number; // Times inventory turned over
  avgDaysOnMarket: number;
  fastestSale: {
    carId: string;
    make: string;
    model: string;
    daysToSell: number;
  };
  slowestListing: {
    carId: string;
    make: string;
    model: string;
    daysOnMarket: number;
  };
  recommendations: VelocityRecommendation[];
  peerComparison: {
    yourScore: number;
    avgScore: number;
    topScore: number;
    percentile: number;
  };
}

export interface VelocityRecommendation {
  type: 'price' | 'photos' | 'description' | 'promotion' | 'remove';
  carId?: string;
  title: string;
  titleBg: string;
  description: string;
  descriptionBg: string;
  expectedImpact: string;
  priority: 'low' | 'medium' | 'high';
}

export interface LeaderboardEntry {
  rank: number;
  dealerId: string;
  displayName: string;
  tier: DealerTier;
  score: number;
  change: number; // vs last period
  badges: number;
  isCurrentUser: boolean;
}

export interface MRRAnalytics {
  currentMrr: number;
  previousMrr: number;
  mrrGrowth: number;
  subscriptionBreakdown: {
    plan: string;
    planBg: string;
    count: number;
    revenue: number;
  }[];
  churnRate: number;
  ltv: number; // Lifetime value
  arpu: number; // Average revenue per user
  projectedMrr: number;
}

// ─── Badge Definitions ──────────────────────────────────────────────

const BADGE_DEFINITIONS: Omit<DealerBadge, 'earnedAt' | 'isNew'>[] = [
  // Speed badges
  {
    id: 'flash_seller',
    name: 'Flash Seller',
    nameBg: 'Светкавичен продавач',
    description: 'Sold a car within 24 hours',
    descriptionBg: 'Продал кола за 24 часа',
    category: 'speed',
    icon: '⚡',
    tier: 'gold',
  },
  {
    id: 'quick_responder',
    name: 'Quick Responder',
    nameBg: 'Бърз отговор',
    description: 'Average response time under 5 minutes',
    descriptionBg: 'Средно време за отговор под 5 минути',
    category: 'speed',
    icon: '💬',
    tier: 'silver',
  },
  {
    id: 'speed_lister',
    name: 'Speed Lister',
    nameBg: 'Бързо обявяване',
    description: 'Listed 10 cars in one day',
    descriptionBg: 'Обявил 10 коли за един ден',
    category: 'speed',
    icon: '🚀',
    tier: 'bronze',
  },

  // Quality badges
  {
    id: 'photo_pro',
    name: 'Photo Pro',
    nameBg: 'Фото професионалист',
    description: 'Average 20+ photos per listing',
    descriptionBg: 'Средно 20+ снимки на обява',
    category: 'quality',
    icon: '📸',
    tier: 'gold',
  },
  {
    id: 'detail_master',
    name: 'Detail Master',
    nameBg: 'Майстор на детайлите',
    description: '100% description completeness',
    descriptionBg: '100% пълнота на описанието',
    category: 'quality',
    icon: '✍️',
    tier: 'silver',
  },
  {
    id: 'certified_dealer',
    name: 'Certified Dealer',
    nameBg: 'Сертифициран дилър',
    description: 'All listings have Koli Certified badge',
    descriptionBg: 'Всички обяви имат значка Koli Certified',
    category: 'quality',
    icon: '🏅',
    tier: 'gold',
  },

  // Volume badges
  {
    id: 'first_sale',
    name: 'First Sale',
    nameBg: 'Първа продажба',
    description: 'Completed first sale on Koli',
    descriptionBg: 'Завършена първа продажба в Koli',
    category: 'volume',
    icon: '🎉',
    tier: 'bronze',
  },
  {
    id: 'top_100',
    name: 'Top 100 Seller',
    nameBg: 'Топ 100 продавач',
    description: 'Sold 100+ cars on Koli',
    descriptionBg: 'Продал 100+ коли в Koli',
    category: 'volume',
    icon: '💯',
    tier: 'gold',
  },
  {
    id: 'deal_maker',
    name: 'Deal Maker',
    nameBg: 'Преговарящ',
    description: 'Sold 10 cars in one month',
    descriptionBg: 'Продал 10 коли за един месец',
    category: 'volume',
    icon: '🤝',
    tier: 'silver',
  },

  // Trust badges
  {
    id: 'verified_business',
    name: 'Verified Business',
    nameBg: 'Верифициран бизнес',
    description: 'Business registration verified',
    descriptionBg: 'Регистрацията на бизнеса е верифицирана',
    category: 'trust',
    icon: '✅',
    tier: 'gold',
  },
  {
    id: 'zero_returns',
    name: 'Zero Returns',
    nameBg: 'Нула връщания',
    description: '50+ sales with 0% return rate',
    descriptionBg: '50+ продажби с 0% процент на връщане',
    category: 'trust',
    icon: '🛡️',
    tier: 'gold',
  },
  {
    id: 'five_star',
    name: '5-Star Dealer',
    nameBg: '5-звезден дилър',
    description: 'Maintained 5-star rating for 3 months',
    descriptionBg: 'Поддържал 5-звезден рейтинг 3 месеца',
    category: 'trust',
    icon: '⭐',
    tier: 'gold',
  },

  // Innovation badges
  {
    id: 'ev_pioneer',
    name: 'EV Pioneer',
    nameBg: 'EV пионер',
    description: 'Listed 10+ electric vehicles',
    descriptionBg: 'Обявил 10+ електрически автомобила',
    category: 'innovation',
    icon: '🔋',
    tier: 'silver',
  },
  {
    id: 'tech_adopter',
    name: 'Tech Adopter',
    nameBg: 'Технологичен новатор',
    description: 'Used all platform features',
    descriptionBg: 'Използвал всички функции на платформата',
    category: 'innovation',
    icon: '🔬',
    tier: 'bronze',
  },

  // Community badges
  {
    id: 'mentor',
    name: 'Mentor',
    nameBg: 'Наставник',
    description: 'Helped 5+ new dealers get started',
    descriptionBg: 'Помогнал на 5+ нови дилъри да започнат',
    category: 'community',
    icon: '🎓',
    tier: 'silver',
  },
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    nameBg: 'Ранен потребител',
    description: 'Joined Koli in its first year',
    descriptionBg: 'Присъединил се към Koli в първата година',
    category: 'community',
    icon: '🌟',
    tier: 'gold',
  },
];

// ─── Tier Thresholds ────────────────────────────────────────────────

const TIER_THRESHOLDS: Record<
  DealerTier,
  { minXP: number; benefits: string[] }
> = {
  bronze: { minXP: 0, benefits: ['Основен профил', 'До 10 обяви'] },
  silver: { minXP: 1000, benefits: ['До 50 обяви', 'Приоритетна поддръжка'] },
  gold: {
    minXP: 5000,
    benefits: ['До 200 обяви', 'Разширена аналитика', 'Приоритетно показване'],
  },
  platinum: {
    minXP: 15000,
    benefits: ['Неограничени обяви', 'API достъп', 'Персонален мениджър'],
  },
  diamond: {
    minXP: 50000,
    benefits: ['Всичко от Platinum', 'Ексклузивни промоции', 'Custom branding'],
  },
};

// ─── Level System ───────────────────────────────────────────────────

const XP_PER_LEVEL = 200;
const XP_SCALING = 1.15;

// ─── Service ─────────────────────────────────────────────────────────

class GamifiedDashboardService {
  private static instance: GamifiedDashboardService;

  private constructor() {}

  static getInstance(): GamifiedDashboardService {
    if (!GamifiedDashboardService.instance) {
      GamifiedDashboardService.instance = new GamifiedDashboardService();
    }
    return GamifiedDashboardService.instance;
  }

  // ─── Profile ──────────────────────────────────────────────────────

  /**
   * Get or create dealer gamification profile
   */
  async getProfile(
    dealerId: string
  ): Promise<DealerGamificationProfile | null> {
    try {
      const profileRef = doc(db, 'dealer_gamification', dealerId);
      const profileDoc = await getDoc(profileRef);

      if (!profileDoc.exists()) return null;
      return profileDoc.data() as DealerGamificationProfile;
    } catch (error) {
      serviceLogger.error(
        'GamifiedDashboard: Error getting profile',
        error as Error
      );
      return null;
    }
  }

  /**
   * Initialize gamification profile for a new dealer
   */
  async initializeProfile(
    dealerId: string,
    displayName: string
  ): Promise<DealerGamificationProfile> {
    try {
      const profile: DealerGamificationProfile = {
        dealerId,
        displayName,
        tier: 'bronze',
        xp: 0,
        level: 1,
        xpToNextLevel: XP_PER_LEVEL,
        badges: [],
        streaks: [
          {
            type: 'daily_login',
            currentCount: 0,
            bestCount: 0,
            isActive: false,
            lastActivity: new Date(),
          },
          {
            type: 'daily_listing',
            currentCount: 0,
            bestCount: 0,
            isActive: false,
            lastActivity: new Date(),
          },
          {
            type: 'response_time',
            currentCount: 0,
            bestCount: 0,
            isActive: false,
            lastActivity: new Date(),
          },
          {
            type: 'sales',
            currentCount: 0,
            bestCount: 0,
            isActive: false,
            lastActivity: new Date(),
          },
        ],
        velocityScore: 0,
        trustScore: 50,
        qualityScore: 50,
        monthlyRank: 0,
        totalDealersRanked: 0,
        stats: this.getEmptyStats(),
        lastUpdated: new Date(),
      };

      await setDoc(doc(db, 'dealer_gamification', dealerId), {
        ...profile,
        lastUpdated: serverTimestamp(),
      });

      serviceLogger.info('GamifiedDashboard: Profile initialized', {
        dealerId,
      });
      return profile;
    } catch (error) {
      serviceLogger.error(
        'GamifiedDashboard: Error initializing profile',
        error as Error
      );
      throw error;
    }
  }

  // ─── XP & Leveling ───────────────────────────────────────────────

  /**
   * Award XP for dealer actions
   */
  async awardXP(
    dealerId: string,
    action: string,
    amount: number
  ): Promise<{
    newXP: number;
    newLevel: number;
    leveledUp: boolean;
    newTier: DealerTier | null;
  }> {
    try {
      const profileRef = doc(db, 'dealer_gamification', dealerId);
      const profileDoc = await getDoc(profileRef);

      if (!profileDoc.exists()) {
        throw new Error('Dealer gamification profile not found');
      }

      const profile = profileDoc.data() as DealerGamificationProfile;
      const newXP = profile.xp + amount;
      const newLevel = this.calculateLevel(newXP);
      const leveledUp = newLevel > profile.level;
      const newTier = this.calculateTier(newXP);
      const tierChanged = newTier !== profile.tier;

      await updateDoc(profileRef, {
        xp: newXP,
        level: newLevel,
        tier: newTier,
        xpToNextLevel: this.xpForLevel(newLevel + 1) - newXP,
        lastUpdated: serverTimestamp(),
      });

      // Log XP event
      await setDoc(doc(db, 'dealer_xp_events', `${dealerId}_${Date.now()}`), {
        dealerId,
        action,
        amount,
        totalXP: newXP,
        level: newLevel,
        timestamp: serverTimestamp(),
      });

      serviceLogger.info('GamifiedDashboard: XP awarded', {
        dealerId,
        action,
        amount,
        newLevel,
      });

      return {
        newXP,
        newLevel,
        leveledUp,
        newTier: tierChanged ? newTier : null,
      };
    } catch (error) {
      serviceLogger.error(
        'GamifiedDashboard: Error awarding XP',
        error as Error
      );
      throw error;
    }
  }

  // ─── XP Actions Map ──────────────────────────────────────────────

  /**
   * Award XP for specific platform actions
   */
  getXPForAction(action: string): number {
    const xpMap: Record<string, number> = {
      list_car: 10,
      sell_car: 50,
      respond_message: 5,
      respond_fast: 15, // Under 5 min
      add_photos_10: 10,
      add_photos_20: 20,
      complete_description: 10,
      get_certified: 25,
      daily_login: 5,
      bulk_upload: 30,
      first_sale: 100,
      five_star_review: 20,
      refer_dealer: 50,
      use_vin_scanner: 10,
      use_ev_report: 15,
    };
    return xpMap[action] || 0;
  }

  // ─── Demand Heatmaps ──────────────────────────────────────────────

  /**
   * Generate demand heatmap data for dealers
   */
  async getDemandHeatmap(): Promise<DemandHeatmapData[]> {
    try {
      // Query search trends from Firestore
      const heatmapRef = collection(db, 'demand_heatmap');
      const snapshot = await getDocs(
        query(heatmapRef, orderBy('demandScore', 'desc'), limit(30))
      );

      if (snapshot.empty) {
        // Return default/calculated heatmap data
        return this.generateDefaultHeatmap();
      }

      return snapshot.docs.map(d => d.data() as DemandHeatmapData);
    } catch (error) {
      serviceLogger.error(
        'GamifiedDashboard: Error getting heatmap',
        error as Error
      );
      return this.generateDefaultHeatmap();
    }
  }

  // ─── Velocity Scoring ─────────────────────────────────────────────

  /**
   * Calculate dealer's inventory velocity score
   */
  async calculateVelocityReport(
    dealerId: string,
    period: 'week' | 'month' | 'quarter'
  ): Promise<VelocityReport> {
    try {
      const profile = await this.getProfile(dealerId);
      const stats = profile?.stats || this.getEmptyStats();

      // Industry benchmarks for Bulgaria
      const industryAvgDays = 45;
      const topDealerDays = 14;

      // Calculate velocity score (higher is better)
      const velocityScore =
        stats.avgDaysToSell > 0
          ? Math.min(
              100,
              Math.round((industryAvgDays / stats.avgDaysToSell) * 50)
            )
          : 50;

      // Inventory turnover
      const inventoryTurnover =
        stats.activeListings > 0
          ? Math.round(
              ((stats.soldThisMonth * 12) / stats.activeListings) * 10
            ) / 10
          : 0;

      // Generate recommendations
      const recommendations = this.generateVelocityRecommendations(
        stats,
        velocityScore
      );

      const report: VelocityReport = {
        dealerId,
        period,
        velocityScore,
        inventoryTurnover,
        avgDaysOnMarket: stats.avgDaysToSell,
        fastestSale: { carId: '', make: '', model: '', daysToSell: 0 },
        slowestListing: { carId: '', make: '', model: '', daysOnMarket: 0 },
        recommendations,
        peerComparison: {
          yourScore: velocityScore,
          avgScore: 50,
          topScore: 95,
          percentile: Math.min(99, Math.round(velocityScore * 1.1)),
        },
      };

      // Store velocity report
      await setDoc(
        doc(
          db,
          'dealer_velocity_reports',
          `${dealerId}_${period}_${Date.now()}`
        ),
        {
          ...report,
          createdAt: serverTimestamp(),
        }
      );

      return report;
    } catch (error) {
      serviceLogger.error(
        'GamifiedDashboard: Velocity calculation error',
        error as Error
      );
      throw error;
    }
  }

  // ─── Leaderboard ──────────────────────────────────────────────────

  /**
   * Get monthly dealer leaderboard
   */
  async getLeaderboard(
    currentDealerId: string,
    topN: number = 20
  ): Promise<LeaderboardEntry[]> {
    try {
      const q = query(
        collection(db, 'dealer_gamification'),
        orderBy('xp', 'desc'),
        limit(topN)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((d, index) => {
        const data = d.data() as DealerGamificationProfile;
        return {
          rank: index + 1,
          dealerId: data.dealerId,
          displayName: data.displayName,
          tier: data.tier,
          score: data.xp,
          change: 0, // Would need historical data
          badges: data.badges.length,
          isCurrentUser: data.dealerId === currentDealerId,
        };
      });
    } catch (error) {
      serviceLogger.error(
        'GamifiedDashboard: Leaderboard error',
        error as Error
      );
      return [];
    }
  }

  // ─── Badge System ─────────────────────────────────────────────────

  /**
   * Check and award new badges based on dealer stats
   */
  async checkAndAwardBadges(dealerId: string): Promise<DealerBadge[]> {
    try {
      const profile = await this.getProfile(dealerId);
      if (!profile) return [];

      const stats = profile.stats;
      const existingBadgeIds = new Set(profile.badges.map(b => b.id));
      const newBadges: DealerBadge[] = [];

      // Check each badge condition
      if (!existingBadgeIds.has('first_sale') && stats.soldAllTime >= 1) {
        newBadges.push(this.createBadge('first_sale'));
      }
      if (!existingBadgeIds.has('deal_maker') && stats.soldThisMonth >= 10) {
        newBadges.push(this.createBadge('deal_maker'));
      }
      if (!existingBadgeIds.has('top_100') && stats.soldAllTime >= 100) {
        newBadges.push(this.createBadge('top_100'));
      }
      if (
        !existingBadgeIds.has('quick_responder') &&
        stats.avgResponseTimeMins <= 5
      ) {
        newBadges.push(this.createBadge('quick_responder'));
      }
      if (!existingBadgeIds.has('photo_pro') && stats.photosPerListing >= 20) {
        newBadges.push(this.createBadge('photo_pro'));
      }
      if (
        !existingBadgeIds.has('detail_master') &&
        stats.descriptionCompleteness >= 100
      ) {
        newBadges.push(this.createBadge('detail_master'));
      }
      if (
        !existingBadgeIds.has('zero_returns') &&
        stats.soldAllTime >= 50 &&
        stats.returnRate === 0
      ) {
        newBadges.push(this.createBadge('zero_returns'));
      }

      if (newBadges.length > 0) {
        const allBadges = [...profile.badges, ...newBadges];
        await updateDoc(doc(db, 'dealer_gamification', dealerId), {
          badges: allBadges,
          lastUpdated: serverTimestamp(),
        });

        serviceLogger.info('GamifiedDashboard: Badges awarded', {
          dealerId,
          newBadges: newBadges.map(b => b.id),
        });
      }

      return newBadges;
    } catch (error) {
      serviceLogger.error(
        'GamifiedDashboard: Badge check error',
        error as Error
      );
      return [];
    }
  }

  /**
   * Get available badges (not yet earned)
   */
  getAvailableBadges(
    earnedBadgeIds: string[]
  ): Omit<DealerBadge, 'earnedAt' | 'isNew'>[] {
    return BADGE_DEFINITIONS.filter(b => !earnedBadgeIds.includes(b.id));
  }

  // ─── MRR Analytics ────────────────────────────────────────────────

  /**
   * Generate MRR analytics for platform admin
   */
  async getMRRAnalytics(): Promise<MRRAnalytics> {
    try {
      const subsRef = collection(db, 'dealer_subscriptions');
      const snapshot = await getDocs(
        query(subsRef, where('status', '==', 'active'))
      );

      let currentMrr = 0;
      const planBreakdown: Record<string, { count: number; revenue: number }> =
        {};

      snapshot.docs.forEach(d => {
        const sub = d.data();
        const monthlyAmount = sub.monthlyAmount || 0;
        currentMrr += monthlyAmount;

        const plan = sub.plan || 'unknown';
        if (!planBreakdown[plan]) {
          planBreakdown[plan] = { count: 0, revenue: 0 };
        }
        planBreakdown[plan].count++;
        planBreakdown[plan].revenue += monthlyAmount;
      });

      const planNames: Record<string, string> = {
        free: 'Безплатен',
        dealer: 'Дилър',
        enterprise: 'Ентърпрайс',
        unknown: 'Неизвестен',
      };

      return {
        currentMrr,
        previousMrr: currentMrr * 0.95, // Estimate
        mrrGrowth: 5, // Estimated %
        subscriptionBreakdown: Object.entries(planBreakdown).map(
          ([plan, data]) => ({
            plan,
            planBg: planNames[plan] || plan,
            count: data.count,
            revenue: data.revenue,
          })
        ),
        churnRate: 3.5,
        ltv:
          currentMrr > 0
            ? Math.round((currentMrr / snapshot.docs.length) * 18)
            : 0,
        arpu:
          snapshot.docs.length > 0
            ? Math.round(currentMrr / snapshot.docs.length)
            : 0,
        projectedMrr: Math.round(currentMrr * 1.08),
      };
    } catch (error) {
      serviceLogger.error(
        'GamifiedDashboard: MRR analytics error',
        error as Error
      );
      throw error;
    }
  }

  // ─── Tier Info ────────────────────────────────────────────────────

  /**
   * Get tier information and benefits
   */
  getTierInfo(tier: DealerTier): { minXP: number; benefits: string[] } {
    return TIER_THRESHOLDS[tier];
  }

  getAllTiers(): Record<DealerTier, { minXP: number; benefits: string[] }> {
    return { ...TIER_THRESHOLDS };
  }

  // ─── Private Methods ──────────────────────────────────────────────

  private calculateLevel(xp: number): number {
    let level = 1;
    let requiredXP = XP_PER_LEVEL;
    let totalXP = 0;

    while (totalXP + requiredXP <= xp) {
      totalXP += requiredXP;
      level++;
      requiredXP = Math.round(XP_PER_LEVEL * Math.pow(XP_SCALING, level - 1));
    }

    return level;
  }

  private xpForLevel(level: number): number {
    let totalXP = 0;
    for (let i = 1; i < level; i++) {
      totalXP += Math.round(XP_PER_LEVEL * Math.pow(XP_SCALING, i - 1));
    }
    return totalXP;
  }

  private calculateTier(xp: number): DealerTier {
    if (xp >= TIER_THRESHOLDS.diamond.minXP) return 'diamond';
    if (xp >= TIER_THRESHOLDS.platinum.minXP) return 'platinum';
    if (xp >= TIER_THRESHOLDS.gold.minXP) return 'gold';
    if (xp >= TIER_THRESHOLDS.silver.minXP) return 'silver';
    return 'bronze';
  }

  private createBadge(badgeId: string): DealerBadge {
    const def = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (!def) throw new Error(`Badge definition not found: ${badgeId}`);
    return { ...def, earnedAt: new Date(), isNew: true };
  }

  private getEmptyStats(): DealerPerformanceStats {
    return {
      totalListings: 0,
      activeListings: 0,
      soldThisMonth: 0,
      soldThisQuarter: 0,
      soldAllTime: 0,
      avgDaysToSell: 0,
      avgResponseTimeMins: 0,
      responseRate: 0,
      avgListingScore: 0,
      photosPerListing: 0,
      descriptionCompleteness: 0,
      returnRate: 0,
      totalRevenue: 0,
      mrr: 0,
      avgSalePrice: 0,
      profitMargin: 0,
      profileViews: 0,
      listingViews: 0,
      leadsGenerated: 0,
      conversionRate: 0,
    };
  }

  private generateDefaultHeatmap(): DemandHeatmapData[] {
    // Top demanded vehicles in Bulgarian market
    return [
      {
        category: 'SUV',
        categoryBg: 'Джип/SUV',
        make: 'Toyota',
        model: 'RAV4',
        demandScore: 95,
        searchVolume: 1200,
        avgTimeToSell: 12,
        avgPrice: 25000,
        supplyCount: 45,
        trend: 'rising',
        regions: [
          {
            region: 'Sofia',
            regionBg: 'София',
            demandScore: 95,
            searchVolume: 600,
            supplyCount: 20,
          },
        ],
      },
      {
        category: 'Sedan',
        categoryBg: 'Седан',
        make: 'BMW',
        model: '3 Series',
        demandScore: 90,
        searchVolume: 1100,
        avgTimeToSell: 15,
        avgPrice: 22000,
        supplyCount: 60,
        trend: 'stable',
        regions: [
          {
            region: 'Sofia',
            regionBg: 'София',
            demandScore: 90,
            searchVolume: 550,
            supplyCount: 30,
          },
        ],
      },
      {
        category: 'SUV',
        categoryBg: 'Джип/SUV',
        make: 'VW',
        model: 'Tiguan',
        demandScore: 88,
        searchVolume: 900,
        avgTimeToSell: 18,
        avgPrice: 20000,
        supplyCount: 35,
        trend: 'rising',
        regions: [
          {
            region: 'Plovdiv',
            regionBg: 'Пловдив',
            demandScore: 85,
            searchVolume: 200,
            supplyCount: 10,
          },
        ],
      },
      {
        category: 'Electric',
        categoryBg: 'Електрически',
        make: 'Tesla',
        model: 'Model 3',
        demandScore: 85,
        searchVolume: 800,
        avgTimeToSell: 10,
        avgPrice: 35000,
        supplyCount: 15,
        trend: 'rising',
        regions: [
          {
            region: 'Sofia',
            regionBg: 'София',
            demandScore: 90,
            searchVolume: 500,
            supplyCount: 10,
          },
        ],
      },
      {
        category: 'Hatchback',
        categoryBg: 'Хечбек',
        make: 'VW',
        model: 'Golf',
        demandScore: 82,
        searchVolume: 1500,
        avgTimeToSell: 20,
        avgPrice: 12000,
        supplyCount: 90,
        trend: 'stable',
        regions: [
          {
            region: 'Varna',
            regionBg: 'Варна',
            demandScore: 80,
            searchVolume: 200,
            supplyCount: 15,
          },
        ],
      },
    ];
  }

  private generateVelocityRecommendations(
    stats: DealerPerformanceStats,
    velocityScore: number
  ): VelocityRecommendation[] {
    const recs: VelocityRecommendation[] = [];

    if (stats.photosPerListing < 10) {
      recs.push({
        type: 'photos',
        priority: 'high',
        title: 'Add More Photos',
        titleBg: 'Добавете повече снимки',
        description: 'Listings with 15+ photos sell 40% faster',
        descriptionBg: 'Обяви с 15+ снимки се продават 40% по-бързо',
        expectedImpact: '+40% speed',
      });
    }

    if (stats.descriptionCompleteness < 80) {
      recs.push({
        type: 'description',
        priority: 'medium',
        title: 'Complete Descriptions',
        titleBg: 'Допълнете описанията',
        description: 'Detailed descriptions increase buyer confidence',
        descriptionBg: 'Подробните описания увеличават доверието на купувачите',
        expectedImpact: '+25% conversion',
      });
    }

    if (stats.avgResponseTimeMins > 30) {
      recs.push({
        type: 'description',
        priority: 'high',
        title: 'Respond Faster',
        titleBg: 'Отговаряйте по-бързо',
        description: 'Buyers expect replies within 15 minutes',
        descriptionBg: 'Купувачите очакват отговор до 15 минути',
        expectedImpact: '+35% leads',
      });
    }

    if (velocityScore < 40 && stats.avgDaysToSell > 60) {
      recs.push({
        type: 'price',
        priority: 'high',
        title: 'Review Pricing',
        titleBg: 'Прегледайте цените',
        description: 'Some listings may be overpriced vs market',
        descriptionBg: 'Някои обяви може да са надценени спрямо пазара',
        expectedImpact: '+50% speed',
      });
    }

    return recs;
  }
}

export const gamifiedDashboardService = GamifiedDashboardService.getInstance();

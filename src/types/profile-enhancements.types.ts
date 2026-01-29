/**
 * Profile Enhancements Types
 * Types for Phase 1, Phase 2 & Phase 3 Profile Enhancements
 * 
 * Phase 1 Features:
 * - Success Stories
 * - Trust Network
 * - My Car Story
 * - Points & Levels System
 * 
 * Phase 2 Features:
 * - Groups
 * - Monthly Challenges
 * - Transaction History
 * - Availability Calendar
 * 
 * Phase 3 Features:
 * - Intro Video
 * - Leaderboard
 * - Achievements Gallery
 */

import { Timestamp } from 'firebase/firestore';

// ==================== SUCCESS STORIES ====================
export interface SuccessStory {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'sale' | 'achievement' | 'milestone';
  value?: number; // e.g., number of cars sold
  date: Timestamp;
  isPublic: boolean;
  createdAt: Timestamp;
}

// ==================== TRUST NETWORK ====================
export interface TrustConnection {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: 'partner' | 'recommended' | 'verified';
  status: 'active' | 'pending' | 'rejected';
  createdAt: Timestamp;
  note?: string;
}

export interface TrustNetworkStats {
  partners: number;
  recommendedBy: number;
  recommendedTo: number;
  verifiedConnections: number;
}

// ==================== CAR STORY ====================
export interface CarStory {
  userId: string;
  story: string; // Text story about user's experience with cars
  yearsOfExperience?: number;
  favoriteBrands?: string[];
  favoriteModels?: string[];
  specialties?: string[]; // e.g., "Classic Cars", "Electric Vehicles"
  updatedAt: Timestamp;
}

// ==================== POINTS & LEVELS ====================
export type UserLevel = 
  | 'beginner'      // Начинаещ
  | 'intermediate'  // Среден
  | 'advanced'      // Напреднал
  | 'expert'        // Експерт
  | 'maestro';      // Маестро

export interface PointsActivity {
  id: string;
  userId: string;
  activityType: 
    | 'listing_created'      // +10
    | 'listing_sold'         // +50
    | 'positive_review'      // +20
    | 'profile_completed'    // +15
    | 'verification_completed' // +25
    | 'first_sale'           // +100
    | 'milestone_100_listings' // +200
    | 'daily_login'          // +5
    | 'referral'            // +30
    | 'social_share';       // +10
  points: number;
  description: string;
  createdAt: Timestamp;
}

export interface UserPoints {
  userId: string;
  totalPoints: number;
  currentLevel: UserLevel;
  pointsToNextLevel: number;
  activities: PointsActivity[];
  lastActivityAt?: Timestamp;
  updatedAt: Timestamp;
}

export interface LevelConfig {
  level: UserLevel;
  minPoints: number;
  maxPoints: number;
  labelBG: string;
  labelEN: string;
  badgeColor: string;
  benefits: string[];
}

// ==================== ACHIEVEMENTS ====================
export interface Achievement {
  id: string;
  userId: string;
  type: 
    | 'first_sale'
    | 'first_listing'
    | 'hundred_listings'
    | 'verified_seller'
    | 'top_seller'
    | 'community_contributor'
    | 'early_adopter';
  title: string;
  description: string;
  icon: string;
  unlockedAt: Timestamp;
  isPublic: boolean;
}

// ==================== ACTIVITY BADGES ====================
export interface ActivityBadge {
  type: 'active_now' | 'responds_quickly' | 'verified_recently' | 'top_seller';
  labelBG: string;
  labelEN: string;
  color: string;
  icon: string;
}

// ==================== GROUPS ====================
export interface UserGroup {
  id: string;
  name: string;
  nameEN: string;
  description: string;
  descriptionEN: string;
  category: 'brand' | 'type' | 'region' | 'interest' | 'general';
  icon?: string;
  coverImage?: string;
  memberCount: number;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GroupMembership {
  id: string;
  userId: string;
  groupId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: Timestamp;
  status: 'active' | 'pending' | 'banned';
}

// ==================== MONTHLY CHALLENGES ====================
export type ChallengeType = 
  | 'sell_cars'           // Продай 3 коли
  | 'get_reviews'         // Получи 10 отзива
  | 'create_listings'     // Създай 5 обяви
  | 'complete_profile'    // Завърши профила
  | 'refer_friends'       // Препоръчай приятели
  | 'social_shares';      // Сподели 10 пъти

export interface MonthlyChallenge {
  id: string;
  month: number; // 1-12
  year: number;
  type: ChallengeType;
  title: string;
  titleEN: string;
  description: string;
  descriptionEN: string;
  target: number; // Target value (e.g., 3 cars, 10 reviews)
  reward: {
    points: number;
    badge?: string;
    discount?: number; // Percentage discount
  };
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface UserChallengeProgress {
  id: string;
  userId: string;
  challengeId: string;
  currentProgress: number;
  isCompleted: boolean;
  completedAt?: Timestamp;
  claimedReward: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== TRANSACTION HISTORY ====================
export interface Transaction {
  id: string;
  userId: string;
  carId: string;
  carMake: string;
  carModel: string;
  carYear: number;
  salePrice: number;
  currency: 'EUR';
  saleDate: Timestamp;
  buyerId?: string;
  buyerName?: string;
  status: 'completed' | 'pending' | 'cancelled';
  notes?: string;
  createdAt: Timestamp;
}

export interface TransactionStats {
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  thisMonthSales: number;
  thisMonthRevenue: number;
  lastSaleDate?: Timestamp;
}

// ==================== AVAILABILITY CALENDAR ====================
export interface TimeSlot {
  start: string; // HH:mm format
  end: string;   // HH:mm format
  available: boolean;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD format
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  isAvailable: boolean;
  timeSlots: TimeSlot[];
  notes?: string;
}

export interface AvailabilityCalendar {
  userId: string;
  timezone: string; // e.g., "Europe/Sofia"
  defaultAvailability: {
    [key: number]: { // dayOfWeek: 0-6
      isAvailable: boolean;
      timeSlots: TimeSlot[];
    };
  };
  customDates: DayAvailability[]; // Override default for specific dates
  updatedAt: Timestamp;
}

// ==================== PROFILE ENHANCEMENT DATA ====================
export interface ProfileEnhancements {
  userId: string;
  
  // Phase 1: Success Stories
  successStories?: SuccessStory[];
  totalSales?: number;
  lastSaleDate?: Timestamp;
  
  // Phase 1: Trust Network
  trustConnections?: TrustConnection[];
  trustNetworkStats?: TrustNetworkStats;
  
  // Phase 1: Car Story
  carStory?: CarStory;
  
  // Phase 1: Points & Levels
  points?: UserPoints;
  achievements?: Achievement[];
  activityBadges?: ActivityBadge[];
  
  // Phase 2: Groups
  groups?: UserGroup[];
  groupMemberships?: GroupMembership[];
  
  // Phase 2: Challenges
  activeChallenges?: MonthlyChallenge[];
  challengeProgress?: UserChallengeProgress[];
  
  // Phase 2: Transactions
  transactions?: Transaction[];
  transactionStats?: TransactionStats;
  
  // Phase 2: Availability
  availabilityCalendar?: AvailabilityCalendar;
  
  // Phase 3: Intro Video
  introVideo?: IntroVideo;
  
  // Phase 3: Leaderboard
  leaderboardRank?: LeaderboardRank;
  
  // Phase 3: Achievements
  achievementsGallery?: Achievement[];
  
  // Timestamps
  updatedAt: Timestamp;
  createdAt: Timestamp;
}

// ==================== INTRO VIDEO ====================
export interface IntroVideo {
  userId: string;
  videoUrl: string; // Storage URL
  thumbnailUrl?: string;
  duration?: number; // seconds
  isPublic: boolean;
  views: number;
  uploadedAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== LEADERBOARD ====================
export type LeaderboardCategory = 
  | 'total_sales'        // Общо продажби
  | 'total_revenue'      // Общ приход
  | 'total_listings'     // Общо обяви
  | 'total_points'        // Общо точки
  | 'total_reviews'      // Общо отзиви
  | 'response_time';     // Време за отговор

export type LeaderboardPeriod = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'all_time';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  value: number;
  rank: number;
  change: number; // Change from previous period (+/-)
}

export interface LeaderboardRank {
  userId: string;
  category: LeaderboardCategory;
  period: LeaderboardPeriod;
  rank: number;
  value: number;
  previousRank?: number;
  updatedAt: Timestamp;
}

export interface Leaderboard {
  category: LeaderboardCategory;
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  updatedAt: Timestamp;
}

// ==================== ACHIEVEMENTS GALLERY ====================
export interface AchievementBadge {
  id: string;
  type: Achievement['type'];
  title: string;
  titleEN: string;
  description: string;
  descriptionEN: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Timestamp;
  isPublic: boolean;
}

export interface AchievementCertificate {
  id: string;
  userId: string;
  achievementType: Achievement['type'];
  certificateUrl: string; // PDF or image URL
  issuedAt: Timestamp;
  expiresAt?: Timestamp;
  isVerified: boolean;
}



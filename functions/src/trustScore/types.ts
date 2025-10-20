// functions/src/trustScore/types.ts
// Trust Score Calculation Types

export interface TrustScoreFactors {
  // Verification (max 20 points)
  isVerified: boolean;
  verificationBonus: number; // 20 if verified, 0 if not
  
  // Reviews (max 30 points)
  averageRating: number; // 0-5 stars
  ratingPoints: number; // averageRating * 6 = max 30
  reviewCount: number;
  reviewCountBonus: number; // 0.5 per review, max 10 points
  
  // Listing Quality (max 15 points)
  listingsCount: number;
  completeListingsBonus: number; // 5 points if 80%+ complete
  activeListingsBonus: number; // 5 points if 5+ active
  premiumListingsBonus: number; // 5 points if 3+ premium
  
  // Response Rate (max 15 points)
  responseRate: number; // 0-1 (percentage)
  responseRatePoints: number; // responseRate * 15
  
  // Profile Completeness (max 10 points)
  profileCompleteness: number; // 0-1 (percentage)
  profilePoints: number; // completeness * 10
  
  // Account Age (max 5 points)
  accountAgeDays: number;
  accountAgeBonus: number; // 1 point per 6 months, max 5
  
  // Activity (max 5 points)
  recentActivity: boolean;
  activityBonus: number; // 5 if active in last 30 days
  
  // Total Score
  totalScore: number; // Sum of all factors, max 100
}

export interface TrustScoreResult {
  userId: string;
  score: number; // 0-100
  factors: TrustScoreFactors;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'elite';
  lastCalculated: Date;
}

export interface TrustScoreBadge {
  level: string;
  minScore: number;
  color: string;
  icon: string;
  description: string;
}

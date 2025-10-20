"use strict";
// functions/src/trustScore/calculateScore.ts
// Trust Score Calculation Algorithm
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTrustScore = calculateTrustScore;
exports.getTrustBadge = getTrustBadge;
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const db = (0, firestore_1.getFirestore)();
/**
 * Calculate Trust Score for User
 *
 * Formula:
 * - Verification: 20 points
 * - Average Review Rating: 30 points (rating * 6)
 * - Review Count: 10 points (0.5 per review, max 10)
 * - Listing Quality: 15 points (complete 5 + active 5 + premium 5)
 * - Response Rate: 15 points (rate * 15)
 * - Profile Completeness: 10 points (completeness * 10)
 * - Account Age: 5 points (1 per 6 months, max 5)
 * - Recent Activity: 5 points (active in last 30 days)
 *
 * Total: 100 points max
 *
 * @param userId - User ID to calculate score for
 * @returns TrustScoreResult with score and breakdown
 */
async function calculateTrustScore(userId) {
    logger.info('Calculating trust score', { userId });
    try {
        // Get user data
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new Error('User not found');
        }
        const userData = userDoc.data();
        // Initialize factors
        const factors = {
            isVerified: false,
            verificationBonus: 0,
            averageRating: 0,
            ratingPoints: 0,
            reviewCount: 0,
            reviewCountBonus: 0,
            listingsCount: 0,
            completeListingsBonus: 0,
            activeListingsBonus: 0,
            premiumListingsBonus: 0,
            responseRate: 0,
            responseRatePoints: 0,
            profileCompleteness: 0,
            profilePoints: 0,
            accountAgeDays: 0,
            accountAgeBonus: 0,
            recentActivity: false,
            activityBonus: 0,
            totalScore: 0,
        };
        // 1. Verification Bonus (20 points)
        factors.isVerified = userData.isVerified === true;
        factors.verificationBonus = factors.isVerified ? 20 : 0;
        // 2. Review Rating (30 points)
        const reviewStats = await db.collection('reviewStats').doc(userId).get();
        if (reviewStats.exists) {
            const stats = reviewStats.data();
            factors.averageRating = stats.averageRating || 0;
            factors.reviewCount = stats.totalReviews || 0;
            // Rating points (5 stars = 30 points)
            factors.ratingPoints = Math.min(30, factors.averageRating * 6);
            // Review count bonus (0.5 per review, max 10 points)
            factors.reviewCountBonus = Math.min(10, factors.reviewCount * 0.5);
        }
        // 3. Listing Quality (15 points)
        const listingsSnapshot = await db
            .collection('cars')
            .where('sellerId', '==', userId)
            .get();
        factors.listingsCount = listingsSnapshot.size;
        if (factors.listingsCount > 0) {
            let completeCount = 0;
            let activeCount = 0;
            let premiumCount = 0;
            listingsSnapshot.forEach((doc) => {
                const listing = doc.data();
                // Complete listing check (80%+ fields filled)
                const completeness = calculateListingCompleteness(listing);
                if (completeness >= 0.8) {
                    completeCount++;
                }
                // Active check
                if (listing.status === 'active') {
                    activeCount++;
                }
                // Premium check
                if (listing.isPremium === true) {
                    premiumCount++;
                }
            });
            // 5 points if 80%+ listings are complete
            const completePercentage = completeCount / factors.listingsCount;
            factors.completeListingsBonus = completePercentage >= 0.8 ? 5 : 0;
            // 5 points if 5+ active listings
            factors.activeListingsBonus = activeCount >= 5 ? 5 : 0;
            // 5 points if 3+ premium listings
            factors.premiumListingsBonus = premiumCount >= 3 ? 5 : 0;
        }
        // 4. Response Rate (15 points)
        const analyticsDoc = await db.collection('userAnalytics').doc(userId).get();
        if (analyticsDoc.exists) {
            const analytics = analyticsDoc.data();
            factors.responseRate = analytics.inquiryResponseRate || 0;
            factors.responseRatePoints = Math.min(15, factors.responseRate * 15);
        }
        // 5. Profile Completeness (10 points)
        factors.profileCompleteness = calculateProfileCompleteness(userData);
        factors.profilePoints = factors.profileCompleteness * 10;
        // 6. Account Age (5 points)
        if (userData.createdAt) {
            const createdAt = userData.createdAt.toDate();
            const now = new Date();
            const ageDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            factors.accountAgeDays = ageDays;
            // 1 point per 6 months (180 days), max 5 points
            factors.accountAgeBonus = Math.min(5, Math.floor(ageDays / 180));
        }
        // 7. Recent Activity (5 points)
        if (userData.lastActivityAt) {
            const lastActivity = userData.lastActivityAt.toDate();
            const now = new Date();
            const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
            factors.recentActivity = daysSinceActivity <= 30;
            factors.activityBonus = factors.recentActivity ? 5 : 0;
        }
        // Calculate total score
        factors.totalScore = Math.min(100, factors.verificationBonus +
            factors.ratingPoints +
            factors.reviewCountBonus +
            factors.completeListingsBonus +
            factors.activeListingsBonus +
            factors.premiumListingsBonus +
            factors.responseRatePoints +
            factors.profilePoints +
            factors.accountAgeBonus +
            factors.activityBonus);
        // Determine level
        const level = getTrustLevel(factors.totalScore);
        const result = {
            userId,
            score: Math.round(factors.totalScore),
            factors,
            level,
            lastCalculated: new Date(),
        };
        logger.info('Trust score calculated', {
            userId,
            score: result.score,
            level: result.level,
        });
        return result;
    }
    catch (error) {
        logger.error('Failed to calculate trust score', { userId, error });
        throw error;
    }
}
/**
 * Calculate listing completeness (0-1)
 */
function calculateListingCompleteness(listing) {
    const requiredFields = [
        'make',
        'model',
        'year',
        'price',
        'mileage',
        'fuelType',
        'transmission',
        'condition',
        'description',
        'images',
        'location',
    ];
    let filledCount = 0;
    requiredFields.forEach((field) => {
        if (listing[field]) {
            if (Array.isArray(listing[field])) {
                if (listing[field].length > 0)
                    filledCount++;
            }
            else {
                filledCount++;
            }
        }
    });
    return filledCount / requiredFields.length;
}
/**
 * Calculate profile completeness (0-1)
 */
function calculateProfileCompleteness(userData) {
    const requiredFields = [
        'displayName',
        'email',
        'phoneNumber',
        'profileType',
        'location',
        'businessName',
        'description',
        'photoURL',
    ];
    let filledCount = 0;
    requiredFields.forEach((field) => {
        if (userData[field]) {
            filledCount++;
        }
    });
    return filledCount / requiredFields.length;
}
/**
 * Determine trust level based on score
 */
function getTrustLevel(score) {
    if (score >= 90)
        return 'elite';
    if (score >= 75)
        return 'expert';
    if (score >= 60)
        return 'advanced';
    if (score >= 40)
        return 'intermediate';
    return 'beginner';
}
/**
 * Get trust level badge info
 */
function getTrustBadge(level) {
    const badges = {
        beginner: {
            level: 'Beginner',
            minScore: 0,
            color: '#9E9E9E',
            icon: '🌱',
            description: 'New to the platform',
        },
        intermediate: {
            level: 'Intermediate',
            minScore: 40,
            color: '#2196F3',
            icon: '⭐',
            description: 'Growing reputation',
        },
        advanced: {
            level: 'Advanced',
            minScore: 60,
            color: '#9C27B0',
            icon: '💎',
            description: 'Trusted seller',
        },
        expert: {
            level: 'Expert',
            minScore: 75,
            color: '#FF9800',
            icon: '🏆',
            description: 'Highly trusted',
        },
        elite: {
            level: 'Elite',
            minScore: 90,
            color: '#FFD700',
            icon: '👑',
            description: 'Top-tier trusted',
        },
    };
    return badges[level] || badges.beginner;
}
//# sourceMappingURL=calculateScore.js.map
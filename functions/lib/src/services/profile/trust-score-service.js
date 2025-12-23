"use strict";
// src/services/profile/trust-score-service.ts
// Trust Score Service - نظام درجة الثقة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR
Object.defineProperty(exports, "__esModule", { value: true });
exports.BADGE_DEFINITIONS = exports.trustScoreService = exports.TrustScoreService = exports.TrustLevel = void 0;
const firestore_1 = require("firebase/firestore");
const firebase_config_1 = require("../../firebase/firebase-config");
const logger_service_1 = require("../logger-service");
// ==================== ENUMS & INTERFACES ====================
var TrustLevel;
(function (TrustLevel) {
    TrustLevel["UNVERIFIED"] = "unverified";
    TrustLevel["BASIC"] = "basic";
    TrustLevel["TRUSTED"] = "trusted";
    TrustLevel["VERIFIED"] = "verified";
    TrustLevel["PREMIUM"] = "premium"; // 81-100 points
})(TrustLevel = exports.TrustLevel || (exports.TrustLevel = {}));
// ==================== BADGE DEFINITIONS ====================
const BADGE_DEFINITIONS = {
    EMAIL_VERIFIED: {
        id: 'EMAIL_VERIFIED',
        name: 'Потвърден имейл',
        nameEn: 'Email Verified',
        icon: '✉️',
        type: 'verification'
    },
    PHONE_VERIFIED: {
        id: 'PHONE_VERIFIED',
        name: 'Потвърден телефон',
        nameEn: 'Phone Verified',
        icon: '📱',
        type: 'verification'
    },
    ID_VERIFIED: {
        id: 'ID_VERIFIED',
        name: 'Потвърдена самоличност',
        nameEn: 'ID Verified',
        icon: '🆔',
        type: 'verification'
    },
    TOP_SELLER: {
        id: 'TOP_SELLER',
        name: 'Топ Продавач',
        nameEn: 'Top Seller',
        icon: '⭐',
        type: 'achievement'
    },
    QUICK_RESPONDER: {
        id: 'QUICK_RESPONDER',
        name: 'Бърз Отговор',
        nameEn: 'Quick Responder',
        icon: '⚡',
        type: 'achievement'
    },
    FIVE_STAR: {
        id: 'FIVE_STAR',
        name: '5-Звезден',
        nameEn: '5-Star Seller',
        icon: '🌟',
        type: 'achievement'
    }
};
exports.BADGE_DEFINITIONS = BADGE_DEFINITIONS;
// ==================== SERVICE CLASS ====================
class TrustScoreService {
    constructor() { }
    static getInstance() {
        if (!TrustScoreService.instance) {
            TrustScoreService.instance = new TrustScoreService();
        }
        return TrustScoreService.instance;
    }
    // ==================== PUBLIC METHODS ====================
    /**
     * Calculate user trust score (0-100)
     * حساب درجة ثقة المستخدم
     */
    async calculateTrustScore(userId) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        try {
            // Get user data
            const userDoc = await (0, firestore_1.getDoc)((0, firestore_1.doc)(firebase_config_1.db, 'users', userId));
            if (!userDoc.exists()) {
                throw new Error('User not found');
            }
            const user = userDoc.data();
            let score = 0;
            // Email verified: +10 points
            if ((_b = (_a = user.verification) === null || _a === void 0 ? void 0 : _a.email) === null || _b === void 0 ? void 0 : _b.verified)
                score += 10;
            // Phone verified: +15 points
            if ((_d = (_c = user.verification) === null || _c === void 0 ? void 0 : _c.phone) === null || _d === void 0 ? void 0 : _d.verified)
                score += 15;
            // ID verified: +25 points
            if ((_f = (_e = user.verification) === null || _e === void 0 ? void 0 : _e.identity) === null || _f === void 0 ? void 0 : _f.verified)
                score += 25;
            // Business verified: +20 points
            if ((_h = (_g = user.verification) === null || _g === void 0 ? void 0 : _g.business) === null || _h === void 0 ? void 0 : _h.verified)
                score += 20;
            // Profile completion: +10 points
            score += this.calculateProfileScore(user);
            // Reviews: +15 points max
            score += this.calculateReviewScore(user);
            // Activity: +5 points
            score += this.calculateActivityScore(user);
            // Cap at 100
            score = Math.min(score, 100);
            // Update in Firestore
            await this.updateTrustScore(userId, score);
            logger_service_1.serviceLogger.info('Trust score calculated', { userId, score });
            return score;
        }
        catch (error) {
            logger_service_1.serviceLogger.error('Error calculating trust score', error, { userId });
            throw error;
        }
    }
    /**
     * Award badge to user
     * منح شارة للمستخدم
     */
    async awardBadge(userId, badgeId) {
        try {
            const badge = this.createBadge(badgeId);
            const currentBadges = await this.getUserBadges(userId);
            // Check if already has badge
            if (currentBadges.some(b => b.id === badgeId)) {
                logger_service_1.serviceLogger.debug('User already has badge', { userId, badgeId });
                return;
            }
            // Add new badge
            await (0, firestore_1.updateDoc)((0, firestore_1.doc)(firebase_config_1.db, 'users', userId), {
                'verification.badges': [...currentBadges, badge],
                updatedAt: (0, firestore_1.serverTimestamp)()
            });
            logger_service_1.serviceLogger.info('Badge awarded', { userId, badgeId, badgeName: badge.name });
        }
        catch (error) {
            logger_service_1.serviceLogger.error('Error awarding badge', error, { userId, badgeId });
            throw error;
        }
    }
    /**
     * Get trust level name
     * الحصول على اسم مستوى الثقة
     */
    getTrustLevelName(level, language = 'bg') {
        const names = {
            [TrustLevel.UNVERIFIED]: {
                bg: 'Непотвърден',
                en: 'Unverified'
            },
            [TrustLevel.BASIC]: {
                bg: 'Основен',
                en: 'Basic'
            },
            [TrustLevel.TRUSTED]: {
                bg: 'Доверен',
                en: 'Trusted'
            },
            [TrustLevel.VERIFIED]: {
                bg: 'Потвърден',
                en: 'Verified'
            },
            [TrustLevel.PREMIUM]: {
                bg: 'Премиум',
                en: 'Premium'
            }
        };
        return names[level][language];
    }
    // ==================== PRIVATE METHODS ====================
    /**
     * Calculate profile completion score
     * حساب نقاط اكتمال البروفايل
     */
    calculateProfileScore(user) {
        var _a, _b, _c, _d, _e, _f;
        let completed = 0;
        const total = 10;
        if (user.displayName)
            completed++;
        if (user.email)
            completed++;
        if (user.phoneNumber)
            completed++;
        if (user.bio)
            completed++;
        if (user.profileImage)
            completed++;
        if (user.coverImage)
            completed++;
        if ((_b = (_a = user.verification) === null || _a === void 0 ? void 0 : _a.email) === null || _b === void 0 ? void 0 : _b.verified)
            completed++;
        if ((_d = (_c = user.verification) === null || _c === void 0 ? void 0 : _c.phone) === null || _d === void 0 ? void 0 : _d.verified)
            completed++;
        if (((_e = user.stats) === null || _e === void 0 ? void 0 : _e.carsListed) > 0)
            completed++;
        if (((_f = user.reviews) === null || _f === void 0 ? void 0 : _f.total) > 0)
            completed++;
        return Math.floor((completed / total) * 10);
    }
    /**
     * Calculate review score
     * حساب نقاط التقييمات
     */
    calculateReviewScore(user) {
        var _a, _b;
        if (!((_a = user.reviews) === null || _a === void 0 ? void 0 : _a.average) || !((_b = user.reviews) === null || _b === void 0 ? void 0 : _b.total))
            return 0;
        // Need at least 3 reviews
        if (user.reviews.total < 3)
            return 0;
        // Calculate based on average (max 15 points)
        return Math.floor((user.reviews.average / 5) * 15);
    }
    /**
     * Calculate activity score
     * حساب نقاط النشاط
     */
    calculateActivityScore(user) {
        var _a, _b, _c;
        if (!((_a = user.stats) === null || _a === void 0 ? void 0 : _a.lastActive))
            return 0;
        const lastActive = ((_c = (_b = user.stats.lastActive).toDate) === null || _c === void 0 ? void 0 : _c.call(_b)) || new Date(user.stats.lastActive);
        const daysSinceActive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        // Active in last 7 days: +5 points
        return daysSinceActive <= 7 ? 5 : 0;
    }
    /**
     * Get trust level from score
     * الحصول على مستوى الثقة من النقاط
     */
    getTrustLevel(score) {
        if (score >= 81)
            return TrustLevel.PREMIUM;
        if (score >= 61)
            return TrustLevel.VERIFIED;
        if (score >= 41)
            return TrustLevel.TRUSTED;
        if (score >= 21)
            return TrustLevel.BASIC;
        return TrustLevel.UNVERIFIED;
    }
    /**
     * Update trust score in Firestore
     * تحديث درجة الثقة في Firestore
     */
    async updateTrustScore(userId, score) {
        await (0, firestore_1.updateDoc)((0, firestore_1.doc)(firebase_config_1.db, 'users', userId), {
            'verification.trustScore': score,
            'verification.level': this.getTrustLevel(score),
            updatedAt: (0, firestore_1.serverTimestamp)()
        });
    }
    /**
     * Get user badges
     * الحصول على شارات المستخدم
     */
    async getUserBadges(userId) {
        var _a, _b;
        const userDoc = await (0, firestore_1.getDoc)((0, firestore_1.doc)(firebase_config_1.db, 'users', userId));
        return ((_b = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.verification) === null || _b === void 0 ? void 0 : _b.badges) || [];
    }
    /**
     * Create badge object
     * إنشاء كائن الشارة
     */
    createBadge(badgeId) {
        const definition = BADGE_DEFINITIONS[badgeId];
        if (!definition) {
            throw new Error(`Badge not found: ${badgeId}`);
        }
        return Object.assign(Object.assign({}, definition), { earnedAt: new Date() });
    }
}
exports.TrustScoreService = TrustScoreService;
// Export singleton instance
exports.trustScoreService = TrustScoreService.getInstance();
//# sourceMappingURL=trust-score-service.js.map
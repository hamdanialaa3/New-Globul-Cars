"use strict";
// functions/src/verification/onVerificationApproved.ts
// Firestore Trigger: React to verification approval
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
exports.onVerificationApproved = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_2 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const db = (0, firestore_2.getFirestore)();
/**
 * Firestore Trigger: When verification request is approved
 *
 * Triggers on: verificationRequests/{requestId} update
 *
 * Actions:
 * 1. Detect status change to 'approved'
 * 2. Recalculate user trust score
 * 3. Update user badges
 * 4. Send follow-up email with next steps
 * 5. Log success metrics
 * 6. Create onboarding tasks
 */
exports.onVerificationApproved = (0, firestore_1.onDocumentUpdated)('verificationRequests/{requestId}', async (event) => {
    var _a, _b;
    const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    const requestId = event.params.requestId;
    // Only proceed if status changed to 'approved'
    if (!beforeData ||
        !afterData ||
        beforeData.status === 'approved' ||
        afterData.status !== 'approved') {
        return;
    }
    const userId = afterData.userId;
    const targetProfileType = afterData.targetProfileType;
    logger.info('Verification approved trigger started', {
        userId,
        requestId,
        profileType: targetProfileType
    });
    try {
        // 1. Get user document
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            logger.error('User not found after verification approval', { userId });
            return;
        }
        const userData = userDoc.data();
        // 2. Recalculate trust score
        const currentTrustScore = (userData === null || userData === void 0 ? void 0 : userData.trustScore) || 0;
        let newTrustScore = currentTrustScore;
        // Base verification bonus: +20
        newTrustScore += 20;
        // Additional bonuses based on profile type
        if (targetProfileType === 'company') {
            // Companies get higher trust score
            newTrustScore += 10;
        }
        // Bonus for complete profile
        if ((userData === null || userData === void 0 ? void 0 : userData.profileCompletePercentage) >= 80) {
            newTrustScore += 5;
        }
        logger.info('Trust score calculated', {
            userId,
            oldScore: currentTrustScore,
            newScore: newTrustScore
        });
        // 3. Update user badges
        const badges = (userData === null || userData === void 0 ? void 0 : userData.badges) || [];
        // Add verification badge
        if (!badges.includes('verified')) {
            badges.push('verified');
        }
        // Add profile type badge
        const profileTypeBadge = targetProfileType === 'dealer' ? 'dealer' : 'company';
        if (!badges.includes(profileTypeBadge)) {
            badges.push(profileTypeBadge);
        }
        // 4. Update user document with all changes
        await userRef.update({
            trustScore: newTrustScore,
            badges,
            'verification.trustScoreBonus': newTrustScore - currentTrustScore,
            updatedAt: firestore_2.FieldValue.serverTimestamp(),
        });
        logger.info('User badges and trust score updated', {
            userId,
            badges,
            trustScore: newTrustScore
        });
        // 5. Create onboarding tasks for new verified user
        const onboardingTasks = generateOnboardingTasks(targetProfileType);
        const onboardingRef = db.collection('users').doc(userId).collection('onboarding');
        for (const task of onboardingTasks) {
            await onboardingRef.add(Object.assign(Object.assign({}, task), { createdAt: firestore_2.FieldValue.serverTimestamp(), completed: false }));
        }
        logger.info('Onboarding tasks created', {
            userId,
            taskCount: onboardingTasks.length
        });
        // 6. Send follow-up email with next steps
        // Queue email in mail collection
        await db.collection('mail').add({
            to: userData === null || userData === void 0 ? void 0 : userData.email,
            template: {
                name: 'verification-approved-followup',
                data: {
                    displayName: (userData === null || userData === void 0 ? void 0 : userData.displayName) || 'User',
                    profileType: targetProfileType,
                    trustScore: newTrustScore,
                    badges,
                    nextSteps: onboardingTasks.map(t => t.title),
                },
            },
        });
        logger.info('Follow-up email queued', { userId });
        // 7. Log success metrics
        await db.collection('metrics').add({
            type: 'verification_completed',
            userId,
            profileType: targetProfileType,
            trustScoreIncrease: newTrustScore - currentTrustScore,
            timestamp: firestore_2.FieldValue.serverTimestamp(),
        });
        // 8. Update verification statistics
        await db.collection('statistics').doc('verifications').set({
            totalApproved: firestore_2.FieldValue.increment(1),
            [`approved_${targetProfileType}`]: firestore_2.FieldValue.increment(1),
            lastUpdated: firestore_2.FieldValue.serverTimestamp(),
        }, { merge: true });
        logger.info('Verification approval workflow completed successfully', {
            userId,
            requestId
        });
    }
    catch (error) {
        logger.error('Verification approval trigger failed', error, {
            userId,
            requestId,
        });
        // Don't throw - we don't want to retry this trigger
    }
});
/**
 * Generate onboarding tasks based on profile type
 *
 * @param profileType - The target profile type
 * @returns Array of onboarding tasks
 */
function generateOnboardingTasks(profileType) {
    const commonTasks = [
        {
            title: 'Complete Your Profile',
            description: 'Add logo, description, and business hours',
            priority: 1,
            category: 'profile',
        },
        {
            title: 'Post Your First Listing',
            description: 'List a car for sale on the marketplace',
            priority: 2,
            category: 'listings',
        },
        {
            title: 'Set Up Messaging',
            description: 'Configure auto-replies and response templates',
            priority: 3,
            category: 'communication',
        },
    ];
    const dealerTasks = [
        {
            title: 'Add Dealership Location',
            description: 'Set your physical location on the map',
            priority: 4,
            category: 'location',
        },
        {
            title: 'Configure Business Hours',
            description: 'Set when customers can visit your dealership',
            priority: 5,
            category: 'business',
        },
    ];
    const companyTasks = [
        {
            title: 'Add Team Members',
            description: 'Invite colleagues to manage your account',
            priority: 4,
            category: 'team',
        },
        {
            title: 'Set Up Departments',
            description: 'Organize your company structure',
            priority: 5,
            category: 'organization',
        },
        {
            title: 'Enable Advanced Analytics',
            description: 'Track performance across multiple locations',
            priority: 6,
            category: 'analytics',
        },
    ];
    return [
        ...commonTasks,
        ...(profileType === 'dealer' ? dealerTasks : companyTasks),
    ];
}
//# sourceMappingURL=onVerificationApproved.js.map
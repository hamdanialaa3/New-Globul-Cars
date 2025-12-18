// functions/src/verification/onVerificationApproved.ts
// Firestore Trigger: React to verification approval

import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';

const db = getFirestore();

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
export const onVerificationApproved = onDocumentUpdated(
  'verificationRequests/{requestId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    const requestId = event.params.requestId;

    // Only proceed if status changed to 'approved'
    if (
      !beforeData ||
      !afterData ||
      beforeData.status === 'approved' ||
      afterData.status !== 'approved'
    ) {
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
      const currentTrustScore = userData?.trustScore || 0;
      let newTrustScore = currentTrustScore;

      // Base verification bonus: +20
      newTrustScore += 20;

      // Additional bonuses based on profile type
      if (targetProfileType === 'company') {
        // Companies get higher trust score
        newTrustScore += 10;
      }

      // Bonus for complete profile
      if (userData?.profileCompletePercentage >= 80) {
        newTrustScore += 5;
      }

      logger.info('Trust score calculated', { 
        userId,
        oldScore: currentTrustScore,
        newScore: newTrustScore 
      });

      // 3. Update user badges
      const badges = userData?.badges || [];
      
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
        updatedAt: FieldValue.serverTimestamp(),
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
        await onboardingRef.add({
          ...task,
          createdAt: FieldValue.serverTimestamp(),
          completed: false,
        });
      }

      logger.info('Onboarding tasks created', { 
        userId,
        taskCount: onboardingTasks.length 
      });

      // 6. Send follow-up email with next steps
      // Queue email in mail collection
      await db.collection('mail').add({
        to: userData?.email,
        template: {
          name: 'verification-approved-followup',
          data: {
            displayName: userData?.displayName || 'User',
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
        timestamp: FieldValue.serverTimestamp(),
      });

      // 8. Update verification statistics
      await db.collection('statistics').doc('verifications').set(
        {
          totalApproved: FieldValue.increment(1),
          [`approved_${targetProfileType}`]: FieldValue.increment(1),
          lastUpdated: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      logger.info('Verification approval workflow completed successfully', { 
        userId,
        requestId 
      });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Verification approval trigger failed', { 
        error: err.message,
        userId,
        requestId,
      });
      // Don't throw - we don't want to retry this trigger
    }
  }
);

/**
 * Generate onboarding tasks based on profile type
 * 
 * @param profileType - The target profile type
 * @returns Array of onboarding tasks
 */
function generateOnboardingTasks(
  profileType: 'dealer' | 'company'
): Array<{
  title: string;
  description: string;
  priority: number;
  category: string;
}> {
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

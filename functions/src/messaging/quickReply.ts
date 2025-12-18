// functions/src/messaging/quickReply.ts
// Quick Reply Templates for Dealers/Companies

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import {
  CreateQuickReplyRequest,
  UpdateQuickReplyRequest,
  QuickReplyTemplate,
} from './types';

const db = getFirestore();

/**
 * Create a new quick reply template
 */
export const createQuickReply = onCall<CreateQuickReplyRequest>(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { title, content, category, language = 'bg' } = data;

  // Validation
  if (!title || !content || !category) {
    throw new HttpsError('invalid-argument', 'Title, content, and category are required');
  }

  if (title.length > 100) {
    throw new HttpsError('invalid-argument', 'Title must be 100 characters or less');
  }

  if (content.length > 1000) {
    throw new HttpsError('invalid-argument', 'Content must be 1000 characters or less');
  }

  const validCategories = ['greeting', 'pricing', 'availability', 'appointment', 'closing', 'custom'];
  if (!validCategories.includes(category)) {
    throw new HttpsError('invalid-argument', 'Invalid category');
  }

  try {
    // Get user profile to check if dealer/company
    const userDoc = await db.collection('users').doc(auth.uid).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    if (!['dealer', 'company'].includes(userData?.profileType)) {
      throw new HttpsError(
        'permission-denied',
        'Only dealers and companies can create quick reply templates'
      );
    }

    // Create template
    const templateRef = db.collection('quickReplyTemplates').doc();
    const template: QuickReplyTemplate = {
      id: templateRef.id,
      userId: auth.uid,
      title,
      content,
      category: category as any,
      language: language as any,
      isActive: true,
      usageCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await templateRef.set(template);

    // Log activity
    await db.collection('activities').add({
      userId: auth.uid,
      type: 'quick_reply_created',
      description: `Created quick reply template: ${title}`,
      metadata: { templateId: templateRef.id },
      timestamp: Timestamp.now(),
    });

    return {
      success: true,
      template,
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error creating quick reply:', err.message);
    throw new HttpsError('internal', err.message);
  }
});

/**
 * Get all quick reply templates for a user
 */
export const getQuickReplies = onCall(async (request) => {
  const { auth } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const templatesSnapshot = await db
      .collection('quickReplyTemplates')
      .where('userId', '==', auth.uid)
      .where('isActive', '==', true)
      .orderBy('usageCount', 'desc')
      .get();

    const templates = templatesSnapshot.docs.map((doc) => doc.data());

    return {
      success: true,
      templates,
      count: templates.length,
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error getting quick replies:', err.message);
    throw new HttpsError('internal', err.message);
  }
});

/**
 * Update a quick reply template
 */
export const updateQuickReply = onCall<UpdateQuickReplyRequest>(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { templateId, title, content, category, isActive } = data;

  if (!templateId) {
    throw new HttpsError('invalid-argument', 'Template ID is required');
  }

  try {
    const templateRef = db.collection('quickReplyTemplates').doc(templateId);
    const templateDoc = await templateRef.get();

    if (!templateDoc.exists) {
      throw new HttpsError('not-found', 'Template not found');
    }

    const templateData = templateDoc.data();
    if (templateData?.userId !== auth.uid) {
      throw new HttpsError('permission-denied', 'You can only update your own templates');
    }

    const updates: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    if (title !== undefined) {
      if (title.length > 100) {
        throw new HttpsError('invalid-argument', 'Title must be 100 characters or less');
      }
      updates.title = title;
    }

    if (content !== undefined) {
      if (content.length > 1000) {
        throw new HttpsError('invalid-argument', 'Content must be 1000 characters or less');
      }
      updates.content = content;
    }

    if (category !== undefined) {
      const validCategories = ['greeting', 'pricing', 'availability', 'appointment', 'closing', 'custom'];
      if (!validCategories.includes(category)) {
        throw new HttpsError('invalid-argument', 'Invalid category');
      }
      updates.category = category;
    }

    if (isActive !== undefined) {
      updates.isActive = isActive;
    }

    await templateRef.update(updates);

    // Log activity
    await db.collection('activities').add({
      userId: auth.uid,
      type: 'quick_reply_updated',
      description: `Updated quick reply template: ${title || templateData?.title}`,
      metadata: { templateId },
      timestamp: Timestamp.now(),
    });

    return {
      success: true,
      message: 'Template updated successfully',
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error updating quick reply:', err.message);
    throw new HttpsError('internal', err.message);
  }
});

/**
 * Delete a quick reply template
 */
export const deleteQuickReply = onCall<{ templateId: string }>(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { templateId } = data;

  if (!templateId) {
    throw new HttpsError('invalid-argument', 'Template ID is required');
  }

  try {
    const templateRef = db.collection('quickReplyTemplates').doc(templateId);
    const templateDoc = await templateRef.get();

    if (!templateDoc.exists) {
      throw new HttpsError('not-found', 'Template not found');
    }

    const templateData = templateDoc.data();
    if (templateData?.userId !== auth.uid) {
      throw new HttpsError('permission-denied', 'You can only delete your own templates');
    }

    // Soft delete by setting isActive to false
    await templateRef.update({
      isActive: false,
      updatedAt: Timestamp.now(),
    });

    // Log activity
    await db.collection('activities').add({
      userId: auth.uid,
      type: 'quick_reply_deleted',
      description: `Deleted quick reply template: ${templateData?.title}`,
      metadata: { templateId },
      timestamp: Timestamp.now(),
    });

    return {
      success: true,
      message: 'Template deleted successfully',
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error deleting quick reply:', err.message);
    throw new HttpsError('internal', err.message);
  }
});

/**
 * Use a quick reply template (increment usage count)
 */
export const useQuickReply = onCall<{ templateId: string }>(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { templateId } = data;

  if (!templateId) {
    throw new HttpsError('invalid-argument', 'Template ID is required');
  }

  try {
    const templateRef = db.collection('quickReplyTemplates').doc(templateId);
    const templateDoc = await templateRef.get();

    if (!templateDoc.exists) {
      throw new HttpsError('not-found', 'Template not found');
    }

    const templateData = templateDoc.data();
    if (templateData?.userId !== auth.uid) {
      throw new HttpsError('permission-denied', 'You can only use your own templates');
    }

    // Increment usage count
    await templateRef.update({
      usageCount: FieldValue.increment(1),
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      content: templateData?.content,
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error using quick reply:', err.message);
    throw new HttpsError('internal', err.message);
  }
});

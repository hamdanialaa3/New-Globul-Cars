"use strict";
// functions/src/messaging/quickReply.ts
// Quick Reply Templates for Dealers/Companies
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQuickReply = exports.deleteQuickReply = exports.updateQuickReply = exports.getQuickReplies = exports.createQuickReply = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
/**
 * Create a new quick reply template
 */
exports.createQuickReply = (0, https_1.onCall)(async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { title, content, category, language = 'bg' } = data;
    // Validation
    if (!title || !content || !category) {
        throw new https_1.HttpsError('invalid-argument', 'Title, content, and category are required');
    }
    if (title.length > 100) {
        throw new https_1.HttpsError('invalid-argument', 'Title must be 100 characters or less');
    }
    if (content.length > 1000) {
        throw new https_1.HttpsError('invalid-argument', 'Content must be 1000 characters or less');
    }
    const validCategories = ['greeting', 'pricing', 'availability', 'appointment', 'closing', 'custom'];
    if (!validCategories.includes(category)) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid category');
    }
    try {
        // Get user profile to check if dealer/company
        const userDoc = await db.collection('users').doc(auth.uid).get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError('not-found', 'User not found');
        }
        const userData = userDoc.data();
        if (!['dealer', 'company'].includes(userData === null || userData === void 0 ? void 0 : userData.profileType)) {
            throw new https_1.HttpsError('permission-denied', 'Only dealers and companies can create quick reply templates');
        }
        // Create template
        const templateRef = db.collection('quickReplyTemplates').doc();
        const template = {
            id: templateRef.id,
            userId: auth.uid,
            title,
            content,
            category: category,
            language: language,
            isActive: true,
            usageCount: 0,
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        };
        await templateRef.set(template);
        // Log activity
        await db.collection('activities').add({
            userId: auth.uid,
            type: 'quick_reply_created',
            description: `Created quick reply template: ${title}`,
            metadata: { templateId: templateRef.id },
            timestamp: firestore_1.Timestamp.now(),
        });
        return {
            success: true,
            template,
        };
    }
    catch (error) {
        console.error('Error creating quick reply:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
/**
 * Get all quick reply templates for a user
 */
exports.getQuickReplies = (0, https_1.onCall)(async (request) => {
    const { auth } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
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
    }
    catch (error) {
        console.error('Error getting quick replies:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
/**
 * Update a quick reply template
 */
exports.updateQuickReply = (0, https_1.onCall)(async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { templateId, title, content, category, isActive } = data;
    if (!templateId) {
        throw new https_1.HttpsError('invalid-argument', 'Template ID is required');
    }
    try {
        const templateRef = db.collection('quickReplyTemplates').doc(templateId);
        const templateDoc = await templateRef.get();
        if (!templateDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Template not found');
        }
        const templateData = templateDoc.data();
        if ((templateData === null || templateData === void 0 ? void 0 : templateData.userId) !== auth.uid) {
            throw new https_1.HttpsError('permission-denied', 'You can only update your own templates');
        }
        const updates = {
            updatedAt: firestore_1.Timestamp.now(),
        };
        if (title !== undefined) {
            if (title.length > 100) {
                throw new https_1.HttpsError('invalid-argument', 'Title must be 100 characters or less');
            }
            updates.title = title;
        }
        if (content !== undefined) {
            if (content.length > 1000) {
                throw new https_1.HttpsError('invalid-argument', 'Content must be 1000 characters or less');
            }
            updates.content = content;
        }
        if (category !== undefined) {
            const validCategories = ['greeting', 'pricing', 'availability', 'appointment', 'closing', 'custom'];
            if (!validCategories.includes(category)) {
                throw new https_1.HttpsError('invalid-argument', 'Invalid category');
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
            description: `Updated quick reply template: ${title || (templateData === null || templateData === void 0 ? void 0 : templateData.title)}`,
            metadata: { templateId },
            timestamp: firestore_1.Timestamp.now(),
        });
        return {
            success: true,
            message: 'Template updated successfully',
        };
    }
    catch (error) {
        console.error('Error updating quick reply:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
/**
 * Delete a quick reply template
 */
exports.deleteQuickReply = (0, https_1.onCall)(async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { templateId } = data;
    if (!templateId) {
        throw new https_1.HttpsError('invalid-argument', 'Template ID is required');
    }
    try {
        const templateRef = db.collection('quickReplyTemplates').doc(templateId);
        const templateDoc = await templateRef.get();
        if (!templateDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Template not found');
        }
        const templateData = templateDoc.data();
        if ((templateData === null || templateData === void 0 ? void 0 : templateData.userId) !== auth.uid) {
            throw new https_1.HttpsError('permission-denied', 'You can only delete your own templates');
        }
        // Soft delete by setting isActive to false
        await templateRef.update({
            isActive: false,
            updatedAt: firestore_1.Timestamp.now(),
        });
        // Log activity
        await db.collection('activities').add({
            userId: auth.uid,
            type: 'quick_reply_deleted',
            description: `Deleted quick reply template: ${templateData === null || templateData === void 0 ? void 0 : templateData.title}`,
            metadata: { templateId },
            timestamp: firestore_1.Timestamp.now(),
        });
        return {
            success: true,
            message: 'Template deleted successfully',
        };
    }
    catch (error) {
        console.error('Error deleting quick reply:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
/**
 * Use a quick reply template (increment usage count)
 */
exports.useQuickReply = (0, https_1.onCall)(async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { templateId } = data;
    if (!templateId) {
        throw new https_1.HttpsError('invalid-argument', 'Template ID is required');
    }
    try {
        const templateRef = db.collection('quickReplyTemplates').doc(templateId);
        const templateDoc = await templateRef.get();
        if (!templateDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Template not found');
        }
        const templateData = templateDoc.data();
        if ((templateData === null || templateData === void 0 ? void 0 : templateData.userId) !== auth.uid) {
            throw new https_1.HttpsError('permission-denied', 'You can only use your own templates');
        }
        // Increment usage count
        await templateRef.update({
            usageCount: firestore_1.FieldValue.increment(1),
            updatedAt: firestore_1.Timestamp.now(),
        });
        return {
            success: true,
            content: templateData === null || templateData === void 0 ? void 0 : templateData.content,
        };
    }
    catch (error) {
        console.error('Error using quick reply:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
//# sourceMappingURL=quickReply.js.map
"use strict";
// functions/src/messaging/leadScoring.ts
// Lead Scoring System for Dealers/Companies
Object.defineProperty(exports, "__esModule", { value: true });
exports.onConversationUpdate = exports.updateLeadStatus = exports.getLeads = exports.calculateLeadScore = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_2 = require("firebase-admin/firestore");
const db = (0, firestore_2.getFirestore)();
/**
 * Calculate lead score based on engagement and behavior
 * Max score: 100 points
 * - Engagement: 30 points (messages, questions, responses)
 * - Response time: 20 points (how quickly they respond)
 * - Seriousness: 25 points (quality of questions, mentioned budget)
 * - Budget: 25 points (mentioned price range, financing interest)
 */
function calculateScore(conversationData, messages) {
    var _a, _b;
    let engagement = 0;
    let responseTime = 0;
    let seriousness = 0;
    let budget = 0;
    // Engagement scoring (30 points)
    const messageCount = messages.length;
    if (messageCount >= 10)
        engagement = 30;
    else if (messageCount >= 7)
        engagement = 25;
    else if (messageCount >= 5)
        engagement = 20;
    else if (messageCount >= 3)
        engagement = 15;
    else if (messageCount >= 1)
        engagement = 10;
    // Count questions (more questions = more engaged)
    const questionCount = messages.filter((m) => { var _a; return (_a = m.content) === null || _a === void 0 ? void 0 : _a.includes('?'); }).length;
    if (questionCount >= 3)
        engagement = Math.min(30, engagement + 5);
    // Response time scoring (20 points)
    // Calculate average response time from buyer
    const buyerMessages = messages.filter((m) => m.senderId === conversationData.buyerId);
    if (buyerMessages.length > 1) {
        let totalResponseTime = 0;
        for (let i = 1; i < buyerMessages.length; i++) {
            const prevTime = ((_a = buyerMessages[i - 1].timestamp) === null || _a === void 0 ? void 0 : _a.toMillis()) || 0;
            const currentTime = ((_b = buyerMessages[i].timestamp) === null || _b === void 0 ? void 0 : _b.toMillis()) || 0;
            totalResponseTime += currentTime - prevTime;
        }
        const avgResponseTime = totalResponseTime / (buyerMessages.length - 1);
        const avgResponseHours = avgResponseTime / (1000 * 60 * 60);
        if (avgResponseHours < 1)
            responseTime = 20;
        else if (avgResponseHours < 6)
            responseTime = 15;
        else if (avgResponseHours < 24)
            responseTime = 10;
        else if (avgResponseHours < 48)
            responseTime = 5;
    }
    else if (buyerMessages.length === 1) {
        responseTime = 10; // New lead, no response data yet
    }
    // Seriousness scoring (25 points)
    const allContent = messages.map((m) => { var _a; return ((_a = m.content) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || ''; }).join(' ');
    // Check for serious keywords
    const seriousKeywords = [
        'купувам', 'buy', 'interested', 'интересувам', 'виждам', 'посещавам',
        'test drive', 'тест драйв', 'вижда', 'оглеждам', 'контракт', 'финансиране',
        'при мен', 'заплащане', 'payment', 'when', 'кога', 'документи', 'papers'
    ];
    let seriousKeywordCount = 0;
    seriousKeywords.forEach((keyword) => {
        if (allContent.includes(keyword))
            seriousKeywordCount++;
    });
    if (seriousKeywordCount >= 5)
        seriousness = 25;
    else if (seriousKeywordCount >= 3)
        seriousness = 20;
    else if (seriousKeywordCount >= 2)
        seriousness = 15;
    else if (seriousKeywordCount >= 1)
        seriousness = 10;
    // Check for specific questions about the car
    const specificQuestions = [
        'пробег', 'mileage', 'километри', 'произход', 'история',
        'service', 'сервиз', 'оборудване', 'equipment', 'произшествие',
        'accident', 'гаранция', 'warranty', 'регистрация', 'registration'
    ];
    let specificCount = 0;
    specificQuestions.forEach((keyword) => {
        if (allContent.includes(keyword))
            specificCount++;
    });
    if (specificCount >= 3)
        seriousness = Math.min(25, seriousness + 5);
    // Budget scoring (25 points)
    const budgetKeywords = [
        'цена', 'price', 'budget', 'бюджет', 'отстъпка', 'discount',
        'лв', 'лева', 'евро', 'euro', 'financing', 'финансиране',
        'лизинг', 'leasing', 'кредит', 'loan', 'заем'
    ];
    let budgetKeywordCount = 0;
    budgetKeywords.forEach((keyword) => {
        if (allContent.includes(keyword))
            budgetKeywordCount++;
    });
    if (budgetKeywordCount >= 4)
        budget = 25;
    else if (budgetKeywordCount >= 3)
        budget = 20;
    else if (budgetKeywordCount >= 2)
        budget = 15;
    else if (budgetKeywordCount >= 1)
        budget = 10;
    // Check for specific price mentions
    const priceRegex = /\d{4,6}\s*(лв|лева|евро|euro)/gi;
    if (priceRegex.test(allContent)) {
        budget = Math.min(25, budget + 5);
    }
    // Calculate total score
    const totalScore = engagement + responseTime + seriousness + budget;
    // Determine priority
    let priority;
    if (totalScore >= 70)
        priority = 'hot';
    else if (totalScore >= 40)
        priority = 'warm';
    else
        priority = 'cold';
    return {
        score: totalScore,
        breakdown: {
            engagement,
            responseTime,
            seriousness,
            budget,
        },
        priority,
    };
}
/**
 * Calculate lead score for a conversation
 */
exports.calculateLeadScore = (0, https_1.onCall)(async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { conversationId } = data;
    if (!conversationId) {
        throw new https_1.HttpsError('invalid-argument', 'Conversation ID is required');
    }
    try {
        // Get conversation
        const conversationDoc = await db.collection('conversations').doc(conversationId).get();
        if (!conversationDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Conversation not found');
        }
        const conversationData = conversationDoc.data();
        // Check permission
        if ((conversationData === null || conversationData === void 0 ? void 0 : conversationData.sellerId) !== auth.uid) {
            throw new https_1.HttpsError('permission-denied', 'You can only score your own leads');
        }
        // Get all messages in conversation
        const messagesSnapshot = await db
            .collection('messages')
            .where('conversationId', '==', conversationId)
            .orderBy('timestamp', 'asc')
            .get();
        const messages = messagesSnapshot.docs.map((doc) => doc.data());
        // Calculate score
        const { score, breakdown, priority } = calculateScore(conversationData, messages);
        // Get or create lead
        const leadsSnapshot = await db
            .collection('leads')
            .where('conversationId', '==', conversationId)
            .limit(1)
            .get();
        let leadRef;
        if (leadsSnapshot.empty) {
            // Create new lead
            leadRef = db.collection('leads').doc();
            const lead = {
                id: leadRef.id,
                conversationId,
                buyerId: (conversationData === null || conversationData === void 0 ? void 0 : conversationData.buyerId) || '',
                buyerName: (conversationData === null || conversationData === void 0 ? void 0 : conversationData.buyerName) || 'Unknown',
                buyerEmail: conversationData === null || conversationData === void 0 ? void 0 : conversationData.buyerEmail,
                buyerPhone: conversationData === null || conversationData === void 0 ? void 0 : conversationData.buyerPhone,
                listingId: conversationData === null || conversationData === void 0 ? void 0 : conversationData.listingId,
                listingTitle: conversationData === null || conversationData === void 0 ? void 0 : conversationData.listingTitle,
                score,
                scoreBreakdown: breakdown,
                status: 'new',
                priority,
                notes: [],
                lastContactAt: (conversationData === null || conversationData === void 0 ? void 0 : conversationData.lastMessageAt) || firestore_2.Timestamp.now(),
                createdAt: firestore_2.Timestamp.now(),
                updatedAt: firestore_2.Timestamp.now(),
            };
            await leadRef.set(lead);
        }
        else {
            // Update existing lead
            leadRef = leadsSnapshot.docs[0].ref;
            await leadRef.update({
                score,
                scoreBreakdown: breakdown,
                priority,
                updatedAt: firestore_2.Timestamp.now(),
            });
        }
        return {
            success: true,
            score,
            breakdown,
            priority,
            leadId: leadRef.id,
        };
    }
    catch (error) {
        console.error('Error calculating lead score:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
/**
 * Get all leads for a dealer/company
 */
exports.getLeads = (0, https_1.onCall)(async (request) => {
    const { auth } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    try {
        // Get all conversations for this user
        const conversationsSnapshot = await db
            .collection('conversations')
            .where('sellerId', '==', auth.uid)
            .get();
        const conversationIds = conversationsSnapshot.docs.map((doc) => doc.id);
        if (conversationIds.length === 0) {
            return {
                success: true,
                leads: [],
                stats: { total: 0, hot: 0, warm: 0, cold: 0 },
            };
        }
        // Get leads for these conversations
        // Firestore 'in' query limit is 10, so we need to batch
        const leads = [];
        for (let i = 0; i < conversationIds.length; i += 10) {
            const batch = conversationIds.slice(i, i + 10);
            const leadsSnapshot = await db
                .collection('leads')
                .where('conversationId', 'in', batch)
                .get();
            leadsSnapshot.docs.forEach((doc) => leads.push(doc.data()));
        }
        // Sort by score descending
        leads.sort((a, b) => b.score - a.score);
        // Calculate stats
        const stats = {
            total: leads.length,
            hot: leads.filter((l) => l.priority === 'hot').length,
            warm: leads.filter((l) => l.priority === 'warm').length,
            cold: leads.filter((l) => l.priority === 'cold').length,
        };
        return {
            success: true,
            leads,
            stats,
        };
    }
    catch (error) {
        console.error('Error getting leads:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
/**
 * Update lead status
 */
exports.updateLeadStatus = (0, https_1.onCall)(async (request) => {
    var _a;
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { leadId, status, notes } = data;
    if (!leadId || !status) {
        throw new https_1.HttpsError('invalid-argument', 'Lead ID and status are required');
    }
    const validStatuses = ['new', 'contacted', 'qualified', 'negotiating', 'won', 'lost'];
    if (!validStatuses.includes(status)) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid status');
    }
    try {
        const leadRef = db.collection('leads').doc(leadId);
        const leadDoc = await leadRef.get();
        if (!leadDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Lead not found');
        }
        const leadData = leadDoc.data();
        // Check permission via conversation
        const conversationDoc = await db.collection('conversations').doc(leadData === null || leadData === void 0 ? void 0 : leadData.conversationId).get();
        if (((_a = conversationDoc.data()) === null || _a === void 0 ? void 0 : _a.sellerId) !== auth.uid) {
            throw new https_1.HttpsError('permission-denied', 'You can only update your own leads');
        }
        const updates = {
            status,
            updatedAt: firestore_2.Timestamp.now(),
        };
        if (notes) {
            updates.notes = [...((leadData === null || leadData === void 0 ? void 0 : leadData.notes) || []), notes];
        }
        await leadRef.update(updates);
        // Log activity
        await db.collection('activities').add({
            userId: auth.uid,
            type: 'lead_status_updated',
            description: `Updated lead status to: ${status}`,
            metadata: { leadId, status },
            timestamp: firestore_2.Timestamp.now(),
        });
        return {
            success: true,
            message: 'Lead status updated successfully',
        };
    }
    catch (error) {
        console.error('Error updating lead status:', error);
        throw new https_1.HttpsError('internal', error.message);
    }
});
/**
 * Auto-calculate lead score when conversation is updated
 */
exports.onConversationUpdate = (0, firestore_1.onDocumentWritten)('conversations/{conversationId}', async (event) => {
    var _a;
    const conversationData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after.data();
    if (!conversationData)
        return;
    const conversationId = event.params.conversationId;
    try {
        // Get all messages
        const messagesSnapshot = await db
            .collection('messages')
            .where('conversationId', '==', conversationId)
            .orderBy('timestamp', 'asc')
            .get();
        const messages = messagesSnapshot.docs.map((doc) => doc.data());
        if (messages.length === 0)
            return;
        // Calculate score
        const { score, breakdown, priority } = calculateScore(conversationData, messages);
        // Update or create lead
        const leadsSnapshot = await db
            .collection('leads')
            .where('conversationId', '==', conversationId)
            .limit(1)
            .get();
        if (leadsSnapshot.empty) {
            // Create new lead
            const leadRef = db.collection('leads').doc();
            const lead = {
                id: leadRef.id,
                conversationId,
                buyerId: conversationData.buyerId || '',
                buyerName: conversationData.buyerName || 'Unknown',
                buyerEmail: conversationData.buyerEmail,
                buyerPhone: conversationData.buyerPhone,
                listingId: conversationData.listingId,
                listingTitle: conversationData.listingTitle,
                score,
                scoreBreakdown: breakdown,
                status: 'new',
                priority,
                notes: [],
                lastContactAt: conversationData.lastMessageAt || firestore_2.Timestamp.now(),
                createdAt: firestore_2.Timestamp.now(),
                updatedAt: firestore_2.Timestamp.now(),
            };
            await leadRef.set(lead);
        }
        else {
            // Update existing lead
            await leadsSnapshot.docs[0].ref.update({
                score,
                scoreBreakdown: breakdown,
                priority,
                lastContactAt: conversationData.lastMessageAt,
                updatedAt: firestore_2.Timestamp.now(),
            });
        }
        console.log(`Lead score updated for conversation ${conversationId}: ${score} (${priority})`);
    }
    catch (error) {
        console.error('Error auto-calculating lead score:', error);
    }
});
//# sourceMappingURL=leadScoring.js.map
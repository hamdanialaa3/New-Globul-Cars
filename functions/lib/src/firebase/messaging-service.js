"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulgarianMessagingService = exports.BulgarianMessagingService = void 0;
const logger_service_1 = require("../services/logger-service");
// src/firebase/messaging-service.ts
// Bulgarian Messaging Service for Car Marketplace
const firestore_1 = require("firebase/firestore");
const firebase_config_1 = require("./firebase-config");
// Bulgarian Messaging Service
class BulgarianMessagingService {
    constructor() {
        this.listeners = new Map();
    }
    static getInstance() {
        if (!BulgarianMessagingService.instance) {
            BulgarianMessagingService.instance = new BulgarianMessagingService();
        }
        return BulgarianMessagingService.instance;
    }
    // Send a message
    async sendMessage(messageData) {
        try {
            // Validate message content
            if (!this.validateMessageContent(messageData.content)) {
                throw new Error('Съдържанието на съобщението е невалидно или твърде дълго');
            }
            // Sanitize content
            const sanitizedContent = firebase_config_1.BulgarianFirebaseUtils.sanitizeBulgarianText(messageData.content);
            // Create message object
            const message = Object.assign(Object.assign({}, messageData), { content: sanitizedContent, isRead: false, isArchived: false, createdAt: new Date(), updatedAt: new Date() });
            // Add to Firestore
            const docRef = await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_config_1.db, 'messages'), Object.assign(Object.assign({}, message), { createdAt: firestore_1.Timestamp.fromDate(message.createdAt), updatedAt: firestore_1.Timestamp.fromDate(message.updatedAt) }));
            // Update chat room
            await this.updateChatRoom(messageData.carId, messageData.senderId, messageData.recipientId, message, docRef.id);
            // Send notification (if enabled)
            await this.sendMessageNotification(messageData.recipientId, message);
            return docRef.id;
        }
        catch (error) {
            throw this.handleMessagingError(error);
        }
    }
    // Send car inquiry
    async sendCarInquiry(carId, senderId, senderName, senderEmail, recipientId, recipientName, recipientEmail, inquiryType, content, offerAmount) {
        const messageData = {
            carId,
            senderId,
            senderName,
            senderEmail,
            recipientId,
            recipientName,
            recipientEmail,
            type: inquiryType,
            subject: inquiryType === 'question' ? 'Запитване за автомобил' : 'Оферта за автомобил',
            content,
            language: 'bg',
            metadata: offerAmount ? { offerAmount } : undefined
        };
        return this.sendMessage(messageData);
    }
    // Send review
    async sendReview(carId, senderId, senderName, senderEmail, recipientId, recipientName, recipientEmail, rating, review) {
        const messageData = {
            carId,
            senderId,
            senderName,
            senderEmail,
            recipientId,
            recipientName,
            recipientEmail,
            type: 'review',
            subject: 'Отзив за автомобил',
            content: review,
            language: 'bg',
            metadata: { rating }
        };
        return this.sendMessage(messageData);
    }
    // Get messages for user
    async getUserMessages(userId, options) {
        try {
            let q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, 'messages'), (0, firestore_1.where)('recipientId', '==', userId), (0, firestore_1.orderBy)('createdAt', 'desc'));
            if (options === null || options === void 0 ? void 0 : options.type) {
                q = (0, firestore_1.query)(q, (0, firestore_1.where)('type', '==', options.type));
            }
            if (options === null || options === void 0 ? void 0 : options.limit) {
                q = (0, firestore_1.query)(q, (0, firestore_1.limit)(options.limit));
            }
            const querySnapshot = await (0, firestore_1.getDocs)(q);
            const messages = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                messages.push(Object.assign(Object.assign({ id: doc.id }, data), { createdAt: data.createdAt.toDate(), updatedAt: data.updatedAt.toDate() }));
            });
            return messages;
        }
        catch (error) {
            throw this.handleMessagingError(error);
        }
    }
    // Get chat room messages
    async getChatRoomMessages(carId, userId, otherUserId) {
        try {
            const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, 'messages'), (0, firestore_1.where)('carId', '==', carId), (0, firestore_1.where)('senderId', 'in', [userId, otherUserId]), (0, firestore_1.where)('recipientId', 'in', [userId, otherUserId]), (0, firestore_1.orderBy)('createdAt', 'asc'));
            const querySnapshot = await (0, firestore_1.getDocs)(q);
            const messages = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                messages.push(Object.assign(Object.assign({ id: doc.id }, data), { createdAt: data.createdAt.toDate(), updatedAt: data.updatedAt.toDate() }));
            });
            return messages;
        }
        catch (error) {
            throw this.handleMessagingError(error);
        }
    }
    // Mark message as read
    async markMessageAsRead(messageId, userId) {
        try {
            const messageRef = (0, firestore_1.doc)(firebase_config_1.db, 'messages', messageId);
            const messageDoc = await (0, firestore_1.getDoc)(messageRef);
            if (!messageDoc.exists()) {
                throw new Error('Съобщението не е намерено');
            }
            const message = messageDoc.data();
            // Only recipient can mark as read
            if (message.recipientId !== userId) {
                throw new Error('Нямате права да маркирате това съобщение като прочетено');
            }
            await (0, firestore_1.updateDoc)(messageRef, {
                isRead: true,
                updatedAt: firestore_1.Timestamp.fromDate(new Date())
            });
            // Update chat room unread count
            await this.updateChatRoomUnreadCount(message.carId, message.senderId, message.recipientId);
        }
        catch (error) {
            throw this.handleMessagingError(error);
        }
    }
    // Archive message
    async archiveMessage(messageId, userId) {
        try {
            const messageRef = (0, firestore_1.doc)(firebase_config_1.db, 'messages', messageId);
            const messageDoc = await (0, firestore_1.getDoc)(messageRef);
            if (!messageDoc.exists()) {
                throw new Error('Съобщението не е намерено');
            }
            const message = messageDoc.data();
            // Only recipient can archive
            if (message.recipientId !== userId) {
                throw new Error('Нямате права да архивирате това съобщение');
            }
            await (0, firestore_1.updateDoc)(messageRef, {
                isArchived: true,
                updatedAt: firestore_1.Timestamp.fromDate(new Date())
            });
        }
        catch (error) {
            throw this.handleMessagingError(error);
        }
    }
    // Delete message
    async deleteMessage(messageId, userId) {
        try {
            const messageRef = (0, firestore_1.doc)(firebase_config_1.db, 'messages', messageId);
            const messageDoc = await (0, firestore_1.getDoc)(messageRef);
            if (!messageDoc.exists()) {
                throw new Error('Съобщението не е намерено');
            }
            const message = messageDoc.data();
            // Only sender or recipient can delete
            if (message.senderId !== userId && message.recipientId !== userId) {
                throw new Error('Нямате права да изтриете това съобщение');
            }
            await (0, firestore_1.deleteDoc)(messageRef);
        }
        catch (error) {
            throw this.handleMessagingError(error);
        }
    }
    // Get unread message count
    async getUnreadMessageCount(userId) {
        try {
            const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, 'messages'), (0, firestore_1.where)('recipientId', '==', userId), (0, firestore_1.where)('isRead', '==', false), (0, firestore_1.where)('isArchived', '==', false));
            const querySnapshot = await (0, firestore_1.getDocs)(q);
            return querySnapshot.size;
        }
        catch (error) {
            throw this.handleMessagingError(error);
        }
    }
    // Listen to new messages
    listenToNewMessages(userId, callback) {
        // ✅ FIX: Guard against null/undefined userId BEFORE constructing query
        if (!userId) {
            logger_service_1.logger.warn('listenToNewMessages called with null/undefined userId - returning no-op unsubscribe');
            return () => { }; // Return no-op unsubscribe function
        }
        const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, 'messages'), (0, firestore_1.where)('recipientId', '==', userId), (0, firestore_1.where)('isArchived', '==', false), (0, firestore_1.orderBy)('createdAt', 'desc'), (0, firestore_1.limit)(1));
        const unsubscribe = (0, firestore_1.onSnapshot)(q, (querySnapshot) => {
            querySnapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    const message = Object.assign(Object.assign({ id: change.doc.id }, data), { createdAt: data.createdAt.toDate(), updatedAt: data.updatedAt.toDate() });
                    callback(message);
                }
            });
        });
        this.listeners.set(`messages_${userId}`, unsubscribe);
        return unsubscribe;
    }
    // Stop listening to messages
    stopListening(userId) {
        const listenerKey = `messages_${userId}`;
        const unsubscribe = this.listeners.get(listenerKey);
        if (unsubscribe) {
            unsubscribe();
            this.listeners.delete(listenerKey);
        }
    }
    // Private helper methods
    async updateChatRoom(carId, senderId, recipientId, message, messageId) {
        var _a, _b;
        try {
            const chatRoomId = this.generateChatRoomId(carId, senderId, recipientId);
            const chatRoomRef = (0, firestore_1.doc)(firebase_config_1.db, 'chatRooms', chatRoomId);
            const chatRoomDoc = await (0, firestore_1.getDoc)(chatRoomRef);
            if (chatRoomDoc.exists()) {
                // Update existing chat room
                const updateData = {
                    lastMessage: Object.assign(Object.assign({}, message), { id: messageId }),
                    updatedAt: firestore_1.Timestamp.fromDate(new Date())
                };
                updateData[`unreadCount.${recipientId}`] = (((_b = (_a = chatRoomDoc.data()) === null || _a === void 0 ? void 0 : _a.unreadCount) === null || _b === void 0 ? void 0 : _b[recipientId]) || 0) + 1;
                await (0, firestore_1.updateDoc)(chatRoomRef, updateData);
            }
            else {
                // Create new chat room
                const chatRoom = {
                    carId,
                    participants: [senderId, recipientId],
                    participantNames: [message.senderName, message.recipientName],
                    lastMessage: Object.assign(Object.assign({}, message), { id: messageId }),
                    unreadCount: { [recipientId]: 1 },
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_config_1.db, 'chatRooms'), Object.assign(Object.assign({}, chatRoom), { createdAt: firestore_1.Timestamp.fromDate(chatRoom.createdAt), updatedAt: firestore_1.Timestamp.fromDate(chatRoom.updatedAt) }));
            }
        }
        catch (error) {
            const { logger } = await Promise.resolve().then(() => require('../services/logger-service'));
            logger.error('Error updating chat room', error);
        }
    }
    async updateChatRoomUnreadCount(carId, senderId, recipientId) {
        var _a, _b;
        try {
            const chatRoomId = this.generateChatRoomId(carId, senderId, recipientId);
            const chatRoomRef = (0, firestore_1.doc)(firebase_config_1.db, 'chatRooms', chatRoomId);
            const chatRoomDoc = await (0, firestore_1.getDoc)(chatRoomRef);
            if (chatRoomDoc.exists()) {
                const currentUnreadCount = ((_b = (_a = chatRoomDoc.data()) === null || _a === void 0 ? void 0 : _a.unreadCount) === null || _b === void 0 ? void 0 : _b[recipientId]) || 0;
                const updateData = {
                    updatedAt: firestore_1.Timestamp.fromDate(new Date())
                };
                updateData[`unreadCount.${recipientId}`] = Math.max(0, currentUnreadCount - 1);
                await (0, firestore_1.updateDoc)(chatRoomRef, updateData);
            }
        }
        catch (error) {
            const { logger } = await Promise.resolve().then(() => require('../services/logger-service'));
            logger.error('Error updating unread count', error);
        }
    }
    async sendMessageNotification(recipientId, message) {
        // This would integrate with Firebase Cloud Messaging for push notifications
        // For now, we'll just log it
        try {
            const { logger } = await Promise.resolve().then(() => require('../services/logger-service'));
            if (process.env.NODE_ENV === 'development') {
                logger.debug('Notification sent', { recipientId, senderName: message.senderName });
            }
        }
        catch (_a) { }
    }
    generateChatRoomId(carId, userId1, userId2) {
        const sortedIds = [userId1, userId2].sort();
        return `${carId}_${sortedIds[0]}_${sortedIds[1]}`;
    }
    validateMessageContent(content) {
        return content.length > 0 && content.length <= 2000;
    }
    handleMessagingError(error) {
        const errorMessages = {
            'permission-denied': 'Нямате права за достъп до това съобщение',
            'not-found': 'Съобщението не е намерено',
            'invalid-argument': 'Невалидни данни за съобщението',
            'resource-exhausted': 'Твърде много заявки. Моля опитайте по-късно',
            'internal': 'Вътрешна грешка в системата'
        };
        const bulgarianMessage = errorMessages[error.code] || 'Възникна грешка при обработката на съобщението';
        return new Error(bulgarianMessage);
    }
    // Cleanup listeners on service destruction
    destroy() {
        this.listeners.forEach((unsubscribe) => unsubscribe());
        this.listeners.clear();
    }
}
exports.BulgarianMessagingService = BulgarianMessagingService;
// Export singleton instance
exports.bulgarianMessagingService = BulgarianMessagingService.getInstance();
//# sourceMappingURL=messaging-service.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageNotificationEmail = exports.sendPaymentReceiptEmail = exports.sendAdStatusEmail = exports.sendWelcomeEmail = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const email_service_1 = require("../services/email.service");
const db = admin.firestore();
// 1. Welcome Email (on User Create)
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
    const email = user.email;
    const name = user.displayName || 'User';
    if (!email) {
        console.log('No email for user', user.uid);
        return;
    }
    await email_service_1.emailService.sendEmail({
        to: email,
        subject: 'Welcome to Koli One! 🚗',
        template: 'welcome',
        data: { name }
    });
});
// 2. Ad Status Update (Approved/Rejected)
exports.sendAdStatusEmail = functions.firestore
    .document('cars/{carId}')
    .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    // Only send if status changed
    if (newData.status === oldData.status)
        return;
    // Get seller email
    const sellerId = newData.sellerId;
    const userDoc = await db.collection('users').doc(sellerId).get();
    const userData = userDoc.data();
    if (!userData || !userData.email)
        return;
    if (newData.status === 'active' && oldData.status === 'pending') {
        await email_service_1.emailService.sendEmail({
            to: userData.email,
            subject: 'Your ad is live! 🟢',
            template: 'adApproved',
            data: {
                name: userData.firstName || 'Seller',
                brand: newData.brand,
                model: newData.model,
                id: context.params.carId
            }
        });
    }
    else if (newData.status === 'rejected') {
        await email_service_1.emailService.sendEmail({
            to: userData.email,
            subject: 'Action Required: Ad Rejected 🔴',
            template: 'adRejected',
            data: {
                name: userData.firstName || 'Seller',
                brand: newData.brand,
                model: newData.model,
                reason: newData.rejectionReason
            }
        });
    }
});
// 3. Payment Receipt
exports.sendPaymentReceiptEmail = functions.firestore
    .document('payments/{paymentId}')
    .onCreate(async (snap, context) => {
    const payment = snap.data();
    if (payment.status !== 'succeeded')
        return;
    const userId = payment.userId;
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    if (!userData || !userData.email)
        return;
    await email_service_1.emailService.sendEmail({
        to: userData.email,
        subject: 'Payment Receipt - Koli One',
        template: 'paymentReceipt',
        data: {
            name: userData.firstName || 'Subscriber',
            amount: payment.amount,
            invoiceId: payment.invoiceId
        }
    });
});
// 4. New Message Notification (Throttled)
// Optimization: We should probably only send this if user is offline or hasn't read it
exports.sendMessageNotificationEmail = functions.firestore
    .document('messages/{msgId}')
    .onCreate(async (snap, context) => {
    var _a;
    const message = snap.data();
    const recipientId = message.recipientId;
    const userDoc = await db.collection('users').doc(recipientId).get();
    const userData = userDoc.data();
    // Check if user has email notifications enabled (default true)
    if (!userData || !userData.email || userData.emailNotifications === false)
        return;
    // Check last notification time to avoid spam
    const lastNotif = (_a = userData.lastEmailNotification) === null || _a === void 0 ? void 0 : _a.toDate();
    const now = new Date();
    // Cooldown: 15 minutes
    if (lastNotif && (now.getTime() - lastNotif.getTime() < 15 * 60 * 1000)) {
        console.log('Skipping email notification due to cooldown');
        return;
    }
    await email_service_1.emailService.sendEmail({
        to: userData.email,
        subject: 'New Message on Koli One 💬',
        template: 'newMessage',
        data: {
            senderName: 'A User',
            preview: message.text.substring(0, 100) + '...',
        }
    });
    // Update last notification time
    await db.collection('users').doc(recipientId).update({
        lastEmailNotification: admin.firestore.FieldValue.serverTimestamp()
    });
});
//# sourceMappingURL=email-triggers.js.map
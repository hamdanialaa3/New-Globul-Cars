"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAdminNotification = sendAdminNotification;
async function sendAdminNotification(payload) {
    // Simple console log for now, can be upgraded to SendGrid / Slack
    console.log('🔔 [ADMIN ALERT]', JSON.stringify(payload, null, 2));
}

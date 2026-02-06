export async function sendAdminNotification(payload: any) {
    // Simple console log for now, can be upgraded to SendGrid / Slack
    console.log('🔔 [ADMIN ALERT]', JSON.stringify(payload, null, 2));
}

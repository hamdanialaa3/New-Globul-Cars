/**
 * Monitoring Alert Webhook
 * Receives alerts from Sentry, UptimeRobot, etc.
 * Logs to Firestore + Sends notifications
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// Note: nodemailer removed - using SendGrid instead

const db = admin.firestore();

interface Alert {
  source: 'sentry' | 'uptimerobot' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  url?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Webhook endpoint for monitoring alerts
 */
export const monitoringAlertWebhook = functions
  .region('europe-west1')
  .https
  .onRequest(async (req, res) => {
    // Verify webhook secret
    const secret = req.headers['x-webhook-secret'];
    const expectedSecret = functions.config().monitoring?.webhook_secret || process.env.MONITORING_WEBHOOK_SECRET;
    
    if (secret !== expectedSecret) {
      console.warn('⚠️ Invalid webhook secret');
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }
    
    try {
      const alertData: Alert = req.body;
      
      // Log alert to Firestore
      const alertRef = await db.collection('monitoring_alerts').add({
        ...alertData,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        acknowledged: false,
      });
      
      console.log(`✅ Alert logged: ${alertRef.id}`);
      
      // Send notifications based on severity
      if (alertData.severity === 'critical' || alertData.severity === 'high') {
        await sendAlertNotifications(alertData);
      }
      
      res.status(200).send({
        success: true,
        alertId: alertRef.id,
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Webhook error:', err.message);
      res.status(500).send({ error: err.message });
    }
  });

/**
 * Send alert notifications (Email + Slack)
 */
async function sendAlertNotifications(alert: Alert) {
  try {
    // Send email to admin
    await sendEmailAlert(alert);
    
    // Send Slack notification
    await sendSlackAlert(alert);
  } catch (error) {
    console.error('Failed to send notifications:', error);
  }
}

/**
 * Send email alert via SendGrid
 */
async function sendEmailAlert(alert: Alert) {
  const sgMail = require('@sendgrid/mail');
  const apiKey = functions.config().sendgrid?.api_key || process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.warn('SendGrid not configured, skipping email');
    return;
  }
  
  sgMail.setApiKey(apiKey);
  
  const msg = {
    to: 'admin@globulcars.bg',
    from: 'alerts@globulcars.bg',
    subject: `🚨 ${alert.severity.toUpperCase()}: ${alert.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: ${getSeverityColor(alert.severity)}">
          ${alert.severity.toUpperCase()} Alert
        </h2>
        
        <h3>${alert.title}</h3>
        <p>${alert.message}</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Source:</strong> ${alert.source}</p>
          <p><strong>Severity:</strong> ${alert.severity}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString('bg-BG')}</p>
          ${alert.url ? `<p><strong>URL:</strong> <a href="${alert.url}">${alert.url}</a></p>` : ''}
        </div>
        
        ${alert.metadata ? `
          <h4>Additional Details:</h4>
          <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">
${JSON.stringify(alert.metadata, null, 2)}
          </pre>
        ` : ''}
        
        <p style="margin-top: 20px;">
          <a href="https://globulcars.bg/admin/monitoring" 
             style="background: #FF8F10; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Monitoring Dashboard
          </a>
        </p>
      </div>
    `,
  };
  
  await sgMail.send(msg);
  console.log('✅ Email alert sent');
}

/**
 * Send Slack notification
 */
async function sendSlackAlert(alert: Alert) {
  const webhookUrl = functions.config().slack?.webhook_url || process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('Slack webhook not configured, skipping notification');
    return;
  }
  
  const fetch = (await import('node-fetch')).default;
  
  const message = {
    text: `🚨 ${alert.severity.toUpperCase()} Alert: ${alert.title}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚨 ${alert.severity.toUpperCase()} Alert`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Title:*\n${alert.title}`,
          },
          {
            type: 'mrkdwn',
            text: `*Severity:*\n${alert.severity}`,
          },
          {
            type: 'mrkdwn',
            text: `*Source:*\n${alert.source}`,
          },
          {
            type: 'mrkdwn',
            text: `*Time:*\n${new Date().toLocaleString('bg-BG')}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Message:*\n${alert.message}`,
        },
      },
    ],
  };
  
  if (alert.url) {
    message.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<${alert.url}|View Details>`,
      },
    } as any);
  }
  
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  
  console.log('✅ Slack notification sent');
}

/**
 * Get severity color for email
 */
function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#FF5722',
    critical: '#F44336',
  };
  return colors[severity] || '#333';
}

/**
 * Get monitoring stats (for admin dashboard)
 */
export const getMonitoringStats = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Check admin
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can view monitoring stats'
      );
    }
    
    try {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      // Get alerts from last 24 hours
      const alertsSnapshot = await db.collection('monitoring_alerts')
        .where('timestamp', '>=', last24h)
        .get();
      
      const alerts = alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Array<Alert & { id: string }>;
      
      // Group by severity
      const bySeverity = {
        low: alerts.filter(a => a.severity === 'low').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        high: alerts.filter(a => a.severity === 'high').length,
        critical: alerts.filter(a => a.severity === 'critical').length,
      };
      
      // Group by source
      const bySource = {
        sentry: alerts.filter(a => a.source === 'sentry').length,
        uptimerobot: alerts.filter(a => a.source === 'uptimerobot').length,
        custom: alerts.filter(a => a.source === 'custom').length,
      };
      
      return {
        totalAlerts: alerts.length,
        bySeverity,
        bySource,
        recentAlerts: alerts.slice(0, 10), // Latest 10
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Failed to get monitoring stats:', err.message);
      throw new functions.https.HttpsError('internal', err.message);
    }
  });

/**
 * Acknowledge alert
 */
export const acknowledgeAlert = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Check admin
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can acknowledge alerts'
      );
    }
    
    const { alertId } = data;
    
    if (!alertId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'alertId is required'
      );
    }
    
    try {
      await db.collection('monitoring_alerts').doc(alertId).update({
        acknowledged: true,
        acknowledgedBy: context.auth.uid,
        acknowledgedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return { success: true };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new functions.https.HttpsError('internal', err.message);
    }
  });

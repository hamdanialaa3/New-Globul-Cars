/**
 * Email Alert System
 * Zero-Cost Implementation using Nodemailer + Gmail SMTP (free tier)
 * 
 * Features:
 * - Error notifications to admin
 * - Fraud detection alerts
 * - Quota limit warnings
 * - Daily/weekly digest reports
 * - User notifications (listing status, messages, etc.)
 * 
 * Cost: €0 (Gmail SMTP free tier: 500 emails/day)
 * Alternative: SendGrid free tier (100 emails/day)
 * 
 * Replaces: Paid email services like SendGrid Pro (€15+/month)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

// Initialize if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Email transporter configuration
 * Uses Gmail SMTP (free for up to 500 emails/day)
 * 
 * Setup:
 * 1. Enable 2-Step Verification in Gmail
 * 2. Generate App Password: https://myaccount.google.com/apppasswords
 * 3. Set environment variables:
 *    firebase functions:config:set email.user="your-email@gmail.com" email.password="app-password"
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email?.user || process.env.EMAIL_USER,
    pass: functions.config().email?.password || process.env.EMAIL_PASSWORD
  }
});

/**
 * Admin email for alerts
 */
const ADMIN_EMAIL = functions.config().email?.admin || 'admin@globulcars.bg';

/**
 * Email templates (bilingual: Bulgarian/English)
 */
const EMAIL_TEMPLATES = {
  fraudAlert: {
    subject: {
      bg: '🚨 Съмнение за измама - Преглед необходим',
      en: '🚨 Fraud Suspicion - Review Required'
    },
    html: (data: any, lang: 'bg' | 'en') => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; margin-top: 20px; }
          .car-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${lang === 'bg' ? '⚠️ Съмнение за измама' : '⚠️ Fraud Suspicion'}</h1>
          </div>
          <div class="content">
            <p>${lang === 'bg' ? 'Открито е потенциално измамно обявление:' : 'A potentially fraudulent listing has been detected:'}</p>
            
            <div class="car-details">
              <h3>${lang === 'bg' ? 'Детайли на обявата:' : 'Listing Details:'}</h3>
              <p><strong>${lang === 'bg' ? 'ID' : 'ID'}:</strong> ${data.carId}</p>
              <p><strong>${lang === 'bg' ? 'Заглавие' : 'Title'}:</strong> ${data.title}</p>
              <p><strong>${lang === 'bg' ? 'Продавач' : 'Seller'}:</strong> ${data.seller}</p>
              <p><strong>${lang === 'bg' ? 'Степен на съвпадение' : 'Match Score'}:</strong> ${data.matchScore}%</p>
              <p><strong>${lang === 'bg' ? 'Причина' : 'Reason'}:</strong> ${data.reason}</p>
            </div>

            <p>${lang === 'bg' ? 'Моля, прегледайте обявата в админ панела:' : 'Please review the listing in admin panel:'}</p>
            
            <a href="${data.adminUrl}" class="button">
              ${lang === 'bg' ? 'Преглед на обявата' : 'Review Listing'}
            </a>
          </div>
          <div class="footer">
            <p>Globul Cars Admin System</p>
            <p>${lang === 'bg' ? 'Този имейл е автоматично генериран.' : 'This email is automatically generated.'}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  quotaWarning: {
    subject: {
      bg: '⚠️ Близо до лимит на AI квота',
      en: '⚠️ Approaching AI Quota Limit'
    },
    html: (data: any, lang: 'bg' | 'en') => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffc107; color: #000; padding: 20px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; margin-top: 20px; }
          .quota-bar { background: #e0e0e0; height: 30px; border-radius: 15px; overflow: hidden; margin: 20px 0; }
          .quota-fill { background: #ffc107; height: 100%; transition: width 0.3s; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${lang === 'bg' ? '⚠️ Квота AI близо до лимит' : '⚠️ AI Quota Near Limit'}</h1>
          </div>
          <div class="content">
            <p>${lang === 'bg' ? 'Използвали сте' : 'You have used'} <strong>${data.usedQuota}</strong> ${lang === 'bg' ? 'от' : 'out of'} <strong>${data.totalQuota}</strong> ${lang === 'bg' ? 'AI заявки днес.' : 'AI requests today.'}</p>
            
            <div class="quota-bar">
              <div class="quota-fill" style="width: ${data.percentage}%"></div>
            </div>
            
            <p style="text-align: center; font-size: 18px;"><strong>${data.percentage}% ${lang === 'bg' ? 'използвани' : 'used'}</strong></p>

            <p>${lang === 'bg' ? 'При достигане на лимита, AI функциите ще бъдат временно недостъпни до утре.' : 'When you reach the limit, AI features will be temporarily unavailable until tomorrow.'}</p>

            <p>${lang === 'bg' ? 'За повече AI заявки, разгледайте нашите премиум планове.' : 'For more AI requests, check out our premium plans.'}</p>
          </div>
          <div class="footer">
            <p>Globul Cars</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  errorAlert: {
    subject: {
      bg: '🔴 Критична грешка в системата',
      en: '🔴 Critical System Error'
    },
    html: (data: any, lang: 'bg' | 'en') => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Courier New', monospace; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; margin-top: 20px; }
          .error-box { background: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; font-family: 'Courier New', monospace; }
          .stack-trace { background: #1e1e1e; color: #d4d4d4; padding: 15px; overflow-x: auto; border-radius: 4px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${lang === 'bg' ? '🔴 Критична грешка' : '🔴 Critical Error'}</h1>
          </div>
          <div class="content">
            <div class="error-box">
              <p><strong>${lang === 'bg' ? 'Тип' : 'Type'}:</strong> ${data.errorType}</p>
              <p><strong>${lang === 'bg' ? 'Съобщение' : 'Message'}:</strong> ${data.errorMessage}</p>
              <p><strong>${lang === 'bg' ? 'Време' : 'Time'}:</strong> ${data.timestamp}</p>
              <p><strong>${lang === 'bg' ? 'Контекст' : 'Context'}:</strong> ${data.context}</p>
            </div>

            ${data.stackTrace ? `
            <div class="stack-trace">
              <pre>${data.stackTrace}</pre>
            </div>
            ` : ''}

            <p style="color: #dc3545; font-weight: bold;">
              ${lang === 'bg' ? '⚠️ Незабавни действия са необходими!' : '⚠️ Immediate action required!'}
            </p>
          </div>
          <div class="footer">
            <p>Globul Cars Admin System</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

/**
 * Send email function
 */
async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: options.from || `"Globul Cars" <${functions.config().email?.user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    });

    logger.info('Email sent successfully', { to: options.to, subject: options.subject });
    return true;

  } catch (error) {
    logger.error('Failed to send email', { error, to: options.to });
    return false;
  }
}

/**
 * Cloud Function: Send fraud alert email
 * Triggered by admin_review_queue creation
 */
export const sendFraudAlert = functions
  .region('europe-west1')
  .firestore
  .document('admin_review_queue/{queueId}')
  .onCreate(async (snapshot, context) => {
    const queueData = snapshot.data();

    if (queueData.type !== 'fraud_suspicion') {
      return null; // Only handle fraud suspicions
    }

    try {
      const carId = queueData.carId;
      const carDoc = await db.collection('cars').doc(carId).get();
      const carData = carDoc.data();

      if (!carData) {
        logger.error('Car not found for fraud alert', { carId });
        return null;
      }

      const emailData = {
        carId,
        title: carData.title || 'N/A',
        seller: carData.seller?.name || 'Unknown',
        matchScore: queueData.duplicates?.[0]?.overallScore || 0,
        reason: queueData.reason || 'Unknown',
        adminUrl: `https://globulcars.bg/admin/review/${carId}`
      };

      const template = EMAIL_TEMPLATES.fraudAlert;

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: template.subject.en,
        html: template.html(emailData, 'en')
      });

      logger.info('Fraud alert email sent', { carId });

      // Update queue item
      await snapshot.ref.update({
        emailSent: true,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, carId };

    } catch (error) {
      logger.error('Failed to send fraud alert', { error });
      return { success: false, error };
    }
  });

/**
 * Cloud Function: Send quota warning email
 * Manually triggered via HTTP call or scheduled check
 */
export const sendQuotaWarning = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated'
      );
    }

    const userId = context.auth.uid;

    try {
      // Get user data
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      if (!userData) {
        throw new functions.https.HttpsError('not-found', 'User not found');
      }

      // Get AI usage
      const usageDoc = await db.collection('users').doc(userId).collection('ai_usage').doc('daily').get();
      const usageData = usageDoc.data();

      const planTier = userData.planTier || 'free';
      const quotaLimit = getQuotaLimit(planTier);
      const usedQuota = usageData?.count || 0;
      const percentage = Math.round((usedQuota / quotaLimit) * 100);

      // Only send if above 80%
      if (percentage < 80) {
        return { success: false, reason: 'Quota below threshold' };
      }

      const emailData = {
        usedQuota,
        totalQuota: quotaLimit,
        percentage
      };

      const template = EMAIL_TEMPLATES.quotaWarning;
      const language = userData.language || 'en';

      await sendEmail({
        to: userData.email,
        subject: template.subject[language as 'bg' | 'en'],
        html: template.html(emailData, language as 'bg' | 'en')
      });

      logger.info('Quota warning email sent', { userId, percentage });

      return { success: true, percentage };

    } catch (error) {
      logger.error('Failed to send quota warning', { error });
      throw new functions.https.HttpsError(
        'internal',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  });

/**
 * Cloud Function: Send error alert email
 * Triggered by critical error logs
 */
export const sendErrorAlert = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Admin only
    if (!context.auth?.token.isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Admin access required'
      );
    }

    const { errorType, errorMessage, errorContext, stackTrace } = data;

    try {
      const emailData = {
        errorType,
        errorMessage,
        timestamp: new Date().toISOString(),
        context: JSON.stringify(errorContext, null, 2),
        stackTrace: stackTrace || null
      };

      const template = EMAIL_TEMPLATES.errorAlert;

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: template.subject.en,
        html: template.html(emailData, 'en')
      });

      logger.info('Error alert email sent', { errorType });

      return { success: true };

    } catch (error) {
      logger.error('Failed to send error alert', { error });
      throw new functions.https.HttpsError(
        'internal',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  });

/**
 * Helper: Get quota limit by plan tier
 */
function getQuotaLimit(planTier: string): number {
  const limits: Record<string, number> = {
    'free': 10,
    'premium': 50,
    'dealer_basic': 100,
    'dealer_pro': 300,
    'dealer_enterprise': 1000,
    'company_starter': 200,
    'company_pro': 500,
    'company_enterprise': 2000
  };

  return limits[planTier] || 10;
}

/**
 * Scheduled: Daily digest email (summary of activity)
 * Runs at 9 AM daily
 */
export const sendDailyDigest = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 9 * * *')
  .timeZone('Europe/Sofia')
  .onRun(async (context) => {
    try {
      logger.info('Starting daily digest generation');

      // Get yesterday's stats
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Count new listings
      const newListings = await db.collection('cars')
        .where('createdAt', '>=', yesterday)
        .where('createdAt', '<', today)
        .count()
        .get();

      // Count fraud cases
      const fraudCases = await db.collection('admin_review_queue')
        .where('type', '==', 'fraud_suspicion')
        .where('createdAt', '>=', yesterday)
        .where('createdAt', '<', today)
        .count()
        .get();

      // Count errors
      const errors = await db.collection('data_processing_logs')
        .where('action', '==', 'ingestion_error')
        .where('timestamp', '>=', yesterday)
        .where('timestamp', '<', today)
        .count()
        .get();

      const digestHtml = `
        <h2>Daily Digest - ${yesterday.toDateString()}</h2>
        <ul>
          <li>New Listings: ${newListings.data().count}</li>
          <li>Fraud Cases: ${fraudCases.data().count}</li>
          <li>Processing Errors: ${errors.data().count}</li>
        </ul>
      `;

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `Daily Digest - ${yesterday.toDateString()}`,
        html: digestHtml
      });

      logger.info('Daily digest sent', {
        newListings: newListings.data().count,
        fraudCases: fraudCases.data().count,
        errors: errors.data().count
      });

      return { success: true };

    } catch (error) {
      logger.error('Failed to send daily digest', { error });
      return { success: false, error };
    }
  });

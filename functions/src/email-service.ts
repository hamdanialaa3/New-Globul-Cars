// functions/src/email-service.ts
// Email Service using SendGrid for notifications

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

// Initialize SendGrid
const sendGridApiKey = functions.config().sendgrid?.api_key;
if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey);
}

interface EmailTemplate {
  subject: { bg: string; en: string };
  html: { bg: string; en: string };
  text: { bg: string; en: string };
}

// Email templates
const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  verification_submitted: {
    subject: {
      bg: 'Заявката за верификация е получена - Globul Cars',
      en: 'Verification Request Received - Globul Cars'
    },
    html: {
      bg: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Здравейте, {{userName}}!</h2>
          <p>Получихме вашата заявка за верификация на профила.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Детайли на заявката:</h3>
            <ul>
              <li><strong>Тип профил:</strong> {{profileType}}</li>
              <li><strong>Дата на подаване:</strong> {{submissionDate}}</li>
              <li><strong>Статус:</strong> В процес на разглеждане</li>
            </ul>
          </div>
          <p>Нашият екип ще прегледа документите ви в рамките на 2-3 работни дни.</p>
          <p>Ще получите имейл уведомление, когато верификацията бъде завършена.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Екипът на Globul Cars<br>
            <a href="https://globul-cars.com">globul-cars.com</a>
          </p>
        </div>
      `,
      en: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Hello, {{userName}}!</h2>
          <p>We have received your profile verification request.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Request Details:</h3>
            <ul>
              <li><strong>Profile Type:</strong> {{profileType}}</li>
              <li><strong>Submission Date:</strong> {{submissionDate}}</li>
              <li><strong>Status:</strong> Under Review</li>
            </ul>
          </div>
          <p>Our team will review your documents within 2-3 business days.</p>
          <p>You will receive an email notification when the verification is completed.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Globul Cars Team<br>
            <a href="https://globul-cars.com">globul-cars.com</a>
          </p>
        </div>
      `
    },
    text: {
      bg: 'Здравейте, {{userName}}! Получихме вашата заявка за верификация. Ще я прегледаме в рамките на 2-3 работни дни.',
      en: 'Hello, {{userName}}! We have received your verification request. We will review it within 2-3 business days.'
    }
  },

  verification_approved: {
    subject: {
      bg: '🎉 Профилът ви е верифициран - Globul Cars',
      en: '🎉 Your Profile is Verified - Globul Cars'
    },
    html: {
      bg: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">🎉 Поздравления, {{userName}}!</h2>
          <p>Вашият профил е успешно верифициран!</p>
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3>Какво получавате с верификацията:</h3>
            <ul>
              <li>✅ Значка за верифициран профил</li>
              <li>✅ Повишено доверие от купувачите</li>
              <li>✅ По-висока видимост в търсенията</li>
              <li>✅ Достъп до премиум функции</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://globul-cars.com/profile" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Вижте профила си
            </a>
          </div>
          <p>Благодарим ви, че избрахте Globul Cars!</p>
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Екипът на Globul Cars<br>
            <a href="https://globul-cars.com">globul-cars.com</a>
          </p>
        </div>
      `,
      en: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">🎉 Congratulations, {{userName}}!</h2>
          <p>Your profile has been successfully verified!</p>
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3>What you get with verification:</h3>
            <ul>
              <li>✅ Verified profile badge</li>
              <li>✅ Increased buyer trust</li>
              <li>✅ Higher search visibility</li>
              <li>✅ Access to premium features</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://globul-cars.com/profile" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Your Profile
            </a>
          </div>
          <p>Thank you for choosing Globul Cars!</p>
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Globul Cars Team<br>
            <a href="https://globul-cars.com">globul-cars.com</a>
          </p>
        </div>
      `
    },
    text: {
      bg: 'Поздравления! Вашият профил е верифициран. Вижте профила си на: https://globul-cars.com/profile',
      en: 'Congratulations! Your profile has been verified. View your profile at: https://globul-cars.com/profile'
    }
  },

  verification_rejected: {
    subject: {
      bg: 'Заявката за верификация се нуждае от допълнителна информация - Globul Cars',
      en: 'Verification Request Needs Additional Information - Globul Cars'
    },
    html: {
      bg: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Здравейте, {{userName}}</h2>
          <p>За съжаление, не можахме да завършим верификацията на вашия профил.</p>
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3>Причина за отказа:</h3>
            <p>{{rejectionReason}}</p>
          </div>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Следващи стъпки:</h3>
            <ol>
              <li>Прегледайте изискванията за документи</li>
              <li>Подгответе необходимите документи</li>
              <li>Подайте нова заявка за верификация</li>
            </ol>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://globul-cars.com/verification" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Подайте нова заявка
            </a>
          </div>
          <p>Ако имате въпроси, моля свържете се с нас.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Екипът на Globul Cars<br>
            <a href="https://globul-cars.com">globul-cars.com</a><br>
            Email: support@globul-cars.com
          </p>
        </div>
      `,
      en: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Hello, {{userName}}</h2>
          <p>Unfortunately, we were unable to complete your profile verification.</p>
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3>Reason for rejection:</h3>
            <p>{{rejectionReason}}</p>
          </div>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Next steps:</h3>
            <ol>
              <li>Review the document requirements</li>
              <li>Prepare the necessary documents</li>
              <li>Submit a new verification request</li>
            </ol>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://globul-cars.com/verification" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Submit New Request
            </a>
          </div>
          <p>If you have any questions, please contact us.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Globul Cars Team<br>
            <a href="https://globul-cars.com">globul-cars.com</a><br>
            Email: support@globul-cars.com
          </p>
        </div>
      `
    },
    text: {
      bg: 'Здравейте, {{userName}}. Заявката за верификация се нуждае от допълнителна информация: {{rejectionReason}}',
      en: 'Hello, {{userName}}. Your verification request needs additional information: {{rejectionReason}}'
    }
  },

  admin_verification_notification: {
    subject: {
      bg: '🔔 Нова заявка за верификация - Globul Cars Admin',
      en: '🔔 New Verification Request - Globul Cars Admin'
    },
    html: {
      bg: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🔔 Нова заявка за верификация</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Детайли на заявката:</h3>
            <ul>
              <li><strong>Потребител:</strong> {{userName}} ({{userEmail}})</li>
              <li><strong>Тип профил:</strong> {{profileType}}</li>
              <li><strong>Дата на подаване:</strong> {{submissionDate}}</li>
              <li><strong>ID на заявката:</strong> {{requestId}}</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://globul-cars.com/admin/verification/{{requestId}}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Прегледай заявката
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Това е автоматично уведомление от системата на Globul Cars.
          </p>
        </div>
      `,
      en: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🔔 New Verification Request</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Request Details:</h3>
            <ul>
              <li><strong>User:</strong> {{userName}} ({{userEmail}})</li>
              <li><strong>Profile Type:</strong> {{profileType}}</li>
              <li><strong>Submission Date:</strong> {{submissionDate}}</li>
              <li><strong>Request ID:</strong> {{requestId}}</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://globul-cars.com/admin/verification/{{requestId}}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Request
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated notification from Globul Cars system.
          </p>
        </div>
      `
    },
    text: {
      bg: 'Нова заявка за верификация от {{userName}} ({{userEmail}}). ID: {{requestId}}',
      en: 'New verification request from {{userName}} ({{userEmail}}). ID: {{requestId}}'
    }
  }
};

interface SendEmailParams {
  to: string;
  templateId: keyof typeof EMAIL_TEMPLATES;
  language: 'bg' | 'en';
  variables: Record<string, string>;
  fromEmail?: string;
  fromName?: string;
}

// Main email sending function
export const sendEmail = functions.https.onCall(
  async (data: SendEmailParams, context): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    try {
      // Verify that the request is from an authenticated user or admin
      if (!context.auth && !data.fromEmail?.includes('admin')) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'Must be authenticated to send emails'
        );
      }

      const { to, templateId, language, variables, fromEmail, fromName } = data;

      // Validate input
      if (!to || !templateId || !language) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Missing required parameters: to, templateId, language'
        );
      }

      // Get template
      const template = EMAIL_TEMPLATES[templateId];
      if (!template) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          `Template not found: ${templateId}`
        );
      }

      // Replace variables in template
      const replaceVariables = (text: string): string => {
        let result = text;
        Object.entries(variables).forEach(([key, value]) => {
          result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
        return result;
      };

      const subject = replaceVariables(template.subject[language]);
      const html = replaceVariables(template.html[language]);
      const text = replaceVariables(template.text[language]);

      // Prepare email
      const msg = {
        to,
        from: {
          email: fromEmail || 'noreply@globul-cars.com',
          name: fromName || 'Globul Cars'
        },
        subject,
        text,
        html,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        }
      };

      // Send email
      if (!sendGridApiKey) {
        console.log('SendGrid not configured, email would be sent:', msg);
        return { success: true, messageId: 'test-mode' };
      }

      const [response] = await sgMail.send(msg);
      
      // Log email sent
      await admin.firestore().collection('email_logs').add({
        to,
        templateId,
        language,
        subject,
        messageId: response.headers['x-message-id'],
        status: 'sent',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { 
        success: true, 
        messageId: response.headers['x-message-id'] as string 
      };

    } catch (error: any) {
      console.error('Error sending email:', error);
      
      // Log error
      await admin.firestore().collection('email_logs').add({
        to: data.to,
        templateId: data.templateId,
        error: error.message,
        status: 'failed',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { 
        success: false, 
        error: error.message 
      };
    }
  }
);

// Helper functions for specific email types
export const sendVerificationSubmittedEmail = functions.https.onCall(
  async (data: { userId: string; userEmail: string; userName: string; profileType: string }) => {
    const { userId, userEmail, userName, profileType } = data;
    
    // Get user's language preference
    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    const language = userDoc.data()?.language || 'bg';

    return sendEmail({
      to: userEmail,
      templateId: 'verification_submitted',
      language,
      variables: {
        userName,
        profileType,
        submissionDate: new Date().toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US')
      }
    }, { auth: { uid: userId } } as any);
  }
);

export const sendVerificationApprovedEmail = functions.https.onCall(
  async (data: { userId: string; userEmail: string; userName: string }) => {
    const { userId, userEmail, userName } = data;
    
    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    const language = userDoc.data()?.language || 'bg';

    return sendEmail({
      to: userEmail,
      templateId: 'verification_approved',
      language,
      variables: { userName }
    }, { auth: { uid: userId } } as any);
  }
);

export const sendVerificationRejectedEmail = functions.https.onCall(
  async (data: { userId: string; userEmail: string; userName: string; rejectionReason: string }) => {
    const { userId, userEmail, userName, rejectionReason } = data;
    
    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    const language = userDoc.data()?.language || 'bg';

    return sendEmail({
      to: userEmail,
      templateId: 'verification_rejected',
      language,
      variables: { userName, rejectionReason }
    }, { auth: { uid: userId } } as any);
  }
);

export const sendAdminVerificationNotification = functions.https.onCall(
  async (data: { userName: string; userEmail: string; profileType: string; requestId: string }) => {
    const { userName, userEmail, profileType, requestId } = data;
    
    const adminEmail = 'admin@globul-cars.com'; // Replace with actual admin email

    return sendEmail({
      to: adminEmail,
      templateId: 'admin_verification_notification',
      language: 'en', // Admin emails in English
      variables: {
        userName,
        userEmail,
        profileType,
        requestId,
        submissionDate: new Date().toLocaleDateString('en-US')
      },
      fromEmail: 'system@globul-cars.com',
      fromName: 'Globul Cars System'
    }, { auth: { uid: 'system' } } as any);
  }
);
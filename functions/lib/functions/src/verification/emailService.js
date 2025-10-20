"use strict";
// functions/src/verification/emailService.ts
// Email notification service for verification system
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendApprovalEmail = sendApprovalEmail;
exports.sendRejectionEmail = sendRejectionEmail;
exports.notifyAdminsNewRequest = notifyAdminsNewRequest;
const logger = __importStar(require("firebase-functions/logger"));
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
/**
 * Send approval email notification
 * Uses Firestore mail collection for Firebase Extensions
 */
async function sendApprovalEmail(data) {
    const { userEmail, displayName, profileType, businessName } = data;
    const profileTypeText = profileType === 'dealer' ? 'Дилър' : 'Фирма';
    const profileTypeEn = profileType === 'dealer' ? 'Dealer' : 'Company';
    const emailContent = {
        to: userEmail,
        message: {
            subject: `✅ Одобрение за ${profileTypeText} профил / ${profileTypeEn} Profile Approved`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Одобрение / Approved</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #16a34a; margin-top: 0;">Честито, ${displayName}!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              Вашата заявка за <strong>${profileTypeText}</strong> профил е одобрена!
            </p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p style="margin: 0; font-size: 14px; color: #166534;">
                <strong>Фирма:</strong> ${businessName}<br>
                <strong>Тип профил:</strong> ${profileTypeText}
              </p>
            </div>

            <h3 style="color: #374151; font-size: 18px;">Какво можете да правите сега:</h3>
            <ul style="color: #374151; line-height: 1.8;">
              <li>📊 Публикувайте неограничен брой обяви</li>
              <li>📈 Достъп до разширена аналитика</li>
              <li>💼 Управление на екип (за Фирми)</li>
              <li>⭐ Повишен Trust Score</li>
              <li>🎯 Приоритетна поддръжка</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://globul.net/profile" 
                 style="background: #16a34a; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Отидете към профила си
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <h3 style="color: #374151; font-size: 18px;">Congratulations, ${displayName}!</h3>
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              Your <strong>${profileTypeEn}</strong> profile request has been approved!
            </p>

            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              С уважение,<br>
              Екипът на Globul Cars
            </p>
          </div>
        </div>
      `,
        },
    };
    try {
        // Add to mail collection (Firebase Extension will process it)
        await db.collection('mail').add(emailContent);
        logger.info('Approval email queued', { userEmail, profileType });
    }
    catch (error) {
        logger.error('Failed to queue approval email', error);
        throw error;
    }
}
/**
 * Send rejection email notification
 */
async function sendRejectionEmail(data) {
    const { userEmail, displayName, profileType, reason, businessName } = data;
    const profileTypeText = profileType === 'dealer' ? 'Дилър' : 'Фирма';
    const profileTypeEn = profileType === 'dealer' ? 'Dealer' : 'Company';
    const emailContent = {
        to: userEmail,
        message: {
            subject: `❌ Заявка за ${profileTypeText} профил отхвърлена / ${profileTypeEn} Profile Request Rejected`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">❌ Отхвърлена / Rejected</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #dc2626; margin-top: 0;">Здравейте, ${displayName}</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              За съжаление, вашата заявка за <strong>${profileTypeText}</strong> профил не може да бъде одобрена в момента.
            </p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #991b1b;">Причина за отхвърляне:</p>
              <p style="margin: 0; font-size: 14px; color: #7f1d1d;">
                ${reason}
              </p>
            </div>

            <h3 style="color: #374151; font-size: 18px;">Какво можете да направите:</h3>
            <ul style="color: #374151; line-height: 1.8;">
              <li>📝 Коригирайте посочените проблеми</li>
              <li>📄 Уверете се, че всички документи са правилни и четливи</li>
              <li>✅ Попълнете всички задължителни полета</li>
              <li>🔄 Подайте нова заявка</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://globul.net/profile" 
                 style="background: #dc2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Опитайте отново
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <h3 style="color: #374151; font-size: 18px;">Hello, ${displayName}</h3>
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              Unfortunately, your <strong>${profileTypeEn}</strong> profile request cannot be approved at this time.
            </p>

            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Ако имате въпроси, моля свържете се с нас.<br>
              If you have questions, please contact us.
            </p>

            <p style="font-size: 14px; color: #6b7280;">
              С уважение,<br>
              Екипът на Globul Cars
            </p>
          </div>
        </div>
      `,
        },
    };
    try {
        await db.collection('mail').add(emailContent);
        logger.info('Rejection email queued', { userEmail, profileType });
    }
    catch (error) {
        logger.error('Failed to queue rejection email', error);
        throw error;
    }
}
/**
 * Send new verification request notification to admins
 */
async function notifyAdminsNewRequest(data) {
    const { requestId, userName, businessName, profileType } = data;
    // Get all admin emails
    const adminsSnapshot = await db.collection('admins').get();
    const adminEmails = [];
    adminsSnapshot.forEach((doc) => {
        const email = doc.data().email;
        if (email) {
            adminEmails.push(email);
        }
    });
    if (adminEmails.length === 0) {
        logger.warn('No admin emails found for notification');
        return;
    }
    const profileTypeText = profileType === 'dealer' ? 'Дилър' : 'Фирма';
    const emailContent = {
        to: adminEmails,
        message: {
            subject: `🔔 Нова заявка за верификация: ${businessName}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e40af; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔔 Нова заявка за верификация</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px;">
              <strong>${userName}</strong> подаде заявка за <strong>${profileTypeText}</strong> профил.
            </p>
            
            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Фирма:</strong> ${businessName}</p>
              <p style="margin: 5px 0;"><strong>Тип:</strong> ${profileTypeText}</p>
              <p style="margin: 5px 0;"><strong>ID:</strong> ${requestId}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://globul.net/admin/verification" 
                 style="background: #1e40af; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Прегледайте заявката
              </a>
            </div>
          </div>
        </div>
      `,
        },
    };
    try {
        await db.collection('mail').add(emailContent);
        logger.info('Admin notification queued', { requestId, adminCount: adminEmails.length });
    }
    catch (error) {
        logger.error('Failed to queue admin notification', error);
        throw error;
    }
}
//# sourceMappingURL=emailService.js.map
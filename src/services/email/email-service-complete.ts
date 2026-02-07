/**
 * Complete Email Service
 * خدمة البريد الإلكتروني الكاملة
 * 
 * Integration ready for:
 * - SendGrid
 * - AWS SES
 * - Firebase Extensions (Trigger Email)
 * 
 * @version 2.0.0
 * @date December 15, 2025
 */

import { logger } from '../logger-service';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/firebase-config';

// ==================== TYPES ====================

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string; // Plain text fallback
  from?: EmailRecipient;
  replyTo?: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded
  contentType: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ==================== EMAIL TEMPLATES ====================

export class EmailTemplates {
  private static readonly BASE_URL = import.meta.env.VITE_BASE_URL || 'https://fire-new-globul.web.app';
  private static readonly LOGO_URL = `${this.BASE_URL}/logo.png`;
  private static readonly SUPPORT_EMAIL = 'support@globulcars.bg';
  
  /**
   * Base HTML template wrapper
   */
  private static wrapTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header img {
      max-width: 150px;
      margin-bottom: 15px;
    }
    .content {
      padding: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .highlight {
      background: #fff3cd;
      padding: 15px;
      border-left: 4px solid #ffc107;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${this.LOGO_URL}" alt="Globul Cars" />
      <h1 style="margin: 0;">Globul Cars</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Globul Cars. Всички права запазени.</p>
      <p>За въпроси: <a href="mailto:${this.SUPPORT_EMAIL}">${this.SUPPORT_EMAIL}</a></p>
      <p><a href="${this.BASE_URL}/unsubscribe">Отписване от известия</a></p>
    </div>
  </div>
</body>
</html>
    `;
  }
  
  /**
   * Welcome email - sent on registration
   */
  static welcome(userName: string, verificationLink: string): EmailOptions {
    const content = `
      <h2>Добре дошли, ${userName}! 🎉</h2>
      <p>Благодарим Ви, че се регистрирахте в <strong>Globul Cars</strong> - водещата платформа за автомобили в България!</p>
      
      <div class="highlight">
        <p><strong>Какво следва?</strong></p>
        <ol>
          <li>Потвърдете имейл адреса си</li>
          <li>Завършете профила си</li>
          <li>Започнете да публикувате обяви</li>
        </ol>
      </div>
      
      <p>Моля, потвърдете имейл адреса си, като кликнете на бутона по-долу:</p>
      <a href="${verificationLink}" class="button">Потвърди имейл адрес</a>
      
      <p>Или копирайте този линк в браузъра си:<br/>
      <small>${verificationLink}</small></p>
      
      <p>С поздрави,<br/>Екипът на Globul Cars</p>
    `;
    
    return {
      to: { email: '', name: userName }, // Email will be added by caller
      subject: 'Добре дошли в Globul Cars! 🚗',
      html: this.wrapTemplate(content),
      text: `Добре дошли, ${userName}! Моля, потвърдете имейл адреса си: ${verificationLink}`
    };
  }
  
  /**
   * Email verification - resend verification
   */
  static emailVerification(userName: string, verificationLink: string): EmailOptions {
    const content = `
      <h2>Потвърждение на имейл адрес</h2>
      <p>Здравейте, ${userName}!</p>
      <p>Заявихте повторно потвърждение на имейл адреса си.</p>
      
      <a href="${verificationLink}" class="button">Потвърди имейл адрес</a>
      
      <p>Линкът е валиден за <strong>24 часа</strong>.</p>
      
      <p>Ако не сте заявили това, моля игнорирайте имейла.</p>
    `;
    
    return {
      to: { email: '', name: userName },
      subject: 'Потвърждение на имейл адрес - Globul Cars',
      html: this.wrapTemplate(content)
    };
  }
  
  /**
   * Password reset email
   */
  static passwordReset(userName: string, resetLink: string): EmailOptions {
    const content = `
      <h2>Нулиране на парола</h2>
      <p>Здравейте, ${userName}!</p>
      <p>Получихме заявка за нулиране на паролата за Вашия акаунт.</p>
      
      <a href="${resetLink}" class="button">Нулиране на парола</a>
      
      <div class="highlight">
        <p><strong>⚠️ Важно:</strong></p>
        <ul>
          <li>Линкът е валиден за <strong>1 час</strong></li>
          <li>Може да се използва само <strong>веднъж</strong></li>
        </ul>
      </div>
      
      <p>Ако не сте заявили нулиране на парола, моля игнорирайте този имейл или се свържете с нас незабавно.</p>
    `;
    
    return {
      to: { email: '', name: userName },
      subject: 'Нулиране на парола - Globul Cars',
      html: this.wrapTemplate(content)
    };
  }
  
  /**
   * Listing approved - car listing was approved
   */
  static listingApproved(userName: string, carTitle: string, carUrl: string, carId: string): EmailOptions {
    const content = `
      <h2>Обявата Ви беше одобрена! ✅</h2>
      <p>Здравейте, ${userName}!</p>
      <p>Радваме се да Ви съобщим, че Вашата обява беше прегледана и одобрена:</p>
      
      <div class="highlight">
        <h3 style="margin: 0 0 10px 0;">${carTitle}</h3>
        <p style="margin: 0;">ID на обява: ${carId}</p>
      </div>
      
      <p>Обявата Ви вече е видима за всички потребители на платформата!</p>
      
      <a href="${carUrl}" class="button">Виж обявата</a>
      
      <p><strong>Следващи стъпки:</strong></p>
      <ul>
        <li>Споделете обявата в социалните мрежи</li>
        <li>Отговаряйте бързо на запитванията</li>
        <li>Актуализирайте информацията при промяна</li>
      </ul>
    `;
    
    return {
      to: { email: '', name: userName },
      subject: '✅ Обявата Ви беше одобрена - Globul Cars',
      html: this.wrapTemplate(content)
    };
  }
  
  /**
   * Listing rejected - car listing was rejected
   */
  static listingRejected(userName: string, carTitle: string, reason: string, carId: string): EmailOptions {
    const content = `
      <h2>Обявата Ви беше отхвърлена</h2>
      <p>Здравейте, ${userName}!</p>
      <p>За съжаление, Вашата обява не беше одобрена:</p>
      
      <div class="highlight">
        <h3 style="margin: 0 0 10px 0;">${carTitle}</h3>
        <p style="margin: 0;">ID на обява: ${carId}</p>
        <p style="margin: 10px 0 0 0;"><strong>Причина:</strong> ${reason}</p>
      </div>
      
      <p><strong>Какво можете да направите?</strong></p>
      <ul>
        <li>Прегледайте правилата за обяви</li>
        <li>Коригирайте проблемите</li>
        <li>Изпратете обявата отново</li>
      </ul>
      
      <a href="${this.BASE_URL}/sell" class="button">Редактирай обява</a>
      
      <p>Ако имате въпроси, свържете се с нас на ${this.SUPPORT_EMAIL}</p>
    `;
    
    return {
      to: { email: '', name: userName },
      subject: '❌ Обявата Ви беше отхвърлена - Globul Cars',
      html: this.wrapTemplate(content)
    };
  }
  
  /**
   * New message notification
   */
  static newMessage(recipientName: string, senderName: string, messagePreview: string, conversationUrl: string): EmailOptions {
    const content = `
      <h2>Ново съобщение 💬</h2>
      <p>Здравейте, ${recipientName}!</p>
      <p>Получихте ново съобщение от <strong>${senderName}</strong>:</p>
      
      <div class="highlight">
        <p style="font-style: italic;">"${messagePreview.substring(0, 150)}${messagePreview.length > 150 ? '...' : ''}"</p>
      </div>
      
      <a href="${conversationUrl}" class="button">Виж съобщението</a>
      
      <p><small>Съвет: Отговаряйте бързо на съобщенията за по-добра комуникация с купувачите!</small></p>
    `;
    
    return {
      to: { email: '', name: recipientName },
      subject: `💬 Ново съобщение от ${senderName} - Globul Cars`,
      html: this.wrapTemplate(content)
    };
  }
  
  /**
   * Subscription activated
   */
  static subscriptionActivated(userName: string, planName: string, features: string[]): EmailOptions {
    const content = `
      <h2>Абонаментът Ви е активиран! 🎉</h2>
      <p>Здравейте, ${userName}!</p>
      <p>Благодарим Ви за избора на план <strong>${planName}</strong>!</p>
      
      <div class="highlight">
        <h3 style="margin: 0 0 10px 0;">Вашите възможности:</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      
      <a href="${this.BASE_URL}/profile/subscription" class="button">Управление на абонамент</a>
      
      <p>Започнете да използвате всички предимства на плана си веднага!</p>
    `;
    
    return {
      to: { email: '', name: userName },
      subject: `🎉 Абонамент ${planName} активиран - Globul Cars`,
      html: this.wrapTemplate(content)
    };
  }
  
  /**
   * Subscription expiring soon
   */
  static subscriptionExpiring(userName: string, planName: string, expiryDate: string, renewUrl: string): EmailOptions {
    const content = `
      <h2>Абонаментът Ви изтича скоро ⚠️</h2>
      <p>Здравейте, ${userName}!</p>
      <p>Вашият план <strong>${planName}</strong> изтича на <strong>${expiryDate}</strong>.</p>
      
      <div class="highlight">
        <p><strong>Какво ще се случи след изтичането?</strong></p>
        <ul>
          <li>Обявите Ви ще останат видими</li>
          <li>Ще загубите достъп до разширените функции</li>
          <li>Ще се върнете към безплатния план</li>
        </ul>
      </div>
      
      <p>Подновете абонамента си, за да запазите всички предимства:</p>
      <a href="${renewUrl}" class="button">Поднови абонамент</a>
    `;
    
    return {
      to: { email: '', name: userName },
      subject: '⚠️ Абонаментът Ви изтича скоро - Globul Cars',
      html: this.wrapTemplate(content)
    };
  }
}

// ==================== EMAIL SERVICE ====================

export class EmailService {
  private static readonly sendEmailFunction = httpsCallable<EmailOptions, EmailResult>(functions, 'sendEmail');
  
  /**
   * Send email using Cloud Function
   * (Cloud Function handles actual sending via SendGrid/SES)
   */
  static async send(options: EmailOptions): Promise<EmailResult> {
    try {
      logger.info('Sending email', {
        to: Array.isArray(options.to) ? options.to.map(r => r.email) : options.to.email,
        subject: options.subject
      });
      
      const result = await this.sendEmailFunction(options);
      
      if (result.data.success) {
        logger.info('Email sent successfully', {
          messageId: result.data.messageId
        });
      } else {
        logger.error('Email sending failed', new Error(result.data.error || 'Unknown error'));
      }
      
      return result.data;
    } catch (error) {
      logger.error('Email service error', error as Error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
  
  /**
   * Send welcome email
   */
  static async sendWelcome(userEmail: string, userName: string, verificationLink: string): Promise<EmailResult> {
    const options = EmailTemplates.welcome(userName, verificationLink);
    options.to = { email: userEmail, name: userName };
    return this.send(options);
  }
  
  /**
   * Send email verification
   */
  static async sendEmailVerification(userEmail: string, userName: string, verificationLink: string): Promise<EmailResult> {
    const options = EmailTemplates.emailVerification(userName, verificationLink);
    options.to = { email: userEmail, name: userName };
    return this.send(options);
  }
  
  /**
   * Send password reset
   */
  static async sendPasswordReset(userEmail: string, userName: string, resetLink: string): Promise<EmailResult> {
    const options = EmailTemplates.passwordReset(userName, resetLink);
    options.to = { email: userEmail, name: userName };
    return this.send(options);
  }
  
  /**
   * Send listing approved notification
   */
  static async sendListingApproved(
    userEmail: string,
    userName: string,
    carTitle: string,
    carUrl: string,
    carId: string
  ): Promise<EmailResult> {
    const options = EmailTemplates.listingApproved(userName, carTitle, carUrl, carId);
    options.to = { email: userEmail, name: userName };
    return this.send(options);
  }
  
  /**
   * Send listing rejected notification
   */
  static async sendListingRejected(
    userEmail: string,
    userName: string,
    carTitle: string,
    reason: string,
    carId: string
  ): Promise<EmailResult> {
    const options = EmailTemplates.listingRejected(userName, carTitle, reason, carId);
    options.to = { email: userEmail, name: userName };
    return this.send(options);
  }
  
  /**
   * Send new message notification
   */
  static async sendNewMessage(
    recipientEmail: string,
    recipientName: string,
    senderName: string,
    messagePreview: string,
    conversationUrl: string
  ): Promise<EmailResult> {
    const options = EmailTemplates.newMessage(recipientName, senderName, messagePreview, conversationUrl);
    options.to = { email: recipientEmail, name: recipientName };
    return this.send(options);
  }
  
  /**
   * Send subscription activated notification
   */
  static async sendSubscriptionActivated(
    userEmail: string,
    userName: string,
    planName: string,
    features: string[]
  ): Promise<EmailResult> {
    const options = EmailTemplates.subscriptionActivated(userName, planName, features);
    options.to = { email: userEmail, name: userName };
    return this.send(options);
  }
  
  /**
   * Send subscription expiring notification
   */
  static async sendSubscriptionExpiring(
    userEmail: string,
    userName: string,
    planName: string,
    expiryDate: string,
    renewUrl: string
  ): Promise<EmailResult> {
    const options = EmailTemplates.subscriptionExpiring(userName, planName, expiryDate, renewUrl);
    options.to = { email: userEmail, name: userName };
    return this.send(options);
  }
}

export default EmailService;

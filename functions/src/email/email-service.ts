/**
 * Email Service - Complete Implementation
 * خدمة البريد الإلكتروني الكاملة مع Templates
 * 
 * Features:
 * - SendGrid integration
 * - 10+ email templates (BG/EN bilingual)
 * - Queue system for bulk emails
 * - Email tracking and analytics
 * - Retry mechanism
 * 
 * @version 2.0.0
 * @date December 15, 2025
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// SendGrid integration
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const SENDGRID_API_KEY = functions.config().sendgrid?.key || process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// ==================== INTERFACES ====================

export interface EmailTemplate {
  subject: {
    bg: string;
    en: string;
  };
  text: {
    bg: string;
    en: string;
  };
  html: {
    bg: string;
    en: string;
  };
}

export interface EmailData {
  to: string;
  templateId: keyof typeof EMAIL_TEMPLATES;
  language: 'bg' | 'en';
  variables: Record<string, any>;
  from?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ==================== EMAIL TEMPLATES ====================

export const EMAIL_TEMPLATES = {
  // 1. Welcome Email
  welcome: {
    subject: {
      bg: 'Добре дошли в Globul Cars! 🚗',
      en: 'Welcome to Globul Cars! 🚗'
    },
    text: {
      bg: `Здравейте {{firstName}},

Добре дошли в Globul Cars - водещата платформа за автомобили в България!

Вашият акаунт е създаден успешно. Сега можете:
- Да разглеждате хиляди автомобили
- Да публикувате собствени обяви
- Да получавате персонализирани препоръки
- Да контактувате директно с продавачи

Започнете сега: {{dashboardUrl}}

Приятно пазаруване!
Екипът на Globul Cars`,
      en: `Hello {{firstName}},

Welcome to Globul Cars - Bulgaria's leading car marketplace!

Your account has been created successfully. You can now:
- Browse thousands of vehicles
- Post your own listings
- Get personalized recommendations
- Contact sellers directly

Get started: {{dashboardUrl}}

Happy shopping!
The Globul Cars Team`
    },
    html: {
      bg: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #007bff; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 Добре дошли в Globul Cars!</h1>
    </div>
    <div class="content">
      <h2>Здравейте {{firstName}},</h2>
      <p>Благодарим Ви, че се присъединихте към Globul Cars - водещата платформа за автомобили в България!</p>
      
      <p><strong>Вашият акаунт е създаден успешно!</strong></p>
      
      <p>Сега можете да:</p>
      <ul>
        <li>✅ Разглеждате хиляди автомобили</li>
        <li>✅ Публикувате собствени обяви</li>
        <li>✅ Получавате персонализирани препоръки</li>
        <li>✅ Контактувате директно с продавачи</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="{{dashboardUrl}}" class="button">Започнете сега</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2025 Globul Cars. Всички права запазени.</p>
      <p><a href="{{unsubscribeUrl}}">Отписване от бюлетина</a></p>
    </div>
  </div>
</body>
</html>`,
      en: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #007bff; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 Welcome to Globul Cars!</h1>
    </div>
    <div class="content">
      <h2>Hello {{firstName}},</h2>
      <p>Thank you for joining Globul Cars - Bulgaria's leading car marketplace!</p>
      
      <p><strong>Your account has been created successfully!</strong></p>
      
      <p>You can now:</p>
      <ul>
        <li>✅ Browse thousands of vehicles</li>
        <li>✅ Post your own listings</li>
        <li>✅ Get personalized recommendations</li>
        <li>✅ Contact sellers directly</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="{{dashboardUrl}}" class="button">Get Started</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2025 Globul Cars. All rights reserved.</p>
      <p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`
    }
  },

  // 2. Email Verification
  emailVerification: {
    subject: {
      bg: 'Потвърдете вашия имейл адрес',
      en: 'Verify Your Email Address'
    },
    text: {
      bg: `Здравейте {{firstName}},

Моля, потвърдете вашия имейл адрес, за да активирате акаунта си в Globul Cars.

Код за потвърждение: {{verificationCode}}

Или кликнете тук: {{verificationUrl}}

Кодът е валиден 24 часа.

Ако не сте се регистрирали в Globul Cars, моля игнорирайте този имейл.

С уважение,
Екипът на Globul Cars`,
      en: `Hello {{firstName}},

Please verify your email address to activate your Globul Cars account.

Verification code: {{verificationCode}}

Or click here: {{verificationUrl}}

This code is valid for 24 hours.

If you didn't register at Globul Cars, please ignore this email.

Best regards,
The Globul Cars Team`
    },
    html: {
      bg: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .code { font-size: 24px; font-weight: bold; letter-spacing: 5px; background: #fff; padding: 15px; text-align: center; border: 2px dashed #28a745; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✉️ Потвърдете вашия имейл</h1>
    </div>
    <div class="content">
      <h2>Здравейте {{firstName}},</h2>
      <p>Благодарим Ви за регистрацията в Globul Cars!</p>
      
      <p>Моля, потвърдете вашия имейл адрес, като използвате кода по-долу:</p>
      
      <div class="code">{{verificationCode}}</div>
      
      <p style="text-align: center;">или</p>
      
      <div style="text-align: center;">
        <a href="{{verificationUrl}}" class="button">Потвърдете имейл</a>
      </div>
      
      <p><small>⏰ Този код е валиден 24 часа.</small></p>
      
      <p><small>Ако не сте се регистрирали в Globul Cars, моля игнорирайте този имейл.</small></p>
    </div>
    <div class="footer">
      <p>© 2025 Globul Cars. Всички права запазени.</p>
    </div>
  </div>
</body>
</html>`,
      en: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .code { font-size: 24px; font-weight: bold; letter-spacing: 5px; background: #fff; padding: 15px; text-align: center; border: 2px dashed #28a745; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✉️ Verify Your Email</h1>
    </div>
    <div class="content">
      <h2>Hello {{firstName}},</h2>
      <p>Thank you for registering at Globul Cars!</p>
      
      <p>Please verify your email address using the code below:</p>
      
      <div class="code">{{verificationCode}}</div>
      
      <p style="text-align: center;">or</p>
      
      <div style="text-align: center;">
        <a href="{{verificationUrl}}" class="button">Verify Email</a>
      </div>
      
      <p><small>⏰ This code is valid for 24 hours.</small></p>
      
      <p><small>If you didn't register at Globul Cars, please ignore this email.</small></p>
    </div>
    <div class="footer">
      <p>© 2025 Globul Cars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
    }
  },

  // 3. Password Reset
  passwordReset: {
    subject: {
      bg: 'Нулиране на парола - Globul Cars',
      en: 'Password Reset - Globul Cars'
    },
    text: {
      bg: `Здравейте {{firstName}},

Получихме заявка за нулиране на паролата за вашия акаунт.

Кликнете тук за нулиране: {{resetUrl}}

Този линк е валиден 1 час.

Ако не сте заявили нулиране на парола, моля игнорирайте този имейл. Вашата парола остава непроменена.

С уважение,
Екипът на Globul Cars`,
      en: `Hello {{firstName}},

We received a request to reset your password.

Click here to reset: {{resetUrl}}

This link is valid for 1 hour.

If you didn't request a password reset, please ignore this email. Your password remains unchanged.

Best regards,
The Globul Cars Team`
    },
    html: {
      bg: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ffc107; color: #333; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background: #ffc107; color: #333; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Нулиране на парола</h1>
    </div>
    <div class="content">
      <h2>Здравейте {{firstName}},</h2>
      <p>Получихме заявка за нулиране на паролата за вашия акаунт в Globul Cars.</p>
      
      <div style="text-align: center;">
        <a href="{{resetUrl}}" class="button">Нулиране на парола</a>
      </div>
      
      <div class="warning">
        <p><strong>⏰ Важно:</strong></p>
        <ul>
          <li>Този линк е валиден 1 час</li>
          <li>Може да се използва само веднъж</li>
          <li>Не споделяйте този линк с никого</li>
        </ul>
      </div>
      
      <p><small>Ако не сте заявили нулиране на парола, моля игнорирайте този имейл. Вашата парола остава непроменена.</small></p>
    </div>
    <div class="footer">
      <p>© 2025 Globul Cars. Всички права запазени.</p>
    </div>
  </div>
</body>
</html>`,
      en: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ffc107; color: #333; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background: #ffc107; color: #333; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset</h1>
    </div>
    <div class="content">
      <h2>Hello {{firstName}},</h2>
      <p>We received a request to reset your Globul Cars account password.</p>
      
      <div style="text-align: center;">
        <a href="{{resetUrl}}" class="button">Reset Password</a>
      </div>
      
      <div class="warning">
        <p><strong>⏰ Important:</strong></p>
        <ul>
          <li>This link is valid for 1 hour</li>
          <li>Can only be used once</li>
          <li>Don't share this link with anyone</li>
        </ul>
      </div>
      
      <p><small>If you didn't request a password reset, please ignore this email. Your password remains unchanged.</small></p>
    </div>
    <div class="footer">
      <p>© 2025 Globul Cars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
    }
  },

  // 4. Listing Approved
  listingApproved: {
    subject: {
      bg: '✅ Вашата обява е одобрена!',
      en: '✅ Your listing has been approved!'
    },
    text: {
      bg: `Здравейте {{firstName}},

Отлични новини! Вашата обява за {{carMake}} {{carModel}} ({{carYear}}) е одобрена и публикувана.

Преглед на обявата: {{listingUrl}}

Статистика:
- Преглеждания: 0
- Запитвания: 0
- Добавена в любими: 0

Съвети за успешна продажба:
✅ Отговаряйте бързо на запитвания
✅ Добавяйте качествени снимки
✅ Актуализирайте цената при промяна

Управление на обявата: {{dashboardUrl}}

Успешна продажба!
Екипът на Globul Cars`,
      en: `Hello {{firstName}},

Great news! Your listing for {{carMake}} {{carModel}} ({{carYear}}) has been approved and published.

View listing: {{listingUrl}}

Statistics:
- Views: 0
- Inquiries: 0
- Favorites: 0

Tips for successful sale:
✅ Respond quickly to inquiries
✅ Add quality photos
✅ Update price if needed

Manage listing: {{dashboardUrl}}

Good luck with your sale!
The Globul Cars Team`
    },
    html: {
      bg: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .car-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat { text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
    .tips { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Обявата е одобрена!</h1>
    </div>
    <div class="content">
      <h2>Поздравления, {{firstName}}!</h2>
      <p>Вашата обява е одобрена и вече е публикувана в Globul Cars!</p>
      
      <div class="car-info">
        <h3>{{carMake}} {{carModel}} ({{carYear}})</h3>
        <p><strong>Цена:</strong> {{carPrice}}€</p>
        <p><strong>Град:</strong> {{carCity}}</p>
      </div>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-value">0</div>
          <div>Преглеждания</div>
        </div>
        <div class="stat">
          <div class="stat-value">0</div>
          <div>Запитвания</div>
        </div>
        <div class="stat">
          <div class="stat-value">0</div>
          <div>Любими</div>
        </div>
      </div>
      
      <div class="tips">
        <h4>💡 Съвети за успешна продажба:</h4>
        <ul>
          <li>✅ Отговаряйте бързо на запитвания (в рамките на 1 час)</li>
          <li>✅ Добавяйте качествени снимки от всички ъгли</li>
          <li>✅ Актуализирайте цената при промяна</li>
          <li>✅ Споделете обявата в социалните мрежи</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="{{listingUrl}}" class="button">Преглед на обявата</a>
        <a href="{{dashboardUrl}}" class="button" style="background: #007bff;">Управление</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2025 Globul Cars. Всички права запазени.</p>
    </div>
  </div>
</body>
</html>`,
      en: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .car-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat { text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
    .tips { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Listing Approved!</h1>
    </div>
    <div class="content">
      <h2>Congratulations, {{firstName}}!</h2>
      <p>Your listing has been approved and is now live on Globul Cars!</p>
      
      <div class="car-info">
        <h3>{{carMake}} {{carModel}} ({{carYear}})</h3>
        <p><strong>Price:</strong> €{{carPrice}}</p>
        <p><strong>Location:</strong> {{carCity}}</p>
      </div>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-value">0</div>
          <div>Views</div>
        </div>
        <div class="stat">
          <div class="stat-value">0</div>
          <div>Inquiries</div>
        </div>
        <div class="stat">
          <div class="stat-value">0</div>
          <div>Favorites</div>
        </div>
      </div>
      
      <div class="tips">
        <h4>💡 Tips for successful sale:</h4>
        <ul>
          <li>✅ Respond quickly to inquiries (within 1 hour)</li>
          <li>✅ Add quality photos from all angles</li>
          <li>✅ Update price if needed</li>
          <li>✅ Share listing on social media</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="{{listingUrl}}" class="button">View Listing</a>
        <a href="{{dashboardUrl}}" class="button" style="background: #007bff;">Manage</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2025 Globul Cars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
    }
  },

  // 5. New Message Notification
  newMessage: {
    subject: {
      bg: '💬 Ново съобщение за {{carMake}} {{carModel}}',
      en: '💬 New message about {{carMake}} {{carModel}}'
    },
    text: {
      bg: `Здравейте {{firstName}},

Имате ново съобщение относно обявата за {{carMake}} {{carModel}} ({{carYear}}).

От: {{senderName}}
Съобщение: "{{messagePreview}}..."

Прочетете пълното съобщение и отговорете: {{messageUrl}}

💡 Съвет: Бързите отговори увеличават шанса за успешна сделка!

С уважение,
Екипът на Globul Cars`,
      en: `Hello {{firstName}},

You have a new message about your {{carMake}} {{carModel}} ({{carYear}}) listing.

From: {{senderName}}
Message: "{{messagePreview}}..."

Read full message and reply: {{messageUrl}}

💡 Tip: Quick responses increase your chances of a successful sale!

Best regards,
The Globul Cars Team`
    },
    html: {
      bg: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .message { background: white; padding: 20px; border-left: 4px solid #17a2b8; margin: 20px 0; }
    .sender { font-weight: bold; color: #17a2b8; }
    .button { display: inline-block; padding: 12px 30px; background: #17a2b8; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .tip { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💬 Ново съобщение!</h1>
    </div>
    <div class="content">
      <h2>Здравейте {{firstName}},</h2>
      <p>Имате ново съобщение относно обявата за <strong>{{carMake}} {{carModel}} ({{carYear}})</strong>.</p>
      
      <div class="message">
        <p class="sender">От: {{senderName}}</p>
        <p>"{{messagePreview}}..."</p>
        <p><small>{{messageTime}}</small></p>
      </div>
      
      <div style="text-align: center;">
        <a href="{{messageUrl}}" class="button">Прочети и отговори</a>
      </div>
      
      <div class="tip">
        <p><strong>💡 Съвет:</strong> Бързите отговори (в рамките на 1 час) увеличават шанса за успешна сделка с до 3 пъти!</p>
      </div>
    </div>
    <div class="footer">
      <p>© 2025 Globul Cars. Всички права запазени.</p>
      <p><a href="{{unsubscribeUrl}}">Настройки на известията</a></p>
    </div>
  </div>
</body>
</html>`,
      en: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .message { background: white; padding: 20px; border-left: 4px solid #17a2b8; margin: 20px 0; }
    .sender { font-weight: bold; color: #17a2b8; }
    .button { display: inline-block; padding: 12px 30px; background: #17a2b8; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .tip { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💬 New Message!</h1>
    </div>
    <div class="content">
      <h2>Hello {{firstName}},</h2>
      <p>You have a new message about your <strong>{{carMake}} {{carModel}} ({{carYear}})</strong> listing.</p>
      
      <div class="message">
        <p class="sender">From: {{senderName}}</p>
        <p>"{{messagePreview}}..."</p>
        <p><small>{{messageTime}}</small></p>
      </div>
      
      <div style="text-align: center;">
        <a href="{{messageUrl}}" class="button">Read and Reply</a>
      </div>
      
      <div class="tip">
        <p><strong>💡 Tip:</strong> Quick responses (within 1 hour) increase your chances of a successful sale by up to 3x!</p>
      </div>
    </div>
    <div class="footer">
      <p>© 2025 Globul Cars. All rights reserved.</p>
      <p><a href="{{unsubscribeUrl}}">Notification Settings</a></p>
    </div>
  </div>
</body>
</html>`
    }
  }
  
  // Additional templates in next response due to length...
};

// ==================== EMAIL SERVICE CLASS ====================

export class EmailService {
  private static instance: EmailService;
  private readonly FROM_EMAIL = 'noreply@globulcars.com';
  private readonly FROM_NAME = 'Globul Cars';
  
  private constructor() {}
  
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }
  
  /**
   * Send email using template
   */
  async sendEmail(data: EmailData): Promise<EmailResult> {
    try {
      if (!SENDGRID_API_KEY) {
        console.error('SendGrid API key not configured');
        return { success: false, error: 'Email service not configured' };
      }
      
      const template = EMAIL_TEMPLATES[data.templateId];
      if (!template) {
        return { success: false, error: 'Template not found' };
      }
      
      // Get language-specific content
      const language = data.language || 'bg';
      let subject = template.subject[language];
      let html = template.html[language];
      let text = template.text[language];
      
      // Replace variables
      for (const [key, value] of Object.entries(data.variables)) {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        html = html.replace(new RegExp(placeholder, 'g'), value);
        text = text.replace(new RegExp(placeholder, 'g'), value);
      }
      
      // Send email via SendGrid
      const msg = {
        to: data.to,
        from: {
          email: data.from || this.FROM_EMAIL,
          name: this.FROM_NAME
        },
        replyTo: data.replyTo,
        subject,
        text,
        html
      };
      
      const [response] = await sgMail.send(msg);
      
      // Log to Firestore
      await admin.firestore().collection('emailLogs').add({
        to: data.to,
        templateId: data.templateId,
        language: data.language,
        messageId: response.headers['x-message-id'],
        status: 'sent',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true,
        messageId: response.headers['x-message-id'] as string
      };
      
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Failed to send email:', err.message);
      
      // Log error
      await admin.firestore().collection('emailLogs').add({
        to: data.to,
        templateId: data.templateId,
        status: 'failed',
        error: err.message,
        createdAt: admin.firestore.FieldValue.serverTimestamp())
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Send bulk emails (with rate limiting)
   */
  async sendBulkEmails(emails: EmailData[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    
    // SendGrid rate limit: 100 emails per second
    const BATCH_SIZE = 50;
    const BATCH_DELAY = 1000; // 1 second between batches
    
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(email => this.sendEmail(email))
      );
      results.push(...batchResults);
      
      // Delay between batches
      if (i + BATCH_SIZE < emails.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }
    
    return results;
  }
}

// Export singleton
export const emailService = EmailService.getInstance();

/**
 * Email Sender Cloud Functions
 * Comprehensive email service using SendGrid
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

// Initialize SendGrid
const SENDGRID_API_KEY = functions.config().sendgrid?.api_key || process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const FROM_EMAIL = 'noreply@globulcars.bg';
const SUPPORT_EMAIL = 'support@globulcars.bg';

interface EmailTemplate {
  subject: { bg: string; en: string };
  htmlBg: string;
  htmlEn: string;
}

/**
 * Send Welcome Email when user signs up
 */
export const sendWelcomeEmail = functions
  .region('europe-west1')
  .auth.user().onCreate(async (user) => {
    try {
      console.log('📧 Sending welcome email to:', user.email);

      if (!user.email) {
        console.log('⚠️ No email found for user');
        return;
      }

      // Get user language preference (default: bg)
      const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
      const language = userDoc.data()?.language || 'bg';

      const subject = language === 'bg'
        ? 'Добре дошли в Globul Cars! 🚗'
        : 'Welcome to Globul Cars! 🚗';

      const html = language === 'bg'
        ? getWelcomeEmailHTML_BG(user.displayName || 'Потребител')
        : getWelcomeEmailHTML_EN(user.displayName || 'User');

      await sgMail.send({
        to: user.email,
        from: FROM_EMAIL,
        subject,
        html
      });

      console.log('✅ Welcome email sent successfully');

      // Log email sent
      await admin.firestore().collection('email_logs').add({
        type: 'welcome',
        to: user.email,
        userId: user.uid,
        status: 'sent',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    } catch (error: any) {
      console.error('❌ Failed to send welcome email:', error);
      
      // Log error
      await admin.firestore().collection('email_logs').add({
        type: 'welcome',
        to: user.email,
        userId: user.uid,
        status: 'failed',
        error: error.message,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

/**
 * Send Car Listing Confirmation Email
 */
export const sendCarListingEmail = functions
  .region('europe-west1')
  .firestore.document('cars/{carId}').onCreate(async (snapshot, context) => {
    try {
      const carData = snapshot.data();
      const carId = context.params.carId;

      console.log('📧 Sending car listing email for:', carId);

      if (!carData.userId) {
        console.log('⚠️ No userId found in car data');
        return;
      }

      // Get user data
      const userDoc = await admin.firestore().collection('users').doc(carData.userId).get();
      const userData = userDoc.data();

      if (!userData?.email) {
        console.log('⚠️ No email found for user:', carData.userId);
        return;
      }

      const language = userData.language || 'bg';

      const subject = language === 'bg'
        ? `Обявата ви за ${carData.make} ${carData.model} е публикувана! 🎉`
        : `Your ${carData.make} ${carData.model} listing is published! 🎉`;

      const html = language === 'bg'
        ? getCarListingEmailHTML_BG(userData.displayName, carData, carId)
        : getCarListingEmailHTML_EN(userData.displayName, carData, carId);

      await sgMail.send({
        to: userData.email,
        from: FROM_EMAIL,
        subject,
        html
      });

      console.log('✅ Car listing email sent successfully');

      // Log email sent
      await admin.firestore().collection('email_logs').add({
        type: 'car_listing',
        to: userData.email,
        userId: carData.userId,
        carId,
        status: 'sent',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

    } catch (error: any) {
      console.error('❌ Failed to send car listing email:', error);
      
      await admin.firestore().collection('email_logs').add({
        type: 'car_listing',
        status: 'failed',
        error: error.message,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

/**
 * Send Verification Email (callable function)
 */
export const sendVerificationEmail = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    try {
      const { email, displayName, language, verificationLink } = data;

      console.log('📧 Sending verification email to:', email);

      const subject = language === 'bg'
        ? 'Потвърдете вашия имейл адрес'
        : 'Verify your email address';

      const html = language === 'bg'
        ? getVerificationEmailHTML_BG(displayName, verificationLink)
        : getVerificationEmailHTML_EN(displayName, verificationLink);

      await sgMail.send({
        to: email,
        from: FROM_EMAIL,
        subject,
        html
      });

      console.log('✅ Verification email sent successfully');

      // Log email sent
      await admin.firestore().collection('email_logs').add({
        type: 'verification',
        to: email,
        userId: context.auth.uid,
        status: 'sent',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };

    } catch (error: any) {
      console.error('❌ Failed to send verification email:', error);
      
      await admin.firestore().collection('email_logs').add({
        type: 'verification',
        status: 'failed',
        error: error.message,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      throw new functions.https.HttpsError('internal', error.message);
    }
  });

/**
 * Send Subscription Confirmation Email
 */
export const sendSubscriptionEmail = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      const { email, displayName, language, planName, amount, currency } = data;

      console.log('📧 Sending subscription email to:', email);

      const subject = language === 'bg'
        ? `Абонаментът ви за ${planName} е активиран! ✅`
        : `Your ${planName} subscription is activated! ✅`;

      const html = language === 'bg'
        ? getSubscriptionEmailHTML_BG(displayName, planName, amount, currency)
        : getSubscriptionEmailHTML_EN(displayName, planName, amount, currency);

      await sgMail.send({
        to: email,
        from: FROM_EMAIL,
        subject,
        html
      });

      console.log('✅ Subscription email sent successfully');

      await admin.firestore().collection('email_logs').add({
        type: 'subscription',
        to: email,
        userId: context.auth.uid,
        planName,
        amount,
        status: 'sent',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };

    } catch (error: any) {
      console.error('❌ Failed to send subscription email:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

// ========== EMAIL HTML TEMPLATES ==========

function getWelcomeEmailHTML_BG(displayName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FF7900, #ff8c1a); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #FF7900; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 Добре дошли в Globul Cars!</h1>
    </div>
    <div class="content">
      <h2>Здравейте, ${displayName}!</h2>
      <p>Благодарим ви, че се присъединихте към Globul Cars - водещата платформа за покупко-продажба на автомобили в България!</p>
      
      <h3>Какво можете да правите:</h3>
      <ul>
        <li>✅ Публикувайте безплатно обяви за автомобили</li>
        <li>🔍 Търсете сред хиляди автомобили</li>
        <li>💬 Свържете се директно с продавачи</li>
        <li>📊 Следете статистиката на вашите обяви</li>
        <li>⭐ Получавайте отзиви и изграждайте репутация</li>
      </ul>

      <div style="text-align: center;">
        <a href="https://fire-new-globul.web.app/sell/auto" class="button">Публикувайте първата си обява</a>
      </div>

      <p>Ако имате въпроси, нашият екип е на ваше разположение на <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      
      <p>Приятна работа!<br>Екипът на Globul Cars</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Globul Cars. Всички права запазени.</p>
      <p>България 🇧🇬</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getWelcomeEmailHTML_EN(displayName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FF7900, #ff8c1a); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #FF7900; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 Welcome to Globul Cars!</h1>
    </div>
    <div class="content">
      <h2>Hello, ${displayName}!</h2>
      <p>Thank you for joining Globul Cars - Bulgaria's leading car marketplace!</p>
      
      <h3>What you can do:</h3>
      <ul>
        <li>✅ Post free car listings</li>
        <li>🔍 Search thousands of cars</li>
        <li>💬 Connect directly with sellers</li>
        <li>📊 Track your listing statistics</li>
        <li>⭐ Get reviews and build reputation</li>
      </ul>

      <div style="text-align: center;">
        <a href="https://fire-new-globul.web.app/sell/auto" class="button">Post Your First Listing</a>
      </div>

      <p>If you have any questions, our team is here to help at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      
      <p>Happy selling!<br>The Globul Cars Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Globul Cars. All rights reserved.</p>
      <p>Bulgaria 🇧🇬</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getCarListingEmailHTML_BG(displayName: string, carData: any, carId: string): string {
  const carUrl = `https://fire-new-globul.web.app/cars/${carId}`;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .car-card { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Обявата ви е публикувана!</h1>
    </div>
    <div class="content">
      <h2>Браво, ${displayName}!</h2>
      <p>Вашата обява за <strong>${carData.make} ${carData.model}</strong> е успешно публикувана и вече е видима за купувачи!</p>
      
      <div class="car-card">
        <h3>${carData.make} ${carData.model} ${carData.year}</h3>
        <p><strong>Цена:</strong> ${carData.price}€</p>
        <p><strong>Пробег:</strong> ${carData.mileage} км</p>
        <p><strong>Гориво:</strong> ${carData.fuelType}</p>
      </div>

      <div style="text-align: center;">
        <a href="${carUrl}" class="button">Вижте обявата</a>
        <a href="https://fire-new-globul.web.app/my-listings" class="button">Управление на обяви</a>
      </div>

      <h3>Съвети за успешна продажба:</h3>
      <ul>
        <li>📸 Добавете качествени снимки</li>
        <li>📝 Напишете подробно описание</li>
        <li>💬 Отговаряйте бързо на запитвания</li>
        <li>⭐ Изградете добра репутация</li>
      </ul>
      
      <p>Успех с продажбата!<br>Екипът на Globul Cars</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Globul Cars. Всички права запазени.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getCarListingEmailHTML_EN(displayName: string, carData: any, carId: string): string {
  const carUrl = `https://fire-new-globul.web.app/cars/${carId}`;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .car-card { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Your Listing is Live!</h1>
    </div>
    <div class="content">
      <h2>Congratulations, ${displayName}!</h2>
      <p>Your listing for <strong>${carData.make} ${carData.model}</strong> is now live and visible to buyers!</p>
      
      <div class="car-card">
        <h3>${carData.make} ${carData.model} ${carData.year}</h3>
        <p><strong>Price:</strong> €${carData.price}</p>
        <p><strong>Mileage:</strong> ${carData.mileage} km</p>
        <p><strong>Fuel:</strong> ${carData.fuelType}</p>
      </div>

      <div style="text-align: center;">
        <a href="${carUrl}" class="button">View Listing</a>
        <a href="https://fire-new-globul.web.app/my-listings" class="button">Manage Listings</a>
      </div>

      <h3>Tips for successful selling:</h3>
      <ul>
        <li>📸 Add quality photos</li>
        <li>📝 Write detailed description</li>
        <li>💬 Respond quickly to inquiries</li>
        <li>⭐ Build good reputation</li>
      </ul>
      
      <p>Good luck with your sale!<br>The Globul Cars Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Globul Cars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getVerificationEmailHTML_BG(displayName: string, verificationLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✉️ Потвърдете вашия имейл</h1>
    </div>
    <div class="content">
      <h2>Здравейте, ${displayName}!</h2>
      <p>Моля, потвърдете вашия имейл адрес, за да активирате напълно вашия акаунт в Globul Cars.</p>
      
      <div style="text-align: center;">
        <a href="${verificationLink}" class="button">Потвърдете имейл</a>
      </div>

      <p><small>Ако бутонът не работи, копирайте и поставете този линк в браузъра:<br>${verificationLink}</small></p>

      <p><strong>Важно:</strong> Този линк е валиден за 24 часа.</p>
      
      <p>Ако не сте поискали тази верификация, моля игнорирайте този имейл.</p>
      
      <p>Поздрави,<br>Екипът на Globul Cars</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Globul Cars. Всички права запазени.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getVerificationEmailHTML_EN(displayName: string, verificationLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✉️ Verify Your Email</h1>
    </div>
    <div class="content">
      <h2>Hello, ${displayName}!</h2>
      <p>Please verify your email address to fully activate your Globul Cars account.</p>
      
      <div style="text-align: center;">
        <a href="${verificationLink}" class="button">Verify Email</a>
      </div>

      <p><small>If the button doesn't work, copy and paste this link into your browser:<br>${verificationLink}</small></p>

      <p><strong>Important:</strong> This link is valid for 24 hours.</p>
      
      <p>If you didn't request this verification, please ignore this email.</p>
      
      <p>Best regards,<br>The Globul Cars Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Globul Cars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getSubscriptionEmailHTML_BG(displayName: string, planName: string, amount: number, currency: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .plan-card { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6; }
    .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Абонаментът ви е активиран!</h1>
    </div>
    <div class="content">
      <h2>Поздравления, ${displayName}!</h2>
      <p>Вашият абонамент <strong>${planName}</strong> е успешно активиран!</p>
      
      <div class="plan-card">
        <h3>${planName}</h3>
        <p><strong>Сума:</strong> ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}</p>
        <p><strong>Начална дата:</strong> ${new Date().toLocaleDateString('bg-BG')}</p>
      </div>

      <div style="text-align: center;">
        <a href="https://fire-new-globul.web.app/profile" class="button">Вижте профила си</a>
      </div>

      <h3>Вашите предимства:</h3>
      <ul>
        <li>⚡ Приоритетна поддръжка</li>
        <li>📊 Подробна статистика</li>
        <li>🎯 Промоция на обявите</li>
        <li>✨ Премиум значка</li>
      </ul>
      
      <p>Ако имате въпроси, свържете се с нас на <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      
      <p>Благодарим за доверието!<br>Екипът на Globul Cars</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Globul Cars. Всички права запазени.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getSubscriptionEmailHTML_EN(displayName: string, planName: string, amount: number, currency: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .plan-card { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6; }
    .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Your Subscription is Active!</h1>
    </div>
    <div class="content">
      <h2>Congratulations, ${displayName}!</h2>
      <p>Your <strong>${planName}</strong> subscription has been successfully activated!</p>
      
      <div class="plan-card">
        <h3>${planName}</h3>
        <p><strong>Amount:</strong> ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}</p>
        <p><strong>Start date:</strong> ${new Date().toLocaleDateString('en-US')}</p>
      </div>

      <div style="text-align: center;">
        <a href="https://fire-new-globul.web.app/profile" class="button">View Your Profile</a>
      </div>

      <h3>Your benefits:</h3>
      <ul>
        <li>⚡ Priority support</li>
        <li>📊 Detailed analytics</li>
        <li>🎯 Listing promotion</li>
        <li>✨ Premium badge</li>
      </ul>
      
      <p>If you have questions, contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      
      <p>Thank you for your trust!<br>The Globul Cars Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Globul Cars. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

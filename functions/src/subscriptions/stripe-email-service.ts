// functions/src/subscriptions/stripe-email-service.ts
// Stripe-related email notifications
// Note: Email service temporarily disabled - will use Sendgrid API directly in future

interface SubscriptionEmailData {
  userEmail: string;
  userName: string;
  planName: string;
  amount: string;
  currency: string;
  nextBillingDate?: string;
  language: 'bg' | 'en';
}

/**
 * Placeholder for email sending
 * TODO: Implement with Sendgrid API
 */
async function sendEmailHelper(options: any) {
  console.log('Email service not yet implemented:', options);
  // Implement with Sendgrid or other email service
  return Promise.resolve();
}

export const sendSubscriptionActivatedEmail = async (data: SubscriptionEmailData) => {
  const { userEmail, userName, planName, amount, currency, nextBillingDate, language } = data;

  const subjects = {
    bg: `✅ Абонамент активиран - ${planName} - Globul Cars`,
    en: `✅ Subscription Activated - ${planName} - Globul Cars`,
  };

  const htmlTemplates = {
    bg: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">✅ Поздравления, ${userName}!</h2>
        <p>Вашият абонамент е успешно активиран.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Детайли на абонамента:</h3>
          <ul>
            <li><strong>План:</strong> ${planName}</li>
            <li><strong>Размер:</strong> ${amount} ${currency}/месец</li>
            <li><strong>Дата на следващо събиране:</strong> ${nextBillingDate || 'Отговаря на вашия график'}</li>
          </ul>
        </div>
        <p>Сега можете да се възползвате от всички премиум функции на вашия план.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://globul-cars.com/billing" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Управление на абонамента
          </a>
        </div>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Globul Cars Team<br>
          <a href="https://globul-cars.com">globul-cars.com</a>
        </p>
      </div>
    `,
    en: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">✅ Congratulations, ${userName}!</h2>
        <p>Your subscription has been successfully activated.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Subscription Details:</h3>
          <ul>
            <li><strong>Plan:</strong> ${planName}</li>
            <li><strong>Amount:</strong> ${amount} ${currency}/month</li>
            <li><strong>Next Billing Date:</strong> ${nextBillingDate || 'According to your schedule'}</li>
          </ul>
        </div>
        <p>You can now enjoy all premium features of your plan.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://globul-cars.com/billing" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Manage Subscription
          </a>
        </div>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Globul Cars Team<br>
          <a href="https://globul-cars.com">globul-cars.com</a>
        </p>
      </div>
    `,
  };

  return await sendEmailHelper({
    to: userEmail,
    templateId: 'subscription_activated',
    language,
    variables: {
      userName,
      planName,
      amount,
      currency,
      nextBillingDate: nextBillingDate || 'Your billing schedule'
    }
  });
};

export const sendPaymentFailedEmail = async (data: SubscriptionEmailData & { reason?: string }) => {
  const { userEmail, userName, planName, amount, currency, reason, language } = data;

  const subjects = {
    bg: `⚠️ Платежът е неудачен - ${planName} - Globul Cars`,
    en: `⚠️ Payment Failed - ${planName} - Globul Cars`,
  };

  const htmlTemplates = {
    bg: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ Проблем с платежа</h2>
        <p>Платежът за вашия абонамент ${planName} не успя.</p>
        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3>Детайли:</h3>
          <ul>
            <li><strong>План:</strong> ${planName}</li>
            <li><strong>Размер:</strong> ${amount} ${currency}</li>
            <li><strong>Причина:</strong> ${reason || 'Технически проблем'}</li>
          </ul>
        </div>
        <p>Моля, актуализирайте вашия метод на плащане, за да продължите да ползвате услугата.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://globul-cars.com/billing" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Актуализирайте платежния метод
          </a>
        </div>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Globul Cars Team<br>
          <a href="https://globul-cars.com">globul-cars.com</a>
        </p>
      </div>
    `,
    en: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ Payment Failed</h2>
        <p>The payment for your ${planName} subscription failed.</p>
        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3>Details:</h3>
          <ul>
            <li><strong>Plan:</strong> ${planName}</li>
            <li><strong>Amount:</strong> ${amount} ${currency}</li>
            <li><strong>Reason:</strong> ${reason || 'Technical issue'}</li>
          </ul>
        </div>
        <p>Please update your payment method to continue using the service.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://globul-cars.com/billing" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Update Payment Method
          </a>
        </div>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Globul Cars Team<br>
          <a href="https://globul-cars.com">globul-cars.com</a>
        </p>
      </div>
    `,
  };

  return await sendEmailHelper({
    to: userEmail,
    templateId: 'payment_failed',
    language,
    variables: {
      userName,
      planName,
      amount,
      currency,
      reason: reason || 'Card declined'
    }
  });
};

export const sendSubscriptionCanceledEmail = async (data: SubscriptionEmailData) => {
  const { userEmail, userName, planName, language } = data;

  const subjects = {
    bg: `📋 Абонамент отменен - Globul Cars`,
    en: `📋 Subscription Canceled - Globul Cars`,
  };

  const htmlTemplates = {
    bg: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #666;">📋 Абонамент отменен</h2>
        <p>Вашият абонамент ${planName} е отменен успешно.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Имате достъп до вашия план до края на текущия период на събирането.</p>
          <p>Ако желаете да се върнете, можете да се абонирате отново по всяко време.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://globul-cars.com/billing" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Абонирай се отново
          </a>
        </div>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Globul Cars Team<br>
          <a href="https://globul-cars.com">globul-cars.com</a>
        </p>
      </div>
    `,
    en: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #666;">📋 Subscription Canceled</h2>
        <p>Your ${planName} subscription has been canceled successfully.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>You have access to your plan until the end of the current billing period.</p>
          <p>If you'd like to return, you can re-subscribe anytime.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://globul-cars.com/billing" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Re-subscribe
          </a>
        </div>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Globul Cars Team<br>
          <a href="https://globul-cars.com">globul-cars.com</a>
        </p>
      </div>
    `,
  };

  return await sendEmailHelper({
    to: userEmail,
    templateId: 'subscription_canceled',
    language,
    variables: {
      userName,
      planName
    }
  });
};

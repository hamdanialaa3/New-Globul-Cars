/**
 * Admin Alerts Service — Koli One
 * Unified alert delivery to Slack, Telegram, and Email (SendGrid)
 * All 3 channels fire in parallel for maximum reliability.
 */

import { logger } from '../logger-service';
import { monitoringConfig } from '../../config/monitoring.config';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertCategory = 'security' | 'payment' | 'spam' | 'system' | 'ai' | 'moderation';

export interface AdminAlert {
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

const SEVERITY_EMOJI: Record<AlertSeverity, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  critical: '🚨',
};

const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  info: '#36a64f',
  warning: '#daa520',
  critical: '#dc3545',
};

// ================ Slack ================

async function sendSlackAlert(alert: AdminAlert): Promise<void> {
  const { webhookUrl } = monitoringConfig.alerts.slack;
  if (!webhookUrl) return;

  const payload = {
    channel: monitoringConfig.alerts.slack.channel,
    username: 'Koli One Alerts',
    icon_emoji: SEVERITY_EMOJI[alert.severity],
    attachments: [{
      color: SEVERITY_COLOR[alert.severity],
      title: `${SEVERITY_EMOJI[alert.severity]} [${alert.severity.toUpperCase()}] ${alert.title}`,
      text: alert.message,
      fields: [
        { title: 'Category', value: alert.category, short: true },
        { title: 'Time', value: new Date().toISOString(), short: true },
        ...Object.entries(alert.metadata || {}).map(([k, v]) => ({
          title: k,
          value: String(v),
          short: true,
        })),
      ],
      footer: 'Koli One Admin Alerts',
    }],
  };

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// ================ Telegram ================

async function sendTelegramAlert(alert: AdminAlert): Promise<void> {
  const { botToken, chatId } = monitoringConfig.alerts.telegram;
  if (!botToken || !chatId) return;

  const text = [
    `${SEVERITY_EMOJI[alert.severity]} *[${alert.severity.toUpperCase()}] ${alert.title}*`,
    '',
    alert.message,
    '',
    `Category: ${alert.category}`,
    `Time: ${new Date().toLocaleString('bg-BG', { timeZone: 'Europe/Sofia' })}`,
    ...Object.entries(alert.metadata || {}).map(([k, v]) => `${k}: ${v}`),
  ].join('\n');

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  });
}

// ================ Email (SendGrid) ================

async function sendEmailAlert(alert: AdminAlert): Promise<void> {
  const recipients = monitoringConfig.alerts.email;
  if (!recipients?.length) return;

  const sgApiKey = import.meta.env.VITE_SENDGRID_API_KEY;
  if (!sgApiKey) {
    logger.warn('SendGrid API key not configured, skipping email alert');
    return;
  }

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${SEVERITY_COLOR[alert.severity]}; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">${SEVERITY_EMOJI[alert.severity]} ${alert.title}</h2>
        <small>${alert.severity.toUpperCase()} | ${alert.category}</small>
      </div>
      <div style="background: #f8f9fa; padding: 24px; border: 1px solid #dee2e6; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; line-height: 1.5; color: #333;">${alert.message}</p>
        ${alert.metadata ? `
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            ${Object.entries(alert.metadata).map(([k, v]) => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: 600; color: #555;">${k}</td>
                <td style="padding: 8px; border-bottom: 1px solid #dee2e6; color: #333;">${v}</td>
              </tr>
            `).join('')}
          </table>
        ` : ''}
        <p style="color: #888; font-size: 12px; margin-top: 16px;">
          Time: ${new Date().toLocaleString('bg-BG', { timeZone: 'Europe/Sofia' })}<br/>
          Koli One Admin Alerts
        </p>
      </div>
    </div>
  `;

  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sgApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: recipients.map(email => ({ email })) }],
      from: { email: 'alerts@koli.one', name: 'Koli One Alerts' },
      subject: `[${alert.severity.toUpperCase()}] ${alert.title} — Koli One`,
      content: [{ type: 'text/html', value: htmlContent }],
    }),
  });
}

// ================ Unified Alert Dispatcher ================

export async function sendAdminAlert(alert: AdminAlert): Promise<void> {
  logger.warn(`[ADMIN ALERT] [${alert.severity}] ${alert.title}: ${alert.message}`);

  const results = await Promise.allSettled([
    sendSlackAlert(alert),
    sendTelegramAlert(alert),
    sendEmailAlert(alert),
  ]);

  results.forEach((result, idx) => {
    const channel = ['Slack', 'Telegram', 'Email'][idx];
    if (result.status === 'rejected') {
      logger.error(`Failed to send ${channel} alert`, result.reason as Error);
    }
  });
}

// Convenience methods
export const alertSecurity = (title: string, message: string, meta?: Record<string, unknown>) =>
  sendAdminAlert({ severity: 'critical', category: 'security', title, message, metadata: meta });

export const alertPayment = (title: string, message: string, meta?: Record<string, unknown>) =>
  sendAdminAlert({ severity: 'warning', category: 'payment', title, message, metadata: meta });

export const alertSpam = (title: string, message: string, meta?: Record<string, unknown>) =>
  sendAdminAlert({ severity: 'warning', category: 'spam', title, message, metadata: meta });

export const alertSystem = (title: string, message: string, meta?: Record<string, unknown>) =>
  sendAdminAlert({ severity: 'info', category: 'system', title, message, metadata: meta });

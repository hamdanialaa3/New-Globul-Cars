// UptimeRobot Monitoring Setup (FREE - 50 monitors)
// Monitor uptime, SSL, ports, keywords

/**
 * UptimeRobot FREE Tier Features:
 * - 50 monitors (website, port, keyword, ping, heartbeat)
 * - 5-minute check intervals
 * - SMS, email, webhook alerts
 * - SSL certificate monitoring
 * - Public status pages
 * - 90-day logs
 * 
 * Setup Guide (100% FREE):
 * 
 * 1. Create account at uptimerobot.com (FREE forever)
 * 
 * 2. Add monitors via Dashboard or API:
 */

// Monitor types (FREE)
export const MONITOR_TYPES = {
  HTTP_HTTPS: 1,      // Monitor website HTTP/HTTPS
  KEYWORD: 2,         // Check if keyword exists on page
  PING: 3,            // Ping server
  PORT: 4,            // Check if port is open
  HEARTBEAT: 5,       // Cron job monitoring
};

// Example monitors to create (copy to UptimeRobot Dashboard):
export const RECOMMENDED_MONITORS = [
  {
    name: 'Globul Cars - Homepage',
    type: 'HTTP(S)',
    url: 'https://globulcars.bg',
    interval: 5, // 5 minutes (FREE tier)
    alert_contacts: 'your-email@example.com',
    keyword_type: 'exists', // Optional: check if "Globul Cars" exists
    keyword_value: 'Globul Cars',
  },
  {
    name: 'Globul Cars - API Health',
    type: 'HTTP(S)',
    url: 'https://globulcars.bg/api/health', // Create health endpoint
    interval: 5,
    alert_contacts: 'your-email@example.com',
  },
  {
    name: 'Firebase - Firestore',
    type: 'HTTP(S)',
    url: 'https://firestore.googleapis.com', // Firebase status
    interval: 5,
    alert_contacts: 'your-email@example.com',
  },
  {
    name: 'Firebase - Auth',
    type: 'HTTP(S)',
    url: 'https://identitytoolkit.googleapis.com', // Firebase Auth status
    interval: 5,
    alert_contacts: 'your-email@example.com',
  },
  {
    name: 'SSL Certificate',
    type: 'HTTP(S)',
    url: 'https://globulcars.bg',
    interval: 1440, // Daily check (FREE)
    alert_contacts: 'your-email@example.com',
    ssl_expiry_reminder: 30, // Alert 30 days before expiry
  },
];

/**
 * Create health check endpoint (FREE - Firebase Cloud Function)
 * Deploy to Firebase Functions:
 */
export const HEALTH_CHECK_FUNCTION = `
// functions/src/health.ts
import * as functions from 'firebase-functions';
import { db } from './firebase-admin';

export const health = functions.https.onRequest(async (req, res) => {
  try {
    // Check Firestore connection
    const testDoc = await db.collection('_health').doc('test').get();
    
    // Check timestamp
    const now = new Date();
    
    res.status(200).json({
      status: 'ok',
      timestamp: now.toISOString(),
      services: {
        firestore: 'connected',
        functions: 'running',
      },
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
});
`;

/**
 * UptimeRobot API Integration (FREE - optional)
 * Use API to create monitors programmatically
 */
export const createMonitorViaAPI = async (monitorData: any) => {
  const API_KEY = process.env.REACT_APP_UPTIMEROBOT_API_KEY; // Get from uptimerobot.com
  
  if (!API_KEY) {
    console.warn('UptimeRobot API key not configured');
    return;
  }
  
  try {
    const response = await fetch('https://api.uptimerobot.com/v2/newMonitor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        api_key: API_KEY,
        format: 'json',
        type: monitorData.type,
        url: monitorData.url,
        friendly_name: monitorData.name,
        interval: monitorData.interval || '300', // 5 minutes
      }),
    });
    
    const data = await response.json();
    console.log('Monitor created:', data);
    return data;
  } catch (error) {
    console.error('Failed to create monitor:', error);
  }
};

/**
 * Get monitor status via API (FREE)
 */
export const getMonitorStatus = async () => {
  const API_KEY = process.env.REACT_APP_UPTIMEROBOT_API_KEY;
  
  if (!API_KEY) {
    console.warn('UptimeRobot API key not configured');
    return;
  }
  
  try {
    const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        api_key: API_KEY,
        format: 'json',
      }),
    });
    
    const data = await response.json();
    return data.monitors;
  } catch (error) {
    console.error('Failed to get monitors:', error);
  }
};

/**
 * Create public status page (FREE)
 * UptimeRobot provides free public status pages:
 * 
 * 1. Go to My Status Pages in UptimeRobot
 * 2. Click "Add Status Page"
 * 3. Select monitors to display
 * 4. Customize design (logo, colors)
 * 5. Get public URL: https://status.uptimerobot.com/your-page
 * 
 * Add link to your footer:
 * <a href="https://status.uptimerobot.com/globulcars">System Status</a>
 */

/**
 * Alert contact types (FREE):
 * - Email (unlimited)
 * - SMS (SMS credits needed - paid)
 * - Webhook (unlimited - FREE!)
 * - Slack (FREE)
 * - Discord (FREE)
 * - Telegram (FREE)
 */

/**
 * Webhook integration for custom alerts (FREE)
 * Receive alerts in Firebase Cloud Function
 */
export const WEBHOOK_HANDLER_FUNCTION = `
// functions/src/uptime-webhook.ts
import * as functions from 'firebase-functions';
import { sendEmail } from './email-service'; // Your email service

export const uptimeWebhook = functions.https.onRequest(async (req, res) => {
  const { monitorFriendlyName, monitorURL, alertType, alertDetails } = req.body;
  
  // Alert types: 1=down, 2=up, 3=SSL expiry warning
  if (alertType === 1) {
    // Site is DOWN - send urgent email
    await sendEmail({
      to: 'admin@globulcars.bg',
      subject: '🚨 URGENT: Site Down!',
      html: \`
        <h2>Site Down Alert</h2>
        <p><strong>Monitor:</strong> \${monitorFriendlyName}</p>
        <p><strong>URL:</strong> \${monitorURL}</p>
        <p><strong>Details:</strong> \${alertDetails}</p>
        <p><strong>Time:</strong> \${new Date().toISOString()}</p>
      \`,
    });
  }
  
  res.status(200).send('OK');
});
`;

/**
 * Setup checklist (100% FREE):
 * 
 * ✅ 1. Create UptimeRobot account (uptimerobot.com)
 * ✅ 2. Add 5 recommended monitors (homepage, API, Firebase, SSL)
 * ✅ 3. Setup email alerts
 * ✅ 4. Create health check endpoint (Firebase Function)
 * ✅ 5. Create public status page
 * ✅ 6. Add status page link to footer
 * ✅ 7. (Optional) Setup webhook for custom alerts
 * ✅ 8. (Optional) Integrate Slack/Discord notifications
 * 
 * Total cost: €0 forever (50 monitors, 5-min intervals)
 */

/**
 * Alternative FREE monitoring tools:
 * 
 * 1. Firebase Performance Monitoring (FREE - built-in)
 *    - Already included in Firebase SDK
 *    - Automatic page load tracking
 *    - Network request monitoring
 * 
 * 2. Google Cloud Monitoring (FREE tier)
 *    - 150 MB logs/month
 *    - Basic metrics
 *    - Uptime checks
 * 
 * 3. Cronitor (FREE - 3 monitors)
 *    - Cron job monitoring
 *    - API monitoring
 * 
 * 4. Freshping (FREE - 50 checks)
 *    - Similar to UptimeRobot
 *    - 1-minute intervals
 */

const uptimeMonitoring = {
  MONITOR_TYPES,
  RECOMMENDED_MONITORS,
  createMonitorViaAPI,
  getMonitorStatus,
};

export default uptimeMonitoring;

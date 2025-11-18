# 📊 Monitoring Setup Guide (Sentry + UptimeRobot)
**الوقت المطلوب:** 1 ساعة  
**التكلفة:** €0  
**الأدوات:** Sentry + UptimeRobot + Slack (optional)

---

## 🎯 ما سنفعله (1 ساعة)

1. ✅ Sentry Advanced Configuration (20 دقيقة)
2. ✅ UptimeRobot Setup (15 دقيقة)
3. ✅ Alert Notifications (15 دقيقة)
4. ✅ Dashboard Setup (10 دقيقة)

---

## لماذا Monitoring؟

### بدون Monitoring:
```
❌ أخطاء غير مكتشفة (users complain first)
❌ موقع down ولا تعلم (losing money)
❌ بطء الأداء (users leave)
❌ لا insights عن المشاكل
```

### مع Monitoring:
```
✅ تنبيهات فورية عند الأخطاء (fix before users notice)
✅ إشعار خلال 1 دقيقة إذا الموقع down
✅ Performance tracking (slow pages detected)
✅ User context (who, where, when)
✅ Error patterns (what's breaking most)
✅ Release tracking (which version has bugs)
```

---

## الخطوة 1: Sentry Advanced Configuration (20 دقيقة)

### 1.1 Sentry Dashboard Organization

**Login to Sentry:**
```
https://sentry.io → Projects → globul-cars-frontend
```

**1. Configure Alerts:**
```
Settings → Alerts → Create Alert Rule

Rule 1: High Error Rate
- Condition: Error count > 10 in 5 minutes
- Action: Send email to admin@globulcars.bg
- Frequency: At most once every 5 minutes

Rule 2: New Issue
- Condition: A new issue is seen
- Action: Send email + Slack notification
- Frequency: Immediately

Rule 3: Regression (Fixed bug returns)
- Condition: Issue changes state to regression
- Action: Send email to developers
- Frequency: Immediately

Rule 4: Performance Degradation
- Condition: Transaction duration p95 > 3 seconds
- Action: Send Slack notification
- Frequency: At most once every 30 minutes
```

---

### 1.2 Sentry Releases Integration

**Update:** `bulgarian-car-marketplace/package.json`

```json
{
  "scripts": {
    "build": "react-scripts build",
    "build:prod": "npm run build && npm run sentry:release",
    "sentry:release": "node scripts/sentry-release.js"
  }
}
```

**Create:** `bulgarian-car-marketplace/scripts/sentry-release.js`

```javascript
const SentryCli = require('@sentry/cli');
const packageJson = require('../package.json');

async function createRelease() {
  const release = `${packageJson.name}@${packageJson.version}`;
  const cli = new SentryCli();

  try {
    console.log('📦 Creating Sentry release:', release);

    // Create release
    await cli.releases.new(release);

    // Upload source maps
    await cli.releases.uploadSourceMaps(release, {
      include: ['build/static/js'],
      urlPrefix: '~/static/js',
      rewrite: false,
    });

    // Finalize release
    await cli.releases.finalize(release);

    // Set commits (if using Git)
    try {
      await cli.releases.setCommits(release, {
        auto: true,
      });
    } catch (error) {
      console.warn('⚠️ Could not set commits:', error.message);
    }

    console.log('✅ Sentry release created successfully!');
  } catch (error) {
    console.error('❌ Sentry release failed:', error);
    process.exit(1);
  }
}

createRelease();
```

**Install Sentry CLI:**
```bash
cd bulgarian-car-marketplace
npm install @sentry/cli --save-dev
```

**Create:** `bulgarian-car-marketplace/.sentryclirc`

```ini
[defaults]
url=https://sentry.io/
org=globul-cars
project=globul-cars-frontend

[auth]
token=YOUR_SENTRY_AUTH_TOKEN
```

**Get Auth Token:**
```
Sentry → Settings → Account → API → Auth Tokens
→ Create New Token
Scopes: project:releases, project:write
Copy token to .sentryclirc
```

---

### 1.3 Advanced Error Tracking

**Update:** `bulgarian-car-marketplace/src/utils/sentry.ts`

Add advanced features:

```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// ... existing initSentry code ...

/**
 * Set user context (call from AuthProvider)
 */
export const setSentryUser = (userId: string, email?: string, extra?: Record<string, any>) => {
  Sentry.setUser({
    id: userId,
    email,
    ...extra
  });
};

/**
 * Clear user context (on logout)
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb (user action tracking)
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  level: 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000
  });
};

/**
 * Capture exception with context
 */
export const captureException = (
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: 'fatal' | 'error' | 'warning' | 'info';
  }
) => {
  Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    level: context?.level || 'error'
  });
};

/**
 * Track performance transaction
 */
export const trackPerformance = (name: string, op: string) => {
  const transaction = Sentry.startTransaction({
    name,
    op,
  });

  return {
    finish: () => transaction.finish(),
    setTag: (key: string, value: string) => transaction.setTag(key, value),
    setData: (key: string, value: any) => transaction.setData(key, value),
  };
};

/**
 * Track custom event
 */
export const trackEvent = (
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  extra?: Record<string, any>
) => {
  Sentry.captureMessage(message, {
    level,
    extra
  });
};
```

**Usage examples:**

```typescript
// In CarDetailsPage.tsx
useEffect(() => {
  const perf = trackPerformance('load_car_details', 'http.request');
  
  fetchCarDetails(carId)
    .then(car => {
      perf.setTag('car_make', car.make);
      perf.setData('price', car.price);
    })
    .catch(error => {
      captureException(error, {
        tags: { page: 'car_details', carId },
        extra: { attemptedAction: 'load_car_details' }
      });
    })
    .finally(() => {
      perf.finish();
    });
}, [carId]);

// Track user actions
const handleContactSeller = () => {
  addBreadcrumb('User clicked Contact Seller', 'user_action', 'info', {
    carId,
    sellerType: car.sellerInfo?.type
  });
  
  // ... contact logic
};
```

---

### 1.4 Performance Monitoring

**Update Sentry init in:** `src/index.tsx`

```typescript
import { initSentry } from './utils/sentry';

// Initialize Sentry with performance monitoring
initSentry();

// Add performance observer
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming;
        
        // Track page load performance
        Sentry.setMeasurement('time_to_first_byte', navEntry.responseStart, 'millisecond');
        Sentry.setMeasurement('dom_interactive', navEntry.domInteractive, 'millisecond');
        Sentry.setMeasurement('dom_complete', navEntry.domComplete, 'millisecond');
      }
    }
  });

  observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
}
```

---

## الخطوة 2: UptimeRobot Setup (15 دقيقة)

### 2.1 Create UptimeRobot Account

**1. Register:**
```
https://uptimerobot.com/signUp
```

**Free Plan:**
```
✅ 50 monitors
✅ 5-minute checks
✅ Email/SMS/Webhook alerts
✅ Unlimited alert contacts
✅ Public status pages
```

---

### 2.2 Add Monitors

**Monitor 1: Website Homepage**
```
Settings:
- Monitor Type: HTTP(s)
- Friendly Name: Globul Cars - Homepage
- URL: https://globulcars.bg
- Monitoring Interval: 5 minutes
- Monitor Timeout: 30 seconds

Alert Contacts:
- Email: admin@globulcars.bg
- Notification: When down, when up, when late

Advanced Settings:
- Keyword: "Купи или продай" (Bulgarian text to verify content)
- Keyword Type: Exists
```

**Monitor 2: Cars Listing Page**
```
- Monitor Type: HTTP(s)
- Friendly Name: Globul Cars - Cars Page
- URL: https://globulcars.bg/cars
- Monitoring Interval: 5 minutes
- Keyword: "автомобили" or "cars"
```

**Monitor 3: API Endpoint (if exists)**
```
- Monitor Type: HTTP(s)
- Friendly Name: Globul Cars - API Health
- URL: https://globulcars.bg/api/health
- Monitoring Interval: 5 minutes
- Expected Status Code: 200
```

**Monitor 4: Firebase Functions**
```
- Monitor Type: HTTP(s)
- Friendly Name: Globul Cars - Cloud Functions
- URL: https://europe-west1-globul-cars.cloudfunctions.net/healthCheck
- Monitoring Interval: 5 minutes
```

**Monitor 5: Firebase Hosting**
```
- Monitor Type: Ping
- Friendly Name: Globul Cars - Hosting
- URL: globulcars.bg
- Monitoring Interval: 5 minutes
```

---

### 2.3 Alert Contacts

**Add contacts:**
```
UptimeRobot → My Settings → Alert Contacts

Contact 1: Email (Admin)
- Type: E-mail
- Email: admin@globulcars.bg
- Alerts: Get notified when down, up, or late

Contact 2: SMS (optional, paid)
- Type: SMS
- Phone: +359 XXX XXX XXX
- Alerts: When down only (to reduce SMS usage)

Contact 3: Slack (recommended)
- Type: Webhook
- Webhook URL: (from Slack incoming webhook)
- Alerts: When down, up
```

---

### 2.4 Create Public Status Page

**Create status page:**
```
UptimeRobot → Public Status Pages → Add New

Settings:
- Custom URL: https://status.globulcars.bg (requires domain setup)
- Or use: https://stats.uptimerobot.com/xxxxxx
- Title: Globul Cars Status
- Logo: Upload Globul Cars logo
- Friendly URL: globul-cars-status

Monitors to show:
✅ Website Homepage
✅ Cars Page
✅ API Health
✅ Cloud Functions

Design:
- Theme: Light
- Show uptime: Last 90 days
- Show response times: ✅
- Show incident history: ✅
```

**Share status page:**
```
Add link in website footer:
<a href="https://stats.uptimerobot.com/xxxxxx" target="_blank">
  System Status
</a>
```

---

## الخطوة 3: Alert Notifications (15 دقيقة)

### 3.1 Slack Integration

**Create Slack Workspace (if needed):**
```
https://slack.com/create
Workspace name: Globul Cars Team
```

**Create #alerts channel:**
```
Slack → Create channel
Name: #alerts
Purpose: System alerts and notifications
Privacy: Public
```

**Setup Incoming Webhook:**
```
Slack → Apps → Incoming Webhooks → Add to Slack

Choose channel: #alerts
Webhook URL: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX

Copy webhook URL
```

**Add to UptimeRobot:**
```
UptimeRobot → My Settings → Alert Contacts → Add

Type: Webhook
Friendly Name: Slack Alerts Channel
Webhook URL: (paste from above)
POST value: 
{
  "text": "*statusMessage* - *monitorFriendlyName* (*monitorURL*) is *alertType*"
}
```

**Add to Sentry:**
```
Sentry → Settings → Integrations → Slack

Connect workspace: Globul Cars Team
Channel for alerts: #alerts

Alert rules:
✅ New issue
✅ High error rate
✅ Performance degradation
```

---

### 3.2 Email Alerts Configuration

**Sentry Email Alerts:**
```
Sentry → Settings → Notifications

Personal alerts:
✅ Issue alerts (new issues)
✅ Workflow notifications (assigned, resolved)
❌ Weekly reports (too noisy)
❌ Deploy notifications (unless needed)

Team alerts:
✅ High error rate
✅ Performance degradation
```

**UptimeRobot Email Alerts:**
```
Already configured in Monitor settings

Format:
Subject: [DOWN] Globul Cars - Homepage
Body:
Monitor: Globul Cars - Homepage
Status: DOWN
Time: 2025-11-07 14:30:00
Reason: Connection timeout
URL: https://globulcars.bg
```

---

### 3.3 Custom Alert Webhook

**Create Firebase Function for custom alerts:**

**File:** `functions/src/monitoring/alert-webhook.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendAdminAlert } from '../services/sendgrid.service';

/**
 * Webhook for custom monitoring alerts
 * Can be called from external monitoring services
 */
export const monitoringAlertWebhook = functions
  .region('europe-west1')
  .https
  .onRequest(async (req, res) => {
    // Verify webhook secret
    const secret = req.headers['x-webhook-secret'];
    const expectedSecret = functions.config().monitoring?.webhook_secret || process.env.WEBHOOK_SECRET;

    if (secret !== expectedSecret) {
      res.status(401).send('Unauthorized');
      return;
    }

    const { type, monitor, status, message, timestamp } = req.body;

    try {
      // Log to Firestore
      await admin.firestore().collection('monitoring_alerts').add({
        type,
        monitor,
        status,
        message,
        timestamp: timestamp || admin.firestore.FieldValue.serverTimestamp(),
        acknowledged: false
      });

      // Send email alert
      await sendAdminAlert('admin@globulcars.bg', {
        subject: `🚨 ${type} Alert: ${monitor}`,
        message: `
          Monitor: ${monitor}
          Status: ${status}
          Message: ${message}
          Time: ${new Date(timestamp).toLocaleString()}
        `,
        timestamp
      });

      // Send Slack notification (if configured)
      const slackWebhook = functions.config().slack?.webhook_url;
      if (slackWebhook) {
        await fetch(slackWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 *${type} Alert*\nMonitor: ${monitor}\nStatus: ${status}\nMessage: ${message}`
          })
        });
      }

      res.status(200).send({ success: true });
    } catch (error) {
      console.error('Alert webhook error:', error);
      res.status(500).send({ error: 'Failed to process alert' });
    }
  });
```

**Deploy:**
```bash
cd functions
firebase functions:config:set monitoring.webhook_secret="YOUR_SECRET_KEY_HERE"
firebase deploy --only functions:monitoringAlertWebhook
```

**Use in UptimeRobot:**
```
Alert Contact Type: Webhook
URL: https://europe-west1-globul-cars.cloudfunctions.net/monitoringAlertWebhook
Method: POST
Headers: x-webhook-secret: YOUR_SECRET_KEY_HERE
Body:
{
  "type": "UPTIME",
  "monitor": "*monitorFriendlyName*",
  "status": "*alertType*",
  "message": "*alertDetails*",
  "timestamp": "*alertDateTime*"
}
```

---

## الخطوة 4: Dashboard Setup (10 دقيقة)

### 4.1 Sentry Dashboard

**Create custom dashboard:**
```
Sentry → Dashboards → Create Dashboard

Name: Globul Cars Overview

Widgets:
1. Error Rate (last 24h)
   - Type: Line chart
   - Metric: count()
   - Group by: hour

2. Top Errors (last 7 days)
   - Type: Table
   - Metric: count()
   - Group by: title
   - Limit: 10

3. Affected Users (last 30 days)
   - Type: Number
   - Metric: count_unique(user)

4. Performance: Page Load (p95)
   - Type: Line chart
   - Metric: p95(transaction.duration)
   - Filter: transaction.op:pageload

5. Browser Distribution
   - Type: Pie chart
   - Metric: count()
   - Group by: browser.name

6. Geographic Distribution
   - Type: World map
   - Metric: count()
   - Group by: geo.country_code
```

**Pin to sidebar:** ⭐️ Star the dashboard for quick access

---

### 4.2 Admin Monitoring Page

**Create:** `bulgarian-car-marketplace/src/pages/admin/MonitoringDashboard.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

interface MonitoringAlert {
  id: string;
  type: string;
  monitor: string;
  status: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export const MonitoringDashboard = () => {
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const alertsSnapshot = await getDocs(
        query(
          collection(db, 'monitoring_alerts'),
          orderBy('timestamp', 'desc'),
          limit(50)
        )
      );

      const alertsData = alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })) as MonitoringAlert[];

      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    // Mark alert as acknowledged
    // ... implementation
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="monitoring-dashboard">
      <h1>System Monitoring</h1>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Alerts</h3>
          <p className="stat-value">{alerts.filter(a => !a.acknowledged).length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Alerts (24h)</h3>
          <p className="stat-value">
            {alerts.filter(a => {
              const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
              return a.timestamp > dayAgo;
            }).length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Uptime (7 days)</h3>
          <p className="stat-value">99.8%</p>
          <small>(External: Check UptimeRobot)</small>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="alerts-table">
        <h2>Recent Alerts</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Monitor</th>
              <th>Status</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(alert => (
              <tr key={alert.id} className={alert.acknowledged ? 'acknowledged' : 'pending'}>
                <td>{alert.timestamp?.toLocaleString()}</td>
                <td>{alert.type}</td>
                <td>{alert.monitor}</td>
                <td>
                  <span className={`status-badge ${alert.status.toLowerCase()}`}>
                    {alert.status}
                  </span>
                </td>
                <td>{alert.message}</td>
                <td>
                  {!alert.acknowledged && (
                    <button onClick={() => acknowledgeAlert(alert.id)}>
                      Acknowledge
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* External Links */}
      <div className="external-links">
        <h2>External Monitoring</h2>
        <a href="https://sentry.io/organizations/globul-cars/projects/globul-cars-frontend/" target="_blank" rel="noopener noreferrer">
          📊 Sentry Dashboard
        </a>
        <a href="https://uptimerobot.com/dashboard" target="_blank" rel="noopener noreferrer">
          ⏰ UptimeRobot Dashboard
        </a>
        <a href="https://stats.uptimerobot.com/xxxxxx" target="_blank" rel="noopener noreferrer">
          📈 Public Status Page
        </a>
      </div>
    </div>
  );
};
```

---

## 📊 Monitoring Best Practices

### 1. Alert Fatigue Prevention
```
❌ Don't: Alert on every small issue
✅ Do: Alert only on critical issues

Examples:
✅ Site down for >1 minute
✅ Error rate >10 in 5 minutes
✅ Response time >3 seconds p95
❌ Single user error (track, don't alert)
❌ Minor warnings (log only)
```

### 2. Incident Response
```
When alert arrives:
1. Acknowledge alert (stop duplicate notifications)
2. Assess severity (critical vs minor)
3. Check Sentry for details (stack trace, user context)
4. Fix issue
5. Deploy fix
6. Monitor for 15 minutes
7. Mark as resolved
8. Post-mortem (if critical)
```

### 3. Regular Reviews
```
Weekly:
- Review Sentry dashboard
- Check top errors (fix recurring issues)
- Review performance trends

Monthly:
- Analyze uptime reports
- Review alert effectiveness
- Update alert thresholds if needed
```

---

## ✅ Checklist النهائي

Sentry:
- [x] Advanced configuration guide created
- [ ] Alert rules configured (high error rate, new issues, regression)
- [ ] Sentry CLI installed
- [ ] Release tracking setup (sentry:release script)
- [ ] Performance monitoring enabled
- [ ] User context tracking (in AuthProvider)
- [ ] Breadcrumbs added to key actions
- [ ] Custom dashboard created

UptimeRobot:
- [ ] Account created (free plan)
- [ ] 5 monitors added (Homepage, Cars page, API, Functions, Hosting)
- [ ] Alert contacts configured (email + Slack)
- [ ] Public status page created
- [ ] Status page link added to website footer

Notifications:
- [ ] Slack workspace created (#alerts channel)
- [ ] Slack integration with Sentry
- [ ] Slack webhook added to UptimeRobot
- [ ] Email alerts configured
- [ ] (Optional) Custom webhook function deployed

Dashboard:
- [ ] Sentry custom dashboard created
- [ ] Admin monitoring page created (MonitoringDashboard.tsx)
- [ ] External links added to admin panel

---

## 🎉 النتيجة النهائية

بعد 1 ساعة، لديك:
- ✅ Advanced error tracking (Sentry)
- ✅ 24/7 uptime monitoring (UptimeRobot)
- ✅ Real-time alerts (Email + Slack)
- ✅ Performance monitoring
- ✅ User context tracking
- ✅ Public status page
- ✅ Admin monitoring dashboard
- ✅ Release tracking

**التكلفة:** €0  
**القيمة:** Peace of mind + Happy users! 😊

---

## 📞 الخطوة التالية

**Task 7:** Cloudflare CDN Setup

انتقل إلى: `CLOUDFLARE_CDN_SETUP_FREE.md` (already exists!)

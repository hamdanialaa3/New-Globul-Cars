# 🔔 Notifications System Documentation
## نظام الإشعارات - توثيق شامل للت

واصل متعدد القنوات

> **Last Updated:** January 23, 2026  
> **Version:** 0.5.0  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Firebase Cloud Messaging (FCM)](#fcm)
3. [Push Notifications Architecture](#push)
4. [Multi-Channel Delivery](#channels)
5. [Notification Preferences](#preferences)
6. [Batch Operations](#batch)
7. [Statistics & Analytics](#stats)

---

## 🎯 Overview

The Notifications System is a sophisticated multi-channel communication platform that keeps users engaged through push notifications, emails, SMS, and in-app alerts. It features advanced preference management, quiet hours, category filtering, and batch operations.

### Key Features
- **Multi-Channel**: Push, Email, SMS, In-App
- **Smart Routing**: FCM token management across multiple devices
- **Preference Engine**: Per-category controls and quiet hours
- **Batch Operations**: Mark all as read, archive, delete
- **Analytics**: Track delivery, open rates, and engagement

---

## 📱 Firebase Cloud Messaging (FCM) {#fcm}

The foundation of the push notification system.

### Service Architecture
**Location:** `src/services/notifications/fcm.service.ts`

### Token Management

#### Registration Flow
```typescript
// 1. User enables notifications
const hasPermission = await fcmService.requestPermission();

// 2. Get FCM token
const token = await fcmService.getToken(userId);

// 3. Token saved to Firestore
users/{userId}/fcmTokens/{token} = {
  token,
  createdAt,
  lastUsed,
  deviceInfo: { userAgent, platform }
}
```

#### Multi-Device Support
- Each device gets unique FCM token
- Tokens stored as subcollection under user document
- Automatic cleanup of expired/inactive tokens
- Push sent to ALL active tokens (multi-device delivery)

### Permission Handling
**Browser API:** `Notification.requestPermission()`

Supported States:
- `granted`: User accepted, can send notifications
- `denied`: User rejected, cannot send
- `default`: Not asked yet

### Foreground Message Listener
```typescript
fcmService.onForegroundMessage((payload) => {
  // Display browser notification
  // Dispatch custom event for app
  window.dispatchEvent(new CustomEvent('fcm-message', { detail: payload }));
});
```

---

## 🚀 Push Notifications Architecture {#push}

Built on top of FCM for user-facing features.

### Service Layer
**Location:** `src/services/push-notifications.service.ts`

### React Hook Integration
```typescript
const {
  isEnabled,
  token,
  isSupported,
  permissionStatus,
  enableNotifications,
  disableNotifications
} = usePushNotifications(userId);
```

### Notification Display
**Browser Notification API:**
- Title, body, icon customization
- Badge for app icon
- Tag-based replacement (prevents spam)
- `requireInteraction: false` (auto-dismiss)

### Token Lifecycle
1. **Registration**: User enables → Token generated → Saved to Firestore
2. **Usage**: Backend sends FCM message → Device receives → App displays
3. **Logout**: Token removed from user document
4. **Expiry**: Firebase handles token refresh automatically

---

## 📧 Multi-Channel Delivery {#channels}

Beyond push notifications, the system supports multiple delivery methods.

### Channel Types

| Channel | Service | Use Case | Priority |
|---------|---------|----------|----------|
| **Push** | FCM | Real-time alerts | High |
| **Email** | `email-service.ts` | Detailed updates, digests | Medium |
| **SMS** | Twilio/external | Critical alerts, 2FA | Critical |
| **In-App** | Firestore collection | Persistent notification center | Low |

### Email Notifications
**Service:** `src/services/email-service.ts`

Triggers:
- New message received
- Offer on your car
- Sale completed
- Weekly activity digest
- Account security alerts

### SMS Notifications
Used sparingly for:
- Two-factor authentication codes
- Critical account changes (password reset)
- High-value offer alerts (>€20,000)

---

## ⚙️ Notification Preferences {#preferences}

Advanced user control over what, when, and how they receive notifications.

### Preference Model
**Service:** `src/services/notification-enhancements.service.ts`

```typescript
interface NotificationPreferences {
  userId: string;
  categories: {
    messages: boolean;
    offers: boolean;
    reviews: boolean;
    favorites: boolean;
    sales: boolean;
    system: boolean;
    promotions: boolean;
  };
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  enableSmsNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: '22:00';  // 10 PM
    endTime: '08:00';    // 8 AM
    timezone: 'Europe/Sofia';
  };
}
```

### Quiet Hours Logic
**Function:** `isInQuietHours(preferences)`

- Checks current time against user's quiet hours window
- System notifications bypass quiet hours (e.g., security alerts)
- All other categories are suppressed during quiet period

### Category Filtering
Users can toggle each category independently:
- **Messages**: Chat and direct contact requests
- **Offers**: Price negotiations on listings
- **Reviews**: Seller rating notifications
- **Favorites**: Updates on saved cars
- **Sales**: Transaction confirmations
- **System**: Platform announcements
- **Promotions**: Marketing (opt-in only)

### Smart Delivery Decision
```typescript
if (!preferences.shouldSendNotification(category)) {
  return; // Don't send
}

// Check which channels are enabled
if (preferences.enablePushNotifications) sendPush();
if (preferences.enableEmailNotifications) sendEmail();
```

---

## 📦 Batch Operations {#batch}

Efficient bulk actions on notifications.

### Service Methods
**Service:** `BatchNotificationService`

#### Mark Multiple as Read
```typescript
await batchNotifications.markMultipleAsRead(notificationIds);
// Firestore batch write for efficiency
```

#### Archive Multiple
```typescript
await batchNotifications.archiveMultiple(notificationIds);
// Moves to archived state, hidden from main view
```

#### Delete Multiple
```typescript
await batchNotifications.deleteMultiple(notificationIds);
// Permanent deletion from Firestore
```

### Use Cases
- "Mark all as read" button in notification center
- Bulk archive of old promotional notifications
- Clear all notifications from a specific sender

---

## 📊 Statistics & Analytics {#stats}

Track notification performance and user engagement.

### Service Layer
**Service:** `NotificationStatisticsService`

### Available Metrics

#### User Stats
```typescript
const stats = await notificationStats.getStats(userId);
// Returns:
{
  total: 156,
  unread: 12,
  byCategory: {
    messages: 45,
    offers: 32,
    reviews: 8,
    ...
  },
  lastWeek: 23,
  lastMonth: 89
}
```

#### Trends Over Time
```typescript
const trends = await notificationStats.getTrends(userId, 30);
// Returns:
{
  '2026-01-23': 5,
  '2026-01-22': 12,
  '2026-01-21': 8,
  ...
}
```

### Admin Dashboard Integration
Statistics feed into:
- User engagement reports
- Notification delivery health monitoring
- Category performance analysis (which types get highest open rates)

---

## 🔧 Technical Implementation

### Firestore Collections

#### notifications
```
notifications/{notificationId}
  - userId: string
  - category: 'messages' | 'offers' | ...
  - title: string
  - body: string
  - isRead: boolean
  - readAt: Timestamp | null
  - isArchived: boolean
  - createdAt: Timestamp
  - metadata: object
```

#### notification_preferences
```
notification_preferences/{userId}
  - categories: object
  - enableEmailNotifications: boolean
  - quietHours: object
  - lastUpdated: Timestamp
```

### Real-Time Updates
- Firestore snapshot listeners for live notification count
- Redux/Context API for global notification state
- Browser Notification API for desktop alerts

---

## 🔗 Related Documentation

- [06_Messaging_System.md](./06_Messaging_System.md) - Chat notifications trigger
- [02_User_Authentication_and_Profile.md](./02_User_Authentication_and_Profile.md) - User preferences
- [10_Performance_Monitoring_and_Audit.md](./10_Performance_Monitoring_and_Audit.md) - Notification delivery monitoring

---

**Last Updated:** January 23, 2026  
**Maintained By:** Communications & Engagement Team  
**Status:** ✅ Active Documentation

# Google Consent Mode v2 Setup
# إعداد Google Consent Mode v2

## Overview / نظرة عامة

Google Consent Mode v2 has been successfully configured for GDPR compliance. It allows you to send consent signals from users in regions where consent regulations apply (such as EEA) to share their personal data with Google.

تم تكوين Google Consent Mode v2 بنجاح للامتثال لـ GDPR. يسمح لك بإرسال إشارات الموافقة من المستخدمين في المناطق التي تنطبق فيها لوائح الموافقة (مثل EEA) لمشاركة بياناتهم الشخصية مع Google.

## Implementation / التنفيذ

### Code Location / موقع الكود

Consent Mode is initialized in `public/index.html` **BEFORE** any Google tags load:

يتم تهيئة Consent Mode في `public/index.html` **قبل** تحميل أي علامات Google:

```html
<!-- Google Consent Mode v2 - MUST BE FIRST -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  
  // Consent mode default (GDPR-compliant - all denied until user consent)
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'granted',
    'personalization_storage': 'denied',
    'security_storage': 'granted',
    'wait_for_update': 500
  });
  
  // Apply saved consent preferences if available
  // ... (code to restore saved preferences)
</script>
```

## Consent Parameters / معاملات الموافقة

### Required Parameters (for EEA users) / المعاملات المطلوبة (لمستخدمي EEA)

1. **`ad_storage`**: Controls storage for advertising purposes
   - Default: `'denied'` (GDPR-compliant)
   - Updates to `'granted'` when user accepts marketing cookies

2. **`ad_user_data`**: Controls sending user data to Google for advertising
   - Default: `'denied'`
   - Updates to `'granted'` when user accepts marketing cookies

3. **`ad_personalization`**: Controls ad personalization
   - Default: `'denied'`
   - Updates to `'granted'` when user accepts marketing cookies

### Optional Parameters / المعاملات الاختيارية

4. **`analytics_storage`**: Controls storage for analytics
   - Default: `'denied'`
   - Updates to `'granted'` when user accepts analytics cookies

5. **`functionality_storage`**: Required for site functionality
   - Default: `'granted'` (always granted)

6. **`personalization_storage`**: Controls personalization storage
   - Default: `'denied'`

7. **`security_storage`**: Required for security
   - Default: `'granted'` (always granted)

8. **`wait_for_update`**: Wait time (ms) before firing tags
   - Default: `500` (500ms)

## How It Works / كيف يعمل

1. **Page Load** / تحميل الصفحة:
   - Consent Mode initializes with all consents `'denied'`
   - Google tags wait 500ms before firing
   - User sees consent banner

2. **User Accepts** / قبول المستخدم:
   - User clicks "Accept All" or selects specific cookies
   - `updateConsent()` is called with granted permissions
   - Google tags fire with appropriate permissions

3. **User Rejects** / رفض المستخدم:
   - User clicks "Reject All"
   - All consents remain `'denied'`
   - Google uses conversion modeling (no cookies)

4. **Persistence** / الاستمرارية:
   - User preferences saved to `localStorage`
   - Preferences valid for 7 days
   - Automatically restored on next visit

## Integration with Cookie Banner / التكامل مع بانر الموافقة

### Update Consent When User Accepts / تحديث الموافقة عند قبول المستخدم

```typescript
import { updateConsent, grantAllConsents, denyAllConsents } from './utils/consent-mode';

// User accepts all cookies
grantAllConsents();

// User accepts specific cookies
updateConsent({
  analytics_storage: 'granted',
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted'
});

// User rejects all cookies
denyAllConsents();
```

### Example Cookie Banner Integration / مثال على تكامل بانر الموافقة

```typescript
// In your cookie banner component
const handleAcceptAll = () => {
  grantAllConsents();
  // Hide banner, save preference, etc.
};

const handleRejectAll = () => {
  denyAllConsents();
  // Hide banner, save preference, etc.
};

const handleCustomSettings = (settings: ConsentSettings) => {
  updateConsent(settings);
  // Hide banner, save preference, etc.
};
```

## Testing Consent Mode / اختبار Consent Mode

### Using Tag Assistant / استخدام Tag Assistant

1. Go to: https://tagassistant.google.com/
2. Enter your website URL
3. Click the consent banner to accept/reject cookies
4. In Tag Assistant, check **"Event consent state"**
5. Verify consent signals are recorded correctly

### Using Browser Console / استخدام Console المتصفح

```javascript
// Check current consent state
console.log(window.dataLayer);

// Manually update consent (for testing)
gtag('consent', 'update', {
  'ad_storage': 'granted',
  'ad_user_data': 'granted',
  'ad_personalization': 'granted'
});
```

### Using Google Analytics DebugView / استخدام Google Analytics DebugView

1. Go to: Google Analytics → Admin → DebugView
2. Visit your website
3. Check consent signals in event parameters
4. Verify `ad_storage`, `ad_user_data`, etc. are set correctly

## Benefits / الفوائد

1. **GDPR Compliance** / الامتثال لـ GDPR:
   - All consents denied by default
   - User must explicitly consent
   - Complies with EEA regulations

2. **Conversion Modeling** / نمذجة التحويل:
   - Google fills gaps when cookies are denied
   - Estimates conversions using machine learning
   - Maintains measurement accuracy

3. **Ad Personalization** / تخصيص الإعلانات:
   - Personalized ads when user consents
   - Non-personalized ads when user denies
   - Respects user privacy choices

4. **Measurement** / القياس:
   - Analytics data collected with consent
   - Conversion modeling when consent denied
   - Accurate performance measurement

## Troubleshooting / استكشاف الأخطاء

### Consent Not Working? / الموافقة لا تعمل؟

1. **Check Code Order**:
   - Consent Mode must be BEFORE GTM and gtag.js
   - Verify in `public/index.html`

2. **Check Browser Console**:
   - Look for errors in console
   - Verify `dataLayer` exists: `console.log(window.dataLayer)`

3. **Check Tag Assistant**:
   - Use Tag Assistant to verify consent signals
   - Check "Event consent state" section

4. **Clear Cache**:
   - Clear browser cache and localStorage
   - Test in incognito mode

### Tags Not Firing? / العلامات لا تعمل؟

1. **Check Consent State**:
   - Verify consent is granted for required parameters
   - Check `wait_for_update` delay (500ms)

2. **Check Ad Blockers**:
   - Ad blockers may block Google tags
   - Test with ad blocker disabled

3. **Check Network Tab**:
   - Verify requests to `googletagmanager.com`
   - Check for blocked requests

## Related Documentation / الوثائق ذات الصلة

- [Google Tag Setup](./google-tag-setup.md)
- [Google Tag Manager Setup](./google-tag-manager-setup.md)
- [Google Analytics Data Deletion](./google-analytics-data-deletion.md)
- [Google Consent Mode Documentation](https://developers.google.com/tag-platform/security/guides/consent)

## Next Steps / الخطوات التالية

1. ✅ Consent Mode initialized in HTML
2. ✅ Default consent state set (all denied)
3. ✅ Integration with cookie banner
4. ⏭️ Test consent signals using Tag Assistant
5. ⏭️ Monitor conversion modeling in GA4
6. ⏭️ Verify GDPR compliance


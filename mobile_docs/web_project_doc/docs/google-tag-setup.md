# Google Tag (gtag.js) Setup
# إعداد Google Tag

## Overview / نظرة عامة

Google tag (gtag.js) has been successfully installed in the project.

تم تثبيت Google tag (gtag.js) بنجاح في المشروع.

## Measurement ID / معرف القياس

- **New Measurement ID**: `G-R8JY5KM421`
- **Previous Measurement ID**: `G-TDRZ4Z3D7Z` (deprecated)

## Implementation / التنفيذ

### Code Location / موقع الكود

The Google tag has been added to `public/index.html` in the `<head>` section, immediately after Google Tag Manager:

تم إضافة Google tag إلى `public/index.html` في قسم `<head>`، مباشرة بعد Google Tag Manager:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-R8JY5KM421"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-R8JY5KM421');
</script>
```

## Integration with GTM / التكامل مع GTM

Both Google Tag Manager and Google tag (gtag.js) are now active:

كل من Google Tag Manager و Google tag (gtag.js) نشطان الآن:

1. **Google Tag Manager** (`GTM-MKZSPCNC`): For managing multiple tags
2. **Google tag** (`G-R8JY5KM421`): Direct GA4 tracking

### Best Practice / أفضل الممارسات

**Note**: If you're using GTM to manage GA4, you can configure GA4 tag in GTM Dashboard instead of using gtag.js directly. However, having both is fine and won't cause conflicts.

**ملاحظة**: إذا كنت تستخدم GTM لإدارة GA4، يمكنك تكوين علامة GA4 في GTM Dashboard بدلاً من استخدام gtag.js مباشرة. ومع ذلك، وجود كلاهما جيد ولن يسبب تعارضات.

## Updated Files / الملفات المحدثة

1. **`public/index.html`**: Added Google tag code
2. **`src/utils/google-analytics.ts`**: Updated default Measurement ID
3. **`src/services/analytics/google-analytics-data-deletion.service.ts`**: Updated Measurement ID
4. **`src/firebase/firebase-config.ts`**: Updated Measurement ID
5. **`src/config/google-cloud.config.ts`**: Updated GA4 ID default

## Verification / التحقق

### Test Google Tag / اختبار Google Tag

1. **Using Google Analytics DebugView**:
   - Go to: Google Analytics → Admin → DebugView
   - Visit your website
   - You should see events in real-time

2. **Using Browser Console**:
   - Open DevTools (F12)
   - Check if gtag is loaded: `console.log(typeof window.gtag)`
   - Should return: `"function"`

3. **Using Google Tag Assistant**:
   - Install "Tag Assistant Legacy" Chrome extension
   - Visit your website
   - Should detect Google tag: `G-R8JY5KM421`

## Environment Variables / متغيرات البيئة

You can override the Measurement ID using environment variables:

يمكنك تجاوز معرف القياس باستخدام متغيرات البيئة:

```env
# .env file
REACT_APP_FIREBASE_MEASUREMENT_ID=G-R8JY5KM421
REACT_APP_GA4_MEASUREMENT_ID=G-R8JY5KM421
```

## Consent Mode / وضع الموافقة

The project uses **Consent Mode v2** for GDPR compliance. The Google tag respects user consent settings.

المشروع يستخدم **Consent Mode v2** للامتثال لـ GDPR. Google tag يحترم إعدادات موافقة المستخدم.

## Next Steps / الخطوات التالية

1. ✅ Google tag installed in `public/index.html`
2. ✅ Measurement ID updated across all files
3. ⏭️ Test tracking in Google Analytics DebugView
4. ⏭️ Configure events and conversions in GA4
5. ⏭️ Set up Consent Mode (if not already done)

## Troubleshooting / استكشاف الأخطاء

### Google Tag Not Detected?

1. Check browser console for errors
2. Verify Measurement ID is correct: `G-R8JY5KM421`
3. Check if ad blockers are blocking Google Analytics
4. Verify code is in correct location (in `<head>`)

### Events Not Tracking?

1. Check Consent Mode settings
2. Verify events are being sent: `window.dataLayer`
3. Check Google Analytics DebugView
4. Ensure Measurement ID matches in GA4 dashboard

## Related Documentation / الوثائق ذات الصلة

- [Google Tag Manager Setup](./google-tag-manager-setup.md)
- [Google Analytics BigQuery Export](./google-analytics-bigquery-export.md)
- [Google Analytics Data Deletion](./google-analytics-data-deletion.md)


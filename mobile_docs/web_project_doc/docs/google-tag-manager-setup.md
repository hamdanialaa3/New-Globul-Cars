# Google Tag Manager (GTM) Setup
# إعداد Google Tag Manager

## Overview / نظرة عامة

Google Tag Manager has been successfully integrated into the project.

تم دمج Google Tag Manager بنجاح في المشروع.

## Container Information / معلومات الحاوية

- **Container ID**: `GTM-MKZSPCNC`
- **Account ID**: `6331834008`
- **Container ID (Numeric)**: `239485180`
- **Workspace ID**: `2`
- **GTM Dashboard URL**: https://tagmanager.google.com/?authuser=1#/container/accounts/6331834008/containers/239485180/workspaces/2

## Implementation / التنفيذ

### Code Location / موقع الكود

The GTM code has been added to `public/index.html`:

تم إضافة كود GTM إلى `public/index.html`:

1. **In `<head>` section** (as high as possible):
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MKZSPCNC');</script>
<!-- End Google Tag Manager -->
```

2. **Immediately after `<body>` tag**:
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MKZSPCNC"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

## Verification / التحقق

### Test GTM Installation / اختبار تثبيت GTM

1. **Using GTM Preview Mode**:
   - Go to: https://tagmanager.google.com/?authuser=1#/container/accounts/6331834008/containers/239485180/workspaces/2
   - Click **"Preview"** button
   - Enter your website URL: `https://koli.one/` or `http://localhost:3000`
   - GTM will show which tags are firing

2. **Using Browser Console**:
   - Open browser DevTools (F12)
   - Check if `dataLayer` exists: `console.log(window.dataLayer)`
   - Should see GTM initialization events

3. **Using GTM Debugger Extension**:
   - Install "Tag Assistant Legacy" Chrome extension
   - Visit your website
   - Check if GTM container is detected

## Configuration / التكوين

### Environment Variables / متغيرات البيئة

Add to `.env` (optional, already has default):

```env
REACT_APP_GTM_ID=GTM-MKZSPCNC
```

### Config File / ملف التكوين

The GTM ID is configured in:
`src/config/google-cloud.config.ts`

```typescript
marketing: {
  gtmId: 'GTM-MKZSPCNC',
  ga4Id: process.env.REACT_APP_GA4_ID,
}
```

## Common Tags to Add in GTM / العلامات الشائعة لإضافتها في GTM

### 1. Google Analytics 4 (GA4) Tag

1. Go to GTM Dashboard → **Tags** → **New**
2. Tag Type: **Google Analytics: GA4 Configuration**
3. Measurement ID: `G-TDRZ4Z3D7Z`
4. Trigger: **All Pages**

### 2. Facebook Pixel (if needed)

1. Tag Type: **Custom HTML**
2. Paste Facebook Pixel code
3. Trigger: **All Pages**

### 3. Custom Events

You can push custom events to dataLayer:

```javascript
// Example: Track car view
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  'event': 'car_view',
  'car_id': '12345',
  'car_make': 'BMW',
  'car_model': 'X5',
  'car_price': 50000
});
```

## Integration with React / التكامل مع React

### Push Events to dataLayer / إرسال الأحداث إلى dataLayer

Create a utility function:

```typescript
// src/utils/gtm.ts
export const pushToDataLayer = (eventData: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push(eventData);
  }
};

// Usage:
pushToDataLayer({
  event: 'car_view',
  car_id: carId,
  car_make: make,
  car_model: model
});
```

## Benefits of GTM / فوائد GTM

1. **No Code Deployments**: Marketing team can add/remove tags without developer
2. **Multiple Tags**: Manage Google Analytics, Facebook Pixel, LinkedIn, TikTok, etc. from one place
3. **Version Control**: GTM has built-in versioning and rollback
4. **Testing**: Preview mode allows testing before publishing
5. **Triggers**: Fire tags based on conditions (e.g., only on car detail pages)

## Next Steps / الخطوات التالية

1. ✅ GTM code installed in `public/index.html`
2. ⏭️ Configure GA4 tag in GTM Dashboard
3. ⏭️ Add other marketing tags as needed
4. ⏭️ Test tags using Preview mode
5. ⏭️ Publish GTM container

## Troubleshooting / استكشاف الأخطاء

### GTM Not Detected?

1. Check browser console for errors
2. Verify GTM code is in correct location (head and body)
3. Check if ad blockers are blocking GTM
4. Verify Container ID is correct: `GTM-MKZSPCNC`

### Tags Not Firing?

1. Use GTM Preview mode to debug
2. Check trigger conditions
3. Verify dataLayer events are being pushed
4. Check browser console for errors

## Related Links / الروابط ذات الصلة

- **GTM Dashboard**: https://tagmanager.google.com/?authuser=1#/container/accounts/6331834008/containers/239485180/workspaces/2
- **GTM Documentation**: https://support.google.com/tagmanager
- **GTM Quick Start**: https://support.google.com/tagmanager/answer/6103696


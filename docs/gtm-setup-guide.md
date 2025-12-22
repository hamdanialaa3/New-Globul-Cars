# Google Tag Manager (GTM) Setup Guide
## Optional Enhancement for Advanced Tag Management

> **Current Status**: NOT IMPLEMENTED (GA4 via react-ga4 is sufficient for now)
> **When to Add**: When you need to manage multiple marketing pixels without code changes

---

## Why GTM?

GTM allows non-developers to add tracking tags (Facebook Pixel, LinkedIn Ads, etc.) without code deployments. However, **for 99% of car marketplace needs, GA4 + Consent Mode v2 is enough**.

---

## When You Actually Need GTM

Add GTM only if:
1. Marketing team needs to add/remove pixels frequently without developer help
2. You have 5+ different marketing platforms (Google Ads, Facebook, TikTok, Snapchat, etc.)
3. You need complex trigger rules (e.g., fire pixel only for cars >€20,000)

---

## Implementation Steps (If Needed)

### 1. Create GTM Container
```bash
# Go to: https://tagmanager.google.com
# Create new account: "Bulgarski Mobili"
# Container type: Web
# Copy GTM-XXXXXXX ID
```

### 2. Add to `.env`
```env
REACT_APP_GTM_ID=GTM-XXXXXXX
```

### 3. Update `public/index.html`
Add this **BEFORE** `</head>`:
```html
<!-- Google Tag Manager -->
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXXX');
</script>
<!-- End Google Tag Manager -->
```

Add this **AFTER** `<body>`:
```html
<!-- Google Tag Manager (noscript) -->
<noscript>
  <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>
</noscript>
<!-- End Google Tag Manager (noscript) -->
```

### 4. Configure in GTM Dashboard
1. **Add GA4 Configuration Tag**:
   - Tag Type: Google Analytics: GA4 Configuration
   - Measurement ID: Your GA4 ID
   - Trigger: All Pages

2. **Add Consent Mode**:
   - Template: Consent Mode (from Community Gallery)
   - Default: All denied
   - Apply to: All Pages

3. **Add Custom Events**:
   - car_view, contact_seller, etc.
   - Push from code: `window.dataLayer.push({ event: 'car_view', ... })`

---

## Migration from react-ga4 to GTM (If Needed)

**DON'T** remove react-ga4 completely. Instead:
1. Keep react-ga4 for core events (page views, conversions)
2. Use GTM for marketing pixels (Facebook, TikTok, etc.)
3. Both can coexist without conflicts

---

## Cost Comparison

| Method | Cost | Pros | Cons |
|--------|------|------|------|
| **GA4 only (current)** | FREE | Simple, fast, reliable | Requires developer for new pixels |
| **GA4 + GTM** | FREE | Flexible, marketing team can add tags | Slower page load, more complex |

---

## Recommendation

**Keep current GA4 + Consent Mode setup**. Add GTM only when:
- You have a dedicated marketing manager who needs tag control
- You're running campaigns on 5+ platforms simultaneously
- Page load time is not a critical concern

---

## Testing GTM (If Added)

```javascript
// Check if GTM loaded
console.log('GTM Loaded:', !!window.dataLayer);

// Check tags firing
window.dataLayer.push({
  event: 'test_event',
  test_data: 'hello'
});

// Use GTM Preview Mode: https://tagmanager.google.com/preview
```

---

**Last Updated**: December 2025
**Status**: Optional Enhancement - Not Required for Phase 1

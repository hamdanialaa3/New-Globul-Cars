# Google Ads Integration with Google Analytics
# تكامل Google Ads مع Google Analytics

## Overview / نظرة عامة

This guide explains how to set up Google Ads integration with Google Analytics, including conversion tracking, enhanced conversions, and audience building.

هذا الدليل يشرح كيفية إعداد تكامل Google Ads مع Google Analytics، بما في ذلك تتبع التحويلات والتحويلات المحسّنة وبناء الجماهير.

## Account Information / معلومات الحساب

- **Account Name**: Glo Bul G AD
- **Customer ID**: 425-581-1541
- **Google Analytics Property**: G-R8JY5KM421
- **Link Status**: ✅ Connected

## Step 1: Set Up Conversions in Google Analytics / الخطوة 1: إعداد التحويلات في Google Analytics

### Create Conversion Events / إنشاء أحداث التحويل

1. **Go to Google Analytics**:
   - URL: https://analytics.google.com
   - Select property: **G-R8JY5KM421**

2. **Navigate to Conversions**:
   - Go to: **Admin** → **Data display** → **Events**
   - Or: **Admin** → **Data display** → **Conversions**

3. **Mark Key Events as Conversions**:
   - Click on an event (e.g., `generate_lead`, `contact_seller`)
   - Toggle **"Mark as conversion"**
   - Set conversion value if applicable

### Recommended Conversion Events / أحداث التحويل الموصى بها

1. **`generate_lead`** - Contact seller
   - Value: 1-10 EUR (based on lead quality)
   - Mark as primary conversion

2. **`contact_seller`** - Direct contact
   - Value: 5-20 EUR
   - Mark as primary conversion

3. **`view_car`** - Car detail view (for remarketing)
   - Value: 0.1 EUR
   - Mark as secondary conversion

4. **`add_to_favorites`** - Save car
   - Value: 0.5 EUR
   - Mark as secondary conversion

5. **`start_checkout`** - Begin inquiry process
   - Value: 2 EUR
   - Mark as secondary conversion

## Step 2: Import Conversions to Google Ads / الخطوة 2: استيراد التحويلات إلى Google Ads

### Automatic Import (Recommended) / الاستيراد التلقائي (موصى به)

1. **In Google Ads**:
   - Go to: **Tools & Settings** → **Conversions**
   - Click **"+"** → **Import**
   - Select **"Google Analytics 4"**
   - Choose your property: **G-R8JY5KM421**

2. **Select Conversions to Import**:
   - Select: `generate_lead`, `contact_seller`, etc.
   - Set conversion action settings:
     - **Category**: Lead
     - **Value**: Use GA4 value
     - **Count**: One
     - **Attribution model**: Data-driven (recommended)

3. **Save and Wait**:
   - Conversions will appear within 24-48 hours
   - Data will start flowing automatically

### Manual Setup (Alternative) / الإعداد اليدوي (بديل)

If automatic import doesn't work, create conversions manually:

1. **In Google Ads**:
   - Go to: **Tools & Settings** → **Conversions**
   - Click **"+"** → **Website**
   - Enter conversion details:
     - **Category**: Lead
     - **Value**: Use the value
     - **Count**: One
     - **Click-through conversion window**: 30 days
     - **View-through conversion window**: 1 day

2. **Get Conversion Label**:
   - Copy the conversion label (e.g., `AW-XXXXXXXXX/AbC-dEfGhIjKlMnOpQrStUvWxYz`)
   - Add to `.env`: `REACT_APP_GOOGLE_ADS_CONVERSION_ID=AW-XXXXXXXXX/AbC-dEfGhIjKlMnOpQrStUvWxYz`

3. **Add Conversion Code**:
   - Add conversion tracking code to your website
   - Or use gtag.js events (already implemented)

## Step 3: Create Audiences in Google Analytics / الخطوة 3: إنشاء الجماهير في Google Analytics

### Audience 1: Car Viewers (Remarketing) / الجمهور 1: عارضو السيارات (تجديد النشاط التسويقي)

1. **Go to Google Analytics**:
   - Navigate to: **Admin** → **Data display** → **Audiences**
   - Click **"+"** → **Create new audience**

2. **Configure Audience**:
   - **Name**: "Car Viewers - Last 30 Days"
   - **Description**: Users who viewed car detail pages
   - **Audience definition**:
     ```
     Event name = view_car
     AND
     Event count >= 1
     AND
     Last seen <= 30 days ago
     ```

3. **Link to Google Ads**:
   - Enable **"Link to Google Ads"**
   - Select account: **Glo Bul G AD (425-581-1541)**
   - Click **"Create"**

### Audience 2: Lead Generators / الجمهور 2: مولدو العملاء المحتملين

1. **Create New Audience**:
   - **Name**: "Lead Generators - Last 90 Days"
   - **Description**: Users who contacted sellers
   - **Audience definition**:
     ```
     Event name = generate_lead
     OR
     Event name = contact_seller
     AND
     Last seen <= 90 days ago
     ```

2. **Link to Google Ads**:
   - Enable **"Link to Google Ads"**
   - Select account: **Glo Bul G AD (425-581-1541)**
   - Click **"Create"**

### Audience 3: High-Value Visitors / الجمهور 3: الزوار ذوو القيمة العالية

1. **Create New Audience**:
   - **Name**: "High-Value Visitors"
   - **Description**: Users who viewed multiple cars or added favorites
   - **Audience definition**:
     ```
     (Event name = view_car AND Event count >= 3)
     OR
     (Event name = add_to_favorites AND Event count >= 2)
     AND
     Last seen <= 60 days ago
     ```

2. **Link to Google Ads**:
   - Enable **"Link to Google Ads"**
   - Select account: **Glo Bul G AD (425-581-1541)**
   - Click **"Create"**

### Audience 4: Abandoned Searches / الجمهور 4: عمليات البحث المتروكة

1. **Create New Audience**:
   - **Name**: "Abandoned Searches"
   - **Description**: Users who searched but didn't contact
   - **Audience definition**:
     ```
     Event name = search
     AND
     Event name != generate_lead
     AND
     Event name != contact_seller
     AND
     Last seen <= 14 days ago
     ```

2. **Link to Google Ads**:
   - Enable **"Link to Google Ads"**
   - Select account: **Glo Bul G AD (425-581-1541)**
   - Click **"Create"**

## Step 4: Use Audiences in Google Ads / الخطوة 4: استخدام الجماهير في Google Ads

### Create Remarketing Campaign / إنشاء حملة تجديد النشاط التسويقي

1. **In Google Ads**:
   - Go to: **Campaigns** → **"+"** → **New campaign**
   - Select: **Search** or **Display** or **Performance Max**

2. **Target Audiences**:
   - In campaign settings, go to **Audiences**
   - Add audiences:
     - "Car Viewers - Last 30 Days"
     - "Lead Generators - Last 90 Days"
     - "High-Value Visitors"
     - "Abandoned Searches"

3. **Set Bidding**:
   - Use **Maximize conversions** or **Target CPA**
   - Set target CPA based on your conversion data

### Create Similar Audiences / إنشاء جماهير مماثلة

1. **In Google Ads**:
   - Go to: **Tools & Settings** → **Audience Manager**
   - Select an audience (e.g., "Lead Generators")
   - Click **"+"** → **Similar audiences**
   - Google will create similar audiences automatically

## Step 5: Enhanced Conversions / الخطوة 5: التحويلات المحسّنة

### Enable Enhanced Conversions in Google Ads

1. **In Google Ads**:
   - Go to: **Tools & Settings** → **Conversions**
   - Select a conversion action
   - Click **"Edit settings"**
   - Enable **"Enhanced conversions"**
   - Select: **"Use Google tag"** (recommended)

2. **Benefits**:
   - Better conversion tracking
   - Improved attribution
   - More accurate reporting

## Step 6: Conversion Tracking in Code / الخطوة 6: تتبع التحويلات في الكود

### Using the Service / استخدام الخدمة

```typescript
import googleAdsService from './services/analytics/google-ads-integration.service';

// Track lead generation
googleAdsService.trackLead('car-123', 'phone', 10);

// Track conversion
googleAdsService.trackConversion(
  'AW-XXXXXXXXX/AbC-dEfGhIjKlMnOpQrStUvWxYz',
  10,
  'EUR',
  'transaction-123'
);
```

### Automatic Tracking / التتبع التلقائي

The service automatically tracks conversions when:
- User contacts seller (`generate_lead` event)
- User views car detail (`view_car` event)
- User adds to favorites (`add_to_favorites` event)

## Testing / الاختبار

### Test Conversions / اختبار التحويلات

1. **Use Google Ads Conversion Tracking**:
   - Go to: **Tools & Settings** → **Conversions**
   - Click on a conversion action
   - Click **"Test conversion"**
   - Enter test details

2. **Use Tag Assistant**:
   - Install Tag Assistant Chrome extension
   - Visit your website
   - Perform a conversion action
   - Check if conversion event fires

3. **Check Google Analytics**:
   - Go to: **Reports** → **Realtime**
   - Perform a conversion action
   - Verify event appears in real-time

### Test Audiences / اختبار الجماهير

1. **In Google Analytics**:
   - Go to: **Admin** → **Audiences**
   - Check audience size (should be > 0)
   - Wait 24-48 hours for data to populate

2. **In Google Ads**:
   - Go to: **Tools & Settings** → **Audience Manager**
   - Check if audiences are linked
   - Verify audience sizes match GA4

## Troubleshooting / استكشاف الأخطاء

### Conversions Not Importing? / التحويلات لا تستورد؟

1. **Check Link Status**:
   - Verify Google Ads is linked to GA4
   - Check link status in GA4 Admin

2. **Check Event Names**:
   - Ensure event names match exactly
   - Check for typos in event names

3. **Wait 24-48 Hours**:
   - Conversions may take time to appear
   - Check again after 48 hours

### Audiences Not Appearing? / الجماهير لا تظهر؟

1. **Check Audience Size**:
   - Audiences need at least 100 users
   - Wait for data to accumulate

2. **Check Link Status**:
   - Verify audiences are linked to Google Ads
   - Check link status in GA4

3. **Check Audience Definition**:
   - Verify audience conditions are correct
   - Test audience definition

## Next Steps / الخطوات التالية

1. ✅ Google Ads linked to GA4
2. ⏭️ Create conversion events in GA4
3. ⏭️ Import conversions to Google Ads
4. ⏭️ Create audiences in GA4
5. ⏭️ Link audiences to Google Ads
6. ⏭️ Create remarketing campaigns
7. ⏭️ Enable enhanced conversions
8. ⏭️ Test and monitor performance

## Related Documentation / الوثائق ذات الصلة

- [Google Tag Setup](./google-tag-setup.md)
- [Google Consent Mode Setup](./consent-mode-setup.md)
- [Google Analytics BigQuery Export](./google-analytics-bigquery-export.md)


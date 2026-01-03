# Google Analytics Setup Guide
# دليل إعداد Google Analytics

## Required Information / المعلومات المطلوبة

To complete the Google Analytics integration, please provide the following information:

لاكمال تكامل Google Analytics، يرجى توفير المعلومات التالية:

### 1. Account ID / معرف الحساب
- **Where to find**: Google Analytics → Admin → Account Settings
- **Format**: Usually a number like `368904922`
- **Example**: `368904922`

### 2. Property ID / معرف الخاصية
- **Where to find**: Google Analytics → Admin → Property Settings
- **Format**: Usually a number like `507597643`
- **Example**: `507597643`

### 3. Measurement ID / معرف القياس
- **Where to find**: Google Analytics → Admin → Data Streams → Your Stream
- **Format**: Usually starts with `G-` like `G-TDRZ4Z3D7Z`
- **Example**: `G-TDRZ4Z3D7Z`

### 4. Data Deletion URL / رابط حذف البيانات
- **Where to find**: Google Analytics → Admin → Data Deletion Requests
- **Format**: Full URL to the data deletion page
- **Example**: `https://analytics.google.com/analytics/web/?authuser=1#/a368904922p507597643/admin/piidatadeletion/table`

## Current Configuration / التكوين الحالي

Based on the provided link, the current configuration is:
بناءً على الرابط المقدم، التكوين الحالي هو:

```env
REACT_APP_GA_ACCOUNT_ID=368904922
REACT_APP_GA_PROPERTY_ID=507597643
REACT_APP_GA4_MEASUREMENT_ID=G-TDRZ4Z3D7Z
```

## Verification / التحقق

Please verify these values are correct:
يرجى التحقق من أن هذه القيم صحيحة:

1. Open Google Analytics: https://analytics.google.com
2. Go to Admin (⚙️ icon)
3. Check Account Settings for Account ID
4. Check Property Settings for Property ID
5. Check Data Streams for Measurement ID

## Environment Variables / متغيرات البيئة

Add these to your `.env` file:

```env
# Google Analytics Configuration
REACT_APP_GA_ACCOUNT_ID=YOUR_ACCOUNT_ID
REACT_APP_GA_PROPERTY_ID=YOUR_PROPERTY_ID
REACT_APP_GA4_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
REACT_APP_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
```

## Next Steps / الخطوات التالية

Once you provide the correct information, I will:
بمجرد توفير المعلومات الصحيحة، سأقوم بـ:

1. Update the service with correct IDs
2. Verify the data deletion URL
3. Test the integration
4. Update documentation


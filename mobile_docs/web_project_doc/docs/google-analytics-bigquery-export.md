# Google Analytics BigQuery Export Setup
# إعداد تصدير BigQuery من Google Analytics

## Overview / نظرة عامة

This guide explains how to set up BigQuery export from Google Analytics 4 to enable advanced analytics and data warehousing.

هذا الدليل يشرح كيفية إعداد تصدير BigQuery من Google Analytics 4 لتمكين التحليلات المتقدمة ومستودع البيانات.

## Prerequisites / المتطلبات الأساسية

1. **Google Analytics 4 Property** with Account ID: `368904922` and Property ID: `507597643`
2. **Google Cloud Project**: `fire-new-globul`
3. **BigQuery API Enabled** in Google Cloud Console
4. **Billing Account** (BigQuery has free tier: 10GB storage, 1TB queries/month)

## Step 1: Enable BigQuery Export in Google Analytics / الخطوة 1: تفعيل تصدير BigQuery في Google Analytics

### Method 1: Via Google Analytics Admin / الطريقة 1: عبر إدارة Google Analytics

1. Go to Google Analytics: https://analytics.google.com
2. Select your property: **New Globul Cars AD** (Property ID: 507597643)
3. Navigate to: **Admin** (⚙️ icon) → **Property Settings** → **BigQuery Linking**
4. Click **"Link BigQuery"** or **"Create Link"**
5. Select your Google Cloud Project: `fire-new-globul`
6. Choose BigQuery location: `EU` (for GDPR compliance) or `US`
7. Enable **Daily Export** (recommended for most use cases)
8. Click **"Submit"**

### Method 2: Via Google Cloud Console / الطريقة 2: عبر Google Cloud Console

1. Go to: https://console.cloud.google.com/bigquery
2. Navigate to: **Analytics Hub** → **Listings** → **Google Analytics**
3. Follow the linking wizard

## Step 2: Configure BigQuery Dataset / الخطوة 2: تكوين مجموعة بيانات BigQuery

### Dataset Configuration / تكوين مجموعة البيانات

- **Dataset ID**: `car_market_analytics` (or your preferred name)
- **Location**: `EU` (recommended for GDPR compliance)
- **Default Table Expiration**: Set to your retention policy (e.g., 365 days)

### Create Dataset / إنشاء مجموعة البيانات

```sql
-- Run in BigQuery Console
CREATE SCHEMA IF NOT EXISTS `fire-new-globul.car_market_analytics`
OPTIONS(
  location='EU',
  description='Car marketplace analytics data from Google Analytics 4'
);
```

## Step 3: Automatic Tables Created / الخطوة 3: الجداول التي يتم إنشاؤها تلقائياً

Once BigQuery export is enabled, Google Analytics automatically creates:

بمجرد تفعيل تصدير BigQuery، Google Analytics ينشئ تلقائياً:

### Daily Export Tables / جداول التصدير اليومية

- **`events_YYYYMMDD`**: Daily event data
- **`events_intraday_YYYYMMDD`**: Real-time event data (updated throughout the day)

### Schema / المخطط

Each table contains:
- `event_date`: Date of the event (YYYYMMDD format)
- `event_timestamp`: Microsecond timestamp
- `event_name`: Name of the event (e.g., 'page_view', 'car_view')
- `user_pseudo_id`: Anonymous user ID
- `user_id`: User ID (if set)
- `event_params`: Event parameters (JSON)
- `user_properties`: User properties (JSON)
- `device`: Device information
- `geo`: Geographic information
- `traffic_source`: Traffic source information

## Step 4: Query Examples / الخطوة 4: أمثلة الاستعلامات

### Example 1: Car View Events / مثال 1: أحداث عرض السيارة

```sql
SELECT
  event_date,
  event_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'car_id') AS car_id,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'make') AS make,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'model') AS model,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'price') AS price,
  user_id,
  user_pseudo_id,
  device.category AS device_type,
  geo.country AS country,
  geo.city AS city
FROM
  `fire-new-globul.car_market_analytics.events_*`
WHERE
  event_name = 'car_view'
  AND _TABLE_SUFFIX BETWEEN '20250101' AND '20250131'
ORDER BY
  event_timestamp DESC
LIMIT 1000;
```

### Example 2: Conversion Events / مثال 2: أحداث التحويل

```sql
SELECT
  event_date,
  event_name,
  COUNT(*) AS event_count,
  COUNT(DISTINCT user_pseudo_id) AS unique_users,
  COUNT(DISTINCT user_id) AS authenticated_users
FROM
  `fire-new-globul.car_market_analytics.events_*`
WHERE
  event_name IN ('contact_seller', 'generate_lead', 'purchase')
  AND _TABLE_SUFFIX BETWEEN '20250101' AND '20250131'
GROUP BY
  event_date, event_name
ORDER BY
  event_date DESC, event_count DESC;
```

### Example 3: User Journey / مثال 3: رحلة المستخدم

```sql
SELECT
  user_pseudo_id,
  user_id,
  event_name,
  event_timestamp,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_path') AS page_path,
  device.category AS device_type
FROM
  `fire-new-globul.car_market_analytics.events_*`
WHERE
  user_pseudo_id = 'YOUR_USER_ID'
  AND _TABLE_SUFFIX BETWEEN '20250101' AND '20250131'
ORDER BY
  event_timestamp ASC;
```

## Step 5: Integration with Project / الخطوة 5: التكامل مع المشروع

### Environment Variables / متغيرات البيئة

Add to `.env`:

```env
# BigQuery Configuration
BIGQUERY_DATASET=car_market_analytics
BIGQUERY_PROJECT_ID=fire-new-globul
BIGQUERY_LOCATION=EU

# Google Analytics Configuration
REACT_APP_GA_ACCOUNT_ID=368904922
REACT_APP_GA_PROPERTY_ID=507597643
REACT_APP_GA4_MEASUREMENT_ID=G-TDRZ4Z3D7Z
```

### Service Account Setup / إعداد حساب الخدمة

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Create or select service account
3. Grant roles:
   - **BigQuery Data Editor**
   - **BigQuery Job User**
   - **BigQuery User**
4. Download JSON key
5. Store securely (do NOT commit to git)

## Step 6: Cost Management / الخطوة 6: إدارة التكاليف

### BigQuery Free Tier / المستوى المجاني لـ BigQuery

- **Storage**: 10 GB free per month
- **Queries**: 1 TB processed data free per month
- **Streaming Inserts**: 10 GB free per month

### Cost Optimization Tips / نصائح تحسين التكلفة

1. **Set Table Expiration**: Delete old data automatically
2. **Use Partitioned Tables**: Google Analytics tables are already partitioned by date
3. **Limit Query Scope**: Use `_TABLE_SUFFIX` to query specific date ranges
4. **Cache Results**: Use materialized views for frequently accessed data

## Step 7: Data Retention / الخطوة 7: الاحتفاظ بالبيانات

### Recommended Settings / الإعدادات الموصى بها

- **Daily Export Retention**: 365 days (1 year)
- **Intraday Export Retention**: 7 days (for real-time analysis)
- **Custom Events**: Based on business needs

### Set Table Expiration / تعيين انتهاء صلاحية الجدول

```sql
-- Set expiration for daily tables (365 days)
ALTER TABLE `fire-new-globul.car_market_analytics.events_20250101`
SET OPTIONS(expiration_timestamp=TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 365 DAY));
```

## Step 8: Monitoring / الخطوة 8: المراقبة

### Check Export Status / التحقق من حالة التصدير

1. Go to: Google Analytics → Admin → BigQuery Linking
2. Check **"Last Export"** timestamp
3. Verify tables in BigQuery Console

### Troubleshooting / استكشاف الأخطاء

- **No data in BigQuery**: Check if export is enabled and linked correctly
- **Missing tables**: Wait 24-48 hours for first export
- **Query errors**: Verify table names and date suffixes

## Related Documentation / الوثائق ذات الصلة

- [Google Analytics BigQuery Export](https://support.google.com/analytics/answer/9358801)
- [BigQuery SQL Reference](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax)
- [BigQuery Pricing](https://cloud.google.com/bigquery/pricing)

## Next Steps / الخطوات التالية

1. ✅ Enable BigQuery export in Google Analytics
2. ✅ Verify tables are created in BigQuery
3. ✅ Test queries on sample data
4. ✅ Set up automated reports/dashboards
5. ✅ Configure data retention policies


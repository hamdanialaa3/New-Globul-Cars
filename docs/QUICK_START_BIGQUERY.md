# Quick Start: BigQuery Export from Google Analytics
# دليل سريع: تصدير BigQuery من Google Analytics

## Account Information / معلومات الحساب

- **Account Name**: New Globul Cars AD
- **Account ID**: 368904922
- **Property ID**: 507597643
- **Measurement ID**: G-TDRZ4Z3D7Z
- **Google Cloud Project**: fire-new-globul

## Quick Setup Steps / خطوات الإعداد السريع

### Step 1: Enable BigQuery Export / الخطوة 1: تفعيل تصدير BigQuery

1. **Go to Google Analytics**:
   - URL: https://analytics.google.com
   - Login with your Google account

2. **Navigate to BigQuery Linking**:
   - Click **Admin** (⚙️ icon) in bottom left
   - Under **Property** column, click **BigQuery Linking**
   - Or direct link: https://analytics.google.com/analytics/web/?authuser=1#/a368904922p507597643/admin/bigquery

3. **Create Link**:
   - Click **"Link BigQuery"** or **"Create Link"** button
   - Select Google Cloud Project: **fire-new-globul**
   - Choose BigQuery location: **EU** (recommended for GDPR)
   - Enable **Daily Export** (recommended)
   - Click **"Submit"**

### Step 2: Verify Export / الخطوة 2: التحقق من التصدير

1. **Check BigQuery Console**:
   - Go to: https://console.cloud.google.com/bigquery?project=fire-new-globul
   - Look for dataset: `analytics_507597643` (auto-created by GA)
   - Tables will appear as: `events_YYYYMMDD`

2. **Wait for First Export**:
   - First export may take 24-48 hours
   - After that, daily exports happen automatically

### Step 3: Query Your Data / الخطوة 3: استعلام بياناتك

Example query to get started:

```sql
SELECT
  event_date,
  event_name,
  COUNT(*) AS event_count
FROM
  `fire-new-globul.analytics_507597643.events_*`
WHERE
  _TABLE_SUFFIX BETWEEN '20250101' AND '20250131'
GROUP BY
  event_date, event_name
ORDER BY
  event_date DESC, event_count DESC
LIMIT 100;
```

## Important Links / الروابط المهمة

- **Google Analytics Admin**: https://analytics.google.com/analytics/web/?authuser=1#/a368904922p507597643/admin
- **BigQuery Linking**: https://analytics.google.com/analytics/web/?authuser=1#/a368904922p507597643/admin/bigquery
- **BigQuery Console**: https://console.cloud.google.com/bigquery?project=fire-new-globul
- **Data Deletion**: https://analytics.google.com/analytics/web/?authuser=1#/a368904922p507597643/admin/piidatadeletion/table

## Troubleshooting / استكشاف الأخطاء

### No BigQuery Linking Option?
- Make sure you have **Editor** or **Administrator** role in Google Analytics
- Verify you're in the correct property (Property ID: 507597643)

### Export Not Working?
- Check that BigQuery API is enabled in Google Cloud Console
- Verify billing is enabled (BigQuery has free tier but requires billing account)
- Check export status in Google Analytics → Admin → BigQuery Linking

### No Data in BigQuery?
- Wait 24-48 hours for first export
- Check that events are being tracked in Google Analytics
- Verify table names: `events_YYYYMMDD` format

## Next Steps / الخطوات التالية

1. ✅ Enable BigQuery export (Step 1)
2. ✅ Verify tables are created (Step 2)
3. ✅ Run sample queries (Step 3)
4. ✅ Set up automated reports
5. ✅ Configure data retention

For detailed documentation, see: `docs/google-analytics-bigquery-export.md`


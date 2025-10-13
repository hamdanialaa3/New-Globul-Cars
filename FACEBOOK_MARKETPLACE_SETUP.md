# Facebook Marketplace Setup Guide
# دليل إعداد Facebook Marketplace

**Project:** Globul Cars  
**Facebook Page ID:** 109254638332601  
**Date:** October 13, 2025

---

## Important Note

Facebook Marketplace Catalog is COMPLETELY DIFFERENT from Facebook Login!

- Facebook Login = User authentication (PAUSED)
- Facebook Marketplace = Product listings (ACTIVE NOW)

No Facebook App needed for Marketplace!

---

## What You Need

### Already Have:
- Facebook Page ID: 109254638332601
- Business Manager access
- Website: mobilebg.eu

### Need to Create:
- Commerce Catalog (Vehicles type)
- Data Feed connection

---

## Step-by-Step Setup

### Step 1: Create Vehicles Catalog

1. Open Commerce Manager:
   ```
   https://business.facebook.com/commerce/catalogs
   ```

2. Click "Create catalog"

3. **Important:** Choose **"Vehicles"** as catalog type
   (Not "E-commerce" or "Products")

4. Fill in:
   ```
   Catalog name: Globul Cars Bulgaria
   Connect to page: [Select your page: 109254638332601]
   ```

5. Click "Create"

---

### Step 2: Add Data Feed

After catalog is created:

1. In catalog → "Data sources"

2. Click "Add data source"

3. Select "Data feed"

4. Configure:
   ```
   Feed name: Globul Cars Live Feed
   Upload type: Scheduled fetch
   Feed URL: https://fire-new-globul.web.app/catalog-feed.xml
   Currency: EUR
   Schedule: Every hour
   ```

5. Click "Start upload"

---

### Step 3: Verify Feed Format

Facebook will check the feed. Make sure:

- Valid XML format
- Required fields present:
  - id
  - title
  - description
  - availability
  - condition
  - price
  - link
  - image_link
  - brand

---

### Step 4: Wait for Processing

- First upload: 10-30 minutes
- Facebook validates data
- Cars appear in catalog
- Then visible in Facebook Marketplace

---

## After Functions Deployment

Once Firebase Functions are deployed, update feed URL to:

```
https://us-central1-fire-new-globul.cloudfunctions.net/googleMerchantFeed
```

This will provide:
- Real-time car data from Firestore
- Automatic updates every hour
- Only active listings
- All car details

---

## Current Feed URL (Temporary)

For now, use static feed:
```
https://fire-new-globul.web.app/catalog-feed.xml
```

This contains sample data. After Functions deploy, switch to dynamic feed.

---

## Benefits

### For Sellers:
- Cars automatically listed on Facebook Marketplace
- Reach millions of Facebook users
- Free visibility

### For You:
- Automatic sync
- No manual posting
- Wider reach
- More sales

---

## Troubleshooting

### If feed fails to upload:

1. Check XML is valid
2. Verify all required fields present
3. Test feed URL in browser
4. Check image URLs are accessible

### If cars don't appear in Marketplace:

1. Verify catalog type is "Vehicles"
2. Check page is connected to catalog
3. Ensure all required fields have data
4. Wait 24 hours for initial approval

---

## Next Steps

1. Create Vehicles catalog in Commerce Manager
2. Add feed URL
3. Wait for first sync
4. Verify cars appear
5. Deploy Functions for real-time updates

---

**Page ID:** 109254638332601  
**Feed URL:** https://fire-new-globul.web.app/catalog-feed.xml  
**Status:** Ready to connect

---

**Start creating the catalog now!**


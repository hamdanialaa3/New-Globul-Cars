# Multi-Platform Product Catalog Integration Guide
# دليل التكامل الشامل مع منصات البيع

**Project:** Globul Cars - Bulgarian Car Marketplace  
**Location:** Bulgaria  
**Currency:** EUR  
**Languages:** Bulgarian, English  
**Date:** October 13, 2025

---

## System Overview

Complete automatic product feed system that syncs car listings across multiple platforms:

1. Google Shopping
2. Instagram Shopping  
3. TikTok Shop
4. (Facebook - paused for now)

---

## How It Works

```
User adds car -> Firestore (status: active)
         |
         v
    Firebase Functions (every hour)
         |
         +-> Google Merchant Feed (XML)
         +-> Instagram Shopping Feed (CSV)
         +-> TikTok Shop Feed (JSON)
         |
         v
Car appears automatically on all platforms
```

---

## Platform Integration Details

### 1. Google Shopping (Google Merchant Center)

**Feed URL:**
```
https://us-central1-fire-new-globul.cloudfunctions.net/googleMerchantFeed
```

**Format:** XML (RSS 2.0)  
**Update Frequency:** Hourly  
**Max Items:** 5000

**Setup Steps:**

1. Create Google Merchant Center account:
   ```
   https://merchants.google.com
   ```

2. Add your business details:
   - Business name: Globul Cars
   - Country: Bulgaria
   - Website: https://mobilebg.eu

3. Verify and claim website:
   - Add HTML tag or upload file
   - Verify ownership

4. Create Product Feed:
   - Products -> Feeds -> Add Feed
   - Feed name: Globul Cars Live Feed
   - Input method: Scheduled fetch
   - Feed URL: (use URL above)
   - Schedule: Hourly

5. Link to Google Ads (optional):
   - For dynamic remarketing
   - For Shopping campaigns

**Benefits:**
- Appear in Google Search Shopping results
- Google Shopping tab visibility
- Smart Shopping campaigns
- Free product listings

---

### 2. Instagram Shopping

**Feed URL:**
```
https://us-central1-fire-new-globul.cloudfunctions.net/instagramShoppingFeed
```

**Format:** CSV  
**Update Frequency:** Hourly  
**Max Items:** 5000

**Setup Steps:**

1. Convert Instagram to Business Account

2. Connect to Facebook Business Manager

3. Create Product Catalog in Commerce Manager:
   ```
   https://business.facebook.com/commerce
   ```

4. Add Data Source:
   - Type: Data Feed
   - Feed URL: (use URL above)
   - Schedule: Hourly

5. Connect Instagram to Catalog:
   - Instagram Settings -> Shopping
   - Select catalog

6. Submit for review:
   - Instagram will review your account
   - Usually approved in 1-3 days

**Benefits:**
- Product tags in Instagram posts
- Instagram Shop tab
- Shopping in Stories
- Checkout on Instagram

---

### 3. TikTok Shop

**Feed URL:**
```
https://us-central1-fire-new-globul.cloudfunctions.net/tiktokShoppingFeed
```

**Format:** JSON  
**Update Frequency:** Daily  
**Max Items:** 5000

**Setup Steps:**

1. Apply for TikTok Shop:
   ```
   https://seller.tiktok.com
   ```

2. Complete business verification:
   - Business license
   - Tax ID
   - Bank account

3. In TikTok Seller Center:
   - Products -> Batch Management
   - Upload via Data Feed

4. Add Feed URL:
   - Feed type: JSON
   - URL: (use URL above)
   - Update frequency: Daily

**Benefits:**
- Product links in TikTok videos
- TikTok Shop page
- Live shopping features
- In-feed shopping

---

## Deployment Commands

### Step 1: Build and Deploy Functions

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions:googleMerchantFeed,functions:instagramShoppingFeed,functions:tiktokShoppingFeed
```

### Step 2: Test Feed URLs

After deployment, test each feed:

```bash
# Google Feed
curl https://us-central1-fire-new-globul.cloudfunctions.net/googleMerchantFeed

# Instagram Feed  
curl https://us-central1-fire-new-globul.cloudfunctions.net/instagramShoppingFeed

# TikTok Feed
curl https://us-central1-fire-new-globul.cloudfunctions.net/tiktokShoppingFeed
```

---

## Product Feed Requirements

### What gets included:

- Status: 'active' only
- Must have: images, price, make, model, year
- Must have: valid city and region
- Image URLs must be publicly accessible

### What gets excluded:

- Status: 'draft', 'sold', 'expired', 'deleted'
- Cars without images
- Cars without price
- Incomplete listings

---

## Additional Platforms (Future)

### 4. OLX Bulgaria
- Local classifieds platform
- Popular in Bulgaria
- CSV/XML feed support

### 5. Mobile.bg
- Leading Bulgarian car marketplace
- API integration available
- Direct competitor but can cross-list

### 6. Cars.bg
- Bulgarian automotive marketplace
- XML feed support

### 7. AutoScout24
- Pan-European platform
- Good for cross-border sales

### 8. AutoTrader Europe
- International visibility
- Premium positioning

---

## Automatic Sync Workflow

### When user adds a car:

1. User fills sell form -> Saves to Firestore
2. Car status set to 'active'
3. Within 1 hour:
   - Google reads feed -> Car appears in Google Shopping
   - Instagram reads feed -> Car appears in Instagram Shop
   - TikTok reads feed -> Car appears in TikTok Shop

4. When car is sold:
   - Status changed to 'sold'
   - Next feed update removes it from all platforms

Everything is automatic and real-time.

---

## Monitoring and Analytics

Track performance across platforms:

```typescript
// Platform-specific tracking
interface CatalogPerformance {
  platform: string;
  totalViews: number;
  totalClicks: number;
  totalSales: number;
  conversionRate: number;
  averagePrice: number;
}
```

---

## Compliance and Best Practices

### For all platforms:

1. Accurate product data
2. Clear, high-quality images
3. Correct pricing and availability
4. Valid product URLs
5. Privacy policy compliance
6. Terms of service compliance
7. Return/refund policies

### Bulgaria-specific:

- All prices in EUR
- Locations in Bulgarian cities
- Bilingual descriptions (BG/EN)
- Local seller information
- VAT compliance

---

## Success Metrics

Target results after implementation:

- 50% more visibility
- 30% more inquiries
- 20% faster sales
- Multi-channel presence
- Automated management

---

## Next Steps

1. Deploy Functions
2. Set up Google Merchant Center
3. Set up Instagram Shopping
4. Set up TikTok Shop
5. Monitor and optimize

---

**Status:** Ready for production deployment  
**Last Updated:** October 13, 2025


# Instagram & TikTok Shopping Integration Guide
# دليل الربط مع Instagram و TikTok

**Accounts:** @globulnet  
**Date:** October 13, 2025

---

## Instagram Shopping Setup

### Account Details
- **Username:** @globulnet
- **URL:** https://www.instagram.com/globulnet/
- **Type:** Must be Business Account

---

### Step 1: Convert to Business Account (if needed)

1. Open Instagram app or https://www.instagram.com/globulnet/

2. Go to Settings → Account

3. Select **"Switch to Professional Account"**

4. Choose **"Business"**

5. Select category: **"Automotive, Aircraft & Boat"**

6. Complete profile:
   - Bio: Premium car marketplace in Bulgaria
   - Website: https://mobilebg.eu
   - Contact: alaa.hamdani@yahoo.com

---

### Step 2: Connect to Facebook Page

1. In Instagram Settings → **"Page"**

2. Click **"Connect to Facebook Page"**

3. Select your Facebook Page: **109254638332601**

4. Confirm connection

---

### Step 3: Create Product Catalog (Facebook Commerce Manager)

1. Open Commerce Manager:
   ```
   https://business.facebook.com/commerce
   ```

2. Create new catalog:
   - Type: **"E-commerce"** (for Instagram)
   - Name: **Globul Cars Instagram Catalog**
   - Connect to: Facebook Page 109254638332601

3. Add Data Source:
   - Type: Data Feed
   - Feed URL:
   ```
   https://fire-new-globul.web.app/catalog-feed.xml
   ```
   - Schedule: Hourly

---

### Step 4: Connect Catalog to Instagram

1. In Instagram Settings → **"Shopping"**

2. Select **"Product Catalog"**

3. Choose: **"Globul Cars Instagram Catalog"**

4. Submit for Review

5. Wait 1-3 days for approval

---

### Step 5: Start Tagging Products

After approval:

1. Create Instagram post with car photo

2. Tag products in photo:
   - Tap image when posting
   - Select **"Tag Products"**
   - Choose car from catalog
   - Post

3. Products will have shopping bag icon

4. Users can tap to see price and buy link

---

## TikTok Shop Setup

### Account Details
- **Username:** @globulnet
- **URL:** https://www.tiktok.com/@globulnet
- **Type:** Business Account

---

### Step 1: Convert to Business Account (if needed)

1. Open TikTok app

2. Go to Profile → Settings

3. Select **"Switch to Business Account"**

4. Choose category: **"Automotive"**

5. Complete business profile

---

### Step 2: Apply for TikTok Shop

1. Open TikTok Seller Center:
   ```
   https://seller.tiktok.com
   ```

2. Select region: **"Europe"** or **"Cross-border"**

3. Apply for seller account

4. Required documents:
   - Business registration
   - Tax ID
   - Bank account details
   - Business license

5. Submit application

6. Wait 3-7 days for approval

---

### Step 3: Set Up Product Catalog

After approval:

1. In TikTok Seller Center → **"Products"**

2. Select **"Batch Upload"**

3. Choose **"Data Feed"**

4. Add feed URL:
   ```
   https://fire-new-globul.web.app/catalog-feed.xml
   ```
   (TikTok accepts XML or JSON - we'll provide both)

5. Schedule: Daily

6. Save

---

### Step 4: Create Shopping Videos

1. Create video showcasing car

2. Add product link:
   - While editing video
   - Tap **"Add Link"**
   - Select product from catalog

3. Product will appear as clickable link in video

4. Users can tap to buy

---

## Feed URLs for All Platforms

### Current (Static - for initial setup):
```
https://fire-new-globul.web.app/catalog-feed.xml
```

### Future (Dynamic - after Functions deployment):

**Google Shopping:**
```
https://us-central1-fire-new-globul.cloudfunctions.net/googleMerchantFeed
```

**Instagram Shopping:**
```
https://us-central1-fire-new-globul.cloudfunctions.net/instagramShoppingFeed
```

**TikTok Shop:**
```
https://us-central1-fire-new-globul.cloudfunctions.net/tiktokShoppingFeed
```

---

## Expected Timeline

### Week 1:
- Day 1: Submit Instagram Shopping (1-3 days review)
- Day 2: Apply for TikTok Shop (3-7 days review)
- Day 3-7: Wait for approvals

### Week 2:
- Instagram approved → Start tagging products
- TikTok approved → Upload catalog
- Create content for both platforms

### Week 3:
- Monitor performance
- Optimize listings
- Create more content

---

## Content Strategy

### Instagram (@globulnet):

**Post Types:**
1. Car showcases (single car photos)
2. Multiple car collections
3. Behind-the-scenes
4. Customer testimonials
5. Tips for car buyers

**Frequency:** 3-5 posts per week

**Best Times:** 
- Morning: 8-10 AM
- Evening: 6-8 PM

### TikTok (@globulnet):

**Video Types:**
1. Car walkarounds (30-60 seconds)
2. Interior/exterior tours
3. Test drive clips
4. Car comparison videos
5. Tips and tricks

**Frequency:** 1-2 videos per day

**Best Times:**
- Lunch: 12-2 PM
- Evening: 7-10 PM

---

## Automation Benefits

When user adds car with status 'active':

```
Firestore → Catalog Feed
    ↓
Within 1 hour:
    ↓
- Instagram catalog updates
- TikTok catalog updates
- Google Shopping updates
    ↓
Car available to tag/link in:
- Instagram posts
- TikTok videos
- Google ads
```

**Everything automatic!**

---

## Next Steps

### Immediate:
1. Verify Instagram is Business Account
2. Verify TikTok is Business Account
3. Connect Instagram to Facebook Page
4. Apply for TikTok Shop

### This Week:
1. Set up Instagram Shopping
2. Submit for TikTok Shop
3. Create first posts/videos

### After Approval:
1. Start tagging products
2. Create regular content
3. Monitor analytics

---

**Accounts:** @globulnet (Instagram & TikTok)  
**Status:** Ready for integration  
**Last Updated:** October 13, 2025


# 🎯 Post-Deployment Setup Guide - Bulgarski Mobili (mobilebg.eu)

> **Status**: Ready for Google Services Configuration  
> **Date**: December 22, 2025  
> **Production URL**: https://mobilebg.eu

---

## ✅ Prerequisites Completed

- ✅ **Firebase Hosting**: Deployed successfully to `fire-new-globul.web.app`
- ✅ **Custom Domain**: `mobilebg.eu` connected
- ✅ **Sitemap**: Accessible at https://mobilebg.eu/sitemap.xml
- ✅ **Consent Mode v2**: GDPR-compliant cookie banner live
- ✅ **GA4**: Firebase Analytics configured with Measurement ID
- ✅ **Cloud Functions**: merchant-feed and image-optimizer ready (need API activation)

---

## 📋 Step-by-Step Configuration

### Step 1: Activate Firebase Cloud Functions (CRITICAL)

**Why**: Merchant feed and image optimizer won't work without these APIs.

1. Go to: https://console.firebase.google.com/project/fire-new-globul/functions
2. Click "Get Started" or "Enable APIs"
3. Enable these APIs:
   - ✅ **Cloud Functions API**
   - ✅ **Cloud Build API**
   - ✅ **Artifact Registry API**
   - ✅ **Cloud Storage API** (should be enabled)

4. Deploy functions:
```powershell
cd "c:\Users\hamda\Desktop\New Globul Cars"
firebase deploy --only functions
```

5. **Get Merchant Feed URL**:
   - After deployment, copy the URL shown:
   - Format: `https://europe-west1-fire-new-globul.cloudfunctions.net/merchantFeedGenerator`
   - **Save this URL** - you'll need it for Merchant Center!

---

### Step 2: Google Search Console Setup

**Goal**: Get your cars indexed by Google search.

#### 2.1 Add Property
1. Go to: https://search.google.com/search-console
2. Click "Add Property"
3. Choose **"URL prefix"** (not domain)
4. Enter: `https://mobilebg.eu`
5. Click "Continue"

#### 2.2 Verify Ownership
**Option A - HTML File Upload** (Easiest):
1. Download verification file (e.g., `google1234567890abcdef.html`)
2. Copy to: `c:\Users\hamda\Desktop\New Globul Cars\public\`
3. Deploy:
   ```powershell
   npm run build
   firebase deploy --only hosting
   ```
4. Click "Verify" in Search Console

**Option B - DNS TXT Record** (If you manage mobilebg.eu DNS):
1. Copy TXT record value
2. Add to your domain DNS settings
3. Wait 10 minutes, click "Verify"

#### 2.3 Submit Sitemap
1. In Search Console, go to "Sitemaps" (left menu)
2. Enter: `sitemap.xml`
3. Click "Submit"
4. ✅ **Success**: Status should show "Success" within 24 hours

#### 2.4 Request Indexing (Optional but Recommended)
1. Go to "URL Inspection" tool
2. Enter important URLs:
   - `https://mobilebg.eu/`
   - `https://mobilebg.eu/car/1/1` (example car)
   - `https://mobilebg.eu/browse`
3. Click "Request Indexing" for each
4. **Limit**: 10 requests per day

**Expected Timeline**:
- First 24h: Homepage indexed
- Week 1: 50-100 pages indexed
- Month 1: All active cars indexed

---

### Step 3: Google Merchant Center (For Shopping Ads)

**Goal**: List your cars in Google Shopping (free listings + paid ads).

#### 3.1 Create Account
1. Go to: https://merchants.google.com
2. Click "Get Started"
3. Fill in business info:
   - **Business name**: Bulgarski Mobili
   - **Country**: Bulgaria
   - **Time zone**: (GMT+2) Sofia
   - **Website**: https://mobilebg.eu

#### 3.2 Verify Website
**Same as Search Console** - if you already verified in Step 2, you can skip this:
1. Click "Claim website"
2. Choose verification method (HTML file or DNS)
3. Complete verification

#### 3.3 Add Product Feed
1. Go to "Products" → "Feeds"
2. Click "+ Add Feed"
3. Configuration:
   - **Feed name**: Bulgarian Cars Feed
   - **Country**: Bulgaria
   - **Language**: Bulgarian (bg)
   - **Primary feed**: Yes
   - **Input method**: Scheduled fetch

4. **Feed details**:
   - **Feed type**: RSS/XML
   - **File URL**: `https://europe-west1-fire-new-globul.cloudfunctions.net/merchantFeedGenerator`
     *(Use URL from Step 1.5)*
   - **Fetch schedule**: Every hour
   - **Time zone**: (GMT+2) Sofia

5. Click "Create Feed"

#### 3.4 Monitor Feed Status
1. Wait 15-30 minutes for first fetch
2. Go to "Diagnostics"
3. Check for errors:
   - ✅ **Green**: All products approved
   - ⚠️ **Yellow**: Some warnings (acceptable)
   - ❌ **Red**: Critical errors (need fixes)

**Common Issues & Fixes**:
| Error | Cause | Fix |
|-------|-------|-----|
| "Invalid price" | Non-numeric price | Check CarListing.price field |
| "Missing image" | Image URL broken | Verify Firebase Storage rules |
| "Invalid GTIN" | Missing identifier | Add VIN or set identifier_exists:false |

#### 3.5 Enable Free Listings (IMPORTANT)
1. Go to "Growth" → "Manage Programs"
2. Find "Free listings"
3. Click "Enable"
4. **Result**: Your cars show in Google Shopping for FREE (no ads)

**Expected Timeline**:
- First 24h: Feed processing
- Week 1: First cars appear in Shopping
- Month 1: Full catalog visible

---

### Step 4: Google Analytics 4 (Custom Dimensions)

**Goal**: Track seller/car numeric IDs for better reporting.

#### 4.1 Access GA4
1. Go to: https://analytics.google.com
2. Select property: "Bulgarian Car Marketplace" (linked to Firebase)

#### 4.2 Add Custom Dimensions
1. Click ⚙️ "Admin" (bottom left)
2. Go to "Custom definitions" (under "Data display")
3. Click "Create custom dimension"

**Dimension 1: Seller Numeric ID**
- **Dimension name**: Seller Numeric ID
- **Scope**: Event
- **Description**: Numeric ID of car seller (for segmentation)
- **Event parameter**: `seller_numeric_id`
- Click "Save"

**Dimension 2: Car Numeric ID**
- **Dimension name**: Car Numeric ID
- **Scope**: Event
- **Description**: Numeric ID of car listing (for tracking)
- **Event parameter**: `car_numeric_id`
- Click "Save"

#### 4.3 Mark Conversions
1. Go to "Configure" → "Events"
2. Find event: `generate_lead`
3. Toggle "Mark as conversion" to ON
4. Repeat for: `contact_seller`

#### 4.4 Test Custom Dimensions
1. Go to "Reports" → "Real-time"
2. Open https://mobilebg.eu/car/1/1 in new tab
3. Check if event appears with:
   - ✅ `seller_numeric_id: 1`
   - ✅ `car_numeric_id: 1`

**Expected Timeline**:
- Immediate: Real-time events visible
- 24-48h: Custom dimensions appear in standard reports

---

### Step 5: Production Environment Variables

**IMPORTANT**: Add base URL for absolute SEO links.

1. Edit `.env.production`:
```env
# Add this line
REACT_APP_BASE_URL=https://mobilebg.eu
```

2. Commit and redeploy:
```powershell
git add .env.production
git commit -m "Add production base URL for SEO"
git push origin main
```

3. Wait for GitHub Actions to deploy automatically

**Why**: Ensures OpenGraph and Twitter Cards use absolute URLs (https://mobilebg.eu/car/1/1 instead of /car/1/1)

---

## 🧪 Post-Setup Testing

### Test 1: Consent Banner
1. Open https://mobilebg.eu in **Incognito Mode**
2. ✅ Banner should appear at bottom
3. Click "Accept All"
4. ✅ Banner should disappear and not show again
5. Check localStorage: `consent_preferences: granted`

### Test 2: SEO Meta Tags
1. Open https://mobilebg.eu/car/1/1
2. Right-click → "View Page Source"
3. Search for (Ctrl+F):
   - ✅ `<meta property="og:title"`
   - ✅ `<meta name="twitter:card"`
   - ✅ `<script type="application/ld+json">` (JSON-LD)

### Test 3: Sitemap
1. Open: https://mobilebg.eu/sitemap.xml
2. ✅ Should show XML with car URLs
3. ✅ URLs should use numeric format: `/car/1/1`

### Test 4: Merchant Feed (After Step 1)
1. Open: `https://europe-west1-fire-new-globul.cloudfunctions.net/merchantFeedGenerator`
2. ✅ Should return XML feed
3. ✅ Should contain `<item>` tags with car details
4. ✅ URLs should use `https://mobilebg.eu/car/1/1` format

### Test 5: Image Optimizer (After Step 1)
1. Upload a new car image via sell workflow
2. Check Firebase Storage → `workflow-images/`
3. ✅ Should see variants: `_thumb.webp`, `_medium.webp`, `_large.webp`, `_hd.webp`

### Test 6: GA4 Events
1. Go to https://analytics.google.com
2. Open "Real-time" report
3. Browse https://mobilebg.eu/car/1/1
4. ✅ Should see event with `seller_numeric_id` and `car_numeric_id`

---

## 📊 Success Metrics (First 30 Days)

### Week 1
- [ ] Google Search Console: 50+ indexed pages
- [ ] Merchant Center: Feed approved, 0 errors
- [ ] GA4: 100+ daily active users
- [ ] Conversions: 5-10 leads/day

### Week 2-3
- [ ] Search Console: 200+ indexed pages
- [ ] Merchant Center: 100+ active products
- [ ] Organic traffic: 500+ visits/day
- [ ] Conversions: 20-30 leads/day

### Month 1
- [ ] Search Console: 500+ indexed pages
- [ ] Merchant Center: All cars approved
- [ ] Organic traffic: 1000+ visits/day
- [ ] Conversions: 50+ leads/day

---

## 🆘 Common Issues & Solutions

### Issue: Cloud Functions not deploying
**Error**: "Cloud Build API has not been used"
**Fix**:
1. Go to https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=fire-new-globul
2. Click "Enable"
3. Retry: `firebase deploy --only functions`

### Issue: Merchant feed returns 403/404
**Error**: "Cannot access feed URL"
**Fix**:
1. Check Cloud Functions deployed: `firebase functions:list`
2. Test URL in browser (should show XML)
3. Check Firestore rules allow reads

### Issue: Search Console shows "Sitemap could not be read"
**Error**: "HTTP error 404"
**Fix**:
1. Verify sitemap exists: `https://mobilebg.eu/sitemap.xml`
2. Check build folder: `build/sitemap.xml` present?
3. Redeploy hosting: `firebase deploy --only hosting`

### Issue: GA4 not receiving events
**Error**: "No real-time data"
**Fix**:
1. Check `.env`: `REACT_APP_FIREBASE_MEASUREMENT_ID` set?
2. Open browser console → Network tab
3. Look for requests to `google-analytics.com/g/collect`
4. If missing, check consent granted: `localStorage.getItem('consent_preferences')`

### Issue: Custom dimensions not visible
**Error**: "Dimension not in reports"
**Fix**:
1. Wait 24-48 hours (dimensions take time to populate)
2. Go to "Explore" → Create new exploration
3. Add dimension manually: "Seller Numeric ID"

---

## 📚 Next Steps (Optional - Phase 2)

### Week 1-2: Monitor & Optimize
- [ ] Check Search Console daily for crawl errors
- [ ] Fix Merchant Center disapprovals
- [ ] Review GA4 "Engagement" report
- [ ] Optimize slow pages (use Lighthouse)

### Week 3-4: Launch Ads
- [ ] Google Ads account creation
- [ ] Link Merchant Center to Ads
- [ ] Create Performance Max campaign (€50/day)
- [ ] Target: Bulgaria, car buyers

### Month 2: Scale
- [ ] Add Facebook Pixel (via GTM)
- [ ] Implement A/B testing
- [ ] Add email remarketing
- [ ] Launch dealer dashboard analytics

---

## ✅ Completion Checklist

- [ ] **Step 1**: Firebase Cloud Functions APIs enabled
- [ ] **Step 2**: Google Search Console property verified + sitemap submitted
- [ ] **Step 3**: Google Merchant Center feed configured + free listings enabled
- [ ] **Step 4**: GA4 custom dimensions created + conversions marked
- [ ] **Step 5**: Production .env.production with REACT_APP_BASE_URL
- [ ] **All Tests**: 6/6 passing
- [ ] **Monitoring**: Daily checks scheduled for week 1

---

**Need Help?**
- Firebase Console: https://console.firebase.google.com/project/fire-new-globul
- Search Console: https://search.google.com/search-console
- Merchant Center: https://merchants.google.com
- GA4: https://analytics.google.com

**Status**: Ready to Start ✅  
**Estimated Time**: 2-3 hours (mostly waiting for verification)


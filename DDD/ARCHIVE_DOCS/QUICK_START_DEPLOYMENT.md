# ⚡ Quick Start - Post-Deployment Actions

> **Time Required**: 30 minutes  
> **Status**: Immediate Action Required

---

## 🎯 3 Critical Actions (Do NOW)

### Action 1: Enable Cloud Functions (5 min)
```powershell
# 1. Go to Firebase Console
https://console.firebase.google.com/project/fire-new-globul/functions

# 2. Click "Get Started" and enable APIs

# 3. Deploy functions
cd "c:\Users\hamda\Desktop\New Globul Cars"
firebase deploy --only functions

# 4. Copy the merchant feed URL (save it!)
# Example: https://europe-west1-fire-new-globul.cloudfunctions.net/merchantFeedGenerator
```

### Action 2: Submit Sitemap to Google (10 min)
```
1. Go to: https://search.google.com/search-console
2. Add property: https://mobilebg.eu
3. Verify via HTML file or DNS
4. Submit sitemap: sitemap.xml
```

### Action 3: Setup Merchant Center (15 min)
```
1. Go to: https://merchants.google.com
2. Create account (business: Bulgarski Mobili, Bulgaria)
3. Add feed:
   - Type: RSS/XML
   - URL: [Your merchantFeedGenerator URL from Action 1]
   - Schedule: Every hour
4. Enable "Free listings" in Growth → Manage Programs
```

---

## 📋 Optional (Can Do Later)

### GA4 Custom Dimensions
- Time: 5 minutes
- Go to: https://analytics.google.com → Admin → Custom definitions
- Add:
  - `seller_numeric_id` (Event scope)
  - `car_numeric_id` (Event scope)

---

## ✅ How to Know You're Done

- [ ] **Functions deployed**: `firebase functions:list` shows merchantFeedGenerator
- [ ] **Sitemap submitted**: Search Console shows "Success" status
- [ ] **Merchant feed working**: Open feed URL in browser, see XML
- [ ] **Free listings enabled**: Merchant Center shows "Active"

---

## 🆘 Quick Troubleshooting

**Q: Functions won't deploy**  
A: Enable APIs at https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=fire-new-globul

**Q: Search Console verification failing**  
A: Use HTML file method:
1. Download file from Search Console
2. Copy to `public/` folder
3. Run: `npm run build && firebase deploy --only hosting`

**Q: Merchant feed shows 404**  
A: Wait 5 minutes after deploying functions, then retry URL

---

## 📖 Full Documentation

See `docs/POST_DEPLOYMENT_SETUP.md` for complete step-by-step guide.

---

**Next**: After completing these 3 actions, monitor for 24-48 hours. Your cars will start appearing in Google Search and Shopping automatically!

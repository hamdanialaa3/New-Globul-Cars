# Profile Tabs - Quick Test Guide

## ⚡ Quick Test

Open browser and test these URLs:

### Test Current User (assuming you're User 18):
```
✅ http://localhost:3000/profile
   → Should redirect to /profile/18

✅ http://localhost:3000/profile/18
   → Should show Overview

✅ http://localhost:3000/profile/18/my-ads
   → Should show My Ads with cars

✅ http://localhost:3000/profile/18/campaigns
   → Should show Campaigns management

✅ http://localhost:3000/profile/18/analytics
   → Should show Analytics dashboard

✅ http://localhost:3000/profile/18/settings
   → Should show Settings page

✅ http://localhost:3000/profile/18/consultations
   → Should show Consultations tab
```

### Test Other User (visit User 25):
```
✅ http://localhost:3000/profile/25
   → Should show User 25's profile

✅ http://localhost:3000/profile/25/my-ads
   → Should show User 25's cars

✅ http://localhost:3000/profile/25/campaigns
   → Should show if dealer/company, or "Not available"

❌ http://localhost:3000/profile/25/analytics
   → Should show "Access Denied"

❌ http://localhost:3000/profile/25/settings
   → Should show "Access Denied"

✅ http://localhost:3000/profile/25/consultations
   → Should show consultations
```

---

## 🐛 If Something Doesn't Work

### Issue: Tabs don't change content
**Solution**: Check browser console for errors

### Issue: "Access Denied" on own profile
**Solution**: Make sure you're logged in and visiting your own profile

### Issue: Routes not found
**Solution**: 
1. Check if dev server is running: `npm start`
2. Clear browser cache
3. Hard refresh: `Ctrl + Shift + R`

---

## ✅ Expected Behavior

### Tab Navigation:
- Clicking tabs should change URL
- Content should change immediately
- Active tab should be highlighted (orange glow)
- Navigation should work both ways (clicking tabs & direct URLs)

### Access Control:
- Own profile: All tabs accessible
- Other user's profile: 
  - ✅ Profile, My Ads, Consultations
  - ❌ Analytics, Settings
  - ✅ Campaigns (only if dealer/company)

### Loading States:
- Each tab should show "Loading..." while data loads
- No blank screens or errors

---

## 📊 Visual Checks

### Tab Bar:
- [ ] All 6 tabs visible
- [ ] Active tab has orange gradient
- [ ] Icons show correctly
- [ ] Tab names in correct language (BG/EN)

### Content:
- [ ] My Ads shows car grid
- [ ] Campaigns shows campaign list
- [ ] Analytics shows charts/stats
- [ ] Settings shows form sections
- [ ] Consultations shows expert list

---

## 🎯 Quick Checklist

- [ ] Can navigate between tabs by clicking
- [ ] Can access tabs via direct URL
- [ ] Active tab is highlighted
- [ ] Content loads correctly
- [ ] Access control works (Analytics/Settings restricted)
- [ ] No console errors
- [ ] No blank pages
- [ ] Loading states show

---

**If all checks pass → ✅ Working perfectly!**

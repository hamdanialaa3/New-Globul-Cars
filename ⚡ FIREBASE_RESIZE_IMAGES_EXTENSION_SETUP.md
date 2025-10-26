# ⚡ Firebase Resize Images Extension - Setup Guide
**دليل تثبيت امتداد تصغير الصور التلقائي على Firebase**

---

## 🎯 **WHAT IS THIS?**

Firebase Resize Images Extension automatically creates **multiple sizes** of every image uploaded to Firebase Storage — **server-side**, **automatically**, **no code changes needed**!

```
User uploads: car.jpg (5MB, 4000×3000)
  ↓ Firebase Extension automatically creates:
  ├── car_150x150.webp    (20KB)  - Thumbnail
  ├── car_400x400.webp    (80KB)  - Medium
  ├── car_800x800.webp   (200KB)  - Large
  ├── car_1920x1920.webp (500KB)  - Original (resized)
  └── car.jpg (original, unchanged)

✅ All sizes ready instantly!
✅ All in WebP format (30% smaller!)
✅ Zero code changes!

---

## 📋 **PREREQUISITES**

- Firebase project with **Blaze plan** (Pay-as-you-go) — ⚠️ **Required for Extensions**
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in: `firebase login`
- Current project set: `firebase use fire-new-globul`

**Check your plan:**
```bash
firebase projects:list
# Look for "Blaze" next to your project
```

---

## 🚀 **INSTALLATION (3 methods)**

### **Method 1: Firebase Console (Easiest - 5 minutes)**

1. **Go to Firebase Console:**
   ```
   https://console.firebase.google.com/project/fire-new-globul/extensions
   ```

2. **Click "Extensions" tab** (left sidebar)

3. **Click "Install Extension"**

4. **Search for: "Resize Images"**
   - Publisher: Firebase
   - Full name: `storage-resize-images`

5. **Click "Install"**

6. **Configure settings:**

   ```yaml
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONFIGURATION (⚡ Copy these exact values!)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   Cloud Functions location:
     europe-west1  (Bulgaria/EU region)
   
   Cloud Storage bucket for images:
     fire-new-globul.appspot.com  (default)
   
   Paths that contain images to resize:
     cars/{carId}/images/{imageId}
     users/{userId}/profile/{imageId}
     users/{userId}/cover/{imageId}
     users/{userId}/gallery/{imageId}
     posts/{postId}/images/{imageId}
   
   Absolute paths to exclude from resizing:
     [Leave empty]
   
   Cache-Control header for resized images:
     max-age=31536000  (1 year cache)
   
   Sizes of resized images:
     150x150,400x400,800x800,1920x1920
   
   Image type of resized image:
     webp  ⚡ (30% smaller than JPEG!)
   
   Delete original image:
     false  ⚠️ (Keep original!)
   
   Resized images path:
     {same directory}
   
   Convert image to preferred format:
     webp
   
   Image quality:
     80  (80% quality for WebP)
   
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

7. **Click "Install Extension"**

8. **Wait 2-3 minutes** for deployment

9. **✅ Done!** Test by uploading an image to `cars/{carId}/images/`

---

### **Method 2: Firebase CLI (Advanced - 2 minutes)**

```bash
# 1. Navigate to project
cd "C:\Users\hamda\Desktop\New Globul Cars"

# 2. Install extension
firebase ext:install storage-resize-images --project=fire-new-globul

# 3. Answer prompts:
# - Location: europe-west1
# - Bucket: fire-new-globul.appspot.com
# - Paths: cars/{carId}/images/{imageId},users/{userId}/profile/{imageId}
# - Sizes: 150x150,400x400,800x800,1920x1920
# - Format: webp
# - Quality: 80
# - Delete original: false

# 4. Deploy
firebase deploy --only extensions --project=fire-new-globul
```

---

### **Method 3: Extension Manifest File (Recommended for teams)**

Create `firebase/extensions/storage-resize-images.env`:

```env
LOCATION=europe-west1
IMG_BUCKET=fire-new-globul.appspot.com
IMG_SIZES=150x150,400x400,800x800,1920x1920
RESIZED_IMAGES_PATH={original}
DELETE_ORIGINAL_FILE=false
IMAGE_TYPE=webp
WEBP_QUALITY=80
CACHE_CONTROL_HEADER=max-age=31536000
INCLUDE_PATH_LIST=cars/{carId}/images/{imageId},users/{userId}/profile/{imageId},users/{userId}/cover/{imageId},posts/{postId}/images/{imageId}
```

Then deploy:
```bash
firebase deploy --only extensions
```

---

## 🧪 **TESTING**

### **Test 1: Upload via Firebase Console**

1. Go to **Storage** → `cars/test-123/images/`
2. Upload `test-car.jpg`
3. Wait 5-10 seconds
4. Refresh folder
5. **You should see:**
   ```
   test-car.jpg (original)
   test-car_150x150.webp
   test-car_400x400.webp
   test-car_800x800.webp
   test-car_1920x1920.webp
   ```

✅ **Success!** Extension is working!

---

### **Test 2: Upload via App**

```typescript
// In your app (no code changes needed!)
const storageRef = ref(storage, `cars/${carId}/images/photo.jpg`);
await uploadBytes(storageRef, file);

// ⚡ Extension automatically creates:
// - photo.jpg (original)
// - photo_150x150.webp
// - photo_400x400.webp
// - photo_800x800.webp
// - photo_1920x1920.webp

// Access resized versions:
const thumbnail = ref(storage, `cars/${carId}/images/photo_150x150.webp`);
const thumbURL = await getDownloadURL(thumbnail);
```

---

## 📊 **USAGE IN CODE (Optional improvements)**

### **Before (manual resize):**
```typescript
// Client-side compression (slow, bandwidth-heavy)
const compressed = await ImageOptimizationService.optimizeImage(file);
await uploadBytes(ref, compressed);
```

### **After (with Extension):**
```typescript
// Just upload original — Extension handles everything!
await uploadBytes(ref(storage, `cars/${carId}/images/photo.jpg`), file);

// Later, use the size you need:
const thumbURL = `${originalURL.replace('.jpg', '_150x150.webp')}`;
const mediumURL = `${originalURL.replace('.jpg', '_400x400.webp')}`;
```

---

## 💰 **COST (Very Low!)**

**Pricing:**
- Cloud Functions: **$0.40 per million invocations**
- Cloud Storage: **$0.026 per GB/month** (EU)

**Example monthly cost for 1000 uploads:**
```
1,000 uploads × 5 sizes = 5,000 function calls
5,000 / 1,000,000 × $0.40 = $0.002 (0.2 cents!)

Storage (1000 images × 5 sizes × 500KB avg):
2.5 GB × $0.026 = $0.065/month (6.5 cents!)

Total: ~$0.07/month for 1000 uploads! 💰
```

---

## ⚙️ **ADVANCED CONFIGURATION**

### **Resize only specific folders:**
```env
INCLUDE_PATH_LIST=cars/{carId}/images/{imageId}
```

### **Exclude thumbnails from resizing:**
```env
EXCLUDE_PATH_LIST=**/thumbnail_*.jpg
```

### **Add watermark (requires custom function):**
```typescript
// Not built-in, but easy to add via Cloud Function trigger
```

### **Different sizes for different folders:**
```env
# Not supported — use multiple extension instances
# Install extension twice with different paths
```

---

## 🔍 **TROUBLESHOOTING**

### **Issue: Extension not creating resized images**

**Check 1:** Verify extension is deployed
```bash
firebase ext:list
# Should show: storage-resize-images
```

**Check 2:** Check Cloud Functions logs
```bash
firebase functions:log --project=fire-new-globul
```

**Check 3:** Verify path matches `INCLUDE_PATH_LIST`
```
Upload path: cars/abc123/images/photo.jpg  ✅ Matches
Upload path: cars/photo.jpg                ❌ Doesn't match
```

**Check 4:** Wait 10-30 seconds
- Extension runs asynchronously
- May take 10-30s to complete

---

### **Issue: Original image deleted**

**Solution:** Set `DELETE_ORIGINAL_FILE=false` in config

---

### **Issue: Wrong format (JPEG instead of WebP)**

**Solution:** Set `IMAGE_TYPE=webp` and `CONVERT_IMAGE=true`

---

## 📚 **OFFICIAL DOCS**

- Extension: https://firebase.google.com/products/extensions/storage-resize-images
- GitHub: https://github.com/firebase/extensions/tree/master/storage-resize-images
- Pricing: https://firebase.google.com/pricing

---

## ✅ **SUMMARY**

```
✅ Install: 5 minutes (Method 1)
✅ Cost: ~$0.07/month (1000 uploads)
✅ Code changes: ZERO!
✅ Performance gain: 30% smaller images (WebP)
✅ Automatic: Works on every upload
✅ Sizes: 4 variants created instantly
✅ Format: WebP (modern, fast)
✅ Region: europe-west1 (Bulgaria/EU)

🎯 Next Steps:
  1. Go to Firebase Console
  2. Install extension (5 min)
  3. Test upload
  4. ✅ Done!

📈 Expected Results:
  Before: Manual resize, slow, client-heavy
  After:  Automatic, fast, server-side!
  
🏆 Status: READY TO INSTALL!
```

---

**Created:** Oct 26, 2025  
**Location:** Bulgaria  
**Languages:** BG/EN  
**Currency:** EUR  
**Project:** Globul Cars (fire-new-globul)


# 🔌 Firebase Extensions Required
## الـ Extensions المطلوبة من Firebase لدعم خطة البروفايلات

**الرقم:** 36 (الدعم التنفيذي)  
**الأولوية:** 🟡 HIGH  
**الحالة:** ✅ Ready for Installation  
**التاريخ:** نوفمبر 2025

---

## 🎯 Extensions الأساسية (MUST HAVE)

### 1. 🖼️ Resize Images (CRITICAL)

**Extension:** `storage-resize-images`  
**الأولوية:** 🔴 MUST HAVE  
**الاستخدام:** Profile photos, logos, cover images

#### لماذا نحتاجها؟
```
في خطة البروفايلات:
✓ Profile avatars (100x100, 200x200, 400x400)
✓ Dealer logos (150x150, 300x300)
✓ Cover images (1200x400, 1920x600)
✓ Gallery images (thumbnails)

بدون Extension:
❌ صور كبيرة تبطئ التحميل
❌ bandwidth مكلف
❌ poor performance
```

#### التثبيت
```bash
# في Firebase Console
https://console.firebase.google.com/project/fire-new-globul/extensions

# أو CLI:
firebase ext:install storage-resize-images --project=fire-new-globul
```

#### الإعدادات المقترحة
```yaml
Cloud Functions location: europe-west1
Cloud Storage bucket: fire-new-globul.appspot.com

Image paths (one per line):
  users/{userId}/profile/photo
  users/{userId}/profile/cover
  dealerships/{userId}/logo
  dealerships/{userId}/gallery
  companies/{userId}/logo

Sizes (comma-separated):
  100x100,200x200,400x400

Delete original: No
Output format: webp,jpg

Cache-Control: max-age=31536000

Image type: jpeg,png,webp,gif

Backfill: Yes (للصور الموجودة)
```

#### الفائدة
```typescript
// After upload:
users/{uid}/profile/photo_original.jpg
users/{uid}/profile/photo_100x100.webp  ← thumbnail
users/{uid}/profile/photo_200x200.webp  ← medium
users/{uid}/profile/photo_400x400.webp  ← large

// في الكود:
<img src={photoURL_200x200} alt="Profile" />  // ✅ Fast!
```

---

### 2. 🗑️ Delete User Data (GDPR)

**Extension:** `delete-user-data`  
**الأولوية:** 🔴 MUST HAVE  
**الاستخدام:** GDPR compliance, account deletion

#### لماذا نحتاجها؟
```
في خطة البروفايلات:
✓ حذف users/{uid} عند إلغاء الحساب
✓ حذف dealerships/{uid}
✓ حذف companies/{uid}
✓ حذف الصور من Storage
✓ GDPR compliant

بدون Extension:
❌ بيانات الـ orphaned تبقى
❌ مخالفة GDPR
❌ Storage waste
```

#### التثبيت
```bash
firebase ext:install delete-user-data --project=fire-new-globul
```

#### الإعدادات المقترحة
```yaml
Cloud Functions location: europe-west1

Paths to delete (one per line):
  users/{UID}
  dealerships/{UID}
  companies/{UID}
  user_audit/{UID}
  rate_limits/{UID}

Storage paths to delete:
  users/{UID}
  dealerships/{UID}
  companies/{UID}
```

#### الاستخدام
```typescript
// عند حذف الحساب:
import { auth } from './firebase-config';

async function deleteAccount() {
  const user = auth.currentUser;
  
  // Delete auth account
  await deleteUser(user);
  
  // Extension automatically:
  // ✅ Deletes users/{uid}
  // ✅ Deletes dealerships/{uid}
  // ✅ Deletes companies/{uid}
  // ✅ Deletes all storage files
}
```

---

### 3. 📧 Trigger Email (Notifications)

**Extension:** `firestore-send-email`  
**الأولوية:** 🟡 HIGH  
**الاستخدام:** Profile verification, plan upgrades, notifications

#### لماذا نحتاجها؟
```
في خطة البروفايلات:
✓ Email عند التحقق من الهوية
✓ Email عند ترقية الخطة
✓ Email عند تحويل Profile type
✓ Email عند اكتمال الملف الشخصي
✓ Notifications بالبلغارية والإنجليزية
```

#### التثبيت
```bash
firebase ext:install firestore-send-email --project=fire-new-globul
```

#### الإعدادات
```yaml
Cloud Functions location: europe-west1

SMTP connection URI:
  smtp://smtp.gmail.com:587
  # أو استخدم SendGrid / Mailgun

Email from:
  Globul Cars <noreply@mobilebg.eu>

Collection path:
  mail
```

#### الاستخدام
```typescript
// إرسال email عند التحقق
await addDoc(collection(db, 'mail'), {
  to: user.email,
  template: {
    name: 'id-verified',
    data: {
      userName: user.displayName,
      language: user.preferredLanguage  // 'bg' or 'en'
    }
  }
});

// Extension يرسل تلقائياً!
```

---

### 4. 💾 Firestore Backup (Safety)

**Extension:** `firestore-bigquery-export`  
**الأولوية:** 🟡 HIGH  
**الاستخدام:** Automatic backups, analytics, migration safety

#### لماذا نحتاجها؟
```
في خطة الترحيل:
✓ Backup تلقائي يومي
✓ Point-in-time recovery
✓ Analytics on historical data
✓ Safety net للترحيل

بدون Extension:
❌ Manual backups فقط
❌ لا historical data
❌ صعوبة الـ rollback
```

#### التثبيت
```bash
firebase ext:install firestore-bigquery-export --project=fire-new-globul
```

#### الإعدادات
```yaml
Cloud Functions location: europe-west1

Collection path:
  users
  
Dataset ID:
  firestore_export

Table ID:
  users_raw_changelog
```

---

## 🎯 Extensions الاختيارية (NICE TO HAVE)

### 5. 🔍 Algolia Search

**Extension:** `firestore-algolia-search`  
**الأولوية:** 🟢 OPTIONAL  
**الاستخدام:** Advanced profile search

#### التثبيت
```bash
firebase ext:install firestore-algolia-search --project=fire-new-globul
```

#### الإعدادات
```yaml
Algolia App ID: RTGDK12KTJ
Algolia API Key: 09fbf48591c637634df71d89843c55c0 (Admin key)

Collection path: users
Index name: users

Algolia Index Settings:
  searchableAttributes: displayName,firstName,lastName,city
  attributesForFaceting: profileType,city,region,planTier
  customRanking: desc(trustScore),desc(totalListings)

Transform function (optional):
```javascript
const algoliaRecord = {
  objectID: snapshot.id,
  profileType: snapshot.data().profileType,
  displayName: snapshot.data().displayName,
  city: snapshot.data().location?.city,
  trustScore: snapshot.data().stats?.trustScore || 0,
  // Add dealer-specific fields if dealer
  ...(snapshot.data().profileType === 'dealer' && {
    dealershipNameBG: snapshot.data().dealerSnapshot?.nameBG,
    dealershipNameEN: snapshot.data().dealerSnapshot?.nameEN
  })
};
return algoliaRecord;
```
```

**للمزيد:** راجع `35_ALGOLIA_INTEGRATION.md`

---

### 6. 🌐 Translate Text

**Extension:** `firestore-translate-text`  
**الأولوية:** 🟢 OPTIONAL  
**الاستخدام:** Auto-translate dealer descriptions

#### متى تكون مفيدة؟
```
Use case:
- Dealer يكتب description بالبلغارية فقط
- Extension تترجم تلقائياً للإنجليزية
- Users الإنجليز يفهمون

Example:
dealershipDescriptionBG: "Автокъща в София..."
↓ (Auto-translated)
dealershipDescriptionEN: "Car dealership in Sofia..."
```

#### التثبيت
```bash
firebase ext:install firestore-translate-text --project=fire-new-globul
```

#### الإعدادات
```yaml
Collection path: dealerships
Input field: descriptionBG
Output field: descriptionEN
Languages: en
Source language: bg
```

---

### 7. 📊 Firestore Counter

**Extension:** `firestore-counter`  
**الأولوية:** 🟢 OPTIONAL  
**الاستخدام:** Accurate counts (followers, listings)

#### الفائدة
```typescript
// بدون Extension:
// عد الـ followers في كل مرة (expensive!)
const followersSnapshot = await getDocs(
  collection(db, 'users', uid, 'followers')
);
const count = followersSnapshot.size;  // ❌ Reads all docs!

// مع Extension:
const counterDoc = await getDoc(
  doc(db, 'users', uid, '_counter', 'followers')
);
const count = counterDoc.data().count;  // ✅ One read only!
```

#### التثبيت
```bash
firebase ext:install firestore-counter --project=fire-new-globul
```

---

## 📋 خطة التثبيت المقترحة

### Phase 0 (قبل البدء)
```
1. ✅ Resize Images (MUST)
   - Install before any image uploads
   - Configure sizes
   - Backfill existing images
   
2. ✅ Delete User Data (MUST)
   - GDPR compliance
   - Configure paths
```

### Phase 2 (Services)
```
3. 🟡 Trigger Email
   - للإشعارات
   - Configure SMTP
   
4. 🟡 Firestore Backup
   - للأمان
   - Configure BigQuery
```

### Phase 3 (UI) - Optional
```
5. 🟢 Algolia Search (optional)
   - للبحث المتقدم
   - راجع 35_ALGOLIA_INTEGRATION.md
   
6. 🟢 Translate Text (optional)
   - للترجمة التلقائية
   
7. 🟢 Counter (optional)
   - للإحصائيات الدقيقة
```

---

## 💰 التكلفة

### المجانية (Free Tier)
```
✅ Resize Images: FREE (100GB processed/month)
✅ Delete User Data: FREE
✅ Trigger Email: FREE (200 emails/day on Spark plan)
✅ Firestore BigQuery: FREE (1TB queries/month)
✅ Algolia: FREE (10k records, 10k searches/month)
✅ Translate: Pay as you go (~$20/1M chars)
✅ Counter: FREE
```

**إجمالي:** FREE (ضمن الحدود المجانية)

---

## 🚀 أوامر التثبيت السريع

### الطريقة 1: Firebase Console (سهلة)

```
1. اذهب إلى:
   https://console.firebase.google.com/project/fire-new-globul/extensions

2. انقر "Browse Extensions"

3. ثبّت واحدة تلو الأخرى:
   ✓ Resize Images
   ✓ Delete User Data
   ✓ Trigger Email from Firestore
   ✓ Firestore BigQuery Export
   ✓ Algolia Search (optional)
```

### الطريقة 2: Firebase CLI (أسرع)

```bash
# في terminal

# 1. Resize Images (MUST)
firebase ext:install firebase/storage-resize-images \
  --project=fire-new-globul

# 2. Delete User Data (MUST)
firebase ext:install firebase/delete-user-data \
  --project=fire-new-globul

# 3. Trigger Email (Recommended)
firebase ext:install firebase/firestore-send-email \
  --project=fire-new-globul

# 4. Firestore Backup (Recommended)
firebase ext:install firebase/firestore-bigquery-export \
  --project=fire-new-globul

# 5. Algolia Search (Optional)
firebase ext:install algolia/firestore-algolia-search \
  --project=fire-new-globul
```

---

## ⚙️ إعدادات مفصلة لكل Extension

### 1. Resize Images Configuration

```yaml
Extension ID: storage-resize-images
Version: latest

Cloud Functions deployment location:
  europe-west1  ← قريب من Bulgaria

Cloud Storage bucket for resized images:
  fire-new-globul.appspot.com

Path(s) that contain images to resize:
  users/{userId}/profile/photo
  users/{userId}/profile/cover
  dealerships/{userId}/logo
  dealerships/{userId}/cover
  dealerships/{userId}/gallery
  companies/{userId}/logo
  
Sizes of resized images (width or width x height):
  100x100
  200x200
  400x400
  800x800
  1200x400
  1920x600

Resized images naming scheme:
  {original}_{size}

Delete original image:
  No  ← نحتفظ بالـ original

Convert image to preferred types:
  webp,jpg

Image quality (0-100):
  85

Cache-Control header for resized images:
  max-age=31536000

Backfill existing images:
  Yes  ← مهم! للصور الموجودة حالياً
```

#### الاستخدام في الكود
```typescript
// بعد رفع الصورة
const photoRef = ref(storage, `users/${uid}/profile/photo.jpg`);
await uploadBytes(photoRef, file);

// Extension تعمل تلقائياً!
// النتيجة:
// - photo_original.jpg
// - photo_100x100.webp  ← للـ thumbnail
// - photo_200x200.webp  ← للـ list view
// - photo_400x400.webp  ← للـ detail view

// في الكود:
const photoURL = `users/${uid}/profile/photo_200x200.webp`;
<img src={photoURL} />  // ✅ سريع جداً!
```

---

### 2. Delete User Data Configuration

```yaml
Extension ID: delete-user-data
Version: latest

Cloud Functions deployment location:
  europe-west1

Firestore paths (one per line):
  users/{UID}
  dealerships/{UID}
  companies/{UID}
  user_audit/{UID}
  rate_limits/{UID}
  posts/{postId}  # where userId == {UID}
  cars/{carId}    # where userId == {UID}
  conversations/{conversationId}  # where participants contains {UID}

Cloud Storage paths (one per line):
  users/{UID}
  dealerships/{UID}
  companies/{UID}

Realtime Database paths:
  # (leave empty if not used)
```

#### الاستخدام
```typescript
// ProfileSettings.tsx - Danger Zone
async function handleDeleteAccount() {
  const confirmed = window.confirm(
    language === 'bg'
      ? 'Сигурни ли сте? Тази операция е необратима!'
      : 'Are you sure? This action cannot be undone!'
  );
  
  if (!confirmed) return;
  
  try {
    // Delete Firebase Auth account
    await deleteUser(auth.currentUser!);
    
    // Extension automatically deletes:
    // ✅ users/{uid}
    // ✅ dealerships/{uid} (if dealer)
    // ✅ companies/{uid} (if company)
    // ✅ All user files in Storage
    // ✅ All related data
    
    toast.success('Account deleted successfully');
    navigate('/');
  } catch (error) {
    toast.error('Failed to delete account');
  }
}
```

---

### 3. Trigger Email Configuration

```yaml
Extension ID: firestore-send-email
Version: latest

Cloud Functions deployment location:
  europe-west1

Email documents collection:
  mail

SMTP connection URI:
  smtp://smtp.gmail.com:587
  # أو:
  # smtp://smtp.sendgrid.net:587 (أفضل)
  
SMTP username:
  hamdanialaa@yahoo.com
  # أو SendGrid API key
  
SMTP password:
  [YOUR_APP_PASSWORD]
  # Gmail: App Password من Google Account
  # SendGrid: API Key

Default FROM email address:
  Globul Cars <noreply@mobilebg.eu>

Default REPLY-TO email address:
  support@mobilebg.eu

Users collection (optional):
  users

Users email field (optional):
  email

Email templates collection (optional):
  email_templates
```

#### إنشاء Templates

**Create:** `email_templates` collection في Firestore

```javascript
// Template: id-verified (Bulgarian)
{
  id: 'id-verified-bg',
  language: 'bg',
  subject: 'Вашата самоличност е потвърдена!',
  html: `
    <h2>Поздравления, {{userName}}!</h2>
    <p>Вашата самоличност беше успешно потвърдена.</p>
    <p>Trust Score: <strong>{{trustScore}}/100</strong></p>
    <a href="https://fire-new-globul.web.app/profile">Вижте профила си</a>
  `
}

// Template: id-verified (English)
{
  id: 'id-verified-en',
  language: 'en',
  subject: 'Your ID has been verified!',
  html: `
    <h2>Congratulations, {{userName}}!</h2>
    <p>Your identity has been successfully verified.</p>
    <p>Trust Score: <strong>{{trustScore}}/100</strong></p>
    <a href="https://fire-new-globul.web.app/profile">View your profile</a>
  `
}

// Template: profile-type-changed
{
  id: 'profile-type-changed-bg',
  subject: 'Типът на профила ви е променен',
  html: `
    <h2>Здравейте, {{userName}}</h2>
    <p>Вашият профил беше променен на <strong>{{newType}}</strong>.</p>
    <p>Нови възможности:</p>
    <ul>
      <li>Максимум обяви: {{maxListings}}</li>
      <li>Аналитика: {{hasAnalytics}}</li>
    </ul>
  `
}
```

#### الاستخدام
```typescript
// عند التحقق من الهوية
async function onIDVerified(userId: string) {
  const user = await getDoc(doc(db, 'users', userId));
  const userData = user.data();
  
  // إرسال email
  await addDoc(collection(db, 'mail'), {
    to: userData.email,
    template: {
      name: `id-verified-${userData.preferredLanguage}`,
      data: {
        userName: userData.displayName,
        trustScore: userData.stats?.trustScore || 0
      }
    }
  });
}

// عند تحويل Profile type
async function onProfileTypeChanged(userId: string, newType: string) {
  const user = await getDoc(doc(db, 'users', userId));
  const userData = user.data();
  
  await addDoc(collection(db, 'mail'), {
    to: userData.email,
    template: {
      name: `profile-type-changed-${userData.preferredLanguage}`,
      data: {
        userName: userData.displayName,
        newType: newType === 'dealer' ? 'Дилър' : 'Компания',
        maxListings: userData.permissions?.maxListings || 0,
        hasAnalytics: userData.permissions?.hasAnalytics ? 'Да' : 'Не'
      }
    }
  });
}
```

---

### 6. 🔒 Authenticate with Custom Token

**Extension:** `auth-custom-claims`  
**الأولوية:** 🟢 OPTIONAL  
**الاستخدام:** Role-based access (admin, dealer, etc.)

```yaml
# Useful for:
- Admin roles
- Dealer verification status
- Premium features access
```

---

### 7. 📸 WebP Image Converter

**Extension:** `storage-webp-converter`  
**الأولوية:** 🟢 OPTIONAL (Resize Images already does this)

```yaml
# Note: Resize Images extension already converts to WebP
# Only install if you need standalone WebP conversion
```

---

## 📋 Recommended Installation Order

### Week -1 (قبل Phase -1)
```bash
# 1. Resize Images (CRITICAL)
firebase ext:install firebase/storage-resize-images

# Configure: all image paths, sizes (100-1920px), webp output

# 2. Delete User Data (CRITICAL)
firebase ext:install firebase/delete-user-data

# Configure: all user paths (users, dealerships, companies)
```

### Week 0 (Phase 0)
```bash
# 3. Trigger Email
firebase ext:install firebase/firestore-send-email

# Configure SMTP + create templates

# 4. Firestore Backup
firebase ext:install firebase/firestore-bigquery-export

# Configure: users collection → BigQuery
```

### Week 2-3 (Phase 2B) - Optional
```bash
# 5. Algolia Search (if needed)
firebase ext:install algolia/firestore-algolia-search

# Configure: users → users index
```

---

## 🧪 Testing Extensions

### Test 1: Resize Images
```typescript
// Upload test image
const testFile = new File([blob], 'test.jpg');
const ref = ref(storage, 'users/test-user/profile/photo.jpg');
await uploadBytes(ref, testFile);

// Wait 10 seconds
await new Promise(r => setTimeout(r, 10000));

// Check resized versions
const resized200 = await getDownloadURL(
  ref(storage, 'users/test-user/profile/photo_200x200.webp')
);
console.log('✅ Resized image:', resized200);
```

### Test 2: Delete User Data
```typescript
// Create test user in Firestore
await setDoc(doc(db, 'users', 'test-delete'), {
  email: 'test@test.com',
  displayName: 'Test User'
});

// Delete auth account
const testUser = await createUserWithEmailAndPassword(
  auth,
  'test@test.com',
  'password123'
);
await deleteUser(testUser.user);

// Wait 30 seconds
await new Promise(r => setTimeout(r, 30000));

// Verify Firestore doc deleted
const userDoc = await getDoc(doc(db, 'users', 'test-delete'));
console.log('Deleted:', !userDoc.exists());  // ✅ Should be true
```

### Test 3: Trigger Email
```typescript
// Send test email
await addDoc(collection(db, 'mail'), {
  to: 'hamdanialaa@yahoo.com',
  message: {
    subject: 'Test Email from Globul Cars',
    text: 'This is a test email',
    html: '<h1>Test Email</h1><p>Extension is working!</p>'
  }
});

// Check your email in 1-2 minutes
// ✅ Should receive email
```

---

## 📊 Expected Benefits

### Performance
```
Before Extensions:
- Image load: 2-5 seconds (large images)
- Search: 500-1000ms (Firestore queries)
- Emails: Manual Cloud Functions

After Extensions:
- Image load: 200-500ms (optimized WebP)
- Search: 50-100ms (Algolia)
- Emails: Automatic
```

### Cost Savings
```
Image bandwidth: -70% (WebP compression)
Search costs: -80% (Algolia vs Firestore)
Development time: -50% (no custom code)
```

---

## 🎯 Integration في الخطة

### Phase -1 Day 1: Install Critical Extensions
```
✓ Resize Images
✓ Delete User Data
```

### Phase 0.0: Configure Extensions
```
✓ Test Resize Images with sample uploads
✓ Test Delete User Data with test account
✓ Verify backfill completed
```

### Phase 2B: Install Optional Extensions
```
✓ Trigger Email (if needed)
✓ Firestore Backup (recommended)
✓ Algolia (if search needed)
```

---

## 📝 Configuration Checklist

### Pre-Installation
```
[ ] Firebase project selected: fire-new-globul
[ ] Billing enabled (Blaze plan required)
[ ] Service account permissions verified
[ ] Region selected: europe-west1
```

### Post-Installation (Each Extension)
```
[ ] Extension installed successfully
[ ] Configuration completed
[ ] Test performed
[ ] Monitoring enabled
[ ] Documentation updated
```

---

## 🔗 Useful Links

```
Firebase Extensions Console:
https://console.firebase.google.com/project/fire-new-globul/extensions

Extension Catalog:
https://extensions.dev/

Resize Images Docs:
https://firebase.google.com/products/extensions/storage-resize-images

Delete User Data Docs:
https://firebase.google.com/products/extensions/delete-user-data

Trigger Email Docs:
https://firebase.google.com/products/extensions/firestore-send-email

Algolia Extension:
https://www.algolia.com/doc/tools/firebase-extensions/
```

---

## 🎉 الخلاصة

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   🔌 Firebase Extensions للخطة                  │
│                                                  │
│   الأساسية (MUST HAVE):                         │
│   ✓ Resize Images (performance)                 │
│   ✓ Delete User Data (GDPR)                     │
│                                                  │
│   الموصى بها (RECOMMENDED):                     │
│   ✓ Trigger Email (notifications)               │
│   ✓ Firestore Backup (safety)                   │
│                                                  │
│   الاختيارية (OPTIONAL):                        │
│   ✓ Algolia Search (advanced search)            │
│   ✓ Translate Text (auto-translate)             │
│   ✓ Counter (accurate counts)                   │
│                                                  │
│   💰 التكلفة: FREE (ضمن الحدود المجانية)       │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🚀 الخطوة التالية

```
1. ثبّت Extensions الأساسية (Week -1):
   firebase ext:install firebase/storage-resize-images
   firebase ext:install firebase/delete-user-data

2. اختبر Extensions:
   - رفع صورة test
   - حذف مستخدم test
   - تحقق من النتائج

3. ثبّت Algolia (optional) في Phase 2B:
   firebase ext:install algolia/firestore-algolia-search
```

---

**الحالة:** ✅ Ready - Algolia Credentials Saved  
**الأولوية:** Extensions الأساسية = MUST HAVE قبل البدء  
**Timeline:** Install في Week -1 (قبل Phase -1)


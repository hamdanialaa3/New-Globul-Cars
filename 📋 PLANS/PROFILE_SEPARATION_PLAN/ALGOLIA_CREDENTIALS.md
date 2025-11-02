# 🔐 Algolia Credentials
## معلومات API الخاصة بـ Algolia

**التاريخ:** نوفمبر 2025  
**الحالة:** ✅ Saved  
**⚠️ CONFIDENTIAL:** هذا الملف يحتوي على مفاتيح سرية

---

## 📋 Application Info

```
Application Name: My First Application (MF)
Application ID: RTGDK12KTJ
Email: hamdanialaa@yahoo.com
Dashboard: https://www.algolia.com/apps/RTGDK12KTJ/dashboard
```

---

## 🔑 API Keys

### 1. Search API Key (PUBLIC - Frontend Safe)
```
Key: 01d60b828b7263114c11762ff5b7df9b
Usage: Frontend search queries
Permissions: search, browse
Security: ✅ Safe to use in React app
```

### 2. Write API Key (PRIVATE - Backend Only)
```
Key: 47f0015ced4e86add8acc2e35ea01395
Usage: Create, update, delete indices
Permissions: addObject, deleteObject, settings
Security: ⚠️ Backend only (Cloud Functions)
```

### 3. Admin API Key (PRIVATE - Backend Only)
```
Key: 09fbf48591c637634df71d89843c55c0
Usage: Full admin access + API key management
Permissions: ALL
Security: ⚠️ Backend only (Cloud Functions)
```

### 4. Usage API Key (Monitoring)
```
Key: 40fe2100367a99c832c2a9db7a80f1ac
Usage: Access Usage API and Logs
Permissions: analytics, logs
Security: ⚠️ Backend only
```

### 5. Monitoring API Key (Monitoring)
```
Key: 4f04e850de923f14eeb593e983d6d448
Usage: Access Monitoring API
Permissions: monitoring
Security: ⚠️ Backend only
```

---

## 📁 Environment Files

### Frontend (.env.local)
```bash
# bulgarian-car-marketplace/.env.local

# Algolia (PUBLIC KEYS ONLY)
REACT_APP_ALGOLIA_APP_ID=RTGDK12KTJ
REACT_APP_ALGOLIA_SEARCH_API_KEY=01d60b828b7263114c11762ff5b7df9b
```

### Backend (functions/.env)
```bash
# functions/.env

# Algolia (PRIVATE KEYS)
ALGOLIA_APP_ID=RTGDK12KTJ
ALGOLIA_ADMIN_API_KEY=09fbf48591c637634df71d89843c55c0
ALGOLIA_WRITE_API_KEY=47f0015ced4e86add8acc2e35ea01395

# Monitoring (optional)
ALGOLIA_USAGE_API_KEY=40fe2100367a99c832c2a9db7a80f1ac
ALGOLIA_MONITORING_API_KEY=4f04e850de923f14eeb593e983d6d448
```

### Firebase Config (firebase functions:config)
```bash
# Set in Firebase
firebase functions:config:set \
  algolia.app_id="RTGDK12KTJ" \
  algolia.admin_key="09fbf48591c637634df71d89843c55c0" \
  algolia.write_key="47f0015ced4e86add8acc2e35ea01395"

# Verify
firebase functions:config:get
```

---

## 🔒 Security Best Practices

### ✅ DO
```
✓ استخدم Search Key في Frontend فقط
✓ استخدم Admin/Write Keys في Cloud Functions فقط
✓ احفظ Keys في .env (لا تضعها في الكود!)
✓ أضف .env إلى .gitignore
✓ استخدم environment variables
```

### ❌ DON'T
```
✗ لا تضع Admin Key في Frontend!
✗ لا تحفظ Keys في GitHub
✗ لا تشارك Admin Key مع أحد
✗ لا تستخدم Write Key في الكود العام
```

---

## 📊 Usage Limits (Free Tier)

```
Records: 10,000 free
Search requests: 10,000/month free

Current usage:
Users: ~1,500
Dealers: ~150
Companies: ~10
Total: ~1,660 records ✅ Within limits

Expected searches: ~5,000/month ✅ Within limits
```

---

## 🧪 Testing

### Test Connection
```typescript
// Test in browser console
import algoliasearch from 'algoliasearch/lite';

const client = algoliasearch(
  'RTGDK12KTJ',
  '01d60b828b7263114c11762ff5b7df9b'
);

const index = client.initIndex('users');
const { hits } = await index.search('test');
console.log('✅ Algolia connected:', hits);
```

---

## 🔄 Regenerate Keys

إذا احتجت تجديد المفاتيح:

```
1. اذهب إلى:
   https://www.algolia.com/apps/RTGDK12KTJ/api-keys/all

2. انقر "Regenerate" بجانب المفتاح

3. حدّث .env files

4. أعد deploy Functions:
   firebase deploy --only functions
```

---

## 📞 Support

```
Algolia Dashboard:
https://www.algolia.com/apps/RTGDK12KTJ/dashboard

API Keys:
https://www.algolia.com/apps/RTGDK12KTJ/api-keys/all

Documentation:
https://www.algolia.com/doc/

Support:
https://www.algolia.com/support/
```

---

**⚠️ أمان:** احذف هذا الملف من Git قبل النشر!  
**الحالة:** ✅ Credentials Saved  
**آخر تحديث:** نوفمبر 2025


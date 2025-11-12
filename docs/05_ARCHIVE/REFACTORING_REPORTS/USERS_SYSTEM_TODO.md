# 📋 خطة العمل المتبقية - Users System
## Remaining Work Plan

---

## 🔴 **المرحلة 2: دعم البروفايلات الثلاثة** (عاجل)

### **2.1 إضافة Plan Badges** 💎
```typescript
// في ListUserName
<PlanBadge $planTier={user.planTier} $profileType={user.profileType}>
  {getPlanLabel(user.planTier, language)}
</PlanBadge>

// Utility function
const getPlanLabel = (tier: PlanTier, lang: string) => {
  const labels = {
    free: { bg: '🆓 Безплатен', en: '🆓 Free' },
    premium: { bg: '⭐ Премиум', en: '⭐ Premium' },
    dealer_basic: { bg: '🟢 Базов', en: '🟢 Basic' },
    dealer_pro: { bg: '💎 Про', en: '💎 Pro' },
    dealer_enterprise: { bg: '👑 Ентърпрайз', en: '👑 Enterprise' },
    // ... etc
  };
  return labels[tier]?.[lang] || tier;
};
```

### **2.2 عرض الألوان المميزة** 🎨
```typescript
import { useProfileType } from '@/contexts/ProfileTypeContext';

// في Component
const { theme } = useProfileType();

// استخدام الألوان
const borderColor = THEMES[user.profileType].primary;
const gradient = THEMES[user.profileType].gradient;
```

### **2.3 عرض Business Info** 🏢
```typescript
// للـ Dealers
{user.profileType === 'dealer' && user.dealerSnapshot && (
  <BusinessInfo>
    <Building2 size={16} />
    <span>{language === 'bg' ? user.dealerSnapshot.nameBG : user.dealerSnapshot.nameEN}</span>
    {user.dealerSnapshot.status === 'verified' && (
      <CheckCircle size={14} color="#16a34a" />
    )}
  </BusinessInfo>
)}

// للـ Companies
{user.profileType === 'company' && user.companySnapshot && (
  <BusinessInfo>
    <Building2 size={16} />
    <span>{language === 'bg' ? user.companySnapshot.nameBG : user.companySnapshot.nameEN}</span>
    {user.companySnapshot.vatNumber && (
      <span className="vat">VAT: {user.companySnapshot.vatNumber}</span>
    )}
  </BusinessInfo>
)}
```

### **2.4 إصلاح الإحصائيات** 📊
```typescript
// ❌ الخطأ الحالي
{user.verification?.trustScore || 0}

// ✅ الصحيح
{user.stats?.trustScore || 0}

// في Quick Stats
<StatBigNumber>
  {Math.round(filteredUsers.reduce((sum, u) => 
    sum + (u.stats?.trustScore || 0), 0) / (filteredUsers.length || 1))}
</StatBigNumber>
```

---

## 🟡 **المرحلة 3: تحسينات الأداء** (متوسط الأولوية)

### **3.1 Virtual Scrolling** 📜
```bash
npm install react-virtuoso
```

```typescript
import { Virtuoso } from 'react-virtuoso';

<Virtuoso
  data={filteredUsers}
  itemContent={(index, user) => (
    <UserCard key={user.uid} user={user} />
  )}
  style={{ height: '800px' }}
/>
```

### **3.2 Caching Strategy** 💾
```typescript
// في usersDirectoryService
private cache = new Map<string, CachedData>();

async getUsers(filters, lastDoc) {
  const cacheKey = this.getCacheKey(filters);
  const cached = this.cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < this.TTL) {
    return cached.data;
  }
  
  const fresh = await this.fetchUsers(filters, lastDoc);
  this.cache.set(cacheKey, { 
    data: fresh, 
    timestamp: Date.now() 
  });
  
  return fresh;
}
```

### **3.3 Real-time Updates** ⚡
```typescript
useEffect(() => {
  if (!currentUser) return;
  
  const unsubscribe = onSnapshot(
    query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(30)),
    (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      setUsers(users);
    },
    (error) => {
      logger.error('Snapshot error', error);
    }
  );
  
  return () => unsubscribe();
}, [currentUser]);
```

---

## 🟢 **المرحلة 4: الأمان والخصوصية** (مهم)

### **4.1 إخفاء البيانات الحساسة** 🔒
```typescript
// في Service Layer
sanitizeUserForDisplay(user: BulgarianUser, viewerId?: string) {
  const isOwnProfile = viewerId === user.uid;
  
  const sanitized = {
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    profileType: user.profileType,
    // ... public fields
  };
  
  // ❌ لا تعرض email إلا إذا مسموح
  if (isOwnProfile || user.showEmail) {
    sanitized.email = user.email;
  }
  
  // ❌ لا تعرض phone إلا إذا مسموح
  if (isOwnProfile || user.showPhone) {
    sanitized.phoneNumber = user.phoneNumber;
  }
  
  return sanitized;
}
```

### **4.2 احترام profileVisibility** 👁️
```typescript
// في getUsers
async getUsers(filters, lastDoc) {
  let q = query(usersRef);
  
  // ✅ فقط البروفايلات العامة أو الخاصة بالمستخدم
  if (currentUserId) {
    q = query(q, where('profileVisibility', 'in', ['public', 'dealers']));
  } else {
    q = query(q, where('profileVisibility', '==', 'public'));
  }
  
  // ... rest of query
}
```

### **4.3 تحسين Firestore Rules** 🛡️
```javascript
// firestore.rules
match /users/{userId} {
  // ✅ قراءة محدودة
  allow read: if isAuthenticated() && (
    request.auth.uid == userId || // Own profile
    resource.data.profileVisibility == 'public' || // Public profiles
    (resource.data.profileVisibility == 'dealers' && isDealer()) // Dealers only
  );
  
  // Helper function
  function isDealer() {
    return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.profileType == 'dealer';
  }
}
```

---

## 🔵 **المرحلة 5: ميزات إضافية** (اختياري)

### **5.1 Advanced Filters** 🔍
```typescript
const [advancedFilters, setAdvancedFilters] = useState({
  verifiedOnly: false,
  onlineOnly: false,
  trustScoreMin: 0,
  trustScoreMax: 100,
  listingsMin: 0,
  dateFrom: null,
  dateTo: null,
});
```

### **5.2 Bulk Actions** 📦
```typescript
const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

const handleBulkFollow = async () => {
  const promises = Array.from(selectedUsers).map(userId =>
    followService.followUser(currentUser.uid, userId)
  );
  await Promise.all(promises);
};
```

### **5.3 Export Users** 📥
```typescript
const handleExport = async () => {
  const csv = filteredUsers.map(u => ({
    Name: u.displayName,
    Email: u.email,
    Type: u.profileType,
    Trust: u.stats?.trustScore,
  }));
  
  downloadCSV(csv, 'users-export.csv');
};
```

### **5.4 Search History** 📚
```typescript
const [searchHistory, setSearchHistory] = useState<string[]>([]);

useEffect(() => {
  const history = localStorage.getItem('searchHistory');
  if (history) {
    setSearchHistory(JSON.parse(history));
  }
}, []);

const saveSearch = (term: string) => {
  const updated = [term, ...searchHistory.slice(0, 9)];
  setSearchHistory(updated);
  localStorage.setItem('searchHistory', JSON.stringify(updated));
};
```

---

## 📝 **Checklist التنفيذ**

### **المرحلة 2:**
- [ ] إضافة Plan Badges
- [ ] عرض الألوان المميزة
- [ ] عرض Business Info للـ Dealers
- [ ] عرض Business Info للـ Companies
- [ ] إصلاح الإحصائيات (stats.trustScore)

### **المرحلة 3:**
- [ ] تثبيت react-virtuoso
- [ ] تطبيق Virtual Scrolling
- [ ] إضافة Caching Strategy
- [ ] إضافة Real-time Updates

### **المرحلة 4:**
- [ ] إخفاء البيانات الحساسة
- [ ] احترام showEmail
- [ ] احترام showPhone
- [ ] احترام profileVisibility
- [ ] تحسين Firestore Rules

### **المرحلة 5 (اختياري):**
- [ ] Advanced Filters
- [ ] Bulk Actions
- [ ] Export Users
- [ ] Search History
- [ ] Algolia Integration

---

## 🎯 **الأولويات**

1. **🔴 عاجل:** المرحلة 2 (دعم البروفايلات الثلاثة)
2. **🟡 مهم:** المرحلة 4 (الأمان والخصوصية)
3. **🟢 تحسين:** المرحلة 3 (تحسينات الأداء)
4. **🔵 اختياري:** المرحلة 5 (ميزات إضافية)

---

## 📊 **الوقت المتوقع**

| المرحلة | الوقت المتوقع |
|---------|---------------|
| المرحلة 2 | 2-3 ساعات |
| المرحلة 3 | 3-4 ساعات |
| المرحلة 4 | 2-3 ساعات |
| المرحلة 5 | 4-6 ساعات |
| **الإجمالي** | **11-16 ساعة** |

---

**📌 ملاحظة:** يمكن تنفيذ المراحل بشكل تدريجي حسب الأولوية.

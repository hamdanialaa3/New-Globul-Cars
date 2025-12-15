# 🔗 نظام الروابط الفريدة للمستخدمين - User Profile Links

## ✅ نعم، يوجد روابط فريدة لكل بروفايل مستخدم!

---

## 📍 الروابط الفريدة المتاحة

### 1. **رابط البروفايل الفريد**
```
/profile/{userId}
```

**مثال:**
```
https://fire-new-globul.web.app/profile/xyz123abc456def789
https://mobilebg.eu/profile/user-firebase-uid-here
```

**الاستخدام:**
- عرض بروفايل أي مستخدم (بروفايل عام)
- مشاركة رابط البروفايل مع مستخدمين آخرين
- الوصول المباشر من الخريطة (Map Page)
- الوصول من قائمة المستخدمين (Users Directory)

---

## 🗂️ روابط الأقسام الفرعية للبروفايل

عند الوصول إلى `/profile/{userId}` يمكن الانتقال إلى:

```
/profile                    → بروفايل المستخدم الحالي (الرئيسي)
/profile/{userId}          → بروفايل مستخدم آخر (عام)
/profile/my-ads            → إعلاناتي (خاص بالمستخدم الحالي فقط)
/profile/campaigns         → الحملات الإعلانية (خاص بالمستخدم الحالي)
/profile/analytics         → تحليلات (خاص بالمستخدم الحالي)
/profile/settings          → الإعدادات والخصوصية (خاص بالمستخدم الحالي)
/profile/consultations     → الاستشارات (خاص بالمستخدم الحالي)
```

---

## 🔍 أماكن استخدام الروابط الفريدة في المشروع

### 1️⃣ **قائمة المستخدمين (Users Directory)**
**الملف:** `src/pages/03_user-pages/users-directory/UsersDirectoryPage/index.tsx`

```tsx
// عند النقر على بطاقة المستخدم
onClick={() => window.location.href = `/profile/${user.uid}`}

// مثال: عند النقر على صورة مستخدم
<UserCard onClick={() => window.location.href = `/profile/user-uid-12345}`}>
```

### 2️⃣ **خريطة المدينة (City Map)**
**الملف:** `src/pages/01_main-pages/map/MapPage/index.tsx`

```tsx
// عند النقر على دبوس المستخدم في الخريطة
<ItemCard onClick={() => navigate(`/profile/${item.data.id}`)}>
```

### 3️⃣ **لوحة تحكم الإدارة (Super Admin)**
**الملف:** `src/pages/06_admin/super-admin/SuperAdminUsersPage.tsx`

```tsx
// زر عرض البروفايل
<ActionButton onClick={() => window.open(`/profile/${selectedUser.id}`, '_blank')}>
```

### 4️⃣ **صفحة بروفايل المستخدم**
**الملف:** `src/pages/03_user-pages/profile/ProfilePage/ProfilePageWrapper.tsx`

```tsx
// بناء الرابط الفريد للمستخدم
const basePath = React.useMemo(() => {
  if (isOwnProfile || !activeProfile?.uid) {
    return '/profile';  // بروفايل المستخدم الحالي
  }
  return `/profile/${activeProfile.uid}`;  // بروفايل مستخدم آخر
}, [activeProfile?.uid, isOwnProfile]);
```

---

## 🎯 كيفية عمل النظام

### البنية المعمارية:

```
App Router
├── /profile/*  (ProfileRouter)
│   └── Routes:
│       ├── /           (ProfileOverview - بروفايل المستخدم الحالي)
│       ├── /:userId    (ProfileOverview - بروفايل مستخدم آخر)
│       ├── /my-ads     (My Ads - خاص بالمستخدم الحالي)
│       ├── /campaigns  (Campaigns - خاص بالمستخدم الحالي)
│       ├── /analytics  (Analytics - خاص بالمستخدم الحالي)
│       ├── /settings   (Settings - خاص بالمستخدم الحالي)
│       └── /consultations (Consultations - خاص بالمستخدم الحالي)
```

### معالجة userId:

**الملف:** `src/pages/03_user-pages/profile/ProfilePage/hooks/useProfile.ts`

```typescript
export const useProfile = (targetUserId?: string) => {
  // استخلاص targetUserId من URL parameters
  const effectiveTargetId = useMemo(() => {
    if (!targetUserId || RESERVED_ROUTES.includes(targetUserId)) {
      return undefined;  // إذا كان routeName (مثل "settings") أو فارغ
    }
    return targetUserId;  // إذا كان userId فريد
  }, [targetUserId]);

  // تحديد ما إذا كان بروفايل المستخدم الحالي أم لا
  const viewingOwn = !effectiveTargetId || effectiveTargetId === authUser?.uid;
  
  // تحميل بيانات المستخدم المستهدف
  if (effectiveTargetId) {
    // تحميل بيانات مستخدم آخر
  } else {
    // تحميل بيانات المستخدم الحالي
  }
};
```

---

## ✨ المميزات

### ✅ **روابط فريدة وقابلة للمشاركة**
- كل مستخدم له رابط فريد يمكن مشاركته
- الرابط يحتوي على Firebase UID (معرف فريد)

### ✅ **متوافق مع SEO**
- روابط صديقة للمحركات البحثية
- محتوى ديناميكي بناءً على userId

### ✅ **ملاحة سهلة**
- الروابط الخلفية والأمامية في المتصفح تعمل بشكل صحيح
- الانتقال بين الأقسام المختلفة سلس

### ✅ **أمان معلومات المستخدم**
- عرض بيانات محدودة للمستخدمين الآخرين
- إظهار جميع الخيارات فقط للمستخدم صاحب البروفايل

```tsx
// مثال على الأمان: عرض زر "تحرير" فقط لمالك البروفايل
{isOwnProfile && (
  <EditButton onClick={() => navigate('/profile/settings')}>
    {t('common.edit')}
  </EditButton>
)}
```

---

## 📋 أمثلة عملية

### مثال 1: الوصول إلى بروفايل مستخدم محدد
```javascript
// من قائمة المستخدمين
const userId = "xyz123abc456def789";
window.location.href = `/profile/${userId}`;

// النتيجة:
// https://mobilebg.eu/profile/xyz123abc456def789
```

### مثال 2: الانتقال إلى إعلانات المستخدم الحالي
```javascript
// من أي صفحة
navigate('/profile/my-ads');

// يعرض الإعلانات الخاصة بالمستخدم المسجل
```

### مثال 3: عرض بروفايل من الخريطة
```javascript
// عند النقر على دبوس في الخريطة
navigate(`/profile/${userId}`);

// يعرض بروفايل المستخدم من الموقع
```

---

## 🔐 معلومات الأمان والخصوصية

### البيانات المرئية لجميع الزوار:
- ✅ الصورة الشخصية
- ✅ الاسم المعروض
- ✅ الموقع الجغرافي
- ✅ درجة الثقة (Trust Score)
- ✅ الشارات (Badges)
- ✅ الإعلانات النشطة

### البيانات المحجوبة عن الزوار:
- ❌ رقم الهاتف الكامل (جزء مخفي)
- ❌ البريد الإلكتروني (محجوب)
- ❌ إعدادات الخصوصية
- ❌ السجل المالي
- ❌ المراسلات الخاصة

---

## 📊 استخدام روابط البروفايل

### المواقع التي تستخدم الروابط الفريدة:

| الموقع | الملف | الاستخدام |
|--------|-------|-----------|
| **قائمة المستخدمين** | `UsersDirectoryPage.tsx` | عرض بروفايل عند النقر |
| **خريطة المدينة** | `MapPage/index.tsx` | عرض بروفايل المستخدم بالموقع |
| **لوحة الإدارة** | `SuperAdminUsersPage.tsx` | فتح بروفايل في نافذة جديدة |
| **الرسائل** | `MessagesPage.tsx` | الوصول لبروفايل المرسل |
| **الاستعراضات** | `ReviewsPage.tsx` | عرض بروفايل المراجع |

---

## 🚀 مثال عملي كامل

```tsx
// 1. في قائمة المستخدمين
export const UsersDirectoryPage = () => {
  const users = [...]; // قائمة المستخدمين

  return (
    <Grid>
      {users.map((user) => (
        <UserCard 
          key={user.uid}
          onClick={() => {
            // الرابط الفريد للمستخدم
            window.location.href = `/profile/${user.uid}`;
          }}
        >
          <Avatar src={user.profileImage?.url} />
          <Name>{user.displayName}</Name>
          <Location>{user.city}</Location>
        </UserCard>
      ))}
    </Grid>
  );
};

// 2. عند الوصول للرابط /profile/{userId}
// ProfileRouter يعالج الطلب:
export const ProfileRouter = () => {
  return (
    <Routes>
      <Route path=":userId" element={<ProfileOverview />} />
      {/* تحميل بروفايل المستخدم المحدد */}
    </Routes>
  );
};

// 3. في ProfileOverview، يتم تحميل البيانات:
const ProfileOverview = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useProfile(userId);

  return (
    <div>
      <Avatar src={user.profileImage?.url} />
      <Name>{user.displayName}</Name>
      <Bio>{user.bio}</Bio>
      <Listings cars={user.cars} />
    </div>
  );
};
```

---

## 📌 الخلاصة

✅ **نعم، المشروع يدعم روابط فريدة لكل بروفايل مستخدم**

- كل مستخدم له رابط فريد: `/profile/{userId}`
- يمكن مشاركة الروابط مع مستخدمين آخرين
- النظام آمن ويحترم خصوصية المستخدمين
- الروابط تعمل من جميع أنحاء التطبيق (الخريطة، القوائم، الإدارة)
- يتم دعم الملاحة السلسة بين الأقسام المختلفة

🎉 **النظام جاهز للاستخدام والمشاركة!**

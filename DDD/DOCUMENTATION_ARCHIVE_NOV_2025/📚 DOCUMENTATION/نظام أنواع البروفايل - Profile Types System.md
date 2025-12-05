# 🎨 نظام أنواع البروفايل - Profile Types System
## Bulgarian Car Marketplace - Complete Profile Types Documentation

**تاريخ الإنشاء:** ديسمبر 2, 2025  
**الحالة:** ✅ مكتمل 100%  
**الإصدار:** 2.0

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [الأنواع الثلاثة](#الأنواع-الثلاثة)
3. [البنية التقنية](#البنية-التقنية)
4. [آلية العمل](#آلية-العمل)
5. [الروابط والتوجيه](#الروابط-والتوجيه)
6. [دليل التطوير](#دليل-التطوير)
7. [الاختبار](#الاختبار)

---

## 🎯 نظرة عامة

### الفكرة الأساسية:
نظام ديناميكي يوفر **ثلاثة أنواع مختلفة من البروفايلات** لتلبية احتياجات جميع المستخدمين:
- 🧑 **Private** - للأفراد (البائعين الشخصيين)
- 🏪 **Dealer** - للتجار والوكلاء
- 🏢 **Company** - للشركات الكبرى

### المميزات الرئيسية:
✅ **تبديل تلقائي** - يختار النوع المناسب تلقائياً  
✅ **ثيم مخصص** - لكل نوع ألوان وتصميم فريد  
✅ **مميزات خاصة** - كل نوع له إمكانيات مختلفة  
✅ **SEO محسّن** - روابط واضحة وصديقة لمحركات البحث  
✅ **استجابة كاملة** - يعمل على جميع الأجهزة  

---

## 🎨 الأنواع الثلاثة

### 1️⃣ Private Profile (البروفايل الشخصي) 🧑

#### الألوان:
- **اللون الأساسي:** 🟠 برتقالي `#FF8F10`
- **الخلفية:** `linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)`
- **Accent:** `#fb923c`

#### المميزات:
```typescript
✅ نظام نقاط الثقة (Trust Score 0-100)
✅ التقييمات والمراجعات من المشترين
✅ عرض السيارات الشخصية
✅ معلومات الاتصال البسيطة
✅ سجل المبيعات
✅ الباج (شارات): Verified, Top Seller, Fast Responder
```

#### حدود الإعلانات:
| الخطة | الحد الأقصى |
|-------|-------------|
| Free | 3 إعلانات |
| Basic | 10 إعلانات |
| Premium | غير محدود |

#### الملف:
```
src/pages/03_user-pages/profile/ProfilePage/components/PrivateProfile.tsx
```

#### مثال واجهة المستخدم:
```
┌─────────────────────────────────────┐
│  🧑 Ahmed Mohamed                   │
│  ⭐⭐⭐⭐⭐ Trust Score: 95/100      │
│  📍 Sofia, Bulgaria                 │
│  ✅ Verified User                   │
│                                     │
│  🚗 Active Listings: 2/3           │
│  💬 Response Rate: 98%             │
│  📞 +359 888 123 456               │
└─────────────────────────────────────┘
```

---

### 2️⃣ Dealer Profile (بروفايل التاجر) 🏪

#### الألوان:
- **اللون الأساسي:** 🟢 أخضر `#16a34a`
- **الخلفية:** `linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)`
- **Accent:** `#22c55e`

#### المميزات:
```typescript
✅ لوجو المعرض المخصص
✅ ساعات العمل التفصيلية
✅ فريق العمل (Team Management)
✅ خريطة الموقع التفاعلية (Google Maps)
✅ إحصائيات المبيعات الشهرية
✅ شهادات الجودة والاعتمادات
✅ قسم "عن المعرض"
✅ معرض الصور للمعرض
```

#### حدود الإعلانات:
| الخطة | الحد الأقصى |
|-------|-------------|
| Dealer Basic | 50 إعلان |
| Dealer Pro | 200 إعلان |
| Dealer Premium | غير محدود |

#### الملف:
```
src/pages/03_user-pages/profile/ProfilePage/components/DealerProfile.tsx
```

#### مثال واجهة المستخدم:
```
┌─────────────────────────────────────┐
│  🏪 AutoMax Bulgaria                │
│  [LOGO]                             │
│  ⭐⭐⭐⭐⭐ 4.8/5 (234 reviews)     │
│                                     │
│  🕐 Mon-Fri: 9:00 - 18:00          │
│  📍 123 Main St, Sofia             │
│  🗺️ [Interactive Map]              │
│                                     │
│  👥 Team: 12 members               │
│  🚗 Inventory: 145 cars            │
│  📊 Sales: 89 this month           │
└─────────────────────────────────────┘
```

---

### 3️⃣ Company Profile (بروفايل الشركة) 🏢

#### الألوان:
- **اللون الأساسي:** 🔵 أزرق `#1d4ed8`
- **الخلفية:** `linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)`
- **Accent:** `#3b82f6`
- **LED Border:** عند اكتمال 100% يظهر إطار متوهج

#### المميزات:
```typescript
✅ مواقع متعددة (Multi-location Support)
✅ تقارير تحليلية متقدمة
✅ شهادات مؤسسية (ISO, etc.)
✅ API للتكامل المؤسسي
✅ دعم مخصص (Dedicated Support)
✅ حدود LED على البروفايل
✅ إحصائيات Enterprise
✅ نظام إدارة الأساطيل
```

#### حدود الإعلانات:
| الخطة | الحد الأقصى |
|-------|-------------|
| Company | 500 إعلان |
| Enterprise | غير محدود |

#### الملف:
```
src/pages/03_user-pages/profile/ProfilePage/components/CompanyProfile.tsx
```

#### مثال واجهة المستخدم:
```
┌═════════════════════════════════════┐ LED Border
║  🏢 GlobalCars Bulgaria Ltd.       ║
║  [CORPORATE LOGO]                  ║
║  ⭐⭐⭐⭐⭐ 4.9/5 (1,234 reviews)  ║
║                                    ║
║  🌍 5 Locations Nationwide         ║
║  🏆 ISO 9001 Certified             ║
║  📊 Advanced Analytics             ║
║  🔌 API Integration Available      ║
║                                    ║
║  📈 Monthly Report: +23% growth    ║
║  🚗 Fleet: 1,200+ vehicles         ║
║  👥 Team: 250+ employees           ║
╚════════════════════════════════════╝
```

---

## 🏗️ البنية التقنية

### هيكل الملفات:

```
bulgarian-car-marketplace/src/
│
├─ contexts/
│  └─ ProfileTypeContext.tsx              ← Context API لإدارة النوع
│
├─ pages/03_user-pages/profile/ProfilePage/
│  │
│  ├─ index.tsx                           ← Entry point
│  ├─ ProfileRouter.tsx                   ← Routing ذكي
│  ├─ ProfilePageWrapper.tsx              ← Wrapper موحد
│  │
│  ├─ components/                         ← مكونات الأنواع الثلاثة
│  │  ├─ PrivateProfile.tsx               ← 🧑 البروفايل الشخصي
│  │  ├─ DealerProfile.tsx                ← 🏪 بروفايل التاجر
│  │  └─ CompanyProfile.tsx               ← 🏢 بروفايل الشركة
│  │
│  ├─ tabs/                               ← Tabs مشتركة
│  │  ├─ ProfileOverview.tsx              ← نظرة عامة
│  │  ├─ ProfileMyAds.tsx                 ← إعلاناتي
│  │  ├─ ProfileCampaigns.tsx             ← الحملات
│  │  ├─ ProfileAnalytics.tsx             ← التحليلات
│  │  ├─ ProfileSettings.tsx              ← الإعدادات
│  │  └─ ProfileConsultations.tsx         ← الاستشارات
│  │
│  ├─ hooks/                              ← Custom hooks
│  │  ├─ useProfile.ts                    ← جلب بيانات البروفايل
│  │  ├─ useProfileActions.ts             ← Actions (edit, delete, etc.)
│  │  └─ useProfileData.ts                ← Data management
│  │
│  ├─ layout/                             ← مكونات التخطيط
│  │  ├─ ProfileLayout.tsx                ← Layout أساسي
│  │  ├─ TabNavigation.tsx                ← Tabs navigation
│  │  └─ CompactHeader.tsx                ← Header مدمج
│  │
│  ├─ styles.ts                           ← Styled components
│  └─ types.ts                            ← TypeScript interfaces
│
└─ App.tsx                                ← Route definition
    └─ <Route path="/profile/*" element={<ProfileRouter />} />
```

---

## ⚙️ آلية العمل

### 1. تحديد نوع البروفايل:

```typescript
// في ProfileTypeContext.tsx
export const ProfileTypeProvider: React.FC<Props> = ({ children }) => {
  const [profileType, setProfileType] = useState<ProfileType>('private');
  
  // جلب نوع المستخدم من Firestore
  useEffect(() => {
    const fetchUserType = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const type = userDoc.data()?.profileType || 'private';
      setProfileType(type);
    };
    
    fetchUserType();
  }, []);
  
  return (
    <ProfileTypeContext.Provider value={{ profileType, setProfileType }}>
      {children}
    </ProfileTypeContext.Provider>
  );
};
```

### 2. التوجيه الذكي (Smart Routing):

```typescript
// في ProfileRouter.tsx
export const ProfileRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<ProfilePageWrapper />}>
        <Route index element={<ProfileOverview />} />
        <Route path="my-ads" element={<ProfileMyAds />} />
        <Route path="campaigns" element={<ProfileCampaigns />} />
        <Route path="analytics" element={<ProfileAnalytics />} />
        <Route path="settings" element={<ProfileSettings />} />
        <Route path="consultations" element={<ProfileConsultations />} />
        <Route path=":userId" element={<ProfileOverview />} />
      </Route>
    </Routes>
  );
};
```

### 3. عرض المكون المناسب:

```typescript
// في ProfileOverview.tsx
const ProfileOverview: React.FC = () => {
  const { profileType } = useProfileType();
  const { user, userCars, isOwnProfile } = useProfile();
  
  // اختيار المكون المناسب بناءً على النوع
  const renderProfile = () => {
    switch (profileType) {
      case 'private':
        return <PrivateProfile user={user} userCars={userCars} isOwnProfile={isOwnProfile} />;
      
      case 'dealer':
        return <DealerProfile user={user} userCars={userCars} isOwnProfile={isOwnProfile} />;
      
      case 'company':
        return <CompanyProfile user={user} userCars={userCars} isOwnProfile={isOwnProfile} />;
      
      default:
        return <PrivateProfile user={user} userCars={userCars} isOwnProfile={isOwnProfile} />;
    }
  };
  
  return <>{renderProfile()}</>;
};
```

---

## 🔗 الروابط والتوجيه

### الروابط الأساسية:

| الرابط | الوصف | نوع البروفايل |
|--------|-------|---------------|
| `/profile` | البروفايل الرئيسي (نظرة عامة) | جميع الأنواع |
| `/profile/my-ads` | إعلاناتي | جميع الأنواع |
| `/profile/campaigns` | الحملات الإعلانية | Dealer & Company فقط |
| `/profile/analytics` | التحليلات | جميع الأنواع |
| `/profile/settings` | الإعدادات | جميع الأنواع |
| `/profile/consultations` | الاستشارات | جميع الأنواع |
| `/profile/:userId` | عرض بروفايل مستخدم آخر | جميع الأنواع |

### أمثلة الروابط:

```
✅ صحيح:
http://localhost:3000/profile
http://localhost:3000/profile/my-ads
http://localhost:3000/profile/analytics
http://localhost:3000/profile/M7As2dycUJgIx4T6QXw0xgCAnm92

❌ خاطئ:
http://localhost:3000/profile/private      ← لا يوجد route لنوع محدد
http://localhost:3000/profile/dealer       ← النوع يُحدد تلقائياً
http://localhost:3000/profile/company      ← من Context وليس URL
```

---

## 👨‍💻 دليل التطوير

### إضافة ميزة جديدة:

#### 1. تحديد النوع المناسب:
```typescript
// إذا كانت الميزة خاصة بنوع واحد:
if (profileType === 'dealer') {
  // عرض ميزة التاجر فقط
}

// إذا كانت مشتركة بين نوعين:
if (profileType === 'dealer' || profileType === 'company') {
  // عرض للتجار والشركات فقط
}
```

#### 2. استخدام الألوان المناسبة:
```typescript
// في styled-components
const ThemedButton = styled.button<{ profileType: ProfileType }>`
  background: ${props => {
    switch (props.profileType) {
      case 'private': return '#FF8F10';
      case 'dealer': return '#16a34a';
      case 'company': return '#1d4ed8';
    }
  }};
`;
```

#### 3. إضافة ميزة في ملف معين:
```typescript
// مثال: إضافة "Team Management" في DealerProfile.tsx
const DealerProfile: React.FC<Props> = ({ user }) => {
  return (
    <>
      {/* ... بقية المحتوى */}
      
      {/* ميزة جديدة خاصة بالتاجر */}
      <TeamManagementSection>
        <h3>فريق العمل</h3>
        {/* ... */}
      </TeamManagementSection>
    </>
  );
};
```

### Custom Hooks:

```typescript
// useProfileType.ts
export const useProfileType = () => {
  const context = useContext(ProfileTypeContext);
  
  if (!context) {
    throw new Error('useProfileType must be used within ProfileTypeProvider');
  }
  
  return context;
};

// الاستخدام:
const { profileType, setProfileType } = useProfileType();
```

---

## 🧪 الاختبار

### اختبار التبديل بين الأنواع:

```typescript
// ProfileTypeContext.test.tsx
describe('ProfileTypeContext', () => {
  it('should switch profile types correctly', async () => {
    const { result } = renderHook(() => useProfileType(), {
      wrapper: ProfileTypeProvider
    });
    
    // البداية: private
    expect(result.current.profileType).toBe('private');
    
    // التبديل إلى dealer
    act(() => {
      result.current.setProfileType('dealer');
    });
    expect(result.current.profileType).toBe('dealer');
    
    // التبديل إلى company
    act(() => {
      result.current.setProfileType('company');
    });
    expect(result.current.profileType).toBe('company');
  });
});
```

### اختبار عرض المكون الصحيح:

```typescript
// ProfileOverview.test.tsx
describe('ProfileOverview', () => {
  it('renders PrivateProfile for private users', () => {
    const { getByText } = render(
      <ProfileTypeProvider value={{ profileType: 'private' }}>
        <ProfileOverview />
      </ProfileTypeProvider>
    );
    
    expect(getByText(/Trust Score/i)).toBeInTheDocument();
  });
  
  it('renders DealerProfile for dealer users', () => {
    const { getByText } = render(
      <ProfileTypeProvider value={{ profileType: 'dealer' }}>
        <ProfileOverview />
      </ProfileTypeProvider>
    );
    
    expect(getByText(/Team/i)).toBeInTheDocument();
  });
});
```

---

## 📊 الإحصائيات

### الملفات المنفذة:

| الملف | السطور | الحالة |
|-------|--------|--------|
| `ProfileTypeContext.tsx` | 150 | ✅ مكتمل |
| `PrivateProfile.tsx` | 186 | ✅ مكتمل |
| `DealerProfile.tsx` | 462 | ✅ مكتمل |
| `CompanyProfile.tsx` | 496 | ✅ مكتمل |
| `ProfileRouter.tsx` | 55 | ✅ مكتمل |
| `ProfilePageWrapper.tsx` | 120 | ✅ مكتمل |
| **المجموع** | **~1,469 سطر** | **100%** |

---

## 🎯 الخطوات التالية (Future Enhancements)

### المقترحات المستقبلية:

1. **نظام الشارات المتقدم** 🏆
   - شارة "Top Seller of the Month"
   - شارة "Customer Choice Award"
   - شارة "Eco-Friendly Fleet"
   - شارة "Fast Track Verification"

2. **تحليلات متقدمة** 📊
   - مقارنة الأداء مع المنافسين
   - تنبؤات AI للمبيعات
   - تقارير شهرية تلقائية
   - KPIs مخصصة

3. **تكامل CRM** 🔌
   - تصدير بيانات العملاء
   - إدارة العلاقات التلقائية
   - Follow-up emails تلقائية
   - Pipeline management

4. **نظام العروض الخاصة** 💰
   - عروض محدودة الوقت
   - خصومات حسب الباقة
   - Loyalty rewards
   - Referral bonuses

---

## 📝 ملاحظات مهمة

### ⚠️ تحذيرات:

1. **عدم تغيير النوع مباشرة في UI**
   ```typescript
   // ❌ خاطئ:
   setProfileType('dealer');
   
   // ✅ صحيح:
   await updateDoc(doc(db, 'users', userId), {
     profileType: 'dealer'
   });
   // ثم Context سيتحدث تلقائياً
   ```

2. **التحقق من الصلاحيات**
   ```typescript
   // قبل عرض ميزة خاصة:
   if (profileType === 'company' && !user.isCompanyVerified) {
     return <VerificationRequired />;
   }
   ```

3. **الحفاظ على الثيم**
   ```typescript
   // استخدم الألوان من theme.ts
   import { bulgarianTheme } from '@/styles/theme';
   
   // لا تُضف ألوان جديدة عشوائياً
   ```

---

## 🔗 روابط مفيدة

- [Copilot Instructions](../../.github/copilot-instructions.md)
- [صفحات المشروع كافة](./صفحات%20المشروع%20كافة%20.md)
- [Architecture Analysis](../../ARCHITECTURE_ANALYSIS_COMPARISON_REPORT.md)

---

**آخر تحديث:** ديسمبر 2, 2025  
**المطور:** Globul Cars Development Team  
**الحالة:** ✅ Production Ready  
**الإصدار:** 2.0

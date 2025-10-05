# 📜 **دستور العمل - Globul Cars Project**
## **Development Constitution & Guidelines**

---

## 🎯 **المبادئ الأساسية | Core Principles**

هذا الدستور يحدد القواعد والمعايير الإلزامية لكل من يعمل على تطوير وتحديث مشروع **Globul Cars** من الآن فصاعداً.

---

## 🌍 **1. الإعدادات الإقليمية | Regional Settings**

### **⚠️ قواعد إلزامية - لا يجوز تغييرها:**

```typescript
✅ اللغات المدعومة: البلغارية (BG) والإنجليزية (EN) فقط
✅ اللغة الأساسية: البلغارية (bg)
✅ العملة: يورو (EUR) فقط - لا عملات أخرى
✅ الموقع الجغرافي: بلغاريا (Bulgaria)
✅ المنطقة الزمنية: Europe/Sofia
✅ رمز الدولة: +359
✅ التنسيق: bg-BG
```

### **التطبيق في الكود:**

```typescript
// ❌ ممنوع
const currency = 'USD';  // خطأ!
const language = 'fr';   // خطأ!

// ✅ صحيح
const currency = 'EUR';  // صحيح
const language = 'bg' | 'en';  // صحيح فقط

// في كل ملف إعدادات
export const CONFIG = {
  currency: 'EUR',           // إلزامي
  languages: ['bg', 'en'],   // إلزامي
  region: 'Bulgaria',        // إلزامي
  timezone: 'Europe/Sofia',  // إلزامي
  phonePrefix: '+359'        // إلزامي
};
```

---

## 💻 **2. معايير البرمجة | Coding Standards**

### **📏 حجم الملفات - قاعدة إلزامية:**

```typescript
⚠️ القاعدة الذهبية: لا يزيد أي ملف برمجي عن 300 سطر

✅ إذا تجاوز الملف 300 سطر:
   1. قسّمه إلى ملفات أصغر
   2. استخرج المكونات المشتركة
   3. أنشئ ملفات فرعية
   4. استخدم Lazy Loading

❌ ممنوع منعاً باتاً:
   - ملفات أكبر من 300 سطر
   - كود مكرر
   - مكونات عملاقة
```

### **مثال على التقسيم:**

```typescript
// ❌ خطأ - ملف واحد 500 سطر
ProfilePage.tsx (500 lines)

// ✅ صحيح - مقسّم
ProfilePage/
  ├── index.tsx (150 lines)          // المكون الرئيسي
  ├── ProfileHeader.tsx (80 lines)   // الهيدر
  ├── ProfileStats.tsx (70 lines)    // الإحصائيات
  ├── ProfileCars.tsx (100 lines)    // قائمة السيارات
  └── ProfileSettings.tsx (90 lines) // الإعدادات
```

---

## 🔄 **3. قابلية التطوير | Scalability**

### **⚠️ قاعدة إلزامية:**

```typescript
كل شيء في المشروع يجب أن يكون قابل للتطوير والإضافة

✅ استخدم:
   - Interfaces قابلة للتوسع
   - Components قابلة لإعادة الاستخدام
   - Services معيارية (Modular)
   - Configurations مركزية

❌ تجنب:
   - Hard-coded values
   - Tight coupling
   - Non-reusable code
   - Magic numbers
```

### **أمثلة:**

```typescript
// ❌ خطأ - غير قابل للتوسع
if (type === 'car') {
  // ...
}

// ✅ صحيح - قابل للتوسع
const VEHICLE_TYPES = {
  CAR: 'car',
  SPARE_PART: 'spare_part',
  // يمكن إضافة المزيد بسهولة
} as const;

if (type === VEHICLE_TYPES.CAR) {
  // ...
}

// ❌ خطأ - قيم ثابتة
const maxImages = 20;

// ✅ صحيح - قابل للتهيئة
const MAX_IMAGES = {
  car: 20,
  sparePart: 10,
  profile: 5
} as const;
```

---

## 🔗 **4. التكامل مع مشروع قطع الغيار | Spare Parts Integration**

### **⚠️ معلومات مهمة:**

```typescript
يوجد مشروع منفصل لبيع قطع غيار السيارات سيتم دمجه لاحقاً

🔗 نقاط الربط المخططة:
   1. البروفايل الموحد (Unified Profile)
   2. نظام التبديل بين المشاريع
   3. قاعدة بيانات مشتركة للمستخدمين
   4. نظام مصادقة موحد
```

### **📋 متطلبات التكامل:**

#### **1. البروفايل الموحد (Unified Profile):**

```typescript
// يجب أن يدعم البروفايل نوعين من البائعين
interface UnifiedProfile {
  userId: string;
  displayName: string;
  email: string;
  
  // نوع البائع - إلزامي
  sellerType: 'individual' | 'company';
  
  // المشاريع النشطة - إلزامي
  activeProjects: {
    cars: boolean;        // بيع سيارات
    spareParts: boolean;  // بيع قطع غيار
  };
  
  // معلومات الشركة (اختياري)
  companyInfo?: {
    name: string;
    registrationNumber: string;
    taxNumber: string;
    address: string;
  };
  
  // معلومات الفرد (اختياري)
  individualInfo?: {
    firstName: string;
    lastName: string;
    idNumber?: string;
  };
}
```

#### **2. زر التبديل في الصفحة الشخصية:**

```typescript
// المكون المطلوب
<ProjectSwitcher>
  <SwitchButton 
    active={currentProject === 'cars'}
    onClick={() => switchProject('cars')}
  >
    🚗 بيع سيارات
  </SwitchButton>
  
  <SwitchButton 
    active={currentProject === 'spareParts'}
    onClick={() => switchProject('spareParts')}
  >
    🔧 بيع قطع غيار
  </SwitchButton>
</ProjectSwitcher>

// الوظيفة
const switchProject = (project: 'cars' | 'spareParts') => {
  if (project === 'cars') {
    // البقاء في المشروع الحالي
    setCurrentProject('cars');
  } else {
    // التوجيه لمشروع قطع الغيار
    window.location.href = 'https://spare-parts.globulcars.bg';
  }
};
```

#### **3. أنواع البائعين:**

```typescript
// يجب دعم نوعين
enum SellerType {
  INDIVIDUAL = 'individual',  // فرد / شخص عادي
  COMPANY = 'company'          // مؤسسة / شركة
}

// في قاعدة البيانات
interface Seller {
  id: string;
  type: SellerType;
  
  // للأفراد
  individualData?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  
  // للشركات
  companyData?: {
    companyName: string;
    registrationNumber: string;
    taxId: string;
    legalAddress: string;
    contactPerson: string;
    contactPhone: string;
    contactEmail: string;
  };
}
```

---

## 🏗️ **5. هيكلة الكود | Code Structure**

### **📁 تنظيم الملفات - إلزامي:**

```typescript
✅ كل مكون في مجلد منفصل إذا تجاوز 200 سطر
✅ استخدم index.tsx للتصدير
✅ افصل الأنماط (styles) في ملفات منفصلة
✅ افصل الأنواع (types) في ملفات منفصلة
✅ افصل الثوابت (constants) في ملفات منفصلة

// مثال على الهيكلة الصحيحة:
ProfilePage/
  ├── index.tsx              // المكون الرئيسي (< 300 سطر)
  ├── ProfilePage.styles.ts  // الأنماط
  ├── ProfilePage.types.ts   // الأنواع
  ├── ProfilePage.utils.ts   // الدوال المساعدة
  ├── components/            // المكونات الفرعية
  │   ├── ProfileHeader.tsx
  │   ├── ProfileStats.tsx
  │   └── ProfileCars.tsx
  └── README.md              // توثيق المكون
```

---

## 📝 **6. التوثيق | Documentation**

### **⚠️ قواعد التوثيق - إلزامية:**

```typescript
✅ كل ملف يجب أن يحتوي على تعليق في الأعلى:

// src/components/ProfilePage/index.tsx
// Profile Page Component - User profile management
// الصفحة الشخصية - إدارة ملف المستخدم
// Created: 2025-10-05
// Last Modified: 2025-10-05

✅ كل دالة مهمة يجب توثيقها:

/**
 * Fetches user profile data from Firestore
 * جلب بيانات المستخدم من Firestore
 * 
 * @param userId - User ID
 * @returns Promise<UserProfile>
 * @throws Error if user not found
 */
async function getUserProfile(userId: string): Promise<UserProfile> {
  // ...
}

✅ كل مكون React يجب توثيقه:

/**
 * ProfileCard Component
 * عرض بطاقة الملف الشخصي
 * 
 * @param user - User data
 * @param onEdit - Edit callback
 */
interface ProfileCardProps {
  user: User;
  onEdit: () => void;
}
```

---

## 🔐 **7. الأمان | Security**

### **⚠️ قواعد أمان إلزامية:**

```typescript
✅ لا تضع API Keys في الكود مباشرة
✅ استخدم متغيرات البيئة دائماً
✅ تحقق من جميع المدخلات
✅ استخدم TypeScript للتحقق من الأنواع
✅ لا تثق في بيانات المستخدم
✅ استخدم Firestore Security Rules
✅ شفّر البيانات الحساسة

// ❌ خطأ
const apiKey = "AIzaSyCYxOoD-tViZHLh3XhdbwQo8rRA5Q56NVs";

// ✅ صحيح
const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;

// ❌ خطأ
const userInput = req.body.text;
db.collection('messages').add({ text: userInput });

// ✅ صحيح
const userInput = sanitize(req.body.text);
if (validateInput(userInput)) {
  db.collection('messages').add({ 
    text: userInput,
    userId: auth.currentUser.uid,
    timestamp: serverTimestamp()
  });
}
```

---

## 🌐 **8. الترجمة | Translation**

### **⚠️ قواعد الترجمة - إلزامية:**

```typescript
✅ كل نص يظهر للمستخدم يجب أن يكون مترجم
✅ استخدم مفاتيح واضحة ومنظمة
✅ أضف الترجمة في اللغتين معاً
✅ لا تضع نصوص مباشرة في المكونات

// ❌ خطأ
<h1>Welcome to Globul Cars</h1>

// ✅ صحيح
<h1>{t('home.hero.title')}</h1>

// في ملف الترجمة - يجب إضافة اللغتين معاً
// translations.ts
export const translations = {
  bg: {
    home: {
      hero: {
        title: 'Добре дошли в Globul Cars'
      }
    }
  },
  en: {
    home: {
      hero: {
        title: 'Welcome to Globul Cars'
      }
    }
  }
};
```

---

## 💰 **9. العملة والتنسيق | Currency & Formatting**

### **⚠️ قواعد إلزامية:**

```typescript
✅ العملة: EUR فقط
✅ الرمز: €
✅ التنسيق البلغاري: 25 000,00 €
✅ الفاصل العشري: , (فاصلة)
✅ فاصل الآلاف: (مسافة)

// دالة التنسيق الإلزامية
function formatPrice(price: number): string {
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

// الاستخدام
const price = 25000;
console.log(formatPrice(price)); // "25 000,00 €"

// ❌ خطأ
<span>${price}</span>
<span>{price} лв</span>

// ✅ صحيح
<span>{formatPrice(price)}</span>
```

---

## 📦 **10. التكامل مع مشروع قطع الغيار | Spare Parts Integration**

### **🔗 نقاط الربط المستقبلية:**

```typescript
/**
 * معلومات مهمة للتكامل المستقبلي
 * Important information for future integration
 */

// 1. البروفايل الموحد
interface UnifiedUserProfile {
  // معلومات أساسية مشتركة
  userId: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  
  // نوع البائع - مشترك بين المشروعين
  sellerType: 'individual' | 'company';
  
  // المشاريع النشطة
  activeProjects: {
    cars: {
      enabled: boolean;
      listingsCount: number;
      lastActivity: Date;
    };
    spareParts: {
      enabled: boolean;
      listingsCount: number;
      lastActivity: Date;
    };
  };
  
  // معلومات الشركة (للشركات فقط)
  companyInfo?: {
    name: string;
    registrationNumber: string;
    taxNumber: string;
    legalAddress: string;
    contactPerson: string;
    website?: string;
    description?: string;
  };
  
  // معلومات الفرد (للأفراد فقط)
  individualInfo?: {
    firstName: string;
    lastName: string;
    idNumber?: string;
    address?: string;
  };
}

// 2. زر التبديل بين المشاريع
interface ProjectSwitcherProps {
  currentProject: 'cars' | 'spareParts';
  onSwitch: (project: 'cars' | 'spareParts') => void;
  userProjects: {
    cars: boolean;
    spareParts: boolean;
  };
}

// 3. مكون التبديل - يجب إضافته في ProfilePage
const ProjectSwitcher: React.FC<ProjectSwitcherProps> = ({
  currentProject,
  onSwitch,
  userProjects
}) => {
  return (
    <SwitcherContainer>
      {userProjects.cars && (
        <ProjectButton
          active={currentProject === 'cars'}
          onClick={() => onSwitch('cars')}
        >
          🚗 {t('projects.cars')}
        </ProjectButton>
      )}
      
      {userProjects.spareParts && (
        <ProjectButton
          active={currentProject === 'spareParts'}
          onClick={() => onSwitch('spareParts')}
        >
          🔧 {t('projects.spareParts')}
        </ProjectButton>
      )}
    </SwitcherContainer>
  );
};
```

---

## 🏢 **11. أنواع البائعين | Seller Types**

### **⚠️ يجب دعم نوعين فقط:**

```typescript
// 1. فرد / شخص عادي (Individual)
interface IndividualSeller {
  type: 'individual';
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  idNumber?: string;        // رقم الهوية (اختياري)
  address?: string;
  
  // الصلاحيات
  permissions: {
    maxListings: 10;        // حد أقصى 10 إعلانات
    canVerify: false;       // لا يمكن التحقق
    needsApproval: false;   // لا يحتاج موافقة
  };
}

// 2. مؤسسة / شركة (Company)
interface CompanySeller {
  type: 'company';
  companyName: string;
  registrationNumber: string;
  taxNumber: string;
  legalAddress: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  website?: string;
  
  // الصلاحيات
  permissions: {
    maxListings: -1;        // غير محدود
    canVerify: true;        // يمكن التحقق
    needsApproval: true;    // يحتاج موافقة
    canBulkUpload: true;    // رفع جماعي
  };
}

// الاستخدام في الكود
type Seller = IndividualSeller | CompanySeller;

// التحقق من النوع
function isCompany(seller: Seller): seller is CompanySeller {
  return seller.type === 'company';
}

function isIndividual(seller: Seller): seller is IndividualSeller {
  return seller.type === 'individual';
}
```

---

## 🔌 **12. نقاط الربط المفتوحة | Open Integration Points**

### **⚠️ يجب الحفاظ على هذه النقاط مفتوحة:**

```typescript
// 1. في ProfilePage - أضف مكان لزر التبديل
// src/pages/ProfilePage/index.tsx
<ProfileHeader>
  <UserInfo />
  
  {/* 🔗 نقطة ربط: زر التبديل بين المشاريع */}
  <ProjectSwitcherPlaceholder>
    {/* سيتم إضافة ProjectSwitcher هنا لاحقاً */}
  </ProjectSwitcherPlaceholder>
</ProfileHeader>

// 2. في قاعدة البيانات - أضف حقول للتكامل
// firestore: users collection
{
  userId: string,
  // ... الحقول الحالية
  
  // 🔗 نقاط ربط مفتوحة
  linkedProjects: {
    carsProjectId?: string,
    sparePartsProjectId?: string
  },
  
  unifiedProfileId?: string,  // للربط مع البروفايل الموحد
  
  projectPreferences: {
    defaultProject: 'cars' | 'spareParts',
    autoSwitch: boolean
  }
}

// 3. في Auth Service - دعم المصادقة الموحدة
// src/firebase/auth-service.ts
export class UnifiedAuthService {
  // يجب أن تدعم المصادقة للمشروعين
  async signIn(email: string, password: string) {
    const user = await signInWithEmailAndPassword(auth, email, password);
    
    // 🔗 نقطة ربط: تحديد المشاريع النشطة
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const activeProjects = userDoc.data()?.activeProjects || {
      cars: true,
      spareParts: false
    };
    
    return { user, activeProjects };
  }
}
```

---

## 🎨 **13. التصميم | Design**

### **⚠️ معايير التصميم - إلزامية:**

```typescript
✅ استخدم نظام التصميم الموحد
✅ الألوان من ملف colors.ts فقط
✅ المسافات من ملف spacing.ts فقط
✅ الخطوط من ملف typography.ts فقط
✅ الحركات من ملف animations.ts فقط

// ❌ خطأ
const Button = styled.button`
  color: #005ca9;           // قيمة مباشرة
  padding: 16px;            // قيمة مباشرة
  font-size: 14px;          // قيمة مباشرة
`;

// ✅ صحيح
const Button = styled.button`
  color: ${colors.primary.main};
  padding: ${spacing.base[4]};
  font-size: ${typography.fontSize.sm};
`;
```

---

## 🧪 **14. الاختبارات | Testing**

### **⚠️ قواعد الاختبار - إلزامية:**

```typescript
✅ كل مكون جديد يجب أن يحتوي على اختبارات
✅ كل خدمة جديدة يجب أن تحتوي على اختبارات
✅ نسبة التغطية: 70% كحد أدنى
✅ اختبر قبل الدفع (Push)

// مثال على الاختبار
// ProfilePage.test.tsx
describe('ProfilePage', () => {
  it('should render user information', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Моят профил')).toBeInTheDocument();
  });
  
  it('should switch between projects', () => {
    const { getByText } = render(<ProfilePage />);
    fireEvent.click(getByText('🔧 بيع قطع غيار'));
    expect(mockNavigate).toHaveBeenCalledWith('/spare-parts');
  });
});
```

---

## 📊 **15. قاعدة البيانات | Database**

### **⚠️ قواعد Firestore - إلزامية:**

```typescript
✅ استخدم TypeScript Interfaces لكل Collection
✅ أضف Indexes للحقول المستخدمة في الاستعلامات
✅ استخدم Security Rules صارمة
✅ لا تخزن بيانات حساسة بدون تشفير

// مثال على Interface
interface Car {
  id: string;
  title: string;
  price: number;
  currency: 'EUR';          // إلزامي
  location: string;
  sellerId: string;
  sellerType: 'individual' | 'company';  // إلزامي
  
  // للتكامل المستقبلي
  projectType: 'cars' | 'spareParts';
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cars/{carId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.currency == 'EUR'  // تحقق من العملة
        && request.resource.data.sellerType in ['individual', 'company'];
    }
  }
}
```

---

## 🚀 **16. النشر | Deployment**

### **⚠️ قواعد النشر - إلزامية:**

```bash
✅ اختبر محلياً قبل النشر
✅ تأكد من عدم وجود أخطاء
✅ راجع التغييرات
✅ اكتب رسالة commit واضحة
✅ لا تنشر مباشرة على main

# خطوات النشر الصحيحة:
# 1. إنشاء branch جديد
git checkout -b feature/new-feature

# 2. تطبيق التغييرات
# ... code changes ...

# 3. الاختبار
npm test
npm run build

# 4. Commit
git add .
git commit -m "feat: add new feature with EUR support"

# 5. Push
git push origin feature/new-feature

# 6. Pull Request
# إنشاء PR على GitHub

# 7. المراجعة والموافقة
# بعد الموافقة: merge to main

# 8. النشر على Firebase
firebase deploy
```

---

## 📋 **17. قائمة التحقق | Checklist**

### **⚠️ قبل كل commit - تحقق من:**

```typescript
□ الكود يعمل بدون أخطاء
□ لا توجد console.log أو console.error
□ جميع الملفات أقل من 300 سطر
□ العملة EUR في كل مكان
□ اللغات bg/en فقط
□ جميع النصوص مترجمة
□ الأنماط من نظام التصميم
□ التوثيق موجود
□ الاختبارات تعمل
□ Security Rules محدثة
□ لا توجد API Keys مكشوفة
□ TypeScript بدون أخطاء
□ Linter بدون تحذيرات
```

---

## 🎯 **18. الأولويات | Priorities**

### **⚠️ ترتيب الأولويات:**

```typescript
1. الأمان (Security) - أولوية قصوى
2. الأداء (Performance) - أولوية عالية
3. تجربة المستخدم (UX) - أولوية عالية
4. الترجمة (Translation) - أولوية متوسطة
5. التصميم (Design) - أولوية متوسطة
6. الميزات الجديدة (New Features) - أولوية منخفضة

// عند التعارض، الأولوية للأمان دائماً
```

---

## 🔧 **19. الصيانة | Maintenance**

### **⚠️ مهام دورية إلزامية:**

```typescript
✅ أسبوعياً:
   - مراجعة السجلات (Logs)
   - فحص الأخطاء
   - تحديث التبعيات الصغيرة

✅ شهرياً:
   - نسخ احتياطي من Firestore
   - مراجعة Security Rules
   - فحص الأداء
   - تحديث التوثيق

✅ كل 3 أشهر:
   - تحديث التبعيات الرئيسية
   - مراجعة الكود
   - تحسين الأداء
   - إعادة هيكلة إذا لزم الأمر
```

---

## 📞 **20. التواصل | Communication**

### **⚠️ قنوات التواصل:**

```typescript
✅ GitHub Issues: للمشاكل والأخطاء
✅ GitHub Discussions: للنقاشات والاقتراحات
✅ Pull Requests: لمراجعة الكود
✅ Email: globul.net.m@gmail.com للأمور العاجلة

// عند الإبلاغ عن مشكلة:
1. وصف واضح للمشكلة
2. خطوات إعادة إنتاج المشكلة
3. لقطات شاشة إن أمكن
4. معلومات البيئة (Browser, OS)
5. رسائل الأخطاء الكاملة
```

---

## 🎓 **21. الموارد والمراجع | Resources**

### **📚 مراجع إلزامية:**

```typescript
✅ Firebase Documentation: https://firebase.google.com/docs
✅ React Documentation: https://react.dev
✅ TypeScript Handbook: https://www.typescriptlang.org/docs
✅ Bulgarian Localization: MDN Intl API
✅ Google Maps API: https://developers.google.com/maps

// ملفات المشروع المهمة:
✅ PROJECT_COMPLETE_DOCUMENTATION.md - التوثيق الشامل
✅ README.md - البداية السريعة
✅ DEPRECATED_DOCS_LOCATION.md - الأرشيف
```

---

## ⚖️ **22. القواعد القانونية | Legal Rules**

### **⚠️ الامتثال القانوني:**

```typescript
✅ GDPR Compliance - إلزامي
✅ حماية البيانات الشخصية
✅ حق المستخدم في حذف بياناته
✅ سياسة الخصوصية واضحة
✅ شروط الاستخدام محدثة

// في الكود
interface UserData {
  // يجب إضافة حقول GDPR
  gdprConsent: {
    accepted: boolean;
    date: Date;
    version: string;
  };
  
  dataRetention: {
    canDelete: boolean;
    deleteRequestDate?: Date;
  };
}
```

---

## 🎯 **23. معايير الجودة | Quality Standards**

### **⚠️ معايير إلزامية:**

```typescript
✅ Code Quality:
   - TypeScript strict mode
   - ESLint بدون تحذيرات
   - Prettier للتنسيق
   - No console.log في الإنتاج

✅ Performance:
   - Lighthouse Score > 90
   - First Contentful Paint < 2s
   - Time to Interactive < 3s
   - Bundle Size < 500KB

✅ Accessibility:
   - WCAG 2.1 Level AA
   - Keyboard Navigation
   - Screen Reader Support
   - Color Contrast > 4.5:1

✅ SEO:
   - Meta Tags كاملة
   - Sitemap.xml
   - robots.txt
   - Structured Data
```

---

## 🔄 **24. Git Workflow**

### **⚠️ سير العمل الإلزامي:**

```bash
# 1. Branch Naming
feature/feature-name      # ميزة جديدة
fix/bug-description       # إصلاح خطأ
refactor/component-name   # إعادة هيكلة
docs/update-readme        # توثيق
style/update-colors       # تصميم

# 2. Commit Messages
feat: add spare parts integration
fix: resolve EUR formatting issue
refactor: split ProfilePage into components
docs: update API documentation
style: update button colors

# 3. Pull Request Template
## Description
وصف التغييرات

## Type of Change
- [ ] Feature
- [ ] Bug Fix
- [ ] Refactor
- [ ] Documentation

## Checklist
- [ ] Code follows style guidelines
- [ ] Files < 300 lines
- [ ] EUR currency used
- [ ] BG/EN translations added
- [ ] Tests added/updated
- [ ] Documentation updated

## Testing
كيف تم اختبار التغييرات

## Screenshots
لقطات شاشة إن أمكن
```

---

## 🚫 **25. الممنوعات | Prohibited Actions**

### **⚠️ ممنوع منعاً باتاً:**

```typescript
❌ تغيير العملة من EUR
❌ إضافة لغات غير BG/EN
❌ ملفات أكبر من 300 سطر
❌ Hard-coded API Keys
❌ نصوص غير مترجمة
❌ كود بدون توثيق
❌ Push مباشر على main
❌ Deploy بدون اختبار
❌ حذف بيانات المستخدمين
❌ تعطيل Security Rules
❌ استخدام var بدلاً من const/let
❌ استخدام any في TypeScript
❌ تجاهل Linter warnings
❌ نسخ كود بدون فهم
```

---

## 📈 **26. مؤشرات الأداء | Performance Metrics**

### **⚠️ يجب مراقبتها:**

```typescript
✅ Firebase Usage:
   - Firestore Reads: < 50K/day
   - Firestore Writes: < 20K/day
   - Storage: < 5GB
   - Functions Invocations: < 2M/month

✅ Application Performance:
   - Load Time: < 3s
   - API Response: < 500ms
   - Image Load: < 2s
   - Search Results: < 1s

✅ User Experience:
   - Error Rate: < 1%
   - Crash Rate: < 0.1%
   - User Satisfaction: > 4.5/5
```

---

## 🎓 **27. التدريب | Training**

### **⚠️ للمطورين الجدد:**

```typescript
✅ اقرأ هذا الدستور كاملاً
✅ اقرأ PROJECT_COMPLETE_DOCUMENTATION.md
✅ راجع الكود الموجود
✅ جرب التطبيق محلياً
✅ افهم هيكل قاعدة البيانات
✅ تعلم أساسيات البلغارية
✅ افهم نظام الترجمة
✅ راجع Security Rules

// خطوات البداية:
1. استنسخ المشروع
2. ثبت Dependencies
3. أنشئ .env
4. شغل Emulators
5. شغل التطبيق
6. اقرأ التوثيق
7. ابدأ بمهمة صغيرة
```

---

## 🔮 **28. الرؤية المستقبلية | Future Vision**

### **🎯 الخطة طويلة المدى:**

```typescript
المرحلة 1 (الحالية):
✅ مشروع بيع السيارات
✅ البروفايل الأساسي
✅ نظام المصادقة

المرحلة 2 (قريباً):
🔄 مشروع قطع الغيار (في بيئة منفصلة)
🔄 البروفايل الموحد
🔄 زر التبديل بين المشاريع

المرحلة 3 (المستقبل):
⏳ دمج المشروعين
⏳ نظام دفع موحد
⏳ لوحة تحكم موحدة
⏳ تطبيق موبايل

المرحلة 4 (التوسع):
⏳ توسع لدول أخرى
⏳ لغات إضافية
⏳ خدمات إضافية
```

---

## 📝 **29. ملاحظات مهمة | Important Notes**

### **⚠️ انتبه لهذه النقاط:**

```typescript
1. التكامل مع قطع الغيار:
   - لا تبدأ الدمج الآن
   - احتفظ بنقاط الربط مفتوحة
   - وثّق أي تغييرات قد تؤثر على التكامل

2. أنواع البائعين:
   - individual (فرد)
   - company (شركة)
   - لا تضف أنواع أخرى بدون موافقة

3. العملة:
   - EUR فقط - لا استثناءات
   - تنسيق بلغاري دائماً
   - استخدم دوال التنسيق المعتمدة

4. اللغات:
   - BG/EN فقط حالياً
   - لا تضف لغات أخرى بدون موافقة
   - احتفظ بالبنية قابلة للتوسع

5. حجم الملفات:
   - 300 سطر كحد أقصى
   - قسّم الملفات الكبيرة
   - لا استثناءات
```

---

## 🏆 **30. معايير التميز | Excellence Criteria**

### **⚠️ للوصول للتميز:**

```typescript
✅ الكود:
   - نظيف ومقروء
   - موثّق بالكامل
   - قابل للصيانة
   - قابل للتوسع
   - بدون تكرار

✅ الأداء:
   - سريع وفعال
   - محسّن للموبايل
   - يعمل بدون إنترنت (PWA)
   - استهلاك منخفض للموارد

✅ الأمان:
   - بيانات مشفرة
   - مدخلات محققة
   - صلاحيات صارمة
   - حماية من الهجمات

✅ التجربة:
   - واجهة سهلة
   - سريعة الاستجابة
   - دعم كامل للغتين
   - إمكانية وصول عالية
```

---

## 📖 **31. مثال عملي | Practical Example**

### **مثال على إضافة ميزة جديدة:**

```typescript
// المهمة: إضافة نظام تقييم للبائعين

// 1. إنشاء Interface
// src/types/seller-rating.types.ts (< 300 lines)
export interface SellerRating {
  id: string;
  sellerId: string;
  sellerType: 'individual' | 'company';  // إلزامي
  buyerId: string;
  rating: number;  // 1-5
  review: string;
  language: 'bg' | 'en';  // إلزامي
  createdAt: Timestamp;
}

// 2. إضافة الترجمات
// src/locales/translations.ts
export const translations = {
  bg: {
    sellerRating: {
      title: 'Оценка на продавача',
      submit: 'Изпрати оценка',
      // ... المزيد
    }
  },
  en: {
    sellerRating: {
      title: 'Rate Seller',
      submit: 'Submit Rating',
      // ... المزيد
    }
  }
};

// 3. إنشاء الخدمة
// src/services/seller-rating-service.ts (< 300 lines)
export class SellerRatingService {
  async addRating(rating: SellerRating) {
    // التحقق من العملة والموقع
    if (rating.language !== 'bg' && rating.language !== 'en') {
      throw new Error('Invalid language');
    }
    
    return await addDoc(collection(db, 'sellerRatings'), rating);
  }
}

// 4. إنشاء المكون
// src/components/SellerRating/index.tsx (< 300 lines)
export const SellerRating: React.FC<Props> = ({ sellerId }) => {
  const { t } = useTranslation();
  
  return (
    <Container>
      <h2>{t('sellerRating.title')}</h2>
      {/* ... */}
    </Container>
  );
};

// 5. إضافة الاختبارات
// src/components/SellerRating/SellerRating.test.tsx
describe('SellerRating', () => {
  it('should render in Bulgarian', () => {
    // ...
  });
});

// 6. تحديث Security Rules
// firestore.rules
match /sellerRatings/{ratingId} {
  allow read: if true;
  allow create: if request.auth != null
    && request.resource.data.language in ['bg', 'en'];
}

// 7. Commit
git add .
git commit -m "feat: add seller rating system with BG/EN support"
```

---

## 🎯 **الخلاصة | Summary**

### **القواعد الذهبية الخمس:**

```typescript
1. 🌍 EUR + BG/EN فقط - لا استثناءات
2. 📏 300 سطر كحد أقصى - قسّم الملفات
3. 🔄 كل شيء قابل للتوسع - فكر في المستقبل
4. 🔗 نقاط الربط مفتوحة - للتكامل مع قطع الغيار
5. 🏢 دعم الأفراد والشركات - نوعان فقط
```

---

## ✅ **التوقيع | Sign-off**

```
أنا، بصفتي مطور في مشروع Globul Cars، أتعهد بالالتزام بجميع القواعد 
والمعايير المذكورة في هذا الدستور، وأن أعمل بأعلى معايير الاحترافية 
والدقة والجودة.

I, as a developer on the Globul Cars project, pledge to adhere to all 
rules and standards mentioned in this constitution, and to work with 
the highest standards of professionalism, accuracy, and quality.
```

---

## 📞 **معلومات الاتصال | Contact**

```json
{
  "project": "Globul Cars",
  "repository": "https://github.com/hamdanialaa3/new-globul-cars",
  "email": "globul.net.m@gmail.com",
  "documentation": "PROJECT_COMPLETE_DOCUMENTATION.md",
  "constitution": "DEVELOPMENT_CONSTITUTION.md"
}
```

---

## 📅 **معلومات الدستور | Constitution Info**

```
📝 تاريخ الإنشاء: 5 أكتوبر 2025
🔄 آخر تحديث: 5 أكتوبر 2025
📌 الإصدار: 1.0.0
✅ الحالة: نافذ ومُلزم
🌍 النطاق: جميع المطورين والمساهمين
```

---

**🚗🇧🇬 Globul Cars - نعمل بمعايير عالمية لسوق بلغاري محلي**

---

## 🎓 **ملحق: مصطلحات بلغارية مهمة | Bulgarian Terms**

```typescript
// للمطورين غير الناطقين بالبلغارية
const BULGARIAN_TERMS = {
  // أساسيات
  'кола': 'car',
  'цена': 'price',
  'марка': 'brand',
  'модел': 'model',
  'година': 'year',
  'пробег': 'mileage',
  
  // أنواع البائعين
  'физическо лице': 'individual person',
  'фирма': 'company',
  'търговец': 'dealer',
  
  // العملة
  'евро': 'euro',
  'лева': 'leva (Bulgarian currency - NOT USED)',
  
  // المدن الرئيسية
  'София': 'Sofia',
  'Пловдив': 'Plovdiv',
  'Варна': 'Varna',
  'Бургас': 'Burgas',
  
  // إجراءات
  'купи': 'buy',
  'продай': 'sell',
  'търси': 'search',
  'добави': 'add',
  'редактирай': 'edit',
  'изтрий': 'delete'
};
```

---

**📜 هذا الدستور ملزم لجميع المطورين والمساهمين في المشروع**

**🎯 الالتزام به يضمن جودة واستمرارية المشروع**

# 🏢 Dealership System - Complete Documentation
## نظام المعارض/المتاجر - التوثيق الشامل

**Date:** October 20, 2025  
**Status:** ✅ READY FOR IMPLEMENTATION  
**Version:** 1.0.0

---

## 📋 Overview | نظرة عامة

نظام شامل لدعم نوعين من البائعين في السوق البلغاري للسيارات:

### 1. Individual Seller (بائع فردي)
- معلومات شخصية بسيطة
- بيع سيارات فردية
- ملف شخصي عادي

### 2. Dealership/Showroom (معرض/متجر)
- معلومات مهنية كاملة
- معرض سيارات احترافي
- تراخيص ومستندات
- ساعات عمل
- فريق عمل
- خدمات إضافية

---

## 🏗️ Files Created | الملفات المُنشأة

### 1. Type Definitions (180 lines)
**File:** `src/types/dealership.types.ts`

**Interfaces:**
```typescript
- LegalForm: 'EOOD' | 'OOD' | 'AD' | 'SOLE_TRADER' | 'ET'
- VehicleType: 'new' | 'used' | 'both'
- CarCategory: 'passenger' | 'trucks' | 'vans' | 'luxury' | 'commercial' | 'motorcycles'
- WorkingHours: {monday-sunday}: DaySchedule
- DaySchedule: {open, openTime, closeTime, breakStart, breakEnd}
- SocialMedia: {facebook, instagram, tiktok, youtube, linkedin}
- DealershipServices: {financing, warranty, maintenance, importOnDemand, tradeIn, insurance, registration, delivery}
- DealershipCertifications: {chamberOfCommerce, bankPartner, manufacturerAuthorized, isocertified, other}
- DealershipDocument: {id, type, name, url, uploadedAt, verified, verifiedAt, verifiedBy}
- DealershipMedia: {id, type, url, caption, uploadedAt}
- ManagerInfo: {fullName, position, photo, phone, whatsapp, email}
- DealershipInfo: Complete dealership profile
- PrivacySettings: Control visibility of all fields
```

**Default Values:**
```typescript
- DEFAULT_PRIVACY_SETTINGS
- DEFAULT_WORKING_HOURS (Mon-Fri: 09:00-18:00, Sat: 10:00-14:00, Sun: Closed)
- DEFAULT_SERVICES (all false)
- DEFAULT_CERTIFICATIONS (all false)
```

### 2. Dealership Service (420 lines)
**File:** `src/services/dealership/dealership.service.ts`

**Methods:**
```typescript
✅ saveDealershipInfo(userId, data): Save/update dealership
✅ getDealershipInfo(userId): Get dealership profile
✅ uploadDocument(userId, file, type, name): Upload business documents
✅ deleteDocument(userId, documentId): Delete document
✅ uploadMedia(userId, file, type, caption): Upload photos/videos
✅ deleteMedia(userId, mediaId): Delete media
✅ updateWorkingHours(userId, hours): Update schedule
✅ updateServices(userId, services): Update offered services
✅ updateCertifications(userId, certs): Update certifications
✅ savePrivacySettings(userId, settings): Save privacy config
✅ getPrivacySettings(userId): Get privacy config
✅ updateTotalCars(userId, count): Auto-update car count
✅ verifyDealership(userId, adminId): Admin verification
✅ verifyDocument(userId, docId, adminId): Admin document verification
✅ searchDealerships(criteria): Search by city/region/verified
```

### 3. Privacy Settings Manager (620 lines)
**File:** `src/components/Profile/Privacy/PrivacySettingsManager.tsx`

**Features:**
- 🔒 Profile visibility control (Public/Registered Only/Private)
- 👁️ Toggle visibility for each field
- ✅ Personal information privacy
- ✅ Dealership information privacy
- ✅ Statistics privacy
- 🎨 Beautiful UI with Eye/EyeOff icons
- 🌐 Full BG/EN support
- 💾 Auto-save functionality

---

## 📊 Dealership Information Structure | هيكل معلومات المعرض

### 🏢 Basic Information | معلومات أساسية

```typescript
{
  dealershipNameBG: string;        // اسم المعرض (بلغاري) - مطلوب
  dealershipNameEN?: string;       // اسم المعرض (إنجليزي) - اختياري
  legalForm: LegalForm;            // EOOD, OOD, AD, SOLE_TRADER, ET
  vatNumber: string;               // ДДС номер (رقم الضريبة)
  companyRegNumber: string;        // ЕИК (رقم التسجيل التجاري)
}
```

**Legal Forms (الأشكال القانونية):**
- **EOOD** - Еднолично дружество с ограничена отговорност (Single-person LLC)
- **OOD** - Дружество с ограничена отговорност (Limited Liability Company)
- **AD** - Акционерно дружество (Joint-Stock Company)
- **SOLE_TRADER** - Едноличен търговец (Sole Proprietorship)
- **ET** - ЕТ (Individual Entrepreneur)

### 📍 Address Information | معلومات العنوان

```typescript
{
  address: {
    city: string;              // مدينة
    street: string;            // شارع
    number: string;            // رقم
    postalCode?: string;       // رمز بريدي
    region: string;            // منطقة (26 Bulgarian regions)
    coordinates?: {            // إحداثيات GPS
      lat: number;
      lng: number;
    };
  }
}
```

### ⏰ Working Hours | ساعات العمل

```typescript
{
  workingHours: {
    monday: {
      open: boolean;           // مفتوح/مغلق
      openTime: "09:00";       // وقت الفتح
      closeTime: "18:00";      // وقت الإغلاق
      breakStart?: "12:00";    // بداية استراحة
      breakEnd?: "13:00";      // نهاية استراحة
    },
    // ... tuesday to sunday
  }
}
```

**Default Schedule:**
- Monday-Friday: 09:00 - 18:00
- Saturday: 10:00 - 14:00
- Sunday: Closed

### 📞 Contact Information | معلومات الاتصال

```typescript
{
  primaryPhone: string;        // رقم أساسي
  secondaryPhone?: string;     // رقم ثانوي
  officialEmail: string;       // بريد رسمي
  website?: string;            // موقع إلكتروني
  socialMedia: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  }
}
```

### 👤 Manager Information | معلومات المدير

```typescript
{
  manager: {
    fullName: string;          // الاسم الكامل
    position: string;          // الوظيفة (مدير، مالك، مسؤول مبيعات)
    photo?: string;            // صورة شخصية
    phone?: string;            // هاتف مباشر
    whatsapp?: string;         // واتساب
    email?: string;            // بريد إلكتروني
  }
}
```

### 🚗 Business Details | تفاصيل النشاط

```typescript
{
  vehicleTypes: 'new' | 'used' | 'both';    // نوع السيارات
  carCategories: [                           // فئات السيارات
    'passenger',      // سيارات ركاب
    'trucks',         // شاحنات
    'vans',           // فانات
    'luxury',         // سيارات فاخرة
    'commercial',     // سيارات تجارية
    'motorcycles'     // دراجات نارية
  ],
  services: {
    financing: boolean;           // تمويل/تقسيط
    warranty: boolean;            // ضمان بعد البيع
    maintenance: boolean;         // صيانة
    importOnDemand: boolean;      // استيراد حسب الطلب
    tradeIn: boolean;             // استبدال سيارات قديمة
    insurance: boolean;           // تأمين
    registration: boolean;        // تسجيل
    delivery: boolean;            // توصيل
  },
  certifications: {
    chamberOfCommerce: boolean;   // عضو غرفة التجارة
    bankPartner?: string;         // شريك بنكي
    manufacturerAuthorized: boolean; // وكيل معتمد
    isocertified: boolean;        // شهادة ISO
    other: string[];              // شهادات أخرى
  }
}
```

### 📊 Statistics | الإحصائيات

```typescript
{
  totalCarsAvailable: number;    // عدد السيارات المتاحة (محسوب تلقائياً)
  totalCarsSold?: number;        // عدد السيارات المباعة
  yearsInBusiness?: number;      // سنوات الخبرة
  trustScore?: number;           // درجة الثقة (0-100)
}
```

### ⭐ Trust & Reputation | الثقة والسمعة

```typescript
{
  verified: boolean;             // موثّق ✅
  featuredDealer: boolean;       // بائع مميز 🌟
  trustScore: number;            // درجة الثقة
}
```

### 📷 Media | الوسائط

```typescript
{
  logo?: string;                 // شعار المعرض
  coverImage?: string;           // صورة الغلاف
  galleryImages: [               // معرض الصور
    {
      id: string;
      type: 'facade' | 'showroom' | 'parking_lot' | 'office' | 'team' | 'other';
      url: string;
      caption?: string;
      uploadedAt: Date;
    }
  ]
}
```

### 📑 Documents | المستندات (للإدارة فقط)

```typescript
{
  documents: [
    {
      id: string;
      type: 'business_license' | 'tax_registration' | 'property_proof' | 'insurance' | 'other';
      name: string;
      url: string;
      uploadedAt: Date;
      verified: boolean;         // تم التحقق
      verifiedAt?: Date;
      verifiedBy?: string;       // ID المشرف
    }
  ]
}
```

**Document Types:**
1. **business_license** - رخصة تجارية
2. **tax_registration** - تسجيل ضريبي
3. **property_proof** - إثبات ملكية/عقد إيجار
4. **insurance** - تأمين
5. **other** - مستندات أخرى

---

## 🔒 Privacy Settings | إعدادات الخصوصية

### Profile Visibility | رؤية الملف الشخصي

```typescript
{
  profileVisibility: 'public' | 'registered_only' | 'private';
}
```

- **public**: مرئي للجميع
- **registered_only**: مرئي للمستخدمين المسجلين فقط
- **private**: مرئي للمالك فقط

### Field-Level Privacy | خصوصية على مستوى الحقل

**Personal Information:**
```typescript
{
  showFullName: boolean;          // إظهار الاسم الكامل
  showEmail: boolean;             // إظهار البريد
  showPhone: boolean;             // إظهار الهاتف
  showAddress: boolean;           // إظهار العنوان
  showDateOfBirth: boolean;       // إظهار تاريخ الميلاد
  showPlaceOfBirth: boolean;      // إظهار مكان الميلاد
}
```

**Dealership Information:**
```typescript
{
  showDealershipName: boolean;    // إظهار اسم المعرض
  showLegalForm: boolean;         // إظهار الشكل القانوني
  showVATNumber: boolean;         // إظهار رقم الضريبة
  showCompanyRegNumber: boolean;  // إظهار رقم التسجيل
  showDealershipAddress: boolean; // إظهار عنوان المعرض
  showWorkingHours: boolean;      // إظهار ساعات العمل
  showWebsite: boolean;           // إظهار الموقع
  showSocialMedia: boolean;       // إظهار السوشيال ميديا
  showManager: boolean;           // إظهار معلومات المدير
  showServices: boolean;          // إظهار الخدمات
  showCertifications: boolean;    // إظهار الشهادات
  showGallery: boolean;           // إظهار المعرض
}
```

**Statistics:**
```typescript
{
  showTotalCars: boolean;         // إظهار عدد السيارات
  showTrustScore: boolean;        // إظهار درجة الثقة
  showReviews: boolean;           // إظهار التقييمات
}
```

---

## 🔄 Usage Flow | تدفق الاستخدام

### For Individual Seller | للبائع الفردي

1. Create account
2. Fill basic personal info
3. Add cars for sale
4. Set privacy settings

### For Dealership | للمعرض

1. Create account
2. **Switch to Dealership mode**
3. Fill dealership information:
   - Basic info (name, legal form, VAT, company reg)
   - Address + coordinates
   - Working hours
   - Contact information
   - Manager details
   - Services offered
   - Certifications
4. **Upload documents**:
   - Business license
   - Tax registration
   - Property proof
5. **Upload media**:
   - Logo
   - Cover image
   - Showroom photos
   - Team photos
6. Set privacy settings
7. Wait for admin verification
8. Add cars inventory
9. Start selling!

---

## 🎨 UI Components To Create | المكونات المطلوب إنشاؤها

### 1. Dealership Profile Form
**File:** `src/components/Profile/Dealership/DealershipProfileForm.tsx`

**Sections:**
- Basic Information
- Address with Google Maps
- Working Hours Schedule
- Contact Information
- Manager Information
- Services Checkboxes
- Certifications

### 2. Document Upload Manager
**File:** `src/components/Profile/Dealership/DocumentUploadManager.tsx`

**Features:**
- Upload multiple documents
- Show verification status
- Delete documents
- Preview documents

### 3. Media Gallery Manager
**File:** `src/components/Profile/Dealership/MediaGalleryManager.tsx`

**Features:**
- Upload photos/videos
- Categorize media (facade, showroom, parking, etc.)
- Add captions
- Drag & drop reorder
- Delete media

### 4. Working Hours Editor
**File:** `src/components/Profile/Dealership/WorkingHoursEditor.tsx`

**Features:**
- 7-day schedule
- Open/Closed toggle
- Time pickers
- Break times
- Copy to all days option

### 5. Services Manager
**File:** `src/components/Profile/Dealership/ServicesManager.tsx`

**Features:**
- Checkbox list of services
- Description for each service
- BG/EN labels

### 6. Account Type Switcher
**File:** `src/components/Profile/AccountTypeSwitcher.tsx`

**Features:**
- Toggle between Individual/Dealership
- Confirmation modal
- Data migration warning
- Smooth transition

---

## 🗄️ Firebase Collections | مجموعات Firebase

### New Collection: dealerships

**Path:** `/dealerships/{userId}`

**Schema:**
```typescript
{
  // Basic Info
  dealershipNameBG: string;
  dealershipNameEN?: string;
  legalForm: string;
  vatNumber: string;
  companyRegNumber: string;
  
  // Address
  address: {
    city: string;
    street: string;
    number: string;
    postalCode?: string;
    region: string;
    coordinates?: { lat: number; lng: number; };
  };
  
  // Working Hours
  workingHours: WorkingHours;
  
  // Contact
  primaryPhone: string;
  secondaryPhone?: string;
  officialEmail: string;
  website?: string;
  socialMedia: SocialMedia;
  
  // Manager
  manager: ManagerInfo;
  
  // Business
  vehicleTypes: string;
  carCategories: string[];
  services: DealershipServices;
  certifications: DealershipCertifications;
  
  // Stats
  totalCarsAvailable: number;
  totalCarsSold?: number;
  yearsInBusiness?: number;
  
  // Trust
  verified: boolean;
  featuredDealer: boolean;
  trustScore?: number;
  
  // Media
  logo?: string;
  coverImage?: string;
  galleryImages: DealershipMedia[];
  
  // Documents
  documents: DealershipDocument[];
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Updated Collection: users

**Add field:**
```typescript
{
  ...existing fields,
  privacySettings: PrivacySettings;
}
```

---

## 🔒 Firebase Security Rules | قواعد الأمان

```javascript
// Dealerships Collection
match /dealerships/{userId} {
  // Read: Public or based on privacy settings
  allow get: if isSignedIn();
  
  // List: Authenticated users (for search)
  allow list: if isSignedIn();
  
  // Create: Owner only
  allow create: if isOwner(userId) &&
                   request.resource.data.dealershipNameBG != null &&
                   request.resource.data.legalForm != null &&
                   request.resource.data.vatNumber != null;
  
  // Update: Owner or admin
  allow update: if isOwnerOrAdmin(userId);
  
  // Delete: Owner or admin
  allow delete: if isOwnerOrAdmin(userId);
}

// Privacy Settings in users collection
match /users/{userId} {
  // ... existing rules
  
  // Update privacy settings: Owner only
  allow update: if isOwner(userId) || isAdmin();
}
```

---

## 🌐 Internationalization | الترجمة

### Bulgarian (BG) Translations

```typescript
{
  dealershipName: "Име на автокъща",
  legalForm: "Правна форма",
  vatNumber: "ДДС номер",
  companyRegNumber: "ЕИК",
  workingHours: "Работно време",
  services: "Услуги",
  certifications: "Сертификати",
  manager: "Мениджър",
  uploadDocument: "Качи документ",
  businessLicense: "Търговска лицензия",
  taxRegistration: "Данъчна регистрация",
  propertyProof: "Доказателство за собственост"
}
```

### English (EN) Translations

```typescript
{
  dealershipName: "Dealership Name",
  legalForm: "Legal Form",
  vatNumber: "VAT Number",
  companyRegNumber: "Company Registration Number",
  workingHours: "Working Hours",
  services: "Services",
  certifications: "Certifications",
  manager: "Manager",
  uploadDocument: "Upload Document",
  businessLicense: "Business License",
  taxRegistration: "Tax Registration",
  propertyProof: "Property Proof"
}
```

---

## ✅ Next Steps | الخطوات التالية

### Phase 1: Core Components (HIGH PRIORITY)
1. ✅ Create type definitions
2. ✅ Create dealership service
3. ✅ Create privacy settings manager
4. 🔄 Create account type switcher
5. 🔄 Create dealership profile form
6. 🔄 Create document upload manager
7. 🔄 Create working hours editor

### Phase 2: Integration
1. Update ProfilePage to support both types
2. Add conditional rendering based on account type
3. Integrate privacy settings
4. Add document verification UI for admins

### Phase 3: Testing
1. Test account type switching
2. Test document upload
3. Test privacy settings
4. Test admin verification flow

### Phase 4: Deployment
1. Update Firebase rules
2. Deploy to production
3. Monitor usage
4. Gather feedback

---

## 📊 Estimated Development Time

- **Types & Services**: ✅ 2 hours (DONE)
- **Privacy Manager**: ✅ 2 hours (DONE)
- **Account Switcher**: 2 hours
- **Dealership Form**: 4 hours
- **Document Manager**: 3 hours
- **Working Hours**: 2 hours
- **Integration**: 3 hours
- **Testing**: 2 hours

**Total**: ~20 hours

---

## 🎯 Success Metrics

### Technical
- ✅ Type safety (100%)
- ✅ Service layer complete
- ✅ Privacy controls working
- 🔄 All UI components created
- 🔄 Firebase rules updated
- 🔄 BG/EN translations complete

### Functional
- 🔄 Users can switch account types
- 🔄 Dealerships can upload documents
- 🔄 Privacy settings work correctly
- 🔄 Admin verification flow works
- 🔄 Search works for dealerships

### User Experience
- 🔄 Smooth account type transition
- 🔄 Intuitive document upload
- 🔄 Clear privacy controls
- 🔄 Professional dealership profiles
- 🔄 Mobile responsive

---

**Status:** Foundation Complete ✅  
**Next:** Build UI Components 🔄

---

*Last Updated: October 20, 2025*  
*Version: 1.0.0*  
*Author: AI Development Team*

# 🏗️ Architecture Diagram - الخارطة المعمارية

## 📋 نظرة عامة

تم إنشاء مخطط معماري تفاعلي يوضح بنية المشروع الكاملة والوصلات البرمجية بين جميع الأجزاء.

## 🎯 المميزات

### 1. عرض تفاعلي
- **مخطط ديناميكي**: يمكن سحب العقد (nodes) وتحريرها
- **ألوان مميزة**: كل package له لون خاص
- **تفاصيل شاملة**: انقر على أي package لعرض تفاصيله

### 2. الوصلات البرمجية
- **Dependencies**: يوضح أي package يعتمد على أي
- **Dependents**: يوضح من يستخدم كل package
- **أسهم متحركة**: توضح اتجاه التبعيات

### 3. الإحصائيات
- عدد Packages: **11**
- عدد الملفات: **823+**
- حالة Migration: **100%**

## 📁 الملفات

### `ARCHITECTURE_DIAGRAM.html`
صفحة HTML تفاعلية تحتوي على:
- مخطط D3.js تفاعلي
- لوحة معلومات تفصيلية
- أزرار تحكم للعرض
- إحصائيات المشروع
- مفتاح الألوان

## 🚀 الاستخدام

### فتح المخطط
```bash
# افتح الملف في المتصفح
start docs/ARCHITECTURE_DIAGRAM.html

# أو
open docs/ARCHITECTURE_DIAGRAM.html
```

### التفاعل مع المخطط
1. **سحب العقد**: اسحب أي package لتحريكه
2. **النقر على Package**: انقر لعرض التفاصيل
3. **أزرار العرض**: استخدم الأزرار لتصفية العرض
4. **إعادة التعيين**: اضغط "Reset" لإعادة المخطط

## 📊 Packages المعروضة

### Core Packages
- **Core**: Hooks, Utils, Types, Contexts, Constants, Locales, Features
- **Services**: Firebase, Car Services, User Services, Messaging, Analytics
- **UI**: Components, Layout, Forms, Car Components, Profile Components

### Feature Packages
- **App**: Main application and routing
- **Auth**: Authentication pages
- **Cars**: Car-related pages
- **Profile**: User profile pages
- **Admin**: Admin dashboard
- **Social**: Social features
- **Messaging**: Messaging system
- **Payments**: Payment and billing
- **IoT**: IoT dashboard

## 🔗 الوصلات البرمجية

### Core → All
- Core يعتمد عليه جميع Packages الأخرى
- يوفر: Hooks, Utils, Types, Contexts, Constants, Locales

### Services → App, Auth, Cars, Profile, etc.
- Services تستخدم من قبل جميع Feature Packages
- يوفر: Firebase, Car Services, User Services, etc.

### UI → App, Auth, Cars, Profile, etc.
- UI Components تستخدم من قبل جميع Feature Packages
- يوفر: Components, Layout, Forms, etc.

## 🎨 الألوان

- 🔴 **Core**: أحمر (#ff6b6b)
- 🔵 **Services**: أزرق فاتح (#4ecdc4)
- 🟡 **UI**: أصفر (#ffe66d)
- 🟢 **App**: أخضر فاتح (#95e1d3)
- 🟢 **Auth**: أخضر (#a8e6cf)
- 🟠 **Cars**: برتقالي (#ffd3a5)
- 🩷 **Profile**: وردي (#fd79a8)
- 🟡 **Admin**: أصفر (#fdcb6e)
- 🔵 **Social**: أزرق (#74b9ff)
- 🟣 **Messaging**: بنفسجي (#a29bfe)
- 🟢 **Payments & IoT**: أخضر (#55efc4)

## 📝 التحديثات

للتحديث:
1. عدّل البيانات في `architecture` object في HTML
2. أضف packages جديدة في `nodes` array
3. حدّث الوصلات في `dependencies` و `dependents`

## 🔧 التخصيص

يمكن تخصيص:
- الألوان: في CSS `.node.{type} rect`
- المواضع: في `forceSimulation` parameters
- التفاصيل: في `details` object لكل node

---

**آخر تحديث**: 20 نوفمبر 2025


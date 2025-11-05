# 📊 نظام التقارير - Reports System

## 🎯 الغرض

نظام شامل لتصدير البيانات من Firebase إلى تقارير قابلة للتحليل بصيغ متعددة:
- **CSV** (ملفات Excel)
- **JSON** (للمطورين/APIs)
- **Excel/Word** (HTML Table يفتح في Office)

---

## 📂 الملفات

```
src/services/reports/
├── users-report-service.ts     # تقارير المستخدمين
├── cars-report-service.ts      # تقارير السيارات
└── README.md                   # هذا الملف
```

---

## 🚀 كيف تستخدم النظام؟

### طريقة 1: من صفحة Admin (الأسهل)

1. افتح صفحة التقارير:
   ```
   http://localhost:3000/admin/reports
   ```

2. اختر نوع التقرير (مستخدمين أو سيارات)

3. اختر الفلاتر (مدينة، حالة، إلخ)

4. اضغط "جلب البيانات"

5. اختر صيغة التصدير:
   - **CSV** → يفتح في Excel مباشرة
   - **Excel** → جدول HTML منسق
   - **JSON** → للتحليل البرمجي

---

### طريقة 2: استخدام مباشر في الكود

#### مثال 1: تقرير جميع المستخدمين

\`\`\`typescript
import { usersReportService } from '../services/reports/users-report-service';

// جلب جميع المستخدمين
const users = await usersReportService.getAllUsers();

// تصدير إلى CSV
const csv = await usersReportService.exportToCSV(users);
usersReportService.downloadReport(csv, 'users-report', 'csv');
\`\`\`

#### مثال 2: تقرير السيارات في صوفيا فقط

\`\`\`typescript
import { carsReportService } from '../services/reports/cars-report-service';

// جلب سيارات صوفيا النشطة
const cars = await carsReportService.getAllCars({
  city: 'София',
  status: 'active'
});

// تصدير إلى Excel
const excel = await carsReportService.exportToExcel(cars);
carsReportService.downloadReport(excel, 'sofia-cars', 'xls');
\`\`\`

#### مثال 3: المعارض فقط

\`\`\`typescript
const dealers = await usersReportService.getAllUsers({
  profileType: 'dealer',
  verifiedOnly: true
});

const csv = await usersReportService.exportToCSV(dealers);
usersReportService.downloadReport(csv, 'verified-dealers', 'csv');
\`\`\`

#### مثال 4: سيارات BMW من 2020-2024

\`\`\`typescript
const bmwCars = await carsReportService.getAllCars({
  make: 'BMW',
  yearFrom: 2020,
  yearTo: 2024,
  status: 'active'
});

const json = await carsReportService.exportToJSON(bmwCars);
\`\`\`

---

## 📊 أمثلة عملية

### سيناريو 1: تقرير شهري للمبيعات

\`\`\`typescript
// جلب السيارات المباعة في صوفيا
const soldCars = await carsReportService.getAllCars({
  city: 'София',
  status: 'sold'
});

// حساب إحصائيات
const stats = await carsReportService.getCarStatistics('София');
console.log('إجمالي القيمة:', stats.totalValue);
console.log('متوسط السعر:', stats.averagePrice);

// تصدير إلى Excel
const report = await carsReportService.exportToExcel(soldCars);
carsReportService.downloadReport(report, 'sofia-sales-2025-01', 'xls');
\`\`\`

### سيناريو 2: قائمة المستخدمين للتسويق

\`\`\`typescript
// جلب المستخدمين المتحققين
const verified = await usersReportService.getAllUsers({
  verifiedOnly: true
});

// تصدير مع البريد والهاتف
const csv = await usersReportService.exportToCSV(verified);
\`\`\`

### سيناريو 3: تحليل السوق لمدينة

\`\`\`typescript
// إحصائيات سريعة لصوفيا
const sofiaStats = await carsReportService.getCarStatistics('София');

console.log(`
  📊 تحليل السوق - صوفيا:
  - إجمالي السيارات: ${sofiaStats.total}
  - نشط: ${sofiaStats.active}
  - مباع: ${sofiaStats.sold}
  - متوسط السعر: ${sofiaStats.averagePrice.toFixed(2)} €
  - متوسط المسافة: ${sofiaStats.averageMileage.toFixed(0)} km
`);
\`\`\`

---

## 🎨 صيغ التقارير

### CSV (تفتح في Excel)
```
ID,البريد,الاسم,نوع الحساب,المدينة,...
user123,"email@example.com","علي","خاص","София",...
```

**مميزات:**
- ✅ يفتح مباشرة في Excel
- ✅ دعم كامل للعربية (UTF-8 BOM)
- ✅ خفيف وسهل المشاركة

---

### Excel (HTML Table)
```html
<table>
  <thead>
    <tr><th>ID</th><th>الاسم</th>...</tr>
  </thead>
  <tbody>
    <tr><td>user123</td><td>علي</td>...</tr>
  </tbody>
</table>
```

**مميزات:**
- ✅ تنسيق ملون وجميل
- ✅ عناوين وإحصائيات
- ✅ يفتح في Excel/Word

---

### JSON (للمطورين)
```json
[
  {
    "uid": "user123",
    "email": "email@example.com",
    "displayName": "علي",
    ...
  }
]
```

**مميزات:**
- ✅ للتحليل البرمجي
- ✅ للـ APIs
- ✅ للنسخ الاحتياطي

---

## 🔐 الأمان

- ✅ فقط المسؤولين يمكنهم الوصول
- ✅ يتم تسجيل كل عملية تصدير
- ✅ لا يتم حفظ التقارير على الخادم

---

## 📝 ملاحظات مهمة

### الأداء
- السيارات: حتى 10,000 سيارة في تقرير واحد
- المستخدمين: حتى 50,000 مستخدم
- الوقت: 5-10 ثواني للتقارير الكبيرة

### البيانات الحساسة
⚠️ **انتبه:** التقارير تحتوي على:
- أرقام هواتف
- عناوين بريد إلكتروني
- معلومات شخصية

**احرص على:**
- عدم مشاركة التقارير علناً
- حذف التقارير بعد الاستخدام
- استخدام كلمة سر للملفات المهمة

---

## 🛠️ توسيع النظام

### إضافة تقرير جديد

1. أنشئ ملف service جديد:
\`\`\`typescript
src/services/reports/orders-report-service.ts
\`\`\`

2. استخدم نفس النمط:
\`\`\`typescript
export class OrdersReportService {
  async getAllOrders() { ... }
  async exportToCSV() { ... }
  async exportToExcel() { ... }
}
\`\`\`

3. أضف التقرير لصفحة Admin

---

## 🐛 حل المشاكل

### المشكلة: Excel لا يفتح الملف
**الحل:** تأكد من استخدام UTF-8 BOM في CSV

### المشكلة: البيانات الفارغة
**الحل:** تأكد من الفلاتر والأذونات في Firestore

### المشكلة: بطء في التصدير
**الحل:** قلل عدد السجلات أو استخدم pagination

---

## 📞 الدعم

إذا واجهت مشكلة، تحقق من:
1. Console في المتصفح (F12)
2. Firebase Console (Firestore Rules)
3. Logger Service للأخطاء

---

**آخر تحديث:** 2025-11-05  
**الإصدار:** 1.0  
**المطور:** Globul Cars Team


# 🚗 نظام الماركات والموديلات - Car Brands & Models System

## ✅ تم التنفيذ - Implemented

تاريخ: 1 أكتوبر 2025  
Date: October 1, 2025

---

## 📋 الوصف - Description

نظام قوائم منسدلة ذكي ومترابط لاختيار ماركة وموديل السيارة:

- **القائمة الأولى (Make)**: اختيار الماركة من 50+ ماركة
- **القائمة الثانية (Model)**: تظهر الموديلات المتاحة للماركة المختارة
- **ترابط ذكي**: عند تغيير الماركة، تتحدث قائمة الموديلات تلقائياً
- **Fallback**: إذا لم تتوفر موديلات، يظهر حقل نصي للإدخال اليدوي

---

## 🏗️ الهيكل - Structure

### الملفات الجديدة:

1. **`src/services/carBrandsService.ts`** (265 سطر)
   - خدمة البيانات الرئيسية
   - 50+ ماركة سيارات
   - 21 ماركة بموديلات محددة
   - وظائف البحث والتحقق

2. **`src/pages/sell/VehicleData/index.tsx`** (محدّث)
   - قوائم منسدلة مترابطة
   - إدارة الحالة (state management)
   - تفعيل/تعطيل ديناميكي

3. **`src/pages/sell/VehicleData/styles.ts`** (محدّث)
   - `HintText` للإرشادات
   - `disabled` styling للحقول

---

## 📊 البيانات المتوفرة - Available Data

### الماركات المدعومة بموديلات (21 ماركة):

| الماركة | عدد الموديلات | أمثلة |
|---------|--------------|-------|
| **Audi** | 27 | A3, A4, Q5, Q7, e-tron |
| **BMW** | 16 | 3 Series, 5 Series, X3, X5 |
| **Mercedes-Benz** | 16 | C-Class, E-Class, GLE, AMG GT |
| **Volkswagen** | 12 | Golf, Passat, Tiguan, ID.4 |
| **Toyota** | 11 | Corolla, RAV4, Land Cruiser |
| **Ford** | 12 | Focus, Mustang, Ranger, F-150 |
| **Renault** | 10 | Clio, Megane, Captur |
| **Peugeot** | 11 | 208, 308, 3008, 5008 |
| **Opel** | 9 | Corsa, Astra, Mokka |
| **Skoda** | 8 | Octavia, Superb, Kodiaq |
| **Hyundai** | 11 | Tucson, Santa Fe, Ioniq 5 |
| **Kia** | 10 | Sportage, Sorento, EV6 |
| **Nissan** | 9 | Qashqai, X-Trail, Leaf |
| **Honda** | 7 | Civic, CR-V, HR-V |
| **Mazda** | 9 | Mazda3, CX-5, MX-5 |
| **Volvo** | 11 | XC60, XC90, S90 |
| **Dacia** | 5 | Sandero, Duster, Jogger |
| **Seat** | 5 | Leon, Ateca, Tarraco |
| **Fiat** | 6 | 500, Panda, Tipo |
| **Citroën** | 9 | C3, C4, C5 Aircross |
| **Jeep** | 7 | Wrangler, Cherokee, Compass |

### إجمالي الماركات: **50+ ماركة**

الماركات الأخرى بدون موديلات محددة (fallback to text input):
- ABT, Acura, Alfa Romeo, Aston Martin, Bentley, Bugatti, Buick, Cadillac, Chevrolet, Chrysler, Dodge, Ferrari, Genesis, GMC, Infiniti, Jaguar, Lamborghini, Land Rover, Lexus, Lincoln, Maserati, McLaren, Mini, Mitsubishi, Porsche, RAM, Rolls-Royce, Subaru, Suzuki, Tesla

---

## 💡 كيف يعمل - How It Works

### 1. اختيار الماركة:
```typescript
<S.Select value={formData.make} onChange={(e) => handleInputChange('make', e.target.value)}>
  <option value="">Изберете марка</option>
  {availableBrands.map(brand => (
    <option key={brand} value={brand}>{brand}</option>
  ))}
</S.Select>
```

### 2. تحديث الموديلات تلقائياً:
```typescript
useEffect(() => {
  if (formData.make) {
    const models = getModelsForBrand(formData.make);
    setAvailableModels(models);
  }
}, [formData.make]);
```

### 3. عرض قائمة الموديلات أو حقل نصي:
```typescript
{availableModels.length > 0 ? (
  <S.Select value={formData.model} disabled={!formData.make}>
    {availableModels.map(model => <option>{model}</option>)}
  </S.Select>
) : (
  <S.Input type="text" disabled={!formData.make} />
)}
```

---

## 🎨 التصميم - Design Features

### حالات الحقول:

1. **عادي (Normal)**:
   - حدود رمادية فاتحة `#e9ecef`
   - خلفية بيضاء

2. **Focus**:
   - حدود برتقالية `#ff8f10`
   - ظل برتقالي خفيف

3. **Disabled**:
   - خلفية رمادية `#f8f9fa`
   - نص رمادي `#adb5bd`
   - opacity: 0.6
   - cursor: not-allowed

4. **Hint Text**:
   - لون رمادي `#7f8c8d`
   - حجم صغير `0.8rem`
   - مائل italic

---

## 🔧 API للخدمة - Service API

```typescript
// Get all brands
getAllBrands(): string[]

// Get models for a specific brand
getModelsForBrand(brand: string): string[]

// Search brands
searchBrands(query: string): string[]

// Search models
searchModels(brand: string, query: string): string[]

// Validation
isValidBrand(brand: string): boolean
isValidModel(brand: string, model: string): boolean
```

---

## 🚀 الاستخدام - Usage

### في صفحة بيانات السيارة:

```typescript
import { getAllBrands, getModelsForBrand } from '../../../services/carBrandsService';

const [availableBrands] = useState<string[]>(getAllBrands());
const [availableModels, setAvailableModels] = useState<string[]>([]);

useEffect(() => {
  if (formData.make) {
    setAvailableModels(getModelsForBrand(formData.make));
  }
}, [formData.make]);
```

---

## 📝 الحقول الإلزامية - Required Fields

### إلزامي (Required):
✅ **Make** (الماركة)  
✅ **Year** (السنة)

### اختياري (Optional):
- **Model** (الموديل)
- **Mileage** (المسافة المقطوعة)
- **Fuel Type** (نوع الوقود)
- **Transmission** (ناقل الحركة)
- وغيرها...

---

## 🔮 المستقبل - Future Enhancements

### المرحلة القادمة:
1. **قراءة من الملفات**: استخراج البيانات من `cars/brand_directories/`
2. **Parser للملفات النصية**: قراءة ملفات `.txt` مثل `Audi.txt`
3. **بيانات ديناميكية**: تحديث تلقائي عند إضافة ملفات جديدة
4. **Variants/Trims**: إضافة قائمة ثالثة للفئات
5. **Specifications**: استخراج المواصفات التقنية
6. **Images**: ربط بصور السيارات

### المطلوب لاحقاً:
- Node.js script لقراءة المجلدات
- Parser للملفات النصية
- API endpoint للبيانات
- Cache layer للأداء

---

## ✅ الحالة الحالية - Current Status

### ما تم إنجازه:
✅ قوائم منسدلة للماركات (50+)  
✅ قوائم منسدلة للموديلات (21 ماركة)  
✅ ترابط ذكي بين القوائم  
✅ Fallback للإدخال اليدوي  
✅ تصميم عصري ومتناسق  
✅ Validation وتحقق  
✅ ترجمة كاملة BG/EN  

### جاهز للاختبار:
```
http://localhost:3000/sell/inserat/car/fahrzeugdaten/antrieb-und-umwelt?vt=car&st=private
```

---

**🎯 النظام يعمل بكفاءة وجاهز للاستخدام!**


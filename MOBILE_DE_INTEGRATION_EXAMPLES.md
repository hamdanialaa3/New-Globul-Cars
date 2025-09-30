# أمثلة عملية لاستخدام بيانات mobile.de في المشروع
## Mobile.de Integration Examples

---

## 📂 الملفات المُنشأة

1. **`car-brands-models-database.json`** - قاعدة بيانات JSON كاملة
2. **`car-brands-extraction-guide.md`** - دليل تفصيلي بالعربية
3. **`types/car-database.types.ts`** - TypeScript Types & Interfaces
4. **`MOBILE_DE_ANALYSIS_REPORT_AR.md`** - تقرير تحليل شامل

---

## 🚀 أمثلة الاستخدام

### 1️⃣ استيراد قاعدة البيانات

```typescript
import carDatabase from './car-brands-models-database.json';

// الحصول على جميع العلامات التجارية
const allBrands = carDatabase.carBrands;

// الحصول على علامة معينة
const mercedes = allBrands.find(brand => brand.id === 'mercedes-benz');

console.log(mercedes?.name); // "Mercedes-Benz"
console.log(mercedes?.nameAr); // "مرسيدس-بنز"
console.log(mercedes?.seriesCount); // 37
```

---

### 2️⃣ عرض قائمة العلامات التجارية

#### React Component Example

```tsx
import React from 'react';
import { CarBrand } from './types/car-database.types';
import carDatabase from './car-brands-models-database.json';

const BrandsList: React.FC = () => {
  const brands = carDatabase.carBrands;
  
  return (
    <div className="brands-grid">
      {brands.map((brand: CarBrand) => (
        <div key={brand.id} className="brand-card">
          <img src={`/assets/logos/${brand.logo}`} alt={brand.name} />
          <h3>{brand.nameAr}</h3>
          <p>{brand.seriesCount} سلسلة</p>
          <span className="country">{brand.countryAr}</span>
        </div>
      ))}
    </div>
  );
};

export default BrandsList;
```

---

### 3️⃣ فلتر العلامات حسب الفئة

```typescript
import { CarBrand, BrandCategory } from './types/car-database.types';
import carDatabase from './car-brands-models-database.json';

// الحصول على العلامات الفاخرة فقط
const luxuryBrands = carDatabase.carBrands.filter(
  (brand: CarBrand) => brand.category === 'luxury'
);

console.log('العلامات الفاخرة:', luxuryBrands.map(b => b.nameAr));
// ["مرسيدس-بنز", "بي إم دبليو", "أودي", "فولفو"]

// الحصول على العلامات الكهربائية
const electricBrands = carDatabase.carBrands.filter(
  (brand: CarBrand) => brand.category === 'electric-performance'
);

console.log('العلامات الكهربائية:', electricBrands.map(b => b.nameAr));
// ["بولستار"]
```

---

### 4️⃣ بناء Dropdown للبحث

#### React Select Component

```tsx
import React, { useState } from 'react';
import carDatabase from './car-brands-models-database.json';

const BrandSelector: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');
  
  const brands = carDatabase.carBrands;
  const currentBrand = brands.find(b => b.id === selectedBrand);
  
  return (
    <div className="brand-selector">
      {/* اختيار العلامة */}
      <select 
        value={selectedBrand}
        onChange={(e) => {
          setSelectedBrand(e.target.value);
          setSelectedSeries(''); // إعادة تعيين السلسلة
        }}
      >
        <option value="">اختر العلامة التجارية</option>
        {brands.map(brand => (
          <option key={brand.id} value={brand.id}>
            {brand.nameAr} ({brand.seriesCount} سلسلة)
          </option>
        ))}
      </select>
      
      {/* اختيار السلسلة */}
      {currentBrand && (
        <select 
          value={selectedSeries}
          onChange={(e) => setSelectedSeries(e.target.value)}
        >
          <option value="">اختر السلسلة</option>
          {currentBrand.series.map((series, index) => (
            <option key={index} value={series.name}>
              {series.nameAr} - {series.bodyTypes.join(', ')}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default BrandSelector;
```

---

### 5️⃣ نظام البحث المتقدم

```typescript
import { 
  CarListing, 
  CarSearchFilters, 
  CarFilterHelper 
} from './types/car-database.types';

// مثال على بيانات السيارات
const carListings: CarListing[] = [
  {
    id: '1',
    brand: 'Mercedes-Benz',
    brandAr: 'مرسيدس-بنز',
    series: 'C-Class',
    seriesAr: 'الفئة C',
    year: 2022,
    bodyType: 'Sedan',
    fuelType: 'diesel',
    transmission: 'automatic',
    condition: 'used',
    mileage: 25000,
    price: 45000,
    currency: 'EUR',
    // ... باقي البيانات
  },
  // ... المزيد من السيارات
];

// فلاتر البحث
const searchFilters: CarSearchFilters = {
  brand: ['Mercedes-Benz', 'BMW'],
  bodyType: ['Sedan', 'SUV'],
  fuelType: ['diesel', 'electric'],
  priceMin: 30000,
  priceMax: 60000,
  yearMin: 2020,
  mileageMax: 50000,
};

// تطبيق الفلاتر
const filteredCars = CarFilterHelper.filterCars(carListings, searchFilters);

// الترتيب حسب السعر (من الأقل للأعلى)
const sortedCars = CarFilterHelper.sortCars(filteredCars, 'price-asc');

console.log(`تم العثور على ${sortedCars.length} سيارة`);
```

---

### 6️⃣ صفحة تفاصيل العلامة التجارية

```tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import carDatabase from './car-brands-models-database.json';

const BrandDetailsPage: React.FC = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const brand = carDatabase.carBrands.find(b => b.id === brandId);
  
  if (!brand) {
    return <div>العلامة غير موجودة</div>;
  }
  
  return (
    <div className="brand-details">
      <header>
        <img src={`/assets/logos/${brand.logo}`} alt={brand.name} />
        <h1>{brand.nameAr}</h1>
        <p className="country">صنع في: {brand.countryAr}</p>
      </header>
      
      <div className="stats">
        <div className="stat-card">
          <h3>{brand.seriesCount}</h3>
          <p>سلسلة متوفرة</p>
        </div>
        <div className="stat-card">
          <h3>{brand.category === 'luxury' ? 'فاخرة' : 'عادية'}</h3>
          <p>الفئة</p>
        </div>
      </div>
      
      <section className="series-list">
        <h2>السلاسل المتوفرة</h2>
        <div className="series-grid">
          {brand.series.map((series, index) => (
            <div key={index} className="series-card">
              <h3>{series.nameAr}</h3>
              <p className="type">{series.type}</p>
              <div className="body-types">
                {series.bodyTypes.map((type, i) => (
                  <span key={i} className="badge">{type}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BrandDetailsPage;
```

---

### 7️⃣ إنشاء فورم إضافة سيارة جديدة

```tsx
import React, { useState } from 'react';
import { CarListing } from './types/car-database.types';
import carDatabase from './car-brands-models-database.json';

const AddCarForm: React.FC = () => {
  const [formData, setFormData] = useState<Partial<CarListing>>({
    brand: '',
    series: '',
    year: new Date().getFullYear(),
    bodyType: 'Sedan',
    fuelType: 'petrol',
    transmission: 'automatic',
    condition: 'used',
  });
  
  const brands = carDatabase.carBrands;
  const currentBrand = brands.find(b => b.id === formData.brand);
  const bodyTypes = carDatabase.bodyTypes;
  const fuelTypes = carDatabase.fuelTypes;
  const transmissions = carDatabase.transmission;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('بيانات السيارة:', formData);
    // إرسال البيانات إلى API
  };
  
  return (
    <form onSubmit={handleSubmit} className="add-car-form">
      <h2>إضافة سيارة جديدة</h2>
      
      {/* العلامة التجارية */}
      <div className="form-group">
        <label>العلامة التجارية *</label>
        <select 
          required
          value={formData.brand}
          onChange={(e) => setFormData({...formData, brand: e.target.value})}
        >
          <option value="">اختر العلامة</option>
          {brands.map(brand => (
            <option key={brand.id} value={brand.id}>
              {brand.nameAr}
            </option>
          ))}
        </select>
      </div>
      
      {/* السلسلة */}
      {currentBrand && (
        <div className="form-group">
          <label>السلسلة *</label>
          <select 
            required
            value={formData.series}
            onChange={(e) => setFormData({...formData, series: e.target.value})}
          >
            <option value="">اختر السلسلة</option>
            {currentBrand.series.map((series, index) => (
              <option key={index} value={series.name}>
                {series.nameAr}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* السنة */}
      <div className="form-group">
        <label>سنة الصنع *</label>
        <input 
          type="number" 
          required
          min="1950"
          max={new Date().getFullYear() + 1}
          value={formData.year}
          onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
        />
      </div>
      
      {/* نوع الهيكل */}
      <div className="form-group">
        <label>نوع الهيكل *</label>
        <select 
          required
          value={formData.bodyType}
          onChange={(e) => setFormData({...formData, bodyType: e.target.value as any})}
        >
          {bodyTypes.map(type => (
            <option key={type.id} value={type.name}>
              {type.nameAr}
            </option>
          ))}
        </select>
      </div>
      
      {/* نوع الوقود */}
      <div className="form-group">
        <label>نوع الوقود *</label>
        <select 
          required
          value={formData.fuelType}
          onChange={(e) => setFormData({...formData, fuelType: e.target.value as any})}
        >
          {fuelTypes.map(fuel => (
            <option key={fuel.id} value={fuel.id}>
              {fuel.nameAr}
            </option>
          ))}
        </select>
      </div>
      
      {/* ناقل الحركة */}
      <div className="form-group">
        <label>ناقل الحركة *</label>
        <select 
          required
          value={formData.transmission}
          onChange={(e) => setFormData({...formData, transmission: e.target.value as any})}
        >
          {transmissions.map(trans => (
            <option key={trans.id} value={trans.id}>
              {trans.nameAr}
            </option>
          ))}
        </select>
      </div>
      
      {/* المسافة المقطوعة */}
      <div className="form-group">
        <label>المسافة المقطوعة (كم) *</label>
        <input 
          type="number" 
          required
          min="0"
          placeholder="مثال: 50000"
          onChange={(e) => setFormData({...formData, mileage: parseInt(e.target.value)})}
        />
      </div>
      
      {/* السعر */}
      <div className="form-group">
        <label>السعر (يورو) *</label>
        <input 
          type="number" 
          required
          min="0"
          placeholder="مثال: 25000"
          onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
        />
      </div>
      
      <button type="submit" className="btn-primary">
        إضافة السيارة
      </button>
    </form>
  );
};

export default AddCarForm;
```

---

### 8️⃣ عرض بطاقة السيارة (Car Card)

```tsx
import React from 'react';
import { CarListing } from './types/car-database.types';

interface CarCardProps {
  car: CarListing;
  onView?: (car: CarListing) => void;
  onSave?: (car: CarListing) => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, onView, onSave }) => {
  const fuelTypeLabels = {
    petrol: 'بنزين',
    diesel: 'ديزل',
    electric: 'كهربائي',
    hybrid: 'هجين',
  };
  
  const transmissionLabels = {
    manual: 'يدوي',
    automatic: 'أوتوماتيك',
  };
  
  return (
    <div className="car-card">
      <div className="car-image">
        <img 
          src={car.thumbnailImage || car.images[0]} 
          alt={`${car.brandAr} ${car.seriesAr}`}
        />
        {car.condition === 'new' && (
          <span className="badge-new">جديدة</span>
        )}
      </div>
      
      <div className="car-details">
        <h3 className="car-title">
          {car.brandAr} {car.seriesAr}
        </h3>
        
        <div className="car-specs">
          <span className="spec">
            <i className="icon-calendar"></i>
            {car.year}
          </span>
          <span className="spec">
            <i className="icon-road"></i>
            {car.mileage.toLocaleString('ar-EG')} كم
          </span>
          <span className="spec">
            <i className="icon-fuel"></i>
            {fuelTypeLabels[car.fuelType]}
          </span>
          <span className="spec">
            <i className="icon-gear"></i>
            {transmissionLabels[car.transmission]}
          </span>
        </div>
        
        <div className="car-location">
          <i className="icon-location"></i>
          {car.location.cityAr || car.location.city}, {car.location.country}
        </div>
        
        <div className="car-footer">
          <div className="car-price">
            <span className="price-amount">
              {car.price.toLocaleString('ar-EG')} €
            </span>
            {car.negotiable && (
              <span className="negotiable">قابل للتفاوض</span>
            )}
          </div>
          
          <div className="car-actions">
            <button 
              className="btn-view"
              onClick={() => onView?.(car)}
            >
              عرض التفاصيل
            </button>
            <button 
              className="btn-save"
              onClick={() => onSave?.(car)}
            >
              <i className="icon-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
```

---

### 9️⃣ صفحة نتائج البحث

```tsx
import React, { useState, useEffect } from 'react';
import { CarListing, CarSearchFilters, CarFilterHelper } from './types/car-database.types';
import CarCard from './components/CarCard';
import SearchFilters from './components/SearchFilters';

const SearchResultsPage: React.FC = () => {
  const [allCars, setAllCars] = useState<CarListing[]>([]);
  const [filteredCars, setFilteredCars] = useState<CarListing[]>([]);
  const [filters, setFilters] = useState<CarSearchFilters>({});
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc'>('price-asc');
  
  useEffect(() => {
    // جلب السيارات من API
    fetchCars();
  }, []);
  
  useEffect(() => {
    // تطبيق الفلاتر
    let results = CarFilterHelper.filterCars(allCars, filters);
    results = CarFilterHelper.sortCars(results, sortBy);
    setFilteredCars(results);
  }, [allCars, filters, sortBy]);
  
  const fetchCars = async () => {
    // استدعاء API
    const response = await fetch('/api/cars');
    const data = await response.json();
    setAllCars(data);
  };
  
  return (
    <div className="search-page">
      <div className="search-layout">
        {/* الفلاتر الجانبية */}
        <aside className="filters-sidebar">
          <SearchFilters 
            filters={filters}
            onFiltersChange={setFilters}
          />
        </aside>
        
        {/* النتائج */}
        <main className="results-main">
          <div className="results-header">
            <h2>
              {filteredCars.length} سيارة متوفرة
            </h2>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
            >
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
              <option value="year-desc">الأحدث أولاً</option>
              <option value="year-asc">الأقدم أولاً</option>
              <option value="mileage-asc">المسافة: من الأقل للأعلى</option>
            </select>
          </div>
          
          <div className="results-grid">
            {filteredCars.map(car => (
              <CarCard 
                key={car.id} 
                car={car}
                onView={(car) => console.log('View:', car)}
                onSave={(car) => console.log('Save:', car)}
              />
            ))}
          </div>
          
          {filteredCars.length === 0 && (
            <div className="no-results">
              <p>لم يتم العثور على نتائج</p>
              <button onClick={() => setFilters({})}>
                إعادة تعيين الفلاتر
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResultsPage;
```

---

### 🔟 إحصائيات ورسوم بيانية

```tsx
import React from 'react';
import { CarListing } from './types/car-database.types';

interface StatsProps {
  cars: CarListing[];
}

const CarStatistics: React.FC<StatsProps> = ({ cars }) => {
  // إحصائيات حسب العلامة
  const brandStats = cars.reduce((acc, car) => {
    acc[car.brand] = (acc[car.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // إحصائيات حسب نوع الوقود
  const fuelStats = cars.reduce((acc, car) => {
    acc[car.fuelType] = (acc[car.fuelType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // متوسط السعر
  const avgPrice = cars.reduce((sum, car) => sum + car.price, 0) / cars.length;
  
  // متوسط المسافة
  const avgMileage = cars.reduce((sum, car) => sum + car.mileage, 0) / cars.length;
  
  return (
    <div className="statistics-dashboard">
      <h2>إحصائيات السوق</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{cars.length}</h3>
          <p>إجمالي السيارات</p>
        </div>
        
        <div className="stat-card">
          <h3>{avgPrice.toLocaleString('ar-EG', { maximumFractionDigits: 0 })} €</h3>
          <p>متوسط السعر</p>
        </div>
        
        <div className="stat-card">
          <h3>{avgMileage.toLocaleString('ar-EG', { maximumFractionDigits: 0 })} كم</h3>
          <p>متوسط المسافة</p>
        </div>
      </div>
      
      <div className="charts">
        <div className="chart-container">
          <h3>التوزيع حسب العلامة</h3>
          <div className="bar-chart">
            {Object.entries(brandStats)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([brand, count]) => (
                <div key={brand} className="bar-item">
                  <span className="bar-label">{brand}</span>
                  <div 
                    className="bar" 
                    style={{ width: `${(count / cars.length) * 100}%` }}
                  >
                    {count}
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        <div className="chart-container">
          <h3>التوزيع حسب نوع الوقود</h3>
          <div className="pie-chart">
            {Object.entries(fuelStats).map(([fuel, count]) => (
              <div key={fuel} className="pie-item">
                <span>{fuel}</span>
                <span>{((count / cars.length) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarStatistics;
```

---

## 🎨 CSS Styling Examples

```css
/* بطاقة السيارة */
.car-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  background: white;
}

.car-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.car-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.car-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-new {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #4CAF50;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.car-details {
  padding: 16px;
}

.car-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #1a1a1a;
}

.car-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.spec {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

.car-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-amount {
  font-size: 24px;
  font-weight: bold;
  color: #2196F3;
}

/* شبكة العلامات */
.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  padding: 20px;
}

.brand-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.brand-card:hover {
  border-color: #2196F3;
  transform: scale(1.05);
}

.brand-card img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 12px;
}

/* نتائج البحث */
.search-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  padding: 24px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* الفلاتر */
.filters-sidebar {
  background: white;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 24px;
}

/* RTL Support */
[dir="rtl"] .car-card {
  text-align: right;
}

[dir="rtl"] .spec {
  flex-direction: row-reverse;
}
```

---

## 🔥 نصائح مهمة

### ✅ أفضل الممارسات

1. **استخدم TypeScript** للاستفادة من Type Safety
2. **استخدم Lazy Loading** للصور لتحسين الأداء
3. **استخدم Pagination** لعرض النتائج الكثيرة
4. **استخدم Caching** لتخزين البيانات المؤقتة
5. **استخدم Debounce** في البحث لتقليل الطلبات

### ⚡ تحسين الأداء

```typescript
// مثال على Debounce للبحث
import { useDebounce } from 'use-debounce';

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
};
```

### 🌐 دعم متعدد اللغات

```typescript
// i18n.ts
const translations = {
  ar: {
    'brand': 'العلامة التجارية',
    'series': 'السلسلة',
    'year': 'السنة',
    'price': 'السعر',
  },
  en: {
    'brand': 'Brand',
    'series': 'Series',
    'year': 'Year',
    'price': 'Price',
  }
};
```

---

## 🎯 الخطوات التالية

1. ✅ دمج قاعدة البيانات في المشروع
2. ✅ إنشاء صفحات العلامات التجارية
3. ✅ بناء نظام البحث المتقدم
4. ✅ إضافة الفلاتر الديناميكية
5. ✅ تطوير API للبيانات
6. ✅ إضافة الصور والشعارات
7. ✅ اختبار الأداء والتحسين

---

**جاهز للاستخدام الفوري في مشروع Globul Cars! 🚀**

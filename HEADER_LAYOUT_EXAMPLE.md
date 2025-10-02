# تنسيق الهيدر - Header Layout Example
## النص من الجهة اليسار بعد الشعار

---

## 🎯 التنسيق المطلوب

### الشكل النهائي:

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🚗 Globul Cars    🚗 Топ марки ▼    🔍    💰    👤       ║
║  ^^^^^^^^^^^^      ^^^^^^^^^^^^^^^^                        ║
║   الشعار           الزر هنا!                              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## 📝 كود الهيدر

### في ملف Header.tsx:

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import TopBrandsMenu from './components/TopBrands/TopBrandsMenu';
import './Header.css';

interface HeaderProps {
  language: 'en' | 'bg';
}

const Header: React.FC<HeaderProps> = ({ language }) => {
  return (
    <header className="site-header">
      <div className="header-container">
        
        {/* الجانب الأيسر - Logo + Top Brands */}
        <div className="header-left">
          {/* 1. الشعار/اللوجو */}
          <Link to="/" className="logo">
            <img src="/logo.png" alt="Globul Cars" />
            <span>Globul Cars</span>
          </Link>
          
          {/* 2. زر Top Brands - مباشرة بعد الشعار */}
          <TopBrandsMenu language={language} />
        </div>
        
        {/* الجانب الأيمن - باقي القائمة */}
        <nav className="header-right">
          <Link to="/search">
            <svg>🔍</svg>
            {language === 'bg' ? 'Търсене' : 'Search'}
          </Link>
          <Link to="/sell">
            <svg>💰</svg>
            {language === 'bg' ? 'Продай' : 'Sell'}
          </Link>
          <Link to="/login">
            <svg>👤</svg>
            {language === 'bg' ? 'Вход' : 'Login'}
          </Link>
        </nav>
        
      </div>
    </header>
  );
};

export default Header;
```

---

## 🎨 CSS للتنسيق

### في Header.css:

```css
/* الهيدر الرئيسي */
.site-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* الحاوية */
.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ⬅️ الجانب الأيسر - Logo + Top Brands */
.header-left {
  display: flex;
  align-items: center;
  gap: 24px;  /* المسافة بين الشعار والزر */
}

/* الشعار */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #111827;
  font-size: 20px;
  font-weight: 700;
}

.logo img {
  width: 40px;
  height: 40px;
}

/* ➡️ الجانب الأيمن - باقي القائمة */
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-right a {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  text-decoration: none;
  color: #4b5563;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s;
}

.header-right a:hover {
  background: #f3f4f6;
  color: #111827;
}

/* Responsive - الموبايل */
@media (max-width: 768px) {
  .header-left {
    gap: 12px;
  }
  
  .logo span {
    display: none; /* إخفاء نص الشعار على الموبايل */
  }
  
  .header-right {
    gap: 8px;
  }
  
  .header-right a span {
    display: none; /* إظهار الأيقونات فقط */
  }
}
```

---

## 📱 الشكل على أحجام مختلفة

### Desktop (شاشة كبيرة > 1024px):

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  🚗 Globul Cars    🚗 Топ марки ▼    🔍 Търсене       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px):

```
┌──────────────────────────────────────────────┐
│                                              │
│  🚗 Cars    🚗 Марки ▼    🔍  💰  👤        │
│                                              │
└──────────────────────────────────────────────┘
```

### Mobile (< 768px):

```
┌─────────────────────────────┐
│                             │
│  🚗    🚗▼    🔍  💰  👤    │
│                             │
└─────────────────────────────┘
```

---

## ✨ مثال بصري كامل

```
╔═══════════════════════════════════════════════════════════════╗
║                        GLOBUL CARS                            ║
║ ───────────────────────────────────────────────────────────── ║
║                                                               ║
║  [🚗 Logo]  [🚗 Топ марки ▼]        [🔍]  [💰]  [👤]  [🇧🇬] ║
║     │              │                                          ║
║     │              └─── الزر هنا!                            ║
║     │                                                         ║
║     └──────────── الشعار                                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
       │
       │
       ▼ عند النقر على الزر
       
┌──────────────────────────┐
│  Popular Brands          │
│  ──────────────────────  │
│  🔰 Mercedes-Benz        │
│  🔵 BMW                  │
│  🟢 Audi                 │
│  🔴 Volkswagen           │
│  ...                     │
│  ──────────────────────  │
│  View All Brands →       │
└──────────────────────────┘
```

---

## 🎯 الترتيب من اليسار لليمين

```
[1. Logo]  →  [2. Top Brands]  →  [فراغ]  →  [3. Search]  →  [4. Sell]  →  [5. Login]
```

1. **Logo/شعار** (🚗 Globul Cars)
2. **Top Brands Menu** (🚗 Топ марки ▼) ← **هذا ما تريده!**
3. **فراغ مرن** (يدفع الباقي لليمين)
4. **Search** (🔍)
5. **Sell** (💰)
6. **Login/Profile** (👤)

---

## 🔧 التطبيق السريع

### خطوة واحدة فقط:

ضع هذا الكود في Header.tsx:

```tsx
<header className="site-header">
  <div className="header-container">
    
    {/* اليسار: Logo + Top Brands */}
    <div className="header-left">
      <Link to="/" className="logo">
        🚗 Globul Cars
      </Link>
      
      {/* ⬅️ الزر هنا! */}
      <TopBrandsMenu language="bg" />
    </div>
    
    {/* اليمين: باقي الروابط */}
    <nav className="header-right">
      {/* ... */}
    </nav>
    
  </div>
</header>
```

---

## 🎨 التخصيص

### تغيير المسافة بين الشعار والزر:

```css
.header-left {
  gap: 24px;  /* ← غيّر هذا الرقم */
}

/* مسافة صغيرة */
.header-left {
  gap: 12px;
}

/* مسافة كبيرة */
.header-left {
  gap: 40px;
}
```

---

### إضافة فاصل بصري:

```tsx
<div className="header-left">
  <Link to="/" className="logo">
    🚗 Globul Cars
  </Link>
  
  {/* فاصل */}
  <div className="separator"></div>
  
  <TopBrandsMenu language="bg" />
</div>
```

```css
.separator {
  width: 1px;
  height: 30px;
  background: #e5e7eb;
}
```

**النتيجة:**
```
🚗 Globul Cars  │  🚗 Топ марки ▼
```

---

## ✅ الخلاصة

### التنسيق النهائي:

```tsx
<header>
  <div className="header-left">
    {/* 1. الشعار */}
    <Link to="/">🚗 Globul Cars</Link>
    
    {/* 2. زر Top Brands - مباشرة بعد الشعار */}
    <TopBrandsMenu language="bg" />
  </div>
  
  <nav className="header-right">
    {/* باقي الروابط */}
  </nav>
</header>
```

### CSS:

```css
.header-left {
  display: flex;
  align-items: center;
  gap: 24px;  /* المسافة بين الشعار والزر */
}
```

---

**جاهز! الزر سيظهر مباشرة بعد الشعار في الجهة اليسار! 🚀**

```
🚗 Globul Cars    🚗 Топ марки ▼
               ↑
        الزر هنا بالضبط!
```







# 📋 طلب معلومات للتكامل - مشروع قطع غيار السيارات

---

## 🎯 السياق

أنا أعمل على إنشاء **مشروع متكامل لقطع غيار السيارات** يجب أن يتكامل بسلاسة مع المشروع الرئيسي (Globul Cars). أحتاج فهم عميق ودقيق للمشروع الرئيسي لضمان التكامل الصحيح.

---

## 📝 المعلومات المطلوبة بالتفصيل

### 🏗️ 1. البنية التقنية الأساسية

```
يرجى تقديم:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Framework/Technology Stack المستخدم
  (React, Next.js, Vue, Angular, Laravel, PHP, Node.js, etc.)

✓ لغة البرمجة الأساسية وإصدارها
  (JavaScript ES6+, TypeScript 4.x, PHP 8.x, etc.)

✓ نظام إدارة قاعدة البيانات
  (MySQL, PostgreSQL, MongoDB, Firebase Firestore, etc.)

✓ بنية المجلدات الرئيسية
  (مع شرح دور كل مجلد)

✓ أهم Dependencies/Packages المستخدمة
  (من package.json أو composer.json)

✓ نظام البناء
  (Webpack, Vite, Rollup, Parcel, etc.)

✓ هل يستخدم TypeScript أم JavaScript؟

✓ نظام إدارة الحالة
  (Redux, Context API, Zustand, MobX, Vuex, etc.)

✓ Server-Side Rendering؟
  (Next.js, Nuxt.js, etc.)
```

**مثال المخرج المطلوب:**
```
Framework: React 18.2 with TypeScript
Database: Firebase Firestore + MySQL for analytics
Build Tool: Webpack 5
State Management: Redux Toolkit + Context API
Key Packages: 
  - react-router-dom v6
  - firebase v9
  - styled-components v5
  - axios v1.x
```

---

### 🔐 2. نظام المصادقة والمستخدمين (الأهم جداً)

```
يرجى تقديم:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ كيف يعمل نظام تسجيل الدخول؟
  (JWT, Sessions, Firebase Auth, OAuth 2.0, Passport.js, etc.)

✓ بنية جدول/collection المستخدمين الكاملة
  (جميع الحقول مع أنواع البيانات)

✓ الأدوار المختلفة الموجودة
  (Admin, Vendor, Customer, Dealer, Moderator, etc.)

✓ كيف يتم تخزين وإدارة الصلاحيات؟
  (Role-based, Permission-based, ACL, etc.)

✓ هل يوجد تسجيل دخول اجتماعي؟
  (Google, Facebook, Apple, Twitter, GitHub, etc.)

✓ كيف يتم تخزين Session/Token؟
  (localStorage, sessionStorage, Cookies, Redis, etc.)

✓ كيف يتم التحقق من البريد الإلكتروني؟

✓ هل يوجد نظام Two-Factor Authentication؟

✓ كيف يتم التعامل مع Password Reset؟

✓ كيف يتم التحقق من صلاحية Token؟

✓ هل يوجد Refresh Token mechanism؟
```

**مع أمثلة من الكود:**
```typescript
// مثال: User Model/Interface
interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'admin' | 'vendor' | 'customer' | 'dealer';
  isVerified: boolean;
  isActive: boolean;
  permissions?: string[];
  vendorInfo?: {
    companyName: string;
    taxNumber: string;
    // ... باقي الحقول
  };
  createdAt: Date;
  lastLoginAt: Date;
}

// مثال: Authentication middleware
const authMiddleware = async (req, res, next) => {
  // الكود هنا
};

// مثال: Login function
const login = async (email, password) => {
  // الكود هنا
};
```

---

### 🗄️ 3. قاعدة البيانات بالتفصيل

```
يرجى تقديم:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ قائمة بجميع الجداول/Collections الرئيسية

✓ بنية كل جدول بالتفصيل
  (الحقول، الأنواع، القيود، Default values)

✓ العلاقات بين الجداول
  (Foreign Keys, References, One-to-Many, Many-to-Many)

✓ Indexes المستخدمة
  (لتحسين الأداء)

✓ Migration files إن وجدت

✓ كيف يتم تخزين:
  • بيانات المستخدمين
  • بيانات البائعين
  • بيانات المنتجات/السيارات
  • الطلبات والمعاملات
  • الرسائل والإشعارات
  • الصور والملفات
  • السجلات والتقارير

✓ هل يوجد Soft Delete؟

✓ كيف يتم التعامل مع Timestamps؟

✓ هل يوجد Database Seeding؟
```

**مع أمثلة من:**
```sql
-- مثال: SQL Schema
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'vendor', 'customer', 'dealer') DEFAULT 'customer',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

CREATE TABLE vendors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  tax_number VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);
```

```javascript
// مثال: Firestore Schema
// Collection: users
{
  uid: "string",
  email: "string",
  displayName: "string",
  role: "admin" | "vendor" | "customer",
  isVerified: boolean,
  vendorInfo: {
    companyName: "string",
    taxNumber: "string",
    // ...
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

---

### 🔌 4. الـ APIs والخدمات

```
يرجى تقديم:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ قائمة بجميع API endpoints الموجودة
  (مع HTTP Methods)

✓ نظام الـ Routing المستخدم
  (Express Router, React Router, etc.)

✓ كيف يتم التعامل مع:
  • Authentication في APIs (Bearer Token, API Keys, etc.)
  • Error Handling (try-catch, Error middleware, etc.)
  • Validation (Joi, Yup, express-validator, etc.)
  • Rate Limiting (express-rate-limit, etc.)
  • CORS (Cross-Origin Resource Sharing)
  • Request/Response logging

✓ هل يوجد API documentation؟
  (Swagger, Postman, etc.)

✓ هل يستخدم REST أم GraphQL؟

✓ كيف يتم التعامل مع File Uploads؟
  (Multer, Formidable, etc.)

✓ هل يوجد API Versioning؟
  (/api/v1/, /api/v2/)

✓ كيف يتم التعامل مع Pagination؟

✓ كيف يتم التعامل مع Filtering & Sorting؟
```

**مع أمثلة من:**
```javascript
// مثال: API Endpoints
// Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/verify-email/:token

// Users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/users/me

// Vendors
GET    /api/vendors
POST   /api/vendors
GET    /api/vendors/:id
PUT    /api/vendors/:id
DELETE /api/vendors/:id
GET    /api/vendors/:id/products
POST   /api/vendors/:id/approve
POST   /api/vendors/:id/reject

// Products/Cars
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
GET    /api/products/search

// مثال: API Response Format
{
  "success": true,
  "data": {
    // البيانات هنا
  },
  "message": "Success message",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// مثال: Error Response
{
  "success": false,
  "error": {
    "code": "AUTH_FAILED",
    "message": "Invalid credentials",
    "details": {}
  }
}

// مثال: Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// مثال: Validation middleware
const validateProduct = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().positive().required(),
    // ...
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
```

---

### 💼 5. نظام البائعين الحالي (مهم جداً)

```
يرجى تقديم:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ كيف يسجل البائع الجديد؟
  (خطوات التسجيل بالتفصيل)

✓ ما هي المعلومات المطلوبة من البائع؟
  (حقول النموذج)

✓ كيف يتم التحقق من البائع؟
  (التحقق من الوثائق، الهوية، etc.)

✓ هل يوجد نظام موافقات/مراجعة؟
  (Admin approval, Auto-approval, etc.)

✓ كيف يدير البائع منتجاته؟
  (إضافة، تعديل، حذف، تفعيل/إلغاء تفعيل)

✓ هل يوجد لوحة تحكم خاصة بالبائعين؟
  (Vendor Dashboard)

✓ كيف يتم حساب العمولات؟
  (نسبة ثابتة، متغيرة، حسب الفئة، etc.)

✓ كيف يتم التعامل مع المدفوعات للبائعين؟
  (Payout system)

✓ ما هي الإحصائيات المتاحة للبائع؟
  (المبيعات، الزيارات، التقييمات، etc.)

✓ هل يوجد نظام تقييم للبائعين؟
  (Ratings & Reviews)

✓ كيف يتم التواصل بين البائع والعميل؟
  (Chat, Messages, Email, Phone, etc.)

✓ هل يوجد نظام اشتراكات للبائعين؟
  (Free, Basic, Premium, etc.)

✓ ما هي القيود على البائعين؟
  (عدد المنتجات، الصور، etc.)
```

**مع أمثلة من:**
```javascript
// مثال: Vendor Registration Form
const vendorRegistrationFields = {
  // معلومات الشركة
  companyName: "string (required)",
  taxNumber: "string (required, unique)",
  businessType: "individual | company",
  
  // معلومات الاتصال
  phone: "string (required)",
  email: "string (required)",
  website: "string (optional)",
  
  // العنوان
  address: "string (required)",
  city: "string (required)",
  region: "string (required)",
  postalCode: "string (required)",
  
  // الوثائق
  businessLicense: "file (required)",
  taxCertificate: "file (required)",
  idDocument: "file (required)",
  
  // معلومات البنك
  bankName: "string (required)",
  accountNumber: "string (required)",
  iban: "string (required)",
  
  // الموافقة على الشروط
  termsAccepted: "boolean (required)"
};

// مثال: Vendor Dashboard Stats
const vendorStats = {
  totalProducts: 150,
  activeProducts: 120,
  soldProducts: 450,
  totalRevenue: 125000,
  pendingOrders: 5,
  completedOrders: 445,
  averageRating: 4.7,
  totalReviews: 230,
  profileViews: 5420,
  productViews: 12350
};

// مثال: Commission Calculation
const calculateCommission = (saleAmount, vendorTier) => {
  const rates = {
    free: 0.15,      // 15%
    basic: 0.12,     // 12%
    premium: 0.08,   // 8%
    enterprise: 0.05 // 5%
  };
  
  return saleAmount * rates[vendorTier];
};
```

---

### 🎨 6. الواجهات والتصميم

```
يرجى تقديم:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ مكتبة UI المستخدمة
  (Bootstrap, Tailwind CSS, Material-UI, Ant Design, Chakra UI, etc.)

✓ نظام الألوان (Color Palette)
  (Primary, Secondary, Success, Error, Warning, etc.)

✓ الخطوط المستخدمة
  (Font families, sizes, weights)

✓ كيف تبدو بنية Components؟
  (Atomic Design, Feature-based, etc.)

✓ هل يوجد Design System؟
  (Storybook, Style guide, etc.)

✓ كيف يتم التعامل مع Responsive Design؟
  (Mobile-first, Desktop-first, Breakpoints)

✓ هل يوجد Dark/Light mode؟

✓ كيف يتم إدارة الـ Themes؟

✓ ما هي مكتبة الأيقونات المستخدمة؟
  (Font Awesome, Material Icons, Heroicons, etc.)

✓ كيف يتم التعامل مع Animations؟
  (CSS, Framer Motion, React Spring, etc.)
```

**مع أمثلة من:**
```javascript
// مثال: Theme Configuration
const theme = {
  colors: {
    primary: {
      main: '#FF7900',
      light: '#ff8c1a',
      dark: '#e66d00',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff'
    },
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
    text: {
      primary: '#212121',
      secondary: '#757575'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h1: { fontSize: '2.5rem', fontWeight: 500 },
    h2: { fontSize: '2rem', fontWeight: 500 },
    // ...
  },
  spacing: 8, // base spacing unit
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920
  }
};

// مثال: Component Structure
src/
  components/
    common/          // مكونات مشتركة
      Button/
      Input/
      Card/
    layout/          // مكونات التخطيط
      Header/
      Footer/
      Sidebar/
    features/        // مكونات خاصة بالميزات
      VendorDashboard/
      ProductList/
      UserProfile/
```

---

### 🌍 7. نظام اللغات والترجمة

```
يرجى تقديم:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ اللغات المدعومة حالياً
  (Bulgarian, English, Arabic, etc.)

✓ مكتبة i18n المستخدمة
  (react-i18next, i18next, vue-i18n, etc.)

✓ كيف يتم تخزين الترجمات؟
  (JSON files, Database, CMS, etc.)

✓ كيف يتم تبديل اللغة؟
  (Language switcher)

✓ هل يوجد RTL support؟
  (للغة العربية)

✓ كيف يتم ترجمة المحتوى الديناميكي؟
  (من قاعدة البيانات)

✓ كيف يتم التعامل مع التواريخ والأرقام؟
  (Localization)

✓ هل يوجد نظام للترجمات المفقودة؟
  (Fallback language)
```

**مع أمثلة من:**
```javascript
// مثال: Translation Files Structure
locales/
  bg/
    common.json
    auth.json
    products.json
    vendors.json
  en/
    common.json
    auth.json
    products.json
    vendors.json

// مثال: Translation File Content (bg/auth.json)
{
  "login": {
    "title": "Вход",
    "email": "Имейл",
    "password": "Парола",
    "submit": "Влез",
    "forgotPassword": "Забравена парола?",
    "noAccount": "Нямате акаунт?",
    "register": "Регистрирайте се"
  },
  "register": {
    "title": "Регистрация",
    // ...
  }
}

// مثال: i18n Configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      bg: { translation: bgTranslations },
      en: { translation: enTranslations }
    },
    lng: 'bg', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// مثال: Usage in Component
import { useTranslation } from 'react-i18next';

const LoginForm = () => {
  const { t, i18n } = useTranslation();
  
  return (
    <form>
      <h1>{t('login.title')}</h1>
      <input placeholder={t('login.email')} />
      <button>{t('login.submit')}</button>
    </form>
  );
};
```

---

### ⚙️ 8. الإعدادات والتكوين

```
يرجى تقديم:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ محتوى ملف .env.example
  (جميع المتغيرات البيئية المطلوبة)

✓ ملفات Configuration الرئيسية
  (config.js, constants.js, etc.)

✓ كيف يتم الـ Build للإنتاج؟
  (npm run build, webpack config, etc.)

✓ كيف يتم الـ Deploy؟
  (Vercel, Netlify, AWS, Firebase Hosting, etc.)

✓ ما هي البيئات المختلفة؟
  (development, staging, production)

✓ أدوات التطوير المستخدمة
  (ESLint, Prettier, Husky, etc.)

✓ كيف يتم إدارة الـ Environment Variables؟

✓ هل يوجد Docker configuration؟

✓ كيف يتم التعامل مع الـ Secrets؟
```

**مع أمثلة من:**
```bash
# مثال: .env.example
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Firebase Configuration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Database Configuration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DB_HOST=localhost
DB_PORT=3306
DB_NAME=globul_cars
DB_USER=root
DB_PASSWORD=your_password

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# API Configuration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API_URL=http://localhost:3000/api
API_VERSION=v1

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Authentication
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRATION=30d

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Email Configuration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@globulcars.bg

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Payment Gateway
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Other Services
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GOOGLE_MAPS_API_KEY=your_google_maps_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# App Configuration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
```

```javascript
// مثال: config.js
module.exports = {
  app: {
    name: 'Globul Cars',
    version: '1.0.0',
    url: process.env.APP_URL,
    port: process.env.PORT || 3000
  },
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION
  },
  // ...
};
```

---

### 💳 9. نظام المدفوعات (إن وجد)

```
يرجى تقديم:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ بوابات الدفع المستخدمة
  (Stripe, PayPal, Braintree, etc.)

✓ كيف يتم معالجة المدفوعات؟
  (Payment flow)

✓ نظام العمولات
  (كيف يتم حسابها وتوزيعها)

✓ كيف يتم تتبع المعاملات؟
  (Transaction history)

✓ كيف يتم التعامل مع Refunds؟

✓ هل يوجد نظام Wallet/Credits؟

✓ كيف يتم التعامل مع الفواتير؟
  (Invoicing)

✓ هل يوجد نظام اشتراكات؟
  (Subscription plans)

✓ كيف يتم التعامل مع الضرائب؟
  (VAT, Tax calculation)
```

**مع أمثلة من الكود**

---

### 📱 10. نظام الإشعارات والرسائل

```
يرجى تقديم:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ كيف يتم إرسال الإشعارات؟
  (In-app, Push, Email, SMS)

✓ هل يوجد نظام رسائل داخلي؟
  (Chat/Messaging system)

✓ كيف يتم إرسال الإيميلات؟
  (SMTP, SendGrid, Mailgun, etc.)

✓ هل يوجد Push Notifications؟
  (Firebase Cloud Messaging, OneSignal, etc.)

✓ كيف يتم تخزين الرسائل؟
  (Database structure)

✓ هل يوجد Real-time messaging؟
  (WebSockets, Socket.io, Firebase Realtime, etc.)

✓ كيف يتم التعامل مع Notification preferences؟
  (User settings)
```

**مع أمثلة من الكود**

---

### 🔗 11. نظام الروابط والتنقل

```
يرجى تقديم:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ بنية URLs الحالية
  (Route structure)

✓ كيف يتم الـ Routing؟
  (React Router, Next.js Router, Vue Router, etc.)

✓ هل يوجد نظام Subdomain للبائعين؟
  (vendor.globulcars.bg)

✓ كيف يتم التنقل بين الأقسام؟
  (Navigation structure)

✓ هل يوجد Breadcrumbs؟

✓ كيف يتم التعامل مع Deep Linking؟

✓ هل يوجد نظام Redirects؟
```

**مع أمثلة من:**
```javascript
// مثال: Routes Structure
const routes = {
  // Public routes
  home: '/',
  cars: '/cars',
  carDetails: '/cars/:id',
  search: '/search',
  
  // Auth routes
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  
  // User routes
  profile: '/profile',
  myListings: '/my-listings',
  favorites: '/favorites',
  messages: '/messages',
  
  // Vendor routes
  vendorDashboard: '/vendor/dashboard',
  vendorProducts: '/vendor/products',
  vendorOrders: '/vendor/orders',
  vendorStats: '/vendor/statistics',
  vendorSettings: '/vendor/settings',
  
  // Admin routes
  adminDashboard: '/admin/dashboard',
  adminUsers: '/admin/users',
  adminVendors: '/admin/vendors',
  adminProducts: '/admin/products',
  
  // Static pages
  about: '/about',
  contact: '/contact',
  terms: '/terms',
  privacy: '/privacy'
};

// مثال: Navigation Component
const Navigation = () => {
  return (
    <nav>
      <Link to="/">الرئيسية</Link>
      <Link to="/cars">السيارات</Link>
      <Link to="/spare-parts">قطع الغيار</Link> {/* الرابط للمشروع الجديد */}
      <Link to="/about">عن الموقع</Link>
      <Link to="/contact">اتصل بنا</Link>
    </nav>
  );
};
```

---

### 📊 12. أمثلة عملية من الكود

```
يرجى تقديم أمثلة كاملة وعملية من:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. User Model/Schema/Interface (كامل)
2. Authentication middleware (كامل)
3. API endpoint (كامل مع كل التفاصيل)
4. Database query example (مع شرح)
5. Frontend component (كامل مع styling)
6. Form validation (مع error handling)
7. Error handling (global error handler)
8. State management (Redux slice أو Context)
9. File upload (كامل)
10. Search/Filter implementation
```

**مثال المخرج المطلوب:**
```javascript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. User Model (Complete)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  displayName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'vendor', 'customer'],
    default: 'customer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  vendorInfo: {
    companyName: String,
    taxNumber: String,
    // ...
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. Authentication Middleware (Complete)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is disabled'
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. Complete API Endpoint Example
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Product = require('../models/Product');

// Get all products with filters and pagination
router.get('/products', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      search,
      category,
      minPrice,
      maxPrice,
      vendorId
    } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (vendorId) {
      query.vendorId = vendorId;
    }
    
    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('vendorId', 'displayName companyName')
      .exec();
    
    // Get total count
    const count = await Product.countDocuments(query);
    
    res.json({
      success: true,
      data: products,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new product (vendor only)
router.post('/products', 
  authenticate, 
  authorize('vendor', 'admin'),
  async (req, res) => {
    try {
      const product = new Product({
        ...req.body,
        vendorId: req.user._id
      });
      
      await product.save();
      
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully'
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

module.exports = router;
```

---

### 🔍 13. معلومات إضافية مهمة

```
يرجى تقديم أيضاً:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ هل يوجد نظام Caching؟
  (Redis, Memcached, etc.)

✓ كيف يتم التعامل مع File Storage؟
  (Local, AWS S3, Cloudinary, Firebase Storage, etc.)

✓ هل يوجد نظام Logging؟
  (Winston, Morgan, etc.)

✓ كيف يتم التعامل مع Background Jobs؟
  (Bull, Agenda, etc.)

✓ هل يوجد نظام Search Engine؟
  (Elasticsearch, Algolia, etc.)

✓ كيف يتم التعامل مع Analytics؟
  (Google Analytics, Mixpanel, etc.)

✓ هل يوجد نظام Reviews/Ratings؟

✓ كيف يتم التعامل مع SEO؟
  (Meta tags, Sitemap, etc.)

✓ هل يوجد Admin Panel؟
  (بنيته وميزاته)

✓ كيف يتم التعامل مع Backups؟
```

---

## 🎯 الهدف النهائي من هذه المعلومات

### ✅ ما سأقوم به بعد الحصول على المعلومات:

1. **تحليل شامل للمشروع الرئيسي**
   - فهم البنية التقنية بالكامل
   - تحديد نقاط التكامل
   - فهم Business Logic

2. **تصميم مشروع قطع الغيار المتكامل**
   - استخدام نفس التقنيات
   - مشاركة نظام المستخدمين والبائعين
   - تصميم Database Schema متوافق
   - تصميم APIs متوافقة

3. **ضمان التكامل السلس**
   - نفس نظام المصادقة
   - نفس التصميم والـ UX
   - مشاركة المكونات المشتركة
   - توحيد الـ Error Handling

4. **التخطيط للربط بين المشروعين**
   - نظام Navigation موحد
   - مشاركة Session/Token
   - Unified Dashboard للبائعين
   - Single Sign-On (SSO)

---

## 📌 ملاحظات مهمة جداً

### 🔴 **أولويات المعلومات:**

**الأهم (Must Have):**
1. نظام المصادقة والمستخدمين
2. بنية قاعدة البيانات
3. نظام البائعين
4. API Structure
5. Technology Stack

**مهم (Should Have):**
6. الواجهات والتصميم
7. نظام اللغات
8. الإعدادات والتكوين
9. نظام المدفوعات

**إضافي (Nice to Have):**
10. الإشعارات والرسائل
11. الروابط والتنقل
12. معلومات إضافية

---

## 🚀 الخطة بعد الحصول على المعلومات

### **المرحلة 1: التحليل (يوم واحد)**
- تحليل جميع المعلومات المقدمة
- فهم البنية والـ Architecture
- تحديد نقاط التكامل
- رسم خريطة للنظام

### **المرحلة 2: التخطيط (يوم واحد)**
- تصميم Database Schema
- تصميم API Structure
- تخطيط الـ UI/UX
- وضع خطة التطوير المفصلة

### **المرحلة 3: التطوير (أسبوع واحد)**
- إنشاء المشروع الأساسي
- تطبيق نظام المصادقة المشترك
- بناء الـ APIs
- تطوير الواجهات

### **المرحلة 4: التكامل (يومان)**
- ربط المشروعين
- اختبار التكامل
- إصلاح المشاكل
- التوثيق

---

## ✅ التسليمات المتوقعة

بعد الحصول على المعلومات، سأقدم:

1. **تقرير تحليل شامل** للمشروع الرئيسي
2. **خطة تكامل مفصلة** مع جداول زمنية
3. **تصميم Database Schema** كامل
4. **تصميم API Documentation** كامل
5. **Wireframes/Mockups** للواجهات
6. **خطة تطوير مرحلية** مع Milestones

---

## 🙏 الخلاصة

**كلما كانت المعلومات أكثر تفصيلاً ودقة، كلما كان:**
- ✅ التكامل أسرع وأسهل
- ✅ النتيجة أفضل وأكثر احترافية
- ✅ المشاكل أقل
- ✅ الوقت والجهد أقل

**يرجى تقديم أكبر قدر ممكن من هذه المعلومات مع:**
- ✅ أمثلة من الكود الفعلي
- ✅ Screenshots إن أمكن
- ✅ Documentation إن وجد
- ✅ أي معلومات إضافية تراها مفيدة

---

## 📞 جاهز للبدء!

**بمجرد حصولي على هذه المعلومات، سأبدأ فوراً في:**
1. التحليل الشامل
2. وضع الخطة المفصلة
3. البدء في التطوير

**شكراً لتعاونك!** 🙏

---

© 2025 Globul Cars Integration Project

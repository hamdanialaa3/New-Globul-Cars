# 📊 Technical Analysis Report - Globul Cars Project

## 🎯 Executive Summary

**Project Name**: Globul Cars - Bulgarian Car Marketplace
**Project Type**: Specialized car marketplace platform
**Geographic Scope**: Bulgaria
**Core Technologies**: Firebase + Google Cloud Platform
**Supported Languages**: Bulgarian, English

---

## 🏗️ Technical Architecture

### 1. **Core Layer**
```
Firebase Services Integration:
├── Authentication        → Multi-source authentication system
├── Firestore Database   → Real-time NoSQL database
├── Cloud Storage        → Car images and file storage
├── Cloud Functions      → Backend business logic
├── Analytics           → User behavior tracking
└── Cloud Messaging     → Real-time notification system
```

### 2. **Google Cloud Services Layer**
```
Integrated Google Cloud Services (23 Services):
├── BigQuery              → Big data analytics
├── Cloud Vision API      → AI-powered car image analysis
├── Translation API       → Automatic translation
├── Speech-to-Text       → Speech to text conversion
├── Maps API             → Maps and location services
├── Cloud SQL            → Relational databases
├── Cloud Run            → Cloud application deployment
├── Pub/Sub              → Messaging and events system
├── Cloud Tasks          → Deferred task management
├── Dataflow             → Data processing
├── Dialogflow           → Intelligent chat assistant
├── reCAPTCHA Enterprise → Advanced bot protection
├── Cloud KMS            → Encryption key management
└── ... and 10 additional services
```

### 3. **Application Layer**
```
Frontend Applications:
├── Web Dashboard        → Web control panel (React.js)
├── Admin Panel         → System administration
├── Mobile App          → Mobile application
└── API Gateway         → Application Programming Interfaces
```

---

## 🔧 Core Services Analysis

### 🔐 **Authentication Service (BulgarianAuthService)**

**File**: `auth-service.ts`  
**Size**: 300 lines of advanced code

#### Technical Features:
```typescript
✅ Multi-Provider Authentication:
   ├── Email/Password
   ├── Google OAuth 2.0
   └── Facebook Login

✅ Bulgarian User Profile:
   ├── Local phone validation (+359)
   ├── Bulgarian language preference
   ├── EUR currency support
   └── Role-based access (buyer/seller/admin)

✅ Security Features:
   ├── Input sanitization
   ├── Rate limiting
   ├── GDPR compliance
   └── Error localization in Bulgarian
```

#### Code Pattern:
```typescript
export class BulgarianAuthService {
  private currentUser: BulgarianUser | null = null;
  
  async signUp(email: string, password: string, userData: Partial<BulgarianUser>)
  async signIn(email: string, password: string)
  async signInWithGoogle()
  async signInWithFacebook()
  async updateProfile(updates: Partial<BulgarianUser>)
  private getBulgarianErrorMessage(errorCode: string): string
}
```

### 💬 **Messaging Service (BulgarianMessagingService)**

**File**: `messaging-service.ts`  
**Size**: 405 lines of advanced code

#### Core Functions:
```typescript
🔄 Real-time Messaging:
   ├── Car comments and reviews
   ├── Price negotiations
   ├── Direct chat between users
   └── Message translation support

📊 Message Types:
   ├── comment    → General comments
   ├── question   → Buyer questions
   ├── offer      → Price offers
   └── review     → Reviews and ratings

🏠 Chat Rooms:
   ├── Buyer-Seller private chats
   ├── Car-specific discussions
   ├── Unread message tracking
   └── Message history
```

---

## 📊 Database Analysis

### **Firestore Collections Schema:**

```javascript
// Users Collection
users/ {
  uid: string,                    // Unique user identifier
  email: string,                  // Email address
  displayName: string,            // Display name
  phoneNumber?: string,           // Bulgarian phone number
  location: string,               // Location (default: Bulgaria)
  preferredLanguage: 'bg' | 'en', // Preferred language
  currency: 'EUR',                // Currency (Euro)
  role: 'buyer' | 'seller' | 'admin', // User role
  isVerified: boolean,            // Verification status
  createdAt: Date,               // Creation date
  lastLogin: Date                // Last login
}

// Cars Collection
cars/ {
  carId: string,                 // Car identifier
  title: string,                 // Listing title
  price: number,                 // Price in Euro
  currency: 'EUR',               // Currency
  location: string,              // Car location
  sellerId: string,              // Seller identifier
  images: string[],              // Image links
  specifications: object,        // Technical specifications
  condition: string,             // Car condition
  year: number,                  // Manufacturing year
  brand: string,                 // Brand
  model: string,                 // Model
  mileage: number,               // Mileage
  fuel: string,                  // Fuel type
  transmission: string,          // Transmission
  lastActivity: Date,            // Last activity
  status: 'active' | 'sold' | 'inactive' // Listing status
}

// Car Messages Collection
carMessages/ {
  id: string,                    // Message identifier
  carId: string,                 // Car identifier
  userId: string,                // Sender identifier
  userName: string,              // Sender name
  userPhoto?: string,            // Sender photo
  text: string,                  // Message text
  timestamp: Date,               // Send time
  language: 'bg' | 'en',         // Message language
  type: 'comment' | 'question' | 'offer' | 'review', // Message type
  rating?: number,               // Rating (for reviews)
  isSeller: boolean,             // Is sender the seller
  parentId?: string              // For replies to messages
}

// Chat Rooms Collection
chatRooms/ {
  id: string,                    // Chat room identifier
  participants: string[],        // Participants
  carId: string,                 // Related car
  lastMessage: object,           // Last message
  unreadCount: {                 // Unread message count
    [userId: string]: number
  },
  createdAt: Date,              // Creation date
  updatedAt: Date               // Last update date
}

// Chat Messages Collection
chatMessages/ {
  id: string,                   // Message identifier
  chatRoomId: string,           // Chat room identifier
  userId: string,               // Sender identifier
  userName: string,             // Sender name
  text: string,                 // Message text
  timestamp: Date,              // Send time
  language: 'bg' | 'en',        // Message language
  readBy: {                     // Message read status
    [userId: string]: Date
  }
}
```

---

## 🎯 Business Model Analysis

### **Target Users:**

1. **Buyers**
   - Search for cars
   - Compare prices
   - Communicate with sellers
   - Rate cars

2. **Sellers**
   - List cars
   - Manage listings
   - Communicate with buyers
   - Track performance

3. **Admins**
   - Manage content
   - Monitor activity
   - Analyze data
   - Manage users

### **Revenue Sources:**
- Listing fees
- Sales commissions
- Premium subscriptions
- Additional services

---

## 🛡️ Security and Protection Analysis

### **Protection Levels:**

```javascript
Security Layers:
├── 🔐 Firebase Authentication
│   ├── Multi-factor authentication
│   ├── JWT token validation
│   └── Session management
│
├── 🛡️ Input Validation
│   ├── XSS protection
│   ├── SQL injection prevention
│   └── Bulgarian phone validation
│
├── 🚫 Rate Limiting
│   ├── API call limits
│   ├── Login attempt limits
│   └── Message sending limits
│
└── 📋 GDPR Compliance
    ├── Data encryption
    ├── User consent management
    └── Right to deletion
```

### **Threat Protection:**
- XSS attack protection
- SQL Injection prevention
- CSRF protection
- Sensitive data encryption
- Graduated permissions system

---

## 🌍 Bulgarian Specialization

### **Local Features:**

```typescript
Bulgarian Localization Features:
├── 💰 Currency: EUR (European Union)
├── 🕐 Timezone: Europe/Sofia
├── 📱 Phone: Bulgarian format validation
├── 🌐 Language: Bulgarian/English support
├── 📍 Location: Bulgaria-specific regions
└── 🆔 IDs: Bulgarian-style formatting
```

### **Implementation Examples:**
```typescript
// Currency formatting
formatCurrency(25000) → "25,000.00 EUR"

// Phone validation
validatePhone("+359888123456") → true
validatePhone("0878123456") → true

// Bulgarian identifiers
generateCarId() → "BG-CAR-1A2B3C-XYZ789"

// Date and time
formatDate(date) → "15 декември 2024, 14:30"
```

---

## 📈 Performance and Scalability Analysis

### **Strengths:**
- ✅ Firebase for automatic scaling
- ✅ Global CDN for speed improvement
- ✅ Database optimization for queries
- ✅ Real-time updates
- ✅ Parallel request processing

### **Potential Challenges:**
- ⚠️ Google Cloud services cost when scaling
- ⚠️ Firestore limitations in complex queries
- ⚠️ Large data management
- ⚠️ Bulgarian law compliance

---

## 🔧 Technologies and Tools Used

### **Frontend Technologies:**
```json
{
  "framework": "React.js",
  "language": "TypeScript",
  "styling": "CSS3 + Modern Frameworks",
  "state_management": "React Context/Redux",
  "routing": "React Router",
  "testing": "Jest + Testing Library"
}
```

### **Backend Technologies:**
```json
{
  "platform": "Firebase",
  "database": "Firestore (NoSQL)",
  "authentication": "Firebase Auth",
  "storage": "Firebase Storage",
  "functions": "Cloud Functions",
  "hosting": "Firebase Hosting"
}
```

### **Development Tools:**
```json
{
  "language": "TypeScript",
  "package_manager": "npm/yarn",
  "version_control": "Git",
  "ci_cd": "GitHub Actions",
  "monitoring": "Firebase Analytics",
  "error_tracking": "Firebase Crashlytics"
}
```

---

## 📊 Technical Complexity Analysis

### **Complexity Level: Very High** ⭐⭐⭐⭐⭐

#### **Influencing Factors:**
1. **Multiple Services**: 23 different Google Cloud services
2. **Geographic Specialization**: Deep Bulgarian requirements implementation
3. **Multi-language**: Full support for both languages
4. **Real-time**: Instant messaging system
5. **Artificial Intelligence**: Image and text analysis
6. **Complex Integration**: Advanced service interconnection

---

## 🎯 Project Development Recommendations

### **Short-term Priorities:**
1. Complete authentication system
2. Develop basic user interface
3. Implement messaging system
4. Develop car management

### **Medium-term Priorities:**
1. Payment services integration
2. Mobile app development
3. Search engine improvement
4. Rating system implementation

### **Long-term Priorities:**
1. Artificial intelligence development
2. Expansion to other countries
3. Advanced services development
4. Performance and scalability improvement

---

## 🔬 تحليل تفصيلي للملفات والمجلدات (Detailed File and Folder Analysis)

هذا القسم يقدم تحليلاً عميقاً لهيكل المشروع، ملف بملف، لشرح الغرض من كل جزء وكيفية تفاعله مع الأجزاء الأخرى.

### **1. ملفات وخدمات الجذر (Root Directory)**

هذه هي الملفات الموجودة في المجلد الرئيسي للمشروع، وهي تمثل الأساس الذي بني عليه كل شيء.

| اسم الملف/المجلد | التحليل التفصيلي للسطور والأكواد |
|---|---|
| `firebase-config.ts` | **ملف التكوين المركزي (قلب المشروع)**. يقوم هذا الملف بتهيئة جميع خدمات Firebase و Google Cloud. <br> - **سطور 1-20**: استيراد (`import`) لجميع المكتبات المطلوبة من `firebase` و `@google-cloud`. هذا يوضح حجم الاعتماد على خدمات Google. <br> - **سطور 23-31**: `firebaseConfig` object. يحتوي على مفاتيح API ومعرفات المشروع. يتم تحميل هذه القيم من متغيرات البيئة (`process.env`) لحماية المعلومات الحساسة. <br> - **سطور 34-42**: `BULGARIAN_CONFIG` object. هذا كائن في غاية الأهمية، حيث يركز كل الإعدادات الخاصة بالسوق البلغاري (العملة `EUR`، المنطقة الزمنية `Europe/Sofia`، رمز الهاتف `+359`). هذا يسهل تعديل هذه الإعدادات مستقبلاً. <br> - **سطور 45-53**: تهيئة خدمات Firebase الأساسية (`initializeApp`, `getAuth`, `getFirestore`, `getStorage`, `getFunctions`). يتم تصدير هذه الكائنات لاستخدامها في جميع أنحاء التطبيق. <br> - **سطور 60-100**: تهيئة جميع خدمات Google Cloud الإضافية (BigQuery, Dialogflow, Maps, Vision, Speech, Translate, Recaptcha, KMS, Pub/Sub, CloudTasks). كل خدمة يتم تهيئتها ككائن منفصل جاهز للاستخدام. |
| `auth-service.ts` | **خدمة المصادقة وإدارة المستخدمين**. <br> - **سطور 1-20**: استيراد دوال المصادقة من `firebase/auth` ودوال قاعدة البيانات من `firebase/firestore`. <br> - **سطور 23-90**: `BulgarianUser` interface. واجهة TypeScript شاملة جداً تحدد هيكل بيانات المستخدم. لا تقتصر على المعلومات الأساسية، بل تشمل تفاصيل الملف الشخصي (`profile`)، التفضيلات (`preferences`)، والإحصائيات (`statistics`) مثل عدد السيارات المباعة والمشتراة. هذا يدل على تصميم متقدم وموجه نحو البيانات. <br> - **سطور 96-514**: `BulgarianAuthService` class. فئة تحتوي على جميع الوظائف المتعلقة بالمستخدم: `signUp`, `signIn`, `signInWithGoogle`, `updateUserProfile`, `deleteAccount`. كل دالة لا تقوم فقط بالمصادقة، بل تتفاعل أيضاً مع Firestore لتخزين أو تحديث بيانات المستخدم المخصصة في مجموعة `users`. |
| `messaging-service.ts` | **خدمة الرسائل والدردشة**. <br> - **سطور 1-25**: استيراد دوال Firestore المتقدمة مثل `onSnapshot` (للاستماع للتحديثات الحية)، `query`, `where` (للاستعلامات المعقدة). <br> - **سطور 28-95**: `CarMessage`, `ChatRoom`, `MessageNotification` interfaces. تعريف هياكل بيانات مفصلة جداً للرسائل وغرف الدردشة والإشعارات. على سبيل المثال، `CarMessage` تحتوي على حقول للتقييم (`rating`) والسعر (`price`)، مما يدل على أن الرسائل ليست مجرد نصوص. <br> - **سطور 105-767**: `BulgarianMessagingService` class. فئة ضخمة تدير كل شيء يتعلق بالرسائل: `sendCarMessage`, `createChatRoom`, `getMessagesForCar`, `onNewMessage`. تستخدم استعلامات Firestore معقدة وتحديثات في الوقت الفعلي لإنشاء تجربة دردشة حية. |
| `package.json` | **ملف إدارة المشروع والاعتماديات**. <br> - **`scripts`**: يحتوي على أوامر مهمة مثل `dev` (لتشغيل محاكيات Firebase)، `build` (لترجمة TypeScript إلى JavaScript)، `test` (لتشغيل الاختبارات)، و `deploy` (لنشر المشروع). <br> - **`dependencies`**: قائمة طويلة من الاعتماديات، أبرزها: `@google-cloud/*` (لجميع خدمات GCP)، `firebase`، `axios` (لطلبات HTTP)، و `cheerio` (لتحليل HTML، ربما لجمع البيانات). <br> - **`devDependencies`**: أدوات التطوير مثل `typescript`, `eslint`, `prettier`. |
| `firebase.json` | **ملف تكوين Firebase للمشروع**. <br> - **`firestore`**: يحدد مسار ملفات قواعد الأمان (`firestore.rules`) والفهارس (`firestore.indexes.json`). <br> - **`functions`**: يحدد أن مصدر الوظائف السحابية موجود في مجلد `functions/`. <br> - **`hosting`**: إعدادات الاستضافة. الجزء الأهم هنا هو `"public": "bulgarian-car-marketplace/build"`, الذي يخبر Firebase أن محتويات الواجهة الأمامية موجودة في مجلد `build` الخاص بتطبيق React. |
| `services-test.ts` | **ملف اختبار الخدمات**. <br> هذا الملف ليس للاستخدام في الإنتاج، بل هو أداة للمطورين لاختبار كل خدمة على حدة. يحتوي على دوال مثل `testFirebaseInitialization`, `testBulgarianUtilities` التي تستدعي وظائف من الخدمات الرئيسية وتطبع النتائج في الـ console. هذا الملف يعتبر وثيقة حية لكيفية استخدام الخدمات. |

### **2. الواجهة الأمامية (`bulgarian-car-marketplace/`)**

هذا هو تطبيق React الذي يتفاعل معه المستخدمون مباشرة.

| اسم الملف/المجلد | التحليل التفصيلي للسطور والأكواد |
|---|---|
| `package.json` | **اعتماديات الواجهة الأمامية**. يحتوي على مكتبات خاصة بـ React مثل `react`, `react-dom`, `react-router-dom` (للتنقل بين الصفحات)، `styled-components` (لتنسيق الواجهات)، و `lucide-react` (للأيقونات). |
| `src/` | **المجلد الرئيسي لكود الواجهة الأمامية**. |
| `src/App.tsx` | **المكون الرئيسي للتطبيق**. يقوم بإعداد `Router` ويحتوي على المسارات (`Route`) لكل صفحة في التطبيق. هو الذي يقرر أي صفحة يتم عرضها بناءً
على عنوان URL. |
| `src/index.tsx` | **نقطة دخول التطبيق**. يقوم بربط مكون `App` الرئيسي بملف `index.html` لعرضه في المتصفح. |
| `src/firebase/` | **خدمات Firebase الخاصة بالواجهة الأمامية**. هذا المجلد يحتوي على "أغلفة" (wrappers) حول الخدمات الرئيسية الموجودة في جذر المشروع. الهدف هو تبسيط استخدام هذه الخدمات داخل مكونات React. |
| `src/components/` | **مكونات واجهة المستخدم القابلة لإعادة الاستخدام**. مثل أزرار، حقول إدخال، بطاقات عرض السيارات، إلخ. هذا يساعد على توحيد شكل التطبيق وتجنب تكرار الكود. |
| `src/pages/` | **صفحات التطبيق الكاملة**. كل ملف هنا يمثل صفحة، مثل `HomePage.tsx`, `CarDetailsPage.tsx`, `LoginPage.tsx`. هذه المكونات تستخدم المكونات الأصغر من `src/components/` لبناء الصفحة. |
| `src/services/` | **خدمات إضافية للواجهة الأمامية**. يحتوي على خدمات لا تتعلق مباشرة بـ Firebase، مثل `hcaptcha-service.tsx` (للحماية من الروبوتات) و `socket-service.ts` (لاتصال WebSocket كبديل). |

### **3. الوظائف السحابية (`functions/`)**

هذا هو الجزء الخلفي (Backend) من المشروع، يعمل كخدمة بدون خادم (Serverless).

| اسم الملف/المجلد | التحليل التفصيلي للسطور والأكواد |
|---|---|
| `index.js` | **ملف الوظائف السحابية الرئيسي**. يحتوي على الكود الذي يتم تنفيذه على خوادم Google. على سبيل المثال، يمكن أن يحتوي على: <br> - **`onUserCreate` trigger**: دالة يتم تشغيلها تلقائيًا عند إنشاء مستخدم جديد، لتقوم بإعداد ملفه الشخصي في Firestore. <br> - **`onImageUpload` trigger**: دالة يتم تشغيلها عند رفع صورة جديدة إلى Storage، لتقوم بمعالجتها (مثل ضغطها أو تحليلها باستخدام Vision AI). <br> - **HTTP endpoints**: دوال يمكن استدعاؤها عبر طلبات HTTP، لتعمل كـ API مخصص. |

### **4. لوحة التحكم (`admin-dashboard/`)**

واجهة منفصلة لإدارة النظام.

| اسم الملف/المجلد | التحليل التفصيلي للسطور والأكواد |
|---|---|
| `src/` | على الأرجح تطبيق React آخر، مشابه في هيكله للواجهة الأمامية الرئيسية، ولكنه مخصص للمسؤولين. يحتوي على صفحات لإدارة المستخدمين، عرض الإحصائيات، والموافقة على إعلانات السيارات. |

### **5. خدمات Google Cloud الإضافية (Root Directory)**

إلى جانب خدمات Firebase الأساسية، يعتمد المشروع بشكل كبير على مجموعة واسعة من واجهات برمجة تطبيقات Google Cloud الأخرى لتقديم ميزات متقدمة. كل خدمة لها ملفها الخاص الذي يغلف (wraps) العميل الرسمي من Google Cloud ويقدم وظائف مخصصة للمشروع.

| اسم الملف | التحليل التفصيلي للسطور والأكواد |
|---|---|
| `bigquery-service.ts` | **خدمة مستودع البيانات الضخمة (BigQuery)**. تُستخدم لتحليل كميات هائلة من البيانات المجمعة من السوق. <br> - **`BulgarianBigQueryService` class**: تحتوي على دوال مثل `logUserActivity` (لتسجيل نشاط المستخدم)، `generateSalesReports` (لإنشاء تقارير مبيعات دورية)، و `getMarketTrends` (لتحليل توجهات السوق). <br> - **الكود**: تستخدم مكتبة `@google-cloud/bigquery` لإرسال استعلامات SQL إلى مجموعات البيانات (Datasets) في BigQuery. هذا يدل على وجود بنية تحتية لتحليل البيانات. |
| `vision-service.ts` | **خدمة تحليل الصور (Vision AI)**. تُستخدم لتحليل صور السيارات التي يرفعها المستخدمون. <br> - **`BulgarianVisionService` class**: تحتوي على دوال مثل `analyzeCarImage`. <br> - **الكود**: عند استدعاء `analyzeCarImage`، تقوم الخدمة بإرسال الصورة إلى Google Vision AI للحصول على: <br>   1.  **`labelDetection`**: للتعرف على محتوى الصورة (سيارة، إطار، إلخ). <br>   2.  **`objectLocalization`**: لتحديد مكان السيارة بالضبط في الصورة. <br>   3.  **`safeSearchDetection`**: للتأكد من أن الصورة لا تحتوي على محتوى غير لائق. <br>   هذا يضيف طبقة من الذكاء والأمان إلى عملية رفع الصور. |
| `translation-service.ts` | **خدمة الترجمة (Translate API)**. تُستخدم لترجمة محتوى الإعلانات والرسائل بين البلغارية والإنجليزية. <br> - **`BulgarianTranslationService` class**: تحتوي على دالة رئيسية `translateText`. <br> - **الكود**: تأخذ النص واللغة الهدف (`targetLanguage`) وتقوم باستدعاء Google Translate API للترجمة. هذا ضروري في سوق يدعم لغتين. |
| `speech-service.ts` | **خدمات الكلام (Speech-to-Text & Text-to-Speech)**. تُستخدم للميزات الصوتية. <br> - **`BulgarianSpeechService` class**: تحتوي على دالتين: <br>   1.  **`recognizeSpeech`**: تحول الكلام المنطوق (من ملف صوتي) إلى نص. يمكن استخدامها في البحث الصوتي. <br>   2.  **`synthesizeSpeech`**: تحول النص المكتوب إلى كلام مسموع. يمكن استخدامها لقراءة مواصفات السيارة بصوت عالٍ. |
| `maps-service.ts` | **خدمة الخرائط والمواقع (Google Maps)**. تُستخدم لكل ما يتعلق بالموقع الجغرافي. <br> - **`BulgarianMapsService` class**: تحتوي على دوال مثل `getCoordinatesForAddress` (لتحويل عنوان إلى إحداثيات) و `calculateDistance` (لحساب المسافة بين موقعين). هذا مهم لعرض السيارات القريبة من المستخدم. |
| `dialogflow-service.ts` | **خدمة المساعد الذكي (Dialogflow)**. تُستخدم لبناء شات بوت (chatbot) ذكي. <br> - **`BulgarianDialogflowService` class**: تحتوي على دالة `detectIntent` التي ترسل استعلام المستخدم (نص) إلى Dialogflow وتستقبل الرد المحدد مسبقًا. يمكن استخدام هذا للرد على الأسئلة الشائعة تلقائيًا. |
| `recaptcha-service.ts` | **خدمة الحماية من الروبوتات (reCAPTCHA Enterprise)**. <br> - **`BulgarianRecaptchaService` class**: تحتوي على دالة `verifyToken` التي تتحقق من صحة الـ token الذي يتم إنشاؤه بواسطة reCAPTCHA في الواجهة الأمامية. هذا يمنع الهجمات الآلية على نماذج التسجيل وتسجيل الدخول. |
| `kms-service.ts` | **خدمة إدارة المفاتيح (Key Management Service)**. تُستخدم لتشفير وفك تشفير البيانات الحساسة. <br> - **`BulgarianKMSService` class**: تحتوي على دوال `encrypt` و `decrypt`. هذا يضمن أن البيانات الحساسة (مثل مفاتيح API أخرى) يتم تخزينها بشكل آمن. |
| `pubsub-service.ts` | **خدمة النشر والاشتراك (Pub/Sub)**. نظام مراسلة غير متزامن لربط الخدمات ببعضها. <br> - **`BulgarianPubSubService` class**: تحتوي على دوال `publishMessage` و `subscribeToTopic`. على سبيل المثال، عند بيع سيارة، يمكن نشر رسالة إلى "topic" اسمه `car-sold`، وأي خدمة أخرى مشتركة في هذا الـ "topic" (مثل خدمة إرسال الإيميلات أو خدمة التحليلات) ستقوم بتنفيذ إجراء معين. |
| `cloudtasks-service.ts` | **خدمة المهام السحابية (Cloud Tasks)**. تُستخدم لجدولة المهام لتنفيذها في وقت لاحق. <br> - **`BulgarianCloudTasksService` class**: تحتوي على دالة `createHttpTask` التي تسمح بجدولة طلب HTTP ليتم إرساله في المستقبل. مثال: إرسال بريد إلكتروني للمستخدم بعد 24 ساعة من تسجيله. |
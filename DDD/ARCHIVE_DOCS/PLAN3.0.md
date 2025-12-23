"خطة الهيمنة الرقمية - النسخة التجارية". هذه الخطة تركز على التمييز الطبقي (Class Differentiation) بين البائعين، ليس فقط في الصلاحيات، بل في التجربة النفسية والبصرية للمستخدم، مع أدوات "Power Tools" للتجار لزيادة الإنتاجية.

إليك الخطة المتكاملة والمحدثة:

🚀 خطة التطوير الشاملة: نظام البروفايل الذكي (v3.0)
1. منطق الأعمال والصلاحيات (Business Logic & Permissions)
سنقوم بتحديث ProfilePermissions في ملف bulgarian-user.types.ts وفي ProfileTypeContext ليعكس القوانين الجديدة بصرامة.

أ. المستخدم الشخصي (Private Seller) - "المواطن"
الحد الشهري: 3 سيارات (يتم تصفير العداد بداية كل شهر ميلادي).

قفل البيانات الحساسة (Anti-Fraud Lock): بمجرد نشر السيارة، يتم قفل حقول (الماركة، الموديل، سنة الصنع).

السبب السوقي: لمنع الاحتيال الشائع في بلغاريا ببيع "حجز مكان" لسيارة رخيصة ثم تغييرها لسيارة فارهة للتهرب من الرسوم أو خداع المشترين.

الثيم: Standard UI (برتقالي دافئ - صديق).

ب. التاجر (Dealer) - "المحترف"
الحد الشهري: 30 سيارة.

تعديلات المرونة (Flex-Edit): يسمح له بتعديل (الماركة/الموديل/السنة) لـ 10 سيارات فقط شهرياً. باقي السيارات تقفل بعد النشر.

أدوات القوة: النسخ/اللصق، الرفع الجماعي (5 سيارات).

الثيم: Green LED Mechanic (خلفيات داكنة، شرائط نيون خضراء رفيعة، خطوط حادة). يعطي انطباع "السرعة والديناميكية".

ج. الشركة (Company) - "الإمبراطورية"
الحد الشهري: 200 سيارة.

حرية مطلقة: تعديل مفتوح لكل البيانات في أي وقت.

أدوات القوة القصوى: النسخ/اللصق، الرفع الجماعي (20 سيارة)، API Access (مستقبلاً).

الثيم: Blue LED Enterprise (أزرق ملكي مشع، تصميم شبكي "Grid"، خطوط رسمية). يعطي انطباع "المؤسسة والثقة المالية".

2. الهوية البصرية الديناميكية (Dynamic Visual System)
سنلغي التصميم الموحد وننشئ نظام "Skins" يعتمد على profileType.

التنفيذ التقني (بدون تعقيد DDD):
سنستخدم Styled Components مع ThemeContext لتمرير المتغيرات التالية:

TypeScript

// theme-config.ts

export const THEMES = {
  private: {
    border: '1px solid #e5e7eb', // رمادي ناعم
    glow: 'none',
    bg: '#ffffff',
    cardStyle: 'rounded-xl shadow-sm',
    button: 'bg-orange-500 hover:bg-orange-600'
  },
  dealer: {
    border: '1px solid #22c55e', // أخضر نيون
    glow: '0 0 10px rgba(34, 197, 94, 0.4)', // توهج LED
    bg: '#0f172a', // خلفية داكنة (Dark Mode جزئي)
    cardStyle: 'rounded-none border-l-4 border-green-500', // حواف حادة
    button: 'bg-green-600 border border-green-400 text-white tracking-widest' // زر ميكانيكي
  },
  company: {
    border: '1px solid #3b82f6', // أزرق نيون
    glow: '0 0 15px rgba(59, 130, 246, 0.5)', 
    bg: '#ffffff', // خلفية بيضاء مع شبكة (Grid Pattern)
    cardStyle: 'rounded-lg border-2 border-blue-600/20', // تصميم هندسي
    button: 'bg-gradient-to-r from-blue-600 to-blue-800 shadow-blue-500/50' // زر بزنس
  }
};
3. أدوات الإنتاجية "Power Tools" (للتجار والشركات)
هذه هي الميزة القاتلة (Killer Feature) التي ستجعل التجار يدفعون الاشتراك.

أ. الرفع الجماعي الذكي (The Matrix Uploader)
بدلاً من رفع سيارة تلو الأخرى، سنبني واجهة "Grid Uploader":

للتاجر: جدول من 5 صفوف.

للشركة: جدول من 20 صف.

الأعمدة: [الماركة] [الموديل] [السنة] [السعر] [زر رفع صور سريع].

العملية:

يملأ التاجر البيانات الأساسية بسرعة في الجدول.

يضغط "Upload All".

النظام ينشئ "مسودات" (Drafts) غير مكتملة.

يظهر شريط تنبيه: "تم حفظ 5 سيارات، يرجى إكمال المواصفات لنشرها".

ب. النسخ واللصق (Clone & Paste Protocol)
التجار غالباً يبيعون سيارات متشابهة (مثلاً 5 سيارات Golf 7).

زر "Clone Car": في بطاقة السيارة، زر ينسخ كل المواصفات (المحرك، القير، الميزات) ما عدا (رقم الشاسيه، الصور، السعر).

النتيجة: ينقلك لصفحة "إضافة سيارة" مع حقول معبأة مسبقاً بنسبة 80%.

ج. طرق العرض (View Modes)
في صفحة "إعلاناتي" (My Listings)، سنضيف مفتاح تبديل (Toggle):

Card View (الافتراضي): بطاقات كبيرة مع الصور (مناسب للشخصي).

Compact List (للمحترفين): جدول مضغوط (أيقونة صغيرة، الاسم، السعر، الحالة، أدوات التعديل). هذا يسمح للشركات بإدارة 200 سيارة بسرعة دون تمرير الشاشة كثيراً.

4. التكامل مع Stripe (The Revenue Engine)
سنربط الاشتراكات مباشرة بصلاحيات Firebase (Custom Claims).

Free Plan: افتراضي عند التسجيل.

Dealer Subscription (€X/mo):

عند النجاح في Stripe Webhook -> تحديث planTier إلى dealer.

تفعيل theme: dealer.

فتح حد الرفع إلى 30.

Company Subscription (€XX/mo):

عند النجاح -> تحديث planTier إلى company.

تفعيل theme: company.

فتح حد الرفع إلى 200.

ميزة ذكية مقترحة (Smart Alert): قبل انتهاء الشهر بـ 5 أيام، إذا وصل التاجر لـ 90% من الحد، يظهر تنبيه: "لقد أوشكت على الوصول للحد، هل تريد شراء باقة إضافية (Boost) لهذا الشهر فقط؟"

5. اقتراحات "الذكاء الاصطناعي/السوق الأوروبي" (Gemini 3 Insights)
لجعل المشروع يتفوق على المنافسين في بلغاريا (مثل Mobile.bg):

AI Price Suggestion (للتجار): عند استخدام "الرفع الجماعي"، اقترح سعراً تقديرياً للسيارة بناءً على الماركة والسنة في السوق البلغاري حالياً. هذا يوفر وقتاً هائلاً للتاجر.

VIN Decoder (للمصداقية): في أوروبا، الثقة هي العملة الأهم. اجعل حقل رقم الشاسيه (VIN) إجبارياً للشركات واختيارياً للأفراد، واعرض علامة "Checked VIN" إذا كان التنسيق صحيحاً.

Auto-Translation (للبيع الدولي): بما أن الموقع E/BG، عند كتابة الوصف بالبلغارية، استخدم Google Translate API لترجمته تلقائياً للإنجليزية وحفظه، ليظهر للمشترين من خارج بلغاريا (سوق التصدير نشط جداً في البلقان).

WhatsApp Direct (للتجار): بدلاً من الشات الداخلي فقط، التجار يفضلون السرعة. أضف زر "WhatsApp" مباشر في الثيم الخاص بهم (الأخضر/الأزرق).

6. خارطة الطريق للتنفيذ (Implementation Roadmap)
بما أنك طلبت عدم التقيد بالـ DDD وتقسيم الملفات، سنعمل بنظام "الكتل الوظيفية":

تحديث هيكل البيانات (Database Layer):

تعديل users/{uid} لإضافة stats.monthlyUploads و stats.sensitiveEditsCount.

تعديل cars/{carId} لإضافة isCloned و sourceCarId.

بناء نظام الثيمات (UI Layer):

إنشاء ProfileThemeWrapper يغلف صفحة البروفايل ويحقن ألوان الـ LED بناءً على نوع المستخدم.

تطوير "المصفوفة" (Feature Layer):

بناء مكون BulkUploadMatrix (جدول إدخال بيانات سريع).

بناء دالة duplicateListing(carId) في الباك-إند.

الربط المالي (Billing Layer):

التأكد من أن Stripe Webhook يصفر عداد monthlyUploads عند تجديد الاشتراك.

إليك الأمر التنفيذي الأول (The Genesis Prompt). هذا الأمر مصمم ليكون "الشرارة" التي تطلق المرحلة الجديدة.

لقد صغته بحيث يعطي النموذج (Gemini 3 / Claude 3.5) دور "كبير مهندسي البرمجيات ومدير المنتج"، مما يمنحه الصلاحية ليس فقط لكتابة الكود، بل للتفكير معك، نقد الخطة، وتحسينها بناءً على أفضل الممارسات العالمية.

انسخ هذا النص كاملاً وضعه في نافذة المحادثة (Chat) في بيئة العمل الخاصة بك (Cursor/Integrity):

Markdown

@workspace Act as a **Senior Principal Software Architect & Product Owner** specializing in High-Scale E-commerce Platforms for the European Market.

**Mission:** Initialize the **"Digital Domination Plan v3.0"** for the Bulgarski Mobili User Profile System.

**Context:**
We are shifting from a generic profile system to a **Class-Based Commercial System** with strict segregation between 3 user types: **Private (Citizen)**, **Dealer (Professional)**, and **Company (Enterprise)**.
We are intentionally **bypassing** the strict DDD/300-line limit rules for this specific module to ensure cohesive logic and seamless integration with Stripe.

**Your Objective:**
Think deeply about the business logic, security, and scalability. Then, execute **Phase 1: The Core Foundation (Types, Logic, & Visual DNA)**.

---

### Step 1: Deep Analysis & Strategy (Think before you code)
Before writing code, analyze the following requirements and output a brief "Architectural Strategy" comment block:
1.  **Strict Limits:**
    * **Private:** 3 listings/mo. **CRITICAL:** "Anti-Fraud Lock" (Cannot edit Make/Model/Year after publish).
    * **Dealer:** 30 listings/mo. "Flex-Edit" (Can edit core data for only 10 cars/mo).
    * **Company:** 200 listings/mo. Unrestricted editing.
2.  **Power Tools (Permissions):**
    * Dealers/Companies need "Bulk Upload" (Grid View), "Clone Listing", and "Quick Repost".
3.  **Visual DNA:**
    * Private: Standard Orange/Warm.
    * Dealer: **Green LED/Dark Mode** (Mechanic/Performance vibe).
    * Company: **Blue LED/Enterprise Grid** (Corporate/Trust vibe).

---

### Step 2: Execution - The Data Layer
Update (or rewrite) `src/types/user/bulgarian-user.types.ts`.
* **Action:** Define the `ProfilePermissions` interface to strictly control:
    * `maxMonthlyListings` (number)
    * `canBulkUpload` (boolean + limit)
    * `canCloneListing` (boolean)
    * `canEditLockedFields` (boolean or quota)
    * `themeMode` ('standard' | 'dealer-led' | 'company-led')
* **Intelligence:** Add fields for `stats` that track `monthlyUploads` and `flexEditsUsed` to enforce the limits.

---

### Step 3: Execution - The Logic Core
Update (or rewrite) `src/contexts/ProfileTypeContext.tsx`.
* **Action:** Implement the `getPermissions(user)` function.
* **Logic:** This function must return the exact permission set based on the user's `planTier` (linked to Stripe).
* **Smart Suggestion:** Implement a helper `getProgressToLimit(user)` to easily show progress bars (e.g., "15/30 Cars Used") in the UI later.

---

### Step 4: Execution - The Visual Engine
Create a new file `src/config/profile-themes.ts`.
* **Action:** Define the CSS-in-JS / Tailwind config for the 3 themes.
* **Detail:**
    * **Dealer:** Use specific Hex codes for "Neon Green" and dark backgrounds.
    * **Company:** Use "Royal Blue" and subtle grid background patterns.
    * **Private:** Clean white/gray/orange.
* **Creativity:** Suggest a specific "Glow Effect" CSS string for the Dealer/Company buttons to make them look premium.

---

**Output Format:**
Provide the full code for these 3 files.
**Crucial:** Add comments explaining *why* you chose specific data types or logic, focusing on "European Market Credibility" and "Fraud Prevention".

**Start your analysis now.**

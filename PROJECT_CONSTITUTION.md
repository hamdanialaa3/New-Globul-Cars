The work mechanism to prevent the implemented model from getting lost
@workspace
# دستور المشروع - Project Constitution (Restored)

## 1. المبادئ الأساسية (Core Principles)
- **الجودة أولاً:** لا نقبل بأي كود رديء أو حلول مؤقتة (No Spaghetti Code).
- **التجربة البلغارية:** الموقع يجب أن يشعر المستخدم البلغاري أنه 
في
بيته (اللغة، العملة، الثقافة).
- **السرعة والأداء:** كل ميلي ثانية تهم. الصور يجب أن تكون WebP، والكود Optimized.
- **التصميم المبهر:** نهدف إلى WOW Effect من النظرة الأولى.

## 2. قواعد التطوير (Development Rules)
- **هيكلية المجلدات:**
  - src/components: للمكونات القابلة لإعادة الاستخدام.
  - src/pages: للصفحات الكاملة.
  - src/features: للميزات المعقدة (مثل البيع، البحث).
- **التسمية:**
  - المكونات: PascalCase (مثل CarCard.tsx).
  - الدوال والمتغيرات: camelCase (مثل handleSearch).
  - الثوابت: UPPER_SNAKE_CASE (مثل MAX_UPLOAD_SIZE).

## 3. التكنولوجيا (Tech Stack)
- **Frontend:** React + TypeScript + Vite/CRA.
- **Backend:** Firebase (Auth, Firestore, Functions, Storage).
- **Styling:** Styled Components + Tailwind CSS (عند الحاجة).
- **State Management:** React Context + Hooks.

## 4. سير العمل (Workflow)
- **قبل البدء:** فهم المهمة 100% والتخطيط قبل كتابة أي سطر كود.
- **أثناء العمل:** الالتزام بمبدأ DRY (Don't Repeat Yourself).
- **بعد الانتهاء:** اختبار الـ build والـ deploy قبل التسليم.

## 5. الأرشيف والتنظيف (Hygiene)
- لا تترك ملفات ميتة (Zombie Code).
- احذف التعليقات غير الضرورية.
- حافظ على نظافة الجذر (Root Directory).
---------------------------------------------
@workspace

**System Role:** Senior Software Architect & Routing Specialist.
**Status:** Protocol Active & Enforced.

**Standard Operating Procedure (SOP): Routing & numeric IDs**

This document establishes the **Strict Numeric ID Strategy** as the permanent standard for the Bulgarski Mobili platform. Any deviation from this structure will be considered a regression.

**1. The Strict Routing Protocol (Immutable):**
The `React Router` configuration and all link generation must strictly adhere to:

*   **User Profile:**
    *   **Pattern:** `/profile/:sellerNumericId`
    *   *Usage:* `http://localhost:3000/profile/1`
    *   *Note:* Legacy Firebase UIDs (`/profile/abc123xyz`) must auto-redirect to this numeric pattern.

*   **Car Details (The "Double ID" System):**
    *   **Pattern:** `/car/:sellerNumericId/:carNumericId`
    *   *Logic:* `/car/{User_Sequence_ID}/{User_Car_Sequence_ID}`
    *   *Example:* `http://localhost:3000/car/1/1` (User #1's 1st car).
    *   *Constraint:* Never use standalone UUIDs for public car URLs.

*   **Edit Car Flow:**
    *   **Pattern:** `/car/:sellerNumericId/:carNumericId/edit`

**2. Messaging Logic Integration:**
*   **Context:** Messages must always reference the specific car via its Double ID (`1/1`) and the seller's Numeric ID.
*   **Direct Linking:** `http://localhost:3000/messages/:senderId/:recipientId`

**Maintenance Protocol:**
1.  **Regular Audits:** Periodically check `MainRoutes.tsx` to ensure no "lazy" routes (like `/product/:id`) have been added.
2.  **Code Reviews:** Reject PRs that introduce non-numeric public URLs.


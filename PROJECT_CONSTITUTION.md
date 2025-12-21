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
**Priority:** Critical Bug Fix & Architecture Enforcement.

**Situation Report:**
We have encountered a regression in our routing logic. The system was designed with a strict **Numeric ID Strategy**, but recent changes have broken the consistency.

**Mission:**
You are required to audit, repair, and strictly enforce the following URL structure and logic. No deviations are allowed.

**1. The Strict Routing Protocol:**
You must ensure the `React Router` configuration and all internal links strictly follow these patterns:

* **User Profile:**
    * **Pattern:** `/profile/:sellerNumericId`
    * *Example:* `http://localhost:3000/profile/1` (Viewing the profile of User #1).

* **Car Details (The "Double ID" System):**
    * **Pattern:** `/car/:sellerNumericId/:carNumericId`
    * *Logic:* `/car/{User_Sequence_ID}/{User_Car_Sequence_ID}`
    * *Example:* `http://localhost:3000/car/1/1` (User #1's 1st car).
    * *Requirement:* Ensure the resolver correctly identifies the document based on these two numeric parameters.

* **Edit Car Flow:**
    * **Pattern:** `/car/:sellerNumericId/:carNumericId/edit`
    * *Example:* `http://localhost:3000/car/1/1/edit`
    * *Action:* Opens the edit mode for that specific vehicle.

**2. Messaging Logic Integration:**
* **Scenario:** A logged-in user (e.g., User ID `2`) visits a car page (`/car/1/1`).
* **Action:** When they click the "Message" or "Contact" button:
    * The system must initiate a chat context between **User 2** (Viewer) and **User 1** (Seller).
    * The message context must explicitly reference the car ID (`1/1`).

**Action Plan:**
1.  **Audit:** Check `App.tsx` or the main Router file to see why the paths are currently broken or inconsistent.
2.  **Fix:** Rewrite the Route definitions to match the strict patterns above.
3.  **Link Generation:** Review the components that generate these links (e.g., Car Cards, Edit Buttons) and ensure they are constructing the URLs correctly using the numeric IDs, not UUIDs.
4.  **Parameter Handling:** Ensure the pages (`CarDetailsPage`, `EditCarPage`) correctly extract `:sellerNumericId` and `:carNumericId` from the URL and use them to fetch the correct data from Firestore.

Please execute this cleanup immediately and confirm when the strict routing logic is restored.


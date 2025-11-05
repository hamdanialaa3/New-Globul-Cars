# 🧭 TECHNICAL_DECISION_RECORD.md
## سجل القرارات الفنية (TDR)

تُسجل هذه الوثيقة القرارات الفنية الرئيسية مع البدائل والأسباب والتواريخ.

---

### TDR-001: Union Types vs Inheritance
- القرار: Union Types مع Type Guards
- البدائل: Inheritance hierarchy
- السبب: Type safety أفضل، توافق مع Firestore/JSON serialization، فحص استنفادي
- التاريخ: 2025-11-02
- المسؤول: Team (Profile Types)

---

### TDR-002: Firestore Structure (Hybrid Reference Model)
- القرار: users/{uid} تحتوي snapshot/ref، والبيانات الكاملة في dealerships/{uid} و companies/{uid}
- البدائل: 
  - كل شيء مضمّن داخل users (embedded)
  - مجموعات منفصلة لكل نوع user (privateUsers/dealerUsers/companyUsers)
- السبب: يقلل حجم وثيقة user، يتماشى مع الخدمات الحالية، يزيل التعارض، أداء أفضل
- التاريخ: 2025-11-02
- المسؤول: Team (Data & Services)

---

### TDR-003: Provider Order (React Context)
- القرار: الالتزام بالترتيب: Theme → GlobalStyles → Language → Auth → ProfileType → Toast → ReCaptcha → Router
- البدائل: تبديل ترتيب Auth/Language/Theme
- السبب: التبديل يكسر المصادقة/اللغة/التصميم وفقاً لتوثيق المشروع
- التاريخ: 2025-11-02
- المسؤول: Frontend Core

---

### TDR-004: Remote Config Feature Flags
- القرار: استخدام RC للتحكم التدريجي (migration/ui/guards)
- البدائل: تفعيل مباشر دون أعلام
- السبب: تقليل المخاطر، تمكين التراجع الفوري، القياس المرحلي
- التاريخ: 2025-11-02
- المسؤول: Release Engineering

---

ملاحظة: أضف قرارات جديدة مع نفس القالب (ID فريد، القرار، البدائل، السبب، التاريخ، المسؤول).

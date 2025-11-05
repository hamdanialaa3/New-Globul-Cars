# 🎨 USER_EXPERIENCE_ENHANCEMENTS.md
## تحسينات تجربة المستخدم: Onboarding ذكي ومساعد ملف شخصي

أفكار قابلة للتنفيذ بعد استقرار البنية.

---

## Smart Onboarding Wizard (Concept)
```tsx
// src/components/Onboarding/SmartOnboardingWizard.tsx (concept)
interface SmartOnboardingConfig {
  profileType: ProfileType;
  userBehavior: UserBehavior;
  previousExperience: OnboardingExperience;
  goals: UserGoals;
}
```
- يحسب مسار توجيه ديناميكي حسب النوع والسلوك والأهداف
- يُظهر الخطوات ذات الأولوية لإكمال الملف بسرعة

## Profile Assistant (Concept)
```tsx
// src/components/Assistant/ProfileAssistant.tsx (concept)
interface ProfileAssistantProps {
  profileType: ProfileType;
  completionPercentage: number;
  missingFields: string[];
  suggestedActions: string[];
  userGoals: string[];
}
```
- يقترح إجراءات ذكية: إكمال تحقق، رفع شعار، إضافة ساعات عمل…
- يعرض رسائل موجهة ومختصرة مع أزرار تنفيذ فوري

## Notes
- تُنفَّذ هذه الميزات لاحقاً ضمن Phase UX Enhancements بعد اكتمال الفصل والترحيل
- تأكّد من احترام النظام الثنائي اللغة (BG/EN) وإضافة مفاتيح الترجمة مسبقاً

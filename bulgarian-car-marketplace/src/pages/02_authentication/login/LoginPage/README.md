# LoginPage - Modular Login Component

هذا المكون يمثل صفحة تسجيل الدخول الأساسية لسوق السيارات البلغاري، وتم إعادة هيكلته ليكون موديولارًا وسهل الصيانة.

## الهيكل الموديولار

### `types.ts`
يحتوي على جميع الواجهات والأنواع المستخدمة:
- `LoginFormData`: بيانات نموذج تسجيل الدخول
- `LoginState`: حالة المكون الكاملة
- `LoginActions`: جميع الإجراءات والمعالجات
- `UseLoginReturn`: نوع الإرجاع للخطاف المخصص

### `styles.ts`
يحتوي على جميع مكونات styled-components:
- مكونات التخطيط الرئيسية (`LoginContainer`, `LoginCard`)
- مكونات النموذج (`Input`, `Label`, `FormGroup`)
- مكونات الأزرار (`LoginButton`)
- مكونات الرسائل (`ErrorMessage`, `SuccessMessage`)
- مكونات التخطيط (`Divider`, `RememberForgotContainer`)

### `hooks/useLogin.ts`
يحتوي على منطق إدارة الحالة والعمليات:
- إدارة حالة النموذج والتحقق من الصحة
- معالجة تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
- معالجة تسجيل الدخول الاجتماعي (Google, Facebook, Apple)
- إدارة الأخطاء والنجاح
- تشخيص Firebase في وضع التطوير

### `index.tsx`
المكون الرئيسي الذي يجمع جميع الأجزاء معًا ويستخدم مكون `SocialLogin`.

## الميزات

- ✅ تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
- ✅ تسجيل الدخول الاجتماعي (Google, Facebook, Apple) عبر مكون `SocialLogin`
- ✅ التحقق من صحة النماذج في الوقت الفعلي
- ✅ إدارة كلمة المرور (إظهار/إخفاء)
- ✅ تذكرني (Remember me)
- ✅ رسائل خطأ ونجاح تفاعلية
- ✅ تصميم متجاوب
- ✅ دعم الترجمة متعددة اللغات
- ✅ تشخيص Firebase في وضع التطوير
- ✅ تأثيرات بصرية متقدمة

## التبعيات

- `react-router-dom`: للتنقل
- `styled-components`: للتصميم
- `lucide-react`: للأيقونات
- `react`: للمكونات
- `firebase/social-auth-service`: للمصادقة
- `hooks/useTranslation`: للترجمة
- `hooks/useAuth`: لإدارة المصادقة
- `utils/firebase-debug`: لتشخيص Firebase
- `components/SocialLogin`: لتسجيل الدخول الاجتماعي

## الاستخدام

```tsx
import LoginPage from './pages/LoginPage';

function App() {
  return <LoginPage />;
}
```

## ملاحظات التطوير

- تم فصل الاهتمامات بوضوح (UI، منطق، أنماط، أنواع)
- سهولة الصيانة والتوسع
- إعادة استخدام الكود المحسن
- اختبار أسهل بفضل الفصل
- يستخدم مكون `SocialLogin` للتسجيل الاجتماعي بدلاً من الأزرار المباشرة
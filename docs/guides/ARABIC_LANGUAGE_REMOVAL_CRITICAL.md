# 🚨 CRITICAL: Arabic Language Removal Required
## January 26, 2026

---

## ⚠️ المشكلة الحرجة (Critical Issue)

الكود الحالي **يدعم لغة عربية** بالكامل، لكن دستور المشروع يتطلب **البلغاري والإنجليزي فقط**:

```
❌ مدعوم حالياً: البلغاري + الإنجليزي + العربية
✅ مطلوب: البلغاري + الإنجليزي فقط
```

---

## 🔍 الملفات المتأثرة (Affected Files)

### 1. **ملفات التحويل (i18n Configuration)**

```
src/services/email-verification.ts - Line 95
  case 'auth/too-many-requests':
    ? language === 'ar'
    ? 'طلبات كثيرة جداً. يرجى المحاولة لاحقاً'
```

### 2. **ملفات البحث (Search Files)**

```
src/pages/05_search-browse/.../useAdvancedSearch.ts - Line 288
  alert('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
```

### 3. **ملفات المعالجة (Handler Files)**

```
src/hooks/useAuthRedirectHandler.ts - Line 68+
  'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.'
  'النوافذ المنبثقة محظورة...'
  'تسجيل الدخول غير مفعل...'
  'هذا الموقع غير مصرح...'
```

### 4. **ملفات التحقق (Validation Files)**

```
src/services/validation/enhanced-validators.ts - Line 129
  '⚠️ السعر منخفض بشكل غير عادي - يرجى التحقق من صحته'
  
src/services/validation/comprehensive-validation.service.ts - Line 89+
  '⚠️ السعر منخفض بشكل مريب. يرجى التحقق من حالة السيارة.'
  'للسيارات الفاخرة والنادرة، يرجى إرفاق وثائق التقييم.'
  '⚠️ رقم VIN قد لا يكون صحيحاً...'
```

### 5. **ملفات المحللات (Analytics Files)**

```
src/services/analytics/google-analytics-data-deletion.service.ts - Line 32
  '// يرجى تحديث هذه القيم بمعلومات حساب Google Analytics الفعلية'
```

---

## 📊 الإحصائيات (Statistics)

| المقياس | الرقم |
|---------|-------|
| ملفات تحتوي على عربية | ~15 |
| نصوص عربية إجمالي | ~50+ |
| نصوص عربية في واجهة المستخدم | ~25 |
| نصوص عربية في التعليقات | ~10 |

---

## ✅ الحل المطلوب (Required Solution)

### الخطوة 1: إزالة دعم اللغة العربية من ملفات التحويل

```typescript
// ❌ WRONG - Supports Arabic
case 'auth/too-many-requests':
  errorMessage = language === 'bg'
    ? 'Твърде много заявки...'
    : language === 'ar'
    ? 'طلبات كثيرة جداً...'
    : 'Too many requests...';

// ✅ CORRECT - Only Bulgarian and English
case 'auth/too-many-requests':
  errorMessage = language === 'bg'
    ? 'Твърде много заявки. Моля, опитайте отново по-късно'
    : 'Too many requests. Please try again later';
```

### الخطوة 2: إزالة جميع النصوص العربية من الكود

```typescript
// ❌ WRONG
alert('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');

// ✅ CORRECT
const { t } = useLanguage();
alert(t('search.error'));  // أو
alert(language === 'bg' 
  ? 'Възникна грешка при търсенето. Моля, опитайте отново.' 
  : 'An error occurred during search. Please try again.');
```

### الخطوة 3: تحديث ملفات i18n

**التوثيق:**

```json
{
  "locales": {
    "bg": "Bulgarian (Български)",
    "en": "English"
  },
  "supported": ["bg", "en"],
  "removed": ["ar"],
  "note": "Project supports only Bulgarian and English per CONSTITUTION.md"
}
```

---

## 🎯 Suggested Implementation Order

1. **Priority 1 (يجب عمله أولاً):**
   - [ ] `src/components/AI/UnifiedAIChat.tsx` - ✅ Already done
   - [ ] `src/services/messaging/ai-failover.service.ts` - ✅ Already done
   - [ ] `src/utils/auth-error-handler.ts` - ✅ Already done
   - [ ] `src/hooks/useAuthRedirectHandler.ts` - TODO

2. **Priority 2 (عالي الأهمية):**
   - [ ] `src/services/email-verification.ts`
   - [ ] `src/pages/05_search-browse/.../useAdvancedSearch.ts`

3. **Priority 3 (متوسط الأهمية):**
   - [ ] `src/services/validation/*.ts` files
   - [ ] `src/services/analytics/*.ts` files

4. **Priority 4 (تعليقات وملاحظات):**
   - [ ] Remove Arabic comments and notes

---

## 💻 Code Example: How to Fix

### Before:
```typescript
const handleError = (error: any, language: string) => {
  if (language === 'ar') {
    return 'عذراً، حدث خطأ';
  } else if (language === 'bg') {
    return 'Съжалявам, възникна грешка';
  } else {
    return 'Sorry, an error occurred';
  }
};
```

### After:
```typescript
const handleError = (language: string) => {
  if (language === 'bg') {
    return 'Съжалявам, възникна грешка';
  } else {
    return 'Sorry, an error occurred';
  }
};
```

---

## 📋 Checklist for Full Implementation

- [ ] Remove all `language === 'ar'` conditions
- [ ] Remove all Arabic strings from TypeScript files
- [ ] Remove all Arabic strings from JSX/TSX components
- [ ] Remove all Arabic translation keys from locales
- [ ] Remove Arabic comments in code
- [ ] Verify no Arabic text appears in UI
- [ ] Test in Bulgarian (bg) ✅
- [ ] Test in English (en) ✅
- [ ] Confirm no Arabic appears ✅
- [ ] Update documentation
- [ ] Commit and deploy

---

## 🔐 Project Constitution Reference

**From CONSTITUTION.md:**

> **البيان الجغرافي (Geographic Declaration):**
> - الموقع الجغرافي: جمهورية بلغارية
> - اللغات: بلغاري و انكليزي
> - العملة: يورو
> 
> **أي محتوى بلغة عربية يخالف دستور المشروع**

---

## 🚀 Next Steps

1. ✅ Fix UI components (UnifiedAIChat, auth-error-handler)
2. ⏳ Fix hooks (useAuthRedirectHandler, useAdvancedSearch)
3. ⏳ Fix services (email-verification, validators)
4. ⏳ Fix comments and documentation
5. ⏳ Test thoroughly
6. ⏳ Deploy

---

**Created:** January 26, 2026  
**Priority:** 🚨 HIGH  
**Status:** 🔴 CRITICAL - Awaiting implementation  
**Owner:** Development Team  


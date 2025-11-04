# 📋 دليل البدء السريع - Quick Start Guide

## 🚀 ابدأ الآن في 5 دقائق

---

## 1️⃣ التثبيت (30 ثانية)

```bash
cd bulgarian-car-marketplace
npm install zod
```

---

## 2️⃣ التحقق (1 دقيقة)

```bash
# TypeScript check
npm run type-check

# Build test
npm run build
```

---

## 3️⃣ الاستخدام

### **Repository Pattern:**

```typescript
import { UserRepository } from '@/repositories';

// Get user
const user = await UserRepository.getById(uid);

// Update user
await UserRepository.update(uid, {
  displayName: 'New Name'
});
```

---

### **Validation (Zod):**

```typescript
import { 
  validateDealershipInfo, 
  getFieldErrors 
} from '@/utils/validators';

const result = validateDealershipInfo(formData);

if (!result.success) {
  const errors = getFieldErrors(result.error);
  // { 'vatNumber': 'Invalid format' }
  setFormErrors(errors);
}
```

---

### **Optimistic UI:**

```typescript
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';

function MyComponent() {
  const [data, setData] = useState(initial);
  const { execute, isUpdating } = useOptimisticUpdate();

  const handleSave = async (updates) => {
    // Update UI immediately
    setData(prev => ({ ...prev, ...updates }));

    // Execute with auto-rollback
    await execute({
      optimisticData: updates,
      operation: () => api.update(updates),
      rollback: () => loadData(),
      onSuccess: () => toast.success('✅ Saved!'),
      onError: () => toast.error('❌ Failed')
    });
  };
}
```

---

### **Error Boundaries:**

```typescript
import { RouteErrorBoundary } from '@/components/ErrorBoundary';

<Route path="/profile" element={
  <RouteErrorBoundary>
    <ProfilePage />
  </RouteErrorBoundary>
} />
```

---

### **Custom Hooks:**

```typescript
// Async data fetching
import { useAsyncData } from '@/hooks/useAsyncData';

const { data, loading, error, reload } = useAsyncData(
  () => fetchUser(userId),
  [userId]
);

// Input debouncing
import { useDebounce } from '@/hooks/useDebounce';

const debouncedSearch = useDebounce(searchTerm, 500);
```

---

### **Utilities:**

```typescript
// Timestamp conversion
import { convertTimestamp } from '@/utils/timestamp-converter';

const date = convertTimestamp(firestoreTimestamp);

// Toast helpers
import { showSuccessToast, showErrorToast } from '@/utils/toast-helper';

showSuccessToast(toast, 'Operation successful', { userId });
showErrorToast(toast, error, 'Operation failed', { userId });
```

---

## 4️⃣ Scripts الجاهزة

```bash
# Validate refactoring
npx ts-node scripts/validation-check.ts

# Find memory leaks
npx ts-node scripts/find-missing-cleanups.ts

# Replace console.* (dry-run first!)
npx ts-node scripts/replace-console-logs.ts --dry-run

# Migrate dealers data (dry-run)
npx ts-node scripts/migrate-dealers-collection.ts --dry-run
```

---

## 5️⃣ الملفات المهمة

```
📊 FINAL_IMPLEMENTATION_REPORT_75_PERCENT.md  ← تقرير شامل
README_REFACTORING.md                        ← دليل التطوير
CHANGELOG.md                                 ← سجل التغييرات
🔧 BUGFIX_AND_REFACTORING_PLAN.md            ← الخطة الأساسية
```

---

## ✅ Checklist قبل الإنتاج

```
☐ npm install zod
☐ npm run type-check (0 errors)
☐ npm run build (successful)
☐ npx ts-node scripts/validation-check.ts (pass)
☐ Test critical paths manually
☐ Review console replacement
☐ Backup database before migration
☐ Deploy to staging first
☐ Monitor for errors
☐ Rollback plan ready
```

---

## 🆘 المساعدة

### **مشكلة في TypeScript:**
```bash
npm run type-check
# Fix errors shown
```

### **مشكلة في Build:**
```bash
npm run build
# Check error messages
```

### **مشكلة في Validation:**
```
تأكد من تثبيت Zod:
npm install zod
```

---

## 📞 الموارد

- **التقارير:** `📊 FINAL_IMPLEMENTATION_REPORT_75_PERCENT.md`
- **الدليل:** `README_REFACTORING.md`
- **الخطة:** `🔧 BUGFIX_AND_REFACTORING_PLAN.md`
- **التغييرات:** `CHANGELOG.md`

---

**🎉 جاهز للاستخدام! Happy Coding! 🚀**


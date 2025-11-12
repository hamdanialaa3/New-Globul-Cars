# 💻 CODE EXAMPLES
## أمثلة كود كاملة جاهزة للنسخ والاستخدام

---

## 📁 محتويات المجلد

### **Week 1 Examples:**
1. **sell-workflow.types.ts** - Type definitions كاملة
2. **workflow-migration.service.ts** - Migration helpers
3. **indexeddb.service.ts** - IndexedDB wrapper
4. **error-handling.service.ts** - Unified errors

### **Week 2 Examples:**
5. **transaction.service.ts** - Transaction support
6. **image-optimizer.worker.ts** - Web Worker
7. **image-optimizer-worker.service.ts** - Worker wrapper

### **Week 3 Examples:**
8. **ProgressStepper.tsx** - Progress indicator
9. **location-validation.service.ts** - Location validator
10. **duplicate-detection.service.ts** - Duplicate checker

### **Week 4 Examples:**
11. **feature-flags.ts** - Feature flags system
12. **monitoring.service.ts** - Monitoring & analytics

### **Tests:**
13. **tests/** - جميع الاختبارات

---

## 📦 كيفية الاستخدام

### **Step 1: انسخ الملفات**
```bash
# انسخ الملف من CODE_EXAMPLES/
cp CODE_EXAMPLES/sell-workflow.types.ts \
   bulgarian-car-marketplace/src/types/

# أو انسخ المحتوى يدوياً
```

### **Step 2: Install Dependencies**
```bash
cd bulgarian-car-marketplace

# للـ Web Workers
npm install -D vite-plugin-worker

# للـ Testing
npm install -D @playwright/test artillery

# للـ Monitoring
# (لا يوجد - Firebase موجود)
```

### **Step 3: Update Config**

```typescript
// vite.config.ts (للـ Web Workers)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import workerPlugin from 'vite-plugin-worker';

export default defineConfig({
  plugins: [
    react(),
    workerPlugin()
  ]
});
```

### **Step 4: Run Tests**
```bash
npm test                    # Unit tests
npm run test:e2e            # E2E tests
npm run test:load           # Load tests
```

---

## 🎯 الترتيب الموصى به

### **Week 1:**
1. Copy `sell-workflow.types.ts`
2. Copy `workflow-migration.service.ts`
3. Update `sellWorkflowService.ts`
4. Run tests
5. Copy `indexeddb.service.ts`
6. Update `workflowPersistenceService.ts`
7. Run tests
8. Copy `error-handling.service.ts`
9. Update all pages
10. Run tests

### **Week 2:**
1. Copy `transaction.service.ts`
2. Update `sellWorkflowService.ts`
3. Run tests
4. Copy `image-optimizer.worker.ts`
5. Copy `image-optimizer-worker.service.ts`
6. Update `ImagesPage.tsx`
7. Run tests

### **Week 3:**
1. Copy `ProgressStepper.tsx`
2. Add to all workflow pages
3. Copy `location-validation.service.ts`
4. Update location inputs
5. Copy `duplicate-detection.service.ts`
6. Update submission flow
7. Run tests

### **Week 4:**
1. Copy all test files
2. Run all tests
3. Fix any failures
4. Copy `feature-flags.ts`
5. Copy `monitoring.service.ts`
6. Deploy to staging
7. Deploy to production

---

## 🔑 ملاحظات مهمة

### **Backward Compatibility:**
- ✅ جميع الأمثلة متوافقة مع الكود القديم
- ✅ لا breaking changes
- ✅ Feature flags للتحكم

### **Testing:**
- ✅ كل ملف له test file مرافق
- ✅ جميع الـ tests تعمل
- ✅ Coverage > 80%

### **Production Ready:**
- ✅ لا console.log
- ✅ Error handling شامل
- ✅ TypeScript strict mode
- ✅ Performance optimized

---

## 📞 الدعم

**أسئلة؟**
1. راجع الملف الأصلي في الخطة الأسبوعية
2. تحقق من التعليقات في الكود
3. اتصل بفريق المشروع

---

**آخر تحديث:** نوفمبر 2025


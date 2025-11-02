# 🚀 PERFORMANCE_OPTIMIZATION.md
## تحسينات الأداء: تحميل استباقي، كاش، ومعالجة صور

تركّز هذه الوثيقة على السرعة بعد الفصل والترحيل.

---

## Proactive Loading Hook
```ts
// src/hooks/useProactiveLoading.ts (reference-only contract)
const useProactiveLoading = (userId: string, profileType: ProfileType) => {
  // Predict + preload common paths and data per type
};
```
- يحدّد المسارات الأكثر احتمالاً ويُحمّل بياناتها مسبقاً
- يعمل مع SWR cache وonSnapshot invalidation

## SWR Cache Pattern
- Cache TTL: 60s للملف الشخصي، 5m للقوائم العامة
- Invalidate على onSnapshot للأجزاء الحرجة

## Image Normalization Pipeline
- Storage trigger: توليد أحجام/صيَغ مناسبة (webp/jpg)
- تحديث dealerSnapshot.logo بالرابط النهائي

## Web Vitals
- راقب LCP, FID, CLS عبر utils/performance-monitoring
- أهداف: LCP < 2.5s، CLS < 0.1

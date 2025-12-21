// AI Performance Tracing Helpers
// ملاحظة: تجنّب أي تعليق مطوّل داخل منطق الحسّاس حسب تعليمات المشروع.

import { getPerformance, trace as createTrace, PerformanceTrace } from 'firebase/performance';
import { getApps, getApp } from 'firebase/app';

// أسماء الترايس الموحدة
export const AI_TRACE_NAMES = {
  ingestion: 'ai_ingestion',
  imageOptimization: 'ai_image_opt',
  duplicateDetection: 'ai_duplicate_check',
  geminiInference: 'ai_gemini_infer'
} as const;

// الحصول على performance إن توفر
function safeGetPerformance() {
  try {
    if (!getApps().length) return null;
    return getPerformance(getApp());
  } catch {
    return null;
  }
}

// بدء ترايس يدوي
export function startAiTrace(name: string): PerformanceTrace | null {
  const perf = safeGetPerformance();
  if (!perf) return null;
  const t = createTrace(perf, name);
  t.start();
  return t;
}

// إنهاء ترايس مع تسجيل مدة إضافية اختيارياً
export function endAiTrace(t: PerformanceTrace | null, extraMetrics?: Record<string, number>) {
  if (!t) return;
  if (extraMetrics) {
    Object.entries(extraMetrics).forEach(([k, v]) => {
      try { t.putMetric(k, Math.round(v)); } catch { /* ignore */ }
    });
  }
  try { t.stop(); } catch { /* ignore */ }
}

// تغليف دالة async داخل ترايس
export async function withAiTrace<T>(name: string, fn: () => Promise<T>, metrics?: (result: T) => Record<string, number> | undefined): Promise<T> {
  const t = startAiTrace(name);
  const start = performance.now();
  try {
    const res = await fn();
    const end = performance.now();
    const base = { duration_ms: end - start };
    const extra = metrics ? metrics(res) : undefined;
    endAiTrace(t, { ...base, ...(extra || {}) });
    return res;
  } catch (e) {
    const end = performance.now();
    endAiTrace(t, { duration_ms: end - start, error: 1 });
    throw e;
  }
}

// أمثلة استخدام (لا تُصدّر):
// await withAiTrace(AI_TRACE_NAMES.geminiInference, () => runGeminiPrompt(input));
// const trace = startAiTrace(AI_TRACE_NAMES.imageOptimization); ... endAiTrace(trace, { variants: 4 });

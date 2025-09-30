// Feature Flags للتجريب الآمن - لا نكسر المشروع
export const FEATURE_FLAGS = {
  // إعادة هيكلة الملفات الكبيرة
  ENABLE_NEW_ADVANCED_SEARCH: false,
  ENABLE_SPLIT_CAR_DATA: false,
  ENABLE_NEW_DASHBOARD: false,
  ENABLE_NEW_PROFILE_PAGE: false,

  // مراقبة الجودة
  ENABLE_STRICT_ESLINT: false,
  ENABLE_CODE_COVERAGE: false,

  // أدوات التطوير
  ENABLE_PERFORMANCE_MONITORING: false,
  ENABLE_BUNDLE_ANALYZER: false
};

// دوال مساعدة للتحقق من التفعيل
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};

// تحذير عند استخدام ميزة غير مفعلة
export const warnIfFeatureDisabled = (feature: keyof typeof FEATURE_FLAGS, message: string) => {
  if (!isFeatureEnabled(feature)) {
    console.warn(`⚠️ Feature "${feature}" is disabled: ${message}`);
  }
};
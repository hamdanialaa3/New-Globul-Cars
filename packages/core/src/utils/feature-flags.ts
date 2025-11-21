// Feature Flags ??????? ????? - ?? ???? ???????
import { logger } from '@globul-cars/services';
export const FEATURE_FLAGS = {
  // (Comment removed - was in Arabic)
  ENABLE_NEW_ADVANCED_SEARCH: false,
  ENABLE_SPLIT_CAR_DATA: false,
  ENABLE_NEW_DASHBOARD: false,
  ENABLE_NEW_PROFILE_PAGE: false,

  // (Comment removed - was in Arabic)
  ENABLE_STRICT_ESLINT: false,
  ENABLE_CODE_COVERAGE: false,

  // (Comment removed - was in Arabic)
  ENABLE_PERFORMANCE_MONITORING: false,
  ENABLE_BUNDLE_ANALYZER: false
};

// (Comment removed - was in Arabic)
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};

// (Comment removed - was in Arabic)
export const warnIfFeatureDisabled = (feature: keyof typeof FEATURE_FLAGS, message: string) => {
  if (!isFeatureEnabled(feature)) {
    logger.warn(`Feature "${feature}" is disabled: ${message}`);
  }
};
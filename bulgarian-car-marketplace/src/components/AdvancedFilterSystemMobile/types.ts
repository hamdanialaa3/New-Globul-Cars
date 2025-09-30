// AdvancedFilterSystemMobile/types.ts
// تعريفات الأنواع لنظام التصفية المتقدم للأجهزة المحمولة

export interface FilterValue {
  [key: string]: any;
}

export interface AdvancedFilterSystemMobileProps {
  onSearch: (filters: FilterValue) => void;
  onReset: () => void;
  onSaveSearch?: (filters: FilterValue) => void;
  loading?: boolean;
}

export interface SectionState {
  [sectionId: string]: boolean;
}
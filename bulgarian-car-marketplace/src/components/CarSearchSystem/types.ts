// CarSearchSystem/types.ts
// تعريف الأنواع لنظام البحث في السيارات

export interface OptionType {
  value: string;
  text: string;
}

export interface FiltersType {
  make: string;
  model: string;
  generation: string;
  bodyStyle: string;
  fuelType: string;
  registeredInBulgaria: string;
  environmentalTaxPaid: string;
  technicalInspectionDate: string;
}

export interface CarSearchSystemProps {
  onSearch: (filters: FiltersType) => void;
  initialFilters?: Partial<FiltersType>;
}
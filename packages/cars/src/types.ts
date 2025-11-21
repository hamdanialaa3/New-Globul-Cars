// Cars Package Types - Moved to @globul-cars/cars package

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

export interface OptionType {
  value: string;
  label: string;
  labelEn?: string;
}


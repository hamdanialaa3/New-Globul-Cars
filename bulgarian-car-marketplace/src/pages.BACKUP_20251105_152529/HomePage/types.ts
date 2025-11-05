// src/pages/HomePage/types.ts
// Types for HomePage components

export interface HomePageStats {
  cars: number;
  satisfiedCustomers: number;
  dealers: number;
  satisfaction: number;
}

export interface HomePageFeature {
  icon: string;
  title: string;
  description: string;
}

export interface HomePageSection {
  title: string;
  subtitle?: string;
}
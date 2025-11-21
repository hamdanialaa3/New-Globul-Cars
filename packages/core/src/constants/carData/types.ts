// Car Data Types
export interface CarBodyStyle {
  id: string;
  name: string;
}

export interface CarGeneration {
  id: string;
  name: string;
  years: string;
  bodyStyles: CarBodyStyle[];
}

export interface CarModel {
  id: string;
  name: string;
  generations: CarGeneration[];
}

export interface CarMake {
  id: string;
  name: string;
  models: CarModel[];
}


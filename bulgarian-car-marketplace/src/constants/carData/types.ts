export interface CarMake {
  id: string;
  name: string;
  models: CarModel[];
}

export interface CarModel {
  id: string;
  name: string;
  generations: CarGeneration[];
}

export interface CarGeneration {
  id: string;
  name: string;
  years: string;
  bodyStyles: CarBodyStyle[];
}

export interface CarBodyStyle {
  id: string;
  name: string;
}



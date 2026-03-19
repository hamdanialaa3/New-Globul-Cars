/**
 * ComparisonContext — Global car comparison state
 * Allows users to select up to 3 cars from any listing/search page
 * and compare them side-by-side.
 */
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface ComparisonCar {
  id: string;
  numericId?: number;
  make: string;
  model: string;
  year: number;
  price: number;
  image?: string;
  mileage?: number;
  fuelType?: string;
}

interface ComparisonContextType {
  cars: ComparisonCar[];
  addCar: (car: ComparisonCar) => void;
  removeCar: (carId: string) => void;
  clearAll: () => void;
  isSelected: (carId: string) => boolean;
  isFull: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | null>(null);

const MAX_COMPARE = 3;

export const ComparisonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cars, setCars] = useState<ComparisonCar[]>([]);

  const addCar = useCallback((car: ComparisonCar) => {
    setCars(prev => {
      if (prev.length >= MAX_COMPARE) return prev;
      if (prev.some(c => c.id === car.id)) return prev;
      return [...prev, car];
    });
  }, []);

  const removeCar = useCallback((carId: string) => {
    setCars(prev => prev.filter(c => c.id !== carId));
  }, []);

  const clearAll = useCallback(() => setCars([]), []);

  const isSelected = useCallback((carId: string) => cars.some(c => c.id === carId), [cars]);

  return (
    <ComparisonContext.Provider value={{ cars, addCar, removeCar, clearAll, isSelected, isFull: cars.length >= MAX_COMPARE }}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = (): ComparisonContextType => {
  const ctx = useContext(ComparisonContext);
  if (!ctx) throw new Error('useComparison must be used within <ComparisonProvider>');
  return ctx;
};

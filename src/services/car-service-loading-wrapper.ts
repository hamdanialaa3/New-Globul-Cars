// src/services/car-service-loading-wrapper.ts
/**
 * Car Service with Loading Overlay Integration
 * 
 * This file demonstrates how to wrap existing car service functions
 * with automatic loading overlay display
 * 
 * @example
 * const carServiceWithLoading = getCarServiceWithLoading();
 * const cars = await carServiceWithLoading.getAllCars();
 */

import { useLoadingWrapper } from './with-loading';

/**
 * Factory function to create car service with loading
 * Must be used inside a React component (has hooks)
 */
export const useCarServiceWithLoading = () => {
  const { withLoading } = useLoadingWrapper();

  return {
    /**
     * Fetch all cars
     */
    getAllCars: withLoading(
      async () => {
        const response = await fetch('/api/cars');
        return response.json();
      },
      'Fetching cars...'
    ),

    /**
     * Fetch car by ID
     */
    getCarById: withLoading(
      async (id: string) => {
        const response = await fetch(`/api/cars/${id}`);
        return response.json();
      },
      'Loading car...'
    ),

    /**
     * Search cars
     */
    searchCars: withLoading(
      async (filters: Record<string, string | number | boolean>) => {
        const params = Object.entries(filters).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>);
        const queryParams = new URLSearchParams(params);
        const response = await fetch(`/api/cars/search?${queryParams}`);
        return response.json();
      },
      'Searching...'
    ),

    /**
     * Create a new car
     */
    createCar: withLoading(
      async (data: Record<string, unknown>) => {
        const response = await fetch('/api/cars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return response.json();
      },
      'Saving car...'
    ),

    /**
     * Update car
     */
    updateCar: withLoading(
      async (id: string, data: Record<string, unknown>) => {
        const response = await fetch(`/api/cars/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return response.json();
      },
      'Updating data...'
    ),

    /**
     * Delete car
     */
    deleteCar: withLoading(
      async (id: string) => {
        const response = await fetch(`/api/cars/${id}`, {
          method: 'DELETE',
        });
        return response.json();
      },
      'Deleting...'
    ),

    /**
     * Fetch featured cars
     */
    getFeaturedCars: withLoading(
      async () => {
        const response = await fetch('/api/cars/featured');
        return response.json();
      },
      'Loading featured cars...'
    ),

    /**
     * Fetch latest cars
     */
    getLatestCars: withLoading(
      async (limit) => {
        const response = await fetch(`/api/cars/latest?limit=${limit}`);
        return response.json();
      },
      'Loading latest cars...'
    ),

    /**
     * Add car to favorites
     */
    addToFavorites: withLoading(
      async (carId: string) => {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ carId }),
        });
        return response.json();
      },
      'Adding to favorites...'
    ),

    /**
     * Remove car from favorites
     */
    removeFromFavorites: withLoading(
      async (carId: string) => {
        const response = await fetch(`/api/favorites/${carId}`, {
          method: 'DELETE',
        });
        return response.json();
      },
      'Removing from favorites...'
    ),
  };
};

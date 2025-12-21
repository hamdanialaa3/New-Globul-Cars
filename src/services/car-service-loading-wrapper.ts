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
     * جلب جميع السيارات
     */
    getAllCars: withLoading(
      async () => {
        const response = await fetch('/api/cars');
        return response.json();
      },
      'جاري جلب السيارات...'
    ),

    /**
     * جلب سيارة بواسطة ID
     */
    getCarById: withLoading(
      async (id: string) => {
        const response = await fetch(`/api/cars/${id}`);
        return response.json();
      },
      'جاري تحميل السيارة...'
    ),

    /**
     * البحث عن السيارات
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
      'جاري البحث...'
    ),

    /**
     * إنشاء سيارة جديدة
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
      'جاري حفظ السيارة...'
    ),

    /**
     * تحديث سيارة
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
      'جاري تحديث البيانات...'
    ),

    /**
     * حذف سيارة
     */
    deleteCar: withLoading(
      async (id: string) => {
        const response = await fetch(`/api/cars/${id}`, {
          method: 'DELETE',
        });
        return response.json();
      },
      'جاري الحذف...'
    ),

    /**
     * جلب السيارات المميزة
     */
    getFeaturedCars: withLoading(
      async () => {
        const response = await fetch('/api/cars/featured');
        return response.json();
      },
      'جاري تحميل السيارات المميزة...'
    ),

    /**
     * جلب أحدث السيارات المضافة
     */
    getLatestCars: withLoading(
      async (limit) => {
        const response = await fetch(`/api/cars/latest?limit=${limit}`);
        return response.json();
      },
      'جاري تحميل أحدث السيارات...'
    ),

    /**
     * حفظ سيارة في المفضلة
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
      'جاري الحفظ في المفضلة...'
    ),

    /**
     * حذف سيارة من المفضلة
     */
    removeFromFavorites: withLoading(
      async (carId: string) => {
        const response = await fetch(`/api/favorites/${carId}`, {
          method: 'DELETE',
        });
        return response.json();
      },
      'جاري الحذف من المفضلة...'
    ),
  };
};

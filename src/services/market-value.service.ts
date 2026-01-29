// Market Value Calculation Service
// خدمة حساب القيمة السوقية

import { PersonalVehicle } from '../types/personal-vehicle.types';
import { logger } from './logger-service';

/**
 * Calculate market value for a personal vehicle
 * This is a simplified calculation - in production, you would use an external API
 * or a more sophisticated algorithm based on historical data
 */
export class MarketValueService {
  /**
   * Calculate market value based on vehicle data
   * This is a placeholder implementation
   */
  static async calculateMarketValue(
    vehicle: Partial<PersonalVehicle>
  ): Promise<number | null> {
    try {
      // Basic validation
      if (!vehicle.make || !vehicle.model || !vehicle.firstRegistration || !vehicle.currentMileage) {
        return null;
      }

      // Placeholder calculation
      // In production, this would:
      // 1. Query historical sales data
      // 2. Use external API (e.g., mobile.de API, Autoscout24 API)
      // 3. Apply depreciation formula based on age, mileage, condition
      
      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - vehicle.firstRegistration.year;
      const baseValue = 15000; // Base value in EUR (placeholder)
      
      // Simple depreciation: ~15% per year
      const ageDepreciation = baseValue * (1 - 0.15 * vehicleAge);
      
      // Mileage depreciation: ~0.05 EUR per km
      const mileageDepreciation = vehicle.currentMileage * 0.05;
      
      // Fuel type adjustment
      let fuelMultiplier = 1.0;
      if (vehicle.fuelType === 'electric') fuelMultiplier = 1.2;
      else if (vehicle.fuelType === 'hybrid') fuelMultiplier = 1.1;
      else if (vehicle.fuelType === 'diesel') fuelMultiplier = 0.95;
      
      // Transmission adjustment
      const transmissionMultiplier = vehicle.transmission === 'automatic' ? 1.1 : 1.0;
      
      // Calculate final value
      let estimatedValue = (ageDepreciation - mileageDepreciation) * fuelMultiplier * transmissionMultiplier;
      
      // Ensure minimum value
      estimatedValue = Math.max(estimatedValue, 1000);
      
      logger.info('Market value calculated', {
        vehicleId: vehicle.id,
        estimatedValue,
        vehicleAge,
        mileage: vehicle.currentMileage,
      });
      
      return Math.round(estimatedValue);
    } catch (error) {
      logger.error('Failed to calculate market value', error as Error, { vehicleId: vehicle.id });
      return null;
    }
  }

  /**
   * Get market value from cache or calculate
   */
  static async getMarketValue(
    vehicle: Partial<PersonalVehicle>,
    useCache: boolean = true
  ): Promise<number | null> {
    // In production, check cache first
    // For now, always calculate
    return this.calculateMarketValue(vehicle);
  }
}

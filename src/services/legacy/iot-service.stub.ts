/**
 * @deprecated IoT Service Stub - AWS SDK removed to reduce bundle size
 * @file This is a stub implementation kept for backward compatibility
 * @location Moved to src/services/legacy/ directory
 * @replacement If IoT features are needed, implement with lightweight alternative
 * @since Original implementation removed December 2024
 * @see https://github.com/hamdanialaa3/New-Globul-Cars/issues for feature requests
 * 
 * ⚠️ WARNING: This service does not provide any real functionality.
 * All methods return null or no-op functions.
 * 
 * Used by:
 * - src/services/platform-operations.ts
 * - src/hooks/useCarIoT.ts
 */

import { logger } from '../logger-service';

export interface CarTelemetryData {
  speed?: number;
  fuelLevel?: number;
  location?: { lat: number; lng: number };
  engineStatus?: string;
}

export interface CarShadow {
  state: {
    reported: CarTelemetryData;
  };
}

class IoTServiceStub {
  async getCarTelemetry(carId: string): Promise<CarTelemetryData | null> {
    logger.warn('IoT Service: AWS SDK removed - telemetry not available');
    return null;
  }

  async getCarShadow(carId: string): Promise<CarShadow | null> {
    logger.warn('IoT Service: AWS SDK removed - shadow not available');
    return null;
  }

  subscribeToCarUpdates(
    carId: string,
    callback: (data: CarTelemetryData) => void
  ): () => void {
    logger.warn('IoT Service: AWS SDK removed - subscriptions not available');
    return () => {}; // No-op unsubscribe
  }

  async notifyCarSale(carId: string): Promise<void> {
    logger.warn('IoT Service: AWS SDK removed - notifications not available');
  }
}

export const iotService = new IoTServiceStub();

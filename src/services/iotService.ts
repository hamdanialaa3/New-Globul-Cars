// IoT Service Stub - AWS SDK removed to reduce bundle size
// Re-implement with lightweight alternative if needed

import { logger } from './logger-service';

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

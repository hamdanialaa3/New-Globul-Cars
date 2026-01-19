/**
 * Global Type Augmentation
 * يعيد تعريف الأنواع الشاملة لتجنب أخطاء TypeScript
 */

declare global {
  interface Array<T> {
    /** Helper method for safe access */
    at(index: number): T | undefined;
  }
  
  interface Error {
    /** Optional error code */
    code?: string | number;
  }

  interface LocationData {
    /** Name of the city */
    cityName?: string;
    /** Name of the region */
    regionName?: string;
    /** District information */
    district?: string;
    /** Country name */
    country?: string;
    /** Geographic latitude */
    latitude?: number;
    /** Geographic longitude */
    longitude?: number;
    /** Postal code */
    postalCode?: string;
    /** Full address */
    address?: string;
    /** Area identifier */
    areaId?: string | number;
  }
}

// Extend global types to accept unknown in common patterns
declare module '@/services/logger-service' {
  interface ILogger {
    error(message: string, error?: Error | unknown, context?: any): void;
    warn(message: string, error?: Error | unknown, context?: any): void;
  }
}

export {};

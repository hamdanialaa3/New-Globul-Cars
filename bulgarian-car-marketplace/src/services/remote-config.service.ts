/**
 * Remote Config Service
 * ✅ P1: Enable feature flags and gradual rollout control
 * 
 * This service provides a simple wrapper for Firebase Remote Config
 * to control features like profile type switching validation.
 * 
 * File: src/services/remote-config.service.ts
 */

import { getRemoteConfig, fetchAndActivate, getValue, getBoolean, getString } from 'firebase/remote-config';
import { app } from '../firebase/firebase-config';
import { logger } from './logger-service';

class RemoteConfigService {
  private remoteConfig: ReturnType<typeof getRemoteConfig> | null = null;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Initialize Remote Config
   * Should be called once at app startup
   */
  async initialize(): Promise<void> {
    // If already initializing, return the same promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // If already initialized, return immediately
    if (this.initialized) {
      return Promise.resolve();
    }

    this.initializationPromise = (async () => {
      try {
        this.remoteConfig = getRemoteConfig(app);
        
        // Set config settings
        this.remoteConfig.settings = {
          minimumFetchIntervalMillis: 3600000, // 1 hour
          fetchTimeoutMillis: 60000, // 1 minute
        };

        // Set default values (fallback if fetch fails)
        this.remoteConfig.defaultConfig = {
          RC_PROFILE_SWITCH_GUARD_ENABLED: true,
          RC_DEALERSHIP_MIGRATION_ENABLED: false,
          RC_MAINTENANCE_MODE: false,
          RC_PROFILE_TYPE_RESTRICTIONS: JSON.stringify({
            private: { maxListings: 3 },
            dealer: { maxListings: 50 },
            company: { maxListings: 100 }
          })
        };

        // Fetch and activate
        await fetchAndActivate(this.remoteConfig);
        
        this.initialized = true;
        logger.info('Remote Config initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize Remote Config', error as Error);
        // Don't throw - we have default values as fallback
        this.initialized = true; // Mark as initialized anyway to prevent retry loops
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Get boolean value from Remote Config
   */
  getBoolean(key: string, fallback: boolean = false): boolean {
    try {
      if (!this.remoteConfig) {
        logger.warn(`Remote Config not initialized. Using fallback for ${key}: ${fallback}`);
        return fallback;
      }

      return getBoolean(this.remoteConfig, key);
    } catch (error) {
      logger.error(`Error getting boolean value for ${key}`, error as Error);
      return fallback;
    }
  }

  /**
   * Get string value from Remote Config
   */
  getString(key: string, fallback: string = ''): string {
    try {
      if (!this.remoteConfig) {
        logger.warn(`Remote Config not initialized. Using fallback for ${key}`);
        return fallback;
      }

      return getString(this.remoteConfig, key);
    } catch (error) {
      logger.error(`Error getting string value for ${key}`, error as Error);
      return fallback;
    }
  }

  /**
   * Get JSON value from Remote Config
   */
  getJSON<T = any>(key: string, fallback: T): T {
    try {
      const value = this.getString(key);
      if (!value) {
        return fallback;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Error parsing JSON value for ${key}`, error as Error);
      return fallback;
    }
  }

  /**
   * Check if profile switch guards are enabled
   */
  isProfileSwitchGuardEnabled(): boolean {
    return this.getBoolean('RC_PROFILE_SWITCH_GUARD_ENABLED', true);
  }

  /**
   * Check if dealership migration is enabled
   */
  isDealershipMigrationEnabled(): boolean {
    return this.getBoolean('RC_DEALERSHIP_MIGRATION_ENABLED', false);
  }

  /**
   * Check if maintenance mode is active
   */
  isMaintenanceMode(): boolean {
    return this.getBoolean('RC_MAINTENANCE_MODE', false);
  }

  /**
   * Get profile type restrictions
   */
  getProfileTypeRestrictions(): Record<string, { maxListings: number }> {
    return this.getJSON('RC_PROFILE_TYPE_RESTRICTIONS', {
      private: { maxListings: 3 },
      dealer: { maxListings: 50 },
      company: { maxListings: 100 }
    });
  }

  /**
   * Force fetch and activate new config
   * Useful for testing or after config updates
   */
  async refresh(): Promise<void> {
    if (!this.remoteConfig) {
      await this.initialize();
      return;
    }

    try {
      await fetchAndActivate(this.remoteConfig);
      logger.info('Remote Config refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh Remote Config', error as Error);
    }
  }
}

// Export singleton instance
export const remoteConfigService = new RemoteConfigService();

// Export default for convenience
export default remoteConfigService;


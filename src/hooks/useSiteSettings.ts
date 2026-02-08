import { useState, useEffect } from 'react';
import type { SiteSettings } from '@/services/site-settings-types';
import { siteSettingsService } from '@/services/site-settings.service';
import { DEFAULT_SITE_SETTINGS } from '@/services/site-settings-defaults';
import { serviceLogger } from '@/services/logger-service';

/**
 * React hook for accessing site settings with real-time updates.
 * Returns default settings with all features enabled if Firestore fails.
 */
export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;

    const unsubscribe = siteSettingsService.subscribeSiteSettings((data) => {
      if (isActive) {
        setSettings(data);
        setIsLoaded(true);
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  return {
    settings,
    isLoaded,
    // Convenience accessors
    isMaintenanceMode: settings.maintenanceMode,
    isRegistrationEnabled: settings.registrationEnabled,
    isFeatureEnabled: (feature: keyof SiteSettings['features']) => {
      return settings.features[feature] ?? true; // Fail-open
    }
  };
}

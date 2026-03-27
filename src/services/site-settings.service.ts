import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db as firestore } from '@/firebase/firebase-config';
import type {
  SiteSettings,
  ThemeSettings,
  FeaturedContent,
} from './site-settings-types';
import {
  SITE_SETTINGS_PATH,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_THEME_SETTINGS,
  DEFAULT_FEATURED_CONTENT,
  DEFAULT_HOMEPAGE_HERO,
} from './site-settings-defaults';
import { serviceLogger } from './logger-service';

/**
 * Singleton service for managing platform-wide settings.
 */
class SiteSettingsService {
  private static instance: SiteSettingsService;

  private constructor() {}

  public static getInstance(): SiteSettingsService {
    if (!SiteSettingsService.instance) {
      SiteSettingsService.instance = new SiteSettingsService();
    }
    return SiteSettingsService.instance;
  }

  private normalizeFeaturedContent(
    content?: Partial<FeaturedContent> | null
  ): FeaturedContent {
    const hero = content?.homepageHero;

    return {
      ...DEFAULT_FEATURED_CONTENT,
      ...content,
      homepageHero: {
        ...DEFAULT_HOMEPAGE_HERO,
        ...hero,
        trustItems: hero?.trustItems?.length
          ? hero.trustItems
          : DEFAULT_HOMEPAGE_HERO.trustItems,
      },
      homepageBanners: content?.homepageBanners?.length
        ? content.homepageBanners
        : DEFAULT_FEATURED_CONTENT.homepageBanners,
    };
  }

  // ═══════════════════════════════════════════════════════════
  //  SITE SETTINGS
  // ═══════════════════════════════════════════════════════════

  /**
   * Get current site settings from Firestore.
   */
  async getSiteSettings(): Promise<SiteSettings> {
    try {
      const docRef = doc(
        firestore,
        SITE_SETTINGS_PATH.collection,
        SITE_SETTINGS_PATH.siteSettings
      );
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        serviceLogger.info(
          'SiteSettingsService',
          'Site settings not found, returning defaults'
        );
        return DEFAULT_SITE_SETTINGS;
      }

      return docSnap.data() as SiteSettings;
    } catch (error) {
      serviceLogger.error(
        'SiteSettingsService',
        'Failed to get site settings',
        { error }
      );
      return DEFAULT_SITE_SETTINGS;
    }
  }

  /**
   * Update site settings in Firestore.
   */
  async updateSiteSettings(
    settings: Partial<SiteSettings>,
    updatedBy: string
  ): Promise<void> {
    try {
      const docRef = doc(
        firestore,
        SITE_SETTINGS_PATH.collection,
        SITE_SETTINGS_PATH.siteSettings
      );

      const updateData = {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy,
      };

      await setDoc(docRef, updateData, { merge: true });

      serviceLogger.info('SiteSettingsService', 'Site settings updated', {
        updatedBy,
        fields: Object.keys(settings),
      });
    } catch (error) {
      serviceLogger.error(
        'SiteSettingsService',
        'Failed to update site settings',
        { error, updatedBy }
      );
      throw error;
    }
  }

  /**
   * Subscribe to site settings changes.
   */
  subscribeSiteSettings(
    callback: (settings: SiteSettings) => void
  ): Unsubscribe {
    const docRef = doc(
      firestore,
      SITE_SETTINGS_PATH.collection,
      SITE_SETTINGS_PATH.siteSettings
    );

    return onSnapshot(
      docRef,
      snapshot => {
        if (snapshot.exists()) {
          callback(snapshot.data() as SiteSettings);
        } else {
          callback(DEFAULT_SITE_SETTINGS);
        }
      },
      error => {
        serviceLogger.error(
          'SiteSettingsService',
          'Site settings subscription error',
          { error }
        );
        callback(DEFAULT_SITE_SETTINGS);
      }
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  THEME SETTINGS
  // ═══════════════════════════════════════════════════════════

  /**
   * Get current theme settings from Firestore.
   */
  async getThemeSettings(): Promise<ThemeSettings> {
    try {
      const docRef = doc(
        firestore,
        SITE_SETTINGS_PATH.collection,
        SITE_SETTINGS_PATH.themeSettings
      );
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        serviceLogger.info(
          'SiteSettingsService',
          'Theme settings not found, returning defaults'
        );
        return DEFAULT_THEME_SETTINGS;
      }

      return docSnap.data() as ThemeSettings;
    } catch (error) {
      serviceLogger.error(
        'SiteSettingsService',
        'Failed to get theme settings',
        { error }
      );
      return DEFAULT_THEME_SETTINGS;
    }
  }

  /**
   * Update theme settings in Firestore.
   */
  async updateThemeSettings(
    settings: Partial<ThemeSettings>,
    updatedBy: string
  ): Promise<void> {
    try {
      const docRef = doc(
        firestore,
        SITE_SETTINGS_PATH.collection,
        SITE_SETTINGS_PATH.themeSettings
      );

      const updateData = {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy,
      };

      await setDoc(docRef, updateData, { merge: true });

      serviceLogger.info('SiteSettingsService', 'Theme settings updated', {
        updatedBy,
      });
    } catch (error) {
      serviceLogger.error(
        'SiteSettingsService',
        'Failed to update theme settings',
        { error, updatedBy }
      );
      throw error;
    }
  }

  /**
   * Subscribe to theme settings changes.
   */
  subscribeThemeSettings(
    callback: (settings: ThemeSettings) => void
  ): Unsubscribe {
    const docRef = doc(
      firestore,
      SITE_SETTINGS_PATH.collection,
      SITE_SETTINGS_PATH.themeSettings
    );

    return onSnapshot(
      docRef,
      snapshot => {
        if (snapshot.exists()) {
          callback(snapshot.data() as ThemeSettings);
        } else {
          callback(DEFAULT_THEME_SETTINGS);
        }
      },
      error => {
        serviceLogger.error(
          'SiteSettingsService',
          'Theme settings subscription error',
          { error }
        );
        callback(DEFAULT_THEME_SETTINGS);
      }
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  FEATURED CONTENT
  // ═══════════════════════════════════════════════════════════

  /**
   * Get featured content from Firestore.
   */
  async getFeaturedContent(): Promise<FeaturedContent> {
    try {
      const docRef = doc(
        firestore,
        SITE_SETTINGS_PATH.collection,
        SITE_SETTINGS_PATH.featuredContent
      );
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        serviceLogger.info(
          'SiteSettingsService',
          'Featured content not found, returning defaults'
        );
        return DEFAULT_FEATURED_CONTENT;
      }

      return this.normalizeFeaturedContent(
        docSnap.data() as Partial<FeaturedContent>
      );
    } catch (error) {
      serviceLogger.error(
        'SiteSettingsService',
        'Failed to get featured content',
        { error }
      );
      return DEFAULT_FEATURED_CONTENT;
    }
  }

  /**
   * Update featured content in Firestore.
   */
  async updateFeaturedContent(
    content: Partial<FeaturedContent>,
    updatedBy: string
  ): Promise<void> {
    try {
      const docRef = doc(
        firestore,
        SITE_SETTINGS_PATH.collection,
        SITE_SETTINGS_PATH.featuredContent
      );

      const updateData = {
        ...content,
        updatedAt: new Date().toISOString(),
        updatedBy,
      };

      await setDoc(docRef, updateData, { merge: true });

      serviceLogger.info('SiteSettingsService', 'Featured content updated', {
        updatedBy,
      });
    } catch (error) {
      serviceLogger.error(
        'SiteSettingsService',
        'Failed to update featured content',
        { error, updatedBy }
      );
      throw error;
    }
  }

  /**
   * Subscribe to featured content changes.
   */
  subscribeFeaturedContent(
    callback: (content: FeaturedContent) => void
  ): Unsubscribe {
    const docRef = doc(
      firestore,
      SITE_SETTINGS_PATH.collection,
      SITE_SETTINGS_PATH.featuredContent
    );

    return onSnapshot(
      docRef,
      snapshot => {
        if (snapshot.exists()) {
          callback(
            this.normalizeFeaturedContent(
              snapshot.data() as Partial<FeaturedContent>
            )
          );
        } else {
          callback(DEFAULT_FEATURED_CONTENT);
        }
      },
      error => {
        serviceLogger.error(
          'SiteSettingsService',
          'Featured content subscription error',
          { error }
        );
        callback(DEFAULT_FEATURED_CONTENT);
      }
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  SEED DEFAULTS
  // ═══════════════════════════════════════════════════════════

  /**
   * Initialize all settings with defaults.
   */
  async seedAllDefaults(updatedBy: string): Promise<void> {
    try {
      const promises = [
        this.updateSiteSettings(DEFAULT_SITE_SETTINGS, updatedBy),
        this.updateThemeSettings(DEFAULT_THEME_SETTINGS, updatedBy),
        this.updateFeaturedContent(DEFAULT_FEATURED_CONTENT, updatedBy),
      ];

      await Promise.all(promises);

      serviceLogger.info(
        'SiteSettingsService',
        'All settings seeded with defaults',
        {
          updatedBy,
        }
      );
    } catch (error) {
      serviceLogger.error('SiteSettingsService', 'Failed to seed defaults', {
        error,
        updatedBy,
      });
      throw error;
    }
  }
}

export const siteSettingsService = SiteSettingsService.getInstance();

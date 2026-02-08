import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { serviceLogger } from '@/services/logger-service';
import { SECTION_VISIBILITY_PATH, DEFAULT_HOMEPAGE_SECTIONS } from './section-visibility-defaults';
import type { HomepageSectionsConfig, HomepageSection } from './section-visibility-types';

/**
 * Singleton service for reading/writing homepage section visibility.
 * Follows the same pattern as SuperAdminOperations and AdminService.
 *
 * Firestore doc: app_settings/homepage_sections
 */
class SectionVisibilityService {
  private static _instance: SectionVisibilityService;

  static getInstance(): SectionVisibilityService {
    if (!this._instance) {
      this._instance = new SectionVisibilityService();
    }
    return this._instance;
  }

  private getDocRef() {
    return doc(db, SECTION_VISIBILITY_PATH.collection, SECTION_VISIBILITY_PATH.docId);
  }

  /**
   * Get all sections sorted by order.
   * Auto-seeds defaults if document doesn't exist yet.
   */
  async getAll(): Promise<HomepageSection[]> {
    try {
      const ref = this.getDocRef();
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        serviceLogger.info('[SectionVisibility] No config found, seeding defaults');
        await this.seedDefaults('system-auto');
        return [...DEFAULT_HOMEPAGE_SECTIONS].sort((a, b) => a.order - b.order);
      }

      const data = snap.data() as HomepageSectionsConfig;
      return [...data.sections].sort((a, b) => a.order - b.order);
    } catch (error) {
      serviceLogger.error('[SectionVisibility] Failed to getAll:', error);
      // Fallback: return defaults with everything visible
      return [...DEFAULT_HOMEPAGE_SECTIONS].sort((a, b) => a.order - b.order);
    }
  }

  /**
   * Toggle a single section's visibility.
   */
  async toggle(key: string, visible: boolean, updatedBy: string): Promise<void> {
    try {
      const ref = this.getDocRef();
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await this.seedDefaults(updatedBy);
        // After seeding, toggle the requested key
        const freshSnap = await getDoc(ref);
        if (!freshSnap.exists()) return;
        const data = freshSnap.data() as HomepageSectionsConfig;
        const sections = data.sections.map((s) =>
          s.key === key ? { ...s, visible } : s
        );
        await updateDoc(ref, { sections, updatedAt: new Date().toISOString(), updatedBy });
        return;
      }

      const data = snap.data() as HomepageSectionsConfig;
      const sections = data.sections.map((s) =>
        s.key === key ? { ...s, visible } : s
      );

      await updateDoc(ref, {
        sections,
        updatedAt: new Date().toISOString(),
        updatedBy,
      });

      serviceLogger.info(`[SectionVisibility] Toggled "${key}" to ${visible} by ${updatedBy}`);
    } catch (error) {
      serviceLogger.error(`[SectionVisibility] Failed to toggle "${key}":`, error);
      throw error;
    }
  }

  /**
   * Reorder sections by providing the keys in desired order.
   */
  async reorder(orderedKeys: string[], updatedBy: string): Promise<void> {
    try {
      const ref = this.getDocRef();
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await this.seedDefaults(updatedBy);
        return;
      }

      const data = snap.data() as HomepageSectionsConfig;
      const map = new Map<string, HomepageSection>();
      data.sections.forEach((s) => map.set(s.key, s));

      const reordered: HomepageSection[] = [];
      orderedKeys.forEach((k, index) => {
        const existing = map.get(k);
        if (existing) {
          reordered.push({ ...existing, order: index + 1 });
          map.delete(k);
        }
      });

      // Sections not in orderedKeys stay at the end
      Array.from(map.values()).forEach((s) => {
        reordered.push({ ...s, order: reordered.length + 1 });
      });

      await updateDoc(ref, {
        sections: reordered,
        updatedAt: new Date().toISOString(),
        updatedBy,
      });

      serviceLogger.info(`[SectionVisibility] Reordered by ${updatedBy}`);
    } catch (error) {
      serviceLogger.error('[SectionVisibility] Failed to reorder:', error);
      throw error;
    }
  }

  /**
   * Seed the Firestore document with defaults.
   * Called automatically on first access.
   */
  async seedDefaults(updatedBy: string): Promise<void> {
    try {
      const ref = this.getDocRef();
      const config: HomepageSectionsConfig = {
        sections: DEFAULT_HOMEPAGE_SECTIONS,
        updatedAt: new Date().toISOString(),
        updatedBy,
      };
      await setDoc(ref, config, { merge: false });
      serviceLogger.info(`[SectionVisibility] Seeded defaults by ${updatedBy}`);
    } catch (error) {
      serviceLogger.error('[SectionVisibility] Failed to seed defaults:', error);
      throw error;
    }
  }
}

export const sectionVisibilityService = SectionVisibilityService.getInstance();

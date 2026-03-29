import { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import {
  SECTION_VISIBILITY_PATH,
  DEFAULT_HOMEPAGE_SECTIONS,
} from '@/services/section-visibility-defaults';
import type {
  HomepageSectionsConfig,
  HomepageSection,
} from '@/services/section-visibility-types';

/**
 * Hook for reading homepage section visibility in real-time.
 * Uses Firestore onSnapshot — changes from the admin panel
 * reflect immediately on the homepage without refresh.
 *
 * IMPORTANT: Must follow the isActive guard pattern to avoid
 * state updates after unmount (per project rules).
 *
 * Initialised with DEFAULT_HOMEPAGE_SECTIONS so the first render
 * uses the dynamic code-path (same as after Firestore loads).
 * This prevents the fallback→dynamic re-render that caused CLS.
 */
export function useSectionVisibility() {
  const [sections, setSections] = useState<HomepageSection[]>(
    DEFAULT_HOMEPAGE_SECTIONS
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isActive = true; // isActive guard per project convention

    const ref = doc(
      db,
      SECTION_VISIBILITY_PATH.collection,
      SECTION_VISIBILITY_PATH.docId
    );

    const unsub = onSnapshot(
      ref,
      snap => {
        if (!isActive) return; // Guard against unmount

        if (!snap.exists()) {
          // No config yet — show everything by default
          setSections([]);
          setIsLoaded(true);
          return;
        }

        const data = snap.data() as HomepageSectionsConfig;
        const sorted = [...data.sections].sort((a, b) => a.order - b.order);
        setSections(sorted);
        setIsLoaded(true);
      },
      error => {
        if (!isActive) return;
        // On error, fail open — show everything
        setSections([]);
        setIsLoaded(true);
      }
    );

    return () => {
      isActive = false;
      unsub();
    };
  }, []);

  /**
   * Check if a section should be visible.
   * Returns true if:
   * - Config hasn't loaded yet (fail open — show everything while loading)
   * - Section key is not in the config (new section, show by default)
   * - Section is explicitly set to visible
   */
  const isVisible = useCallback(
    (key: string): boolean => {
      if (sections.length === 0) return true; // No config or loading — show all
      const section = sections.find(s => s.key === key);
      return section ? section.visible : true; // Unknown key — show by default
    },
    [sections]
  );

  return { sections, isLoaded, isVisible };
}

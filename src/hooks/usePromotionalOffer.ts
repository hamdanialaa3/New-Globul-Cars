/**
 * usePromotionalOffer.ts
 * Hook for reading the "Free Offer" promotional toggle in real-time.
 *
 * Firestore doc: app_settings/promotional_offer
 *
 * When active:
 *  - Prices show red strikethrough + "FREE" badge on the homepage banner
 *  - Subscription page skips payment and directly activates the plan
 *  - Users can choose dealer/company plan freely without paying
 *
 * When inactive:
 *  - Normal payment flow (manual bank transfer) is required
 *  - Dealer/company accounts cannot be activated without payment
 *
 * Admin toggle lives in SectionControlPanel → "العرض المجاني" / "Free Offer"
 *
 * IMPORTANT: Follows isActive guard pattern (project convention).
 */

import { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';

// ─── Firestore Path ───
const PROMO_DOC_PATH = {
  collection: 'app_settings',
  docId: 'promotional_offer',
} as const;

// ─── Types ───
export interface PromotionalOfferConfig {
  /** true = free offer active, false = payment required */
  isActive: boolean;
  /** ISO 8601 — when last toggled */
  updatedAt: string;
  /** Admin email who toggled */
  updatedBy: string;
  /** Optional motivational text shown on the FREE badge */
  motivationalText?: {
    bg: string;
    en: string;
  };
}

// ─── Default State ───
const DEFAULT_CONFIG: PromotionalOfferConfig = {
  isActive: false,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
  motivationalText: {
    bg: '🎉 Специална оферта — Безплатно за ограничен период!',
    en: '🎉 Special Offer — Free for a limited time!',
  },
};

// ─── Hook ───
export function usePromotionalOffer() {
  const [config, setConfig] = useState<PromotionalOfferConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isActive = true; // isActive guard per project convention

    const ref = doc(db, PROMO_DOC_PATH.collection, PROMO_DOC_PATH.docId);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!isActive) return;

        if (!snap.exists()) {
          // No config yet — free offer is OFF by default
          setConfig(DEFAULT_CONFIG);
          setIsLoaded(true);
          return;
        }

        const data = snap.data() as PromotionalOfferConfig;
        const newConfig = {
          isActive: data.isActive ?? false,
          updatedAt: data.updatedAt ?? new Date().toISOString(),
          updatedBy: data.updatedBy ?? 'unknown',
          motivationalText: data.motivationalText ?? DEFAULT_CONFIG.motivationalText,
        };
        setConfig(newConfig);
        setIsLoaded(true);

        // Debug: log state changes for troubleshooting
        if (typeof window !== 'undefined' && (window as any).__PROMO_DEBUG !== false) {
          // eslint-disable-next-line no-console
          logger.debug('[usePromotionalOffer] State:', newConfig.isActive ? 'ACTIVE ✅' : 'OFF ❌', newConfig);
        }
      },
      (error) => {
        if (!isActive) return;
        // On error, fail closed — payment required
        setConfig(DEFAULT_CONFIG);
        setIsLoaded(true);
      }
    );

    return () => {
      isActive = false;
      unsub();
    };
  }, []);

  /** Whether the free offer is currently active */
  const isFreeOffer = config.isActive;

  return { config, isLoaded, isFreeOffer };
}

// ─── Admin Toggle Function (used by SectionControlPanel) ───

/**
 * Toggle the promotional free offer on/off.
 * Called from the SuperAdmin panel.
 */
export async function togglePromotionalOffer(
  active: boolean,
  adminEmail: string
): Promise<void> {
  const ref = doc(db, PROMO_DOC_PATH.collection, PROMO_DOC_PATH.docId);

  const snap = await getDoc(ref);
  const existing = snap.exists() ? (snap.data() as PromotionalOfferConfig) : DEFAULT_CONFIG;

  await setDoc(ref, {
    ...existing,
    isActive: active,
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail,
  });
}

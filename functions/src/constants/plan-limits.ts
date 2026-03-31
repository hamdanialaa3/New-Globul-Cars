/**
 * Plan limits used by Cloud Functions.
 *
 * IMPORTANT:
 * Keep these values aligned with src/config/subscription-plans.ts (web SSOT).
 * This local copy exists because Functions code cannot import from src/.
 */

export type PlanTier = 'free' | 'dealer' | 'company';

export const PLAN_MAX_LISTINGS: Record<PlanTier, number> = {
  free: 3,
  dealer: 20,
  company: -1,
};

const PLAN_TIER_ALIASES: Record<string, PlanTier> = {
  free: 'free',
  dealer: 'dealer',
  pro: 'dealer',
  professional: 'dealer',
  company: 'company',
  enterprise: 'company',
};

export function normalizePlanTier(rawTier: unknown): PlanTier {
  const normalized = String(rawTier || '')
    .trim()
    .toLowerCase();
  return PLAN_TIER_ALIASES[normalized] || 'free';
}

export function getPlanMaxListings(rawTier: unknown): number {
  const tier = normalizePlanTier(rawTier);
  return PLAN_MAX_LISTINGS[tier];
}

# Subscription System Overview

Updated: January 8, 2026

This document is the single source of truth for the subscription system. It replaces prior scattered reports and phase docs. Use this to understand the plans, features, Stripe integration, and maintenance workflow.

## Plans & Pricing

- Free: €0/mo — 3 listings/month
- Dealer: €27.78/mo (or €278/yr) — 30 listings/month
- Company: €137.88/mo (or €1,288/yr) — Unlimited listings

## Feature Matrix

- Listings/month: 3 / 30 / Unlimited
- Analytics: — / Basic / Advanced
- Bulk upload: — / ✓ / ✓
- Featured badge: — / ✓ / ✓
- Team management: 0 / 3 / 10
- API access: — / — / ✓
- Priority support: — / ✓ / ✓
- Marketing campaigns: — / 5 / Unlimited

## Single Source of Truth

- Config: `src/config/subscription-plans.ts`
  - Exports `SUBSCRIPTION_PLANS` with tiers (`free`, `dealer`, `company`), features, pricing, and `stripePriceIds`.
  - Update this file to change pricing, features, or Stripe price IDs.

## Architecture

- Services:
  - `src/services/billing/subscription-service.ts`
    - Creates checkout sessions via Firebase Stripe extension (`customers/{uid}/checkout_sessions`).
    - Returns `{ url, sessionId }` for controlled redirects.
  - `src/features/billing/BillingService.ts`
    - Derives UI-ready plans dynamically from `SUBSCRIPTION_PLANS`.

- UI:
  - `src/components/subscription/SubscriptionManager.tsx`
    - Displays cards; renders features dynamically from plan data.
  - `src/pages/08_payment-billing/SubscriptionPage.tsx`
    - Comparison table synced to plan limits and features.

## Checkout Flow

1. Client calls `createCheckoutSession(userId, planId, interval, successUrl, cancelUrl)`.
2. Write to Firestore `customers/{uid}/checkout_sessions` (Stripe extension processes it).
3. Use `result.url` to redirect to Stripe Checkout.
4. Webhooks (handled by the Stripe extension) update subscription status in Firestore.

Test card: `4242 4242 4242 4242` (any future date, CVC 123).

## Maintenance

- Verify Stripe price IDs in dashboard match `stripePriceIds` in `subscription-plans.ts`.
- Run `npm run type-check` before commits; run `npm run build` before deploy.
- Ensure all subscription UI uses `SUBSCRIPTION_PLANS` for consistency.

## Notes

- URLs never expose Firebase UIDs — numeric ID system enforced.
- Use `logger` service; `console.*` is banned in `src/`.
- Firestore listeners must use the `isActive` flag to avoid memory leaks.

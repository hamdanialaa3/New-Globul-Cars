# القسم 27: Remote Config and Feature Flags (P1)

## 27.1 Feature Flags Configuration

```typescript
FEATURE_FLAGS = {
  enable_dealer_upgrade: boolean (default: true)
  enable_company_upgrade: boolean (default: true)
  verification_auto_approve: boolean (default: false - testing only)
  enable_subscriptions: boolean (default: true)
  enable_messaging: boolean (default: true)
  enable_reviews: boolean (default: true)
  enable_analytics: boolean (default: true)
  enable_team_management: boolean (default: true)
  enable_2fa: boolean (default: false)
  maintenance_mode: boolean (default: false)
  max_listing_images: number (default: 20)
  max_file_size_mb: number (default: 5)
};

PLAN_CONFIGURATION = {
  listing_caps: { free: 3, premium: 10, dealer_basic: 50, ... }
  pricing: { premium: { monthly: 9.99, annual: 99 }, ... }
  features_by_plan: { ... }
};

TRUST_SCORE_WEIGHTS = {
  email_verified: 30,
  phone_verified: 20,
  id_verified: 20,
  ...
};

COMMISSION_RATES = {
  private: 0,
  dealer: 0.02,
  company: 0.015,
  ...
};
```

Implementation: bulgarian-car-marketplace/src/services/remote-config.service.ts

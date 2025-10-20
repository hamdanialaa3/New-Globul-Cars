# القسم 29: i18n Structure and Translation Management (P1)

## 29.1 Translation Architecture

```
SOURCE OF TRUTH:
  File: bulgarian-car-marketplace/src/locales/translations.ts
  Format: Nested objects with keys
  Languages: Bulgarian (primary), English (secondary)

NAMESPACE ORGANIZATION:
  common: Shared across app
  profile: Profile page features
  verification: Document upload
  billing: Subscriptions, payments
  analytics: Dashboard, metrics
  reviews: Reviews and ratings
  messaging: Chat, conversations
  errors: Error messages
  legal: Terms, privacy policy

LEGAL TEXT MANAGEMENT:
  - Stored in Remote Config (not hardcoded)
  - Versioned: terms_of_service_v2, privacy_policy_v3
  - User acceptance tracked
  - Update without deploy

WORKFLOW:
  1. Developer adds key in translations.ts (BG + EN)
  2. Component uses: const { t } = useLanguage()
  3. Legal updates: Admin updates Remote Config
  4. Missing keys: Fallback to key name
```

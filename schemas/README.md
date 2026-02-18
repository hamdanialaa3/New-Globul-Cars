# Data Schemas

Versioned JSON Schema definitions for all Koli One Firestore collections.

## Files

| Schema | Description | Firestore Collection |
|--------|-------------|---------------------|
| [Listing.v1.json](Listing.v1.json) | Vehicle listing (car, truck, bus, etc.) | `cars`, `trucks`, `buses`, `trailers`, `caravans`, `agricultural` |
| [User.v1.json](User.v1.json) | User profile (private, dealer, company) | `users` |
| [Story.v1.json](Story.v1.json) | Car video story (15s, 24h expiry) | `stories` |
| [Campaign.v1.json](Campaign.v1.json) | Promotional campaign | `campaigns` |

## Conventions

- All schemas use JSON Schema draft-07.
- Version is encoded in the filename: `Entity.v{N}.json`.
- `additionalProperties: true` on Listing and User to allow gradual migration.
- Currency is always EUR. Locale is Bulgaria (bg/en).
- Firebase UIDs are stored internally but never exposed in public URLs.
  Public URLs use `numericId` (users) and `sellerNumericId/carNumericId` (listings).

## Usage

These schemas serve as documentation and can be used for:
- Runtime validation (e.g., `ajv` library)
- Code generation
- API contract reference
- Onboarding new developers

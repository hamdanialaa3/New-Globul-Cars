/**
 * @koli-one/shared SDK
 *
 * Unified service interfaces and shared business logic for web and mobile platforms.
 * Platform-specific adapters implement these interfaces.
 *
 * Services covered:
 * 1. Listings — CRUD, queries across 6 vehicle collections
 * 2. Messaging — Conversations, messages, read receipts
 * 3. Reviews — Seller/dealer reviews and ratings
 * 4. Analytics — Event tracking, page views
 * 5. Search — Algolia + Firestore hybrid search
 */

// Interfaces
export * from './interfaces/listing.interface';
export * from './interfaces/messaging.interface';
export * from './interfaces/review.interface';
export * from './interfaces/analytics.interface';
export * from './interfaces/search.interface';

// Shared logic
export * from './listing-queries';

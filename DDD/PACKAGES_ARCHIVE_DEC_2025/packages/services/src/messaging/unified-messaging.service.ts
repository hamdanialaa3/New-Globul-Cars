/**
 * UNIFIED MESSAGING SERVICE
 * 
 * Consolidates messaging services into one canonical source:
 * - realtimeMessaging.ts (422 lines) → Primary, keep as canonical
 * - messaging/messaging.service.ts (397 lines) → Move to DDD
 * 
 * This file serves as the canonical export point.
 * 
 * @since 2025-11-03 (Phase 1.3)
 */

// Re-export everything from realtimeMessaging as the canonical source
export * from '../realtimeMessaging';
export { default as messagingService } from '../realtimeMessaging';

// For backward compatibility, also export as UnifiedMessagingService
import realtimeMessaging from '../realtimeMessaging';
export const unifiedMessagingService = realtimeMessaging;


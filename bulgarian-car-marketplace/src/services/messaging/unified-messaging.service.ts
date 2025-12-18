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

// Re-export everything from realtime-messaging-service as the canonical source
export * from '../realtime-messaging-service';
export { realtimeMessagingService as messagingService } from '../realtime-messaging-service';

// For backward compatibility, also export as UnifiedMessagingService
import { realtimeMessagingService } from '../realtime-messaging-service';
export const unifiedMessagingService = realtimeMessagingService;


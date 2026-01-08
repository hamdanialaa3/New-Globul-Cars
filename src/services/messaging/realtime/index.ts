/**
 * 🚀 Realtime Messaging Module Index
 * فهرس وحدة الرسائل في الوقت الحقيقي
 * 
 * @description Central export for all realtime messaging services
 * التصدير المركزي لجميع خدمات الرسائل في الوقت الحقيقي
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date January 8, 2026
 */

// ==================== SERVICES ====================

export { 
  realtimeMessagingService,
  default as RealtimeMessagingService,
} from './realtime-messaging.service';

export {
  presenceService,
  default as PresenceService,
} from './presence.service';

export {
  typingIndicatorService,
  default as TypingIndicatorService,
} from './typing-indicator.service';

export {
  pushNotificationService,
  default as PushNotificationService,
} from './push-notification.service';

// ==================== TYPES ====================

export type {
  RealtimeMessage,
  RealtimeMessageMetadata,
  RealtimeChannel,
  ChannelParticipant,
  CreateChannelParams,
} from './realtime-messaging.service';

export type {
  PresenceStatus,
  PresenceCallback,
} from './presence.service';

export type {
  TypingState,
  TypingCallback,
} from './typing-indicator.service';

export type {
  NotificationData,
  NotificationCallback,
} from './push-notification.service';

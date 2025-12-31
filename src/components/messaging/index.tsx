/**
 * Messaging Components - Barrel Export
 * 
 * نقطة دخول موحدة لجميع مكونات المراسلة
 * Unified entry point for all messaging components
 */

// Styles
export * from './messaging-styles';

// Phase 2 Components - NEW
export { ConversationView } from './ConversationView';
export { QuickActionsPanel } from './QuickActionsPanel';
export { ChatAnalyticsDashboard } from './ChatAnalyticsDashboard';
export { InteractiveMessageBubble } from './InteractiveMessageBubble';
export type { Message } from './InteractiveMessageBubble';
export { OfferBubble } from './OfferBubble';
export type { Offer } from './OfferBubble';
export { PresenceIndicator, PresenceWithAvatar } from './PresenceIndicator';
export type { PresenceStatus, PresenceInfo } from './PresenceIndicator';
export { AIChatbotWidget } from './AIChatbotWidget';

// Default exports for backward compatibility
export { default as Conversation } from './ConversationView';
export { default as QuickActions } from './QuickActionsPanel';
export { default as Analytics } from './ChatAnalyticsDashboard';
export { default as MessageBubble } from './InteractiveMessageBubble';
export { default as Offer } from './OfferBubble';
export { default as Presence } from './PresenceIndicator';

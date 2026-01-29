/**
 * MESSAGING CORE SERVICES
 * -----------------------
 * نقطة دخول موحدة لجميع خدمات المراسلة الأساسية
 * 
 * @architect Senior System Architect
 * @compliance PROJECT_CONSTITUTION.md
 * @date December 29, 2025
 */

// Core Services
export { messagingOrchestrator } from './messaging-orchestrator';
export { deliveryEngine } from './delivery-engine';
export { presenceMonitor } from './presence-monitor';

// Types
export type { DeliveryStatus } from './delivery-engine';
export type { PresenceStatus, UserPresence } from './presence-monitor';

// Actions
export { offerWorkflowService } from '../actions/offer-workflow.service';
export type { Offer, OfferStatus } from '../actions/offer-workflow.service';

// Analytics
export { messagingAnalytics } from '../analytics/messaging-analytics.service';
export type { 
  MessageAnalytics, 
  ConversationAnalyticsSummary 
} from '../analytics/messaging-analytics.service';

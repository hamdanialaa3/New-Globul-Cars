import { messagingOrchestrator } from './core/messaging-orchestrator';
import { deliveryEngine } from './core/delivery-engine';
import { messagingAnalytics } from './analytics/messaging-analytics.service';

/**
 * Messaging Facade
 * Lightweight entrypoint that unifies messaging operations across
 * orchestrator, delivery, and analytics layers. Keep this thin to avoid
 * duplicating logic; delegates to existing services.
 */
class MessagingFacade {
  private static instance: MessagingFacade;

  static getInstance(): MessagingFacade {
    if (!MessagingFacade.instance) {
      MessagingFacade.instance = new MessagingFacade();
    }
    return MessagingFacade.instance;
  }

  async sendMessage(params: Parameters<typeof messagingOrchestrator.sendMessage>[0]): Promise<string> {
    const messageId = await messagingOrchestrator.sendMessage(params);
    await messagingAnalytics.trackMessageSent(params.conversationId, 'text').catch(() => {});
    return messageId;
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await deliveryEngine.markConversationAsRead(conversationId, userId);
    await messagingAnalytics.trackMessagesRead(conversationId).catch(() => {});
  }

  async updateStatus(conversationId: string, messageId: string, status: Parameters<typeof deliveryEngine.updateStatus>[2]): Promise<void> {
    await deliveryEngine.updateStatus(conversationId, messageId, status);
  }

  async getConversation(conversationId: string, strategy: Parameters<typeof messagingOrchestrator.getConversation>[1] = 'speed') {
    return messagingOrchestrator.getConversation(conversationId, strategy);
  }
}

export const messagingFacade = MessagingFacade.getInstance();
export default messagingFacade;

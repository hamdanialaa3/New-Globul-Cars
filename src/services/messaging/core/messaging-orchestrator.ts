import { logger } from '@/services/logger-service';
import type { Message } from '../advanced-messaging-types';
import { MessageSender } from './modules/MessageSender';
import { ConversationLoader } from './modules/ConversationLoader';
import { ActionHandler } from './modules/ActionHandler';
import { StatusManager } from './modules/StatusManager';

/**
 * MESSAGING ORCHESTRATOR (FACADE)
 * --------------------------------------
 * المنسق المركزي لجميع عمليات المراسلة
 * 
 * Facade pattern that delegates to specialized modules
 * 
 * @architect Senior System Architect
 * @compliance PROJECT_CONSTITUTION.md (DRY, Analysis First, <300 lines)
 * @date December 29, 2025
 */
class MessagingOrchestrator {
  private static instance: MessagingOrchestrator;
  private messageSender: MessageSender;
  private conversationLoader: ConversationLoader;
  private actionHandler: ActionHandler;
  private statusManager: StatusManager;

  private constructor() {
    this.messageSender = new MessageSender();
    this.conversationLoader = new ConversationLoader();
    this.actionHandler = new ActionHandler(this.messageSender);
    this.statusManager = new StatusManager();
    logger.info('[MessagingOrchestrator] Initialized');
  }

  static getInstance(): MessagingOrchestrator {
    if (!this.instance) {
      this.instance = new MessagingOrchestrator();
    }
    return this.instance;
  }

  // ==================== MESSAGE OPERATIONS ====================

  async sendMessage(params: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    type?: 'text' | 'offer' | 'action' | 'voice' | 'location' | 'test-drive';
    carId?: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    return this.messageSender.sendMessage(params);
  }

  async getConversation(
    conversationId: string,
    strategy: 'speed' | 'history' = 'speed'
  ): Promise<Message[]> {
    return this.conversationLoader.getConversation(conversationId, strategy);
  }

  // ==================== ACTION OPERATIONS ====================

  async sendOffer(params: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    carId: string;
    offerAmount: number;
    currency?: string;
    message?: string;
  }): Promise<string> {
    return this.actionHandler.sendOffer(params);
  }

  async requestTestDrive(
    conversationId: string,
    senderId: string,
    receiverId: string,
    carId: string,
    date: number,
    locationType: 'dealer_location' | 'client_location' | 'neutral_ground',
    location?: string,
    notes?: string
  ): Promise<string> {
    return this.actionHandler.requestTestDrive(
      conversationId,
      senderId,
      receiverId,
      carId,
      date,
      locationType,
      location,
      notes
    );
  }

  // ==================== STATUS OPERATIONS ====================

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    return this.statusManager.markAsRead(conversationId, userId);
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    return this.statusManager.deleteMessage(messageId, userId);
  }

  async archiveConversation(conversationId: string, userId: string): Promise<void> {
    return this.statusManager.archiveConversation(conversationId, userId);
  }
}

export const messagingOrchestrator = MessagingOrchestrator.getInstance();

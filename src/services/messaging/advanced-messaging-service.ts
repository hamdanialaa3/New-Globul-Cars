import { messagingOrchestrator } from './core/messaging-orchestrator';

export interface MessageAttachment {
  id?: string;
  type: string;
  name: string;
  url: string;
  size: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text?: string;
  content?: string;
  type?: string;
  metadata?: Record<string, unknown>;
  attachments?: MessageAttachment[];
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Conversation {
  id: string;
  participants: string[];
  metadata?: Record<string, unknown>;
}

export interface TypingIndicator {
  userId: string;
  isTyping: boolean;
}

export class AdvancedMessagingService {
  async findConversation(_userA: string, _userB: string, _carId?: string): Promise<string | null> {
    return null;
  }

  async createConversation(participants: string[], metadata?: Record<string, unknown>): Promise<string> {
    const conversationId = `conv_${Date.now()}`;
    await messagingOrchestrator
      .sendMessage({
        conversationId,
        senderId: participants[0] || 'system',
        receiverId: participants[1] || 'system',
        text: '',
        language: 'bg',
        metadata: { ...metadata, bootstrap: true },
      })
      .catch(() => {});
    return conversationId;
  }

  async sendMessage(conversationId: string, senderId: string, receiverId: string, text: string, metadata?: Record<string, unknown>): Promise<string> {
    return messagingOrchestrator.sendMessage({
      conversationId,
      senderId,
      receiverId,
      text,
      language: 'bg',
      metadata,
    });
  }

  async sendSystemMessage(conversationId: string, senderId: string, receiverId: string, text: string, metadata?: Record<string, unknown>): Promise<string> {
    return this.sendMessage(conversationId, senderId, receiverId, text, {
      ...metadata,
      type: 'system',
    });
  }

  async sendMessageWithAttachments(
    conversationId: string,
    senderId: string,
    receiverId: string,
    text: string,
    attachments: Array<MessageAttachment | File>,
    metadata?: Record<string, unknown>
  ): Promise<string> {
    return this.sendMessage(conversationId, senderId, receiverId, text, {
      ...metadata,
      attachments,
    });
  }

  async setTyping(_conversationId: string, _userId: string, _isTyping: boolean): Promise<void> {
    return;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const loaded = await messagingOrchestrator.getConversation(conversationId, 'balanced');
    return loaded.messages as unknown as Message[];
  }
}

export const advancedMessagingService = new AdvancedMessagingService();

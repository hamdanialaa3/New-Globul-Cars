// src/services/realtime-messaging-utils.ts
// Utility functions for Real-time Messaging Service

import { logger } from './logger-service';

/**
 * Generate a consistent conversation ID based on participants and car
 */
export function generateConversationId(senderId: string, receiverId: string, carId?: string): string {
  // Create consistent ID regardless of order
  const sortedIds = [senderId, receiverId].sort();
  if (carId) {
    return `${sortedIds[0]}_${sortedIds[1]}_${carId}`;
  }
  return `${sortedIds[0]}_${sortedIds[1]}`;
}

/**
 * Generate a consistent chat room ID based on participants and car
 */
export function generateChatRoomId(userId1: string, userId2: string, carId?: string): string {
  // Create consistent chat room ID regardless of order
  const sortedIds = [userId1, userId2].sort();
  if (carId) {
    return `${sortedIds[0]}_${sortedIds[1]}_${carId}`;
  }
  return `${sortedIds[0]}_${sortedIds[1]}`;
}

/**
 * Validate message data before sending
 */
export function validateMessageData(messageData: any): { isValid: boolean; error?: string } {
  if (!messageData.senderId) {
    return { isValid: false, error: 'Sender ID is required' };
  }
  if (!messageData.receiverId) {
    return { isValid: false, error: 'Receiver ID is required' };
  }
  if (!messageData.content && !messageData.text) {
    return { isValid: false, error: 'Message content is required' };
  }
  if (messageData.senderId === messageData.receiverId) {
    return { isValid: false, error: 'Cannot send message to yourself' };
  }
  return { isValid: true };
}

/**
 * Convert Firestore timestamp to Date
 */
export function convertTimestampToDate(timestamp: any): Date {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
}

/**
 * Create a typing document ID
 */
export function createTypingDocId(conversationId: string, senderId: string): string {
  return `${conversationId}_${senderId}`;
}

/**
 * Check if user is participant in conversation
 */
export function isUserParticipant(userId: string, participants: string[]): boolean {
  return participants.includes(userId);
}

/**
 * Get other participant in conversation
 */
export function getOtherParticipant(userId: string, participants: string[]): string | null {
  const otherParticipants = participants.filter(id => id !== userId);
  return otherParticipants.length > 0 ? otherParticipants[0] : null;
}
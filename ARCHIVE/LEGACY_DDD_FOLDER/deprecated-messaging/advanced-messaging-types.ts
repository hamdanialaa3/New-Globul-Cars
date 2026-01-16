/**
 * Advanced Messaging Types
 * أنواع الرسائل المتقدمة
 *
 * This module contains all TypeScript interfaces and types for the messaging system.
 * يحتوي هذا الوحدة على جميع واجهات TypeScript لنظام الرسائل.
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Message interface
 * واجهة الرسالة
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  type: 'text' | 'image' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
  readAt?: Date;
  attachments?: MessageAttachment[];
  carId?: string;
  metadata?: any;
}

/**
 * Conversation interface
 * واجهة المحادثة
 */
export interface Conversation {
  id: string;
  participants: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMessageAt: Timestamp;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
  };
  unreadCount: { [userId: string]: number };
  typing: { [userId: string]: boolean };
  carId?: string;
  carTitle?: string;
  carPrice?: number;
  carImageUrl?: string;
  carLogoUrl?: string; // NEW: شعار السيارة (brand logo)
  carMake?: string; // NEW: ماركة السيارة
  sellerNumericId?: number; // NEW: Numeric ID للبائع
  carNumericId?: number; // NEW: Numeric ID للسيارة
  otherParticipant?: {
    id: string;
    name: string;
    avatar?: string;
    numericId?: number;
  };
}

/**
 * Message attachment interface
 * واجهة مرفق الرسالة
 */
export interface MessageAttachment {
  id: string;
  type: 'image' | 'document';
  url: string;
  name: string;
  size: number;
}

/**
 * Rate limit configuration
 * إعدادات الحد من المعدل
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Rate limit result
 * نتيجة الحد من المعدل
 */
export interface RateLimitResult {
  allowed: boolean;
  resetTime: number;
}

/**
 * Typing callback type
 * نوع رد الاتصال للكتابة
 */
export type TypingCallback = (typing: { [userId: string]: boolean }) => void;

/**
 * Messages callback type
 * نوع رد الاتصال للرسائل
 */
export type MessagesCallback = (messages: Message[]) => void;

/**
 * Conversations callback type
 * نوع رد الاتصال للمحادثات
 */
export type ConversationsCallback = (conversations: Conversation[]) => void;

/**
 * Message callback type
 * نوع رد الاتصال للرسالة
 */
export type MessageCallback = (message: Message) => void;
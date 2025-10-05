// src/components/Messaging/index.ts
// Messaging Components Index - ملف ربط مكونات المحادثات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

/**
 * Messaging Components Module
 * 
 * مكونات نظام المحادثات المتقدم
 * Advanced messaging system components
 * 
 * Available Components:
 * 1. MessageInput - إدخال الرسالة
 * 2. MessageBubble - فقاعة الرسالة
 * 3. TypingIndicator - مؤشر الكتابة
 * 4. ConversationList - قائمة المحادثات
 * 5. ChatWindow - نافذة المحادثة الكاملة
 */

// ==================== EXPORTS ====================

export { default as MessageInput } from './MessageInput';
export { default as MessageBubble } from './MessageBubble';
export { default as TypingIndicator } from './TypingIndicator';
export { default as ConversationList } from './ConversationList';
export { default as ChatWindow } from './ChatWindow';

// ==================== USAGE EXAMPLES ====================

/**
 * Example 1: Message Input
 * 
 * import { MessageInput } from './components/Messaging';
 * 
 * <MessageInput
 *   conversationId="conv123"
 *   senderId="user1"
 *   receiverId="user2"
 *   onSend={() => console.log('Message sent')}
 * />
 */

/**
 * Example 2: Chat Window (Complete)
 * 
 * import { ChatWindow } from './components/Messaging';
 * 
 * <ChatWindow
 *   conversationId="conv123"
 *   currentUserId="user1"
 *   receiverId="user2"
 *   receiverName="John Doe"
 *   onBack={() => console.log('Back clicked')}
 * />
 */

/**
 * Example 3: Conversation List
 * 
 * import { ConversationList } from './components/Messaging';
 * 
 * <ConversationList
 *   conversations={conversations}
 *   activeConversationId="conv123"
 *   currentUserId="user1"
 *   onSelectConversation={(id) => console.log(id)}
 * />
 */

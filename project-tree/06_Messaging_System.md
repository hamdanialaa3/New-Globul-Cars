# 💬 Messaging System Documentation
## نظام المراسلة - توثيق شامل

> **Last Updated:** January 23, 2026  
> **Version:** 0.4.0  
> **Status:** ✅ Production Ready (Phase 3 - Hybrid Firebase Complete)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Realtime Messaging](#realtime-messaging)
4. [Channel System](#channel-system)
5. [Message Types](#message-types)
6. [Presence System](#presence-system)
7. [Push Notifications](#push-notifications)
8. [Technical Implementation](#technical-implementation)

---

## 🎯 Overview

The Messaging System is a hybrid Firebase solution that combines Firebase Realtime Database for real-time messaging with Firestore for message archiving. It supports text messages, offers, images, typing indicators, read receipts, and presence tracking.

### Key Features

- **Real-time Messaging** - Instant message delivery via Realtime Database
- **Deterministic Channels** - Unique channel IDs prevent duplicates
- **Numeric ID System** - Privacy-first user identification
- **Presence Tracking** - Online/Offline status
- **Typing Indicators** - Real-time typing status
- **Read Receipts** - Message read status
- **Offer System** - Price offers and counter-offers
- **Push Notifications** - FCM notifications for offline users

---

## 🏗️ Architecture

### Hybrid Firebase System

**Phase 3 Implementation:** Hybrid Firebase (Realtime Database + Firestore)

**Components:**
- **Realtime Database** - Fast, real-time message delivery
- **Firestore** - Message archiving and search
- **Cloud Functions** - Push notifications, message processing

### System Architecture

```
┌─────────────────┐
│   Client App    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│ RTDB  │ │Firestore│
│(Real- │ │(Archive)│
│ time) │ └─────────┘
└───┬───┘
    │
┌───▼──────────┐
│Cloud Functions│
│(Notifications)│
└───────────────┘
```

### File Structure

```
src/services/messaging/
├── realtime/
│   ├── realtime-messaging.service.ts    # Main service
│   ├── presence.service.ts               # Online/Offline tracking
│   ├── typing-indicator.service.ts      # Typing indicators
│   └── push-notification.service.ts     # FCM notifications
├── core/
│   ├── messaging-orchestrator.ts        # Facade pattern
│   └── modules/
│       ├── MessageSender.ts
│       ├── ConversationLoader.ts
│       └── ActionHandler.ts
└── advanced-messaging-types.ts           # TypeScript types

src/components/messaging/
├── realtime/
│   ├── ChatWindow.tsx                    # Main chat UI
│   ├── ChannelList.tsx                   # Channel sidebar
│   ├── ChannelListItem.tsx               # Channel item
│   ├── MessageBubble.tsx                 # Message display
│   ├── MessageInput.tsx                  # Message input
│   └── index.ts
└── [legacy components]

src/hooks/messaging/
└── useRealtimeMessaging.ts               # Main hook
```

---

## ⚡ Realtime Messaging

### Realtime Messaging Service

**Location:** `src/services/messaging/realtime/realtime-messaging.service.ts`

**Purpose:** Handle all real-time messaging operations

**Key Methods:**
```typescript
class RealtimeMessagingService {
  // Send message
  async sendMessage(params: {
    channelId: string;
    senderNumericId: number;
    senderFirebaseId: string;
    recipientNumericId: number;
    content: string;
    type: 'text' | 'offer' | 'image';
    metadata?: any;
  }): Promise<string>
  
  // Get messages for channel
  async getMessages(channelId: string, limit?: number): Promise<RealtimeMessage[]>
  
  // Listen to new messages
  subscribeToMessages(channelId: string, callback: (messages: RealtimeMessage[]) => void): Unsubscribe
  
  // Mark message as read
  async markAsRead(channelId: string, messageId: string, readerNumericId: number): Promise<void>
  
  // Delete message
  async deleteMessage(channelId: string, messageId: string, senderNumericId: number): Promise<void>
}
```

### Message Structure

```typescript
interface RealtimeMessage {
  id: string;                    // Message ID
  channelId: string;             // Channel ID
  senderId: number;              // Sender numeric ID
  senderNumericId: number;       // Alias for senderId
  senderFirebaseId: string;      // Firebase UID for verification
  recipientId: number;           // Recipient numeric ID
  recipientFirebaseId: string;   // Firebase UID
  content: string;                // Message content
  type: 'text' | 'offer' | 'image' | 'system' | 'location';
  timestamp: number;              // Unix timestamp
  serverTimestamp?: object;       // Firebase server timestamp
  read: boolean;                 // Read status
  readAt?: number;               // Read timestamp
  metadata?: {
    offerAmount?: number;        // For offer messages
    offerStatus?: 'pending' | 'accepted' | 'rejected' | 'countered';
    imageUrl?: string;            // For image messages
    carId?: number;               // Related car numeric ID
    carImage?: string;            // Car image URL
    carPrice?: number;            // Car price
  };
}
```

---

## 📡 Channel System

### Channel ID Generation

**Pattern:** Deterministic channel IDs prevent duplicates

**Format:**
```
msg_{min(user1,user2)}_{max(user1,user2)}_car_{carId}

Example: msg_5_18_car_42
```

**Implementation:**
```typescript
function generateChannelId(
  user1NumericId: number,
  user2NumericId: number,
  carNumericId: number
): string {
  const min = Math.min(user1NumericId, user2NumericId);
  const max = Math.max(user1NumericId, user2NumericId);
  return `msg_${min}_${max}_car_${carNumericId}`;
}
```

### Channel Structure (Realtime Database)

```
/channels/{channelId}/
  ├── buyerNumericId: 5
  ├── sellerNumericId: 18
  ├── carNumericId: 42
  ├── carImage: "https://..."
  ├── carPrice: 15000
  ├── lastMessage: {
  │     content: "Hello",
  │     timestamp: 1234567890,
  │     senderId: 5
  │   }
  ├── messages/
  │   ├── {messageId1}/
  │   │   ├── content: "Hello"
  │   │   ├── senderId: 5
  │   │   ├── timestamp: 1234567890
  │   │   └── read: false
  │   └── {messageId2}/...
  └── metadata/
      ├── createdAt: 1234567890
      └── updatedAt: 1234567890
```

### Channel List Component

**Component:** `ChannelList.tsx`

**Location:** `src/components/messaging/realtime/ChannelList.tsx`

**Features:**
- List all user's channels
- Search/filter channels
- Unread message count
- Last message preview
- Car information display
- Online/Offline status
- Mobile responsive (sidebar)

**Usage:**
```typescript
const { channels, selectChannel, currentChannel } = useRealtimeMessaging(userNumericId, firebaseId);

<ChannelList
  channels={channels}
  currentChannelId={currentChannel?.id}
  onSelectChannel={selectChannel}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
/>
```

---

## 📨 Message Types

### Text Message

**Type:** `type: 'text'`

**Structure:**
```typescript
{
  id: string;
  channelId: string;
  senderId: number;
  content: "Hello, is the car still available?";
  type: 'text';
  timestamp: number;
  read: false;
}
```

### Offer Message

**Type:** `type: 'offer'`

**Structure:**
```typescript
{
  id: string;
  channelId: string;
  senderId: number;
  content: "I offer €12,000";
  type: 'offer';
  timestamp: number;
  read: false;
  metadata: {
    offerAmount: 12000;
    offerStatus: 'pending';
    carId: 42;
    carPrice: 15000;
  };
}
```

**Offer Statuses:**
- `pending` - Awaiting response
- `accepted` - Offer accepted
- `rejected` - Offer rejected
- `countered` - Counter-offer made

### Image Message

**Type:** `type: 'image'`

**Structure:**
```typescript
{
  id: string;
  channelId: string;
  senderId: number;
  content: "Check this out";
  type: 'image';
  timestamp: number;
  read: false;
  metadata: {
    imageUrl: "https://storage.../image.webp";
    thumbnailUrl: "https://storage.../thumb.webp";
  };
}
```

### System Message

**Type:** `type: 'system'`

**Purpose:** System notifications (e.g., "User joined", "Offer accepted")

**Structure:**
```typescript
{
  id: string;
  channelId: string;
  senderId: 0; // System user
  content: "Offer accepted";
  type: 'system';
  timestamp: number;
  read: true; // System messages are auto-read
}
```

---

## 👁️ Presence System

### Presence Service

**Location:** `src/services/messaging/realtime/presence.service.ts`

**Purpose:** Track user online/offline status

**Realtime Database Structure:**
```
/presence/{numericId}/
  ├── online: true
  ├── lastSeen: 1234567890
  └── currentPage: "/messages"
```

**Methods:**
```typescript
class PresenceService {
  // Set user online
  async setOnline(numericId: number, firebaseId: string): Promise<void>
  
  // Set user offline
  async setOffline(numericId: number): Promise<void>
  
  // Update last seen
  async updateLastSeen(numericId: number): Promise<void>
  
  // Get user presence
  async getPresence(numericId: number): Promise<Presence | null>
  
  // Subscribe to presence changes
  subscribeToPresence(numericId: number, callback: (presence: Presence) => void): Unsubscribe
}
```

**Presence Interface:**
```typescript
interface Presence {
  online: boolean;
  lastSeen: number;
  currentPage?: string;
}
```

### Last Seen Display

**Format:**
- "Online" - If online now
- "Last seen 5 minutes ago" - If offline < 1 hour
- "Last seen today at 14:30" - If offline today
- "Last seen yesterday" - If offline yesterday
- "Last seen 3 days ago" - If offline > 1 day

---

## ⌨️ Typing Indicators

### Typing Indicator Service

**Location:** `src/services/messaging/realtime/typing-indicator.service.ts`

**Purpose:** Show when user is typing

**Realtime Database Structure:**
```
/typing/{channelId}/{numericId}/
  └── isTyping: true
```

**Methods:**
```typescript
class TypingIndicatorService {
  // Set typing status
  async setTyping(channelId: string, numericId: number, isTyping: boolean): Promise<void>
  
  // Subscribe to typing status
  subscribeToTyping(channelId: string, callback: (typingUsers: number[]) => void): Unsubscribe
}
```

**Implementation:**
```typescript
// When user types
const handleInputChange = (text: string) => {
  if (text.length > 0) {
    typingService.setTyping(channelId, userNumericId, true);
  } else {
    typingService.setTyping(channelId, userNumericId, false);
  }
};

// Debounce to avoid too many updates
const debouncedSetTyping = debounce((isTyping: boolean) => {
  typingService.setTyping(channelId, userNumericId, isTyping);
}, 500);
```

---

## 🔔 Push Notifications

### Push Notification Service

**Location:** `src/services/messaging/realtime/push-notification.service.ts`

**Purpose:** Send FCM notifications for offline users

**Implementation:**
```typescript
class PushNotificationService {
  // Send notification
  async sendNotification(params: {
    recipientFirebaseId: string;
    title: string;
    body: string;
    data?: any;
    channelId?: string;
  }): Promise<void>
  
  // Check if user is online
  async isUserOnline(numericId: number): Promise<boolean>
}
```

**Notification Types:**
1. **New Message** - "John sent you a message"
2. **New Offer** - "John made an offer: €12,000"
3. **Offer Accepted** - "Your offer was accepted"
4. **Offer Rejected** - "Your offer was rejected"

**Cloud Function:**
```typescript
// functions/src/messaging/send-notification.ts
export const onNewMessage = functions.database
  .ref('/channels/{channelId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const message = snapshot.val();
    const recipientId = message.recipientId;
    
    // Check if recipient is online
    const presence = await admin.database().ref(`/presence/${recipientId}`).once('value');
    if (presence.val()?.online) {
      return; // User is online, no notification needed
    }
    
    // Send FCM notification
    await admin.messaging().send({
      token: recipientFCMToken,
      notification: {
        title: 'New Message',
        body: message.content
      },
      data: {
        channelId: context.params.channelId,
        type: 'message'
      }
    });
  });
```

---

## 🎣 useRealtimeMessaging Hook

### Hook Usage

**Location:** `src/hooks/messaging/useRealtimeMessaging.ts`

**Purpose:** Main hook for messaging functionality

**Usage:**
```typescript
const {
  channels,              // All user's channels
  currentChannel,        // Currently selected channel
  messages,              // Messages for current channel
  isLoading,             // Loading state
  sendMessage,           // Send text message
  sendOffer,             // Send offer
  selectChannel,         // Select channel
  markAsRead,            // Mark messages as read
  isTyping,              // Typing status
  presence               // User presence
} = useRealtimeMessaging(userNumericId, firebaseId, {
  autoMarkAsRead: true
});
```

**Options:**
```typescript
interface UseRealtimeMessagingOptions {
  autoMarkAsRead?: boolean;      // Auto-mark messages as read
  limit?: number;                 // Message limit per channel
  enablePresence?: boolean;       // Enable presence tracking
  enableTyping?: boolean;         // Enable typing indicators
}
```

---

## 🔧 Technical Implementation

### Realtime Database Rules

```json
{
  "rules": {
    "channels": {
      "$channelId": {
        ".read": "auth != null && (
          data.child('buyerNumericId').val() == root.child('users').child(auth.uid).child('numericId').val() ||
          data.child('sellerNumericId').val() == root.child('users').child(auth.uid).child('numericId').val()
        )",
        ".write": "auth != null && (
          data.child('buyerNumericId').val() == root.child('users').child(auth.uid).child('numericId').val() ||
          data.child('sellerNumericId').val() == root.child('users').child(auth.uid).child('numericId').val()
        )",
        "messages": {
          "$messageId": {
            ".validate": "newData.hasChildren(['senderId', 'content', 'timestamp'])"
          }
        }
      }
    },
    "presence": {
      "$numericId": {
        ".read": "auth != null",
        ".write": "auth != null && $numericId == root.child('users').child(auth.uid).child('numericId').val()"
      }
    }
  }
}
```

### Message Sending Flow

```typescript
1. User types message and clicks send
2. Validate message content
3. Generate message ID
4. Create message object
5. Write to Realtime Database: /channels/{channelId}/messages/{messageId}
6. Update channel lastMessage
7. Check if recipient is online
8. If offline, trigger Cloud Function for push notification
9. Update UI with new message
10. Archive to Firestore (optional, for search)
```

### Message Reading Flow

```typescript
1. User opens channel
2. Load messages from Realtime Database
3. Mark all messages as read
4. Update read status in database
5. Update unread count in channel list
6. Clear notification badge
```

---

## 📱 UI Components

### Chat Window

**Component:** `ChatWindow.tsx`

**Location:** `src/components/messaging/realtime/ChatWindow.tsx`

**Features:**
- Message list with scroll
- Message input
- Typing indicator
- Read receipts
- Offer display
- Image preview
- Car information header
- Mobile responsive

### Message Input

**Component:** `MessageInput.tsx`

**Features:**
- Text input
- Emoji picker
- Image upload
- Offer button
- Send button
- Typing indicator trigger

### Message Bubble

**Component:** `MessageBubble.tsx`

**Features:**
- Message content display
- Timestamp
- Read receipt (blue checkmark)
- Offer display (special styling)
- Image display
- Sender avatar
- Message actions (delete, edit)

---

## 🔍 Best Practices

### Performance

1. **Limit message history** - Load last 50 messages, paginate older
2. **Debounce typing indicators** - Avoid excessive updates
3. **Cache channel list** - Reduce database reads
4. **Lazy load images** - Load images on demand
5. **Cleanup listeners** - Always unsubscribe on unmount

### Security

1. **Validate sender** - Verify Firebase UID matches numeric ID
2. **Check channel access** - Verify user is participant
3. **Sanitize content** - Prevent XSS attacks
4. **Rate limiting** - Prevent spam
5. **Content moderation** - Filter inappropriate content

### User Experience

1. **Show typing indicators** - Real-time feedback
2. **Mark as read automatically** - When channel is open
3. **Push notifications** - For offline users
4. **Unread badges** - Clear visual indicators
5. **Message search** - Find old messages

---

## 🔗 Related Documentation

- [User Authentication & Profile](./02_User_Authentication_and_Profile.md)
- [Car Listing Creation](./03_Car_Listing_Creation.md)
- [PROJECT_CONSTITUTION.md](../PROJECT_CONSTITUTION.md)

---

**Last Updated:** January 23, 2026  
**Maintained By:** Development Team  
**Status:** ✅ Production Ready (Phase 3 Complete)

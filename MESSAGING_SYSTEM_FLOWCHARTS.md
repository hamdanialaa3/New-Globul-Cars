# 📊 مخططات سير نظام المراسلة
# Messaging System Flowcharts & Diagrams

**المشروع:** Bulgarian Car Marketplace  
**التاريخ:** 4 يناير 2026  
**النسخة:** 2.0.0

---

## المحتويات | Contents

1. [نظرة عامة على البنية](#نظرة-عامة-على-البنية)
2. [سير إرسال الرسالة](#سير-إرسال-الرسالة)
3. [سير إدارة العروض](#سير-إدارة-العروض)
4. [سير تتبع الحالات](#سير-تتبع-الحالات)
5. [سير الاشتراكات](#سير-الاشتراكات)
6. [Component Hierarchy](#component-hierarchy)
7. [Database Relations](#database-relations)
8. [Error Handling Flow](#error-handling-flow)

---

## نظرة عامة على البنية

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          MESSAGING SYSTEM                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                            USER LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│  Browser/Mobile App                                                  │
│  - React Components                                                  │
│  - State Management (Context API)                                    │
│  - Real-time Listeners                                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP/WebSocket
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                       FRONTEND SERVICES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │          MESSAGING ORCHESTRATOR (Facade)                     │  │
│  │  - Single entry point                                        │  │
│  │  - Delegates to specialized modules                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             │                                        │
│  ┌──────────────────────────┴───────────────────────────────────┐  │
│  │                                                               │  │
│  │  ┌─────────────────┐  ┌──────────────────┐                  │  │
│  │  │  MessageSender  │  │ ConversationLoader│                  │  │
│  │  └─────────────────┘  └──────────────────┘                  │  │
│  │                                                               │  │
│  │  ┌─────────────────┐  ┌──────────────────┐                  │  │
│  │  │ ActionHandler   │  │  StatusManager   │                  │  │
│  │  └─────────────────┘  └──────────────────┘                  │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         ADVANCED MESSAGING SERVICE (Singleton)               │  │
│  │  - CRUD Operations                                           │  │
│  │  - Rate Limiting                                             │  │
│  │  - File Uploads                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              SUPPORT SERVICES                                │  │
│  │  - DeliveryEngine      (Status tracking)                     │  │
│  │  - PresenceMonitor     (Online/typing indicators)            │  │
│  │  - MessagingAnalytics  (Metrics & insights)                  │  │
│  │  - OfferWorkflowService (Offer management)                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Firebase SDK
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                         FIREBASE BACKEND                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │    FIRESTORE     │  │   STORAGE        │  │   AUTH          │  │
│  │                  │  │                  │  │                 │  │
│  │ - messages       │  │ - attachments/   │  │ - users         │  │
│  │ - conversations  │  │   images/        │  │ - tokens        │  │
│  │ - users          │  │   documents/     │  │ - sessions      │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐                        │
│  │ CLOUD FUNCTIONS  │  │   FCM (Push)     │                        │
│  │                  │  │                  │                        │
│  │ - onMessageSent  │  │ - notifications  │                        │
│  │ - onOfferUpdate  │  │ - device tokens  │                        │
│  └──────────────────┘  └──────────────────┘                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## سير إرسال الرسالة

### Message Send Flow - Complete

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MESSAGE SEND WORKFLOW                           │
└─────────────────────────────────────────────────────────────────────┘

    [User Types Message]
            │
            ▼
    ┌───────────────────┐
    │  MessageInput     │ ← User interface component
    │  Component        │
    └─────────┬─────────┘
              │
              │ onSend() event
              │
              ▼
    ┌───────────────────┐
    │ messagingOrchestrator.sendMessage() │
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────┐
    │ Rate Limit Check  │ ← 10 messages/minute max
    └─────────┬─────────┘
              │
              ├─────────────────┐
              │ ✅ Allowed      │ ❌ Exceeded
              │                 │
              ▼                 ▼
    ┌───────────────────┐   [Throw Error: "Wait X seconds"]
    │ Validate Message  │
    │ - Not empty       │
    │ - Max 5000 chars  │
    │ - Valid UTF-8     │
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────┐
    │ MessageSender     │
    │ .sendMessage()    │
    └─────────┬─────────┘
              │
              ├─────────────────────────────────┐
              │                                 │
              ▼                                 ▼
    ┌───────────────────┐           ┌──────────────────┐
    │ Create Message    │           │ Update UI        │
    │ Document          │           │ (Optimistic)     │
    │ in Firestore      │           │ Show "sending"   │
    └─────────┬─────────┘           └──────────────────┘
              │
              │ Success
              │
              ▼
    ┌───────────────────┐
    │ Update            │
    │ Conversation      │
    │ - lastMessage     │
    │ - updatedAt       │
    │ - lastMessageAt   │
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────┐
    │ Increment         │
    │ Unread Count      │
    │ for Recipient     │
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────┐
    │ DeliveryEngine    │
    │ .updateStatus()   │
    │ Status: "sent"    │
    └─────────┬─────────┘
              │
              ├─────────────────────────────────┐
              │                                 │
              ▼                                 ▼
    ┌───────────────────┐           ┌──────────────────┐
    │ Trigger FCM       │           │ Real-time        │
    │ Notification      │           │ Listener         │
    │ to Recipient      │           │ Updates UI       │
    └───────────────────┘           └──────────────────┘
              │
              │ Recipient Device Online?
              │
              ├─────────────────┐
              │ ✅ Yes          │ ❌ No
              │                 │
              ▼                 ▼
    ┌───────────────────┐   [Store for later delivery]
    │ Show Push         │
    │ Notification      │
    └───────────────────┘
              │
              │ User Opens App
              │
              ▼
    ┌───────────────────┐
    │ DeliveryEngine    │
    │ .updateStatus()   │
    │ Status: "delivered"│
    └─────────┬─────────┘
              │
              │ User Opens Conversation
              │
              ▼
    ┌───────────────────┐
    │ markAsRead()      │
    │ Status: "read"    │
    │ Update readAt     │
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────┐
    │ Notify Sender     │
    │ (✓✓ Blue)         │
    └───────────────────┘
              │
              ▼
    ┌───────────────────┐
    │ Track Analytics   │
    │ - Response time   │
    │ - Engagement      │
    └───────────────────┘
```

### Error Handling in Message Send

```
[Error Occurs During Send]
         │
         ▼
┌────────────────────┐
│ Catch Error        │
└────────┬───────────┘
         │
         ├──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
┌────────────────────┐              ┌─────────────────────┐
│ Network Error      │              │ Rate Limit Error    │
└────────┬───────────┘              └─────────┬───────────┘
         │                                      │
         ▼                                      ▼
┌────────────────────┐              ┌─────────────────────┐
│ Add to Retry Queue │              │ Show Toast:         │
│ Max 3 retries      │              │ "Please wait X sec" │
└────────┬───────────┘              └─────────────────────┘
         │
         │ Wait 2 seconds
         │
         ▼
┌────────────────────┐
│ Retry Send         │
└────────┬───────────┘
         │
         ├─────────────────┐
         │ ✅ Success      │ ❌ Failed Again
         │                 │
         ▼                 ▼
┌────────────────────┐  [Retry Count++]
│ Update Status:     │         │
│ "sent"             │         │
└────────────────────┘         │
                               │ Count < 3?
                               │
                               ├─────────────┐
                               │ Yes         │ No
                               │             │
                               ▼             ▼
                       [Retry Again]  ┌──────────────────┐
                                      │ Mark as "failed" │
                                      │ Show Error UI    │
                                      └──────────────────┘
```

---

## سير إدارة العروض

### Offer Workflow - Complete Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                      OFFER MANAGEMENT WORKFLOW                       │
└─────────────────────────────────────────────────────────────────────┘

              [Buyer Clicks "Send Offer"]
                        │
                        ▼
              ┌─────────────────────┐
              │ Open Offer Modal    │
              │ - Amount input      │
              │ - Currency selector │
              │ - Optional message  │
              └──────────┬──────────┘
                        │
                        │ User enters: €25,000
                        │
                        ▼
              ┌─────────────────────┐
              │ Validate Offer      │
              │ - Amount > 0        │
              │ - Amount < Price*1.5│
              │ - Not spam          │
              └──────────┬──────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │ messagingOrchestrator│
              │ .sendOffer()        │
              └──────────┬──────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │ Create Message      │
              │ type: "offer"       │
              │ metadata: {         │
              │   offerAmount: 25000│
              │   currency: "EUR"   │
              │   expiryDate: +7d   │
              │   status: "pending" │
              │ }                   │
              └──────────┬──────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │ Send System Message │
              │ "New offer: €25,000"│
              └──────────┬──────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │ Trigger FCM Push    │
              │ to Seller           │
              └──────────┬──────────┘
                        │
                        │ Seller Opens Conversation
                        │
                        ▼
              ┌─────────────────────┐
              │ Display OfferBubble │
              │ - Amount            │
              │ - Timer countdown   │
              │ - 3 buttons:        │
              │   [Accept]          │
              │   [Reject]          │
              │   [Counter]         │
              └──────────┬──────────┘
                        │
            ┌───────────┼───────────┐
            │           │           │
            ▼           ▼           ▼
    ┌──────────┐  ┌─────────┐  ┌─────────┐
    │ ACCEPT   │  │ REJECT  │  │ COUNTER │
    └────┬─────┘  └────┬────┘  └────┬────┘
         │             │             │
         │             │             │
         ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │ Update Offer     │    │ Update Offer     │              │
│  │ status: "accepted"    │ status: "rejected"              │
│  └────────┬─────────┘    └────────┬─────────┘              │
│           │                       │                         │
│           ▼                       ▼                         │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │ System Message:  │    │ System Message:  │              │
│  │ "Offer accepted ✅"   │ "Offer rejected ❌"             │
│  └────────┬─────────┘    └────────┬─────────┘              │
│           │                       │                         │
│           ▼                       ▼                         │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │ Track Conversion │    │ End Workflow     │              │
│  │ Event            │    │                  │              │
│  └────────┬─────────┘    └──────────────────┘              │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────────┐                                      │
│  │ (Optional)       │                                      │
│  │ Redirect to      │                                      │
│  │ Payment Flow     │                                      │
│  └──────────────────┘                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                                      │
                                      │ COUNTER OFFER PATH
                                      │
                                      ▼
                          ┌──────────────────────┐
                          │ Open Counter Modal   │
                          │ Prefill: €25,000     │
                          │ Seller enters: €23,000│
                          └───────────┬──────────┘
                                      │
                                      ▼
                          ┌──────────────────────┐
                          │ Create New Offer     │
                          │ type: "offer"        │
                          │ offerAmount: 23000   │
                          │ originalOfferId: ... │
                          └───────────┬──────────┘
                                      │
                                      ▼
                          ┌──────────────────────┐
                          │ Mark Original as     │
                          │ status: "countered"  │
                          └───────────┬──────────┘
                                      │
                                      ▼
                          ┌──────────────────────┐
                          │ System Message:      │
                          │ "Counter: €23,000"   │
                          └───────────┬──────────┘
                                      │
                                      ▼
                          ┌──────────────────────┐
                          │ Notify Buyer (FCM)   │
                          └───────────┬──────────┘
                                      │
                                      │ Loop back to
                                      │ Buyer's turn
                                      │
                                      ▼
                          [Buyer sees new offer bubble]
```

### Offer Expiry Handling

```
[Offer Created with expiryDate = Now + 7 days]
                │
                ▼
    ┌─────────────────────────┐
    │ Start Countdown Timer   │
    │ (Client-side)           │
    └─────────┬───────────────┘
              │
              │ Every second: update UI
              │
              ▼
    ┌─────────────────────────┐
    │ Display remaining time: │
    │ "Expires in 6d 23h 59m" │
    └─────────┬───────────────┘
              │
              │ Time reaches 0
              │
              ▼
    ┌─────────────────────────┐
    │ Update offer metadata:  │
    │ status: "expired"       │
    └─────────┬───────────────┘
              │
              ▼
    ┌─────────────────────────┐
    │ Disable action buttons  │
    │ Show "Expired" badge    │
    └─────────────────────────┘
```

---

## سير تتبع الحالات

### Message Status Tracking

```
┌─────────────────────────────────────────────────────────────────────┐
│                     MESSAGE STATUS LIFECYCLE                         │
└─────────────────────────────────────────────────────────────────────┘

    [Message Created]
          │
          │ Initial state
          │
          ▼
    ┌──────────┐
    │ sending  │ ← Optimistic UI update
    └─────┬────┘   Gray checkmark (✓)
          │
          │ Firestore write succeeds
          │
          ▼
    ┌──────────┐
    │   sent   │ ← Message stored in DB
    └─────┬────┘   Single gray checkmark (✓)
          │
          │ Recipient's device receives via FCM
          │
          ▼
    ┌──────────┐
    │delivered │ ← Recipient got notification
    └─────┬────┘   Double gray checkmark (✓✓)
          │
          │ Recipient opens conversation
          │ & markAsRead() called
          │
          ▼
    ┌──────────┐
    │   read   │ ← Message viewed by recipient
    └──────────┘   Double BLUE checkmark (✓✓)

    ┌──────────┐
    │  failed  │ ← Network error / validation fail
    └──────────┘   Red exclamation (!)
          │
          │ DeliveryEngine retry logic
          │
          ├─────────────────┐
          │ Retry 1         │ Max 3 retries
          ├─────────────────┤ 2-second delay
          │ Retry 2         │
          ├─────────────────┤
          │ Retry 3         │
          └─────────────────┘
                  │
                  ├────────────────┐
                  │ ✅ Success     │ ❌ Persistent Failure
                  │                │
                  ▼                ▼
          [Back to "sent"]   [Stay "failed"]
                             Show error UI
```

### Conversation Unread Count Management

```
[New Message Arrives]
        │
        ▼
┌───────────────────────┐
│ Check: Is current     │
│ user the recipient?   │
└─────────┬─────────────┘
          │
          ├─────────────────┐
          │ Yes             │ No
          │                 │
          ▼                 ▼
┌───────────────────────┐  [No update needed]
│ Increment unreadCount │
│ for recipient in      │
│ conversation document │
└─────────┬─────────────┘
          │
          │ Recipient opens conversation
          │
          ▼
┌───────────────────────┐
│ markAsRead() called   │
└─────────┬─────────────┘
          │
          ▼
┌───────────────────────┐
│ Reset unreadCount[uid]│
│ to 0                  │
└─────────┬─────────────┘
          │
          ▼
┌───────────────────────┐
│ Update all messages   │
│ in conversation:      │
│ - status: "read"      │
│ - readAt: timestamp   │
└───────────────────────┘
```

---

## سير الاشتراكات

### Real-time Subscriptions Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│              REAL-TIME MESSAGING SUBSCRIPTIONS                       │
└─────────────────────────────────────────────────────────────────────┘

    [Component Mounts: ConversationView]
              │
              ▼
    ┌───────────────────────┐
    │ useEffect() runs      │
    └─────────┬─────────────┘
              │
              ▼
    ┌───────────────────────┐
    │ Set isActive = true   │ ← Critical for cleanup
    └─────────┬─────────────┘
              │
              ▼
    ┌───────────────────────┐
    │ advancedMessagingService│
    │ .subscribeToMessages() │
    └─────────┬─────────────┘
              │
              ▼
    ┌───────────────────────┐
    │ Create Firestore      │
    │ onSnapshot listener   │
    │ on messages collection│
    └─────────┬─────────────┘
              │
              │ New message arrives
              │
              ▼
    ┌───────────────────────┐
    │ Callback triggered    │
    │ with snapshot data    │
    └─────────┬─────────────┘
              │
              │ Check isActive flag
              │
              ├─────────────────┐
              │ ✅ true         │ ❌ false
              │                 │
              ▼                 ▼
    ┌───────────────────────┐  [Return early]
    │ Update state:         │  [Prevent memory leak]
    │ setMessages(newMsgs)  │
    └───────────────────────┘
              │
              │ Component unmounts
              │
              ▼
    ┌───────────────────────┐
    │ Cleanup function runs │
    └─────────┬─────────────┘
              │
              ▼
    ┌───────────────────────┐
    │ Set isActive = false  │
    └─────────┬─────────────┘
              │
              ▼
    ┌───────────────────────┐
    │ Call unsubscribe()    │
    │ (detach listener)     │
    └───────────────────────┘
```

### Presence & Typing Indicators Subscription

```
[User Opens Conversation]
         │
         ▼
┌────────────────────────┐
│ Subscribe to           │
│ conversation document  │
│ "typing" field         │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ onSnapshot listener    │
│ triggers on changes    │
└──────────┬─────────────┘
           │
           │ typing: { "user-123": true }
           │
           ▼
┌────────────────────────┐
│ Display TypingIndicator│
│ "User is typing..."    │
└──────────┬─────────────┘
           │
           │ 3 seconds pass (TYPING_TIMEOUT_MS)
           │
           ▼
┌────────────────────────┐
│ Auto-clear typing flag │
│ typing: { "user-123": false }│
└────────────────────────┘


[User Starts Typing]
         │
         ▼
┌────────────────────────┐
│ onInput event          │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ Debounce (300ms)       │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ presenceMonitor        │
│ .setTypingIndicator()  │
│ (conversationId, uid, true)│
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ Update Firestore:      │
│ typing[uid] = true     │
└──────────┬─────────────┘
           │
           │ Start 3-second timer
           │
           ▼
┌────────────────────────┐
│ After 3s or message    │
│ sent: clear typing     │
│ typing[uid] = false    │
└────────────────────────┘
```

---

## Component Hierarchy

### UI Component Tree

```
App.tsx
  │
  └─── MessagesPage.tsx
         │
         ├─── UnifiedHeader
         │
         └─── PageContainer
                │
                ├─── Sidebar
                │      │
                │      ├─── SidebarHeader
                │      │      │
                │      │      ├─── SearchInput
                │      │      └─── FilterTabs
                │      │
                │      └─── ConversationsList
                │             │
                │             └─── ConversationItem (repeated)
                │                    │
                │                    ├─── Avatar
                │                    │      └─── PresenceIndicator
                │                    │
                │                    ├─── ConversationInfo
                │                    │      ├─── ParticipantName
                │                    │      ├─── CarTitle
                │                    │      └─── LastMessage
                │                    │
                │                    └─── Badge (unread count)
                │
                └─── ChatArea
                       │
                       └─── ConversationView
                              │
                              ├─── ConversationHeader
                              │      │
                              │      ├─── BackButton
                              │      ├─── Avatar + PresenceIndicator
                              │      ├─── UserInfo
                              │      └─── ActionsMenu
                              │
                              ├─── MessagesContainer
                              │      │
                              │      ├─── InteractiveMessageBubble (repeated)
                              │      │      │
                              │      │      ├─── Text Content
                              │      │      ├─── Attachments
                              │      │      ├─── Timestamp
                              │      │      └─── StatusIndicator (✓✓)
                              │      │
                              │      ├─── OfferBubble (if type: "offer")
                              │      │      │
                              │      │      ├─── Offer Details
                              │      │      ├─── Countdown Timer
                              │      │      └─── Action Buttons
                              │      │             ├─── Accept
                              │      │             ├─── Reject
                              │      │             └─── Counter
                              │      │
                              │      └─── TypingIndicator
                              │
                              ├─── QuickActionsPanel
                              │      │
                              │      ├─── Send Offer Button
                              │      ├─── Test Drive Button
                              │      ├─── Location Button
                              │      └─── Report Button
                              │
                              └─── MessageInput
                                     │
                                     ├─── TextArea
                                     ├─── EmojiPicker
                                     ├─── AttachmentButton
                                     ├─── VoiceRecorder
                                     └─── SendButton
```

---

## Database Relations

### Firestore Document Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FIRESTORE SCHEMA                             │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│       users              │
│ ─────────────────────    │
│ id: "user-123"           │
│ numericId: 1             │◄────────┐
│ displayName: "أحمد"      │         │
│ photoURL: "..."          │         │
│ planTier: "free"         │         │
└──────────────────────────┘         │
                                     │ Foreign Key
                                     │ (senderId)
┌──────────────────────────┐         │
│    conversations         │         │
│ ─────────────────────    │         │
│ id: "conv-abc123"        │         │
│ participants: [          │◄────────┤
│   "user-123",            │         │
│   "user-456"             │         │
│ ]                        │         │
│ carId: "car-789"         │──────┐  │
│ carNumericId: 5          │      │  │
│ lastMessage: {...}       │      │  │
│ unreadCount: {           │      │  │
│   "user-123": 0,         │      │  │
│   "user-456": 3          │      │  │
│ }                        │      │  │
│ typing: {                │      │  │
│   "user-123": false,     │      │  │
│   "user-456": true       │      │  │
│ }                        │      │  │
└──────────┬───────────────┘      │  │
           │                      │  │
           │ One-to-Many          │  │
           │                      │  │
           ▼                      │  │
┌──────────────────────────┐      │  │
│       messages           │      │  │
│ ─────────────────────    │      │  │
│ id: "msg-xyz789"         │      │  │
│ conversationId: "conv-abc│──────┘  │
│ senderId: "user-123"     │─────────┘
│ receiverId: "user-456"   │
│ text: "مرحباً"           │
│ type: "text"             │
│ status: "read"           │
│ createdAt: Timestamp     │
│ readAt: Timestamp        │
│ attachments: [...]       │
│ metadata: {...}          │
└──────────────────────────┘
           │
           │ Optional Foreign Key
           │
           ▼
┌──────────────────────────┐
│   passenger_cars         │
│ ─────────────────────    │
│ id: "car-789"            │
│ sellerNumericId: 1       │
│ carNumericId: 5          │
│ make: "BMW"              │
│ model: "X5"              │
│ year: 2020               │
│ price: 45000             │
│ images: [...]            │
└──────────────────────────┘
```

### Query Patterns

```
1. Get User's Conversations:
   ──────────────────────────
   Query: conversations
   Where: participants array-contains currentUser.uid
   OrderBy: lastMessageAt desc
   Limit: 50

2. Get Messages in Conversation:
   ────────────────────────────────
   Query: messages
   Where: conversationId == "conv-abc123"
   OrderBy: createdAt desc
   Limit: 100

3. Get Unread Count:
   ──────────────────
   Query: conversations/{convId}
   Read: unreadCount[currentUser.uid]

4. Mark Messages as Read:
   ────────────────────────
   Query: messages
   Where: conversationId == "conv-abc123"
      AND receiverId == currentUser.uid
      AND status in ["sent", "delivered"]
   Update: status = "read", readAt = now()

5. Search Conversations:
   ─────────────────────────
   (Option A - Firestore)
   Query: conversations
   Where: participants array-contains currentUser.uid
   OrderBy: lastMessageAt desc
   Filter client-side: by participant name or car title

   (Option B - Algolia)
   Search: "BMW X5"
   Filters: participants:currentUser.uid
```

---

## Error Handling Flow

### Comprehensive Error Management

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ERROR HANDLING STRATEGY                          │
└─────────────────────────────────────────────────────────────────────┘

[Error Occurs in Service/Component]
              │
              ▼
    ┌───────────────────────┐
    │ Try-Catch Block       │
    └─────────┬─────────────┘
              │
              │ Error caught
              │
              ▼
    ┌───────────────────────┐
    │ logger.error()        │
    │ - Log error details   │
    │ - Include context     │
    │ - Capture stack trace │
    └─────────┬─────────────┘
              │
              ▼
    ┌───────────────────────┐
    │ Classify Error Type   │
    └─────────┬─────────────┘
              │
              ├──────────────┬──────────────┬──────────────┐
              │              │              │              │
              ▼              ▼              ▼              ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Network      │ │ Validation   │ │ Rate Limit   │ │ Auth/        │
    │ Error        │ │ Error        │ │ Error        │ │ Permission   │
    └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
           │                │                │                │
           ▼                ▼                ▼                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  ┌────────────────────┐  ┌────────────────────┐                     │
│  │ Add to Retry Queue │  │ Show Toast:        │                     │
│  │ (Network errors)   │  │ "Invalid input"    │                     │
│  └────────┬───────────┘  └────────────────────┘                     │
│           │                                                           │
│           │ Max 3 retries                                            │
│           │                                                           │
│           ▼                                                           │
│  ┌────────────────────┐  ┌────────────────────┐                     │
│  │ Exponential        │  │ Show Toast:        │                     │
│  │ Backoff:           │  │ "Wait X seconds"   │                     │
│  │ - 2s, 4s, 8s       │  └────────────────────┘                     │
│  └────────┬───────────┘                                              │
│           │                                                           │
│           ▼                                                           │
│  ┌────────────────────┐  ┌────────────────────┐                     │
│  │ Retry attempt      │  │ Redirect to Login  │                     │
│  └────────┬───────────┘  │ (Auth errors)      │                     │
│           │              └────────────────────┘                     │
│           ├──────────────┐                                           │
│           │ ✅ Success   │ ❌ All retries failed                     │
│           │              │                                           │
│           ▼              ▼                                           │
│  ┌────────────────────┐ ┌────────────────────┐                     │
│  │ Resume normal flow │ │ Mark as "failed"   │                     │
│  └────────────────────┘ │ Show error UI      │                     │
│                         │ Log to Sentry      │                     │
│                         └────────────────────┘                     │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### User-Facing Error Messages

```typescript
// Error message mapping (Bulgarian & English)
const ERROR_MESSAGES = {
  'network-error': {
    bg: 'Проблем с връзката. Моля, опитайте отново.',
    en: 'Network issue. Please try again.'
  },
  'rate-limit': {
    bg: 'Твърде много заявки. Моля, изчакайте малко.',
    en: 'Too many requests. Please wait a moment.'
  },
  'validation-error': {
    bg: 'Невалидни данни. Моля, проверете входа.',
    en: 'Invalid data. Please check your input.'
  },
  'auth-required': {
    bg: 'Моля, влезте в профила си.',
    en: 'Please log in to continue.'
  },
  'permission-denied': {
    bg: 'Нямате достъп до тази операция.',
    en: 'You do not have permission for this action.'
  }
};
```

---

## Performance Monitoring Flow

### Analytics & Metrics Tracking

```
[User Action Occurs]
        │
        ▼
┌────────────────────────┐
│ messagingAnalytics     │
│ .trackEvent()          │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ Event Types:           │
│ - message_sent         │
│ - message_read         │
│ - offer_sent           │
│ - offer_accepted       │
│ - offer_rejected       │
│ - offer_countered      │
│ - conversation_started │
│ - test_drive_requested │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ Calculate Metrics:     │
│ - Response time        │
│ - Lead score           │
│ - Conversion rate      │
│ - Engagement level     │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ Store in Firestore:    │
│ analytics/{userId}/... │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ Display in Dashboard   │
│ (ChatAnalyticsDashboard)│
└────────────────────────┘
```

---

## الخلاصة | Summary

هذه المخططات توضح:

✅ **السير الكامل** لإرسال الرسائل وإدارة العروض  
✅ **تتبع الحالات** من sending إلى read  
✅ **الاشتراكات** Real-time listeners مع cleanup صحيح  
✅ **Component Hierarchy** كامل لواجهة المستخدم  
✅ **Database Relations** بين users, conversations, messages, cars  
✅ **Error Handling** شامل مع retry logic  
✅ **Performance Monitoring** للتحليلات

جميع المخططات تعكس الكود الحالي الموجود في المشروع ومتوافقة مع:
- PROJECT_CONSTITUTION.md
- FIRESTORE_LISTENERS_FIX.md
- STRICT_NUMERIC_ID_SYSTEM.md

**النظام موثق بالكامل وجاهز للإنتاج** ✅


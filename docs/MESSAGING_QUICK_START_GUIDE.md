# 🚀 دليل البدء السريع - Quick Start Guide
## Phase 2: Interactive UI Components Implementation

**التاريخ:** 29 ديسمبر 2025  
**المرحلة:** Phase 2 - UI Components  
**للمطورين:** Frontend Team

---

## 📋 نظرة عامة - Overview

هذا الدليل يشرح كيفية البدء في تطوير مكونات واجهة المستخدم التفاعلية للمرحلة الثانية من نظام المراسلة المتقدم.

---

## ✅ المتطلبات الأساسية - Prerequisites

### 1. التأكد من اكتمال Phase 1:

```bash
# تحقق من وجود الملفات الأساسية
ls src/services/messaging/core/messaging-orchestrator.ts
ls src/services/messaging/core/delivery-engine.ts
ls src/services/messaging/core/presence-monitor.ts
ls src/services/messaging/actions/offer-workflow.service.ts
ls src/services/messaging/analytics/messaging-analytics.service.ts
```

### 2. تثبيت Dependencies الجديدة:

```bash
npm install recharts@^2.10.0
npm install wavesurfer.js@^7.4.0
npm install jspdf@^2.5.0
npm install date-fns@^3.0.0
npm install --save-dev @types/wavesurfer.js
```

### 3. قراءة التوثيق:

- **ADVANCED_MESSAGING_SYSTEM_V2.md** - التوثيق الفني الشامل
- **MESSAGING_IMPLEMENTATION_ROADMAP.md** - خارطة الطريق
- **PROJECT_CONSTITUTION.md** - دستور المشروع

---

## 🎯 أولويات التطوير - Development Priorities

### المكونات بالأولوية (من الأعلى للأقل):

```
Priority 1 (🔴 عالية جداً):
├── 1. InteractiveMessageBubble.tsx
└── 2. OfferBubble.tsx

Priority 2 (🟡 متوسطة):
├── 3. PresenceIndicator.tsx
└── 4. QuickActionsPanel.tsx

Priority 3 (🔵 منخفضة):
├── 5. ChatAnalyticsDashboard.tsx
├── 6. VoiceMessageBubble.tsx (Phase 3)
└── 7. MessageSearchPanel.tsx (Phase 3)
```

---

## 🚀 البدء في التطوير - Getting Started

### الخطوة 1: إنشاء المجلد الأساسي

```bash
mkdir -p src/components/messaging
cd src/components/messaging
```

### الخطوة 2: إنشاء ملف الأنماط المشتركة

```bash
touch src/components/messaging/messaging-styles.ts
```

**محتوى الملف:**

```typescript
import styled from 'styled-components';

// ألوان النظام
export const MessagingColors = {
  // رسائل المرسل
  senderBg: '#FF8F10',      // البرتقالي البلغاري
  senderText: '#FFFFFF',
  
  // رسائل المستقبل
  receiverBg: '#F5F5F5',
  receiverText: '#003366',
  
  // حالات العرض
  offerPending: '#FFA500',  // برتقالي
  offerAccepted: '#16a34a', // أخضر
  offerRejected: '#DC2626', // أحمر
  offerExpired: '#9CA3AF',  // رمادي
  
  // حضور المستخدم
  online: '#10B981',        // أخضر
  offline: '#6B7280',       // رمادي
  typing: '#3B82F6',        // أزرق
};

// Container مشترك
export const MessageContainer = styled.div<{ $isSender?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isSender ? 'flex-end' : 'flex-start'};
  margin-bottom: 12px;
  padding: 0 16px;
`;

// Bubble مشترك
export const BubbleBase = styled.div<{ $isSender?: boolean }>`
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 18px;
  word-break: break-word;
  
  background-color: ${props => 
    props.$isSender ? MessagingColors.senderBg : MessagingColors.receiverBg
  };
  
  color: ${props => 
    props.$isSender ? MessagingColors.senderText : MessagingColors.receiverText
  };
  
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

// Timestamp مشترك
export const Timestamp = styled.span`
  font-size: 11px;
  color: #6B7280;
  margin-top: 4px;
  display: block;
`;

// Delivery status
export const DeliveryStatus = styled.span<{ $status: 'sent' | 'delivered' | 'read' }>`
  font-size: 14px;
  margin-left: 4px;
  color: ${props => {
    switch (props.$status) {
      case 'sent':
        return '#9CA3AF';
      case 'delivered':
        return '#9CA3AF';
      case 'read':
        return '#3B82F6';
      default:
        return '#9CA3AF';
    }
  }};
`;
```

---

## 📝 المكون الأول: InteractiveMessageBubble

### الخطوة 3: إنشاء ملف المكون

```bash
touch src/components/messaging/InteractiveMessageBubble.tsx
```

### الخطوة 4: الهيكل الأساسي

```typescript
import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { MessageContainer, BubbleBase, Timestamp, DeliveryStatus } from './messaging-styles';
import { Message } from '@/types/messaging';

interface InteractiveMessageBubbleProps {
  message: Message;
  isSender: boolean;
  showAvatar?: boolean;
  onOfferAction?: (action: 'accept' | 'reject' | 'counter') => void;
}

/**
 * مكون عرض الرسالة التفاعلي
 * يدعم أنواع مختلفة: text, offer, action, voice
 */
export const InteractiveMessageBubble: React.FC<InteractiveMessageBubbleProps> = ({
  message,
  isSender,
  showAvatar = true,
  onOfferAction
}) => {
  // تنسيق الوقت بالبلغارية
  const formatTime = (timestamp: Date) => {
    return format(timestamp, 'HH:mm', { locale: bg });
  };

  // رمز حالة التوصيل
  const renderDeliveryStatus = () => {
    if (!isSender) return null;
    
    const { deliveryStatus } = message;
    
    if (deliveryStatus === 'sending') {
      return <DeliveryStatus $status="sent">🕐</DeliveryStatus>;
    }
    
    if (deliveryStatus === 'sent') {
      return <DeliveryStatus $status="sent">✓</DeliveryStatus>;
    }
    
    if (deliveryStatus === 'delivered') {
      return <DeliveryStatus $status="delivered">✓✓</DeliveryStatus>;
    }
    
    if (deliveryStatus === 'read') {
      return <DeliveryStatus $status="read">✓✓</DeliveryStatus>;
    }
    
    return null;
  };

  // عرض محتوى الرسالة حسب النوع
  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return <TextContent>{message.content}</TextContent>;
      
      case 'offer':
        // TODO: استخدام OfferBubble
        return <div>Offer bubble here</div>;
      
      case 'action':
        // TODO: عرض الإجراءات (حجز موعد، مشاركة موقع)
        return <div>Action bubble here</div>;
      
      case 'voice':
        // TODO: استخدام VoiceMessageBubble
        return <div>Voice bubble here</div>;
      
      default:
        return <TextContent>{message.content}</TextContent>;
    }
  };

  return (
    <MessageContainer $isSender={isSender}>
      {showAvatar && !isSender && (
        <Avatar src={message.senderAvatar} alt={message.senderName} />
      )}
      
      <BubbleBase $isSender={isSender}>
        {renderContent()}
        
        <TimeRow>
          <Timestamp>{formatTime(message.createdAt)}</Timestamp>
          {renderDeliveryStatus()}
        </TimeRow>
      </BubbleBase>
    </MessageContainer>
  );
};

// Styled Components
const TextContent = styled.p`
  margin: 0;
  line-height: 1.4;
  font-size: 14px;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
`;

const TimeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 4px;
`;
```

---

## 📝 المكون الثاني: OfferBubble

### الخطوة 5: إنشاء ملف المكون

```bash
touch src/components/messaging/OfferBubble.tsx
```

### الخطوة 6: الهيكل الأساسي

```typescript
import React, { useState } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { MessagingColors } from './messaging-styles';
import { Offer } from '@/types/messaging';
import { offerWorkflowService } from '@/services/messaging/core';
import { logger } from '@/services/logger-service';

interface OfferBubbleProps {
  offer: Offer;
  canRespond: boolean;
  onAccept?: () => Promise<void>;
  onReject?: () => Promise<void>;
  onCounter?: (amount: number) => Promise<void>;
}

/**
 * مكون عرض السعر التفاعلي
 * يتيح قبول/رفض/عرض مضاد
 */
export const OfferBubble: React.FC<OfferBubbleProps> = ({
  offer,
  canRespond,
  onAccept,
  onReject,
  onCounter
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterAmount, setCounterAmount] = useState('');

  // حساب الوقت المتبقي
  const getTimeRemaining = () => {
    const now = new Date();
    const expiry = new Date(offer.expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'منتهي';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} يوم`;
    return `${hours} ساعة`;
  };

  // قبول العرض
  const handleAccept = async () => {
    if (!onAccept) return;
    
    setIsLoading(true);
    try {
      await onAccept();
      logger.info('Offer accepted', { offerId: offer.id });
    } catch (error) {
      logger.error('Failed to accept offer', error as Error, { offerId: offer.id });
    } finally {
      setIsLoading(false);
    }
  };

  // رفض العرض
  const handleReject = async () => {
    if (!onReject) return;
    
    setIsLoading(true);
    try {
      await onReject();
      logger.info('Offer rejected', { offerId: offer.id });
    } catch (error) {
      logger.error('Failed to reject offer', error as Error, { offerId: offer.id });
    } finally {
      setIsLoading(false);
    }
  };

  // عرض مضاد
  const handleCounter = async () => {
    if (!onCounter || !counterAmount) return;
    
    const amount = parseFloat(counterAmount);
    if (isNaN(amount) || amount <= 0) {
      logger.warn('Invalid counter amount', { counterAmount });
      return;
    }
    
    setIsLoading(true);
    try {
      await onCounter(amount);
      setShowCounterInput(false);
      setCounterAmount('');
      logger.info('Counter offer sent', { offerId: offer.id, amount });
    } catch (error) {
      logger.error('Failed to send counter offer', error as Error, { offerId: offer.id });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OfferCard $status={offer.status}>
      <OfferHeader>
        <OfferTitle>عرض سعر رسمي</OfferTitle>
        <StatusBadge $status={offer.status}>
          {getStatusText(offer.status)}
        </StatusBadge>
      </OfferHeader>

      <OfferAmount>
        {offer.offerAmount.toLocaleString()} {offer.currency}
      </OfferAmount>

      {offer.message && (
        <OfferMessage>{offer.message}</OfferMessage>
      )}

      {offer.status === 'countered' && offer.counterAmount && (
        <CounterOffer>
          عرض مضاد: {offer.counterAmount.toLocaleString()} {offer.currency}
        </CounterOffer>
      )}

      <OfferFooter>
        <ExpiryText>
          {offer.status === 'expired' ? '⏰ منتهي' : `⏳ ${getTimeRemaining()}`}
        </ExpiryText>
        
        <OfferTime>
          {format(new Date(offer.createdAt), 'dd MMM, HH:mm', { locale: bg })}
        </OfferTime>
      </OfferFooter>

      {canRespond && offer.status === 'pending' && (
        <ActionsRow>
          {!showCounterInput ? (
            <>
              <ActionButton 
                $variant="accept" 
                onClick={handleAccept}
                disabled={isLoading}
              >
                ✅ قبول
              </ActionButton>
              
              <ActionButton 
                $variant="counter" 
                onClick={() => setShowCounterInput(true)}
                disabled={isLoading}
              >
                🔄 عرض مضاد
              </ActionButton>
              
              <ActionButton 
                $variant="reject" 
                onClick={handleReject}
                disabled={isLoading}
              >
                ❌ رفض
              </ActionButton>
            </>
          ) : (
            <CounterInputRow>
              <CounterInput
                type="number"
                placeholder="أدخل السعر"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
              />
              <ActionButton $variant="accept" onClick={handleCounter}>
                إرسال
              </ActionButton>
              <ActionButton $variant="reject" onClick={() => setShowCounterInput(false)}>
                إلغاء
              </ActionButton>
            </CounterInputRow>
          )}
        </ActionsRow>
      )}
    </OfferCard>
  );
};

// Helper function
const getStatusText = (status: Offer['status']) => {
  switch (status) {
    case 'pending': return '⏳ في الانتظار';
    case 'accepted': return '✅ مقبول';
    case 'rejected': return '❌ مرفوض';
    case 'countered': return '🔄 عرض مضاد';
    case 'expired': return '⏰ منتهي';
    default: return status;
  }
};

// Styled Components
const OfferCard = styled.div<{ $status: Offer['status'] }>`
  background: white;
  border: 2px solid ${props => {
    switch (props.$status) {
      case 'accepted': return MessagingColors.offerAccepted;
      case 'rejected': return MessagingColors.offerRejected;
      case 'expired': return MessagingColors.offerExpired;
      default: return MessagingColors.offerPending;
    }
  }};
  border-radius: 12px;
  padding: 16px;
  max-width: 300px;
`;

const OfferHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const OfferTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #003366;
`;

const StatusBadge = styled.span<{ $status: Offer['status'] }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.$status) {
      case 'accepted': return `${MessagingColors.offerAccepted}20`;
      case 'rejected': return `${MessagingColors.offerRejected}20`;
      case 'expired': return `${MessagingColors.offerExpired}20`;
      default: return `${MessagingColors.offerPending}20`;
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'accepted': return MessagingColors.offerAccepted;
      case 'rejected': return MessagingColors.offerRejected;
      case 'expired': return MessagingColors.offerExpired;
      default: return MessagingColors.offerPending;
    }
  }};
`;

const OfferAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #003366;
  margin-bottom: 8px;
`;

const OfferMessage = styled.p`
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #6B7280;
  font-style: italic;
`;

const CounterOffer = styled.div`
  padding: 8px;
  background-color: #FEF3C7;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #92400E;
  margin-bottom: 12px;
`;

const OfferFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #9CA3AF;
`;

const ExpiryText = styled.span`
  font-weight: 500;
`;

const OfferTime = styled.span``;

const ActionsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E5E7EB;
`;

const ActionButton = styled.button<{ $variant: 'accept' | 'reject' | 'counter' }>`
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  background-color: ${props => {
    switch (props.$variant) {
      case 'accept': return MessagingColors.offerAccepted;
      case 'reject': return MessagingColors.offerRejected;
      case 'counter': return MessagingColors.offerPending;
    }
  }};
  
  color: white;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CounterInputRow = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

const CounterInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${MessagingColors.offerPending};
  }
`;
```

---

## 🔧 اختبار المكونات - Testing Components

### إنشاء ملف Storybook (اختياري):

```bash
touch src/components/messaging/InteractiveMessageBubble.stories.tsx
```

```typescript
import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { InteractiveMessageBubble } from './InteractiveMessageBubble';

export default {
  title: 'Messaging/InteractiveMessageBubble',
  component: InteractiveMessageBubble,
} as ComponentMeta<typeof InteractiveMessageBubble>;

const Template: ComponentStory<typeof InteractiveMessageBubble> = (args) => (
  <InteractiveMessageBubble {...args} />
);

export const SenderTextMessage = Template.bind({});
SenderTextMessage.args = {
  message: {
    id: '1',
    type: 'text',
    content: 'مرحباً! هل السيارة متاحة؟',
    senderId: 'user1',
    receiverId: 'user2',
    deliveryStatus: 'read',
    createdAt: new Date(),
  },
  isSender: true,
};

export const ReceiverTextMessage = Template.bind({});
ReceiverTextMessage.args = {
  message: {
    id: '2',
    type: 'text',
    content: 'نعم، السيارة متاحة للمعاينة',
    senderId: 'user2',
    receiverId: 'user1',
    deliveryStatus: 'delivered',
    createdAt: new Date(),
  },
  isSender: false,
};
```

---

## 📚 المراجع السريعة - Quick References

### الاستيراد من Core Services:

```typescript
import {
  messagingOrchestrator,
  deliveryEngine,
  presenceMonitor,
  offerWorkflowService,
  messagingAnalytics
} from '@/services/messaging/core';
```

### الأنواع الأساسية:

```typescript
import type { 
  Message,
  Offer,
  Conversation,
  DeliveryStatus,
  PresenceStatus
} from '@/types/messaging';
```

### Styled Components Theme:

```typescript
import { useTheme } from 'styled-components';
import { MessagingColors } from './messaging-styles';
```

---

## ✅ Checklist قبل البدء

- [ ] قراءة ADVANCED_MESSAGING_SYSTEM_V2.md
- [ ] قراءة MESSAGING_IMPLEMENTATION_ROADMAP.md
- [ ] قراءة PROJECT_CONSTITUTION.md
- [ ] تثبيت جميع Dependencies الجديدة
- [ ] التأكد من وجود جميع ملفات Phase 1
- [ ] إنشاء مجلد src/components/messaging
- [ ] إنشاء messaging-styles.ts
- [ ] اختبار استيراد Core Services

---

## 🆘 الحصول على المساعدة - Getting Help

### الأسئلة الشائعة:

**س: كيف أرسل عرض من UI؟**
```typescript
const offerId = await messagingOrchestrator.sendOffer({
  conversationId: 'conv_123',
  senderId: currentUser.uid,
  receiverId: otherUser.uid,
  carId: selectedCar.id,
  offerAmount: 25000,
  currency: 'EUR'
});
```

**س: كيف أتتبع حالة الحضور؟**
```typescript
const unsubscribe = presenceMonitor.watchUserPresence(
  userId,
  (presence) => {
    setIsOnline(presence?.status === 'online');
  }
);
return unsubscribe; // في cleanup
```

**س: كيف أحدد حالة التوصيل؟**
```typescript
await deliveryEngine.updateStatus(
  conversationId,
  messageId,
  'read'
);
```

---

## 🎯 الأهداف الأسبوعية - Weekly Goals

### الأسبوع 1:
- [ ] InteractiveMessageBubble ✅
- [ ] OfferBubble ✅
- [ ] Integration testing
- [ ] Bug fixes

---

**تاريخ الإنشاء:** 29 ديسمبر 2025  
**آخر تحديث:** 29 ديسمبر 2025  
**الحالة:** 🟢 جاهز للبدء

---

**Happy Coding! 🚀**

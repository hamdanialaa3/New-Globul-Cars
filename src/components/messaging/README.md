# 📦 Messaging UI Components

**التاريخ:** 29 ديسمبر 2025  
**الحالة:** ✅ Phase 2 - Core UI Components مكتملة  
**الإصدار:** 1.0.0

---

## 📋 نظرة عامة - Overview

هذا المجلد يحتوي على مكونات واجهة المستخدم التفاعلية لنظام المراسلة المتقدم.

---

## 📁 الملفات - Files

### 1. messaging-styles.ts ✅
**الوصف:** الأنماط والألوان المشتركة لجميع المكونات

**المحتوى:**
- `MessagingColors` - نظام الألوان الكامل
- `MessageContainer` - Container مشترك للرسائل
- `BubbleBase` - Bubble أساسي للرسائل
- `Timestamp` - تنسيق الوقت
- `DeliveryStatus` - أيقونات حالة التوصيل
- `OnlineDot` - نقطة الحضور
- `TypingDot` - نقطة الكتابة المتحركة
- `ButtonBase`, `InputBase`, `CardBase` - مكونات أساسية

**الحجم:** ~300 سطر

---

### 2. InteractiveMessageBubble.tsx ✅
**الوصف:** مكون عرض الرسالة التفاعلي

**الميزات:**
- ✅ عرض أنواع مختلفة: text, offer, action, voice, system
- ✅ حالة التوصيل (✓ / ✓✓ رمادي / ✓✓ أزرق)
- ✅ Timestamp بتنسيق بلغاري
- ✅ Avatar للمستقبل
- ✅ Sender name
- ✅ ذيل الفقاعة (tail)

**الاستخدام:**
```typescript
import { InteractiveMessageBubble } from '@/components/messaging';

<InteractiveMessageBubble
  message={message}
  isSender={message.senderId === currentUserId}
  showAvatar={true}
/>
```

**Props:**
- `message: Message` - بيانات الرسالة
- `isSender: boolean` - هل المستخدم الحالي هو المرسل
- `showAvatar?: boolean` - عرض الصورة (default: true)
- `onOfferAction?: Function` - callback للعروض

**الحجم:** ~250 سطر

---

### 3. OfferBubble.tsx ✅
**الوصف:** مكون عرض السعر التفاعلي

**الميزات:**
- ✅ عرض العرض بتصميم احترافي
- ✅ 5 حالات: pending, accepted, rejected, countered, expired
- ✅ أزرار قبول/رفض/عرض مضاد
- ✅ حقل إدخال للعرض المضاد
- ✅ مؤقت العد التنازلي
- ✅ عرض العرض المضاد
- ✅ رسائل الخطأ
- ✅ Loading states

**الاستخدام:**
```typescript
import { OfferBubble } from '@/components/messaging';

<OfferBubble
  offer={offer}
  canRespond={offer.receiverId === currentUserId}
  isReceiver={true}
  onAccept={handleAccept}
  onReject={handleReject}
  onCounter={handleCounter}
/>
```

**Props:**
- `offer: Offer` - بيانات العرض
- `canRespond: boolean` - هل يمكن الرد
- `isReceiver?: boolean` - هل المستخدم مستقبل (default: true)
- `onAccept?: () => Promise<void>` - callback القبول
- `onReject?: () => Promise<void>` - callback الرفض
- `onCounter?: (amount: number) => Promise<void>` - callback العرض المضاد

**الحجم:** ~400 سطر

---

### 4. PresenceIndicator.tsx ✅
**الوصف:** مكون مؤشر الحضور والكتابة

**الميزات:**
- ✅ 3 حالات: online, offline, away
- ✅ نقطة ملونة (🟢/⚪/🟡)
- ✅ آخر ظهور (Last seen)
- ✅ مؤشر الكتابة ("يكتب...")
- ✅ Animation لنقاط الكتابة
- ✅ عرض مدمج (compact) للـ avatars
- ✅ عرض كامل مع تفاصيل
- ✅ Real-time updates

**الاستخدام:**
```typescript
import { PresenceIndicator, PresenceWithAvatar } from '@/components/messaging';

// عرض عادي
<PresenceIndicator
  userId={userId}
  userName="John Doe"
  showLastSeen={true}
  showTyping={true}
  conversationId={conversationId}
/>

// مع Avatar
<PresenceWithAvatar
  userId={userId}
  userName="John Doe"
  avatarUrl={avatarUrl}
  avatarSize={40}
  conversationId={conversationId}
/>
```

**Props:**
- `userId: string` - معرف المستخدم
- `userName?: string` - اسم المستخدم
- `showLastSeen?: boolean` - عرض آخر ظهور (default: true)
- `showTyping?: boolean` - عرض مؤشر الكتابة (default: true)
- `conversationId?: string` - معرف المحادثة (للكتابة)
- `compact?: boolean` - عرض مدمج (default: false)
- `avatarUrl?: string` - رابط الصورة (PresenceWithAvatar فقط)
- `avatarSize?: number` - حجم الصورة (default: 40)

**الحجم:** ~280 سطر

---

### 5. index.tsx ✅
**الوصف:** Barrel export موحد

**المحتوى:**
- تصدير جميع المكونات
- تصدير جميع الأنواع (Types)
- تصدير الأنماط المشتركة

**الاستخدام:**
```typescript
// استيراد واحد لكل شيء
import {
  InteractiveMessageBubble,
  OfferBubble,
  PresenceIndicator,
  PresenceWithAvatar,
  MessagingColors,
  type Message,
  type Offer,
  type PresenceStatus
} from '@/components/messaging';
```

---

## 🎨 نظام الألوان - Color System

```typescript
MessagingColors = {
  // رسائل المرسل
  senderBg: '#FF8F10',      // البرتقالي البلغاري
  senderText: '#FFFFFF',
  
  // رسائل المستقبل
  receiverBg: '#F5F5F5',
  receiverText: '#003366',
  
  // حالات العرض
  offerPending: '#FFA500',
  offerAccepted: '#16a34a',
  offerRejected: '#DC2626',
  offerExpired: '#9CA3AF',
  offerCountered: '#3B82F6',
  
  // حضور المستخدم
  online: '#10B981',
  offline: '#6B7280',
  away: '#F59E0B',
  typing: '#3B82F6',
}
```

---

## 📊 الأنواع - Types

### Message
```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'offer' | 'action' | 'voice' | 'system';
  deliveryStatus?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: Date;
  metadata?: Record<string, any>;
}
```

### Offer
```typescript
interface Offer {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  carId: string;
  offerAmount: number;
  currency: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  message?: string;
  counterAmount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  expiresAt: Date | string;
}
```

### PresenceInfo
```typescript
interface PresenceInfo {
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  isTyping?: boolean;
}
```

---

## 🔌 التكامل - Integration

### مع Core Services:

```typescript
import { 
  messagingOrchestrator,
  presenceMonitor,
  offerWorkflowService 
} from '@/services/messaging/core';

// إرسال رسالة
const messageId = await messagingOrchestrator.sendMessage({
  conversationId: 'conv_123',
  senderId: currentUser.uid,
  receiverId: otherUser.uid,
  content: 'Hello!',
  type: 'text'
});

// تتبع الحضور
useEffect(() => {
  const unsubscribe = presenceMonitor.watchUserPresence(
    userId,
    (presence) => {
      setIsOnline(presence?.status === 'online');
    }
  );
  return unsubscribe;
}, [userId]);

// قبول عرض
const handleAccept = async () => {
  await offerWorkflowService.acceptOffer(offerId);
};
```

---

## 🧪 الاختبار - Testing

### مثال Unit Test:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OfferBubble } from './OfferBubble';

describe('OfferBubble', () => {
  const mockOffer: Offer = {
    id: 'offer_1',
    conversationId: 'conv_1',
    senderId: 'user_1',
    receiverId: 'user_2',
    carId: 'car_1',
    offerAmount: 25000,
    currency: 'EUR',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  };

  it('should render offer details', () => {
    render(<OfferBubble offer={mockOffer} canRespond={false} />);
    
    expect(screen.getByText('25,000 EUR')).toBeInTheDocument();
    expect(screen.getByText('⏳ في الانتظار')).toBeInTheDocument();
  });

  it('should call onAccept when accept button clicked', async () => {
    const onAccept = jest.fn();
    
    render(
      <OfferBubble 
        offer={mockOffer} 
        canRespond={true} 
        onAccept={onAccept}
      />
    );
    
    fireEvent.click(screen.getByText(/قبول/i));
    
    await waitFor(() => {
      expect(onAccept).toHaveBeenCalledTimes(1);
    });
  });
});
```

---

## 📈 الإحصائيات - Statistics

| المكون | الأسطر | الحجم | الأولوية |
|--------|--------|-------|----------|
| messaging-styles.ts | 300 | 8.2 KB | 🔴 عالية |
| InteractiveMessageBubble.tsx | 250 | 7.1 KB | 🔴 عالية |
| OfferBubble.tsx | 400 | 12.5 KB | 🔴 عالية |
| PresenceIndicator.tsx | 280 | 8.8 KB | 🟡 متوسطة |
| index.tsx | 30 | 0.9 KB | 🔵 منخفضة |
| **الإجمالي** | **1,260** | **37.5 KB** | - |

---

## ✅ الميزات المحققة

- [x] أنماط موحدة ومشتركة
- [x] عرض رسائل تفاعلي
- [x] عرض عروض احترافي
- [x] مؤشر حضور وكتابة
- [x] حالات التوصيل (✓/✓✓)
- [x] دعم أنواع مختلفة من الرسائل
- [x] Animations سلسة
- [x] Responsive design
- [x] Error handling شامل
- [x] TypeScript strict mode
- [x] Barrel export موحد

---

## 🚀 الخطوة التالية

### Phase 2 - Remaining Components:

1. **QuickActionsPanel.tsx** 🔄
   - أزرار الإجراءات السريعة
   - إرسال عرض، حجز موعد، مشاركة موقع

2. **ChatAnalyticsDashboard.tsx** 🔄
   - لوحة تحليلات المحادثة
   - Graphs و Charts

3. **VoiceMessageBubble.tsx** (Phase 3)
   - عرض الرسائل الصوتية
   - مشغل الصوت

4. **MessageSearchPanel.tsx** (Phase 3)
   - بحث داخل المحادثات
   - فلاتر متقدمة

---

## 📚 التوثيق الإضافي

- [ADVANCED_MESSAGING_SYSTEM_V2.md](../../docs/ADVANCED_MESSAGING_SYSTEM_V2.md)
- [MESSAGING_IMPLEMENTATION_ROADMAP.md](../../docs/MESSAGING_IMPLEMENTATION_ROADMAP.md)
- [MESSAGING_QUICK_START_GUIDE.md](../../docs/MESSAGING_QUICK_START_GUIDE.md)

---

**تاريخ الإنشاء:** 29 ديسمبر 2025  
**آخر تحديث:** 29 ديسمبر 2025  
**الحالة:** ✅ مكتمل - جاهز للاستخدام

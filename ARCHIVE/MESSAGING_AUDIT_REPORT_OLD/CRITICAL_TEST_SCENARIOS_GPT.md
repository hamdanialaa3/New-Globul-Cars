# سيناريوهات الاختبار الحرجة (من توصيات GPT)

**التاريخ:** يناير 14، 2026  
**المصدر:** تحليل GPT لتقارير الـ4 AI  
**الأولوية:** P0 - إلزامية قبل الإنتاج

---

## نظرة عامة

هذه السيناريوهات الـ7 **إلزامية** قبل نشر نظام المراسلة للإنتاج. تغطي جميع الحالات الحرجة التي تسببت في مشاكل سابقة.

---

## Scenario 1: مستخدم جديد بدون numericId ⚠️

**المشكلة الأصلية:**  
عند التسجيل عبر Google/Facebook، لا يُنشأ `numericId` تلقائياً، مما يسبب فشل في بدء المحادثات.

**الاختبار:**
```typescript
// tests/messaging/critical-scenarios/new-user-without-numericid.test.ts
describe('Scenario 1: New User Without NumericId', () => {
  test('should auto-generate numericId on first message attempt', async () => {
    // 1. Create user via social auth WITHOUT numericId
    const user = await createTestUser({
      provider: 'google',
      skipNumericId: true, // Simulate old bug
    });
    
    // 2. Try to message seller
    const sellerId = await createTestSeller();
    const result = await contactSeller(user.uid, sellerId);
    
    // 3. Verify numericId was generated
    const updatedProfile = await getUserProfile(user.uid);
    expect(updatedProfile.numericId).toBeDefined();
    expect(typeof updatedProfile.numericId).toBe('number');
    expect(updatedProfile.numericId).toBeGreaterThan(0);
    
    // 4. Verify conversation created successfully
    expect(result.success).toBe(true);
    expect(result.channelId).toBeDefined();
  });
  
  test('should handle concurrent numericId generation', async () => {
    // Simulate 2 devices trying to generate at once
    const user = await createTestUser({ skipNumericId: true });
    
    const [result1, result2] = await Promise.all([
      contactSeller(user.uid, sellerId1),
      contactSeller(user.uid, sellerId2),
    ]);
    
    // Both should succeed with SAME numericId
    const profile = await getUserProfile(user.uid);
    expect(profile.numericId).toBeDefined();
    
    // Both conversations should use same numericId
    expect(result1.userNumericId).toBe(result2.userNumericId);
  });
  
  test('should show loading state during generation', async () => {
    const user = await createTestUser({ skipNumericId: true });
    const ui = render(<MessageButton sellerId={sellerId} />);
    
    // Click message button
    fireEvent.click(ui.getByText(/message/i));
    
    // Verify loading state shown
    expect(ui.getByTestId('message-loading')).toBeInTheDocument();
    
    // Wait for completion
    await waitFor(() => {
      expect(ui.queryByTestId('message-loading')).not.toBeInTheDocument();
    });
  });
});
```

**معايير النجاح:**
- ✅ `numericId` يُولّد تلقائياً في أول محاولة اتصال
- ✅ لا تحدث race conditions في التوليد المتزامن
- ✅ Loading state يظهر/يختفي بشكل صحيح
- ✅ الـ mapping في `numeric_ids` collection يُنشأ بشكل صحيح

---

## Scenario 2: سيارة قديمة بدون sellerNumericId ⚠️

**المشكلة الأصلية:**  
السيارات المنشورة قبل تطبيق Numeric ID System لا تحتوي على `sellerNumericId`.

**الاختبار:**
```typescript
describe('Scenario 2: Legacy Car Without SellerNumericId', () => {
  test('should show clear error for legacy cars', async () => {
    // 1. Create legacy car (simulate old data)
    const car = await createTestCar({
      sellerId: 'firebase-uid-123',
      sellerNumericId: null, // OLD DATA
    });
    
    // 2. Try to message seller
    const result = await contactSeller(car.id);
    
    // 3. Verify proper error handling
    expect(result.success).toBe(false);
    expect(result.error).toContain('Incomplete data');
    
    // 4. Verify UI shows user-friendly message
    const ui = render(<CarDetailsPage carId={car.id} />);
    const messageButton = ui.getByRole('button', { name: /message/i });
    
    fireEvent.click(messageButton);
    
    expect(ui.getByText(/incomplete data/i)).toBeInTheDocument();
  });
  
  test('should disable message button for legacy cars', async () => {
    const car = await createTestCar({ sellerNumericId: null });
    const ui = render(<CarDetailsPage carId={car.id} />);
    
    const messageButton = ui.getByRole('button', { name: /message/i });
    expect(messageButton).toBeDisabled();
    
    // Tooltip should explain why
    fireEvent.mouseOver(messageButton);
    expect(ui.getByText(/seller profile incomplete/i)).toBeInTheDocument();
  });
});
```

**معايير النجاح:**
- ✅ رسالة خطأ واضحة بدلاً من crash
- ✅ الزر معطل للسيارات القديمة
- ✅ Tooltip توضيحي يظهر

---

## Scenario 3: حذف السيارة أثناء محادثة نشطة 🔥

**المشكلة الأصلية:**  
عند حذف سيارة، المحادثات تبقى نشطة مع روابط معطلة.

**الاختبار:**
```typescript
describe('Scenario 3: Car Deletion During Active Conversation', () => {
  test('should archive conversation when car is deleted', async () => {
    // 1. Setup: Create car + active conversation
    const { car, buyer, seller, channel } = await setupActiveConversation();
    
    // 2. Delete car
    await deleteCar(car.id, car.sellerNumericId, car.carNumericId);
    
    // 3. Verify channel archived in RTDB
    const updatedChannel = await getChannelFromRTDB(channel.id);
    expect(updatedChannel.status).toBe('archived');
    expect(updatedChannel.carDeleted).toBe(true);
    expect(updatedChannel.carDeletedAt).toBeDefined();
    
    // 4. Verify UI shows banner
    const ui = render(<ChatWindow channelId={channel.id} />);
    expect(ui.getByText(/no longer available/i)).toBeInTheDocument();
    expect(ui.getByText(/seller has removed/i)).toBeInTheDocument();
    
    // 5. Verify archive button shown
    const archiveBtn = ui.getByRole('button', { name: /archive/i });
    expect(archiveBtn).toBeInTheDocument();
  });
  
  test('should prevent new messages after car deletion', async () => {
    const { car, channel } = await setupActiveConversation();
    
    // Delete car
    await deleteCar(car.id);
    
    // Try to send message
    const result = await sendMessage(channel.id, 'test message');
    
    // Should fail gracefully
    expect(result.success).toBe(false);
    expect(result.error).toContain('car no longer available');
  });
  
  test('should handle deletion during live chat', async () => {
    const { car, channel } = await setupActiveConversation();
    
    // Buyer is in active chat
    const buyerUI = render(<ChatWindow channelId={channel.id} />);
    
    // Seller deletes car
    await deleteCar(car.id);
    
    // Buyer should see banner appear in real-time
    await waitFor(() => {
      expect(buyerUI.getByText(/no longer available/i)).toBeInTheDocument();
    });
    
    // Message input should be disabled
    const input = buyerUI.getByRole('textbox');
    expect(input).toBeDisabled();
  });
});
```

**معايير النجاح:**
- ✅ القناة تُؤرشف تلقائياً في RTDB
- ✅ Banner يظهر في الوقت الفعلي
- ✅ لا يمكن إرسال رسائل جديدة
- ✅ الرسائل السابقة تبقى قابلة للقراءة

---

## Scenario 4: تبديل سريع بين محادثات (Memory Leak Check) 💾

**المشكلة الأصلية:**  
عند التبديل السريع بين القنوات، الـ listeners القديمة لا تُلغى، مسببة memory leaks.

**الاختبار:**
```typescript
describe('Scenario 4: Rapid Channel Switching', () => {
  test('should cleanup listeners when switching channels', async () => {
    // 1. Create 10 channels
    const channels = await createTestChannels(10);
    
    // 2. Track active listeners
    const listenerTracker = createListenerTracker();
    
    // 3. Switch rapidly through all channels
    for (const channel of channels) {
      await selectChannel(channel.id);
      await wait(50); // 50ms between switches
    }
    
    // 4. Verify only 1 active listener
    const activeListeners = listenerTracker.getActive();
    expect(activeListeners.length).toBe(1);
    expect(activeListeners[0].channelId).toBe(channels[9].id); // Last one
  });
  
  test('should not corrupt state during rapid switching', async () => {
    const channels = await createTestChannels(5);
    
    // Send unique message to each channel
    for (let i = 0; i < channels.length; i++) {
      await sendMessage(channels[i].id, `Message ${i}`);
    }
    
    // Rapidly switch and verify correct messages
    for (let i = 0; i < channels.length; i++) {
      await selectChannel(channels[i].id);
      
      const messages = await getChannelMessages(channels[i].id);
      expect(messages[0].content).toBe(`Message ${i}`);
    }
  });
  
  test('should handle 50 channels without performance degradation', async () => {
    const channels = await createTestChannels(50);
    
    const startTime = Date.now();
    
    // Switch through all 50
    for (const channel of channels) {
      await selectChannel(channel.id);
    }
    
    const duration = Date.now() - startTime;
    
    // Should complete in < 5 seconds
    expect(duration).toBeLessThan(5000);
  });
});
```

**معايير النجاح:**
- ✅ فقط listener واحد نشط في أي وقت
- ✅ لا يوجد state corruption
- ✅ الأداء لا يتدهور مع عدد القنوات

---

## Scenario 5: رسائل أثناء انقطاع الشبكة 📶

**المشكلة الأصلية:**  
عند انقطاع الشبكة، الرسائل تفشل بدون retry أو queuing.

**الاختبار:**
```typescript
describe('Scenario 5: Offline Messaging', () => {
  test('should queue messages when offline', async () => {
    const { channel } = await setupConversation();
    
    // 1. Go offline
    await simulateNetworkOffline();
    
    // 2. Send message
    const result = await sendMessage(channel.id, 'offline message');
    
    // 3. Verify queued (not failed)
    expect(result.status).toBe('queued');
    expect(result.queuedAt).toBeDefined();
    
    // 4. Go back online
    await simulateNetworkOnline();
    
    // 5. Wait for auto-send
    await waitFor(() => {
      expect(result.status).toBe('sent');
    }, { timeout: 5000 });
  });
  
  test('should show network status banner', async () => {
    const ui = render(<ChatWindow channelId={channelId} />);
    
    // Go offline
    await simulateNetworkOffline();
    
    // Banner should appear
    expect(ui.getByText(/no internet/i)).toBeInTheDocument();
    
    // Retry button should be present
    const retryBtn = ui.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();
    
    // Go back online
    await simulateNetworkOnline();
    
    // Banner should disappear
    await waitFor(() => {
      expect(ui.queryByText(/no internet/i)).not.toBeInTheDocument();
    });
  });
  
  test('should auto-retry on reconnection', async () => {
    const { channel } = await setupConversation();
    
    await simulateNetworkOffline();
    
    // Queue 3 messages
    await sendMessage(channel.id, 'msg 1');
    await sendMessage(channel.id, 'msg 2');
    await sendMessage(channel.id, 'msg 3');
    
    // Go back online
    await simulateNetworkOnline();
    
    // All 3 should send automatically
    await waitFor(async () => {
      const messages = await getChannelMessages(channel.id);
      expect(messages).toHaveLength(3);
    });
  });
});
```

**معايير النجاح:**
- ✅ الرسائل تُضاف للـ queue عند offline
- ✅ Banner يظهر/يختفي مع حالة الشبكة
- ✅ Auto-retry عند العودة online
- ✅ الترتيب محفوظ

---

## Scenario 6: محادثة مع مستخدم محظور 🚫

**المشكلة الأصلية:**  
يتم إنشاء القناة أولاً، ثم يفشل إرسال الرسالة بسبب الحظر.

**الاختبار:**
```typescript
describe('Scenario 6: Blocked User Conversation', () => {
  test('should prevent channel creation with blocked user', async () => {
    const { buyer, seller } = await createTestUsers(2);
    
    // 1. Buyer blocks seller
    await blockUser(buyer.numericId, seller.numericId);
    
    // 2. Try to create channel
    await expect(
      createChannel({
        buyerNumericId: buyer.numericId,
        sellerNumericId: seller.numericId,
        carNumericId: 1,
      })
    ).rejects.toThrow('Cannot create conversation with blocked user');
  });
  
  test('should check both directions (bidirectional block)', async () => {
    const { buyer, seller } = await createTestUsers(2);
    
    // Seller blocks buyer
    await blockUser(seller.numericId, buyer.numericId);
    
    // Buyer tries to message
    await expect(
      createChannel({
        buyerNumericId: buyer.numericId,
        sellerNumericId: seller.numericId,
        carNumericId: 1,
      })
    ).rejects.toThrow('blocked user');
  });
  
  test('should handle existing conversation after block', async () => {
    const { channel, buyer, seller } = await setupActiveConversation();
    
    // Block after conversation exists
    await blockUser(buyer.numericId, seller.numericId);
    
    // Try to send message
    await expect(
      sendMessage(channel.id, 'test', buyer.numericId)
    ).rejects.toThrow('Cannot send message to blocked user');
    
    // UI should show blocked state
    const ui = render(<ChatWindow channelId={channel.id} userNumericId={buyer.numericId} />);
    expect(ui.getByText(/blocked/i)).toBeInTheDocument();
  });
});
```

**معايير النجاح:**
- ✅ Block check يحدث قبل إنشاء القناة
- ✅ يعمل في كلا الاتجاهين
- ✅ المحادثات الموجودة تُعطل بعد Block
- ✅ رسالة واضحة للمستخدم

---

## Scenario 7: حد الرسائل (Rate Limiting) ⏱️

**المشكلة الأصلية:**  
لا يوجد rate limiting، يمكن إرسال spam.

**الاختبار:**
```typescript
describe('Scenario 7: Message Rate Limiting', () => {
  test('should limit to 10 messages per minute', async () => {
    const { channel, buyer } = await setupConversation();
    
    // Send 10 messages (should succeed)
    const first10 = await Promise.all(
      Array(10).fill(0).map((_, i) => sendMessage(channel.id, `msg ${i}`, buyer.numericId))
    );
    
    expect(first10.every(r => r.success)).toBe(true);
    
    // 11th message should fail
    const result = await sendMessage(channel.id, 'spam', buyer.numericId);
    expect(result.success).toBe(false);
    expect(result.error).toContain('rate limit');
  });
  
  test('should reset limit after 1 minute', async () => {
    const { channel, buyer } = await setupConversation();
    
    // Send 10 messages
    await Promise.all(
      Array(10).fill(0).map(() => sendMessage(channel.id, 'msg', buyer.numericId))
    );
    
    // Wait 61 seconds
    await wait(61000);
    
    // Should be able to send again
    const result = await sendMessage(channel.id, 'after reset', buyer.numericId);
    expect(result.success).toBe(true);
  });
  
  test('should show rate limit message in UI', async () => {
    const { channel, buyer } = await setupConversation();
    const ui = render(<ChatWindow channelId={channel.id} userNumericId={buyer.numericId} />);
    
    // Send 10 messages rapidly
    for (let i = 0; i < 10; i++) {
      await sendMessage(channel.id, `msg ${i}`, buyer.numericId);
    }
    
    // Try to send 11th
    const input = ui.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'spam' } });
    fireEvent.submit(input.closest('form')!);
    
    // Should show error
    await waitFor(() => {
      expect(ui.getByText(/rate limit/i)).toBeInTheDocument();
    });
  });
});
```

**معايير النجاح:**
- ✅ Max 10 رسائل/دقيقة
- ✅ الحد يُعاد بعد 60 ثانية
- ✅ رسالة خطأ واضحة
- ✅ لا يؤثر على المستخدمين الآخرين

---

## ملخص الاختبارات

| # | السيناريو | الأولوية | الوقت المقدر | الحالة |
|---|-----------|----------|---------------|--------|
| 1 | مستخدم بدون numericId | P0 | 2 ساعة | ⏳ جاهز |
| 2 | سيارة قديمة | P1 | 1 ساعة | ⏳ جاهز |
| 3 | حذف السيارة | P0 | 2 ساعة | ⏳ جاهز |
| 4 | Memory Leaks | P0 | 2 ساعة | ⏳ جاهز |
| 5 | Offline | P1 | 2 ساعة | ⏳ جاهز |
| 6 | حظر المستخدم | P0 | 1.5 ساعة | ⏳ جاهز |
| 7 | Rate Limiting | P2 | 1 ساعة | ⏳ جاهز |
| **المجموع** | - | - | **11.5 ساعة** | - |

---

## تنفيذ الاختبارات

### 1. إنشاء Test Helpers

```typescript
// tests/helpers/conversation-helpers.ts
export async function setupActiveConversation() {
  const buyer = await createTestUser({ role: 'buyer' });
  const seller = await createTestUser({ role: 'seller' });
  const car = await createTestCar({ sellerId: seller.firebaseId });
  const channel = await createChannel({
    buyerNumericId: buyer.numericId,
    sellerNumericId: seller.numericId,
    carNumericId: car.numericId,
  });
  
  return { buyer, seller, car, channel };
}

export async function simulateNetworkOffline() {
  // Mock navigator.onLine
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: false,
  });
  
  // Dispatch offline event
  window.dispatchEvent(new Event('offline'));
}
```

### 2. إعداد البيئة

```bash
# Install test dependencies
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  firebase-mock \
  jest-environment-jsdom

# Run tests
npm run test:critical-scenarios
```

### 3. CI/CD Integration

```yaml
# .github/workflows/messaging-tests.yml
name: Critical Messaging Tests

on: [pull_request, push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:critical-scenarios
      
      # Block merge if tests fail
      - name: Check test results
        if: failure()
        run: exit 1
```

---

## الخلاصة

**هذه الاختبارات الـ7 غير قابلة للتفاوض.** يجب أن تمر كلها قبل نشر نظام المراسلة للإنتاج.

**الأولويات:**
- **P0 (يجب تمريرها):** 1, 3, 4, 6
- **P1 (مهمة جداً):** 2, 5
- **P2 (مهمة):** 7

**الوقت الإجمالي:** 11.5 ساعة (1.5 يوم)

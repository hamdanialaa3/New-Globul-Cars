# 🧪 دليل الاختبار السريع - نظام المراسلات الفوري
# Quick Testing Guide - Realtime Messaging System

**Last Updated:** January 8, 2026  
**Purpose:** Verify all features work correctly

---

## 🚀 بدء الاختبار | Starting Tests

### 1. **Start Development Server**
```bash
npm start
```
Wait for: `Compiled successfully!` at `http://localhost:3000`

### 2. **Login with Test Users**
You need **TWO USERS** for testing:
- **User A (Buyer):** Login as buyer
- **User B (Seller):** Login as seller (different browser/incognito)

---

## 📋 قائمة الاختبارات | Test Checklist

### ✅ **Test 1: Basic Message Sending**
**Steps:**
1. User A: Go to a car details page
2. Click **"Chat"** button
3. Should redirect to `/messages?channel=msg_X_Y_car_Z`
4. Type a message: "Hello, is the car available?"
5. Press **Enter** or click **Send** button
6. Message appears in chat

**Expected:**
- ✅ Message sent successfully
- ✅ Timestamp shows current time
- ✅ Message aligned to right (own message)

**User B verification:**
1. Go to `/messages`
2. See new channel in left sidebar
3. Click channel
4. See User A's message aligned to left

---

### ✅ **Test 2: Image Upload** 🖼️
**Steps (User A):**
1. In chat window, click **📷 Image button**
2. Select an image file:
   - Valid: JPEG, PNG, WebP, GIF
   - Size: < 5MB
3. Wait for upload (progress indicator)
4. Image message appears: "📷 صورة"

**Expected:**
- ✅ File picker opens
- ✅ Upload shows loading state
- ✅ Message created with type: `image`
- ✅ Thumbnail generated (200px width)
- ✅ Full image URL stored

**User B verification:**
1. See image message appear in real-time
2. (Future: Click to view full size)

**Error Cases to Test:**
- Upload .txt file → ❌ "Please select an image"
- Upload 10MB image → ❌ "File too large (max 5MB)"

---

### ✅ **Test 3: Offer System** 💰
**Steps (User A - Buyer):**
1. In chat, click **💵 Offer button** (dollar icon)
2. Offer panel appears
3. Enter amount: `25000`
4. Currency shows: `EUR`
5. Click **"Send"** or press **Enter**
6. Offer message appears with:
   - 💰 Icon
   - "Offer: 25,000 EUR"
   - Status: ⏳ Pending

**Expected:**
- ✅ Offer panel toggles on/off
- ✅ Amount validated (numbers only)
- ✅ Message type: `offer`
- ✅ Metadata includes: amount, currency, status, expiresAt

**User B verification (Seller):**
1. See offer message
2. (Future: Accept/Reject/Counter buttons)

---

### ✅ **Test 4: Typing Indicator** ⌨️
**Steps (User A):**
1. Open chat with User B
2. Start typing in input field
3. Don't send yet, keep typing

**User B verification:**
1. See below car title: "User A is typing..."
2. Blue pulsing animation
3. After 2 seconds of inactivity → indicator disappears

**Expected:**
- ✅ Real-time indicator updates
- ✅ Auto-stops after timeout
- ✅ Disappears on send

---

### ✅ **Test 5: Navigation & Routing** 🔗
**Test URLs:**
```
/messages                   → RealtimeMessagesPage
/messages-v2                → RealtimeMessagesPage (alias)
/messages?channel=msg_X_Y_car_Z → Auto-selects channel
```

**Steps:**
1. Navigate to `/messages-v2`
2. Should load realtime messaging (not old system)
3. Check URL changes to `/messages` (or stays as `/messages-v2`)
4. No 404 errors
5. No redirects to old `/messages` (old Firestore system)

**Expected:**
- ✅ `/messages` loads RealtimeMessagesPage
- ✅ `/messages-v2` loads same page
- ✅ Query param `?channel=X` selects channel
- ✅ No route conflicts

---

### ✅ **Test 6: Security** 🔒
**Test Case 1: Unauthenticated Access**
1. Logout
2. Try to access `/messages`
3. Should show: "Please log in to view your messages"

**Test Case 2: Invalid Channel Access**
1. User A (numericId: 80)
2. Manually navigate to: `/messages?channel=msg_90_95_car_1`
3. Should show: Permission denied or empty state

**Expected:**
- ✅ Auth required for all messaging
- ✅ Users can only access their own channels
- ✅ Firebase rules enforce participant check

---

### ✅ **Test 7: Real-time Updates** ⚡
**Setup:** Two browsers open (User A + User B)

**Steps:**
1. User A sends message: "Test real-time"
2. User B should see it **immediately** (no refresh needed)
3. User B sends reply: "Received!"
4. User A sees reply **immediately**

**Expected:**
- ✅ <100ms latency
- ✅ No page refresh needed
- ✅ Messages appear in both windows
- ✅ Scroll to bottom on new message

---

### ✅ **Test 8: Presence System** 🟢
**Steps:**
1. User A opens `/messages`
2. User B opens `/messages`
3. Check Firebase Console: `presence/{userId}`
4. Should see:
   ```json
   {
     "status": "online",
     "lastSeen": 1234567890,
     "device": "desktop"
   }
   ```

**Expected:**
- ✅ Status updates to "online" on login
- ✅ Status updates to "offline" on logout/close
- ✅ lastSeen timestamp accurate

---

## 🐛 معالجة الأخطاء | Error Handling

### **Common Issues:**

**Issue 1: "Permission denied"**
```
Cause: User not authenticated or not channel participant
Fix: Login and ensure you're buyer or seller
```

**Issue 2: "undefined in Firebase RTDB"**
```
Cause: Trying to set undefined values
Fix: All fixed in realtime-messaging.service.ts (use null or '')
```

**Issue 3: Image upload fails silently**
```
Cause: Storage rules or size limit
Fix: Check file size < 5MB and valid image type
```

**Issue 4: Old `/messages` system loads**
```
Cause: Route conflict
Fix: Verify MainRoutes.tsx points to RealtimeMessagesPage
```

---

## 📊 Firebase Console Verification

### **Check Data Structure:**

**1. Channels:**
```
/channels/msg_80_90_car_1
  buyerNumericId: 80
  sellerNumericId: 90
  carNumericId: 1
  buyerFirebaseId: "abc123"
  sellerFirebaseId: "def456"
  lastMessage: "Hello"
  lastMessageTime: 1234567890
  unreadCount:
    80: 0
    90: 1
```

**2. Messages:**
```
/messages/msg_80_90_car_1
  msg123:
    senderId: 80
    recipientId: 90
    content: "Hello"
    type: "text"
    timestamp: 1234567890
    read: false
```

**3. Typing:**
```
/typing/msg_80_90_car_1
  80:
    isTyping: true
    timestamp: 1234567890
    userName: "John Doe"
```

**4. Storage:**
```
/messaging/80/1704729600_abc123.jpg       (full image)
/messaging/80/1704729600_abc123_thumb.jpg (thumbnail)
```

---

## ✅ اختبار الأمان | Security Testing

### **Test Security Rules:**

**1. Test Read Access (Authenticated User):**
```javascript
// Should succeed
firebase.database().ref('channels/msg_80_90_car_1').once('value')
```

**2. Test Write Access (Participant):**
```javascript
// Should succeed (if user is buyer or seller)
firebase.database().ref('messages/msg_80_90_car_1').push({
  senderId: 80,
  content: 'Test'
})
```

**3. Test Blocked Access (Non-participant):**
```javascript
// Should fail with permission denied
firebase.database().ref('channels/msg_85_95_car_5').once('value')
```

---

## 🎯 Success Criteria

### **System is READY when:**
- ✅ All 8 tests pass
- ✅ No console errors
- ✅ Real-time updates work
- ✅ Image upload works
- ✅ Security rules enforced
- ✅ TypeScript compiles with no errors
- ✅ Firebase rules deployed successfully

---

## 📞 الدعم | Support

If any test fails:
1. Check browser console for errors
2. Check Firebase Console logs
3. Verify database rules are deployed
4. Verify `firebase-config.ts` has correct `databaseURL`
5. Refer to: `REALTIME_MESSAGING_COMPLETE_JAN8_2026.md`

---

**تاريخ التحديث | Last Updated:** January 8, 2026  
**الحالة | Status:** ✅ All Tests Passing

# ✅ قائمة التنفيذ الشاملة - Advanced Profile System

## 📋 المرحلة 1: إعداد البيئة (Setup)

### 1.1 Firebase Configuration

- [ ] **تفعيل Phone Authentication في Firebase Console**
  ```
  1. Go to: https://console.firebase.google.com
  2. Select Project: studio-448742006-a3493
  3. Authentication → Sign-in method
  4. Enable: Phone
  5. Add authorized domains
  ```

- [ ] **تفعيل Cloud Storage**
  ```
  1. Go to Storage
  2. Get Started
  3. Select: europe-west1 (Belgium)
  4. Security Rules: Copy from storage.rules
  ```

- [ ] **تفعيل Realtime Database**
  ```
  1. Go to Realtime Database
  2. Create Database
  3. Location: europe-west3
  4. Start in test mode (we'll add rules)
  ```

- [ ] **تفعيل Cloud Messaging (FCM)**
  ```
  1. Go to Project Settings → Cloud Messaging
  2. Generate Web Push Certificate (VAPID key)
  3. Add to .env: REACT_APP_VAPID_KEY
  ```

- [ ] **تفعيل Cloud Functions**
  ```bash
  cd functions
  npm install
  firebase deploy --only functions
  ```

### 1.2 Environment Variables

- [ ] **تحديث `.env.local`**
  ```env
  # Existing vars...
  
  # New additions
  REACT_APP_VAPID_KEY=your_vapid_key_here
  REACT_APP_AGORA_APP_ID=your_agora_app_id (optional for calls)
  REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_key (optional for premium)
  REACT_APP_VERIFF_API_KEY=your_veriff_key (optional for KYC)
  
  # Admin emails (for verification review)
  REACT_APP_ADMIN_EMAILS=admin1@globulcars.bg,admin2@globulcars.bg
  ```

### 1.3 NPM Packages

- [ ] **تثبيت الـ Dependencies الجديدة**
  ```bash
  cd bulgarian-car-marketplace
  
  # Image processing
  npm install sharp browser-image-compression
  
  # Phone verification
  npm install libphonenumber-js
  
  # Real-time presence
  npm install firebase@latest
  
  # Call system (choose one)
  npm install agora-rtc-sdk-ng  # Option A: Agora
  # OR
  npm install simple-peer  # Option B: WebRTC
  
  # Payments (optional)
  npm install @stripe/stripe-js @stripe/react-stripe-js
  
  # Utilities
  npm install date-fns crypto-js
  ```

---

## 📋 المرحلة 2: نظام الصور (Weeks 1-2)

### 2.1 Storage Structure

- [ ] **إنشاء Firebase Storage Rules**
  ```javascript
  // Update bulgarian-car-marketplace/storage.rules
  
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      // User profile images (public)
      match /users/{userId}/profile/{imageId} {
        allow read: if true;
        allow write: if request.auth != null && 
                        request.auth.uid == userId &&
                        request.resource.size < 5 * 1024 * 1024 &&
                        request.resource.contentType.matches('image/.*');
      }
      
      // Cover images (public)
      match /users/{userId}/cover/{imageId} {
        allow read: if true;
        allow write: if request.auth != null && 
                        request.auth.uid == userId &&
                        request.resource.size < 10 * 1024 * 1024 &&
                        request.resource.contentType.matches('image/.*');
      }
      
      // Documents (private - ID, license)
      match /users/{userId}/documents/{docId} {
        allow read: if request.auth != null && 
                       (request.auth.uid == userId || isAdmin());
        allow write: if request.auth != null && 
                        request.auth.uid == userId &&
                        request.resource.size < 5 * 1024 * 1024;
      }
    }
    
    function isAdmin() {
      return request.auth.token.email in [
        'admin1@globulcars.bg', 
        'admin2@globulcars.bg'
      ];
    }
  }
  ```

- [ ] **Deploy Storage Rules**
  ```bash
  firebase deploy --only storage
  ```

### 2.2 Image Processing Service

- [ ] **إنشاء Service جديد**
  ```bash
  touch src/services/image-processing-service.ts
  ```

- [ ] **كتابة الكود** (انظر PROFILE_SYSTEM_ROADMAP.md)

### 2.3 UI Components

- [ ] **إنشاء مكون رفع الصورة الشخصية**
  ```bash
  mkdir -p src/components/Profile/ImageUpload
  touch src/components/Profile/ImageUpload/ProfileImageUploader.tsx
  touch src/components/Profile/ImageUpload/CoverImageUploader.tsx
  touch src/components/Profile/ImageUpload/ImageCropper.tsx
  ```

- [ ] **إنشاء معاينة الصورة**
  ```bash
  touch src/components/Profile/ProfileImagePreview.tsx
  ```

- [ ] **تحديث ProfilePage**
  - إضافة ProfileImageUploader
  - إضافة CoverImageUploader
  - إضافة معاينة

### 2.4 Testing

- [ ] **اختبار رفع صورة شخصية**
  - Upload image < 5MB ✓
  - Upload image > 5MB ✗ (should fail)
  - Check if thumbnail generated
  - Check if stored in correct path

- [ ] **اختبار صورة الغلاف**
  - Upload cover < 10MB ✓
  - Check optimization (1200x400)

---

## 📋 المرحلة 3: نظام التحقق (Weeks 3-4)

### 3.1 Firestore Schema Update

- [ ] **تحديث User Document**
  ```typescript
  // Update src/firebase/auth-service.ts
  // Add verification fields to BulgarianUser interface
  
  verification: {
    email: { verified: boolean, verifiedAt: Date },
    phone: { verified: boolean, verifiedAt: Date, number: string },
    identity: { 
      verified: boolean, 
      verifiedAt: Date,
      documentType: string,
      status: 'pending' | 'approved' | 'rejected'
    },
    trustScore: number,
    level: TrustLevel,
    badges: Badge[]
  }
  ```

### 3.2 Phone Verification

- [ ] **إنشاء Phone Verification Service**
  ```bash
  touch src/services/phone-verification-service.ts
  ```

- [ ] **إنشاء UI Component**
  ```bash
  mkdir -p src/components/Verification
  touch src/components/Verification/PhoneVerification.tsx
  touch src/components/Verification/OTPInput.tsx
  ```

- [ ] **إضافة reCAPTCHA إلى HTML**
  ```html
  <!-- public/index.html -->
  <div id="recaptcha-container"></div>
  ```

- [ ] **Testing**
  - [ ] Send OTP to +359 number
  - [ ] Verify valid OTP
  - [ ] Reject invalid OTP
  - [ ] Update verification status

### 3.3 ID Verification (Manual)

- [ ] **إنشاء ID Verification Service**
  ```bash
  touch src/services/id-verification-service.ts
  ```

- [ ] **إنشاء Verification Request Collection**
  ```typescript
  // Firestore: verificationRequests/
  {
    userId: string,
    type: 'identity' | 'business' | 'address',
    status: 'pending' | 'approved' | 'rejected',
    documents: { front: string, back: string },
    submittedAt: Timestamp,
    reviewedBy: string | null,
    reviewedAt: Timestamp | null,
    notes: string
  }
  ```

- [ ] **إنشاء UI للرفع**
  ```bash
  touch src/components/Verification/IDVerification.tsx
  touch src/components/Verification/DocumentUpload.tsx
  ```

- [ ] **إنشاء Admin Review Panel**
  ```bash
  mkdir -p src/pages/Admin/VerificationReview
  touch src/pages/Admin/VerificationReview/index.tsx
  ```

### 3.4 Trust Score System

- [ ] **إنشاء Trust Score Service**
  ```bash
  touch src/services/trust-score-service.ts
  ```

- [ ] **Trust Score Calculation**
  ```typescript
  calculateTrustScore(user: BulgarianUser): number {
    let score = 0;
    
    if (user.verification.email.verified) score += 10;
    if (user.verification.phone.verified) score += 15;
    if (user.verification.identity.verified) score += 25;
    // ... etc
    
    return Math.min(score, 100);
  }
  ```

- [ ] **UI Badge Display**
  ```bash
  touch src/components/Profile/TrustBadge.tsx
  touch src/components/Profile/VerificationStatus.tsx
  ```

---

## 📋 المرحلة 4: نظام التقييم (Week 5)

### 4.1 Reviews Collection

- [ ] **إنشاء Reviews Collection في Firestore**
  ```typescript
  // reviews/{reviewId}
  {
    reviewerId: string,
    sellerId: string,
    carId: string,
    transactionId: string,
    ratings: {
      overall: number,
      communication: number,
      accuracy: number,
      professionalism: number
    },
    comment: string,
    isVerifiedPurchase: boolean,
    status: 'pending' | 'approved',
    createdAt: Timestamp
  }
  ```

- [ ] **Security Rules للمراجعات**
  ```javascript
  // firestore.rules
  match /reviews/{reviewId} {
    allow read: if true; // Public
    allow create: if isAuthenticated() && 
                     request.resource.data.reviewerId == request.auth.uid;
    allow update, delete: if isOwner(resource.data.reviewerId) || isAdmin();
  }
  ```

### 4.2 Review Service

- [ ] **إنشاء Review Service**
  ```bash
  touch src/services/review-service.ts
  ```

- [ ] **Functions:**
  - submitReview()
  - updateSellerRating()
  - reportReview()
  - deleteReview()

### 4.3 UI Components

- [ ] **مكون كتابة المراجعة**
  ```bash
  touch src/components/Reviews/WriteReview.tsx
  touch src/components/Reviews/StarRating.tsx
  ```

- [ ] **عرض المراجعات**
  ```bash
  touch src/components/Reviews/ReviewsList.tsx
  touch src/components/Reviews/ReviewCard.tsx
  ```

- [ ] **إضافة للبروفايل**
  - Display average rating
  - Show recent reviews
  - Link to all reviews page

---

## 📋 المرحلة 5: المراسلة المتقدمة (Weeks 6-7)

### 5.1 Realtime Database Setup

- [ ] **إنشاء Presence System**
  ```json
  // Realtime Database structure:
  {
    "status": {
      "{userId}": {
        "state": "online" | "offline",
        "lastSeen": timestamp
      }
    },
    "typing": {
      "{conversationId}": {
        "{userId}": timestamp
      }
    }
  }
  ```

- [ ] **Realtime Database Rules**
  ```json
  {
    "rules": {
      "status": {
        "$userId": {
          ".read": true,
          ".write": "$userId === auth.uid"
        }
      },
      "typing": {
        "$conversationId": {
          ".read": true,
          "$userId": {
            ".write": "$userId === auth.uid"
          }
        }
      }
    }
  }
  ```

### 5.2 Presence Service

- [ ] **إنشاء Presence Service**
  ```bash
  touch src/services/presence-service.ts
  ```

- [ ] **Features:**
  - setUserOnline()
  - setUserOffline()
  - subscribeToPresence()
  - setTyping()

### 5.3 Enhanced Messaging

- [ ] **تحديث Message Model**
  ```typescript
  // Add to existing Message interface:
  status: 'sending' | 'sent' | 'delivered' | 'read',
  readReceipts: { userId: string, readAt: Date }[],
  attachments: MessageAttachment[],
  reactions: { userId: string, emoji: string }[]
  ```

- [ ] **Update MessagingService**
  - Add typing indicators
  - Add read receipts
  - Add file attachments
  - Add message reactions

### 5.4 Push Notifications

- [ ] **إنشاء Push Notification Service**
  ```bash
  touch src/services/push-notification-service.ts
  ```

- [ ] **Service Worker للإشعارات**
  ```bash
  touch public/firebase-messaging-sw.js
  ```

- [ ] **Cloud Function للإشعارات**
  ```bash
  # في functions/src/
  touch functions/src/notifications.ts
  ```

### 5.5 UI Updates

- [ ] **Typing Indicator Component**
  ```bash
  touch src/components/Messaging/TypingIndicator.tsx
  ```

- [ ] **Read Receipts Display**
  - Add checkmarks (✓✓) for read
  - Single checkmark (✓) for delivered

- [ ] **Message Actions**
  - Reply/Quote
  - React with emoji
  - Delete message
  - Report message

---

## 📋 المرحلة 6: نظام الاتصال (Weeks 8-10)

### 6.1 اختيار التقنية

- [ ] **قرار: Agora vs WebRTC**
  - [ ] Agora (موصى به): $0.99/1000 minutes
  - [ ] WebRTC (مجاني): More complex setup

### 6.2 Call Service (Agora)

- [ ] **Sign up for Agora**
  ```
  1. Go to: https://www.agora.io
  2. Sign up / Login
  3. Create Project
  4. Get APP ID
  5. Enable Token Authentication
  ```

- [ ] **إنشاء Call Service**
  ```bash
  touch src/services/agora-call-service.ts
  ```

- [ ] **Cloud Function للـ Token**
  ```bash
  touch functions/src/agora-token.ts
  ```

### 6.3 Call UI

- [ ] **إنشاء Call Components**
  ```bash
  mkdir -p src/components/Call
  touch src/components/Call/CallScreen.tsx
  touch src/components/Call/CallControls.tsx
  touch src/components/Call/IncomingCall.tsx
  touch src/components/Call/CallHistory.tsx
  ```

- [ ] **Call Features:**
  - Voice call
  - Video call
  - Mute/unmute
  - Camera on/off
  - End call
  - Call duration timer
  - Call quality indicator

### 6.4 Signaling

- [ ] **إنشاء Call Signaling Collection**
  ```typescript
  // callSignals/{signalId}
  {
    type: 'offer' | 'answer' | 'ice_candidate' | 'hangup',
    from: string,
    to: string,
    data: any,
    timestamp: Timestamp
  }
  ```

- [ ] **Real-time listeners**
  - Listen for incoming calls
  - Listen for call accept/reject
  - Listen for hangup

---

## 📋 المرحلة 7: التكاملات (Week 11)

### 7.1 GitHub Integration

- [ ] **GitHub Actions للـ Deployment**
  ```bash
  mkdir -p .github/workflows
  touch .github/workflows/deploy.yml
  touch .github/workflows/tests.yml
  ```

- [ ] **Auto-deploy on push to main**

- [ ] **Run tests on PR**

### 7.2 Analytics

- [ ] **Google Analytics 4**
  ```typescript
  // Track key events:
  - profile_view
  - verification_started
  - verification_completed
  - call_initiated
  - call_completed
  - review_submitted
  ```

- [ ] **Custom Dashboard**
  - Daily active users
  - Verification conversion rate
  - Call success rate
  - Average trust score

### 7.3 Monitoring

- [ ] **Firebase Performance Monitoring**
  ```typescript
  import { getPerformance } from 'firebase/performance';
  const perf = getPerformance();
  ```

- [ ] **Error Tracking**
  - Integrate Sentry or Bugsnag
  - Log errors to Cloud Functions

---

## 📋 المرحلة 8: Testing (Week 12)

### 8.1 Unit Tests

- [ ] **Test Services**
  ```bash
  npm test -- ImageProcessingService
  npm test -- PhoneVerificationService
  npm test -- TrustScoreService
  npm test -- ReviewService
  ```

### 8.2 Integration Tests

- [ ] **Test Flows**
  - Complete profile flow
  - Verification flow
  - Messaging flow
  - Call flow

### 8.3 E2E Tests

- [ ] **Cypress Tests**
  ```bash
  npm install -D cypress
  npx cypress open
  ```

- [ ] **Test Scenarios**
  - User signs up → verifies email → uploads profile photo
  - User submits ID for verification → admin reviews
  - User A messages User B → User B receives notification
  - User A calls User B → Call connects

### 8.4 Performance Testing

- [ ] **Lighthouse Score**
  - Target: 90+ on all metrics
  
- [ ] **Load Testing**
  - 1000 concurrent users
  - 100 simultaneous calls

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing ✓
- [ ] No console errors ✓
- [ ] No linter errors ✓
- [ ] Performance score > 90 ✓
- [ ] Security rules deployed ✓
- [ ] Environment variables set ✓

### Deployment Steps

```bash
# 1. Build
npm run build

# 2. Test build locally
npx serve -s build

# 3. Deploy Firebase
firebase deploy --only hosting,functions,storage,firestore

# 4. Verify deployment
# Check: https://globul-cars.web.app

# 5. Monitor for errors
firebase functions:log --limit 50
```

### Post-Deployment

- [ ] Smoke tests on production
- [ ] Monitor error rates
- [ ] Check analytics
- [ ] Gather user feedback

---

## 🎯 Success Criteria

✅ **Profile System:**
- [ ] 85%+ users complete profile with photo
- [ ] Average profile load time < 500ms

✅ **Verification:**
- [ ] 70%+ email verification rate
- [ ] 50%+ phone verification rate
- [ ] 30%+ ID verification rate
- [ ] Average verification time < 24 hours

✅ **Reviews:**
- [ ] 60%+ transactions get reviewed
- [ ] Average rating > 4.0/5.0

✅ **Messaging:**
- [ ] 90%+ message delivery rate
- [ ] Average response time < 2 hours
- [ ] 80%+ users enable push notifications

✅ **Calls:**
- [ ] 75%+ call completion rate
- [ ] < 5% call drops
- [ ] Average call quality > 4.0/5.0

---

## 📞 مساعدة وإرشادات

### إذا واجهت مشكلة:

1. **Check Firebase Console:**
   - Usage quotas
   - Error logs
   - Security rules

2. **Check Browser Console:**
   - Network errors
   - JavaScript errors

3. **Check Documentation:**
   - Firebase: https://firebase.google.com/docs
   - Agora: https://docs.agora.io

4. **GitHub Issues:**
   - Create issue with details
   - Assign to team member

---

## 🎉 النجاح النهائي!

عندما تكتمل كل النقاط أعلاه، ستكون لديك منصة احترافية 100% تنافس أفضل المنصات العالمية!

**Globul Cars = #1 في بلغاريا! 🇧🇬🚀**

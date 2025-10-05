# 🎯 خطة تطوير نظام البروفايل الاحترافي - مشروع Globul Cars

## 📋 نظرة عامة (Overview)

هذه خطة شاملة لتحويل نظام البروفايل الحالي إلى نظام احترافي متكامل يضاهي منصات التواصل الاجتماعي مع التركيز على الثقة والأمان في سوق السيارات البلغاري.

---

## 🎯 الهدف النهائي: نجاح 100%

```
المستخدم الموثوق = صفقات آمنة = سمعة ممتازة = نمو المنصة
```

---

## 📊 المرحلة 1: نظام البروفايل المتقدم (2-3 أسابيع)

### 1.1 الصورة الشخصية والغلاف

#### **التصميم:**
```typescript
// New Profile Structure
interface AdvancedProfile extends BulgarianUser {
  // Images
  profileImage: {
    url: string;              // Firebase Storage URL
    thumbnail: string;        // 150x150 optimized
    medium: string;           // 400x400 optimized
    uploadedAt: Date;
    isVerified: boolean;      // Face match with ID
  };
  
  coverImage: {
    url: string;              // 1200x400 cover photo
    thumbnail: string;        // 600x200 preview
    uploadedAt: Date;
  };
  
  gallery: ProfileImage[];    // Additional photos (max 10)
}

interface ProfileImage {
  id: string;
  url: string;
  thumbnail: string;
  type: 'profile' | 'cover' | 'gallery' | 'id' | 'license';
  uploadedAt: Date;
  isPublic: boolean;
}
```

#### **الخدمات المطلوبة:**

**A. Firebase Storage:**
```typescript
// Structure:
users/{userId}/
├── profile/
│   ├── avatar_original.jpg      (max 5MB)
│   ├── avatar_thumbnail.jpg     (150x150, <50KB)
│   ├── avatar_medium.jpg        (400x400, <200KB)
│   └── avatar_large.jpg         (800x800, <500KB)
├── cover/
│   ├── cover_original.jpg       (max 10MB)
│   └── cover_optimized.jpg      (1200x400, <500KB)
├── gallery/
│   ├── gallery_1.jpg
│   ├── gallery_2.jpg
│   └── ...
└── documents/                   (private, encrypted)
    ├── id_front.jpg
    ├── id_back.jpg
    ├── license.jpg
    └── proof_of_address.pdf
```

**B. Image Processing Service:**
```typescript
// services/image-processing-service.ts
export class ImageProcessingService {
  // Resize and optimize
  async processProfileImage(file: File): Promise<ProcessedImages> {
    return {
      original: await uploadOriginal(file),
      thumbnail: await resizeAndUpload(file, 150, 150),
      medium: await resizeAndUpload(file, 400, 400),
      large: await resizeAndUpload(file, 800, 800)
    };
  }
  
  // Compress cover image
  async processCoverImage(file: File): Promise<CoverImages> {
    return {
      original: await uploadOriginal(file),
      optimized: await resizeAndUpload(file, 1200, 400)
    };
  }
  
  // Detect inappropriate content using Firebase ML Kit
  async moderateImage(file: File): Promise<ModerationResult> {
    // Check for inappropriate content
    // Return: { isAppropriate: boolean, confidence: number }
  }
}
```

**C. Storage Rules Update:**
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile images
    match /users/{userId}/profile/{imageId} {
      allow read: if true; // Public
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 5 * 1024 * 1024 && // 5MB max
                      request.resource.contentType.matches('image/.*');
    }
    
    // Cover images
    match /users/{userId}/cover/{imageId} {
      allow read: if true; // Public
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 10 * 1024 * 1024 && // 10MB max
                      request.resource.contentType.matches('image/.*');
    }
    
    // Private documents (ID verification)
    match /users/{userId}/documents/{docId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == userId || 
                      isAdmin(request.auth.uid));
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

#### **مكونات UI الجديدة:**

```typescript
// components/Profile/ProfileImageUploader.tsx
- Drag & drop interface
- Image cropping tool
- Real-time preview
- Upload progress
- Error handling

// components/Profile/CoverImageEditor.tsx
- Cover photo upload
- Repositioning tool
- Zoom and crop
- Preset templates

// components/Profile/ProfileGallery.tsx
- Grid layout (3x3)
- Add/remove images
- Reorder by drag-drop
- Lightbox viewer
```

---

### 1.2 معلومات البائع التفصيلية

#### **حقول جديدة في البروفايل:**

```typescript
interface SellerProfile {
  // Business Information
  businessInfo?: {
    businessName: string;
    businessType: 'individual' | 'dealer' | 'company';
    taxId?: string;           // Bulgarian VAT number
    registrationNumber?: string;
    businessAddress?: Address;
    websiteUrl?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
  
  // Statistics
  stats: {
    carsListed: number;
    carsSold: number;
    totalRevenue: number;
    averagePrice: number;
    responseTime: number;     // Average in minutes
    responseRate: number;     // Percentage
    activeListings: number;
    totalViews: number;
    favoriteCount: number;
  };
  
  // Seller Details
  sellerDetails: {
    yearsOfExperience: number;
    specializations: string[];  // ['BMW', 'Mercedes', 'Luxury Cars']
    servicesOffered: string[];  // ['Financing', 'Trade-in', 'Warranty']
    languages: string[];        // ['Bulgarian', 'English', 'Russian']
    operatingHours: {
      monday: { open: string; close: string };
      tuesday: { open: string; close: string };
      // ... rest of week
    };
    acceptedPayments: string[]; // ['Cash', 'Bank Transfer', 'Crypto']
  };
  
  // Verification Status
  verification: VerificationStatus;
  
  // Reviews & Ratings
  reviews: {
    average: number;          // 0-5
    total: number;
    breakdown: {
      communication: number;
      accuracy: number;
      professionalism: number;
      valueForMoney: number;
    };
  };
}
```

---

## 📊 المرحلة 2: نظام التحقق من الهوية (2 أسابيع)

### 2.1 نظام التحقق متعدد المستويات

```typescript
interface VerificationStatus {
  level: 'unverified' | 'email_verified' | 'phone_verified' | 
         'id_verified' | 'business_verified' | 'premium_verified';
  
  email: {
    verified: boolean;
    verifiedAt?: Date;
  };
  
  phone: {
    verified: boolean;
    verifiedAt?: Date;
    method: 'sms' | 'call';
  };
  
  identity: {
    verified: boolean;
    verifiedAt?: Date;
    documentType: 'id_card' | 'passport' | 'drivers_license';
    documentNumber: string;        // Encrypted
    expiryDate: Date;
    verifiedBy: 'automated' | 'manual' | 'third_party';
  };
  
  business: {
    verified: boolean;
    verifiedAt?: Date;
    documents: string[];           // Document IDs
  };
  
  address: {
    verified: boolean;
    verifiedAt?: Date;
    method: 'utility_bill' | 'bank_statement' | 'mail_verification';
  };
  
  // Overall trust score
  trustScore: number;              // 0-100
  badges: string[];                // ['Verified Seller', 'Top Rated', 'Quick Responder']
}
```

### 2.2 خدمات التحقق

#### **A. Email Verification** (✅ موجود بالفعل)
```typescript
// Already implemented in EmailVerificationService
```

#### **B. Phone Verification** (جديد)
```typescript
// Using Firebase Phone Auth
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export class PhoneVerificationService {
  async sendVerificationCode(phoneNumber: string) {
    const appVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible'
    }, auth);
    
    const confirmationResult = await signInWithPhoneNumber(
      auth, 
      phoneNumber, 
      appVerifier
    );
    
    return confirmationResult;
  }
  
  async verifyCode(confirmationResult: any, code: string) {
    const result = await confirmationResult.confirm(code);
    
    // Update user verification status
    await updateDoc(doc(db, 'users', result.user.uid), {
      'verification.phone.verified': true,
      'verification.phone.verifiedAt': serverTimestamp()
    });
    
    return true;
  }
}
```

#### **C. Identity Verification** (جديد - متقدم)

**Option 1: Manual Verification (مبدئي)**
```typescript
export class ManualIDVerificationService {
  async submitIDForVerification(
    userId: string, 
    frontImage: File, 
    backImage: File
  ) {
    // 1. Upload encrypted documents
    const frontUrl = await uploadEncryptedDocument(userId, frontImage, 'id_front');
    const backUrl = await uploadEncryptedDocument(userId, backImage, 'id_back');
    
    // 2. Create verification request
    await addDoc(collection(db, 'verificationRequests'), {
      userId,
      type: 'identity',
      status: 'pending',
      documents: { front: frontUrl, back: backUrl },
      submittedAt: serverTimestamp(),
      reviewedBy: null,
      reviewedAt: null
    });
    
    // 3. Notify admins
    await sendAdminNotification('New ID verification request');
    
    return { success: true, message: 'Документите са изпратени за проверка' };
  }
  
  // Admin review
  async reviewIDVerification(requestId: string, approved: boolean, notes?: string) {
    const request = await getDoc(doc(db, 'verificationRequests', requestId));
    const data = request.data();
    
    if (approved) {
      // Update user verification status
      await updateDoc(doc(db, 'users', data.userId), {
        'verification.identity.verified': true,
        'verification.identity.verifiedAt': serverTimestamp(),
        'verification.identity.verifiedBy': 'manual',
        'verification.trustScore': increment(25) // +25 points
      });
    }
    
    // Update request
    await updateDoc(doc(db, 'verificationRequests', requestId), {
      status: approved ? 'approved' : 'rejected',
      reviewedBy: auth.currentUser.uid,
      reviewedAt: serverTimestamp(),
      notes
    });
  }
}
```

**Option 2: Automated OCR Verification (متقدم)**
```typescript
// Using Google Cloud Vision API
import vision from '@google-cloud/vision';

export class AutomatedIDVerificationService {
  private visionClient = new vision.ImageAnnotatorClient();
  
  async extractIDData(imageFile: File): Promise<ExtractedIDData> {
    // 1. Upload to temporary storage
    const tempUrl = await uploadTemp(imageFile);
    
    // 2. OCR with Google Vision
    const [result] = await this.visionClient.textDetection(tempUrl);
    const detections = result.textAnnotations;
    
    // 3. Parse Bulgarian ID format
    const extractedData = this.parseBulgarianID(detections);
    
    // 4. Verify with government database (optional, requires API)
    // const isValid = await verifyWithGovernmentDB(extractedData);
    
    return extractedData;
  }
  
  private parseBulgarianID(text: string): ExtractedIDData {
    // Bulgarian ID format: 
    // - 10-digit EGN (Personal Identification Number)
    // - Name in Cyrillic
    // - Birth date, place
    // - Issue date, expiry
    
    const egnRegex = /\d{10}/;
    const nameRegex = /[А-Я][а-я]+\s[А-Я][а-я]+/;
    
    return {
      egn: text.match(egnRegex)?.[0],
      name: text.match(nameRegex)?.[0],
      // ... more parsing
    };
  }
}
```

**Option 3: Third-Party KYC Service (الأفضل)**
```typescript
// Integration with Jumio, Onfido, or Veriff
import { Veriff } from '@veriff/js-sdk';

export class ThirdPartyKYCService {
  private veriff = Veriff({
    apiKey: process.env.VERIFF_API_KEY,
    parentId: 'veriff-root'
  });
  
  async startVerification(userId: string) {
    // 1. Create verification session
    const session = await this.veriff.createSession({
      person: {
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
    
    // 2. Open Veriff modal
    this.veriff.mount({
      onComplete: async (data) => {
        await this.handleVerificationComplete(userId, data);
      }
    });
  }
  
  private async handleVerificationComplete(userId: string, data: any) {
    if (data.status === 'approved') {
      await updateDoc(doc(db, 'users', userId), {
        'verification.identity.verified': true,
        'verification.identity.verifiedAt': serverTimestamp(),
        'verification.identity.verifiedBy': 'third_party',
        'verification.trustScore': increment(30)
      });
    }
  }
}
```

---

## 📊 المرحلة 3: نظام التقييم والثقة (1.5 أسبوع)

### 3.1 نظام التقييم المتدرج

```typescript
// Trust Level System
enum TrustLevel {
  UNVERIFIED = 'unverified',           // 0-20 points
  BASIC = 'basic',                     // 21-40 points
  TRUSTED = 'trusted',                 // 41-60 points
  VERIFIED = 'verified',               // 61-80 points
  PREMIUM = 'premium'                  // 81-100 points
}

interface TrustScore {
  total: number;                       // 0-100
  breakdown: {
    emailVerified: number;             // +10 points
    phoneVerified: number;             // +15 points
    identityVerified: number;          // +25 points
    businessVerified: number;          // +20 points
    completedProfile: number;          // +10 points
    positiveReviews: number;           // +15 points (based on avg rating)
    activityScore: number;             // +5 points (regular activity)
  };
  level: TrustLevel;
  badges: Badge[];
  lastUpdated: Date;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  type: 'verification' | 'achievement' | 'milestone';
}

// Badge Types:
const BADGES = {
  EMAIL_VERIFIED: {
    name: 'Потвърден имейл',
    icon: '✉️',
    requirement: 'Email verified'
  },
  PHONE_VERIFIED: {
    name: 'Потвърден телефон',
    icon: '📱',
    requirement: 'Phone verified'
  },
  ID_VERIFIED: {
    name: 'Потвърдена самоличност',
    icon: '🆔',
    requirement: 'ID verified'
  },
  TOP_SELLER: {
    name: 'Топ Продавач',
    icon: '⭐',
    requirement: '10+ successful sales'
  },
  QUICK_RESPONDER: {
    name: 'Бърз Отговор',
    icon: '⚡',
    requirement: 'Response time < 1 hour'
  },
  FIVE_STAR_SELLER: {
    name: '5-Звезден Продавач',
    icon: '🌟',
    requirement: 'Average rating 4.8+'
  }
};
```

### 3.2 نظام المراجعات والتقييمات

```typescript
interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerPhoto?: string;
  sellerId: string;
  carId: string;                    // Car that was sold
  transactionId?: string;
  
  // Ratings (1-5 stars)
  ratings: {
    overall: number;
    communication: number;
    accuracy: number;
    professionalism: number;
    valueForMoney: number;
  };
  
  // Review text
  comment: string;
  pros?: string[];
  cons?: string[];
  
  // Verification
  isVerifiedPurchase: boolean;
  
  // Response from seller
  sellerResponse?: {
    text: string;
    respondedAt: Date;
  };
  
  // Moderation
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  isHelpful: number;                // Count of helpful votes
  isReported: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// Service
export class ReviewService {
  async submitReview(review: Omit<Review, 'id'>): Promise<string> {
    // 1. Verify transaction exists
    const transaction = await this.verifyTransaction(
      review.transactionId,
      review.reviewerId,
      review.sellerId
    );
    
    if (!transaction) {
      throw new Error('Cannot review: No verified transaction found');
    }
    
    // 2. Check if already reviewed
    const existingReview = await this.getReview(
      review.reviewerId,
      review.transactionId
    );
    
    if (existingReview) {
      throw new Error('You have already reviewed this seller');
    }
    
    // 3. Add review
    const reviewRef = await addDoc(collection(db, 'reviews'), {
      ...review,
      status: 'pending',
      isVerifiedPurchase: true,
      isHelpful: 0,
      createdAt: serverTimestamp()
    });
    
    // 4. Update seller's average rating
    await this.updateSellerRating(review.sellerId);
    
    // 5. Update trust score
    await this.updateTrustScore(review.sellerId);
    
    return reviewRef.id;
  }
  
  private async updateSellerRating(sellerId: string) {
    // Calculate new average rating
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('sellerId', '==', sellerId),
      where('status', '==', 'approved')
    );
    
    const snapshot = await getDocs(reviewsQuery);
    const reviews = snapshot.docs.map(doc => doc.data() as Review);
    
    const averageRating = {
      overall: this.calculateAverage(reviews.map(r => r.ratings.overall)),
      communication: this.calculateAverage(reviews.map(r => r.ratings.communication)),
      accuracy: this.calculateAverage(reviews.map(r => r.ratings.accuracy)),
      professionalism: this.calculateAverage(reviews.map(r => r.ratings.professionalism)),
      valueForMoney: this.calculateAverage(reviews.map(r => r.ratings.valueForMoney))
    };
    
    await updateDoc(doc(db, 'users', sellerId), {
      'reviews.average': averageRating.overall,
      'reviews.total': reviews.length,
      'reviews.breakdown': averageRating
    });
  }
}
```

---

## 📊 المرحلة 4: نظام المراسلة المتقدم (2 أسابيع)

### 4.1 ميزات المراسلة الجديدة

```typescript
interface AdvancedMessage extends Message {
  // Existing fields +
  
  // Typing indicator
  typing?: {
    isTyping: boolean;
    userId: string;
    timestamp: Date;
  };
  
  // Read receipts
  readReceipts: {
    userId: string;
    readAt: Date;
  }[];
  
  // Message status
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  
  // Rich content
  attachments?: MessageAttachment[];
  quotedMessage?: string;           // ID of quoted message
  reactions?: MessageReaction[];
  
  // Metadata
  editedAt?: Date;
  deletedAt?: Date;
  deletedFor: string[];             // UserIDs who deleted
}

interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'document' | 'audio' | 'location';
  url: string;
  thumbnail?: string;
  filename?: string;
  size: number;
  mimeType: string;
}

interface MessageReaction {
  userId: string;
  emoji: string;
  timestamp: Date;
}
```

### 4.2 Real-time Features

```typescript
// Using Firebase Realtime Database for presence
import { getDatabase, ref, onValue, set, onDisconnect } from 'firebase/database';

export class PresenceService {
  private rtdb = getDatabase();
  
  async setUserOnline(userId: string) {
    const userStatusRef = ref(this.rtdb, `status/${userId}`);
    
    // Set online
    await set(userStatusRef, {
      state: 'online',
      lastSeen: Date.now()
    });
    
    // Set offline on disconnect
    onDisconnect(userStatusRef).set({
      state: 'offline',
      lastSeen: Date.now()
    });
  }
  
  subscribeToUserPresence(userId: string, callback: (presence: Presence) => void) {
    const userStatusRef = ref(this.rtdb, `status/${userId}`);
    
    return onValue(userStatusRef, (snapshot) => {
      callback(snapshot.val());
    });
  }
  
  // Typing indicator
  async setTyping(conversationId: string, userId: string, isTyping: boolean) {
    const typingRef = ref(this.rtdb, `typing/${conversationId}/${userId}`);
    
    if (isTyping) {
      await set(typingRef, Date.now());
      
      // Auto-clear after 3 seconds
      setTimeout(() => {
        set(typingRef, null);
      }, 3000);
    } else {
      await set(typingRef, null);
    }
  }
}
```

### 4.3 Push Notifications

```typescript
// FCM Integration
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

export class PushNotificationService {
  private messaging = getMessaging();
  
  async requestPermission(): Promise<string | null> {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(this.messaging, {
        vapidKey: process.env.REACT_APP_VAPID_KEY
      });
      
      // Save token to user profile
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        fcmToken: token
      });
      
      return token;
    }
    
    return null;
  }
  
  async sendMessageNotification(
    recipientId: string,
    senderName: string,
    messageText: string
  ) {
    // Get recipient's FCM token
    const userDoc = await getDoc(doc(db, 'users', recipientId));
    const fcmToken = userDoc.data()?.fcmToken;
    
    if (!fcmToken) return;
    
    // Send via Cloud Function
    const sendNotification = httpsCallable(functions, 'sendPushNotification');
    await sendNotification({
      token: fcmToken,
      notification: {
        title: `New message from ${senderName}`,
        body: messageText.substring(0, 100),
        icon: '/logo192.png'
      },
      data: {
        type: 'message',
        senderId: auth.currentUser.uid,
        conversationId: 'conv_123'
      }
    });
  }
}
```

---

## 📊 المرحلة 5: نظام الاتصال الصوتي/المرئي (2-3 أسابيع)

### 5.1 الخيارات المتاحة

#### **Option A: Agora.io** (موصى به)
```typescript
import AgoraRTC from 'agora-rtc-sdk-ng';

export class AgoraCallService {
  private client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  
  async startCall(
    channelName: string,
    userId: string,
    type: 'voice' | 'video'
  ) {
    // 1. Get token from backend
    const token = await this.getAgoraToken(channelName, userId);
    
    // 2. Join channel
    await this.client.join(
      process.env.REACT_APP_AGORA_APP_ID,
      channelName,
      token,
      userId
    );
    
    // 3. Create local tracks
    const localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
    
    if (type === 'voice') {
      // Disable video
      localTracks[1].setEnabled(false);
    }
    
    // 4. Publish tracks
    await this.client.publish(localTracks);
    
    return { client: this.client, localTracks };
  }
  
  async endCall() {
    await this.client.leave();
  }
}
```

#### **Option B: WebRTC (مجاني)**
```typescript
export class WebRTCService {
  private peerConnection: RTCPeerConnection;
  private localStream: MediaStream;
  
  async initCall(isVideo: boolean = false) {
    // 1. Get local media
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isVideo
    });
    
    // 2. Create peer connection
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });
    
    // 3. Add local stream
    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream);
    });
    
    // 4. Create offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    // 5. Send offer via Firestore
    await this.sendSignalingData('offer', offer);
  }
  
  private async sendSignalingData(type: string, data: any) {
    // Use Firestore for signaling
    await addDoc(collection(db, 'callSignaling'), {
      type,
      data,
      from: auth.currentUser.uid,
      to: this.recipientId,
      timestamp: serverTimestamp()
    });
  }
}
```

### 5.2 Call UI Components

```typescript
// components/Call/CallScreen.tsx
interface CallScreenProps {
  callId: string;
  recipientId: string;
  type: 'voice' | 'video';
}

const CallScreen: React.FC<CallScreenProps> = ({ callId, recipientId, type }) => {
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'active' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);
  
  return (
    <CallContainer>
      {/* Remote video/avatar */}
      <RemoteView>
        {type === 'video' && !isVideoOff ? (
          <video ref={remoteVideoRef} autoPlay />
        ) : (
          <Avatar size={120} />
        )}
      </RemoteView>
      
      {/* Local video (picture-in-picture) */}
      {type === 'video' && (
        <LocalView>
          <video ref={localVideoRef} autoPlay muted />
        </LocalView>
      )}
      
      {/* Call info */}
      <CallInfo>
        <RecipientName>{recipientName}</RecipientName>
        <CallStatus>{callStatus}</CallStatus>
        <CallDuration>{formatDuration(duration)}</CallDuration>
      </CallInfo>
      
      {/* Controls */}
      <CallControls>
        <ControlButton onClick={toggleMute}>
          {isMuted ? <MicOff /> : <Mic />}
        </ControlButton>
        
        {type === 'video' && (
          <ControlButton onClick={toggleVideo}>
            {isVideoOff ? <VideoOff /> : <Video />}
          </ControlButton>
        )}
        
        <EndCallButton onClick={endCall}>
          <PhoneOff />
        </EndCallButton>
      </CallControls>
    </CallContainer>
  );
};
```

---

## 📊 المرحلة 6: التكاملات الخارجية (1-2 أسابيع)

### 6.1 GitHub Integration

```typescript
// For code quality and collaboration
export class GitHubIntegrationService {
  // Automated deployment on push
  setupGitHubActions() {
    // .github/workflows/deploy.yml
    const workflow = `
name: Deploy to Firebase
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: \${{ secrets.FIREBASE_TOKEN }}
    `;
  }
  
  // Issue tracking for bugs
  createIssueFromBug(error: Error, userReport: string) {
    // Automatically create GitHub issue
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    
    octokit.issues.create({
      owner: 'hamdanialaa3',
      repo: 'new-globul-cars',
      title: `Bug Report: ${error.message}`,
      body: `
**User Report:**
${userReport}

**Stack Trace:**
\`\`\`
${error.stack}
\`\`\`

**Environment:**
- Browser: ${navigator.userAgent}
- Timestamp: ${new Date().toISOString()}
      `,
      labels: ['bug', 'auto-generated']
    });
  }
}
```

### 6.2 Analytics Integration

```typescript
// Google Analytics 4
import { getAnalytics, logEvent } from 'firebase/analytics';

export class AnalyticsService {
  private analytics = getAnalytics();
  
  trackProfileView(profileId: string) {
    logEvent(this.analytics, 'profile_view', {
      profile_id: profileId,
      viewer_id: auth.currentUser?.uid
    });
  }
  
  trackVerificationStarted(type: 'email' | 'phone' | 'id') {
    logEvent(this.analytics, 'verification_started', {
      verification_type: type,
      user_id: auth.currentUser?.uid
    });
  }
  
  trackCallInitiated(callType: 'voice' | 'video') {
    logEvent(this.analytics, 'call_initiated', {
      call_type: callType,
      user_id: auth.currentUser?.uid
    });
  }
}
```

### 6.3 Payment Integration (للميزات المميزة)

```typescript
// Stripe for premium features
import { loadStripe } from '@stripe/stripe-js';

export class PaymentService {
  private stripe = loadStripe(process.env.REACT_APP_STRIPE_KEY);
  
  async subscribeToPremium(userId: string, plan: 'monthly' | 'yearly') {
    // Create checkout session
    const createCheckout = httpsCallable(functions, 'createStripeCheckout');
    const { data } = await createCheckout({ userId, plan });
    
    // Redirect to Stripe
    const stripe = await this.stripe;
    await stripe.redirectToCheckout({
      sessionId: data.sessionId
    });
  }
  
  async verifyPayment(sessionId: string) {
    // Called by webhook
    // Update user to premium
    await updateDoc(doc(db, 'users', userId), {
      'verification.level': 'premium_verified',
      'verification.trustScore': 100,
      premiumUntil: addMonths(new Date(), plan === 'yearly' ? 12 : 1)
    });
  }
}
```

---

## 📊 المرحلة 7: تحسينات الأداء والأمان (مستمرة)

### 7.1 Performance Optimizations

```typescript
// 1. Image CDN
// Use Cloudflare or Fastly for image delivery
const imageUrl = `https://cdn.globulcars.bg/users/${userId}/profile.jpg?w=400&h=400&q=85`;

// 2. Lazy loading
const ProfileImage = lazy(() => import('./ProfileImage'));

// 3. Service Worker caching
// cache profile images for offline viewing

// 4. Database indexing
// Firestore indexes for fast queries
{
  "indexes": [
    {
      "collectionGroup": "users",
      "fields": [
        { "fieldPath": "verification.trustScore", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 7.2 Security Enhancements

```typescript
// 1. Rate limiting for sensitive operations
const verificationRateLimit = new RateLimiter({
  maxAttempts: 3,
  windowMs: 24 * 60 * 60 * 1000 // 24 hours
});

// 2. Encrypt sensitive documents
import CryptoJS from 'crypto-js';

const encryptDocument = (file: File, key: string) => {
  const encrypted = CryptoJS.AES.encrypt(file, key);
  return encrypted.toString();
};

// 3. Audit logging
const logAuditEvent = async (event: AuditEvent) => {
  await addDoc(collection(db, 'auditLogs'), {
    userId: event.userId,
    action: event.action,
    resource: event.resource,
    ip: event.ip,
    userAgent: navigator.userAgent,
    timestamp: serverTimestamp()
  });
};
```

---

## 📊 جدول زمني مفصل (Detailed Timeline)

```
أسبوع 1-2: نظام الصور
├── Day 1-2: Image upload UI
├── Day 3-4: Image processing service
├── Day 5-6: Storage rules & optimization
└── Day 7: Testing & deployment

أسبوع 3-4: نظام التحقق
├── Day 1-2: Phone verification
├── Day 3-5: ID verification (manual)
├── Day 6-7: Trust score calculation
└── Day 8: Admin review panel

أسبوع 5: نظام التقييم
├── Day 1-2: Review model & service
├── Day 3-4: Review UI components
└── Day 5: Rating calculation & badges

أسبوع 6-7: المراسلة المتقدمة
├── Day 1-2: Typing indicators
├── Day 3-4: Read receipts
├── Day 5-6: Rich attachments
└── Day 7: Push notifications

أسبوع 8-10: نظام الاتصال
├── Day 1-3: WebRTC setup
├── Day 4-6: Call UI
├── Day 7-8: Signaling server
└── Day 9-10: Testing & optimization

أسبوع 11: التكاملات
├── Day 1-2: GitHub Actions
├── Day 3-4: Analytics
└── Day 5: Payment integration

أسبوع 12: Testing النهائي
├── Day 1-2: Unit tests
├── Day 3-4: Integration tests
└── Day 5-7: User acceptance testing
```

---

## 📊 المقاييس والأهداف (KPIs)

```typescript
const SUCCESS_METRICS = {
  // Profile completion
  profileCompletion: {
    target: '85%',
    current: '45%'
  },
  
  // Verification
  emailVerification: {
    target: '95%',
    current: '85%'
  },
  phoneVerification: {
    target: '70%',
    current: '0%'
  },
  idVerification: {
    target: '40%',
    current: '0%'
  },
  
  // Trust & ratings
  averageTrustScore: {
    target: '65/100',
    current: '20/100'
  },
  
  // Engagement
  messageResponseRate: {
    target: '80%',
    current: '60%'
  },
  averageResponseTime: {
    target: '<2 hours',
    current: '4 hours'
  },
  
  // Call usage
  callCompletionRate: {
    target: '75%',
    current: '0%' // New feature
  }
};
```

---

## 🎯 الخلاصة والخطوات التالية

### ما يجب فعله الآن (Immediate Actions):

1. **إنشاء branch جديد في GitHub:**
   ```bash
   git checkout -b feature/advanced-profile-system
   ```

2. **تحديث Firebase config:**
   - Enable Phone Authentication
   - Enable Cloud Storage
   - Enable Realtime Database
   - Enable Cloud Functions
   - Enable Cloud Messaging (FCM)

3. **تثبيت الـ Dependencies:**
   ```bash
   npm install @google-cloud/vision agora-rtc-sdk-ng @stripe/stripe-js
   ```

4. **إنشاء الـ Services الجديدة:**
   ```
   src/services/
   ├── image-processing-service.ts
   ├── phone-verification-service.ts
   ├── id-verification-service.ts
   ├── trust-score-service.ts
   ├── review-service.ts
   ├── presence-service.ts
   ├── call-service.ts
   └── payment-service.ts
   ```

5. **بدء العمل بالترتيب:**
   - ✅ Week 1-2: Profile images
   - ⏳ Week 3-4: Verification system
   - 🔜 Week 5: Reviews & ratings
   - 🔜 Week 6-7: Advanced messaging
   - 🔜 Week 8-10: Call system

---

## 🎯 النجاح 100% يعني:

✅ كل مستخدم موثوق ومتحقق منه  
✅ تواصل سلس وفوري بين المشترين والبائعين  
✅ نظام تقييم عادل وشفاف  
✅ أمان عالي للبيانات والمعاملات  
✅ تجربة مستخدم ممتازة تنافس أفضل المنصات العالمية  

**الهدف النهائي: أن يصبح Globul Cars المنصة #1 لبيع السيارات في بلغاريا! 🚀**

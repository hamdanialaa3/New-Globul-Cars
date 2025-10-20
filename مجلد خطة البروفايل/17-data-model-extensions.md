# القسم 17: Data Model Extensions (Firestore)

## 17.1 users Collection

```typescript
// users/{uid}
interface User {
  // Existing fields (preserved)
  id: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL?: string;
  
  // NEW: Profile Type System
  accountType: 'individual' | 'business';  // existing
  profileType: 'private' | 'dealer' | 'company';  // NEW
  
  // NEW: Verification System
  verification: {
    level: 'none' | 'basic' | 'business' | 'company';
    status: 'pending' | 'in_review' | 'approved' | 'rejected';
    submittedAt?: Timestamp;
    reviewedAt?: Timestamp;
    reviewerId?: string;  // admin who reviewed
    notes?: string;       // admin notes
    documents: {
      type: string;       // 'eik', 'vat', 'license', 'id'
      url: string;
      uploadedAt: Timestamp;
      verifiedAt?: Timestamp;
      status: 'pending' | 'approved' | 'rejected';
    }[];
  };
  
  // NEW: Business Information (dealer/company)
  businessInfo?: {
    legalName: string;
    eik: string;                    // EIK/BULSTAT
    vatNumber?: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: 'Bulgaria';
    };
    phone: string;
    email: string;
    website?: string;
    workingHours?: string;          // e.g., "Mon-Fri 9-18"
  };
  
  // NEW: Company-specific
  companyInfo?: {
    fleetSize?: number;
    locations?: string[];           // ['Sofia', 'Plovdiv']
    teamEnabled?: boolean;
  };
  
  // NEW: Subscription Plan
  plan: {
    tier: 'free' | 'premium' | 'dealer_basic' | 'dealer_pro' | 
          'dealer_enterprise' | 'company_starter' | 'company_pro' | 
          'company_enterprise' | 'custom';
    status: 'active' | 'trial' | 'past_due' | 'canceled';
    renewsAt?: Timestamp;
    trialEndsAt?: Timestamp;
  };
  
  // NEW: Trust and Rating
  trust: {
    score: number;                  // 0-100
    reviewsCount: number;
    positivePercent: number;        // 0-1
  };
  
  // Existing fields (enhanced)
  stats: {
    totalListings: number;
    activeListings: number;
    soldListings: number;
    totalViews: number;
    totalInquiries: number;
    responseRate: number;           // 0-1
    avgResponseTime: number;        // milliseconds
  };
}
```

## 17.2 listings Collection

```typescript
// listings/{listingId}
interface Listing {
  // Existing fields (preserved)
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  price: number;
  // ... all existing fields
  
  // NEW: Owner Type (snapshot at creation)
  ownerType: 'private' | 'dealer' | 'company';
  
  // NEW: Commercial Flags (dealer/company only)
  commercialFlags?: {
    isCommercialSale: boolean;
    warrantyOffered?: boolean;
    warrantyMonths?: number;
    financingAvailable?: boolean;
    financingProvider?: string;
  };
  
  // NEW: Moderation (for quality control)
  moderation: {
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    reasons?: string[];
    reviewedAt?: Timestamp;
    reviewerId?: string;
  };
  
  // Existing analytics (move to separate doc to avoid hot writes)
  // analytics moved to: listings/{id}/analytics/daily
}
```

## 17.3 reviews Collection (NEW)

```typescript
// reviews/{reviewId}
interface Review {
  id: string;
  targetUserId: string;              // seller being reviewed
  authorUserId: string;              // buyer who reviews
  carId?: string;                    // optional: specific car
  stars: 1 | 2 | 3 | 4 | 5;
  text?: string;                     // optional text review
  status: 'pending' | 'published' | 'rejected';
  createdAt: Timestamp;
  publishedAt?: Timestamp;
  
  // Verification: only verified transactions
  verified: boolean;
  transactionId?: string;
}
```

## 17.4 Security Rules Update

```javascript
// firestore.rules additions
match /users/{userId} {
  // Existing rules preserved
  
  // Verification documents: owner + admins only
  allow read: if isOwnerOrAdmin(userId);
  allow write: if isOwner(userId) && 
                  request.resource.data.verification.status == 'pending';
}

match /reviews/{reviewId} {
  allow read: if isSignedIn();
  allow create: if isSignedIn() && 
                   request.resource.data.authorUserId == request.auth.uid;
  allow update, delete: if isAdmin();
}

function isOwner(uid) {
  return request.auth.uid == uid;
}

function isOwnerOrAdmin(uid) {
  return request.auth.uid == uid || 
         request.auth.token.role == 'admin';
}
```

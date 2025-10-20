# القسم 13: نموذج البيانات الكامل (Data Models)

## 13.1 UserProfile

```typescript
interface UserProfile {
  // Basic Info
  id: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  phone: string;
  phoneVerified: boolean;
  photoURL: string;
  coverPhotoURL?: string;
  
  // Profile Type
  accountType: 'individual' | 'business';
  profileType: 'private' | 'dealer' | 'company';
  
  // Theme (auto-set based on profileType)
  theme: {
    primary: string; // #FF8F10 | #16a34a | #1d4ed8
    secondary: string;
    accent: string;
  };
  
  // Verification
  verification: {
    email: boolean;
    phone: boolean;
    id: boolean;
    business: boolean;
    address: boolean;
    premium: boolean; // company only
  };
  
  // Business Info (dealer/company)
  businessInfo?: {
    legalName: string;
    tradingName?: string;
    eik: string; // EIK/BULSTAT
    vat?: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: 'Bulgaria';
    };
    phone: string;
    email: string;
    website?: string;
    establishedYear: number;
    employeeCount?: number;
    
    // Documents
    documents: {
      type: string; // 'license', 'vat', 'insurance', etc.
      url: string;
      uploadedAt: Timestamp;
      verifiedAt?: Timestamp;
      status: 'pending' | 'approved' | 'rejected';
    }[];
    
    // For dealers
    dealerInfo?: {
      showroomAddress?: string;
      workingHours?: string;
      specializations?: string[]; // ['BMW', 'Mercedes', 'Luxury']
      services?: string[]; // ['financing', 'warranty', 'trade-in']
    };
    
    // For companies
    companyInfo?: {
      fleetSize: number;
      locations: string[]; // ['Sofia', 'Plovdiv', 'Varna']
      departments?: string[];
      contractTypes?: string[];
    };
  };
  
  // Subscription
  subscription?: {
    plan: 'free' | 'premium' | 'dealer_basic' | 'dealer_pro' | 'dealer_enterprise' | 'company_starter' | 'company_pro' | 'company_enterprise';
    status: 'active' | 'trial' | 'past_due' | 'canceled';
    startDate: Timestamp;
    endDate?: Timestamp;
    trialEnds?: Timestamp;
    autoRenew: boolean;
    paymentMethod?: {
      type: 'card' | 'bank_transfer';
      last4?: string;
    };
  };
  
  // Stats
  stats: {
    totalListings: number;
    activeListings: number;
    soldListings: number;
    totalViews: number;
    totalInquiries: number;
    responseRate: number; // 0-1
    avgResponseTime: number; // milliseconds
    completionRate: number; // deals closed / total deals
    joinedAt: Timestamp;
  };
  
  // Trust & Rating
  rating: {
    average: number; // 0-5
    total: number; // count
    breakdown: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  trustScore: number; // 0-100
  
  // Team (company only)
  team?: {
    members: {
      uid: string;
      role: 'owner' | 'manager' | 'editor' | 'viewer';
      department?: string;
      joinedAt: Timestamp;
    }[];
    maxMembers: number; // based on plan
  };
  
  // Settings
  settings: {
    language: 'bg' | 'en';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      showPhone: boolean;
      showEmail: boolean;
      showAddress: boolean;
    };
    messaging: {
      autoResponder: boolean;
      workingHours?: string;
      awayMessage?: string;
    };
  };
  
  // Compliance
  compliance: {
    termsAccepted: boolean;
    termsAcceptedAt?: Timestamp;
    gdprConsent: boolean;
    gdprConsentAt?: Timestamp;
    marketingConsent: boolean;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  
  // Status
  status: 'active' | 'suspended' | 'banned' | 'deleted';
  statusReason?: string;
}
```

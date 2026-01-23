# 👤 User Authentication & Profile System Documentation
## نظام المصادقة والملف الشخصي - توثيق شامل

> **Last Updated:** January 23, 2026  
> **Version:** 0.4.0  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication System](#authentication-system)
3. [Profile Types](#profile-types)
4. [Profile Creation Flow](#profile-creation-flow)
5. [Profile Management](#profile-management)
6. [Numeric ID System](#numeric-id-system)
7. [Verification System](#verification-system)
8. [Technical Implementation](#technical-implementation)

---

## 🎯 Overview

The User Authentication & Profile System is the foundation of the Koli One marketplace. It handles user registration, login, profile creation, and management with support for multiple authentication providers and three distinct profile types (Private, Dealer, Company).

### Key Features

- **Multi-Provider Authentication** - 6 authentication methods
- **Profile Type System** - Private, Dealer, Company
- **Numeric ID System** - Privacy-first URL design
- **Verification System** - Email, Phone, ID, Business verification
- **Profile Management** - Complete CRUD operations
- **Subscription Integration** - Plan-based features

---

## 🔐 Authentication System

### Supported Providers

1. **Email/Password** - Traditional authentication
2. **Google OAuth** - Google Sign-In
3. **Facebook OAuth** - Facebook Login
4. **Apple Sign-In** - Apple ID authentication
5. **Phone Number** - SMS OTP verification
6. **Anonymous** - Guest browsing (limited features)

### Authentication Flow

#### Registration Flow

```
User Input (Email/Password or OAuth)
    ↓
Firebase Auth Create Account
    ↓
Create Bulgarian Profile (Firestore)
    ↓
Assign Numeric ID
    ↓
Initialize Default Settings
    ↓
Send Verification Email (if email/password)
    ↓
Redirect to Dashboard
```

#### Login Flow

```
User Input (Credentials or OAuth)
    ↓
Firebase Auth Sign In
    ↓
Load User Profile (Firestore)
    ↓
Check Profile Type & Subscription
    ↓
Load User Data (Listings, Messages, etc.)
    ↓
Redirect to Dashboard or Requested Page
```

### Authentication Services

#### SocialAuthService

**Location:** `src/services/social-auth-service.ts`

**Methods:**
```typescript
class SocialAuthService {
  // Email/Password
  static async createUserWithEmailAndPassword(email: string, password: string)
  static async signInWithEmailAndPassword(email: string, password: string)
  
  // Google OAuth
  static async signInWithGoogle()
  static async signInWithGoogleRedirect()
  
  // Facebook OAuth
  static async signInWithFacebook()
  
  // Apple Sign-In
  static async signInWithApple()
  
  // Phone Auth
  static async signInWithPhoneNumber(phoneNumber: string)
  static async verifyPhoneCode(verificationId: string, code: string)
  
  // Profile Management
  static async createOrUpdateBulgarianProfile(user: User)
  static async updateUserProfile(uid: string, data: Partial<BulgarianUser>)
}
```

#### BulgarianAuthService

**Location:** `src/firebase/auth-service.ts`

**Features:**
- Bulgarian-specific validation
- Phone number format (+359)
- Currency (EUR)
- Language preference (bg/en)

### Authentication Pages

#### Login Page

**Location:** `src/pages/02_authentication/login/`

**Components:**
- `LoginPage.tsx` - Main login page
- `EnhancedLoginPage.tsx` - Enhanced version with social login
- `LoginForm.tsx` - Email/password form
- `SocialLoginButtons.tsx` - OAuth buttons

**Features:**
- Email/password form
- Social login buttons (Google, Facebook, Apple)
- "Remember me" checkbox
- "Forgot password" link
- "Create account" link
- Form validation
- Error handling

#### Register Page

**Location:** `src/pages/02_authentication/register/`

**Components:**
- `RegisterPage.tsx` - Main registration page
- `EnhancedRegisterPage.tsx` - Enhanced version
- `RegisterForm.tsx` - Registration form
- `ProfileTypeSelector.tsx` - Choose profile type

**Registration Steps:**
1. Email/Password or OAuth
2. Basic Info (First Name, Last Name, Phone)
3. Location (City, Region)
4. Profile Type Selection (Private/Dealer/Company)
5. Terms & Conditions acceptance
6. Email verification (if email/password)

#### Verification Page

**Location:** `src/pages/02_authentication/verification/`

**Features:**
- Email verification status
- Resend verification email
- Phone verification
- ID verification (future)

---

## 👥 Profile Types

### Private Profile (Free Plan)

**Type:** `profileType: 'private'`  
**Plan:** `planTier: 'free'`

**Features:**
- 3 active listings maximum
- Basic dashboard
- Favorites
- Messaging
- Basic analytics

**Limitations:**
- No team members
- No bulk upload
- No API access
- Limited analytics

**Target Audience:** Individual sellers

### Dealer Profile (Paid Plan)

**Type:** `profileType: 'dealer'`  
**Plan:** `planTier: 'dealer'`

**Features:**
- 30 active listings/month
- Dealer dashboard
- Team management (3 members)
- Bulk CSV upload
- Featured badge
- Basic analytics
- Quick replies
- Lead management

**Pricing:**
- Monthly: €20.11/month
- Annual: €193/year (20% discount)

**Target Audience:** Professional car dealers

### Company Profile (Enterprise Plan)

**Type:** `profileType: 'company'`  
**Plan:** `planTier: 'company'`

**Features:**
- Unlimited listings
- Company dashboard
- Team management (10 members)
- Bulk CSV upload
- Featured badge
- Advanced analytics
- API access
- Priority support
- Marketing campaigns (unlimited)

**Pricing:**
- Monthly: €100.11/month
- Annual: €961/year (20% discount)

**Target Audience:** Large dealerships, car companies

---

## 📝 Profile Creation Flow

### Initial Profile Creation

**Service:** `ProfileService.initializeProfile()`

**Location:** `src/services/profile/ProfileService.ts`

**Process:**
```typescript
1. Create Firebase Auth user
2. Create Firestore user document
3. Assign Numeric ID
4. Set default values:
   - phoneCountryCode: '+359'
   - preferredLanguage: 'bg'
   - currency: 'EUR'
   - profileType: 'private'
   - planTier: 'free'
   - permissions: default permissions
   - verification: all false
   - stats: all zeros
5. Set timestamps (createdAt, updatedAt)
```

**Default Profile Structure:**
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  phoneCountryCode: '+359';
  preferredLanguage: 'bg';
  currency: 'EUR';
  profileType: 'private';
  planTier: 'free';
  permissions: {
    canAddListings: true;
    maxListings: 3;
    hasAnalytics: false;
    hasTeam: false;
    canExportData: false;
    canUseAPI: false;
  };
  verification: {
    email: false;
    phone: false;
    id: false;
    business: false;
  };
  stats: {
    totalListings: 0;
    activeListings: 0;
    totalViews: 0;
    totalMessages: 0;
    trustScore: 0;
  };
  isActive: true;
  isBanned: false;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Profile Type Upgrade

**Service:** `ProfileService.switchProfileType()`

**Process:**
```typescript
1. Validate current profile
2. Check subscription status (if upgrading to Dealer/Company)
3. Create/Update dealership or company document
4. Update user profile:
   - profileType: new type
   - planTier: corresponding tier
   - permissions: updated permissions
5. Update subscription (if paid plan)
6. Log activity
```

---

## 🛠️ Profile Management

### Profile Service

**Location:** `src/services/profile/ProfileService.ts`

**Key Methods:**
```typescript
class ProfileService {
  // Get complete profile (user + dealership/company)
  static async getCompleteProfile(uid: string)
  
  // Update user profile
  static async updateUserProfile(uid: string, data: BulgarianUserUpdate)
  
  // Switch profile type
  static async switchProfileType(uid: string, newType: ProfileType, additionalData?)
  
  // Initialize new profile
  static async initializeProfile(uid: string, email: string, displayName: string)
  
  // Check if user can add listing
  static async canAddListing(uid: string): Promise<boolean>
  
  // Deactivate profile
  static async deactivateProfile(uid: string)
}
```

### Unified Profile Service

**Location:** `src/services/profile/UnifiedProfileService.ts`

**Purpose:** Consolidates all profile operations into one service

**Methods:**
```typescript
class UnifiedProfileService {
  // Dealer operations
  async setupDealerProfile(userId: string, dealershipData: DealershipInfo)
  async getDealershipInfo(dealershipId: string): Promise<DealershipInfo | null>
  async updateDealershipInfo(userId: string, data: Partial<DealershipInfo>)
  
  // Company operations
  async setupCompanyProfile(userId: string, companyData: CompanyInfo)
  async getCompanyInfo(companyId: string): Promise<CompanyInfo | null>
  async updateCompanyInfo(userId: string, data: Partial<CompanyInfo>)
  
  // Profile operations
  async getProfile(uid: string): Promise<BulgarianUser>
  async updateProfile(uid: string, data: Partial<BulgarianUser>)
}
```

### Profile Pages

#### Profile Page

**Location:** `src/pages/03_user-pages/profile/ProfilePage/`

**Components:**
- `ProfilePage.tsx` - Main profile page
- `ProfileOverview.tsx` - Overview tab
- `ProfileSettings.tsx` - Settings tab
- `ProfileAnalytics.tsx` - Analytics tab
- `ProfileCampaigns.tsx` - Campaigns tab (Dealer/Company)

**Tabs:**
1. **Overview** - Profile info, stats, listings
2. **My Ads** - User's car listings
3. **Campaigns** - Advertising campaigns (Dealer/Company)
4. **Analytics** - Profile analytics
5. **Settings** - Profile settings
6. **Consultations** - Consultation requests

**URL Pattern:** `/profile/:sellerNumericId`

#### Profile Settings

**Features:**
- Edit personal information
- Change password
- Update phone number
- Change profile picture
- Update cover image
- Privacy settings
- Notification preferences
- Language preference
- Theme preference

---

## 🔢 Numeric ID System

### Overview

The Numeric ID System ensures privacy by using sequential numeric IDs instead of Firebase UIDs in public URLs.

### Implementation

**Services:**
- `numeric-id-assignment.service.ts` - Assigns numeric IDs
- `numeric-id-lookup.service.ts` - Looks up numeric IDs
- `numeric-car-system.service.ts` - Car-specific numeric IDs

### Numeric ID Assignment

**Process:**
```typescript
1. User registers
2. System checks counters collection: counters/{uid}/users
3. If exists, increment counter
4. If not, create counter with value 1
5. Assign numeric ID to user
6. Store mapping: users/{uid}/numericId
```

### URL Patterns

**Correct Patterns:**
- User Profile: `/profile/:numericId` (e.g., `/profile/18`)
- Car Details: `/car/:sellerNumericId/:carNumericId` (e.g., `/car/1/5`)
- Edit Car: `/car/:sellerNumericId/:carNumericId/edit`
- Messages: `/messages/:senderId/:recipientId`

**❌ NEVER Use:**
- Firebase UIDs in URLs
- `/profile/:firebaseUid`
- `/car/:firebaseUid/:carId`

### Numeric ID Guard

**Component:** `NumericIdGuard.tsx`

**Location:** `src/components/guards/NumericIdGuard.tsx`

**Purpose:** Validates numeric IDs and redirects invalid URLs

**Usage:**
```typescript
<Route path="/profile/:numericId" element={
  <NumericIdGuard>
    <ProfilePage />
  </NumericIdGuard>
} />
```

---

## ✅ Verification System

### Verification Levels

1. **Email Verification** - Verify email address
2. **Phone Verification** - Verify phone number (+359)
3. **ID Verification** - Verify Bulgarian ID (EGN)
4. **Business Verification** - Verify business license (EIK) - Dealer/Company only

### Verification Badges

**Trust Badge Types:**
- ✓ Phone Verified
- ✓ Email Verified
- ✓ ID Verified
- ✓ Business Verified
- ⭐ Top Seller (>50 sales)
- 🏆 Trusted Dealer (>100 sales)

### Verification Service

**Location:** `src/services/verification/VerificationService.ts`

**Methods:**
```typescript
class VerificationService {
  // Email verification
  static async verifyEmail(uid: string): Promise<void>
  static async sendVerificationEmail(uid: string): Promise<void>
  
  // Phone verification
  static async verifyPhone(uid: string, phoneNumber: string, code: string): Promise<void>
  static async sendPhoneVerificationCode(phoneNumber: string): Promise<string>
  
  // ID verification
  static async verifyID(uid: string, idNumber: string, document: File): Promise<void>
  
  // Business verification
  static async verifyBusiness(uid: string, eik: string, documents: File[]): Promise<void>
}
```

### Verification Page

**Location:** `src/pages/03_user-pages/profile/VerificationPage.tsx`

**Features:**
- Verification status display
- Document upload
- Verification progress
- Trust score calculation

---

## 🔧 Technical Implementation

### Auth Context

**Location:** `src/contexts/AuthProvider.tsx`

**State:**
```typescript
interface AuthContextType {
  currentUser: User | null;
  user: User | null; // Alias for currentUser
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, options?: RegisterOptions) => Promise<void>;
  logout: () => Promise<void>;
}
```

**Usage:**
```typescript
const { user, loading, login, logout } = useAuth();
```

### Profile Context

**Location:** `src/contexts/ProfileTypeContext.tsx`

**State:**
```typescript
interface ProfileTypeContextType {
  profileType: ProfileType;
  canSwitch: boolean;
  switchProfileType: (newType: ProfileType, data?: any) => Promise<void>;
  isLoading: boolean;
}
```

### Firebase Integration

**Collections:**
- `users` - User profiles
- `dealerships` - Dealer information
- `companies` - Company information
- `counters` - Numeric ID counters
- `verifications` - Verification documents

**Security Rules:**
```javascript
// Users can read their own profile
match /users/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

### Error Handling

**Common Errors:**
- `auth/user-not-found` - User doesn't exist
- `auth/wrong-password` - Incorrect password
- `auth/email-already-in-use` - Email already registered
- `auth/weak-password` - Password too weak
- `auth/invalid-email` - Invalid email format

**Error Handling Pattern:**
```typescript
try {
  await login(email, password);
} catch (error) {
  if (error.code === 'auth/user-not-found') {
    setError('User not found');
  } else if (error.code === 'auth/wrong-password') {
    setError('Incorrect password');
  } else {
    logger.error('Login failed', error);
    setError('An error occurred');
  }
}
```

---

## 📊 Data Models

### BulgarianUser Type

**Location:** `src/types/user/bulgarian-user.types.ts`

**Base Profile:**
```typescript
interface BaseProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  phoneCountryCode: '+359';
  location: {
    city: string;
    region: string;
    country: 'Bulgaria';
  };
  preferredLanguage: 'bg' | 'en';
  currency: 'EUR';
  profileType: 'private' | 'dealer' | 'company';
  planTier: 'free' | 'dealer' | 'company';
  numericId: number;
  // ... more fields
}
```

### DealerProfile Type

```typescript
interface DealerProfile extends BaseProfile {
  profileType: 'dealer';
  planTier: 'dealer';
  dealershipRef?: `dealerships/${string}`;
  dealerSnapshot?: {
    nameBG: string;
    nameEN: string;
    logo?: string;
    status: 'pending' | 'verified' | 'rejected';
  };
}
```

### CompanyProfile Type

```typescript
interface CompanyProfile extends BaseProfile {
  profileType: 'company';
  planTier: 'company';
  companyRef?: `companies/${string}`;
  companySnapshot?: {
    nameBG: string;
    nameEN: string;
    logo?: string;
    status: 'pending' | 'verified' | 'rejected';
  };
}
```

---

## 🔍 Best Practices

### Authentication

1. **Always validate input** before authentication
2. **Use Firebase Auth** for all authentication
3. **Handle errors gracefully** with user-friendly messages
4. **Implement rate limiting** to prevent brute force
5. **Use secure password requirements**

### Profile Management

1. **Always use Numeric IDs** in public URLs
2. **Validate profile type** before operations
3. **Check subscription limits** before allowing actions
4. **Use transactions** for critical updates
5. **Log all profile changes** for audit trail

### Security

1. **Never expose Firebase UIDs** in URLs
2. **Validate user permissions** before operations
3. **Use Firestore Security Rules** for data protection
4. **Implement CSRF protection** for forms
5. **Sanitize user input** before storage

---

## 🔗 Related Documentation

- [Home Page & Navigation](./01_Home_Page_and_Navigation.md)
- [Subscriptions & Billing](./05_Subscriptions_and_Billing.md)
- [Car Listing Creation](./04_Car_Listing_Creation.md)
- [PROJECT_CONSTITUTION.md](../PROJECT_CONSTITUTION.md)

---

**Last Updated:** January 23, 2026  
**Maintained By:** Development Team  
**Status:** ✅ Production Ready

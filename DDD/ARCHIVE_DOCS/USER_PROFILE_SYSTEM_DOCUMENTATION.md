# User Profile System Documentation
**Single Source of Truth**

> [!IMPORTANT]
> This document consolidates all logic, plans, and code details regarding the User Profile System. It supersedes all previous documentation.

## 1. Frontend Architecture (UI/UX)

The frontend is built with **React** and **Styled Components**, utilizing a modular architecture centered around `src/pages/03_user-pages/profile`.

### Visual DNA (LED Themes)
A dynamic visual engine `PROFILE_THEMES` injects identity into every pixel:

| Theme Name | Profile | Logic | Visual Signature |
| :--- | :--- | :--- | :--- |
| **"The Friendly Seller"** | Private | Safe, Warm | Orange Pill Buttons, Soft shadows, White Background. |
| **"The Money Maker"** | Dealer | Efficiency, Speed | **Dark Mode**, Neon Green Accessors, Hard Edges, LED Glow Effects. |
| **"The Institution"** | Company | Trust, Stability | Royal Blue, Subtle Grid Pattern Background, Glassmorphism. |

### Core Components
Located in `src/pages/03_user-pages/profile/ProfilePage`.

1.  **ProfilePageWrapper (`ProfilePageWrapper.tsx`)**:
    *   **Theme Injection**: Wraps content in dynamic `ThemeProvider`.
    *   **Logic**: Handles URL routing (`/profile/{id}`) and permission checks.

2.  **Power Tools (Dealer/Company Only)**:
    *   **Matrix Uploader (`MatrixUploader.tsx`)**: High-speed spreadsheet-like interface for bulk inventory entry. Auto-adapts rows based on plan.
    *   **Cloning Engine (`UnifiedCarService.ts`)**: `cloneListing()` allows one-click duplication of listings (resets VIN/Images/Price for safety).
    *   **Smart Dashboard**: `ProfileMyAds.tsx` features a "Quota Bar" tracking monthly uploads vs limits.

3.  **Navigation (`TabNavigation.styles.ts`)**:
    *   Dynamic tabs based on permissions.


3.  **ProfileOverview (`ProfileOverview.tsx`)**:
    *   Dashboard view showing key stats (Active Listings, Views, Messages).
    *   **Private**: Simple card layout.
    *   **Dealer/Company**: Expanded charts and "Dealer Snapshot" widget.

4.  **ProfileSettings (`ProfileSettingsMobileDe.tsx`)**:
    *   Comprehensive form for editing profile details.
    *   Includes "Verification Status" badges.

5.  **Dealer Registration (`src/pages/09_dealer-company/DealerRegistrationPage.tsx`)**:
    *   A multi-step wizard for upgrading from Private to Dealer/Company.
    *   **Steps**: Basic Info → Documents Upload → Bank Details → Review.

## 2. Backend Logic (The Core)

The backend relies on **Firebase Firestore** and **Google Cloud Functions**.

### Data Structure (Firestore Schema)

Canonical Type Definition: `src/types/user/bulgarian-user.types.ts`

#### `users/{uid}` (The Main Document)
Every user, regardless of type, has a document in the `users` collection.
```typescript
interface BaseProfile {
  uid: string;
  email: string;
  profileType: 'private' | 'dealer' | 'company';
  planTier: 'free' | 'dealer' | 'company';
  
  // Identity
  displayName: string;
  photoURL?: string;
  
  // Clean URL ID
  numericId?: number; // e.g. /profile/123

  // Location
  location?: { 
    city: string; 
    country: 'Bulgaria' 
  };

  // References to Business Docs (if applicable)
  dealershipRef?: string; // "dealerships/{uid}"
  companyRef?: string;    // "companies/{uid}"

  // Permissions & Stats
  permissions: ProfilePermissions;
  stats: {
    activeListings: number;
    totalViews: number;
    // ...
  };
}
```

#### `dealerships/{uid}` (Extension Document)
Stores business-specific verified data for Dealers.
```typescript
interface Dealership {
  uid: string;
  companyName: string; // Legal Element
  vatNumber?: string;
  licenseNumber: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documents: {
    licenseUrl: string;
    vatUrl?: string;
  };
}
```

### State Management
**`ProfileTypeContext`** (`src/contexts/ProfileTypeContext.tsx`) is the heart of the frontend logic.
*   **Initialization**: Loads `users/{uid}` on mount.
*   **Permissions**: Automatically derives `permissions` object based on `profileType` and `planTier`.
*   **Switching logic**: `switchProfileType()` handles optimistic UI updates and validation before calling Firestore.

### Services
*   **`BulgarianProfileService`**: Handles CRUD for `users` collection, validating Bulgarian phone numbers and file uploads.
*   **`UnifiedPlatformService`**: Aggregator service for wider platform operations.
*   **`subscription-service.ts`**: Handles Stripe Checkout sessions and Customer Portal links.

## 3. Authentication & Flows

### Registration & Login (`AuthProvider.tsx`)
1.  **Auth Provider**: Firebase Auth (Email/Password or Google/Facebook).
2.  **Auto-Sync**:
    *   `onAuthStateChanged` triggers `SocialAuthService.createOrUpdateBulgarianProfile(user)`.
    *   This ensures a Firestore document exists even for social logins.
3.  **Redirects**:
    *   After successful login, user is routed to `/profile` (or the intended protected route).

### Profile Switching (Upgrade Flow)
**Path**: Private → Dealer OR Company
**Managed by**: `DealerRegistrationPage.tsx` and `ProfileTypeContext`.

1.  **Trigger**: User clicks "Register as Dealer" in Profile.
2.  **Wizard**: User fills business details (Name, City, License).
3.  **Action**:
    *   Calls `profileService.setupDealerProfile(uid, data)`.
    *   Creates/Updates `dealerships/{uid}`.
    *   Updates `users/{uid}`:
        *   Sets `profileType` to `'dealer'` (or `'company'`).
        *   Sets `dealershipRef` to `dealerships/{uid}`.
        *   Sets `dealerSnapshot` (denormalized data for fast read).
4.  **Validation**:
    *   Backend security rules ensure only the owner can write to `dealerships`.
    *   `ProfileTypeContext` verifies the `dealershipRef` exists before allowing the app to switch context to "Dealer Mode".

## 4. Commercial Logic (Pricing & Limits)

### Configuration Source
The single source of truth for Plan Tiers & Limits is:
`src/config/billing-config.ts`

### Pricing Tiers
Defined in `SUBSCRIPTION_PLANS` constant within the config file.

| Tier | Target | Cost | Payment Interval |
| :--- | :--- | :--- | :--- |
| **Free** | Private Sellers | €0 | N/A |
| **Dealer** | Small Dealerships | €20/mo | Monthly |
| **Company** | Large Enterprises | €100/mo | Monthly |

### Operational Limits
Enforced by `ProfileTypeContext` --> `getPermissions()`, matching the config.

| Feature | Private (Free) | Dealer | Company |
| :--- | :--- | :--- | :--- |
| **Max Listings** | **3** | **30** | **200** |
| **Monthly Flex Edits** | **0 (Locked)** | **10** | **Unlimited** |
| **Bulk Upload** | No | **Yes (Matrix)** | **Yes (Matrix)** |
| **Cloning** | No | Yes | Yes |
| **Analytics** | Basic | Advanced | Enterprise |
| **Team Access** | No | No | Yes |

### Billing Integration (Implemented)
**Service**: `src/services/billing/subscription-service.ts`
**Hook**: `src/hooks/useSubscriptionListener.ts`

**Mechanism**:
1.  **Checkout Flow**: 
    *   App writes to `customers/{uid}/checkout_sessions`.
    *   Firebase Stripe Extension listens and creates a Stripe Session.
    *   App redirects user to Stripe Checkout URL.
2.  **Instant Upgrade Protocol**:
    *   `useSubscriptionListener` watches `customers/{uid}/subscriptions` in real-time.
    *   Upon detecting an `active` subscription, it compares it against the local profile type.
    *   If a mismatch is found (e.g. Paid on Stripe but Local is 'Free'), it immediately calls `refreshProfileType()`.
    *   **Result**: The user's interface transforms instantly (LED Theme activation) without a page reload.
3.  **Customer Portal**:
    *   App calls callable function `ext-firestore-stripe-payments-createPortalLink` for subscription management.
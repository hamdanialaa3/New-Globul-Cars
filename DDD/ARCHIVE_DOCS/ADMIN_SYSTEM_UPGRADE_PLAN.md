# Admin System Upgrade Plan: Command Center v3.0

## 1. Overview
The current Admin Panel (`src/pages/06_admin`) provides basic user management. The goal is to upgrade it into a **Command Center** capable of managing the "Digital Domination v3.0" ecosystem, specifically focusing on **Dealer Verification**, **Revenue Monitoring**, and **Advanced User Control (God Mode)**.

## 2. Architecture Upgrade

### 2.1 File Structure
We will reorganize `src/pages/06_admin/super-admin` to house the new feature modules:
```
src/pages/06_admin/super-admin/
├── SuperAdminDashboard/         # Existing
├── VerificationQueue/           # NEW: Document approval
│   └── VerificationQueue.tsx
├── RevenueMonitor/              # NEW: Financial tracking
│   └── RevenueMonitor.tsx
├── UserManagement/              # UPGRADE: Enhanced user list
│   ├── SuperAdminUsersPage.tsx  # Enhanced existing
│   └── UserGodModeModal.tsx     # NEW: Detailed editor
└── components/                  # Shared admin components
```

### 2.2 Navigation
We will update `AdminPage.tsx` (or a sidebar component) to include navigation tabs for these new sections:
1.  **Dashboard** (Existing)
2.  **User Manager** (Existing + God Mode)
3.  **Verification Queue** (New)
4.  **Revenue** (New)

## 3. Implementation Steps

### Step 1: The Verification Queue (`VerificationQueue.tsx`)
**Objective**: Streamline the approval of "Pending" Dealers and Companies.

*   **Data Source**: Query `users` where `profileType` is `dealer` or `company` AND `dealershipRef` (or `companyRef`) exists.
*   **Logic**:
    1.  Fetch the user's Profile.
    2.  Fetch the linked `Dealership` or `Company` document (using the ref).
    3.  Filter for `verificationStatus === 'pending'`.
*   **UI**:
    *   List of pending requests.
    *   **Document Viewer**: Display `licenseUrl`, `vatUrl`, etc. in a secure image/PDF viewer.
    *   **Actions**:
        *   **Approve**: Updates `dealerships/{uid}` status to `verified`. Optionally triggers an email/notification.
        *   **Reject**: Updates status to `rejected`. Requires entering a rejection reason.

### Step 2: The Revenue Monitor (`RevenueMonitor.tsx`)
**Objective**: Visualizing the "Revenue Engine".

*   **Data Source**: 
    1.  Query `users` where `plan.tier` (or `planTier`) is NOT `free`.
    2.  Cross-reference with `customers/{uid}/subscriptions` (real-time).
*   **UI**:
    *   **KPI Cards**: Monthly Recurring Revenue (MRR), Active Subscribers, Churn Rate (basic calc).
    *   **Subscriber List**: Table showing User, Plan (`dealer` vs `company`), Status (`active`, `past_due`, `cancelled`), and Next Billing Date.
    *   **Sync Button**: A button to manually re-sync a user's local `planTier` with their Stripe status if they get out of sync.

### Step 3: User Management "God Mode" (`UserGodModeModal.tsx`)
**Objective**: Total control over any user account.

*   **Integration**: Modifying `SuperAdminUsersPage.tsx` to open this new modal instead of the simple view.
*   **Capabilities**:
    *   **Force Profile Switch**: Dropdown to change `profileType` (Private <-> Dealer <-> Company) bypassing checks.
    *   **Force Plan Change**: Dropdown to set `planTier` (Free <-> Dealer <-> Company) without payment (for manual overrides/comps).
    *   **Quota Override**: Manually set `flexEdits` or `listings` limit for a specific user (stored in `users/{uid}/customUsage`).
    *   **Ban/Lock**: Existing functionality, enhanced with "Reason" field.

## 4. Services Required
We will utilize and extend:
*   **`ProfileService`**: For reading/writing user profile data.
*   **`AdminService` (New)**: Create `src/services/admin/admin-service.ts` to encapsulate high-privilege operations:
    *   `getPendingVerifications()`
    *   `approveDealer(uid, dealershipId)`
    *   `rejectDealer(uid, dealershipId, reason)`
    *   `forceUpdateUserField(uid, field, value)`

## 5. Execution Plan
1.  **Scaffold**: Create the `admin-service.ts` and new directory structure.
2.  **Verify**: Implement `VerificationQueue` first (Critical path for onboarding dealers).
3.  **Users**: Enhancement `SuperAdminUsersPage` with "God Mode" modal.
4.  **Revenue**: Build `RevenueMonitor` last (as data builds up).

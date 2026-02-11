# 👤 Advanced User Management Guide (Jan 17, 2026)

**المراجعة:** 17 يناير 2026  
**الإصدار:** 2.0 (Role-Based Access Control)  
**الحالة:** ✅ إنتاج جاهز

---

## نظرة عامة

نظام إدارة المستخدمين المتقدم يوفر:

- **نظام الأدوار:** Admin, Dealer, Company, User
- **التحكم في الأذونات:** Granular permission management
- **ملفات المستخدم:** Profile management متقدم
- **إدارة الفريق:** Team management للـ Dealers و Companies
- **نظام العضوية:** Tier-based membership system

### الأدوار والأذونات

```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  VERIFIED_SELLER = 'verified_seller',
  DEALER = 'dealer',
  COMPANY = 'company',
  USER = 'user',
  GUEST = 'guest'
}

interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  team?: TeamInfo;
  subscription?: SubscriptionInfo;
  createdAt: timestamp;
  updatedAt: timestamp;
  metadata: UserMetadata;
}
```

### نظام الأذونات

```typescript
enum Permission {
  // Listing Permissions
  CREATE_LISTING = 'create:listing',
  EDIT_LISTING = 'edit:listing',
  DELETE_LISTING = 'delete:listing',
  VIEW_LISTING = 'view:listing',
  PUBLISH_LISTING = 'publish:listing',
  
  // Offer Permissions
  SEND_OFFER = 'send:offer',
  ACCEPT_OFFER = 'accept:offer',
  REJECT_OFFER = 'reject:offer',
  VIEW_OFFERS = 'view:offers',
  
  // Message Permissions
  SEND_MESSAGE = 'send:message',
  VIEW_MESSAGES = 'view:messages',
  DELETE_MESSAGE = 'delete:message',
  
  // Admin Permissions
  MANAGE_USERS = 'manage:users',
  MANAGE_LISTINGS = 'manage:listings',
  VIEW_ANALYTICS = 'view:analytics',
  MANAGE_SUBSCRIPTIONS = 'manage:subscriptions',
  
  // Financial Permissions
  VIEW_PAYMENTS = 'view:payments',
  MANAGE_PAYMENTS = 'manage:payments',
  WITHDRAW_FUNDS = 'withdraw:funds'
}
```

---

## خدمات الإدارة

### 1. User Service

```typescript
import { UserService } from '@/services/advanced-user-management/user.service';

// Get user profile
const user = await UserService.getUserProfile(userId);

// Update profile
await UserService.updateProfile(userId, {
  firstName: 'Ahmed',
  lastName: 'Ali',
  phoneNumber: '+359 87 123 4567',
  address: {
    street: 'Bulgaria Street',
    city: 'Sofia',
    postalCode: '1000'
  }
});

// Verify user
await UserService.verifyUser(userId, {
  documentType: 'national_id',
  documentNumber: 'BG123456789'
});

// Get user statistics
const stats = await UserService.getUserStats(userId);
// {
//   listings: 15,
//   sold: 8,
//   active_offers: 3,
//   total_revenue: 45000,
//   rating: 4.8,
//   trustScore: 0.92
// }
```

### 2. Role Management Service

```typescript
import { RoleManagementService } from '@/services/advanced-user-management/role-management.service';

// Assign role
await RoleManagementService.assignRole(userId, 'dealer');

// Revoke role
await RoleManagementService.revokeRole(userId, 'dealer');

// Get user roles
const roles = await RoleManagementService.getUserRoles(userId);

// Get role permissions
const permissions = await RoleManagementService.getRolePermissions('dealer');
// ['create:listing', 'edit:listing', 'send:offer', ...]

// Check permission
const canCreate = await RoleManagementService.hasPermission(
  userId, 
  'create:listing'
);
```

### 3. Team Management Service

```typescript
import { TeamManagementService } from '@/services/advanced-user-management/team-management.service';

// Create team
const team = await TeamManagementService.createTeam({
  name: 'Premium Auto Dealers',
  description: 'Professional dealer team',
  ownerId: dealerId
});

// Add team member
await TeamManagementService.addTeamMember(teamId, {
  userId: memberId,
  role: 'team_member',
  permissions: ['create:listing', 'edit:listing', 'view:analytics']
});

// Remove team member
await TeamManagementService.removeTeamMember(teamId, memberId);

// Get team members
const members = await TeamManagementService.getTeamMembers(teamId);

// Update team
await TeamManagementService.updateTeam(teamId, {
  name: 'Updated Team Name',
  description: 'Updated description'
});
```

### 4. Verification Service

```typescript
import { VerificationService } from '@/services/advanced-user-management/verification.service';

// Verify identity
await VerificationService.verifyIdentity(userId, {
  documentType: 'national_id',
  documentNumber: 'BG123456789',
  expiryDate: '2030-12-31'
});

// Verify business
await VerificationService.verifyBusiness(userId, {
  businessType: 'company',
  registrationNumber: 'BG202345678',
  taxNumber: '9876543210'
});

// Get verification status
const status = await VerificationService.getVerificationStatus(userId);
// {
//   identity: 'verified',
//   business: 'pending',
//   email: 'verified',
//   phone: 'verified'
// }
```

### 5. Subscription Management Service

```typescript
import { SubscriptionManagementService } from '@/services/advanced-user-management/subscription-management.service';

// Get subscription
const subscription = await SubscriptionManagementService.getSubscription(userId);
// {
//   plan: 'dealer',
//   status: 'active',
//   renewalDate: timestamp,
//   listingLimit: 30,
//   teamMembers: 3,
//   features: [...]
// }

// Upgrade subscription
await SubscriptionManagementService.upgradePlan(userId, 'company');

// Check listing limit
const canAdd = await SubscriptionManagementService.canAddListing(userId);

// Get available features
const features = await SubscriptionManagementService.getAvailableFeatures(userId);
```

---

## نماذج البيانات

### User Profile Schema

```typescript
interface UserProfile {
  // Identity
  id: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
  
  // Personal Info
  firstName: string;
  lastName: string;
  dateOfBirth?: date;
  
  // Address
  address?: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  
  // Business Info (for dealers/companies)
  business?: {
    name: string;
    type: 'dealer' | 'company';
    registrationNumber: string;
    taxNumber: string;
    address: Address;
  };
  
  // Verification
  verification: {
    email: 'verified' | 'pending' | 'failed';
    phone: 'verified' | 'pending' | 'failed';
    identity: 'verified' | 'pending' | 'failed';
    business: 'verified' | 'pending' | 'failed';
  };
  
  // Role & Permissions
  role: UserRole;
  permissions: Permission[];
  customPermissions?: Permission[];
  
  // Statistics
  statistics: {
    listingsCount: number;
    soldCount: number;
    totalRevenue: number;
    rating: number;
    trustScore: number;
  };
  
  // Preferences
  preferences: {
    language: 'bg' | 'en' | 'ar';
    timezone: string;
    notifications: NotificationPreferences;
    theme: 'light' | 'dark';
  };
  
  // Timestamps
  createdAt: timestamp;
  updatedAt: timestamp;
  lastLogin: timestamp;
  deletedAt?: timestamp;
}
```

---

## أمثلة الاستخدام

### مثال 1: تسجيل مستخدم جديد

```typescript
async function registerNewUser(data: RegisterData) {
  // Create Firebase user
  const firebaseUser = await auth.createUserWithEmailAndPassword(
    data.email,
    data.password
  );

  // Create user profile
  const userProfile = await UserService.createProfile({
    id: firebaseUser.uid,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    role: 'user'
  });

  // Assign basic permissions
  await RoleManagementService.assignRole(firebaseUser.uid, 'user');

  // Send verification email
  await sendVerificationEmail(firebaseUser.uid);

  return userProfile;
}
```

### مثال 2: ترقية إلى Dealer

```typescript
async function upgradeToDealerPlan(userId: string, dealerData: DealerData) {
  // Verify business documents
  const verified = await VerificationService.verifyBusiness(userId, {
    businessType: 'dealer',
    registrationNumber: dealerData.registrationNumber,
    taxNumber: dealerData.taxNumber
  });

  if (!verified) {
    throw new Error('Business verification failed');
  }

  // Assign dealer role
  await RoleManagementService.assignRole(userId, 'dealer');

  // Upgrade subscription
  await SubscriptionManagementService.upgradePlan(userId, 'dealer');

  // Create team
  const team = await TeamManagementService.createTeam({
    name: `${dealerData.businessName} Team`,
    ownerId: userId,
    description: 'Professional dealer team'
  });

  // Send confirmation
  await sendDealerWelcomeEmail(userId);

  return { success: true, team };
}
```

### مثال 3: إدارة فريق البيع

```typescript
async function manageDealerTeam(dealerId: string) {
  // Get team
  const team = await TeamManagementService.getTeam(dealerId);

  // Add team member
  const newMember = await TeamManagementService.addTeamMember(team.id, {
    userId: 'new_member_id',
    role: 'sales_manager',
    permissions: ['create:listing', 'send:offer', 'view:analytics']
  });

  // Get team members
  const members = await TeamManagementService.getTeamMembers(team.id);

  // Update member permissions
  await TeamManagementService.updateMemberPermissions(team.id, newMember.id, {
    permissions: ['create:listing', 'edit:listing', 'delete:listing']
  });

  return { team, members };
}
```

---

## لوحة التحكم

### Admin Dashboard

```typescript
async function AdminUserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await UserService.getAllUsers({
        page: 1,
        pageSize: 50,
        filters: { role: 'all' }
      });
      setUsers(allUsers);
    };
    fetchUsers();
  }, []);

  const handleVerifyUser = async (userId: string) => {
    await VerificationService.verifyIdentity(userId, {...});
  };

  const handleAssignRole = async (userId: string, role: UserRole) => {
    await RoleManagementService.assignRole(userId, role);
  };

  return (
    <div>
      <UserTable 
        users={users}
        onSelectUser={setSelectedUser}
        onVerify={handleVerifyUser}
        onAssignRole={handleAssignRole}
      />
      {selectedUser && (
        <UserDetailPanel user={selectedUser} />
      )}
    </div>
  );
}
```

---

## الملفات المرتبطة

```
src/services/advanced-user-management/
├── user.service.ts              # User management
├── role-management.service.ts   # Role & permissions
├── team-management.service.ts   # Team management
├── verification.service.ts      # Identity verification
├── subscription-management.service.ts
├── user-analytics.service.ts
└── user-security.service.ts

src/components/admin/user-management/
├── UserTable.tsx
├── UserDetailPanel.tsx
├── RoleAssignmentDialog.tsx
└── TeamManagementPanel.tsx

functions/src/admin/
├── user-management.ts
├── role-assignment.ts
└── verification-handlers.ts
```

---

## الخلاصة

✅ **نظام إدارة مستخدمين متقدم مع:**
- ✅ نظام أدوار وأذونات granular
- ✅ إدارة فريق متقدمة
- ✅ نظام التحقق من الهوية
- ✅ إدارة الاشتراكات
- ✅ لوحات تحكم شاملة

**التاريخ:** 17 يناير 2026  
**الحالة:** ✅ إنتاج جاهز

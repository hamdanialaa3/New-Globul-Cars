# 🔧 Settings Tab - Developer Guide

> **File**: `src/pages/03_user-pages/profile/ProfilePage/tabs/SettingsTab.tsx`  
> **Lines**: 3614  
> **Status**: Constitution Exception (see [CONSTITUTION_EXCEPTIONS.md](../../../../docs/CONSTITUTION_EXCEPTIONS.md))  
> **Last Updated**: December 24, 2025

---

## 📖 **Overview**

This is the **unified settings page** for user profiles. It consolidates all user preferences, security settings, and account management into a single, tab-based interface.

### **Why So Large?**
This file violates the 300-line Constitution limit for **architectural reasons**:
- **Shared State**: 4 interconnected state objects used across 8 sections
- **Unified Save**: Single `handleSave()` function for all settings
- **Cross-Section Dependencies**: Email verification affects both Account AND Security
- **50+ Styled Components**: Neumorphism design with complex animations

**❌ DO NOT split this file** without comprehensive tests and Senior Architect approval.

---

## 🗂️ **Architecture**

### **8 Main Sections** (Tab-Based Navigation)

1. **Account** (`activeSection === 'account'`)
   - Personal information (firstName, lastName, email, phone)
   - Location (region, city, address)
   - Bio
   - Profile picture upload/delete
   - Email/Phone verification badges
   - **State**: `userInfo` (from BulgarianUser)
   - **Handlers**: `saveUserInfoHandler()`, `handleProfileImageUpload()`, `handleDeleteProfileImage()`

2. **Privacy** (`activeSection === 'privacy'`)
   - Profile visibility (public, private, friends-only)
   - Contact info visibility (showPhone, showEmail)
   - Activity tracking (showLastSeen, showActivity)
   - Message permissions (allowMessages)
   - **State**: `settings.privacy`
   - **Handlers**: Inline toggle handlers

3. **Notifications** (`activeSection === 'notifications'`)
   - Channels: Email, SMS, Push
   - Types: Messages, Price Alerts, Favorites, Listings, Promotions
   - **State**: `settings.notifications`
   - **Handlers**: Inline toggle handlers

4. **Security** (`activeSection === 'security'`)
   - Two-factor authentication toggle
   - Login alerts
   - Session timeout dropdown
   - **Password Change Form** (conditional rendering: `showPasswordChange`)
   - Logout from all devices button
   - **State**: `settings.security`, `passwordData`, `changingPassword`, `showPasswordChange`
   - **Handlers**: `handlePasswordChange()`

5. **Appearance** (`activeSection === 'appearance'`)
   - Theme selector (Light, Dark, Auto)
   - Currency (EUR only)
   - Date format (DD.MM.YYYY, DD-MM-YYYY, etc.)
   - Compact view toggle
   - **State**: `settings.appearance`
   - **Handlers**: Inline setters with `CustomThemeProvider` integration

6. **Business Info** (`activeSection === 'business'`)
   - **Conditional**: Only for `isDealerProfile(user)` or Company users
   - Delegates to `<DealershipInfoForm />` component
   - **State**: Managed by child component

7. **Car Preferences** (`activeSection === 'preferences'`)
   - Price range (min, max)
   - Search radius (km)
   - **State**: `settings.carPreferences`
   - **Handlers**: Inline number input handlers

8. **Data & Privacy** (`activeSection === 'data'`)
   - Export user data button
   - Delete account button (with confirmation)
   - **Handlers**: `handleExportData()`, `handleDeleteAccount()`

---

## 🔄 **State Management**

### **Primary States**

```typescript
// 1. User Info (synced with Firestore `users` collection)
const [userInfo, setUserInfo] = useState<ExtendedBulgarianUser | null>(null);

// 2. Settings (privacy, notifications, appearance, security, carPreferences)
const [settings, setSettings] = useState<UserSettings>({
  displayName: '',
  email: '',
  phone: '',
  bio: '',
  language: 'bg',
  privacy: { ... },
  notifications: { ... },
  appearance: { ... },
  security: { ... },
  carPreferences: { ... }
});

// 3. ID Card Data (for profile picture editing overlay)
const [idCardData, setIdCardData] = useState<IDCardData | null>(null);

// 4. Verification States
const [showEmailVerification, setShowEmailVerification] = useState(false);
const [showPhoneVerification, setShowPhoneVerification] = useState(false);
```

### **State Flow**

```
┌─────────────┐
│  Firebase   │
│  Firestore  │
└──────┬──────┘
       │ useEffect() on mount
       ▼
┌─────────────┐
│  userInfo   │ ◄─── Initial load from props.user
└──────┬──────┘
       │
       ├──────► Account Section (firstName, lastName, etc.)
       ├──────► Business Section (dealer info)
       └──────► Verification Modals (email/phone)

┌─────────────┐
│  settings   │ ◄─── Derived from userInfo + defaults
└──────┬──────┘
       │
       ├──────► Privacy Section (toggles)
       ├──────► Notifications Section (toggles)
       ├──────► Security Section (2FA, logout)
       ├──────► Appearance Section (theme, currency)
       └──────► Car Preferences Section (price, radius)

           │
           ▼
    handleSave() ◄─── Unified save function
           │
           ▼
    ┌──────────────┐
    │  Firestore   │
    │  Update Doc  │
    └──────────────┘
```

---

## 🎨 **Styled Components**

### **Layout Components**
- `SettingsContainer` - Main wrapper
- `SettingsLayout` - Grid layout (sidebar + content)
- `Sidebar` - Left navigation (sticky on desktop)
- `ContentArea` - Right content area
- `Section` - Each tab's content container

### **Form Components**
- `Input` - Text inputs (with error state: `$hasError`)
- `InputWithIcon` - Input with left icon
- `TextArea` - Multi-line text
- `Select` - Dropdown
- `PhoneInputWrapper` - Country flag + phone input

### **Interactive Components**
- **Neumorphism Switch** (custom design):
  - `SwitchContainer` → `SwitchWrapper` → `SwitchInner` → `SwitchKnob` → `SwitchKnobNeon`
  - Used by `<ToggleRow>` component
- `RadioOptionRow` - Radio button styled row (no physical switch, just text color changes)
- `ThemeOption` - Theme selector cards

### **Button Components**
- `AnimatedButton` - Base with animated border spans
- `SaveButton` - Primary save button (blue glow)
- `SecondaryButton` - Secondary actions
- `DangerButton` - Destructive actions (red)
- `AvatarEditButton` - Profile picture edit (bottom-right of avatar)
- `AvatarDeleteButton` - Profile picture delete (top-right of avatar)

### **Info/Alert Components**
- `InfoBox` - Blue info box (e.g., "Download Your Data")
- `DangerBox` - Red warning box (e.g., "Delete Account")
- `HelpText` - Gray descriptive text under inputs

---

## 🔧 **Key Functions**

### **Save Handlers**

```typescript
// Account Section Save
const saveUserInfoHandler = async () => {
  // Validates: firstName, lastName, phoneNumber format
  // Auto-generates displayName from firstName + lastName
  // Updates Firestore via profileService.updateUserProfile()
  // Shows success toast
};

// General Settings Save
const handleSave = async () => {
  // Saves ALL settings (privacy, notifications, appearance, security, carPreferences)
  // Updates Firestore user document
  // Shows success toast
};

// Password Change
const handlePasswordChange = async () => {
  // 1. Validates: currentPassword, newPassword, confirmPassword match
  // 2. Re-authenticates user with Firebase Auth
  // 3. Calls updatePassword()
  // 4. Shows success/error toast
};
```

### **Image Management**

```typescript
// Profile Picture Upload
const handleProfileImageUpload = async (file: File) => {
  // 1. Uploads to Firebase Storage: `profile-pictures/{userId}/{timestamp}.jpg`
  // 2. Gets download URL
  // 3. Updates Firestore user.photoURL
  // 4. Refreshes local state
};

// Profile Picture Delete
const handleDeleteProfileImage = async () => {
  // 1. Deletes from Firebase Storage
  // 2. Removes photoURL from Firestore
  // 3. Clears local state
};
```

### **Verification Flows**

```typescript
// Email Verification
const handleVerificationSuccess = async () => {
  // Called by EmailVerificationFlow modal on success
  // Reloads user data from Firebase Auth
  // Shows EmailVerified badge in Account section
};

// Phone Verification
// Same flow as email, but via PhoneVerificationFlow modal
```

---

## 🧪 **Testing Checklist**

When making changes, **always test ALL sections**:

- [ ] **Account Section**
  - [ ] Save personal info (firstName, lastName, bio)
  - [ ] Phone number validation (must be +359XXXXXXXXX)
  - [ ] Auto-conversion: `0888123456` → `+359888123456`
  - [ ] Region/City dropdowns (must select region first)
  - [ ] Upload profile picture
  - [ ] Delete profile picture
  - [ ] Email verification badge appears if verified
  - [ ] Phone verification badge appears if verified

- [ ] **Privacy Section**
  - [ ] Toggle all privacy settings
  - [ ] Settings persist after page refresh

- [ ] **Notifications Section**
  - [ ] Toggle all notification channels (Email, SMS, Push)
  - [ ] Toggle all notification types
  - [ ] Settings persist after page refresh

- [ ] **Security Section**
  - [ ] Toggle 2FA (currently UI-only, not enforced)
  - [ ] Toggle login alerts
  - [ ] Change session timeout
  - [ ] **Password Change Form**:
    - [ ] Validation: current password required
    - [ ] Validation: new password min 6 chars
    - [ ] Validation: passwords must match
    - [ ] Error on wrong current password
    - [ ] Success on correct password
  - [ ] Logout from all devices button works

- [ ] **Appearance Section**
  - [ ] Switch to Light theme (check immediate UI change)
  - [ ] Switch to Dark theme
  - [ ] Switch to Auto theme
  - [ ] Currency dropdown (EUR only)
  - [ ] Date format dropdown
  - [ ] Compact view toggle

- [ ] **Business Section** (Dealers/Companies only)
  - [ ] DealershipInfoForm loads correctly
  - [ ] Saves business info

- [ ] **Car Preferences Section**
  - [ ] Enter price range (min, max)
  - [ ] Enter search radius
  - [ ] Settings persist after page refresh

- [ ] **Data & Privacy Section**
  - [ ] Export data button triggers download
  - [ ] Delete account button shows confirmation
  - [ ] Delete account removes user from Firestore

- [ ] **Mobile Responsive**
  - [ ] Sidebar collapses to horizontal tabs on <968px
  - [ ] All forms usable on mobile
  - [ ] Profile picture upload works on mobile

---

## ⚠️ **Common Pitfalls**

### **1. Phone Number Validation**
```typescript
// ❌ WRONG - Allows invalid formats
phoneNumber: userInfo.phoneNumber || ''

// ✅ CORRECT - Validates +359 format
if (!/^\+359[0-9]{9}$/.test(phoneNumber)) {
  toast.error('Invalid phone format');
  return;
}
```

### **2. Display Name Auto-Generation**
```typescript
// ❌ WRONG - User must manually enter displayName
displayName: userInfo.displayName || ''

// ✅ CORRECT - Auto-generates from firstName + lastName
const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
```

### **3. Region/City Dependency**
```typescript
// ❌ WRONG - Allows city selection without region
<Select value={city}>...</Select>

// ✅ CORRECT - Disables city until region selected
<Select value={city} disabled={!selectedRegion}>...</Select>
```

### **4. Save Button State**
```typescript
// ❌ WRONG - Multiple save buttons with different logic
<Button onClick={handleAccountSave}>Save Account</Button>
<Button onClick={handlePrivacySave}>Save Privacy</Button>

// ✅ CORRECT - One unified save for settings sections
<SaveButton onClick={handleSave}>Save Changes</SaveButton>
// (Account section has separate saveUserInfoHandler)
```

---

## 🚀 **Future Improvements** (If Refactor Needed)

### **Phase 1: Context Migration**
```typescript
// Create SettingsContext to avoid prop drilling
const SettingsContext = createContext<{
  settings: UserSettings;
  updateSettings: (key: string, value: any) => void;
  saveSettings: () => Promise<void>;
}>();

// Then split into micro-components that consume context
<AccountSection />  // Consumes SettingsContext
<PrivacySection />  // Consumes SettingsContext
```

### **Phase 2: Extract Styled Components**
```bash
src/pages/03_user-pages/profile/ProfilePage/tabs/
├── SettingsTab.tsx (main orchestrator, ~300 lines)
├── SettingsTab.styles.ts (all styled components)
└── sections/
    ├── AccountSection.tsx
    ├── PrivacySection.tsx
    ├── NotificationsSection.tsx
    ├── SecuritySection.tsx
    ├── AppearanceSection.tsx
    └── shared/
        ├── ToggleRow.tsx
        ├── RadioOption.tsx
        └── SwitchComponents.tsx
```

### **Phase 3: Extract Handlers to Hooks**
```typescript
// Custom hooks for complex logic
const useAccountSettings = () => {
  const saveUserInfo = async () => { ... };
  const uploadImage = async (file: File) => { ... };
  return { saveUserInfo, uploadImage };
};

const usePasswordChange = () => {
  const changePassword = async (data) => { ... };
  return { changePassword };
};
```

**⚠️ NOTE**: Only proceed with refactor if:
1. Comprehensive end-to-end tests are in place
2. Senior Architect has approved the plan
3. You have 2+ days for implementation + testing

---

## 📞 **Support**

- **Questions**: Contact Senior Lead Architect
- **Bug Reports**: Add to `docs/KNOWN_ISSUES.md`
- **Feature Requests**: Discuss in team meetings before implementing

---

*This guide serves as the definitive reference for maintaining the Settings Tab.*

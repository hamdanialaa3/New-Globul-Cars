# 📜 Constitution Exceptions
## Files Exempt from the 300-Line Rule

> **Last Updated**: December 24, 2025  
> **Status**: Active

---

## ⚖️ **Why Exceptions Exist**

The Project Constitution mandates a **strict 300-line limit per file** for maintainability and code quality. However, certain files are architecturally complex and splitting them would:
- ❌ **Break existing functionality** due to tightly coupled state
- ❌ **Increase complexity** through excessive prop drilling
- ❌ **Require extensive refactoring** with high risk of bugs

These files are **documented exceptions** and must be handled with extra care.

---

## 📋 **Approved Exceptions**

### 1. **SettingsTab.tsx** (3614 lines)
**Path**: `src/pages/03_user-pages/profile/ProfilePage/tabs/SettingsTab.tsx`  
**Reason**: Complex unified settings page with 8+ sections and shared state

#### Why It Can't Be Split:
1. **Shared State Management**:
   - `userInfo` state used by Account, Business, and Verification sections
   - `settings` state shared across Privacy, Notifications, Security, Appearance, and Car Preferences
   - `idCardData` used by Account and Verification flows
   - All states are interconnected and passed to multiple handlers

2. **Unified Save Handler**:
   - `handleSave()` saves ALL settings at once to Firestore
   - Splitting would require either:
     - Multiple save buttons (poor UX)
     - Complex state synchronization between components

3. **Cross-Section Dependencies**:
   - Email/Phone verification affects Account AND Security sections
   - Theme changes affect Appearance AND immediate UI rendering
   - Profile type (Private/Dealer/Company) affects which sections are visible

4. **Modal Flows**:
   - `EmailVerificationFlow` and `PhoneVerificationFlow` modals
   - `IDCardOverlay` for profile picture editing
   - `PasswordChangeForm` within Security section
   - All these are tightly coupled to main component state

5. **50+ Styled Components**:
   - All styled components use consistent theming props
   - Extracting to separate file would break component references
   - Many styled components have interdependencies (e.g., `SwitchRow` uses `SwitchWrapper`)

#### Architecture Notes:
- **8 Main Sections**: Account, Privacy, Notifications, Security, Appearance, Business (Dealers/Companies only), Car Preferences, Data Export
- **Tab-Based Navigation**: Single-page design with sidebar navigation (mobile-responsive)
- **Real-time Validation**: Phone number, email, EGN/EIK validation
- **Firebase Integration**: Firestore saves, Storage for profile pictures, Auth for password changes
- **Neumorphism Design**: Custom switch components with animations

#### Maintenance Guidelines:
- ⚠️ **DO NOT attempt to refactor** without comprehensive test coverage
- ✅ **DO add inline comments** for complex logic sections
- ✅ **DO test thoroughly** after any changes (all 8 sections)
- ✅ **DO use Find/Replace** carefully (file is large, easy to make mistakes)
- ✅ **DO backup** before making changes

#### Future Considerations:
If a refactor becomes necessary:
1. First create comprehensive **end-to-end tests** for all sections
2. Extract to **Context-based state management** (SettingsContext)
3. Split into **micro-components** with Context consumers
4. Keep **backwards compatibility** (do NOT change Firestore schema)

---

## 🔒 **Adding New Exceptions**

To add a file to this exception list:
1. **Justify** why it cannot be split (document above criteria)
2. **Get approval** from Senior Lead Architect
3. **Add entry** to this document with full reasoning
4. **Update** `COMPLETION_MASTER_PLAN_DEC24_2025.md` exceptions list

---

## 📊 **Exception Statistics**

| File | Lines | Sections | State Objects | Reason |
|------|-------|----------|---------------|--------|
| SettingsTab.tsx | 3614 | 8 | 4 | Unified settings with shared state |

**Total Exceptions**: 1  
**Total Exception Lines**: 3614  
**Average Exception Size**: 3614 lines

---

*This document serves as the authoritative reference for Constitution exceptions.*

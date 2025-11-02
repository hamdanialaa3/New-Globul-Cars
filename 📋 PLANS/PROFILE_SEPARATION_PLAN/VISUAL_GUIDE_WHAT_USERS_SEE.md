# 👁️ دليل مرئي: ماذا سيرى المستخدم؟
## Visual Guide: What Users Actually See

**📅 Date:** November 2, 2025  
**✅ Status:** Complete Implementation

---

## 🎯 **الإجابة المباشرة:**

### **ماذا سيظهر على الواجهة؟**

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  الآن المستخدم سيرى 4 أشياء جديدة في صفحة Settings:     ║
║                                                            ║
║  1️⃣ مبدل نوع الحساب (Profile Type Switcher)             ║
║     → يختار بين Private/Dealer/Company                   ║
║                                                            ║
║  2️⃣ نموذج المعرض (Dealership Form) - للـ Dealers فقط   ║
║     → تعديل معلومات المعرض بالكامل                       ║
║                                                            ║
║  3️⃣ نموذج الشركة (Company Form) - للـ Companies فقط    ║
║     → تعديل معلومات الشركة بالكامل                       ║
║                                                            ║
║  4️⃣ رافع المستندات (Verification Uploader)              ║
║     → رفع مستندات التحقق (ID, Business License)          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## 📱 **صور توضيحية - Mockups**

### **1. صفحة Settings - Full View**

```
┌──────────────────────────────────────────────────────────────┐
│  MOBILE-EU                                     [User ▼]      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Your Account Settings / Настройки на акаунта               │
│  ══════════════════════════════════════════════════════════  │
│                                                              │
│  [Customer Number Badge: #BG2024000123]                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ✨ NEW! Choose Your Profile Type                      │ │
│  │  ═══════════════════════════════════════════════════    │ │
│  │                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │ 👤 PRIVATE │  │ 🏢 DEALER   │  │ 🏛️ COMPANY  │   │ │
│  │  │ ═══════════ │  │             │  │             │   │ │
│  │  │ FREE       │  │ €30/month   │  │ €60/month   │   │ │
│  │  │ 3 Ads      │  │ 50 Ads      │  │ 100 Ads     │   │ │
│  │  │ No Team    │  │ 2 Team      │  │ 10 Team     │   │ │
│  │  │ Basic      │  │ Analytics   │  │ Advanced    │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │  ^ ACTIVE          [Upgrade]        [Upgrade]         │ │
│  │                                                         │ │
│  │  Current Plan: Private (Free)                          │ │
│  │  Your Permissions: 3 active ads, basic features        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Profile Photo                                         │ │
│  │  [Photo Uploader - existing component]                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ID Card Verification                                  │ │
│  │  [Existing component]                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Login Data                                            │ │
│  │  [Existing component]                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Contact Information                                   │ │
│  │  [Existing component]                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│  ✨ NEW SECTIONS BELOW (Only show for dealers/companies)   │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🏢 Dealership Information          [Show ▼]          │ │
│  │  ════════════════════════════════════════              │ │
│  │  (Form appears when clicking Show)                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ✨ NEW! Verification Documents                        │ │
│  │  ═══════════════════════════════════════════════       │ │
│  │                                                         │ │
│  │  Upload documents to verify your account:              │ │
│  │                                                         │ │
│  │  Document Type: [Business License ▼]                  │ │
│  │  ┌───────────────────────────────────────────┐        │ │
│  │  │                                           │        │ │
│  │  │      📁 Drag & Drop File Here             │        │ │
│  │  │         or Click to Browse                │        │ │
│  │  │                                           │        │ │
│  │  │   Accepted: JPG, PNG, PDF (Max 5MB)      │        │ │
│  │  └───────────────────────────────────────────┘        │ │
│  │                                                         │ │
│  │  [Upload Document]                                     │ │
│  │                                                         │ │
│  │  Uploaded Documents:                                   │ │
│  │  ✅ ID Card (Verified - Nov 2, 2025)                  │ │
│  │  ⏳ Business License (Pending Review)                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Other existing sections below...]                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### **2. Dealership Form - Expanded View**

**عندما يضغط Dealer على "Show" في قسم Dealership Information:**

```
┌──────────────────────────────────────────────────────────────┐
│  🏢 Dealership Information                    [Hide ▲]      │
│  ══════════════════════════════════════════════════════════  │
│                                                              │
│  📝 Edit Your Dealership Profile                            │
│  ───────────────────────────────────────────────────────     │
│                                                              │
│  Basic Information:                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Name (Bulgarian):                                      │ │
│  │ [Автокъща Гранд Моторс                          ]     │ │
│  │                                                         │ │
│  │ Name (English):                                        │ │
│  │ [Grand Motors Dealership                        ]     │ │
│  │                                                         │ │
│  │ EIK (Bulgarian Company ID):                            │ │
│  │ [123456789                                      ]     │ │
│  │ ℹ️  9 digits - Must be valid Bulgarian EIK             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Contact Information:                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Phone: [+359 2 123 4567                         ]     │ │
│  │ Email: [info@grandmotors.bg                     ]     │ │
│  │ Website: [https://grandmotors.bg                ]     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Address:                                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Street: [бул. Цариградско шосе 115              ]     │ │
│  │ City: [София                                    ]     │ │
│  │ Region: [София-град ▼                           ]     │ │
│  │ Postal Code: [1000                              ]     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Working Hours:                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Monday:    [09:00] to [18:00]  ☑️ Open              │ │
│  │ Tuesday:   [09:00] to [18:00]  ☑️ Open              │ │
│  │ Wednesday: [09:00] to [18:00]  ☑️ Open              │ │
│  │ Thursday:  [09:00] to [18:00]  ☑️ Open              │ │
│  │ Friday:    [09:00] to [18:00]  ☑️ Open              │ │
│  │ Saturday:  [09:00] to [14:00]  ☑️ Open              │ │
│  │ Sunday:    [──:──] to [──:──]  ☐ Closed             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Services Offered:                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☑️ New Cars             ☑️ Used Cars                  │ │
│  │ ☑️ Financing            ☐ Insurance                   │ │
│  │ ☑️ Service & Repair     ☐ Parts                       │ │
│  │ ☐ Trade-In              ☐ Delivery                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Media:                                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Logo:                                                  │ │
│  │ [📷 Current Logo Preview]                             │ │
│  │ [Change Logo]                                          │ │
│  │                                                         │ │
│  │ Gallery (max 10 photos):                               │ │
│  │ [📷] [📷] [📷] [➕ Add More]                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────┐                  │
│  │  [💾 Save Changes]  [❌ Cancel]     │                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### **3. Company Form - Expanded View**

**عندما يضغط Company على "Show":**

```
┌──────────────────────────────────────────────────────────────┐
│  🏛️ Company Information                      [Hide ▲]      │
│  ══════════════════════════════════════════════════════════  │
│                                                              │
│  📝 Edit Your Company Profile                               │
│  ───────────────────────────────────────────────────────     │
│                                                              │
│  Company Details:                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Company Name (BG):                                     │ │
│  │ [Глобъл Каърс ЕООД                              ]     │ │
│  │                                                         │ │
│  │ Company Name (EN):                                     │ │
│  │ [Global Cars Ltd.                               ]     │ │
│  │                                                         │ │
│  │ BULSTAT:                                               │ │
│  │ [206123456                                      ]     │ │
│  │ ℹ️  9 or 13 digits - Bulgarian company identifier      │ │
│  │                                                         │ │
│  │ Legal Form:                                            │ │
│  │ [ЕООД ▼]                                               │ │
│  │ Options: ООД, ЕООД, АД, ЕАД, КД, КДА, СД, СДА        │ │
│  │                                                         │ │
│  │ Registration Number:                                   │ │
│  │ [20161234567890                             ]     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Contact:                                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Phone: [+359 2 987 6543                         ]     │ │
│  │ Email: [info@globalcars.eu                      ]     │ │
│  │ Website: [https://globalcars.eu                 ]     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Fleet Information:                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Total Fleet Size: [250] vehicles                       │ │
│  │                                                         │ │
│  │ Fleet Types:                                           │ │
│  │ ☑️ Passenger Cars (150)                               │ │
│  │ ☑️ Commercial Vehicles (80)                           │ │
│  │ ☑️ Trucks (20)                                        │ │
│  │ ☐ Buses                                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Departments:                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☑️ Sales Department                                   │ │
│  │ ☑️ Service Department                                 │ │
│  │ ☑️ Parts Department                                   │ │
│  │ ☑️ Fleet Management                                   │ │
│  │ ☐ Rental Department                                   │ │
│  │ ☐ Leasing Department                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────┐                  │
│  │  [💾 Save Changes]  [❌ Cancel]     │                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### **4. Header Dropdown - Profile Type Switcher**

**عند الضغط على User Icon في Header:**

```
┌──────────────────────────────────────────┐
│  MOBILE-EU  [🔍]  [🔔]  [👤 User ▼]    │
│                         ↓                │
│                 ┌────────────────┐      │
│                 │ Profile Menu   │      │
│                 ├────────────────┤      │
│                 │ 👤 My Profile  │      │
│                 │ ⚙️  Settings   │      │
│                 ├────────────────┤      │
│                 │ Profile Type:  │      │
│                 │ ┌────────────┐ │      │
│                 │ │ 👤 Private │ ← Current │
│                 │ │ ══════════ │ │      │
│                 │ └────────────┘ │      │
│                 │ ┌────────────┐ │      │
│                 │ │ 🏢 Dealer  │ │      │
│                 │ │            │ │      │
│                 │ └────────────┘ │      │
│                 │ ┌────────────┐ │      │
│                 │ │ 🏛️ Company │ │      │
│                 │ │            │ │      │
│                 │ └────────────┘ │      │
│                 ├────────────────┤      │
│                 │ 🚪 Logout      │      │
│                 └────────────────┘      │
└──────────────────────────────────────────┘
```

---

## 🎬 **User Journey Examples**

### **Journey 1: Private User → Dealer**

```
Step 1: User opens Settings
└─ URL: http://localhost:3000/profile/settings
   
Step 2: Sees Profile Type Switcher at top
└─ 3 cards: Private (active), Dealer, Company

Step 3: Clicks "Dealer" card
└─ Confirmation modal appears:
    ┌────────────────────────────────────────┐
    │ ⚠️  Upgrade to Dealer Account?        │
    │                                        │
    │ Requirements:                          │
    │ ✓ Valid phone number                  │
    │ ✓ Email verification                  │
    │ ✗ Dealership information (required)   │
    │                                        │
    │ Benefits:                              │
    │ • 50 active ads (vs 3)                │
    │ • Analytics dashboard                 │
    │ • 2 team members                      │
    │ • €30/month                           │
    │                                        │
    │ [Cancel]  [Continue Setup]            │
    └────────────────────────────────────────┘

Step 4: Clicks "Continue Setup"
└─ Auto-scrolls to Dealership Information section
   Form expands and shows empty fields

Step 5: Fills dealership info
└─ Name, EIK, Address, Phone, Hours, Services

Step 6: Clicks "Save Changes"
└─ System:
    • Creates dealerships/{uid}
    • Updates user.profileType = 'dealer'
    • Updates user.dealershipRef
    • Updates user.dealerSnapshot
    • Updates permissions (50 ads)

Step 7: Success!
└─ Toast: "✅ Dealership profile created!"
   Theme changes to Green
   Can now add 50 ads
```

---

### **Journey 2: Dealer Edits Working Hours**

```
Step 1: Dealer opens Settings

Step 2: Sees "🏢 Dealership Information"
└─ Clicks "Show"

Step 3: Form expands with current data

Step 4: Changes Saturday hours: 9-18 → 9-14

Step 5: Clicks "Save Changes"
└─ Updates dealerships/{uid}.workingHours

Step 6: Success!
└─ Toast: "✅ Working hours updated!"
   Form auto-hides
```

---

### **Journey 3: Upload Business License**

```
Step 1: Any user opens Settings

Step 2: Scrolls to "📄 Verification Documents"

Step 3: Selects document type
└─ [Business License ▼]

Step 4: Drags PDF file to drop zone
└─ File preview appears

Step 5: Clicks "Upload Document"
└─ Progress bar: 0% → 100%
   Uploads to: verifications/{uid}/business_license.pdf

Step 6: Success!
└─ Toast: "✅ Document uploaded!"
   Status shows: "⏳ Pending Review"

Step 7: After admin approval
└─ Status updates: "✅ Verified - Nov 2, 2025"
   Trust Score: +20 points
```

---

## 📊 **Data Flow - What Happens Behind the Scenes**

### **When User Opens Settings:**

```
1. Component: ProfileSettingsNew.tsx renders

2. Hooks execute:
   const { user } = useProfile();
   const { profileType, theme } = useProfileType();
   const { user: completeUser, dealership, company, reload } = useCompleteProfile(uid);

3. useCompleteProfile fetches:
   ├─ users/{uid}                    ← Always
   ├─ dealerships/{uid}              ← IF profileType === 'dealer'
   └─ companies/{uid}                ← IF profileType === 'company'

4. UI decides what to show:
   ├─ ProfileTypeSwitcher            ← Always visible
   ├─ DealershipForm                 ← IF isDealerProfile(completeUser)
   ├─ CompanyForm                    ← IF isCompanyProfile(completeUser)
   └─ VerificationUploader           ← Always visible
```

### **When User Saves Dealership Form:**

```
1. User fills form and clicks "Save"

2. DealershipProfileForm calls:
   const repo = new DealershipRepository();
   await repo.updateWithUserSync(uid, formData);

3. Firestore Transaction:
   START TRANSACTION
   ├─ Update: dealerships/{uid} = formData
   ├─ Update: users/{uid}.dealerSnapshot = {
   │    nameBG: formData.nameBG,
   │    nameEN: formData.nameEN,
   │    logo: formData.logo,
   │    status: formData.status
   │  }
   └─ Update: users/{uid}.updatedAt = now()
   COMMIT TRANSACTION

4. UI updates:
   ├─ reloadProfile() refetches data
   ├─ Toast shows success message
   └─ Form auto-hides
```

---

## 🎨 **Visual Changes Summary**

### **Before Phase 5:**
```
Settings Page:
• Customer Number
• Profile Photo
• ID Verification
• Login Data
• Contact Data
• Documents
• Danger Zone

Nothing visible from new system! ❌
```

### **After Phase 5:**
```
Settings Page:
• Customer Number
• ✨ PROFILE TYPE SWITCHER ← NEW!
• Profile Photo
• ID Verification
• Login Data
• Contact Data
• ✨ DEALERSHIP FORM (dealers) ← NEW!
• ✨ COMPANY FORM (companies) ← NEW!
• ✨ VERIFICATION UPLOADER ← NEW!
• Documents
• Danger Zone

Everything is now visible! ✅
```

---

## 🚀 **How to Test**

```bash
# 1. Start the app
npm start

# 2. Navigate to Settings
http://localhost:3000/profile/settings

# 3. You should see:
✓ Profile Type Switcher at top
✓ If you're a dealer: Dealership form section
✓ If you're a company: Company form section
✓ Verification uploader for everyone

# 4. Test switching:
• Click on "Dealer" card
• Confirm in modal
• Check if form appears
• Fill and save

# 5. Test upload:
• Scroll to Verification Documents
• Drag a PDF file
• Click Upload
• Check Firebase Storage
```

---

## 🎉 **Final Result**

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  ✅ Phase 5 Complete - Everything is Now Visible!         ║
║                                                            ║
║  Before: Backend infrastructure only (invisible)          ║
║  After:  Full UI integration (visible & functional)       ║
║                                                            ║
║  Users Can Now:                                           ║
║  ✓ Switch between profile types                           ║
║  ✓ Edit dealership information                            ║
║  ✓ Edit company information                               ║
║  ✓ Upload verification documents                          ║
║  ✓ See permissions based on profile type                  ║
║  ✓ Get real-time feedback (toasts)                        ║
║                                                            ║
║  All integrated with:                                     ║
║  ✓ Firebase Firestore                                     ║
║  ✓ Firebase Storage                                       ║
║  ✓ Type-safe TypeScript                                   ║
║  ✓ Responsive design                                      ║
║  ✓ BG/EN translations                                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

**🎊 Now users can actually SEE and USE everything we built! 🎊**

**Date:** November 2, 2025  
**Status:** ✅ **FULLY VISIBLE & FUNCTIONAL**


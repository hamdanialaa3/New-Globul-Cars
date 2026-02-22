I'll do deep discovery first across both web and mobile codebases to build a comprehensive, gap-free plan.

Subagent: Deep research web homepage

Reviewed content from lines 1 to 350
Excellent web research. Now let me research the mobile side deeply:

Subagent: Deep research mobile app

Reviewed content from two sections
Now let me verify the specific bug the user mentioned — changing name in mobile doesn't reflect in web. Let me check the critical files:

Reviewed edit.tsx and searched for multiple terms
Now let me check the exact web AuthProvider listener to understand the bug — the web has onSnapshot on users/{uid} and should be picking up mobile-made changes:

Reviewed AuthProvider.tsx from lines 60 to 115
Now let me check the exact web profile display to understand the sync bug:

Searched for multiple regex patterns and text in files
Now I see the problem clearly. Multiple web components use currentUser.displayName as a primary or fallback source. The Firebase Auth currentUser object doesn't auto-update across devices.

Let me also check the web Header/Navbar where the name is displayed:

Searched for regex patterns and files related to Navbar
Now I have complete picture. Let me also check the free offer field name mismatch:

Reviewed 2 files
Confirmed the critical bug: web reads isActive, mobile reads/writes enabled. Now I have the complete picture. Let me also verify the web AuthProvider re-render issue:

Reviewed AuthProvider.tsx and auth-context.ts
Now let me verify how the web provides the user alias — is it currentUser:

Searched for `user: current` and checked AuthProvider.tsx
Now I have the complete picture. Now let me verify: after updateProfile(user, ...), does setCurrentUser get re-triggered? No — onAuthStateChanged only fires on login/logout, not on updateProfile. The bug is clear.

Now I have everything for completing the plan. Let me also check the current state of [plan_phone_APP 5.md](plan_phone_APP _5.md) to understand the user's document:](https://microsoft.com))

Read plan_phone_APP _5.md

Good — empty file waiting for our plan. Now let me write the comprehensive plan based on all the deep research:

Asked a question (Scope)

بناءً على البحث العميق، اكتشفت أن: 1. **باغ المزامنة الأساسي**: الويب يقرأ `currentUser.displayName` (Firebase Auth) في 16+ مكان — وهذا لا يتحدث تلقائياً عبر الأجهزة. المفروض يقرأون من `userProfile.displayName` (Firestore real-time). هذا هو سبب المشكلة اللي وصفتها. 2. **باغ حقل الـ Free Offer**: الموبايل يكتب `enabled`، الويب يقرأ `isActive` — لا يتزامن بينهم! 3. **الأقسام الناقصة في الموبايل**: `ai_chatbot` و `draft_recovery` (floating) غير موجودة 4. **البحث المتقدم**: الموبايل عنده 30 فلتر من أصل 63 في الويب هل تريد الخطة الكاملة تشمل كل هذه النقاط + إصلاح جميع الـ 16 ملف في الويب اللي تقرأ `currentUser.displayName`؟
نعم — الخطة الكاملة بكل التفاصيل
- إصلاح 16+ ملف ويب + باغات المزامنة + الأقسام الناقصة + البحث المتقدم
Now I'll write the comprehensive plan:

Plan: Full Web↔Mobile Sync & Section Parity (plan_phone_APP_5)
Based on deep research of both web (src) and mobile (mobile_new) codebases, here is every gap discovered and the exact steps to resolve them.

Root Cause Analysis
Bug: "Changed displayName in mobile → web still shows old name"

The web's AuthProvider.tsx reads users/{uid} via onSnapshot and correctly sets userProfile (Firestore) in real-time. BUT 16+ web components read currentUser.displayName or user.displayName (Firebase Auth object) instead of userProfile?.displayName. The Firebase Auth User object does NOT auto-update across devices — onAuthStateChanged only fires on login/logout, never on updateProfile() from another client. So currentUser.displayName stays stale forever until re-login.

Fix strategy: Two-pronged:

After calling updateProfile() in the onSnapshot handler, call setCurrentUser({...user}) to force React re-render with the updated Auth object
Audit all 16+ web files using currentUser.displayName and replace with userProfile?.displayName || currentUser?.displayName fallback chain
Steps
Part A: Web Profile Sync Fix (Critical — fixes the reported bug)

In AuthProvider.tsx:76-102, inside the onSnapshot handler, AFTER the updateProfile(user, {...}) call succeeds, add setCurrentUser(Object.assign(Object.create(Object.getPrototypeOf(user)), user)) — this creates a new object reference so React detects the state change and re-renders all components consuming currentUser. This is the fast fix that immediately fixes the bug for components reading currentUser.displayName.

Audit and fix these 16 web files that read currentUser.displayName to prefer userProfile?.displayName:

ContactForm.tsx:27 — currentUser?.displayName → userProfile?.displayName || currentUser?.displayName
ContactPageUnified.tsx:112-113 — same pattern
ContactPageUnified.js:88-89 — same
Step6Contact.tsx:174-197 — same
SubscriptionManager.tsx:318 — already has fallback but order reversed
SellVehicleStep6.tsx:317 — already correct priority
IncompleteProfileAlert.tsx:280 — add userProfile?.displayName to check
AdvancedUserManagement.tsx:420 — already has fallback
CreatePostWidget.tsx:42-43 — uses user.displayName (where user is BulgarianUser from profile, NOT Auth — verify before changing)
BusinessGreenHeader.tsx:607-772 — uses user.displayName (verify context)
bulgarian-profile-service.ts:271 — Auth.currentUser used for fallback in service layer
In AuthProvider.tsx:288-296, also expose userProfile more prominently — add a computed displayName getter to the context value: displayName: userProfile?.displayName || currentUser?.displayName || null so components have a single authoritative source.

Part B: Mobile edit.tsx → Use context's updateUserProfile instead of dual-write

In edit.tsx:170-190, refactor to use AuthContext.updateUserProfile() (the unified method that writes BOTH Firestore and Auth atomically) instead of calling userService.updateUserProfile() + manual updateProfile(auth.currentUser) separately. This eliminates the fragile dual-write and ensures a single code path.
Part C: Free Offer Field Mismatch Fix (Critical sync bug)

In admin-sections.tsx:112-121, change getFreeOfferEnabled() to read snap.data()?.isActive instead of snap.data()?.enabled. Change setFreeOfferEnabled() to write isActive: enabled instead of enabled: enabled. This matches the web's usePromotionalOffer.ts:82 which reads data.isActive and usePromotionalOffer.ts:133 which writes isActive: active.
Part D: Missing Mobile Floating Sections

Create mobile_new/src/components/home/FloatingAIChatbot.tsx — a floating FAB-style button at bottom-right that opens the AI advisor (/ai/advisor). Matches web's ai_chatbot section key. Simple implementation: TouchableOpacity with position: 'absolute', Ionicons chatbubble-ellipses, navigate to /ai/advisor.

Create mobile_new/src/components/home/DraftRecoveryPrompt.tsx — checks if DraftService has any saved drafts on mount; if yes, shows a dismissable bottom-sheet banner with "Continue your listing" CTA. Matches web's draft_recovery section key.

In MobileDeHome.tsx:50-69:

Add FloatingAIChatbot and DraftRecoveryPrompt imports
Add to SECTION_COMPONENT_MAP: ai_chatbot: FloatingAIChatbot, draft_recovery: DraftRecoveryPrompt
Render floating sections outside the main orderedSections loop (after the ScrollView), each gated by isVisible(key) from useMobileSectionVisibility — same pattern as web's HomePageComposer.tsx
In useMobileSectionVisibility.ts:48-66, add to DEFAULT_MOBILE_SECTIONS:

{ key: 'ai_chatbot', label: 'AI Chatbot', description: 'Floating AI advisor button', visible: true, order: 19, category: 'floating' }
{ key: 'draft_recovery', label: 'Draft Recovery', description: 'Resume unfinished listing', visible: true, order: 20, category: 'floating' }
Also export isVisible from the hook return (already present)
Part E: Advanced Search — Expand FilterState to full web parity

In UnifiedFilterTypes.ts:17-90, add the ~33 missing fields from web's SearchData type to FilterState:

Basic: slidingDoor?, paymentType?, huValid?, ownersCount?, serviceHistory?, roadworthy?
Technical: fuelTankVolumeMin?/Max?, weightMin?/Max?, cylindersMin?/Max?, fuelConsumptionUpTo?, emissionSticker?, emissionClass?, particulateFilter?
Exterior: trailerCoupling?, trailerLoadBraked?, trailerLoadUnbraked?, noseWeight?, parkingSensors?: string[], cruiseControl?
Interior: airbags?, airConditioning?
Equipment split: safetyEquipment?: string[], comfortEquipment?: string[], infotainmentEquipment?: string[], extras?: string[] (keep existing equipment?: string[] as an alias)
Offer: dealerRating?, adOnlineSince?, discountOffers?, taxi?, commercialExport?, approvedUsedProgramme?
Location: country?, deliveryOffers?
Search: searchDescription?
In advanced-search.tsx, add the new fields to the existing 7-section UI:

Basic: add slidingDoor chip, paymentType chip row, ownersCount input, serviceHistory/roadworthy/huValid boolean rows
Technical: add fuelTankVolume, weight, cylinders range rows; fuelConsumptionUpTo input; emissionSticker/emissionClass chip rows; particulateFilter boolean
Exterior: add trailerCoupling boolean, trailerLoadBraked/Unbraked/noseWeight inputs, parkingSensors multi-chip, cruiseControl chip row
Interior: add airbags chip row, airConditioning chip row
Equipment: split into 4 sub-sections (Safety, Comfort, Infotainment, Extras) with separate chip grids
Offer: add dealerRating, adOnlineSince, discountOffers, taxi, commercialExport, approvedUsedProgramme fields
Location: add country picker (default BG), deliveryOffers boolean
In UnifiedFilterEngine.ts, add Algolia filter mappings for the new fields so they actually work in search queries.

Part F: Mobile static theme → useTheme() fix in MobileDeHome

In MobileDeHome.tsx:24, replace import { theme } from '../../styles/theme' with import { useTheme } from 'styled-components/native' and add const theme = useTheme() inside the component body. This is needed because the static import doesn't react to theme changes (dark/light/system mode).
Part G: Favorites Dual Source of Truth

In favorites.tsx, change it to read from the favorites Firestore collection (via PlatformSyncService.getUserFavorites()) instead of profile.favorites[] array. This ensures parity with web which reads from the favorites collection via favorites.service.ts.
Part H: Web AuthProvider — force re-render after Auth sync

(Already described in step 1, but critical — restate for emphasis): In the web AuthProvider.tsx onSnapshot handler, after updateProfile(user, ...) succeeds, trigger a re-render:

// Force React re-render by creating new user referencesetCurrentUser(prev => prev ? {...prev} as any : prev);
This is simpler than the prototype approach — we just spread the User object into a new reference. Note: this loses the Firebase User class methods. Alternative: use await user.reload(); setCurrentUser(getAuth().currentUser) to get a fresh Auth user with updated displayName.
Part I: Admin Panel — SiteSettings sync parity

In admin-sections.tsx, after the Free Offer toggle write, also write to app_settings/site_settings → pricing.subscriptionMode = 'free' or 'paid' — mirroring what the web's SectionControlPanel.tsx:356 does with siteSettingsService.updateSiteSettings().
Verification
Profile sync test: Change displayName on mobile → web profile/header/greeting updates within seconds (no refresh). Change on web → mobile updates within seconds.
Free Offer test: Toggle free offer in mobile admin → web usePromotionalOffer hook reflects new isActive state within seconds. Toggle on web → mobile reads same isActive value.
Section parity test: Compare localhost:3000 sections with localhost:8081 sections — all 22 keys should be configurable from either admin panel.
Advanced search test: Open mobile advanced search, apply 20+ filters across all 7 sections → search returns correct results matching web behavior.
Floating sections test: Toggle ai_chatbot OFF in admin → FAB disappears from mobile home. Toggle draft_recovery OFF → banner doesn't show even with saved drafts.
Type-check: cd mobile_new && npx tsc --noEmit and cd web && npm run type-check — zero errors.
Decisions
Auth re-render: Using user.reload() + setCurrentUser(getAuth().currentUser) instead of prototype spreading — preserves Firebase User class methods
Free Offer field: Fixing mobile to match web's isActive (not changing web) — web has more consumers
Equipment arrays: Adding 4 web-specific arrays (safetyEquipment, comfortEquipment, infotainmentEquipment, extras) while keeping the existing equipment[] alias — backward compatible
Floating sections: Rendering outside ScrollView (matching web pattern) not inside dynamic section loop — they need overlay/absolute positioning

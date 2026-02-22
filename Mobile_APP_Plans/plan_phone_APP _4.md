Plan: Port Web Homepage + Sync + Search → Mobile
TL;DR
The web homepage at localhost:3000 uses a dynamic section system controlled by SuperAdmin (Firestore app_settings/homepage_sections). The mobile app at localhost:8081 already reads this config but has gaps: missing section components, no reorder in admin panel, no role checks, broken profile sync (mobile→web works, web→mobile doesn't), and an under-featured advanced search. This plan closes every gap across 7 parts: bidirectional profile sync, section parity, admin panel upgrade, missing home components, advanced search port, error boundaries, and database hardening.

Steps

Part A — Bidirectional Profile Sync (Fix web→mobile)
Problem: AuthContext.tsx:67-79 does a one-shot getDoc on auth state change. When a name changes on web, mobile never sees it until re-login. Web already has onSnapshot in AuthProvider.tsx:80.

Rewrite the mobile AuthContext.tsx auth listener (lines 55–84) to replace the one-shot getUserProfile() call with a Firestore onSnapshot listener on users/{uid}:

Import doc, onSnapshot from firebase/firestore and db from ../services/firebase
After setUser(usr), set up onSnapshot(doc(db, 'users', usr.uid), (snap) => { setProfile(snap.data()) }) with the isActive guard
Store the profile unsub ref so it's torn down on logout/unmount (same pattern as web AuthProvider.tsx:82-95)
Keep the createUserProfile fallback if snapshot doesn't exist
Also sync Firestore→Firebase Auth displayName if diverged (same logic as web line ~88)
Add refreshProfile() to mobile AuthContextType — a manual refresh trigger for places that need certainty (pull-to-refresh on profile tab). It should call getUserProfile(user.uid) and setProfile().

Expose updateProfile helper on mobile context that writes to both Firestore AND Firebase Auth in one call (prevent the current split where edit.tsx updates them separately).

Part B — Section Key Parity (Web ↔ Mobile)
Problem: Web has 22 default sections; mobile has 17. Five web keys have no mobile mapping; one mobile key (categories) has no web mapping.

Create missing mobile section components in home:

Web Key	New Mobile Component	Source Reference
our_cars	OurCarsShowcase.tsx	Port from web OurCarsShowcase — real user listings grid using ListingService
cars_showcase	CarsShowcase.tsx	Port from web UnifiedCarsShowcase — main car grid with tabs/filters
Register new components in SECTION_COMPONENT_MAP inside MobileDeHome.tsx:48-66: add our_cars → OurCarsShowcase and cars_showcase → CarsShowcase.

Add categories to web defaults in section-visibility-defaults.ts (order 8.5, category main, visible: false by default on web since it's mobile-oriented). Also add to web SECTION_MAP in HomePageComposer.tsx:475 as a no-op/hidden so it won't crash if toggled on.

Update mobile defaults in useMobileSectionVisibility.ts:48-64: add our_cars (order 2.5) and cars_showcase (order 9) entries matching web.

Skip floating sections (sticky_search, ai_chatbot, draft_recovery) — these are web-only UI patterns. Mobile has its own floating search bar hardcoded in MobileDeHome. Document the exclusion.

Part C — Upgrade Mobile Admin Sections Panel
Problem: admin-sections.tsx lacks: reorder, role check, seed defaults, category grouping, free offer toggle, i18n vs the web SectionControlPanel.

Add admin role check — port the ensureAdminRole() pattern from SectionControlPanel.tsx:287-311:

Check Firebase custom claims (admin === true)
Fallback: read users/{uid}.role === 'admin'
Show "Access Denied" screen if not admin
Gate the screen in _layout.tsx or at component mount
Add reorder controls — Up/Down arrow buttons per section row:

Swap order values between adjacent items (same algorithm as web SectionControlPanel.tsx:455-515)
Save immediately to Firestore via existing updateMobileSectionVisibility()
Visual: Ionicons chevron-up / chevron-down in the row
Add "Reset to Defaults" button — calls sectionVisibilityService.seedDefaults() or writes DEFAULT_MOBILE_SECTIONS directly to app_settings/homepage_sections (preserving web-only keys)

Group sections by category — render 3 collapsible groups: Main, Conditional, Floating (matching web layout)

Add Free Offer toggle — read/write app_settings/promotional_offer doc (same as web SectionControlPanel.tsx:388-420)

Add i18n — use mobile useLanguage() for Bulgarian/English labels (the web uses useAdminLang)

Part D — Error Boundaries for Mobile Home Sections
Problem: MobileDeHome.tsx renders sections in a loop with no error boundary. A crash in any section takes down the entire homepage.

Create SectionErrorBoundary.tsx in home:

Class component with componentDidCatch logging to logger
Fallback UI: collapsed card with section name + "Tap to retry" that calls setState({ hasError: false })
Wrap each dynamic section in the rendering loop (MobileDeHome.tsx L223–L232):


<SectionErrorBoundary key={section.key} sectionKey={section.key}>  <SectionComponent /></SectionErrorBoundary>
Part E — Port Web Advanced Search to Mobile
Problem: Mobile advanced-search.tsx has 9 filter fields. Web AdvancedSearchPage has 60+ fields across 7 sections.

Expand mobile advanced-search.tsx to match web's filter groups. Rewrite as a ScrollView with 7 collapsible <Section> groups matching web types.ts:

Section	Fields to add
Basic	model (dependent on make), seatsFrom/To, doorsFrom/To, slidingDoor, condition, paymentType, mileageFrom/To, huValid, ownersCount, serviceHistory, roadworthy
Technical	powerFrom/To, cubicCapacityFrom/To, fuelTankVolumeFrom/To, weightFrom/To, cylindersFrom/To, driveType, fuelConsumptionUpTo, emissionSticker, emissionClass, particulateFilter
Exterior	trailerCoupling, trailerLoadBraked/Unbraked, noseWeight, parkingSensors[], cruiseControl
Interior	interiorColor, interiorMaterial, airbags, airConditioning
Equipment	safetyEquipment[], comfortEquipment[], infotainmentEquipment[], extras[] (multi-select checkboxes, same groups as web)
Offer Details	seller, dealerRating, adOnlineSince, adsWithPictures/Video, discountOffers, nonSmokerVehicle, taxi, vatReclaimable, warranty, damagedVehicles, commercialExport, approvedUsedProgramme
Location	country, city, radius, deliveryOffers
Share SearchData type — create mobile_new/src/types/search/search-data.types.ts mirroring web's types.ts or import from a shared location.

Wire to Algolia — the existing useMobileSearch hook already has Algolia + UnifiedFilterEngine. Extend FilterState in UnifiedFilterTypes.ts to include the new fields and update UnifiedFilterEngine.ts buildAlgoliaQuery() to map them.

Add "Save Search" integration — call SavedSearchesService to persist searches to Firestore savedSearches (already fixed to match web collection name).

Part F — Database Hardening & Sync Audit
Audit all Firestore collection references across mobile and web. Known matches to verify:

Collection	Web Ref	Mobile Ref	Status
users	services	userService.ts	✅ Match
app_settings	src/services/section-visibility*	useMobileSectionVisibility.ts	✅ Match
savedSearches	web services	SavedSearchesService.ts	✅ Fixed
searchHistory	search-history.service.ts	search-history.service.ts	✅ Match
listings	multi-collection via sell-workflow-collections.ts	ListingService.ts	Verify
Algolia cars_bg	web config	algolia-search.service.ts	✅ Fixed
Verify listings collection alignment — web uses 6 split collections via sell-workflow-collections.ts. Mobile's ListingService.ts must query the same collections. Read and compare both to ensure no mismatches.

Add onSnapshot listeners for shared real-time data on mobile where needed:

Favorites count (if web uses real-time)
Listing status changes (when viewing a listing detail)
Unread messages (already done via RTDB)
Part G — MobileDeHome Enhancements
Use dynamic theme — MobileDeHome.tsx imports theme statically from ../../styles/theme. Replace with useTheme() from styled-components for dark/light mode support (matching search.tsx fix from prior session).

Use userProfile from real-time listener for the greeting (line ~80) instead of profile from one-shot read (this becomes automatic after Part A step 1).

Add fallback "golden order" — if Firestore config is empty or errored, render sections in a hardcoded sequence (matching web HomePageComposer.tsx:519-537).

Verification

Profile sync test: Change displayName on web → verify mobile greeting/profile tab updates within seconds (no re-login). Change on mobile → verify web header/profile updates within seconds.
Section admin test: Toggle section visibility on web SuperAdmin → verify it disappears on mobile home tab immediately. Reorder on mobile admin → verify order changes on web homepage.
Error boundary test: Temporarily throw in one section component → verify only that card shows error, not the whole page.
Advanced search test: Apply 10+ filters on mobile advanced search → verify Algolia query returns correct results, matching what web advanced search would return.
Run: cd mobile_new && npx expo start — verify no crashes on home tab, search tab, profile tab.
Run: cd web && npm run type-check — verify no TS errors in modified web files.
Decisions

Skip floating sections on mobile (sticky_search, ai_chatbot, draft_recovery): Mobile has its own native search bar and doesn't need a sticky overlay. AI chatbot and draft recovery can be future features.
Firestore onSnapshot for mobile profile (not polling): Matches web pattern, gives instant sync, minimal reads.
Mobile admin saves batch, then switches to per-toggle (step 10): Aligns with web behavior where each toggle saves immediately.
categories added to web defaults as hidden: Prevents key-not-found errors if admin toggles it; defaults to invisible on web since it's a mobile UX pattern.
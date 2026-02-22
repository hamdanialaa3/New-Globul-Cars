
Plan: Koli One Mobile — Full Rebuild to World-Class
TL;DR: The mobile app has 65 screens at ~72% average completion — solid foundation but riddled with hardcoded strings, broken data flows, stub pages, and missing features that prevent publishing. This plan transforms it into a polished, fully-synced, bilingual car marketplace app through 8 phases over ~40 implementation sessions. Each phase delivers independently testable value. The app goes from "prototype" to "App Store ready."

Phase 0: Critical Bug Fixes & Foundation (Sessions 1–3)
These are blocking bugs that must be fixed before any feature work.

Steps:

Fix Arabic text in Profile sign-out dialog — profile.tsx/profile.tsx) has "تسجيل الخروج" / "هل أنت متأكد؟" — replace with Bulgarian strings, then i18n keys
Fix ListingService.ts 3-collection bug — getListingsByIds(), updateListing(), deleteListing() only search ['passenger_cars', 'cars', 'suvs'] instead of all 7 VEHICLE_COLLECTIONS. Vans, motorcycles, trucks, buses are silently invisible
Fix Algolia index mismatch — Mobile defaults to cars_bg but Cloud Functions sync to cars. Verify env config in .env and align with algolia-search.service.ts
Expand ListingBase type — Add 25+ critical fields missing from ListingBase.ts: negotiable, financing, warranty, warrantyMonths, features[], safetyEquipment[], comfortEquipment[], accidentHistory, serviceHistory, isFeatured, isUrgent, hasVideo, videoUrl, views, favorites, expiresAt, driveType, co2Emissions, euroStandard, stories[], latitude, longitude. Update ListingNormalizer.ts
Fix VinCheckCard.tsx TS errors — Currently open file, ~20 TS errors from flat color refs (colors.success, colors.textSecondary, colors.surface) that don't match the nested theme structure. Map to correct paths (colors.status.success, colors.text.secondary, colors.background.paper)
Add deep link auth gating — Protected routes (/chat/*, /sell, /profile/edit) accessed via deep link should redirect unauthenticated users to login with return-to path
Verification: Zero TS errors in fixed files, all 7 collections return results, Algolia returns same data as web

Phase 1: Complete i18n Migration (Sessions 4–8)
Currently 80%+ of UI strings are hardcoded Bulgarian. This blocks English users entirely.

Steps:

Audit and catalog all hardcoded strings — Grep for Cyrillic characters in JSX across all 65 screens, create a master spreadsheet of ~2000+ strings grouped by namespace (home, search, sell, profile, auth, cars, common, errors, messages, ai, marketplace, dealer, legal)
Expand locale namespaces — Add 6 new namespace files to src/locales/bg/ and src/locales/en/: sell.ts, ai.ts, marketplace.ts, dealer.ts, legal.ts, search.ts
Migrate tab screens — Replace all hardcoded strings in the 5 tab files with t() calls. Priority: MobileDeHome.tsx (100+ strings), (tabs)/search.tsx/search.tsx) (40 strings), (tabs)/sell.tsx/sell.tsx) (30 strings), (tabs)/profile.tsx/profile.tsx) (80 strings), (tabs)/messages.tsx/messages.tsx) (~15 strings)
Migrate home sub-components — All 20+ home section components in src/components/home/ have hardcoded Bulgarian
Migrate sell wizard — WizardOrchestrator.tsx step titles, all 8 step components, SmartSellFlow.tsx
Migrate all remaining 50+ screens — auth, AI, marketplace, dealer, legal, profile sub-pages, discovery screens, social, stories
Migrate advanced-search labels — All filter labels ("Бензин", "Дизел", color names, body types) in advanced-search.tsx
Add in-app language switcher — Enhance settings.tsx language picker with visual flag icons, instant preview, and LanguageContext integration (already partially done)
Verification: Switch to English in settings → every screen shows English text. Switch back → Bulgarian. No mixed-language screens.

Phase 2: Messaging Overhaul (Sessions 9–12)
Currently 6/10. Must reach 9/10 for a marketplace app.

Steps:

Per-conversation unread indicators — Add bold text styling + unread dot on each ConversationItem in (tabs)/messages.tsx/messages.tsx), read state from RTDB user_channels/{uid}/{channelId}/unreadCount
Message search — Add search bar at top of messages list, query across channels collection for matching conversation titles/participant names
Swipe-to-delete conversations — Wrap each ConversationItem in Swipeable from react-native-gesture-handler, add archive/delete action with confirm
Typing indicators — Subscribe to RTDB typing/{channelId} path in chat/[id].tsx, show animated "..." bubble when other user is typing, write own typing state on input focus
Read receipts — Double-checkmark icons on sent messages, track readAt timestamp in RTDB messages/{channelId}/{messageId}
Message date grouping — Group messages by date ("Today", "Yesterday", "Feb 20") in chat view with sticky headers
Online status indicators — Subscribe to RTDB presence/{uid}, show green dot on conversation items and chat header for online users
Image/attachment sending — Allow photo attachments in chat via expo-image-picker, upload to Firebase Storage, display inline with tap-to-zoom
Quick reply templates — Pre-built response templates ("Is it still available?", "What's the best price?") accessible via button in chat input
Verification: Start chat from car detail → see typing indicator → send image → see read receipts → swipe to archive

Phase 3: Stub Pages → Full Native Implementation (Sessions 13–18)
Replace all WebView wrappers and half-built screens with native implementations.

Steps:

Blog — Native implementation — Replace WebView in blog/index.tsx with native FlatList of blog posts from Firestore blog_posts collection (or Cloud Function). Add blog/[slug].tsx with rich text rendering using react-native-render-html, image gallery, share button, reading time estimate
Marketplace Index — Native grid — Replace WebView in marketplace/index.tsx with native product grid (categories, search, filter chips, pull-to-refresh) reading from Firestore marketplace_products
Profile/Campaigns — Complete campaigns.tsx from 55% → 90%: campaign list with status cards (active/paused/ended), spend stats, create campaign flow (select listing → budget → duration → confirm)
Profile/Billing — Complete billing.tsx from 55% → 90%: invoice list from Firestore, payment history, current plan summary, payment method display
Profile/Subscription — Complete subscription.tsx from 55% → 90%: plan comparison cards (Free/Premium/Business), feature matrix, upgrade button → payment flow, current plan badge, renewal date
Profile/Consultations — Complete consultations.tsx from 50% → 85%: booking calendar, consultation types (valuation/inspection/financing), upcoming/past consultations, video call integration
Profile/Analytics — Complete analytics.tsx from 60% → 85%: views over time charts (using react-native-gifted-charts), top performing listings, audience demographics, message response rate
Profile/Dashboard — Complete dashboard.tsx from 65% → 90%: seller KPIs (total views, contacts, favorites this week), quick actions, performance comparison with average
Marketplace/Checkout — Complete checkout.tsx from 60% → 90%: address form, delivery options, order summary, payment method selection
Stories/Create — Complete stories/create.tsx from 60% → 85%: camera/gallery picker, text overlay editor, sticker selection, car tag linking, publish to stories collection
Social/Create Post — Complete social/create-post.tsx from 65% → 85%: rich text editor, image upload, car listing link, category selection, post preview
Verification: Every screen fully native, no WebView fallbacks. All screens fetch real Firestore data.

Phase 4: Payment System (Sessions 19–22)
Full in-app payment with Apple Pay, Google Pay, and credit cards.

Steps:

Install @stripe/stripe-react-native — Add to package.json, configure in _layout.tsx with StripeProvider wrapping the app
Create PaymentService.ts — New service in src/services/ handling: create payment intent (via Cloud Function createPaymentIntent), confirm payment, save payment method, list payment methods, handle refunds
Payment method management screen — New screen app/profile/payment-methods.tsx: add/remove cards, set default, Apple Pay / Google Pay setup
Subscription purchase flow — From subscription.tsx: select plan → Stripe PaymentSheet → confirm → update Firestore users/{uid}/subscription → show success
Listing promotion payment — From campaign creation: select boost tier → payment → activate campaign
Marketplace purchase flow — From checkout.tsx: cart summary → payment → order confirmation → notify seller
Cloud Function: createMobilePaymentIntent — New onCall function that creates Stripe PaymentIntent with metadata, returns client secret
Receipt/invoice generation — After payment, store in Firestore payments/{paymentId}, display in billing screen
Verification: End-to-end: Select Premium plan → Apple Pay sheet appears → payment succeeds → subscription active → billing shows invoice

Phase 5: UX Polish to World-Class (Sessions 23–28)
The details that separate good from great.

Steps:

Home screen skeletons — Replace ActivityIndicator in MobileDeHome.tsx with shimmer skeleton placeholders matching each section's layout (brand cards, category chips, listing cards, AI teaser)
Sell wizard stepper — Add visual step indicator (numbered dots/circles with connecting lines) to WizardOrchestrator.tsx, show estimated time remaining per step
VIN scanner in sell wizard — New step between BasicInfo and Technical: camera → scan VIN barcode → auto-fill make/model/year/specs from VIN database
Range sliders — Replace text inputs for price/year/mileage in advanced-search.tsx with dual-thumb @react-native-community/slider range pickers
Toast/Snackbar system — Create ToastProvider and useToast() hook, replace all Alert.alert() confirmations (favorites, saves, deletes) with non-blocking animated toasts
Swipe gestures on lists — Add swipe-to-favorite on car cards in search results, swipe-to-archive on notifications in notifications.tsx
Rate app prompt — Install expo-store-review, trigger after 5th listing view or 3rd favorite, with "Not now" / "Rate" / "Never ask again" flow, persisted to AsyncStorage
Force update / OTA — Integrate expo-updates, check for updates on app launch, show modal "New version available" with "Update now" button
Accessibility audit — Systematic pass adding accessibilityLabel, accessibilityRole, accessibilityHint to all interactive elements across all 65 screens
Infinite scroll shimmer — Replace ActivityIndicator footer in search/all-cars/social with appended skeleton cards during loadMore
Car detail video player — If hasVideo is true on listing, display native video player at top of gallery in car/[id].tsx
Guest profile state — Add explicit unauthenticated CTA on (tabs)/profile.tsx/profile.tsx): hero illustration + "Sign in to manage your listings" + buttons
Pull-to-refresh everywhere — Audit all list/scroll screens, ensure RefreshControl is present on every one
Verification: Lighthouse-style audit checklist: skeletons ✓, toasts ✓, swipe gestures ✓, accessibility labels ✓, range sliders ✓, OTA updates ✓

Phase 6: Web ↔ Mobile Data Sync (Sessions 29–33)
Ensure both platforms share the same data seamlessly.

Steps:

Cross-platform draft sync — Update DraftService.ts to read/write workflow_drafts + workflow_progress + workflow_images Firestore collections (same as web's sell-workflow-service.ts). User starts listing on web → opens mobile → sees draft with all data + images
Browsing history sync — Move PlatformSyncService.addToHistory() from AsyncStorage-only to Firestore users/{uid}/browsing_history subcollection. Web and mobile see same recently viewed cars
Stories integration — Create StoriesService.ts reading CarListing.stories[] fields and any stories subcollection. Display stories on home screen and car detail page natively
Trust score display — Read sellerTrustScore, isVerified, verificationLevel from user docs. Display trust badges on dealer cards, seller profiles, and car detail pages
Algolia replica sorting — Update algolia-search.service.ts to use Algolia replicas (cars_price_asc, cars_price_desc, cars_year_desc, cars_mileage_asc) for server-side sorting instead of client-side
Site settings sync — Read app_settings collection for dynamic feature flags, banner messages, maintenance mode — same as web's site-settings.service.ts
Shared type consolidation — Move ListingBase to shared/src/types/, add shared Zod validation schemas for sell workflow that both web and mobile import
Notification sync — Ensure push notification tokens from mobile are stored in same format as web (users/{uid}/fcmTokens[]), Cloud Functions send to all tokens
Verification: Create listing on web → see draft on mobile → complete on mobile. Browse car on mobile → see in "recently viewed" on web.

Phase 7: Simple Admin Dashboard (Sessions 34–36)
Read-only mobile admin for quick monitoring.

Steps:

Admin tab detection — In (tabs)/_layout.tsx/_layout.tsx), check users/{uid}/role for admin/superAdmin. If admin, show 6th tab "Admin" with shield icon
Admin home screen — New app/admin/index.tsx: today's KPIs (new users, new listings, total revenue, active users), alerts (reported listings, pending verifications), quick stats cards
Pending reviews screen — New app/admin/pending.tsx: list of listings awaiting approval, approve/reject with swipe, view listing detail
Reported content screen — New app/admin/reports.tsx: list from reports collection, view report details, take action (warn/ban user, remove listing)
Push notification composer — New app/admin/notifications.tsx: send push notification to all users / segment, preview before send, call sendPushNotification Cloud Function
Quick stats charts — Revenue over 7 days, signups over 30 days, listings by category pie chart using react-native-gifted-charts
Verification: Login as admin → see Admin tab → view today's stats → approve a pending listing → send test push notification

Phase 8: Final Polish & Store Prep (Sessions 37–40)
Steps:

App icon and splash screen — Design system-consistent app icon (Koli One branding), animated splash screen using expo-splash-screen
Performance audit — Profile each screen with React DevTools, optimize re-renders with React.memo, useCallback, useMemo where missing
Bundle size optimization — Tree-shake unused imports, lazy-load heavy screens (AI, marketplace, admin) with React.lazy + Suspense
Error boundary on every stack screen — Ensure crash recovery with "Something went wrong" + retry button on all routes
App Store metadata — Screenshots (6 screens × 2 devices), description in Bulgarian + English, keywords, categories, privacy policy URL
TestFlight / Internal testing — Configure eas.json for internal distribution, build iOS + Android, test on real devices
Analytics events audit — Ensure every key user action fires an analytics event: view_listing, contact_seller, save_favorite, start_sell, complete_sell, make_payment, search
Crash-free rate target — Review Sentry dashboard, fix top 10 crash patterns
Verification: App submitted to TestFlight, 99.5%+ crash-free rate, all screens load in <2s on mid-range device

Decisions
Parallel approach chosen: Bug fixes + new features interleave; each phase delivers independently
Full in-app payment (Apple Pay + Google Pay + Stripe): Over WebView redirect — better UX, higher conversion
Simple mobile admin: Stats + approvals only, no full CRUD — keeps scope manageable
Full bilingual (BG + EN): ~2000+ strings to migrate — high effort but essential for market reach
Phase 0 first: Critical bugs block all other work; VinCheckCard TS errors, ListingService 3-collection bug, and Arabic text must be fixed immediately
Messaging before features: Users interact with messaging daily; improving it from 6/10 to 9/10 has the highest retention impact
Estimated Effort by Phase
Phase	Sessions	Impact
0: Bug Fixes	3	Unblocks everything
1: i18n	5	Opens English market
2: Messaging	4	Retention +++
3: Stub → Native	6	Feature completion
4: Payments	4	Revenue enablement
5: UX Polish	6	App Store quality
6: Data Sync	5	Cross-platform parity
7: Admin	3	Business operations
8: Store Prep	4	Launch readiness
Total	40 sessions	72% → 95%+
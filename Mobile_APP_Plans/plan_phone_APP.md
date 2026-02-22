Plan: Koli One Mobile — Production Readiness (الخطة الشاملة)
TL;DR
التطبيق المحمول يملك بنية ممتازة (84 شاشة، خدمات متكاملة مع Firebase) لكنه يحتاج عملًا في 6 محاور رئيسية ليكون 100% جاهزًا للإنتاج: (1) تفعيل تسجيل الدخول بالشبكات الاجتماعية، (2) صقل تجربة المستخدم والواجهة، (3) إكمال التكاملات (Analytics, AdMob, Deep Links)، (4) تصحيح إعدادات EAS للنشر على المتاجر، (5) ضمان الأمان والاستقرار، (6) تحسين الأداء والـ Offline. المرجع الأساسي هو الويب الذي يعمل بالكامل الآن.

Phase 1: Authentication — Make Every Button Work (الأولوية القصوى)
1.1 Wire up Google Sign-In in login.tsx/login.tsx). The SDK is already installed and GoogleSignin.configure() is called at line 45 but never used. Replace the placeholder Alert.alert (≈line 380) with real logic: GoogleSignin.hasPlayServices() → GoogleSignin.signIn() → extract idToken → create GoogleAuthProvider.credential(idToken) → signInWithCredential(auth, credential) → navigate to /(tabs). Mirror the web's createUserFromSocialLogin() pattern from auth-service.ts to auto-create a BulgarianUser profile with numeric ID. Verify the webClientId 973379297533-auto in Google Cloud Console — the -auto suffix looks like a placeholder.

1.2 Install expo-apple-authentication and implement Apple Sign-In. Replace the placeholder alert with the native Apple auth flow: AppleAuthentication.signInAsync() → create OAuthProvider('apple.com').credential(identityToken, nonce) → signInWithCredential. Apple requires this for App Store approval since the app already offers social login.

1.3 Decide on Facebook Sign-In: either install react-native-fbsdk-next and wire it up (web has it via social-auth-service.ts), or remove the Facebook button entirely from the login screen. A "coming soon" button in production is unacceptable.

1.4 Upgrade the Register screen register.tsx/register.tsx) to optionally collect a phone number — the web creates more complete profiles. After registration, auto-redirect to email verification email-verification.tsx/email-verification.tsx) instead of going straight to /(tabs).

1.5 Enhance Guest Login to match web's persistent guest identity pattern (web uses SocialAuthService.signInAnonymously() which stores guest UID in localStorage and restores it via Cloud Function custom tokens). On mobile, store the anonymous UID in expo-secure-store and restore it on return — prevents losing saved favorites/settings.

1.6 Extract all auth logic from login.tsx into a dedicated src/services/AuthService.ts (matching web's BulgarianAuthService pattern). This keeps the login screen clean and enables reuse of signInWithGoogle(), signInWithApple(), etc. from any screen.

Phase 2: UI/UX Polish — First Impressions Matter
2.1 Splash Screen & App Icon — Design a branded splash screen using expo-splash-screen. The current splash is the default Expo one. Create a professional icon set matching the Koli One brand (dark theme, car silhouette or "K1" monogram).

2.2 Onboarding Refinement — The 3-step wizard is good but can be improved:

Add smooth page-transition animations (use react-native-reanimated shared transitions)
Add a "Skip" button on every step (not just step 3)
Store onboarding selections in Firestore (not just AsyncStorage) so they sync across devices
Use the collected preferences (intent, vehicleType, city) to personalize the home screen immediately
2.3 Home Screen Enhancements (MobileDeHome.tsx):

Add animated section entrances (fade-in + slide-up as user scrolls using Animated.FlatList or react-native-reanimated layout animations)
Make the Hero section a carousel (rotate 3-4 promotional banners with auto-play)
Add a "Welcome back, {name}" personalized greeting when user is authenticated
Show real-time stats (total listings count is already fetched — display it prominently)
Add skeleton loading for each section while data loads (the SkeletonListingCard component already exists)
2.4 Tab Bar Enhancement — The CustomTabBar should have:

Haptic feedback on tab press (use expo-haptics which is already installed)
Animated indicator/dot under active tab
The Sell tab (center) should be visually prominent — larger icon or floating action button style
Badge animation (pulse/bounce) for unread messages
2.5 Login Screen Glassmorphism — Already has a glass effect; enhance with:

Animated background gradient (subtle slow color shift)
Staggered button entrance animations
Social buttons in a clear horizontal row with proper spacing (Google | Apple | Facebook or just Google | Apple)
Remove any "coming soon" message — buttons either work or don't exist
2.6 Car Detail Screen (car/[id].tsx):

Add image pinch-to-zoom in the gallery (use react-native-gesture-handler PinchGestureHandler or expo-image zoom)
Add a sticky bottom price bar that stays visible as user scrolls (price + action buttons)
Add share sheet integration with car image + deep link
Add "Similar to this" section with horizontal scroll cards
2.7 Search Experience — Improve with:

Recent searches displayed when search field is focused
Voice search button (use expo-speech for text-to-speech or just the native keyboard's voice input)
Filter chips shown below search bar for quick removal of active filters
Map toggle button to switch between list and map view
2.8 Empty States — Create beautiful, branded empty states for:

No search results (suggest broadening filters)
No messages (encourage contacting sellers)
No favorites (show trending cars)
No notifications (explain what notifications they'll get)
2.9 Pull-to-Refresh — Add react-native-lottie custom animation for pull-to-refresh on all list screens (home, search, messages, favorites).

2.10 Dark/Light Mode Toggle — The app defaults to dark. Add a 3-way toggle in Settings: System | Dark | Light. Store in AsyncStorage and respect useColorScheme().

Phase 3: Complete Feature Integration
3.1 Firebase Analytics — Currently disabled due to 403. Fix by:

Enabling the Analytics API in Google Cloud Console for fire-new-globul
Updating the app's domain/bundle in Firebase Console → Analytics settings
Re-enabling the code in AnalyticsService.ts
Add screen tracking (logScreenView) on every route change in _layout.tsx
3.2 Deep Links / Universal Links:

Configure kolione:// scheme for app-to-app links (already in app.config.ts)
Add Associated Domains for iOS (applinks:koli.one) and App Links for Android (/.well-known/assetlinks.json on koli.one)
Handle incoming links in _layout.tsx: koli.one/car/{id} → app/car/{id}, koli.one/profile/{id} → app/profile/{id}
Generate shareable links from car detail and profile screens
3.3 Push Notifications Enhancement:

The token registration (NotificationService) works. Add rich categories:
New message → deep link to /chat/{id}
Price drop alert → deep link to /car/{id}
Listing sold → deep link to /profile/my-ads
New follower → deep link to /profile/{id}
Add notification preferences screen (toggle per category)
Implement foreground notification handling with in-app banner (not just background)
3.4 Biometric Authentication:

expo-local-authentication is already installed but unused
Add biometric lock option in Settings: Face ID / Fingerprint to unlock app
Quick-reauth for sensitive actions (edit listing price, delete account)
3.5 AdMob Integration:

Plugin is configured with test IDs. For production:
Create real ad units in AdMob dashboard
Add a banner ad at bottom of search results
Add an interstitial ad after viewing 5 car details (non-intrusive frequency cap)
Add a rewarded ad for premium features (e.g., "Watch ad to see full VIN report")
Gate behind feature flag so it can be enabled/disabled remotely
3.6 Offline Mode:

Firestore persistentLocalCache() is already enabled — good
Add a visible offline banner using useNetworkStatus() hook (already exists)
Cache the last 20 viewed car listings in AsyncStorage for offline viewing
Queue pending messages for retry when back online
Show cached home screen data when offline
3.7 Marketplace — Native Implementation:

Currently loads web in WebView. Replace with native screens:
Product list with grid/list toggle
Product detail with image gallery
Cart with quantity management
Checkout with payment info
Order confirmation
Data from Firestore marketplace_products collection (already has rules)
3.8 Blog — Native Implementation (or improved WebView):

Minimum: Add pull-to-refresh and proper loading indicator in WebView
Ideal: Fetch blog posts from Firestore or CMS and render natively with react-native-render-html
Phase 4: Store Deployment Configuration
4.1 EAS Submit — Fix Placeholders in eas.json:

Replace REPLACE_WITH_APPLE_ID with real Apple ID
Replace REPLACE_WITH_ASC_APP_ID with App Store Connect app ID
Replace REPLACE_WITH_TEAM_ID with Apple Developer Team ID
4.2 Create .env.production:

Firebase production config (all EXPO_PUBLIC_* vars)
Real Google OAuth webClientId
Real AdMob unit IDs
Sentry DSN
Algolia App ID & Search Key
4.3 App Store Metadata:

Prepare screenshots (6.7" iPhone, 6.5" iPhone, 12.9" iPad, Android phone, Android tablet)
Write app description in Bulgarian and English
Set proper keywords, categories (Automotive, Shopping)
Age rating, privacy policy URL (koli.one/privacy-policy)
4.4 Privacy & Compliance:

The tracking transparency plugin is already configured
Add ATT prompt in _layout.tsx on first launch (iOS 14.5+)
Configure App Privacy in App Store Connect (data types collected, purpose)
GDPR: Data deletion screen exists — link it from Settings AND App Store metadata
4.5 Android Play Store:

Generate signed AAB via eas build --platform android --profile production
Configure Play Store listing, screenshots, privacy policy
Set up internal testing track first, then promote to production
Phase 5: Security & Stability
5.1 Sensitive Data:

Verify expo-secure-store is used for auth tokens (already configured in firebase.ts)
Never log passwords or tokens (audit all logger.* calls)
Remove any hardcoded credentials (Firebase config fallback to fire-new-globul is fine for public config)
5.2 Error Boundaries:

Root ErrorBoundary exists — add per-screen error boundaries for critical flows (car detail, sell wizard, messaging)
Add a "Report" button in error UI that sends the error to Sentry with user context
5.3 Sentry Configuration:

Create EXPO_PUBLIC_SENTRY_DSN in .env.production
Add breadcrumbs for navigation events
Add user context (numeric ID, not Firebase UID) on auth change
Configure release tracking to match EAS build versions
5.4 Rate Limiting:

Add client-side rate limiting for Firestore writes (prevent accidental duplicate listings, messages)
Implement debounce on search input (likely already done in Algolia service)
5.5 Input Validation:

Add zod schemas (v4 is installed) for all form inputs: registration, sell wizard, contact forms
Sanitize user-generated content before Firestore writes
Phase 6: Performance Optimization
6.1 Image Optimization:

Use expo-image (already installed) with cachePolicy: 'memory-disk' everywhere
Add progressive loading (blur placeholder → full image)
Use Firebase Storage's _200x200 thumbnail URLs for list views, full URLs for detail view
6.2 List Virtualization:

Ensure all FlatList components have getItemLayout for fixed-height items
Add windowSize and maxToRenderPerBatch tuning on search results
Use FlashList from @shopify/flash-list as drop-in replacement for heavy lists (search, social)
6.3 Bundle Size:

Audit unused dependencies (npx expo-doctor)
Ensure tree-shaking for Firebase (firebase/auth, firebase/firestore — already done)
Lazy-load heavy screens (AI advisor, Map search, Visual search) using React.lazy or Expo Router's lazy: true
6.4 Startup Time:

Move heavy initializations (Sentry, notifications, analytics) to InteractionManager.runAfterInteractions
Defer non-critical Firebase queries on home screen (stats, recommendations) until after first paint
Phase 7: Quality Assurance
7.1 Test on Real Devices:

iOS: iPhone 14/15/16 (different screen sizes)
Android: Samsung Galaxy S, Pixel (different RAM/GPU profiles)
Test RTL layout for Arabic users (future)
7.2 Accessibility:

Add accessibilityLabel to all interactive elements
Test with VoiceOver (iOS) and TalkBack (Android)
Ensure minimum touch target 44×44pt
7.3 E2E Testing:

Set up Maestro or Detox for critical flows: Login → Search → View Car → Message Seller → Sell Car
Verification
After implementation, verify with:

Auth: Sign in with Google, Apple, email, phone, guest — all should create user profile with numeric ID
Navigation: Every tab, every nested screen, back button, deep links
Data: Car listings load, search returns results, messages send/receive in real-time
Offline: Airplane mode → cached data visible, reconnect → syncs
Build: eas build --platform all --profile production succeeds
Submit: eas submit --platform all succeeds (after EAS config fixed)
Decisions
Facebook Login: Remove button entirely rather than install another SDK — Google + Apple + Phone + Email covers 99% of users. Facebook SDK adds ~5MB and maintenance burden.
Marketplace/Blog: Keep as WebView for v1.0 launch with enhanced loading UX; native implementation in v1.1.
Theme: Default to dark mode (current), add light mode as secondary option.
Priority Order: Phase 1 (Auth) → Phase 2 (UI) → Phase 4 (Store Config) → Phase 5 (Security) → Phase 3 (Features) → Phase 6 (Performance) → Phase 7 (QA).
Onboarding: Simplify to 2 steps (Intent + Vehicle Type) — city selection should move to profile settings to reduce friction.

---------------------------------------------------------------------------
انسخ تجربة البروفايل و تفاصيله من الويب , الى تطبيق الموبايل بالكامل 
http://localhost:3000/profile/169
http://localhost:3000/profile/169/my-ads
http://localhost:3000/profile/169/campaigns
http://localhost:3000/profile/169/analytics
http://localhost:3000/profile/169/settings
http://localhost:3000/profile/169/consultations
http://localhost:3000/profile/169/following
http://localhost:3000/profile/169/favorites
يعني كل التفاصيل هذه بكل الازرار و التحكمات والتفاصيل نفسها الموجوده في الويب انقلها الى تطبيق الموبايل :
C:\Users\hamda\Desktop\Koli_One_Root\mobile_new

لكن بعناية و عمق و احترافية عالية 

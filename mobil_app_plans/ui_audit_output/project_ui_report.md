# Project UI Report

## 1 Project Type and Framework
- Detected: Expo React Native with expo-router
- Confidence: high
- Main entry: expo-router/entry
- Key UI stack: react-native 0.81.5, expo-router, styled-components/native, @react-navigation/native

## 2 Screens Found
- Total screens detected in app/: 88
- Navigation roots: mobile_new/app/_layout.tsx, mobile_new/app/(tabs)/_layout.tsx
- Example screens:
- mobile_new/app/(auth)/email-verification.tsx
- mobile_new/app/(auth)/forgot-password.tsx
- mobile_new/app/(auth)/login.tsx
- mobile_new/app/(auth)/phone-login.tsx
- mobile_new/app/(auth)/register.tsx
- mobile_new/app/(tabs)/index.tsx
- mobile_new/app/(tabs)/messages.tsx
- mobile_new/app/(tabs)/profile.tsx
- mobile_new/app/(tabs)/search.tsx
- mobile_new/app/(tabs)/sell.tsx
- mobile_new/app/+html.tsx
- mobile_new/app/+not-found.tsx
- mobile_new/app/about.tsx
- mobile_new/app/admin/index.tsx
- mobile_new/app/admin/listings.tsx
- mobile_new/app/admin/users.tsx
- mobile_new/app/advanced-search.tsx
- mobile_new/app/ai/advisor.tsx
- mobile_new/app/ai/analysis.tsx
- mobile_new/app/ai/history.tsx
- mobile_new/app/ai/valuation.tsx
- mobile_new/app/all-cars.tsx
- mobile_new/app/ar-garage.tsx
- mobile_new/app/auctions.tsx
- mobile_new/app/blog/index.tsx
- mobile_new/app/blog/[slug].tsx
- mobile_new/app/brand-gallery.tsx
- mobile_new/app/car/[id]/history.tsx
- mobile_new/app/car/[id].tsx
- mobile_new/app/chat/[id].tsx
- mobile_new/app/compare.tsx
- mobile_new/app/contact.tsx
- mobile_new/app/data-deletion.tsx
- mobile_new/app/dealer/register.tsx
- mobile_new/app/dealer/[slug].tsx

## 3 UI Components
- Total component files: 136
- Primary reusable components (sample):
- mobile_new/src/components/ui/AnimatedButton.tsx
- mobile_new/src/components/ui/AnimatedImage.tsx
- mobile_new/src/components/ui/Avatar.tsx
- mobile_new/src/components/ui/Badge.tsx
- mobile_new/src/components/ui/Chip.tsx
- mobile_new/src/components/ui/Divider.tsx
- mobile_new/src/components/ui/GlassButton.tsx
- mobile_new/src/components/ui/GlassCard.tsx
- mobile_new/src/components/ui/index.ts
- mobile_new/src/components/ui/InputField.tsx
- mobile_new/src/components/ui/OptimizedImage.tsx
- mobile_new/src/components/ui/Skeleton.tsx
- mobile_new/src/components/ui/Spacer.tsx
- mobile_new/src/components/ui/Toast.tsx
- mobile_new/src/components/ui/UnifiedButton.tsx
- mobile_new/src/components/ui/UnifiedCard.tsx

## 4 Design Tokens
- Token files:
- mobile_new/src/styles/DesignTokens.ts
- mobile_new/src/styles/theme.ts
- Notes:
  - DesignTokens.ts uses numeric mobile-first spacing/radius/typography scales.
  - theme.ts still contains string px spacing values and should be normalized for consistency.

## 5 Assets Inventory
- Images/icons: 32
- Fonts: 1
- Sample assets:
- mobile_new/android/app/src/main/res/drawable-hdpi/notification_icon.png
- mobile_new/android/app/src/main/res/drawable-hdpi/splashscreen_logo.png
- mobile_new/android/app/src/main/res/drawable-mdpi/notification_icon.png
- mobile_new/android/app/src/main/res/drawable-mdpi/splashscreen_logo.png
- mobile_new/android/app/src/main/res/drawable-xhdpi/notification_icon.png
- mobile_new/android/app/src/main/res/drawable-xhdpi/splashscreen_logo.png
- mobile_new/android/app/src/main/res/drawable-xxhdpi/notification_icon.png
- mobile_new/android/app/src/main/res/drawable-xxhdpi/splashscreen_logo.png
- mobile_new/android/app/src/main/res/drawable-xxxhdpi/notification_icon.png
- mobile_new/android/app/src/main/res/drawable-xxxhdpi/splashscreen_logo.png
- mobile_new/android/app/src/main/res/mipmap-hdpi/ic_launcher.webp
- mobile_new/android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.webp
- mobile_new/android/app/src/main/res/mipmap-hdpi/ic_launcher_round.webp
- mobile_new/android/app/src/main/res/mipmap-mdpi/ic_launcher.webp
- mobile_new/android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.webp
- mobile_new/android/app/src/main/res/mipmap-mdpi/ic_launcher_round.webp
- mobile_new/android/app/src/main/res/mipmap-xhdpi/ic_launcher.webp
- mobile_new/android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.webp
- mobile_new/android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.webp
- mobile_new/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.webp

## 6 API Endpoints and Data Sources
- Service files scanned: 37
- Endpoint/sdk hits found: 124
- Sample endpoints/calls:
- sdk-call (mobile_new/src/services/ai/ai.service.ts:2)
- sdk-call (mobile_new/src/services/ai/ai.service.ts:3)
- sdk-call (mobile_new/src/services/AnalyticsService.ts:1)
- sdk-call (mobile_new/src/services/AnalyticsService.ts:2)
- sdk-call (mobile_new/src/services/AnalyticsService.ts:16)
- https://via.placeholder.com/400x300?text=No+Image (mobile_new/src/services/api/homeStrips.ts:15)
- sdk-call (mobile_new/src/services/AuthService.ts:24)
- sdk-call (mobile_new/src/services/AuthService.ts:25)
- sdk-call (mobile_new/src/services/AuthService.ts:200)
- sdk-call (mobile_new/src/services/AuthService.ts:417)
- sdk-call (mobile_new/src/services/AuthService.ts:418)
- sdk-call (mobile_new/src/services/AuthService.ts:526)
- sdk-call (mobile_new/src/services/AuthService.ts:572)
- sdk-call (mobile_new/src/services/car/unified-car-queries.ts:12)
- sdk-call (mobile_new/src/services/car/unified-car-queries.ts:13)
- sdk-call (mobile_new/src/services/car/unified-car-types.ts:1)
- sdk-call (mobile_new/src/services/DraftService.ts:14)
- sdk-call (mobile_new/src/services/DraftService.ts:15)
- sdk-call (mobile_new/src/services/featureFlags.ts:12)
- sdk-call (mobile_new/src/services/featureFlags.ts:13)
- sdk-call (mobile_new/src/services/firebase.ts:1)
- sdk-call (mobile_new/src/services/firebase.ts:2)
- sdk-call (mobile_new/src/services/firebase.ts:3)
- sdk-call (mobile_new/src/services/firebase.ts:4)
- sdk-call (mobile_new/src/services/firebase.ts:5)

## 7 Navigation Structure
- Root: Stack-based in app/_layout.tsx with many feature routes (car, chat, profile, ai, marketplace, dealer, blog, legal).
- Primary mobile IA: Bottom Tabs in app/(tabs)/_layout.tsx
  - index
  - search
  - sell (auth-guarded)
  - profile
  - messages (auth-guarded with unread badge)

## 8 UX Anti-patterns / Risks
- Very large route surface in root stack can dilute IA and increase perceived complexity.
- Mixed token systems (DesignTokens numeric vs theme px strings) risks visual inconsistency.
- Home and discovery areas use many data cards; without strict hierarchy they can feel noisy.

## 9 Accessibility Flags
- Need systematic audit for touch targets >= 44dp across custom components.
- Contrast should be measured across gradient overlays and tertiary text.
- Need explicit accessibility labels on icon-only controls in shared UI components.

## 10 Performance Flags
- Large image-heavy UI requires aggressive thumbnail sizing and caching policy.
- Route and component count suggests bundle-splitting/lazy boundaries should be reviewed.
- Multiple animated surfaces should use consistent reduced-motion handling.

## 11 Immediate Modernization Quick Wins
1. Rebuild visual hierarchy on Home: hero search + editorial cards + larger car visuals with skeleton loading.
2. Unify component styles by enforcing one token source (DesignTokens.ts) and removing mixed px-string spacing in theme.ts.
3. Introduce premium motion system (page transitions, card reveal, CTA emphasis) with strict accessibility-safe durations.

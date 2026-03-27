# UI Redesign Brief

## 1 Target Users and Scenarios
- Car buyers in Bulgaria browsing listings quickly on mobile.
- Individual and dealer sellers creating and managing listings.
- Users comparing cars, messaging sellers, and checking finance options.

## 2 Design Goals and Success Metrics
- Premium visual identity comparable to top automotive marketplaces.
- Faster browsing comprehension and stronger visual trust.
- Metrics: higher listing-detail CTR, lower bounce from home/search, increased message starts.

## 3 Visual Direction
- Mood keywords: automotive editorial, premium clarity, dark-luxury contrast, confident motion, structured density.
- Palette options:
  - #0B0E14 #121822 #2563EB #00E5FF #FFFFFF #B0BEC5
  - #0A0D12 #1A237E #3949AB #FFD600 #FFFFFF #78909C

## 4 Typography
- Recommended families: Manrope, Plus Jakarta Sans, Sora (fallback to system for perf).
- Scale: 12/14/16 body; 20/24 section heads; 32+ hero headline only.

## 5 Component Library
- Core: AppHeader, SearchBar, CarCard (3 variants), PriceBadge, SellerPill, FilterChip, StickyActionBar.
- States: loading skeleton, empty, error retry, success, disabled, pressed, focus-visible.

## 6 High-level Screen Flows
- Home -> Search Results -> Car Detail -> Message Seller
- Sell Wizard -> Media Upload -> Review -> Publish
- Profile -> My Ads -> Analytics -> Subscription

## 7 Prioritized Implementation Plan
1) Token unification and layout primitives (1 week).
2) Home/Search/Detail visual overhaul (2 weeks).
3) Sell flow + profile dashboard consistency pass (1.5 weeks).
4) Motion/accessibility/performance polish (1 week).

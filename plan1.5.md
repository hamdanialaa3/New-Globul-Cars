Plan: World-Class Frontend Overhaul — Koli One
TL;DR: The current frontend has impressive breadth (~130 web routes, ~80 mobile screens, AI features) but suffers from visual fragmentation — 4 competing color systems, 2 card designs on the same page, 6 fonts loaded but used inconsistently, no hero headline, and accessibility at 3/10. This plan consolidates the design language into a world-class system inspired by AutoScout24 (🇩🇪 clean German engineering), Carvana (🇺🇸 trust-building hero UX), CarGurus (🇺🇸 data-driven pricing visualization), and Cazoo (🇬🇧 premium minimalism).

Current State (Discovery Findings)
Metric Web Mobile
Pages/Screens ~130 routes ~80 screens
Complete 90% 99%
Design System 5 conflicting systems Clean single theme
Cards 2 different designs on homepage 1 unified CarCard
Fonts loaded 6 (use 1-2) 2 (consistent)
Colors #003366 vs #FF7900 vs #F3622D vs CSS vars — all "primary" #E65000 unified
Dark mode CSS vars + styled-components mix Clean context-based
Accessibility No h1, no ARIA, no skip-nav Basic
Phase 1: Design Foundation — "One Source of Truth"
Goal: Eliminate the 4 competing token systems. Establish ONE canonical design language.

Steps:

Consolidate color palette — merge bulgarianColors (theme.ts), colors (design-system.ts), and CSS vars (unified-theme.css) into a single system. Recommended palette — inspired by AutoScout24 + Bulgarian identity:

Primary: #E65100 (warm automotive orange — matches mobile)
Secondary: #1A237E (deep indigo — European premium)
Background Light: #FAFBFC / Dark: #0B0E14
Cards Light: #FFFFFF / Dark: rgba(22, 28, 40, 0.85)
Success: #00C853, Warning: #FFD600, Error: #FF1744
Remove purple LED glow (rgba(168,85,247,...)) — replace with subtle orange/indigo accent
Unify typography — choose ONE primary font:

Recommended: Inter (body) + Exo 2 (headings only) — drop Martica, Kalam, Caveat, Dancing Script, Playfair Display from index.html
Update theme.ts, design-system.ts, typography.ts to reference the same stack
Save ~200KB of font downloads
Standardize spacing + border-radius — adopt the design-system.ts pixel scale as canonical, remove theme.ts rem scale:

Spacing: 4/8/12/16/20/24/32/40px
Border radius: 4 (buttons) / 8 (inputs) / 12 (cards) / 16 (modals) / 9999 (pills)
Standardize breakpoints — adopt design-system.ts values (375/414/768/1024/1280/1920), deprecate theme.ts breakpoints

Relevant files:

theme.ts — rewrite bulgarianColors, spacing, breakpoints
design-system.ts — becomes THE source of truth
unified-theme.css — sync CSS variables with design-system.ts values
typography.ts — align with Inter + Exo 2
index.html — remove unused Google Font imports
Verification: Visual regression screenshots before/after on 5 key pages (home, cars, sell, car detail, login)

Phase 2: Homepage — "First 5 Seconds"
Goal: Make the first impression world-class. Inspired by Carvana's emotional hero + AutoScout24's clean search-first approach.

Steps:

Hero rewrite — currently just a search widget on an AI-generated image with no headline:

Add <h1> with Bulgarian tagline: "Най-умният начин да купиш или продадеш кола в България" (The smartest way to buy or sell a car in Bulgaria)
English subtitle below for international visitors
Replace Gemini_Generated_Image_y67jfey67jfey67j.png with a professional hero photograph (Bulgarian city + premium car, or cinematic video loop like Cazoo)
Remove background-attachment: fixed (iOS Safari bug)
Add a subtle entrance animation (fade-up for text, slide-in for search widget)
Unify car cards — replace FeaturedShowcase's inline 220px Card with the same PremiumHomeCarCard (or a simplified version). ONE card design across the entire homepage.

Reduce homepage sections — currently 17+ sections create scroll fatigue. Inspired by AutoScout24 (5-6 sections):

Keep: Hero, Our Cars (6-8 cards), Popular Brands, AI Feature Banner, Trust Stats, Dealers Spotlight
Merge: "Smart Recommendations" + "Featured Showcase" → one "Recommended for You" section
Move to separate pages: Life Moments, Vehicle Classifications, Social Feed, Loyalty Banner
Remove: VisualSearchTeaser (over-animated, move to a dedicated page)
Section spacing — consistent 64px between desktop sections, 40px mobile. Remove per-section custom padding.

"Why Koli One" trust strip — add a 4-icon horizontal strip below the hero (inspired by CarGurus):

🔍 AI Analysis — "Let AI inspect your car"
💰 Free Valuation — "Know the real price"
🛡️ TrustShield — "Verified sellers only"
📱 One Platform — "Buy, sell, finance"
Relevant files:

HomePageComposer.tsx — reduce sections
UnifiedHeroSection.tsx — complete rewrite
FeaturedShowcase.tsx — unify cards
PremiumHomeCarCard.tsx — simplify for homepage use
Phase 3: Car Listing & Detail Pages — "The Money Pages"
Goal: These are the pages where users decide to buy. Make them conversion-optimized like CarGurus (data-rich) + Carvana (trust-building).

Steps:

Car Card redesign — current PremiumHomeCarCard has 3D tilt + sound on hover (impressive but gimmicky). Create a professional UnifiedCarCard:

Clean white card (light mode) / frosted glass (dark mode)
Large image with overlay badge: "Great Price" / "Fair Price" / "Above Market" (CarGurus-inspired)
Key specs row: year • km • fuel • transmission (icons)
Price prominent at bottom-right with monthly estimate
Subtle hover: elevation increase + image zoom, NO 3D tilt, NO sound
Favorite + Compare as icon overlays on image corner
Verified seller badge
Car Detail page enhancements (src/pages/01_main-pages/car-details/):

Price analysis widget (CarGurus-style): pie chart or gauge showing where this car's price falls vs market average
Image gallery with mobile swipe, thumbnail strip, fullscreen mode
Specification grid — 2-column clean grid with icons (not just text lists)
"Contact Seller" sticky bar — fixed bottom bar on mobile with Call + Message + WhatsApp buttons
Similar cars carousel at bottom
Search/Browse results page (src/pages/01_main-pages/cars/CarsPage.tsx):

Left sidebar filters on desktop (AutoScout24 style) — currently all filters seem inline
Grid/List toggle with proper list view (image-left, details-right)
Sort by: Price, Mileage, Year, Recently Added (prominent dropdown)
Results count + active filter chips at top
Save search button prominent
Relevant files:

CarCard — all card variants
src/pages/01_main-pages/car-details/ — detail page
src/pages/01_main-pages/cars/CarsPage.tsx — search results
05_search-browse — all search pages
Phase 4: Navigation & Layout — "Wayfinding"
Goal: Clean, professional navigation like AutoScout24. Current header has a "gamer" aesthetic with purple LED.

Steps:

Header redesign (UnifiedHeader.tsx):

Remove purple LED box-shadow
Clean white background (light) / dark glass (dark mode) — no excessive blur
Logo left, main nav center (Buy, Sell, AI Tools, Financing, Blog), user actions right
Mega-menu dropdown for "Buy" showing categories (SUV, Sedan, Electric, etc.)
Sticky with hide-on-scroll-down, show-on-scroll-up
Mobile bottom navigation — current 5-tab system is solid. Enhance:

Add haptic feedback on tab change
Floating "+" sell button (center, elevated) like many marketplace apps
Active tab indicator animation (sliding underline)
Breadcrumbs — add on car detail, search results, dealer pages for SEO and navigation

Footer cleanup:

Move from CSS file to styled-components for consistency
Update hardcoded stats ("15,000+ cars") to live Firestore counters or remove
Organized 4-column layout: About, Browse, Resources, Legal
Phase 5: Animations & Micro-interactions — "Polish"
Goal: Replace chaotic animations with purposeful, elegant motion. Inspired by Stripe and Linear.

Steps:

Reduce animation count — current VisualSearchTeaser has 4 concurrent animations. Rule: max 1 animation per viewport section.

Scroll-triggered entrances — replace hardcoded animations with IntersectionObserver-triggered fade-ups. Already have <LazySection> — extend it with entrance animation.

Hover states standardization — consistent translateY(-4px) + box-shadow increase for all interactive cards. No 3D tilt on homepage.

Loading states — standardize skeleton loaders:

Card skeleton: image placeholder (16:9) + 3 text lines + price bar
Page skeleton: header + 3 card skeletons
Use matching border-radius from Phase 1
prefers-reduced-motion — wrap ALL keyframe animations in @media (prefers-reduced-motion: no-preference). Currently zero checks.

Remove soundService.playHover() from homepage cards — sound should be opt-in, not default.

Relevant files:

animations.ts — add reduced-motion wrappers
PremiumHomeCarCard.tsx — remove sound, simplify hover
VisualSearchTeaser.tsx — reduce to 1 animation
Phase 6: Accessibility — "Everyone Shops for Cars"
Goal: From 3/10 to 8/10. WCAG 2.1 AA compliance.

Steps:

<h1> on every page — currently missing on homepage (critical SEO + a11y)
Skip-to-content link — add hidden link at top of MainLayout
ARIA patterns — SearchWidget tabs need role="tablist" / role="tab" / role="tabpanel", all icon buttons need aria-label
Focus indicators — add visible :focus-visible ring (2px solid accent color) on all interactive elements
Color contrast audit — glassmorphism at 35% opacity on complex backgrounds risks failing WCAG AA. Add a solid fallback background behind text.
Keyboard navigation — all dropdowns (header settings, search filters) must trap focus and support Escape to close
Alt text — all car images need descriptive alt: "{year} {make} {model} — {color}"
Relevant files:

MainLayout.tsx — add skip-link
SearchWidget.tsx — ARIA tabs
UnifiedHeader.tsx — aria-labels, keyboard
CarCard — alt text, aria-labels
Phase 7: Mobile App Visual Parity — "Premium Native Feel"
Goal: The mobile app is functionally solid (99% complete). Polish it to match the web's new design language.

Steps:

Sync mobile theme (theme.ts) with web's unified palette from Phase 1 — currently mobile uses #E65000 (good, close to target #E65100)

Home screen streamlining — MobileDeHome renders 28+ sections. Reduce to 8-10:

Hero + Search → Popular Brands → Recommended Cars → Featured Dealers → AI Features → Trust Stats
Remove redundant sections (OurCarsShowcase + CarsShowcase + FeaturedShowcase → ONE section)
Card consistency — ensure mobile CarCard matches the new UnifiedCarCard design from Phase 3

Onboarding refresh — current 3 screens. Add:

Screen 4: AI features showcase (visual search, valuation, advisor)
Animated transitions between screens (not just swipe)
Pull-to-refresh feedback — add the branded Koli One loader animation (currently uses react-native default)

Tab bar polish — add micro-animation for active tab (scale bounce or sliding indicator)

Verification
Visual regression — screenshot before/after for: Homepage, Cars page, Car Detail, Login, Search, Profile, Sell wizard (7 pages × 3 viewports = 21 screenshots)
Lighthouse audit — run on homepage, targeting: Performance ≥ 85, Accessibility ≥ 90, SEO ≥ 95, Best Practices ≥ 90
Build gates — npx vite build exit 0, cd functions && npm run build exit 0, TS errors ≤ 2626
Color contrast checker — all text-on-background combinations pass WCAG AA (4.5:1 ratio)
Mobile device testing — test on iOS Safari + Android Chrome (real devices or emulators)
Decisions
Glassmorphism: Keep for dark mode only (where it works best). Light mode uses solid white backgrounds for readability.
Purple LED: Remove entirely. Replace with subtle accent glow (orange/indigo).
3D card tilt: Keep for a dedicated "showcase" component, but NOT on homepage car cards.
Sound effects: Remove from default experience. Add as opt-in setting in user preferences.
Number of homepage sections: Reduce from 17 to 8-10 (quality over quantity).
Font stack: Inter (body) + Exo 2 (headings). Drop 4 unused fonts.
Further Considerations
Professional photography: The AI-generated hero image hurts first impressions. Consider commissioning 3-4 professional hero shots (Bulgarian landscapes + premium cars) or licensing from Shutterstock/Unsplash. Recommendation: invest in this, it's the single highest-ROI visual change.

Lottie animations: For the AI feature sections and loading states, consider Lottie JSON animations (small file size, resolution-independent) instead of CSS keyframes — used by Carvana, Cazoo, and most premium marketplaces.

Dark mode as default?: The current CSS defaults to dark mode. Consider making light mode the default (most car marketplaces use light backgrounds — AutoScout24, Mobile.de, CarGurus, Cars.com). Keep dark mode as a user preference option.

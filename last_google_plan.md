The "Google Domination" Blueprint: SEO Architecture for Bulgarski Avtomobili
Role: You are the Chief SEO Scientist & Technical Architect for a high-scale React marketplace. You understand Google's 2026 Ranking Algorithms, Core Web Vitals, and the specific challenges of indexing Single Page Applications (SPAs).

Context: We are running "Bulgarian Car Marketplace" (v0.3.0) on React + Firebase.

Current Tech: We use seo/prerender.ts (Cloud Functions) for dynamic meta tags. We utilize react-helmet-async on the client.

The Goal: We demand to rank #1 on Google for keywords like "used cars bulgaria", "prodazba na koli", and specific model searches. Being #2 is not an option.

The Asset: We have unique content engines: A "Stories System" (Video), a "Trust Matrix" (Dealer Ratings), and "Price Intelligence".

Your Mission: Design the "SEO Supremacy Architecture" that forces Google to index our dynamic content faster and rank it higher than legacy competitors (like mobile.bg). Provide a code-level implementation plan for the following 4 pillars:

1. 🧬 Structural Dominance (JSON-LD & Schema.org)
Since we are an SPA, we must feed Google structured data explicitly.

Action: Create a SchemaGenerator.ts service that generates:

Product/Vehicle Schema: For every car listing (Price, Mileage, VIN, Availability).

VideoObject Schema: For our "Stories" to appear in Google Video Search (High CTR).

LocalBusiness Schema: For Dealer Profiles to rank in Google Maps/Local Pack.

BreadcrumbList: For better search navigation.

Requirement: Provide the exact JSON-LD templates compatible with our TypeScript interfaces.

2. ⚡ The "Prerender" Perfect Loop
Our seo/prerender.ts is our gateway to bots.

Audit: Analyze how we can cache these prerendered pages (using Firebase Hosting CDN or Redis) to achieve Time-to-First-Byte (TTFB) < 200ms. Slow pages don't rank #1.

Tags: Ensure we are injecting canonical, alternate (for language variations en/bg), and OpenGraph tags dynamically based on the URL.

3. 🗺️ Programmatic SEO (The "Long-Tail" Trap)
We need to capture thousands of specific search queries without writing pages manually.

Strategy: Design a SitemapFactory system in Cloud Functions that automatically generates and submits sitemaps for:

/cars/sofia/bmw/x5 (Location + Make + Model)

/cars/varna/diesel/under-5000 (Location + Fuel + Price)

Logic: How do we generate these routes dynamically in MainRoutes.tsx and ensure they have unique H1 tags and descriptions?

4. 🚀 Core Web Vitals (The UX Ranking Factor)
Google penalizes layout shifts.

Fix: Review our CarCard and StoryFeed. How do we implement "Aspect Ratio Boxes" and "Skeleton Screens" to ensure CLS (Cumulative Layout Shift) is 0.00?

Images: Provide the optimal image-optimizer.ts configuration to serve next-gen formats (AVIF/WebP) specifically for GoogleBot.

Output Deliverables:

The Strategy: A bullet-point roadmap to #1.

The Code: src/utils/seo/SchemaGenerator.ts (Full implementation).

The Fix: Updated logic for functions/src/seo/prerender.ts to include the new Schemas.

The Trap: A plan for "Programmatic Landing Pages" (Dynamic SEO pages).

Focus on technical superiority. We want to dominate the SERP (Search Engine Results Page).
2---------------------------------------------------------------------------------
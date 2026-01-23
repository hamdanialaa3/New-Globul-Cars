# 🚀 SEO & Multi-Landing Strategy Documentation
## استراتيجية التصدر في محركات البحث وصفحات الهبوط المتعددة

> **Last Updated:** January 23, 2026  
> **Version:** 0.4.0  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Macro SEO Architecture](#macro-seo)
3. [Dynamic Metadata & React Helmet](#metadata)
4. [Multi-Landing Page Strategy](#landing-pages)
5. [Structured Data (JSON-LD)](#structured-data)
6. [Advanced Integrations (Web Stories & Search Console)](#advanced)
7. [Keyword Dominance Matrix](#keywords)

---

## 🎯 Overview

Koli One is built with a "Search-First" philosophy. The objective is to dominate the Bulgarian automotive search space by creating a massive footprint of high-quality, relevant landing pages that answer specific user queries (e.g., "Used BMW in Sofia" or "Cheap SUVs for sale").

### Core Pillars
- **Granularity**: Separate pages for every brand, city, and vehicle condition.
- **Speed**: Pre-rendered meta tags for instant social sharing and indexing.
- **Richness**: Automated Google Web Stories and JSON-LD snippets.

---

## 🏗️ Macro SEO Architecture {#macro-seo}

The system uses a combination of route-based components and a central `SEOHead` manager to deliver optimized payloads to search engines.

### File Structure
- `src/components/seo/SEOHead.tsx`: Unified meta tag manager.
- `src/components/seo/CarSEO.tsx`: Specialized logic for listing pages.
- `src/pages/seo/*`: Dedicated landing page templates.
- `src/services/seo/seo-prerender.service.ts`: Logic for pre-generating content.

---

## 🏷️ Dynamic Metadata & React Helmet {#metadata}

Every page in the application dynamically generates its own metadata based on the current context.

### Implementation Pattern
```typescript
<SEOHead 
  title={`${car.make} ${car.model} for sale in ${car.location.city}`}
  description={`Buy this luxury ${car.year} ${car.make} ${car.model}. Features: ${car.equipment.join(', ')}.`}
  image={car.images[0]}
  canonical={`https://koli-one.bg/car/${car.sellerNum}/${car.carNum}`}
/>
```

### Supported Tags
- **OpenGraph (OG)**: Optimized for Facebook and WhatsApp sharing.
- **Twitter Cards**: Optimized for X/Twitter visibility.
- **Geotags**: Providing location context for local search results.

---

## 🗺️ Multi-Landing Page Strategy {#landing-pages}

The platform automatically generates thousands of landing page combinations to capture "Long-Tail" search traffic.

### Dynamic Landing Pages
1. **Brand + City Pages**: Targeting `BrandCityPage.tsx` (e.g., /cars/sofia/audi).
2. **City-Specific Listings**: Targeting `CityCarsPage.tsx` (e.g., /cars/plovdiv).
3. **Condition-Based Pages**: Targeting `AccidentCarsPage.tsx` or `NewCarsPage.tsx`.

### Landing Page Benefits
- **High Relevance**: Users land exactly on what they searched for.
- **Link Juice**: Internal linking structure spreads authority across the domain.
- **Reduced Bounce Rate**: Highly specific content keeps users engaged.

---

## 📜 Structured Data (JSON-LD) {#structured-data}

We provide search engines with machine-readable data via JSON-LD to enable **Rich Snippets**.

### Schema Types Used
- **Product**: For individual car listings (includes Price, Availability, and Condition).
- **BreadcrumbList**: For clear navigation paths in search results.
- **SearchAction**: Enabling the "search box" feature directly on Google search results.
- **Organization**: For dealership profiles.

---

## ⚡ Advanced Integrations {#advanced}

### 📱 Google Web Stories
Located in `src/components/seo/WebStory.tsx`, this feature converts car listings into immersive, mobile-first Google Web Stories. This allows the platform to appear in **Google Discover** feeds.

### 🚀 IndexNow API
Automated integration that pings search engines (Bing, Yandex, etc.) immediately whenever a new listing is published or updated, ensuring instant indexing.

### 📊 Search Console API
Automated tool for monitoring URL performance and submitting new sitemaps dynamically based on inventory changes.

---

## 📊 Keyword Dominance Matrix {#keywords}

| Query Type | Strategy | Component |
|------------|----------|-----------|
| "Cars for sale" | Global SEO | `HomePage` |
| "Used [Make] [Model]" | Listing Specific | `CarSEO` |
| "[Make] in [City]" | Localized Landing | `BrandCityPage` |
| "Cheap cars under [Price]" | Filter Landing | `AdvancedSearch` |
| "New cars Bulgaria" | Category Landing | `NewCarsPage` |

---

## 🔗 Related Documentation

- [07_Search_and_Filtering.md](./07_Search_and_Filtering.md) - How the internal search works.
- [01_Home_Page_and_Navigation.md](./01_Home_Page_and_Navigation.md) - Routing structure for SEO URLs.

---

**Last Updated:** January 23, 2026  
**Maintained By:** Growth & SEO Department  
**Status:** ✅ Active Documentation

# 🔍 Search Strategy - Bulgarian Car Marketplace

## Overview

This document defines the search architecture for the Bulgarian Car Marketplace, establishing clear separation of concerns between different search interfaces.

## Search Pages

### 1. `/cars` - Simple Keyword Search
**Purpose:** Quick, keyword-based search for fast car discovery

**Features:**
- ✅ **Keyword Search Bar**: Search by make, model, city, fuel type, etc.
- ✅ **AI Smart Search**: Natural language queries (e.g., "BMW 2020 diesel in Sofia")
- ✅ **Recent Searches**: Shows user's last 5 searches
- ✅ **Smart Suggestions**: Auto-complete based on query
- ✅ **URL Parameters**: Supports city and make from query params
- ❌ **NO Filter Drawer**: Intentionally removed to keep interface simple

**Use Cases:**
- Quick search by typing keywords
- AI-powered natural language queries
- Direct links from home page with specific make/city
- Mobile users wanting fast results

**Technical Stack:**
- `smartSearchService.ts` - AI-powered search
- `searchHistoryService.ts` - Recent searches tracking
- Firebase Firestore queries with caching
- No Algolia dependency

**Code Location:**
- `src/pages/01_main-pages/CarsPage.tsx`

---

### 2. `/advanced-search` - Comprehensive Filter-Based Search
**Purpose:** Detailed search with all vehicle specifications and filters

**Features:**
- ✅ **All Vehicle Specifications**:
  - Basic Data (Make, Model, Year, Price)
  - Technical Data (Engine, Power, Mileage, Fuel)
  - Exterior (Color, Body Type, Condition)
  - Interior (Seats, Features, Upholstery)
  - Offer Details (Purchase/Leasing, VAT, Warranty)
  - Location (Region, City)
- ✅ **Quick Smart Search**: Optional natural language input
- ✅ **Save Searches**: Authenticated users can save filter combinations
- ✅ **Firestore Composite Indexes**: Optimized for complex queries
- ✅ **URL Parameter Sync**: All filters reflected in URL

**Use Cases:**
- Users needing precise vehicle specifications
- Dealers searching for specific inventory
- Price range filtering
- Technical specification matching
- Multi-criteria searches

**Technical Stack:**
- `UnifiedSearchService.ts` - Multi-collection Firestore queries
- Firestore composite indexes (see `firestore.indexes.json`)
- URL parameter synchronization
- Advanced filter state management

**Code Location:**
- `src/pages/05_search-browse/advanced-search/AdvancedSearchPage/`
- `src/services/search/UnifiedSearchService.ts`

---

## Decision Rationale

### Why Two Separate Search Interfaces?

**Historical Context:**
Originally, `/cars` had a mobile filter drawer (`MobileFilterDrawer`) that duplicated functionality from `/advanced-search`. This created:
- Code duplication
- Confusing UX (two places to filter)
- Maintenance overhead
- Mobile performance issues

**Current Architecture:**
```
/cars            → Simple keyword search (AI-powered)
                   ↓
                   User needs more filters?
                   ↓
/advanced-search → Comprehensive filter interface
```

**Benefits:**
1. **Clear Purpose**: Each page has a distinct use case
2. **Better UX**: Users aren't overwhelmed with filters on quick search
3. **Performance**: `/cars` loads faster without filter UI
4. **Maintainability**: Single source of truth for advanced filtering
5. **Mobile-Friendly**: Simple interface for mobile quick searches

---

## User Journey

### Quick Search Flow
```
User lands on /cars
  → Types "BMW 2020 diesel"
  → Clicks Search or presses Enter
  → AI parses query → Firestore query
  → Results displayed immediately
```

### Advanced Search Flow
```
User on /cars → Clicks "Advanced Search" button
  → Redirected to /advanced-search
  → Fills in detailed filters
  → Applies filters → URL updates
  → Results with all matching criteria
  → Can save search for later
```

---

## API Endpoints

### Keyword Search (`/cars`)
**Service:** `smartSearchService.searchCars(query)`
```typescript
// Example
const results = await smartSearchService.searchCars("BMW 2020 diesel Sofia");
// Returns: CarListing[]
```

### Advanced Search (`/advanced-search`)
**Service:** `UnifiedSearchService.searchCars(filters)`
```typescript
// Example
const filters = {
  make: 'BMW',
  yearMin: 2020,
  fuelType: 'diesel',
  region: 'sofia'
};
const results = await searchService.searchCars(filters);
// Returns: CarListing[]
```

---

## Firestore Indexes

### Required Indexes for `/advanced-search`
All indexes defined in `firestore.indexes.json`:

```json
{
  "collectionGroup": "passenger_cars",
  "fields": [
    {"fieldPath": "isActive", "order": "ASCENDING"},
    {"fieldPath": "make", "order": "ASCENDING"},
    {"fieldPath": "yearOfManufacture", "order": "DESCENDING"}
  ]
}
```

**Deployment:**
```bash
firebase deploy --only firestore:indexes
```

---

## Footer Behavior

### `/cars` Page
- **Footer Hidden**: `return null` when `location.pathname === '/cars'`
- **Reason**: Cleaner mobile experience, more screen space for results

### `/advanced-search` Page
- **Footer Visible**: Standard footer displayed
- **Reason**: Desktop-first interface with more vertical space

**Code Location:**
- `src/components/Footer/Footer.tsx`

---

## Migration Notes

### What Was Removed
- `MobileFilterDrawer.tsx` (component still exists but not used in `/cars`)
- `MobileFilterButton.tsx` (not rendered on `/cars`)
- Filter state management in CarsPage (`showFilters`, `handleApplyFilters`)
- `currentFilters` and `activeFiltersCount` useMemo hooks

### What Was Kept
- AI Smart Search functionality
- Keyword search bar with suggestions
- Recent searches feature
- URL parameter support (city, make)
- Search history service

---

## Future Enhancements

### Potential Additions to `/cars`
- [ ] Voice search (speech-to-text)
- [ ] Image search (upload car photo)
- [ ] Trending searches widget
- [ ] Popular makes carousel

### Potential Additions to `/advanced-search`
- [ ] Saved search notifications
- [ ] Price history charts
- [ ] Similar cars suggestions
- [ ] Dealer comparison tool

---

## Testing

### Test Cases for `/cars`
```bash
# 1. Keyword search
✓ Search "BMW 2020"
✓ Search "diesel Sofia"
✓ Search "luxury sedan"

# 2. AI Smart Search
✓ "Find me a cheap Mercedes in Plovdiv"
✓ "BMW 5 series under 20000 EUR"

# 3. Clear search
✓ Click X button clears query
✓ Recent searches appear on focus

# 4. Footer hidden
✓ Footer should not render at all
```

### Test Cases for `/advanced-search`
```bash
# 1. Apply filters
✓ Set Make = BMW, Year = 2020-2022
✓ Apply → URL updates with params
✓ Results match criteria

# 2. Save search
✓ Fill filters → Click "Save Search"
✓ Modal opens → Enter name → Save
✓ Verify in /saved-searches

# 3. Footer visible
✓ Footer renders with all links
```

---

## Related Documentation

- [PROJECT_CONSTITUTION.md](../PROJECT_CONSTITUTION.md) - Core development principles
- [STRICT_NUMERIC_ID_SYSTEM.md](./STRICT_NUMERIC_ID_SYSTEM.md) - URL structure
- [AI_SERVICES_IMPLEMENTATION_CHECKLIST.md](./AI_SERVICES_IMPLEMENTATION_CHECKLIST.md) - AI search details

---

**Version:** 1.0.0  
**Last Updated:** December 28, 2025  
**Status:** Production

**Key Decision:** Filter drawer removed from `/cars` to maintain clear separation between simple keyword search and advanced filtering.

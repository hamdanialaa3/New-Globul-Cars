# 🔍 Search & Filtering System Documentation
## نظام البحث والفلترة - توثيق شامل

> **Last Updated:** January 23, 2026  
> **Version:** 0.4.0  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Search Architecture](#search-architecture)
3. [Algolia Integration](#algolia-integration)
4. [Firestore Search](#firestore-search)
5. [Filtering System](#filtering-system)
6. [Advanced Search](#advanced-search)
7. [Visual & Voice Search](#visual--voice-search)
8. [Technical Implementation](#technical-implementation)

---

## 🎯 Overview

The Search & Filtering System provides comprehensive search capabilities across all vehicle listings. It uses a hybrid approach combining Algolia for fast full-text search and Firestore for complex queries, with support for visual search, voice search, and advanced filtering.

### Key Features

- **Hybrid Search** - Algolia + Firestore
- **Multi-Collection Search** - Search across 6 vehicle collections
- **Smart Autocomplete** - AI-powered suggestions
- **Advanced Filters** - 20+ filter options
- **Visual Search** - Image-based search
- **Voice Search** - Speech-to-text search
- **Bulgarian Synonyms** - Localized search terms
- **Search Personalization** - User-based ranking

---

## 🏗️ Search Architecture

### Hybrid Search System

**Components:**
- **Algolia** - Fast full-text search, typo tolerance
- **Firestore** - Complex queries, multi-collection support
- **Query Orchestrator** - Routes queries to appropriate service

### File Structure

```
src/services/search/
├── UnifiedSearchService.ts          # Main search interface
├── algolia-search.service.ts       # Algolia integration
├── smart-search.service.ts         # Smart keyword search
├── firestoreQueryBuilder.ts        # Firestore query builder
├── queryOrchestrator.ts            # Query routing
├── multi-collection-helper.ts      # Multi-collection queries
├── bulgarian-synonyms.service.ts   # Bulgarian synonyms
├── ai-query-parser.service.ts      # AI query parsing
└── search-personalization.service.ts # Personalization

src/components/Search/
├── SmartAutocomplete.tsx           # Autocomplete component
├── SearchFilters.tsx                # Filter UI
├── SearchResults.tsx               # Results display
├── SearchBar.tsx                   # Main search bar
└── UnifiedSearchBar.tsx             # Unified search

src/components/visual-search/
└── VisualSearchUpload.tsx           # Image search

src/components/voice-search/
└── VoiceSearchButton.tsx            # Voice search
```

---

## 🔎 Algolia Integration

### Algolia Service

**Location:** `src/services/search/algolia-search.service.ts`

**Purpose:** Fast, typo-tolerant full-text search

**Configuration:**
```typescript
const algoliaConfig = {
  appId: process.env.REACT_APP_ALGOLIA_APP_ID,
  apiKey: process.env.REACT_APP_ALGOLIA_SEARCH_KEY,
  indexName: 'cars_production'
};
```

**Methods:**
```typescript
class AlgoliaSearchService {
  // Main search
  async search(params: AlgoliaSearchParams): Promise<AlgoliaSearchResult>
  
  // Autocomplete
  async autocomplete(query: string, maxResults?: number): Promise<{ makes: string[]; models: string[] }>
  
  // Check availability
  isAvailable(): boolean
}
```

### Algolia Index Structure

**Fields:**
- `objectID` - Car document ID
- `make` - Brand name
- `model` - Model name
- `year` - Year
- `price` - Price in EUR
- `fuelType` - Fuel type
- `transmission` - Transmission type
- `mileage` - Mileage
- `location.city` - City
- `location.region` - Region
- `description` - Full description (searchable)
- `status` - Listing status

**Searchable Attributes:**
```typescript
searchableAttributes: [
  'make',
  'model',
  'description',
  'location.city',
  'location.region'
]
```

**Facets:**
```typescript
attributesForFaceting: [
  'make',
  'model',
  'fuelType',
  'transmission',
  'location.city',
  'location.region',
  'year',
  'price'
]
```

---

## 🔥 Firestore Search

### Multi-Collection Search

**Service:** `multi-collection-helper.ts`

**Purpose:** Search across all 6 vehicle collections

**Collections:**
1. `passenger_cars`
2. `suvs`
3. `vans`
4. `motorcycles`
5. `trucks`
6. `buses`

**Implementation:**
```typescript
export async function queryAllCollections(filters: SearchFilters): Promise<CarListing[]> {
  const collections = ['passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
  
  // Build queries for each collection
  const queries = collections.map(collectionName => 
    buildFirestoreQuery(filters, { collectionName })
  );
  
  // Execute queries in parallel
  const snapshots = await Promise.all(
    queries.map(q => getDocs(q))
  );
  
  // Combine results
  const cars: CarListing[] = [];
  snapshots.forEach(snap => {
    snap.forEach(doc => {
      cars.push({ id: doc.id, ...doc.data() } as CarListing);
    });
  });
  
  return cars;
}
```

### Firestore Query Builder

**Location:** `src/services/search/firestoreQueryBuilder.ts`

**Purpose:** Build optimized Firestore queries

**Methods:**
```typescript
export function buildFirestoreQuery(
  filters: InputFilters,
  options?: QueryBuilderOptions
): Query<DocumentData>
```

**Supported Filters:**
- Make (brand)
- Model
- Year range (yearFrom, yearTo)
- Price range (priceFrom, priceTo)
- Fuel type
- Transmission
- Mileage range
- Location (city, region)
- Status (active, sold, draft)

**Example:**
```typescript
const query = buildFirestoreQuery({
  make: 'BMW',
  yearFrom: 2020,
  priceTo: 30000,
  fuelType: 'diesel',
  location: { city: 'Sofia' }
}, {
  collectionName: 'passenger_cars',
  maxResults: 50
});
```

---

## 🎛️ Filtering System

### Filter Categories

**1. Vehicle Information**
- Make (Brand)
- Model
- Year (Range)
- Mileage (Range)
- Fuel Type (Petrol, Diesel, Electric, Hybrid, LPG, CNG)
- Transmission (Manual, Automatic, CVT)
- Body Type
- Color

**2. Pricing**
- Price Range (From/To)
- Price Negotiable
- Financing Available

**3. Location**
- Region
- City
- Distance (Radius search)

**4. Condition**
- Condition (Excellent, Very Good, Good, Fair, Poor)
- Accident History
- Service History

**5. Equipment**
- Safety Features (ABS, ESP, Airbags, etc.)
- Comfort Features (AC, Navigation, etc.)
- Entertainment (Radio, Bluetooth, etc.)

### Filter Component

**Component:** `SearchFilters.tsx`

**Location:** `src/components/Search/SearchFilters.tsx`

**Features:**
- Collapsible filter sections
- Multi-select checkboxes
- Range sliders (price, year, mileage)
- Location picker
- Equipment selector
- Clear all filters
- Apply filters button

**Usage:**
```typescript
<SearchFilters
  filters={currentFilters}
  onFiltersChange={handleFiltersChange}
  onApply={handleApplyFilters}
  onClear={handleClearFilters}
/>
```

---

## 🧠 Advanced Search

### Smart Search Service

**Location:** `src/services/search/smart-search.service.ts`

**Purpose:** Intelligent keyword parsing and search

**Features:**
- Keyword parsing (extract make, model, year from text)
- Bulgarian synonyms support
- Typo tolerance
- Personalization (if user logged in)

**Methods:**
```typescript
class SmartSearchService {
  // Main search
  async search(
    keywords: string,
    userId?: string,
    page?: number,
    pageSize?: number
  ): Promise<SmartSearchResult>
  
  // Parse keywords
  parseKeywords(keywords: string): ParsedKeywords
}
```

**Keyword Parsing:**
```typescript
// Input: "BMW 320d 2020 diesel"
// Output:
{
  make: 'BMW',
  model: '320d',
  year: 2020,
  fuelType: 'diesel',
  rawKeywords: 'BMW 320d 2020 diesel'
}
```

### Bulgarian Synonyms

**Service:** `bulgarian-synonyms.service.ts`

**Purpose:** Map Bulgarian terms to English search terms

**Examples:**
```typescript
{
  'бензин': 'petrol',
  'дизел': 'diesel',
  'електрически': 'electric',
  'автоматична': 'automatic',
  'ръчна': 'manual',
  'София': 'Sofia',
  'Пловдив': 'Plovdiv'
}
```

### AI Query Parser

**Service:** `ai-query-parser.service.ts`

**Purpose:** Use AI to understand natural language queries

**Examples:**
- "I want a cheap family car" → `{ priceTo: 10000, bodyType: 'family' }`
- "BMW under 20k in Sofia" → `{ make: 'BMW', priceTo: 20000, location: { city: 'Sofia' } }`
- "Electric car with navigation" → `{ fuelType: 'electric', equipment: ['navigation'] }`

---

## 🖼️ Visual & Voice Search

### Visual Search

**Component:** `VisualSearchUpload.tsx`

**Location:** `src/components/visual-search/VisualSearchUpload.tsx`

**Purpose:** Search cars by uploading an image

**Process:**
```typescript
1. User uploads car image
2. Image sent to AI service (Gemini Vision)
3. AI extracts features:
   - Make (likely brand)
   - Model (likely model)
   - Color
   - Body type
   - Year estimate
4. Search with extracted features
5. Display similar cars
```

**AI Service:**
```typescript
const features = await GeminiVisionService.analyzeCarImage(imageFile);
// Returns: { make: 'BMW', model: '3 Series', color: 'black', yearEstimate: 2020 }

const results = await searchCars({
  make: features.make,
  model: features.model,
  color: features.color
});
```

### Voice Search

**Component:** `VoiceSearchButton.tsx`

**Location:** `src/components/voice-search/VoiceSearchButton.tsx`

**Purpose:** Speech-to-text search

**Process:**
```typescript
1. User clicks voice button
2. Browser requests microphone permission
3. Start recording audio
4. Convert speech to text (Web Speech API or Whisper)
5. Parse text to search query
6. Execute search
7. Display results
```

**Implementation:**
```typescript
const recognition = new window.webkitSpeechRecognition();
recognition.lang = 'bg-BG'; // Bulgarian
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  handleSearch(transcript);
};
recognition.start();
```

---

## 🔄 Query Orchestrator

### Orchestration Logic

**Location:** `src/services/search/queryOrchestrator.ts`

**Purpose:** Route queries to appropriate service (Algolia or Firestore)

**Decision Logic:**
```typescript
function shouldUseAlgolia(filters: SearchFilters): boolean {
  // Use Algolia if:
  // 1. Text search query exists
  // 2. Simple filters only (make, model, year, price)
  // 3. Algolia is available
  
  const hasTextQuery = !!filters.query;
  const hasSimpleFilters = ['make', 'model', 'year', 'price'].some(
    f => filters[f]
  );
  
  return hasTextQuery && hasSimpleFilters && algoliaService.isAvailable();
}
```

**Flow:**
```typescript
1. Check if Algolia should be used
2. If yes, try Algolia search
3. If Algolia returns 0 results, fallback to Firestore
4. If Algolia unavailable, use Firestore
5. If complex filters, use Firestore
6. Combine results if needed
```

---

## 🔧 Technical Implementation

### Unified Search Service

**Location:** `src/services/search/UnifiedSearchService.ts`

**Purpose:** Single interface for all search operations

**Methods:**
```typescript
class UnifiedSearchService {
  // Main search method
  async search(filters: SearchFilters, options?: SearchOptions): Promise<SearchResult>
  
  // Autocomplete
  async autocomplete(query: string): Promise<AutocompleteResult>
  
  // Get search suggestions
  async getSuggestions(query: string): Promise<string[]>
  
  // Save search to history
  async saveSearchHistory(userId: string, query: string, filters: SearchFilters): Promise<void>
}
```

### Search Result Structure

```typescript
interface SearchResult {
  cars: CarListing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  source: 'algolia' | 'firestore' | 'hybrid';
  processingTime: number; // milliseconds
  facets?: {
    makes: { [make: string]: number };
    models: { [model: string]: number };
    fuelTypes: { [type: string]: number };
    // ... more facets
  };
}
```

### Search History

**Purpose:** Track user search history for personalization

**Storage:** Firestore `search_history/{userId}/searches/{searchId}`

**Structure:**
```typescript
interface SearchHistory {
  query: string;
  filters: SearchFilters;
  resultsCount: number;
  timestamp: Date;
  clickedCars?: string[]; // Car IDs user clicked
}
```

---

## 📊 Search Personalization

### Personalization Service

**Location:** `src/services/search/search-personalization.service.ts`

**Purpose:** Rank results based on user preferences

**Factors:**
- Previous searches
- Clicked cars
- Saved favorites
- Location preference
- Price range preference
- Brand preference

**Implementation:**
```typescript
async personalizeResults(
  cars: CarListing[],
  userId: string
): Promise<CarListing[]> {
  // Get user preferences
  const preferences = await getUserPreferences(userId);
  
  // Score each car
  const scoredCars = cars.map(car => ({
    car,
    score: calculateRelevanceScore(car, preferences)
  }));
  
  // Sort by score
  return scoredCars
    .sort((a, b) => b.score - a.score)
    .map(item => item.car);
}
```

---

## 🔍 Best Practices

### Performance

1. **Debounce search input** - Avoid excessive queries
2. **Cache results** - Store recent searches
3. **Lazy load images** - Load images on scroll
4. **Pagination** - Load results in pages
5. **Index optimization** - Proper Firestore indexes

### User Experience

1. **Show loading state** - Clear feedback
2. **Autocomplete suggestions** - Help users find what they want
3. **Filter persistence** - Remember user's filters
4. **Search history** - Quick access to previous searches
5. **Empty states** - Helpful messages when no results

### Search Quality

1. **Typo tolerance** - Handle common typos
2. **Synonyms support** - Bulgarian/English mapping
3. **Fuzzy matching** - Similar results
4. **Relevance ranking** - Most relevant first
5. **Faceted search** - Show available options

---

## 🔗 Related Documentation

- [Home Page & Navigation](./01_Home_Page_and_Navigation.md)
- [Car Listing Creation](./03_Car_Listing_Creation.md)
- [PROJECT_CONSTITUTION.md](../PROJECT_CONSTITUTION.md)

---

**Last Updated:** January 23, 2026  
**Maintained By:** Development Team  
**Status:** ✅ Production Ready

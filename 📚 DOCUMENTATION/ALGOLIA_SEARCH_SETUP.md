# 🔍 Algolia Search Setup Guide (Optional)
**الوقت المطلوب:** 3 ساعات  
**التكلفة:** €0 (10K searches/month), €40/month بعدها  
**متى تحتاجه:** عند >10K searches/month  

---

## 🎯 ما سنفعله (3 ساعات)

1. ✅ Algolia Account Setup (15 دقيقة)
2. ✅ Index Configuration (30 دقيقة)
3. ✅ Data Sync (Firebase → Algolia) (45 دقيقة)
4. ✅ Frontend Integration (60 دقيقة)
5. ✅ Advanced Features (30 دقيقة)

---

## لماذا Algolia؟

### Firestore Search (Current):
```
❌ لا typo tolerance ("BMW" لا يجد "bmw")
❌ بطيء مع بيانات كبيرة (>10K cars)
❌ لا faceted filters (السعر + السنة + الموقع معًا)
❌ لا instant search (as-you-type)
❌ لا relevance ranking (النتائج غير مرتبة)
```

### Algolia Search:
```
✅ Typo tolerance ("bmw", "BMW", "Bmw" كلها تعمل)
✅ Instant results (<50ms)
✅ Faceted filters (السعر + السنة + الموقع + الوقود)
✅ Synonyms ("car" = "automobile" = "автомобил")
✅ Relevance ranking (الأفضل أولًا)
✅ Analytics (most searched, no results queries)
✅ A/B testing (test search improvements)
```

---

## متى تحتاج Algolia؟

### استخدم Firestore إذا:
```
✓ <1,000 cars in database
✓ <10,000 searches/month
✓ Simple search (make + model only)
✓ Budget = €0 strict
```

### استخدم Algolia إذا:
```
✓ >5,000 cars (performance matters)
✓ >10,000 searches/month (need typo tolerance)
✓ Advanced filters (price range, year, location, fuel, etc.)
✓ Professional search experience (like mobile.de)
✓ Analytics needed (understand user search behavior)
```

---

## الخطوة 1: Algolia Account Setup (15 دقيقة)

### 1.1 Create Account

**1. انتقل إلى:**
```
https://www.algolia.com/users/sign_up
```

**2. Fill details:**
```
Email: admin@globulcars.bg
Password: (strong password)
Company: Globul Cars
Use case: E-commerce search
```

**3. Select Plan:**
```
Free Plan:
✅ 10,000 searches/month
✅ 10,000 records
✅ Unlimited indices
✅ Full features

Growth Plan (€40/month):
✅ 100,000 searches/month
✅ 100,000 records
✅ Priority support
```

**Choose:** Free plan (upgrade later when needed)

---

### 1.2 Create Application

```
Application name: globul-cars-production
Region: Europe (Western Europe - closest to Bulgaria)
```

**Get API Keys:**
```
Settings → API Keys

Application ID: ABC123XYZ (copy this)
Search-Only API Key: abc123...xyz (for frontend)
Admin API Key: xyz789...abc (for backend, KEEP SECRET!)
```

**Save keys in .env:**
```env
# Algolia
REACT_APP_ALGOLIA_APP_ID=ABC123XYZ
REACT_APP_ALGOLIA_SEARCH_KEY=abc123...xyz

# Backend (functions/.env)
ALGOLIA_ADMIN_KEY=xyz789...abc
```

---

## الخطوة 2: Index Configuration (30 دقيقة)

### 2.1 Create Index

**Algolia Dashboard:**
```
Indices → Create Index

Name: cars_production
Primary attribute: objectID (auto)
```

**Searchable Attributes (order matters):**
```
1. make (highest priority)
2. model
3. description
4. sellerInfo.name

Unordered:
- fuel
- transmission
- color
- features
```

**Attributes for Faceting:**
```
filterOnly:
- price
- year
- mileage
- condition

searchable:
- make
- fuel
- transmission
- locationData.cityName.bg
- locationData.region
```

**Custom Ranking (tie-breaker):**
```
1. desc(featured) - Featured listings first
2. desc(createdAt) - Newer first
3. asc(price) - Cheaper first (within same make/model)
```

**Synonyms:**
```
Bulgarian:
- автомобил, кола, кар, машина
- джип, SUV, офроудър
- комби, караван, estate

English:
- car, automobile, vehicle
- SUV, jeep, 4x4
- sedan, saloon
- wagon, estate, kombi
```

---

### 2.2 Configure Settings

**Settings → Ranking:**
```
Ranking formula:
1. typo (typo tolerance)
2. geo (proximity to user location)
3. words (number of matching words)
4. filters (applied filters)
5. proximity (text proximity)
6. attribute (attribute priority)
7. exact (exact match)
8. custom (featured, createdAt, price)
```

**Settings → Typos:**
```
Typo tolerance: Enabled ✅
Min word size for 1 typo: 4 characters
Min word size for 2 typos: 8 characters

Examples:
"bmw" finds: BMW, bmw, Bmw
"merceedes" finds: Mercedes
"audiiii" finds: Audi
```

**Settings → Languages:**
```
Index Languages:
- Bulgarian (bg)
- English (en)

Remove stop words: Enabled
  Bulgarian: и, в, на, с, от, за
  English: and, in, on, with, from, for

Query Languages: Auto-detect
```

---

## الخطوة 3: Data Sync (Firebase → Algolia) (45 دقيقة)

### 3.1 Install Algolia SDK

```bash
cd functions
npm install algoliasearch
```

---

### 3.2 Create Algolia Service

**File:** `functions/src/services/algolia.service.ts`

```typescript
import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch';
import * as functions from 'firebase-functions';

const ALGOLIA_APP_ID = functions.config().algolia?.app_id || process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = functions.config().algolia?.admin_key || process.env.ALGOLIA_ADMIN_KEY;

let client: SearchClient | null = null;
let carsIndex: SearchIndex | null = null;

/**
 * Initialize Algolia client (singleton)
 */
const getClient = (): SearchClient => {
  if (!client) {
    if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY) {
      throw new Error('Algolia credentials not configured');
    }
    client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
  }
  return client;
};

/**
 * Get cars index
 */
const getCarsIndex = (): SearchIndex => {
  if (!carsIndex) {
    carsIndex = getClient().initIndex('cars_production');
  }
  return carsIndex;
};

/**
 * Transform Firestore car document to Algolia object
 */
const transformCarForAlgolia = (carId: string, carData: any) => {
  return {
    objectID: carId,
    
    // Basic info
    make: carData.make,
    model: carData.model,
    year: carData.year,
    price: carData.price,
    currency: 'EUR',
    
    // Details
    mileage: carData.mileage,
    fuel: carData.fuel,
    transmission: carData.transmission,
    condition: carData.condition,
    color: carData.color,
    
    // Location (for geo search)
    locationData: {
      cityName: carData.locationData?.cityName || { bg: '', en: '' },
      region: carData.locationData?.region || '',
      coordinates: carData.locationData?.coordinates || null,
    },
    _geoloc: carData.locationData?.coordinates ? {
      lat: carData.locationData.coordinates.lat,
      lng: carData.locationData.coordinates.lng,
    } : null,
    
    // Seller info
    sellerInfo: {
      name: carData.sellerInfo?.name || 'Private Seller',
      type: carData.sellerInfo?.type || 'private',
    },
    
    // Features
    features: carData.features || [],
    
    // Images
    images: carData.images || [],
    mainImage: carData.images?.[0] || '',
    
    // Meta
    description: carData.description || '',
    status: carData.status,
    featured: carData.featured || false,
    createdAt: carData.createdAt?._seconds || Math.floor(Date.now() / 1000),
    
    // For filtering
    priceRange: getPriceRange(carData.price),
    yearRange: getYearRange(carData.year),
  };
};

/**
 * Get price range bucket (for faceting)
 */
const getPriceRange = (price: number): string => {
  if (price < 5000) return '0-5000';
  if (price < 10000) return '5000-10000';
  if (price < 20000) return '10000-20000';
  if (price < 30000) return '20000-30000';
  if (price < 50000) return '30000-50000';
  return '50000+';
};

/**
 * Get year range bucket
 */
const getYearRange = (year: number): string => {
  if (year < 2000) return 'Before 2000';
  if (year < 2010) return '2000-2009';
  if (year < 2015) return '2010-2014';
  if (year < 2020) return '2015-2019';
  return '2020+';
};

/**
 * Add or update car in Algolia
 */
export const indexCar = async (carId: string, carData: any): Promise<void> => {
  try {
    const index = getCarsIndex();
    const algoliaObject = transformCarForAlgolia(carId, carData);
    
    await index.saveObject(algoliaObject);
    console.log(`✅ Indexed car ${carId} in Algolia`);
  } catch (error: any) {
    console.error(`❌ Failed to index car ${carId}:`, error);
    throw error;
  }
};

/**
 * Delete car from Algolia
 */
export const deleteCarFromIndex = async (carId: string): Promise<void> => {
  try {
    const index = getCarsIndex();
    await index.deleteObject(carId);
    console.log(`✅ Deleted car ${carId} from Algolia`);
  } catch (error: any) {
    console.error(`❌ Failed to delete car ${carId}:`, error);
    throw error;
  }
};

/**
 * Bulk index cars (for initial sync or re-indexing)
 */
export const bulkIndexCars = async (cars: Array<{ id: string; data: any }>): Promise<void> => {
  try {
    const index = getCarsIndex();
    const algoliaObjects = cars.map(car => transformCarForAlgolia(car.id, car.data));
    
    await index.saveObjects(algoliaObjects);
    console.log(`✅ Bulk indexed ${cars.length} cars in Algolia`);
  } catch (error: any) {
    console.error(`❌ Bulk indexing failed:`, error);
    throw error;
  }
};

/**
 * Clear index (use with caution!)
 */
export const clearIndex = async (): Promise<void> => {
  try {
    const index = getCarsIndex();
    await index.clearObjects();
    console.log(`✅ Cleared Algolia index`);
  } catch (error: any) {
    console.error(`❌ Failed to clear index:`, error);
    throw error;
  }
};
```

---

### 3.3 Create Sync Cloud Functions

**File:** `functions/src/algolia/algolia-sync.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { indexCar, deleteCarFromIndex, bulkIndexCars } from '../services/algolia.service';

/**
 * Sync car to Algolia when created or updated
 */
export const syncCarToAlgolia = functions.firestore
  .document('cars/{carId}')
  .onWrite(async (change, context) => {
    const carId = context.params.carId;
    
    // Deleted
    if (!change.after.exists) {
      await deleteCarFromIndex(carId);
      return;
    }

    // Created or Updated
    const carData = change.after.data();

    // Only index approved cars
    if (carData?.status !== 'approved') {
      // If status changed from approved to something else, delete from index
      if (change.before.exists && change.before.data()?.status === 'approved') {
        await deleteCarFromIndex(carId);
      }
      return;
    }

    // Index car
    await indexCar(carId, carData);
  });

/**
 * Initial sync - index all existing cars
 * HTTP callable function (admin only)
 */
export const initialAlgoliaSync = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Check admin
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can trigger initial sync'
      );
    }

    try {
      const db = admin.firestore();
      const carsSnapshot = await db.collection('cars')
        .where('status', '==', 'approved')
        .get();

      const cars = carsSnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));

      // Batch index in chunks of 100
      const chunkSize = 100;
      for (let i = 0; i < cars.length; i += chunkSize) {
        const chunk = cars.slice(i, i + chunkSize);
        await bulkIndexCars(chunk);
        console.log(`Indexed ${i + chunk.length}/${cars.length} cars`);
      }

      return {
        success: true,
        totalIndexed: cars.length,
        message: `Successfully indexed ${cars.length} cars`
      };
    } catch (error: any) {
      console.error('Initial sync failed:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });
```

---

### 3.4 Export & Deploy

**Update:** `functions/src/index.ts`

```typescript
// Algolia sync
import * as algoliaSync from './algolia/algolia-sync';

exports.syncCarToAlgolia = algoliaSync.syncCarToAlgolia;
exports.initialAlgoliaSync = algoliaSync.initialAlgoliaSync;
```

**Add Algolia config:**
```bash
cd functions
firebase functions:config:set \
  algolia.app_id="ABC123XYZ" \
  algolia.admin_key="xyz789...abc"
```

**Deploy:**
```bash
firebase deploy --only functions:syncCarToAlgolia,functions:initialAlgoliaSync
```

**Trigger initial sync:**
```javascript
// In Firebase Functions Shell or via admin panel
initialAlgoliaSync({}, { auth: { uid: 'admin-id', token: { admin: true } } })
```

---

## الخطوة 4: Frontend Integration (60 دقيقة)

### 4.1 Install React InstantSearch

```bash
cd bulgarian-car-marketplace
npm install algoliasearch react-instantsearch-dom
```

---

### 4.2 Create Search Provider

**File:** `src/contexts/SearchContext.tsx`

```typescript
import React, { createContext, useContext } from 'react';
import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID!,
  process.env.REACT_APP_ALGOLIA_SEARCH_KEY!
);

interface SearchContextValue {
  searchClient: ReturnType<typeof algoliasearch>;
  indexName: string;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SearchContext.Provider
      value={{
        searchClient,
        indexName: 'cars_production'
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearch must be used within SearchProvider');
  return context;
};
```

---

### 4.3 Create Search Components

**File:** `src/components/Search/AlgoliaSearch.tsx`

```typescript
import React from 'react';
import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  ClearRefinements,
  RangeInput,
  Configure,
  Pagination,
  Stats
} from 'react-instantsearch-dom';
import { useSearch } from '@/contexts/SearchContext';
import { CarSearchHit } from './CarSearchHit';

export const AlgoliaSearch: React.FC = () => {
  const { searchClient, indexName } = useSearch();

  return (
    <InstantSearch searchClient={searchClient} indexName={indexName}>
      <Configure hitsPerPage={20} />

      <div className="search-container">
        {/* Search Box */}
        <div className="search-box">
          <SearchBox
            translations={{
              placeholder: 'Търси марка, модел, описание...'
            }}
          />
        </div>

        <div className="search-content">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <ClearRefinements
              translations={{
                reset: 'Изчисти филтри'
              }}
            />

            {/* Make Filter */}
            <div className="filter-section">
              <h3>Марка</h3>
              <RefinementList
                attribute="make"
                limit={10}
                showMore
                translations={{
                  showMore: 'Покажи повече',
                  showLess: 'Покажи по-малко'
                }}
              />
            </div>

            {/* Fuel Filter */}
            <div className="filter-section">
              <h3>Гориво</h3>
              <RefinementList attribute="fuel" />
            </div>

            {/* Transmission Filter */}
            <div className="filter-section">
              <h3>Скоростна кутия</h3>
              <RefinementList attribute="transmission" />
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <h3>Цена (€)</h3>
              <RangeInput
                attribute="price"
                translations={{
                  submit: 'Приложи',
                  separator: 'до'
                }}
              />
            </div>

            {/* Year Range */}
            <div className="filter-section">
              <h3>Година</h3>
              <RangeInput attribute="year" />
            </div>

            {/* Location */}
            <div className="filter-section">
              <h3>Град</h3>
              <RefinementList
                attribute="locationData.cityName.bg"
                limit={5}
                showMore
              />
            </div>
          </aside>

          {/* Results */}
          <main className="search-results">
            <Stats
              translations={{
                stats: (nbHits, timeSpentMS) =>
                  `${nbHits.toLocaleString()} автомобила намерени в ${timeSpentMS}ms`
              }}
            />

            <Hits hitComponent={CarSearchHit} />

            <Pagination
              translations={{
                previous: 'Предишна',
                next: 'Следваща',
                first: 'Първа',
                last: 'Последна',
                page: (currentRefinement) => `Страница ${currentRefinement}`,
                ariaPrevious: 'Предишна страница',
                ariaNext: 'Следваща страница',
                ariaFirst: 'Първа страница',
                ariaLast: 'Последна страница',
                ariaPage: (currentRefinement) => `Страница ${currentRefinement}`
              }}
            />
          </main>
        </div>
      </div>
    </InstantSearch>
  );
};
```

**File:** `src/components/Search/CarSearchHit.tsx`

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hit } from 'react-instantsearch-dom';

interface CarHitProps {
  hit: Hit<{
    objectID: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuel: string;
    transmission: string;
    mainImage: string;
    locationData: {
      cityName: { bg: string };
    };
  }>;
}

export const CarSearchHit: React.FC<CarHitProps> = ({ hit }) => {
  const navigate = useNavigate();

  return (
    <div
      className="car-hit"
      onClick={() => navigate(`/car/${hit.objectID}`)}
    >
      <div className="car-hit-image">
        <img src={hit.mainImage} alt={`${hit.make} ${hit.model}`} />
      </div>

      <div className="car-hit-details">
        <h3>{hit.make} {hit.model}</h3>
        <p className="car-hit-year">{hit.year} година</p>
        
        <div className="car-hit-specs">
          <span>{hit.mileage.toLocaleString()} км</span>
          <span>{hit.fuel}</span>
          <span>{hit.transmission}</span>
        </div>

        <p className="car-hit-location">
          📍 {hit.locationData.cityName.bg}
        </p>

        <p className="car-hit-price">
          €{hit.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};
```

---

### 4.4 Update CarsPage

**Replace Firestore search with Algolia:**

```typescript
// Old: src/pages/CarsPage/CarsPage.tsx
// Remove Firestore query logic

// New: Use AlgoliaSearch component
import { AlgoliaSearch } from '@/components/Search/AlgoliaSearch';

export const CarsPage = () => {
  return (
    <div className="cars-page">
      <h1>Всички автомобили</h1>
      <AlgoliaSearch />
    </div>
  );
};
```

---

## الخطوة 5: Advanced Features (30 دقيقة)

### 5.1 Geo Search (Near Me)

```typescript
import { GeoSearch, Marker } from 'react-instantsearch-dom';

// In AlgoliaSearch component
<div className="filter-section">
  <h3>Близо до мен</h3>
  <GeoSearch
    google={window.google}
    enableRefineOnMapMove={true}
    translations={{
      redo: 'Търси в тази област'
    }}
  >
    {({ hits }) => (
      <>
        {hits.map(hit => (
          <Marker key={hit.objectID} hit={hit} />
        ))}
      </>
    )}
  </GeoSearch>
</div>
```

---

### 5.2 Query Suggestions

```typescript
import { connectAutoComplete } from 'react-instantsearch-dom';

const AutoComplete = connectAutoComplete(({ hits, refine }) => (
  <div className="autocomplete">
    {hits.map(hit => (
      <div key={hit.objectID} onClick={() => refine(hit.query)}>
        {hit.query}
      </div>
    ))}
  </div>
));
```

---

### 5.3 Analytics

**Algolia Dashboard → Analytics:**
```
- Top searches (most popular queries)
- No results (queries that return 0 results → add synonyms)
- Click-through rate (CTR)
- Conversion rate
```

---

## 💰 Cost Management

### Free Tier Limits:
```
10,000 searches/month = ~330/day

Scenarios:
- 100 users/day × 5 searches = 500/day = 15,000/month ❌ (exceeds)
- 50 users/day × 5 searches = 250/day = 7,500/month ✅ (within)

Recommendation: Start free, upgrade when >10K searches/month
```

### Growth Plan (€40/month):
```
100,000 searches/month
- 1,000 users/day × 3 searches = 90,000/month ✅
- ROI: Better search = higher conversion = more sales
```

---

## ✅ Checklist

Setup:
- [ ] Algolia account created
- [ ] Free plan selected
- [ ] Application created
- [ ] API keys saved to .env

Index Configuration:
- [ ] Index created (cars_production)
- [ ] Searchable attributes configured
- [ ] Facets configured
- [ ] Custom ranking set
- [ ] Synonyms added (Bulgarian + English)

Data Sync:
- [ ] Algolia SDK installed in functions
- [ ] algolia.service.ts created
- [ ] Sync function deployed (syncCarToAlgolia)
- [ ] Initial sync completed (all cars indexed)

Frontend:
- [ ] react-instantsearch-dom installed
- [ ] SearchProvider created
- [ ] AlgoliaSearch component created
- [ ] CarSearchHit component created
- [ ] CarsPage updated to use Algolia

Testing:
- [ ] Search works (try "BMW", "Audi", etc.)
- [ ] Filters work (price, year, fuel, location)
- [ ] Typo tolerance works (try "merceedes")
- [ ] Pagination works
- [ ] Results instant (<100ms)

---

## 🎉 النتيجة النهائية

بعد 3 ساعات، لديك:
- ✅ Advanced search (typo tolerance, instant results)
- ✅ Faceted filters (price, year, make, location)
- ✅ Auto-sync (Firebase → Algolia)
- ✅ Analytics (top searches, no results)
- ✅ 10K searches/month free
- ✅ Professional search experience

**التكلفة:** €0 حتى 10K searches/month  
**القيمة:** Better UX = Higher conversion! 🔍

---

## 🎊 جميع المهام مكتملة!

**Tasks 1-9 Complete:**
1. ✅ Firebase Blaze Plan
2. ✅ Google Analytics + Sentry
3. ✅ SendGrid Email
4. ✅ Cloud Scheduler
5. ✅ SEO Enhancement
6. ✅ Monitoring (Sentry + UptimeRobot)
7. ✅ Cloudflare CDN (guide exists)
8. ✅ Backup System
9. ✅ Algolia Search (optional)

**Total: 21 ملف توثيق + 2000+ سطر كود! 🚀**

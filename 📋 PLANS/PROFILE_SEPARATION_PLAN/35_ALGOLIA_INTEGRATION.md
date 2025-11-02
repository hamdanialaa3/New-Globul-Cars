# 🔍 Algolia Integration Plan
## دمج Algolia للبحث المتقدم في البروفايلات

**الرقم:** 35 (الدعم التنفيذي)  
**المدة:** 3-4 أيام (ضمن Phase 2B أو Phase 3)  
**الأولوية:** 🟢 MEDIUM (Optional Enhancement)  
**الحالة:** ✅ Ready - Algolia Credentials Received

---

## 🎯 الهدف

### Use Case
```
المستخدمون يمكنهم البحث عن:
- التجار (Dealers) حسب الاسم/المدينة/الخدمات
- المستخدمين (Users) حسب الاسم/التخصص
- البروفايلات حسب Trust Score
- الشركات (Companies) حسب Fleet size
```

---

## 🔐 Algolia Credentials

```typescript
// .env.local (Frontend - PUBLIC KEYS ONLY)
REACT_APP_ALGOLIA_APP_ID=RTGDK12KTJ
REACT_APP_ALGOLIA_SEARCH_API_KEY=01d60b828b7263114c11762ff5b7df9b

// .env (Backend/Functions - PRIVATE KEYS)
ALGOLIA_APP_ID=RTGDK12KTJ
ALGOLIA_ADMIN_API_KEY=09fbf48591c637634df71d89843c55c0
ALGOLIA_WRITE_API_KEY=47f0015ced4e86add8acc2e35ea01395

// Monitoring (optional)
ALGOLIA_USAGE_API_KEY=40fe2100367a99c832c2a9db7a80f1ac
ALGOLIA_MONITORING_API_KEY=4f04e850de923f14eeb593e983d6d448
```

⚠️ **Security:**
- ✅ Search key في Frontend (آمن)
- ❌ Admin/Write keys في Frontend (خطر!)
- ✅ Admin/Write keys في Cloud Functions فقط

---

## 📊 Algolia Indices Structure

### Index 1: dealers
```typescript
// Index: dealers
// Purpose: البحث عن التجار

interface AlgoliaDealerRecord {
  objectID: string;              // = uid
  profileType: 'dealer';
  
  // Names (searchable)
  dealershipNameBG: string;
  dealershipNameEN: string;
  
  // Location (facets)
  city: string;
  region: string;
  
  // Services (filters)
  services: {
    financing: boolean;
    warranty: boolean;
    tradeIn: boolean;
    delivery: boolean;
  };
  
  // Stats (ranking)
  trustScore: number;            // 0-100
  totalCars: number;
  rating: number;                // 0-5
  
  // Status (filter)
  verified: boolean;
  status: 'pending' | 'verified' | 'rejected';
  
  // Quick data
  logo?: string;
  planTier: string;
  
  // Timestamps (ranking)
  createdAt: number;             // Unix timestamp
  updatedAt: number;
}

// Searchable attributes:
searchableAttributes: [
  'dealershipNameBG',
  'dealershipNameEN',
  'city',
  'region'
]

// Facets:
attributesForFaceting: [
  'city',
  'region',
  'services.financing',
  'services.warranty',
  'verified',
  'planTier'
]

// Ranking:
customRanking: [
  'desc(trustScore)',
  'desc(rating)',
  'desc(totalCars)'
]
```

### Index 2: users
```typescript
// Index: users
// Purpose: البحث عن جميع المستخدمين

interface AlgoliaUserRecord {
  objectID: string;              // = uid
  profileType: 'private' | 'dealer' | 'company';
  
  // Names (searchable)
  displayName: string;
  firstName?: string;
  lastName?: string;
  
  // Location
  city?: string;
  region?: string;
  
  // Stats
  trustScore: number;
  totalListings: number;
  
  // Quick data
  photoURL?: string;
  planTier: string;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

// Searchable:
searchableAttributes: [
  'displayName',
  'firstName',
  'lastName',
  'city'
]

// Facets:
attributesForFaceting: [
  'profileType',
  'city',
  'region',
  'planTier'
]
```

### Index 3: companies
```typescript
// Index: companies
// Purpose: البحث عن الشركات

interface AlgoliaCompanyRecord {
  objectID: string;
  profileType: 'company';
  
  companyNameBG: string;
  companyNameEN: string;
  
  city: string;
  region: string;
  
  fleetSize: number;
  trustScore: number;
  
  logo?: string;
  planTier: string;
  
  createdAt: number;
  updatedAt: number;
}
```

---

## 🔧 Implementation

### Step 1: Install Algolia

```bash
cd bulgarian-car-marketplace
npm install algoliasearch@4 react-instantsearch-dom
```

### Step 2: Create Algolia Service

**Create:** `src/services/search/algolia-profile-search.service.ts` (< 300 lines)

```typescript
/**
 * Algolia Profile Search Service
 * Provides advanced search for profiles (dealers, companies, users)
 */

import algoliasearch from 'algoliasearch/lite';

const APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID || 'RTGDK12KTJ';
const SEARCH_KEY = process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY || '01d60b828b7263114c11762ff5b7df9b';

const client = algoliasearch(APP_ID, SEARCH_KEY);

// Indices
const dealersIndex = client.initIndex('dealers');
const usersIndex = client.initIndex('users');
const companiesIndex = client.initIndex('companies');

export class AlgoliaProfileSearchService {
  /**
   * Search dealers by name, city, or services
   */
  static async searchDealers(
    query: string,
    filters?: {
      city?: string;
      region?: string;
      services?: string[];
      verified?: boolean;
    }
  ) {
    let filterString = '';
    
    if (filters) {
      const parts: string[] = [];
      if (filters.city) parts.push(`city:"${filters.city}"`);
      if (filters.region) parts.push(`region:"${filters.region}"`);
      if (filters.verified !== undefined) parts.push(`verified:${filters.verified}`);
      if (filters.services?.includes('financing')) parts.push('services.financing:true');
      
      filterString = parts.join(' AND ');
    }
    
    const { hits } = await dealersIndex.search(query, {
      filters: filterString,
      hitsPerPage: 20
    });
    
    return hits;
  }
  
  /**
   * Search all users
   */
  static async searchUsers(
    query: string,
    profileType?: 'private' | 'dealer' | 'company'
  ) {
    const filters = profileType ? `profileType:"${profileType}"` : '';
    
    const { hits } = await usersIndex.search(query, {
      filters,
      hitsPerPage: 20
    });
    
    return hits;
  }
  
  /**
   * Get top dealers by trust score
   */
  static async getTopDealers(limit: number = 10) {
    const { hits } = await dealersIndex.search('', {
      hitsPerPage: limit,
      filters: 'verified:true'
    });
    
    return hits;
  }
}
```

### Step 3: Cloud Function للـ Sync

**Create:** `functions/src/algolia-sync.ts` (< 300 lines)

```typescript
/**
 * Algolia Sync Functions
 * Syncs Firestore changes to Algolia indices
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import algoliasearch from 'algoliasearch';

const ALGOLIA_APP_ID = functions.config().algolia.app_id || 'RTGDK12KTJ';
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_key || '09fbf48591c637634df71d89843c55c0';

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const dealersIndex = client.initIndex('dealers');
const usersIndex = client.initIndex('users');

/**
 * Sync user to Algolia on create/update
 */
export const syncUserToAlgolia = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    
    // Delete
    if (!change.after.exists) {
      await usersIndex.deleteObject(userId);
      
      // Also delete from dealers index if was dealer
      const before = change.before.data();
      if (before?.profileType === 'dealer') {
        await dealersIndex.deleteObject(userId);
      }
      return;
    }
    
    const userData = change.after.data();
    
    // Prepare user record
    const userRecord = {
      objectID: userId,
      profileType: userData.profileType || 'private',
      displayName: userData.displayName || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      city: userData.location?.city || '',
      region: userData.location?.region || '',
      trustScore: userData.stats?.trustScore || 0,
      totalListings: userData.stats?.totalListings || 0,
      photoURL: userData.photoURL || null,
      planTier: userData.planTier || 'free',
      createdAt: userData.createdAt?.toMillis() || Date.now(),
      updatedAt: userData.updatedAt?.toMillis() || Date.now()
    };
    
    // Save to users index
    await usersIndex.saveObject(userRecord);
    
    // If dealer, also save to dealers index
    if (userData.profileType === 'dealer' && userData.dealerSnapshot) {
      const dealerRecord = {
        objectID: userId,
        profileType: 'dealer',
        dealershipNameBG: userData.dealerSnapshot.nameBG || '',
        dealershipNameEN: userData.dealerSnapshot.nameEN || '',
        city: userData.location?.city || '',
        region: userData.location?.region || '',
        services: {
          financing: false,
          warranty: false,
          tradeIn: false,
          delivery: false
        },
        trustScore: userData.stats?.trustScore || 0,
        totalCars: userData.stats?.totalListings || 0,
        rating: userData.reviews?.average || 0,
        verified: userData.dealerSnapshot.status === 'verified',
        status: userData.dealerSnapshot.status || 'pending',
        logo: userData.dealerSnapshot.logo || null,
        planTier: userData.planTier || 'dealer_basic',
        createdAt: userData.createdAt?.toMillis() || Date.now(),
        updatedAt: userData.updatedAt?.toMillis() || Date.now()
      };
      
      await dealersIndex.saveObject(dealerRecord);
    } else {
      // Remove from dealers if no longer dealer
      await dealersIndex.deleteObject(userId).catch(() => {});
    }
  });

/**
 * Sync dealership details to Algolia
 */
export const syncDealershipToAlgolia = functions.firestore
  .document('dealerships/{dealerId}')
  .onWrite(async (change, context) => {
    const dealerId = context.params.dealerId;
    
    if (!change.after.exists) {
      await dealersIndex.deleteObject(dealerId);
      return;
    }
    
    const dealershipData = change.after.data();
    
    // Get user data for additional info
    const userDoc = await admin.firestore().doc(`users/${dealerId}`).get();
    const userData = userDoc.data();
    
    const dealerRecord = {
      objectID: dealerId,
      profileType: 'dealer',
      dealershipNameBG: dealershipData.dealershipNameBG || '',
      dealershipNameEN: dealershipData.dealershipNameEN || '',
      city: dealershipData.address?.city || userData?.location?.city || '',
      region: dealershipData.address?.region || userData?.location?.region || '',
      services: dealershipData.services || {},
      trustScore: userData?.stats?.trustScore || 0,
      totalCars: userData?.stats?.totalListings || 0,
      rating: userData?.reviews?.average || 0,
      verified: dealershipData.verified || false,
      status: userData?.dealerSnapshot?.status || 'pending',
      logo: dealershipData.logo || null,
      planTier: userData?.planTier || 'dealer_basic',
      createdAt: dealershipData.createdAt?.toMillis() || Date.now(),
      updatedAt: dealershipData.updatedAt?.toMillis() || Date.now()
    };
    
    await dealersIndex.saveObject(dealerRecord);
  });
```

### Step 4: React Search Component

**Create:** `src/components/Search/ProfileSearch.tsx` (< 300 lines)

```typescript
/**
 * Profile Search Component
 * Uses Algolia for instant profile search
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search } from 'lucide-react';
import { AlgoliaProfileSearchService } from '../../services/search/algolia-profile-search.service';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProfileSearchProps {
  type?: 'all' | 'dealers' | 'private' | 'company';
  placeholder?: string;
  onSelect?: (profile: any) => void;
}

const ProfileSearch: React.FC<ProfileSearchProps> = ({ 
  type = 'all',
  placeholder,
  onSelect 
}) => {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setLoading(true);
      
      try {
        let hits: any[] = [];
        
        if (type === 'dealers' || type === 'all') {
          const dealerHits = await AlgoliaProfileSearchService.searchDealers(query);
          hits = [...hits, ...dealerHits];
        }
        
        if (type === 'all') {
          const userHits = await AlgoliaProfileSearchService.searchUsers(query);
          hits = [...hits, ...userHits];
        }
        
        setResults(hits);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [query, type]);
  
  return (
    <SearchContainer>
      <SearchInput
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || (
          language === 'bg' 
            ? 'Търсене на дилъри, компании...' 
            : 'Search dealers, companies...'
        )}
      />
      <SearchIcon>
        <Search size={18} />
      </SearchIcon>
      
      {loading && <LoadingSpinner />}
      
      {results.length > 0 && (
        <ResultsDropdown>
          {results.map((result) => (
            <ResultItem 
              key={result.objectID}
              onClick={() => onSelect?.(result)}
            >
              {result.logo && <Logo src={result.logo} />}
              <ResultInfo>
                <ResultName>
                  {result.dealershipNameBG || result.displayName}
                </ResultName>
                <ResultMeta>
                  {result.city} • Trust Score: {result.trustScore}
                </ResultMeta>
              </ResultInfo>
            </ResultItem>
          ))}
        </ResultsDropdown>
      )}
    </SearchContainer>
  );
};

// Styled components...
const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1.5px solid #e0e0e0;
  border-radius: 24px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF8F10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
`;

// More styles...

export default ProfileSearch;
```

---

## 📈 Integration Points

### في خطة فصل البروفايلات

#### Phase 2B: Add Algolia Sync
```
Week 3, Day 4-5: Algolia Integration (optional)
├── Create algolia-profile-search.service.ts
├── Create Cloud Functions (syncUserToAlgolia)
├── Test sync with sample data
└── Deploy functions
```

#### Phase 3: Add Search UI
```
Week 4, Day 4-5: Profile Search Component
├── Create ProfileSearch.tsx
├── Add to UsersDirectoryPage
├── Add to DealerPublicPage
└── Test search functionality
```

---

## 🎯 Use Cases في Profile System

### 1. Find Dealers Page
```typescript
// UsersDirectoryPage or BrowseDealersPage
import ProfileSearch from '../components/Search/ProfileSearch';

function BrowseDealersPage() {
  return (
    <PageContainer>
      <ProfileSearch 
        type="dealers"
        placeholder="Search dealers by name, city, services..."
        onSelect={(dealer) => navigate(`/dealer/${dealer.objectID}`)}
      />
      
      {/* Results */}
    </PageContainer>
  );
}
```

### 2. Quick User Lookup (Admin)
```typescript
// SuperAdminPage - User management
<ProfileSearch 
  type="all"
  onSelect={(user) => openUserDetails(user.objectID)}
/>
```

### 3. Dealer Directory with Filters
```typescript
// Advanced search with facets
<InstantSearch searchClient={client} indexName="dealers">
  <SearchBox />
  
  <RefinementList attribute="city" />
  <RefinementList attribute="services.financing" />
  <RefinementList attribute="verified" />
  
  <Hits hitComponent={DealerCard} />
</InstantSearch>
```

---

## 🔄 Sync Strategy

### Option 1: Real-time Sync (Cloud Functions)
```
✅ Automatic
✅ Always up-to-date
❌ Function invocations cost
```

### Option 2: Batch Sync (Scheduled)
```
✅ Lower cost
❌ Slight delay (max 1 hour)
```

**Recommendation:** Option 1 (Real-time) for dealers, Option 2 for private users

---

## 🧪 Testing

```typescript
// Test Algolia sync
describe('Algolia Sync', () => {
  it('syncs dealer to Algolia on create', async () => {
    // Create dealer in Firestore
    await setDoc(doc(db, 'users', 'test-dealer'), {
      profileType: 'dealer',
      dealerSnapshot: { nameBG: 'Тест', nameEN: 'Test' }
    });
    
    // Wait for function
    await new Promise(r => setTimeout(r, 2000));
    
    // Search in Algolia
    const results = await AlgoliaProfileSearchService.searchDealers('Тест');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].dealershipNameBG).toBe('Тест');
  });
});
```

---

## 📊 Algolia Dashboard Setup

### 1. Configure Indices

```bash
# Login to Algolia Dashboard
https://www.algolia.com/apps/RTGDK12KTJ/dashboard

# Create indices:
1. dealers
2. users
3. companies

# Configure searchable attributes:
dealers:
  - dealershipNameBG
  - dealershipNameEN
  - city
  - region

# Configure facets:
dealers:
  - city
  - region
  - services.financing
  - verified
  - planTier

# Configure ranking:
dealers:
  - desc(trustScore)
  - desc(rating)
  - desc(totalCars)
```

### 2. Set API Key Permissions

```
Search API Key (01d60b828b7263114c11762ff5b7df9b):
  ✅ search
  ✅ browse
  ❌ addObject
  ❌ deleteObject

Admin API Key (09fbf48591c637634df71d89843c55c0):
  ✅ ALL permissions
  ⚠️ Use in Cloud Functions ONLY
```

---

## 💰 Cost Estimation

### Algolia Free Tier
```
Records: 10,000 free
Search requests: 10,000/month free
```

### Expected Usage
```
Users: ~1,500
Dealers: ~150
Companies: ~10

Total records: ~1,660 ✅ Within free tier

Searches/month: ~5,000 ✅ Within free tier
```

**Cost:** FREE (within limits)

---

## 🎯 Success Criteria

```
✅ Algolia indices created
✅ Cloud Functions deployed
✅ Real-time sync working
✅ Search < 50ms response time
✅ Faceted search working
✅ Top dealers ranking correct
```

---

## 🔗 References

- **Phase 2B:** Service Integration
- **Phase 3:** UI Components
- **Algolia Docs:** https://www.algolia.com/doc/
- **React InstantSearch:** https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/

---

## 📝 Implementation Timeline

```
Optional: Add during Phase 2B or Phase 3

Day 1: Setup
  - Install packages
  - Create service
  - Configure indices

Day 2: Cloud Functions
  - Create sync functions
  - Deploy to Firebase
  - Test sync

Day 3: Frontend
  - Create search component
  - Add to pages
  - Test search

Day 4: Polish
  - Facets & filters
  - Ranking optimization
  - Performance testing

Total: 3-4 days (optional)
```

---

**الحالة:** ✅ Plan Ready - Credentials Saved  
**الأولوية:** 🟢 Optional Enhancement  
**Timeline:** Phase 2B or Phase 3


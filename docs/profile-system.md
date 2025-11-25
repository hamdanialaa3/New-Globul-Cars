# Profile System Architecture

**Version:** 2.0 (November 2025)
**Status:** Production-ready with analytics and RBAC integration

## System Overview

The profile system manages three distinct user types (Private, Dealer, Company) with role-based permissions, trust scoring, and real-time analytics. Architecture follows singleton pattern with intelligent caching and Cloud Function pre-aggregation.

### Core Components

**Services:**
- `ProfileStatsService` - Centralized statistics aggregation with 5-minute TTL cache
- `WorkflowAnalyticsService` - Conversion tracking and KPI calculations
- `TrustScoreService` - Multi-factor trust calculation engine
- `SavedSearchesService` - User search criteria persistence with validation

**Cloud Functions:**
- `dailyProfileMetricsAggregation` - Scheduled daily at 02:00 UTC
- `triggerProfileMetricsAggregation` - On-demand callable for admins

**UI Components:**
- `ProfileDashboard` - Main overview consuming ProfileStatsService
- `ProfileConversionFunnel` - Visual analytics (Views→Messages→Published)
- `ProfileActions` - RBAC-aware action buttons

---

## Architecture Patterns

### Singleton Service Pattern

```typescript
// services/profile/profile-stats.service.ts
class ProfileStatsService {
  private static instance: ProfileStatsService;
  private cache = new Map<string, CacheEntry>();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes

  static getInstance(): ProfileStatsService {
    if (!this.instance) {
      this.instance = new ProfileStatsService();
    }
    return this.instance;
  }

  private constructor() {} // Prevent direct instantiation
}

export const profileStatsService = ProfileStatsService.getInstance();
```

**Benefits:**
- Single source of truth for profile statistics
- Shared cache across all components
- Centralized error handling

### Caching Strategy

**TTL-based invalidation:**
```typescript
interface CacheEntry {
  data: ProfileStats;
  timestamp: number;
}

private getCached(cacheKey: string): ProfileStats | null {
  const cached = this.cache.get(cacheKey);
  if (!cached) return null;
  
  const age = Date.now() - cached.timestamp;
  if (age > this.TTL_MS) {
    this.cache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}
```

**Cache keys:** `profile:{profileId}:stats`

**Invalidation triggers:**
- Explicit refresh (user clicks "Refresh" button)
- TTL expiration (5 minutes)
- Real-time listener updates (optional opt-in)

### Parallel Aggregation

```typescript
async aggregateStats(profileId: string): Promise<ProfileStats> {
  const [profile, listings, metrics, reviews, searches] = await Promise.all([
    this.getProfile(profileId),
    this.getListingsCount(profileId),
    this.getMetrics(profileId),
    this.getReviews(profileId),
    this.getSavedSearches(profileId)
  ]);

  return {
    totalListings: listings.total,
    activeListings: listings.active,
    trustScore: this.calculateTrust(profile, reviews),
    // ... combine all parallel results
  };
}
```

**Performance gain:** ~70% faster than sequential queries (5 parallel vs 5 serial)

---

## Data Flow

### Dashboard Load Sequence

```
User Opens Dashboard
       ↓
ProfileDashboard component mounts
       ↓
Calls profileStatsService.get(profileId)
       ↓
       ├─ Cache Hit → Return cached data instantly
       │
       └─ Cache Miss → Parallel Firestore queries
              ↓
         Aggregate results
              ↓
         Calculate trust score
              ↓
         Cache result (5-min TTL)
              ↓
         Return to component
              ↓
       Render UI with stats
```

### Real-time Updates (Optional)

```typescript
// User toggles "Real-time" switch in dashboard
const unsubscribe = profileStatsService.setupRealtime(
  profileId,
  (updatedStats) => {
    setStats(updatedStats);
  }
);

// Component cleanup
useEffect(() => {
  return () => unsubscribe?.();
}, []);
```

**Firestore listeners:** onSnapshot on `profiles/{id}`, `listings` (ownerProfileId), `reviews` (targetId)

---

## Cloud Function Aggregation

### Daily Scheduled Job

**Purpose:** Pre-compute expensive stats to reduce dashboard query cost

**Schedule:** `0 2 * * *` (02:00 UTC daily)

**Algorithm:**
```typescript
export const dailyProfileMetricsAggregation = onSchedule(
  { schedule: '0 2 * * *', timeZone: 'UTC', region: 'europe-west1' },
  async (event) => {
    const profiles = await getActiveProfiles();
    const batch = db.batch();
    let batchCount = 0;

    for (const profile of profiles) {
      const metrics = await aggregateProfile(profile.id);
      
      batch.set(
        db.collection('profileMetrics').doc(profile.id),
        { ...metrics, lastUpdated: FieldValue.serverTimestamp() }
      );

      batchCount++;
      if (batchCount >= 450) { // Firestore limit: 500 ops/batch
        await batch.commit();
        batchCount = 0;
      }
    }

    if (batchCount > 0) await batch.commit();
  }
);
```

**Output:** `profileMetrics/{profileId}` documents with pre-computed stats

**Fallback:** If Cloud Function fails, dashboard uses real-time aggregation

### On-demand Trigger

```typescript
export const triggerProfileMetricsAggregation = onCall(
  { region: 'europe-west1' },
  async (request) => {
    // Admin role check
    if (request.auth?.token?.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    const profileId = request.data.profileId;
    const metrics = await aggregateProfile(profileId);
    
    await db.collection('profileMetrics').doc(profileId).set(metrics);
    return { success: true, metrics };
  }
);
```

**Usage:** Admin dashboard "Force Refresh" button

---

## RBAC Integration

### Permission Matrix

```typescript
// src/constants/rbac.ts
export const PERMISSIONS = {
  VIEW_BASIC_ANALYTICS: 'view_basic_analytics',
  VIEW_ADVANCED_ANALYTICS: 'view_advanced_analytics',
  MANAGE_TEAM: 'manage_team',
  ASSIGN_BADGES: 'assign_badges',
  MODERATE_CONTENT: 'moderate_content',
  // ... 13 more permissions
};

export const ROLE_PERMISSIONS = {
  GUEST: [],
  PRIVATE_USER: ['view_basic_analytics', 'edit_own_profile'],
  DEALER: ['view_basic_analytics', 'view_advanced_analytics', 'manage_team'],
  COMPANY: ['view_basic_analytics', 'view_advanced_analytics', 'manage_team', 'manage_subscriptions'],
  ADMIN: Object.values(PERMISSIONS) // All permissions
};
```

### UI Guards

```tsx
// components/ProfileActions.tsx
import { hasPermission } from '@/constants/rbac';

export const ProfileActions: React.FC<Props> = ({ userRole }) => {
  return (
    <S.Container>
      {hasPermission(userRole, 'view_advanced_analytics') && (
        <S.ActionCard onClick={handleViewAdvanced}>
          <FaChartBar /> Advanced Analytics
        </S.ActionCard>
      )}
      
      {hasPermission(userRole, 'manage_team') && (
        <S.ActionCard onClick={handleTeam}>
          <FaUsers /> Team Management
        </S.ActionCard>
      )}
    </S.Container>
  );
};
```

**Guard locations:**
- Component-level: `ProfileActions`, `AnalyticsDashboard`
- Route-level: `PrivateRoute` wrapper checks role
- Service-level: Cloud Functions validate `request.auth.token.role`

---

## Trust Score Calculation

### Multi-Factor Formula

```typescript
// services/trust-score.service.ts
interface TrustFactors {
  verificationStatus: 'none' | 'phone' | 'id' | 'business';
  reviewCount: number;
  averageRating: number; // 0-5
  responseTimeMinutes: number;
  listingQuality: number; // 0-100
  accountAge: number; // days
}

function calculateTrustScore(factors: TrustFactors): number {
  const weights = {
    verification: 25,
    reviews: 20,
    rating: 20,
    response: 15,
    quality: 10,
    age: 10
  };

  const scores = {
    verification: getVerificationScore(factors.verificationStatus),
    reviews: Math.min(factors.reviewCount * 2, 20),
    rating: (factors.averageRating / 5) * 20,
    response: getResponseScore(factors.responseTimeMinutes),
    quality: factors.listingQuality * 0.1,
    age: Math.min(factors.accountAge / 30, 10)
  };

  const weighted = Object.entries(scores).reduce(
    (sum, [key, score]) => sum + (score * weights[key] / 100),
    0
  );

  return Math.round(Math.min(weighted, 100));
}
```

**Score ranges:**
- **0-39:** Low trust (red badge)
- **40-69:** Medium trust (yellow badge)
- **70-100:** High trust (green badge)

**Verification bonus:**
- None: 0 points
- Phone: 15 points
- ID Document: 20 points
- Business EIK: 25 points

---

## Conversion Funnel Analytics

### Stage Definitions

```typescript
interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
}

const stages: FunnelStage[] = [
  { name: 'Views', count: 1250, percentage: 100 },
  { name: 'Messages', count: 180, percentage: 14.4 },
  { name: 'Published', count: 45, percentage: 3.6 }
];
```

**Conversion rate calculation:**
```typescript
const conversionRate = (published / views) * 100;
```

**Color coding:**
- Green (≥10%): High conversion
- Yellow (5-9.9%): Medium conversion
- Red (<5%): Low conversion

### Visual Component

```tsx
// components/ProfileConversionFunnel.tsx
export const ProfileConversionFunnel: React.FC = () => {
  const data = useWorkflowAnalytics();
  
  return (
    <S.FunnelContainer>
      {data.stages.map((stage, index) => (
        <S.FunnelStage key={stage.name} width={stage.percentage}>
          <S.StageLabel>{stage.name}</S.StageLabel>
          <S.StageValue>{stage.count.toLocaleString()}</S.StageValue>
        </S.FunnelStage>
      ))}
      <S.ConversionBadge rate={data.conversionRate}>
        {data.conversionRate.toFixed(1)}% Conversion
      </S.ConversionBadge>
    </S.FunnelContainer>
  );
};
```

---

## Testing Strategy

### Unit Tests Coverage

**RBAC Tests** (`rbac.test.ts`):
- ✅ All role×permission combinations
- ✅ listRolePermissions count validation
- ✅ PERMISSIONS structure integrity

**ProfileStatsService Tests** (`profile-stats.service.test.ts`):
- ✅ Cache TTL expiration
- ✅ Aggregation math validation
- ✅ Error handling (Firestore failures)
- ✅ Real-time listener cleanup

**WorkflowAnalytics Tests** (`workflow-analytics-service.test.ts`):
- ✅ getListingKpis aggregation
- ✅ getConversionSummary calculation

**SavedSearches Tests** (`saved-searches.service.test.ts`):
- ✅ Criteria validation (minYear/maxYear, negative prices)
- ✅ CRUD operations
- ✅ Query plan builder logic

### Mocking Strategy

```typescript
// Mock Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  onSnapshot: jest.fn((ref, callback) => {
    callback({ docs: [] });
    return jest.fn(); // Unsubscribe function
  })
}));
```

---

## Performance Optimization

### Query Indexes

**Required composite indexes** (deploy via `firestore.indexes.json`):

```json
{
  "indexes": [
    {
      "collectionGroup": "listings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ownerProfileId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "reviews",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "targetId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Deploy:** `firebase deploy --only firestore:indexes`

### Batch Processing Best Practices

**Cloud Functions limits:**
- Max batch size: 500 operations
- Safe batch size: 450 operations (buffer for safety)
- Commit frequency: Every 450 operations

**Error handling:**
```typescript
try {
  await batch.commit();
} catch (error) {
  logger.error('Batch commit failed', { error, batchCount });
  // Continue with next batch, don't throw
}
```

---

## Extension Points

### Adding New Metrics

1. **Update ProfileStats interface:**
```typescript
// types/profile.ts
export interface ProfileStats {
  // ... existing fields
  newMetric: number;
}
```

2. **Add aggregation logic:**
```typescript
// profile-stats.service.ts
private async getNewMetric(profileId: string): Promise<number> {
  const query = await getDocs(
    collection(db, 'someCollection'),
    where('profileId', '==', profileId)
  );
  return query.size;
}
```

3. **Update parallel aggregation:**
```typescript
const [profile, listings, newMetric] = await Promise.all([
  this.getProfile(profileId),
  this.getListingsCount(profileId),
  this.getNewMetric(profileId) // Add here
]);
```

4. **Add UI display in ProfileDashboard**

### Custom Trust Badges

**Badge types** (extensible via `TrustBadge` component):
- Verified (phone/ID confirmed)
- Top Seller (high listing count + rating)
- Fast Responder (avg response <30min)
- Premium Member (paid subscription)
- Legacy Member (account age >2 years)
- Featured Dealer (admin-assigned)

**Add new badge:**
```typescript
// components/TrustBadge.tsx
export enum BadgeType {
  // ... existing types
  NEW_BADGE = 'new_badge'
}

const badgeConfig = {
  [BadgeType.NEW_BADGE]: {
    icon: FaStar,
    color: '#FFD700',
    label: { bg: 'Нова значка', en: 'New Badge' }
  }
};
```

---

## Future Enhancements

**Planned features:**
- **Historical trends:** 30-day stats comparison charts
- **Competitor benchmarking:** Compare stats with similar profiles
- **Predictive analytics:** ML-based trust score forecasting
- **Custom dashboards:** User-defined KPI widgets
- **Export reports:** PDF/CSV download with analytics summary

**Technical debt:**
- Migrate saved searches validation to Zod schema (currently manual validation)
- Add Redis caching layer for high-traffic profiles (scale beyond in-memory cache)
- Implement GraphQL API for flexible dashboard queries (replace REST endpoints)

---

**Last Updated:** November 2025
**Maintained by:** Development Team
**Related docs:** `RBAC_GUIDE.md`, `CLOUD_FUNCTIONS_DEPLOYMENT.md`, `FIRESTORE_INDEXES.md`

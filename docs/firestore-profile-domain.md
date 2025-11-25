# Firestore Schema (Profile & User Domain)
# English / Български

> NOTE: No deletions policy respected (legacy documents are archived, not purged). File kept under 300 lines. No emojis.

## 1. Collections Overview / Общ преглед на колекциите

| Collection | Purpose (EN) | Цел (BG) |
|-----------|--------------|----------|
| users | Core user identity & auth linkage | Основна самоличност и връзка с auth |
| profiles | Extended profile attributes (type, trust, badges) | Разширени профилни атрибути (тип, доверие, значки) |
| listings | Vehicle listings & status lifecycle | Обяви за превозни средства и жизнен цикъл |
| savedSearches | User-defined search criteria for alerts | Потребителски критерии за търсене за известия |
| searchAlerts (derived) | Alert execution logs / scheduling | Логове и график на известия |
| messages | Threaded user conversations | Нишкови разговори между потребители |
| notifications | In-app + push notification queue | Опашка за известия (приложение + push) |
| posts | Social / market posts (future feature) | Социални / пазарни публикации |
| analyticsEvents | Raw analytics events (views, clicks) | Сурови аналитични събития (прегледи, кликове) |
| listingMetrics (derived) | Aggregated per-listing KPIs | Агрегирани KPI показатели на обява |
| teamInvites | Dealer/company team invitations | Покани за екип на търговец/компания |

## 2. Item Shape / Структура на документи

### users
```
users/{uid} {
  email: string,
  createdAt: Timestamp,
  authProvider: 'password'|'google'|'facebook',
  lastLoginAt: Timestamp,
  localePref?: 'bg'|'en',
  profileId: string, // links profiles collection
  roles?: string[] // e.g. ['user','dealer','admin']
}
```

### profiles
```
profiles/{profileId} {
  userId: string,
  type: 'private'|'dealer'|'company',
  displayName: string,
  trustScore: number, // 0-100
  badges: string[], // e.g. ['verified','fast_responder']
  verification: {
    phoneVerified: boolean,
    idVerified: boolean,
    businessVerified?: boolean
  },
  stats: {
    activeListings: number,
    totalListings: number,
    messagesReceived30d: number,
    avgResponseMinutes?: number
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### listings (core listing fields; avoid deprecated location fields)
```
listings/{listingId} {
  ownerProfileId: string,
  make: string,
  model: string,
  year: number,
  mileageKm: number,
  priceEur: number,
  currency: 'EUR', // fixed by constitution
  status: 'draft'|'published'|'paused'|'sold',
  locationData: {
    cityId: string,
    cityName: { bg: string, en: string },
    coordinates: { lat: number, lng: number },
    region?: string,
    postalCode?: string,
    address?: string
  },
  equipment: string[],
  images: string[], // storage paths or CDN URLs
  analytics: { views: number, messages: number, favorites: number },
  createdAt: Timestamp,
  publishedAt?: Timestamp,
  soldAt?: Timestamp
}
```

### savedSearches
```
savedSearches/{id} {
  userId: string,
  criteria: {
    make?: string,
    model?: string,
    minYear?: number,
    maxYear?: number,
    maxPriceEur?: number,
    fuelTypes?: string[],
    transmission?: string,
    regionIds?: string[]
  },
  notification: {
    channels: string[], // ['inapp','push','email']
    lastTriggeredAt?: Timestamp,
    enabled: boolean
  },
  createdAt: Timestamp
}
```

### searchAlerts (derived execution log)
```
searchAlerts/{runId} {
  savedSearchId: string,
  userId: string,
  matchedListingIds: string[],
  triggeredAt: Timestamp,
  delivery: { inapp: boolean, push: boolean, email: boolean },
  durationMs: number
}
```

### posts (planned feature)
```
posts/{postId} {
  authorProfileId: string,
  type: 'market'|'tips'|'review',
  content: {
    title: { bg: string, en: string },
    body: { bg: string, en: string }
  },
  listingRef?: string, // optional highlight
  tags: string[],
  moderation: { flagged: boolean, reason?: string },
  metrics: { views: number, likes: number, comments: number },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### listingMetrics (aggregation)
```
listingMetrics/{listingId} {
  views7d: number,
  views30d: number,
  messages7d: number,
  favorites7d: number,
  conversionRate30d?: number // messages/views
}
```

## 3. Index Strategy / Индекс стратегия

Provide composite indexes to support:
- Saved searches: Filter by make+model+year range+price → compound.
- Listing dashboards: status + ownerProfileId + publishedAt (sorting recent published).
- Posts feed: type + createdAt desc.

Proposed (pseudo) entries for `firestore.indexes.json` additions:
```
# listings: ownerProfileId + status + publishedAt DESC
# listings: make + model + priceEur
# posts: type + createdAt DESC
# savedSearches: userId + createdAt DESC
```
(Actual JSON added separately in recommendations file.)

## 4. Security Rules Notes / Бележки за сигурност

Principles:
- users: each user reads own; admin can read all.
- profiles: public read (limited fields), owner write, admin elevate trust/badges.
- listings: published readable by all; draft readable by owner; writes restricted by ownership.
- savedSearches: only owner CRUD.
- searchAlerts: owner read, write by Cloud Function only.
- posts: readable by all; writes by authenticated; moderation fields writeable by admin.
- listingMetrics: read public; writes only via Cloud Function aggregation.

## 5. RBAC / Роли и права

Roles (string identifiers):
- user
- dealer
- company
- admin
- super_admin

Permission examples:
- admin: elevate badges, moderate posts.
- super_admin: all admin + rule management.

## 6. Localization / Локализация

Multilingual fields use nested { bg, en }. Avoid storing single-language only content.

## 7. Evolution / Еволюция

Migration path: legacy location fields retained only in archival docs (DDD). New writes must use `locationData`.

## 8. Analytics / Аналитика

Raw events → analyticsEvents; scheduled Cloud Function aggregates into listingMetrics to reduce query cost.

## 9. Query Patterns / Шаблони на заявки

Common:
- Recent active listings of profile: where ownerProfileId==X and status=='published' order by publishedAt desc limit 20.
- Saved search execution: compound query built from criteria fields; fallback to client filtering if partial index.
- Posts feed: where type in ['market','tips'] order by createdAt desc limit 50.

## 10. Limits / Ограничения

Item size: keep listings < 50KB (images as references only). Avoid giant criteria objects; split if growth required.

## 11. Change Log / История на промени

Initial version created to guide upcoming feature implementation (saved searches, posts, metrics). Future changes appended with date stamp.

---
Lines: END (file intentionally concise).
# Offline-First Architecture Decision Record

## Decision
Koli One mobile app uses **online-first with robust offline fallback** for critical user flows (listing creation, messaging).

## Rationale

### Why Not Full Offline?
- Real-time search requires server index (Algolia)
- Payment processing requires live connectivity
- Multi-user messaging needs sync
- Data freshness is critical for market listings

### Why Not Fully Online?
- Network latency in rural areas (Bulgaria, Middle East)
- User expectations for draft persistence
- Loss of work frustrates users

## Implementation

### Offline Storage
- **Firestore Local Cache**: Enabled by default on mobile
- **AsyncStorage**: For user preferences, auth tokens, draft metadata
- **Service Worker**: For web (progressive download)

### Critical Flows

1. **Listing Creation (Draft)**
   - Auto-save to AsyncStorage every 30s
   - Sync to Firestore when online
   - Show badge: "Draft (offline)" or "Synced"
   - Validation done locally, confirmed server-side

2. **Messaging**
   - Queue outgoing messages locally
   - Sync with exponential backoff when online
   - Mark as "pending", "sent", "failed"

3. **Search**
   - Show cached results if offline
   - Disable filters that require real-time data
   - Show "Last updated: [date]" label

### Conflict Resolution
- Server wins on sync conflicts (user notified)
- Local draft is preserved if user was offline during server update
- UI prompts user to choose in ambiguous cases

## Testing

- Offline emulation in mobile dev tools
- Test 3G/4G throttling via browser DevTools
- Network toggle scenarios (WiFi → 4G → airplane mode)
- Draft persistence across app restart

## Monitoring

- Track "failed sync" events per user
- Alert on high failure rate (> 5% of users)
- Log conflict resolution actions

## Future: Background Sync
Consider Background Sync API on web to handle offline queue persisting after page close (out of scope for MVP).

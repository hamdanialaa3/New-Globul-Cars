Plan: Port Web Search + Fix Bidirectional Profile Sync
TL;DR — Port the full web /cars advanced search experience to the mobile search tab, filling 40+ missing filters and adding smart search, pagination, and debouncing. Simultaneously fix the bidirectional profile sync issue (mobile→web stale displayName) by having the web's AuthProvider read from Firestore on login and set up a real-time userProfile listener. Also fix 3 database collection naming discrepancies between platforms (savedSearches, Algolia index, searchHistory).

Part A: Fix Bidirectional Profile Sync (Critical)
Root cause: Web AuthContext exposes only the Firebase Auth User object. When mobile updates displayName in Firestore, the web never reads it — auth.currentUser.displayName stays stale.

Steps

Add userProfile state to web AuthProvider — in auth-context.ts, add userProfile: BulgarianUser | null to AuthContextType. In AuthProvider.tsx, after setCurrentUser(user), set up onSnapshot(doc(db, 'users', user.uid)) that writes to setUserProfile() state. This gives every web component real-time access to Firestore profile data. Use the isActive guard per repo convention.

Sync Firestore→Auth on web login — in AuthProvider.tsx, after createOrUpdateBulgarianProfile(user) resolves, read the Firestore users/{uid} document. If firestoreDoc.displayName !== user.displayName, call updateProfile(auth.currentUser, { displayName: firestoreDoc.displayName, photoURL: firestoreDoc.photoURL }). This ensures Firebase Auth always matches Firestore.

Replace user.displayName reads across web — audit all web components that use useAuth().user.displayName or currentUser.displayName and switch them to useAuth().userProfile?.displayName ?? user.displayName. Key files: navbar, sidebar, comment widgets, message headers.

Ensure mobile always writes to both Auth + Firestore — verify edit.tsx calls both updateUserProfile(uid, data) and updateProfile(auth.currentUser, { displayName, photoURL }). (Research confirms this is already done — just validate.)

Part B: Fix Database Collection & Index Discrepancies
Saved searches collection name — Web uses savedSearches, mobile uses saved_searches. Change SavedSearchesService.ts to use savedSearches (camelCase, matching web). Migrate any existing mobile saved_searches docs.

Algolia index name — Web uses cars_bg, mobile defaults to cars. In algolia-search.service.ts, change the default fallback from 'cars' to 'cars_bg' to match web.

Search history sync — Web persists to Firestore searchHistory collection. Create a SearchHistoryService for mobile that writes to the same searchHistory collection instead of local AsyncStorage only. Port the structure from search-history.service.ts.

Part C: Expand FilterState + UnifiedFilterEngine
Expand FilterState in UnifiedFilterTypes.ts — add all web-parity fields:

vehicleType, condition, sellerType
powerMin, powerMax, engineSizeMin, engineSizeMax
mileageMin (currently only mileageMax)
doorsMin, doorsMax, seatsMin, seatsMax
exteriorColor, interiorColor, interiorMaterial
equipment: string[] (safety/comfort/infotainment/extras combined)
region, city, radius
Boolean flags: warranty, damaged, vatReclaimable, nonSmoker, withPhotos, withVideo
freeText (for smart keyword search)
Expand UnifiedFilterEngine in UnifiedFilterEngine.ts — add buildSearchQuery() constraints for all new fields: mileageMin/Max range, driveType/color/condition/sellerType exact match, powerMin/Max range, vehicleType, boolean flags as where('field', '==', true), equipment array-contains-any.

Expand Algolia filter builder in useMobileSearch — in useMobileSearch.ts, update the Algolia call to include filters for all new FilterState fields: bodyType, driveType, color, condition, sellerType, vehicleType, + numeric filters for power, engineSize, mileage ranges.

Part D: Build Advanced Search UI (Mobile)
Create AdvancedSearchModal.tsx — new file at mobile_new/src/components/search/AdvancedSearchModal.tsx. Full-screen modal with 7 collapsible sections mirroring web's AdvancedSearchPage:

Section 1 — Basic Data: vehicleType chips, make picker (expand from 10 to 50+ brands), model picker, condition toggle, price range (with quick presets: <5K, 5-15K, 15-30K, 30K+), year range sliders, mileage range
Section 2 — Technical Data: fuelType chips, transmission chips, driveType chips, power range (HP), engine size range (cm³), doors/seats pickers
Section 3 — Exterior: exteriorColor circles (24 colors from sellTypes.ts EXTERIOR_COLORS), parkingSensors toggle
Section 4 — Interior: interiorColor picker, interiorMaterial picker (cloth/leather/alcantara/other), airConditioning toggle
Section 5 — Equipment: checkboxes grouped by category (safety, comfort, infotainment, extras) — reuse EQUIPMENT_CATEGORIES from sellTypes.ts
Section 6 — Offer Details: sellerType chips, warranty/damaged/vatReclaimable/nonSmoker/withPhotos/withVideo toggles
Section 7 — Location: region picker → city picker (from bulgaria-locations.ts), radius slider (50/100/200/500 km)
Create SmartSearchBar.tsx — new file at mobile_new/src/components/search/SmartSearchBar.tsx. Features:

TextInput with debounced input (300ms)
Autocomplete dropdown: recent searches (from Firestore searchHistory), brand/model suggestions (from Algolia getFacets()), category suggestions
Bulgarian synonym support: port key synonym groups from web's BulgarianSynonymsService (makes, fuels, transmissions, body types — Cyrillic↔Latin)
Map smart text to FilterState fields (detect brand names like "бмв" → make: 'BMW')
Create ActiveFiltersBar.tsx — new file at mobile_new/src/components/search/ActiveFiltersBar.tsx. Horizontal scrollable row of active filter chips with "×" to remove each filter individually + "Изчисти всички" button. Shows result count.

Part E: Upgrade useMobileSearch Hook
Add pagination + infinite scroll — in useMobileSearch.ts:

Track page in FilterState, Algolia's page param, and Firestore cursor (startAfter)
loadMore() function increments page and appends results
Expose hasMore boolean
Set default limit to 20 (from 50)
Add debouncing — wrap search() in a 300ms debounce to prevent firing on every keystroke/filter toggle.

Add smart text search — replace the model-only mapping with a freeText field that feeds into both Algolia's query parameter and a client-side brand/model detector (simplified version of web's SmartSearchService).

Add search result caching — in-memory Map<string, { results, timestamp }> with 5-minute TTL keyed on serialized filters. Clear on app background.

Part F: Update Search Tab UI
Replace SearchFiltersModal with AdvancedSearchModal — in mobile_new/app/(tabs)/search.tsx/search.tsx), swap the old basic filter modal for the new advanced one. Keep SortModal as-is (already has parity).

Replace basic TextInput with SmartSearchBar — wire SmartSearchBar into the search tab header, connected to useMobileSearch.setSearchQuery() and the new freeText filter.

Add ActiveFiltersBar — render between the search bar and results list, showing all active filters as removable chips.

Add infinite scroll to FlatList — wire onEndReached → useMobileSearch.loadMore(), show footer loading spinner.

Fix advanced-search.tsx route — refactor advanced-search.tsx to use the shared FilterState and navigate to /(tabs)/search with filter params instead of /all-cars.

Part G: Integrate Search History (Firestore-synced)
Create mobile_new/src/services/search/search-history.service.ts — port from web's search-history.service.ts:

Write to Firestore searchHistory subcollection under users/{uid}
CRUD: addSearchEntry(), getRecentSearches(limit), clearHistory()
Used by SmartSearchBar for recent search suggestions
Wire search history into the search flow — in useMobileSearch, after each successful search call searchHistoryService.addSearchEntry({ query, filters, timestamp }).

Part H: Saved Search Alerts Sync
Align SavedSearchesService — in SavedSearchesService.ts, rename collection to savedSearches (camelCase) and ensure field names match web's schema: name, filters (full FilterState object), userId, createdAt, notifyEmail, notifyPush, lastMatchCount.
Part I: Web-Side Hardening
Add userProfile real-time listener — (detailed in step 1-3 above). This is the single most important fix for the "name doesn't update on web" bug.

Audit displayName sources — search all web src files for currentUser.displayName and user.displayName from AuthContext. Replace with userProfile?.displayName fallback chain. Minimally: navbar header, sidebar profile widget, message send headers, comment author display.

Verification

Profile sync test: Update displayName on mobile → verify it appears on web within seconds (without page refresh) via the onSnapshot listener. Then update on web → verify it appears on mobile.
Search parity test: Apply these filters on web: make=BMW, priceMax=30000, fuelType=diesel, transmission=automatic, color=black, condition=used, city=София. Same filters on mobile should return the same results.
Saved search cross-platform: Create a saved search on mobile → verify it appears on web's Saved Searches page.
Algolia index: Verify both platforms query cars_bg index by checking network calls.
Pagination: Scroll to result 20 on mobile → verify next page loads automatically.
Run npm run type-check in mobile_new to validate all new types.
Decisions

Profile data source: Chose option (A) — add Firestore onSnapshot listener in web AuthContext — over option (B) single-read, because it guarantees real-time updates without requiring page reload.
Advanced search UI: Single collapsible-section modal rather than a separate page route, to keep the user within the search tab flow and avoid losing filter state.
Collection naming: Mobile aligns to web's savedSearches (camelCase) since web has more production data.
Algolia index: Mobile aligns to web's cars_bg since that's the configured production index.

مع تكامل الليلي و النهاري من خلال الازرار في الاعدادات ...
Claude Opus 4.6 • 3x


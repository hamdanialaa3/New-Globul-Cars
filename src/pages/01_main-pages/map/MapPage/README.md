# Map Analytics Page - Technical Documentation
# صفحة تحليل الخريطة - التوثيق الفني

## Overview / نظرة عامة

Interactive Bulgaria map showing real-time analytics across 28 provinces for:
- Cars (individual markers from Firestore)
- Users (individual markers from Firestore)
- Workshops (aggregated Google Places)
- Showrooms (aggregated Google Places)
- Dealers (aggregated Google Places)

خريطة بلغاريا التفاعلية تعرض تحليلات لحظية عبر 28 محافظة:
- السيارات (علامات فردية من Firestore)
- المستخدمين (علامات فردية من Firestore)
- الورش (مجمعة من Google Places)
- المعارض (مجمعة من Google Places)
- التجار (مجمعة من Google Places)

---

## Architecture / البنية

### Data Sources / مصادر البيانات

**Firestore Collections:**
- `cars` - Individual car listings with `locationData.cityId`
- `users` - User profiles with `locationData.cityId` or legacy `cityId`

**Google Maps Places API:**
- `car_repair` - Workshops/repair shops
- `car_showroom` - Car showrooms
- `car_dealer` - Car dealers

**Constants:**
- `BULGARIAN_CITIES` - 28 cities with coordinates, localized names, IDs

### Services / الخدمات

**`map-entities.service.ts`**
- `fetchCarsByCity(maxPerCity)` - Fetches all active cars, returns capped entities
- `fetchUsersByCity(maxPerCity)` - Fetches all users, returns capped entities
- `getUserCountsByCity()` - Aggregates user counts per city (for overview)
- `cityIdToCoordinates(cityId)` - Maps city ID to lat/lng

**`regionCarCountService.ts`**
- `getAllRegionCounts(regionIds)` - Cached car counts per region

**`google-maps-enhanced.service.ts`**
- `getPlacesCountByType(coords, type, radius, maxPages)` - Paginated Places search

---

## Performance Strategy / استراتيجية الأداء

### 1. Lazy Loading / التحميل الكسول
- Cars/users: Load on layer activation
- Places (workshops/showrooms/dealers): Load on first toggle
- Prevents unnecessary API calls for inactive layers

### 2. Caching / التخزين المؤقت

**Daily Cache (localStorage):**
```javascript
Key: `places_cache_${YYYY-MM-DD}`
Value: { [cityId]: { workshops, showrooms, dealers } }
```
- Expires at midnight (new date key)
- Shared across all cities in single object
- Reduces quota usage 97%+

**Session Cache:**
- Car/user entities cached in component state after first fetch
- Reused when toggling back to same layer

### 3. Concurrency Control / التحكم بالتوازي
- Max 4 concurrent Places requests (worker queue)
- Progressive rendering: Updates UI every 3 cities during fetch
- Prevents rate limiting and browser freezing

### 4. Request Optimization / تحسين الطلبات
- Reduced radius: 12km (from 15km) - balances coverage vs cost
- Limited pagination: maxPages=1 - caps results per location
- Parallel batches: Fetches 3 types simultaneously per city

---

## UI/UX Design / تصميم الواجهة

### Single Active Layer (Mutually Exclusive)
- Only one layer visible at a time: `activeLayer` state
- Radio-like behavior: Clicking active layer doesn't deactivate
- Ensures clarity and performance (no rendering overlaps)

### Visual Hierarchy / التدرج البصري

**Cars** - Orange markers (#e36414)
**Users** - Blue markers (#1d4ed8)
**Workshops** - Green circles (#16a34a)
**Showrooms** - Indigo circles (#6366f1)
**Dealers** - Amber circles (#ff8f10)

### Marker Strategy / استراتيجية العلامات

**Individual Entities (cars/users):**
- Small circle markers (radius: 5px)
- Jitter function: Deterministic offset based on ID hash
  - Prevents exact overlaps at city center
  - Maintains consistency across renders
- Tooltips: Layer name + city ID

**Aggregated Counts (places):**
- Dynamic radius: `sqrt(count) * 2.8` (range: 10-46px)
- Gradient fill opacity scales with count
- Tooltips: City name + count

### Accessibility / إمكانية الوصول
- `role="radiogroup"` on controls bar
- `aria-checked` on active layer button
- `aria-pressed` for details toggle
- Keyboard navigation support
- Screen reader labels (BG/EN)

---

## Analytics Events / الأحداث التحليلية

**Tracked via Google Analytics:**

1. **`map_page_view`**
   - Fires on component mount
   - Payload: `{ timestamp }`

2. **`map_layer_toggle`**
   - Fires when switching layers
   - Payload: `{ layer, previous }`

3. **`map_layer_load`**
   - Fires after Places data loads
   - Payload: `{ layer, duration_ms }`

4. **Future Events:**
   - `map_marker_click` - User clicks car/user marker
   - `cache_hit` / `cache_miss` - Cache performance
   - `map_search` - If search functionality added

---

## Translation Keys / مفاتيح الترجمة

Located in `locales/translations.ts` under `mapPage` namespace:

```typescript
mapPage: {
  title: { bg: "...", en: "..." },
  subtitle: { bg: "...", en: "..." },
  layerCars: { bg: "Автомобили", en: "Cars" },
  layerUsers: { bg: "Потребители", en: "Users" },
  layerWorkshops: { bg: "Автосервизи", en: "Workshops" },
  layerShowrooms: { bg: "Автокъщи", en: "Showrooms" },
  layerDealers: { bg: "Търговци", en: "Dealers" },
  toggleDetails: { bg: "Детайли", en: "Details" },
  legendTitle: { bg: "Легенда", en: "Legend" },
  lastUpdated: { bg: "Обновено", en: "Updated" },
  loading: { bg: "Зареждане...", en: "Loading..." },
  carsCountLabel: { bg: "Автомобили", en: "Cars" },
  usersCountLabel: { bg: "Потребители", en: "Users" }
}
```

---

## Future Enhancements / التحسينات المستقبلية

### Performance
- [ ] Backend aggregation Cloud Function (scheduled daily)
  - Pre-compute Places counts
  - Store in Firestore `analytics/map/cities/{cityId}`
  - Reduces client-side API calls to zero
- [ ] IndexedDB for offline support
- [ ] WebWorker for marker calculations

### Features
- [ ] Search/filter by city name
- [ ] Time-based comparison (show growth trends)
- [ ] Heatmap view (density gradient)
- [ ] Export data as CSV/JSON
- [ ] Deep links to specific layers

### Analytics
- [ ] Conversion funnel: Map view → Car details → Contact
- [ ] Most viewed cities/layers
- [ ] Average session duration on map
- [ ] A/B test different marker styles

---

## Maintenance Notes / ملاحظات الصيانة

**Cache Invalidation:**
- Daily cache auto-expires (date-based key)
- Manual clear: `localStorage.removeItem('places_cache_YYYY-MM-DD')`
- Consider Cloud Function to refresh cache at 3 AM

**Quota Management:**
- Google Places: 1000 free requests/month
- Current usage: ~28 cities × 3 types = 84 requests (first load)
- With daily cache: ~2520 requests/month (84/day × 30)
- Monitor via Google Cloud Console

**Error Handling:**
- Failed Firestore queries: Falls back to empty array
- Places API errors: Skips city, continues queue
- Network timeout: User can retry by toggling layer

**Testing:**
- Use Firebase Emulator for Firestore queries
- Mock Places API in tests (avoid quota usage)
- Visual regression tests for marker rendering

---

## Related Files / الملفات ذات الصلة

- **Component:** `MapPage/index.tsx`
- **Styles:** Inline styled-components
- **Animations:** `map-animations.css`
- **Services:**
  - `map-entities.service.ts`
  - `regionCarCountService.ts`
  - `google-maps-enhanced.service.ts`
- **Constants:** `bulgarianCities.ts`
- **Translations:** `locales/translations.ts`

---

## Performance Benchmarks / مقاييس الأداء

**Initial Load (cars layer):**
- Firestore query: ~800-1200ms (28 cities aggregation)
- Render 500 markers: ~150-250ms
- Total: ~1-1.5s

**Layer Switch (workshops, first time):**
- Places API (28 cities, cached): ~100-300ms (cache hit)
- Places API (28 cities, no cache): ~8-12s (with concurrency limit)
- Render circles: ~50-100ms

**Layer Switch (cars → users):**
- State change: <16ms (React render)
- Marker swap: ~100-200ms (DOM updates)

**Memory Usage:**
- Component state: ~2-4 MB (500-1000 entities)
- Leaflet instance: ~8-12 MB
- Total: ~15-20 MB (acceptable for modern browsers)

---

**Last Updated:** November 21, 2025  
**Version:** 1.0.0  
**Author:** Copilot + Development Team

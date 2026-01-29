# 🔥 Favorites System - Quick Reference

## Files in this folder
- `UserFavoritesPage.tsx` - Main favorites page with filters
- `FavoritesRedirectPage.tsx` - Auto-redirect to user's favorites

## Routes
```
/favorites                       → FavoritesRedirectPage (auto-redirect)
/profile/{numericId}/favorites   → UserFavoritesPage
/profile/favorites               → UserFavoritesPage (current user)
```

## Related Files
- `src/services/favorites.service.ts` - Firestore integration
- `src/components/CarCardWithFavorites.tsx` - Reusable card with heart button

## Full Documentation
See: `/docs/FAVORITES_SYSTEM.md`

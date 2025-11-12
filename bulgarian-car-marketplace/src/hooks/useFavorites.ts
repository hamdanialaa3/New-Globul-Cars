// useFavorites Hook
// Premium React Hook for Favorites Management

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import favoritesService, {
  FavoriteCar,
  FavoriteCarData
} from '@/services/favoritesService';
import { toast } from 'react-toastify';
import { logger } from '@/services/logger-service';

export const useFavorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load favorites
  const loadFavorites = useCallback(async () => {
    if (!user?.uid) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userFavorites = await favoritesService.getUserFavorites(user.uid);
      setFavorites(userFavorites);
    } catch (err) {
      logger.error('[useFavorites] Error loading favorites', err as Error, { userId: user?.uid });
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Load on mount and user change
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Check if car is favorite
  const isFavorite = useCallback((carId: string): boolean => {
    return favorites.some(fav => fav.carId === carId);
  }, [favorites]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (
    carId: string,
    carData?: FavoriteCarData
  ): Promise<boolean> => {
    // Check if user is logged in
    if (!user?.uid) {
      toast.info('Please login to add favorites');
      navigate('/login');
      return false;
    }

    try {
      const isNowFavorite = await favoritesService.toggleFavorite(
        user.uid,
        carId,
        carData
      );

      if (isNowFavorite) {
        toast.success('❤️ Added to favorites!', {
          position: 'bottom-right'
        });
      } else {
        toast.info('Removed from favorites', {
          position: 'bottom-right'
        });
      }

      // Reload favorites
      await loadFavorites();
      return isNowFavorite;
    } catch (err) {
      logger.error('[useFavorites] Error toggling favorite', err as Error, { userId: user?.uid, carId });
      toast.error('Failed to update favorites');
      return false;
    }
  }, [user?.uid, navigate, loadFavorites]);

  // Remove favorite
  const removeFavorite = useCallback(async (carId: string): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      await favoritesService.removeFavorite(user.uid, carId);
      toast.success('Removed from favorites');
      
      // Update local state
      setFavorites(prev => prev.filter(f => f.carId !== carId));
      return true;
    } catch (err) {
      logger.error('[useFavorites] Error removing favorite', err as Error, { userId: user?.uid, carId });
      toast.error('Failed to remove favorite');
      return false;
    }
  }, [user?.uid]);

  // Add note
  const addNote = useCallback(async (
    favoriteId: string,
    note: string
  ): Promise<boolean> => {
    try {
      await favoritesService.addNote(favoriteId, note);
      toast.success('Note added');
      await loadFavorites();
      return true;
    } catch (err) {
      logger.error('[useFavorites] Error adding note', err as Error, { favoriteId });
      toast.error('Failed to add note');
      return false;
    }
  }, [loadFavorites]);

  // Get favorites with price drops
  const getPriceDrops = useCallback(async (): Promise<FavoriteCar[]> => {
    if (!user?.uid) return [];

    try {
      return await favoritesService.getFavoritesWithPriceDrops(user.uid);
    } catch (err) {
      logger.error('[useFavorites] Error getting price drops', err as Error, { userId: user?.uid });
      return [];
    }
  }, [user?.uid]);

  return {
    favorites,
    loading,
    error,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    addNote,
    getPriceDrops,
    reload: loadFavorites,
    count: favorites.length
  };
};

export default useFavorites;

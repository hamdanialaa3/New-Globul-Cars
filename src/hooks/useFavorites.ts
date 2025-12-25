// useFavorites Hook
// Premium React Hook for Favorites Management

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { favoritesService, FavoriteItem } from '../services/favorites.service';
import { toast } from 'react-toastify';
import { logger } from '../services/logger-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

interface CarData {
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  sellerNumericId: number;
  carNumericId: number;
  primaryImage?: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
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

  // Get user numeric ID
  const getUserNumericId = async (uid: string): Promise<number> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data().numericId || 0;
      }
      return 0;
    } catch (error) {
      logger.error('[useFavorites] Failed to get user numeric ID', error as Error);
      return 0;
    }
  };

  // Toggle favorite
  const toggleFavorite = useCallback(async (
    carId: string,
    carData?: CarData
  ): Promise<boolean> => {
    // Check if user is logged in
    if (!user?.uid) {
      toast.info('Please login to add favorites');
      // Save car data to localStorage for post-login
      if (carData) {
        localStorage.setItem('pending_favorite', JSON.stringify({ carId, carData }));
      }
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return false;
    }

    try {
      // Get user numeric ID
      const userNumericId = await getUserNumericId(user.uid);

      // Check if car data is provided
      if (!carData) {
        logger.error('[useFavorites] Car data not provided for toggle', new Error('Missing car data'), { carId });
        toast.error('Failed to update favorites - missing car data');
        return false;
      }

      // Call the service with correct parameters
      const isNowFavorite = await favoritesService.toggleFavorite(
        user.uid,
        userNumericId,
        carId,
        carData.carNumericId,
        carData.sellerNumericId,
        {
          make: carData.make,
          model: carData.model,
          year: carData.year,
          price: carData.price,
          currency: carData.currency,
          primaryImage: carData.primaryImage,
          isActive: true
        }
      );

      if (isNowFavorite) {
        toast.success('❤️ Added to favorites!', {
          position: 'bottom-right',
          autoClose: 2000
        });
      } else {
        toast.info('Removed from favorites', {
          position: 'bottom-right',
          autoClose: 2000
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
      await favoritesService.removeFromFavorites(user.uid, carId);
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

  return {
    favorites,
    loading,
    error,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    count: favorites.length,
    reload: loadFavorites
  };
};

export default useFavorites;

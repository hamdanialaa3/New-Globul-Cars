/**
 * Pending Favorite Handler
 * 
 * Automatically handles adding a car to favorites after user logs in
 * Used when user clicks favorite button while not logged in
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuth } from '../contexts/AuthProvider';
import { default as favoritesService } from '../services/favoritesService';
import { logger } from '../services/logger-service';

export const PendingFavoriteHandler: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePendingFavorite = async () => {
      // Only process if user just logged in
      if (!user?.uid) return;

      try {
        // Check for pending favorite in localStorage
        const pendingFavoriteStr = localStorage.getItem('pending_favorite');
        if (!pendingFavoriteStr) return;

        const { carId, carData } = JSON.parse(pendingFavoriteStr);
        
        logger.info('Processing pending favorite', { carId, userId: user.uid });

        // Add to favorites
        await favoritesService.addFavorite(user.uid, carId, carData);
        
        // Clear pending favorite
        localStorage.removeItem('pending_favorite');

        // Show success message
        toast.success('❤️ Car added to your favorites!', {
          position: 'bottom-right',
          autoClose: 3000
        });

        // Get user's numericId for redirect
        const userDoc = await import('../firebase/firebase-config').then(m => 
          import('firebase/firestore').then(f => 
            f.getDoc(f.doc(m.db, 'users', user.uid))
          )
        );

        const numericId = userDoc.data()?.numericId;

        // Redirect to favorites page
        if (numericId) {
          setTimeout(() => {
            navigate(`/profile/${numericId}/favorites`);
          }, 1000); // Small delay so user sees the toast
        } else {
          navigate('/favorites'); // Fallback to redirect page
        }

      } catch (error) {
        logger.error('Failed to process pending favorite', error as Error);
        localStorage.removeItem('pending_favorite'); // Clean up on error
        toast.error('Failed to add car to favorites. Please try again.');
      }
    };

    handlePendingFavorite();
  }, [user, navigate, location]);

  return null; // This component doesn't render anything
};

export default PendingFavoriteHandler;

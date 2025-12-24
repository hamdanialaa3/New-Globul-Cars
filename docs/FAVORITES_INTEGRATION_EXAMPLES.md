// 🔥 Favorites System - Integration Examples
// How to integrate the favorites system into existing components

/**
 * Example 1: Add Heart Button to Existing Car Card
 * Replace your current CarCard with CarCardWithFavorites
 */

// BEFORE:
/*
import CarCard from '@/components/CarCard';

<CarCard car={car} />
*/

// AFTER:
import CarCardWithFavorites from '@/components/CarCardWithFavorites';

<CarCardWithFavorites 
  car={car} 
  onFavoriteChange={(isFavorite) => {
    console.log('Favorite changed:', isFavorite);
  }}
/>

/**
 * Example 2: Use useFavorites Hook
 * For custom implementations
 */

import { useFavorites } from '@/hooks/useFavorites';

function MyComponent() {
  const { 
    favorites,        // All favorites
    isLoading,        // Loading state
    isFavorite,       // Check function
    toggleFavorite,   // Toggle function
    count             // Total count
  } = useFavorites();

  return (
    <div>
      <h2>My Favorites ({count})</h2>
      {favorites.map(fav => (
        <div key={fav.id}>
          {fav.carPreview.make} {fav.carPreview.model}
        </div>
      ))}
    </div>
  );
}

/**
 * Example 3: Add Favorites Link to Header
 */

import { useAuth } from '@/contexts/AuthProvider';
import { Link } from 'react-router-dom';

function Header() {
  const { user } = useAuth();

  return (
    <nav>
      {user && (
        <Link to="/favorites">
          ❤️ My Favorites
        </Link>
      )}
    </nav>
  );
}

/**
 * Example 4: Custom Heart Button
 * If you want full control
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { favoritesService } from '@/services/favorites.service';
import { Heart } from 'lucide-react';

function CustomHeartButton({ car }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    try {
      await favoritesService.toggleFavorite(user.uid, car);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleToggle} disabled={isLoading}>
      <Heart 
        fill={isFavorite ? '#ff3b30' : 'none'} 
        color="#ff3b30" 
      />
    </button>
  );
}

/**
 * Example 5: Add Favorites Tab to Profile
 * Already integrated in NumericProfileRouter!
 */

// Just navigate to:
// /profile/{numericId}/favorites

// Or for current user:
// /profile/favorites

/**
 * Example 6: Direct Service Usage
 * For advanced use cases
 */

import { favoritesService } from '@/services/favorites.service';

async function advancedUsage() {
  const userId = 'abc123';
  const car = { id: 'car123', /* ... */ };

  // Add to favorites
  await favoritesService.addToFavorites(userId, car);

  // Remove from favorites
  await favoritesService.removeFromFavorites(userId, 'car123');

  // Check if favorite
  const isFav = await favoritesService.isFavorite(userId, 'car123');

  // Get all favorites
  const favorites = await favoritesService.getUserFavorites(userId);

  // Batch check (efficient for lists)
  const carIds = ['car1', 'car2', 'car3'];
  const favMap = await favoritesService.checkMultipleFavorites(userId, carIds);
  console.log(favMap.get('car1')); // true/false

  // Cleanup deleted cars (admin/cron)
  await favoritesService.cleanupDeletedCarFavorites();
}

/**
 * Example 7: Update FeaturedCars Component
 * Show heart button on featured cars
 */

// File: src/components/FeaturedCars.tsx

import CarCardWithFavorites from '@/components/CarCardWithFavorites';

function FeaturedCars() {
  const [featuredCars, setFeaturedCars] = useState([]);

  return (
    <div className="featured-cars-grid">
      {featuredCars.map(car => (
        <CarCardWithFavorites 
          key={car.id} 
          car={car} 
        />
      ))}
    </div>
  );
}

/**
 * Example 8: Add Favorites Count Badge
 */

import { useFavorites } from '@/hooks/useFavorites';

function FavoritesButton() {
  const { count } = useFavorites();

  return (
    <Link to="/favorites">
      <Heart />
      {count > 0 && <span className="badge">{count}</span>}
    </Link>
  );
}

/**
 * Example 9: Conditional Rendering
 * Show different UI based on favorite status
 */

import { useFavorites } from '@/hooks/useFavorites';

function CarActions({ car }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(car.id);

  return (
    <div>
      <button onClick={() => toggleFavorite(car)}>
        {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>
      
      {isFav && (
        <p>✅ This car is in your favorites!</p>
      )}
    </div>
  );
}

/**
 * Example 10: Error Handling
 */

import { useFavorites } from '@/hooks/useFavorites';

function FavoritesWithError() {
  const { favorites, isLoading, error, refresh } = useFavorites();

  if (isLoading) return <div>Loading favorites...</div>;
  
  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={refresh}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      {favorites.map(fav => (
        <div key={fav.id}>
          {fav.carPreview.make} {fav.carPreview.model}
        </div>
      ))}
    </div>
  );
}

export default {};

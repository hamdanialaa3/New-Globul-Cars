// Favorite Button Component
// Premium Heart Button with Animation

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '@globul-cars/coreuseFavorites';
import { FavoriteCarData } from '@globul-cars/services/favoritesService';
import './FavoriteButton.css';

interface FavoriteButtonProps {
  carId: string;
  carData: FavoriteCarData;
  size?: number;
  className?: string;
  showText?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  carId,
  carData,
  size = 24,
  className = '',
  showText = false
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const favorite = isFavorite(carId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    // Toggle favorite
    await toggleFavorite(carId, carData);
  };

  return (
    <button
      onClick={handleClick}
      className={`favorite-button ${favorite ? 'favorite-button--active' : ''} ${isAnimating ? 'favorite-button--animating' : ''} ${className}`}
      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
      title={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={size}
        className={`favorite-icon ${favorite ? 'favorite-icon--filled' : ''}`}
        fill={favorite ? 'currentColor' : 'none'}
      />
      {showText && (
        <span className="favorite-text">
          {favorite ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;

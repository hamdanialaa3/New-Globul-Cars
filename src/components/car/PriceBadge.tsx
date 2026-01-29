/**
 * Price Badge Component - عرض تقييم السعر
 * Shows if a car is a "Super Deal", "Fair Price", or "Overpriced"
 * Based on market comparison algorithm
 * 
 * @since December 2025
 */

import React from 'react';
import styled from 'styled-components';
import { 
  calculateDealRating, 
  getRatingBadgeText, 
  getRatingBadgeColor,
  formatPrice,
  type DealRating,
  type PriceRatingResult,
  type MarketStats 
} from '../../utils/price-rating';

interface PriceBadgeProps {
  price: number;
  mileage: number;
  marketStats: MarketStats;
  showDetails?: boolean; // Show savings/overcharge amount
  size?: 'small' | 'medium' | 'large';
}

const PriceBadge: React.FC<PriceBadgeProps> = ({ 
  price, 
  mileage, 
  marketStats,
  showDetails = false,
  size = 'medium'
}) => {
  const rating = calculateDealRating(price, mileage, marketStats);
  const badgeColor = getRatingBadgeColor(rating.rating);
  const badgeText = getRatingBadgeText(rating.rating);

  return (
    <BadgeContainer>
      <Badge color={badgeColor} size={size}>
        {badgeText}
      </Badge>
      
      {showDetails && rating.rating !== 'FAIR' && (
        <Details>
          {rating.rating === 'SUPER_DEAL' && rating.savingsAmount && (
            <Savings>
              Save {formatPrice(rating.savingsAmount)} vs market
            </Savings>
          )}
          {rating.rating === 'OVERPRICED' && rating.overchargeAmount && (
            <Overcharge>
              {formatPrice(rating.overchargeAmount)} above market
            </Overcharge>
          )}
        </Details>
      )}
    </BadgeContainer>
  );
};

// Styled Components
const BadgeContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

const Badge = styled.span<{ color: string; size: string }>`
  display: inline-flex;
  align-items: center;
  padding: ${props => {
    switch (props.size) {
      case 'small': return '4px 8px';
      case 'large': return '8px 16px';
      default: return '6px 12px';
    }
  }};
  border-radius: 12px;
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '0.75rem';
      case 'large': return '1rem';
      default: return '0.875rem';
    }
  }};
  font-weight: 600;
  
  background-color: ${props => {
    switch (props.color) {
      case 'green': return '#10b981';
      case 'red': return '#ef4444';
      case 'blue': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
  
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Details = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
`;

const Savings = styled.span`
  color: #10b981;
`;

const Overcharge = styled.span`
  color: #ef4444;
`;

export default PriceBadge;

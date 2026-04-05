/**
 * UserSearchResultCard
 * Rich card component for displaying user search results
 * Shows avatar, name, account type badge, location, rating, listings count
 */

import React from 'react';
import styled from 'styled-components';
import { Star, MapPin, ShieldCheck, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import type { UserSearchResult } from '../../types/user-search.types';

interface UserSearchResultCardProps {
  user: UserSearchResult;
  compact?: boolean;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAccountColor = (type: string) => {
  switch (type) {
    case 'dealer': return '#059669';
    case 'company': return '#1E3A8A';
    default: return '#EA580C';
  }
};

export const UserSearchResultCard: React.FC<UserSearchResultCardProps> = ({ user, compact = false }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleClick = () => {
    navigate(`/profile/view/${user.numericId}`);
  };

  const accountLabel = language === 'bg'
    ? { private: 'Частно лице', dealer: 'Дилър', company: 'Компания' }[user.accountType] || user.accountType
    : { private: 'Private', dealer: 'Dealer', company: 'Company' }[user.accountType] || user.accountType;

  return (
    <Card onClick={handleClick} $compact={compact}>
      <AvatarWrapper>
        {user.avatarUrl ? (
          <AvatarImage src={user.avatarUrl} alt={user.displayName} loading="lazy" />
        ) : (
          <AvatarFallback $color={getAccountColor(user.accountType)}>
            {getInitials(user.displayName)}
          </AvatarFallback>
        )}
        {user.isOnline && <OnlineDot />}
      </AvatarWrapper>

      <InfoSection>
        <NameRow>
          <UserName>{user.displayName}</UserName>
          {user.isVerified && (
            <VerifiedIcon>
              <ShieldCheck size={16} />
            </VerifiedIcon>
          )}
        </NameRow>

        <AccountBadge $color={getAccountColor(user.accountType)}>
          {accountLabel}
        </AccountBadge>

        {user.city && (
          <LocationRow>
            <MapPin size={13} />
            <span>{user.city}{user.region ? `, ${user.region}` : ''}</span>
          </LocationRow>
        )}

        <StatsRow>
          {user.rating > 0 && (
            <StatItem>
              <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
              <span>{user.rating.toFixed(1)}</span>
              {user.reviewsCount > 0 && (
                <ReviewCount>({user.reviewsCount})</ReviewCount>
              )}
            </StatItem>
          )}
          {user.listingsCount > 0 && (
            <StatItem>
              <Car size={14} />
              <span>{user.listingsCount} {language === 'bg' ? 'обяви' : 'listings'}</span>
            </StatItem>
          )}
        </StatsRow>
      </InfoSection>
    </Card>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Card = styled.div<{ $compact: boolean }>`
  display: flex;
  align-items: center;
  gap: ${p => p.$compact ? '12px' : '16px'};
  padding: ${p => p.$compact ? '12px' : '20px'};
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--accent-primary);
    transform: translateY(-1px);
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const AvatarImage = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
`;

const AvatarFallback = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${p => p.$color}, ${p => p.$color}cc);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
`;

const OnlineDot = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid var(--bg-card);
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const VerifiedIcon = styled.span`
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const AccountBadge = styled.span<{ $color: string }>`
  display: inline-block;
  width: fit-content;
  padding: 2px 8px;
  border-radius: 6px;
  background: ${p => p.$color}15;
  color: ${p => p.$color};
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LocationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-tertiary);
  font-size: 0.825rem;

  svg { flex-shrink: 0; }
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 2px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.825rem;
  color: var(--text-secondary);
`;

const ReviewCount = styled.span`
  color: var(--text-muted);
  font-size: 0.75rem;
`;

export default UserSearchResultCard;

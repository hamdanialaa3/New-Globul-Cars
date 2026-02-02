// ProfileBadges - Visual verification and achievement badges
// Displays trust signals with icons and tooltips

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/hooks/useLanguage';
import { useProfileTheme } from './ProfileShell';
import type { BadgeType, ProfileBadgesProps } from '@/types/profile.types';

/**
 * Badge icon mapping
 * Uses Unicode symbols for broad compatibility
 */
const BADGE_ICONS: Record<BadgeType, string> = {
  phone_verified: '📱',
  identity_verified: '✓', // ✓ or 🆔
  dealer_verified: '🏢',
  company_certified: '✅',
  trusted_seller: '⭐',
};

/**
 * Badge translations
 */
const BADGE_LABELS = {
  bg: {
    phone_verified: 'Потвърден телефон',
    identity_verified: 'Проверена самоличност',
    dealer_verified: 'Проверен дилър',
    company_certified: 'Сертифицирана компания',
    trusted_seller: 'Надежден продавач',
  },
  en: {
    phone_verified: 'Phone Verified',
    identity_verified: 'Identity Verified',
    dealer_verified: 'Dealer Verified',
    company_certified: 'Company Certified',
    trusted_seller: 'Trusted Seller',
  },
};

/**
 * Badge descriptions (for tooltips)
 */
const BADGE_DESCRIPTIONS = {
  bg: {
    phone_verified: 'Телефонният номер е потвърден',
    identity_verified: 'Самоличността е проверена чрез надежден процес',
    dealer_verified: 'Дилърът е одобрен и проверен',
    company_certified: 'Компанията е сертифицирана',
    trusted_seller: 'Няколко положителни отзива от купувачи',
  },
  en: {
    phone_verified: 'Phone number has been verified',
    identity_verified: 'Identity verified through trusted process',
    dealer_verified: 'Dealer approved and verified',
    company_certified: 'Company is certified and registered',
    trusted_seller: 'Multiple positive reviews from buyers',
  },
};

/**
 * Container for badge list
 */
const BadgesContainer = styled.div<{ isHorizontal?: boolean; maxPerRow?: number }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  width: 100%;

  ${(props) =>
    props.isHorizontal &&
    `
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.5rem;
  `}

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 0.5rem;
  }
`;

/**
 * Individual badge styling
 */
const BadgeItem = styled.div<{ isHighlighted?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid ${(props) => (props.isHighlighted ? props.theme.colors.accent : props.theme.colors.borderLight)};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

/**
 * Badge icon
 */
const BadgeIcon = styled.span`
  font-size: 1.75rem;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

/**
 * Badge label text
 */
const BadgeLabel = styled.span<{ isCompact?: boolean }>`
  font-size: ${(props) => (props.isCompact ? '0.75rem' : '0.875rem')};
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;
  line-height: 1.2;
`;

/**
 * Tooltip popup
 */
const Tooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  background: ${(props) => props.theme.colors.textPrimary};
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: ${(props) => props.theme.colors.textPrimary};
  }
`;

/**
 * BadgeWrapper for hover state management
 */
const BadgeWrapper = styled.div`
  position: relative;

  &:hover ${Tooltip} {
    opacity: 1;
  }
`;

/**
 * Badge count indicator for compact view
 */
const BadgeCountBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: ${(props) => props.theme.colors.accent};
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

/**
 * ProfileBadges Component
 * Displays seller verification and achievement badges
 * 
 * Features:
 * - Icon + label display
 * - Tooltips on hover
 * - Compact mode (shows count)
 * - Filterable badges
 * - Accessibility support
 */
const ProfileBadges: React.FC<ProfileBadgesProps> = ({
  badges,
  compact = false,
  maxDisplay = 5,
  onBadgeClick,
  highlightedBadges,
  isHorizontal = false,
}) => {
  const { language } = useLanguage();
  const { accentColor } = useProfileTheme();

  const badgesToDisplay = useMemo(() => {
    if (compact && badges.length > maxDisplay) {
      return badges.slice(0, maxDisplay - 1); // Reserve space for count
    }
    return badges;
  }, [badges, compact, maxDisplay]);

  const hiddenCount = useMemo(() => {
    return badges.length - badgesToDisplay.length;
  }, [badges, badgesToDisplay]);

  if (!badges || badges.length === 0) {
    return null;
  }

  // Compact view with count
  if (compact && badges.length > maxDisplay) {
    return (
      <BadgesContainer isHorizontal={isHorizontal}>
        {badgesToDisplay.map((badge) => (
          <BadgeWrapper key={badge}>
            <BadgeItem
              isHighlighted={highlightedBadges?.includes(badge)}
              onClick={() => onBadgeClick?.(badge)}
              role="button"
              tabIndex={0}
              aria-label={BADGE_LABELS[language]?.[badge] || badge}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onBadgeClick?.(badge);
                }
              }}
            >
              <BadgeIcon>{BADGE_ICONS[badge] || '✓'}</BadgeIcon>
              <BadgeLabel isCompact={true}>
                {BADGE_LABELS[language]?.[badge] || badge}
              </BadgeLabel>
              <Tooltip>{BADGE_DESCRIPTIONS[language]?.[badge] || ''}</Tooltip>
            </BadgeItem>
          </BadgeWrapper>
        ))}

        <BadgeCountBadge
          role="button"
          tabIndex={0}
          aria-label={`${hiddenCount} more badges`}
          title={`${hiddenCount} more badges`}
          onClick={() => {
            // Emit event to expand or navigate to full badge list
            console.info(`[ProfileBadges] Clicked count badge: ${hiddenCount} more`);
          }}
        >
          +{hiddenCount}
        </BadgeCountBadge>
      </BadgesContainer>
    );
  }

  // Full view
  return (
    <BadgesContainer isHorizontal={isHorizontal}>
      {badgesToDisplay.map((badge) => (
        <BadgeWrapper key={badge}>
          <BadgeItem
            isHighlighted={highlightedBadges?.includes(badge)}
            onClick={() => onBadgeClick?.(badge)}
            role="button"
            tabIndex={0}
            aria-label={BADGE_LABELS[language]?.[badge] || badge}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onBadgeClick?.(badge);
              }
            }}
          >
            <BadgeIcon>{BADGE_ICONS[badge] || '✓'}</BadgeIcon>
            <BadgeLabel>
              {BADGE_LABELS[language]?.[badge] || badge}
            </BadgeLabel>
            <Tooltip>{BADGE_DESCRIPTIONS[language]?.[badge] || ''}</Tooltip>
          </BadgeItem>
        </BadgeWrapper>
      ))}
    </BadgesContainer>
  );
};

ProfileBadges.displayName = 'ProfileBadges';

export default ProfileBadges;

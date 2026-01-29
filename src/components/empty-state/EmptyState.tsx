/**
 * Empty State Components
 * Reusable components for displaying empty states across the app
 * 
 * @author CTO
 * @version 1.0
 * @since January 9, 2026
 */

import React from 'react';
import styled from 'styled-components';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.background.light} 0%, ${props => props.theme.colors.background.lighter} 100%);
  border-radius: 12px;
  min-height: 300px;

  @media (max-width: 768px) {
    padding: 40px 20px;
    min-height: 250px;
  }
`;

const IconWrapper = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.6;

  @media (max-width: 768px) {
    font-size: 48px;
    margin-bottom: 16px;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.text.primary};
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const Description = styled.p`
  font-size: 14px;
  color: ${props => props.theme.text.secondary};
  margin: 0 0 24px 0;
  max-width: 400px;
  line-height: 1.5;
`;

const ActionButton = styled.button`
  padding: 10px 24px;
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.colors.primary.main}DD;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 14px;
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: ${props => props.theme.colors.border.default};
  color: ${props => props.theme.text.primary};
  margin-left: 8px;

  &:hover {
    background: ${props => props.theme.colors.background.default};
  }
`;

// ============================================================================
// BASE EMPTY STATE COMPONENT
// ============================================================================

export interface EmptyStateProps {
  icon?: React.ReactNode | string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  action,
  secondaryAction
}) => {
  return (
    <EmptyStateContainer>
      <IconWrapper>{icon}</IconWrapper>
      <Title>{title}</Title>
      <Description>{description}</Description>
      <div style={{ display: 'flex', gap: '8px' }}>
        {action && (
          <ActionButton onClick={action.onClick}>
            {action.label}
          </ActionButton>
        )}
        {secondaryAction && (
          <SecondaryButton onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </SecondaryButton>
        )}
      </div>
    </EmptyStateContainer>
  );
};

// ============================================================================
// SPECIFIC EMPTY STATE COMPONENTS
// ============================================================================

export interface NoFavoritesProps {
  onExplore?: () => void;
}

export const NoFavorites: React.FC<NoFavoritesProps> = ({ onExplore }) => (
  <EmptyState
    icon="❤️"
    title="No Favorites Yet"
    description="Start saving your favorite cars to compare and track them later"
    action={
      onExplore
        ? {
            label: 'Explore Cars',
            onClick: onExplore
          }
        : undefined
    }
  />
);

export interface NoResultsProps {
  query?: string;
  onReset?: () => void;
  onExplore?: () => void;
}

export const NoResults: React.FC<NoResultsProps> = ({ query, onReset, onExplore }) => (
  <EmptyState
    icon="🔍"
    title={`No Results Found${query ? ` for "${query}"` : ''}`}
    description="Try adjusting your filters or search criteria to find what you're looking for"
    action={
      onReset
        ? {
            label: 'Clear Filters',
            onClick: onReset
          }
        : undefined
    }
    secondaryAction={
      onExplore
        ? {
            label: 'Browse All',
            onClick: onExplore
          }
        : undefined
    }
  />
);

export interface NoMessagesProps {
  onExplore?: () => void;
}

export const NoMessages: React.FC<NoMessagesProps> = ({ onExplore }) => (
  <EmptyState
    icon="💬"
    title="No Messages Yet"
    description="Start a conversation with sellers or buyers to discuss cars"
    action={
      onExplore
        ? {
            label: 'Browse Cars',
            onClick: onExplore
          }
        : undefined
    }
  />
);

export interface NoListingsProps {
  profileType: 'free' | 'dealer' | 'company';
  onCreateListing?: () => void;
}

export const NoListings: React.FC<NoListingsProps> = ({ profileType, onCreateListing }) => {
  const limitText = {
    free: 'You can list up to 3 cars',
    dealer: 'You can list up to 30 cars',
    company: 'You can list unlimited cars'
  }[profileType];

  return (
    <EmptyState
      icon="🚗"
      title="No Listings Yet"
      description={`${limitText}. Start selling by creating your first listing`}
      action={
        onCreateListing
          ? {
              label: 'Create Listing',
              onClick: onCreateListing
            }
          : undefined
      }
    />
  );
};

export interface NoNotificationsProps {
  onGoHome?: () => void;
}

export const NoNotifications: React.FC<NoNotificationsProps> = ({ onGoHome }) => (
  <EmptyState
    icon="🔔"
    title="No Notifications"
    description="You're all caught up! New messages and updates will appear here"
    action={
      onGoHome
        ? {
            label: 'Go to Home',
            onClick: onGoHome
          }
        : undefined
    }
  />
);

export interface NoStoriesProps {
  onExplore?: () => void;
}

export const NoStories: React.FC<NoStoriesProps> = ({ onExplore }) => (
  <EmptyState
    icon="📸"
    title="No Stories Available"
    description="Check back soon for updates from sellers and the community"
    action={
      onExplore
        ? {
            label: 'Explore Listings',
            onClick: onExplore
          }
        : undefined
    }
  />
);

export interface NoReviewsProps {
  onBrowse?: () => void;
}

export const NoReviews: React.FC<NoReviewsProps> = ({ onBrowse }) => (
  <EmptyState
    icon="⭐"
    title="No Reviews Yet"
    description="This seller doesn't have any reviews yet. Be the first to share your experience"
    action={
      onBrowse
        ? {
            label: 'View Listings',
            onClick: onBrowse
          }
        : undefined
    }
  />
);

export interface NoPurchasesProps {
  onShop?: () => void;
}

export const NoPurchases: React.FC<NoPurchasesProps> = ({ onShop }) => (
  <EmptyState
    icon="🛒"
    title="No Purchase History"
    description="You haven't made any purchases yet. Start exploring cars now"
    action={
      onShop
        ? {
            label: 'Start Shopping',
            onClick: onShop
          }
        : undefined
    }
  />
);

export interface NoSalesProps {
  onCreateListing?: () => void;
}

export const NoSales: React.FC<NoSalesProps> = ({ onCreateListing }) => (
  <EmptyState
    icon="📊"
    title="No Sales Yet"
    description="Create listings to start selling cars and track your sales performance"
    action={
      onCreateListing
        ? {
            label: 'Create Listing',
            onClick: onCreateListing
          }
        : undefined
    }
  />
);

// ============================================================================
// ERROR STATE VARIANTS
// ============================================================================

export interface LoadingErrorProps {
  onRetry?: () => void;
  onGoBack?: () => void;
}

export const LoadingError: React.FC<LoadingErrorProps> = ({ onRetry, onGoBack }) => (
  <EmptyState
    icon="⚠️"
    title="Failed to Load"
    description="Something went wrong while loading this content. Please try again"
    action={
      onRetry
        ? {
            label: 'Retry',
            onClick: onRetry
          }
        : undefined
    }
    secondaryAction={
      onGoBack
        ? {
            label: 'Go Back',
            onClick: onGoBack
          }
        : undefined
    }
  />
);

export interface NoAccessProps {
  onGoHome?: () => void;
}

export const NoAccess: React.FC<NoAccessProps> = ({ onGoHome }) => (
  <EmptyState
    icon="🔒"
    title="Access Denied"
    description="You don't have permission to view this content"
    action={
      onGoHome
        ? {
            label: 'Go to Home',
            onClick: onGoHome
          }
        : undefined
    }
  />
);

// ============================================================================
// OFFLINE STATE
// ============================================================================

export interface OfflineStateProps {
  onRetry?: () => void;
}

export const OfflineState: React.FC<OfflineStateProps> = ({ onRetry }) => (
  <EmptyState
    icon="📡"
    title="You're Offline"
    description="Please check your internet connection and try again"
    action={
      onRetry
        ? {
            label: 'Try Again',
            onClick: onRetry
          }
        : undefined
    }
  />
);

// ============================================================================
// MAINTENANCE STATE
// ============================================================================

export interface MaintenanceStateProps {
  message?: string;
  estimatedTime?: string;
}

export const MaintenanceState: React.FC<MaintenanceStateProps> = ({
  message = 'We are performing maintenance',
  estimatedTime
}) => (
  <EmptyState
    icon="🔧"
    title="Under Maintenance"
    description={`${message}${estimatedTime ? `. Expected back online: ${estimatedTime}` : ''}`}
  />
);

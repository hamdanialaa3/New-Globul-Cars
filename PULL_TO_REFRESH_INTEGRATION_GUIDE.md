# Pull-to-Refresh Integration Guide

## Overview
This guide demonstrates how to integrate pull-to-refresh functionality using the existing `usePullToRefresh` hook across key pages.

## Implementation Status
- ✅ Hook Created: `src/hooks/useMobileInteractions.ts` (Session 5)
- ⏳ Integration Needed: MessagesPage, NotificationsPage, Story Feed, MyListingsPage

## Hook Usage Pattern

```typescript
import { usePullToRefresh } from '@/hooks/useMobileInteractions';

const { pulling, refreshing } = usePullToRefresh(
  containerRef,
  async () => {
    // Refresh logic here
    await fetchData();
  }
);
```

## Example 1: MessagesPage Integration

### File: `src/pages/03_user-pages/MessagesPage.tsx`

```typescript
// Add imports
import { usePullToRefresh } from '@/hooks/useMobileInteractions';

// Inside component
const MessagesPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Add pull-to-refresh
  const { pulling, refreshing } = usePullToRefresh(
    containerRef,
    async () => {
      // Refresh conversations
      await loadConversations();
      toast.success('Conversations refreshed');
    }
  );

  return (
    <MessagesContainer ref={containerRef}>
      {/* Existing content */}
      {(pulling || refreshing) && (
        <RefreshIndicator>
          {refreshing ? 'Refreshing...' : 'Pull to refresh'}
        </RefreshIndicator>
      )}
      {/* Rest of page */}
    </MessagesContainer>
  );
};
```

### Styled Component for Indicator

```typescript
const RefreshIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 0 0 12px 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  z-index: 1000;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.2s ease-in;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;
```

## Example 2: NotificationsPage Integration

### File: `src/pages/[notifications-location]/NotificationsPage.tsx`

```typescript
import { usePullToRefresh } from '@/hooks/useMobileInteractions';
import { RefreshCw } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    // Fetch notifications logic
    const data = await notificationService.getNotifications(userId);
    setNotifications(data);
  };

  const { pulling, refreshing } = usePullToRefresh(
    containerRef,
    async () => {
      await fetchNotifications();
    }
  );

  return (
    <NotificationsContainer ref={containerRef}>
      <Header>
        <Title>Notifications</Title>
        {refreshing && (
          <RefreshIcon>
            <RefreshCw size={20} className="spinning" />
          </RefreshIcon>
        )}
      </Header>

      {pulling && !refreshing && (
        <PullIndicator>
          <ArrowDown size={20} />
          Pull to refresh
        </PullIndicator>
      )}

      {/* Notifications list */}
    </NotificationsContainer>
  );
};

const RefreshIcon = styled.div`
  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
```

## Example 3: Story Feed Integration

### File: `src/pages/[story-feed-location]/StoryFeedPage.tsx`

```typescript
import { usePullToRefresh } from '@/hooks/useMobileInteractions';

const StoryFeedPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stories, setStories] = useState<Story[]>([]);

  const refreshStories = async () => {
    const freshStories = await storyService.getLatestStories();
    setStories(freshStories);
    toast.success('Feed refreshed');
  };

  const { pulling, refreshing } = usePullToRefresh(
    containerRef,
    refreshStories
  );

  return (
    <FeedContainer ref={containerRef}>
      {/* Pull indicator */}
      {pulling && (
        <PullToRefreshOverlay>
          <ArrowDown size={24} />
          <Text>Release to refresh</Text>
        </PullToRefreshOverlay>
      )}

      {/* Loading spinner during refresh */}
      {refreshing && (
        <RefreshingOverlay>
          <Spinner />
          <Text>Refreshing stories...</Text>
        </RefreshingOverlay>
      )}

      {/* Story feed content */}
      <StoriesGrid>
        {stories.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </StoriesGrid>
    </FeedContainer>
  );
};
```

## Example 4: MyListingsPage Integration

### File: `src/pages/03_user-pages/MyListingsPage.tsx`

```typescript
import { usePullToRefresh } from '@/hooks/useMobileInteractions';

const MyListingsPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [listings, setListings] = useState<CarListing[]>([]);

  const { pulling, refreshing } = usePullToRefresh(
    containerRef,
    async () => {
      // Refresh user's car listings
      const freshListings = await unifiedCarService.getUserListings(userId);
      setListings(freshListings);
    }
  );

  return (
    <ListingsContainer ref={containerRef}>
      <Header>
        <Title>My Listings</Title>
        <Badge>{listings.length} cars</Badge>
      </Header>

      {/* Simple pull indicator */}
      <PullToRefreshBar visible={pulling || refreshing}>
        {refreshing ? 'Refreshing...' : 'Pull to refresh'}
      </PullToRefreshBar>

      {/* Listings grid */}
      <ListingsGrid>
        {listings.map(car => (
          <CarCard key={car.id} car={car} />
        ))}
      </ListingsGrid>
    </ListingsContainer>
  );
};

const PullToRefreshBar = styled.div<{ visible: boolean }>`
  display: ${({ visible }) => visible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(59, 130, 246, 0.1)' 
    : 'rgba(59, 130, 246, 0.05)'};
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(59, 130, 246, 0.2)' 
    : 'rgba(59, 130, 246, 0.1)'};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  font-weight: 500;
`;
```

## Reusable Components

### PullToRefreshIndicator.tsx

```typescript
/**
 * Reusable Pull-to-Refresh Indicator
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ArrowDown, RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pulling: boolean;
  refreshing: boolean;
  pullingText?: string;
  refreshingText?: string;
}

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'};
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'};
  backdrop-filter: blur(10px);
  z-index: 100;
`;

const Icon = styled.div<{ animating: 'bounce' | 'spin' }>`
  margin-right: 8px;
  animation: ${({ animating }) => animating === 'bounce' ? bounce : spin} 
    ${({ animating }) => animating === 'bounce' ? '1s' : '1s'} 
    ease-in-out infinite;
  color: ${({ theme }) => theme.colors.primary};
`;

const Text = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pulling,
  refreshing,
  pullingText = 'Pull to refresh',
  refreshingText = 'Refreshing...'
}) => {
  if (!pulling && !refreshing) return null;

  return (
    <Container>
      <Icon animating={refreshing ? 'spin' : 'bounce'}>
        {refreshing ? <RefreshCw size={20} /> : <ArrowDown size={20} />}
      </Icon>
      <Text>
        {refreshing ? refreshingText : pullingText}
      </Text>
    </Container>
  );
};
```

## Usage with Reusable Component

```typescript
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator';

const MyPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { pulling, refreshing } = usePullToRefresh(
    containerRef,
    async () => {
      await fetchData();
    }
  );

  return (
    <Container ref={containerRef}>
      <PullToRefreshIndicator 
        pulling={pulling} 
        refreshing={refreshing}
        pullingText="Pull to refresh messages"
        refreshingText="Loading new messages..."
      />
      {/* Content */}
    </Container>
  );
};
```

## Best Practices

1. **Always use useRef**: Container needs ref for touch detection
2. **Async callbacks**: Refresh function must be async
3. **User feedback**: Show clear visual indicators (pulling/refreshing states)
4. **Mobile-only**: Consider hiding on desktop with `@media (min-width: 769px)`
5. **Toast notifications**: Optional success message after refresh
6. **Error handling**: Wrap refresh logic in try-catch

## Common Patterns

### Pattern 1: With Toast Notification
```typescript
const { pulling, refreshing } = usePullToRefresh(
  containerRef,
  async () => {
    try {
      await fetchData();
      toast.success('Data refreshed');
    } catch (error) {
      toast.error('Failed to refresh');
      logger.error('Refresh failed', error);
    }
  }
);
```

### Pattern 2: With State Update
```typescript
const { pulling, refreshing } = usePullToRefresh(
  containerRef,
  async () => {
    setIsLoading(true);
    const data = await service.getData();
    setData(data);
    setIsLoading(false);
  }
);
```

### Pattern 3: With Analytics
```typescript
const { pulling, refreshing } = usePullToRefresh(
  containerRef,
  async () => {
    analytics.track('pull_to_refresh', { page: 'messages' });
    await fetchData();
  }
);
```

## Next Steps

1. ✅ Create reusable `PullToRefreshIndicator` component
2. ⏳ Integrate in MessagesPage
3. ⏳ Integrate in NotificationsPage
4. ⏳ Integrate in Story Feed
5. ⏳ Integrate in MyListingsPage
6. ⏳ Test on mobile devices
7. ⏳ Add analytics tracking

## Related Files
- Hook: `src/hooks/useMobileInteractions.ts`
- Types: `src/types/mobile.types.ts`
- Mobile Interactions Guide: Session 5 documentation

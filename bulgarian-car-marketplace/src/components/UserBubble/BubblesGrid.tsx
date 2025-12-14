// src/components/UserBubble/BubblesGrid.tsx
// Bubbles Grid Component - Responsive grid layout
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React from 'react';
import styled from 'styled-components';
import UserBubble from './UserBubble';

const GridContainer = styled.div<{ $density: 'comfortable' | 'compact' | 'cozy' }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${p => {
    switch (p.$density) {
      case 'compact': return '80px';
      case 'cozy': return '120px';
      default: return '110px';
    }
  }}, 1fr));
  gap: ${p => {
    switch (p.$density) {
      case 'compact': return '16px';
      case 'cozy': return '32px';
      default: return '24px';
    }
  }};
  justify-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 20px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
`;

interface BubblesGridProps {
  users: unknown[];
  density?: 'comfortable' | 'compact' | 'cozy';
  bubbleSize?: 'small' | 'medium' | 'large';
  followingUsers?: Set<string>;
  onFollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
}

export const BubblesGrid: React.FC<BubblesGridProps> = ({
  users,
  density = 'comfortable',
  bubbleSize = 'medium',
  followingUsers = new Set(),
  onFollow,
  onMessage
}) => {
  return (
    <GridContainer $density={density}>
      {users.map((user) => (
        <UserBubble
          key={user.uid}
          user={user}
          size={bubbleSize}
          isFollowing={followingUsers.has(user.uid)}
          onFollow={() => onFollow?.(user.uid)}
          onMessage={() => onMessage?.(user.uid)}
        />
      ))}
    </GridContainer>
  );
};

export default BubblesGrid;


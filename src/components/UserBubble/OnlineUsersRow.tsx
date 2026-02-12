// src/components/UserBubble/OnlineUsersRow.tsx
// Online Users Row - Horizontal scrollable row
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React from 'react';
import styled from 'styled-components';
import UserBubble from './UserBubble';
import { Wifi } from 'lucide-react';

const Container = styled.div`
  margin-bottom: 32px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: visible; /* ✅ Allow hover card to escape */
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #212529;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .count {
    font-size: 0.85rem;
    color: #6c757d;
    font-weight: 500;
  }
  
  .online-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.8;
    }
  }
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  overflow-y: visible; /* ✅ Allow hover card to show below */
  padding: 8px 0;
  padding-bottom: 320px; /* ✅ Space for hover card */
  margin-bottom: -320px; /* ✅ Collapse extra space */
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 320px; /* ✅ Don't cover hover card area */
    width: 40px;
    background: linear-gradient(90deg, transparent, white);
    pointer-events: none;
  }
`;

interface OnlineUsersRowProps {
  onlineUsers: unknown[];
  followingUsers?: Set<string>;
  onFollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
}

export const OnlineUsersRow: React.FC<OnlineUsersRowProps> = ({
  onlineUsers,
  followingUsers,
  onFollow,
  onMessage
}) => {
  if (onlineUsers.length === 0) return null;
  
  return (
    <Container>
      <Header>
        <h3>
          <Wifi size={20} />
          Active Now
          <span className="online-dot"></span>
        </h3>
        <span className="count">({onlineUsers.length} online)</span>
      </Header>
      
      <ScrollContainer>
        {onlineUsers.map((user: any) => (
          <UserBubble
            key={user.uid}
            user={{ ...user, isOnline: true }}
            size="medium"
            isFollowing={followingUsers?.has(user.uid)}
            onFollow={() => onFollow?.(user.uid)}
            onMessage={() => onMessage?.(user.uid)}
            showHoverCard={true}
          />
        ))}
      </ScrollContainer>
    </Container>
  );
};

export default OnlineUsersRow;


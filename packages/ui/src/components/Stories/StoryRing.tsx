/**
 * StoryRing - Individual story avatar with gradient ring
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import React from 'react';
import styled from 'styled-components';
import { Story } from '@globul-cars/services/social/stories.service';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  flex-shrink: 0;
  width: 80px;
  cursor: pointer;
  text-align: center;
  position: relative;
`;

const RingWrapper = styled.div<{ $viewed: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  padding: 3px;
  background: ${p => p.$viewed 
    ? '#dee2e6' 
    : 'linear-gradient(45deg, #f77737, #ff5722, #ff8a00, #ffb700)'};
  margin-bottom: 8px;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const Avatar = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: ${p => p.$imageUrl 
    ? `url(${p.$imageUrl}) center/cover` 
    : 'linear-gradient(135deg, #FF8F10, #FF7900)'};
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
`;

const Username = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
`;

const ViewCount = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 0.7rem;
  font-weight: 600;
`;

// ==================== COMPONENT ====================

interface StoryRingProps {
  story: Story;
  onClick: () => void;
  currentUserId?: string;
}

const StoryRing: React.FC<StoryRingProps> = ({ story, onClick, currentUserId }) => {
  const isViewed = currentUserId ? story.viewedBy.includes(currentUserId) : false;
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  return (
    <Container onClick={onClick}>
      <RingWrapper $viewed={isViewed}>
        <Avatar $imageUrl={story.authorInfo.profileImage}>
          {!story.authorInfo.profileImage && getInitials(story.authorInfo.displayName)}
        </Avatar>
      </RingWrapper>
      
      {story.viewCount > 0 && (
        <ViewCount>{story.viewCount}</ViewCount>
      )}
      
      <Username>{story.authorInfo.displayName}</Username>
    </Container>
  );
};

export default StoryRing;

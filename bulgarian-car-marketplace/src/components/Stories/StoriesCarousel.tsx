/**
 * StoriesCarousel - Horizontal scrolling stories list
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';
import { storiesService, Story } from '../../services/social/stories.service';
import StoryRing from './StoryRing';
import StoryViewer from './StoryViewer';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  position: relative;
  padding: 20px 0;
  background: white;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 16px;
  
  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #212529;
    margin: 0;
  }
`;

const ScrollContainer = styled.div`
  position: relative;
  overflow: hidden;
  padding: 0 20px;
`;

const StoriesWrapper = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 8px;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f3f5;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #dee2e6;
    border-radius: 3px;
    
    &:hover {
      background: #adb5bd;
    }
  }
`;

const NavButton = styled.button<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${p => p.$position}: 10px;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: white;
  color: #212529;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  z-index: 2;
  
  &:hover {
    background: #f8f9fa;
    transform: translateY(-50%) scale(1.05);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const AddStoryButton = styled.div`
  flex-shrink: 0;
  width: 80px;
  cursor: pointer;
  text-align: center;
  
  &:hover .add-icon {
    background: #FF6900;
    transform: scale(1.05);
  }
`;

const AddIconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF8F10, #FF7900);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.2s;
  cursor: pointer;
  
  svg {
    width: 32px;
    height: 32px;
    color: white;
  }
`;

const AddStoryLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #212529;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
  
  p {
    margin: 0;
    font-size: 0.95rem;
  }
`;

// ==================== COMPONENT ====================

const StoriesCarousel: React.FC = () => {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // ==================== EFFECTS ====================
  
  useEffect(() => {
    if (!user) return;
    
    const loadStories = async () => {
      try {
        setLoading(true);
        const userStories = await storiesService.getFollowedUserStories(user.uid);
        setStories(userStories);
      } catch (error) {
        console.error('Failed to load stories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStories();
  }, [user]);
  
  useEffect(() => {
    const checkScroll = () => {
      if (!scrollRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };
    
    checkScroll();
    scrollRef.current?.addEventListener('scroll', checkScroll);
    
    return () => {
      scrollRef.current?.removeEventListener('scroll', checkScroll);
    };
  }, [stories]);
  
  // ==================== HANDLERS ====================
  
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 300;
    const newScrollLeft = scrollRef.current.scrollLeft + 
      (direction === 'right' ? scrollAmount : -scrollAmount);
    
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };
  
  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    if (user) {
      storiesService.recordView(story.id, user.uid);
    }
  };
  
  const handleCloseViewer = () => {
    setSelectedStory(null);
  };
  
  const handleAddStory = () => {
    // TODO: Open story creator modal
    console.log('Add story clicked');
  };
  
  // ==================== RENDER ====================
  
  if (!user || loading) return null;
  
  if (stories.length === 0) {
    return (
      <Container>
        <Header>
          <h3>Stories</h3>
        </Header>
        <EmptyState>
          <p>No stories to show. Be the first to share!</p>
        </EmptyState>
      </Container>
    );
  }
  
  return (
    <>
      <Container>
        <Header>
          <h3>Stories</h3>
        </Header>
        
        <ScrollContainer>
          {canScrollLeft && (
            <NavButton
              $position="left"
              onClick={() => handleScroll('left')}
            >
              <ChevronLeft />
            </NavButton>
          )}
          
          <StoriesWrapper ref={scrollRef}>
            <AddStoryButton onClick={handleAddStory}>
              <AddIconWrapper className="add-icon">
                <Plus />
              </AddIconWrapper>
              <AddStoryLabel>Your Story</AddStoryLabel>
            </AddStoryButton>
            
            {stories.map(story => (
              <StoryRing
                key={story.id}
                story={story}
                onClick={() => handleStoryClick(story)}
              />
            ))}
          </StoriesWrapper>
          
          {canScrollRight && (
            <NavButton
              $position="right"
              onClick={() => handleScroll('right')}
            >
              <ChevronRight />
            </NavButton>
          )}
        </ScrollContainer>
      </Container>
      
      {selectedStory && (
        <StoryViewer
          story={selectedStory}
          onClose={handleCloseViewer}
        />
      )}
    </>
  );
};

export default StoriesCarousel;

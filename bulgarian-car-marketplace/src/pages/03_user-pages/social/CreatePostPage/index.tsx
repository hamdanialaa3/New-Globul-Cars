// Create Post Page - Full page for creating posts
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import CreatePostForm from '@/components/Posts/CreatePostForm';

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();

  const handlePostCreated = (postId: string) => {
    // Navigate to home page with scroll to feed section
    navigate('/', { 
      state: { 
        newPostId: postId,
        scrollToFeed: true 
      },
      replace: true // Replace history to prevent going back to create post
    });
    
    // Scroll to feed section after navigation
    setTimeout(() => {
      const feedSection = document.querySelector('[class*="FeedSection"]');
      if (feedSection) {
        feedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <CreatePostForm
          onClose={handleClose}
          onPostCreated={handlePostCreated}
        />
      </ContentWrapper>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 0;
    align-items: flex-start;
  }
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  
  @media (max-width: 768px) {
    max-width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: stretch;
    
    > * {
      border-radius: 0;
      max-height: none;
    }
  }
`;

export default CreatePostPage;


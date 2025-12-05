import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

export const CommunityFeedWidget: React.FC = () => {
  const [showFeed, setShowFeed] = useState(true);
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <TitleSection>
          <Title>Social Media & Community</Title>
          <Subtitle>Share, discover, and connect with the car community</Subtitle>
        </TitleSection>
        <ToggleButton onClick={() => setShowFeed(!showFeed)}>
          {showFeed ? 'Hide' : 'Show'} social posts
        </ToggleButton>
      </Header>

      {showFeed && (
        <Content>
          <FeedHeader>
            <FeedTitle>Community Feed</FeedTitle>
            <FeedDesc>Share your stories, discover new cars, and connect with fellow enthusiasts</FeedDesc>
          </FeedHeader>

          <CreatePostBox>
            <Avatar src="https://i.pravatar.cc/150?img=1" alt="User" />
            <Input placeholder="What's on your mind, Alaa Al Hamadani?" readOnly />
          </CreatePostBox>

          <Actions>
            <ActionButton>
              <PhotoIcon />
              <span>Photo</span>
            </ActionButton>
            <ActionButton>
              <VideoIcon />
              <span>Video</span>
            </ActionButton>
            <ActionButton>
              <CarIcon />
              <span>Car</span>
            </ActionButton>
          </Actions>

          <EmptyState>
            <EmptyIcon>📭</EmptyIcon>
            <EmptyTitle>No posts yet</EmptyTitle>
            <EmptyText>Be the first to share something interesting!</EmptyText>
            <CreateButton onClick={() => navigate('/social')}>
              Create First Post
            </CreateButton>
          </EmptyState>

          <Footer>
            <FooterTitle>Community Feed</FooterTitle>
            <FooterText>Latest stories, tips, and insights from the car community</FooterText>
          </Footer>
        </Content>
      )}
    </Container>
  );
};

const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 30px 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e4e6eb;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
`;

const TitleSection = styled.div``;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 6px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #65676b;
  margin: 0;
`;

const ToggleButton = styled.button`
  padding: 8px 16px;
  background: #e7f3ff;
  border: 1px solid #1877f2;
  border-radius: 6px;
  color: #1877f2;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1877f2;
    color: white;
  }
`;

const Content = styled.div`
  padding: 20px;
`;

const FeedHeader = styled.div`
  margin-bottom: 16px;
`;

const FeedTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 6px 0;
`;

const FeedDesc = styled.p`
  font-size: 13px;
  color: #65676b;
  margin: 0;
`;

const CreatePostBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const Input = styled.input`
  flex: 1;
  background: #f0f2f5;
  border: none;
  border-radius: 24px;
  padding: 10px 16px;
  font-size: 14px;
  color: #65676b;
  cursor: pointer;

  &:hover {
    background: #e4e6eb;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e6eb;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    justify-content: space-around;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid #e4e6eb;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #65676b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0f2f5;
  }

  span {
    @media (max-width: 480px) {
      display: none;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
`;

const EmptyTitle = styled.h4`
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 6px 0;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #65676b;
  margin: 0 0 20px 0;
`;

const CreateButton = styled.button`
  padding: 10px 28px;
  background: #1877f2;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #166fe5;
  }
`;

const Footer = styled.div`
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e4e6eb;
  margin-top: 24px;
`;

const FooterTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 6px 0;
`;

const FooterText = styled.p`
  font-size: 13px;
  color: #65676b;
  margin: 0;
`;

const PhotoIcon = () => (
  <svg width="18" height="18" fill="#45bd62" viewBox="0 0 24 24">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
  </svg>
);

const VideoIcon = () => (
  <svg width="18" height="18" fill="#f3425f" viewBox="0 0 24 24">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
  </svg>
);

const CarIcon = () => (
  <svg width="18" height="18" fill="#ff8c00" viewBox="0 0 24 24">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
  </svg>
);


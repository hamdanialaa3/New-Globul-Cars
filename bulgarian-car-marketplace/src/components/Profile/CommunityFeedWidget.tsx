import { logger } from '../../services/logger-service';
// CommunityFeedWidget.tsx - Simple widget for creating and viewing posts in profile
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Image, Video, Car, Plus, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { postsService, Post } from '../../services/social/posts.service';
import PostCard from '../Posts/PostCard';

const Widget = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
`;

const Header = styled.div`
  margin-bottom: 20px;
  
  h3 {
    font-size: 1.3rem;
    font-weight: 700;
    color: #2c2c2c;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
  }
`;

const CreatePostTrigger = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 50px;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  
  &:hover {
    background: #fff;
    border-color: #FF7900;
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.1);
  }
`;

const Avatar = styled.div<{ $url?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid #FF8F10;
  
  ${p => p.$url ? `
    background: url(${p.$url}) center/cover no-repeat;
  ` : `
    background: linear-gradient(135deg, #FF8F10, #FF7900);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  `}
`;

const Placeholder = styled.div`
  flex: 1;
  color: #999;
  font-size: 0.95rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
  
  &:hover {
    background: #f8f9fa;
    border-color: #FF7900;
    color: #FF7900;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const PostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  
  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c2c2c;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 0.9rem;
    color: #666;
    margin: 0 0 20px 0;
  }
`;

const CreateButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #FF7900 0%, #E66D00 100%);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 121, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 121, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

interface CommunityFeedWidgetProps {
  userId: string;
}

const CommunityFeedWidget: React.FC<CommunityFeedWidgetProps> = ({ userId }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    bg: {
      title: 'Общност',
      subtitle: 'Споделете вашите истории, открийте нови автомобили и се свържете със съмишленици',
      placeholder: 'Какво мислите',
      photo: 'Снимка',
      video: 'Видео',
      car: 'Автомобил',
      noPosts: 'Все още няма публикации',
      beFirst: 'Бъдете първият, който споделя нещо интересно!',
      createFirst: 'Създайте първата публикация'
    },
    en: {
      title: 'Community Feed',
      subtitle: 'Share your stories, discover new cars, and connect with fellow enthusiasts',
      placeholder: 'What\'s on your mind',
      photo: 'Photo',
      video: 'Video',
      car: 'Car',
      noPosts: 'No posts yet',
      beFirst: 'Be the first to share something interesting!',
      createFirst: 'Create First Post'
    }
  };

  const text = t[language];

  // Load user posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const userPosts = await postsService.getUserPosts(userId, 5); // Only show 5 recent
        setPosts(userPosts);
      } catch (error) {
        logger.error('Error loading posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadPosts();
    }
  }, [userId]);

  const handleCreatePost = () => {
    navigate('/create-post');
  };

  const userDisplayName = (user as any)?.displayName || 'User';
  const userAvatar = (user as any)?.profileImage;

  return (
    <Widget>
      <Header>
        <h3>{text.title}</h3>
        <p>{text.subtitle}</p>
      </Header>

      <CreatePostTrigger onClick={handleCreatePost}>
        <Avatar $url={userAvatar}>
          {!userAvatar && <UserIcon size={24} />}
        </Avatar>
        <Placeholder>
          {text.placeholder}, {userDisplayName}?
        </Placeholder>
      </CreatePostTrigger>

      <Actions>
        <ActionButton onClick={handleCreatePost}>
          <Image />
          {text.photo}
        </ActionButton>
        <ActionButton onClick={handleCreatePost}>
          <Video />
          {text.video}
        </ActionButton>
        <ActionButton onClick={handleCreatePost}>
          <Car />
          {text.car}
        </ActionButton>
      </Actions>

      {!loading && posts.length === 0 && (
        <EmptyState>
          <h4>{text.noPosts}</h4>
          <p>{text.beFirst}</p>
          <CreateButton onClick={handleCreatePost}>
            <Plus size={20} />
            {text.createFirst}
          </CreateButton>
        </EmptyState>
      )}

      {posts.length > 0 && (
        <PostsList>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </PostsList>
      )}
    </Widget>
  );
};

export default CommunityFeedWidget;



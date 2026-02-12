// Create Post Widget Component
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Quick post creation widget for profile page

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
// ✅ NEW: Import from canonical types
import type { BulgarianUser } from '../../types/user/bulgarian-user.types';
import { Image, Video, Car, User } from 'lucide-react';

interface CreatePostWidgetProps {
  user: BulgarianUser | null;
}

const CreatePostWidget: React.FC<CreatePostWidgetProps> = ({ user }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleCreatePost = () => {
    navigate('/create-post');
  };

  if (!user) return null;

  return (
    <Widget>
      <WidgetHeader>
        <Title>
          {language === 'bg' ? 'Създай публикация' : 'Create Post'}
        </Title>
      </WidgetHeader>

      <CreatePostTrigger onClick={handleCreatePost}>
        <UserAvatar $hasImage={!!user.profileImage?.url} $imageUrl={user.profileImage?.url}>
          {!user.profileImage?.url && <User size={20} />}
        </UserAvatar>
        
        <Placeholder>
          {language === 'bg' 
            ? `Какво мислите, ${user.firstName || user.displayName || 'User'}?`
            : `What's on your mind, ${user.firstName || user.displayName || 'User'}?`}
        </Placeholder>
      </CreatePostTrigger>

      <ActionButtons>
        <ActionButton onClick={handleCreatePost}>
          <Image size={20} />
          <span>{language === 'bg' ? 'Снимка' : 'Photo'}</span>
        </ActionButton>
        <ActionButton onClick={handleCreatePost}>
          <Video size={20} />
          <span>{language === 'bg' ? 'Видео' : 'Video'}</span>
        </ActionButton>
        <ActionButton onClick={handleCreatePost}>
          <Car size={20} />
          <span>{language === 'bg' ? 'Автомобил' : 'Car'}</span>
        </ActionButton>
      </ActionButtons>
    </Widget>
  );
};

const Widget = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

const WidgetHeader = styled.div`
  margin-bottom: 16px;

  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
`;

const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #212529;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CreatePostTrigger = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 24px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;

  &:hover {
    background: #e9ecef;
    border-color: #dee2e6;
  }

  @media (max-width: 768px) {
    padding: 10px 14px;
    gap: 10px;
  }
`;

const UserAvatar = styled.div<{ $hasImage: boolean; $imageUrl?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #FF7900;
  flex-shrink: 0;
  
  ${p => p.$hasImage && p.$imageUrl ? `
    background: url(${p.$imageUrl}) center/cover no-repeat;
  ` : `
    background: linear-gradient(135deg, #FF7900, #FF8F10);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  `}

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    border-width: 2px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const Placeholder = styled.span`
  flex: 1;
  text-align: left;
  color: #6c757d;
  font-size: 0.9375rem;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;

  @media (max-width: 768px) {
    gap: 8px;
    padding-top: 10px;
  }
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    color: #495057;
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.8125rem;
    
    span {
      display: none;
    }
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

export default CreatePostWidget;



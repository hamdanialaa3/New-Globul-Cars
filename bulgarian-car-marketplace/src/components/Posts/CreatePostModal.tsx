// src/components/Posts/CreatePostModal.tsx
// Create Post Modal - Instagram/LinkedIn style
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { X, Image as ImageIcon, Hash, Globe, Users as UsersIcon, Lock } from 'lucide-react';
import { postsService } from '../../services/social/posts.service';

// ==================== STYLED COMPONENTS ====================

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${p => p.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  
  h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: #212529;
  }
`;

const CloseButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const Body = styled.div`
  padding: 24px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 16px;
  border: 1.5px solid #dee2e6;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: #FF8F10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const OptionsBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
`;

const OptionButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1.5px solid ${p => p.$active ? '#FF8F10' : '#dee2e6'};
  background: ${p => p.$active ? 'rgba(255, 143, 16, 0.1)' : 'white'};
  color: ${p => p.$active ? '#FF7900' : '#6c757d'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #FF8F10;
    background: rgba(255, 143, 16, 0.05);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const VisibilitySelector = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 8px;
  }
  
  select {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid #dee2e6;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: #FF8F10;
    }
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${p => p.$variant === 'primary' 
    ? `
      background: linear-gradient(135deg, #FF7900 0%, #FF9533 100%);
      color: white;
      &:hover {
        background: linear-gradient(135deg, #e66d00 0%, #e68429 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
      }
    `
    : `
      background: #f8f9fa;
      color: #495057;
      &:hover {
        background: #e9ecef;
      }
    `
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ImagePreview = styled.div`
  margin: 16px 0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: auto;
    display: block;
  }
  
  button {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.6);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    
    &:hover {
      background: rgba(0, 0, 0, 0.8);
    }
  }
`;

// ==================== COMPONENT ====================

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setImages(prev => [...prev, ...files].slice(0, 5));
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (!user || !text.trim()) return;
    
    try {
      setLoading(true);
      
      const hashtags = text.match(/#\w+/g)?.map(tag => tag.slice(1)) || [];
      
      await postsService.createPost(user.uid, {
        type: 'text',
        content: {
          text: text.trim(),
          media: images.length > 0 ? images : undefined,
          hashtags
        },
        visibility
      });
      
      setText('');
      setImages([]);
      setImagePreviews([]);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert(language === 'bg' 
        ? 'Грешка при създаване на публикация' 
        : 'Error creating post');
    } finally {
      setLoading(false);
    }
  };
  
  const t = (key: string) => {
    const translations: Record<string, any> = {
      bg: {
        title: 'Създай публикация',
        placeholder: 'Какво мислиш за...? Използвай #hashtags',
        addImage: 'Добави снимка',
        visibility: 'Видимост',
        public: 'Публична',
        followers: 'Последователи',
        private: 'Лична',
        cancel: 'Откажи',
        post: 'Публикувай'
      },
      en: {
        title: 'Create Post',
        placeholder: 'What\'s on your mind? Use #hashtags',
        addImage: 'Add Image',
        visibility: 'Visibility',
        public: 'Public',
        followers: 'Followers',
        private: 'Private',
        cancel: 'Cancel',
        post: 'Post'
      }
    };
    return translations[language]?.[key] || key;
  };
  
  if (!isOpen) return null;
  
  return (
    <Overlay $isOpen={isOpen} onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <h3>{t('title')}</h3>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </Header>
        
        <Body>
          <TextArea
            placeholder={t('placeholder')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={5000}
          />
          
          {imagePreviews.map((preview, index) => (
            <ImagePreview key={index}>
              <img src={preview} alt={`Preview ${index + 1}`} />
              <button onClick={() => handleRemoveImage(index)}>
                <X size={16} />
              </button>
            </ImagePreview>
          ))}
          
          <OptionsBar>
            <OptionButton as="label">
              <ImageIcon size={16} />
              {t('addImage')}
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />
            </OptionButton>
            
            <OptionButton>
              <Hash size={16} />
              Hashtag
            </OptionButton>
          </OptionsBar>
          
          <VisibilitySelector>
            <label>{t('visibility')}</label>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
              <option value="public">
                {t('public')}
              </option>
              <option value="followers">
                {t('followers')}
              </option>
              <option value="private">
                {t('private')}
              </option>
            </select>
          </VisibilitySelector>
        </Body>
        
        <Actions>
          <Button $variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button 
            $variant="primary" 
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
          >
            {loading ? 'Loading...' : t('post')}
          </Button>
        </Actions>
      </Modal>
    </Overlay>
  );
};

export default CreatePostModal;


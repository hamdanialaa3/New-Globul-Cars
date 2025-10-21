/**
 * StoryCreator - Create stories with filters and overlays
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { X, Type, Image, Video, Smile } from 'lucide-react';
import { storiesService, StoryCreateData } from '../../services/social/stories.service';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';

// ==================== STYLED COMPONENTS ====================

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CreatorContainer = styled.div`
  position: relative;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  background: #212529;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h2`
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const MediaSection = styled.div`
  margin-bottom: 24px;
`;

const MediaButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const MediaButton = styled.button<{ $variant?: 'image' | 'video' }>`
  padding: 16px;
  border-radius: 12px;
  border: 2px dashed ${p => p.$variant === 'image' ? '#FF8F10' : '#1d4ed8'};
  background: rgba(255, 255, 255, 0.05);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-style: solid;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const PreviewArea = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  height: 300px;
  border-radius: 12px;
  background: ${p => p.$imageUrl 
    ? `url(${p.$imageUrl}) center/cover` 
    : 'rgba(255, 255, 255, 0.05)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 16px;
`;

const CaptionSection = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const CaptionInput = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    outline: none;
    border-color: #FF8F10;
  }
`;

const VisibilitySection = styled.div`
  margin-bottom: 24px;
`;

const VisibilityOptions = styled.div`
  display: flex;
  gap: 12px;
`;

const VisibilityButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid ${p => p.$active ? '#FF8F10' : 'rgba(255, 255, 255, 0.2)'};
  background: ${p => p.$active ? 'rgba(255, 143, 16, 0.1)' : 'transparent'};
  color: ${p => p.$active ? '#FF8F10' : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    border-color: #FF8F10;
    color: #FF8F10;
  }
`;

const Footer = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: ${p => p.$variant === 'primary' 
    ? 'linear-gradient(135deg, #FF8F10, #FF7900)' 
    : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

// ==================== COMPONENT ====================

interface StoryCreatorProps {
  onClose: () => void;
  onSuccess: () => void;
}

const StoryCreator: React.FC<StoryCreatorProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'close_friends'>('public');
  const [loading, setLoading] = useState(false);
  
  // ==================== HANDLERS ====================
  
  const handleMediaSelect = (file: File) => {
    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };
  
  const handleImageClick = () => {
    imageInputRef.current?.click();
  };
  
  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };
  
  const handleCreateStory = async () => {
    if (!user || !mediaFile) return;
    
    try {
      setLoading(true);
      
      const storyData: StoryCreateData = {
        mediaFile,
        caption: caption.trim() || undefined,
        visibility
      };
      
      await storiesService.createStory(user.uid, storyData);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create story:', error);
      alert('Failed to create story. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // ==================== RENDER ====================
  
  return (
    <Overlay onClick={onClose}>
      <CreatorContainer onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Create Story</Title>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </Header>
        
        <Content>
          <MediaSection>
            <Label>Choose Media</Label>
            <MediaButtons>
              <MediaButton $variant="image" onClick={handleImageClick}>
                <Image />
                Image
              </MediaButton>
              <MediaButton $variant="video" onClick={handleVideoClick}>
                <Video />
                Video
              </MediaButton>
            </MediaButtons>
            
            <PreviewArea $imageUrl={previewUrl}>
              {!previewUrl && 'Select an image or video to continue'}
            </PreviewArea>
            
            <HiddenInput
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={e => e.target.files?.[0] && handleMediaSelect(e.target.files[0])}
            />
            <HiddenInput
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={e => e.target.files?.[0] && handleMediaSelect(e.target.files[0])}
            />
          </MediaSection>
          
          <CaptionSection>
            <Label>Caption (Optional)</Label>
            <CaptionInput
              placeholder="Write a caption for your story..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              maxLength={200}
            />
          </CaptionSection>
          
          <VisibilitySection>
            <Label>Who can see this?</Label>
            <VisibilityOptions>
              <VisibilityButton
                $active={visibility === 'public'}
                onClick={() => setVisibility('public')}
              >
                Public
              </VisibilityButton>
              <VisibilityButton
                $active={visibility === 'followers'}
                onClick={() => setVisibility('followers')}
              >
                Followers
              </VisibilityButton>
              <VisibilityButton
                $active={visibility === 'close_friends'}
                onClick={() => setVisibility('close_friends')}
              >
                Close Friends
              </VisibilityButton>
            </VisibilityOptions>
          </VisibilitySection>
        </Content>
        
        <Footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            $variant="primary"
            onClick={handleCreateStory}
            disabled={!mediaFile || loading}
          >
            {loading ? 'Creating...' : 'Share Story'}
          </Button>
        </Footer>
      </CreatorContainer>
    </Overlay>
  );
};

export default StoryCreator;

// Create Post Form - Main Component
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Splitted into multiple files (as per constitution - max 300 lines)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthProvider';
import { useLanguage } from '../../../contexts/LanguageContext';
import { postsService, CreatePostData } from '../../../services/social/posts.service';
import {
  FormContainer,
  FormHeader,
  FormTitle,
  CloseButton,
  FormBody,
  FormFooter,
  SubmitButton,
  CharacterCount
} from './styles';
import PostTypeSelector from './PostTypeSelector';
import TextEditor from './TextEditor';
import MediaUploader from './MediaUploader';
import CarSelector from './CarSelector';
import PostOptions from './PostOptions';
import CrossPostSelector from './CrossPostSelector';
import { X } from 'lucide-react';
import { SocialPlatform } from '../../../types/social-media.types';
import socialMediaService from '../../../services/social/social-media.service';

interface CreatePostFormProps {
  onClose: () => void;
  onPostCreated?: (post: any) => void;
}

type PostType = 'text' | 'car_showcase' | 'tip' | 'question' | 'review';
type Visibility = 'public' | 'followers' | 'private';

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onClose, onPostCreated }) => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [postType, setPostType] = useState<PostType>('text');
  const [text, setText] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [location, setLocation] = useState({ city: '', region: '' });
  const [loading, setLoading] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [crossPostPlatforms, setCrossPostPlatforms] = useState<SocialPlatform[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<SocialPlatform[]>([]);

  // Auto-detect hashtags
  useEffect(() => {
    const detected = text.match(/#[\w\u0400-\u04FF]+/g) || [];
    setHashtags(detected.map(h => h.slice(1).toLowerCase()));
  }, [text]);

  // Load connected social media accounts
  useEffect(() => {
    const loadAccounts = async () => {
      if (user?.uid) {
        try {
          const accounts = await socialMediaService.getConnectedAccounts(user.uid);
          setConnectedAccounts(accounts.map(acc => acc.platform));
        } catch (error) {
          console.error('Error loading social accounts:', error);
        }
      }
    };
    loadAccounts();
  }, [user]);

  // Validation
  const canSubmit = (): boolean => {
    if (text.trim().length < 10) return false;
    if (text.length > 5000) return false;
    if (mediaFiles.length > 10) return false;
    return true;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!user || !canSubmit()) return;

    setLoading(true);

    try {
      // Prepare post data (media upload handled by createPost)
      const postData: CreatePostData = {
        type: postType,
        content: {
          text: text.trim(),
          media: mediaFiles.length > 0 ? mediaFiles : undefined,
          carReference: selectedCar ? {
            carId: selectedCar.id,
            carTitle: `${selectedCar.brand} ${selectedCar.model}`,
            carImage: selectedCar.images?.[0] || ''
          } : undefined,
          hashtags: hashtags.length > 0 ? hashtags : undefined
        },
        visibility,
        location: location.city ? location : undefined
      };

      // Create post with userId and postData
      const newPostId = await postsService.createPost(user.uid, postData);

      // Cross-post to selected platforms (async, don't wait)
      if (crossPostPlatforms.length > 0) {
        socialMediaService.crossPost(
          user.uid,
          text.trim(),
          [], // Media URLs would need to be extracted
          { platforms: crossPostPlatforms }
        ).then(results => {
          const succeeded = Object.values(results).filter(Boolean).length;
          console.log(`Cross-posted to ${succeeded}/${crossPostPlatforms.length} platforms`);
        }).catch(err => {
          console.error('Cross-post error:', err);
        });
      }

      // Success
      if (onPostCreated) {
        onPostCreated(newPostId);
      }

      onClose();

      // Show success message
      const message = language === 'bg' 
        ? 'Публикацията е създадена успешно!' 
        : 'Post created successfully!';
      
      const crossMsg = crossPostPlatforms.length > 0
        ? (language === 'bg' 
          ? ` (Споделяне в ${crossPostPlatforms.length} мрежи...)` 
          : ` (Sharing to ${crossPostPlatforms.length} platforms...)`)
        : '';
      
      alert(message + crossMsg);

    } catch (error) {
      console.error('Error creating post:', error);
      alert(language === 'bg'
        ? 'Грешка при създаване на публикацията'
        : 'Error creating post');
    } finally {
      setLoading(false);
    }
  };

  const t = {
    bg: {
      title: 'Създай публикация',
      placeholder: 'Напишете нещо...',
      submit: 'Публикувай',
      submitting: 'Публикуване...'
    },
    en: {
      title: 'Create Post',
      placeholder: 'Write something...',
      submit: 'Post',
      submitting: 'Posting...'
    }
  }[language];

  return (
    <FormContainer>
      <FormHeader>
        <FormTitle>{t.title}</FormTitle>
        <CloseButton onClick={onClose}>
          <X size={24} />
        </CloseButton>
      </FormHeader>

      <FormBody>
        <PostTypeSelector
          selected={postType}
          onChange={setPostType}
        />

        <TextEditor
          value={text}
          onChange={setText}
          placeholder={t.placeholder}
          maxLength={5000}
        />

        <MediaUploader
          files={mediaFiles}
          onChange={setMediaFiles}
          maxFiles={10}
          maxSize={5 * 1024 * 1024}
        />

        {postType === 'car_showcase' && (
          <CarSelector
            selected={selectedCar}
            onChange={setSelectedCar}
            userId={user?.uid}
          />
        )}

        <PostOptions
          visibility={visibility}
          onVisibilityChange={setVisibility}
          location={location}
          onLocationChange={setLocation}
        />
      </FormBody>

      <FormFooter>
        <div style={{ 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <CrossPostSelector
            selectedPlatforms={crossPostPlatforms}
            connectedAccounts={connectedAccounts}
            onChange={setCrossPostPlatforms}
            language={language}
          />
          
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <CharacterCount $error={text.length > 5000 || text.length < 10}>
              {text.length}/5000
            </CharacterCount>
            <SubmitButton
              onClick={handleSubmit}
              disabled={!canSubmit() || loading}
            >
              {loading ? t.submitting : t.submit}
            </SubmitButton>
          </div>
        </div>
      </FormFooter>
    </FormContainer>
  );
};

export default CreatePostForm;


import { logger } from '../../../services/logger-service';
// Profile Photo Card Component
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { Camera, User, Upload, Trash2 } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../../../firebase/firebase-config';
import { toast } from 'react-toastify';

interface ProfilePhotoCardProps {
  userId: string;
  currentPhotoUrl?: string;
}

const ProfilePhotoCard: React.FC<ProfilePhotoCardProps> = ({ 
  userId, 
  currentPhotoUrl 
}) => {
  const { language } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
  const [deleting, setDeleting] = useState(false);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input value to allow re-uploading same file
    event.target.value = '';

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(language === 'bg' 
        ? 'Неподдържан тип файл. Използвайте: JPG, PNG, WEBP'
        : 'Unsupported file type. Use: JPG, PNG, WEBP');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      toast.error(language === 'bg'
        ? `Размерът е твърде голям (${sizeMB}MB). Макс: 5MB`
        : `File too large (${sizeMB}MB). Max: 5MB`);
      return;
    }

    try {
      setUploading(true);

      // Optimize image before upload
      const optimizedFile = await optimizeImage(file);

      // Upload to Firebase Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, `users/${userId}/profile/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, optimizedFile);
      const url = await getDownloadURL(snapshot.ref);

      // Update Firestore
      await updateDoc(doc(db, 'users', userId), {
        profileImage: {
          url,
          updatedAt: new Date(),
          fileName,
          size: optimizedFile.size
        }
      });

      setPhotoUrl(url);
      toast.success(language === 'bg'
        ? 'Снимката е качена успешно'
        : 'Photo uploaded successfully');
    } catch (error: any) {
      logger.error('Error uploading photo:', error);
      
      let errorMessage = language === 'bg' ? 'Грешка при качване' : 'Upload error';
      
      if (error.code === 'storage/unauthorized') {
        errorMessage = language === 'bg'
          ? 'Нямате права за качване'
          : 'Unauthorized to upload';
      } else if (error.code === 'storage/canceled') {
        errorMessage = language === 'bg'
          ? 'Качването е отменено'
          : 'Upload canceled';
      } else if (error.code === 'storage/unknown') {
        errorMessage = language === 'bg'
          ? 'Неизвестна грешка. Опитайте отново.'
          : 'Unknown error. Try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Optimize image before upload
  const optimizeImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if too large (max 1200px)
          const maxDimension = 1200;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(optimizedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeletePhoto = async () => {
    const confirm = window.confirm(
      language === 'bg'
        ? 'Сигурни ли сте, че искате да изтриете снимката?'
        : 'Are you sure you want to delete your photo?'
    );

    if (!confirm) return;

    try {
      setDeleting(true);

      // Remove from Firestore
      await updateDoc(doc(db, 'users', userId), {
        profileImage: {
          url: '',
          updatedAt: new Date()
        }
      });

      setPhotoUrl(undefined);
      toast.success(language === 'bg'
        ? 'Снимката е изтрита'
        : 'Photo deleted');
    } catch (error) {
      logger.error('Error deleting photo:', error);
      toast.error(language === 'bg'
        ? 'Грешка при изтриване'
        : 'Delete error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <SectionHeader>
        <Title>
          <User size={20} />
          {language === 'bg' ? 'Профил' : 'Profile'}
        </Title>
      </SectionHeader>

      <PhotoSection>
        <SubTitle>
          {language === 'bg' ? 'Профилна снимка' : 'Profile picture'}
        </SubTitle>
        <PrivacyNote>
          ({language === 'bg' ? 'Видимо само за вас' : 'Only visible for you'})
        </PrivacyNote>

        <PhotoContainer>
          <PhotoPreview $hasPhoto={!!photoUrl}>
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" />
            ) : (
              <User size={48} />
            )}
          </PhotoPreview>

          <ButtonGroup>
            <UploadButton as="label" htmlFor="photo-upload" $uploading={uploading}>
              {uploading ? (
                <>
                  <Upload size={16} className="spin" />
                  {language === 'bg' ? 'Качване...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <Camera size={16} />
                  {language === 'bg' ? 'Качи снимка' : 'Upload photo'}
                </>
              )}
            </UploadButton>
            <HiddenInput
              id="photo-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
            
            {photoUrl && (
              <DeleteButton onClick={handleDeletePhoto} disabled={deleting}>
                <Trash2 size={16} />
                {language === 'bg' ? 'Изтрий' : 'Delete'}
              </DeleteButton>
            )}
          </ButtonGroup>
        </PhotoContainer>
      </PhotoSection>
    </Card>
  );
};

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;

  @media (max-width: 768px) {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
`;

const Title = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.125rem;
  font-weight: 600;
  color: #212529;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const PhotoSection = styled.div``;

const SubTitle = styled.h4`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #495057;
  margin: 0 0 4px 0;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const PrivacyNote = styled.p`
  font-size: 0.8125rem;
  color: #6c757d;
  font-style: italic;
  margin: 0 0 20px 0;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    margin-bottom: 16px;
  }
`;

const PhotoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PhotoPreview = styled.div<{ $hasPhoto: boolean }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid #e9ecef;
  overflow: hidden;
  flex-shrink: 0;
  
  ${props => props.$hasPhoto ? `
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  ` : `
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    color: #adb5bd;
  `}

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    border-width: 2px;
  }
`;

const UploadButton = styled.button<{ $uploading: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #FF7900, #FF8F10);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: ${props => props.$uploading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.$uploading ? 0.7 : 1};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.875rem;
    width: 100%;
    justify-content: center;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: white;
  color: #dc3545;
  border: 1px solid #dc3545;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #dc3545;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.875rem;
    width: 100%;
    justify-content: center;
  }
`;

export default ProfilePhotoCard;


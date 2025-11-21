import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { X, Camera, Upload, Trash2 } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contexts/LanguageContext';
import { useProfile } from '@globul-cars/profile/hooks/useProfile';
import { toast } from 'react-toastify';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@globul-cars/services';
import { useAuth } from '@globul-cars/core/contexts/AuthProvider';

interface PhotoEditModalProps {
  onClose: () => void;
}

const PhotoEditModal: React.FC<PhotoEditModalProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const { user, updateProfile } = useProfile();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(user?.photoURL || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getText = () => {
    if (language === 'bg') {
      return {
        title: 'Редактиране на снимка',
        uploadNew: 'Качване на нова снимка',
        remove: 'Премахване на снимката',
        cancel: 'Отказ',
        save: 'Запази',
        uploading: 'Качване...',
        success: 'Снимката е актуализирана успешно!',
        removed: 'Снимката е премахната успешно!',
        error: 'Грешка при актуализиране на снимката',
        selectImage: 'Изберете изображение',
        maxSize: 'Максимален размер: 5MB'
      };
    } else {
      return {
        title: 'Edit Photo',
        uploadNew: 'Upload New Photo',
        remove: 'Remove Photo',
        cancel: 'Cancel',
        save: 'Save',
        uploading: 'Uploading...',
        success: 'Photo updated successfully!',
        removed: 'Photo removed successfully!',
        error: 'Error updating photo',
        selectImage: 'Select Image',
        maxSize: 'Max size: 5MB'
      };
    }
  };

  const text = getText();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'bg' ? 'Файлът е твърде голям. Максимален размер: 5MB' : 'File is too large. Max size: 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'bg' ? 'Моля, изберете изображение' : 'Please select an image');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast.error(language === 'bg' ? 'Моля, изберете файл' : 'Please select a file');
      return;
    }

    const file = fileInputRef.current.files[0];
    setLoading(true);

    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile-photos/${currentUser?.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update profile
      await updateProfile({ photoURL: downloadURL });
      toast.success(text.success);
      onClose();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(text.error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!user?.photoURL) return;

    setLoading(true);
    try {
      // Try to delete old photo from storage (if it's a Firebase Storage URL)
      if (user.photoURL.includes('firebasestorage.googleapis.com')) {
        try {
          const oldRef = ref(storage, user.photoURL);
          await deleteObject(oldRef);
        } catch (err) {
          console.log('Could not delete old photo:', err);
        }
      }

      // Update profile
      await updateProfile({ photoURL: null });
      setPreview(null);
      toast.success(text.removed);
      onClose();
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error(text.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <Camera size={24} />
            {text.title}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <PreviewContainer>
            {preview ? (
              <PreviewImage src={preview} alt="Preview" />
            ) : (
              <PreviewPlaceholder>
                <Camera size={48} />
              </PreviewPlaceholder>
            )}
          </PreviewContainer>

          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
          />

          <ButtonGroup>
            <UploadButton onClick={() => fileInputRef.current?.click()}>
              <Upload size={20} />
              {text.selectImage}
            </UploadButton>

            {preview && (
              <RemoveButton onClick={handleRemove} disabled={loading}>
                <Trash2 size={20} />
                {text.remove}
              </RemoveButton>
            )}
          </ButtonGroup>

          <HelpText>{text.maxSize}</HelpText>
        </ModalBody>

        <ModalFooter>
          <CancelButton onClick={onClose}>{text.cancel}</CancelButton>
          <SaveButton onClick={handleUpload} disabled={loading || !fileInputRef.current?.files?.[0]}>
            {loading ? text.uploading : text.save}
          </SaveButton>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
};

export default PhotoEditModal;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e8e8e8;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: #FF8F10;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  transition: color 0.2s ease;

  &:hover {
    color: #1a1a1a;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const PreviewContainer = styled.div`
  width: 200px;
  height: 200px;
  margin: 0 auto 24px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #FF8F10;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PreviewPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    color: #999;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const UploadButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: #FF8F10;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: #e67e00;
  }
`;

const RemoveButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: #dc3545;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: #c82333;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HelpText = styled.p`
  font-size: 0.875rem;
  color: #666;
  text-align: center;
  margin: 0;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e8e8e8;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e8e8e8;
  }
`;

const SaveButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: #FF8F10;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #e67e00;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

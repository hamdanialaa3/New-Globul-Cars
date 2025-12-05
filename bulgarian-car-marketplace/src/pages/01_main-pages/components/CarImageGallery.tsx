import React, { useState } from 'react';
import { CarIcon } from '../../../components/icons/CarIcon';
import { CarListing } from '../../../types/CarListing';
import {
  ImageSection,
  LogoContainer,
  LogoImage,
  LogoBrandName,
  GalleryContainer,
  GalleryTitle,
  MainImageContainer,
  MainImage,
  ImageCount,
  ThumbnailGrid,
  ThumbnailItem,
  ThumbnailImage,
  ImagePlaceholder,
  PhotoUploadSection,
  PhotoUploadTitle,
  PhotoUploadArea,
  UploadIcon,
  UploadText,
  ChoosePhotosButton,
  HiddenFileInput,
  PhotoGrid,
  PhotoItem,
  PhotoImg,
  PhotoRemoveButton,
} from '../CarDetailsPage.styles';

interface CarImageGalleryProps {
  car: CarListing;
  isEditMode: boolean;
  isOwner: boolean;
  language: 'bg' | 'en';
  photos: File[];
  photoUrls: string[];
  isDragOver: boolean;
  onImageSelect: (files: FileList | null) => void;
  onImageDelete: (imageUrl: string) => Promise<string[] | null>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onRemovePhoto: (index: number) => void;
}

export const CarImageGallery: React.FC<CarImageGalleryProps> = ({
  car,
  isEditMode,
  isOwner,
  language,
  photos,
  photoUrls,
  isDragOver,
  onImageSelect,
  onImageDelete,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemovePhoto,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleDeleteImage = async (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation();
    const updatedImages = await onImageDelete(imageUrl);
    if (updatedImages && updatedImages.length > 0 && selectedImageIndex >= updatedImages.length) {
      setSelectedImageIndex(updatedImages.length - 1);
    }
  };

  return (
    <ImageSection>
      {car.make && (
        <LogoContainer>
          <LogoImage 
            src={`/assets/images/professional_car_logos/${car.make}.png`}
            alt={car.make}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `/assets/images/professional_car_logos/mein_logo_rest.png`;
            }}
          />
          <LogoBrandName>{car.make}</LogoBrandName>
        </LogoContainer>
      )}

      {car.images && car.images.length > 0 && (
        <GalleryContainer>
          <GalleryTitle>
            {language === 'bg' ? 'Снимки на превозното средство' : 'Vehicle Photos'} ({car.images.length})
          </GalleryTitle>
          
          <MainImageContainer>
            <MainImage 
              src={
                typeof car.images[selectedImageIndex] === 'string' 
                  ? String(car.images[selectedImageIndex])
                  : URL.createObjectURL(car.images[selectedImageIndex])
              } 
              alt={`${car.make} ${car.model} - Photo ${selectedImageIndex + 1}`} 
            />
            <ImageCount>{selectedImageIndex + 1} / {car.images.length}</ImageCount>
          </MainImageContainer>

          <ThumbnailGrid>
            {car.images.map((image, index) => (
              <ThumbnailItem 
                key={index} 
                $isActive={index === selectedImageIndex}
                onClick={() => setSelectedImageIndex(index)}
              >
                <ThumbnailImage 
                  src={typeof image === 'string' ? String(image) : URL.createObjectURL(image)} 
                  alt={`Thumbnail ${index + 1}`} 
                />
                {isEditMode && isOwner && (
                  <PhotoRemoveButton 
                    onClick={(e) => handleDeleteImage(e, typeof image === 'string' ? image : '')}
                    title={language === 'bg' ? 'Изтрий снимка' : 'Delete image'}
                  >
                    ×
                  </PhotoRemoveButton>
                )}
              </ThumbnailItem>
            ))}
          </ThumbnailGrid>
        </GalleryContainer>
      )}

      {(!car.images || car.images.length === 0) && (
        <div style={{ marginTop: '2rem' }}>
          <ImagePlaceholder>
            <CarIcon size={60} color="var(--accent-primary)" />
          </ImagePlaceholder>
          <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '1rem' }}>
            {language === 'bg' ? 'Няма налични снимки' : 'No photos available'}
          </p>
        </div>
      )}

      {/* Photo Upload Section */}
      {isEditMode && isOwner && (
        <PhotoUploadSection style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <PhotoUploadTitle>
              {language === 'bg' ? 'Добави снимки' : 'Add Photos'}
            </PhotoUploadTitle>
            <span style={{ fontSize: '0.688rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
              {car?.images?.length || 0} + {photos.length} / 20
            </span>
          </div>
          
          <PhotoUploadArea
            $isDragOver={isDragOver}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById('photo-upload-main')?.click()}
          >
            <UploadIcon>
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" fill="url(#camera-gradient-compact)" opacity="0.2"/>
                <path d="M23 18L26 14H38L41 18H50C51.1 18 52 18.9 52 20V46C52 47.1 51.1 48 50 48H14C12.9 48 12 47.1 12 46V20C12 18.9 12.9 18 14 18H23Z" fill="url(#camera-body-compact)"/>
                <circle cx="32" cy="32" r="8" fill="url(#lens-gradient-compact)"/>
                <circle cx="32" cy="32" r="5" fill="white" opacity="0.3"/>
                <defs>
                  <linearGradient id="camera-gradient-compact" x1="2" y1="2" x2="62" y2="62" gradientUnits="userSpaceOnUse">
                    <stop style={{ stopColor: 'var(--accent-primary)' }}/>
                    <stop offset="1" style={{ stopColor: 'var(--accent-light)' }}/>
                  </linearGradient>
                  <linearGradient id="camera-body-compact" x1="12" y1="14" x2="52" y2="48" gradientUnits="userSpaceOnUse">
                    <stop style={{ stopColor: 'var(--accent-primary)' }}/>
                    <stop offset="1" style={{ stopColor: 'var(--accent-light)' }}/>
                  </linearGradient>
                  <linearGradient id="lens-gradient-compact" x1="24" y1="24" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop style={{ stopColor: 'var(--text-primary)' }}/>
                    <stop offset="1" style={{ stopColor: 'var(--text-secondary)' }}/>
                  </linearGradient>
                </defs>
              </svg>
            </UploadIcon>
            <UploadText>
              {language === 'bg' ? 'Drag & Drop или кликнете' : 'Drag & Drop or click'}
            </UploadText>
            <ChoosePhotosButton type="button">
              {language === 'bg' ? 'Избери' : 'Choose'}
            </ChoosePhotosButton>
            <HiddenFileInput
              id="photo-upload-main"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => onImageSelect(e.target.files)}
            />
          </PhotoUploadArea>

          {photoUrls.length > 0 && (
            <PhotoGrid>
              {photoUrls.map((url, index) => (
                <PhotoItem key={index}>
                  <PhotoImg src={url} alt={`Photo ${index + 1}`} />
                  <PhotoRemoveButton onClick={() => onRemovePhoto(index)}>
                    ×
                  </PhotoRemoveButton>
                </PhotoItem>
              ))}
            </PhotoGrid>
          )}
        </PhotoUploadSection>
      )}
    </ImageSection>
  );
};


import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { CarListing } from '@globul-cars/core/typesCarListing';

interface ImagesStepProps {
  data: Partial<CarListing>;
  onDataChange: (data: Partial<CarListing>) => void;
}

const StepContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const UploadArea = styled.div<{ isDragOver: boolean }>`
  border: 3px dashed ${props => props.isDragOver ? '#667eea' : '#dee2e6'};
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  background: ${props => props.isDragOver ? 'rgba(102, 126, 234, 0.05)' : '#f8f9fa'};
  transition: all 0.3s ease;
  cursor: pointer;
  margin: 2rem 0;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
`;

const UploadIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #667eea;
`;

const UploadText = styled.h3`
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
`;

const UploadSubtext = styled.p`
  color: #7f8c8d;
  margin: 0 0 1rem 0;
  font-size: 1rem;
`;

const UploadButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`;

const ImageCard = styled.div`
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;

  ${ImageCard}:hover & {
    opacity: 1;
  }
`;

const DeleteButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    background: #c82333;
    transform: scale(1.1);
  }
`;

const ImageInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 1rem;
  font-size: 0.8rem;
`;

const ImageTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const ImageSize = styled.div`
  opacity: 0.8;
`;

const RequirementsCard = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  border-left: 4px solid #667eea;
`;

const RequirementsTitle = styled.h4`
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
`;

const RequirementsList = styled.ul`
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
  padding-left: 1.5rem;
`;

const RequirementItem = styled.li`
  margin-bottom: 0.5rem;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin: 1rem 0;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.progress}%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s ease;
  }
`;

const ImagesStep: React.FC<ImagesStepProps> = ({ data, onDataChange }) => {
  const [images, setImages] = useState<File[]>(data.images || []);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Моля, изберете само изображения!');
      return;
    }

    if (images.length + imageFiles.length > 20) {
      alert('Максималният брой снимки е 20!');
      return;
    }

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setImages(prev => [...prev, ...imageFiles]);
          onDataChange({ images: [...images, ...imageFiles] });
          return 0;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleDeleteImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onDataChange({ images: newImages });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageTitle = (index: number) => {
    const titles = [
      'Основна снимка',
      'Преден изглед',
      'Заден изглед',
      'Страничен изглед',
      'Интериор',
      'Двигател',
      'Багажник',
      'Колела',
      'Допълнителна снимка'
    ];
    return titles[index] || `Снимка ${index + 1}`;
  };

  return (
    <StepContainer>
      <UploadArea
        isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadIcon>📸</UploadIcon>
        <UploadText>Качете снимки на превозното средство</UploadText>
        <UploadSubtext>
          Плъзнете снимките тук или кликнете за да изберете файлове
        </UploadSubtext>
        <UploadButton>Изберете снимки</UploadButton>
        <HiddenInput
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
        />
      </UploadArea>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <ProgressBar progress={uploadProgress} />
      )}

      {images.length > 0 && (
        <ImagesGrid>
          {images.map((image, index) => (
            <ImageCard key={index}>
              <Image
                src={URL.createObjectURL(image)}
                alt={`Снимка ${index + 1}`}
              />
              <ImageOverlay onClick={() => handleDeleteImage(index)}>
                <DeleteButton>×</DeleteButton>
              </ImageOverlay>
              <ImageInfo>
                <ImageTitle>{getImageTitle(index)}</ImageTitle>
                <ImageSize>{formatFileSize(image.size)}</ImageSize>
              </ImageInfo>
            </ImageCard>
          ))}
        </ImagesGrid>
      )}

      <RequirementsCard>
        <RequirementsTitle>📋 Изисквания за снимките</RequirementsTitle>
        <RequirementsList>
          <RequirementItem>Максимален брой снимки: 20</RequirementItem>
          <RequirementItem>Поддържани формати: JPG, PNG, GIF, WebP</RequirementItem>
          <RequirementItem>Максимален размер на файл: 10MB</RequirementItem>
          <RequirementItem>Минимална резолюция: 800x600 пиксела</RequirementItem>
          <RequirementItem>Препоръчителна резолюция: 1920x1080 пиксела</RequirementItem>
          <RequirementItem>Снимките трябва да са ясни и добре осветени</RequirementItem>
          <RequirementItem>Покажете всички страни на превозното средство</RequirementItem>
          <RequirementItem>Включете снимки на интериора и двигателя</RequirementItem>
        </RequirementsList>
      </RequirementsCard>
    </StepContainer>
  );
};

export default ImagesStep;

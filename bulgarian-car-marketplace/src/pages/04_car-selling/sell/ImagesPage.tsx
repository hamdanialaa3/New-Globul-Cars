import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import ImageOptimizationService from '../../../services/imageOptimizationService';
import { WorkflowPersistenceService } from '../../../services/unified-workflow-persistence.service';
import { logger } from '../../../services/logger-service';

const ImagesContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const HeaderCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0 0 2rem 0;
  line-height: 1.6;
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

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #ecf0f1;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
          }
        `;
      case 'secondary':
        return `
          background: #f8f9fa;
          color: #6c757d;
          border: 2px solid #e9ecef;
          
          &:hover {
            background: #e9ecef;
            color: #495057;
          }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
          
          &:hover {
            background: #5a6268;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  border-left: 4px solid #667eea;
`;

const InfoTitle = styled.h4`
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
`;

const InfoText = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
`;

const ImagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [images, setImages] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ✅ FIX: Track preview URLs for cleanup
  const previewUrlsRef = useRef<Map<number, string>>(new Map());

  // Load saved images on mount
  useEffect(() => {
    const loadImages = async () => {
      const savedImages = await WorkflowPersistenceService.getImagesAsFiles();
      if (savedImages.length > 0) {
        setImages(savedImages);
        if (process.env.NODE_ENV === 'development') {
          logger.debug(`Loaded ${savedImages.length} saved images`);
        }
      }
    };
    loadImages();
  }, []);
  
  // ✅ FIX: Create and cleanup preview URLs
  useEffect(() => {
    // Revoke old URLs
    previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();
    
    // Create new URLs
    images.forEach((image, index) => {
      const url = URL.createObjectURL(image);
      previewUrlsRef.current.set(index, url);
    });
    
    // Cleanup on unmount
    return () => {
      previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    };
  }, [images]);

  // Extract parameters from URL
  const vehicleType = searchParams.get('vt');
  const sellerType = searchParams.get('st');
  const make = searchParams.get('mk');
  const model = searchParams.get('md');
  const fuelType = searchParams.get('fm');
  const year = searchParams.get('fy');
  const mileage = searchParams.get('mi');
  const condition = searchParams.get('i');
  const safety = searchParams.get('safety');
  const comfort = searchParams.get('comfort');
  const infotainment = searchParams.get('infotainment');
  const extras = searchParams.get('extras');

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

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Моля, изберете само изображения!');
      return;
    }

    if (images.length + imageFiles.length > 20) {
      alert('Максималният брой снимки е 20!');
      return;
    }

    // Validate images
    const validation = ImageOptimizationService.validateImages(imageFiles);
    if (!validation.isValid) {
      alert('Грешка при валидация на снимките:\n' + validation.errors.join('\n'));
      return;
    }

    try {
      setIsOptimizing(true);
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Optimizing images', { count: imageFiles.length });
      }
      
      // Optimize images
      const optimizedImages = await ImageOptimizationService.optimizeImages(imageFiles, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85
      });

      setImages(prev => [...prev, ...optimizedImages]);
      
      // Save to localStorage
      await WorkflowPersistenceService.saveImages([...images, ...optimizedImages]);
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Images optimized and saved');
      }
    } catch (error) {
      logger.error('Error processing images', error as Error);
      alert('Възникна грешка при обработка на снимките.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDeleteImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
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

  const handleBack = () => {
    // Build URL with parameters
    const params = new URLSearchParams();
    if (vehicleType) params.set('vt', vehicleType);
    if (sellerType) params.set('st', sellerType);
    if (make) params.set('mk', make);
    if (model) params.set('md', model);
    if (fuelType) params.set('fm', fuelType);
    if (year) params.set('fy', year);
    if (mileage) params.set('mi', mileage);
    if (condition) params.set('i', condition);
    if (safety) params.set('safety', safety);
    if (comfort) params.set('comfort', comfort);
    if (infotainment) params.set('infotainment', infotainment);
    if (extras) params.set('extras', extras);

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/ausstattung/extras?${params.toString()}`);
  };

  const handleContinue = async () => {
    if (images.length === 0) {
      alert('Моля, качете поне една снимка!');
      return;
    }

    try {
      // Save images to localStorage
      await WorkflowPersistenceService.saveImages(images);
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Images saved to localStorage', { count: images.length });
      }

      // Build URL with parameters
      const params = new URLSearchParams();
      if (vehicleType) params.set('vt', vehicleType);
      if (sellerType) params.set('st', sellerType);
      if (make) params.set('mk', make);
      if (model) params.set('md', model);
      if (fuelType) params.set('fm', fuelType);
      if (year) params.set('fy', year);
      if (mileage) params.set('mi', mileage);
      if (condition) params.set('i', condition);
      if (safety) params.set('safety', safety);
      if (comfort) params.set('comfort', comfort);
      if (infotainment) params.set('infotainment', infotainment);
      if (extras) params.set('extras', extras);
      params.set('images', images.length.toString());

      navigate(`/sell/inserat/${vehicleType || 'pkw'}/details/kontaktinformationen?${params.toString()}`);
    } catch (error) {
      logger.error('Error saving images', error as Error);
      alert('Възникна грешка при запазване на снимките.');
    }
  };

  return (
    <ImagesContainer>
      <ContentWrapper>
        <HeaderCard>
          <Title>Снимки</Title>
          <Subtitle>
            Качете снимки на превозното средство
          </Subtitle>
        </HeaderCard>

        <UploadArea
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isOptimizing && fileInputRef.current?.click()}
        >
          <UploadIcon>{isOptimizing ? '⏳' : '📸'}</UploadIcon>
          <UploadText>
            {isOptimizing ? 'Оптимизиране на снимките...' : 'Качете снимки на превозното средство'}
          </UploadText>
          <UploadSubtext>
            {isOptimizing 
              ? 'Моля изчакайте, докато снимките се оптимизират.'
              : 'Плъзнете снимките тук или кликнете за да изберете файлове'
            }
          </UploadSubtext>
          {!isOptimizing && <UploadButton>Изберете снимки</UploadButton>}
          <HiddenInput
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isOptimizing}
          />
        </UploadArea>

        {images.length > 0 && (
          <ImagesGrid>
            {images.map((image, index) => (
              <ImageCard key={index}>
                <Image
                  src={previewUrlsRef.current.get(index) || ''}
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

        <NavigationButtons>
          <Button variant="secondary" onClick={handleBack}>
            ← Назад
          </Button>

          <Button variant="primary" onClick={handleContinue}>
            Продължи →
          </Button>
        </NavigationButtons>

        <InfoCard>
          <InfoTitle>📋 Изисквания за снимките</InfoTitle>
          <InfoText>
            Максимален брой снимки: 20 | Поддържани формати: JPG, PNG, GIF, WebP | 
            Максимален размер на файл: 10MB | Минимална резолюция: 800x600 пиксела | 
            Препоръчителна резолюция: 1920x1080 пиксела | Снимките трябва да са ясни и добре осветени
          </InfoText>
        </InfoCard>
      </ContentWrapper>
    </ImagesContainer>
  );
};

export default ImagesPage;

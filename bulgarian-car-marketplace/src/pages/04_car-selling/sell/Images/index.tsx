// Images Upload Page with Workflow
// صفحة رفع الصور مع الأتمتة
// File Size: ~250 lines ✅

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { logger } from '../../../../services/logger-service';
import SplitScreenLayout from '../../../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../../../components/WorkflowVisualization';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import * as S from './styles';
import { SellWorkflowLayout } from '../../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../../services/sellWorkflowStepState';
import WorkflowPersistenceService from '../../../../services/workflowPersistenceService';
import { useImagesWorkflow } from './useImagesWorkflow';
import { toast } from 'react-toastify';

const ImagesPageNew: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [isDragOver, setIsDragOver] = useState(false);
  const { files, hasImages, addFiles, removeFile, saveImages } = useImagesWorkflow();

  const vehicleType = searchParams.get('vt');
  const make = searchParams.get('mk');
  useEffect(() => {
    SellWorkflowStepStateService.markPending('images');
    
    // Check storage usage and warn if high
    const storageUsage = WorkflowPersistenceService.getStorageUsage();
    if (storageUsage.percentage > 80) {
      logger.warn('High localStorage usage detected', storageUsage);
      toast.warn(language === 'bg' 
        ? 'تحذير: استخدام تخزين عالي. قد تواجه مشاكل في حفظ الصور.' 
        : 'Warning: High storage usage. You may experience issues saving images.', {
        autoClose: 10000
      });
    }
  }, [language]);

  useEffect(() => {
    const hasPersistedImages =
      WorkflowPersistenceService.getImages().length > 0;

    if (files.length > 0 || hasPersistedImages) {
      SellWorkflowStepStateService.markCompleted('images');
    } else {
      SellWorkflowStepStateService.markPending('images');
    }
  }, [files.length]);


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addFiles(droppedFiles);
  };

  const handleContinue = async () => {
    if (files.length === 0) {
      toast.error(language === 'bg' 
        ? 'Моля, качете поне една снимка!' 
        : 'Please upload at least one photo!');
      return;
    }

    try {
      await saveImages();
      logger.info('Images saved successfully', { count: files.length, vehicleType });

      const params = new URLSearchParams(searchParams.toString());
      params.set('images', files.length.toString());
      navigate(`/sell/inserat/${vehicleType || 'car'}/details/preis?${params.toString()}`);
    } catch (error) {
      logger.error('Error saving images', error as Error, { vehicleType });
      
      // Show user-friendly error with retry option
      toast.error(language === 'bg' 
        ? 'Възникна грешка при запазване на снимките. Опитайте отново.' 
        : 'Error saving images. Please try again.', {
        autoClose: 5000,
        onClick: () => handleContinue() // Allow retry on click
      });
    }
  };

  const workflowSteps = [
    { id: 'vehicle', label: language === 'bg' ? 'Тип' : 'Type', icon: undefined, isCompleted: true },
    { id: 'seller', label: language === 'bg' ? 'Продавач' : 'Seller', icon: undefined, isCompleted: true },
    { id: 'data', label: language === 'bg' ? 'Данни' : 'Data', icon: undefined, isCompleted: true },
    { id: 'equipment', label: language === 'bg' ? 'Оборудване' : 'Equipment', icon: undefined, isCompleted: true },
    { id: 'images', label: language === 'bg' ? 'Снимки' : 'Images', icon: undefined, isCompleted: false },
    { id: 'pricing', label: language === 'bg' ? 'Цена' : 'Price', icon: undefined, isCompleted: false },
    { id: 'contact', label: language === 'bg' ? 'Контакт' : 'Contact', icon: undefined, isCompleted: false },
    { id: 'publish', label: language === 'bg' ? 'Публикуване' : 'Publish', icon: undefined, isCompleted: false }
  ];

  const leftContent = (
    <S.ContentSection>
      <S.HeaderCard>
        <S.Title>{language === 'bg' ? 'Снимки на превозното средство' : 'Vehicle Photos'}</S.Title>
        <S.Subtitle>
          {language === 'bg' 
            ? 'Качете до 20 снимки на вашето превозно средство' 
            : 'Upload up to 20 photos of your vehicle'}
        </S.Subtitle>

        <S.BrandOrbitInline>
          <WorkflowFlow
            variant="inline"
            currentStepIndex={3}
            totalSteps={8}
            carBrand={make || undefined}
            language={language}
          />
        </S.BrandOrbitInline>
      </S.HeaderCard>

      {/* Top Navigation Buttons */}
      <S.NavigationButtons>
        <S.Button type="button" $variant="secondary" onClick={() => navigate(-1)}>
          ← {language === 'bg' ? 'Назад' : 'Back'}
        </S.Button>
        <S.Button type="button" $variant="primary" onClick={handleContinue}>
          {language === 'bg' ? 'Продължи' : 'Continue'} →
        </S.Button>
      </S.NavigationButtons>

      <S.UploadCard
        $isDragOver={isDragOver}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <S.UploadIcon>
          <Upload size={48} />
        </S.UploadIcon>
        <S.UploadText>
          {language === 'bg' 
            ? 'Плъзнете снимки тук или кликнете за избор' 
            : 'Drag photos here or click to select'}
        </S.UploadText>
        <S.FileInput
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
        />
        <S.UploadButton as="label" htmlFor="file-upload">
          <ImageIcon size={20} />
          {language === 'bg' ? 'Избери снимки' : 'Choose Photos'}
        </S.UploadButton>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </S.UploadCard>

      {files.length > 0 && (
        <S.PreviewGrid>
          {files.map((file, index) => (
            <S.PreviewCard key={index}>
              <S.PreviewImage src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
              <S.RemoveButton onClick={() => removeFile(index)}>
                <X size={16} />
              </S.RemoveButton>
              <S.ImageNumber>{index + 1}</S.ImageNumber>
            </S.PreviewCard>
          ))}
        </S.PreviewGrid>
      )}

      <S.InfoBox>
        📸 {language === 'bg' 
          ? `${files.length}/20 снимки избрани` 
          : `${files.length}/20 photos selected`}
        <br />
        {language === 'bg' 
          ? 'Първата снимка ще бъде основната' 
          : 'First photo will be the main one'}
      </S.InfoBox>

      <S.NavigationButtons>
        <S.Button type="button" $variant="secondary" onClick={() => navigate(-1)}>
          ← {language === 'bg' ? 'Назад' : 'Back'}
        </S.Button>
        <S.Button type="button" $variant="primary" onClick={handleContinue}>
          {language === 'bg' ? 'Продължи' : 'Continue'} →
        </S.Button>
      </S.NavigationButtons>
    </S.ContentSection>
  );

  return (
    <SellWorkflowLayout currentStep="images">
      <SplitScreenLayout leftContent={leftContent} />
    </SellWorkflowLayout>
  );
};

export default ImagesPageNew;


// Images Upload Page with Workflow
// صفحة رفع الصور مع الأتمتة
// File Size: ~250 lines ✅

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/services/logger-service';
import SplitScreenLayout from '@/components/SplitScreenLayout';
import { WorkflowFlow } from '@/components/WorkflowVisualization';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import * as S from './styles';

const ImagesPageNew: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const vehicleType = searchParams.get('vt');
  const make = searchParams.get('mk');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files].slice(0, 20));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    setSelectedFiles(prev => [...prev, ...files].slice(0, 20));
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    if (selectedFiles.length === 0) {
      alert(language === 'bg' ? 'Моля, качете поне една снимка!' : 'Please upload at least one photo!');
      return;
    }

    try {
      // Save images to localStorage as base64
      const imagePromises = selectedFiles.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const base64Images = await Promise.all(imagePromises);
      localStorage.setItem('globul_sell_workflow_images', JSON.stringify(base64Images));
      logger.info('Images saved successfully', { count: selectedFiles.length, vehicleType });

      const params = new URLSearchParams(searchParams.toString());
      params.set('images', selectedFiles.length.toString());
      navigate(`/sell/inserat/${vehicleType || 'car'}/details/kontaktinformationen?${params.toString()}`);
    } catch (error) {
      logger.error('Error saving images', error as Error, { vehicleType });
      alert(language === 'bg' 
        ? 'Възникна грешка при запазване на снимките. Моля, опитайте отново.' 
        : 'Error saving images. Please try again.');
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

      {selectedFiles.length > 0 && (
        <S.PreviewGrid>
          {selectedFiles.map((file, index) => (
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
          ? `${selectedFiles.length}/20 снимки избрани` 
          : `${selectedFiles.length}/20 photos selected`}
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

  const rightContent = <WorkflowFlow currentStepIndex={4} totalSteps={8} carBrand={make || undefined} language={language} />;

  return <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} />;
};

export default ImagesPageNew;


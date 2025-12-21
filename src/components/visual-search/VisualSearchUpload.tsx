// Visual Search Upload Component - مكون رفع الصور للبحث
import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { visualSearchService, VisualSearchResult } from '../../services/advanced/visual-search.service';
import { logger } from '../../services/logger-service';

interface VisualSearchUploadProps {
  onSearchComplete?: (result: VisualSearchResult) => void;
  variant?: 'full' | 'compact';
}

export const VisualSearchUpload: React.FC<VisualSearchUploadProps> = ({
  onSearchComplete,
  variant = 'full'
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('visualSearch.invalidFileType'));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(t('visualSearch.fileTooLarge'));
      return;
    }

    setSelectedImage(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

  }, [t]);

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle drag events
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handle drop
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle paste from clipboard
   */
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleFileSelect(file);
        }
        break;
      }
    }
  }, [handleFileSelect]);

  // Listen for paste events
  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  /**
   * Search by image
   */
  const handleSearch = async () => {
    if (!selectedImage) return;

    setIsSearching(true);
    setError('');

    try {
      // Perform visual search
      const result = await visualSearchService.searchByImage(selectedImage);

      logger.info('Visual search completed', {
        resultsCount: result.similarCars.length,
        confidence: result.detectedFeatures.confidence
      });

      // Call callback
      if (onSearchComplete) {
        onSearchComplete(result);
      } else {
        // Navigate to results page
        navigate('/visual-search-results', { state: { result } });
      }

    } catch (err) {
      logger.error('Visual search failed', err as Error);
      setError(t('visualSearch.searchFailed'));
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Clear selection
   */
  const handleClear = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!visualSearchService.isAvailable()) {
    return (
      <S.UnavailableMessage>
        <S.Icon>🚫</S.Icon>
        <S.Text>{t('visualSearch.unavailable')}</S.Text>
      </S.UnavailableMessage>
    );
  }

  return (
    <S.Container variant={variant}>
      {/* Upload Area */}
      {!previewUrl && (
        <S.UploadArea
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          $dragActive={dragActive}
        >
          <S.UploadIcon>📸</S.UploadIcon>
          <S.UploadTitle>{t('visualSearch.uploadTitle')}</S.UploadTitle>
          <S.UploadSubtitle>{t('visualSearch.uploadSubtitle')}</S.UploadSubtitle>
          
          <S.OrDivider>
            <S.OrLine />
            <S.OrText>{t('common.or')}</S.OrText>
            <S.OrLine />
          </S.OrDivider>

          <S.PasteHint>
            <S.Icon>📋</S.Icon>
            {t('visualSearch.pasteHint')}
          </S.PasteHint>

          <S.HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
          />
        </S.UploadArea>
      )}

      {/* Preview Area */}
      {previewUrl && (
        <S.PreviewArea>
          <S.PreviewImage src={previewUrl} alt="Preview" />
          
          <S.PreviewActions>
            <S.ActionButton onClick={handleClear} disabled={isSearching}>
              <S.Icon>🗑️</S.Icon>
              {t('common.clear')}
            </S.ActionButton>

            <S.SearchButton onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <S.Spinner />
                  {t('visualSearch.searching')}
                </>
              ) : (
                <>
                  <S.Icon>🔍</S.Icon>
                  {t('visualSearch.search')}
                </>
              )}
            </S.SearchButton>
          </S.PreviewActions>
        </S.PreviewArea>
      )}

      {/* Error Message */}
      {error && (
        <S.ErrorMessage>
          <S.Icon>⚠️</S.Icon>
          {error}
        </S.ErrorMessage>
      )}

      {/* Features Info */}
      {variant === 'full' && !previewUrl && (
        <S.FeaturesInfo>
          <S.FeatureItem>
            <S.FeatureIcon>✅</S.FeatureIcon>
            <S.FeatureText>{t('visualSearch.feature1')}</S.FeatureText>
          </S.FeatureItem>
          <S.FeatureItem>
            <S.FeatureIcon>✅</S.FeatureIcon>
            <S.FeatureText>{t('visualSearch.feature2')}</S.FeatureText>
          </S.FeatureItem>
          <S.FeatureItem>
            <S.FeatureIcon>✅</S.FeatureIcon>
            <S.FeatureText>{t('visualSearch.feature3')}</S.FeatureText>
          </S.FeatureItem>
        </S.FeaturesInfo>
      )}
    </S.Container>
  );
};

// Styled Components
namespace S {
  export const Container = styled.div<{ variant: string }>`
    width: 100%;
    max-width: ${props => props.variant === 'full' ? '800px' : '500px'};
    margin: 0 auto;
  `;

  export const UploadArea = styled.div<{ $dragActive: boolean }>`
    border: 3px dashed ${props => props.$dragActive ? props.theme.colors.primary : '#ddd'};
    border-radius: 16px;
    padding: 60px 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: ${props => props.$dragActive 
      ? 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)'
      : '#fafafa'
    };

    &:hover {
      border-color: ${props => props.theme.colors.primary};
      background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
    }
  `;

  export const UploadIcon = styled.div`
    font-size: 64px;
    margin-bottom: 20px;
  `;

  export const UploadTitle = styled.h3`
    font-size: 24px;
    color: #333;
    margin-bottom: 10px;
    font-weight: 600;
  `;

  export const UploadSubtitle = styled.p`
    font-size: 16px;
    color: #666;
    margin-bottom: 20px;
  `;

  export const OrDivider = styled.div`
    display: flex;
    align-items: center;
    margin: 30px 0;
  `;

  export const OrLine = styled.div`
    flex: 1;
    height: 1px;
    background: #ddd;
  `;

  export const OrText = styled.span`
    padding: 0 15px;
    color: #999;
    font-size: 14px;
  `;

  export const PasteHint = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    background: #f5f5f5;
    border-radius: 8px;
    font-size: 14px;
    color: #666;
    margin-top: 20px;
  `;

  export const HiddenInput = styled.input`
    display: none;
  `;

  export const PreviewArea = styled.div`
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  `;

  export const PreviewImage = styled.img`
    width: 100%;
    max-height: 500px;
    object-fit: contain;
    background: #000;
  `;

  export const PreviewActions = styled.div`
    display: flex;
    gap: 15px;
    padding: 20px;
    background: white;
  `;

  export const ActionButton = styled.button`
    flex: 1;
    padding: 15px 30px;
    border: 2px solid #ddd;
    border-radius: 12px;
    background: white;
    color: #666;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      border-color: #999;
      color: #333;
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  export const SearchButton = styled(ActionButton)`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
  `;

  export const Icon = styled.span`
    font-size: 20px;
  `;

  export const Spinner = styled.div`
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  export const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px 20px;
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 12px;
    color: #c33;
    font-size: 14px;
    margin-top: 15px;
  `;

  export const UnavailableMessage = styled.div`
    text-align: center;
    padding: 60px 40px;
    background: #f5f5f5;
    border-radius: 16px;
  `;

  export const Text = styled.p`
    font-size: 16px;
    color: #666;
    margin-top: 15px;
  `;

  export const FeaturesInfo = styled.div`
    margin-top: 40px;
    padding: 30px;
    background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
    border-radius: 16px;
  `;

  export const FeatureItem = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;

    &:not(:last-child) {
      border-bottom: 1px solid #ddd;
    }
  `;

  export const FeatureIcon = styled.span`
    font-size: 20px;
  `;

  export const FeatureText = styled.span`
    font-size: 15px;
    color: #555;
  `;
}

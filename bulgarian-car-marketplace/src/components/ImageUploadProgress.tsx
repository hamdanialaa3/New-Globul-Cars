// Image Upload Progress Component with Retry
// مكون تقدم رفع الصور مع إعادة المحاولة

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface ImageUploadProgressProps {
  isUploading: boolean;
  currentImage: number;
  totalImages: number;
  progress: number;
  fileName?: string;
  estimatedTimeSeconds?: number;
  onCancel?: () => void;
  errors?: string[];
  onRetry?: () => void;
}

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #334155;
  }
`;

const ProgressContainer = styled.div`
  margin: 1.5rem 0;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #64748b;
`;

const ImageInfo = styled.div`
  font-weight: 600;
  color: #2c3e50;
`;

const PercentageText = styled.div`
  font-weight: 700;
  color: #ff8f10;
  font-size: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: #e2e8f0;
  border-radius: 100px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background: linear-gradient(90deg, #ff8f10, #005ca9);
  border-radius: 100px;
  transition: width 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: ${pulse} 1.5s ease-in-out infinite;
  }
`;

const FileNameText = styled.div`
  margin-top: 0.5rem;
  font-size: 0.813rem;
  color: #64748b;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
`;

const Stat = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
`;

const ErrorsContainer = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: #fef2f2;
  border-radius: 12px;
  border-left: 4px solid #dc2626;
`;

const ErrorItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #991b1b;

  svg {
    margin-top: 2px;
    flex-shrink: 0;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;

  ${props => {
    if (props.$variant === 'secondary') {
      return `
        background: #f1f5f9;
        color: #475569;
        &:hover {
          background: #e2e8f0;
        }
      `;
    }
    return `
      background: linear-gradient(135deg, #ff8f10, #005ca9);
      color: white;
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);
      }
    `;
  }}

  svg {
    width: 16px;
    height: 16px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const SpinningIcon = styled(RefreshCw)`
  animation: ${spin} 1s linear infinite;
`;

const ImageUploadProgress: React.FC<ImageUploadProgressProps> = ({
  isUploading,
  currentImage,
  totalImages,
  progress,
  fileName,
  estimatedTimeSeconds,
  onCancel,
  errors = [],
  onRetry
}) => {
  if (!isUploading && errors.length === 0) return null;

  const hasErrors = errors.length > 0;
  const isComplete = progress >= 100 && currentImage === totalImages;

  return (
    <Modal>
      <Card>
        <Header>
          <Title>
            {hasErrors ? (
              <>
                <AlertCircle size={24} color="#dc2626" />
                Upload Errors
              </>
            ) : isComplete ? (
              <>
                <CheckCircle size={24} color="#10b981" />
                Upload Complete
              </>
            ) : (
              <>
                <SpinningIcon size={24} color="#ff8f10" />
                Uploading Images
              </>
            )}
          </Title>
          {onCancel && (
            <CloseButton onClick={onCancel}>
              <X size={20} />
            </CloseButton>
          )}
        </Header>

        {!hasErrors && (
          <>
            <ProgressContainer>
              <ProgressLabel>
                <ImageInfo>
                  Image {currentImage} of {totalImages}
                </ImageInfo>
                <PercentageText>{Math.round(progress)}%</PercentageText>
              </ProgressLabel>
              
              <ProgressBar>
                <ProgressFill $progress={progress} />
              </ProgressBar>

              {fileName && (
                <FileNameText title={fileName}>
                  {fileName}
                </FileNameText>
              )}
            </ProgressContainer>

            <Stats>
              <Stat>
                <StatLabel>Completed</StatLabel>
                <StatValue>{currentImage - 1}</StatValue>
              </Stat>
              <Stat>
                <StatLabel>Remaining</StatLabel>
                <StatValue>
                  {estimatedTimeSeconds 
                    ? `~${estimatedTimeSeconds}s` 
                    : totalImages - currentImage + 1}
                </StatValue>
              </Stat>
            </Stats>
          </>
        )}

        {hasErrors && (
          <ErrorsContainer>
            {errors.map((error, index) => (
              <ErrorItem key={index}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </ErrorItem>
            ))}
          </ErrorsContainer>
        )}

        {hasErrors && onRetry && (
          <Actions>
            <Button $variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onRetry}>
              <RefreshCw size={16} />
              Retry Upload
            </Button>
          </Actions>
        )}

        {isComplete && (
          <Actions>
            <Button onClick={onCancel}>
              <CheckCircle size={16} />
              Continue
            </Button>
          </Actions>
        )}
      </Card>
    </Modal>
  );
};

export default ImageUploadProgress;


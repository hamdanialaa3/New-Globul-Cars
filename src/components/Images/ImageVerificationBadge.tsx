/**
 * Image Verification Badge
 * شارة التحقق من الصور - تأكيد جودة وأصالة الصور
 * 
 * Features:
 * - Visual verification status
 * - AI quality assessment
 * - Original photo badge
 * - Real photo indicator
 * - Click for details
 * 
 * @since January 17, 2026
 */

import React from 'react';
import styled from 'styled-components';
import { CheckCircle, AlertCircle, ImageOff, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ==================== TYPES ====================

export type VerificationStatus = 'verified' | 'processing' | 'unverified' | 'suspicious';

interface VerificationDetails {
  status: VerificationStatus;
  confidence: number;
  isOriginal: boolean;
  qualityScore: number;
  lastChecked?: Date;
  notes?: string;
}

interface ImageVerificationBadgeProps {
  status: VerificationStatus;
  confidence?: number;
  isOriginal?: boolean;
  qualityScore?: number;
  onClick?: () => void;
  compact?: boolean;
  showLabel?: boolean;
}

// ==================== STYLES ====================

const BadgeContainer = styled.div<{ $compact: boolean; $clickable: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.$compact ? '6px' : '10px'};
  padding: ${props => props.$compact ? '6px 10px' : '8px 12px'};
  border-radius: ${props => props.$compact ? '8px' : '12px'};
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: ${props => props.$compact ? '12px' : '13px'};
  font-weight: 600;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    ${props => props.$clickable ? `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      border-color: rgba(0, 0, 0, 0.15);
    ` : ''}
  }

  &:active {
    ${props => props.$clickable ? `
      transform: translateY(0);
    ` : ''}
  }
`;

const IconWrapper = styled.div<{ $status: VerificationStatus }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: ${props => {
    switch (props.$status) {
      case 'verified': return '#10b981';
      case 'processing': return '#f59e0b';
      case 'unverified': return '#6b7280';
      case 'suspicious': return '#ef4444';
      default: return '#6b7280';
    }
  }};

  svg {
    width: 16px;
    height: 16px;
    stroke-width: 2.5;
  }
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Label = styled.div<{ $status: VerificationStatus }>`
  color: ${props => {
    switch (props.$status) {
      case 'verified': return '#10b981';
      case 'processing': return '#f59e0b';
      case 'unverified': return '#6b7280';
      case 'suspicious': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  font-weight: 700;
  font-size: 12px;
`;

const Sublabel = styled.div`
  color: #9ca3af;
  font-size: 11px;
  font-weight: 500;
`;

const Tooltip = styled.div<{ $show: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease;
  z-index: 1000;
  margin-bottom: 8px;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #1f2937;
  }
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Badge = styled.div<{ $status: VerificationStatus }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${props => {
    switch (props.$status) {
      case 'verified': return '#d1fae5';
      case 'processing': return '#fef3c7';
      case 'unverified': return '#f3f4f6';
      case 'suspicious': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  border-radius: 10px;
  border: 1px solid ${props => {
    switch (props.$status) {
      case 'verified': return '#a7f3d0';
      case 'processing': return '#fde68a';
      case 'unverified': return '#e5e7eb';
      case 'suspicious': return '#fecaca';
      default: return '#e5e7eb';
    }
  }};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 0;
      transform: translateY(0);
    }
  }
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DetailSection = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const DetailValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
`;

const DetailBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DetailBarValue = styled.div`
  flex: 1;
`;

const BarBackground = styled.div`
  background: #e5e7eb;
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $percentage: number; $color: string }>`
  width: ${props => props.$percentage}%;
  height: 100%;
  background: ${props => props.$color};
  border-radius: 8px;
  transition: width 0.5s ease;
`;

const BarPercent = styled.div`
  font-weight: 700;
  font-size: 14px;
  min-width: 40px;
  text-align: right;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

// ==================== HELPER COMPONENT ====================

const VerificationStatusIcon: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  switch (status) {
    case 'verified':
      return <CheckCircle size={16} />;
    case 'processing':
      return <Zap size={16} />;
    case 'suspicious':
      return <AlertCircle size={16} />;
    case 'unverified':
    default:
      return <ImageOff size={16} />;
  }
};

// ==================== MAIN COMPONENT ====================

export const ImageVerificationBadge: React.FC<ImageVerificationBadgeProps> = ({
  status,
  confidence = 0,
  isOriginal = false,
  qualityScore = 0,
  onClick,
  compact = false,
  showLabel = true,
}) => {
  const { language } = useLanguage();
  const [showModal, setShowModal] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);

  const labels = {
    bg: {
      verified: 'Потвърдено',
      processing: 'Обработване',
      unverified: 'Непроверено',
      suspicious: 'Подозрително',
      confidence: 'Надеждност',
      quality: 'Качество',
      original: 'Оригинална снимка',
      details: 'Детали за проверка',
      verifiedDesc: 'Тази снимка е проверена и потвърдена като оригинална',
      processingDesc: 'Системата в момента проверява снимката',
      unverifiedDesc: 'Снимката не е проверена',
      suspiciousDesc: 'Възможна манипулация на снимката'
    },
    en: {
      verified: 'Verified',
      processing: 'Processing',
      unverified: 'Unverified',
      suspicious: 'Suspicious',
      confidence: 'Confidence',
      quality: 'Quality',
      original: 'Original Photo',
      details: 'Verification Details',
      verifiedDesc: 'This image is verified and confirmed as original',
      processingDesc: 'System is currently verifying this image',
      unverifiedDesc: 'This image has not been verified',
      suspiciousDesc: 'Possible image manipulation detected'
    }
  };

  const text = language === 'bg' ? labels.bg : labels.en;

  const getStatusLabel = () => {
    switch (status) {
      case 'verified': return text.verified;
      case 'processing': return text.processing;
      case 'unverified': return text.unverified;
      case 'suspicious': return text.suspicious;
      default: return text.unverified;
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'verified': return text.verifiedDesc;
      case 'processing': return text.processingDesc;
      case 'unverified': return text.unverifiedDesc;
      case 'suspicious': return text.suspiciousDesc;
      default: return text.unverifiedDesc;
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    setShowModal(true);
  };

  if (compact) {
    return (
      <TooltipWrapper
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Badge $status={status}>
          <VerificationStatusIcon status={status} />
          {showLabel && getStatusLabel()}
        </Badge>
        <Tooltip $show={showTooltip}>{getStatusDescription()}</Tooltip>
      </TooltipWrapper>
    );
  }

  return (
    <>
      <BadgeContainer
        $compact={compact}
        $clickable={!!onClick}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <IconWrapper $status={status}>
          <VerificationStatusIcon status={status} />
        </IconWrapper>
        {showLabel && (
          <TextContent>
            <Label $status={status}>{getStatusLabel()}</Label>
            {status === 'verified' && isOriginal && (
              <Sublabel>✓ {text.original}</Sublabel>
            )}
          </TextContent>
        )}
        <Tooltip $show={showTooltip}>{getStatusDescription()}</Tooltip>
      </BadgeContainer>

      {/* Modal */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>
              <VerificationStatusIcon status={status} />
              {text.details}
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalTitle>

            <DetailSection>
              <DetailLabel>{text.verified}</DetailLabel>
              <DetailValue>{getStatusLabel()}</DetailValue>
            </DetailSection>

            {confidence > 0 && (
              <DetailSection>
                <DetailLabel>{text.confidence}</DetailLabel>
                <DetailBar>
                  <DetailBarValue>
                    <BarBackground>
                      <BarFill
                        $percentage={confidence}
                        $color={status === 'verified' ? '#10b981' : '#f59e0b'}
                      />
                    </BarBackground>
                  </DetailBarValue>
                  <BarPercent>{confidence}%</BarPercent>
                </DetailBar>
              </DetailSection>
            )}

            {qualityScore > 0 && (
              <DetailSection>
                <DetailLabel>{text.quality}</DetailLabel>
                <DetailBar>
                  <DetailBarValue>
                    <BarBackground>
                      <BarFill
                        $percentage={qualityScore}
                        $color="#8b5cf6"
                      />
                    </BarBackground>
                  </DetailBarValue>
                  <BarPercent>{qualityScore}/100</BarPercent>
                </DetailBar>
              </DetailSection>
            )}

            {isOriginal && (
              <DetailSection>
                <DetailLabel>{text.original}</DetailLabel>
                <DetailValue>✓ {language === 'bg' ? 'Да' : 'Yes'}</DetailValue>
              </DetailSection>
            )}

            <DetailSection>
              <DetailLabel>Description</DetailLabel>
              <DetailValue>{getStatusDescription()}</DetailValue>
            </DetailSection>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default ImageVerificationBadge;

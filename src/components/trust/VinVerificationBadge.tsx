import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ShieldCheck, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts';
import type { VinVerification } from '../../types/vin.types';

interface VinVerificationBadgeProps {
  vinData?: VinVerification;
  vin?: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

/**
 * Liquid Industrial Design - Pulasting Neon Glow
 */
const pulseGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.2); }
  50% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.6); }
  100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.2); }
`;

export const VinVerificationBadge: React.FC<VinVerificationBadgeProps> = ({
  vinData,
  vin,
  size = 'medium',
  onClick
}) => {
  const { language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  const isVerified = vinData?.isVerified === true;
  const hasHistory = vinData?.hasFlags === true || vinData?.reportedMileage !== undefined;
  
  const getBadgeConfig = () => {
    if (isVerified && !vinData?.hasFlags) {
      return {
        color: '#10B981', // Neon Green
        bgColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        icon: ShieldCheck,
        labelBg: 'Koli.one Проверен',
        labelEn: 'Koli.one Verified',
        glow: true,
      };
    } else if (isVerified && vinData?.hasFlags) {
      return {
        color: '#F59E0B', // Warning Amber
        bgColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        icon: ShieldAlert,
        labelBg: 'Проверен (Има забележки)',
        labelEn: 'Verified (Flags Found)',
        glow: false,
      };
    } else if (vin) {
      return {
        color: '#6B7280', // Glass Gray
        bgColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        icon: ShieldAlert,
        labelBg: 'Непроверен VIN',
        labelEn: 'Unverified VIN',
        glow: false,
      };
    }
    return null;
  };

  const config = getBadgeConfig();
  if (!config) return null;

  const Icon = config.icon;
  const label = language === 'bg' ? config.labelBg : config.labelEn;

  return (
    <BadgeWrapper
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BadgeContainer 
        $size={size} 
        $color={config.color} 
        $bgColor={config.bgColor}
        $borderColor={config.borderColor}
        $glow={config.glow}
        onClick={onClick}
        $clickable={!!onClick}
      >
        <Icon size={size === 'small' ? 14 : size === 'large' ? 20 : 16} />
        <BadgeText $size={size}>{label}</BadgeText>
      </BadgeContainer>

      {/* Glass-morphism Tooltip strictly adhering to Liquid Industrial Design */}
      {isHovered && isVerified && (
        <TooltipContainer>
           <TooltipHeader>
             <Cpu size={14} color="#3B82F6" />
             <TooltipTitle>Neural Verification System</TooltipTitle>
           </TooltipHeader>
           
           <TooltipBody>
             <TooltipRow>
               <CheckCircle size={12} color="#10B981" />
               <TooltipText>VIN: {vin}</TooltipText>
             </TooltipRow>
             {vinData?.provider && (
               <TooltipRow>
                 <CheckCircle size={12} color="#10B981" />
                 <TooltipText>Data Provider: EU Database ({vinData.provider})</TooltipText>
               </TooltipRow>
             )}
             {vinData?.reportedMileage && (
               <TooltipRow>
                 <CheckCircle size={12} color="#10B981" />
                 <TooltipText>Last Reported Mileage: {vinData.reportedMileage.toLocaleString()} km</TooltipText>
               </TooltipRow>
             )}
             {vinData?.verifiedAt && (
                <TooltipDate>
                  Verified on: {new Date(vinData.verifiedAt.toMillis ? vinData.verifiedAt.toMillis() : vinData.verifiedAt as any).toLocaleDateString()}
                </TooltipDate>
             )}
           </TooltipBody>
        </TooltipContainer>
      )}
    </BadgeWrapper>
  );
};

// ==================== STYLED COMPONENTS ====================

const BadgeWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const BadgeContainer = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $color: string;
  $bgColor: string;
  $borderColor: string;
  $glow: boolean;
  $clickable: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.$size === 'small' ? '4px' : '6px'};
  padding: ${props => props.$size === 'small' ? '4px 8px' : props.$size === 'large' ? '8px 16px' : '6px 12px'};
  background: ${props => props.$bgColor};
  color: ${props => props.$color};
  border: 1px solid ${props => props.$borderColor};
  border-radius: ${props => props.$size === 'small' ? '12px' : '16px'};
  backdrop-filter: blur(8px);
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: all 0.2s ease;
  animation: ${props => props.$glow ? pulseGlow : 'none'} 3s infinite;

  &:hover {
    ${props => props.$clickable && `
      transform: translateY(-1px);
      filter: brightness(1.2);
    `}
  }
`;

const BadgeText = styled.span<{ $size: 'small' | 'medium' | 'large' }>`
  font-size: ${props => props.$size === 'small' ? '11px' : props.$size === 'large' ? '14px' : '12px'};
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
`;

const TooltipContainer = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 240px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  z-index: 50;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  pointer-events: none;
`;

const TooltipHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
  margin-bottom: 8px;
`;

const TooltipTitle = styled.span`
  color: #E2E8F0;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
`;

const TooltipBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TooltipRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TooltipText = styled.span`
  color: #94A3B8;
  font-size: 12px;
`;

const TooltipDate = styled.div`
  color: #64748B;
  font-size: 10px;
  margin-top: 4px;
`;

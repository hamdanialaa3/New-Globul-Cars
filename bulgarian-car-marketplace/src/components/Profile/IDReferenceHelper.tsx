// src/components/Profile/IDReferenceHelper.tsx
// ID Reference Helper - مساعد البطاقة المرجعي
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { CreditCard, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { fieldMappings } from './id-helper/fieldMappings';

// ==================== STYLED COMPONENTS ====================

const HelperContainer = styled.div<{ $collapsed: boolean }>`
  position: fixed;
  right: 20px;
  top: 100px;
  width: ${props => props.$collapsed ? '50px' : '280px'};
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  z-index: 99;
  transition: all 0.3s ease;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 121, 0, 0.1);
  
  @media (max-width: 1200px) {
    display: none; /* Hide on smaller screens */
  }
`;

const HelperHeader = styled.div`
  padding: 10px 12px;
  background: linear-gradient(135deg, #FF7900, #ff8c1a);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  
  h4 {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const HelperContent = styled.div<{ $show: boolean }>`
  max-height: ${props => props.$show ? '450px' : '0'};
  overflow-y: auto;
  transition: max-height 0.3s ease;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f0f0f0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #FF7900;
    border-radius: 2px;
  }
`;

const IDImageContainer = styled.div<{ $visible: boolean }>`
  position: relative;
  padding: 10px;
  opacity: ${props => props.$visible ? 1 : 0.3};
  transition: all 0.3s ease;
  filter: ${props => props.$visible ? 'none' : 'blur(8px)'};
`;

const IDImage = styled.img`
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  opacity: 0.4; /* 40% opacity - شفافية 40% */
  transition: transform 0.3s ease, opacity 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
    opacity: 0.6; /* زيادة الوضوح قليلاً عند التمرير */
  }
`;

const HighlightOverlay = styled.div<{ $active: boolean; $position: { top: string; left: string; width: string; height: string } }>`
  position: absolute;
  top: ${props => props.$position.top};
  left: ${props => props.$position.left};
  width: ${props => props.$position.width};
  height: ${props => props.$position.height};
  border: 3px solid #FF7900;
  border-radius: 4px;
  background: rgba(255, 121, 0, 0.1);
  opacity: ${props => props.$active ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: none;
  animation: ${props => props.$active ? 'pulse 2s  /* ⚡ OPTIMIZED: Removed infinite */' : 'none'};
  
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255, 121, 0, 0.7); }
    50% { box-shadow: 0 0 0 8px rgba(255, 121, 0, 0); }
  }
`;

const FieldMappingList = styled.div`
  padding: 10px;
  border-top: 1px solid #f0f0f0;
`;

const FieldMappingItem = styled.div<{ $active: boolean }>`
  padding: 8px 10px;
  margin-bottom: 6px;
  background: ${props => props.$active ? '#fff5e6' : '#f9f9f9'};
  border-left: 2px solid ${props => props.$active ? '#FF7900' : 'transparent'};
  border-radius: 4px;
  font-size: 0.7rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #fff5e6;
    border-left-color: #FF7900;
  }
  
  .field-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 2px;
    font-size: 0.68rem;
  }
  
  .field-value {
    color: #666;
    font-family: monospace;
    font-size: 0.65rem;
  }
`;

const ToggleButton = styled.button`
  width: 100%;
  padding: 8px;
  border: none;
  background: #f9f9f9;
  color: #666;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
    color: #FF7900;
  }
`;

const InfoBadge = styled.div`
  padding: 6px 10px;
  margin: 8px 10px;
  background: #e3f2fd;
  border-radius: 6px;
  font-size: 0.65rem;
  color: #1976d2;
  text-align: center;
`;

// ==================== COMPONENT ====================

interface IDReferenceHelperProps {
  activeField?: string;
  onClose?: () => void;
}

const IDReferenceHelper: React.FC<IDReferenceHelperProps> = ({
  activeField,
  onClose
}) => {
  const { language } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [showID, setShowID] = useState(true);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');

  const currentFields = fieldMappings[currentSide];
  const currentFieldData = activeField ? currentFields[activeField] : null;

  const getImagePath = () => {
    return currentSide === 'front' 
      ? '/assets/images/getimage.webp'
      : '/assets/images/1920x1080.webp';
  };

  if (collapsed) {
    return (
      <HelperContainer $collapsed={true}>
        <HelperHeader onClick={() => setCollapsed(false)}>
          <CreditCard size={20} />
        </HelperHeader>
      </HelperContainer>
    );
  }

  return (
    <HelperContainer $collapsed={false}>
      <HelperHeader onClick={() => setCollapsed(!collapsed)}>
        <h4>
          <CreditCard size={14} />
          {language === 'bg' ? 'Лична карта' : 'ID Card'}
        </h4>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowID(!showID); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            {showID ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </HelperHeader>

      <HelperContent $show={!collapsed}>
        <InfoBadge>
          {language === 'bg' 
            ? '💡 البطاقة للمساعدة في ملء البيانات'
            : '💡 Card helps you fill the data'}
        </InfoBadge>

        <IDImageContainer $visible={showID}>
          <IDImage 
            src={getImagePath()} 
            alt={currentSide === 'front' ? 'ID Front' : 'ID Back'}
          />
          {currentFieldData && showID && (
            <HighlightOverlay 
              $active={true}
              $position={currentFieldData.position}
            />
          )}
        </IDImageContainer>

        <ToggleButton onClick={() => setCurrentSide(currentSide === 'front' ? 'back' : 'front')}>
          <CreditCard size={12} />
          {currentSide === 'front'
            ? (language === 'bg' ? 'Гръб' : 'Back')
            : (language === 'bg' ? 'Предна страна' : 'Front')
          }
        </ToggleButton>

        <FieldMappingList>
          {Object.entries(currentFields).map(([key, data]: [string, any]) => (
            <FieldMappingItem 
              key={key}
              $active={activeField === key}
            >
              <div className="field-name">
                {language === 'bg' ? data.label_bg : data.label_en}
              </div>
              <div className="field-value">
                {data.value}
              </div>
            </FieldMappingItem>
          ))}
        </FieldMappingList>
      </HelperContent>
    </HelperContainer>
  );
};

export default IDReferenceHelper;

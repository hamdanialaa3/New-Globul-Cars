// src/components/Profile/IDReferenceHelper.tsx
// ID Reference Helper - مساعد البطاقة المرجعي
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { CreditCard, X, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// ==================== STYLED COMPONENTS ====================

const HelperContainer = styled.div<{ $collapsed: boolean }>`
  position: fixed;
  right: 20px;
  top: 100px;
  width: ${props => props.$collapsed ? '60px' : '380px'};
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  transition: all 0.3s ease;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    display: none; /* Hide on smaller screens */
  }
`;

const HelperHeader = styled.div`
  padding: 16px;
  background: linear-gradient(135deg, #FF7900, #ff8c1a);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  
  h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const HelperContent = styled.div<{ $show: boolean }>`
  max-height: ${props => props.$show ? '600px' : '0'};
  overflow-y: auto;
  transition: max-height 0.3s ease;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f0f0f0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #FF7900;
    border-radius: 3px;
  }
`;

const IDImageContainer = styled.div<{ $visible: boolean }>`
  position: relative;
  padding: 16px;
  opacity: ${props => props.$visible ? 1 : 0.3};
  transition: all 0.3s ease;
  filter: ${props => props.$visible ? 'none' : 'blur(8px)'};
`;

const IDImage = styled.img`
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
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
  animation: ${props => props.$active ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255, 121, 0, 0.7); }
    50% { box-shadow: 0 0 0 8px rgba(255, 121, 0, 0); }
  }
`;

const FieldMappingList = styled.div`
  padding: 16px;
  border-top: 1px solid #f0f0f0;
`;

const FieldMappingItem = styled.div<{ $active: boolean }>`
  padding: 12px;
  margin-bottom: 8px;
  background: ${props => props.$active ? '#fff5e6' : '#f9f9f9'};
  border-left: 3px solid ${props => props.$active ? '#FF7900' : 'transparent'};
  border-radius: 6px;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #fff5e6;
    border-left-color: #FF7900;
  }
  
  .field-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }
  
  .field-value {
    color: #666;
    font-family: monospace;
  }
`;

const ToggleButton = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  background: #f9f9f9;
  color: #666;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
    color: #FF7900;
  }
`;

const InfoBadge = styled.div`
  padding: 8px 12px;
  margin: 12px 16px;
  background: #e3f2fd;
  border-radius: 8px;
  font-size: 0.75rem;
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

  // Field mappings with positions on ID card
  const fieldMappings: any = {
    front: {
      firstName: {
        label_bg: 'Име',
        label_en: 'First Name',
        value: 'СЛАВИНА',
        position: { top: '40%', left: '52%', width: '30%', height: '8%' }
      },
      middleName: {
        label_bg: 'Презиме',
        label_en: 'Father\'s Name', 
        value: 'ГЕОРГИЕВА',
        position: { top: '48%', left: '52%', width: '30%', height: '8%' }
      },
      lastName: {
        label_bg: 'Фамилия',
        label_en: 'Surname',
        value: 'ИВАНОВА',
        position: { top: '32%', left: '52%', width: '30%', height: '8%' }
      },
      dateOfBirth: {
        label_bg: 'Дата на раждане',
        label_en: 'Date of Birth',
        value: '01.08.1995',
        position: { top: '64%', left: '52%', width: '30%', height: '6%' }
      },
      nationality: {
        label_bg: 'Гражданство',
        label_en: 'Nationality',
        value: 'БЪЛГАРИЯ/BGR',
        position: { top: '56%', left: '52%', width: '30%', height: '6%' }
      }
    },
    back: {
      birthPlace: {
        label_bg: 'Място на раждане',
        label_en: 'Place of Birth',
        value: 'СОФИЯ/SOFIA',
        position: { top: '12%', left: '50%', width: '45%', height: '8%' }
      },
      address: {
        label_bg: 'Постоянен адрес',
        label_en: 'Permanent Address',
        value: 'бул.КНЯГИНЯ МАРИЯ ЛУИЗА 48 ет.5 ап.26',
        position: { top: '28%', left: '15%', width: '70%', height: '10%' }
      },
      city: {
        label_bg: 'Град',
        label_en: 'City',
        value: 'СОФИЯ/SOFIA',
        position: { top: '20%', left: '50%', width: '45%', height: '8%' }
      },
      height: {
        label_bg: 'Ръст',
        label_en: 'Height',
        value: '168 cm',
        position: { top: '44%', left: '18%', width: '15%', height: '8%' }
      },
      eyeColor: {
        label_bg: 'Цвят на очите',
        label_en: 'Eye Color',
        value: 'КАФЯВИ/BROWN',
        position: { top: '44%', left: '60%', width: '35%', height: '8%' }
      }
    }
  };

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
          <CreditCard size={24} />
        </HelperHeader>
      </HelperContainer>
    );
  }

  return (
    <HelperContainer $collapsed={false}>
      <HelperHeader onClick={() => setCollapsed(!collapsed)}>
        <h4>
          <CreditCard size={18} />
          {language === 'bg' ? 'Лична карта помощник' : 'ID Card Helper'}
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowID(!showID); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            {showID ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
          {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
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
          <CreditCard size={16} />
          {currentSide === 'front'
            ? (language === 'bg' ? 'عرض الخلف' : 'Show Back')
            : (language === 'bg' ? 'عرض الأمام' : 'Show Front')
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

/**
 * Profile Type Switcher Component
 * Phase 3: UI Components
 * 
 * Allows users to upgrade/switch their profile type.
 * Includes validation and requirements checking.
 * 
 * File: src/components/Profile/ProfileTypeSwitcher.tsx
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Building2, Briefcase, ArrowRight, Check, X, AlertCircle } from 'lucide-react';
import { useProfileType } from '../../contexts/ProfileTypeContext';
import { PermissionsService } from '../../services/profile/PermissionsService';
import { useToast } from '../Toast';
import type { ProfileType } from '../../types/user/bulgarian-user.types';

interface ProfileTypeSwitcherProps {
  currentUid: string;
  onSwitchComplete?: () => void;
}

const SwitcherContainer = styled.div`
  background: #3e3e3e;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    6px 6px 12px rgba(0, 0, 0, 0.4),
    -6px -6px 12px rgba(255, 255, 255, 0.08);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 24px 0;
`;

const TypeOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const TypeCard = styled.div<{ $selected?: boolean; $current?: boolean; $color: string }>`
  background: ${props => props.$current ? 'linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%)' : '#2a2a2a'};
  border: 2px solid ${props => props.$selected ? props.$color : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  padding: 20px;
  cursor: ${props => props.$current ? 'default' : 'pointer'};
  transition: all 0.3s ease;
  position: relative;

  ${props => !props.$current && `
    &:hover {
      border-color: ${props.$color}60;
      transform: translateY(-2px);
      box-shadow: 
        4px 4px 8px rgba(0, 0, 0, 0.4),
        -4px -4px 8px rgba(255, 255, 255, 0.05);
    }
  `}

  ${props => props.$selected && `
    box-shadow: 
      0 0 20px ${props.$color}40,
      4px 4px 8px rgba(0, 0, 0, 0.4);
  `}
`;

const CurrentBadge = styled.div<{ $color: string }>`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${props => props.$color};
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const TypeIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  background: ${props => props.$color}20;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: ${props => props.$color};
`;

const TypeName = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
`;

const TypeDescription = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const Feature = styled.li`
  font-size: 0.813rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #16a34a;
    flex-shrink: 0;
  }
`;

const RequirementsList = styled.div`
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin: 16px 0;
`;

const RequirementTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #3B82F6;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Requirement = styled.div`
  font-size: 0.813rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
  padding-left: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary'; $color?: string }>`
  background: ${props => 
    props.$variant === 'primary' 
      ? `linear-gradient(135deg, ${props.$color || '#16a34a'} 0%, ${props.$color || '#15803d'} 100%)`
      : 'linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%)'
  };
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      5px 5px 10px rgba(0, 0, 0, 0.4),
      -5px -5px 10px rgba(255, 255, 255, 0.08);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ProfileTypeSwitcher: React.FC<ProfileTypeSwitcherProps> = ({
  currentUid,
  onSwitchComplete
}) => {
  const { profileType: currentType, switchProfileType } = useProfileType();
  const toast = useToast();
  const [selectedType, setSelectedType] = useState<ProfileType>(currentType);
  const [loading, setLoading] = useState(false);

  const typeOptions = [
    {
      type: 'private' as ProfileType,
      icon: <User size={24} />,
      color: '#3B82F6',
      nameBG: 'Частен',
      nameEN: 'Private',
      descriptionBG: 'За физически лица, продаващи лични автомобили',
      descriptionEN: 'For individuals selling personal cars',
      features: [
        '3 безплатни обяви',
        'Директни съобщения',
        'Проследяване на прегледите',
        'Напълно безплатно'
      ],
      requirements: []
    },
    {
      type: 'dealer' as ProfileType,
      icon: <Building2 size={24} />,
      color: '#16a34a',
      nameBG: 'Дилър',
      nameEN: 'Dealer',
      descriptionBG: 'За автосалони и лицензирани търговци',
      descriptionEN: 'For car dealerships and licensed traders',
      features: [
        '50-150 активни обяви',
        'Професионална страница на салона',
        'Разширени анализи',
        'Поддръжка на екипа',
        'API достъп'
      ],
      requirements: [
        'Валиден номер на търговски лиценз',
        'ДДС номер',
        'Пълна информация за салона'
      ]
    },
    {
      type: 'company' as ProfileType,
      icon: <Briefcase size={24} />,
      color: '#1d4ed8',
      nameBG: 'Компания',
      nameEN: 'Company',
      descriptionBG: 'За компании и управление на големи автопаркове',
      descriptionEN: 'For companies and large fleet management',
      features: [
        '100+ активни обяви',
        'Управление на екипа (10-50 члена)',
        'Анализи на автопарка',
        'Пълен API достъп',
        'Специален мениджър на акаунта'
      ],
      requirements: [
        'Valid BULSTAT number',
        'Trade register',
        'Complete company information',
        'Minimum fleet size'
      ]
    }
  ];

  const handleSwitch = async () => {
    if (selectedType === currentType) {
      toast.info('Това е текущият тип акаунт');
      return;
    }

    setLoading(true);
    try {
      await switchProfileType(selectedType);
      toast.success(`Успешно превключване към ${typeOptions.find(t => t.type === selectedType)?.nameBG}`);
      
      if (onSwitchComplete) {
        onSwitchComplete();
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      toast.error(errorMessage || 'Неуспешно превключване на типа акаунт');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SwitcherContainer>
      <Title>Choose Account Type</Title>

      <TypeOptionsGrid>
        {typeOptions.map(option => (
          <TypeCard
            key={option.type}
            $selected={selectedType === option.type}
            $current={currentType === option.type}
            $color={option.color}
            onClick={() => !loading && currentType !== option.type && setSelectedType(option.type)}
          >
            {currentType === option.type && (
              <CurrentBadge $color={option.color}>Current</CurrentBadge>
            )}

            <TypeIcon $color={option.color}>
              {option.icon}
            </TypeIcon>

            <TypeName>{option.nameBG}</TypeName>
            <TypeDescription>{option.descriptionBG}</TypeDescription>

            <FeatureList>
              {option.features.map((feature, idx) => (
                <Feature key={idx}>
                  <Check size={14} />
                  {feature}
                </Feature>
              ))}
            </FeatureList>

            {option.requirements.length > 0 && selectedType === option.type && (
              <RequirementsList>
                <RequirementTitle>
                  <AlertCircle size={16} />
                  Requirements:
                </RequirementTitle>
                {option.requirements.map((req, idx) => (
                  <Requirement key={idx}>• {req}</Requirement>
                ))}
              </RequirementsList>
            )}
          </TypeCard>
        ))}
      </TypeOptionsGrid>

      {selectedType !== currentType && (
        <ButtonGroup>
          <Button 
            $variant="secondary" 
            onClick={() => setSelectedType(currentType)}
            disabled={loading}
          >
            <X size={18} />
            Cancel
          </Button>
          <Button 
            $variant="primary" 
            $color={typeOptions.find(t => t.type === selectedType)?.color}
            onClick={handleSwitch}
            disabled={loading}
          >
            <ArrowRight size={18} />
            {loading ? 'Switching...' : 'Switch Account'}
          </Button>
        </ButtonGroup>
      )}
    </SwitcherContainer>
  );
};

export default ProfileTypeSwitcher;




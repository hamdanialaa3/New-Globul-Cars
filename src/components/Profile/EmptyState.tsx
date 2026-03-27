// src/components/Profile/EmptyState.tsx
// Empty State Component - مكون الحالة الفارغة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React from 'react';
import styled from 'styled-components';
import { Image, Users, ShoppingBag, MessageCircle, Award } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// ==================== STYLED COMPONENTS ====================

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #666;
`;

const IconContainer = styled.div<{ $color: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  margin-bottom: 24px;
`;

const Title = styled.h3`
  margin: 0 0 12px 0;
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
`;

const Description = styled.p`
  margin: 0 0 24px 0;
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  max-width: 400px;
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  background: #2563EB;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #ff8c1a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// ==================== COMPONENT ====================

interface EmptyStateProps {
  type: 'gallery' | 'cars' | 'reviews' | 'messages' | 'favorites';
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  const { language } = useLanguage();

  const configs = {
    gallery: {
      icon: Image,
      color: '#667eea',
      title: {
        bg: 'Няма снимки',
        en: 'No Photos Yet'
      },
      description: {
        bg: 'Добавете снимки към галерията си, за да покажете повече на купувачите',
        en: 'Add photos to your gallery to show buyers more about you'
      },
      action: {
        bg: 'Добави снимка',
        en: 'Add Photo'
      }
    },
    cars: {
      icon: ShoppingBag,
      color: '#c4a991ff',
      title: {
        bg: 'Няма обяви',
        en: 'No Listings Yet'
      },
      description: {
        bg: 'Започнете да продавате! Добавете първата си кола.',
        en: 'Start selling! Add your first car listing.'
      },
      action: {
        bg: 'Добави кола',
        en: 'Add Car'
      }
    },
    reviews: {
      icon: Award,
      color: '#FFD700',
      title: {
        bg: 'Няма отзиви',
        en: 'No Reviews Yet'
      },
      description: {
        bg: 'Завършете продажби, за да получите отзиви от купувачи',
        en: 'Complete sales to receive reviews from buyers'
      },
      action: null
    },
    messages: {
      icon: MessageCircle,
      color: '#2196F3',
      title: {
        bg: 'Няма съобщения',
        en: 'No Messages'
      },
      description: {
        bg: 'Тук ще виждате всички ваши разговори с купувачи',
        en: 'Your conversations with buyers will appear here'
      },
      action: null
    },
    favorites: {
      icon: Users,
      color: '#E91E63',
      title: {
        bg: 'Няма любими',
        en: 'No Favorites'
      },
      description: {
        bg: 'Запазете любимите си коли за бърз достъп',
        en: 'Save your favorite cars for quick access'
      },
      action: {
        bg: 'Разгледай коли',
        en: 'Browse Cars'
      }
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <EmptyContainer>
      <IconContainer $color={config.color}>
        <Icon size={40} />
      </IconContainer>
      
      <Title>{config.title[language]}</Title>
      <Description>{config.description[language]}</Description>
      
      {config.action && onAction && (
        <ActionButton onClick={onAction}>
          {config.action[language]}
        </ActionButton>
      )}
    </EmptyContainer>
  );
};

export default EmptyState;



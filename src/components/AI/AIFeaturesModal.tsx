/**
 * AI Features Modal Component
 * نافذة عرض ميزات الذكاء الاصطناعي
 */

import React from 'react';
import styled from 'styled-components';
import { X, Zap, TrendingUp, Search, Shield, MessageCircle, CheckCircle } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';

interface AIFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: var(--bg-card, #1a1a1a);
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const Header = styled.div`
  padding: 32px;
  border-bottom: 1px solid var(--border-primary, #333);
  position: sticky;
  top: 0;
  background: var(--bg-card, #1a1a1a);
  z-index: 1;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary, #fff);
  margin-bottom: 8px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: var(--text-secondary, #aaa);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-hover, #2a2a2a);
    color: var(--text-primary, #fff);
  }
`;

const FeaturesGrid = styled.div`
  padding: 32px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
`;

const FeatureCard = styled.div`
  padding: 24px;
  border: 1px solid var(--border-primary, #333);
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    border-color: var(--accent-primary, #6366F1);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    transform: translateY(-2px);
  }
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366F1 0%, #f7931e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: white;
`;

const FeatureName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #fff);
  margin-bottom: 8px;
`;

const FeatureDescription = styled.p`
  font-size: 14px;
  color: var(--text-secondary, #aaa);
  line-height: 1.6;
`;

export const AIFeaturesModal: React.FC<AIFeaturesModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const isBg = language === 'bg';

  const features = [
    {
      icon: TrendingUp,
      name: isBg ? 'Умно предложение за цена' : 'Smart Price Suggestion',
      description: isBg
        ? 'AI анализира пазара и предлага оптимална цена за вашия автомобил'
        : 'AI analyzes market and suggests optimal price for your car'
    },
    {
      icon: Search,
      name: isBg ? 'Асистент за търсене' : 'Search Assistant',
      description: isBg
        ? 'Намерете перфектния автомобил с AI асистент'
        : 'Find your perfect car with AI assistant'
    },
    {
      icon: Zap,
      name: isBg ? 'Автоматични описания' : 'Auto Descriptions',
      description: isBg
        ? 'Генерирайте професионални описания с едно натискане'
        : 'Generate professional descriptions with one click'
    },
    {
      icon: Shield,
      name: isBg ? 'Детектор на измами' : 'Fraud Detector',
      description: isBg
        ? 'AI анализира обяви за подозрителна активност'
        : 'AI analyzes listings for suspicious activity'
    },
    {
      icon: MessageCircle,
      name: isBg ? 'AI Чатбот' : 'AI Chatbot',
      description: isBg
        ? '24/7 асистент за всички ваши въпроси'
        : '24/7 assistant for all your questions'
    },
    {
      icon: CheckCircle,
      name: isBg ? 'Проверка на качество' : 'Quality Checker',
      description: isBg
        ? 'Подобрете обявите си с AI препоръки'
        : 'Improve your listings with AI recommendations'
    }
  ];

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <X size={24} />
        </CloseButton>

        <Header>
          <Title>
            {isBg ? '🤖 AI Възможности' : '🤖 AI Features'}
          </Title>
        </Header>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>
                <feature.icon size={24} />
              </FeatureIcon>
              <FeatureName>{feature.name}</FeatureName>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </Modal>
    </Overlay>
  );
};

export default AIFeaturesModal;


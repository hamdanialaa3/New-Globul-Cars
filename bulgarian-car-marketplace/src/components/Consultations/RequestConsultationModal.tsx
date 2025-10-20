// src/components/Consultations/RequestConsultationModal.tsx
// Request Consultation Modal
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { X, AlertCircle } from 'lucide-react';
import { consultationsService } from '../../services/social/consultations.service';

// ==================== STYLED COMPONENTS ====================

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${p => p.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  
  h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: #212529;
  }
`;

const CloseButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const Body = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 8px;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #dee2e6;
    border-radius: 10px;
    font-size: 0.95rem;
    font-family: inherit;
    
    &:focus {
      outline: none;
      border-color: #FF8F10;
      box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
    }
  }
  
  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const UrgencySelector = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
`;

const UrgencyButton = styled.button<{ $active: boolean; $color: string }>`
  padding: 10px;
  border: 2px solid ${p => p.$active ? p.$color : '#dee2e6'};
  background: ${p => p.$active ? `${p.$color}15` : 'white'};
  color: ${p => p.$active ? p.$color : '#6c757d'};
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${p => p.$color};
    background: ${p => `${p.$color}10`};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${p => p.$variant === 'primary' 
    ? `
      background: linear-gradient(135deg, #FF7900 0%, #FF9533 100%);
      color: white;
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
      }
    `
    : `
      background: #f8f9fa;
      color: #495057;
      &:hover {
        background: #e9ecef;
      }
    `
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ==================== COMPONENT ====================

interface RequestConsultationModalProps {
  isOpen: boolean;
  expertId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RequestConsultationModal: React.FC<RequestConsultationModalProps> = ({
  isOpen,
  expertId,
  onClose,
  onSuccess
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const [category, setCategory] = useState<'buying_advice' | 'selling_advice' | 'technical' | 'financing' | 'legal' | 'general'>('buying_advice');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    if (!user || !topic.trim() || !description.trim()) return;
    
    try {
      setLoading(true);
      
      await consultationsService.requestConsultation(user.uid, {
        category,
        topic: topic.trim(),
        description: description.trim(),
        urgency,
        expertId
      });
      
      setTopic('');
      setDescription('');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error requesting consultation:', error);
      alert(language === 'bg' 
        ? 'Грешка при изпращане на заявката' 
        : 'Error sending request');
    } finally {
      setLoading(false);
    }
  };
  
  const t = (key: string) => {
    const translations: Record<string, any> = {
      bg: {
        title: 'Поискай консултация',
        category: 'Категория',
        buyingAdvice: 'Съвет за покупка',
        sellingAdvice: 'Съвет за продажба',
        technical: 'Техническа помощ',
        financing: 'Финансиране',
        legal: 'Правна помощ',
        general: 'Общи въпроси',
        topic: 'Тема',
        topicPlaceholder: 'Напр: Трябва ли да купя BMW X5 2020?',
        description: 'Описание',
        descriptionPlaceholder: 'Обясни детайлно вашия въпрос...',
        urgency: 'Спешност',
        low: 'Ниска',
        medium: 'Средна',
        high: 'Висока',
        urgent: 'Спешна',
        cancel: 'Откажи',
        send: 'Изпрати заявка'
      },
      en: {
        title: 'Request Consultation',
        category: 'Category',
        buyingAdvice: 'Buying Advice',
        sellingAdvice: 'Selling Advice',
        technical: 'Technical Help',
        financing: 'Financing',
        legal: 'Legal Help',
        general: 'General Questions',
        topic: 'Topic',
        topicPlaceholder: 'e.g: Should I buy a BMW X5 2020?',
        description: 'Description',
        descriptionPlaceholder: 'Explain your question in detail...',
        urgency: 'Urgency',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent',
        cancel: 'Cancel',
        send: 'Send Request'
      }
    };
    return translations[language]?.[key] || key;
  };
  
  if (!isOpen) return null;
  
  return (
    <Overlay $isOpen={isOpen} onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <h3>{t('title')}</h3>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </Header>
        
        <Body>
          <FormGroup>
            <label>{t('category')}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as any)}>
              <option value="buying_advice">{t('buyingAdvice')}</option>
              <option value="selling_advice">{t('sellingAdvice')}</option>
              <option value="technical">{t('technical')}</option>
              <option value="financing">{t('financing')}</option>
              <option value="legal">{t('legal')}</option>
              <option value="general">{t('general')}</option>
            </select>
          </FormGroup>
          
          <FormGroup>
            <label>{t('topic')}</label>
            <input
              type="text"
              placeholder={t('topicPlaceholder')}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={200}
            />
          </FormGroup>
          
          <FormGroup>
            <label>{t('description')}</label>
            <textarea
              placeholder={t('descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
            />
          </FormGroup>
          
          <FormGroup>
            <label>{t('urgency')}</label>
          </FormGroup>
          
          <UrgencySelector>
            <UrgencyButton 
              $active={urgency === 'low'}
              $color="#4CAF50"
              onClick={() => setUrgency('low')}
            >
              {t('low')}
            </UrgencyButton>
            <UrgencyButton 
              $active={urgency === 'medium'}
              $color="#FF9800"
              onClick={() => setUrgency('medium')}
            >
              {t('medium')}
            </UrgencyButton>
            <UrgencyButton 
              $active={urgency === 'high'}
              $color="#FF5722"
              onClick={() => setUrgency('high')}
            >
              {t('high')}
            </UrgencyButton>
            <UrgencyButton 
              $active={urgency === 'urgent'}
              $color="#D32F2F"
              onClick={() => setUrgency('urgent')}
            >
              {t('urgent')}
            </UrgencyButton>
          </UrgencySelector>
        </Body>
        
        <Actions>
          <Button $variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button 
            $variant="primary" 
            onClick={handleSubmit}
            disabled={!topic.trim() || !description.trim() || loading}
          >
            {loading ? 'Loading...' : t('send')}
          </Button>
        </Actions>
      </Modal>
    </Overlay>
  );
};

export default RequestConsultationModal;


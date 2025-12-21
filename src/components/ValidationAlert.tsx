// Validation Alert Component
// تحذيرات التحقق من البيانات في صفحة Preview

import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { ValidationResult } from '../services/unified-workflow-persistence.service';
import { useLanguage } from '../contexts/LanguageContext';

const AlertContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Alert = styled.div<{ $type: 'success' | 'critical' | 'warning' }>`
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 12px;
  border: 2px solid;
  
  background: ${props => {
    switch (props.$type) {
      case 'success':
        return 'rgba(34, 197, 94, 0.1)';
      case 'critical':
        return 'rgba(239, 68, 68, 0.1)';
      case 'warning':
        return 'rgba(251, 146, 60, 0.1)';
    }
  }};
  
  border-color: ${props => {
    switch (props.$type) {
      case 'success':
        return '#22c55e';
      case 'critical':
        return '#ef4444';
      case 'warning':
        return '#fb923c';
    }
  }};
`;

const AlertIcon = styled.div<{ $type: 'success' | 'critical' | 'warning' }>`
  flex-shrink: 0;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${props => {
      switch (props.$type) {
        case 'success':
          return '#22c55e';
        case 'critical':
          return '#ef4444';
        case 'warning':
          return '#fb923c';
      }
    }};
  }
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h3<{ $type: 'success' | 'critical' | 'warning' }>`
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  
  color: ${props => {
    switch (props.$type) {
      case 'success':
        return '#16a34a';
      case 'critical':
        return '#dc2626';
      case 'warning':
        return '#ea580c';
    }
  }};
`;

const AlertMessage = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
  line-height: 1.6;
`;

const FieldList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FieldItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--text-primary);
  
  &:before {
    content: '•';
    color: inherit;
    font-weight: bold;
    font-size: 1.2rem;
  }
`;

const BlockMessage = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.05);
  border-left: 4px solid #ef4444;
  border-radius: 6px;
  
  font-size: 0.95rem;
  font-weight: 600;
  color: #dc2626;
`;

interface ValidationAlertProps {
  validation: ValidationResult;
}

export const ValidationAlert: React.FC<ValidationAlertProps> = ({ validation }) => {
  const { t, language } = useLanguage();

  // Success state (all fields complete)
  if (validation.isValid && validation.recommended.length === 0) {
    return (
      <AlertContainer>
        <Alert $type="success">
          <AlertIcon $type="success">
            <CheckCircle />
          </AlertIcon>
          <AlertContent>
            <AlertTitle $type="success">
              {language === 'bg' 
                ? '✅ Всички полета са попълнени!' 
                : '✅ All fields completed!'
              }
            </AlertTitle>
            <AlertMessage>
              {language === 'bg'
                ? 'Обявата ви е готова за публикуване. Моля прегледайте информацията преди да продължите.'
                : 'Your listing is ready to publish. Please review the information before continuing.'
              }
            </AlertMessage>
          </AlertContent>
        </Alert>
      </AlertContainer>
    );
  }

  return (
    <AlertContainer>
      {/* Critical missing fields */}
      {validation.critical.length > 0 && (
        <Alert $type="critical">
          <AlertIcon $type="critical">
            <AlertTriangle />
          </AlertIcon>
          <AlertContent>
            <AlertTitle $type="critical">
              {language === 'bg' 
                ? '⚠️ Задължителни полета липсват' 
                : '⚠️ Required fields missing'
              }
            </AlertTitle>
            <AlertMessage>
              {language === 'bg'
                ? 'Следните полета са задължителни за публикуване на обявата:'
                : 'The following fields are required to publish your listing:'
              }
            </AlertMessage>
            <FieldList>
              {validation.critical.map((field, index) => (
                <FieldItem key={index}>{field}</FieldItem>
              ))}
            </FieldList>
            <BlockMessage>
              {language === 'bg'
                ? '❌ Не можете да публикувате без тези полета'
                : '❌ Cannot publish without these fields'
              }
            </BlockMessage>
          </AlertContent>
        </Alert>
      )}

      {/* Recommended fields */}
      {validation.recommended.length > 0 && (
        <Alert $type="warning">
          <AlertIcon $type="warning">
            <Info />
          </AlertIcon>
          <AlertContent>
            <AlertTitle $type="warning">
              {language === 'bg' 
                ? 'ℹ️ Препоръчителни полета' 
                : 'ℹ️ Recommended fields'
              }
            </AlertTitle>
            <AlertMessage>
              {language === 'bg'
                ? 'Попълването на тези полета ще направи обявата ви по-привлекателна за купувачите:'
                : 'Filling these fields will make your listing more attractive to buyers:'
              }
            </AlertMessage>
            <FieldList>
              {validation.recommended.map((field, index) => (
                <FieldItem key={index}>{field}</FieldItem>
              ))}
            </FieldList>
          </AlertContent>
        </Alert>
      )}
    </AlertContainer>
  );
};

export default ValidationAlert;

// src/components/Profile/ProfileCompletion.tsx
// Profile Completion Widget - مؤشر اكتمال البروفايل
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React from 'react';
import styled from 'styled-components';
import { CheckCircle, Circle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// ==================== STYLED COMPONENTS ====================

const CompletionContainer = styled.div`
  width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
`;

const CompletionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h4 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
  }
`;

const PercentageCircle = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: bold;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: white;
  border-radius: 4px;
  transition: width 0.5s ease;
`;

const ChecklistItem = styled.div<{ $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  font-size: 0.875rem;
  opacity: ${props => props.$completed ? 1 : 0.7};
  
  svg {
    flex-shrink: 0;
  }
`;

// ==================== COMPONENT ====================

interface ProfileCompletionProps {
  hasProfileImage: boolean;
  hasCoverImage: boolean;
  hasBio: boolean;
  hasPhone: boolean;
  hasLocation: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  hasProfileImage,
  hasCoverImage,
  hasBio,
  hasPhone,
  hasLocation,
  emailVerified,
  phoneVerified,
  idVerified
}) => {
  const { language } = useLanguage();

  const items = [
    { 
      completed: hasProfileImage, 
      label: language === 'bg' ? 'Добави снимка' : 'Add profile photo' 
    },
    { 
      completed: hasCoverImage, 
      label: language === 'bg' ? 'Добави корица' : 'Add cover image' 
    },
    { 
      completed: hasBio, 
      label: language === 'bg' ? 'Напиши био' : 'Write bio' 
    },
    { 
      completed: hasPhone, 
      label: language === 'bg' ? 'Добави телефон' : 'Add phone number' 
    },
    { 
      completed: hasLocation, 
      label: language === 'bg' ? 'Добави локация' : 'Add location' 
    },
    { 
      completed: emailVerified, 
      label: language === 'bg' ? 'Потвърди имейл' : 'Verify email' 
    },
    { 
      completed: phoneVerified, 
      label: language === 'bg' ? 'Потвърди телефон' : 'Verify phone' 
    },
    { 
      completed: idVerified, 
      label: language === 'bg' ? 'Потвърди самоличност' : 'Verify identity' 
    }
  ];

  const completed = items.filter(item => item.completed).length;
  const total = items.length;
  const percentage = Math.floor((completed / total) * 100);

  return (
    <CompletionContainer>
      <CompletionHeader>
        <h4>
          {language === 'bg' ? 'Завършеност на профила' : 'Profile Completion'}
        </h4>
        <PercentageCircle>{percentage}%</PercentageCircle>
      </CompletionHeader>

      <ProgressBar>
        <ProgressFill $percentage={percentage} />
      </ProgressBar>

      <div>
        {items.map((item, index) => (
          <ChecklistItem key={index} $completed={item.completed}>
            {item.completed ? (
              <CheckCircle size={18} />
            ) : (
              <Circle size={18} />
            )}
            <span>{item.label}</span>
          </ChecklistItem>
        ))}
      </div>
    </CompletionContainer>
  );
};

export default ProfileCompletion;

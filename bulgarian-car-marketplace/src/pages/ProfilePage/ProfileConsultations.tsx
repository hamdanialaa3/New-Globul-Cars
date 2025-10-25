import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import ConsultationsTab from './ConsultationsTab';
import * as S from './styles';

/**
 * Consultations Tab - Expert advice system
 */
const ProfileConsultations: React.FC = () => {
  const { language } = useLanguage();

  return (
    <S.ContentSection>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>
        {language === 'bg' ? 'Консултации' : 'Consultations'}
      </h2>
      
      <ConsultationsTab />
    </S.ContentSection>
  );
};

export default ProfileConsultations;


// src/components/FinancialServicesSection.tsx
// Financial services section for car detail page

import React, { useState } from 'react';
import styled from 'styled-components';
import FinanceModal from './FinanceModal';
import { useTheme } from '@globul-cars/core/contexts/ThemeContext';
import InsuranceModal from './InsuranceModal';

const Section = styled.div<{ $isDark?: boolean }>`
  margin: 30px 0;
  padding: 25px;
  background: ${({ $isDark }) => ($isDark ? 'linear-gradient(135deg, #071025 0%, #0a1426 100%)' : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)')};
  border-radius: 12px;
  border: 1px solid ${({ $isDark }) => ($isDark ? '#1f2937' : '#dee2e6')};
`;

const SectionTitle = styled.h3<{ $isDark?: boolean }>`
  margin: 0 0 20px 0;
  color: ${({ $isDark }) => ($isDark ? '#E6EEF9' : '#495057')};
  font-size: 22px;
  font-weight: 600;
  text-align: center;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceCard = styled.div<{ $isDark?: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#071025' : 'white')};
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ $isDark }) => ($isDark ? '#1f2937' : '#e9ecef')};
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ServiceIcon = styled.div`
  font-size: 48px;
  margin-bottom: 15px;
  text-align: center;
`;

const ServiceTitle = styled.h4<{ $isDark?: boolean }>`
  margin: 0 0 10px 0;
  color: ${({ $isDark }) => ($isDark ? '#e6eef9' : '#495057')};
  font-size: 18px;
  font-weight: 600;
  text-align: center;
`;

const ServiceDescription = styled.p<{ $isDark?: boolean }>`
  margin: 0 0 20px 0;
  color: ${({ $isDark }) => ($isDark ? '#cbd5e1' : '#6c757d')};
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
`;

const ServiceButton = styled.button<{ $isDark?: boolean }>`
  width: 100%;
  padding: 12px 20px;
  background: ${({ $isDark }) => ($isDark ? '#1f6fe8' : '#007bff')};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: ${({ $isDark }) => ($isDark ? '#1257b8' : '#0056b3')};
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const InfoText = styled.p<{ $isDark?: boolean }>`
  margin: 20px 0 0 0;
  color: ${({ $isDark }) => ($isDark ? '#cbd5e1' : '#6c757d')};
  font-size: 14px;
  text-align: center;
  font-style: italic;
`;

interface FinancialServicesSectionProps {
  carData: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
  };
}

const FinancialServicesSection: React.FC<FinancialServicesSectionProps> = ({
  carData
}) => {
  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      <Section $isDark={isDark}>
        <SectionTitle>Финансови услуги</SectionTitle>

        <ServicesGrid>
          <ServiceCard $isDark={isDark}>
            <ServiceIcon>💰</ServiceIcon>
            <ServiceTitle $isDark={isDark}>Финансиране</ServiceTitle>
            <ServiceDescription $isDark={isDark}>
              Получете одобрение за кредит за покупка на автомобила.
              Сравнете оферти от водещи банки в България с лихви от 4.5%.
            </ServiceDescription>
            <ServiceButton onClick={() => setFinanceModalOpen(true)}>
              Заяви финансиране
            </ServiceButton>
          </ServiceCard>

          <ServiceCard $isDark={isDark}>
            <ServiceIcon>🛡️</ServiceIcon>
            <ServiceTitle $isDark={isDark}>Застраховка</ServiceTitle>
            <ServiceDescription $isDark={isDark}>
              Застраховайте автомобила си с най-добрите условия.
              Каско, Гражданска отговорност и допълнителни покрития.
            </ServiceDescription>
            <ServiceButton onClick={() => setInsuranceModalOpen(true)}>
              Заяви застраховка
            </ServiceButton>
          </ServiceCard>
        </ServicesGrid>

        <InfoText $isDark={isDark}>
          * Услугите се предоставят от лицензирани финансови институции в България.
          Одобрението зависи от вашата кредитна история и доходи.
        </InfoText>
      </Section>

      <FinanceModal
        isOpen={financeModalOpen}
        onClose={() => setFinanceModalOpen(false)}
        carData={carData}
      />

      <InsuranceModal
        isOpen={insuranceModalOpen}
        onClose={() => setInsuranceModalOpen(false)}
        carData={carData}
      />
    </>
  );
};

export default FinancialServicesSection;
// src/pages/DigitalTwinPage.tsx
// Digital Twin Page for Koli One

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import { DigitalTwinDashboard } from '../../components/DigitalTwinDashboard';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  h1 {
    margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const CarSelector = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

const SelectorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const CarCard = styled.div<{ selected: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${props => props.selected ? props.theme.colors.primary.main : props.theme.colors.grey[200]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  h3 {
    margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};

  h3 {
    margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`;

const DigitalTwinPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [cars, setCars] = useState<Array<{ id: string; make: string; model: string; year: number }>>([]);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    setCars([
      { id: '1', make: 'BMW', model: 'X5', year: 2020 },
      { id: '2', make: 'Mercedes', model: 'C-Class', year: 2021 },
      { id: '3', make: 'Audi', model: 'A4', year: 2019 }
    ]);
  }, []);

  const handleCarSelect = useCallback((carId: string) => {
    setSelectedCar(carId);
  }, []);

  return (
    <PageContainer>
      <PageHeader>
        <h1>{t('settings.digitalTwin')}</h1>
        <p>Monitor your vehicle's real-time data and performance</p>
      </PageHeader>

      <CarSelector>
        <h2>Select Your Vehicle</h2>
        <SelectorGrid>
          {cars.map((car) => (
            <CarCard
              key={car.id}
              selected={selectedCar === car.id}
              onClick={() => handleCarSelect(car.id)}
            >
              <h3>{car.make} {car.model}</h3>
              <p>Year: {car.year}</p>
            </CarCard>
          ))}
        </SelectorGrid>
      </CarSelector>

      {selectedCar ? (
        <DigitalTwinDashboard vin={selectedCar} />
      ) : (
        <EmptyState>
          <h3>لم يتم اختيار سيارة</h3>
          <p>اختر سيارة من القائمة أعلاه لعرض بياناتها</p>
        </EmptyState>
      )}
    </PageContainer>
  );
};

export default DigitalTwinPage;
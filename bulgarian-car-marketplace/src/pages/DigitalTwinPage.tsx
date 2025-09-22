// src/pages/DigitalTwinPage.tsx
// Digital Twin Page for Bulgarian Car Marketplace

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { DigitalTwinDashboard } from '../components/DigitalTwinDashboard';

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
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }

  p {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid ${({ theme }) => theme.colors.grey[200]};
    border-top: 4px solid ${({ theme }) => theme.colors.primary.main};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};

  h3 {
    margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }
`;

interface UserCar {
  vin: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  deviceConnected: boolean;
}

export const DigitalTwinPage: React.FC = () => {
  const [userCars, setUserCars] = useState<UserCar[]>([]);
  const [selectedVin, setSelectedVin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);

      // محاكاة تحميل سيارات المستخدم - في الإنتاج سيتم من Firestore
      const mockCars: UserCar[] = [
        {
          vin: '1HGCM82633A123456',
          make: 'Honda',
          model: 'Civic',
          year: 2020,
          licensePlate: 'CA 1234 AB',
          deviceConnected: true
        },
        {
          vin: '2T1BURHE0FC123456',
          make: 'Toyota',
          model: 'Corolla',
          year: 2018,
          licensePlate: 'CB 5678 CD',
          deviceConnected: false
        }
      ];

      setUserCars(mockCars);

      // تحديد السيارة الأولى المتصلة كافتراضية
      const connectedCar = mockCars.find(car => car.deviceConnected);
      if (connectedCar) {
        setSelectedVin(connectedCar.vin);
      }

    } catch (error) {
      console.error('خطأ في تحميل بيانات المستخدم:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleCarSelect = (vin: string) => {
    setSelectedVin(vin);
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div className="spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (!userCars.length) {
    return (
      <PageContainer>
        <EmptyState>
          <h3>لا توجد سيارات</h3>
          <p>لم يتم العثور على سيارات مسجلة في حسابك</p>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <h1>سيارتي الحية</h1>
        <p>مراقبة سياراتك في الوقت الفعلي من خلال التوأم الرقمي</p>
      </PageHeader>

      {/* اختيار السيارة */}
      <CarSelector>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
          اختر السيارة
        </h2>
        <SelectorGrid>
          {userCars.map((car) => (
            <CarCard
              key={car.vin}
              selected={selectedVin === car.vin}
              onClick={() => handleCarSelect(car.vin)}
            >
              <h3>{car.make} {car.model} {car.year}</h3>
              <p>لوحة: {car.licensePlate}</p>
              <p>VIN: {car.vin}</p>
              <p style={{
                color: car.deviceConnected ? '#16a34a' : '#dc2626',
                fontWeight: 'bold'
              }}>
                {car.deviceConnected ? 'متصلة بالجهاز' : 'غير متصلة'}
              </p>
            </CarCard>
          ))}
        </SelectorGrid>
      </CarSelector>

      {/* عرض التوأم الرقمي */}
      {selectedVin ? (
        <DigitalTwinDashboard vin={selectedVin} />
      ) : (
        <EmptyState>
          <h3>لم يتم اختيار سيارة</h3>
          <p>اختر سيارة من القائمة أعلاه لعرض بياناتها</p>
        </EmptyState>
      )}
    </PageContainer>
  );
};
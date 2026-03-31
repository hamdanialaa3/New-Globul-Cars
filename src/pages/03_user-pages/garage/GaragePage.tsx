import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../../contexts/AuthContext';
import { garageService } from '../../../services/garage/garage-service';
import { GarageVehicle, GarageAlert } from '../../../services/garage/garage-types';
import { garageAlertsService } from '../../../services/garage/garage-alerts-service';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { logger } from '../../../services/logger-service';
import { AddVehicleModal } from '../../../components/garage/AddVehicleModal';
// Assuming icons from lucide-react or react-icons are available
import { Car, AlertTriangle, Plus, PenTool, CheckCircle } from 'lucide-react'; 

const GarageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Inter', -apple-system, sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    color: #1a1a2e;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
`;

const AddButton = styled.button`
  background: #0056b3;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #004494;
    transform: translateY(-2px);
  }
`;

const VehiclesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
`;

const VehicleCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e4e8;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: #0056b3;
  }
`;

const VehicleName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #111;
`;

const VehicleDetail = styled.p`
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
`;

const AlertSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const AlertItem = styled.div<{ severity: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  background: \${props => props.severity === 'high' ? '#ffebeb' : '#fff3cd'};
  color: \${props => props.severity === 'high' ? '#d32f2f' : '#856404'};
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 1px dashed #ccc;
  color: #666;

  h3 {
    margin: 1rem 0;
    color: #333;
  }
`;

const GaragePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVehicles = async (isActive = true) => {
    if (!currentUser?.uid) return;
    try {
      setLoading(true);
      const userVehicles = await garageService.getUserVehicles(currentUser.uid);
      if (isActive) {
        setVehicles(userVehicles);
      }
    } catch (err) {
      logger.error('GaragePage', 'Failed to fetch vehicles', { err });
    } finally {
      if (isActive) setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;
    fetchVehicles(isActive);
    return () => {
      isActive = false;
    };
  }, [currentUser]);

  const handleAddSuccess = () => {
    setIsModalOpen(false);
    fetchVehicles(); // Refresh list after adding
  };

  if (loading) {
    return (
      <GarageContainer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <LoadingSpinner size="large" />
      </GarageContainer>
    );
  }

  return (
    <GarageContainer>
      <Header>
        <h1><Car size={32} color="#0056b3" /> Моят Дигитален Гараж</h1>
        <AddButton onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Добави Автомобил
        </AddButton>
      </Header>

      <AddVehicleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleAddSuccess}
      />

      {vehicles.length === 0 ? (
        <EmptyState>
          <Car size={64} color="#ccc" />
          <h3>Гаражът Ви е празен</h3>
          <p>Добавете Вашите автомобили, за да следите ГТП, Гражданска отговорност и ремонти.</p>
        </EmptyState>
      ) : (
        <VehiclesGrid>
          {vehicles.map(vehicle => {
            const alerts = garageAlertsService.generateAlertsForVehicle(vehicle);
            return (
              <VehicleCard key={vehicle.id}>
                <VehicleName>{vehicle.make} {vehicle.model}</VehicleName>
                <VehicleDetail>Година: {vehicle.year}</VehicleDetail>
                <VehicleDetail>VIN: {vehicle.vin}</VehicleDetail>
                {vehicle.licensePlate && <VehicleDetail>Рег. Номер: {vehicle.licensePlate}</VehicleDetail>}
                
                <AlertSection>
                  {alerts.length > 0 ? (
                    alerts.map(alert => (
                      <AlertItem key={alert.id} severity={alert.severity}>
                        <AlertTriangle size={16} />
                        {alert.message}
                      </AlertItem>
                    ))
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2e7d32', fontSize: '0.85rem' }}>
                      <CheckCircle size={16} /> Всички документи са валидни
                    </div>
                  )}
                </AlertSection>
              </VehicleCard>
            );
          })}
        </VehiclesGrid>
      )}
    </GarageContainer>
  );
};

export default GaragePage;

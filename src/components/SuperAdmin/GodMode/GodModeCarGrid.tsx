import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Edit, Car, Shield, Trash2, Search, RefreshCw, Eye, DollarSign, TrendingUp } from 'lucide-react';
import { carsReportService } from '../../../services/reports/cars-report-service';
import { logger } from '@/services/logger-service';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';

// Professional God Mode UI (Reused styles for consistency)
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Container = styled.div`
  background: #1a1a1a;
  border-radius: 16px;
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #333;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #222;
`;

const Title = styled.h2`
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
`;

const Badge = styled.span`
  background: #e67e22;
  color: #fff;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 800;
`;

const Controls = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const SearchInput = styled.input`
  background: #333;
  border: 1px solid #444;
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  width: 300px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #666;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background: #333;
    color: #fff;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  background: #111;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #111;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
`;

const Card = styled.div`
  background: #222;
  border-radius: 12px;
  padding: 0;
  border: 1px solid #333;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    border-color: #555;
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  }
`;

const CarImage = styled.div<{ bg?: string }>`
  height: 160px;
  background: ${props => props.bg ? `url(${props.bg})` : '#333'};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const PriceTag = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0,0,0,0.8);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 14px;
`;

const StatusBadge = styled.div<{ active: boolean }>`
  position: absolute;
  top: 12px;
  left: 12px;
  background: ${props => props.active ? '#27ae60' : '#c0392b'};
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
`;

const CardContent = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CarTitle = styled.h3`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CarSubtitle = styled.p`
  color: #888;
  font-size: 12px;
  margin: 0 0 12px 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
  border-top: 1px solid #333;
  padding-top: 16px;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  flex: 1;
  background: ${props => props.danger ? 'rgba(231, 76, 60, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.danger ? '#e74c3c' : '#fff'};
  border: 1px solid ${props => props.danger ? 'rgba(231, 76, 60, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${props => props.danger ? '#e74c3c' : '#fff'};
    color: ${props => props.danger ? '#fff' : '#000'};
  }
`;

interface GodModeCarGridProps {
  onClose: () => void;
}

export const GodModeCarGrid: React.FC<GodModeCarGridProps> = ({ onClose }) => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCars = async () => {
    setLoading(true);
    try {
      const data = await carsReportService.getAllCars();
      setCars(data);
    } catch (error) {
      logger.error('GodMode: Failed to fetch cars', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleDelete = async (carId: string, title: string) => {
    if (window.confirm(`⚠️ GOD MODE WARNING ⚠️\n\nAre you sure you want to PERMANENTLY DELETE listing: ${title}?\n\nThis will remove it from search, profiles, and database. This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'cars', carId)); // Note: Should handle collection detection if using multi-collection
        setCars(prev => prev.filter(c => c.id !== carId));
        alert('Listing terminated.');
      } catch (error) {
        alert('Failed to delete listing: ' + error);
      }
    }
  };

  const handleToggleActive = async (carId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'cars', carId), { isActive: !currentStatus });
      setCars(prev => prev.map(c => c.id === carId ? { ...c, isActive: !currentStatus } : c));
    } catch (error) {
      logger.error('Failed to toggle status', error as Error, { carId });
    }
  };

  const handleMarkSold = async (carId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'sold' ? 'active' : 'sold';
      await updateDoc(doc(db, 'cars', carId), { status: newStatus });
      setCars(prev => prev.map(c => c.id === carId ? { ...c, status: newStatus } : c));
    } catch (error) {
      logger.error('Failed to update sold status', error as Error, { carId });
    }
  };

  const handleBoost = async (carId: string, currentViews: number) => {
    try {
      const newViews = (currentViews || 0) + 1000;
      await updateDoc(doc(db, 'cars', carId), { views: newViews });
      setCars(prev => prev.map(c => c.id === carId ? { ...c, views: newViews } : c));
      alert('Boosted +1000 views!');
    } catch (error) {
      logger.error('Failed to boost', error as Error, { carId });
    }
  };

  const filteredCars = cars.filter(car =>
    car.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.year?.toString().includes(searchTerm)
  );

  return (
    <Overlay>
      <Container>
        <Header>
          <Title>
            <Shield size={28} />
            GOD MODE: FLEET CONTROL
            <Badge>{cars.length} VEHICLES</Badge>
          </Title>
          <Controls>
            <SearchInput
              placeholder="Search by brand, model, year..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
            <CloseButton onClick={fetchCars} title="Refresh Data">
              <RefreshCw size={20} />
            </CloseButton>
            <CloseButton onClick={onClose} title="Close God Mode">
              <X size={24} />
            </CloseButton>
          </Controls>
        </Header>

        <Grid>
          {loading ? (
            <div style={{ color: '#fff', gridColumn: '1/-1', textAlign: 'center', padding: '100px' }}>
              ACCESSING SATELLITE FEED...
            </div>
          ) : filteredCars.map(car => (
            <Card key={car.id}>
              <CarImage bg={car.images?.[0]}>
                <PriceTag>€{car.price?.toLocaleString()}</PriceTag>
                <StatusBadge active={car.isActive}>{car.isActive ? 'ACTIVE' : 'INACTIVE'}</StatusBadge>
              </CarImage>

              <CardContent>
                <CarTitle>{car.brand} {car.model}</CarTitle>
                <CarSubtitle>{car.year} • {car.engine} • {car.gearbox}</CarSubtitle>

                <Actions>
                  <ActionButton onClick={() => {
                    // ✅ CONSTITUTION: Use numeric URL pattern
                    const sellerNumericId = (car as any).sellerNumericId || (car as any).ownerNumericId;
                    const carNumericId = (car as any).carNumericId || (car as any).userCarSequenceId || (car as any).numericId;
                    const url = sellerNumericId && carNumericId ? `/car/${sellerNumericId}/${carNumericId}` : `/cars`;
                    window.open(url, '_blank');
                  }}>
                    <Eye size={14} /> VIEW
                  </ActionButton>
                  <ActionButton onClick={() => handleToggleActive(car.id, car.isActive)}>
                    {car.isActive ? 'DISABLE' : 'ENABLE'}
                  </ActionButton>
                  <ActionButton onClick={() => handleMarkSold(car.id, car.status)}>
                    <DollarSign size={14} /> {car.status === 'sold' ? 'UNSELL' : 'SOLD'}
                  </ActionButton>
                  <ActionButton onClick={() => handleBoost(car.id, car.views)}>
                    <TrendingUp size={14} /> BOOST
                  </ActionButton>
                  <ActionButton danger onClick={() => handleDelete(car.id, `${car.brand} ${car.model}`)}>
                    <Trash2 size={14} /> DEL
                  </ActionButton>
                </Actions>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Container>
    </Overlay>
  );
};

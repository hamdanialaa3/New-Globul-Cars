// Car Selector - Select car to attach to post
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import { Car, X } from 'lucide-react';

interface CarSelectorProps {
  selected: any | null;
  onChange: (car: any | null) => void;
  userId?: string;
}

const CarSelector: React.FC<CarSelectorProps> = ({ selected, onChange, userId }) => {
  const { language } = useLanguage();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserCars();
    }
  }, [userId]);

  const loadUserCars = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const carsQuery = query(
        collection(db, 'cars'),
        where('ownerId', '==', userId),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(carsQuery);
      setCars(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingText>Loading cars...</LoadingText>;

  if (cars.length === 0) {
    return (
      <EmptyState>
        <Car size={32} />
        <EmptyText>
          {language === 'bg' ? 'Нямате активни обяви' : 'No active listings'}
        </EmptyText>
      </EmptyState>
    );
  }

  return (
    <Container>
      <Label>
        {language === 'bg' ? 'Изберете автомобил:' : 'Select car:'}
      </Label>
      {selected ? (
        <SelectedCar>
          <CarImage src={selected.images?.[0]} alt="" />
          <CarInfo>
            <CarTitle>{selected.brand} {selected.model}</CarTitle>
            <CarDetails>{selected.year} • {selected.price?.toLocaleString()} EUR</CarDetails>
          </CarInfo>
          <RemoveButton onClick={() => onChange(null)}>
            <X size={18} />
          </RemoveButton>
        </SelectedCar>
      ) : (
        <CarsList>
          {cars.map(car => (
            <CarOption key={car.id} onClick={() => onChange(car)}>
              <CarImage src={car.images?.[0]} alt="" />
              <CarInfo>
                <CarTitle>{car.brand} {car.model}</CarTitle>
                <CarDetails>{car.year} • {car.price?.toLocaleString()} EUR</CarDetails>
              </CarInfo>
            </CarOption>
          ))}
        </CarsList>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const SelectedCar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%);
  border: 2px solid #FF8F10;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(255, 143, 16, 0.15);
`;

const CarsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 4px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
`;

const CarOption = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #fafafa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #FF8F10;
    background: white;
    transform: translateX(2px);
  }
`;

const CarImage = styled.img`
  width: 55px;
  height: 55px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const CarInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CarTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CarDetails = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 2px;
`;

const RemoveButton = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover {
    background: #dc3545;
    color: white;
    transform: scale(1.1);
  }
`;

const LoadingText = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 16px;
  font-size: 0.85rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #6c757d;
`;

const EmptyText = styled.span`
  font-size: 0.8rem;
`;

export default CarSelector;


// src/components/FeaturedCars.tsx
// Featured Cars Component for HomePage

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface FeaturedCarsProps {
  limit?: number;
  showFilters?: boolean;
  enablePagination?: boolean;
}

const FeaturedCarsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const CarCard = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  }
`;

const CarImage = styled.div`
  height: 200px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #ccc;
`;

const CarInfo = styled.div`
  padding: 1.5rem;

  h3 {
    font-size: 1.25rem;
    font-weight: bold;
    color: #005ca9;
    margin-bottom: 0.5rem;
  }

  .price {
    font-size: 1.5rem;
    font-weight: bold;
    color: #28a745;
    margin-bottom: 1rem;
  }

  .details {
    color: #6c757d;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .location {
    color: #005ca9;
    font-weight: 500;
  }
`;

const ViewAllLink = styled(Link)`
  display: inline-block;
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background: #005ca9;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: bold;
  transition: background 0.3s ease;

  &:hover {
    background: #004080;
  }
`;

const FeaturedCars: React.FC<FeaturedCarsProps> = ({
  limit = 6,
  showFilters = false,
  enablePagination = false
}) => {
  // Mock data for featured cars
  const featuredCars = [
    {
      id: 1,
      title: 'BMW X5 2020',
      price: '€45,000',
      location: 'София',
      details: 'Diesel, 85,000 km, Excellent condition'
    },
    {
      id: 2,
      title: 'Mercedes C-Class 2019',
      price: '€38,500',
      location: 'Пловдив',
      details: 'Petrol, 65,000 km, One owner'
    },
    {
      id: 3,
      title: 'Audi A4 2021',
      price: '€42,000',
      location: 'Варна',
      details: 'Diesel, 45,000 km, Full service history'
    },
    {
      id: 4,
      title: 'VW Passat 2018',
      price: '€28,900',
      location: 'Бургас',
      details: 'Diesel, 95,000 km, Well maintained'
    },
    {
      id: 5,
      title: 'Toyota Camry 2022',
      price: '€35,000',
      location: 'София',
      details: 'Hybrid, 25,000 km, Like new'
    },
    {
      id: 6,
      title: 'Honda Civic 2020',
      price: '€24,500',
      location: 'Пловдив',
      details: 'Petrol, 55,000 km, Sport edition'
    }
  ];

  const displayedCars = featuredCars.slice(0, limit);

  return (
    <>
      <FeaturedCarsContainer>
        {displayedCars.map((car) => (
          <CarCard key={car.id}>
            <CarImage>
              🚗
            </CarImage>
            <CarInfo>
              <h3>{car.title}</h3>
              <div className="price">{car.price}</div>
              <div className="details">{car.details}</div>
              <div className="location">📍 {car.location}</div>
            </CarInfo>
          </CarCard>
        ))}
      </FeaturedCarsContainer>

      <ViewAllLink to="/cars">
        View All Cars →
      </ViewAllLink>
    </>
  );
};

export default FeaturedCars;
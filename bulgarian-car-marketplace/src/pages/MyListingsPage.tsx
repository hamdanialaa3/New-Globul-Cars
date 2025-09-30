// MyListingsPage.tsx - صفحة عرض قائمة السيارات المضافة للمستخدم
// Bulgarian car marketplace with mobile.de design

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

// Mobile.de color system
const colors = {
  primary: {
    orange: '#FF7900',
    blue: '#0066CC',
    darkBlue: '#003D79'
  },
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F8F9FA',
    grayBorder: '#D0D7DE',
    grayText: '#656D76'
  },
  text: {
    primary: '#24292F',
    secondary: '#656D76'
  },
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B'
  }
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  color: white;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const AddButton = styled.button`
  padding: 12px 24px;
  background: ${colors.primary.orange};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${colors.primary.darkBlue};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ListingsContainer = styled.div`
  background: ${colors.neutral.white};
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ListingCard = styled.div`
  display: flex;
  padding: 20px;
  border-bottom: 1px solid ${colors.neutral.grayBorder};
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${colors.neutral.lightGray};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const CarImage = styled.div`
  width: 200px;
  height: 150px;
  background: ${colors.neutral.lightGray};
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    color: ${colors.text.secondary};
    font-size: 48px;
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
`;

const CarDetails = styled.div`
  flex: 1;
  padding-left: 20px;

  @media (max-width: 768px) {
    padding-left: 0;
  }
`;

const CarTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0 0 8px 0;
  line-height: 1.3;
`;

const CarPrice = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.primary.orange};
  margin-bottom: 12px;
`;

const CarInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  color: ${colors.text.secondary};

  .info-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const StatusBadge = styled.span<{ status: 'active' | 'pending' | 'sold' | 'expired' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'active':
        return `
          background: rgba(16, 185, 129, 0.1);
          color: ${colors.status.success};
        `;
      case 'pending':
        return `
          background: rgba(245, 158, 11, 0.1);
          color: ${colors.status.warning};
        `;
      case 'sold':
        return `
          background: rgba(107, 114, 128, 0.1);
          color: #6B7280;
        `;
      case 'expired':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: ${colors.status.error};
        `;
      default:
        return '';
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${colors.primary.blue};
          color: white;
          &:hover {
            background: ${colors.primary.darkBlue};
          }
        `;
      case 'danger':
        return `
          background: ${colors.status.error};
          color: white;
          &:hover {
            background: #dc2626;
          }
        `;
      default:
        return `
          background: ${colors.neutral.white};
          color: ${colors.text.primary};
          border-color: ${colors.neutral.grayBorder};
          &:hover {
            background: ${colors.neutral.lightGray};
          }
        `;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${colors.text.secondary};

  .icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  h3 {
    font-size: 20px;
    color: ${colors.text.primary};
    margin: 0 0 8px 0;
  }

  p {
    font-size: 16px;
    margin: 0 0 24px 0;
    line-height: 1.6;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 8px;
  color: white;
  flex: 1;
  text-align: center;

  .stat-number {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 14px;
    opacity: 0.8;
  }
`;

// Mock data interface
interface CarListing {
  id: string;
  make: string;
  model: string;
  year: string;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  location: string;
  status: 'active' | 'pending' | 'sold' | 'expired';
  views: number;
  inquiries: number;
  createdAt: string;
  image?: string;
}

// Mock data
const mockListings: CarListing[] = [
  {
    id: '1',
    make: 'BMW',
    model: '320d',
    year: '2019',
    price: 28500,
    mileage: 95000,
    fuelType: 'Дизел',
    transmission: 'Автоматична',
    location: 'София',
    status: 'active',
    views: 245,
    inquiries: 12,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    make: 'Audi',
    model: 'A4',
    year: '2020',
    price: 32000,
    mileage: 65000,
    fuelType: 'Бензин',
    transmission: 'Ръчна',
    location: 'Пловдив',
    status: 'pending',
    views: 189,
    inquiries: 8,
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    year: '2018',
    price: 26500,
    mileage: 120000,
    fuelType: 'Дизел',
    transmission: 'Автоматична',
    location: 'Варна',
    status: 'sold',
    views: 356,
    inquiries: 23,
    createdAt: '2024-01-05'
  }
];

const MyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Simulate loading user's listings
    setTimeout(() => {
      setListings(mockListings);
      setLoading(false);
    }, 1000);
  }, [user, navigate]);

  // Handle listing actions
  const handleEdit = (listingId: string) => {
    navigate(`/edit-listing/${listingId}`);
  };

  const handleDelete = (listingId: string) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете тази обява?')) {
      setListings(prev => prev.filter(listing => listing.id !== listingId));
    }
  };

  const handlePromote = (listingId: string) => {
    navigate(`/promote/${listingId}`);
  };

  const handleAddNew = () => {
    navigate('/add-car');
  };

  // Calculate stats
  const activeListings = listings.filter(l => l.status === 'active').length;
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0);
  const totalInquiries = listings.reduce((sum, l) => sum + l.inquiries, 0);

  // Format status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активна';
      case 'pending': return 'Очаква одобрение';
      case 'sold': return 'Продадена';
      case 'expired': return 'Изтекла';
      default: return status;
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <div style={{textAlign: 'center', color: 'white', padding: '4rem 0'}}>
            <div style={{fontSize: '2rem', marginBottom: '1rem'}}>⏳</div>
            <div>Зареждане на вашите обяви...</div>
          </div>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <Header>
          <Title>Моите обяви</Title>
          <AddButton onClick={handleAddNew}>
            <span>+</span>
            Добави нова обява
          </AddButton>
        </Header>

        {listings.length > 0 && (
          <StatsRow>
            <StatCard>
              <div className="stat-number">{activeListings}</div>
              <div className="stat-label">Активни обяви</div>
            </StatCard>
            <StatCard>
              <div className="stat-number">{totalViews}</div>
              <div className="stat-label">Общо прегледи</div>
            </StatCard>
            <StatCard>
              <div className="stat-number">{totalInquiries}</div>
              <div className="stat-label">Запитвания</div>
            </StatCard>
          </StatsRow>
        )}

        <ListingsContainer>
          {listings.length === 0 ? (
            <EmptyState>
              <div className="icon">🚗</div>
              <h3>Все още нямате обяви</h3>
              <p>
                Добавете първия си автомобил и започнете да продавате в България
              </p>
              <AddButton onClick={handleAddNew}>
                <span>+</span>
                Добави първата обява
              </AddButton>
            </EmptyState>
          ) : (
            listings.map(listing => (
              <ListingCard key={listing.id}>
                <CarImage>
                  {listing.image ? (
                    <img src={listing.image} alt={`${listing.make} ${listing.model}`} />
                  ) : (
                    <div className="placeholder">📸</div>
                  )}
                </CarImage>

                <CarDetails>
                  <CarTitle>
                    {listing.make} {listing.model} ({listing.year})
                  </CarTitle>
                  
                  <CarPrice>
                    {listing.price.toLocaleString('bg-BG')} €
                  </CarPrice>

                  <CarInfo>
                    <div className="info-item">
                      <span>📍</span>
                      {listing.location}
                    </div>
                    <div className="info-item">
                      <span>🛣️</span>
                      {listing.mileage.toLocaleString('bg-BG')} км
                    </div>
                    <div className="info-item">
                      <span>⛽</span>
                      {listing.fuelType}
                    </div>
                    <div className="info-item">
                      <span>⚙️</span>
                      {listing.transmission}
                    </div>
                    <div className="info-item">
                      <span>👁️</span>
                      {listing.views} прегледа
                    </div>
                    <div className="info-item">
                      <span>💬</span>
                      {listing.inquiries} запитвания
                    </div>
                  </CarInfo>

                  <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                    <StatusBadge status={listing.status}>
                      {getStatusText(listing.status)}
                    </StatusBadge>
                    <span style={{fontSize: '14px', color: colors.text.secondary}}>
                      Добавена: {new Date(listing.createdAt).toLocaleDateString('bg-BG')}
                    </span>
                  </div>

                  <ActionButtons>
                    <ActionButton 
                      variant="primary" 
                      onClick={() => handleEdit(listing.id)}
                    >
                      Редактирай
                    </ActionButton>
                    <ActionButton onClick={() => handlePromote(listing.id)}>
                      Промотирай
                    </ActionButton>
                    <ActionButton onClick={() => navigate(`/car/${listing.id}`)}>
                      Прегледай
                    </ActionButton>
                    <ActionButton 
                      variant="danger" 
                      onClick={() => handleDelete(listing.id)}
                    >
                      Изтрий
                    </ActionButton>
                  </ActionButtons>
                </CarDetails>
              </ListingCard>
            ))
          )}
        </ListingsContainer>
      </Container>
    </PageContainer>
  );
};

export default MyListingsPage;
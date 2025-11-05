// Admin Car Management Dashboard
// لوحة تحكم المسؤول لإدارة السيارات

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../../../contexts/AuthProvider';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import carListingService from '../../../../services/carListingService';
import CityCarCountService from '../../../../services/cityCarCountService';
import { CarListing } from '../../../../types/CarListing';
import { Search, Filter, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { CarIcon } from '../../../../components/icons/CarIcon';
import { logger } from '../../../../services/logger-service';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border-radius: 50px;
  padding: 0.5rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
  max-width: 400px;

  svg {
    color: #7f8c8d;
    margin-right: 0.75rem;
  }

  input {
    border: none;
    outline: none;
    font-size: 1rem;
    width: 100%;
  }
`;

const ActionsGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => props.variant === 'danger' ? `
    background: #e74c3c;
    color: white;
    
    &:hover {
      background: #c0392b;
      transform: translateY(-2px);
    }
  ` : `
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }
  `}
`;

const Table = styled.table`
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Thead = styled.thead`
  background: #f8f9fa;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #f1f3f5;
  color: #495057;
`;

const CarImageThumbnail = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'active': return 'background: #d4edda; color: #155724;';
      case 'sold': return 'background: #cce5ff; color: #004085;';
      case 'draft': return 'background: #fff3cd; color: #856404;';
      case 'expired': return 'background: #f8d7da; color: #721c24;';
      default: return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #7f8c8d;
  transition: all 0.3s ease;

  &:hover {
    color: #667eea;
    transform: scale(1.1);
  }

  &.danger:hover {
    color: #e74c3c;
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const AdminCarManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    sold: 0,
    draft: 0
  });

  useEffect(() => {
    // Check admin permission
    if (!user || !user.email?.includes('admin')) {
      navigate('/');
      return;
    }

    loadCars();
    loadStats();
  }, [user, navigate]);

  const loadCars = async () => {
    try {
      setLoading(true);
      const result = await carListingService.getListings({ limit: 1000 });
      setCars(result.listings);
    } catch (error) {
      logger.error('Error loading cars (admin)', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await carListingService.getListings({ limit: 1000 });
      const listings = result.listings;
      
      setStats({
        total: listings.length,
        active: listings.filter(c => c.status === 'active').length,
        sold: listings.filter(c => c.status === 'sold').length,
        draft: listings.filter(c => c.status === 'draft').length
      });
    } catch (error) {
      logger.error('Error loading admin stats', error as Error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(language === 'bg' ? 'Сигурни ли сте?' : 'Are you sure?')) {
      return;
    }

    try {
      await carListingService.deleteListing(id);
      loadCars();
      loadStats();
      // Clear cache
      CityCarCountService.clearAllCache();
    } catch (error) {
      logger.error('Error deleting car (admin)', error as Error, { id });
      alert('Error deleting car');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'sold' : 'active';
    
    try {
      if (newStatus === 'sold') {
        await carListingService.markAsSold(id);
      } else {
        await carListingService.publishListing(id);
      }
      loadCars();
      loadStats();
      // Clear cache
      CityCarCountService.clearAllCache();
    } catch (error) {
      logger.error('Error updating car status (admin)', error as Error, { id, newStatus });
    }
  };

  const filteredCars = cars.filter(car => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      car.make?.toLowerCase().includes(search) ||
      car.model?.toLowerCase().includes(search) ||
      car.sellerName?.toLowerCase().includes(search) ||
      car.city?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <PageContainer>
        <LoadingState>
          <div className="loading-spinner" />
        </LoadingState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>{language === 'bg' ? 'Управление на автомобили' : 'Car Management'}</Title>
        <Subtitle>{language === 'bg' ? 'Администраторски панел' : 'Admin Dashboard'}</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>{language === 'bg' ? 'Общо автомобили' : 'Total Cars'}</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.active}</StatValue>
          <StatLabel>{language === 'bg' ? 'Активни' : 'Active'}</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.sold}</StatValue>
          <StatLabel>{language === 'bg' ? 'Продадени' : 'Sold'}</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.draft}</StatValue>
          <StatLabel>{language === 'bg' ? 'Чернови' : 'Drafts'}</StatLabel>
        </StatCard>
      </StatsGrid>

      <ControlsBar>
        <SearchBox>
          <Search size={20} />
          <input
            type="text"
            placeholder={language === 'bg' ? 'Търси автомобил...' : 'Search car...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <ActionsGroup>
          <ActionButton onClick={() => CityCarCountService.clearAllCache()}>
            <Filter size={18} />
            {language === 'bg' ? 'Обнови кеш' : 'Refresh Cache'}
          </ActionButton>
        </ActionsGroup>
      </ControlsBar>

      <Table>
        <Thead>
          <tr>
            <Th>{language === 'bg' ? 'Снимка' : 'Image'}</Th>
            <Th>{language === 'bg' ? 'Автомобил' : 'Car'}</Th>
            <Th>{language === 'bg' ? 'Цена' : 'Price'}</Th>
            <Th>{language === 'bg' ? 'Град' : 'City'}</Th>
            <Th>{language === 'bg' ? 'Статус' : 'Status'}</Th>
            <Th>{language === 'bg' ? 'Продавач' : 'Seller'}</Th>
            <Th>{language === 'bg' ? 'Прегледи' : 'Views'}</Th>
            <Th>{language === 'bg' ? 'Действия' : 'Actions'}</Th>
          </tr>
        </Thead>
        <tbody>
          {filteredCars.map((car) => (
            <tr key={car.id}>
              <Td>
                {car.images && car.images.length > 0 ? (
                  <CarImageThumbnail src={car.images[0] as any} alt={`${car.make} ${car.model}`} />
                ) : (
                  <div style={{ width: '60px', height: '60px', background: '#f1f3f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CarIcon size={36} color="#FF7900" />
                  </div>
                )}
              </Td>
              <Td>
                <strong>{car.make} {car.model}</strong><br />
                <small style={{ color: '#7f8c8d' }}>{car.year} • {car.mileage?.toLocaleString()} км</small>
              </Td>
              <Td>
                <strong>{car.price?.toLocaleString()} {car.currency}</strong>
              </Td>
              <Td>{car.city}</Td>
              <Td>
                <StatusBadge status={car.status || 'draft'}>
                  {car.status || 'draft'}
                </StatusBadge>
              </Td>
              <Td>
                {car.sellerName}<br />
                <small style={{ color: '#7f8c8d' }}>{car.sellerType}</small>
              </Td>
              <Td>{car.views || 0}</Td>
              <Td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <IconButton onClick={() => navigate(`/car/${car.id}`)}>
                    <Eye size={18} />
                  </IconButton>
                  <IconButton onClick={() => handleToggleStatus(car.id!, car.status!)}>
                    {car.status === 'active' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                  </IconButton>
                  <IconButton className="danger" onClick={() => handleDelete(car.id!)}>
                    <Trash2 size={18} />
                  </IconButton>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {filteredCars.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <p style={{ color: '#7f8c8d', fontSize: '1.2rem' }}>
            {language === 'bg' ? 'Няма намерени автомобили' : 'No cars found'}
          </p>
        </div>
      )}
    </PageContainer>
  );
};

export default AdminCarManagementPage;


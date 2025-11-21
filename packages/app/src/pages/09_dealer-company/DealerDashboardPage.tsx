// src/pages/DealerDashboardPage.tsx
// Complete Dealer Dashboard

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '@globul-cars/coreuseAuth';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { 
  BarChart3, Package, MessageSquare, Star, 
  TrendingUp, DollarSign, Users, Eye 
} from 'lucide-react';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid #e0e0e0;
  color: #7f8c8d;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  color: #2c3e50;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  ${props => {
    switch (props.status) {
      case 'active':
        return 'background: #d4edda; color: #155724;';
      case 'sold':
        return 'background: #cce5ff; color: #004085;';
      case 'draft':
        return 'background: #fff3cd; color: #856404;';
      default:
        return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const DealerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalViews: 0,
    totalMessages: 0,
    totalRevenue: 0,
    averageRating: 0
  });

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    // In production, load from Firebase
    // For now, use mock data
    setStats({
      totalProducts: 25,
      activeProducts: 20,
      totalViews: 1250,
      totalMessages: 45,
      totalRevenue: 125000,
      averageRating: 4.7
    });
  };

  const recentProducts = [
    { id: 1, title: 'BMW 320d', status: 'active', views: 150, price: 45000 },
    { id: 2, title: 'Mercedes C200', status: 'active', views: 200, price: 52000 },
    { id: 3, title: 'Audi A4', status: 'sold', views: 180, price: 38000 }
  ];

  return (
    <Container>
      <Header>
        <Title>{language === 'bg' ? 'Табло за управление' : 'Dealer Dashboard'}</Title>
        <Subtitle>
          {language === 'bg' 
            ? 'Добре дошли обратно! Ето преглед на вашата дейност.'
            : 'Welcome back! Here\'s an overview of your activity.'}
        </Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon color="#FF7900">
            <Package size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>{language === 'bg' ? 'Общо продукти' : 'Total Products'}</StatLabel>
            <StatValue>{stats.totalProducts}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#10b981">
            <TrendingUp size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>{language === 'bg' ? 'Активни' : 'Active'}</StatLabel>
            <StatValue>{stats.activeProducts}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#3b82f6">
            <Eye size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>{language === 'bg' ? 'Прегледи' : 'Views'}</StatLabel>
            <StatValue>{stats.totalViews}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#8b5cf6">
            <MessageSquare size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>{language === 'bg' ? 'Съобщения' : 'Messages'}</StatLabel>
            <StatValue>{stats.totalMessages}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#f59e0b">
            <DollarSign size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>{language === 'bg' ? 'Приходи' : 'Revenue'}</StatLabel>
            <StatValue>€{stats.totalRevenue.toLocaleString()}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#ec4899">
            <Star size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>{language === 'bg' ? 'Рейтинг' : 'Rating'}</StatLabel>
            <StatValue>{stats.averageRating} ⭐</StatValue>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <Card>
        <CardTitle>
          <BarChart3 size={24} />
          {language === 'bg' ? 'Последни продукти' : 'Recent Products'}
        </CardTitle>

        <Table>
          <thead>
            <tr>
              <Th>{language === 'bg' ? 'Продукт' : 'Product'}</Th>
              <Th>{language === 'bg' ? 'Статус' : 'Status'}</Th>
              <Th>{language === 'bg' ? 'Прегледи' : 'Views'}</Th>
              <Th>{language === 'bg' ? 'Цена' : 'Price'}</Th>
            </tr>
          </thead>
          <tbody>
            {recentProducts.map((product) => (
              <tr key={product.id}>
                <Td>{product.title}</Td>
                <Td>
                  <StatusBadge status={product.status}>
                    {language === 'bg' 
                      ? (product.status === 'active' ? 'Активен' : 'Продаден')
                      : (product.status === 'active' ? 'Active' : 'Sold')}
                  </StatusBadge>
                </Td>
                <Td>{product.views}</Td>
                <Td>€{product.price.toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default DealerDashboardPage;

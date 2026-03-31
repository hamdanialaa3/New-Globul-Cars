import React from 'react';
import styled from 'styled-components';
import { TrendingUp } from 'lucide-react';

const Container = styled.div`
  padding: 2rem;
  background: var(--admin-bg-primary);
  border-radius: 16px;
  margin: 1rem;
  color: var(--admin-text-primary);
`;

const Title = styled.h2`
  color: var(--admin-accent-primary);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AdvancedAnalytics: React.FC<{ analytics: any }> = ({ analytics }) => {
  return (
    <Container>
      <Title><TrendingUp size={24} />Advanced Analytics</Title>
      <div>Total Users: {analytics?.totalUsers || 0}</div>
      <div>Total Cars: {analytics?.totalCars || 0}</div>
    </Container>
  );
};

export default AdvancedAnalytics;

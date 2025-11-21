import React from 'react';
import styled from 'styled-components';
import { Users } from 'lucide-react';

const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 16px;
  margin: 1rem;
  color: white;
`;

const Title = styled.h2`
  color: #ffd700;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AdvancedUserManagement: React.FC = () => {
  return (
    <Container>
      <Title><Users size={24} />إدارة المستخدمين المتقدمة</Title>
      <div>إدارة المستخدمين قيد التطوير</div>
    </Container>
  );
};

export default AdvancedUserManagement;
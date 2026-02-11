// src/features/team/TeamManagement.tsx
// Team Management Page - Company feature

import React, { useState } from 'react';
import styled from 'styled-components';
import { Users, UserPlus, Mail, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../components/Toast';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const InviteButton = styled.button`
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
  color: white;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(29, 78, 216, 0.4);
  }
`;

const TeamGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const MemberCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Avatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1rem;
`;

const MemberEmail = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

const RoleBadge = styled.span`
  background: #dbeafe;
  color: #1d4ed8;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
`;

export const TeamManagement: React.FC = () => {
  const { language } = useLanguage();
  const toast = useToast();

  const handleInvite = () => {
    toast.info(language === 'bg' ? 'Управлението на екипа ще бъде налично в бъдеща версия' : 'Team management will be available in a future update');
  };

  return (
    <Container>
      <Header>
        <Title>
          <Users />
          {language === 'bg' ? 'Управление на екипа' : 'Team Management'}
        </Title>
        <InviteButton onClick={handleInvite}>
          <UserPlus />
          {language === 'bg' ? 'Покани член' : 'Invite Member'}
        </InviteButton>
      </Header>

      <TeamGrid>
        <MemberCard>
          <Avatar>A</Avatar>
          <MemberInfo>
            <MemberName>Admin (You)</MemberName>
            <MemberEmail>admin@example.com</MemberEmail>
          </MemberInfo>
          <RoleBadge>
            <Shield size={14} style={{ marginRight: '0.25rem' }} />
            Owner
          </RoleBadge>
        </MemberCard>
      </TeamGrid>
    </Container>
  );
};

export default TeamManagement;


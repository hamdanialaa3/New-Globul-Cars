import React, { useState, useEffect } from 'react';
import { logger } from '../../services/logger-service';
import styled from 'styled-components';

// Styled Components
const AdminContainer = styled.div`
  min-height: 100vh;
  background: #f0f2f5;
  padding: 20px;
`;

const AdminHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const AdminTitle = styled.h1`
  color: #1c1e21;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

const AdminSubtitle = styled.p`
  color: #65676b;
  font-size: 16px;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #4267B2;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: #65676b;
  font-size: 16px;
  font-weight: 500;
`;

const AdminUsersSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: #1c1e21;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 20px 0;
`;

const AdminUserCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  border-left: 4px solid #4267B2;
`;

const UserName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1c1e21;
  margin-bottom: 4px;
`;

const UserEmail = styled.div`
  color: #65676b;
  font-size: 14px;
  margin-bottom: 8px;
`;

const UserRole = styled.div`
  color: #4267B2;
  font-size: 14px;
  font-weight: 500;
`;

const AccessDeniedContainer = styled.div`
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const AccessDeniedCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
`;

const AccessDeniedTitle = styled.h1`
  color: #dc3545;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 16px 0;
`;

const AccessDeniedSubtitle = styled.p`
  color: #65676b;
  font-size: 16px;
  margin: 0 0 24px 0;
`;

const LoginButton = styled.a`
  display: inline-block;
  background: #4267B2;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: #365899;
  }
`;

const AdminPage: React.FC = () => {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        // Check localStorage for admin session
        const storedAdmin = localStorage.getItem('adminUser');
        
        if (storedAdmin) {
          const adminData = JSON.parse(storedAdmin);
          setAdminUser(adminData);
        }
      } catch (err) {
        logger.error('Error checking admin status', err as Error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <AdminContainer>
        <AdminHeader>
          <AdminTitle>Loading...</AdminTitle>
        </AdminHeader>
      </AdminContainer>
    );
  }

  if (!adminUser) {
    return (
      <AccessDeniedContainer>
        <AccessDeniedCard>
          <AccessDeniedTitle>🔒 Access Denied</AccessDeniedTitle>
          <AccessDeniedSubtitle>
            You don't have admin permissions to access this page.
          </AccessDeniedSubtitle>
          <LoginButton href="/admin-login">
            Go to Admin Login
          </LoginButton>
        </AccessDeniedCard>
      </AccessDeniedContainer>
    );
  }

  return (
    <AdminContainer>
      <AdminHeader>
        <AdminTitle>🎉 Admin Dashboard</AdminTitle>
        <AdminSubtitle>
          Welcome back, {adminUser.name}! You have full admin access.
        </AdminSubtitle>
      </AdminHeader>

      <StatsGrid>
        <StatCard>
          <StatValue>1,247</StatValue>
          <StatLabel>Total Users</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>3,891</StatValue>
          <StatLabel>Total Cars</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>12,456</StatValue>
          <StatLabel>Total Messages</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>1</StatValue>
          <StatLabel>Admin Users</StatLabel>
        </StatCard>
      </StatsGrid>

      <AdminUsersSection>
        <SectionTitle>👥 Admin Users</SectionTitle>
        <AdminUserCard>
          <UserName>{adminUser.name}</UserName>
          <UserEmail>{adminUser.email}</UserEmail>
          <UserRole>Super Administrator - Full Access</UserRole>
        </AdminUserCard>
      </AdminUsersSection>
    </AdminContainer>
  );
};

export default AdminPage;
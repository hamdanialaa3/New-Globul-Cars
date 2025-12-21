import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../services/logger-service';
import styled from 'styled-components';
import { Network, Zap, Database, Globe } from 'lucide-react';

// Styled Components - Compact 60% Size
const AdminContainer = styled.div`
  min-height: 100vh;
  background: #f0f2f5;
  padding: 12px;
  max-width: 1400px;
  margin: 0 auto;
`;

const AdminHeader = styled.div`
  background: white;
  border-radius: 8px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
`;

const AdminTitle = styled.h1`
  color: #1c1e21;
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px 0;
`;

const AdminSubtitle = styled.p`
  color: #65676b;
  font-size: 13px;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #4267B2;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  color: #65676b;
  font-size: 12px;
  font-weight: 500;
`;

const Section = styled.div`
  background: white;
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 18px;
`;

const SectionTitle = styled.h2`
  color: #1c1e21;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AdminUserCard = styled.div`
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  border-left: 3px solid #4267B2;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1c1e21;
  margin-bottom: 3px;
`;

const UserEmail = styled.div`
  color: #65676b;
  font-size: 12px;
  margin-bottom: 4px;
`;

const UserRole = styled.div`
  color: #4267B2;
  font-size: 12px;
  font-weight: 500;
`;

const ArchitectureSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.3);
  margin-bottom: 18px;
  color: white;
`;

const ArchitectureHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
`;

const ArchitectureTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ViewDiagramButton = styled.button`
  background: white;
  color: #667eea;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const ArchitectureDescription = styled.p`
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 14px;
  opacity: 0.95;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 12px;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }
`;

const FeatureIcon = styled.div`
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const FeatureTitle = styled.h4`
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const FeatureDesc = styled.p`
  font-size: 11px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
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
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = () => {
      try {
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

      <ArchitectureSection>
        <ArchitectureHeader>
          <ArchitectureTitle>
            <Network size={20} />
            System Architecture Diagram
          </ArchitectureTitle>
          <ViewDiagramButton onClick={() => navigate('/diagram')}>
            <Network size={16} />
            View Interactive Diagram
          </ViewDiagramButton>
        </ArchitectureHeader>

        <ArchitectureDescription>
          Explore the complete technical architecture of the New Globul Cars platform.
          This interactive diagram visualizes all system components, their connections,
          and real-time data flow with animated particles showing live communication between modules.
        </ArchitectureDescription>

        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>
              <Network />
            </FeatureIcon>
            <FeatureTitle>Interactive Nodes</FeatureTitle>
            <FeatureDesc>
              Click any component to see detailed information and navigate to that section
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <Zap />
            </FeatureIcon>
            <FeatureTitle>Live Data Flow</FeatureTitle>
            <FeatureDesc>
              Animated particles show real-time data movement between system components
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <Database />
            </FeatureIcon>
            <FeatureTitle>Full System View</FeatureTitle>
            <FeatureDesc>
              See all infrastructure, services, UI, features, and external integrations
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <Globe />
            </FeatureIcon>
            <FeatureTitle>External Sources</FeatureTitle>
            <FeatureDesc>
              View connections to MobileBG.eu, Firebase, AI Engine, and third-party APIs
            </FeatureDesc>
          </FeatureCard>
        </FeaturesGrid>
      </ArchitectureSection>

      <Section>
        <SectionTitle>👥 Admin Users</SectionTitle>
        <AdminUserCard>
          <UserName>{adminUser.name}</UserName>
          <UserEmail>{adminUser.email}</UserEmail>
          <UserRole>Super Administrator - Full Access</UserRole>
        </AdminUserCard>
      </Section>
    </AdminContainer>
  );
};

export default AdminPage;
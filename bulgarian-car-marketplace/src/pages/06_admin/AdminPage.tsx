import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../services/logger-service';
import styled from 'styled-components';
import { Network, Zap, Database, Globe } from 'lucide-react';

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

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  color: #1c1e21;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
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

const ArchitectureSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  margin-bottom: 30px;
  color: white;
`;

const ArchitectureHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
`;

const ArchitectureTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ViewDiagramButton = styled.button`
  background: white;
  color: #667eea;
  border: none;
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
`;

const ArchitectureDescription = styled.p`
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 24px;
  opacity: 0.95;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-4px);
  }
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const FeatureTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const FeatureDesc = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
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

      {/* Architecture Diagram Section */}
      <ArchitectureSection>
        <ArchitectureHeader>
          <ArchitectureTitle>
            <Network size={32} />
            System Architecture Diagram
          </ArchitectureTitle>
          <ViewDiagramButton onClick={() => navigate('/diagram')}>
            <Network size={20} />
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
              <Network size={24} />
            </FeatureIcon>
            <FeatureTitle>Interactive Nodes</FeatureTitle>
            <FeatureDesc>
              Click any component to see detailed information and navigate to that section
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <Zap size={24} />
            </FeatureIcon>
            <FeatureTitle>Live Data Flow</FeatureTitle>
            <FeatureDesc>
              Animated particles show real-time data movement between system components
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <Database size={24} />
            </FeatureIcon>
            <FeatureTitle>Full System View</FeatureTitle>
            <FeatureDesc>
              See all infrastructure, services, UI, features, and external integrations
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <Globe size={24} />
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
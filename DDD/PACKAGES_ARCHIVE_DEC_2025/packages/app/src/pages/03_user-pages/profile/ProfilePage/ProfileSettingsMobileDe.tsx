// Mobile.de Inspired Overview/Settings Page
import React from 'react';
import styled from 'styled-components';
import { 
  Search, Bookmark, Car, MessageSquare, DollarSign, TrendingUp,
  Calculator, FileText, ShieldCheck, Plus, ChevronRight
} from 'lucide-react';
import { useAuth } from '@globul-cars/coreAuthProvider';
import { useNavigate } from 'react-router-dom';

const ProfileSettingsMobileDe: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const userName = user?.displayName || 'User';
  const [activeSection, setActiveSection] = React.useState('overview');
  
  // Mock data - replace with real data from Firebase
  const stats = {
    savedSearches: 3,
    carPark: 2,
    myVehicles: 1,
    newMessages: 0
  };

  const sidebarSections = [
    {
      title: 'My mobile.de',
      items: [
        { id: 'overview', label: 'Overview', path: '/profile/overview' },
        { id: 'messages', label: 'Messages', path: '/messages', badge: stats.newMessages }
      ]
    },
    {
      title: 'Buy',
      items: [
        { id: 'searches', label: 'My Searches', path: '/my-searches', badge: stats.savedSearches },
        { id: 'carpark', label: 'Car park', path: '/car-park', badge: stats.carPark },
        { id: 'orders', label: 'Orders', path: '/orders' },
        { id: 'financing', label: 'Financing', path: '/financing' }
      ]
    },
    {
      title: 'Sell',
      items: [
        { id: 'ads', label: 'Ads', path: '/my-ads' },
        { id: 'directsale', label: 'Direct Sale', path: '/direct-sale' }
      ]
    },
    {
      title: 'My Profile',
      items: [
        { id: 'vehicles', label: 'My vehicles', path: '/my-vehicles', badge: stats.myVehicles },
        { id: 'settings', label: 'Settings', path: '/profile/settings' },
        { id: 'communication', label: 'Communication', path: '/communication' }
      ]
    }
  ];

  return (
    <PageContainer>
      <LayoutWrapper>
        {/* Sidebar */}
        <Sidebar>
          {/* User Profile Section */}
          <UserProfileSection>
            <UserAvatar src={user?.photoURL || '/default-avatar.png'} alt={userName} />
            <UserName>{userName}</UserName>
            <EditButton onClick={() => navigate('/profile/edit')}>Edit</EditButton>
          </UserProfileSection>

          {/* Sidebar Navigation */}
          {sidebarSections.map((section, idx) => (
            <SidebarSection key={idx}>
              <SidebarSectionTitle>{section.title}</SidebarSectionTitle>
              {section.items.map((item) => (
                <SidebarItem
                  key={item.id}
                  active={activeSection === item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    navigate(item.path);
                  }}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge>{item.badge}</Badge>
                  )}
                </SidebarItem>
              ))}
            </SidebarSection>
          ))}

          {/* Bottom Note - Arabic Text from Screenshot */}
          <SidebarNote>
            <NoteText>نريد بوضع تطبيق مفهوم من قبل المستخدمين</NoteText>
            <NoteText>نريد بتصميح المبيعات تتوافق مع خيره لم قبل المستخدمين</NoteText>
            <NoteText>نريد بضيفة تتضدر تفاهم للعربيه لم هذا المشتخذمين من المستخدمين</NoteText>
          </SidebarNote>
        </Sidebar>

        {/* Main Content */}
        <MainContent>
          {/* Welcome Header */}
          <WelcomeSection>
            <WelcomeTitle>Hello {userName}, what do you want to do today?</WelcomeTitle>
          </WelcomeSection>

      {/* Quick Actions Grid */}
      <QuickActionsGrid>
        <ActionCard onClick={() => navigate('/cars')}>
          <ActionIcon><Search size={32} /></ActionIcon>
          <ActionTitle>Start a new search</ActionTitle>
          <ActionSubtext>1,531,694 vehicles</ActionSubtext>
        </ActionCard>

        <ActionCard onClick={() => navigate('/my-searches')}>
          <ActionIcon><Bookmark size={32} /></ActionIcon>
          <ActionTitle>View my searches</ActionTitle>
          <ActionSubtext>{stats.savedSearches} saved searches</ActionSubtext>
        </ActionCard>

        <ActionCard onClick={() => navigate('/car-park')}>
          <ActionIcon><Car size={32} /></ActionIcon>
          <ActionTitle>View my Car Park</ActionTitle>
          <ActionSubtext>{stats.carPark} vehicles parked</ActionSubtext>
        </ActionCard>

        <ActionCard onClick={() => navigate('/messages')}>
          <ActionIcon><MessageSquare size={32} /></ActionIcon>
          <ActionTitle>View my messages</ActionTitle>
          <ActionSubtext>{stats.newMessages === 0 ? 'No new messages' : `${stats.newMessages} new messages`}</ActionSubtext>
        </ActionCard>
      </QuickActionsGrid>

      {/* Services Section */}
      <ServicesGrid>
        <ServiceCard>
          <ServiceIcon><DollarSign size={28} /></ServiceIcon>
          <ServiceContent>
            <ServiceTitle>Need a car loan?</ServiceTitle>
            <ServiceSubtext>Find the best interest rate</ServiceSubtext>
          </ServiceContent>
          <ChevronRight size={24} color="rgba(0, 255, 30, 1)" />
        </ServiceCard>

        <ServiceCard>
          <ServiceIcon><TrendingUp size={28} /></ServiceIcon>
          <ServiceContent>
            <ServiceTitle>Sell my vehicle</ServiceTitle>
            <ServiceSubtext>Direct or via listing</ServiceSubtext>
          </ServiceContent>
          <ChevronRight size={24} color="#6e766fff" />
        </ServiceCard>
      </ServicesGrid>

      {/* My Vehicles Section */}
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>My vehicles</SectionTitle>
          <ShowAllLink>Show all ({stats.myVehicles})</ShowAllLink>
        </SectionHeader>
        <VehicleCard>
          <VehicleImage src="/placeholder-car.jpg" alt="Audi A3" />
          <VehicleInfo>
            <VehicleBrand>Audi</VehicleBrand>
            <VehicleModel>A3</VehicleModel>
            <VehicleStatus>95% <span>vehicleDetailsDashboard</span></VehicleStatus>
          </VehicleInfo>
        </VehicleCard>
        <AddVehicleButton>
          <Plus size={20} />
          Add another vehicle
        </AddVehicleButton>
      </SectionContainer>

      {/* More Services Section */}
      <SectionContainer>
        <SectionTitle>More Services</SectionTitle>
        
        <MoreServiceCard>
          <ServiceIcon><Calculator size={28} /></ServiceIcon>
          <ServiceContent>
            <ServiceTitle>How much can I afford?</ServiceTitle>
            <ServiceSubtext>Thinking of financing? Calculate your monthly rate in just 5 minutes.</ServiceSubtext>
          </ServiceContent>
        </MoreServiceCard>

        <MoreServiceCard>
          <ServiceIcon><TrendingUp size={28} /></ServiceIcon>
          <ServiceContent>
            <ServiceTitle>Lease your dream car</ServiceTitle>
            <ServiceSubtext>Find hot deals on Germany's biggest vehicle marketplace.</ServiceSubtext>
          </ServiceContent>
        </MoreServiceCard>

        <MoreServiceCard>
          <ServiceIcon><FileText size={28} /></ServiceIcon>
          <ServiceContent>
            <ServiceTitle>The mobile.de Magazin</ServiceTitle>
            <ServiceSubtext>Independant and objective. Test drive and tips (Only in German)</ServiceSubtext>
          </ServiceContent>
        </MoreServiceCard>

        <MoreServiceCard>
          <ServiceIcon><ShieldCheck size={28} /></ServiceIcon>
          <ServiceContent>
            <ServiceTitle>Trade with confidence</ServiceTitle>
            <ServiceSubtext>Bye-bye paperwork, here comes the digital sales contract!</ServiceSubtext>
          </ServiceContent>
        </MoreServiceCard>
      </SectionContainer>
        </MainContent>
      </LayoutWrapper>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  background: var(--bg-primary);
  min-height: 100vh;
`;

const LayoutWrapper = styled.div`
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 24px;
  padding: 20px;
`;

const Sidebar = styled.aside`
  width: 280px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-radius: 8px;
  padding: 24px 0;
  box-shadow: var(--shadow-sm);
  height: fit-content;
  position: sticky;
  top: 20px;
`;

const UserProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 24px 24px;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 16px;
`;

const UserAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
  border: 3px solid var(--border-secondary);
`;

const UserName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
`;

const EditButton = styled.button`
  background: transparent;
  border: 2px solid var(--accent-primary);
  color: var(--accent-primary);
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--accent-primary);
    color: var(--text-inverse);
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 24px;
`;

const SidebarSectionTitle = styled.h4`
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 24px;
  margin: 0 0 8px 0;
`;

const SidebarItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '500'};
  color: ${props => props.active ? 'var(--accent-primary)' : 'var(--text-primary)'};
  background: ${props => props.active ? 'var(--bg-hover)' : 'transparent'};
  border-left: 3px solid ${props => props.active ? 'var(--accent-primary)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--bg-hover);
    color: var(--accent-primary);
  }
`;

const Badge = styled.span`
  background: var(--accent-primary);
  color: var(--text-inverse);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
`;

const SidebarNote = styled.div`
  padding: 16px 24px;
  border-top: 1px solid var(--border-primary);
  margin-top: 16px;
`;

const NoteText = styled.p`
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 8px 0;
  text-align: right;
  direction: rtl;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MainContent = styled.main`
  flex: 1;
  min-width: 0;
`;

const WelcomeSection = styled.div`
  background: var(--bg-card);
  padding: 32px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
`;

const WelcomeTitle = styled.h1`
  font-size: 26px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const ActionCard = styled.div`
  background: var(--bg-card);
  padding: 24px;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
`;

const ActionIcon = styled.div`
  width: 64px;
  height: 64px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--accent-primary);
`;

const ActionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
`;

const ActionSubtext = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const ServiceCard = styled.div`
  background: var(--bg-card);
  padding: 20px 24px;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

const ServiceIcon = styled.div`
  width: 48px;
  height: 48px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  flex-shrink: 0;
`;

const ServiceContent = styled.div`
  flex: 1;
`;

const ServiceTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
`;

const ServiceSubtext = styled.p`
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
`;

const SectionContainer = styled.div`
  background: var(--bg-card);
  padding: 24px;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const ShowAllLink = styled.a`
  font-size: 14px;
  color: var(--accent-primary);
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const VehicleCard = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  margin-bottom: 16px;
`;

const VehicleImage = styled.img`
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
  background: var(--bg-secondary);
`;

const VehicleInfo = styled.div`
  flex: 1;
`;

const VehicleBrand = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const VehicleModel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

const VehicleStatus = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--success);
  
  span {
    font-size: 12px;
    font-weight: 400;
    color: var(--text-secondary);
    margin-left: 8px;
  }
`;

const AddVehicleButton = styled.button`
  width: 100%;
  padding: 14px;
  background: transparent;
  border: 2px dashed var(--border-primary);
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }
`;

const MoreServiceCard = styled.div`
  display: flex;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-primary);
  
  &:last-child {
    border-bottom: none;
  }
`;

export default ProfileSettingsMobileDe;
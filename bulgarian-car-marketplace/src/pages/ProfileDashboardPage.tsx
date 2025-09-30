import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import ProfileManager from '../components/ProfileManager';
import BulgarianProfileService from '../services/bulgarian-profile-service';
import { BulgarianUserProfile } from '../firebase/social-auth-service';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  CreditCard, 
  HelpCircle,
  LogOut,
  ChevronLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  padding: ${({ theme }) => theme.spacing.lg} 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary.main};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const UserName = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.error.main};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  
  &:hover {
    background: ${({ theme }) => theme.colors.error.dark};
    transform: translateY(-1px);
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const Sidebar = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  height: fit-content;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const NavigationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavigationItem = styled.li<{ active?: boolean }>`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const NavigationLink = styled.button<{ active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ active, theme }) => active ? theme.colors.primary.main + '10' : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.primary.main : theme.colors.text.secondary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: left;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary.main}10;
    color: ${({ theme }) => theme.colors.primary.main};
    transform: translateX(2px);
  }
`;

const ContentArea = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  overflow: hidden;
`;

const ContentHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  background: ${({ theme }) => theme.colors.grey[50]};
`;

const ContentTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ContentBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.grey[100]};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  &:hover {
    background: ${({ theme }) => theme.colors.grey[200]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  background: ${({ type, theme }) => 
    type === 'success' ? theme.colors.success.light + '20' : theme.colors.error.light + '20'
  };
  color: ${({ type, theme }) => 
    type === 'success' ? theme.colors.success.main : theme.colors.error.main
  };
  border: 1px solid ${({ type, theme }) => 
    type === 'success' ? theme.colors.success.main + '30' : theme.colors.error.main + '30'
  };
`;

const PlaceholderContent = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  p {
    margin: 0;
    line-height: 1.5;
  }
`;

type NavigationSection = 'profile' | 'settings' | 'security' | 'notifications' | 'billing' | 'help';

const ProfileDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeSection, setActiveSection] = useState<NavigationSection>('profile');
  const [userProfile, setUserProfile] = useState<BulgarianUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // تحميل بيانات الملف الشخصي
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const profile = await BulgarianProfileService.getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading profile:', error);
          setStatusMessage({
            type: 'error',
            message: t('profile.loadError', 'Failed to load profile data')
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserProfile();
  }, [user, t]);

  // إعادة توجيه إذا لم يكن المستخدم مسجلاً دخوله
  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setStatusMessage({
        type: 'error',
        message: t('auth.logoutError', 'Failed to logout. Please try again.')
      });
    }
  };

  const handleProfileUpdate = (updatedProfile: BulgarianUserProfile) => {
    setUserProfile(updatedProfile);
    setStatusMessage({
      type: 'success',
      message: t('profile.updateSuccess', 'Profile updated successfully!')
    });
    
    // مسح الرسالة بعد 5 ثوان
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const getInitials = (profile: BulgarianUserProfile | null): string => {
    if (!profile) return user?.email?.charAt(0).toUpperCase() || 'U';
    return `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  const getDisplayName = (profile: BulgarianUserProfile | null): string => {
    if (!profile) return user?.email || 'User';
    return `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || user?.email || 'User';
  };

  const navigationItems = [
    { id: 'profile' as NavigationSection, label: t('nav.profile', 'Profile'), icon: User },
    { id: 'settings' as NavigationSection, label: t('nav.settings', 'Settings'), icon: Settings },
    { id: 'security' as NavigationSection, label: t('nav.security', 'Security'), icon: Shield },
    { id: 'notifications' as NavigationSection, label: t('nav.notifications', 'Notifications'), icon: Bell },
    { id: 'billing' as NavigationSection, label: t('nav.billing', 'Billing'), icon: CreditCard },
    { id: 'help' as NavigationSection, label: t('nav.help', 'Help'), icon: HelpCircle },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return user ? (
          <ProfileManager
            onClose={() => {}}
          />
        ) : null;
      
      case 'settings':
        return (
          <PlaceholderContent>
            <Settings size={48} />
            <h3>{t('settings.title', 'Settings')}</h3>
            <p>{t('settings.description', 'Manage your account preferences and application settings.')}</p>
          </PlaceholderContent>
        );
      
      case 'security':
        return (
          <PlaceholderContent>
            <Shield size={48} />
            <h3>{t('security.title', 'Security')}</h3>
            <p>{t('security.description', 'Manage your password, two-factor authentication, and security settings.')}</p>
          </PlaceholderContent>
        );
      
      case 'notifications':
        return (
          <PlaceholderContent>
            <Bell size={48} />
            <h3>{t('notifications.title', 'Notifications')}</h3>
            <p>{t('notifications.description', 'Control how and when you receive notifications.')}</p>
          </PlaceholderContent>
        );
      
      case 'billing':
        return (
          <PlaceholderContent>
            <CreditCard size={48} />
            <h3>{t('billing.title', 'Billing')}</h3>
            <p>{t('billing.description', 'Manage your subscription, payment methods, and billing history.')}</p>
          </PlaceholderContent>
        );
      
      case 'help':
        return (
          <PlaceholderContent>
            <HelpCircle size={48} />
            <h3>{t('help.title', 'Help & Support')}</h3>
            <p>{t('help.description', 'Get help, find answers to common questions, or contact support.')}</p>
          </PlaceholderContent>
        );
      
      default:
        return null;
    }
  };

  const getSectionTitle = (section: NavigationSection): string => {
    const item = navigationItems.find(item => item.id === section);
    return item?.label || 'Unknown Section';
  };

  const getSectionIcon = (section: NavigationSection) => {
    const item = navigationItems.find(item => item.id === section);
    return item?.icon || User;
  };

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: '#666' 
        }}>
          {t('common.loading', 'Loading...')}
        </div>
      </DashboardContainer>
    );
  }

  if (!user) {
    return null;
  }

  const SectionIcon = getSectionIcon(activeSection);

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <Logo>
            🚗 {t('app.name', 'Globul Cars')}
          </Logo>
          
          <UserInfo>
            <Avatar>
              {getInitials(userProfile)}
            </Avatar>
            <UserName>{getDisplayName(userProfile)}</UserName>
            <LogoutButton onClick={handleLogout}>
              <LogOut size={16} />
              {t('auth.logout', 'Logout')}
            </LogoutButton>
          </UserInfo>
        </HeaderContent>
      </Header>

      <MainContent>
        <Sidebar>
          <SidebarTitle>{t('nav.dashboard', 'Dashboard')}</SidebarTitle>
          <NavigationList>
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <NavigationItem key={item.id}>
                  <NavigationLink
                    active={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavigationLink>
                </NavigationItem>
              );
            })}
          </NavigationList>
        </Sidebar>

        <ContentArea>
          <ContentHeader>
            <BackButton onClick={() => setActiveSection('profile')}>
              <ChevronLeft size={16} />
              {t('nav.back', 'Back')}
            </BackButton>
            <ContentTitle>
              <SectionIcon size={24} />
              {getSectionTitle(activeSection)}
            </ContentTitle>
          </ContentHeader>
          
          <ContentBody>
            {statusMessage && (
              <StatusMessage type={statusMessage.type}>
                {statusMessage.type === 'success' ? 
                  <CheckCircle size={18} /> : 
                  <AlertCircle size={18} />
                }
                {statusMessage.message}
              </StatusMessage>
            )}
            
            {renderSectionContent()}
          </ContentBody>
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  );
};

export default ProfileDashboardPage;
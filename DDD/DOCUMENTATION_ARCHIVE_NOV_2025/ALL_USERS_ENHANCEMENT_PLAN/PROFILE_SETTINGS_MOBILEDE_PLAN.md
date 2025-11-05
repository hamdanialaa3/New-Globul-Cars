# Profile Settings Page - Mobile.de Inspired Design

## 🎯 المهمة
إعادة تصميم `/profile/settings` مستوحاة من mobile.de مع:
- ✅ الحفاظ على جميع الوظائف الموجودة
- ✅ إضافة Navigation Sidebar (كما في mobile.de)
- ✅ ربط جميع الصفحات المناسبة
- ✅ إضافة أزرار للصفحات الجديدة (All Users, All Cars, All Posts)

---

## 📐 Layout Structure

```typescript
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Main Site Header - Existing)                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────────────────────────────────────┐
│              │ Breadcrumbs: My Profile > Settings          │
├──────────────┼──────────────────────────────────────────────┤
│              │                                              │
│  LEFT        │  MAIN CONTENT AREA                          │
│  SIDEBAR     │                                              │
│              │  Your Account Settings                       │
│  ┌────────┐  │  Customer Number: #27765111                 │
│  │ Avatar │  │                                              │
│  │  Alaa  │  │  ┌──────────────────────────────────────┐  │
│  └────────┘  │  │ PROFILE                              │  │
│  Edit        │  │ • Profile Picture          [Change]  │  │
│              │  │ • Cover Image              [Change]  │  │
│  BUY         │  └──────────────────────────────────────┘  │
│  • Overview  │                                              │
│  • Messages  │  ┌──────────────────────────────────────┐  │
│  • Searches  │  │ LOGIN DATA                           │  │
│  • Garage    │  │ • Email: ✓ Confirmed       [Change]  │  │
│  • Orders    │  │ • Password: ********       [Change]  │  │
│              │  │ • 2FA Security             [Setup]   │  │
│  SELL        │  └──────────────────────────────────────┘  │
│  • My Ads    │                                              │
│  • Drafts    │  ┌──────────────────────────────────────┐  │
│  • Add New   │  │ CONTACT DATA                         │  │
│              │  │ • Name                     [Change]  │  │
│  BROWSE      │  │ • Address                  [Change]  │  │
│  • All Users │  │ • Phone: ⚠ Not Confirmed  [Change]  │  │
│  • All Cars  │  │ • City/Region              [Change]  │  │
│  • All Posts │  └──────────────────────────────────────┘  │
│              │                                              │
│  PROFILE     │  ┌──────────────────────────────────────┐  │
│  • Overview  │  │ VERIFICATION                         │  │
│  • Settings  │  │ • Email Verification    ✓ Done       │  │
│  • Privacy   │  │ • Phone Verification    ⚠ Pending    │  │
│  • Team      │  │ • ID Verification       [Upload]     │  │
│              │  │ • Business Verification [Apply]      │  │
│              │  └──────────────────────────────────────┘  │
│              │                                              │
│              │  ┌──────────────────────────────────────┐  │
│              │  │ SUBSCRIPTION & BILLING               │  │
│              │  │ • Current Plan: Free                 │  │
│              │  │ • Invoices                 [View]    │  │
│              │  │ • Upgrade Plan             [Upgrade] │  │
│              │  └──────────────────────────────────────┘  │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 🔧 Implementation Plan

### Phase 1: Layout Restructure (3 hours)

#### File: `src/pages/ProfilePage/SettingsTab.tsx`

**Current State:**
- Single column layout
- All settings in one vertical scroll

**New Design:**
```typescript
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import styled from 'styled-components';
import { 
  User, Mail, Lock, Phone, MapPin, Shield, 
  CreditCard, FileText, Settings, Bell 
} from 'lucide-react';

const SettingsTab = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <SettingsLayout>
      <Breadcrumbs>
        <BreadcrumbLink to="/profile">{t('profile.title')}</BreadcrumbLink>
        <Separator>{'>'}</Separator>
        <BreadcrumbCurrent>{t('profile.settings.title')}</BreadcrumbCurrent>
      </Breadcrumbs>

      <ContentWrapper>
        <NavigationSidebar />
        
        <MainContent>
          <PageHeader>
            <Title>{t('profile.settings.yourAccountSettings')}</Title>
            <CustomerNumber>
              {t('profile.settings.customerNumber')}: #{user.uid.slice(0, 8)}
            </CustomerNumber>
          </PageHeader>

          {/* Profile Section */}
          <SettingsSection>
            <SectionTitle>
              <User size={20} />
              {t('profile.settings.sections.profile')}
            </SectionTitle>
            
            <SettingRow>
              <SettingInfo>
                <SettingLabel>{t('profile.settings.profilePicture')}</SettingLabel>
                <SettingValue>
                  <Avatar src={user.photoURL} />
                  <VisibilityNote>{t('profile.settings.onlyVisibleForYou')}</VisibilityNote>
                </SettingValue>
              </SettingInfo>
              <ChangeButton onClick={() => openModal('profilePicture')}>
                {t('common.change')}
              </ChangeButton>
            </SettingRow>

            <SettingRow>
              <SettingInfo>
                <SettingLabel>{t('profile.settings.coverImage')}</SettingLabel>
                <SettingValue>
                  <CoverPreview src={user.coverImage} />
                </SettingValue>
              </SettingInfo>
              <ChangeButton onClick={() => openModal('coverImage')}>
                {t('common.change')}
              </ChangeButton>
            </SettingRow>
          </SettingsSection>

          {/* Login Data Section */}
          <SettingsSection>
            <SectionTitle>
              <Shield size={20} />
              {t('profile.settings.sections.loginData')}
            </SectionTitle>

            <SettingRow>
              <SettingInfo>
                <SettingLabel>{t('profile.settings.email')}</SettingLabel>
                <SettingValue>
                  {user.email}
                  <StatusBadge $status="confirmed">
                    {t('profile.settings.confirmed')}
                  </StatusBadge>
                </SettingValue>
              </SettingInfo>
              <ChangeButton onClick={() => openModal('email')}>
                {t('common.change')}
              </ChangeButton>
            </SettingRow>

            <SettingRow>
              <SettingInfo>
                <SettingLabel>{t('profile.settings.password')}</SettingLabel>
                <SettingValue>••••••••</SettingValue>
              </SettingInfo>
              <ChangeButton onClick={() => openModal('password')}>
                {t('common.change')}
              </ChangeButton>
            </SettingRow>

            <SettingRow>
              <SettingInfo>
                <SettingLabel>{t('profile.settings.twoFactor')}</SettingLabel>
                <SettingValue>
                  {user.twoFactorEnabled 
                    ? t('profile.settings.enabled') 
                    : t('profile.settings.notEnabled')
                  }
                </SettingValue>
              </SettingInfo>
              <ChangeButton onClick={() => openModal('2fa')}>
                {user.twoFactorEnabled ? t('common.manage') : t('common.setup')}
              </ChangeButton>
            </SettingRow>
          </SettingsSection>

          {/* Contact Data Section */}
          <SettingsSection>
            <SectionTitle>
              <Phone size={20} />
              {t('profile.settings.sections.contactData')}
            </SectionTitle>

            <SettingRow>
              <SettingInfo>
                <SettingLabel>{t('profile.settings.name')}</SettingLabel>
                <SettingValue>{user.displayName}</SettingValue>
              </SettingInfo>
              <ChangeButton onClick={() => openModal('name')}>
                {t('common.change')}
              </ChangeButton>
            </SettingRow>

            <SettingRow>
              <SettingInfo>
                <SettingLabel>{t('profile.settings.address')}</SettingLabel>
                <SettingValue>
                  <div>{user.address?.street}</div>
                  <div>{user.address?.postalCode} {user.address?.city}</div>
                </SettingValue>
              </SettingInfo>
              <ChangeButton onClick={() => openModal('address')}>
                {t('common.change')}
              </ChangeButton>
            </SettingRow>

            <SettingRow>
              <SettingInfo>
                <SettingLabel>{t('profile.settings.phone')}</SettingLabel>
                <SettingValue>
                  {user.phoneNumber || t('profile.settings.notProvided')}
                  {user.phoneNumber && !user.phoneVerified && (
                    <StatusBadge $status="notConfirmed">
                      {t('profile.settings.notConfirmed')}
                    </StatusBadge>
                  )}
                </SettingValue>
              </SettingInfo>
              <ChangeButton onClick={() => openModal('phone')}>
                {t('common.change')}
              </ChangeButton>
            </SettingRow>

            {user.phoneNumber && !user.phoneVerified && (
              <AlertBox $type="warning">
                <AlertIcon>⚠</AlertIcon>
                <AlertText>
                  {t('profile.settings.confirmPhonePrompt')}
                </AlertText>
                <AlertButton onClick={() => confirmPhone()}>
                  {t('profile.settings.confirmNow')}
                </AlertButton>
              </AlertBox>
            )}
          </SettingsSection>

          {/* Verification Section */}
          <SettingsSection>
            <SectionTitle>
              <Shield size={20} />
              {t('profile.settings.sections.verification')}
            </SectionTitle>

            <VerificationGrid>
              <VerificationCard $verified={user.verification?.email}>
                <VerificationIcon>
                  <Mail size={24} />
                </VerificationIcon>
                <VerificationLabel>
                  {t('profile.verification.email')}
                </VerificationLabel>
                <VerificationStatus $verified={user.verification?.email}>
                  {user.verification?.email ? '✓ Verified' : '⚠ Pending'}
                </VerificationStatus>
              </VerificationCard>

              <VerificationCard $verified={user.verification?.phone}>
                <VerificationIcon>
                  <Phone size={24} />
                </VerificationIcon>
                <VerificationLabel>
                  {t('profile.verification.phone')}
                </VerificationLabel>
                <VerificationStatus $verified={user.verification?.phone}>
                  {user.verification?.phone ? '✓ Verified' : '⚠ Pending'}
                </VerificationStatus>
              </VerificationCard>

              <VerificationCard $verified={user.verification?.id}>
                <VerificationIcon>
                  <CreditCard size={24} />
                </VerificationIcon>
                <VerificationLabel>
                  {t('profile.verification.id')}
                </VerificationLabel>
                <VerificationButton onClick={() => openModal('idVerification')}>
                  {user.verification?.id ? t('common.view') : t('common.upload')}
                </VerificationButton>
              </VerificationCard>

              <VerificationCard $verified={user.verification?.business}>
                <VerificationIcon>
                  <FileText size={24} />
                </VerificationIcon>
                <VerificationLabel>
                  {t('profile.verification.business')}
                </VerificationLabel>
                <VerificationButton onClick={() => openModal('businessVerification')}>
                  {user.verification?.business ? t('common.manage') : t('common.apply')}
                </VerificationButton>
              </VerificationCard>
            </VerificationGrid>
          </SettingsSection>

          {/* Subscription & Billing Section */}
          <SettingsSection>
            <SectionTitle>
              <CreditCard size={20} />
              {t('profile.settings.sections.billing')}
            </SectionTitle>

            <SettingRow>
              <SettingInfo>
                <SettingLabel>{t('profile.settings.currentPlan')}</SettingLabel>
                <SettingValue>
                  <PlanBadge $plan={user.plan?.tier}>
                    {user.plan?.tier || 'Free'}
                  </PlanBadge>
                </SettingValue>
              </SettingInfo>
              <ChangeButton to="/billing">
                {t('profile.settings.upgrade')}
              </ChangeButton>
            </SettingRow>

            <SettingRow>
              <SettingInfo>
                <SettingLabel>{t('profile.settings.invoices')}</SettingLabel>
                <SettingValue>
                  {user.invoicesCount || 0} {t('profile.settings.available')}
                </SettingValue>
              </SettingInfo>
              <ChangeButton to="/invoices" $disabled={!user.invoicesCount}>
                {t('common.view')}
              </ChangeButton>
            </SettingRow>
          </SettingsSection>

          {/* Notifications Section */}
          <SettingsSection>
            <SectionTitle>
              <Bell size={20} />
              {t('profile.settings.sections.notifications')}
            </SectionTitle>

            <SettingRow>
              <SettingInfo>
                <SettingLabel>{t('profile.settings.emailNotifications')}</SettingLabel>
                <SettingValue>
                  {t('profile.settings.managePreferences')}
                </SettingValue>
              </SettingInfo>
              <ChangeButton onClick={() => openModal('notifications')}>
                {t('common.manage')}
              </ChangeButton>
            </SettingRow>
          </SettingsSection>
        </MainContent>
      </ContentWrapper>
    </SettingsLayout>
  );
};

// Styled Components

const SettingsLayout = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
`;

const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
`;

const BreadcrumbLink = styled(Link)`
  color: #1877f2;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Separator = styled.span`
  color: #65676b;
`;

const BreadcrumbCurrent = styled.span`
  color: #050505;
  font-weight: 500;
`;

const ContentWrapper = styled.div`
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 24px;
  padding: 24px;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const MainContent = styled.div`
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f2f5;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #050505;
  margin: 0 0 8px 0;
`;

const CustomerNumber = styled.p`
  font-size: 14px;
  color: #65676b;
  margin: 0;
`;

const SettingsSection = styled.section`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #050505;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e6eb;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 12px;
  transition: all 0.2s;

  &:hover {
    background: #e7f3ff;
    box-shadow: 0 2px 8px rgba(24, 119, 242, 0.1);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #050505;
  margin-bottom: 6px;
`;

const SettingValue = styled.div`
  font-size: 14px;
  color: #65676b;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`;

const CoverPreview = styled.img`
  width: 120px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
`;

const VisibilityNote = styled.span`
  font-size: 12px;
  color: #95a5a6;
  font-style: italic;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${p => 
    p.$status === 'confirmed' ? '#d4edda' :
    p.$status === 'notConfirmed' ? '#f8d7da' :
    '#e2e3e5'
  };
  color: ${p =>
    p.$status === 'confirmed' ? '#155724' :
    p.$status === 'notConfirmed' ? '#721c24' :
    '#383d41'
  };
`;

const ChangeButton = styled.button`
  padding: 10px 24px;
  background: #1877f2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: #166fe5;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(24, 119, 242, 0.3);
  }

  &:disabled {
    background: #e4e6eb;
    color: #bcc0c4;
    cursor: not-allowed;
    transform: none;
  }
`;

const AlertBox = styled.div<{ $type: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${p => 
    p.$type === 'warning' ? '#fff3cd' :
    p.$type === 'error' ? '#f8d7da' :
    '#d1ecf1'
  };
  border-left: 4px solid ${p =>
    p.$type === 'warning' ? '#ffc107' :
    p.$type === 'error' ? '#dc3545' :
    '#17a2b8'
  };
  border-radius: 8px;
  margin-top: 12px;
`;

const AlertIcon = styled.span`
  font-size: 20px;
`;

const AlertText = styled.p`
  flex: 1;
  margin: 0;
  font-size: 14px;
  color: #856404;
`;

const AlertButton = styled.button`
  padding: 8px 16px;
  background: #ffc107;
  color: #000;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e0a800;
  }
`;

const VerificationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const VerificationCard = styled.div<{ $verified?: boolean }>`
  padding: 20px;
  background: ${p => p.$verified ? '#e7f9f1' : '#fff'};
  border: 2px solid ${p => p.$verified ? '#31a24c' : '#e4e6eb'};
  border-radius: 12px;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const VerificationIcon = styled.div`
  margin-bottom: 12px;
  color: #1877f2;
`;

const VerificationLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #050505;
  margin-bottom: 8px;
`;

const VerificationStatus = styled.div<{ $verified?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${p => p.$verified ? '#31a24c' : '#f7b928'};
`;

const VerificationButton = styled.button`
  margin-top: 12px;
  padding: 8px 16px;
  background: #1877f2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;

  &:hover {
    background: #166fe5;
  }
`;

const PlanBadge = styled.span<{ $plan?: string }>`
  display: inline-block;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${p =>
    p.$plan === 'enterprise' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
    p.$plan === 'business' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
    p.$plan === 'pro' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' :
    '#e4e6eb'
  };
  color: ${p => p.$plan ? 'white' : '#65676b'};
`;

export default SettingsTab;
```

---

### Phase 2: Navigation Sidebar (2 hours)

#### File: `src/pages/ProfilePage/components/SettingsNavigationSidebar.tsx`

```typescript
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Home, MessageSquare, Search, Heart, ShoppingBag, DollarSign,
  FileText, TrendingUp, Users, Car, MessageCircle,
  User, Settings, Bell, Building2
} from 'lucide-react';

const SettingsNavigationSidebar = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const sections = [
    {
      title: t('sidebar.buy'),
      items: [
        { icon: <Home size={16} />, label: t('sidebar.overview'), path: '/dashboard' },
        { icon: <MessageSquare size={16} />, label: t('sidebar.messages'), path: '/messages', badge: user.unreadMessages },
        { icon: <Search size={16} />, label: t('sidebar.savedSearches'), path: '/saved-searches', badge: user.savedSearchesCount },
        { icon: <Heart size={16} />, label: t('sidebar.favorites'), path: '/favorites', badge: user.favoritesCount },
        { icon: <ShoppingBag size={16} />, label: t('sidebar.orders'), path: '/orders' },
        { icon: <DollarSign size={16} />, label: t('sidebar.financing'), path: '/finance' }
      ]
    },
    {
      title: t('sidebar.sell'),
      items: [
        { icon: <FileText size={16} />, label: t('sidebar.myAds'), path: '/my-listings', badge: user.activeListings },
        { icon: <FileText size={16} />, label: t('sidebar.drafts'), path: '/my-drafts', badge: user.draftsCount },
        { icon: <TrendingUp size={16} />, label: t('sidebar.directSale'), path: '/sell' }
      ]
    },
    {
      title: t('sidebar.browse'),
      items: [
        { icon: <Users size={16} />, label: t('sidebar.allUsers'), path: '/all-users' },
        { icon: <Car size={16} />, label: t('sidebar.allCars'), path: '/all-cars' },
        { icon: <MessageCircle size={16} />, label: t('sidebar.allPosts'), path: '/all-posts' }
      ]
    },
    {
      title: t('sidebar.myProfile'),
      items: [
        { icon: <User size={16} />, label: t('sidebar.overview'), path: '/profile' },
        { icon: <Car size={16} />, label: t('sidebar.myVehicles'), path: '/profile/my-ads', badge: user.vehiclesCount },
        { icon: <Settings size={16} />, label: t('sidebar.settings'), path: '/profile/settings', active: true },
        { icon: <Bell size={16} />, label: t('sidebar.notifications'), path: '/notifications' },
        { icon: <Building2 size={16} />, label: t('sidebar.communication'), path: '/profile/consultations' }
      ]
    }
  ];

  return (
    <Sidebar>
      <UserCard>
        <UserAvatar src={user.photoURL || '/default-avatar.png'} />
        <UserName>{user.displayName || 'User'}</UserName>
        <EditLink to="/profile">{t('common.edit')}</EditLink>
      </UserCard>

      {sections.map((section, idx) => (
        <NavSection key={idx}>
          <SectionTitle>{section.title}</SectionTitle>
          <NavList>
            {section.items.map((item, itemIdx) => (
              <NavItem
                key={itemIdx}
                to={item.path}
                $active={location.pathname === item.path || item.active}
              >
                <NavIcon>{item.icon}</NavIcon>
                <NavLabel>{item.label}</NavLabel>
                {item.badge > 0 && <Badge>{item.badge}</Badge>}
              </NavItem>
            ))}
          </NavList>
        </NavSection>
      ))}
    </Sidebar>
  );
};

// Styled Components

const Sidebar = styled.aside`
  width: 280px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 80px;

  @media (max-width: 1024px) {
    width: 100%;
    position: static;
  }
`;

const UserCard = styled.div`
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e6eb;
  margin-bottom: 20px;
`;

const UserAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
  border: 3px solid #1877f2;
`;

const UserName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #050505;
  margin: 0 0 8px 0;
`;

const EditLink = styled(Link)`
  font-size: 14px;
  color: #1877f2;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const NavSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  font-size: 12px;
  font-weight: 700;
  color: #65676b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
  padding: 0 8px;
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  text-decoration: none;
  color: ${p => p.$active ? '#1877f2' : '#050505'};
  background: ${p => p.$active ? '#e7f3ff' : 'transparent'};
  font-size: 14px;
  font-weight: ${p => p.$active ? '600' : '500'};
  transition: all 0.2s;
  margin-bottom: 4px;

  &:hover {
    background: ${p => p.$active ? '#e7f3ff' : '#f0f2f5'};
    color: #1877f2;
  }
`;

const NavIcon = styled.span`
  display: flex;
  align-items: center;
  color: inherit;
`;

const NavLabel = styled.span`
  flex: 1;
`;

const Badge = styled.span`
  background: #ff4757;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
`;

export default SettingsNavigationSidebar;
```

---

### Phase 3: Translation Keys (30 minutes)

#### File: `src/locales/translations.ts`

```typescript
// Add to existing translations

profile: {
  settings: {
    title: { bg: 'Настройки', en: 'Settings' },
    yourAccountSettings: { bg: 'Настройките на вашия акаунт', en: 'Your account settings' },
    customerNumber: { bg: 'Клиентски номер', en: 'Customer number' },
    
    sections: {
      profile: { bg: 'Профил', en: 'Profile' },
      loginData: { bg: 'Данни за вход', en: 'Login data' },
      contactData: { bg: 'Данни за контакт', en: 'Contact data' },
      verification: { bg: 'Верификация', en: 'Verification' },
      billing: { bg: 'Абонамент и плащания', en: 'Subscription & Billing' },
      notifications: { bg: 'Известия', en: 'Notifications' }
    },
    
    profilePicture: { bg: 'Снимка на профила', en: 'Profile picture' },
    coverImage: { bg: 'Заглавна снимка', en: 'Cover image' },
    email: { bg: 'Имейл адрес', en: 'Email address' },
    password: { bg: 'Парола', en: 'Password' },
    twoFactor: { bg: '2FA Сигурност', en: '2FA Security' },
    name: { bg: 'Име', en: 'Name' },
    address: { bg: 'Адрес', en: 'Address' },
    phone: { bg: 'Телефонен номер', en: 'Phone number' },
    currentPlan: { bg: 'Текущ план', en: 'Current plan' },
    invoices: { bg: 'Фактури', en: 'Invoices' },
    emailNotifications: { bg: 'Имейл известия', en: 'Email notifications' },
    
    confirmed: { bg: 'Потвърден', en: 'Confirmed' },
    notConfirmed: { bg: 'Непотвърден', en: 'Not confirmed' },
    enabled: { bg: 'Активиран', en: 'Enabled' },
    notEnabled: { bg: 'Неактивиран', en: 'Not enabled' },
    notProvided: { bg: 'Не е предоставен', en: 'Not provided' },
    available: { bg: 'налични', en: 'available' },
    
    onlyVisibleForYou: { bg: '(Видимо само за вас)', en: '(Only visible for you)' },
    confirmPhonePrompt: { bg: 'Активирайте допълнителни функции: Потвърдете телефонния номер сега', en: 'Activate additional functions: Confirm phone number now' },
    confirmNow: { bg: 'Потвърди сега', en: 'Confirm now' },
    managePreferences: { bg: 'Управление на предпочитанията', en: 'Manage preferences' },
    upgrade: { bg: 'Надстройка', en: 'Upgrade' }
  },
  
  verification: {
    email: { bg: 'Имейл верификация', en: 'Email Verification' },
    phone: { bg: 'Телефонна верификация', en: 'Phone Verification' },
    id: { bg: 'Лична карта', en: 'ID Verification' },
    business: { bg: 'Бизнес верификация', en: 'Business Verification' }
  }
},

sidebar: {
  buy: { bg: 'КУПИ', en: 'BUY' },
  sell: { bg: 'ПРОДАЙ', en: 'SELL' },
  browse: { bg: 'РАЗГЛЕДАЙ', en: 'BROWSE' },
  myProfile: { bg: 'МОЯ ПРОФИЛ', en: 'MY PROFILE' },
  
  overview: { bg: 'Общ преглед', en: 'Overview' },
  messages: { bg: 'Съобщения', en: 'Messages' },
  savedSearches: { bg: 'Запазени търсения', en: 'Saved Searches' },
  favorites: { bg: 'Любими', en: 'Favorites' },
  orders: { bg: 'Поръчки', en: 'Orders' },
  financing: { bg: 'Финансиране', en: 'Financing' },
  
  myAds: { bg: 'Моите обяви', en: 'My Ads' },
  drafts: { bg: 'Чернови', en: 'Drafts' },
  directSale: { bg: 'Директна продажба', en: 'Direct Sale' },
  
  allUsers: { bg: 'Всички потребители', en: 'All Users' },
  allCars: { bg: 'Всички автомобили', en: 'All Cars' },
  allPosts: { bg: 'Всички публикации', en: 'All Posts' },
  
  myVehicles: { bg: 'Моите превозни средства', en: 'My Vehicles' },
  settings: { bg: 'Настройки', en: 'Settings' },
  notifications: { bg: 'Известия', en: 'Notifications' },
  communication: { bg: 'Комуникация', en: 'Communication' }
}
```

---

## 🎯 Key Features

### ✅ From mobile.de Design:
1. **Left Navigation Sidebar**
   - User profile card at top
   - Grouped sections (Buy, Sell, Browse, My Profile)
   - Badge indicators for counts
   - Active state highlighting

2. **Main Content Layout**
   - Breadcrumbs navigation
   - Page header with customer number
   - Sectioned settings (Profile, Login, Contact, etc.)
   - Row-based layout with "Change" buttons
   - Status badges (Confirmed/Not Confirmed)
   - Alert boxes for pending actions

3. **Visual Design**
   - Clean white background
   - Subtle shadows and borders
   - Hover effects on interactive elements
   - Professional color scheme
   - Mobile responsive

### 🆕 Enhanced Features:
4. **Additional Sections**
   - Verification cards (4-grid layout)
   - Subscription & Billing management
   - Notification preferences
   - Cover image upload

5. **New Browse Section**
   - Link to `/all-users`
   - Link to `/all-cars`
   - Link to `/all-posts`

6. **Integration with Existing**
   - All existing functions preserved
   - Links to profile, messages, favorites
   - Links to my-listings, my-drafts
   - Links to billing, invoices

---

## 📱 Responsive Design

```typescript
// Desktop (> 1024px)
Sidebar: 280px fixed width
Main Content: Flexible width

// Tablet (768px - 1024px)
Sidebar: Full width (stacked on top)
Main Content: Full width

// Mobile (< 768px)
Sidebar: Full width
Setting Rows: Column layout
Buttons: Full width
```

---

## 🎨 Color & Theme

```typescript
Primary: #1877f2 (Facebook Blue)
Background: #f5f5f5 (Light Grey)
Card: #ffffff (White)
Text Primary: #050505 (Black)
Text Secondary: #65676b (Grey)
Border: #e4e6eb (Light Grey)

Status Colors:
Success: #31a24c (Green)
Warning: #ffc107 (Yellow)
Error: #dc3545 (Red)
Info: #17a2b8 (Blue)
```

---

## ⚡ Performance

```typescript
- Lazy load sections
- Memoize sidebar navigation
- Optimize avatar images
- Debounce form inputs
- Cache user data
```

---

## 🔗 Links Integration

```typescript
// Connected Pages
/profile → Overview
/profile/settings → This Page (New Design)
/profile/my-ads → My Listings
/profile/campaigns → Campaigns
/profile/analytics → Analytics
/profile/consultations → Consultations

/dashboard → Overview Dashboard
/messages → Messages Inbox
/favorites → Saved Cars
/saved-searches → Search History
/my-listings → Active Ads
/my-drafts → Draft Ads

/all-users → Browse Users (NEW in plan)
/all-cars → Browse Cars
/all-posts → Browse Posts (NEW)

/billing → Subscription Management
/invoices → View Invoices
/verification → ID Verification
/team → Team Management (Dealer/Company)
```

---

## ✅ Implementation Checklist

### Phase 1: Structure (Day 1)
- [ ] Create `SettingsTab.tsx` with new layout
- [ ] Create `SettingsNavigationSidebar.tsx`
- [ ] Add breadcrumbs component
- [ ] Implement sections: Profile, Login, Contact
- [ ] Add responsive breakpoints

### Phase 2: Features (Day 2)
- [ ] Verification cards grid
- [ ] Billing section
- [ ] Notifications section
- [ ] Status badges logic
- [ ] Alert boxes for pending actions
- [ ] Modal triggers for "Change" buttons

### Phase 3: Integration (Day 3)
- [ ] Connect all sidebar links
- [ ] Add badge counters from user data
- [ ] Implement "Browse" section links
- [ ] Test all navigation paths
- [ ] Add translations (bg/en)

### Phase 4: Testing (Day 4)
- [ ] Test on mobile devices
- [ ] Test all "Change" buttons
- [ ] Verify all links work
- [ ] Check responsive layout
- [ ] Accessibility audit

---

## 🚀 Final Result

```
✅ Mobile.de-inspired professional design
✅ All existing functions preserved
✅ New navigation sidebar with sections
✅ Browse section (All Users, Cars, Posts)
✅ Enhanced verification display
✅ Billing integration
✅ Fully responsive
✅ Bilingual (BG/EN)
✅ Performance optimized
```

---

**Status:** Ready for Implementation  
**Estimated Time:** 4 days (32 hours)  
**Integration:** Complete with existing `/profile` system


import { logger } from '../../../../services/logger-service';
// Mobile.de Inspired Overview/Settings Page
import React from 'react';
import styled from 'styled-components';
import { 
  Search, Bookmark, Car, MessageSquare, DollarSign, TrendingUp,
  Calculator, FileText, ShieldCheck, Plus, ChevronRight, User, Loader,
  ArrowUpDown, Filter
} from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { ProfileMediaService } from '../../../../services/profile/ProfileMediaService';
import { updateProfile } from 'firebase/auth';
import { useToast } from '../../../../components/Toast';
import { unifiedCarService } from '../../../../services/car/unified-car.service';

const ProfileSettingsMobileDe: React.FC = () => {
  const { user, currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const toast = useToast();
  
  const userName = user?.displayName || 'User';
  const [activeSection, setActiveSection] = React.useState('overview');
  const [photoURL, setPhotoURL] = React.useState<string | null>(user?.photoURL || null);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [userCars, setUserCars] = React.useState<any[]>([]);
  const [loadingCars, setLoadingCars] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<string>('newest');
  const [filterBy, setFilterBy] = React.useState<string>('all');

  // Update photoURL when user changes
  React.useEffect(() => {
    setPhotoURL(user?.photoURL || null);
  }, [user?.photoURL]);

  // Load user cars
  React.useEffect(() => {
    const loadUserCars = async () => {
      if (!user?.uid) {
        setUserCars([]);
        return;
      }

      try {
        setLoadingCars(true);
        const cars = await unifiedCarService.getUserCars(user.uid);
        // Only show active, non-sold cars
        const activeCars = cars.filter(car => car.isActive !== false && car.isSold !== true);
        setUserCars(activeCars);
      } catch (error) {
        logger.error('Error loading user cars:', error);
        setUserCars([]);
      } finally {
        setLoadingCars(false);
      }
    };

    loadUserCars();
  }, [user?.uid]);

  // Sort and filter cars
  const sortedAndFilteredCars = React.useMemo(() => {
    let filtered = [...userCars];

    // Apply filter
    if (filterBy === 'active') {
      filtered = filtered.filter(car => car.isActive === true && car.isSold !== true);
    } else if (filterBy === 'sold') {
      filtered = filtered.filter(car => car.isSold === true);
    } else if (filterBy === 'pending') {
      filtered = filtered.filter(car => car.status === 'pending' || car.isActive === false);
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'nameAsc':
          const nameA = `${a.make || ''} ${a.model || ''}`.trim().toLowerCase();
          const nameB = `${b.make || ''} ${b.model || ''}`.trim().toLowerCase();
          return nameA.localeCompare(nameB);
        case 'nameDesc':
          const nameA2 = `${a.make || ''} ${a.model || ''}`.trim().toLowerCase();
          const nameB2 = `${b.make || ''} ${b.model || ''}`.trim().toLowerCase();
          return nameB2.localeCompare(nameA2);
        case 'priceLow':
          return (a.price || 0) - (b.price || 0);
        case 'priceHigh':
          return (b.price || 0) - (a.price || 0);
        case 'yearNew':
          return (b.year || 0) - (a.year || 0);
        case 'yearOld':
          return (a.year || 0) - (b.year || 0);
        case 'make':
          const makeA = (a.make || '').toLowerCase();
          const makeB = (b.make || '').toLowerCase();
          return makeA.localeCompare(makeB);
        case 'model':
          const modelA = (a.model || '').toLowerCase();
          const modelB = (b.model || '').toLowerCase();
          return modelA.localeCompare(modelB);
        default:
          return 0;
      }
    });

    return sorted;
  }, [userCars, sortBy, filterBy]);

  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.uid) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.photoUploadError', 'Error uploading photo'));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.photoUploadError', 'Error uploading photo'));
      return;
    }

    try {
      setUploading(true);

      // Upload photo using ProfileMediaService
      const downloadURL = await ProfileMediaService.uploadProfilePhoto(user.uid, file);

      // Update Firebase Auth profile
      if (currentUser) {
        await updateProfile(currentUser, { photoURL: downloadURL });
      }

      // Update local state
      setPhotoURL(downloadURL);

      toast.success(t('profile.photoUploadSuccess', 'Photo uploaded successfully'));
    } catch (error) {
      logger.error('Error uploading photo:', error);
      toast.error(t('profile.photoUploadError', 'Error uploading photo'));
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle edit button click
  const handleEditPhotoClick = () => {
    fileInputRef.current?.click();
  };

  // Mock data - replace with real data from Firebase
  const stats = {
    savedSearches: 3,
    carPark: 2,
    newMessages: 0
  };

  const sidebarSections = [
    {
      title: 'My mobile.de',
      items: [
        { id: 'overview', label: 'Overview', path: '/profile' },
        { id: 'messages', label: 'Messages', path: '/messages', badge: stats.newMessages }
      ]
    },
    {
      title: 'Buy',
      items: [
        { id: 'searches', label: 'My Searches', path: '/saved-searches', badge: stats.savedSearches },
        { id: 'carpark', label: t('profile.favoriteSearches', 'Favorite Searches'), path: '/favorites', badge: stats.carPark },
        { id: 'orders', label: 'Orders', path: '/my-listings' },
        { id: 'financing', label: 'Financing', path: '/finance' }
      ]
    },
    {
      title: 'Sell',
      items: [
        { id: 'ads', label: 'Ads', path: '/profile/my-ads' },
        { id: 'directsale', label: 'Direct Sale', path: '/sell' }
      ]
    },
    {
      title: 'My Profile',
      items: [
        { id: 'vehicles', label: t('profile.myGarage', 'My Garage'), path: '/profile/my-ads', badge: userCars.length },
        { id: 'settings', label: 'Settings', path: '/profile/settings' },
        { id: 'communication', label: 'Communication', path: '/notifications' }
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
            <AvatarContainer>
              {photoURL ? (
                <UserAvatar src={photoURL} alt={userName} />
              ) : (
                <UserAvatarPlaceholder>
                  <User size={40} />
                </UserAvatarPlaceholder>
              )}
              {uploading && (
                <UploadOverlay>
                  <Loader size={24} className="spinning" />
                </UploadOverlay>
              )}
            </AvatarContainer>
            <UserName>{userName}</UserName>
            <HiddenFileInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
            <EditButton onClick={handleEditPhotoClick} disabled={uploading}>
              {uploading ? t('profile.uploadingPhoto', 'Uploading photo...') : t('profile.editPhoto', 'Edit Photo')}
            </EditButton>
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

        <ActionCard onClick={() => navigate('/saved-searches')}>
          <ActionIcon><Bookmark size={32} /></ActionIcon>
          <ActionTitle>View my searches</ActionTitle>
          <ActionSubtext>{stats.savedSearches} saved searches</ActionSubtext>
        </ActionCard>

        <ActionCard onClick={() => navigate('/favorites')}>
          <ActionIcon><Car size={32} /></ActionIcon>
          <ActionTitle>{t('profile.favoriteSearches', 'Favorite Searches')}</ActionTitle>
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
        <ServiceCard onClick={() => navigate('/finance')}>
          <ServiceIcon><DollarSign size={28} /></ServiceIcon>
          <ServiceContent>
            <ServiceTitle>Need a car loan?</ServiceTitle>
            <ServiceSubtext>Find the best interest rate</ServiceSubtext>
          </ServiceContent>
          <ChevronRight size={24} color="rgba(0, 255, 30, 1)" />
        </ServiceCard>

        <ServiceCard onClick={() => navigate('/sell')}>
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
          <SectionTitle>{t('profile.myGarage', 'My Garage')}</SectionTitle>
          {sortedAndFilteredCars.length > 0 && (
            <ShowAllLink onClick={() => navigate('/profile/my-ads')}>
              {t('profile.garage.viewAll', 'Show all')} ({sortedAndFilteredCars.length})
            </ShowAllLink>
          )}
        </SectionHeader>

        {/* Sort and Filter Controls */}
        {userCars.length > 0 && (
          <FiltersBar>
            <FilterGroup>
              <FilterIcon><ArrowUpDown size={16} /></FilterIcon>
              <FilterLabel>{t('profile.garage.sortBy', 'Sort by')}:</FilterLabel>
              <FilterSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">{t('profile.garage.sort.newest', 'Newest first')}</option>
                <option value="oldest">{t('profile.garage.sort.oldest', 'Oldest first')}</option>
                <option value="nameAsc">{t('profile.garage.sort.nameAsc', 'Name (A-Z)')}</option>
                <option value="nameDesc">{t('profile.garage.sort.nameDesc', 'Name (Z-A)')}</option>
                <option value="priceLow">{t('profile.garage.sort.priceLow', 'Price: Low to High')}</option>
                <option value="priceHigh">{t('profile.garage.sort.priceHigh', 'Price: High to Low')}</option>
                <option value="yearNew">{t('profile.garage.sort.yearNew', 'Year: New to Old')}</option>
                <option value="yearOld">{t('profile.garage.sort.yearOld', 'Year: Old to New')}</option>
                <option value="make">{t('profile.garage.sort.make', 'By Make')}</option>
                <option value="model">{t('profile.garage.sort.model', 'By Model')}</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterIcon><Filter size={16} /></FilterIcon>
              <FilterLabel>{t('profile.garage.filterBy', 'Filter by')}:</FilterLabel>
              <FilterSelect value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                <option value="all">{t('profile.garage.filter.all', 'All')}</option>
                <option value="active">{t('profile.garage.filter.active', 'Active')}</option>
                <option value="sold">{t('profile.garage.filter.sold', 'Sold')}</option>
                <option value="pending">{t('profile.garage.filter.pending', 'Pending')}</option>
              </FilterSelect>
            </FilterGroup>
          </FiltersBar>
        )}
        
        {loadingCars ? (
          <LoadingContainer>
            <Loader size={24} className="spinning" />
            <LoadingText>{t('profile.loadingVehicles', 'Loading vehicles...')}</LoadingText>
          </LoadingContainer>
        ) : sortedAndFilteredCars.length > 0 ? (
          <>
            <VehiclesList>
              {sortedAndFilteredCars.slice(0, 3).map((car) => (
                <VehicleCard 
                  key={car.id} 
                  onClick={() => navigate(`/car-details/${car.id}`)}
                >
                  <VehicleImage 
                    src={car.images?.[0] || car.mainImage || car.photoURL || '/placeholder-car.jpg'} 
                    alt={car.make && car.model ? `${car.make} ${car.model}` : 'Vehicle'}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-car.jpg';
                    }}
                  />
                  <VehicleInfo>
                    <VehicleBrand>{car.make || 'Unknown'}</VehicleBrand>
                    <VehicleModel>{car.model || ''}</VehicleModel>
                    {car.year && <VehicleYear>{car.year}</VehicleYear>}
                    {car.price && (
                      <VehiclePrice>{new Intl.NumberFormat('bg-BG').format(car.price)} €</VehiclePrice>
                    )}
                  </VehicleInfo>
                </VehicleCard>
              ))}
            </VehiclesList>
            <AddVehicleButton onClick={() => navigate('/sell')}>
              <Plus size={20} />
              {t('profile.addAnotherVehicle', 'Add another vehicle')}
            </AddVehicleButton>
          </>
        ) : (
          <EmptyGarage>
            <EmptyGarageIcon>
              <Car size={48} />
            </EmptyGarageIcon>
            <EmptyGarageText>{t('profile.noVehicles', 'No vehicles yet')}</EmptyGarageText>
            <AddVehicleButton onClick={() => navigate('/sell')}>
              <Plus size={20} />
              {t('profile.addFirstVehicle', 'Add your first vehicle')}
            </AddVehicleButton>
          </EmptyGarage>
        )}
      </SectionContainer>

      {/* More Services Section */}
      <SectionContainer>
        <SectionTitle>More Services</SectionTitle>
        
        <MoreServiceCard onClick={() => navigate('/finance')}>
          <ServiceIcon><Calculator size={28} /></ServiceIcon>
          <ServiceContent>
            <ServiceTitle>How much can I afford?</ServiceTitle>
            <ServiceSubtext>Thinking of financing? Calculate your monthly rate in just 5 minutes.</ServiceSubtext>
          </ServiceContent>
        </MoreServiceCard>

        <MoreServiceCard onClick={() => navigate('/cars')}>
          <ServiceIcon><TrendingUp size={28} /></ServiceIcon>
          <ServiceContent>
            <ServiceTitle>Lease your dream car</ServiceTitle>
            <ServiceSubtext>Find hot deals on Germany's biggest vehicle marketplace.</ServiceSubtext>
          </ServiceContent>
        </MoreServiceCard>

        <MoreServiceCard onClick={() => navigate('/about')}>
          <ServiceIcon><FileText size={28} /></ServiceIcon>
          <ServiceContent>
            <ServiceTitle>The mobile.de Magazin</ServiceTitle>
            <ServiceSubtext>Independant and objective. Test drive and tips (Only in German)</ServiceSubtext>
          </ServiceContent>
        </MoreServiceCard>

        <MoreServiceCard onClick={() => navigate('/sell')}>
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
  transition: background 0.3s ease;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #0f172a;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: #f8f9fa;
  }
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
  transition: background 0.3s ease;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

const UserProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 24px 24px;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 16px;
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 12px;
`;

const UserAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-secondary);
`;

const UserAvatarPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 3px solid var(--border-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  
  svg {
    width: 40px;
    height: 40px;
  }
`;

const UploadOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  .spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const HiddenFileInput = styled.input`
  display: none;
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
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: var(--accent-primary);
    color: var(--text-inverse);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  transition: background 0.3s ease;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
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
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
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
    transform: translateY(-2px);
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
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
  transition: background 0.3s ease;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
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

const ShowAllLink = styled.button`
  font-size: 14px;
  color: var(--accent-primary);
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

const VehiclesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const VehicleCard = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-card);
  
  &:hover {
    border-color: var(--accent-primary);
    box-shadow: var(--shadow-sm);
    transform: translateY(-2px);
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.1);
    
    &:hover {
      border-color: var(--accent-primary);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    border-color: rgba(0, 0, 0, 0.1);
    
    &:hover {
      border-color: var(--accent-primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
`;

const VehicleImage = styled.img`
  width: 120px;
  height: 90px;
  min-width: 120px;
  min-height: 90px;
  object-fit: cover;
  border-radius: 6px;
  background: var(--bg-secondary);
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #0f172a;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: #f1f5f9;
  }
`;

const VehicleInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
`;

const VehicleBrand = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const VehicleModel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const VehicleYear = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

const VehiclePrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-primary);
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
  
  .spinning {
    animation: spin 1s linear infinite;
    color: var(--accent-primary);
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #cbd5e1;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    color: #64748b;
  }
`;

const EmptyGarage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 20px;
`;

const EmptyGarageIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  
  svg {
    width: 48px;
    height: 48px;
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    color: #64748b;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: #f1f5f9;
    color: #94a3b8;
  }
`;

const EmptyGarageText = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  text-align: center;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #cbd5e1;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    color: #64748b;
  }
`;

const FiltersBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  flex-wrap: wrap;
  align-items: center;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: #f8fafc;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const FilterIcon = styled.div`
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  flex-shrink: 0;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #e2e8f0;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    color: #1e293b;
  }
`;

const FilterSelect = styled.select`
  flex: 1;
  padding: 10px 14px;
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 0;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }
  
  option {
    background: var(--bg-card);
    color: var(--text-primary);
    padding: 8px;
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #0f172a;
    border-color: rgba(255, 255, 255, 0.2);
    color: #e2e8f0;
    
    &:hover {
      border-color: var(--accent-primary);
    }
    
    option {
      background: #0f172a;
      color: #e2e8f0;
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    border-color: rgba(0, 0, 0, 0.15);
    color: #1e293b;
    
    &:hover {
      border-color: var(--accent-primary);
    }
    
    option {
      background: white;
      color: #1e293b;
    }
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
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    padding-left: 8px;
    background: var(--bg-hover);
    margin: 0 -24px;
    padding-left: 24px;
    padding-right: 24px;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

export default ProfileSettingsMobileDe;
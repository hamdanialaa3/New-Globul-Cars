// Mobile.de Inspired Overview/Settings Page
import React from 'react';
import { 
  Search, Bookmark, Car, MessageSquare, DollarSign, TrendingUp,
  Calculator, FileText, ShieldCheck, Plus, ChevronRight, User, Loader,
  ArrowUpDown, Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProfileMediaService } from '@/services/profile/ProfileMediaService';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/components/Toast';
import { unifiedCarService } from '@/services/car/unified-car-service';
import { logger } from '@/services/logger-service';
import * as S from './ProfileSettingsMobileDe.styles';

const ProfileSettingsMobileDe: React.FC = () => {
  const { user, currentUser } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
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
        const activeCars = cars.filter((car: any) => car.isActive !== false && car.isSold !== true);
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
      filtered = filtered.filter((car: any) => car.isActive === true && car.isSold !== true);
    } else if (filterBy === 'sold') {
      filtered = filtered.filter((car: any) => car.isSold === true);
    } else if (filterBy === 'pending') {
      filtered = filtered.filter((car: any) => car.status === 'pending' || car.isActive === false);
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
      title: 'My Koli One Account',
      items: [
        { id: 'editInfo', label: language === 'bg' ? 'Редактиране на информация' : 'Edit Information', path: '/profile/settings' },
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
        { id: 'communication', label: 'Communication', path: '/notifications' }
      ]
    }
  ];

  return (
    <S.PageContainer>
      <S.LayoutWrapper>
        {/* Sidebar */}
        <S.Sidebar>
          {/* User Profile Section */}
          <S.UserProfileSection>
            <S.AvatarContainer>
              {photoURL ? (
                <S.UserAvatar src={photoURL} alt={userName} />
              ) : (
                <S.UserAvatarPlaceholder>
                  <User size={40} />
                </S.UserAvatarPlaceholder>
              )}
              {uploading && (
                <S.UploadOverlay>
                  <Loader size={24} className="spinning" />
                </S.UploadOverlay>
              )}
            </S.AvatarContainer>
            <S.UserName>{userName}</S.UserName>
            <S.HiddenFileInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
            <S.EditButton onClick={handleEditPhotoClick} disabled={uploading}>
              {uploading ? t('profile.uploadingPhoto', 'Uploading photo...') : t('profile.editPhoto', 'Edit Photo')}
            </S.EditButton>
          </S.UserProfileSection>

          {/* Sidebar Navigation */}
          {sidebarSections.map((section, idx) => (
            <S.SidebarSection key={idx}>
              <S.SidebarSectionTitle>{section.title}</S.SidebarSectionTitle>
              {section.items.map((item) => (
                <S.SidebarItem
                  key={item.id}
                  active={activeSection === item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    navigate(item.path);
                  }}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <S.Badge>{item.badge}</S.Badge>
                  )}
                </S.SidebarItem>
              ))}
            </S.SidebarSection>
          ))}
        </S.Sidebar>

        {/* Main Content */}
        <S.MainContent>
          {/* Welcome Header */}
          <S.WelcomeSection>
            <S.WelcomeTitle>Hello {userName}, what do you want to do today?</S.WelcomeTitle>
          </S.WelcomeSection>

      {/* Quick Actions Grid */}
      <S.QuickActionsGrid>
        <S.ActionCard onClick={() => navigate('/cars')}>
          <S.ActionIcon><Search size={32} /></S.ActionIcon>
          <S.ActionTitle>Start a new search</S.ActionTitle>
          <S.ActionSubtext>1,531,694 vehicles</S.ActionSubtext>
        </S.ActionCard>

        <S.ActionCard onClick={() => navigate('/saved-searches')}>
          <S.ActionIcon><Bookmark size={32} /></S.ActionIcon>
          <S.ActionTitle>View my searches</S.ActionTitle>
          <S.ActionSubtext>{stats.savedSearches} saved searches</S.ActionSubtext>
        </S.ActionCard>

        <S.ActionCard onClick={() => navigate('/favorites')}>
          <S.ActionIcon><Car size={32} /></S.ActionIcon>
          <S.ActionTitle>{t('profile.favoriteSearches', 'Favorite Searches')}</S.ActionTitle>
          <S.ActionSubtext>{stats.carPark} vehicles parked</S.ActionSubtext>
        </S.ActionCard>

        <S.ActionCard onClick={() => navigate('/messages')}>
          <S.ActionIcon><MessageSquare size={32} /></S.ActionIcon>
          <S.ActionTitle>View my messages</S.ActionTitle>
          <S.ActionSubtext>{stats.newMessages === 0 ? 'No new messages' : `${stats.newMessages} new messages`}</S.ActionSubtext>
        </S.ActionCard>
      </S.QuickActionsGrid>

      {/* Services Section */}
      <S.ServicesGrid>
        <S.ServiceCard onClick={() => navigate('/finance')}>
          <S.ServiceIcon><DollarSign size={28} /></S.ServiceIcon>
          <S.ServiceContent>
            <S.ServiceTitle>Need a car loan?</S.ServiceTitle>
            <S.ServiceSubtext>Find the best interest rate</S.ServiceSubtext>
          </S.ServiceContent>
          <ChevronRight size={24} color="rgba(0, 255, 30, 1)" />
        </S.ServiceCard>

        <S.ServiceCard onClick={() => navigate('/sell')}>
          <S.ServiceIcon><TrendingUp size={28} /></S.ServiceIcon>
          <S.ServiceContent>
            <S.ServiceTitle>Sell my vehicle</S.ServiceTitle>
            <S.ServiceSubtext>Direct or via listing</S.ServiceSubtext>
          </S.ServiceContent>
          <ChevronRight size={24} color="#6e766fff" />
        </S.ServiceCard>
      </S.ServicesGrid>

      {/* My Vehicles Section */}
      <S.SectionContainer>
        <S.SectionHeader>
          <S.SectionTitle>{t('profile.myGarage', 'My Garage')}</S.SectionTitle>
          {sortedAndFilteredCars.length > 0 && (
            <S.ShowAllLink onClick={() => navigate('/profile/my-ads')}>
              {t('profile.garage.viewAll', 'Show all')} ({sortedAndFilteredCars.length})
            </S.ShowAllLink>
          )}
        </S.SectionHeader>

        {/* Sort and Filter Controls */}
        {userCars.length > 0 && (
          <S.FiltersBar>
            <S.FilterGroup>
              <S.FilterIcon><ArrowUpDown size={16} /></S.FilterIcon>
              <S.FilterLabel>{t('profile.garage.sortBy', 'Sort by')}:</S.FilterLabel>
              <S.FilterSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
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
              </S.FilterSelect>
            </S.FilterGroup>

            <S.FilterGroup>
              <S.FilterIcon><Filter size={16} /></S.FilterIcon>
              <S.FilterLabel>{t('profile.garage.filterBy', 'Filter by')}:</S.FilterLabel>
              <S.FilterSelect value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                <option value="all">{t('profile.garage.filter.all', 'All')}</option>
                <option value="active">{t('profile.garage.filter.active', 'Active')}</option>
                <option value="sold">{t('profile.garage.filter.sold', 'Sold')}</option>
                <option value="pending">{t('profile.garage.filter.pending', 'Pending')}</option>
              </S.FilterSelect>
            </S.FilterGroup>
          </S.FiltersBar>
        )}
        
        {loadingCars ? (
          <S.LoadingContainer>
            <Loader size={24} className="spinning" />
            <S.LoadingText>{t('profile.loadingVehicles', 'Loading vehicles...')}</S.LoadingText>
          </S.LoadingContainer>
        ) : sortedAndFilteredCars.length > 0 ? (
          <>
            <S.VehiclesList>
              {sortedAndFilteredCars.slice(0, 3).map((car) => {
                // ✅ CONSTITUTION: Use numeric URL pattern
                const sellerNumericId = (car as any).sellerNumericId || (car as any).ownerNumericId;
                const carNumericId = (car as any).carNumericId || (car as any).userCarSequenceId || (car as any).numericId;
                const carUrl = sellerNumericId && carNumericId ? `/car/${sellerNumericId}/${carNumericId}` : '/cars';
                
                return (
                <S.VehicleCard 
                  key={car.id} 
                  onClick={() => navigate(carUrl)}
                >
                  <S.VehicleImage 
                    src={car.images?.[car.featuredImageIndex || 0] || car.images?.[0] || car.mainImage || car.photoURL || '/images/placeholder.png'} 
                    alt={car.make && car.model ? `${car.make} ${car.model}` : 'Vehicle'}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.dataset.errorHandled) {
                        target.dataset.errorHandled = 'true';
                        target.src = '/images/placeholder.png';
                      }
                    }}
                  />
                  <S.VehicleInfo>
                    <S.VehicleBrand>{car.make || 'Unknown'}</S.VehicleBrand>
                    <S.VehicleModel>{car.model || ''}</S.VehicleModel>
                    {car.year && <S.VehicleYear>{car.year}</S.VehicleYear>}
                    {car.price && (
                      <S.VehiclePrice>{new Intl.NumberFormat('bg-BG').format(car.price)} €</S.VehiclePrice>
                    )}
                  </S.VehicleInfo>
                </S.VehicleCard>
                );
              })}
            </S.VehiclesList>
            <S.AddVehicleButton onClick={() => navigate('/sell')}>
              <Plus size={20} />
              {t('profile.addAnotherVehicle', 'Add another vehicle')}
            </S.AddVehicleButton>
          </>
        ) : (
          <S.EmptyGarage>
            <S.EmptyGarageIcon>
              <Car size={48} />
            </S.EmptyGarageIcon>
            <S.EmptyGarageText>{t('profile.noVehicles', 'No vehicles yet')}</S.EmptyGarageText>
            <S.AddVehicleButton onClick={() => navigate('/sell')}>
              <Plus size={20} />
              {t('profile.addFirstVehicle', 'Add your first vehicle')}
            </S.AddVehicleButton>
          </S.EmptyGarage>
        )}
      </S.SectionContainer>

      {/* More Services Section */}
      <S.SectionContainer>
        <S.SectionTitle>More Services</S.SectionTitle>
        
        <S.MoreServiceCard onClick={() => navigate('/finance')}>
          <S.ServiceIcon><Calculator size={28} /></S.ServiceIcon>
          <S.ServiceContent>
            <S.ServiceTitle>How much can I afford?</S.ServiceTitle>
            <S.ServiceSubtext>Thinking of financing? Calculate your monthly rate in just 5 minutes.</S.ServiceSubtext>
          </S.ServiceContent>
        </S.MoreServiceCard>

        <S.MoreServiceCard onClick={() => navigate('/cars')}>
          <S.ServiceIcon><TrendingUp size={28} /></S.ServiceIcon>
          <S.ServiceContent>
            <S.ServiceTitle>Lease your dream car</S.ServiceTitle>
            <S.ServiceSubtext>Find hot deals on Germany's biggest vehicle marketplace.</S.ServiceSubtext>
          </S.ServiceContent>
        </S.MoreServiceCard>

        <S.MoreServiceCard onClick={() => navigate('/about')}>
          <S.ServiceIcon><FileText size={28} /></S.ServiceIcon>
          <S.ServiceContent>
            <S.ServiceTitle>The mobile.de Magazin</S.ServiceTitle>
            <S.ServiceSubtext>Independant and objective. Test drive and tips (Only in German)</S.ServiceSubtext>
          </S.ServiceContent>
        </S.MoreServiceCard>

        <S.MoreServiceCard onClick={() => navigate('/sell')}>
          <S.ServiceIcon><ShieldCheck size={28} /></S.ServiceIcon>
          <S.ServiceContent>
            <S.ServiceTitle>Trade with confidence</S.ServiceTitle>
            <S.ServiceSubtext>Bye-bye paperwork, here comes the digital sales contract!</S.ServiceSubtext>
          </S.ServiceContent>
        </S.MoreServiceCard>
      </S.SectionContainer>
        </S.MainContent>
      </S.LayoutWrapper>
    </S.PageContainer>
  );
};


export default ProfileSettingsMobileDe;

















import { logger } from '@/services/logger-service';
import { toast } from 'react-toastify';
// src/pages/MyListingsPage/index.tsx
// Main MyListingsPage component that composes all sections

import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { MyListingsStats, MyListing, MyListingsFilters } from './types';
import { MyListingsContainer, SectionHeader, LoadingState } from './styles';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfile } from '../../profile/ProfilePage/hooks/useProfile';
import { myListingsService } from './services';

// Lazy load all sections for better performance
const StatsSection = React.lazy(() => import('./StatsSection'));
const FiltersSection = React.lazy(() => import('./FiltersSection'));
const ListingsGrid = React.lazy(() => import('./ListingsGrid'));

const MyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useProfile();
  const [stats, setStats] = useState<MyListingsStats>({
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    totalViews: 0,
    totalInquiries: 0
  });

  const [filters, setFilters] = useState<MyListingsFilters>({
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    searchTerm: ''
  });

  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        if (user) {
          // Load real data from Firebase
          const [listings, stats] = await Promise.all([
            myListingsService.getUserListings(user.uid),
            myListingsService.getUserStats(user.uid)
          ]);
          
          setListings(listings);
          setStats(stats);
        } else {
          // Fallback to mock data if no user
          loadMockData();
        }
      } catch (error) {
        logger.error('Error loading listings:', error);
        // Fallback to mock data on error
        loadMockData();
      } finally {
        setLoading(false);
      }
    };

    const loadMockData = () => {
      // Simulate API call
      setTimeout(() => {
        const mockListings: MyListing[] = [
          {
            id: '1',
            title: 'BMW X5 xDrive30d 2020',
            price: 45000,
            currency: 'EUR',
            status: 'active',
            views: 245,
            inquiries: 12,
            favorites: 8,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-20'),
            featured: true,
            isUrgent: false,
            
            vehicle: {
              make: 'BMW',
              model: 'X5',
              variant: 'xDrive30d',
              year: 2020,
              mileage: 45000,
              fuelType: 'Diesel',
              transmission: 'Automatic',
              power: '265 HP',
              engineSize: '3.0L',
              doors: 5,
              seats: 5,
              color: 'Black Sapphire',
              previousOwners: 1,
              firstRegistration: '2020-03',
              hasAccidentHistory: false,
              hasServiceHistory: true,
              isDamaged: false,
              isRoadworthy: true,
              nonSmoker: true,
              taxi: false
            },
            
            equipment: {
              safety: ['abs', 'esp', 'airbags', 'parkingSensors', 'rearviewCamera', 'blindSpotMonitor'],
              comfort: ['airConditioning', 'heatedSeats', 'leatherSeats', 'electricWindows', 'centralLocking'],
              infotainment: ['bluetooth', 'navigation', 'carPlay', 'androidAuto', 'soundSystem'],
              extras: ['ledLights', 'alloyWheels', 'keyless', 'startStop', 'sportPackage']
            },
            
            location: {
              cityId: 'sofia',
              cityName: { en: 'Sofia', bg: 'София', ar: 'صوفيا' },
              coordinates: { lat: 42.6977, lng: 23.3219 },
              region: 'Sofia Region',
              postalCode: '1000',
              address: 'Sofia Center'
            },
            
            media: {
              images: ['/images/cars/bmw-x5-1.jpg', '/images/cars/bmw-x5-2.jpg', '/images/cars/bmw-x5-3.jpg'],
              hasVideo: true,
              videoUrl: '/videos/bmw-x5-demo.mp4'
            },
            
            contact: {
              sellerName: 'Иван Петров',
              sellerType: 'individual',
              phone: '+359 88 123 4567',
              email: 'ivan.petrov@email.com',
              preferredContact: 'phone'
            },
            
            description: 'Отлична BMW X5 в перфектно състояние. Един собственик, пълна сервизна история. Идеална за семейство.'
          },
          {
            id: '2',
            title: 'Mercedes-Benz C-Class C200 2019',
            price: 38500,
            currency: 'EUR',
            status: 'active',
            views: 189,
            inquiries: 8,
            favorites: 12,
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-18'),
            featured: false,
            isUrgent: true,
            
            vehicle: {
              make: 'Mercedes-Benz',
              model: 'C-Class',
              variant: 'C200',
              year: 2019,
              mileage: 62000,
              fuelType: 'Petrol',
              transmission: 'Automatic',
              power: '184 HP',
              engineSize: '1.5L',
              doors: 4,
              seats: 5,
              color: 'Polar White',
              previousOwners: 2,
              firstRegistration: '2019-06',
              hasAccidentHistory: false,
              hasServiceHistory: true,
              isDamaged: false,
              isRoadworthy: true,
              nonSmoker: true,
              taxi: false
            },
            
            equipment: {
              safety: ['abs', 'esp', 'airbags', 'parkingSensors', 'laneDeparture'],
              comfort: ['airConditioning', 'heatedSeats', 'electricWindows', 'centralLocking', 'cruiseControl'],
              infotainment: ['bluetooth', 'navigation', 'carPlay', 'androidAuto', 'radio'],
              extras: ['xenon', 'alloyWheels', 'keyless', 'startStop']
            },
            
            location: {
              cityId: 'plovdiv',
              cityName: { en: 'Plovdiv', bg: 'Пловдив', ar: 'بلوفديف' },
              coordinates: { lat: 42.1354, lng: 24.7453 },
              region: 'Plovdiv Region',
              postalCode: '4000',
              address: 'Plovdiv Center'
            },
            
            media: {
              images: ['/images/cars/mercedes-c-1.jpg', '/images/cars/mercedes-c-2.jpg'],
              hasVideo: false
            },
            
            contact: {
              sellerName: 'Мария Георгиева',
              sellerType: 'individual',
              phone: '+359 87 987 6543',
              email: 'maria.georgieva@email.com',
              preferredContact: 'both'
            },
            
            description: 'Елегантна Mercedes C-Class с луксозен интериор и всички съвременни функции.'
          },
          {
            id: '3',
            title: 'Audi A4 Avant 45 TFSI 2021',
            price: 42000,
            currency: 'EUR',
            status: 'sold',
            views: 312,
            inquiries: 15,
            favorites: 25,
            createdAt: new Date('2024-01-05'),
            updatedAt: new Date('2024-02-01'),
            featured: true,
            isUrgent: false,
            
            vehicle: {
              make: 'Audi',
              model: 'A4',
              variant: 'Avant 45 TFSI',
              year: 2021,
              mileage: 28000,
              fuelType: 'Petrol',
              transmission: 'Automatic',
              power: '245 HP',
              engineSize: '2.0L',
              doors: 5,
              seats: 5,
              color: 'Mythos Black',
              previousOwners: 1,
              firstRegistration: '2021-02',
              hasAccidentHistory: false,
              hasServiceHistory: true,
              isDamaged: false,
              isRoadworthy: true,
              nonSmoker: true,
              taxi: false
            },
            
            equipment: {
              safety: ['abs', 'esp', 'airbags', 'parkingSensors', 'rearviewCamera', 'collisionWarning'],
              comfort: ['airConditioning', 'heatedSeats', 'leatherSeats', 'electricWindows', 'centralLocking'],
              infotainment: ['bluetooth', 'navigation', 'carPlay', 'androidAuto', 'soundSystem', 'wifi'],
              extras: ['ledLights', 'alloyWheels', 'keyless', 'startStop', 'sportPackage']
            },
            
            location: {
              cityId: 'varna',
              cityName: { en: 'Varna', bg: 'Варна', ar: 'فارنا' },
              coordinates: { lat: 43.2141, lng: 27.9147 },
              region: 'Varna Region',
              postalCode: '9000',
              address: 'Varna Center'
            },
            
            media: {
              images: ['/images/cars/audi-a4-1.jpg', '/images/cars/audi-a4-2.jpg', '/images/cars/audi-a4-3.jpg', '/images/cars/audi-a4-4.jpg'],
              hasVideo: true,
              videoUrl: '/videos/audi-a4-demo.mp4'
            },
            
            contact: {
              sellerName: 'AutoVarna Ltd',
              sellerType: 'dealer',
              phone: '+359 52 123 456',
              email: 'sales@autovarna.bg',
              preferredContact: 'both'
            },
            
            description: 'СПРОДАДЕНА! Ауди A4 Avant с мощен двигател и всички луксозни функции. Идеална за дълги пътувания.'
          }
        ];

        const mockStats: MyListingsStats = {
          totalListings: mockListings.length,
          activeListings: mockListings.filter(l => l.status === 'active').length,
          soldListings: mockListings.filter(l => l.status === 'sold').length,
          totalViews: mockListings.reduce((sum, l) => sum + l.views, 0),
          totalInquiries: mockListings.reduce((sum, l) => sum + l.inquiries, 0)
        };

        setListings(mockListings);
        setStats(mockStats);
        setLoading(false);
      }, 1000);
    };

    loadData();
  }, [user]);

  const handleEdit = async (listingId: string) => {
    // Navigate to edit page
    navigate(`/sell/edit/${listingId}`);
  };

  const handleDelete = async (listingId: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        if (user) {
          await myListingsService.deleteListing(listingId);
          setListings(listings.filter(l => l.id !== listingId));
          
          // Update stats
          const newStats = await myListingsService.getUserStats(user.uid);
          setStats(newStats);
        } else {
          // Fallback for mock data
          setListings(listings.filter(l => l.id !== listingId));
        }
      } catch (error) {
        logger.error('Error deleting listing:', error);
        toast.error('Failed to delete listing. Please try again.');
      }
    }
  };

  const handleToggleFeature = async (listingId: string) => {
    try {
      if (user) {
        const listing = listings.find(l => l.id === listingId);
        if (listing) {
          await myListingsService.toggleFeatured(listingId, !listing.featured);
          setListings(listings.map(l => 
            l.id === listingId ? { ...l, featured: !l.featured } : l
          ));
        }
      } else {
        // Fallback for mock data
        setListings(listings.map(l =>
          l.id === listingId ? { ...l, featured: !l.featured } : l
        ));
      }
    } catch (error) {
      logger.error('Error toggling featured status:', error);
      toast.error('Failed to update featured status. Please try again.');
    }
  };

  const handleStatusChange = async (listingId: string, newStatus: string) => {
    try {
      if (user) {
        await myListingsService.updateListingStatus(listingId, newStatus);
        setListings(listings.map(l => 
          l.id === listingId ? { ...l, status: newStatus as any } : l
        ));
        
        // Update stats
        const newStats = await myListingsService.getUserStats(user.uid);
        setStats(newStats);
      } else {
        // Fallback for mock data
        setListings(listings.map(l => 
          l.id === listingId ? { ...l, status: newStatus as any } : l
        ));
      }
    } catch (error) {
      logger.error('Error updating status:', error);
      toast.error('Failed to update status. Please try again.');
    }
  };

  return (
    <MyListingsContainer>
      <SectionHeader>
        <h1>{t('myListings.title', 'My Listings')}</h1>
        <p>
          {t('myListings.subtitle', 'Manage your car listings, track performance, and connect with buyers.')}
        </p>
      </SectionHeader>

      <Suspense fallback={<LoadingState>Loading stats...</LoadingState>}>
        <StatsSection stats={stats} />
      </Suspense>

      <Suspense fallback={<LoadingState>Loading filters...</LoadingState>}>
        <FiltersSection filters={filters} onFiltersChange={setFilters} />
      </Suspense>

      <Suspense fallback={<LoadingState>Loading listings...</LoadingState>}>
        <ListingsGrid
          listings={listings}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleFeature={handleToggleFeature}
          onStatusChange={handleStatusChange}
        />
      </Suspense>
    </MyListingsContainer>
  );
};

export default MyListingsPage;
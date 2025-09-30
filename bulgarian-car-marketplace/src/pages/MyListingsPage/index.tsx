// src/pages/MyListingsPage/index.tsx
// Main MyListingsPage component that composes all sections

import React, { useState, useEffect, Suspense } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { MyListingsStats, MyListing, MyListingsFilters } from './types';
import { MyListingsContainer, SectionHeader, LoadingState } from './styles';

// Lazy load all sections for better performance
const StatsSection = React.lazy(() => import('./StatsSection'));
const FiltersSection = React.lazy(() => import('./FiltersSection'));
const ListingsGrid = React.lazy(() => import('./ListingsGrid'));

const MyListingsPage: React.FC = () => {
  const { t } = useTranslation();
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

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Simulate API call
      setTimeout(() => {
        const mockListings: MyListing[] = [
          {
            id: '1',
            title: 'BMW X5 2020',
            price: 45000,
            currency: 'EUR',
            location: 'София',
            status: 'active',
            views: 245,
            inquiries: 12,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-20'),
            images: ['/images/cars/bmw-x5-1.jpg'],
            featured: true
          },
          {
            id: '2',
            title: 'Mercedes C-Class 2019',
            price: 38500,
            currency: 'EUR',
            location: 'Пловдив',
            status: 'active',
            views: 189,
            inquiries: 8,
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-18'),
            images: ['/images/cars/mercedes-c-1.jpg'],
            featured: false
          },
          {
            id: '3',
            title: 'Audi A4 2021',
            price: 42000,
            currency: 'EUR',
            location: 'Варна',
            status: 'sold',
            views: 312,
            inquiries: 15,
            createdAt: new Date('2024-01-05'),
            updatedAt: new Date('2024-02-01'),
            images: ['/images/cars/audi-a4-1.jpg'],
            featured: true
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
  }, []);

  const handleEdit = (listingId: string) => {
    // Navigate to edit page
    console.log('Edit listing:', listingId);
  };

  const handleDelete = (listingId: string) => {
    // Show confirmation and delete
    if (window.confirm('Are you sure you want to delete this listing?')) {
      setListings(prev => prev.filter(l => l.id !== listingId));
    }
  };

  const handleToggleFeature = (listingId: string) => {
    setListings(prev => prev.map(l =>
      l.id === listingId ? { ...l, featured: !l.featured } : l
    ));
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
        />
      </Suspense>
    </MyListingsContainer>
  );
};

export default MyListingsPage;
// src/features/analytics/PrivateDashboard.tsx
// Private User Analytics Dashboard

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Eye, MessageCircle, Heart, TrendingUp } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contexts/LanguageContext';
import { useAuth } from '@globul-cars/core/contexts/AuthProvider';  /* ⚡ FIXED: Correct import path */
import { httpsCallable } from 'firebase/functions';
import { functions } from '@globul-cars/services/firebase/firebase-config';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 2rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #FF8F10;
  margin: 0.5rem 0;
`;

const MetricLabel = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-center;
  min-height: 200px;
  color: #FF8F10;
`;

interface UserAnalytics {
  profileViews: number;
  listingViews: number;
  inquiries: number;
  favorites: number;
}

export const PrivateDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const getUserAnalytics = httpsCallable(functions, 'getUserAnalytics');
        const result = await getUserAnalytics({
          userId: currentUser.uid,
          period: 'all',
        });

        const data = result.data as { success: boolean; analytics: any };
        
        if (data.success) {
          setAnalytics({
            profileViews: data.analytics.profileViews || 0,
            listingViews: data.analytics.listingViews || 0,
            inquiries: data.analytics.inquiries || 0,
            favorites: data.analytics.favorites || 0,
          });
        }
      } catch (err: any) {
        console.error('Failed to fetch analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [currentUser]);

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="text-center text-red-600 p-4">
          {language === 'bg' ? 'Грешка при зареждане на статистиката' : 'Error loading analytics'}
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Title>{language === 'bg' ? 'Моята статистика' : 'My Analytics'}</Title>
      
      <MetricsGrid>
        <MetricCard>
          <MetricLabel><Eye /> {language === 'bg' ? 'Прегледи на профила' : 'Profile Views'}</MetricLabel>
          <MetricValue>{analytics?.profileViews || 0}</MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricLabel><TrendingUp /> {language === 'bg' ? 'Прегледи на обяви' : 'Listing Views'}</MetricLabel>
          <MetricValue>{analytics?.listingViews || 0}</MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricLabel><MessageCircle /> {language === 'bg' ? 'Запитвания' : 'Inquiries'}</MetricLabel>
          <MetricValue>{analytics?.inquiries || 0}</MetricValue>
        </MetricCard>
        
        <MetricCard>
          <MetricLabel><Heart /> {language === 'bg' ? 'Любими' : 'Favorites'}</MetricLabel>
          <MetricValue>{analytics?.favorites || 0}</MetricValue>
        </MetricCard>
      </MetricsGrid>
    </Container>
  );
};

export default PrivateDashboard;


// src/components/dealer/TopListingsWidget.tsx
// Top Listings Widget - Widget أفضل الإعلانات

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { TrendingUp, Eye, MessageSquare, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { TopListing } from '../../services/dealer/dealer-dashboard.service';

interface TopListingsWidgetProps {
  listings: TopListing[];
}

const WidgetContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const WidgetTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ListingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ListingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
    transform: translateX(4px);
  }
`;

const ListingInfo = styled.div`
  flex: 1;
`;

const ListingTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const ListingMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #7f8c8d;
`;

const ListingStats = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #2c3e50;
`;

const Price = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #10b981;
  margin-left: 1rem;
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const TopListingsWidget: React.FC<TopListingsWidgetProps> = ({ listings }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  if (listings.length === 0) {
    return (
      <WidgetContainer>
        <WidgetTitle>
          <TrendingUp size={24} />
          {language === 'bg' ? 'Най-добри обяви' : 'Top Listings'}
        </WidgetTitle>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
          {language === 'bg' ? 'Няма активни обяви' : 'No active listings'}
        </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer>
      <WidgetTitle>
        <TrendingUp size={24} />
        {language === 'bg' ? 'Най-добри обяви' : 'Top Listings'}
      </WidgetTitle>

      <ListingsList>
        {listings.map((listing) => (
          <ListingItem key={listing.id}>
            <ListingInfo>
              <ListingTitle>
                {listing.make} {listing.model} {listing.year ? `(${listing.year})` : ''}
              </ListingTitle>
              <ListingMeta>
                <StatItem>
                  <Eye size={16} />
                  {listing.views} {language === 'bg' ? 'прегледа' : 'views'}
                </StatItem>
                <StatItem>
                  <MessageSquare size={16} />
                  {listing.messages} {language === 'bg' ? 'съобщения' : 'messages'}
                </StatItem>
                <StatItem>
                  {listing.leads} {language === 'bg' ? 'лидове' : 'leads'}
                </StatItem>
              </ListingMeta>
            </ListingInfo>
            <ListingStats>
              <Price>€{listing.price.toLocaleString()}</Price>
              <ViewButton onClick={() => navigate(listing.url)}>
                <ExternalLink size={16} />
                {language === 'bg' ? 'Преглед' : 'View'}
              </ViewButton>
            </ListingStats>
          </ListingItem>
        ))}
      </ListingsList>
    </WidgetContainer>
  );
};

export default TopListingsWidget;


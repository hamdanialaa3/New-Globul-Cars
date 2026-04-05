/**
 * ViewAllDealersPage.tsx
 * Dedicated page to display all featured dealers
 * 
 * Features:
 * - Grid layout of dealer cards
 * - Search and filter by location
 * - Professional UI
 * - Bilingual support
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { FiMapPin, FiPhone, FiMail, FiStar } from 'react-icons/fi';
import { logger } from '@/services/logger-service';
import { DealershipRepository } from '../../../repositories/DealershipRepository';
import type { DealershipInfo } from '@/types/dealership/dealership.types';

// ============================================================================
// TYPES
// ============================================================================

interface DealerDisplay {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  rating: number;
  image: string;
  totalCars: number;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 80px 20px 40px;
  
  @media (max-width: 768px) {
    padding: 70px 16px 24px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const PageTitle = styled.h1`
  font-size: clamp(28px, 5vw, 42px);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  letter-spacing: -0.5px;
  
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--secondary-color) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const PageDescription = styled.p`
  font-size: 18px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const SearchBar = styled.div`
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(var(--card-rgb), 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid var(--border-primary);
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 20px;
  font-size: 16px;
  color: var(--text-primary);
  background: rgba(var(--card-rgb), 0.8);
  border: 2px solid var(--border-primary);
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: var(--text-secondary);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
  }
`;

const DealersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const DealerCard = styled.div`
  background: rgba(var(--card-rgb), 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(var(--primary-rgb), 0.2);
    border-color: var(--primary-color);
  }
`;

const DealerImage = styled.div<{ $image: string }>`
  width: 100%;
  height: 200px;
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center;
  position: relative;
`;

const DealerBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 8px 16px;
  background: rgba(var(--primary-rgb), 0.95);
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;

const DealerInfo = styled.div`
  padding: 24px;
`;

const DealerName = styled.h3`
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
`;

const DealerRating = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 600;
  
  svg {
    color: #FFD700;
  }
`;

const DealerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DealerDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-secondary);
  
  svg {
    color: var(--primary-color);
    flex-shrink: 0;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  font-size: 18px;
  color: var(--text-secondary);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  
  h3 {
    font-size: 24px;
    margin-bottom: 12px;
  }
  
  p {
    font-size: 16px;
  }
`;

// ============================================================================
// COMPONENT
// ============================================================================

const ViewAllDealersPage: React.FC = () => {
  const { language: currentLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const isRTL = currentLanguage === 'ar';
  
  const [dealers, setDealers] = useState<DealerDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    let isActive = true;
    loadDealers(isActive);
    return () => { isActive = false; };
  }, []);
  
  const loadDealers = async (isActive: boolean) => {
    try {
      setLoading(true);
      
      const verifiedDealerships = await DealershipRepository.getVerified(100);
      
      if (!isActive) return;
      
      const mapped: DealerDisplay[] = verifiedDealerships.map((d: DealershipInfo) => ({
        id: d.uid,
        name: currentLanguage === 'bg' 
          ? d.dealershipNameBG 
          : (d.dealershipNameEN || d.dealershipNameBG),
        location: d.address 
          ? `${d.address.city}, ${d.address.region || 'Bulgaria'}` 
          : 'Bulgaria',
        phone: d.contact?.phone 
          ? `${d.contact.phoneCountryCode || '+359'} ${d.contact.phone}` 
          : '',
        email: d.contact?.email || '',
        rating: 0,
        image: d.media?.logo || d.media?.coverImage || '/images/default-dealer.png',
        totalCars: 0,
      }));
      
      setDealers(mapped);
    } catch (error) {
      logger.error('Error loading dealers', error as Error);
    } finally {
      if (isActive) setLoading(false);
    }
  };
  
  const filteredDealers = dealers.filter(dealer =>
    dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <PageContainer dir={isRTL ? 'rtl' : 'ltr'}>
      <ContentWrapper>
        <PageHeader>
          <PageTitle>
            {currentLanguage === 'bg' ? 'Всички дилъри' : 'All Featured Dealers'}
          </PageTitle>
          <PageDescription>
            {currentLanguage === 'bg'
              ? 'Разгледайте мрежата от сертифицирани дилъри в България'
              : 'Browse our network of certified dealers across Bulgaria'
            }
          </PageDescription>
        </PageHeader>
        
        <SearchBar>
          <SearchInput
            type="text"
            placeholder={currentLanguage === 'bg' ? 'Търсене по дилър или локация...' : 'Search for dealer or location...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
        
        {loading ? (
          <LoadingContainer>
            {t('common.loading')}
          </LoadingContainer>
        ) : filteredDealers.length === 0 ? (
          <EmptyState>
            <h3>{t('common.noResults')}</h3>
            <p>{t('common.noResultsDesc')}</p>
          </EmptyState>
        ) : (
          <DealersGrid>
            {filteredDealers.map((dealer) => (
              <DealerCard key={dealer.id} onClick={() => navigate(`/dealer/${dealer.id}`)}>
                <DealerImage $image={dealer.image}>
                  {dealer.totalCars > 0 && (
                    <DealerBadge>
                      {dealer.totalCars} {isRTL ? 'Cars' : 'Cars'}
                    </DealerBadge>
                  )}
                </DealerImage>
                <DealerInfo>
                  <DealerName>{dealer.name}</DealerName>
                  {dealer.rating > 0 && (
                    <DealerRating>
                      <FiStar />
                      {dealer.rating}
                    </DealerRating>
                  )}
                  <DealerDetails>
                    <DealerDetail>
                      <FiMapPin />
                      {dealer.location}
                    </DealerDetail>
                    <DealerDetail>
                      <FiPhone />
                      {dealer.phone}
                    </DealerDetail>
                    <DealerDetail>
                      <FiMail />
                      {dealer.email}
                    </DealerDetail>
                  </DealerDetails>
                </DealerInfo>
              </DealerCard>
            ))}
          </DealersGrid>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default ViewAllDealersPage;

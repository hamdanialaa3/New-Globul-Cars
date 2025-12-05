// Life Moments Browse Component
// Browse cars by lifestyle presets

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Car, Users, MapPin, Mountain, Leaf } from 'lucide-react';
import { useLanguage } from '@globul-cars/core';

const MomentsContainer = styled.section`
  padding: 40px 20px;
  margin: 40px 0;
  background: var(--bg-primary);

  @media (max-width: 768px) {
    padding: 32px 16px;
    margin: 24px 0;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 32px;
  color: var(--text-primary);

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }
`;

const MomentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

const MomentCard = styled(Link)`
  background: var(--bg-card);
  border-radius: 12px;
  padding: 24px 20px;
  text-decoration: none;
  color: inherit;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    border-color: var(--accent-orange);
  }

  @media (max-width: 768px) {
    padding: 20px 16px;
    gap: 10px;
  }
`;

const MomentIcon = styled.div`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #FF8F10 0%, #ff9f30 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 28px;
    height: 28px;
    color: white;
  }

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;

    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const MomentLabel = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

interface LifeMoment {
  id: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: { bg: string; en: string };
  searchParams: Record<string, string>;
}

const LifeMomentsBrowse: React.FC = () => {
  const { language } = useLanguage();

  const moments: LifeMoment[] = [
    {
      id: 'first',
      icon: Car,
      label: {
        bg: 'Първа кола',
        en: 'First Car',
      },
      searchParams: {
        priceMax: '12000',
        condition: 'used',
      },
    },
    {
      id: 'family',
      icon: Users,
      label: {
        bg: 'Семейна',
        en: 'Family',
      },
      searchParams: {
        seats: '5',
        bodyStyle: 'suv',
      },
    },
    {
      id: 'city',
      icon: MapPin,
      label: {
        bg: 'Градска',
        en: 'City',
      },
      searchParams: {
        fuelType: 'petrol',
        bodyStyle: 'hatchback',
      },
    },
    {
      id: 'mountain',
      icon: Mountain,
      label: {
        bg: 'Планина',
        en: 'Mountain',
      },
      searchParams: {
        bodyStyle: 'suv',
        drivetrain: '4wd',
      },
    },
    {
      id: 'eco',
      icon: Leaf,
      label: {
        bg: 'Еко',
        en: 'Eco',
      },
      searchParams: {
        fuelType: 'hybrid',
      },
    },
  ];

  const buildSearchUrl = (params: Record<string, string>) => {
    const queryString = new URLSearchParams(params).toString();
    return `/advanced-search?${queryString}`;
  };

  return (
    <MomentsContainer>
      <Container>
        <Title>
          {language === 'bg' 
            ? 'Намерете колата за Вашия Живот' 
            : 'Find the Car for Your Life'}
        </Title>

        <MomentsGrid>
          {moments.map((moment) => {
            const IconComponent = moment.icon;
            return (
              <MomentCard
                key={moment.id}
                to={buildSearchUrl(moment.searchParams)}
              >
                <MomentIcon>
                  <IconComponent />
                </MomentIcon>
                <MomentLabel>
                  {language === 'bg' ? moment.label.bg : moment.label.en}
                </MomentLabel>
              </MomentCard>
            );
          })}
        </MomentsGrid>
      </Container>
    </MomentsContainer>
  );
};

export default LifeMomentsBrowse;


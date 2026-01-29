import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { unifiedCarService, UnifiedCar } from '../../../../services/car';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { logger } from '../../../../services/logger-service';
import HorizontalScrollContainer from '../../../../components/HorizontalScrollContainer/HorizontalScrollContainer';
import RealisticPaperclipBadge from '../../../../components/SoldBadge/RealisticPaperclipBadge';

const Container = styled.div`
  padding: 1rem 0;
`;

const CarCard = styled.div`
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  width: 240px;
  flex-shrink: 0;
  position: relative;
`;

const ImageWrapper = styled.div`
  height: 140px;
  position: relative;
  background: var(--bg-secondary);
`;

const CarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7; /* Muted for sold cars */
`;

const Info = styled.div`
  padding: 12px;
  text-align: center;
`;

const Title = styled.h4`
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-primary);
`;

const Price = styled.div`
  font-weight: 700;
  color: var(--accent-primary);
  margin-top: 4px;
`;

const RecentlySold: React.FC = () => {
    const { language } = useLanguage();
    const [cars, setCars] = useState<UnifiedCar[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSold = async () => {
            try {
                const soldCars = await unifiedCarService.getRecentlySoldCars(6);
                setCars(soldCars);
            } catch (error) {
                logger.error('Error fetching recently sold cars', error as Error);
            } finally {
                setLoading(false);
            }
        };
        fetchSold();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>...</div>;
    if (cars.length === 0) return null;

    return (
        <Container>
            <HorizontalScrollContainer gap="1rem" padding="0" itemMinWidth="240px">
                {cars.map(car => (
                    <CarCard key={car.id}>
                        <ImageWrapper>
                            <RealisticPaperclipBadge
                                text={language === 'bg' ? 'ПРОДАДЕНО' : 'SOLD'}
                                language={language as 'bg' | 'en'}
                            />
                            {car.images && car.images[0] ? (
                                <CarImage src={car.images[0]} alt={`${car.make} ${car.model}`} />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚗</div>
                            )}
                        </ImageWrapper>
                        <Info>
                            <Title>{car.make} {car.model}</Title>
                            <Price>{car.price.toLocaleString()} €</Price>
                        </Info>
                    </CarCard>
                ))}
            </HorizontalScrollContainer>
        </Container>
    );
};

export default RecentlySold;

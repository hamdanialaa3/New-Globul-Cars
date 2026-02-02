import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { unifiedCarService, UnifiedCar } from '../../../../services/car';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { logger } from '../../../../services/logger-service';
import HorizontalScrollContainer from '../../../../components/HorizontalScrollContainer/HorizontalScrollContainer';
import PremiumHomeCarCard from '../../../../components/CarCard/PremiumHomeCarCard';

const Container = styled.div`
  padding: 1rem 0;
`;

// Styled components cleaned up

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
                    <div key={car.id} style={{ width: '240px', flexShrink: 0, padding: '10px' }}>
                        <PremiumHomeCarCard car={car} />
                    </div>
                ))}
            </HorizontalScrollContainer>
        </Container>
    );
};

export default RecentlySold;

/**
 * LocationLandingPage.tsx
 * 🗺️ Programmatic SEO Landing Page for Location-Based Searches
 * 
 * Generates unique landing pages for:
 * - /cars/sofia
 * - /cars/sofia/bmw
 * - /cars/sofia/diesel/under-10000
 * 
 * Each page has unique H1, description, and schema for Google indexing.
 * 
 * @author SEO Supremacy System
 */

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { MapPin, Car, Fuel, DollarSign } from 'lucide-react';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { useLanguage } from '@/contexts/LanguageContext';
import { SchemaGenerator } from '@/utils/seo/SchemaGenerator';
import CarCardGermanStyle from '@/components/CarCard/CarCardGermanStyle';
import LoadingSpinner from '@/components/LoadingSpinner';
import { logger } from '@/services/logger-service';

// ============================================================================
// TYPES
// ============================================================================

interface LocationParams {
    city?: string;
    brand?: string;
    fuelType?: string;
    priceRange?: string;
}

// ============================================================================
// CITY DATA
// ============================================================================

const CITY_DATA: Record<string, { bg: string; en: string; region: string }> = {
    sofia: { bg: 'София', en: 'Sofia', region: 'София-град' },
    plovdiv: { bg: 'Пловдив', en: 'Plovdiv', region: 'Пловдив' },
    varna: { bg: 'Варна', en: 'Varna', region: 'Варна' },
    burgas: { bg: 'Бургас', en: 'Burgas', region: 'Бургас' },
    ruse: { bg: 'Русе', en: 'Ruse', region: 'Русе' },
    'stara-zagora': { bg: 'Стара Загора', en: 'Stara Zagora', region: 'Стара Загора' },
    pleven: { bg: 'Плевен', en: 'Pleven', region: 'Плевен' },
    sliven: { bg: 'Сливен', en: 'Sliven', region: 'Сливен' },
    dobrich: { bg: 'Добрич', en: 'Dobrich', region: 'Добрич' },
    shumen: { bg: 'Шумен', en: 'Shumen', region: 'Шумен' },
};

const FUEL_MAP: Record<string, { bg: string; en: string }> = {
    diesel: { bg: 'дизел', en: 'diesel' },
    petrol: { bg: 'бензин', en: 'petrol' },
    electric: { bg: 'електрически', en: 'electric' },
    hybrid: { bg: 'хибрид', en: 'hybrid' },
    lpg: { bg: 'газ', en: 'LPG' },
};

const PRICE_RANGES: Record<string, { max: number; label: { bg: string; en: string } }> = {
    'under-5000': { max: 5000, label: { bg: 'до 5000€', en: 'under €5,000' } },
    'under-10000': { max: 10000, label: { bg: 'до 10000€', en: 'under €10,000' } },
    'under-20000': { max: 20000, label: { bg: 'до 20000€', en: 'under €20,000' } },
    'under-30000': { max: 30000, label: { bg: 'до 30000€', en: 'under €30,000' } },
    'under-50000': { max: 50000, label: { bg: 'до 50000€', en: 'under €50,000' } },
};

// ============================================================================
// COMPONENT
// ============================================================================

const LocationLandingPage: React.FC = () => {
    const params = useParams<LocationParams>();
    const { language } = useLanguage();
    const [cars, setCars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const isBg = language === 'bg';
    const cityData = params.city ? CITY_DATA[params.city.toLowerCase()] : null;
    const fuelData = params.fuelType ? FUEL_MAP[params.fuelType.toLowerCase()] : null;
    const priceData = params.priceRange ? PRICE_RANGES[params.priceRange.toLowerCase()] : null;

    // Generate dynamic SEO content
    const generateSEO = () => {
        const cityName = cityData ? (isBg ? cityData.bg : cityData.en) : '';
        const brandName = params.brand ? params.brand.charAt(0).toUpperCase() + params.brand.slice(1) : '';
        const fuelName = fuelData ? (isBg ? fuelData.bg : fuelData.en) : '';
        const priceName = priceData ? (isBg ? priceData.label.bg : priceData.label.en) : '';

        let title = isBg ? 'Коли България' : 'Cars Bulgaria';
        let description = isBg
            ? 'Намерете идеалния автомобил в България'
            : 'Find your ideal car in Bulgaria';
        let h1 = title;

        if (cityName) {
            title = isBg
                ? `Коли в ${cityName} - Продажба на автомобили`
                : `Cars in ${cityName} - Buy & Sell Cars`;
            h1 = isBg ? `Коли в ${cityName}` : `Cars in ${cityName}`;
            description = isBg
                ? `Открийте над ${totalCount || 100}+ автомобила в ${cityName}. Частни лица, автосалони и компании.`
                : `Discover ${totalCount || 100}+ cars in ${cityName}. Private sellers, dealers, and companies.`;
        }

        if (brandName) {
            title = isBg
                ? `${brandName} в ${cityName} - Продажба`
                : `${brandName} in ${cityName} - For Sale`;
            h1 = isBg ? `${brandName} в ${cityName}` : `${brandName} in ${cityName}`;
            description = isBg
                ? `${brandName} автомобили в ${cityName}. Нови и употребявани ${brandName}.`
                : `${brandName} cars in ${cityName}. New and used ${brandName}.`;
        }

        if (fuelName && priceName) {
            title = isBg
                ? `${fuelName} коли ${priceName} в ${cityName}`
                : `${fuelName} cars ${priceName} in ${cityName}`;
            h1 = title;
            description = isBg
                ? `Намерете ${fuelName} автомобили ${priceName} в ${cityName}. Голям избор на цени!`
                : `Find ${fuelName} cars ${priceName} in ${cityName}. Great selection!`;
        }

        return { title: `${title} | Bulgarski Avtomobili`, description, h1 };
    };

    const seo = generateSEO();

    // Fetch cars based on filters
    useEffect(() => {
        const fetchCars = async () => {
            setLoading(true);
            try {
                let q = query(
                    collection(db, 'cars'),
                    where('isActive', '==', true),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                );

                // Note: Multiple where clauses need composite indexes
                // For now, we filter client-side for additional conditions

                const snapshot = await getDocs(q);
                let filteredCars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Client-side filtering
                if (cityData) {
                    filteredCars = filteredCars.filter(car =>
                        car.location?.toLowerCase().includes(cityData.bg.toLowerCase()) ||
                        car.city?.toLowerCase().includes(cityData.bg.toLowerCase())
                    );
                }

                if (params.brand) {
                    filteredCars = filteredCars.filter(car =>
                        car.make?.toLowerCase() === params.brand?.toLowerCase()
                    );
                }

                if (fuelData) {
                    filteredCars = filteredCars.filter(car =>
                        car.fuelType?.toLowerCase().includes(fuelData.bg.toLowerCase()) ||
                        car.fuelType?.toLowerCase().includes(fuelData.en.toLowerCase())
                    );
                }

                if (priceData) {
                    filteredCars = filteredCars.filter(car =>
                        (car.price || 0) <= priceData.max
                    );
                }

                setCars(filteredCars);
                setTotalCount(filteredCars.length);
            } catch (error) {
                logger.error('Error fetching location cars', error as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchCars();
    }, [params.city, params.brand, params.fuelType, params.priceRange]);

    // Generate schema
    const schema = SchemaGenerator.generateCollectionPageSchema({
        title: seo.title,
        description: seo.description,
        url: window.location.pathname,
        totalItems: totalCount,
        filters: {
            city: cityData?.en,
            make: params.brand,
            fuelType: fuelData?.en,
            priceMax: priceData?.max,
        },
    });

    return (
        <>
            <Helmet>
                <title>{seo.title}</title>
                <meta name="description" content={seo.description} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`https://mobilebg.eu${window.location.pathname}`} />
                <script type="application/ld+json">{JSON.stringify(schema)}</script>
            </Helmet>

            <PageContainer>
                <Header>
                    <Breadcrumbs>
                        <a href="/">{isBg ? 'Начало' : 'Home'}</a>
                        <span>/</span>
                        <a href="/cars">{isBg ? 'Коли' : 'Cars'}</a>
                        {cityData && (
                            <>
                                <span>/</span>
                                <span>{isBg ? cityData.bg : cityData.en}</span>
                            </>
                        )}
                        {params.brand && (
                            <>
                                <span>/</span>
                                <span>{params.brand}</span>
                            </>
                        )}
                    </Breadcrumbs>

                    <H1Tag>{seo.h1}</H1Tag>
                    <Description>{seo.description}</Description>

                    <FilterBadges>
                        {cityData && (
                            <Badge>
                                <MapPin size={14} />
                                {isBg ? cityData.bg : cityData.en}
                            </Badge>
                        )}
                        {params.brand && (
                            <Badge>
                                <Car size={14} />
                                {params.brand}
                            </Badge>
                        )}
                        {fuelData && (
                            <Badge>
                                <Fuel size={14} />
                                {isBg ? fuelData.bg : fuelData.en}
                            </Badge>
                        )}
                        {priceData && (
                            <Badge>
                                <DollarSign size={14} />
                                {isBg ? priceData.label.bg : priceData.label.en}
                            </Badge>
                        )}
                    </FilterBadges>

                    <ResultCount>
                        {totalCount} {isBg ? 'резултата' : 'results'}
                    </ResultCount>
                </Header>

                {loading ? (
                    <LoadingSpinner />
                ) : cars.length === 0 ? (
                    <EmptyState>
                        {isBg
                            ? 'Няма намерени автомобили с тези критерии.'
                            : 'No cars found matching these criteria.'}
                    </EmptyState>
                ) : (
                    <CarsGrid>
                        {cars.map(car => (
                            <CarCardGermanStyle key={car.id} car={car} />
                        ))}
                    </CarsGrid>
                )}
            </PageContainer>
        </>
    );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageContainer = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Breadcrumbs = styled.nav`
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;

  a {
    color: var(--accent-primary);
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

const H1Tag = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
`;

const FilterBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Badge = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border-radius: 20px;
  font-size: 0.875rem;
  color: var(--text-primary);
`;

const ResultCount = styled.div`
  font-size: 0.875rem;
  color: var(--text-tertiary);
`;

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: var(--text-secondary);
`;

export default LocationLandingPage;

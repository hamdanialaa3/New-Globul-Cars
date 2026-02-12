import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { Car, Gauge, Fuel, Settings } from 'lucide-react';
import * as S from '../styles/public-profile.styles';

interface CarsGridSectionProps {
    cars: any[];
    profileType: 'company' | 'dealer' | 'personal';
    sellerNumericId: number;
}

export const CarsGridSection: React.FC<CarsGridSectionProps> = ({
    cars,
    profileType,
    sellerNumericId,
}) => {
    const { language } = useLanguage();
    const navigate = useNavigate();

    const getGridColumns = () => {
        if (profileType === 'company') return 3;
        if (profileType === 'dealer') return 2;
        return 2;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(language === 'bg' ? 'bg-BG' : 'en-US', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const handleCarClick = (carNumericId: number) => {
        navigate(`/car/${sellerNumericId}/${carNumericId}`);
    };

    if (!cars || cars.length === 0) {
        return (
            <S.SectionCard $profileType={profileType}>
                <S.SectionTitle>
                    <Car size={20} />
                    {language === 'bg' ? 'Автомобили' : 'Vehicles'}
                </S.SectionTitle>
                <S.SectionContent>
                    <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0' }}>
                        {language === 'bg'
                            ? 'Няма налични автомобили в момента'
                            : 'No vehicles available at the moment'}
                    </p>
                </S.SectionContent>
            </S.SectionCard>
        );
    }

    return (
        <S.SectionCard $profileType={profileType}>
            <S.SectionTitle>
                <Car size={20} />
                {language === 'bg' ? 'Автомобили' : 'Vehicles'}
                <span style={{ marginLeft: 'auto', fontSize: '0.9rem', fontWeight: 'normal', color: '#6b7280' }}>
                    {cars.length} {language === 'bg' ? 'обяви' : 'listings'}
                </span>
            </S.SectionTitle>

            <S.CarsGrid $columns={getGridColumns()}>
                {cars.map((car) => (
                    <S.CarCard key={car.id} onClick={() => handleCarClick(car.numericId)}>
                        <S.CarImage
                            src={car.images?.[car.featuredImageIndex || 0] || car.images?.[0] || '/images/placeholder.png'}
                            alt={`${car.make} ${car.model}`}
                            onError={(e) => {
                                const img = e.currentTarget;
                                if (!img.dataset.errorHandled) {
                                    img.dataset.errorHandled = 'true';
                                    img.src = '/images/placeholder.png';
                                }
                            }}
                        />
                        <S.CarInfo>
                            <S.CarTitle>
                                {car.make} {car.model}
                            </S.CarTitle>
                            <S.CarPrice>{formatPrice(car.price)}</S.CarPrice>
                            <S.CarSpecs>
                                <S.CarSpec>
                                    <Gauge size={14} />
                                    {car.mileage?.toLocaleString()} km
                                </S.CarSpec>
                                <S.CarSpec>
                                    <Fuel size={14} />
                                    {car.fuelType}
                                </S.CarSpec>
                                <S.CarSpec>
                                    <Settings size={14} />
                                    {car.transmission}
                                </S.CarSpec>
                            </S.CarSpecs>
                        </S.CarInfo>
                    </S.CarCard>
                ))}
            </S.CarsGrid>
        </S.SectionCard>
    );
};

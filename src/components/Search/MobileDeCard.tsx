import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { Calendar, Fuel, Gauge, MapPin, Star } from 'lucide-react';

interface MobileDeCardProps {
    hit: any;
}

const MobileDeCard: React.FC<MobileDeCardProps> = ({ hit }) => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const isBg = language === 'bg';

    const handleClick = () => {
        const sellerNumericId = hit.sellerNumericId || hit.ownerNumericId;
        const carNumericId = hit.carNumericId || hit.userCarSequenceId || hit.numericId;

        if (sellerNumericId && carNumericId) {
            navigate(`/car/${sellerNumericId}/${carNumericId}`);
        } else {
            navigate('/cars');
        }
    };

    // Format price
    const price = hit.price ? `€${hit.price.toLocaleString()}` : 'Ask for Price';

    // Format attributes
    const firstRegistration = hit.firstRegistration || hit.year || '-';
    const mileage = hit.mileage ? `${hit.mileage.toLocaleString()} km` : '-';
    const power = hit.power ? `${hit.power} hp` : '-';
    const fuel = hit.fuelType || hit.fuel || '-';
    const transmission = hit.transmission || '-';

    return (
        <div className="mde-card" onClick={handleClick}>
            <div className="mde-card-image">
                <img
                    src={hit.images?.[0] || '/images/placeholder.png'}
                    alt={`${hit.make} ${hit.model}`}
                    loading="lazy"
                />
                {hit.condition === 'new' && (
                    <span className="mde-badge-new">{isBg ? 'НОВО' : 'NEW'}</span>
                )}
            </div>

            <div className="mde-card-content">
                <div className="mde-card-header">
                    <div>
                        <h2 className="mde-card-title">
                            {hit.make} {hit.model} {hit.variant || ''}
                        </h2>
                        <div className="mde-card-attributes">
                            <span className="mde-attr-item">
                                FR {firstRegistration}
                            </span>
                            <span className="mde-attr-item">•</span>
                            <span className="mde-attr-item">
                                {mileage}
                            </span>
                            <span className="mde-attr-item">•</span>
                            <span className="mde-attr-item">
                                {power}
                            </span>
                            <span className="mde-attr-item">•</span>
                            <span className="mde-attr-item">
                                {fuel}
                            </span>
                            <span className="mde-attr-item">•</span>
                            <span className="mde-attr-item">
                                {transmission}
                            </span>
                        </div>
                    </div>

                    <div className="mde-card-price">
                        {price}
                        <small>{isBg ? 'Крайна цена' : 'Gross'}</small>
                    </div>
                </div>

                <div className="mde-card-footer">
                    <div className="mde-location">
                        <MapPin size={14} />
                        {hit.location?.city || hit.locationData?.cityName || 'Sofia, BG'}
                    </div>

                    <div className="mde-rating">
                        <Star size={14} fill="#FFD700" color="#FFD700" />
                        <span>4.8 (12)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileDeCard;

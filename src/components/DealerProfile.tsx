import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { Building2, Mail, Phone, MapPin, Globe, Clock } from 'lucide-react';
import type { BulgarianUser } from '../types/user/bulgarian-user.types';
import type { ProfileCar } from '../pages/03_user-pages/profile/ProfilePage/types';

interface DealerProfileProps {
  user: BulgarianUser;
  userCars: ProfileCar[];
  isOwner: boolean;
}

const Container = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const Section = styled.div`
  background: rgba(22, 163, 74, 0.05);
  border: 1px solid rgba(22, 163, 74, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: #16a34a;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
`;

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const CarCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(22, 163, 74, 0.2);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #16a34a;
  }
`;

const CarImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;

const CarInfo = styled.div`
  padding: 1rem;
`;

const CarTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const CarPrice = styled.div`
  color: #16a34a;
  font-weight: 700;
  font-size: 1.1rem;
`;

const DealerProfile: React.FC<DealerProfileProps> = ({ user, userCars, isOwner }) => {
  const { language } = useLanguage();
  const dealerInfo = user.dealerSnapshot || (user as any).businessInfo;

  return (
    <Container>
      <Section>
        <SectionTitle><Building2 size={20} />{language === 'bg' ? 'Информация за дилъра' : 'Dealer Information'}</SectionTitle>
        <InfoGrid>
          {dealerInfo?.businessName && (
            <InfoItem>
              <Building2 size={16} />
              <span>{dealerInfo.businessName}</span>
            </InfoItem>
          )}
          {dealerInfo?.businessEmail && (
            <InfoItem>
              <Mail size={16} />
              <span>{dealerInfo.businessEmail}</span>
            </InfoItem>
          )}
          {dealerInfo?.businessPhone && (
            <InfoItem>
              <Phone size={16} />
              <span>{dealerInfo.businessPhone}</span>
            </InfoItem>
          )}
          {dealerInfo?.businessAddress && (
            <InfoItem>
              <MapPin size={16} />
              <span>{dealerInfo.businessAddress}, {dealerInfo.businessCity}</span>
            </InfoItem>
          )}
          {dealerInfo?.website && (
            <InfoItem>
              <Globe size={16} />
              <a href={dealerInfo.website} target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a' }}>
                {dealerInfo.website}
              </a>
            </InfoItem>
          )}
          {dealerInfo?.workingHours && (
            <InfoItem>
              <Clock size={16} />
              <span>{dealerInfo.workingHours}</span>
            </InfoItem>
          )}
        </InfoGrid>
      </Section>

      {dealerInfo?.businessDescription && (
        <Section>
          <SectionTitle>{language === 'bg' ? 'За дилъра' : 'About Dealer'}</SectionTitle>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>{dealerInfo.businessDescription}</p>
        </Section>
      )}

      {userCars && userCars.length > 0 && (
        <Section>
          <SectionTitle>{language === 'bg' ? 'Налични автомобили' : 'Available Cars'} ({userCars.length})</SectionTitle>
          <CarsGrid>
            {userCars.map(car => {
              // ✅ CONSTITUTION: Use numeric URL pattern
              const sellerNumericId = (car as any).sellerNumericId || (car as any).ownerNumericId;
              const carNumericId = (car as any).carNumericId || (car as any).userCarSequenceId || (car as any).numericId;
              const carUrl = sellerNumericId && carNumericId ? `/car/${sellerNumericId}/${carNumericId}` : '/cars';
              
              return (
              <CarCard key={car.id} onClick={() => window.location.href = carUrl}>
                <CarImage src={car.imageUrl || car.mainImage || '/placeholder-car.jpg'} alt={car.title} />
                <CarInfo>
                  <CarTitle>{car.make} {car.model}</CarTitle>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                    {car.year} • {car.mileage?.toLocaleString()} km
                  </div>
                  <CarPrice>{car.price?.toLocaleString()} €</CarPrice>
                </CarInfo>
              </CarCard>
            ))}
          </CarsGrid>
        </Section>
      )}
    </Container>
  );
};

export default DealerProfile;

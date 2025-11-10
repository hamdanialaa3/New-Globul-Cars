import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin, Calendar, User } from 'lucide-react';
import type { BulgarianUser } from '@/types/user/bulgarian-user.types';
import type { ProfileCar } from '@/pages/03_user-pages/profile/ProfilePage/types';

interface PrivateProfileProps {
  user: BulgarianUser;
  userCars: ProfileCar[];
  isOwner: boolean;
}

const Container = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: #FF7900;
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #FF7900;
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
  color: #FF7900;
  font-weight: 700;
  font-size: 1.1rem;
`;

const PrivateProfile: React.FC<PrivateProfileProps> = ({ user, userCars, isOwner }) => {
  const { language } = useLanguage();
  
  return (
    <Container>
      <Section>
        <SectionTitle><User size={20} />{language === 'bg' ? 'Лична информация' : 'Personal Information'}</SectionTitle>
        <InfoGrid>
          {user.email && (
            <InfoItem>
              <Mail size={16} />
              <span>{user.email}</span>
            </InfoItem>
          )}
          {user.phoneNumber && (
            <InfoItem>
              <Phone size={16} />
              <span>{user.phoneNumber}</span>
            </InfoItem>
          )}
          {user.location?.city && (
            <InfoItem>
              <MapPin size={16} />
              <span>{user.location.city}</span>
            </InfoItem>
          )}
          {user.createdAt && (
            <InfoItem>
              <Calendar size={16} />
              <span>{language === 'bg' ? 'Член от' : 'Member since'} {new Date(user.createdAt).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US')}</span>
            </InfoItem>
          )}
        </InfoGrid>
      </Section>

      {user.bio && (
        <Section>
          <SectionTitle>{language === 'bg' ? 'Биография' : 'Bio'}</SectionTitle>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>{user.bio}</p>
        </Section>
      )}

      {userCars && userCars.length > 0 && (
        <Section>
          <SectionTitle>{language === 'bg' ? 'Автомобили' : 'Cars'} ({userCars.length})</SectionTitle>
          <CarsGrid>
            {userCars.map(car => (
              <CarCard key={car.id} onClick={() => window.location.href = `/car/${car.id}`}>
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

export default PrivateProfile;

import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { Building2, Mail, Phone, MapPin, Globe, FileText } from 'lucide-react';
import type { BulgarianUser } from '../types/user/bulgarian-user.types';
import type { ProfileCar } from '../pages/03_user-pages/profile/ProfilePage/types';

interface CompanyProfileProps {
  user: BulgarianUser;
  userCars: ProfileCar[];
  isOwner: boolean;
}

const Container = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const Section = styled.div`
  background: rgba(29, 78, 216, 0.05);
  border: 1px solid rgba(29, 78, 216, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: #1d4ed8;
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
  border: 1px solid rgba(29, 78, 216, 0.2);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #1d4ed8;
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
  color: #1d4ed8;
  font-weight: 700;
  font-size: 1.1rem;
`;

const CompanyProfile: React.FC<CompanyProfileProps> = ({ user, userCars, isOwner }) => {
  const { language } = useLanguage();
  const companyInfo = user.companySnapshot || (user as any).businessInfo;

  return (
    <Container>
      <Section>
        <SectionTitle><Building2 size={20} />{language === 'bg' ? 'Информация за компанията' : 'Company Information'}</SectionTitle>
        <InfoGrid>
          {companyInfo?.businessName && (
            <InfoItem>
              <Building2 size={16} />
              <span>{companyInfo.businessName}</span>
            </InfoItem>
          )}
          {companyInfo?.bulstat && (
            <InfoItem>
              <FileText size={16} />
              <span>BULSTAT: {companyInfo.bulstat}</span>
            </InfoItem>
          )}
          {companyInfo?.vatNumber && (
            <InfoItem>
              <FileText size={16} />
              <span>VAT: {companyInfo.vatNumber}</span>
            </InfoItem>
          )}
          {companyInfo?.businessEmail && (
            <InfoItem>
              <Mail size={16} />
              <span>{companyInfo.businessEmail}</span>
            </InfoItem>
          )}
          {companyInfo?.businessPhone && (
            <InfoItem>
              <Phone size={16} />
              <span>{companyInfo.businessPhone}</span>
            </InfoItem>
          )}
          {companyInfo?.businessAddress && (
            <InfoItem>
              <MapPin size={16} />
              <span>{companyInfo.businessAddress}, {companyInfo.businessCity}</span>
            </InfoItem>
          )}
          {companyInfo?.website && (
            <InfoItem>
              <Globe size={16} />
              <a href={companyInfo.website} target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8' }}>
                {companyInfo.website}
              </a>
            </InfoItem>
          )}
        </InfoGrid>
      </Section>

      {companyInfo?.businessDescription && (
        <Section>
          <SectionTitle>{language === 'bg' ? 'За компанията' : 'About Company'}</SectionTitle>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>{companyInfo.businessDescription}</p>
        </Section>
      )}

      {userCars && userCars.length > 0 && (
        <Section>
          <SectionTitle>{language === 'bg' ? 'Автомобилен парк' : 'Car Fleet'} ({userCars.length})</SectionTitle>
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

export default CompanyProfile;

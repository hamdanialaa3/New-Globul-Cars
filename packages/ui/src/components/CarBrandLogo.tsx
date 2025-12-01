import React from 'react';
import styled from 'styled-components';
import { useTheme } from '@globul-cars/core/contexts/ThemeContext';

const LogoContainer = styled.div<{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: ${({ $isDark }) => ($isDark ? '#0b1220' : 'white')};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 0 auto 1rem;
  overflow: hidden;
`;

const LogoImage = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
`;

const BrandName = styled.div<{ $isDark?: boolean }>`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ $isDark }) => ($isDark ? '#e6eefa' : '#2c3e50')};
  text-align: center;
  margin-top: 0.5rem;
`;

interface CarBrandLogoProps {
  make: string;
  size?: number;
  showName?: boolean;
  className?: string;
}

const CarBrandLogo: React.FC<CarBrandLogoProps> = ({ 
  make, 
  size = 40, 
  showName = true,
  className 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Map of car makes to their logo paths
  const brandLogos: { [key: string]: string } = {
    'BMW': '/assets/images/professional_car_logos/BMW.png',
    'Mercedes-Benz': '/assets/images/professional_car_logos/Mercedes-Benz.png',
    'Audi': '/assets/images/professional_car_logos/Audi.png',
    'Volkswagen': '/assets/images/professional_car_logos/Volkswagen.png',
    'Toyota': '/assets/images/professional_car_logos/Toyota.png',
    'Honda': '/assets/images/professional_car_logos/Honda.png',
    'Nissan': '/assets/images/professional_car_logos/Nissan.png',
    'Hyundai': '/assets/images/professional_car_logos/Hyundai.png',
    'Kia': '/assets/images/professional_car_logos/Kia.png',
    'Ford': '/assets/images/professional_car_logos/Ford.png',
    'Chevrolet': '/assets/images/professional_car_logos/Chevrolet.png',
    'Opel': '/assets/images/professional_car_logos/Opel.png',
    'Peugeot': '/assets/images/professional_car_logos/Peugeot.png',
    'Renault': '/assets/images/professional_car_logos/Renault.png',
    'Citroën': '/assets/images/professional_car_logos/Citroën.png',
    'Fiat': '/assets/images/professional_car_logos/Fiat.png',
    'Alfa Romeo': '/assets/images/professional_car_logos/mein_logo_rest.png',
    'Lancia': '/assets/images/professional_car_logos/Lancia.png',
    'Mazda': '/assets/images/professional_car_logos/Mazda.png',
    'Mitsubishi': '/assets/images/professional_car_logos/Mitsubishi.png',
    'Subaru': '/assets/images/professional_car_logos/Subaru.png',
    'Suzuki': '/assets/images/professional_car_logos/Suzuki.png',
    'Daihatsu': '/assets/images/professional_car_logos/Daihatsu.png',
    'Lexus': '/assets/images/professional_car_logos/Lexus.png',
    'Infiniti': '/assets/images/professional_car_logos/Infiniti.png',
    'Acura': '/assets/images/professional_car_logos/Acura.png',
    'Genesis': '/assets/images/professional_car_logos/Genesis.png',
    'Volvo': '/assets/images/professional_car_logos/Volvo.png',
    'Saab': '/assets/images/professional_car_logos/Saab.png',
    'Jaguar': '/assets/images/professional_car_logos/Jaguar.png',
    'Land Rover': '/assets/images/professional_car_logos/Land Rover.png',
    'Range Rover': '/assets/images/professional_car_logos/Land Rover.png',
    'Mini': '/assets/images/professional_car_logos/Mini.png',
    'Smart': '/assets/images/professional_car_logos/Smart.png',
    'Porsche': '/assets/images/professional_car_logos/Porsche.png',
    'Ferrari': '/assets/images/professional_car_logos/Ferrari.png',
    'Lamborghini': '/assets/images/professional_car_logos/Lamborghini.png',
    'Maserati': '/assets/images/professional_car_logos/Maserati.png',
    'Bentley': '/assets/images/professional_car_logos/Bentley.png',
    'Rolls-Royce': '/assets/images/professional_car_logos/Rolls-Royce.png',
    'Aston Martin': '/assets/images/professional_car_logos/mein_logo_rest.png',
    'McLaren': '/assets/images/professional_car_logos/McLaren.png',
    'Bugatti': '/assets/images/professional_car_logos/Bugatti.png',
    'Koenigsegg': '/assets/images/professional_car_logos/Koenigsegg.png',
    'Pagani': '/assets/images/professional_car_logos/Pagani.png',
    'Lotus': '/assets/images/professional_car_logos/Lotus.png',
    'Caterham': '/assets/images/professional_car_logos/Caterham.png',
    'Morgan': '/assets/images/professional_car_logos/Morgan.png',
    'Noble': '/assets/images/professional_car_logos/Noble.png',
    'Ginetta': '/assets/images/professional_car_logos/Ginetta.png',
    'Ariel': '/assets/images/professional_car_logos/mein_logo_rest.png',
    'BAC': '/assets/images/professional_car_logos/mein_logo_rest.png',
    'Rimac': '/assets/images/professional_car_logos/mein_logo_rest.png',
    'Rimac Automobili': '/assets/images/professional_car_logos/mein_logo_rest.png',
    'Tesla': '/assets/images/professional_car_logos/Tesla.png',
    'Rivian': '/assets/images/professional_car_logos/Rivian.png',
    'Lucid': '/assets/images/professional_car_logos/mein_logo_rest.png',
    'Polestar': '/assets/images/professional_car_logos/Polestar.png',
    'NIO': '/assets/images/professional_car_logos/NIO.png',
    'BYD': '/assets/images/professional_car_logos/BYD.png',
    'Xpeng': '/assets/images/professional_car_logos/Xpeng.png',
    'Li Auto': '/assets/images/professional_car_logos/mein_logo_rest.png',
    'Great Wall': '/assets/images/professional_car_logos/mein_logo_rest.png',
    'Geely': '/assets/images/professional_car_logos/Geely.png',
    'Chery': '/assets/images/professional_car_logos/Chery.png',
    'JAC': '/assets/images/professional_car_logos/JAC.png',
    'Haval': '/assets/images/professional_car_logos/mein_logo_rest.png',
    'WEY': '/assets/images/professional_car_logos/mein_logo_rest.png',
    'Lynk & Co': '/assets/images/professional_car_logos/mein_logo_rest.png',
    'Dacia': '/assets/images/professional_car_logos/Dacia.png',
    'Skoda': '/assets/images/professional_car_logos/Skoda.png',
    'Seat': '/assets/images/professional_car_logos/SEAT.png',
    'Cupra': '/assets/images/professional_car_logos/Cupra.png',
    'SsangYong': '/assets/images/professional_car_logos/SsangYong.png',
    'Isuzu': '/assets/images/professional_car_logos/Isuzu.png',
    'UAZ': '/assets/images/professional_car_logos/mein_logo_rest.png',
    'Lada': '/assets/images/professional_car_logos/Lada.png',
    'GAZ': '/assets/images/professional_car_logos/GAZ.png',
    'ZAZ': '/assets/images/professional_car_logos/mein_logo_rest.png',
    'Tata': '/assets/images/professional_car_logos/Tata.png',
    'Mahindra': '/assets/images/professional_car_logos/Mahindra.png',
    'Maruti': '/assets/images/professional_car_logos/mein_logo_rest.png',
    'Proton': '/assets/images/professional_car_logos/Proton.png',
    'Perodua': '/assets/images/professional_car_logos/Perodua.png',
  };

  const logoPath = brandLogos[make] || '/assets/images/professional_car_logos/mein_logo_rest.png';

  return (
    <div className={className}>
      <LogoContainer $isDark={isDark}>
        <LogoImage 
          src={logoPath} 
          alt={make}
          onError={(e) => {
            // Fallback to a generic car icon if logo fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/assets/images/professional_car_logos/mein_logo_rest.png';
          }}
        />
      </LogoContainer>
      {showName && <BrandName $isDark={isDark}>{make}</BrandName>}
    </div>
  );
};

export default CarBrandLogo;

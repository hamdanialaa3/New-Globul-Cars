import React from 'react';
import styled from 'styled-components';

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: white;
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

const BrandName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
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
  // Map of car makes to their logo paths
  const brandLogos: { [key: string]: string } = {
    'BMW': '/assets/images/professional_car_logos_png/bmw.png',
    'Mercedes-Benz': '/assets/images/professional_car_logos_png/mercedes-benz.png',
    'Audi': '/assets/images/professional_car_logos_png/audi.png',
    'Volkswagen': '/assets/images/professional_car_logos_png/volkswagen.png',
    'Toyota': '/assets/images/professional_car_logos_png/toyota.png',
    'Honda': '/assets/images/professional_car_logos_png/honda.png',
    'Nissan': '/assets/images/professional_car_logos_png/nissan.png',
    'Hyundai': '/assets/images/professional_car_logos_png/hyundai.png',
    'Kia': '/assets/images/professional_car_logos_png/kia.png',
    'Ford': '/assets/images/professional_car_logos_png/ford.png',
    'Chevrolet': '/assets/images/professional_car_logos_png/chevrolet.png',
    'Opel': '/assets/images/professional_car_logos_png/opel.png',
    'Peugeot': '/assets/images/professional_car_logos_png/peugeot.png',
    'Renault': '/assets/images/professional_car_logos_png/renault.png',
    'Citroën': '/assets/images/professional_car_logos_png/citroen.png',
    'Fiat': '/assets/images/professional_car_logos_png/fiat.png',
    'Alfa Romeo': '/assets/images/professional_car_logos_png/alfa-romeo.png',
    'Lancia': '/assets/images/professional_car_logos_png/lancia.png',
    'Mazda': '/assets/images/professional_car_logos_png/mazda.png',
    'Mitsubishi': '/assets/images/professional_car_logos_png/mitsubishi.png',
    'Subaru': '/assets/images/professional_car_logos_png/subaru.png',
    'Suzuki': '/assets/images/professional_car_logos_png/suzuki.png',
    'Daihatsu': '/assets/images/professional_car_logos_png/daihatsu.png',
    'Lexus': '/assets/images/professional_car_logos_png/lexus.png',
    'Infiniti': '/assets/images/professional_car_logos_png/infiniti.png',
    'Acura': '/assets/images/professional_car_logos_png/acura.png',
    'Genesis': '/assets/images/professional_car_logos_png/genesis.png',
    'Volvo': '/assets/images/professional_car_logos_png/volvo.png',
    'Saab': '/assets/images/professional_car_logos_png/saab.png',
    'Jaguar': '/assets/images/professional_car_logos_png/jaguar.png',
    'Land Rover': '/assets/images/professional_car_logos_png/land-rover.png',
    'Range Rover': '/assets/images/professional_car_logos_png/range-rover.png',
    'Mini': '/assets/images/professional_car_logos_png/mini.png',
    'Smart': '/assets/images/professional_car_logos_png/smart.png',
    'Porsche': '/assets/images/professional_car_logos_png/porsche.png',
    'Ferrari': '/assets/images/professional_car_logos_png/ferrari.png',
    'Lamborghini': '/assets/images/professional_car_logos_png/lamborghini.png',
    'Maserati': '/assets/images/professional_car_logos_png/maserati.png',
    'Bentley': '/assets/images/professional_car_logos_png/bentley.png',
    'Rolls-Royce': '/assets/images/professional_car_logos_png/rolls-royce.png',
    'Aston Martin': '/assets/images/professional_car_logos_png/aston-martin.png',
    'McLaren': '/assets/images/professional_car_logos_png/mclaren.png',
    'Bugatti': '/assets/images/professional_car_logos_png/bugatti.png',
    'Koenigsegg': '/assets/images/professional_car_logos_png/koenigsegg.png',
    'Pagani': '/assets/images/professional_car_logos_png/pagani.png',
    'Lotus': '/assets/images/professional_car_logos_png/lotus.png',
    'Caterham': '/assets/images/professional_car_logos_png/caterham.png',
    'Morgan': '/assets/images/professional_car_logos_png/morgan.png',
    'Noble': '/assets/images/professional_car_logos_png/noble.png',
    'Ginetta': '/assets/images/professional_car_logos_png/ginetta.png',
    'Ariel': '/assets/images/professional_car_logos_png/ariel.png',
    'BAC': '/assets/images/professional_car_logos_png/bac.png',
    'Rimac': '/assets/images/professional_car_logos_png/rimac.png',
    'Rimac Automobili': '/assets/images/professional_car_logos_png/rimac.png',
    'Tesla': '/assets/images/professional_car_logos_png/tesla.png',
    'Rivian': '/assets/images/professional_car_logos_png/rivian.png',
    'Lucid': '/assets/images/professional_car_logos_png/lucid.png',
    'Polestar': '/assets/images/professional_car_logos_png/polestar.png',
    'NIO': '/assets/images/professional_car_logos_png/nio.png',
    'BYD': '/assets/images/professional_car_logos_png/byd.png',
    'Xpeng': '/assets/images/professional_car_logos_png/xpeng.png',
    'Li Auto': '/assets/images/professional_car_logos_png/li-auto.png',
    'Great Wall': '/assets/images/professional_car_logos_png/great-wall.png',
    'Geely': '/assets/images/professional_car_logos_png/geely.png',
    'Chery': '/assets/images/professional_car_logos_png/chery.png',
    'JAC': '/assets/images/professional_car_logos_png/jac.png',
    'Haval': '/assets/images/professional_car_logos_png/haval.png',
    'WEY': '/assets/images/professional_car_logos_png/wey.png',
    'Lynk & Co': '/assets/images/professional_car_logos_png/lynk-co.png',
    'Dacia': '/assets/images/professional_car_logos_png/dacia.png',
    'Skoda': '/assets/images/professional_car_logos_png/skoda.png',
    'Seat': '/assets/images/professional_car_logos_png/seat.png',
    'Cupra': '/assets/images/professional_car_logos_png/cupra.png',
    'SsangYong': '/assets/images/professional_car_logos_png/ssangyong.png',
    'Isuzu': '/assets/images/professional_car_logos_png/isuzu.png',
    'UAZ': '/assets/images/professional_car_logos_png/uaz.png',
    'Lada': '/assets/images/professional_car_logos_png/lada.png',
    'GAZ': '/assets/images/professional_car_logos_png/gaz.png',
    'ZAZ': '/assets/images/professional_car_logos_png/zaz.png',
    'Tata': '/assets/images/professional_car_logos_png/tata.png',
    'Mahindra': '/assets/images/professional_car_logos_png/mahindra.png',
    'Maruti': '/assets/images/professional_car_logos_png/maruti.png',
    'Proton': '/assets/images/professional_car_logos_png/proton.png',
    'Perodua': '/assets/images/professional_car_logos_png/perodua.png',
  };

  const logoPath = brandLogos[make] || '/assets/images/professional_car_logos_png/other.png';

  return (
    <div className={className}>
      <LogoContainer>
        <LogoImage 
          src={logoPath} 
          alt={make}
          onError={(e) => {
            // Fallback to a generic car icon if logo fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/assets/images/professional_car_logos_png/other.png';
          }}
        />
      </LogoContainer>
      {showName && <BrandName>{make}</BrandName>}
    </div>
  );
};

export default CarBrandLogo;

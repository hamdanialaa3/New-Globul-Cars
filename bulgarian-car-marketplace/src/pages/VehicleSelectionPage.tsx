import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Search, Car } from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%);
  padding: 20px;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  gap: 20px;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 215, 0, 0.2);
    border-color: #ffd700;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
`;

const StepIndicator = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const Step = styled.div<{ active?: boolean; completed?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  ${props => props.completed && `
    background: #ffd700;
    color: #1a1a2e;
  `}
  
  ${props => props.active && !props.completed && `
    background: rgba(255, 215, 0, 0.2);
    border: 2px solid #ffd700;
    color: #ffd700;
  `}
  
  ${props => !props.active && !props.completed && `
    background: rgba(255, 255, 255, 0.1);
    color: #94a3b8;
  `}
`;

const SearchSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 40px;
`;

const SearchTitle = styled.h2`
  color: #ffffff;
  font-size: 1.5rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 15px 20px;
  color: #ffffff;
  font-size: 1.1rem;
  margin-bottom: 20px;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #ffd700;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
  }
`;

const BrandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
`;

const BrandCard = styled.div<{ selected?: boolean }>`
  background: ${props => props.selected 
    ? 'linear-gradient(135deg, #ffd700, #ffed4a)' 
    : 'rgba(255, 255, 255, 0.05)'};
  border: 2px solid ${props => props.selected ? '#ffd700' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover {
    transform: translateY(-2px);
    border-color: #ffd700;
    background: ${props => props.selected 
      ? 'linear-gradient(135deg, #ffd700, #ffed4a)' 
      : 'rgba(255, 215, 0, 0.1)'};
  }

  .brand-logo {
    width: 50px;
    height: 50px;
    background: ${props => props.selected ? '#1a1a2e' : '#ffd700'};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 15px;
    font-weight: bold;
    color: ${props => props.selected ? '#ffd700' : '#1a1a2e'};
    font-size: 1rem;
  }

  .brand-name {
    font-weight: bold;
    color: ${props => props.selected ? '#1a1a2e' : '#ffffff'};
    font-size: 1rem;
  }
`;

const ContinueButton = styled.button<{ disabled?: boolean }>`
  background: ${props => props.disabled 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'linear-gradient(135deg, #ffd700, #ffed4a)'};
  color: ${props => props.disabled ? '#94a3b8' : '#1a1a2e'};
  border: none;
  padding: 18px 40px;
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  margin-top: 40px;
  display: block;
  margin-left: auto;
  margin-right: auto;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 215, 0, 0.3);
  }
`;

const VehicleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [searchTerm, setSearchTerm] = useState('');

  const brands = [
    'Audi', 'BMW', 'Mercedes', 'VW', 'Ford', 'Opel',
    'Peugeot', 'Renault', 'Toyota', 'Nissan', 'Honda', 'Hyundai',
    'Kia', 'Skoda', 'Seat', 'Citroen', 'Fiat', 'Alfa Romeo',
    'Volvo', 'Saab', 'Mitsubishi', 'Mazda', 'Subaru', 'Lexus'
  ];

  const filteredBrands = brands.filter(brand =>
    brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
  };

  const handleContinue = () => {
    if (selectedBrand) {
      navigate(`/sell/seller-type?brand=${selectedBrand}`);
    }
  };

  const handleBack = () => {
    navigate('/sell');
  };

  return (
    <Container>
      <Content>
        <Header>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={20} />
          </BackButton>
          <Title>Избери Марката на Колата</Title>
        </Header>

        <StepIndicator>
          <Step active>1</Step>
          <Step>2</Step>
          <Step>3</Step>
          <Step>4</Step>
          <Step>5</Step>
          <Step>6</Step>
          <Step>7</Step>
        </StepIndicator>

        <SearchSection>
          <SearchTitle>
            <Search size={24} />
            Търси или избери марка
          </SearchTitle>
          
          <SearchInput
            type="text"
            placeholder="Започни да пишеш името на марката..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <BrandGrid>
            {filteredBrands.map((brand) => (
              <BrandCard
                key={brand}
                selected={selectedBrand === brand}
                onClick={() => handleBrandSelect(brand)}
              >
                <div className="brand-logo">
                  {brand.slice(0, 2).toUpperCase()}
                </div>
                <div className="brand-name">{brand}</div>
              </BrandCard>
            ))}
          </BrandGrid>
        </SearchSection>

        <ContinueButton
          disabled={!selectedBrand}
          onClick={handleContinue}
        >
          Продължи с {selectedBrand || 'избраната марка'}
        </ContinueButton>
      </Content>
    </Container>
  );
};

export default VehicleSelectionPage;
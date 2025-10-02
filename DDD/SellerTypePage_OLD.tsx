import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, User, Building, CheckCircle } from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%);
  padding: 20px;
`;

const Content = styled.div`
  max-width: 800px;
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

const SelectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
`;

const SellerCard = styled.div<{ selected?: boolean }>`
  background: ${props => props.selected 
    ? 'rgba(255, 215, 0, 0.1)' 
    : 'rgba(255, 255, 255, 0.03)'};
  backdrop-filter: blur(20px);
  border: 2px solid ${props => props.selected ? '#ffd700' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 20px;
  padding: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    border-color: #ffd700;
    box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
  }

  ${props => props.selected && `
    &::after {
      content: '';
      position: absolute;
      top: 20px;
      right: 20px;
      width: 30px;
      height: 30px;
      background: #ffd700;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `}
`;

const SellerIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #1a1a2e;
  font-size: 2rem;
`;

const SellerTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 15px;
`;

const SellerDescription = styled.p`
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 1.1rem;
`;

const SellerFeatures = styled.ul`
  list-style: none;
  padding: 0;
  text-align: left;

  li {
    color: #e2e8f0;
    padding: 8px 0;
    padding-left: 25px;
    position: relative;

    &::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #ffd700;
      font-weight: bold;
    }
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
  display: block;
  margin-left: auto;
  margin-right: auto;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 215, 0, 0.3);
  }
`;

const InfoText = styled.p`
  text-align: center;
  color: #94a3b8;
  font-size: 1rem;
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

type SellerType = 'private' | 'dealer' | null;

const SellerTypePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sellerType, setSellerType] = useState<SellerType>(null);
  
  const brand = searchParams.get('brand') || '';

  const handleSellerSelect = (type: SellerType) => {
    setSellerType(type);
  };

  const handleContinue = () => {
    if (sellerType && brand) {
      navigate(`/sell/vehicle-data?brand=${brand}&seller=${sellerType}`);
    }
  };

  const handleBack = () => {
    navigate(`/sell/vehicle-selection?brand=${brand}`);
  };

  return (
    <Container>
      <Content>
        <Header>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={20} />
          </BackButton>
          <Title>Тип на Продавача</Title>
        </Header>

        <StepIndicator>
          <Step completed>1</Step>
          <Step active>2</Step>
          <Step>3</Step>
          <Step>4</Step>
          <Step>5</Step>
          <Step>6</Step>
          <Step>7</Step>
        </StepIndicator>

        <InfoText>
          Моля, уточни дали продаваш като частно лице или като търговец. Това ще ни помогне да 
          персонализираме процеса според твоите нужди.
        </InfoText>

        <SelectionGrid>
          <SellerCard
            selected={sellerType === 'private'}
            onClick={() => handleSellerSelect('private')}
          >
            <SellerIcon>
              <User />
            </SellerIcon>
            <SellerTitle>Частно Лице</SellerTitle>
            <SellerDescription>
              Продавам лично използвана кола като частно лице
            </SellerDescription>
            <SellerFeatures>
              <li>Без ДДС</li>
              <li>Опростен процес</li>
              <li>Безплатна обява</li>
              <li>Помощ при сделката</li>
            </SellerFeatures>
          </SellerCard>

          <SellerCard
            selected={sellerType === 'dealer'}
            onClick={() => handleSellerSelect('dealer')}
          >
            <SellerIcon>
              <Building />
            </SellerIcon>
            <SellerTitle>Търговец</SellerTitle>
            <SellerDescription>
              Продавам като автокъща, салон или търговец на автомобили
            </SellerDescription>
            <SellerFeatures>
              <li>Професионални инструменти</li>
              <li>Множество обяви</li>
              <li>Статистики и анализи</li>
              <li>Приоритетна поддръжка</li>
            </SellerFeatures>
          </SellerCard>
        </SelectionGrid>

        <ContinueButton
          disabled={!sellerType}
          onClick={handleContinue}
        >
          Продължи като {sellerType === 'private' ? 'Частно Лице' : sellerType === 'dealer' ? 'Търговец' : '...'}
        </ContinueButton>
      </Content>
    </Container>
  );
};

export default SellerTypePage;
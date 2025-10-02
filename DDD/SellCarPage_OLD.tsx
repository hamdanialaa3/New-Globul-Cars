import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Car, Plus, TrendingUp, ArrowRight, Info } from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%);
  padding: 20px;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Hero = styled.div`
  text-align: center;
  margin-bottom: 50px;
  padding: 40px 20px;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4a 50%, #f7b731 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #e2e8f0;
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const Stats = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 40px 0;
  flex-wrap: wrap;
`;

const Stat = styled.div`
  text-align: center;
  
  .number {
    font-size: 2.5rem;
    font-weight: bold;
    color: #ffd700;
    display: block;
  }
  
  .label {
    color: #94a3b8;
    font-size: 0.9rem;
    margin-top: 5px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin: 50px 0;
`;

const Card = styled.div<{ featured?: boolean }>`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 2px solid ${props => props.featured ? '#ffd700' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 20px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
    border-color: #ffd700;
  }
`;

const Icon = styled.div`
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: #1a1a2e;
  font-size: 1.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 15px;
`;

const CardDesc = styled.p`
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const Button = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  color: #1a1a2e;
  border: none;
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 215, 0, 0.3);
  }
`;

const SellCarPage = () => {
  const navigate = useNavigate();

  const handleStartListing = () => {
    navigate('/sell/vehicle-selection');
  };

  const handleInstantSale = () => {
    navigate('/sell/instant-evaluation');
  };

  return (
    <Container>
      <Content>
        <Hero>
          <Title>Продай Автомобила си</Title>
          <Subtitle>Професионална платформа за продажба на автомобили в България</Subtitle>
          
          <Stats>
            <Stat>
              <span className="number">50K+</span>
              <span className="label">Купувачи месечно</span>
            </Stat>
            <Stat>
              <span className="number">15K+</span>
              <span className="label">Продадени коли</span>
            </Stat>
            <Stat>
              <span className="number">4.8</span>
              <span className="label">Рейтинг</span>
            </Stat>
          </Stats>
        </Hero>

        <Grid>
          <Card featured>
            <Icon>
              <Plus />
            </Icon>
            <CardTitle>Създай Обява</CardTitle>
            <CardDesc>Създай професионална обява и достигни до хиляди купувачи</CardDesc>
            <Button onClick={handleStartListing}>
              Започни Обява
              <ArrowRight size={20} />
            </Button>
          </Card>

          <Card>
            <Icon>
              <TrendingUp />
            </Icon>
            <CardTitle>Бърза Продажба</CardTitle>
            <CardDesc>Продай веднага на търговци със гарантирана цена</CardDesc>
            <Button onClick={handleInstantSale}>
              Получи Цена
              <ArrowRight size={20} />
            </Button>
          </Card>
        </Grid>
      </Content>
    </Container>
  );
};

export default SellCarPage;

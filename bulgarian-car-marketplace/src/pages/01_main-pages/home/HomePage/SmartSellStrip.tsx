import React from 'react';
import styled from 'styled-components';
import { Zap, ArrowRight, CheckCircle } from 'lucide-react';

const Container = styled.div`
  padding: 40px 20px;
  background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 16px;
  margin: 20px;
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.2);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 24px;
    padding: 30px 20px;
  }
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    justify-content: center;
    font-size: 1.5rem;
  }
`;

const Description = styled.p`
  font-size: 1.125rem;
  opacity: 0.9;
  max-width: 600px;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: white;
  color: #4f46e5;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const SmartSellStrip: React.FC = () => {
    return (
        <Container>
            <Content>
                <Title>
                    <Zap size={28} fill="white" />
                    Продайте автомобила си бързо {/* Sell your car fast */}
                </Title>
                <Description>
                    Използвайте нашия интелигентен асистент за оценка и публикуване на обява само за 2 минути.
                    {/* Use our intelligent assistant to value and post an ad in just 2 minutes. */}
                </Description>
            </Content>
            <Button>
                Започни продажба {/* Start Selling */}
                <ArrowRight size={20} />
            </Button>
        </Container>
    );
};

export default SmartSellStrip;

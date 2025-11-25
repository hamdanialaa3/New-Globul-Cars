import React from 'react';
import styled from 'styled-components';
import { BarChart2, PieChart, TrendingUp, ArrowRight } from 'lucide-react';

const Container = styled.section`
  padding: 80px 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 24px;
  margin: 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: #0ea5e9;
  margin-bottom: 20px;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #475569;
  margin-bottom: 40px;
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
`;

const Feature = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(14, 165, 233, 0.15);
  color: #0ea5e9;
`;

const FeatureTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: #0ea5e9;
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);

  &:hover {
    background: #0284c7;
    transform: translateY(-2px);
  }
`;

const AIAnalyticsTeaser: React.FC = () => {
    return (
        <Container>
            <Content>
                <Title>AI Пазарен Анализ</Title> {/* AI Market Analysis */}
                <Subtitle>
                    Вземете информирани решения с нашите усъвършенствани инструменти за анализ.
                    Следете ценовите тенденции и пазарното търсене в реално време.
                    {/* Make informed decisions with our advanced analysis tools. Track price trends and market demand in real-time. */}
                </Subtitle>

                <FeaturesGrid>
                    <Feature>
                        <IconWrapper><BarChart2 size={28} /></IconWrapper>
                        <FeatureTitle>Ценови тенденции</FeatureTitle> {/* Price Trends */}
                    </Feature>
                    <Feature>
                        <IconWrapper><PieChart size={28} /></IconWrapper>
                        <FeatureTitle>Пазарен дял</FeatureTitle> {/* Market Share */}
                    </Feature>
                    <Feature>
                        <IconWrapper><TrendingUp size={28} /></IconWrapper>
                        <FeatureTitle>Прогнози</FeatureTitle> {/* Forecasts */}
                    </Feature>
                </FeaturesGrid>

                <Button>
                    Разгледай анализите {/* View Analytics */}
                    <ArrowRight size={20} />
                </Button>
            </Content>
        </Container>
    );
};

export default AIAnalyticsTeaser;

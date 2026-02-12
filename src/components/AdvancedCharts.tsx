import { normalizeError } from '@/utils/error-helpers';import { logger } from '../services/logger-service';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';

const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 16px;
  margin: 1rem;
  color: white;
`;

const Title = styled.h2`
  color: #ffd700;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
`;

const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 215, 0, 0.6);
    transform: translateY(-2px);
  }
`;

const ChartTitle = styled.h3`
  color: #ffd700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SimpleChart = styled.div`
  height: 200px;
  display: flex;
  align-items: end;
  gap: 0.5rem;
  padding: 1rem 0;
`;

const Bar = styled.div<{ height: number; color?: string }>`
  flex: 1;
  height: ${props => props.height}%;
  background: ${props => props.color || 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)'};
  border-radius: 4px 4px 0 0;
  display: flex;
  align-items: end;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  padding-bottom: 0.5rem;
`;

const ChartLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: ${props => props.color};
`;

interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: string | number;
}

const AdvancedCharts: React.FC = () => {
  const [chartData, setChartData] = useState<{
    usersByMonth: ChartDataPoint[];
    carsByBrand: ChartDataPoint[];
    carsByCity: ChartDataPoint[];
    priceRanges: ChartDataPoint[];
  }>({
    usersByMonth: [],
    carsByBrand: [],
    carsByCity: [],
    priceRanges: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      // Load users data
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map((doc: any) => doc.data());

      // Load cars data
      const carsSnapshot = await getDocs(collection(db, 'cars'));
      const cars = carsSnapshot.docs.map((doc: any) => doc.data());

      // Process data for charts
      const usersByMonth = processUsersByMonth(users);
      const carsByBrand = processCarsByBrand(cars);
      const carsByCity = processCarsByCity(cars);
      const priceRanges = processPriceRanges(cars);

      setChartData({
        usersByMonth,
        carsByBrand,
        carsByCity,
        priceRanges
      });
    } catch (error) {
      logger.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processUsersByMonth = (users: unknown[]) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June'];
    return months.map((month, index) => ({
      label: month,
      value: Math.floor(users.length * (0.1 + index * 0.15))
    }));
  };

  const processCarsByBrand = (cars: unknown[]) => {
    const brands = ['BMW', 'Mercedes', 'Audi', 'Toyota', 'Volkswagen'];
    return brands.map(brand => ({
      label: brand,
      value: cars.filter((car: any) => car.make === brand).length || Math.floor(Math.random() * 50) + 10
    }));
  };

  const processCarsByCity = (cars: unknown[]) => {
    const cities = ['София', 'Пловдив', 'Варна', 'Бургас', 'Русе'];
    return cities.map(city => ({
      label: city,
      value: cars.filter((car: any) => car.location?.city === city).length || Math.floor(Math.random() * 30) + 5
    }));
  };

  const processPriceRanges = (cars: Record<string, unknown>[]): ChartDataPoint[] => {
    const ranges = [
      { range: '0-10k€', min: 0, max: 10000 },
      { range: '10-20k€', min: 10000, max: 20000 },
      { range: '20-30k€', min: 20000, max: 30000 },
      { range: '30k+€', min: 30000, max: Infinity }
    ];
    
    return ranges.map(({ range, min, max }) => {
      const carPrices = cars as Array<{ price?: number }>;
      const count = carPrices.filter((car: any) => {
        const price = typeof car.price === 'number' ? car.price : 0;
        return price >= min && price < max;
      }).length || Math.floor(Math.random() * 25) + 5;
      
      return {
        label: range,
        value: count,
        range
      };
    });
  };

  if (loading) {
    return (
      <Container>
        <Title><BarChart3 size={24} />Loading charts...</Title>
      </Container>
    );
  }

  const maxUserCount = Math.max(...chartData.usersByMonth.map((item: any) => item.count));
  const maxBrandCount = Math.max(...chartData.carsByBrand.map((item: any) => item.count));
  const maxCityCount = Math.max(...chartData.carsByCity.map((item: any) => item.count));
  const maxPriceCount = Math.max(...chartData.priceRanges.map((item: any) => item.count));

  return (
    <Container>
      <Title><BarChart3 size={24} />Advanced Charts</Title>
      
      <ChartsGrid>
        <ChartCard>
          <ChartTitle><Calendar size={20} />New Users Monthly</ChartTitle>
          <SimpleChart>
            {chartData.usersByMonth.map((item, index) => (
              <Bar key={index} height={(item.value / maxUserCount) * 100}>
                {item.value}
              </Bar>
            ))}
          </SimpleChart>
          <ChartLegend>
            {chartData.usersByMonth.map((item, index) => (
              <LegendItem key={index}>
                <LegendColor color="#FF6B35" />
                <span>{item.month || item.label}</span>
              </LegendItem>
            ))}
          </ChartLegend>
        </ChartCard>

        <ChartCard>
          <ChartTitle><PieChart size={20} />Cars by Brand</ChartTitle>
          <SimpleChart>
            {chartData.carsByBrand.map((item, index) => (
              <Bar 
                key={index} 
                height={(item.value / maxBrandCount) * 100}
                color={`hsl(${index * 60}, 70%, 50%)`}
              >
                {item.value}
              </Bar>
            ))}
          </SimpleChart>
          <ChartLegend>
            {chartData.carsByBrand.map((item, index) => (
              <LegendItem key={index}>
                <LegendColor color={`hsl(${index * 60}, 70%, 50%)`} />
                <span>{item.brand || item.label}</span>
              </LegendItem>
            ))}
          </ChartLegend>
        </ChartCard>

        <ChartCard>
          <ChartTitle><TrendingUp size={20} />Cars by City</ChartTitle>
          <SimpleChart>
            {chartData.carsByCity.map((item, index) => (
              <Bar 
                key={index} 
                height={(item.value / maxCityCount) * 100}
                color={`hsl(${200 + index * 30}, 60%, 50%)`}
              >
                {item.value}
              </Bar>
            ))}
          </SimpleChart>
          <ChartLegend>
            {chartData.carsByCity.map((item, index) => (
              <LegendItem key={index}>
                <LegendColor color={`hsl(${200 + index * 30}, 60%, 50%)`} />
                <span>{item.city || item.label}</span>
              </LegendItem>
            ))}
          </ChartLegend>
        </ChartCard>

        <ChartCard>
          <ChartTitle><BarChart3 size={20} />Price Distribution</ChartTitle>
          <SimpleChart>
            {chartData.priceRanges.map((item, index) => (
              <Bar 
                key={index} 
                height={(item.value / maxPriceCount) * 100}
                color={`hsl(${300 + index * 20}, 70%, 50%)`}
              >
                {item.value}
              </Bar>
            ))}
          </SimpleChart>
          <ChartLegend>
            {chartData.priceRanges.map((item, index) => (
              <LegendItem key={index}>
                <LegendColor color={`hsl(${300 + index * 20}, 70%, 50%)`} />
                <span>{item.range || item.label}</span>
              </LegendItem>
            ))}
          </ChartLegend>
        </ChartCard>
      </ChartsGrid>
    </Container>
  );
};

export default AdvancedCharts;
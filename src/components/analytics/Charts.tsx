// src/components/analytics/Charts.tsx
// Chart components for B2B Analytics Portal

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface PriceData {
  city: string;
  averagePrice: number;
  sampleSize: number;
  locationData?: {
    city?: string;
    province?: string;
  };
}

interface TrendData {
  make: string;
  model: string;
  searchCount: number;
  averagePrice: number;
}

interface SalesData {
  hour: number;
  salesCount: number;
  averagePrice: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface RegionalPriceChartProps {
  data: PriceData[];
}

export const RegionalPriceChart: React.FC<RegionalPriceChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="city"
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
        />
        <YAxis
          tickFormatter={formatCurrency}
          fontSize={12}
        />
        <Tooltip
          formatter={((value: number | undefined) => [formatCurrency(value || 0), 'Средна цена']) as any}
          labelStyle={{ color: '#000' }}
        />
        <Legend />
        <Bar
          dataKey="averagePrice"
          fill="#8884d8"
          name="Средна цена (€)"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface MarketTrendsChartProps {
  data: TrendData[];
}

export const MarketTrendsChart: React.FC<MarketTrendsChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" fontSize={12} />
        <YAxis
          dataKey="model"
          type="category"
          width={100}
          fontSize={12}
        />
        <Tooltip
          formatter={((value: number | string, name: string): [string, string] => {
            const numValue = typeof value === 'number' ? value : 0;
            return [
              name === 'searchCount' ? `${numValue} търсения` : String(value),
              name === 'searchCount' ? 'Търсения' : 'Средна цена'
            ];
          }) as any}
          labelStyle={{ color: '#000' }}
        />
        <Legend />
        <Bar dataKey="searchCount" fill="#82ca9d" name="Търсения" />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface SalesPeakChartProps {
  data: SalesData[];
}

export const SalesPeakChart: React.FC<SalesPeakChartProps> = ({ data }) => {
  const formatHour = (hour: number) => {
    return `${hour}:00`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="hour"
          tickFormatter={formatHour}
          fontSize={12}
        />
        <YAxis fontSize={12} />
        <Tooltip
          formatter={((value: number | string, name: string): [string, string] => {
            const numValue = typeof value === 'number' ? value : 0;
            return [
              name === 'salesCount' ? `${numValue} продажби` : String(value),
              name === 'salesCount' ? 'Продажби' : 'Средна цена'
            ];
          }) as any}
          labelFormatter={(hour) => `Час: ${formatHour(hour)}`}
          labelStyle={{ color: '#000' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="salesCount"
          stroke="#8884d8"
          strokeWidth={3}
          name="Брой продажби"
          dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

interface PriceDistributionProps {
  data: PriceData[];
}

export const PriceDistributionChart: React.FC<PriceDistributionProps> = ({ data }) => {
  const pieData = data.map((item, index) => ({
    name: item.locationData?.city,
    value: item.sampleSize,
    price: item.averagePrice
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={((value: number | string, name: string): [string, string] => {
            const numValue = typeof value === 'number' ? value : 0;
            return [`${numValue} обяви`, String(name)];
          }) as any}
          labelStyle={{ color: '#000' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

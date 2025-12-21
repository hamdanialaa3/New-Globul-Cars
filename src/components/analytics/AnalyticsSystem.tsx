import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { useTranslation } from '../../hooks/useTranslation';

interface AnalyticsData {
  period: string;
  value: number;
  label?: string;
  color?: string;
}

interface AnalyticsMetric {
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
}

interface AnalyticsSystemProps {
  data?: AnalyticsData[];
  metrics?: AnalyticsMetric[];
  type?: 'bar' | 'line' | 'pie' | 'area';
  title?: string;
  subtitle?: string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onDataPointClick?: (data: unknown) => void;
}

const AnalyticsSystemContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const AnalyticsSystemHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const AnalyticsSystemTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const AnalyticsSystemSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const AnalyticsSystemMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const AnalyticsSystemMetric = styled.div`
  background: ${({ theme }) => theme.colors.grey[50]};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const AnalyticsSystemMetricTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AnalyticsSystemMetricValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const AnalyticsSystemMetricChange = styled.div<{ changeType: 'positive' | 'negative' | 'neutral' }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, changeType }) => {
    switch (changeType) {
      case 'positive': return theme.colors.success.main;
      case 'negative': return theme.colors.error.main;
      case 'neutral': return theme.colors.text.secondary;
      default: return theme.colors.text.secondary;
    }
  }};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const AnalyticsSystemChart = styled.div<{ height: number }>`
  height: ${({ height }) => height}px;
  width: 100%;
`;

const AnalyticsSystemEmpty = styled.div<{ height: number }>`
  height: ${({ height }) => height}px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px dashed ${({ theme }) => theme.colors.grey[300]};
`;

const AnalyticsSystem: React.FC<AnalyticsSystemProps> = ({
  data = [],
  metrics = [],
  type = 'bar',
  title = 'Analytics',
  subtitle,
  height = 300,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  className,
  style,
  onDataPointClick,
}) => {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState<AnalyticsData[]>(data);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  const formatValue = (value: string | number, format?: string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('bg-BG', {
          style: 'currency',
          currency: 'EUR',
        }).format(value);
      case 'percentage':
        return `${value}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('bg-BG').format(value);
    }
  };

  const getChangeIcon = (changeType: 'positive' | 'negative' | 'neutral') => {
    switch (changeType) {
      case 'positive':
        return '↗';
      case 'negative':
        return '↘';
      case 'neutral':
      default:
        return '→';
    }
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <AnalyticsSystemEmpty height={height}>
          {t('analytics.noData', 'No data available')}
        </AnalyticsSystemEmpty>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="period" />
              <YAxis />
              {showTooltip && <Tooltip />}
              {showLegend && <Bar dataKey="value" fill="#8884d8" />}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="period" />
              <YAxis />
              {showTooltip && <Tooltip />}
              {showLegend && <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData as any}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: Record<string, unknown>) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || `#${Math.floor(Math.random()*16777215).toString(16)}`} />
                ))}
              </Pie>
              {showTooltip && <Tooltip />}
              {showLegend && <Bar dataKey="value" fill="#8884d8" />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="period" />
              <YAxis />
              {showTooltip && <Tooltip />}
              {showLegend && <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />}
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <AnalyticsSystemContainer className={className} style={style}>
      <AnalyticsSystemHeader>
        <AnalyticsSystemTitle>{title}</AnalyticsSystemTitle>
        {subtitle && (
          <AnalyticsSystemSubtitle>{subtitle}</AnalyticsSystemSubtitle>
        )}
      </AnalyticsSystemHeader>

      {metrics.length > 0 && (
        <AnalyticsSystemMetrics>
          {metrics.map((metric, index) => (
            <AnalyticsSystemMetric key={index}>
              <AnalyticsSystemMetricTitle>{metric.title}</AnalyticsSystemMetricTitle>
              <AnalyticsSystemMetricValue>
                {formatValue(metric.value, metric.format)}
              </AnalyticsSystemMetricValue>
              <AnalyticsSystemMetricChange changeType={metric.changeType}>
                <span>{getChangeIcon(metric.changeType)}</span>
                <span>{Math.abs(metric.change)}%</span>
              </AnalyticsSystemMetricChange>
            </AnalyticsSystemMetric>
          ))}
        </AnalyticsSystemMetrics>
      )}

      <AnalyticsSystemChart height={height}>
        {renderChart()}
      </AnalyticsSystemChart>
    </AnalyticsSystemContainer>
  );
};

export default AnalyticsSystem;
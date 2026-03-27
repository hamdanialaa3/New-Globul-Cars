import { logger } from '../services/logger-service';
// src/components/CarValuation.tsx
// AI-Powered Car Valuation Component for Koli One

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase-config';
import { useAuth } from '../hooks/useAuth';
import styled from 'styled-components';
import { TrendingUp, Calculator, AlertCircle, CheckCircle } from 'lucide-react';

interface CarData {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  currency: string;
  location: string;
  condition: string;
  fuelType: string;
  transmission: string;
  engineSize?: number;
  power?: number;
  color?: string;
  features?: string[];
}

interface ValuationResult {
  estimatedPrice: number;
  confidence: number;
  priceRange: {
    min: number;
    max: number;
  };
  marketComparison: {
    averagePrice: number;
    percentile: number;
    similarCars: number;
  };
  factors: {
    positive: string[];
    negative: string[];
  };
  lastUpdated: Date;
}

interface CarValuationProps {
  car: CarData;
  onValuationUpdate?: (valuation: ValuationResult) => void;
}

// Styled Components
const ValuationContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin: 1rem 0;
  border: 1px solid #e5e7eb;
`;

const ValuationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const ValuationTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const ValuationBadge = styled.span<{ type: 'premium' | 'basic' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => props.type === 'premium' ? '#fef3c7' : '#f3f4f6'};
  color: ${props => props.type === 'premium' ? '#92400e' : '#374151'};
`;

const PriceDisplay = styled.div`
  text-align: center;
  margin: 1.5rem 0;
`;

const EstimatedPrice = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #059669;
  margin-bottom: 0.5rem;
`;

const PriceRange = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
`;

const ConfidenceMeter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ConfidenceBar = styled.div<{ confidence: number }>`
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;

  div {
    height: 100%;
    background: ${props => {
      if (props.confidence >= 80) return '#059669';
      if (props.confidence >= 60) return '#d97706';
      return '#dc2626';
    }};
    width: ${props => props.confidence}%;
    transition: width 0.3s ease;
  }
`;

const MarketComparison = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
`;

const FactorList = styled.div`
  margin: 1rem 0;
`;

const FactorItem = styled.div<{ type: 'positive' | 'negative' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: ${props => props.type === 'positive' ? '#f0fdf4' : '#fef2f2'};
  border-radius: 6px;
  font-size: 0.875rem;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UpgradePrompt = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  margin: 1rem 0;
`;

const CarValuation: React.FC<CarValuationProps> = ({ car, onValuationUpdate }) => {
  const { user } = useAuth();
  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  const checkPremiumAccess = useCallback(async () => {
    if (!user) return;

    try {
      // Check if user has premium subscription
      const getSubscription = httpsCallable(functions, 'getB2BSubscription');
      const result = await getSubscription();
      const subscription = result.data as any;

      setHasPremiumAccess(
        subscription?.hasSubscription &&
        subscription?.isActive &&
        ['premium', 'enterprise'].includes(subscription?.tier)
      );
    } catch (error) {
      logger.error('Error checking subscription:', error);
      setHasPremiumAccess(false);
    }
  }, [user]);

  useEffect(() => {
    checkPremiumAccess();
  }, [checkPremiumAccess]);

  const getCarValuation = async () => {
    if (!hasPremiumAccess) {
      setError('Premium subscription required for AI valuation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const getValuation = httpsCallable(functions, 'getCarValuation');
      const result = await getValuation({
        carId: car.id,
        carData: {
          make: car.make,
          model: car.model,
          year: car.year,
          mileage: car.mileage,
          condition: car.condition,
          fuelType: car.fuelType,
          transmission: car.transmission,
          engineSize: car.engineSize,
          power: car.power,
          location: car.location,
          features: car.features
        }
      });

      const valuationData = result.data as ValuationResult;
      setValuation(valuationData);

      if (onValuationUpdate) {
        onValuationUpdate(valuationData);
      }
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error getting valuation:', err);
      setError(err.message || 'Failed to get car valuation');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#059669';
    if (confidence >= 60) return '#d97706';
    return '#dc2626';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <ValuationContainer>
      <ValuationHeader>
        <Calculator size={24} color="#3b82f6" />
        <ValuationTitle>AI Car Valuation</ValuationTitle>
        <ValuationBadge type={hasPremiumAccess ? 'premium' : 'basic'}>
          {hasPremiumAccess ? 'Premium' : 'Basic'}
        </ValuationBadge>
      </ValuationHeader>

      {!hasPremiumAccess && (
        <UpgradePrompt>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>
            Unlock AI-Powered Valuation
          </h4>
          <p style={{ margin: '0 0 1rem 0', opacity: 0.9 }}>
            Get accurate market valuations with our advanced AI model
          </p>
          <button
            style={{
              background: 'white',
              color: '#667eea',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            onClick={() => window.location.href = '/subscription'}
          >
            Upgrade to Premium
          </button>
        </UpgradePrompt>
      )}

      {hasPremiumAccess && !valuation && !loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <TrendingUp size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Get an AI-powered valuation for this {car.year} {car.make} {car.model}
          </p>
          <button
            onClick={getCarValuation}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Calculator size={20} />
            Get AI Valuation
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <LoadingSpinner />
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>
            Analyzing market data and calculating valuation...
          </p>
        </div>
      )}

      {error && (
        <ErrorMessage>
          <AlertCircle size={20} />
          {error}
        </ErrorMessage>
      )}

      {valuation && (
        <>
          <PriceDisplay>
            <EstimatedPrice>
              {formatPrice(valuation.estimatedPrice)}
            </EstimatedPrice>
            <PriceRange>
              Range: {formatPrice(valuation.priceRange.min)} - {formatPrice(valuation.priceRange.max)}
            </PriceRange>
          </PriceDisplay>

          <ConfidenceMeter>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Confidence: {getConfidenceLabel(valuation.confidence)}
            </span>
            <ConfidenceBar confidence={valuation.confidence}>
              <div />
            </ConfidenceBar>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: getConfidenceColor(valuation.confidence)
            }}>
              {valuation.confidence}%
            </span>
          </ConfidenceMeter>

          <MarketComparison>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>
              Market Comparison
            </h4>
            <ComparisonGrid>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0' }}>Average Price</p>
                <p style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0.25rem 0 0 0' }}>
                  {formatPrice(valuation.marketComparison.averagePrice)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0' }}>Percentile</p>
                <p style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0.25rem 0 0 0' }}>
                  {valuation.marketComparison.percentile}th
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0' }}>Similar Cars</p>
                <p style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0.25rem 0 0 0' }}>
                  {valuation.marketComparison.similarCars}
                </p>
              </div>
            </ComparisonGrid>
          </MarketComparison>

          <FactorList>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>
              Valuation Factors
            </h4>

            {valuation.factors.positive.length > 0 && (
              <div>
                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#059669', margin: '0 0 0.5rem 0' }}>
                  Positive Factors
                </h5>
                {valuation.factors.positive.map((factor, index) => (
                  <FactorItem key={index} type="positive">
                    <CheckCircle size={16} color="#059669" />
                    {factor}
                  </FactorItem>
                ))}
              </div>
            )}

            {valuation.factors.negative.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626', margin: '0 0 0.5rem 0' }}>
                  Areas for Improvement
                </h5>
                {valuation.factors.negative.map((factor, index) => (
                  <FactorItem key={index} type="negative">
                    <AlertCircle size={16} color="#dc2626" />
                    {factor}
                  </FactorItem>
                ))}
              </div>
            )}
          </FactorList>

          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginTop: '1rem' }}>
            Last updated: {valuation.lastUpdated.toLocaleDateString('bg-BG')}
          </div>
        </>
      )}
    </ValuationContainer>
  );
};

export default CarValuation;

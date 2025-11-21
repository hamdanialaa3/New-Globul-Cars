// LiveMomentumCounter Component - عداد الزخم المباشر
// Displays live count of active listings

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/core';

const CounterContainer = styled.div`
  margin-top: 16px;
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.875rem;
    margin-top: 12px;
  }

  @media (max-width: 480px) {
    font-size: 0.8125rem;
    margin-top: 10px;
  }
`;

const CountValue = styled.span`
  font-weight: 700;
  color: #FF8F10;
  font-size: 1.125rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9375rem;
  }
`;

interface LiveMomentumCounterProps {
  count?: number;
  loading?: boolean;
}

const LiveMomentumCounter: React.FC<LiveMomentumCounterProps> = ({
  count = 11452,
  loading = false,
}) => {
  const { language } = useLanguage();
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (loading) return;

    // Animate count up
    const duration = 1500;
    const steps = 30;
    const increment = count / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(count, Math.floor(increment * step));
      setDisplayCount(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayCount(count);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [count, loading]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('bg-BG');
  };

  if (loading) {
    return (
      <CounterContainer>
        {language === 'bg' ? 'Зареждане...' : 'Loading...'}
      </CounterContainer>
    );
  }

  return (
    <CounterContainer>
      {language === 'bg' ? (
        <>
          Показваме <CountValue>{formatNumber(displayCount)}</CountValue> коли днес.
        </>
      ) : (
        <>
          Showing <CountValue>{formatNumber(displayCount)}</CountValue> cars today.
        </>
      )}
    </CounterContainer>
  );
};

export default LiveMomentumCounter;


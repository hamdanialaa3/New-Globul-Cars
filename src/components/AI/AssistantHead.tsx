import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 12px rgba(56, 189, 248, 0.4); }
  50% { box-shadow: 0 0 22px rgba(56, 189, 248, 0.9); }
  100% { box-shadow: 0 0 12px rgba(56, 189, 248, 0.4); }
`;

const FloatingButton = styled.button<{ $isActive: boolean }>`
  position: fixed;
  right: 1.75rem;
  bottom: 1.75rem;
  width: 64px;
  height: 64px;
  border-radius: 999px;
  border: none;
  padding: 0;
  background: radial-gradient(circle at 30% 20%, #38bdf8, #020617);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1200;
  color: #e5e7eb;
  animation: ${float} 3s ease-in-out infinite, ${glow} 3s ease-in-out infinite;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &:hover {
    transform: translateY(-3px) scale(1.03);
  }

  &:active {
    transform: translateY(1px) scale(0.98);
  }

  @media (max-width: 768px) {
    right: 1.2rem;
    bottom: 1.2rem;
    width: 56px;
    height: 56px;
  }
`;

const Head = styled.div<{ $isActive: boolean }>`
  width: 70%;
  height: 70%;
  border-radius: 24px;
  background: radial-gradient(circle at 30% 20%, #0ea5e9, #020617);
  border: 1px solid rgba(148, 163, 184, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const Antenna = styled.div`
  position: absolute;
  top: -10px;
  width: 6px;
  height: 16px;
  border-radius: 999px;
  background: linear-gradient(to bottom, #22c55e, #14532d);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.8);
`;

const EyesRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
`;

const Eye = styled.div<{ $isBlinking: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, #e0f2fe, #22c55e);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.9);
  transform-origin: center;
  transition: transform 0.15s ease;

  ${({ $isBlinking }) =>
    $isBlinking &&
    `
      transform: scaleY(0.1);
      box-shadow: none;
    `}
`;

const Mouth = styled.div`
  width: 24px;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(to right, #22c55e, #4ade80);
  opacity: 0.9;
`;

const Badge = styled.div`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #22c55e;
  color: #022c22;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px rgba(22, 163, 74, 0.8);
`;

const Tooltip = styled.div`
  position: fixed;
  right: 5.5rem;
  bottom: 2.2rem;
  max-width: 240px;
  padding: 0.6rem 0.9rem;
  border-radius: 0.9rem;
  background: rgba(15, 23, 42, 0.94);
  color: #e5e7eb;
  font-size: 0.8rem;
  line-height: 1.3;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  z-index: 1199;

  @media (max-width: 768px) {
    right: 1.2rem;
    bottom: 5rem;
    max-width: 200px;
  }
`;

export const AssistantHead: React.FC = () => {
  const { language } = useLanguage();
  const [isBlinking, setIsBlinking] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const label =
    language === 'bg'
      ? 'AI помощник'
      : 'AI assistant';

  return (
    <>
      {showTooltip && (
        <Tooltip onClick={() => setShowTooltip(false)}>
          {language === 'bg'
            ? 'Интелигентен асистент за оценка и помощ при продажбата на автомобили.'
            : 'Smart assistant for valuation and selling your car.'}
        </Tooltip>
      )}
      <FloatingButton
        type="button"
        aria-label={label}
        title={label}
        $isActive={false}
        onClick={() => setShowTooltip(prev => !prev)}
      >
        <Head $isActive={false}>
          <Antenna />
          <EyesRow>
            <Eye $isBlinking={isBlinking} />
            <Eye $isBlinking={isBlinking} />
          </EyesRow>
          <Mouth />
          <Badge>AI</Badge>
        </Head>
      </FloatingButton>
    </>
  );
};

export default AssistantHead;



/**
 * ComparisonFloatingBar — Fixed bottom bar showing selected cars for comparison.
 * Slides up when the user selects at least 1 car.
 */
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRightLeft } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import { useLanguage } from '../../contexts/LanguageContext';

const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
`;

const Bar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9000;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(30,41,59,0.97))'
    : 'linear-gradient(135deg, rgba(255,255,255,0.97), rgba(248,250,252,0.97))'};
  backdrop-filter: blur(16px);
  border-top: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'};
  box-shadow: 0 -4px 24px rgba(0,0,0,0.15);
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: ${slideUp} 0.3s ease-out;
`;

const Slots = styled.div`
  display: flex;
  gap: 0.75rem;
  flex: 1;
  overflow-x: auto;
`;

const Slot = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
  border-radius: 10px;
  padding: 0.4rem 0.75rem;
  min-width: 180px;
  max-width: 240px;
`;

const SlotImage = styled.img`
  width: 40px;
  height: 30px;
  border-radius: 6px;
  object-fit: cover;
`;

const SlotInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SlotTitle = styled.span`
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f1f5f9' : '#1e293b'};
`;

const SlotPrice = styled.span`
  font-size: 0.65rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  &:hover { color: #ef4444; }
`;

const CompareButton = styled.button<{ $ready: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  border: none;
  cursor: ${({ $ready }) => $ready ? 'pointer' : 'not-allowed'};
  font-weight: 600;
  font-size: 0.85rem;
  color: #fff;
  background: ${({ $ready }) => $ready
    ? 'linear-gradient(135deg, #CC0000, #ff3333)'
    : 'rgba(100,100,100,0.4)'};
  box-shadow: ${({ $ready }) => $ready ? '0 2px 12px rgba(204,0,0,0.3)' : 'none'};
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    ${({ $ready }) => $ready && 'transform: translateY(-1px); box-shadow: 0 4px 16px rgba(204,0,0,0.4);'}
  }
`;

const ClearBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  text-decoration: underline;
  &:hover { color: #ef4444; }
`;

const ComparisonFloatingBar: React.FC = () => {
  const { cars, removeCar, clearAll } = useComparison();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (cars.length === 0) return null;

  const canCompare = cars.length >= 2;

  const handleCompare = () => {
    if (!canCompare) return;
    const ids = cars.map(c => c.numericId || c.id).join(',');
    navigate(`/competitive-comparison?ids=${encodeURIComponent(ids)}`);
  };

  return (
    <Bar>
      <Slots>
        {cars.map(car => (
          <Slot key={car.id}>
            {car.image && <SlotImage src={car.image} alt={`${car.make} ${car.model}`} />}
            <SlotInfo>
              <SlotTitle>{car.make} {car.model} {car.year}</SlotTitle>
              <SlotPrice>€{car.price?.toLocaleString()}</SlotPrice>
            </SlotInfo>
            <RemoveBtn onClick={() => removeCar(car.id)} aria-label="Remove">
              <X size={14} />
            </RemoveBtn>
          </Slot>
        ))}
      </Slots>
      <CompareButton $ready={canCompare} onClick={handleCompare} disabled={!canCompare}>
        <ArrowRightLeft size={16} />
        {t ? t('compare') : 'Сравни'} ({cars.length}/3)
      </CompareButton>
      <ClearBtn onClick={clearAll}>{t ? t('clearAll') : 'Изчисти'}</ClearBtn>
    </Bar>
  );
};

export default ComparisonFloatingBar;

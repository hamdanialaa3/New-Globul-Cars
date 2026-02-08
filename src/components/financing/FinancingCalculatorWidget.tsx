/**
 * Financing Calculator Widget (Inline)
 * Compact calculator for car details page
 * Location: Bulgaria | Currency: EUR
 * 
 * File: src/components/financing/FinancingCalculatorWidget.tsx
 * Created: February 8, 2026
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronDown, DollarSign, Calendar } from 'lucide-react';
import { financingCalculatorService, FinancingCalculation } from '../../services/financing/financing-calculator.service';
import { getActiveBanks, getInterestRateForBank } from '../../config/banking-partners';
import { serviceLogger } from '../../services/logger-service';

interface FinancingCalculatorWidgetProps {
  carPrice: number;
  onNavigateToCalculator?: () => void;
}

export const FinancingCalculatorWidget: React.FC<FinancingCalculatorWidgetProps> = ({
  carPrice,
  onNavigateToCalculator
}) => {
  const [expanded, setExpanded] = useState(false);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [durationMonths, setDurationMonths] = useState(60);
  const [selectedBank, setSelectedBank] = useState('dsk');
  const [calculation, setCalculation] = useState<FinancingCalculation | null>(null);

  const downPayment = carPrice * (downPaymentPercent / 100);
  const interestRate = getInterestRateForBank(selectedBank, durationMonths);

  const handleCalculate = () => {
    try {
      const result = financingCalculatorService.calculate({
        carPrice,
        downPayment,
        durationMonths,
        annualInterestRate: interestRate
      });
      setCalculation(result);
    } catch (error) {
      serviceLogger.error('Widget calculation failed', error as Error);
    }
  };

  return (
    <Container>
      <Header onClick={() => setExpanded(!expanded)}>
        <Title>
          <DollarSign size={20} />
          Financing Options
        </Title>
        <ChevronIcon expanded={expanded}>
          <ChevronDown size={20} />
        </ChevronIcon>
      </Header>

      {expanded && (
        <Content>
          <InputGrid>
            <InputGroup>
              <Label>Down Payment: {downPaymentPercent}%</Label>
              <Slider
                type="range"
                min="0"
                max="50"
                step="5"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              />
              <Value>€{Math.round(downPayment)}</Value>
            </InputGroup>

            <InputGroup>
              <Label>Duration</Label>
              <SelectBox
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
              >
                <option value={24}>2 years</option>
                <option value={36}>3 years</option>
                <option value={48}>4 years</option>
                <option value={60}>5 years</option>
                <option value={72}>6 years</option>
                <option value={84}>7 years</option>
              </SelectBox>
            </InputGroup>

            <InputGroup>
              <Label>Bank</Label>
              <SelectBox
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
              >
                {getActiveBanks().map(bank => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name} ({getInterestRateForBank(bank.id, durationMonths).toFixed(2)}%)
                  </option>
                ))}
              </SelectBox>
            </InputGroup>
          </InputGrid>

          <CalculateBtn onClick={handleCalculate}>
            Calculate
          </CalculateBtn>

          {calculation && (
            <ResultBox>
              <ResultRow>
                <Label>Monthly Payment:</Label>
                <ResultValue>€{calculation.monthlyPayment.toLocaleString('bg-BG')}</ResultValue>
              </ResultRow>
              <ResultRow>
                <Label>Total Interest:</Label>
                <ResultValue>€{calculation.totalInterest.toLocaleString('bg-BG')}</ResultValue>
              </ResultRow>
              <ResultRow>
                <Label>Total Cost:</Label>
                <ResultValue>€{calculation.totalPayment.toLocaleString('bg-BG')}</ResultValue>
              </ResultRow>

              {onNavigateToCalculator && (
                <DetailedLink onClick={onNavigateToCalculator}>
                  View Detailed Calculator →
                </DetailedLink>
              )}
            </ResultBox>
          )}

          <Disclaimer>
            These calculations are estimates. Contact your bank for exact rates and terms.
          </Disclaimer>
        </Content>
      )}
    </Container>
  );
};

const Container = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  margin-bottom: 16px;
`;

const Header = styled.div`
  padding: 16px;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f2ff 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  min-height: 58px;
  touch-action: manipulation;

  &:hover {
    background: linear-gradient(135deg, #e6f2ff 0%, #d9ecff 100%);
  }

  &:active {
    background: linear-gradient(135deg, #d9ecff 0%, #cce5ff 100%);
  }

  @media (max-width: 768px) {
    padding: 14px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    min-height: 52px;
  }
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #0066cc;

  @media (max-width: 480px) {
    font-size: 15px;
    gap: 8px;
  }

  svg {
    @media (max-width: 480px) {
      width: 18px;
      height: 18px;
    }
  }
`;

const ChevronIcon = styled.div<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0)'};
  transition: transform 0.2s ease;
  color: #0066cc;
`;

const Content = styled.div`
  padding: 20px;

  @media (max-width: 768px) {
    padding: 18px;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 12px;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: #333;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #0066cc;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    touch-action: manipulation;
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #0066cc;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 480px) {
    &::-webkit-slider-thumb {
      width: 20px;
      height: 20px;
    }

    &::-moz-range-thumb {
      width: 20px;
      height: 20px;
    }
  }
`;

const Value = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #0066cc;
`;

const SelectBox = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  min-height: 44px;

  &:focus {
    outline: none;
    border-color: #0066cc;
  }

  @media (max-width: 480px) {
    font-size: 13px;
    padding: 8px 10px;
  }
`;

const CalculateBtn = styled.button`
  width: 100%;
  padding: 12px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-bottom: 16px;
  min-height: 48px;
  touch-action: manipulation;

  &:hover {
    background: #0052a3;
  }

  &:active {
    background: #004080;
    transform: scale(0.98);
  }

  @media (max-width: 480px) {
    padding: 11px;
    font-size: 15px;
  }
`;

const ResultBox = styled.div`
  background: #f0f8ff;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #0066cc;
`;

const ResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #d9ecff;

  &:last-child {
    border-bottom: none;
  }
`;

const ResultValue = styled.div`
  font-weight: 700;
  color: #0066cc;
  font-size: 16px;
`;

const DetailedLink = styled.button`
  width: 100%;
  padding: 10px;
  background: white;
  color: #0066cc;
  border: 1px solid #0066cc;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 12px;
  transition: all 0.2s ease;
  min-height: 44px;
  touch-action: manipulation;

  &:hover {
    background: #0066cc;
    color: white;
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 480px) {
    padding: 9px;
    font-size: 14px;
  }
`;

const Disclaimer = styled.p`
  font-size: 12px;
  color: #999;
  margin: 12px 0 0 0;
  line-height: 1.4;
`;

export default FinancingCalculatorWidget;

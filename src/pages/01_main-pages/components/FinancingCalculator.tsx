import React, { useState } from 'react';
import styled from 'styled-components';
import { Calculator, ChevronRight, Info } from 'lucide-react';

interface FinancingCalculatorProps {
  price: number;
  currency: string;
  language: 'bg' | 'en';
}

const Container = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const MainResult = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
`;

const MonthlyRate = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: var(--accent-primary);
`;

const Label = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const InputGroup = styled.div`
  margin-bottom: 1rem;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
`;

const RangeInput = styled.input`
  width: 100%;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  appearance: none;
  margin-bottom: 10px;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
  }
`;

const ValueDisplay = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  justify-content: space-between;
`;

const Disclaimer = styled.div`
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 1rem;
  line-height: 1.4;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
  font-weight: 600;
  border-radius: 8px;
  margin-top: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: var(--accent-primary);
    color: white;
  }
`;

export const FinancingCalculator: React.FC<FinancingCalculatorProps> = ({ price, currency, language }) => {
  const [downPayment, setDownPayment] = useState(price * 0.2); // 20% default
  const [months, setMonths] = useState(48); // 48 months default
  const interestRate = 0.049; // 4.9% mock rate

  // Simple amortization formula
  const calculateRate = () => {
    const loanAmount = price - downPayment;
    const monthlyRate = interestRate / 12;
    const rate = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
    return Math.round(rate);
  };

  const monthlyPayment = calculateRate();

  return (
    <Container>
      <Header>
        <Calculator size={24} color="var(--accent-primary)" />
        <Title>{language === 'bg' ? 'Финансиране' : 'Financing'}</Title>
      </Header>

      <MainResult>
        <div>
          <Label>{language === 'bg' ? 'Месечна вноска' : 'Monthly Rate'}</Label>
          <MonthlyRate>{monthlyPayment} {currency}</MonthlyRate>
        </div>
      </MainResult>

      <InputGroup>
        <ValueDisplay>
          <span>{language === 'bg' ? 'Първоначална вноска' : 'Down Payment'}</span>
          <span>{downPayment.toLocaleString()} {currency}</span>
        </ValueDisplay>
        <RangeInput 
          type="range" 
          min="0" 
          max={price * 0.8} 
          step="100" 
          value={downPayment} 
          onChange={(e) => setDownPayment(Number(e.target.value))} 
        />
      </InputGroup>

      <InputGroup>
        <ValueDisplay>
          <span>{language === 'bg' ? 'Срок (месеци)' : 'Term (months)'}</span>
          <span>{months}</span>
        </ValueDisplay>
        <RangeInput 
          type="range" 
          min="12" 
          max="84" 
          step="12" 
          value={months} 
          onChange={(e) => setMonths(Number(e.target.value))} 
        />
      </InputGroup>

      <ActionButton>
        {language === 'bg' ? 'Кандидатствай' : 'Apply Now'}
        <ChevronRight size={16} />
      </ActionButton>

      <Disclaimer>
        {language === 'bg' 
          ? '*Примерен калкулатор. Окончателните условия зависят от кредитната оценка.' 
          : '*Example calculation. Final terms depend on credit rating.'}
      </Disclaimer>
    </Container>
  );
};

/**
 * Finance Calculator Component
 * Car loan/financing calculator with bank partnerships
 * 
 * Inspired by: AutoTrader UK, Cars.com financing calculators
 * 
 * File: src/components/finance/FinanceCalculator.tsx
 * Created: January 8, 2026
 */

import React, { useState, useMemo, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  Calculator, DollarSign, Calendar, Percent, TrendingDown,
  Building2, Shield, CheckCircle, ArrowRight, Info,
  CreditCard, PiggyBank, Clock, Star, ChevronDown, ChevronUp
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ==================== ANIMATIONS ====================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
  50% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
`;

// ==================== STYLED COMPONENTS ====================

const CalculatorContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 500px;
  margin: 0 auto;
`;

const MainCard = styled.div`
  background: var(--bg-card);
  border-radius: 24px;
  border: 2px solid var(--border-primary);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  animation: ${fadeIn} 0.6s ease-out;
`;

const CardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Left Panel - Calculator
const CalculatorPanel = styled.div`
  padding: 2rem;
  border-right: 1px solid var(--border-primary);
  
  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid var(--border-primary);
  }
`;

const PanelTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`;

const LabelValue = styled.span`
  font-weight: 700;
  color: var(--accent-primary);
`;

const SliderContainer = styled.div`
  position: relative;
`;

const Slider = styled.input`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  appearance: none;
  background: linear-gradient(
    to right,
    var(--accent-primary) 0%,
    var(--accent-primary) var(--progress),
    var(--bg-tertiary) var(--progress),
    var(--bg-tertiary) 100%
  );
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    border: 3px solid var(--accent-primary);
    cursor: grab;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
    }
    
    &:active {
      cursor: grabbing;
    }
  }
`;

const SliderMarks = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
`;

// Right Panel - Results
const ResultsPanel = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
`;

const ResultCard = styled.div<{ $highlighted?: boolean }>`
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  
  ${p => p.$highlighted ? css`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    animation: ${pulse} 2s infinite;
    
    ${ResultLabel} {
      color: rgba(255, 255, 255, 0.8);
    }
    
    ${ResultValue} {
      color: white;
    }
  ` : css`
    background: var(--bg-card);
    border: 1px solid var(--border-primary);
  `}
`;

const ResultLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
`;

const ResultValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
`;

const ResultSubtext = styled.div`
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 0.25rem;
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const SmallResultCard = styled.div`
  padding: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  text-align: center;
`;

const SmallResultLabel = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
`;

const SmallResultValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
`;

// Bank Partners Section
const PartnersSection = styled.div`
  padding: 2rem;
  border-top: 1px solid var(--border-primary);
`;

const PartnersTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PartnersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const PartnerCard = styled.div<{ $selected: boolean }>`
  padding: 1.25rem;
  border-radius: 16px;
  border: 2px solid ${p => p.$selected ? 'var(--accent-primary)' : 'var(--border-primary)'};
  background: ${p => p.$selected ? 'rgba(102, 126, 234, 0.08)' : 'var(--bg-card)'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--accent-primary);
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }
  
  ${p => p.$selected && css`
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  `}
`;

const PartnerLogo = styled.div`
  width: 60px;
  height: 40px;
  background: var(--bg-secondary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  
  svg {
    color: var(--accent-primary);
  }
`;

const PartnerName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const PartnerRate = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.35rem;
  
  svg {
    width: 14px;
    height: 14px;
    color: #10b981;
  }
`;

const PartnerBadge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  color: #000;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 6px;
  margin-left: 0.5rem;
`;

// Apply Button
const ApplyButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
  }
`;

// Info Box
const InfoBox = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  margin-top: 1.5rem;
`;

const InfoIcon = styled.div`
  flex-shrink: 0;
  
  svg {
    width: 20px;
    height: 20px;
    color: var(--accent-primary);
  }
`;

const InfoText = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
`;

// Features List
const FeaturesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  
  svg {
    width: 16px;
    height: 16px;
    color: #10b981;
  }
`;

// ==================== TYPES ====================

interface BankPartner {
  id: string;
  name: string;
  rate: number;
  featured?: boolean;
}

// ==================== COMPONENT ====================

export const FinanceCalculator: React.FC<{ carPrice?: number }> = ({ carPrice = 25000 }) => {
  const { language } = useLanguage();
  const [price, setPrice] = useState(carPrice);
  const [downPayment, setDownPayment] = useState(Math.round(carPrice * 0.2));
  const [months, setMonths] = useState(60);
  const [selectedBank, setSelectedBank] = useState('dsk');

  const t = {
    bg: {
      title: '🧮 Калкулатор за Финансиране',
      subtitle: 'Изчисли месечната си вноска и кандидатствай онлайн за кредит',
      calculateTitle: 'Изчисли Кредита',
      carPrice: 'Цена на колата',
      downPayment: 'Първоначална вноска',
      loanTerm: 'Срок на кредита',
      monthlyPayment: 'Месечна вноска',
      months: 'месеца',
      totalInterest: 'Общо лихва',
      totalCost: 'Обща сума',
      loanAmount: 'Сума на кредита',
      partnersTitle: '🏦 Партньорски Банки',
      apply: 'Кандидатствай Онлайн',
      infoText: 'Изчисленията са примерни. Реалните условия може да варират според вашия кредитен профил.',
      features: {
        instant: 'Бърз отговор',
        noFees: 'Без такси',
        flexible: 'Гъвкави условия',
        online: '100% онлайн'
      },
      best: 'НАЙ-ДОБРА'
    },
    en: {
      title: '🧮 Finance Calculator',
      subtitle: 'Calculate your monthly payment and apply online for a loan',
      calculateTitle: 'Calculate Loan',
      carPrice: 'Car Price',
      downPayment: 'Down Payment',
      loanTerm: 'Loan Term',
      monthlyPayment: 'Monthly Payment',
      months: 'months',
      totalInterest: 'Total Interest',
      totalCost: 'Total Cost',
      loanAmount: 'Loan Amount',
      partnersTitle: '🏦 Partner Banks',
      apply: 'Apply Online',
      infoText: 'Calculations are estimates. Actual terms may vary based on your credit profile.',
      features: {
        instant: 'Instant response',
        noFees: 'No fees',
        flexible: 'Flexible terms',
        online: '100% online'
      },
      best: 'BEST RATE'
    }
  };

  const text = t[language] || t.en;

  const banks: BankPartner[] = [
    { id: 'dsk', name: 'DSK Bank', rate: 5.9, featured: true },
    { id: 'fibank', name: 'Fibank', rate: 6.2 },
    { id: 'unicredit', name: 'UniCredit', rate: 6.5 }
  ];

  const selectedBankData = banks.find(b => b.id === selectedBank) || banks[0];

  const calculations = useMemo(() => {
    const loanAmount = price - downPayment;
    const monthlyRate = selectedBankData.rate / 100 / 12;
    
    // PMT formula
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) 
                          / (Math.pow(1 + monthlyRate, months) - 1);
    
    const totalCost = monthlyPayment * months;
    const totalInterest = totalCost - loanAmount;

    return {
      loanAmount,
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalCost: Math.round(totalCost)
    };
  }, [price, downPayment, months, selectedBankData.rate]);

  const downPaymentPercent = Math.round((downPayment / price) * 100);

  return (
    <CalculatorContainer>
      <Header>
        <Title>
          <Calculator />
          {text.title}
        </Title>
        <Subtitle>{text.subtitle}</Subtitle>
      </Header>

      <MainCard>
        <CardContent>
          {/* Calculator Panel */}
          <CalculatorPanel>
            <PanelTitle>
              <Calculator size={20} />
              {text.calculateTitle}
            </PanelTitle>

            {/* Car Price */}
            <FormGroup>
              <Label>
                {text.carPrice}
                <LabelValue>{price.toLocaleString()}€</LabelValue>
              </Label>
              <SliderContainer>
                <Slider
                  type="range"
                  min={5000}
                  max={100000}
                  step={500}
                  value={price}
                  onChange={e => {
                    const newPrice = parseInt(e.target.value);
                    setPrice(newPrice);
                    setDownPayment(Math.round(newPrice * 0.2));
                  }}
                  style={{ '--progress': `${((price - 5000) / (100000 - 5000)) * 100}%` } as any}
                />
              </SliderContainer>
              <SliderMarks>
                <span>5,000€</span>
                <span>100,000€</span>
              </SliderMarks>
            </FormGroup>

            {/* Down Payment */}
            <FormGroup>
              <Label>
                {text.downPayment}
                <LabelValue>{downPayment.toLocaleString()}€ ({downPaymentPercent}%)</LabelValue>
              </Label>
              <SliderContainer>
                <Slider
                  type="range"
                  min={0}
                  max={price * 0.8}
                  step={500}
                  value={downPayment}
                  onChange={e => setDownPayment(parseInt(e.target.value))}
                  style={{ '--progress': `${(downPayment / (price * 0.8)) * 100}%` } as any}
                />
              </SliderContainer>
              <SliderMarks>
                <span>0%</span>
                <span>80%</span>
              </SliderMarks>
            </FormGroup>

            {/* Loan Term */}
            <FormGroup>
              <Label>
                {text.loanTerm}
                <LabelValue>{months} {text.months}</LabelValue>
              </Label>
              <SliderContainer>
                <Slider
                  type="range"
                  min={12}
                  max={84}
                  step={6}
                  value={months}
                  onChange={e => setMonths(parseInt(e.target.value))}
                  style={{ '--progress': `${((months - 12) / (84 - 12)) * 100}%` } as any}
                />
              </SliderContainer>
              <SliderMarks>
                <span>12</span>
                <span>84</span>
              </SliderMarks>
            </FormGroup>

            <FeaturesList>
              <FeatureItem>
                <CheckCircle />
                {text.features.instant}
              </FeatureItem>
              <FeatureItem>
                <CheckCircle />
                {text.features.noFees}
              </FeatureItem>
              <FeatureItem>
                <CheckCircle />
                {text.features.flexible}
              </FeatureItem>
              <FeatureItem>
                <CheckCircle />
                {text.features.online}
              </FeatureItem>
            </FeaturesList>
          </CalculatorPanel>

          {/* Results Panel */}
          <ResultsPanel>
            <ResultCard $highlighted>
              <ResultLabel>{text.monthlyPayment}</ResultLabel>
              <ResultValue>{calculations.monthlyPayment.toLocaleString()}€</ResultValue>
              <ResultSubtext>@ {selectedBankData.rate}% APR</ResultSubtext>
            </ResultCard>

            <ResultGrid>
              <SmallResultCard>
                <SmallResultLabel>{text.loanAmount}</SmallResultLabel>
                <SmallResultValue>{calculations.loanAmount.toLocaleString()}€</SmallResultValue>
              </SmallResultCard>
              <SmallResultCard>
                <SmallResultLabel>{text.totalInterest}</SmallResultLabel>
                <SmallResultValue>{calculations.totalInterest.toLocaleString()}€</SmallResultValue>
              </SmallResultCard>
            </ResultGrid>

            <ResultCard>
              <ResultLabel>{text.totalCost}</ResultLabel>
              <ResultValue>{calculations.totalCost.toLocaleString()}€</ResultValue>
            </ResultCard>

            <InfoBox>
              <InfoIcon>
                <Info />
              </InfoIcon>
              <InfoText>{text.infoText}</InfoText>
            </InfoBox>
          </ResultsPanel>
        </CardContent>

        {/* Bank Partners */}
        <PartnersSection>
          <PartnersTitle>
            <Building2 size={20} />
            {text.partnersTitle}
          </PartnersTitle>
          <PartnersGrid>
            {banks.map(bank => (
              <PartnerCard
                key={bank.id}
                $selected={selectedBank === bank.id}
                onClick={() => setSelectedBank(bank.id)}
              >
                <PartnerLogo>
                  <Building2 size={24} />
                </PartnerLogo>
                <PartnerName>
                  {bank.name}
                  {bank.featured && <PartnerBadge>{text.best}</PartnerBadge>}
                </PartnerName>
                <PartnerRate>
                  <TrendingDown />
                  {bank.rate}% APR
                </PartnerRate>
              </PartnerCard>
            ))}
          </PartnersGrid>

          <ApplyButton>
            {text.apply}
            <ArrowRight size={20} />
          </ApplyButton>
        </PartnersSection>
      </MainCard>
    </CalculatorContainer>
  );
};

export default FinanceCalculator;

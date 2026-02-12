/**
 * Financing Comparison Page
 * Side-by-side comparison of bank financing options
 * Location: Bulgaria | Currency: EUR
 * 
 * File: src/pages/financing/FinancingComparisonPage.tsx
 * Created: February 8, 2026
 */

import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { DollarSign, TrendingDown, Building2, Check, ArrowRight, Download } from 'lucide-react';
import { financingCalculatorService } from '../../services/financing/financing-calculator.service';
import { getActiveBanks, getInterestRateForBank } from '../../config/banking-partners';
import { useLanguage } from '../../contexts/LanguageContext';
import { logger } from '../../services/logger-service';

const FinancingComparisonPage: React.FC = () => {
  const { language } = useLanguage();
  const [carPrice, setCarPrice] = useState<number>(25000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [durationMonths, setDurationMonths] = useState<number>(60);

  const downPayment = useMemo(
    () => Math.round(carPrice * (downPaymentPercent / 100) * 100) / 100,
    [carPrice, downPaymentPercent]
  );

  const loanAmount = useMemo(
    () => carPrice - downPayment,
    [carPrice, downPayment]
  );

  const banks = useMemo(() => getActiveBanks(), []);

  const comparisons = useMemo(() => {
    return banks.map(bank => {
      const rate = getInterestRateForBank(bank.id, durationMonths);
      if (rate === null) return null;

      const calc = financingCalculatorService.calculate({
        carPrice,
        downPayment,
        durationMonths,
        annualInterestRate: rate
      });

      return {
        bank,
        rate,
        calculation: calc
      };
    }).filter(x => x !== null) as typeof comparisons;
  }, [banks, carPrice, downPayment, durationMonths]);

  // Find best option
  const bestOption = useMemo(() => {
    if (comparisons.length === 0) return null;
    return comparisons.reduce((best, current) => 
      current.calculation.monthlyPayment < best.calculation.monthlyPayment ? current : best
    );
  }, [comparisons]);

  const handleExportComparison = () => {
    const csvContent = [
      ['Bank Financing Comparison Report'],
      ['Generated:', new Date().toLocaleDateString('bg-BG')],
      [''],
      ['Vehicle Details'],
      ['Car Price:', `€${carPrice.toLocaleString('bg-BG')}`],
      ['Down Payment:', `€${downPayment.toLocaleString('bg-BG')} (${downPaymentPercent}%)`],
      ['Loan Amount:', `€${loanAmount.toLocaleString('bg-BG')}`],
      ['Duration:', `${durationMonths} months (${(durationMonths / 12).toFixed(1)} years)`],
      [''],
      ['Bank Comparison'],
      ['Bank', 'Annual Rate', 'Monthly Payment', 'Total Interest', 'Total Cost'],
      ...comparisons.map(comp => [
        comp.bank.name,
        `${comp.rate.toFixed(2)}%`,
        `€${comp.calculation.monthlyPayment.toFixed(2)}`,
        `€${comp.calculation.totalInterest.toFixed(2)}`,
        `€${comp.calculation.totalPayment.toFixed(2)}`
      ])
    ]
    .map(row => row.join(','))
    .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `financing-comparison-${Date.now()}.csv`;
    link.click();
  };

  const translations = {
    bg: {
      title: 'Сравнение финансиране от български банки',
      carPrice: 'Цена на автомобила',
      downPayment: 'Начален платеж',
      duration: 'Период на заема',
      months: 'месеца',
      bestOption: 'Най-добра опция',
      annualRate: 'Годишна лихва',
      monthlyPayment: 'Месечен платеж',
      totalInterest: 'Обща лихва',
      totalCost: 'Обща цена',
      contact: 'Контакт',
      website: 'Уебсайт',
      exportComparison: 'Изтегли сравнение (CSV)',
      recommended: 'Препоръчано',
      savings: 'Икономия спрямо скъпия банк'
    },
    en: {
      title: 'Bank Financing Comparison',
      carPrice: 'Car Price',
      downPayment: 'Down Payment',
      duration: 'Loan Duration',
      months: 'months',
      bestOption: 'Best Option',
      annualRate: 'Annual Rate',
      monthlyPayment: 'Monthly Payment',
      totalInterest: 'Total Interest',
      totalCost: 'Total Cost',
      contact: 'Contact',
      website: 'Website',
      exportComparison: 'Export Comparison (CSV)',
      recommended: 'Recommended',
      savings: 'Savings vs Most Expensive'
    }
  };

  const t = translations[language === 'bg' ? 'bg' : 'en'];

  return (
    <Container>
      <Helmet>
        <title>Сравнение на банково финансиране за автомобили | Koli One</title>
        <meta
          name="description"
          content="Сравнете условията за автомобилно финансиране от 5 български банки: DSK, UniCredit, Raiffeisen, FIBank, Société Générale. Преглед на лихви, месечни вноски и общи разходи."
        />
        <meta
          name="keywords"
          content="сравнение банкови кредити, автокредити България, DSK, UniCredit, Raiffeisen, FIBank, лихви кредит, банково финансиране"
        />
        <link rel="canonical" href="https://koli.one/financing/compare" />
        <meta property="og:title" content="Сравнение на автомобилно финансиране от 5 български банки" />
        <meta
          property="og:description"
          content="Преглед на лихви, месечни вноски и общи разходи за автокредити от DSK, UniCredit, Raiffeisen, FIBank, Société Générale."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://koli.one/financing/compare" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ComparisonPage",
            "name": "Сравнение на банково финансиране",
            "description": "Сравнение на условията за финансиране от български банки",
            "provider": {
              "@type": "Organization",
              "name": "Koli One",
              "url": "https://koli.one"
            },
            "about": [
              {
                "@type": "BankOrCreditUnion",
                "name": "DSK Bank",
                "sameAs": "https://dskbank.bg"
              },
              {
                "@type": "BankOrCreditUnion",
                "name": "UniCredit Bulbank",
                "sameAs": "https://www.unicreditbulbank.bg"
              },
              {
                "@type": "BankOrCreditUnion",
                "name": "Raiffeisen Bank",
                "sameAs": "https://www.raiffeisen.bg"
              }
            ]
          })}
        </script>
      </Helmet>

      <Header>
        <Title>
          <Building2 size={32} />
          {t.title}
        </Title>
      </Header>

      <Controls>
        <ControlGroup>
          <Label>
            {t.carPrice}: <ValueSpan>€{carPrice.toLocaleString('bg-BG')}</ValueSpan>
          </Label>
          <RangeInput
            type="range"
            min="5000"
            max="100000"
            step="5000"
            value={carPrice}
            onChange={(e) => setCarPrice(Number(e.target.value))}
          />
        </ControlGroup>

        <ControlGroup>
          <Label>
            {t.downPayment}: <ValueSpan>{downPaymentPercent}%</ValueSpan>
          </Label>
          <RangeInput
            type="range"
            min="0"
            max="50"
            step="5"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
          />
        </ControlGroup>

        <ControlGroup>
          <Label>{t.duration}</Label>
          <Select value={durationMonths} onChange={(e) => setDurationMonths(Number(e.target.value))}>
            {[12, 24, 36, 48, 60, 72, 84].map(m => (
              <option key={m} value={m}>{m} {t.months}</option>
            ))}
          </Select>
        </ControlGroup>

        <ExportBtn onClick={handleExportComparison}>
          <Download size={18} />
          {t.exportComparison}
        </ExportBtn>
      </Controls>

      {bestOption && (
        <BestOptionBanner>
          <BestIcon>🏆</BestIcon>
          <BestContent>
            <BestLabel>{t.bestOption}</BestLabel>
            <BestBank>{bestOption.bank.name}</BestBank>
            <BestDetails>
              {t.monthlyPayment}: <BestValue>€{bestOption.calculation.monthlyPayment.toFixed(2)}</BestValue>
              {' | '}
              {t.annualRate}: <BestValue>{bestOption.rate.toFixed(2)}%</BestValue>
            </BestDetails>
          </BestContent>
        </BestOptionBanner>
      )}

      <ComparisonGrid>
        {comparisons.map((comp, idx) => {
          const isBestOption = bestOption && comp.bank.id === bestOption.bank.id;
          const mostExpensivePayment = Math.max(...comparisons.map(c => c.calculation.monthlyPayment));
          const savings = mostExpensivePayment - comp.calculation.monthlyPayment;

          return (
            <BankCard key={comp.bank.id} isBest={isBestOption}>
              {isBestOption && <BestBadge>{t.recommended}</BestBadge>}

              <BankName>{comp.bank.name}</BankName>

              <Rate>
                <RateLabel>{t.annualRate}</RateLabel>
                <RateValue>{comp.rate.toFixed(2)}%</RateValue>
              </Rate>

              <Metric>
                <MetricLabel>{t.monthlyPayment}</MetricLabel>
                <MetricValue>€{comp.calculation.monthlyPayment.toFixed(2)}</MetricValue>
              </Metric>

              <Metric>
                <MetricLabel>{t.totalInterest}</MetricLabel>
                <MetricValue>€{comp.calculation.totalInterest.toFixed(2)}</MetricValue>
              </Metric>

              <Metric>
                <MetricLabel>{t.totalCost}</MetricLabel>
                <MetricValue>€{comp.calculation.totalPayment.toFixed(2)}</MetricValue>
              </Metric>

              {savings > 0 && (
                <SavingsBox>
                  <TrendingDown size={16} />
                  {t.savings}: €{savings.toFixed(2)}
                </SavingsBox>
              )}

              <BankDetails>
                <DetailRow>
                  <span>{t.contact}:</span>
                  <Phone href={`tel:${comp.bank.phone}`}>{comp.bank.phone}</Phone>
                </DetailRow>
                <DetailRow>
                  <span>{t.website}:</span>
                  <WebLink href={comp.bank.website} target="_blank" rel="noopener noreferrer">
                    {comp.bank.website} <ArrowRight size={14} />
                  </WebLink>
                </DetailRow>
              </BankDetails>

              {isBestOption && (
                <SelectBtn>
                  <Check size={18} />
                  Выбрать
                </SelectBtn>
              )}
            </BankCard>
          );
        })}
      </ComparisonGrid>
    </Container>
  );
};

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--bg-primary);
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2rem;
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    font-size: 1.6rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  svg {
    @media (max-width: 480px) {
      width: 24px;
      height: 24px;
    }
  }
`;

const Controls = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1.2rem;
    gap: 1.2rem;
    margin-bottom: 2rem;
  }
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const ValueSpan = styled.span`
  color: var(--accent-primary);
  font-weight: 700;
`;

const RangeInput = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  appearance: none;
  background: var(--bg-tertiary);
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent-primary);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--bg-tertiary);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
`;

const ExportBtn = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  align-self: flex-end;
  min-height: 44px;
  touch-action: manipulation;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    align-self: stretch;
    grid-column: 1;
  }

  @media (max-width: 480px) {
    padding: 0.65rem 1.2rem;
    font-size: 0.9rem;
  }
`;

const BestOptionBanner = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1.5rem;
    gap: 1rem;
    text-align: center;
  }

  @media (max-width: 480px) {
    padding: 1.2rem;
    border-radius: 10px;
  }
`;

const BestIcon = styled.div`
  font-size: 2.5rem;
  min-width: 60px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
    min-width: auto;
  }
`;

const BestContent = styled.div`
  flex: 1;
`;

const BestLabel = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;

  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const BestBank = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.5rem 0;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin: 0.4rem 0;
  }
`;

const BestDetails = styled.div`
  font-size: 1rem;
  opacity: 0.95;
`;

const BestValue = styled.span`
  font-weight: 700;
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    gap: 1.5rem;
    grid-template-columns: 1fr;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const BankCard = styled.div<{ isBest?: boolean }>`
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.isBest ? 'var(--accent-primary)' : 'transparent'};
  box-shadow: ${props => props.isBest 
    ? '0 8px 24px rgba(102, 126, 234, 0.2)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1.2rem;
    border-radius: 10px;
  }
`;

const BestBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 2rem;
  background: var(--accent-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const BankName = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
  margin-top: ${props => props.theme ? '0.5rem' : '0'};
`;

const Rate = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
`;

const RateLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

const RateValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--accent-primary);
`;

const Metric = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--bg-tertiary);

  &:last-of-type {
    border-bottom: none;
  }
`;

const MetricLabel = styled.span`
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const MetricValue = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const SavingsBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  padding: 0.75rem;
  border-radius: 6px;
  margin: 1rem 0;
  font-size: 0.9rem;
  font-weight: 600;
`;

const BankDetails = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--bg-tertiary);
  font-size: 0.85rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  color: var(--text-secondary);

  &:last-child {
    margin-bottom: 0;
  }
`;

const Phone = styled.a`
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const WebLink = styled.a`
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    text-decoration: underline;
  }
`;

const SelectBtn = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  min-height: 44px;
  touch-action: manipulation;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
    background: #5566d8;
  }

  @media (max-width: 480px) {
    padding: 0.65rem;
    font-size: 0.9rem;
  }
`;

export default FinancingComparisonPage;

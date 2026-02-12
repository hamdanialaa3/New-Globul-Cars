/**
 * Financing Calculator Page
 * Interactive car financing and payment calculator
 * Location: Bulgaria | Currency: EUR
 * 
 * File: src/pages/financing/FinancingCalculatorPage.tsx
 * Created: February 8, 2026
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import {
  DollarSign,
  Calendar,
  Percent,
  TrendingDown,
  Download,
  BarChart3
} from 'lucide-react';
import { financingCalculatorService, FinancingCalculation } from '../../services/financing/financing-calculator.service';
import { getActiveBanks, getInterestRateForBank } from '../../config/banking-partners';
import { useLanguage } from '../../contexts/LanguageContext';
import { serviceLogger } from '../../services/logger-service';

export const FinancingCalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [carPrice, setCarPrice] = useState<number>(25000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [tradeInValue, setTradeInValue] = useState<number>(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [includeInsurance, setIncludeInsurance] = useState<boolean>(false);
  const [includeMaintenance, setIncludeMaintenance] = useState<boolean>(false);
  const [selectedBank, setSelectedBank] = useState<string>('dsk');
  const [customRate, setCustomRate] = useState<number>(5.5);
  const [useCustomRate, setUseCustomRate] = useState<boolean>(false);
  const [durationMonths, setDurationMonths] = useState<number>(60);
  const [calculation, setCalculation] = useState<FinancingCalculation | null>(null);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const effectiveCarPrice = useMemo(
    () => Math.max(0, carPrice - tradeInValue),
    [carPrice, tradeInValue]
  );

  const downPayment = useMemo(
    () => Math.round(effectiveCarPrice * (downPaymentPercent / 100) * 100) / 100,
    [effectiveCarPrice, downPaymentPercent]
  );

  const loanAmount = useMemo(
    () => effectiveCarPrice - downPayment,
    [effectiveCarPrice, downPayment]
  );

  // Insurance: ~2-4% of car value per year, divided by 12 months
  const monthlyInsurance = useMemo(
    () => includeInsurance ? Math.round((carPrice * 0.03) / 12) : 0,
    [includeInsurance, carPrice]
  );

  // Maintenance: ~€50-150/month depending on car value
  const monthlyMaintenance = useMemo(
    () => includeMaintenance ? Math.round(50 + (carPrice / 50000) * 100) : 0,
    [includeMaintenance, carPrice]
  );

  // Affordability check (debt-to-income ratio)
  const debtToIncomeRatio = useMemo(() => {
    if (!calculation || !monthlyIncome || monthlyIncome <= 0) return null;
    const totalMonthly = calculation.monthlyPayment + monthlyInsurance + monthlyMaintenance;
    return (totalMonthly / monthlyIncome) * 100;
  }, [calculation, monthlyIncome, monthlyInsurance, monthlyMaintenance]);

  const interestRate = useMemo(() => {
    if (useCustomRate) {
      return customRate;
    }
    return getInterestRateForBank(selectedBank, durationMonths);
  }, [useCustomRate, customRate, selectedBank, durationMonths]);

  const handleCalculate = () => {
    try {
      const result = financingCalculatorService.calculate({
        carPrice: effectiveCarPrice,
        downPayment,
        durationMonths,
        annualInterestRate: interestRate
      });
      setCalculation(result);
      serviceLogger.info('Financing calculated', { 
        carPrice, 
        tradeInValue, 
        effectiveCarPrice,
        durationMonths, 
        interestRate,
        includeInsurance,
        includeMaintenance
      });
    } catch (error) {
      serviceLogger.error('Calculation failed', error as Error);
      toast.error('Error calculating financing. Please check your inputs.');
    }
  };

  const handleExportPDF = () => {
    if (!calculation) return;

    const content = `
FINANCING CALCULATION REPORT
Car Price: €${carPrice.toLocaleString('bg-BG')}
Down Payment: €${downPayment.toLocaleString('bg-BG')} (${downPaymentPercent}%)
Loan Amount: €${calculation.loanAmount.toLocaleString('bg-BG')}
Monthly Payment: €${calculation.monthlyPayment.toLocaleString('bg-BG')}
Total Interest: €${calculation.totalInterest.toLocaleString('bg-BG')}
Duration: ${durationMonths} months
Interest Rate: ${interestRate}%
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `financing-report-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const activeBank = getActiveBanks().find(b => b.id === selectedBank);

  return (
    <Container>
      <Helmet>
        <title>Калкулатор за финансиране на автомобили | Koli One</title>
        <meta
          name="description"
          content="Изчислете месечната си вноска за автомобилен кредит в България. Сравнете условията на 5 водещи банки - DSK, UniCredit, Raiffeisen, FIBank и Société Générale. Лихви от 5.1% до 8.5%."
        />
        <meta
          name="keywords"
          content="калкулатор финансиране, автомобилен кредит България, DSK, UniCredit, Raiffeisen, лихви, кредит за кола, месечна вноска"
        />
        <link rel="canonical" href="https://koli.one/financing" />
        <meta property="og:title" content="Калкулатор за финансиране на автомобили в България" />
        <meta
          property="og:description"
          content="Изчислете месечната вноска за автомобилен кредит. Сравнете условията на 5 български банки с лихви от 5.1%."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://koli.one/financing" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FinancialProduct",
            "name": "Калкулатор за финансиране на автомобили",
            "description": "Изчислете месечната си вноска за автомобилен кредит в България",
            "provider": {
              "@type": "Organization",
              "name": "Koli One",
              "url": "https://koli.one"
            },
            "offers": [
              {
                "@type": "Offer",
                "name": "DSK Bank Автокредит",
                "price": "5.1-7.8%",
                "priceCurrency": "EUR"
              },
              {
                "@type": "Offer",
                "name": "UniCredit Bulbank Автокредит",
                "price": "5.5-8.2%",
                "priceCurrency": "EUR"
              },
              {
                "@type": "Offer",
                "name": "Raiffeisen Bank Автокредит",
                "price": "5.3-8.0%",
                "priceCurrency": "EUR"
              }
            ]
          })}
        </script>
      </Helmet>

      <Header>
        <Title>
          <DollarSign size={32} />
          Car Financing Calculator
        </Title>
        <Subtitle>
          Calculate your monthly car payments with Bulgarian bank financing
        </Subtitle>
      </Header>

      <MainGrid>
        <InputSection>
          <SectionTitle>Financing Details</SectionTitle>

          <InputGroup>
            <Label>Car Price (EUR)</Label>
            <PriceInput
              type="range"
              min="5000"
              max="100000"
              value={carPrice}
              onChange={(e) => setCarPrice(Number(e.target.value))}
            />
            <InputDisplay>
              <DollarSign size={18} />
              {carPrice.toLocaleString('bg-BG')} €
            </InputDisplay>
          </InputGroup>

          <InputGroup>
            <Label>Down Payment ({downPaymentPercent}%)</Label>
            <PriceInput
              type="range"
              min="0"
              max="50"
              step="5"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            />
            <InputDisplay>
              <TrendingDown size={18} />
              {downPayment.toLocaleString('bg-BG')} € (Loan: {loanAmount.toLocaleString('bg-BG')} €)
            </InputDisplay>
          </InputGroup>

          <InputGroup>
            <Label>Trade-in Value (Optional)</Label>
            <PriceInput
              type="range"
              min="0"
              max={Math.floor(carPrice * 0.6)}
              step="500"
              value={tradeInValue}
              onChange={(e) => setTradeInValue(Number(e.target.value))}
            />
            <InputDisplay>
              <DollarSign size={18} />
              {tradeInValue.toLocaleString('bg-BG')} € {tradeInValue > 0 && `(Effective Price: ${effectiveCarPrice.toLocaleString('bg-BG')} €)`}
            </InputDisplay>
            {tradeInValue > 0 && (
              <TradeInNote>
                Your trade-in reduces the car price, lowering your loan amount.
              </TradeInNote>
            )}
          </InputGroup>

          <InputGroup>
            <Label>Loan Duration (Months)</Label>
            <PriceInput
              type="range"
              min="12"
              max="84"
              step="12"
              value={durationMonths}
              onChange={(e) => setDurationMonths(Number(e.target.value))}
            />
            <InputDisplay>
              <Calendar size={18} />
              {durationMonths} months ({Math.floor(durationMonths / 12)} years)
            </InputDisplay>
          </InputGroup>

          <SectionTitle>Additional Costs</SectionTitle>

          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              id="insurance"
              checked={includeInsurance}
              onChange={(e) => setIncludeInsurance(e.target.checked)}
            />
            <CheckboxLabel htmlFor="insurance">
              Include Insurance (~3% annually)
              {includeInsurance && (
                <CheckboxValue>+{monthlyInsurance.toLocaleString('bg-BG')} €/month</CheckboxValue>
              )}
            </CheckboxLabel>
          </CheckboxGroup>

          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              id="maintenance"
              checked={includeMaintenance}
              onChange={(e) => setIncludeMaintenance(e.target.checked)}
            />
            <CheckboxLabel htmlFor="maintenance">
              Include Maintenance Budget
              {includeMaintenance && (
                <CheckboxValue>+{monthlyMaintenance.toLocaleString('bg-BG')} €/month</CheckboxValue>
              )}
            </CheckboxLabel>
          </CheckboxGroup>

          <InputGroup>
            <Label>Monthly Income (for affordability check)</Label>
            <PriceInput
              type="number"
              min="0"
              step="100"
              value={monthlyIncome || ''}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              placeholder="Enter your monthly income (optional)"
            />
            {monthlyIncome > 0 && (
              <InputDisplay>
                <DollarSign size={18} />
                {monthlyIncome.toLocaleString('bg-BG')} €/month
              </InputDisplay>
            )}
          </InputGroup>

          <SectionTitle>Bank Selection</SectionTitle>

          <BankToggle>
            <ToggleButton
              active={!useCustomRate}
              onClick={() => setUseCustomRate(false)}
            >
              Use Bank Rates
            </ToggleButton>
            <ToggleButton
              active={useCustomRate}
              onClick={() => setUseCustomRate(true)}
            >
              Custom Rate
            </ToggleButton>
          </BankToggle>

          {!useCustomRate && (
            <BankSelector>
              {getActiveBanks().map((bank) => (
                <BankCard
                  key={bank.id}
                  selected={selectedBank === bank.id}
                  onClick={() => setSelectedBank(bank.id)}
                >
                  <BankName>{bank.name}</BankName>
                  <BankRate>
                    {getInterestRateForBank(bank.id, durationMonths).toFixed(2)}%
                  </BankRate>
                </BankCard>
              ))}
            </BankSelector>
          )}

          {useCustomRate && (
            <InputGroup>
              <Label>Annual Interest Rate (%)</Label>
              <PriceInput
                type="range"
                min="0"
                max="15"
                step="0.1"
                value={customRate}
                onChange={(e) => setCustomRate(Number(e.target.value))}
              />
              <InputDisplay>
                <Percent size={18} />
                {customRate.toFixed(2)}%
              </InputDisplay>
            </InputGroup>
          )}

          <CalculateButton onClick={handleCalculate}>
            Calculate Payment
          </CalculateButton>
        </InputSection>

        {calculation && (
          <ResultsSection>
            <SectionTitle>Payment Summary</SectionTitle>

            <ResultCard highlight>
              <ResultLabel>Monthly Loan Payment</ResultLabel>
              <ResultValue>€{calculation.monthlyPayment.toLocaleString('bg-BG')}</ResultValue>
            </ResultCard>

            {(includeInsurance || includeMaintenance) && (
              <AdditionalCosts>
                <CostRow>
                  <CostLabel>Base Loan Payment:</CostLabel>
                  <CostValue>€{calculation.monthlyPayment.toLocaleString('bg-BG')}</CostValue>
                </CostRow>
                {includeInsurance && (
                  <CostRow>
                    <CostLabel>+ Insurance:</CostLabel>
                    <CostValue>€{monthlyInsurance.toLocaleString('bg-BG')}</CostValue>
                  </CostRow>
                )}
                {includeMaintenance && (
                  <CostRow>
                    <CostLabel>+ Maintenance:</CostLabel>
                    <CostValue>€{monthlyMaintenance.toLocaleString('bg-BG')}</CostValue>
                  </CostRow>
                )}
                <CostDivider />
                <CostRow total>
                  <CostLabel>Total Monthly Cost:</CostLabel>
                  <CostValue>€{(calculation.monthlyPayment + monthlyInsurance + monthlyMaintenance).toLocaleString('bg-BG')}</CostValue>
                </CostRow>
              </AdditionalCosts>
            )}

            {debtToIncomeRatio !== null && monthlyIncome > 0 && (
              <AffordabilityCard
                status={
                  debtToIncomeRatio < 35 ? 'excellent' :
                  debtToIncomeRatio < 45 ? 'good' :
                  debtToIncomeRatio < 55 ? 'moderate' : 'high'
                }
              >
                <AffordabilityHeader>
                  Affordability Assessment
                </AffordabilityHeader>
                <AffordabilityRatio>
                  <RatioLabel>Debt-to-Income Ratio:</RatioLabel>
                  <RatioValue>{debtToIncomeRatio.toFixed(1)}%</RatioValue>
                </AffordabilityRatio>
                <AffordabilityStatus>
                  {debtToIncomeRatio < 35 && (
                    <StatusText status="excellent">
                      ✓ Excellent - Well within recommended limits
                    </StatusText>
                  )}
                  {debtToIncomeRatio >= 35 && debtToIncomeRatio < 45 && (
                    <StatusText status="good">
                      ✓ Good - Manageable debt level
                    </StatusText>
                  )}
                  {debtToIncomeRatio >= 45 && debtToIncomeRatio < 55 && (
                    <StatusText status="moderate">
                      ⚠ Moderate - Consider reducing loan duration or car price
                    </StatusText>
                  )}
                  {debtToIncomeRatio >= 55 && (
                    <StatusText status="high">
                      ⚠ High Risk - This may strain your budget
                    </StatusText>
                  )}
                </AffordabilityStatus>
                <AffordabilityNote>
                  Ideal debt-to-income ratio is below 35%. Banks typically approve up to 45%.
                </AffordabilityNote>
              </AffordabilityCard>
            )}

            <ResultCard accent>
              <ResultLabel>Total Interest</ResultLabel>
              <ResultValue>€{calculation.totalInterest.toLocaleString('bg-BG')}</ResultValue>
            </ResultCard>

            <ResultCard>
              <ResultLabel>Total Amount Paid</ResultLabel>
              <ResultValue>€{calculation.totalPayment.toLocaleString('bg-BG')}</ResultValue>
            </ResultCard>

            <ResultCard>
              <ResultLabel>Interest Rate (Annual)</ResultLabel>
              <ResultValue>{calculation.annualInterestRate.toFixed(2)}%</ResultValue>
            </ResultCard>

            <ResultCard>
              <ResultLabel>Effective Annual Rate</ResultLabel>
              <ResultValue>{calculation.effectiveAnnualRate.toFixed(2)}%</ResultValue>
            </ResultCard>

            <ScheduleToggle onClick={() => setShowSchedule(!showSchedule)}>
              <BarChart3 size={18} />
              {showSchedule ? 'Hide Payment Schedule' : 'Show Payment Schedule'}
            </ScheduleToggle>

            <ExportButton onClick={handleExportPDF}>
              <Download size={18} />
              Export Report
            </ExportButton>

            <CompareButton onClick={() => navigate('/financing/compare')}>
              <BarChart3 size={18} />
              Compare All Banks
            </CompareButton>
          </ResultsSection>
        )}
      </MainGrid>

      {calculation && showSchedule && (
        <ScheduleSection>
          <SectionTitle>Amortization Schedule (First 12 months)</SectionTitle>
          <ScheduleTable>
            <thead>
              <tr>
                <th>Month</th>
                <th>Payment</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {calculation.amortizationSchedule.slice(0, 12).map((month) => (
                <tr key={month.month}>
                  <td>{month.month}</td>
                  <td>€{month.payment.toLocaleString('bg-BG')}</td>
                  <td>€{month.principal.toLocaleString('bg-BG')}</td>
                  <td>€{month.interest.toLocaleString('bg-BG')}</td>
                  <td>€{month.balance.toLocaleString('bg-BG')}</td>
                </tr>
              ))}
            </tbody>
          </ScheduleTable>
          {calculation.amortizationSchedule.length > 12 && (
            <MorePayments>
              ... and {calculation.amortizationSchedule.length - 12} more payments
            </MorePayments>
          )}
        </ScheduleSection>
      )}

      {activeBank && !useCustomRate && (
        <BankInfoSection>
          <BankInfoTitle>{activeBank.name}</BankInfoTitle>
          <BankInfo>
            <InfoItem>
              <strong>Loan Range:</strong> €{activeBank.minLoan.toLocaleString('bg-BG')} - €{activeBank.maxLoan.toLocaleString('bg-BG')}
            </InfoItem>
            <InfoItem>
              <strong>Duration Range:</strong> {activeBank.minDuration} - {activeBank.maxDuration} months
            </InfoItem>
            <InfoItem>
              <strong>Base Rate:</strong> {activeBank.baseRate}%
            </InfoItem>
            <InfoLink href={activeBank.website} target="_blank">
              Visit {activeBank.name} Website →
            </InfoLink>
          </BankInfo>
        </BankInfoSection>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }

  @media (max-width: 480px) {
    padding: 20px 12px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0 0 12px 0;

  @media (max-width: 768px) {
    font-size: 26px;
    gap: 8px;
  }

  @media (max-width: 480px) {
    font-size: 22px;
    flex-direction: column;
    gap: 8px;
  }

  svg {
    @media (max-width: 480px) {
      width: 20px;
      height: 20px;
    }
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
    padding: 0 8px;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const InputSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

const ResultsSection = styled(InputSection)``;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 24px 0;

  @media (max-width: 768px) {
    font-size: 16px;
    margin: 0 0 16px 0;
  }

  @media (max-width: 480px) {
    font-size: 15px;
    margin: 0 0 12px 0;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
`;

const PriceInput = styled.input`
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #ddd;
  padding: 0 12px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
`;

const InputDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 12px;
  background: #f0f8ff;
  border-radius: 8px;
  font-weight: 500;
  color: #0066cc;
`;

const BankToggle = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    gap: 8px;
    margin-bottom: 16px;
  }
`;

const ToggleButton = styled.button<{ active: boolean }>`
  padding: 12px 16px;
  border: 2px solid ${props => props.active ? '#0066cc' : '#ddd'};
  background: ${props => props.active ? '#0066cc' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  min-height: 44px;

  &:hover {
    border-color: #0066cc;
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 14px;
  }
`;

const BankSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 24px;
`;

const BankCard = styled.div<{ selected: boolean }>`
  padding: 16px;
  border: 2px solid ${props => props.selected ? '#0066cc' : '#ddd'};
  border-radius: 8px;
  background: ${props => props.selected ? '#f0f8ff' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0066cc;
  }
`;

const BankName = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
`;

const BankRate = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #0066cc;
`;

const CalculateButton = styled.button`
  width: 100%;
  padding: 14px 24px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;
  touch-action: manipulation;

  &:hover {
    background: #0052a3;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    background: #004080;
  }

  @media (max-width: 480px) {
    padding: 12px 20px;
    font-size: 15px;
  }
`;

const ResultCard = styled.div<{ accent?: boolean }>`
  background: ${props => props.accent ? '#f0f8ff' : '#fafafa'};
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 4px solid ${props => props.accent ? '#0066cc' : '#ddd'};
`;

const ResultLabel = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
`;

const ResultValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #0066cc;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const ScheduleToggle = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  margin-bottom: 12px;

  &:hover {
    background: #f5f5f5;
    border-color: #0066cc;
  }
`;

const ExportButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    border-color: #0066cc;
    color: #0066cc;
  }
`;

const CompareButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  margin-top: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  }
`;

const ScheduleSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
`;

const ScheduleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th, td {
    padding: 12px;
    text-align: right;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    background: #f0f0f0;
    font-weight: 600;
    text-align: left;
  }

  tr:hover {
    background: #fafafa;
  }

  @media (max-width: 768px) {
    font-size: 13px;
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    th, td {
      padding: 10px 8px;
      white-space: nowrap;
    }
  }

  @media (max-width: 480px) {
    font-size: 12px;

    th, td {
      padding: 8px 6px;
    }
  }
`;

const MorePayments = styled.div`
  text-align: center;
  padding: 16px;
  color: #666;
  font-size: 14px;
`;

const BankInfoSection = styled.div`
  background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
  border-radius: 12px;
  padding: 24px;
  color: white;
`;

const BankInfoTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 20px;
`;

const BankInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InfoItem = styled.div`
  font-size: 14px;
  line-height: 1.5;
`;

const InfoLink = styled.a`
  color: white;
  text-decoration: underline;
  &:hover {
    opacity: 0.8;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f8ff;
    border-color: #0066cc;
  }
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin-top: 2px;
  cursor: pointer;
  accent-color: #0066cc;
`;

const CheckboxLabel = styled.label`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CheckboxValue = styled.span`
  color: #0066cc;
  font-weight: 600;
  font-size: 13px;
`;

const TradeInNote = styled.div`
  margin-top: 8px;
  padding: 8px 12px;
  background: #e8f5e9;
  border-left: 3px solid #4caf50;
  border-radius: 4px;
  font-size: 13px;
  color: #2e7d32;
`;

const AdditionalCosts = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const CostRow = styled.div<{ total?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: ${props => props.total ? '16px' : '14px'};
  font-weight: ${props => props.total ? '700' : '400'};
  color: ${props => props.total ? '#0066cc' : '#666'};
`;

const CostLabel = styled.span``;

const CostValue = styled.span`
  font-weight: 600;
`;

const CostDivider = styled.div`
  height: 1px;
  background: #ddd;
  margin: 8px 0;
`;

const AffordabilityCard = styled.div<{ status: 'excellent' | 'good' | 'moderate' | 'high' }>`
  background: ${props => {
    switch(props.status) {
      case 'excellent': return 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)';
      case 'good': return 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)';
      case 'moderate': return 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)';
      case 'high': return 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)';
    }
  }};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 2px solid ${props => {
    switch(props.status) {
      case 'excellent': return '#4caf50';
      case 'good': return '#2196f3';
      case 'moderate': return '#ff9800';
      case 'high': return '#f44336';
    }
  }};

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 14px;
    border-radius: 8px;
    margin-bottom: 12px;
  }
`;

const AffordabilityHeader = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #333;
`;

const AffordabilityRatio = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
`;

const RatioLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #666;
`;

const RatioValue = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #0066cc;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const AffordabilityStatus = styled.div`
  margin-bottom: 12px;
`;

const StatusText = styled.div<{ status: 'excellent' | 'good' | 'moderate' | 'high' }>`
  padding: 12px;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => {
    switch(props.status) {
      case 'excellent': return '#2e7d32';
      case 'good': return '#1565c0';
      case 'moderate': return '#ef6c00';
      case 'high': return '#c62828';
    }
  }};
`;

const AffordabilityNote = styled.div`
  font-size: 12px;
  color: #666;
  font-style: italic;
  line-height: 1.4;
`;

export default FinancingCalculatorPage;

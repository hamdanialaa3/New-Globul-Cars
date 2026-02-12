import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';

const FinanceContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1a1a2e' : (theme.colors?.background?.default || theme.colors.background.default || '#ffffff')};
  min-height: 100vh;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f9fafb' : (theme.colors?.text?.primary || theme.text?.primary || '#333')};
  text-align: center;
  margin-bottom: 3rem;
`;

const FinanceOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const FinanceCard = styled.div`
  background: ${({ theme }) => 
    theme.mode === 'dark' 
      ? 'linear-gradient(135deg, #4c5fd5 0%, #5a3a8a 100%)' 
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  color: white;
  border-radius: 20px;
  padding: 2.5rem;
  text-align: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: white;
`;

const CardDescription = styled.p`
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
  color: white;
`;

const CalculatorSection = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? '#1e293b' : (theme.colors?.background?.paper || theme.colors.background.light || '#ffffff')};
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px ${({ theme }) => theme.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'};
  margin-bottom: 3rem;
`;

const CalculatorTitle = styled.h2`
  color: ${({ theme }) => theme.mode === 'dark' ? '#f9fafb' : (theme.colors?.text?.primary || theme.text?.primary || '#333')};
  text-align: center;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: ${({ theme }) => theme.mode === 'dark' ? '#e5e7eb' : (theme.colors?.text?.primary || theme.text?.primary || '#333')};
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid ${({ theme }) => theme.mode === 'dark' ? '#475569' : (theme.colors?.border || theme.colors.border.default || '#e1e8ed')};
  background: ${({ theme }) => theme.mode === 'dark' ? '#0f172a' : (theme.colors?.background?.default || theme.colors.background.default || '#ffffff')};
  color: ${({ theme }) => theme.mode === 'dark' ? '#e5e7eb' : (theme.colors?.text?.primary || theme.text?.primary || '#333')};
  border-radius: 10px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary?.main || theme.colors.primary.main || '#667eea'};
  }
`;

const CalculateButton = styled.button`
  background: ${({ theme }) => 
    theme.mode === 'dark' 
      ? 'linear-gradient(135deg, #4c5fd5 0%, #5a3a8a 100%)' 
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

const ResultCard = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? '#334155' : (theme.colors?.background?.light || theme.colors.background.light || '#f8f9fa')};
  border-radius: 15px;
  padding: 2rem;
  margin-top: 2rem;
  text-align: center;
`;

const ResultTitle = styled.h3`
  color: ${({ theme }) => theme.mode === 'dark' ? '#f3f4f6' : (theme.colors?.text?.primary || theme.text?.primary || '#333')};
  margin-bottom: 1rem;
`;

const MonthlyPayment = styled.div`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors?.primary?.main || theme.colors.primary.main || '#667eea'};
  font-weight: bold;
  margin-bottom: 1rem;
`;

const FinancePage: React.FC = () => {
  const { language } = useLanguage();
  const [carPrice, setCarPrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [interestRate, setInterestRate] = useState('4.5');
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);

  const calculateLoan = () => {
    const price = parseFloat(carPrice);
    const down = parseFloat(downPayment);
    const term = parseFloat(loanTerm);
    const rate = parseFloat(interestRate) / 100 / 12;

    if (price && down && term && rate) {
      const loanAmount = price - down;
      const payment = (loanAmount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
      setMonthlyPayment(payment);
    }
  };

  const financeOptions = [
    {
      title: language === 'bg' ? 'Традиционно финансиране' : 'Traditional Financing',
      description: language === 'bg' 
        ? 'Гъвкави решения за финансиране с конкурентни лихвени проценти от 4.5% годишно'
        : 'Flexible financing solutions with competitive interest rates starting from 4.5% annually',
      features: language === 'bg' 
        ? ['Ниски лихви', 'Гъвкав срок', 'Опростени процедури']
        : ['Low rates', 'Flexible term', 'Simplified procedures']
    },
    {
      title: language === 'bg' ? 'Лизинг' : 'Leasing',
      description: language === 'bg'
        ? 'Вземете вашата кола под наем с опция за покупка в края на срока'
        : 'Lease your car with a purchase option at the end of the term',
      features: language === 'bg'
        ? ['По-ниски месечни вноски', 'Гъвкавост при смяна', 'Пълна гаранция']
        : ['Lower monthly payments', 'Flexibility to switch', 'Full warranty']
    },
    {
      title: language === 'bg' ? 'Банково финансиране' : 'Bank Financing',
      description: language === 'bg'
        ? 'Прозрачни решения за финансиране с ясни условия'
        : 'Transparent financing solutions with clear terms',
      features: language === 'bg'
        ? ['Прозрачни условия', 'Бързо одобрение', 'Пълна прозрачност']
        : ['Transparent terms', 'Fast approval', 'Full transparency']
    }
  ];

  return (
    <FinanceContainer>
      <PageTitle>
        {language === 'bg' ? 'Финансови решения' : 'Finance Solutions'}
      </PageTitle>
      
      <FinanceOptions>
        {financeOptions.map((option, index) => (
          <FinanceCard key={index}>
            <CardTitle>{option.title}</CardTitle>
            <CardDescription>{option.description}</CardDescription>
            <ul style={{ textAlign: language === 'bg' ? 'left' : 'left', paddingLeft: '1rem', listStyle: 'none' }}>
              {option.features.map((feature, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>✓ {feature}</li>
              ))}
            </ul>
          </FinanceCard>
        ))}
      </FinanceOptions>

      <CalculatorSection>
        <CalculatorTitle>
          {language === 'bg' ? 'Калкулатор за финансиране' : 'Finance Calculator'}
        </CalculatorTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <FormGroup>
            <Label>{language === 'bg' ? 'Цена на колата (EUR)' : 'Car Price (EUR)'}</Label>
            <Input
              type="number"
              value={carPrice}
              onChange={(e) => setCarPrice(e.target.value)}
              placeholder={language === 'bg' ? 'Пример: 25000' : 'Example: 25000'}
            />
          </FormGroup>

          <FormGroup>
            <Label>{language === 'bg' ? 'Първоначална вноска (EUR)' : 'Down Payment (EUR)'}</Label>
            <Input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              placeholder={language === 'bg' ? 'Пример: 5000' : 'Example: 5000'}
            />
          </FormGroup>

          <FormGroup>
            <Label>{language === 'bg' ? 'Срок на финансиране (месеци)' : 'Loan Term (months)'}</Label>
            <Input
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              placeholder={language === 'bg' ? 'Пример: 60' : 'Example: 60'}
            />
          </FormGroup>

          <FormGroup>
            <Label>{language === 'bg' ? 'Годишен лихвен процент (%)' : 'Annual Interest Rate (%)'}</Label>
            <Input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder={language === 'bg' ? 'Пример: 4.5' : 'Example: 4.5'}
            />
          </FormGroup>
        </div>

        <CalculateButton onClick={calculateLoan}>
          {language === 'bg' ? 'Изчисли месечна вноска' : 'Calculate Monthly Payment'}
        </CalculateButton>

        {monthlyPayment && (
          <ResultCard>
            <ResultTitle>
              {language === 'bg' ? 'Приблизителна месечна вноска' : 'Estimated Monthly Payment'}
            </ResultTitle>
            <MonthlyPayment>
              €{monthlyPayment.toFixed(2)}
            </MonthlyPayment>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              {language === 'bg' 
                ? 'Това е приблизителен резултат. Свържете се с нас за точна оферта.'
                : 'This is an estimated result. Contact us for an accurate quote.'}
            </p>
          </ResultCard>
        )}
      </CalculatorSection>

      <div style={{ textAlign: 'center' }}>
        <CalculateButton style={{ maxWidth: '300px' }}>
          {language === 'bg' ? 'Свържете се със съветник' : 'Contact Finance Advisor'}
        </CalculateButton>
      </div>

      {/* Company Footer */}
      <div style={{ 
        marginTop: '3rem', 
        padding: '2rem', 
        background: 'rgba(148, 163, 184, 0.1)',
        borderRadius: '20px', 
        textAlign: 'center',
        fontSize: '0.95em'
      }}>
        <strong>Alaa Technologies</strong><br />
        {language === 'bg' 
          ? 'бул. Цар Симеон 77, София, България' 
          : '77 Tsar Simeon Blvd, Sofia, Bulgaria'}<br />
        📧 <a href="mailto:payments@koli.one" style={{ color: '#667eea' }}>payments@koli.one</a><br />
        📞 +359 87 983 9671 ({language === 'bg' ? 'само текстови съобщения' : 'text messages only'})<br />
        <span style={{ fontSize: '0.9em', opacity: 0.8 }}>
          © 2026 Alaa Technologies. {language === 'bg' ? 'Всички права запазени' : 'All rights reserved'}
        </span>
      </div>
    </FinanceContainer>
  );
};

export default FinancePage;
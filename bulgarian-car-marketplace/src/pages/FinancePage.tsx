import React, { useState } from 'react';
import styled from 'styled-components';

const FinanceContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
`;

const CardDescription = styled.p`
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
`;

const CalculatorSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  margin-bottom: 3rem;
`;

const CalculatorTitle = styled.h2`
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const CalculateButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background: #f8f9fa;
  border-radius: 15px;
  padding: 2rem;
  margin-top: 2rem;
  text-align: center;
`;

const ResultTitle = styled.h3`
  color: #333;
  margin-bottom: 1rem;
`;

const MonthlyPayment = styled.div`
  font-size: 2rem;
  color: #667eea;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const FinancePage: React.FC = () => {
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
      title: 'تمويل تقليدي',
      description: 'حلول تمويل مرنة بمعدلات فائدة تنافسية تبدأ من 4.5% سنوياً',
      features: ['معدلات منخفضة', 'مدة تمويل مرنة', 'إجراءات مبسطة']
    },
    {
      title: 'التأجير التمويلي',
      description: 'استأجر سيارتك مع خيار الشراء في نهاية المدة',
      features: ['دفعات شهرية أقل', 'مرونة في التبديل', 'ضمان شامل']
    },
    {
      title: 'تمويل إسلامي',
      description: 'حلول تمويل متوافقة مع الشريعة الإسلامية',
      features: ['بدون فوائد ربوية', 'أحكام شرعية', 'شفافية كاملة']
    }
  ];

  return (
    <FinanceContainer>
      <PageTitle>حلول التمويل</PageTitle>
      
      <FinanceOptions>
        {financeOptions.map((option, index) => (
          <FinanceCard key={index}>
            <CardTitle>{option.title}</CardTitle>
            <CardDescription>{option.description}</CardDescription>
            <ul style={{ textAlign: 'right', paddingRight: '1rem' }}>
              {option.features.map((feature, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>✓ {feature}</li>
              ))}
            </ul>
          </FinanceCard>
        ))}
      </FinanceOptions>

      <CalculatorSection>
        <CalculatorTitle>حاسبة التمويل</CalculatorTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <FormGroup>
            <Label>سعر السيارة (يورو)</Label>
            <Input
              type="number"
              value={carPrice}
              onChange={(e) => setCarPrice(e.target.value)}
              placeholder="مثال: 25000"
            />
          </FormGroup>

          <FormGroup>
            <Label>الدفعة المقدمة (يورو)</Label>
            <Input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              placeholder="مثال: 5000"
            />
          </FormGroup>

          <FormGroup>
            <Label>مدة التمويل (بالشهور)</Label>
            <Input
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              placeholder="مثال: 60"
            />
          </FormGroup>

          <FormGroup>
            <Label>معدل الفائدة السنوي (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="مثال: 4.5"
            />
          </FormGroup>
        </div>

        <CalculateButton onClick={calculateLoan}>
          احسب القسط الشهري
        </CalculateButton>

        {monthlyPayment && (
          <ResultCard>
            <ResultTitle>القسط الشهري التقديري</ResultTitle>
            <MonthlyPayment>
              €{monthlyPayment.toFixed(2)}
            </MonthlyPayment>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              *هذا مجرد تقدير تقريبي. للحصول على عرض دقيق، يرجى التواصل مع مستشار التمويل
            </p>
          </ResultCard>
        )}
      </CalculatorSection>

      <div style={{ textAlign: 'center' }}>
        <CalculateButton style={{ maxWidth: '300px' }}>
          تواصل مع مستشار التمويل
        </CalculateButton>
      </div>
    </FinanceContainer>
  );
};

export default FinancePage;
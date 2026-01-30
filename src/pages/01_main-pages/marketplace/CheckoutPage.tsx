import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../hooks/useAuth';
import { CreditCard, Truck, CheckCircle, Lock } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';

const CheckoutPage: React.FC = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

  const [shippingData, setShippingData] = useState({
    fullName: user?.displayName || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cash'>('bank');

  const texts = {
    bg: {
      title: 'Финализиране на поръчка',
      shipping: 'Доставка',
      payment: 'Плащане',
      review: 'Преглед',
      fullName: 'Пълно име',
      phone: 'Телефон',
      address: 'Адрес',
      city: 'Град',
      postalCode: 'Пощенски код',
      notes: 'Бележки (опционално)',
      continue: 'Продължи',
      back: 'Назад',
      placeOrder: 'Потвърди поръчката',
      paymentMethods: 'Начини на плащане',
      bankTransfer: 'Банков превод',
      cashOnDelivery: 'Наложен платеж',
      orderSummary: 'Обобщение на поръчката',
      subtotal: 'Междинна сума',
      shippingCost: 'Доставка',
      total: 'Общо',
      bgn: 'лв',
      secureCheckout: 'Сигурна поръчка',
    },
    en: {
      title: 'Checkout',
      shipping: 'Shipping',
      payment: 'Payment',
      review: 'Review',
      fullName: 'Full Name',
      phone: 'Phone',
      address: 'Address',
      city: 'City',
      postalCode: 'Postal Code',
      notes: 'Notes (optional)',
      continue: 'Continue',
      back: 'Back',
      placeOrder: 'Place Order',
      paymentMethods: 'Payment Methods',
      bankTransfer: 'Bank Transfer',
      cashOnDelivery: 'Cash on Delivery',
      orderSummary: 'Order Summary',
      subtotal: 'Subtotal',
      shippingCost: 'Shipping',
      total: 'Total',
      bgn: 'BGN',
      secureCheckout: 'Secure Checkout',
    },
  };

  const t = texts[language] || texts.bg;

  const handlePlaceOrder = async () => {
    setLoading(true);
    // TODO: Implement order placement
    setTimeout(() => {
      setLoading(false);
      navigate('/marketplace/order-success');
    }, 2000);
  };

  const renderShippingForm = () => (
    <FormSection>
      <SectionTitle>{t.shipping}</SectionTitle>
      <FormGrid>
        <FormGroup>
          <Label>{t.fullName} *</Label>
          <Input
            value={shippingData.fullName}
            onChange={e => setShippingData({ ...shippingData, fullName: e.target.value })}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>{t.phone} *</Label>
          <Input
            type="tel"
            value={shippingData.phone}
            onChange={e => setShippingData({ ...shippingData, phone: e.target.value })}
            required
          />
        </FormGroup>
        <FormGroup $fullWidth>
          <Label>{t.address} *</Label>
          <Input
            value={shippingData.address}
            onChange={e => setShippingData({ ...shippingData, address: e.target.value })}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>{t.city} *</Label>
          <Input
            value={shippingData.city}
            onChange={e => setShippingData({ ...shippingData, city: e.target.value })}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>{t.postalCode}</Label>
          <Input
            value={shippingData.postalCode}
            onChange={e => setShippingData({ ...shippingData, postalCode: e.target.value })}
          />
        </FormGroup>
        <FormGroup $fullWidth>
          <Label>{t.notes}</Label>
          <Textarea
            value={shippingData.notes}
            onChange={e => setShippingData({ ...shippingData, notes: e.target.value })}
            rows={3}
          />
        </FormGroup>
      </FormGrid>
      <ButtonGroup>
        <SecondaryButton onClick={() => navigate('/marketplace/cart')}>
          {t.back}
        </SecondaryButton>
        <PrimaryButton onClick={() => setStep(2)}>
          {t.continue}
        </PrimaryButton>
      </ButtonGroup>
    </FormSection>
  );

  const renderPaymentForm = () => (
    <FormSection>
      <SectionTitle>{t.paymentMethods}</SectionTitle>
      <PaymentOptions>
        <PaymentOption
          $active={paymentMethod === 'bank'}
          onClick={() => setPaymentMethod('bank')}
        >
          <CreditCard size={24} />
          <div>
            <PaymentTitle>{t.bankTransfer}</PaymentTitle>
            <PaymentDesc>iCard / Revolut / ПОС</PaymentDesc>
          </div>
        </PaymentOption>
        <PaymentOption
          $active={paymentMethod === 'cash'}
          onClick={() => setPaymentMethod('cash')}
        >
          <Truck size={24} />
          <div>
            <PaymentTitle>{t.cashOnDelivery}</PaymentTitle>
            <PaymentDesc>Плащане при доставка</PaymentDesc>
          </div>
        </PaymentOption>
      </PaymentOptions>
      <ButtonGroup>
        <SecondaryButton onClick={() => setStep(1)}>
          {t.back}
        </SecondaryButton>
        <PrimaryButton onClick={() => setStep(3)}>
          {t.continue}
        </PrimaryButton>
      </ButtonGroup>
    </FormSection>
  );

  const renderReview = () => (
    <FormSection>
      <SectionTitle>{t.review}</SectionTitle>
      <ReviewSection>
        <ReviewBlock>
          <ReviewTitle>{t.shipping}</ReviewTitle>
          <ReviewText>{shippingData.fullName}</ReviewText>
          <ReviewText>{shippingData.phone}</ReviewText>
          <ReviewText>{shippingData.address}, {shippingData.city}</ReviewText>
        </ReviewBlock>
        <ReviewBlock>
          <ReviewTitle>{t.payment}</ReviewTitle>
          <ReviewText>
            {paymentMethod === 'bank' ? t.bankTransfer : t.cashOnDelivery}
          </ReviewText>
        </ReviewBlock>
      </ReviewSection>
      <ButtonGroup>
        <SecondaryButton onClick={() => setStep(2)}>
          {t.back}
        </SecondaryButton>
        <PrimaryButton onClick={handlePlaceOrder} disabled={loading}>
          {loading ? <LoadingSpinner size={20} /> : <CheckCircle size={20} />}
          {t.placeOrder}
        </PrimaryButton>
      </ButtonGroup>
    </FormSection>
  );

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>{t.title}</Title>
          <SecureBadge>
            <Lock size={16} />
            {t.secureCheckout}
          </SecureBadge>
        </Header>

        <Steps>
          <Step $active={step === 1} $completed={step > 1}>
            <StepNumber>1</StepNumber>
            <StepLabel>{t.shipping}</StepLabel>
          </Step>
          <StepLine $completed={step > 1} />
          <Step $active={step === 2} $completed={step > 2}>
            <StepNumber>2</StepNumber>
            <StepLabel>{t.payment}</StepLabel>
          </Step>
          <StepLine $completed={step > 2} />
          <Step $active={step === 3} $completed={false}>
            <StepNumber>3</StepNumber>
            <StepLabel>{t.review}</StepLabel>
          </Step>
        </Steps>

        <CheckoutGrid>
          <MainSection>
            {step === 1 && renderShippingForm()}
            {step === 2 && renderPaymentForm()}
            {step === 3 && renderReview()}
          </MainSection>

          <SidebarSection>
            <SummaryCard>
              <SummaryTitle>{t.orderSummary}</SummaryTitle>
              <SummaryRow>
                <span>{t.subtotal}:</span>
                <span>100.00 {t.bgn}</span>
              </SummaryRow>
              <SummaryRow>
                <span>{t.shippingCost}:</span>
                <span>5.00 {t.bgn}</span>
              </SummaryRow>
              <Divider />
              <TotalRow>
                <span>{t.total}:</span>
                <TotalAmount>105.00 {t.bgn}</TotalAmount>
              </TotalRow>
            </SummaryCard>
          </SidebarSection>
        </CheckoutGrid>
      </ContentWrapper>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || '#f8f9fa'};
  padding: 2rem 1rem;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme?.colors?.text || '#333'};
`;

const SecureBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  border-radius: 20px;
  font-size: 0.9rem;
`;

const Steps = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const StepNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme?.colors?.primary?.main || '#007bff'};
  color: white;
  font-weight: 600;
`;

const StepLabel = styled.span`
  font-size: 0.9rem;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
`;

const StepLine = styled.div<{ $completed: boolean }>`
  width: 100px;
  height: 2px;
  background: ${props => props.$completed ? props.theme?.colors?.primary?.main || '#007bff' : '#ddd'};
  margin: 0 1rem;
`;

const CheckoutGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const MainSection = styled.div``;

const FormSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme?.colors?.text || '#333'};
  margin-bottom: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div<{ $fullWidth?: boolean }>`
  grid-column: ${props => props.$fullWidth ? '1 / -1' : 'auto'};
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme?.colors?.text || '#333'};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme?.colors?.border || '#ddd'};
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.primary?.main || '#007bff'};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme?.colors?.border || '#ddd'};
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${props => props.theme?.colors?.primary?.main || '#007bff'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const PrimaryButton = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.theme?.colors?.primary?.main || '#007bff'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.theme?.colors?.primary?.dark || '#0056b3'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  padding: 1rem 2rem;
  background: white;
  color: ${props => props.theme?.colors?.text || '#333'};
  border: 1px solid ${props => props.theme?.colors?.border || '#ddd'};
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
  }
`;

const PaymentOptions = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PaymentOption = styled.div<{ $active: boolean }>`
  padding: 1.5rem;
  border: 2px solid ${props => props.$active ? props.theme?.colors?.primary?.main || '#007bff' : props.theme?.colors?.border || '#ddd'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? 'rgba(0, 123, 255, 0.05)' : 'white'};

  &:hover {
    border-color: ${props => props.theme?.colors?.primary?.main || '#007bff'};
  }
`;

const PaymentTitle = styled.div`
  font-weight: 600;
  color: ${props => props.theme?.colors?.text || '#333'};
`;

const PaymentDesc = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
`;

const ReviewSection = styled.div`
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ReviewBlock = styled.div`
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const ReviewTitle = styled.h3`
  font-size: 1.1rem;
  color: ${props => props.theme?.colors?.text || '#333'};
  margin-bottom: 1rem;
`;

const ReviewText = styled.p`
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
  margin: 0.5rem 0;
`;

const SidebarSection = styled.div``;

const SummaryCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  position: sticky;
  top: 2rem;
`;

const SummaryTitle = styled.h3`
  font-size: 1.3rem;
  color: ${props => props.theme?.colors?.text || '#333'};
  margin-bottom: 1.5rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
`;

const Divider = styled.hr`
  border: none;
  border-top: 2px solid #eee;
  margin: 1.5rem 0;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 1.2rem;
`;

const TotalAmount = styled.span`
  color: ${props => props.theme?.colors?.primary?.main || '#007bff'};
`;

export default CheckoutPage;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, Truck, CheckCircle, Lock, Wallet, AlertCircle, Loader } from 'lucide-react';
import { cartService, CartSummary } from '@/services/marketplace/cart.service';
import { orderService, ShippingAddress, PaymentMethod } from '@/services/marketplace/order.service';
import { paymentService } from '@/services/payment-service';
import { logger } from '@/services/logger-service';

// Stripe imports (lazy loaded)
let stripePromise: Promise<any> | null = null;
const loadStripe = async () => {
  if (!stripePromise) {
    const { loadStripe: load } = await import('@stripe/stripe-js');
    const key = paymentService.getStripePublicKey();
    stripePromise = load(key);
  }
  return stripePromise;
};

const CheckoutPage: React.FC = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Prevent double submission
  const isSubmitting = useRef(false);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [error, setError] = useState<string | null>(null);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState(false);

  const [shippingData, setShippingData] = useState<ShippingAddress>({
    fullName: user?.displayName || '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Bulgaria',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe_card');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const texts = {
    bg: {
      title: 'Финализиране на поръчка',
      shipping: 'Доставка',
      payment: 'Плащане',
      review: 'Преглед',
      fullName: 'Пълно име',
      phone: 'Телефон',
      email: 'Имейл',
      address: 'Адрес',
      city: 'Град',
      postalCode: 'Пощенски код',
      notes: 'Бележки (опционално)',
      continue: 'Продължи',
      back: 'Назад',
      placeOrder: 'Потвърди поръчката',
      processing: 'Обработка...',
      paymentMethods: 'Начини на плащане',
      cardPayment: 'Карта (Stripe)',
      bankTransfer: 'Банков превод',
      cashOnDelivery: 'Наложен платеж',
      orderSummary: 'Обобщение на поръчката',
      subtotal: 'Междинна сума',
      shippingCost: 'Доставка',
      tax: 'ДДС (20%)',
      total: 'Общо',
      bgn: 'лв',
      freeShipping: 'Безплатна',
      secureCheckout: 'Сигурна поръчка',
      emptyCart: 'Вашата количка е празна',
      returnToCart: 'Обратно към количката',
      loginRequired: 'Моля, влезте в акаунта си',
      required: 'Това поле е задължително',
      invalidPhone: 'Невалиден телефонен номер',
      invalidEmail: 'Невалиден имейл адрес',
      orderError: 'Грешка при създаване на поръчката',
      paymentError: 'Грешка при обработка на плащането',
      cardDescription: 'Сигурно плащане с карта през Stripe',
      bankDescription: 'IBAN / Revolut / iCard',
      cashDescription: 'Плащане при доставка',
    },
    en: {
      title: 'Checkout',
      shipping: 'Shipping',
      payment: 'Payment',
      review: 'Review',
      fullName: 'Full Name',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      city: 'City',
      postalCode: 'Postal Code',
      notes: 'Notes (optional)',
      continue: 'Continue',
      back: 'Back',
      placeOrder: 'Place Order',
      processing: 'Processing...',
      paymentMethods: 'Payment Methods',
      cardPayment: 'Card (Stripe)',
      bankTransfer: 'Bank Transfer',
      cashOnDelivery: 'Cash on Delivery',
      orderSummary: 'Order Summary',
      subtotal: 'Subtotal',
      shippingCost: 'Shipping',
      tax: 'VAT (20%)',
      total: 'Total',
      bgn: 'BGN',
      freeShipping: 'Free',
      secureCheckout: 'Secure Checkout',
      emptyCart: 'Your cart is empty',
      returnToCart: 'Return to Cart',
      loginRequired: 'Please login to continue',
      required: 'This field is required',
      invalidPhone: 'Invalid phone number',
      invalidEmail: 'Invalid email address',
      orderError: 'Error creating order',
      paymentError: 'Error processing payment',
      cardDescription: 'Secure card payment via Stripe',
      bankDescription: 'IBAN / Revolut / iCard',
      cashDescription: 'Pay on delivery',
    },
  };

  const t = texts[language] || texts.bg;

  // Load cart and check Stripe configuration
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        if (!user) {
          navigate('/login', { state: { from: '/marketplace/checkout' } });
          return;
        }
        
        // Load cart
        await cartService.loadCart();
        await cartService.syncWithFirestore(user.uid);
        
        const validation = cartService.validateForCheckout();
        if (!validation.valid) {
          setError(validation.errors.join(', '));
          return;
        }
        
        setCartSummary(cartService.getCartSummary());
        
        // Check Stripe configuration
        try {
          const isConfigured = paymentService.isStripeConfigured();
          setStripeConfigured(isConfigured);
          if (!isConfigured) {
            setPaymentMethod('bank_transfer');
          }
        } catch {
          setStripeConfigured(false);
          setPaymentMethod('bank_transfer');
        }
        
        // Pre-fill email if available
        if (user.email && !shippingData.email) {
          setShippingData(prev => ({ ...prev, email: user.email || '' }));
        }
      } catch (err) {
        logger.error('Failed to initialize checkout', err as Error);
        setError(t.orderError);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, [user, navigate, t.orderError]);

  // Form validation
  const validateShipping = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    if (!shippingData.fullName.trim()) {
      errors.fullName = t.required;
    }
    
    if (!shippingData.phone.trim()) {
      errors.phone = t.required;
    } else if (!/^[+]?[\d\s-]{8,}$/.test(shippingData.phone)) {
      errors.phone = t.invalidPhone;
    }
    
    if (!shippingData.address.trim()) {
      errors.address = t.required;
    }
    
    if (!shippingData.city.trim()) {
      errors.city = t.required;
    }
    
    if (shippingData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) {
      errors.email = t.invalidEmail;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [shippingData, t]);

  // Handle order placement
  const handlePlaceOrder = async () => {
    // Prevent double submission
    if (isSubmitting.current || processing) {
      return;
    }
    
    isSubmitting.current = true;
    setProcessing(true);
    setError(null);
    
    try {
      if (!user || !cartSummary) {
        throw new Error('Invalid state');
      }
      
      const cartItems = cartService.getItems();
      
      // Create order
      const order = await orderService.createOrder({
        userId: user.uid,
        items: cartItems,
        summary: cartSummary,
        shippingAddress: shippingData,
        paymentMethod,
        notes: shippingData.notes,
        metadata: {
          userEmail: user.email,
          language,
        },
      });
      
      // Create transaction record
      await orderService.createTransaction({
        orderId: order.id,
        userId: user.uid,
        type: 'payment',
        amount: cartSummary.total,
        currency: cartSummary.currency,
        paymentMethod,
      });
      
      // Handle payment based on method
      if (paymentMethod === 'stripe_card' && stripeConfigured) {
        // Create payment intent
        const result = await paymentService.createCarPaymentIntent(
          order.id,
          Math.round(cartSummary.total * 100), // Amount in stotinki
          user.uid,
          {
            orderId: order.id,
            orderNumber: order.orderNumber,
          }
        );
        
        if (!result.success || !result.clientSecret) {
          throw new Error(result.error || t.paymentError);
        }
        
        // Redirect to Stripe payment page
        const stripe = await loadStripe();
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }
        
        // Update order with payment intent
        await orderService.updatePaymentStatus(order.id, 'processing', {
          paymentIntentId: result.paymentIntentId,
        });
        
        // Navigate to payment confirmation page with client secret
        navigate('/marketplace/payment', {
          state: {
            clientSecret: result.clientSecret,
            orderId: order.id,
            orderNumber: order.orderNumber,
            amount: cartSummary.total,
          },
        });
      } else {
        // Bank transfer or Cash on Delivery
        await orderService.updateOrderStatus(order.id, 'confirmed');
        await cartService.clearCart();
        
        navigate('/marketplace/order-success', {
          state: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            paymentMethod,
          },
        });
      }
    } catch (err) {
      logger.error('Failed to place order', err as Error);
      setError((err as Error).message || t.orderError);
    } finally {
      setProcessing(false);
      isSubmitting.current = false;
    }
  };

  const handleContinueToPayment = () => {
    if (validateShipping()) {
      setStep(2);
    }
  };

  const renderShippingForm = () => (
    <FormSection>
      <SectionTitle>{t.shipping}</SectionTitle>
      <FormGrid>
        <FormGroup $hasError={!!formErrors.fullName}>
          <Label>{t.fullName} *</Label>
          <Input
            value={shippingData.fullName}
            onChange={e => setShippingData({ ...shippingData, fullName: e.target.value })}
            $hasError={!!formErrors.fullName}
          />
          {formErrors.fullName && <FieldError>{formErrors.fullName}</FieldError>}
        </FormGroup>
        <FormGroup $hasError={!!formErrors.phone}>
          <Label>{t.phone} *</Label>
          <Input
            type="tel"
            value={shippingData.phone}
            onChange={e => setShippingData({ ...shippingData, phone: e.target.value })}
            $hasError={!!formErrors.phone}
          />
          {formErrors.phone && <FieldError>{formErrors.phone}</FieldError>}
        </FormGroup>
        <FormGroup $hasError={!!formErrors.email}>
          <Label>{t.email}</Label>
          <Input
            type="email"
            value={shippingData.email || ''}
            onChange={e => setShippingData({ ...shippingData, email: e.target.value })}
            $hasError={!!formErrors.email}
          />
          {formErrors.email && <FieldError>{formErrors.email}</FieldError>}
        </FormGroup>
        <FormGroup $fullWidth $hasError={!!formErrors.address}>
          <Label>{t.address} *</Label>
          <Input
            value={shippingData.address}
            onChange={e => setShippingData({ ...shippingData, address: e.target.value })}
            $hasError={!!formErrors.address}
          />
          {formErrors.address && <FieldError>{formErrors.address}</FieldError>}
        </FormGroup>
        <FormGroup $hasError={!!formErrors.city}>
          <Label>{t.city} *</Label>
          <Input
            value={shippingData.city}
            onChange={e => setShippingData({ ...shippingData, city: e.target.value })}
            $hasError={!!formErrors.city}
          />
          {formErrors.city && <FieldError>{formErrors.city}</FieldError>}
        </FormGroup>
        <FormGroup>
          <Label>{t.postalCode}</Label>
          <Input
            value={shippingData.postalCode || ''}
            onChange={e => setShippingData({ ...shippingData, postalCode: e.target.value })}
          />
        </FormGroup>
        <FormGroup $fullWidth>
          <Label>{t.notes}</Label>
          <Textarea
            value={shippingData.notes || ''}
            onChange={e => setShippingData({ ...shippingData, notes: e.target.value })}
            rows={3}
          />
        </FormGroup>
      </FormGrid>
      <ButtonGroup>
        <SecondaryButton onClick={() => navigate('/marketplace/cart')}>
          {t.back}
        </SecondaryButton>
        <PrimaryButton onClick={handleContinueToPayment}>
          {t.continue}
        </PrimaryButton>
      </ButtonGroup>
    </FormSection>
  );

  const renderPaymentForm = () => (
    <FormSection>
      <SectionTitle>{t.paymentMethods}</SectionTitle>
      <PaymentOptions>
        {stripeConfigured && (
          <PaymentOption
            $active={paymentMethod === 'stripe_card'}
            onClick={() => setPaymentMethod('stripe_card')}
          >
            <CreditCard size={24} />
            <div>
              <PaymentTitle>{t.cardPayment}</PaymentTitle>
              <PaymentDesc>{t.cardDescription}</PaymentDesc>
            </div>
          </PaymentOption>
        )}
        <PaymentOption
          $active={paymentMethod === 'bank_transfer'}
          onClick={() => setPaymentMethod('bank_transfer')}
        >
          <Wallet size={24} />
          <div>
            <PaymentTitle>{t.bankTransfer}</PaymentTitle>
            <PaymentDesc>{t.bankDescription}</PaymentDesc>
          </div>
        </PaymentOption>
        <PaymentOption
          $active={paymentMethod === 'cash_on_delivery'}
          onClick={() => setPaymentMethod('cash_on_delivery')}
        >
          <Truck size={24} />
          <div>
            <PaymentTitle>{t.cashOnDelivery}</PaymentTitle>
            <PaymentDesc>{t.cashDescription}</PaymentDesc>
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
          {shippingData.email && <ReviewText>{shippingData.email}</ReviewText>}
          <ReviewText>{shippingData.address}, {shippingData.city}</ReviewText>
          {shippingData.postalCode && <ReviewText>{shippingData.postalCode}</ReviewText>}
        </ReviewBlock>
        <ReviewBlock>
          <ReviewTitle>{t.payment}</ReviewTitle>
          <ReviewText>
            {paymentMethod === 'stripe_card' && t.cardPayment}
            {paymentMethod === 'bank_transfer' && t.bankTransfer}
            {paymentMethod === 'cash_on_delivery' && t.cashOnDelivery}
          </ReviewText>
        </ReviewBlock>
      </ReviewSection>
      <ButtonGroup>
        <SecondaryButton onClick={() => setStep(2)} disabled={processing}>
          {t.back}
        </SecondaryButton>
        <PrimaryButton onClick={handlePlaceOrder} disabled={processing}>
          {processing ? (
            <>
              <Loader size={20} className="spinner" />
              {t.processing}
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              {t.placeOrder}
            </>
          )}
        </PrimaryButton>
      </ButtonGroup>
    </FormSection>
  );

  // Loading state
  if (loading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <LoadingState>
            <Loader size={48} className="spinner" />
          </LoadingState>
        </ContentWrapper>
      </PageContainer>
    );
  }

  // Empty cart state
  if (!cartSummary || cartSummary.itemCount === 0) {
    return (
      <PageContainer>
        <ContentWrapper>
          <EmptyState>
            <AlertCircle size={64} />
            <EmptyTitle>{t.emptyCart}</EmptyTitle>
            <ReturnButton onClick={() => navigate('/marketplace/cart')}>
              {t.returnToCart}
            </ReturnButton>
          </EmptyState>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        {error && (
          <ErrorBanner onClick={() => setError(null)}>
            <AlertCircle size={20} />
            {error}
          </ErrorBanner>
        )}
        
        <Header>
          <Title>{t.title}</Title>
          <SecureBadge>
            <Lock size={16} />
            {t.secureCheckout}
          </SecureBadge>
        </Header>

        <Steps>
          <Step $active={step === 1} $completed={step > 1}>
            <StepNumber $active={step >= 1}>{step > 1 ? <CheckCircle size={20} /> : '1'}</StepNumber>
            <StepLabel>{t.shipping}</StepLabel>
          </Step>
          <StepLine $completed={step > 1} />
          <Step $active={step === 2} $completed={step > 2}>
            <StepNumber $active={step >= 2}>{step > 2 ? <CheckCircle size={20} /> : '2'}</StepNumber>
            <StepLabel>{t.payment}</StepLabel>
          </Step>
          <StepLine $completed={step > 2} />
          <Step $active={step === 3} $completed={false}>
            <StepNumber $active={step >= 3}>3</StepNumber>
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
                <span>{t.subtotal} ({cartSummary.itemCount}):</span>
                <span>{cartSummary.subtotal.toFixed(2)} {t.bgn}</span>
              </SummaryRow>
              <SummaryRow>
                <span>{t.shippingCost}:</span>
                <span>
                  {cartSummary.shipping === 0 
                    ? t.freeShipping 
                    : `${cartSummary.shipping.toFixed(2)} ${t.bgn}`}
                </span>
              </SummaryRow>
              <SummaryRow>
                <span>{t.tax}:</span>
                <span>{cartSummary.tax.toFixed(2)} {t.bgn}</span>
              </SummaryRow>
              <Divider />
              <TotalRow>
                <span>{t.total}:</span>
                <TotalAmount>{cartSummary.total.toFixed(2)} {t.bgn}</TotalAmount>
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

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.5rem;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme?.colors?.text || '#333'};
`;

const ReturnButton = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.theme?.colors?.primary?.main || '#007bff'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme?.colors?.primary?.dark || '#0056b3'};
  }
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  cursor: pointer;
  
  &:hover {
    background: #fecaca;
  }
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

const StepNumber = styled.div<{ $active?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$active ? props.theme?.colors?.primary?.main || '#007bff' : '#ddd'};
  color: ${props => props.$active ? 'white' : '#666'};
  font-weight: 600;
  transition: all 0.3s;
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

const FormGroup = styled.div<{ $fullWidth?: boolean; $hasError?: boolean }>`
  grid-column: ${props => props.$fullWidth ? '1 / -1' : 'auto'};
`;

const FieldError = styled.span`
  display: block;
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme?.colors?.text || '#333'};
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.$hasError ? '#dc2626' : props.theme?.colors?.border || '#ddd'};
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#dc2626' : props.theme?.colors?.primary?.main || '#007bff'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(0, 123, 255, 0.1)'};
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
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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

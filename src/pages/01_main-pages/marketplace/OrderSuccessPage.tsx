/**
 * Order Success Page for Koli One Marketplace
 * صفحة نجاح الطلب
 * 
 * ✅ PRODUCTION READY: Displays order confirmation after successful checkout
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, CreditCard, Banknote, Truck, Home, ShoppingBag, Loader } from 'lucide-react';
import styledImport from 'styled-components';

import { useLanguage } from '@/contexts/LanguageContext';
import { orderService, Order, PaymentMethod } from '@/services/marketplace/order.service';
import { logger } from '@/services/logger-service';

const styled = styledImport;

interface LocationState {
  orderId?: string;
  orderNumber?: string;
  paymentMethod?: PaymentMethod;
}

const OrderSuccessPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const texts = {
    bg: {
      success: 'Поръчката е успешна!',
      thankYou: 'Благодарим ви за поръчката',
      orderNumber: 'Номер на поръчка',
      orderDetails: 'Детайли на поръчката',
      paymentMethod: 'Начин на плащане',
      cardPayment: 'Карта (Stripe)',
      bankTransfer: 'Банков превод',
      cashOnDelivery: 'Наложен платеж',
      shippingAddress: 'Адрес за доставка',
      total: 'Общо',
      bgn: 'лв',
      continueShopping: 'Продължи пазаруването',
      viewOrders: 'Виж поръчките',
      bankInstructions: 'Моля, преведете сумата по следната сметка:',
      cashInstructions: 'Ще платите при доставката на куриера.',
      cardSuccess: 'Плащането е успешно обработено.',
      estimatedDelivery: 'Очаквана доставка',
      days: 'работни дни',
      orderNotFound: 'Поръчката не е намерена',
      returnHome: 'Начална страница',
    },
    en: {
      success: 'Order Successful!',
      thankYou: 'Thank you for your order',
      orderNumber: 'Order Number',
      orderDetails: 'Order Details',
      paymentMethod: 'Payment Method',
      cardPayment: 'Card (Stripe)',
      bankTransfer: 'Bank Transfer',
      cashOnDelivery: 'Cash on Delivery',
      shippingAddress: 'Shipping Address',
      total: 'Total',
      bgn: 'BGN',
      continueShopping: 'Continue Shopping',
      viewOrders: 'View Orders',
      bankInstructions: 'Please transfer the amount to the following account:',
      cashInstructions: 'You will pay the courier upon delivery.',
      cardSuccess: 'Payment has been successfully processed.',
      estimatedDelivery: 'Estimated Delivery',
      days: 'business days',
      orderNotFound: 'Order not found',
      returnHome: 'Return Home',
    },
  };

  const t = texts[language] || texts.bg;

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        
        if (!state?.orderId) {
          setLoading(false);
          return;
        }
        
        const orderData = await orderService.getOrderById(state.orderId);
        setOrder(orderData);
      } catch (err) {
        logger.error('Failed to load order', err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrder();
  }, [state?.orderId]);

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'stripe_card':
        return <CreditCard size={24} />;
      case 'bank_transfer':
        return <Banknote size={24} />;
      case 'cash_on_delivery':
        return <Truck size={24} />;
      default:
        return <CreditCard size={24} />;
    }
  };

  const getPaymentMethodText = (method: PaymentMethod) => {
    switch (method) {
      case 'stripe_card':
        return t.cardPayment;
      case 'bank_transfer':
        return t.bankTransfer;
      case 'cash_on_delivery':
        return t.cashOnDelivery;
      default:
        return method;
    }
  };

  const getPaymentInstructions = (method: PaymentMethod) => {
    switch (method) {
      case 'stripe_card':
        return t.cardSuccess;
      case 'bank_transfer':
        return t.bankInstructions;
      case 'cash_on_delivery':
        return t.cashInstructions;
      default:
        return '';
    }
  };

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

  // If no order data, show basic success message
  if (!order && !state?.orderNumber) {
    return (
      <PageContainer>
        <ContentWrapper>
          <SuccessCard>
            <IconWrapper $success>
              <Package size={48} />
            </IconWrapper>
            <Title>{t.orderNotFound}</Title>
            <ButtonGroup>
              <PrimaryButton onClick={() => navigate('/')}>
                <Home size={20} />
                {t.returnHome}
              </PrimaryButton>
            </ButtonGroup>
          </SuccessCard>
        </ContentWrapper>
      </PageContainer>
    );
  }

  const displayOrderNumber = order?.orderNumber || state?.orderNumber;
  const displayPaymentMethod = order?.paymentMethod || state?.paymentMethod || 'stripe_card';
  const displayTotal = order?.total || 0;
  const displayAddress = order?.shippingAddress;

  return (
    <PageContainer>
      <ContentWrapper>
        <SuccessCard>
          <IconWrapper $success>
            <CheckCircle size={64} />
          </IconWrapper>
          
          <Title>{t.success}</Title>
          <Subtitle>{t.thankYou}</Subtitle>
          
          <OrderNumberBadge>
            {t.orderNumber}: <strong>{displayOrderNumber}</strong>
          </OrderNumberBadge>

          <DetailsGrid>
            {/* Payment Method */}
            <DetailCard>
              <DetailHeader>
                {getPaymentMethodIcon(displayPaymentMethod)}
                <DetailTitle>{t.paymentMethod}</DetailTitle>
              </DetailHeader>
              <DetailText>{getPaymentMethodText(displayPaymentMethod)}</DetailText>
              <DetailInstructions>
                {getPaymentInstructions(displayPaymentMethod)}
              </DetailInstructions>
              
              {displayPaymentMethod === 'bank_transfer' && (
                <BankDetails>
                  <BankRow>
                    <span>IBAN:</span>
                    <strong>BG80BNBG96611020345678</strong>
                  </BankRow>
                  <BankRow>
                    <span>BIC:</span>
                    <strong>BNBGBGSD</strong>
                  </BankRow>
                  <BankRow>
                    <span>Bank:</span>
                    <strong>Bulgarian National Bank</strong>
                  </BankRow>
                </BankDetails>
              )}
            </DetailCard>

            {/* Shipping Address */}
            {displayAddress && (
              <DetailCard>
                <DetailHeader>
                  <Truck size={24} />
                  <DetailTitle>{t.shippingAddress}</DetailTitle>
                </DetailHeader>
                <DetailText>{displayAddress.fullName}</DetailText>
                <DetailText>{displayAddress.phone}</DetailText>
                <DetailText>{displayAddress.address}</DetailText>
                <DetailText>{displayAddress.city}{displayAddress.postalCode ? `, ${displayAddress.postalCode}` : ''}</DetailText>
              </DetailCard>
            )}

            {/* Order Total */}
            {displayTotal > 0 && (
              <DetailCard $highlight>
                <DetailHeader>
                  <Package size={24} />
                  <DetailTitle>{t.total}</DetailTitle>
                </DetailHeader>
                <TotalAmount>{displayTotal.toFixed(2)} {t.bgn}</TotalAmount>
                <EstimatedDelivery>
                  {t.estimatedDelivery}: 2-5 {t.days}
                </EstimatedDelivery>
              </DetailCard>
            )}
          </DetailsGrid>

          <ButtonGroup>
            <SecondaryButton onClick={() => navigate('/marketplace')}>
              <ShoppingBag size={20} />
              {t.continueShopping}
            </SecondaryButton>
            <PrimaryButton onClick={() => navigate('/profile/orders')}>
              <Package size={20} />
              {t.viewOrders}
            </PrimaryButton>
          </ButtonGroup>
        </SuccessCard>
      </ContentWrapper>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || '#f8f9fa'};
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const SuccessCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const IconWrapper = styled.div<{ $success?: boolean }>`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.$success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0, 123, 255, 0.1)'};
  color: ${props => props.$success ? '#22c55e' : '#007bff'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme?.colors?.text || '#333'};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
  margin-bottom: 2rem;
`;

const OrderNumberBadge = styled.div`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 1.1rem;
  color: ${props => props.theme?.colors?.text || '#333'};
  margin-bottom: 2rem;
  
  strong {
    color: ${props => props.theme?.colors?.primary?.main || '#007bff'};
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
`;

const DetailCard = styled.div<{ $highlight?: boolean }>`
  background: ${props => props.$highlight ? 'rgba(0, 123, 255, 0.05)' : '#f9fafb'};
  border: 1px solid ${props => props.$highlight ? 'rgba(0, 123, 255, 0.2)' : '#e5e7eb'};
  border-radius: 12px;
  padding: 1.5rem;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: ${props => props.theme?.colors?.primary?.main || '#007bff'};
`;

const DetailTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme?.colors?.text || '#333'};
  margin: 0;
`;

const DetailText = styled.p`
  font-size: 0.95rem;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
  margin: 0.25rem 0;
`;

const DetailInstructions = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
  margin-top: 0.75rem;
  font-style: italic;
`;

const BankDetails = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const BankRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  span {
    color: ${props => props.theme?.colors?.textSecondary || '#666'};
  }
  
  strong {
    color: ${props => props.theme?.colors?.text || '#333'};
  }
`;

const TotalAmount = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme?.colors?.primary?.main || '#007bff'};
  margin-bottom: 0.5rem;
`;

const EstimatedDelivery = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
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

  &:hover {
    background: ${props => props.theme?.colors?.primary?.dark || '#0056b3'};
    transform: translateY(-2px);
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
  }
`;

export default OrderSuccessPage;

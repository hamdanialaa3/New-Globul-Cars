// src/pages/CheckoutPage.tsx
// Checkout Page for Car Purchase with Stripe Integration

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { ArrowLeft, CreditCard, Lock, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { logger } from '../../services/logger-service';
import { unifiedCarService } from '../../services/car';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/firebase-config';
import { useToast } from '../../components/Toast';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #2563EB;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  padding: 0.5rem;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OrderSummary = styled.div`
  border-top: 1px solid #e0e0e0;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #555;
`;

const TotalRow = styled(SummaryRow)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  padding-top: 1rem;
  border-top: 2px solid #e0e0e0;
`;

const PaymentButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #2563EB, #ff8c1a);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const CheckoutPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [car, setCar] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!carId) {
      navigate('/cars');
      return;
    }

    // Load car details
    loadCarDetails();
  }, [carId, user, navigate]);

  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const loadCarDetails = async () => {
    if (!carId) return;
    
    try {
      setLoading(true);
      const carData = await unifiedCarService.getCarById(carId);
      
      if (!carData) {
        throw new Error('Car not found');
      }

      setCar({
        id: carData.id,
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        images: carData.images || [],
        sellerId: carData.sellerId
      });
    } catch (error) {
      logger.error('Error loading checkout car details', error as Error, { carId });
      setError(language === 'bg' ? 'Грешка при зареждане на данните' : 'Error loading car details');
      toast.error(language === 'bg' ? 'Грешка при зареждане на данните' : 'Error loading car details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (retryAttempt = 0) => {
    if (!user || !car) return;

    // Prevent self-purchase
    if (car.sellerId === user.uid) {
      const errorMsg = language === 'bg' 
        ? 'Не можете да закупите собствената си кола' 
        : 'You cannot purchase your own car';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call Cloud Function to create Stripe checkout session
      const createCarPaymentIntent = httpsCallable(functions, 'createCarPaymentIntent');
      
      const result = await createCarPaymentIntent({
        carId: car.id,
        amount: car.price,
        currency: 'EUR',
        buyerId: user.uid
      });

      const data = result.data as {
        checkoutUrl?: string;
        sessionId?: string;
        error?: string;
      };

      if (data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: unknown) {
      logger.error('Payment error', error as Error, { carId, userId: user?.uid, retryAttempt });
      
      const errorMessage = (error as Error).message || (language === 'bg' ? 'Грешка при плащане' : 'Payment error');
      setError(errorMessage);

      // Retry mechanism
      if (retryAttempt < MAX_RETRIES) {
        const retryMsg = language === 'bg'
          ? `Опит ${retryAttempt + 1} от ${MAX_RETRIES}...`
          : `Retry ${retryAttempt + 1} of ${MAX_RETRIES}...`;
        toast.warn(retryMsg);
        
        setTimeout(() => {
          setRetryCount(retryAttempt + 1);
          handlePayment(retryAttempt + 1);
        }, 2000 * (retryAttempt + 1)); // Exponential backoff
      } else {
        // Max retries reached - redirect to error page
        toast.error(errorMessage);
        navigate(`/payment-failed?carId=${carId}&error=${encodeURIComponent(errorMessage)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !car) {
    return <Container>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</Container>;
  }

  if (!car) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>{language === 'bg' ? 'Колата не е намерена' : 'Car not found'}</p>
          <BackButton onClick={() => navigate('/cars')}>
            <ArrowLeft size={20} />
            {language === 'bg' ? 'Назад' : 'Back'}
          </BackButton>
        </div>
      </Container>
    );
  }

  const commission = Math.round(car.price * 0.05); // 5% platform fee
  const total = car.price + commission;

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(`/cars/${carId}`)}>
          <ArrowLeft size={20} />
          {language === 'bg' ? 'Назад' : 'Back'}
        </BackButton>
        <Title>{language === 'bg' ? 'Плащане' : 'Checkout'}</Title>
      </Header>

      <Grid>
        <Card>
          <CardTitle>
            <CreditCard size={24} />
            {language === 'bg' ? 'Метод на плащане' : 'Payment Method'}
          </CardTitle>

          {error && (
            <div style={{ 
              padding: '1rem', 
              background: '#fee2e2', 
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#dc2626'
            }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <PaymentButton onClick={() => handlePayment(0)} disabled={loading || !car}>
            {loading ? (
              <>
                <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                {language === 'bg' ? 'Обработка...' : 'Processing...'}
              </>
            ) : (
              <>
                <Lock size={20} />
                {language === 'bg' ? 'Потвърди поръчка' : 'Confirm Order'}
              </>
            )}
          </PaymentButton>

          <SecurityNote>
            <Lock size={16} />
            {language === 'bg'
              ? 'Вашата информация е защитена със SSL криптиране'
              : 'Your information is protected with SSL encryption'}
          </SecurityNote>
        </Card>

        <Card>
          <CardTitle>
            {language === 'bg' ? 'Обобщение на поръчката' : 'Order Summary'}
          </CardTitle>

          <div>
            <img 
              src={car.images[0]} 
              alt={`${car.make} ${car.model}`}
              style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }}
            />
            <h3>{car.make} {car.model} ({car.year})</h3>
          </div>

          <OrderSummary>
            <SummaryRow>
              <span>{language === 'bg' ? 'Цена на автомобила' : 'Car Price'}</span>
              <span>€{car.price.toLocaleString()}</span>
            </SummaryRow>
            <SummaryRow>
              <span>{language === 'bg' ? 'Такса за платформа (5%)' : 'Platform Fee (5%)'}</span>
              <span>€{commission.toLocaleString()}</span>
            </SummaryRow>
            <TotalRow>
              <span>{language === 'bg' ? 'Общо' : 'Total'}</span>
              <span>€{total.toLocaleString()}</span>
            </TotalRow>
          </OrderSummary>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0369a1', marginBottom: '0.5rem' }}>
              <Check size={20} />
              <strong>{language === 'bg' ? 'Включено' : 'Included'}</strong>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#555' }}>
              <li>{language === 'bg' ? 'Гаранция за качество' : 'Quality guarantee'}</li>
              <li>{language === 'bg' ? 'Защита на купувача' : 'Buyer protection'}</li>
              <li>{language === 'bg' ? 'Поддръжка 24/7' : '24/7 support'}</li>
            </ul>
          </div>
        </Card>
      </Grid>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Container>
  );
};

export default CheckoutPage;



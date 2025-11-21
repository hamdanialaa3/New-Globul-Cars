// src/pages/CheckoutPage.tsx
// Checkout Page for Car Purchase

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '@globul-cars/coreuseAuth';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { paymentService } from '@globul-cars/services/payment-service';
import { ArrowLeft, CreditCard, Lock, Check } from 'lucide-react';
import { logger } from '@globul-cars/services';

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
  color: #FF7900;
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
  background: linear-gradient(135deg, #FF7900, #ff8c1a);
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
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
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

  const loadCarDetails = async () => {
    try {
      // In production, load from Firebase
      // For now, use mock data
      setCar({
        id: carId,
        make: 'BMW',
        model: '320d',
        year: 2023,
        price: 45000,
        images: ['https://via.placeholder.com/400x300']
      });
    } catch (error) {
      logger.error('Error loading checkout car details', error as Error, { carId });
    }
  };

  const handlePayment = async () => {
    if (!user || !car) return;

    setLoading(true);

    try {
      // Create payment intent
      const intent = await paymentService.createCarPaymentIntent(
        car.id,
        car.price,
        user.uid,
        {
          carMake: car.make,
          carModel: car.model,
          carYear: car.year
        }
      );

      // Process payment (in production, this would show Stripe payment form)
      const result = await paymentService.processPayment(intent.id, 'pm_card_visa');

      if (result.success) {
        navigate(`/payment-success/${result.transactionId}`);
      } else {
        alert(result.error || 'Payment failed');
      }
    } catch (error) {
      logger.error('Payment error', error as Error, { carId, userId: user?.uid });
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!car) {
    return <Container>Loading...</Container>;
  }

  const commission = paymentService.calculateCommission(car.price, 10);

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

          <div style={{ padding: '2rem', textAlign: 'center', color: '#7f8c8d' }}>
            <p>{language === 'bg' 
              ? 'Интеграцията със Stripe ще бъде активирана скоро'
              : 'Stripe integration will be activated soon'}</p>
            <p>{language === 'bg'
              ? 'За момента можете да се свържете директно с продавача'
              : 'For now, you can contact the seller directly'}</p>
          </div>

          <PaymentButton onClick={handlePayment} disabled={loading}>
            {loading ? (
              language === 'bg' ? 'Обработка...' : 'Processing...'
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
              <span>{language === 'bg' ? 'Такса за платформа (10%)' : 'Platform Fee (10%)'}</span>
              <span>€{commission.commission.toLocaleString()}</span>
            </SummaryRow>
            <TotalRow>
              <span>{language === 'bg' ? 'Общо' : 'Total'}</span>
              <span>€{car.price.toLocaleString()}</span>
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
    </Container>
  );
};

export default CheckoutPage;

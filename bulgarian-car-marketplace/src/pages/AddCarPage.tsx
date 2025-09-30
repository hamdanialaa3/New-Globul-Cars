// AddCarPage.tsx - صفحة إضافة سيارة جديدة مع نظام الإشعارات التدريجي
// Bulgarian car marketplace - Mobile.de inspired design

import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthProvider';
import SharedCarForm, { SharedCarData } from '../components/shared/SharedCarForm';

// Mobile.de color system
const colors = {
  primary: {
    orange: '#FF7900',
    blue: '#0066CC',
    darkBlue: '#003D79'
  },
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F8F9FA',
    grayBorder: '#D0D7DE',
    grayText: '#656D76'
  },
  text: {
    primary: '#24292F',
    secondary: '#656D76'
  },
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B'
  }
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  color: white;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FormWrapper = styled.div`
  background: ${colors.neutral.white};
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ActionSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border-top: 1px solid ${colors.neutral.grayBorder};
  background: ${colors.neutral.lightGray};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const SaveButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 32px;
  background: ${props => props.variant === 'secondary' ? colors.neutral.white : colors.primary.orange};
  color: ${props => props.variant === 'secondary' ? colors.text.primary : colors.neutral.white};
  border: ${props => props.variant === 'secondary' ? `2px solid ${colors.neutral.grayBorder}` : 'none'};
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 160px;

  &:hover {
    background: ${props => props.variant === 'secondary' ? colors.neutral.lightGray : colors.primary.darkBlue};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: auto;
  }
`;

const SuccessMessage = styled.div`
  background: linear-gradient(135deg, ${colors.status.success}, #059669);
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, ${colors.status.error}, #dc2626);
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
`;

// Enhancement notification system
const EnhancementNotification = styled.div<{ show: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: linear-gradient(135deg, ${colors.primary.orange}, ${colors.primary.blue});
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: ${props => props.show ? 'translateY(0)' : 'translateY(100px)'};
  opacity: ${props => props.show ? 1 : 0};
  transition: all 0.3s ease;
  max-width: 320px;
  z-index: 1000;

  .notification-title {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .notification-text {
    font-size: 14px;
    opacity: 0.9;
  }

  .close-btn {
    position: absolute;
    top: 8px;
    right: 12px;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 18px;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
`;

// Tips for better listing
const tipsForCompletion = [
  {
    trigger: 30,
    title: 'Добавете повече снимки!',
    text: 'Обявите с повече снимки получават 3x повече преглеждания.'
  },
  {
    trigger: 50,
    title: 'Въведете телефон за контакт',
    text: 'Купувачите предпочитат директен контакт за по-бърза сделка.'
  },
  {
    trigger: 70,
    title: 'Опишете допълнителното оборудване',
    text: 'Детайлите като климатрон и сензори увеличават интереса.'
  },
  {
    trigger: 85,
    title: 'Отлично! Още малко...',
    text: 'Вашата обява е почти готова за максимална видимост!'
  }
];

const AddCarPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form state
  const [carData, setCarData] = useState<SharedCarData>({
    // Basic Information
    make: '',
    model: '',
    vehicleType: '',
    condition: '',
    firstRegistrationYear: '',
    mileage: '',
    
    // Price Information
    price: '',
    currency: 'EUR',
    vatReclaimable: false,
    paymentType: '',
    
    // Technical Specifications
    fuelType: '',
    transmission: '',
    power: '',
    engineSize: '',
    driveType: '',
    fuelConsumption: '',
    emissionClass: '',
    
    // Physical Attributes
    exteriorColor: '',
    interiorColor: '',
    doors: '',
    seats: '',
    
    // Equipment & Features
    airConditioning: '',
    parkingSensors: [],
    extras: [],
    
    // Location & Contact
    location: '',
    contactPhone: '',
    contactEmail: user?.email || '',
    
    // Additional Options
    warranty: false,
    serviceHistory: false,
    nonSmokerVehicle: false,
    
    // Images
    images: []
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [currentTip, setCurrentTip] = useState<typeof tipsForCompletion[0] | null>(null);
  const [shownTips, setShownTips] = useState<number[]>([]);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Calculate completion percentage
  const getCompletionPercentage = React.useCallback((): number => {
    const requiredFields = ['make', 'model', 'price', 'mileage', 'fuelType'];
    const optionalFields = ['transmission', 'power', 'exteriorColor', 'contactPhone', 'location'];
    
    const requiredFilled = requiredFields.filter(field => 
      carData[field as keyof SharedCarData] && 
      String(carData[field as keyof SharedCarData]).length > 0
    ).length;
    
    const optionalFilled = optionalFields.filter(field => 
      carData[field as keyof SharedCarData] && 
      String(carData[field as keyof SharedCarData]).length > 0
    ).length;
    
    const imageBonus = carData.images && carData.images.length > 0 ? 10 : 0;
    const extrasBonus = carData.extras.length > 0 ? 5 : 0;
    
    const requiredProgress = (requiredFilled / requiredFields.length) * 60; // 60% for required
    const optionalProgress = (optionalFilled / optionalFields.length) * 25; // 25% for optional
    
    return Math.min(100, Math.round(requiredProgress + optionalProgress + imageBonus + extrasBonus));
  }, [carData]);

  // Show enhancement notifications based on completion
  React.useEffect(() => {
    const completion = getCompletionPercentage();
    
    const applicableTip = tipsForCompletion.find(tip => 
      completion >= tip.trigger && !shownTips.includes(tip.trigger)
    );
    
    if (applicableTip && !showNotification) {
      setCurrentTip(applicableTip);
      setShowNotification(true);
      setShownTips(prev => [...prev, applicableTip.trigger]);
      
      // Auto-hide after 6 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 6000);
    }
  }, [carData, shownTips, showNotification, getCompletionPercentage]);

  // Handle form data changes
  const handleDataChange = (newData: SharedCarData) => {
    setCarData(newData);
    setError(null); // Clear any previous errors
  };

  // Validate required fields
  const validateForm = (): string | null => {
    if (!carData.make) return 'Моля, изберете марка на автомобила';
    if (!carData.model) return 'Моля, изберете модел на автомобила';
    if (!carData.price) return 'Моля, въведете цена';
    if (!carData.mileage) return 'Моля, въведете пробег';
    if (!carData.fuelType) return 'Моля, изберете тип гориво';
    if (!carData.location) return 'Моля, изберете местоположение';
    
    // Validate price is a positive number
    const price = parseFloat(carData.price);
    if (isNaN(price) || price <= 0) {
      return 'Моля, въведете валидна цена';
    }
    
    // Validate mileage is a positive number
    const mileage = parseFloat(carData.mileage);
    if (isNaN(mileage) || mileage < 0) {
      return 'Моля, въведете валиден пробег';
    }
    
    return null;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would be an API call to save the car listing
      console.log('Saving car listing:', carData);
      
      setSuccess(true);
      
      // Redirect to listings page after 3 seconds
      setTimeout(() => {
        navigate('/my-listings');
      }, 3000);
      
    } catch (err) {
      setError('Възникна грешка при запазване на обявата. Моля, опитайте отново.');
    } finally {
      setLoading(false);
    }
  };

  // Handle draft save
  const handleSaveDraft = async () => {
    setLoading(true);
    
    try {
      // Simulate saving draft
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Saving draft:', carData);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError('Възникна грешка при запазване на чернова.');
    } finally {
      setLoading(false);
    }
  };

  const completion = getCompletionPercentage();
  const canPublish = completion >= 80; // Require at least 80% completion to publish

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <PageContainer>
      <Container>
        <Header>
          <Title>Добавете своя автомобил</Title>
          <Subtitle>
            Попълнете данните за автомобила си и го предложете на хиляди купувачи в България
          </Subtitle>
        </Header>

        <FormWrapper>
          {success && (
            <SuccessMessage>
              ✅ Обявата е запазена успешно! Пренасочваме ви към вашите обяви...
            </SuccessMessage>
          )}

          {error && (
            <ErrorMessage>
              ❌ {error}
            </ErrorMessage>
          )}

          <SharedCarForm
            mode="listing"
            data={carData}
            onDataChange={handleDataChange}
            onSubmit={handleSubmit}
            loading={loading}
          />

          <ActionSection>
            <SaveButton 
              variant="secondary" 
              onClick={handleSaveDraft}
              disabled={loading}
            >
              {loading ? 'Запазва се...' : 'Запази като чернова'}
            </SaveButton>
            
            <SaveButton 
              variant="primary" 
              onClick={handleSubmit}
              disabled={loading || !canPublish}
              title={!canPublish ? `Попълнете още данни за публикуване (${completion}% готово)` : ''}
            >
              {loading ? 'Публикува се...' : canPublish ? 'Публикувай обявата' : `Публикувай (${completion}%)`}
            </SaveButton>
          </ActionSection>
        </FormWrapper>

        {/* Enhancement Notification */}
        <EnhancementNotification show={showNotification}>
          <button 
            className="close-btn"
            onClick={() => setShowNotification(false)}
          >
            ×
          </button>
          {currentTip && (
            <>
              <div className="notification-title">
                {currentTip.title}
              </div>
              <div className="notification-text">
                {currentTip.text}
              </div>
            </>
          )}
        </EnhancementNotification>
      </Container>
    </PageContainer>
  );
};

export default AddCarPage;
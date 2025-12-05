import { logger } from '../services/logger-service';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { advancedMessagingService } from '../services/messaging/advanced-messaging-service';
import MessageButton from './messaging/MessageButton';
import { useAuth } from '../contexts/AuthProvider';
import { addToBrowsingHistory } from '../pages/01_main-pages/home/HomePage/RecentBrowsingSection';

// Mock car data for demonstration
const mockCarData = [
  {
    id: 1,
    make: 'BMW',
    model: 'X3',
    year: 2022,
    price: 45000,
    mileage: 15000,
    fuelType: 'Бензин',
    transmission: 'Автоматична',
    power: 250,
    engineSize: 2.0,
    location: 'София',
    registeredInBulgaria: true,
    environmentalTaxPaid: true,
    technicalInspectionValid: true,
    description: 'Отличен автомобил в перфектно състояние. Нисък пробег, пълен сервиз.',
    features: ['Климатроник', 'Навигация', 'Камера за обратно виждане', 'LED фарове'],
    images: ['/placeholder-car.jpg'],
    seller: {
      id: 'seller1',
      name: 'Автокъща София',
      phone: '+359 2 123 4567'
    }
  },
  {
    id: 2,
    make: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2021,
    price: 52000,
    mileage: 22000,
    fuelType: 'Дизел',
    transmission: 'Автоматична',
    power: 190,
    engineSize: 2.0,
    location: 'Пловдив',
    registeredInBulgaria: true,
    environmentalTaxPaid: false,
    technicalInspectionValid: true,
    description: 'Луксозен седан с всички екстри. Перфектно състояние.',
    features: ['Панорамен покрив', 'Масажни седалки', '360° камера', 'Адаптивен круиз контрол'],
    images: ['/placeholder-car.jpg'],
    seller: {
      id: 'seller2',
      name: 'Мерцедес Център',
      phone: '+359 32 654 321'
    }
  }
];

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Martica', 'Arial', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
`;

const BackButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background: #0056b3;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  color: #333;
  margin: 0;
`;

const Price = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #28a745;
  margin-bottom: 20px;
`;

const ImageGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MainImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 5px;
  cursor: pointer;
  border: 2px solid transparent;

  &:hover {
    border-color: #007bff;
  }

  &.active {
    border-color: #007bff;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoSection = styled.div`
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-weight: bold;
  color: #555;
`;

const Value = styled.span`
  color: #333;
`;

const Description = styled.div`
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
`;

const FeaturesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 15px;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0;

  &::before {
    content: '✓';
    color: #28a745;
    margin-right: 10px;
    font-weight: bold;
  }
`;

const MarketComparison = styled.div`
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 15px;
`;

const ComparisonItem = styled.div`
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  background: #f8f9fa;
`;

const ComparisonValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const ComparisonLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 5px;
`;

const PriceRating = styled.div`
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  margin-top: 10px;
`;

const ContactSection = styled.div`
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const ContactForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SendButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #dc3545;
  font-size: 18px;
  margin-top: 50px;
`;

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (id) {
      // Find car by ID from mock car data
      const foundCar = mockCarData.find((c: any) => c.id === parseInt(id));
      if (foundCar) {
        setCar(foundCar);
        // Add to browsing history
        // Map mock data to UnifiedCar structure if needed, or ensure addToBrowsingHistory handles it
        // For now assuming it's compatible or we cast it
        addToBrowsingHistory(foundCar as any);
      }
    }
  }, [id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !car) return;

    setIsSending(true);
    try {
      // Use the auth hook instead of auth service directly
      if (!user) {
        alert('Трябва да сте влезли в системата за да изпратите съобщение');
        return;
      }

      // Create or get conversation for this car
      const conversationId = `car_${car.id}`;
      const receiverId = car.sellerId || 'unknown';

      await advancedMessagingService.sendMessage(
        conversationId,
        user.uid,
        receiverId,
        message
      );

      setMessage('');
      alert('Съобщението е изпратено успешно!');
    } catch (error) {
      logger.error('Error sending message:', error);
      alert('Грешка при изпращане на съобщението');
    } finally {
      setIsSending(false);
    }
  };

  const getPriceRating = (carPrice: number, averagePrice: number) => {
    const difference = ((carPrice - averagePrice) / averagePrice) * 100;

    if (difference < -10) return { text: 'Отлична цена', color: '#28a745' };
    if (difference < -5) return { text: 'Добра цена', color: '#17a2b8' };
    if (difference < 10) return { text: 'Справедлива цена', color: '#ffc107' };
    return { text: 'Висока цена', color: '#dc3545' };
  };

  const calculateMarketComparison = (car: any) => {
    // Simple market comparison logic - in real app this would come from analytics
    const basePrice = car.price;
    const averagePrice = basePrice * 0.95; // Mock average price
    const difference = basePrice - averagePrice;
    const percentage = Math.abs((difference / averagePrice) * 100);

    return {
      averagePrice,
      difference,
      percentage: percentage.toFixed(1)
    };
  };

  if (!car) {
    return (
      <Container>
        <ErrorMessage>
          <h2>Колата не е намерена</h2>
          <BackButton onClick={() => navigate('/cars')}>
            Обратно към колите
          </BackButton>
        </ErrorMessage>
      </Container>
    );
  }

  const marketData = calculateMarketComparison(car);
  const priceRating = getPriceRating(car.price, marketData.averagePrice);

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/cars')}>
          ← Обратно към колите
        </BackButton>
        <Title>{car.make} {car.model} {car.year}</Title>
      </Header>

      <Price>{car.price.toLocaleString()} €</Price>

      <ImageGallery>
        <MainImage
          src={car.images?.[currentImageIndex] || '/placeholder-car.jpg'}
          alt={`${car.make} ${car.model}`}
          loading={currentImageIndex === 0 ? "eager" : "lazy"}  // ⚡ First image eager, rest lazy
          decoding="async"  // ⚡ Non-blocking decode
        />
        {car.images && car.images.length > 1 && (
          <ThumbnailGrid>
            {car.images.map((image: string, index: number) => (
              <Thumbnail
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={currentImageIndex === index ? 'active' : ''}
                onClick={() => setCurrentImageIndex(index)}
                loading="lazy"  // ⚡ Lazy load thumbnails
                decoding="async"  // ⚡ Async decode
              />
            ))}
          </ThumbnailGrid>
        )}
      </ImageGallery>

      <ContentGrid>
        <div>
          <InfoSection>
            <SectionTitle>Основна информация</SectionTitle>
            <InfoGrid>
              <InfoItem>
                <Label>Година:</Label>
                <Value>{car.year}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Пробег:</Label>
                <Value>{car.mileage?.toLocaleString()} km</Value>
              </InfoItem>
              <InfoItem>
                <Label>Тип гориво:</Label>
                <Value>{car.fuelType}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Трансмисия:</Label>
                <Value>{car.transmission}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Мощност:</Label>
                <Value>{car.power} HP</Value>
              </InfoItem>
              <InfoItem>
                <Label>Обем на двигателя:</Label>
                <Value>{car.engineSize} L</Value>
              </InfoItem>
            </InfoGrid>
          </InfoSection>

          <InfoSection>
            <SectionTitle>Технически характеристики</SectionTitle>
            <InfoGrid>
              <InfoItem>
                <Label>Регистрирана в България:</Label>
                <Value>{car.registeredInBulgaria ? 'Да' : 'Не'}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Данък екологичен платен:</Label>
                <Value>{car.environmentalTaxPaid ? 'Да' : 'Не'}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Технически преглед валиден:</Label>
                <Value>{car.technicalInspectionValid ? 'Да' : 'Не'}</Value>
              </InfoItem>
            </InfoGrid>
          </InfoSection>

          {car.description && (
            <Description>
              <SectionTitle>Описание</SectionTitle>
              <p>{car.description}</p>
            </Description>
          )}

          {car.features && car.features.length > 0 && (
            <Description>
              <SectionTitle>Особености</SectionTitle>
              <FeaturesList>
                {car.features.map((feature: string, index: number) => (
                  <Feature key={index}>{feature}</Feature>
                ))}
              </FeaturesList>
            </Description>
          )}
        </div>

        <div>
          <MarketComparison>
            <SectionTitle>Сравнение със средния пазар</SectionTitle>
            <ComparisonGrid>
              <ComparisonItem>
                <ComparisonValue>{marketData.averagePrice.toLocaleString()} €</ComparisonValue>
                <ComparisonLabel>Средна цена</ComparisonLabel>
              </ComparisonItem>
              <ComparisonItem>
                <ComparisonValue style={{ color: marketData.difference >= 0 ? '#dc3545' : '#28a745' }}>
                  {marketData.difference >= 0 ? '+' : ''}{marketData.difference.toLocaleString()} €
                </ComparisonValue>
                <ComparisonLabel>Разлика в цената</ComparisonLabel>
              </ComparisonItem>
              <ComparisonItem>
                <ComparisonValue>{marketData.percentage}%</ComparisonValue>
                <ComparisonLabel>Позиция на пазара</ComparisonLabel>
              </ComparisonItem>
            </ComparisonGrid>
            <PriceRating style={{ backgroundColor: priceRating.color, color: 'white' }}>
              {priceRating.text}
            </PriceRating>
          </MarketComparison>

          <ContactSection>
            <SectionTitle>Свържете се с продавача</SectionTitle>
            <ContactForm>
              <div>
                <Label>Продавач:</Label>
                <Value>{car.seller?.name || 'Няма информация'}</Value>
              </div>
              <div>
                <Label>Телефон:</Label>
                <Value>{car.seller?.phone || 'Няма информация'}</Value>
              </div>
              <div>
                <Label>Адрес:</Label>
                <Value>{car.location || 'Няма информация'}</Value>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <MessageButton
                  carId={car.id.toString()}
                  sellerId={car.seller?.id || 'unknown'}
                  carTitle={`${car.make} ${car.model} ${car.year}`}
                  sellerName={car.seller?.name || 'Unknown Seller'}
                />
              </div>
              <TextArea
                placeholder="Въведете вашето съобщение..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <SendButton onClick={handleSendMessage} disabled={isSending || !message.trim()}>
                {isSending ? 'Изпращане...' : 'Изпрати съобщение'}
              </SendButton>
            </ContactForm>
          </ContactSection>
        </div>
      </ContentGrid>
    </Container>
  );
};

export default CarDetails;
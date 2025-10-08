import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { bulgarianCarService, BulgarianCar, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../hooks/useAuth';
import { ProfileStatsService } from '../services/profile/profile-stats-service';
import LazyImage from '../components/LazyImage';
import RatingSystem from '../components/RatingSystem';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, User, MessageCircle, ExternalLink } from 'lucide-react';

const DetailsContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.grey[100]};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.grey[200]};
  }
`;

const CarHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CarImages = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const MainImage = styled.div`
  width: 100%;
  height: 400px;
  background: ${({ theme }) => theme.colors.grey[200]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Thumbnail = styled.div`
  width: 100%;
  height: 80px;
  background: ${({ theme }) => theme.colors.grey[200]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const CarInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const CarTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const CarPrice = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extrabold};
  color: ${({ theme }) => theme.colors.primary.main};
  margin: 0;

  &::before {
    content: '€';
    margin-right: ${({ theme }) => theme.spacing.xs};
  }
`;

const CarDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const DetailLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const DetailValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const Description = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

const DescriptionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const DescriptionText = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.6;
  margin: 0;
`;

const ContactSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

const ContactTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const ContactButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ErrorTitle = styled.h2`
  color: ${({ theme }) => theme.colors.error.main};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [car, setCar] = useState<BulgarianCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const profileStatsService = new ProfileStatsService();

  useEffect(() => {
    const fetchCarAndIncrementView = async () => {
      if (id) {
        try {
          // Fetch car details
          const carData = await bulgarianCarService.getCarById(id);
          setCar(carData);

          // Increment view count via Cloud Function
          // We run this in a try-catch block so that failing to increment
          // does not prevent the user from seeing the car details.
          try {
            // Only run in production to avoid unnecessary function calls during development
            if (process.env.NODE_ENV === 'production') {
              const incrementView = httpsCallable(functions, 'incrementCarViewCount');
              await incrementView({ carId: id });
            }
          } catch (incrementError) {
            console.error("Failed to increment view count:", incrementError);
          }

        } catch (err) {
          setError('Failed to fetch car details.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCarAndIncrementView();
  }, [id]);

  if (loading) {
    return (
      <LoadingContainer>
        <div>Loading car details...</div>
      </LoadingContainer>
    );
  }

  if (error || !car) {
    return (
      <ErrorContainer>
        <ErrorTitle>Error</ErrorTitle>
        <ErrorText>{error || 'Car not found'}</ErrorText>
        <button onClick={() => navigate('/cars')}>
          Back to Cars
        </button>
      </ErrorContainer>
    );
  }

  return (
    <DetailsContainer>
      <PageContainer>
        <BackButton onClick={() => navigate('/cars')}>
          <ArrowLeft size={18} />
          {language === 'bg' ? 'Назад към автомобилите' : 'Back to Cars'}
        </BackButton>

        <CarHeader>
          <CarImages>
            <MainImage>
              {car.mainImage ? (
                <LazyImage 
                  src={car.mainImage} 
                  alt={car.title} 
                  placeholder={
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                      <path d="M5 17h14v2H5v-2zm0-2h14V9H5v6zm7-13l9 5v8H3V7l9-5z"/>
                      <circle cx="7.5" cy="14.5" r="1.5"/>
                      <circle cx="16.5" cy="14.5" r="1.5"/>
                    </svg>
                  } 
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: '#ccc' }}>
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 17h14v2H5v-2zm0-2h14V9H5v6zm7-13l9 5v8H3V7l9-5z"/>
                    <circle cx="7.5" cy="14.5" r="1.5"/>
                    <circle cx="16.5" cy="14.5" r="1.5"/>
                  </svg>
                </div>
              )}
            </MainImage>
            <ThumbnailGrid>
              {car.images?.slice(0, 4).map((image, index) => (
                <Thumbnail key={index}>
                  <LazyImage 
                    src={image} 
                    alt={`${car.title} ${index + 1}`} 
                    placeholder={
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                        <path d="M5 17h14v2H5v-2zm0-2h14V9H5v6zm7-13l9 5v8H3V7l9-5z"/>
                        <circle cx="7.5" cy="14.5" r="1.5"/>
                        <circle cx="16.5" cy="14.5" r="1.5"/>
                      </svg>
                    }
                  />
                </Thumbnail>
              ))}
            </ThumbnailGrid>
          </CarImages>

          <CarInfo>
            <CarTitle>{car.title}</CarTitle>
            <CarPrice>{car.price.toLocaleString()}</CarPrice>
            
            <CarDetails>
              <DetailItem>
                <DetailLabel>Year</DetailLabel>
                <DetailValue>{car.year}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Mileage</DetailLabel>
                <DetailValue>{car.mileage.toLocaleString()} km</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Fuel Type</DetailLabel>
                <DetailValue>{car.fuelType}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Transmission</DetailLabel>
                <DetailValue>{car.transmission}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Power</DetailLabel>
                <DetailValue>{car.power} HP</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Color</DetailLabel>
                <DetailValue>{car.color}</DetailValue>
              </DetailItem>
            </CarDetails>
          </CarInfo>
        </CarHeader>

        <Description>
          <DescriptionTitle>Description</DescriptionTitle>
          <DescriptionText>{car.description}</DescriptionText>
        </Description>

        <ContactSection>
          <ContactTitle>
            {language === 'bg' ? 'Информация за продавача' : 'Seller Information'}
          </ContactTitle>
          
          <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <User size={18} color="#FF8F10" />
              <strong style={{ color: '#212529' }}>
                {car.ownerName || (language === 'bg' ? 'Продавач' : 'Seller')}
              </strong>
            </div>
            
            {car.userId && (
              <button
                onClick={() => navigate(`/profile/${car.userId}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid #FF8F10',
                  borderRadius: '6px',
                  color: '#FF8F10',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FF8F10';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#FF8F10';
                }}
              >
                <ExternalLink size={16} />
                {language === 'bg' ? 'Виж профила' : 'View Profile'}
              </button>
            )}
          </div>
          
          {user && car.userId && car.userId !== user.uid && (
            <ContactButton
              onClick={() => navigate(`/messages?userId=${car.userId}`)}
            >
              <MessageCircle size={20} />
              {language === 'bg' ? 'Изпрати съобщение' : 'Send Message'}
            </ContactButton>
          )}
          
          {!user && (
            <ContactButton
              onClick={() => navigate('/login')}
              style={{ background: '#6c757d' }}
            >
              {language === 'bg' ? 'Влезте, за да изпратите съобщение' : 'Login to send a message'}
            </ContactButton>
          )}
        </ContactSection>

        <RatingSystem
          rating={car.sellerRating || 0}
          dealerRating={car.sellerRating}
          showForm={true}
        />
      </PageContainer>
    </DetailsContainer>
  );
};

export default CarDetailsPage;
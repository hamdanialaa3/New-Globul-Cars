
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import { numericCarSystemService, type NumericCarData } from '../../services/numeric-car-system.service';
import { SocialAuthService } from '../../firebase/social-auth-service';
import { logger } from '../../services/logger-service';
import { MessageCircle, ArrowLeft, Share2, Heart, Calendar, Gauge, Fuel, Settings, MapPin, ShieldCheck, Flag } from 'lucide-react';

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Premium Styled Components ---
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-background, #f8f9fa);
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const CarCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.06);
  border: 1px solid var(--border-primary, #eaeaea);
  overflow: hidden;
  padding: 2rem;
`;

const SellerCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.06);
  border: 1px solid var(--border-primary, #eaeaea);
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    transform: translateX(-2px);
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary, #1a1a1a);
  margin-bottom: 0.5rem;
  line-height: 1.2;
`;

const PriceTag = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-primary, #ff8f10) 0%, #ff5500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SpecGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--bg-secondary, #f8f9fa);
  border-radius: 12px;
`;

const SpecItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  svg {
    color: var(--accent-primary, #ff8f10);
    opacity: 0.8;
  }
`;

const SpecLabel = styled.span`
  font-size: 0.85rem;
  color: var(--text-secondary, #666);
  font-weight: 600;
  text-transform: uppercase;
`;

const SpecValue = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary, #1a1a1a);
`;

const SellerAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #eee;
  margin-bottom: 1rem;
  overflow: hidden;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SellerName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const VerifiedBadge = styled(ShieldCheck)`
  color: #00ccff;
  width: 20px;
  height: 20px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  margin-bottom: 1rem;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, var(--accent-primary, #ff8f10) 0%, #ff5500 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(255, 143, 16, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 143, 16, 0.4);
    }
  ` : `
    background: white;
    border: 2px solid var(--border-primary, #eaeaea);
    color: var(--text-primary, #333);

    &:hover {
      border-color: var(--accent-primary, #ff8f10);
      color: var(--accent-primary, #ff8f10);
      background: #fff;
    }
  `}
`;

const LocationTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg-secondary, #f0f0f0);
  border-radius: 20px;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
`;

// Component
const NumericCarDetailsPage: React.FC = () => {
  const { sellerNumericId, carNumericId } = useParams<{
    sellerNumericId: string;
    carNumericId: string;
  }>();
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [car, setCar] = useState<NumericCarData | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load Logic
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const sNum = parseInt(sellerNumericId || '0');
        const cNum = parseInt(carNumericId || '0');
        if (!sNum || !cNum) throw new Error('Invalid IDs');

        const carData = await numericCarSystemService.getCarByNumericIds(sNum, cNum);
        if (!carData) throw new Error('Car not found');

        const sellerProfile = await SocialAuthService.getBulgarianUserProfile(carData.sellerId);
        setCar(carData);
        setSeller(sellerProfile);
      } catch (err) {
        toast.error('Failed to load car details');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [sellerNumericId, carNumericId]);

  const handleMessage = async () => {
    if (!currentUser) return navigate('/login');
    try {
      const userProfile = await SocialAuthService.getBulgarianUserProfile(currentUser.uid);
      if (userProfile?.numericId && seller?.numericId) {
        navigate(`/messages/${userProfile.numericId}/${seller.numericId}?car=${car?.numericId}`);
      }
    } catch (e) { toast.error('Error starting chat'); }
  };

  if (loading) return <PageContainer><div>Loading...</div></PageContainer>;
  if (!car) return <PageContainer><div>Car not found</div></PageContainer>;

  const t = {
    message: language === 'bg' ? 'Изпрати съобщение' : 'Message Seller',
    share: language === 'bg' ? 'Сподели' : 'Share',
    save: language === 'bg' ? 'Запази' : 'Save to Favorites',
    mileage: language === 'bg' ? 'Пробег' : 'Mileage',
    year: language === 'bg' ? 'Година' : 'Year',
    fuel: language === 'bg' ? 'Гориво' : 'Fuel Type',
    trans: language === 'bg' ? 'Скорости' : 'Transmission',
    verified: language === 'bg' ? 'Проверен търговец' : 'Verified Seller',
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </BackButton>
        <span style={{ color: '#666', fontSize: '0.9rem' }}>Back to results</span>
      </Header>

      <ContentWrapper>
        {/* Left Column: Car Details */}
        <CarCard>
          <div style={{ marginBottom: '1rem' }}>
            <LocationTag>
              <MapPin size={16} />
              {car.regionNameBg || car.region || 'Bulgaria'}
            </LocationTag>
            <LocationTag>
              <Flag size={16} />
              ID: {car.sellerNumericId}/{car.carNumericId}
            </LocationTag>
          </div>

          <Title>{car.make} {car.model} {car.year}</Title>
          <PriceTag>
            €{car.price?.toLocaleString()}
          </PriceTag>

          <SpecGrid>
            <SpecItem>
              <Gauge size={24} />
              <div>
                <SpecLabel>{t.mileage}</SpecLabel>
                <SpecValue>{car.mileage?.toLocaleString() || 'N/A'} km</SpecValue>
              </div>
            </SpecItem>
            <SpecItem>
              <Calendar size={24} />
              <div>
                <SpecLabel>{t.year}</SpecLabel>
                <SpecValue>{car.year}</SpecValue>
              </div>
            </SpecItem>
            <SpecItem>
              <Fuel size={24} />
              <div>
                <SpecLabel>{t.fuel}</SpecLabel>
                <SpecValue>{car.fuelType || 'N/A'}</SpecValue>
              </div>
            </SpecItem>
            <SpecItem>
              <Settings size={24} />
              <div>
                <SpecLabel>{t.trans}</SpecLabel>
                <SpecValue>{car.transmission || 'N/A'}</SpecValue>
              </div>
            </SpecItem>
          </SpecGrid>

          <div style={{ lineHeight: '1.6', color: '#444' }}>
            <h3>Description</h3>
            <p>{car.description || 'No description provided.'}</p>
          </div>
        </CarCard>

        {/* Right Column: Seller Actions */}
        <SellerCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <SellerAvatar>
              <img src={seller?.photoURL || 'https://via.placeholder.com/80'} alt="Seller" />
            </SellerAvatar>
            <div>
              <SellerName>
                {seller?.displayName || 'Private Seller'}
                {seller?.isVerified && <VerifiedBadge />}
              </SellerName>
              <span style={{ color: '#666', fontSize: '0.9rem' }}>{t.verified}</span>
            </div>
          </div>

          <ActionButton $variant="primary" onClick={handleMessage}>
            <MessageCircle size={20} />
            {t.message}
          </ActionButton>

          <ActionButton $variant="secondary">
            <Heart size={20} />
            {t.save}
          </ActionButton>

          <ActionButton $variant="secondary">
            <Share2 size={20} />
            {t.share}
          </ActionButton>
        </SellerCard>
      </ContentWrapper>
    </PageContainer>
  );
};

export default NumericCarDetailsPage;

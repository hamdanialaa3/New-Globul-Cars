// Edit Car Page - Full workflow for editing existing car listings
// صفحة تعديل السيارة - workflow كامل للتعديل

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { unifiedCarService } from '../../services/car';
import SellWorkflowService from '../../services/sellWorkflowService';
import { CarListing } from '../../types/CarListing';
import { logger } from '../../services/logger-service';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #7f8c8d;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #7f8c8d;
  font-size: 1.2rem;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #e74c3c;
  font-size: 1.2rem;
`;

const EditCarPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [car, setCar] = useState<any>(null); // UnifiedCar or CarListing

  useEffect(() => {
    loadCarData();
  }, [carId]);

  const loadCarData = async () => {
    if (!carId) {
      setError(language === 'bg' ? 'ID на обявата липсва' : 'Car ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const carData = await unifiedCarService.getCarById(carId);
      
      if (!carData) {
        setError(language === 'bg' ? 'Обявата не е намерена' : 'Listing not found');
        setLoading(false);
        return;
      }

      // Check if user owns this listing
      if (carData.sellerId !== currentUser?.uid) {
        setError(language === 'bg' 
          ? 'Нямате разрешение да редактирате тази обява' 
          : 'You do not have permission to edit this listing');
        setLoading(false);
        return;
      }

      // Convert UnifiedCar to CarListing format for compatibility
      const carListingData: CarListing = {
        ...carData,
        vehicleType: carData.vehicleType || 'car',
        sellerType: carData.sellerType || 'private',
        sellerName: carData.ownerName || carData.sellerName || '',
        sellerEmail: carData.sellerEmail || '',
        sellerPhone: carData.sellerPhone || '',
        city: carData.city || '',
        region: carData.region || '',
        status: carData.status || 'active',
        accidentHistory: carData.accidentHistory || false,
        serviceHistory: carData.serviceHistory || false,
        negotiable: carData.negotiable || false,
        financing: carData.financing || false,
        tradeIn: carData.tradeIn || false,
        warranty: carData.warranty || false,
        paymentMethods: carData.paymentMethods || [],
        preferredContact: carData.preferredContact || []
      };
      
      setCar(carListingData);
      
      // Prepare workflow data and redirect to edit workflow
      prepareEditWorkflow(carListingData);
      
    } catch (err) {
      logger.error('Error loading car data for edit', err as Error, { carId, userId: currentUser?.uid });
      setError(language === 'bg' 
        ? 'Грешка при зареждане на данните' 
        : 'Error loading data');
      setLoading(false);
    }
  };

  const prepareEditWorkflow = (carData: CarListing) => {
    // Build URL params from car data
    const params = new URLSearchParams();
    
    // Vehicle Type & Seller
    if (carData.vehicleType) params.set('vt', carData.vehicleType);
    if (carData.sellerType) params.set('st', carData.sellerType);
    
    // Basic Info
    if (carData.make) params.set('mk', carData.make);
    if (carData.model) params.set('md', carData.model);
    if (carData.year) params.set('fy', carData.year.toString());
    if (carData.mileage) params.set('mi', carData.mileage.toString());
    if (carData.fuelType) params.set('fm', carData.fuelType);
    if (carData.transmission) params.set('tr', carData.transmission);
    if (carData.color) params.set('cl', carData.color);
    
    // Equipment
    if (carData.safetyEquipment && carData.safetyEquipment.length > 0) {
      params.set('safety', carData.safetyEquipment.join(','));
    }
    if (carData.comfortEquipment && carData.comfortEquipment.length > 0) {
      params.set('comfort', carData.comfortEquipment.join(','));
    }
    if (carData.infotainmentEquipment && carData.infotainmentEquipment.length > 0) {
      params.set('infotainment', carData.infotainmentEquipment.join(','));
    }
    if (carData.extras && carData.extras.length > 0) {
      params.set('extras', carData.extras.join(','));
    }
    
    // Pricing
    if (carData.price) params.set('price', carData.price.toString());
    if (carData.currency) params.set('currency', carData.currency);
    if (carData.priceType) params.set('priceType', carData.priceType);
    if (carData.negotiable) params.set('negotiable', 'true');
    
    // Store in session storage for edit mode
    sessionStorage.setItem('edit_mode', 'true');
    sessionStorage.setItem('edit_car_id', carId || '');
    sessionStorage.setItem('edit_car_data', JSON.stringify(carData));
    
    // Store images in localStorage if they exist
    if (carData.images && carData.images.length > 0) {
      // Images are already URLs, we'll need to download them and convert to base64
      convertImagesToBase64(carData.images).then(base64Images => {
        localStorage.setItem('globul_sell_workflow_images', JSON.stringify(base64Images));
        params.set('images', carData.images!.length.toString());
        
        // Navigate to vehicle data page with all params
        navigate(`/sell/inserat/${carData.vehicleType || 'car'}/fahrzeugdaten/antrieb-und-umwelt?${params.toString()}`);
      });
    } else {
      // Navigate without images
      navigate(`/sell/inserat/${carData.vehicleType || 'car'}/fahrzeugdaten/antrieb-und-umwelt?${params.toString()}`);
    }
  };

  const convertImagesToBase64 = async (imageUrls: (string | File)[]): Promise<string[]> => {
    const promises = imageUrls.map(async (urlOrFile) => {
      try {
        // If it's already a string (URL), fetch it
        if (typeof urlOrFile === 'string') {
          const response = await fetch(urlOrFile);
          const blob = await response.blob();
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
        // If it's a File, read it directly
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(urlOrFile);
        });
      } catch (error) {
        logger.error('Error converting image to base64', error as Error);
        return '';
      }
    });
    
    const base64Images = await Promise.all(promises);
    return base64Images.filter(img => img !== '');
  };

  if (loading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <LoadingState>
            {language === 'bg' ? '⏳ Зареждане...' : '⏳ Loading...'}
          </LoadingState>
        </ContentWrapper>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ContentWrapper>
          <ErrorState>
            ❌ {error}
            <div style={{ marginTop: '2rem' }}>
              <button 
                onClick={() => navigate('/my-listings')}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                {language === 'bg' ? 'Назад към обявите' : 'Back to listings'}
              </button>
            </div>
          </ErrorState>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>
            {language === 'bg' ? '🔄 Пренасочване към редакция...' : '🔄 Redirecting to edit...'}
          </Title>
          <Subtitle>
            {language === 'bg' 
              ? 'Моля изчакайте, подготвяме данните за редакция...' 
              : 'Please wait, preparing data for editing...'}
          </Subtitle>
        </Header>
      </ContentWrapper>
    </PageContainer>
  );
};

export default EditCarPage;


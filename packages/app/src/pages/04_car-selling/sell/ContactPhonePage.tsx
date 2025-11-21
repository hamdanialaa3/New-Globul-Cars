import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '@globul-cars/core/contextsAuthProvider';
import SellWorkflowService from '@globul-cars/services/sellWorkflowService';
import WorkflowPersistenceService from '@globul-cars/services/workflowPersistenceService';
import { ProfileStatsService } from '@globul-cars/services/profile/profile-stats-service';
import { logger } from '@globul-cars/services';

const ContactPhoneContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const HeaderCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const FormCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  margin-bottom: 2rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const Input = styled.input`
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #ecf0f1;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'warning' }>`
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
          }
        `;
      case 'secondary':
        return `
          background: #f8f9fa;
          color: #6c757d;
          border: 2px solid #e9ecef;
          
          &:hover {
            background: #e9ecef;
            color: #495057;
          }
        `;
      case 'warning':
        return `
          background: linear-gradient(135deg, #ffc107, #ff9800);
          color: #000;
          font-weight: 700;
          box-shadow: 0 10px 20px rgba(255, 193, 7, 0.3);
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(255, 193, 7, 0.4);
            background: linear-gradient(135deg, #ffb300, #ff8f00);
          }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
          
          &:hover {
            background: #5a6268;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  border-left: 4px solid #667eea;
`;

const InfoTitle = styled.h4`
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
`;

const InfoText = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
`;

const SummaryCard = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
`;

const SummaryText = styled.p`
  margin: 0;
  opacity: 0.9;
  line-height: 1.6;
`;

const ErrorCard = styled.div<{ $hasWarning?: boolean }>`
  background: ${props => props.$hasWarning ? '#fff3cd' : '#fee'};
  border: 2px solid ${props => props.$hasWarning ? '#ffc107' : '#fcc'};
  border-radius: 15px;
  padding: 1.5rem;
  margin: 2rem 0;
  color: ${props => props.$hasWarning ? '#856404' : '#c00'};
  text-align: left;
`;

const MissingFieldsList = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  
  ul {
    margin: 0.5rem 0 0 1.5rem;
    padding: 0;
    
    li {
      margin: 0.25rem 0;
    }
  }
`;

const SuccessCard = styled.div`
  background: #efe;
  border: 2px solid #cfc;
  border-radius: 15px;
  padding: 1.5rem;
  margin: 2rem 0;
  color: #060;
  text-align: center;
`;

const ContactPhonePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [contact, setContact] = useState({
    additionalPhone: '',
    availableHours: '',
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForcePublish, setShowForcePublish] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Extract parameters from URL
  const vehicleType = searchParams.get('vt');
  const sellerType = searchParams.get('st');
  const make = searchParams.get('mk');
  const model = searchParams.get('md');
  const fuelType = searchParams.get('fm');
  const year = searchParams.get('fy');
  const mileage = searchParams.get('mi');
  const condition = searchParams.get('i');
  const safety = searchParams.get('safety');
  const comfort = searchParams.get('comfort');
  const infotainment = searchParams.get('infotainment');
  const extras = searchParams.get('extras');
  const images = searchParams.get('images');
  const price = searchParams.get('price');
  const currency = searchParams.get('currency');
  const priceType = searchParams.get('priceType');
  const negotiable = searchParams.get('negotiable');
  const financing = searchParams.get('financing');
  const tradeIn = searchParams.get('tradeIn');
  const warranty = searchParams.get('warranty');
  const warrantyMonths = searchParams.get('warrantyMonths');
  const paymentMethods = searchParams.get('paymentMethods');
  const sellerName = searchParams.get('sellerName');
  const sellerEmail = searchParams.get('sellerEmail');
  const sellerPhone = searchParams.get('sellerPhone');
  const preferredContact = searchParams.get('preferredContact');
  const location = searchParams.get('location');
  const city = searchParams.get('city');
  const region = searchParams.get('region');
  const postalCode = searchParams.get('postalCode');

  const handleInputChange = (field: string, value: string) => {
    setContact(prev => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    // Build URL with parameters
    const params = new URLSearchParams();
    if (vehicleType) params.set('vt', vehicleType);
    if (sellerType) params.set('st', sellerType);
    if (make) params.set('mk', make);
    if (model) params.set('md', model);
    if (fuelType) params.set('fm', fuelType);
    if (year) params.set('fy', year);
    if (mileage) params.set('mi', mileage);
    if (condition) params.set('i', condition);
    if (safety) params.set('safety', safety);
    if (comfort) params.set('comfort', comfort);
    if (infotainment) params.set('infotainment', infotainment);
    if (extras) params.set('extras', extras);
    if (images) params.set('images', images);
    if (price) params.set('price', price);
    if (currency) params.set('currency', currency);
    if (priceType) params.set('priceType', priceType);
    if (negotiable) params.set('negotiable', negotiable);
    if (financing) params.set('financing', financing);
    if (tradeIn) params.set('tradeIn', tradeIn);
    if (warranty) params.set('warranty', warranty);
    if (warrantyMonths) params.set('warrantyMonths', warrantyMonths);
    if (paymentMethods) params.set('paymentMethods', paymentMethods);
    if (sellerName) params.set('sellerName', sellerName);
    if (sellerEmail) params.set('sellerEmail', sellerEmail);
    if (sellerPhone) params.set('sellerPhone', sellerPhone);
    if (preferredContact) params.set('preferredContact', preferredContact);
    if (location) params.set('location', location);
    if (city) params.set('city', city);
    if (region) params.set('region', region);
    if (postalCode) params.set('postalCode', postalCode);

    navigate(`/sell/inserat/${vehicleType || 'pkw'}/kontakt/adresse?${params.toString()}`);
  };

  const handleFinish = async () => {
    if (!user) {
      setError('Моля, влезте в профила си, за да публикувате обява.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Collect all workflow data from URL parameters
      const workflowData = {
        vehicleType,
        sellerType,
        make,
        model,
        fuelType,
        year,
        mileage,
        condition,
        safety,
        comfort,
        infotainment,
        extras,
        images,
        price,
        currency,
        priceType,
        negotiable,
        financing,
        tradeIn,
        warranty,
        warrantyMonths,
        paymentMethods,
        sellerName,
        sellerEmail,
        sellerPhone,
        preferredContact,
        location,
        city,
        region,
        postalCode,
        additionalPhone: contact.additionalPhone,
        availableHours: contact.availableHours,
        additionalInfo: contact.additionalInfo
      };

      // ⚡ FLEXIBLE VALIDATION: Validate data (non-strict by default)
      const validation = SellWorkflowService.validateWorkflowData(workflowData, false);
      
      // If critical fields are missing, block publication
      if (validation.criticalMissing) {
        setError(`❌ Критична информация липсва: ${validation.missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }
      
      // If non-critical fields are missing, show warning with option to proceed
      if (!validation.isValid && !showForcePublish) {
        setMissingFields(validation.missingFields);
        setError(`⚠️ Препоръчителни полета липсват: ${validation.missingFields.join(', ')}`);
        setShowForcePublish(true);
        setIsSubmitting(false);
        return;
      }

      // Get saved images from localStorage
      const savedImages = WorkflowPersistenceService.getImagesAsFiles();
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`Found ${savedImages.length} saved images`);
      }

      // Create car listing with images
      const carId = await SellWorkflowService.createCarListing(
        workflowData,
        user.uid,
        savedImages.length > 0 ? savedImages : undefined
      );

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Car listing created successfully', { carId });
      }

      // ✅ Increment cars listed stat
      try {
        await ProfileStatsService.getInstance().incrementCarsListed(user.uid);
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Stats updated: Cars listed +1');
        }
      } catch (statsError) {
        logger.error('Failed to update stats', statsError as Error, { userId: user.uid });
        // Continue anyway - don't block the main flow
      }

      // Clear workflow cache and images
      WorkflowPersistenceService.clearState();

      // Show success message
      alert(`✅ Обявата е публикувана успешно!\n\nID: ${carId}\n\nСега можете да я видите в "Моите обяви".`);

      // Redirect to my listings page
      navigate('/my-listings');
    } catch (error: any) {
      logger.error('Error creating car listing', error as Error, { 
        userId: user?.uid,
        errorMessage: error.message 
      });
      setError(error.message || 'Възникна грешка при създаване на обявата. Моля, опитайте отново.');
      setIsSubmitting(false);
    }
  };

  return (
    <ContactPhoneContainer>
      <ContentWrapper>
        <HeaderCard>
          <Title>Контакт - Телефон</Title>
          <Subtitle>
            Допълнителна информация за контакт
          </Subtitle>
        </HeaderCard>

        <FormCard>
          <FormGrid>
            <FormGroup>
              <Label>Допълнителен телефон</Label>
              <Input
                type="tel"
                value={contact.additionalPhone}
                onChange={(e) => handleInputChange('additionalPhone', e.target.value)}
                placeholder="+359 888 123 456"
              />
            </FormGroup>

            <FormGroup>
              <Label>Работно време</Label>
              <Input
                type="text"
                value={contact.availableHours}
                onChange={(e) => handleInputChange('availableHours', e.target.value)}
                placeholder="Понеделник - Петък: 9:00 - 18:00"
              />
            </FormGroup>
          </FormGrid>

          <FormGroup>
            <Label>Допълнителна информация за контакт</Label>
            <TextArea
              value={contact.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              placeholder="Допълнителна информация, която искате да споделите с купувачите..."
            />
          </FormGroup>
        </FormCard>

        <SummaryCard>
          <SummaryTitle>📋 Резюме на обявата</SummaryTitle>
          <SummaryText>
            <strong>Превозно средство:</strong> {make} {model} ({year})<br/>
            <strong>Пробег:</strong> {mileage} км<br/>
            <strong>Цена:</strong> {price} {currency}<br/>
            <strong>Продавач:</strong> {sellerName}<br/>
            <strong>Местоположение:</strong> {city}, {region}
          </SummaryText>
        </SummaryCard>

        {error && (
          <ErrorCard $hasWarning={showForcePublish}>
            <strong>{showForcePublish ? '⚠️ Предупреждение' : '⚠️ Грешка'}</strong><br/>
            {error}
            {missingFields.length > 0 && (
              <MissingFieldsList>
                <strong>Липсващи полета:</strong>
                <ul>
                  {missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </MissingFieldsList>
            )}
          </ErrorCard>
        )}

        <NavigationButtons>
          <Button variant="secondary" onClick={handleBack} disabled={isSubmitting}>
            ← Назад
          </Button>

          {showForcePublish ? (
            <Button variant="warning" onClick={handleFinish} disabled={isSubmitting}>
              {isSubmitting ? '⏳ Публикуване...' : '⚠️ Публикувай на всяка цена'}
            </Button>
          ) : (
            <Button variant="primary" onClick={handleFinish} disabled={isSubmitting}>
              {isSubmitting ? '⏳ Публикуване...' : '✅ Публикувай обявата'}
            </Button>
          )}
        </NavigationButtons>

        <InfoCard>
          <InfoTitle>ℹ️ За контактната информация</InfoTitle>
          <InfoText>
            Допълнителната контактна информация е по желание. Тя може да помогне 
            на купувачите да се свържат с вас по-лесно. Можете да промените тази 
            информация по-късно от вашия профил.
          </InfoText>
        </InfoCard>
      </ContentWrapper>
    </ContactPhoneContainer>
  );
};

export default ContactPhonePage;

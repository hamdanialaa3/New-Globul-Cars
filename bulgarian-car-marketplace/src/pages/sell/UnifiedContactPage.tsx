// Unified Contact Page - All Contact Info in One Page
// صفحة موحدة للتواصل - كل المعلومات في مكان واحد

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../context/AuthProvider';
import SplitScreenLayout from '../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../components/WorkflowVisualization';
import SellWorkflowService from '../../services/sellWorkflowService';
import { BULGARIA_REGIONS, getCitiesByRegion } from '../../data/bulgaria-locations';
import * as S from './UnifiedContactStyles';

const CONTACT_METHODS = [
  { id: 'phone', iconComponent: 'PhoneIcon', labelBg: 'Телефон', labelEn: 'Phone' },
  { id: 'email', iconComponent: 'EmailIcon', labelBg: 'Имейл', labelEn: 'Email' },
  { id: 'whatsapp', iconComponent: 'WhatsAppIcon', labelBg: 'WhatsApp', labelEn: 'WhatsApp' },
  { id: 'viber', iconComponent: 'ViberIcon', labelBg: 'Viber', labelEn: 'Viber' },
  { id: 'telegram', iconComponent: 'TelegramIcon', labelBg: 'Telegram', labelEn: 'Telegram' },
  { id: 'messenger', iconComponent: 'MessengerIcon', labelBg: 'Facebook Messenger', labelEn: 'Facebook Messenger' },
  { id: 'sms', iconComponent: 'SMSIcon', labelBg: 'SMS', labelEn: 'SMS' }
];

const UnifiedContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { currentUser } = useAuth();

  // Helper function to get the appropriate icon component
  const getContactIcon = (iconComponent: string) => {
    switch (iconComponent) {
      case 'PhoneIcon': return <S.PhoneIcon />;
      case 'EmailIcon': return <S.EmailIcon />;
      case 'WhatsAppIcon': return <S.WhatsAppIcon />;
      case 'ViberIcon': return <S.ViberIcon />;
      case 'TelegramIcon': return <S.TelegramIcon />;
      case 'MessengerIcon': return <S.MessengerIcon />;
      case 'SMSIcon': return <S.SMSIcon />;
      default: return null;
    }
  };

  const [contactData, setContactData] = useState({
    sellerName: '',
    sellerEmail: '',
    sellerPhone: '',
    preferredContact: [] as string[],
    region: '',
    city: '',
    postalCode: '',
    location: '',
    additionalPhone: '',
    availableHours: '',
    notes: ''
  });

  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Extract ALL parameters from URL
  const vehicleType = searchParams.get('vt');
  const sellerType = searchParams.get('st');
  const make = searchParams.get('mk');
  const model = searchParams.get('md'); // ← IMPORTANT!
  const fuelType = searchParams.get('fm');
  const year = searchParams.get('fy');
  const mileage = searchParams.get('mi');
  const transmission = searchParams.get('tr');
  const color = searchParams.get('cl');
  const safety = searchParams.get('safety');
  const comfort = searchParams.get('comfort');
  const infotainment = searchParams.get('infotainment');
  const extras = searchParams.get('extras');
  const images = searchParams.get('images');
  const price = searchParams.get('price');
  const currency = searchParams.get('currency');
  const priceType = searchParams.get('priceType');
  const negotiable = searchParams.get('negotiable');

  // Load user profile data
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        setContactData(prev => ({
          ...prev,
          sellerName: currentUser.displayName || '',
          sellerEmail: currentUser.email || ''
        }));
      }
    };
    loadUserData();
  }, [currentUser]);

  // Update cities when region changes
  useEffect(() => {
    if (contactData.region) {
      const cities = getCitiesByRegion(contactData.region);
      setAvailableCities(cities);
      // Reset city if not in new region
      if (!cities.includes(contactData.city)) {
        setContactData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
    }
  }, [contactData.region]);

  const handleInputChange = (field: string, value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  const toggleContactMethod = (methodId: string) => {
    setContactData(prev => ({
      ...prev,
      preferredContact: prev.preferredContact.includes(methodId)
        ? prev.preferredContact.filter(m => m !== methodId)
        : [...prev.preferredContact, methodId]
    }));
  };

  const handlePublish = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      // Debug: Log all URL params
      console.log('🔍 URL Parameters:', {
        make, model, year, price, sellerType, vehicleType,
        mileage, fuelType, transmission, color
      });
      
      // Validation
      if (!make) {
        throw new Error(language === 'bg' 
          ? 'Липсва задължителна информация: Марка' 
          : 'Missing required information: Make');
      }
      
      // Model is optional - use "Unknown" if not provided
      const finalModel = model || (language === 'bg' ? 'Неизвестен модел' : 'Unknown Model');

      if (!year) {
        throw new Error(language === 'bg' 
          ? 'Липсва задължителна информация: Година' 
          : 'Missing required information: Year');
      }

      if (!price) {
        throw new Error(language === 'bg' 
          ? 'Липсва задължителна информация: Цена' 
          : 'Missing required information: Price');
      }

      if (!contactData.sellerName || !contactData.sellerEmail || !contactData.sellerPhone) {
        throw new Error(language === 'bg' 
          ? 'Моля попълнете всички контактни данни' 
          : 'Please fill all contact information');
      }

      if (!contactData.region || !contactData.city) {
        throw new Error(language === 'bg' 
          ? 'Моля изберете област и град' 
          : 'Please select region and city');
      }

      // ✅ Build workflow data matching SellWorkflowService.transformWorkflowData structure
      const workflowData = {
        // Vehicle Type & Seller
        vehicleType: vehicleType || 'car',
        sellerType: sellerType || 'private',
        
        // Basic Vehicle Info (from URL params)
        make: make,
        model: finalModel,
        year: year,
        mileage: mileage || '0',
        fuelType: fuelType || 'Petrol',
        fm: fuelType || 'Petrol', // alternative key
        transmission: transmission || 'Manual',
        color: color || '',
        
        // Pricing (from URL params)
        price: price,
        currency: currency || 'EUR',
        priceType: priceType || 'fixed',
        negotiable: negotiable === 'true',
        
        // Equipment (from URL params - already comma-separated strings)
        safety: safety || '',
        comfort: comfort || '',
        infotainment: infotainment || '',
        extras: extras || '',
        
        // Contact Information (from form)
        sellerName: contactData.sellerName,
        sellerEmail: contactData.sellerEmail,
        sellerPhone: contactData.sellerPhone,
        additionalPhone: contactData.additionalPhone || '',
        preferredContact: contactData.preferredContact.join(','), // convert array to string
        availableHours: contactData.availableHours || '',
        additionalInfo: contactData.notes || '',
        
        // Location (from form)
        region: contactData.region,
        city: contactData.city,
        postalCode: contactData.postalCode || '',
        location: contactData.location || '',
        
        // Images (will be handled separately as File[])
        images: images || '0'
      };

      console.log('📝 Creating car listing with workflow data:', workflowData);

      // Get current user ID
      const userId = currentUser?.uid;
      if (!userId) {
        throw new Error(language === 'bg' 
          ? 'Моля влезте в профила си' 
          : 'Please log in to your account');
      }

      // ✅ Load images from localStorage and convert to Files
      let imageFiles: File[] = [];
      try {
        const savedImagesJson = localStorage.getItem('globul_sell_workflow_images');
        if (savedImagesJson) {
          const base64Images = JSON.parse(savedImagesJson) as string[];
          console.log(`📸 Found ${base64Images.length} images in localStorage`);
          
          // Convert base64 to File objects
          imageFiles = await Promise.all(
            base64Images.map(async (base64, index) => {
              const response = await fetch(base64);
              const blob = await response.blob();
              return new File([blob], `car_image_${index + 1}.jpg`, { type: 'image/jpeg' });
            })
          );
          
          console.log(`✅ Converted ${imageFiles.length} images to File objects`);
        }
      } catch (error) {
        console.error('⚠️ Error loading images from localStorage:', error);
        // Continue without images - don't block listing creation
      }

      // Create listing with images
      const carId = await SellWorkflowService.createCarListing(workflowData, userId, imageFiles);

      if (!carId) {
        throw new Error('Failed to create listing');
      }

      // Success
      alert(language === 'bg' 
        ? `✅ Обявата е публикувана успешно!\n\nМарка/Модел: ${make} ${finalModel}\nГодина: ${year}\nID: ${carId}\n\nСега можете да я видите в "Моите обяви".`
        : `✅ Listing published successfully!\n\nMake/Model: ${make} ${finalModel}\nYear: ${year}\nID: ${carId}\n\nYou can now see it in "My Listings".`
      );

      navigate('/my-listings');

    } catch (error: any) {
      console.error('❌ Error creating listing:', error);
      setError(error.message || (language === 'bg' 
        ? 'Възникна грешка при създаване на обявата' 
        : 'Error creating listing'));
      setIsSubmitting(false);
    }
  };

  const workflowSteps = [
    { id: 'vehicle', label: language === 'bg' ? 'Тип' : 'Type', icon: undefined, isCompleted: true },
    { id: 'seller', label: language === 'bg' ? 'Продавач' : 'Seller', icon: undefined, isCompleted: true },
    { id: 'data', label: language === 'bg' ? 'Данни' : 'Data', icon: undefined, isCompleted: true },
    { id: 'equipment', label: language === 'bg' ? 'Оборудване' : 'Equipment', icon: undefined, isCompleted: true },
    { id: 'images', label: language === 'bg' ? 'Снимки' : 'Images', icon: undefined, isCompleted: true },
    { id: 'pricing', label: language === 'bg' ? 'Цена' : 'Price', icon: undefined, isCompleted: true },
    { id: 'contact', label: language === 'bg' ? 'Контакт' : 'Contact', icon: undefined, isCompleted: false },
    { id: 'publish', label: language === 'bg' ? 'Публикуване' : 'Publish', icon: undefined, isCompleted: false }
  ];

  const isFormValid = 
    contactData.sellerName &&
    contactData.sellerEmail &&
    contactData.sellerPhone &&
    contactData.region &&
    contactData.city;

  const leftContent = (
    <S.ContentSection>
      <S.HeaderCard>
        <S.Title>
          {language === 'bg' ? 'Контактна информация' : 'Contact Information'}
        </S.Title>
        <S.Subtitle>
          {language === 'bg' 
            ? 'Въведете данни за контакт и местоположение' 
            : 'Enter contact and location details'}
        </S.Subtitle>
      </S.HeaderCard>

      {/* Top Navigation Buttons */}
      <S.NavigationButtons>
        <S.Button
          type="button"
          $variant="secondary"
          onClick={() => navigate(-1)}
        >
          ← {language === 'bg' ? 'Назад' : 'Back'}
        </S.Button>

        <S.Button
          type="button"
          $variant="primary"
          onClick={handlePublish}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting 
            ? (language === 'bg' ? 'Публикуване...' : 'Publishing...')
            : (language === 'bg' ? 'Публикувай обявата' : 'Publish Listing')
          } →
        </S.Button>
      </S.NavigationButtons>

      {/* Section 1: Personal Info */}
      <S.SectionCard>
        <S.SectionTitle>
          {language === 'bg' ? '👤 Лична информация' : '👤 Personal Information'}
        </S.SectionTitle>

        <S.CompactGrid>
          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Име' : 'Name'}
            </S.Label>
            <S.Input
              type="text"
              value={contactData.sellerName}
              onChange={(e) => handleInputChange('sellerName', e.target.value)}
              placeholder={language === 'bg' ? 'Вашето име' : 'Your name'}
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Имейл' : 'Email'}
            </S.Label>
            <S.Input
              type="email"
              value={contactData.sellerEmail}
              onChange={(e) => handleInputChange('sellerEmail', e.target.value)}
              placeholder={language === 'bg' ? 'вашият@имейл.com' : 'your@email.com'}
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Телефон' : 'Phone'}
            </S.Label>
            <S.Input
              type="tel"
              value={contactData.sellerPhone}
              onChange={(e) => handleInputChange('sellerPhone', e.target.value)}
              placeholder="+359 888 123 456"
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>
              {language === 'bg' ? 'Допълнителен телефон' : 'Additional Phone'}
            </S.Label>
            <S.Input
              type="tel"
              value={contactData.additionalPhone}
              onChange={(e) => handleInputChange('additionalPhone', e.target.value)}
              placeholder={language === 'bg' ? '+359 888 654 321' : '+359 888 654 321'}
            />
          </S.FormGroup>
        </S.CompactGrid>
      </S.SectionCard>

      {/* Section 2: Location */}
      <S.SectionCard>
        <S.SectionTitle>
          {language === 'bg' ? '📍 Местоположение' : '📍 Location'}
        </S.SectionTitle>

        <S.CompactGrid>
          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Област' : 'Region'}
            </S.Label>
            <S.Select
              value={contactData.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
            >
              <option value="">
                {language === 'bg' ? 'Изберете област' : 'Select region'}
              </option>
              {BULGARIA_REGIONS.map(region => (
                <option key={region.name} value={region.name}>
                  {language === 'bg' ? region.name : region.nameEn}
                </option>
              ))}
            </S.Select>
          </S.FormGroup>

          <S.FormGroup>
            <S.Label $required>
              {language === 'bg' ? 'Град' : 'City'}
            </S.Label>
            <S.Select
              value={contactData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              disabled={!contactData.region}
            >
              <option value="">
                {language === 'bg' ? 'Изберете град' : 'Select city'}
              </option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </S.Select>
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>
              {language === 'bg' ? 'Пощенски код' : 'Postal Code'}
            </S.Label>
            <S.Input
              type="text"
              value={contactData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              placeholder="1000"
            />
          </S.FormGroup>

          <S.FormGroup>
            <S.Label>
              {language === 'bg' ? 'Точно местоположение' : 'Exact Location'}
            </S.Label>
            <S.Input
              type="text"
              value={contactData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder={language === 'bg' ? 'Улица, номер' : 'Street, number'}
            />
          </S.FormGroup>
        </S.CompactGrid>
      </S.SectionCard>

      {/* Section 3: Contact Methods */}
      <S.SectionCard>
        <S.SectionTitle>
          {language === 'bg' ? 'Предпочитан начин на контакт' : 'Preferred Contact Method'}
        </S.SectionTitle>

        <S.ContactMethodsContainer>
          {CONTACT_METHODS.map(method => {
            const isSelected = contactData.preferredContact.includes(method.id);
            
            return (
              <S.ContactMethodRow key={method.id}>
                <S.ContactMethodInfo>
                  {getContactIcon(method.iconComponent)}
                  <S.ContactMethodLabel>
                    {language === 'bg' ? method.labelBg : method.labelEn}
                  </S.ContactMethodLabel>
                </S.ContactMethodInfo>

                <S.CyberToggleWrapper>
                  <S.CyberToggleCheckbox
                    type="checkbox"
                    id={`contact-${method.id}`}
                    checked={isSelected}
                    onChange={() => toggleContactMethod(method.id)}
                  />
                  <S.CyberToggleLabel htmlFor={`contact-${method.id}`}>
                    <S.ToggleTrack />
                    <S.ToggleThumbIcon />
                    <S.ToggleThumbDots />
                    <S.ToggleThumbHighlight />
                    <S.ToggleLabels>
                      <S.ToggleLabelOn>ON</S.ToggleLabelOn>
                      <S.ToggleLabelOff>OFF</S.ToggleLabelOff>
                    </S.ToggleLabels>
                  </S.CyberToggleLabel>
                </S.CyberToggleWrapper>
              </S.ContactMethodRow>
            );
          })}
        </S.ContactMethodsContainer>
      </S.SectionCard>

      {/* Section 4: Additional Info */}
      <S.SectionCard>
        <S.SectionTitle>
          {language === 'bg' ? '📝 Допълнително' : '📝 Additional'}
        </S.SectionTitle>

        <S.FormGroup>
          <S.Label>
            {language === 'bg' ? 'Работно време' : 'Available Hours'}
          </S.Label>
          <S.Input
            type="text"
            value={contactData.availableHours}
            onChange={(e) => handleInputChange('availableHours', e.target.value)}
            placeholder={language === 'bg' 
              ? 'Понеделник - Петък: 9:00 - 18:00' 
              : 'Monday - Friday: 9:00 AM - 6:00 PM'}
          />
        </S.FormGroup>

        <S.FormGroup>
          <S.Label>
            {language === 'bg' ? 'Бележки' : 'Notes'}
          </S.Label>
          <S.TextArea
            value={contactData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder={language === 'bg' 
              ? 'Допълнителна информация за купувачите...' 
              : 'Additional information for buyers...'}
            rows={3}
          />
        </S.FormGroup>
      </S.SectionCard>

      {/* Summary Card */}
      <S.SummaryCard>
        <S.SummaryTitle>
          {language === 'bg' ? '📋 Резюме на обявата' : '📋 Listing Summary'}
        </S.SummaryTitle>

        <S.SummaryRow>
          <S.SummaryLabel>
            {language === 'bg' ? 'Превозно средство:' : 'Vehicle:'}
          </S.SummaryLabel>
          <S.SummaryValue>
            {make} {model || (language === 'bg' ? '(модел неизвестен)' : '(model not specified)')} ({year})
          </S.SummaryValue>
        </S.SummaryRow>

        {mileage && (
          <S.SummaryRow>
            <S.SummaryLabel>
              {language === 'bg' ? 'Пробег:' : 'Mileage:'}
            </S.SummaryLabel>
            <S.SummaryValue>
              {parseInt(mileage).toLocaleString()} {language === 'bg' ? 'км' : 'km'}
            </S.SummaryValue>
          </S.SummaryRow>
        )}

        <S.SummaryRow>
          <S.SummaryLabel>
            {language === 'bg' ? 'Цена:' : 'Price:'}
          </S.SummaryLabel>
          <S.SummaryValue>
            {parseFloat(price || '0').toLocaleString()} {currency}
          </S.SummaryValue>
        </S.SummaryRow>

        <S.SummaryRow>
          <S.SummaryLabel>
            {language === 'bg' ? 'Продавач:' : 'Seller:'}
          </S.SummaryLabel>
          <S.SummaryValue>{contactData.sellerName}</S.SummaryValue>
        </S.SummaryRow>

        <S.SummaryRow>
          <S.SummaryLabel>
            {language === 'bg' ? 'Местоположение:' : 'Location:'}
          </S.SummaryLabel>
          <S.SummaryValue>{contactData.city}, {contactData.region}</S.SummaryValue>
        </S.SummaryRow>
      </S.SummaryCard>

      {/* Error Display */}
      {error && (
        <S.ErrorCard>
          <S.ErrorIcon>⚠️</S.ErrorIcon>
          <S.ErrorText>{error}</S.ErrorText>
        </S.ErrorCard>
      )}

      {/* Navigation */}
      <S.NavigationButtons>
        <S.Button
          type="button"
          $variant="secondary"
          onClick={() => navigate(-1)}
        >
          ← {language === 'bg' ? 'Назад' : 'Back'}
        </S.Button>

        <S.Button
          type="button"
          $variant="primary"
          onClick={handlePublish}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting 
            ? (language === 'bg' ? 'Публикуване...' : 'Publishing...')
            : (language === 'bg' ? 'Публикувай обявата' : 'Publish Listing')
          } →
        </S.Button>
      </S.NavigationButtons>
    </S.ContentSection>
  );

  const rightContent = <WorkflowFlow currentStepIndex={6} totalSteps={8} carBrand={make || undefined} language={language} />;

  return <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} />;
};

export default UnifiedContactPage;


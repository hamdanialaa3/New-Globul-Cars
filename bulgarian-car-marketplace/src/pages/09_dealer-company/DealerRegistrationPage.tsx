// src/pages/DealerRegistrationPage.tsx
// Complete Dealer Registration Page

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { logger } from '../../services/logger-service';
import { userService } from '@/services/user/canonical-user.service';
import type { DealershipInfo } from '../../types/dealership/dealership.types';
import { dealershipService } from '../../services/dealership/dealership.service';
import { UserRepository } from '../../repositories/UserRepository';

// Type alias for compatibility
type DealerProfile = DealershipInfo;
import { Check, Upload, Building, FileText, CreditCard, Send } from 'lucide-react';

const Container = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 3rem;
`;

const ProgressBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    height: 2px;
    background: #e0e0e0;
    z-index: 0;
  }
`;

const Step = styled.div<{ active: boolean; completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
  flex: 1;
`;

const StepCircle = styled.div<{ active: boolean; completed: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => 
    props.completed ? '#10b981' : 
    props.active ? '#FF7900' : '#e0e0e0'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s;
`;

const StepLabel = styled.span<{ active: boolean }>`
  font-size: 0.9rem;
  color: ${props => props.active ? '#2c3e50' : '#7f8c8d'};
  font-weight: ${props => props.active ? '600' : '400'};
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #FF7900;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #FF7900;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #FF7900;
  }
`;

const FileUpload = styled.div`
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #FF7900;
    background: #fff5f0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  background: ${props => props.variant === 'secondary' 
    ? 'white' 
    : 'linear-gradient(135deg, #FF7900, #ff8c1a)'};
  color: ${props => props.variant === 'secondary' ? '#FF7900' : 'white'};
  border: ${props => props.variant === 'secondary' ? '2px solid #FF7900' : 'none'};
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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

const DealerRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dealerData, setDealerData] = useState<Partial<DealerProfile>>({
    companyName: '',
    licenseNumber: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      region: ''
    },
    contactInfo: {
      phone: '',
      email: user?.email || '',
      website: ''
    },
    specializations: [],
    certifications: [],
    verificationStatus: 'pending'
  });

  const steps = [
    { number: 1, label: language === 'bg' ? 'Основна информация' : 'Basic Info', icon: Building },
    { number: 2, label: language === 'bg' ? 'Документи' : 'Documents', icon: FileText },
    { number: 3, label: language === 'bg' ? 'Банкови данни' : 'Bank Details', icon: CreditCard },
    { number: 4, label: language === 'bg' ? 'Преглед' : 'Review', icon: Check }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // ✅ FIXED: Use modern approach instead of deprecated setupDealerProfile
      const dealershipService = new DealershipService();
      
      // 1. Save dealership data
      await dealershipService.saveDealershipInfo(user.uid, dealerData as DealerProfile);
      
      // 2. Update user profile to dealer type
      await UserRepository.update(user.uid, {
        profileType: 'dealer' as any,
        dealershipRef: `dealerships/${user.uid}` as any,
        dealerSnapshot: {
          nameBG: dealerData.dealershipNameBG || dealerData.companyName || '',
          nameEN: dealerData.dealershipNameEN || '',
          logo: dealerData.logo,
          status: 'pending'
        } as any
      });
      
      alert(language === 'bg' 
        ? 'Заявката ви е изпратена успешно! Ще бъдете уведомени след одобрение.'
        : 'Your application has been submitted successfully! You will be notified after approval.');
      
      navigate('/dashboard');
    } catch (error) {
      logger.error('Error submitting dealer application', error as Error);
      alert(language === 'bg'
        ? 'Грешка при изпращане на заявката. Моля, опитайте отново.'
        : 'Error submitting application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <h2>{language === 'bg' ? 'Основна информация' : 'Basic Information'}</h2>
            <FormGroup>
              <Label>{language === 'bg' ? 'Име на компанията' : 'Company Name'} *</Label>
              <Input
                value={dealerData.companyName}
                onChange={(e) => setDealerData({ ...dealerData, companyName: e.target.value })}
                placeholder={language === 'bg' ? 'Въведете име на компанията' : 'Enter company name'}
              />
            </FormGroup>
            <FormGroup>
              <Label>{language === 'bg' ? 'Лицензионен номер' : 'License Number'} *</Label>
              <Input
                value={dealerData.licenseNumber}
                onChange={(e) => setDealerData({ ...dealerData, licenseNumber: e.target.value })}
                placeholder={language === 'bg' ? 'Въведете лицензионен номер' : 'Enter license number'}
              />
            </FormGroup>
            <FormGroup>
              <Label>{language === 'bg' ? 'Адрес' : 'Address'} *</Label>
              <Input
                value={dealerData.address?.street}
                onChange={(e) => setDealerData({ 
                  ...dealerData, 
                  address: { ...dealerData.address!, street: e.target.value }
                })}
                placeholder={language === 'bg' ? 'Улица и номер' : 'Street and number'}
              />
            </FormGroup>
            <FormGroup>
              <Label>{language === 'bg' ? 'Град' : 'City'} *</Label>
              <Select
                value={dealerData.address?.city}
                onChange={(e) => setDealerData({ 
                  ...dealerData, 
                  address: { ...dealerData.address!, city: e.target.value }
                })}
              >
                <option value="">{language === 'bg' ? 'Изберете град' : 'Select city'}</option>
                <option value="Sofia">София / Sofia</option>
                <option value="Plovdiv">Пловдив / Plovdiv</option>
                <option value="Varna">Варна / Varna</option>
                <option value="Burgas">Бургас / Burgas</option>
              </Select>
            </FormGroup>
          </Card>
        );

      case 2:
        return (
          <Card>
            <h2>{language === 'bg' ? 'Документи' : 'Documents'}</h2>
            <FormGroup>
              <Label>{language === 'bg' ? 'Бизнес лиценз' : 'Business License'} *</Label>
              <FileUpload>
                <Upload size={40} color="#FF7900" />
                <p>{language === 'bg' ? 'Качете бизнес лиценз' : 'Upload business license'}</p>
                <input type="file" style={{ display: 'none' }} />
              </FileUpload>
            </FormGroup>
            <FormGroup>
              <Label>{language === 'bg' ? 'ДДС сертификат' : 'VAT Certificate'}</Label>
              <FileUpload>
                <Upload size={40} color="#FF7900" />
                <p>{language === 'bg' ? 'Качете ДДС сертификат' : 'Upload VAT certificate'}</p>
                <input type="file" style={{ display: 'none' }} />
              </FileUpload>
            </FormGroup>
          </Card>
        );

      case 3:
        return (
          <Card>
            <h2>{language === 'bg' ? 'Банкови данни' : 'Bank Details'}</h2>
            <FormGroup>
              <Label>{language === 'bg' ? 'Банка' : 'Bank'} *</Label>
              <Input placeholder={language === 'bg' ? 'Име на банката' : 'Bank name'} />
            </FormGroup>
            <FormGroup>
              <Label>IBAN *</Label>
              <Input placeholder="BG00 XXXX 0000 0000 0000 00" />
            </FormGroup>
          </Card>
        );

      case 4:
        return (
          <Card>
            <h2>{language === 'bg' ? 'Преглед и изпращане' : 'Review and Submit'}</h2>
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3>{dealerData.companyName}</h3>
              <p>{language === 'bg' ? 'Лиценз' : 'License'}: {dealerData.licenseNumber}</p>
              <p>{language === 'bg' ? 'Град' : 'City'}: {dealerData.address?.city}</p>
            </div>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#856404' }}>
                {language === 'bg'
                  ? 'Заявката ви ще бъде прегледана от нашия екип в рамките на 24-48 часа.'
                  : 'Your application will be reviewed by our team within 24-48 hours.'}
              </p>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Container>
      <Title>{language === 'bg' ? 'Регистрация на дилър' : 'Dealer Registration'}</Title>
      <Subtitle>
        {language === 'bg'
          ? 'Присъединете се към нашата мрежа от професионални дилъри'
          : 'Join our network of professional dealers'}
      </Subtitle>

      <ProgressBar>
        {steps.map((step) => (
          <Step
            key={step.number}
            active={currentStep === step.number}
            completed={currentStep > step.number}
          >
            <StepCircle
              active={currentStep === step.number}
              completed={currentStep > step.number}
            >
              {currentStep > step.number ? <Check size={20} /> : step.number}
            </StepCircle>
            <StepLabel active={currentStep === step.number}>
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </ProgressBar>

      {renderStep()}

      <ButtonGroup>
        {currentStep > 1 && (
          <Button variant="secondary" onClick={handleBack}>
            {language === 'bg' ? 'Назад' : 'Back'}
          </Button>
        )}
        {currentStep < 4 ? (
          <Button onClick={handleNext}>
            {language === 'bg' ? 'Напред' : 'Next'}
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            <Send size={20} />
            {loading 
              ? (language === 'bg' ? 'Изпращане...' : 'Submitting...')
              : (language === 'bg' ? 'Изпрати заявка' : 'Submit Application')}
          </Button>
        )}
      </ButtonGroup>
    </Container>
  );
};

export default DealerRegistrationPage;

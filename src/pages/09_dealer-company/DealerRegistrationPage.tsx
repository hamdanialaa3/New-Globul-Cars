// src/pages/DealerRegistrationPage.tsx
// Complete Dealer Registration Page

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { logger } from '../../services/logger-service';
import type { DealershipInfo } from '../../types/dealership/dealership.types';
import { profileService } from '../../services/profile/UnifiedProfileService';
import { UserRepository } from '../../repositories/UserRepository';
import { Check, Upload, Building, FileText, CreditCard, Send, Briefcase } from 'lucide-react';
import { toast } from 'react-toastify';

// Type alias for compatibility
type DealerProfile = DealershipInfo;

const Container = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  text-align: center;
  color: var(--text-secondary);
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
    background: var(--border-primary);
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
    props.completed ? 'var(--success-main)' :
      props.active ? 'var(--secondary-main)' : 'var(--bg-secondary)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s;
  border: 2px solid ${props => props.active ? 'var(--secondary-main)' : 'transparent'};
`;

const StepLabel = styled.span<{ active: boolean }>`
  font-size: 0.9rem;
  color: ${props => props.active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  font-weight: ${props => props.active ? '600' : '400'};
`;

const Card = styled.div`
  background: var(--bg-card);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 2rem;
  border: 1px solid var(--border-primary);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-input);
  color: var(--text-primary);

  &:focus {
    outline: none;
    border-color: var(--secondary-main);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-input);
  color: var(--text-primary);

  &:focus {
    outline: none;
    border-color: var(--secondary-main);
  }
`;

const FileUpload = styled.div<{ hasFile?: boolean }>`
  border: 2px dashed ${props => props.hasFile ? 'var(--success-main)' : 'var(--border-secondary)'};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: ${props => props.hasFile ? 'rgba(40, 167, 69, 0.05)' : 'transparent'};

  &:hover {
    border-color: var(--secondary-main);
    background: var(--bg-secondary);
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
    ? 'transparent'
    : 'var(--secondary-main)'};
  color: ${props => props.variant === 'secondary' ? 'var(--secondary-main)' : 'white'};
  border: ${props => props.variant === 'secondary' ? '2px solid var(--secondary-main)' : 'none'};
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
    box-shadow: var(--shadow-md);
    background: ${props => props.variant === 'secondary' ? 'var(--bg-secondary)' : 'var(--secondary-dark)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TypeSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const TypeOption = styled.div<{ selected: boolean }>`
  flex: 1;
  padding: 1.5rem;
  border: 2px solid ${props => props.selected ? 'var(--secondary-main)' : 'var(--border-secondary)'};
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  background: ${props => props.selected ? 'rgba(204, 0, 0, 0.05)' : 'var(--bg-card)'};
  transition: all 0.2s;

  &:hover {
    border-color: var(--secondary-light);
  }

  h3 {
    margin-bottom: 0.5rem;
    color: ${props => props.selected ? 'var(--secondary-main)' : 'var(--text-primary)'};
  }
`;

const DealerRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage(); // Using t() for translations
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dealerType, setDealerType] = useState<'dealer' | 'company'>('dealer');

  // File states
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [vatFile, setVatFile] = useState<File | null>(null);

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
    { number: 1, label: t('dealer.registration.steps.basicInfo'), icon: Building },
    { number: 2, label: t('dealer.registration.steps.documents'), icon: FileText },
    { number: 3, label: t('dealer.registration.steps.bankDetails'), icon: CreditCard },
    { number: 4, label: t('dealer.registration.steps.review'), icon: Check }
  ];

  const handleNext = () => {
    // Basic validation
    if (currentStep === 1) {
      if (!dealerData.companyName || !dealerData.licenseNumber || !dealerData.address?.city) {
        toast.error(t('common.fillRequired'));
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'license' | 'vat') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'license') setLicenseFile(file);
      else setVatFile(file);
      toast.success(`${file.name} selected`);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 1. Determine profile type based on user selection
      if (dealerType === 'company') {
        await profileService.setupCompanyProfile(user.uid, {
          ...dealerData as any, // Cast to match expected type
          uid: user.uid,
          status: 'pending'
        });
      } else {
        await profileService.setupDealerProfile(user.uid, dealerData as DealerProfile);
      }

      // 2. Upload files if present (mock implementation for now as we need real storage paths)
      if (licenseFile) {
        // await profileService.uploadDocument(user.uid, licenseFile, 'license');
        logger.info('Assuming license uploaded');
      }

      toast.success(t('dealer.registration.success'));
      navigate('/dashboard');
    } catch (error) {
      logger.error('Error submitting dealer application', error as Error);
      toast.error(t('dealer.registration.error'));
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <h2>{t('dealer.registration.steps.basicInfo')}</h2>

            <FormGroup>
              <Label>{t('dealer.registration.types.label')}</Label>
              <TypeSelector>
                <TypeOption
                  selected={dealerType === 'dealer'}
                  onClick={() => setDealerType('dealer')}
                >
                  <Building size={24} />
                  <h3>{t('dealer.registration.types.soleTrader')}</h3>
                </TypeOption>
                <TypeOption
                  selected={dealerType === 'company'}
                  onClick={() => setDealerType('company')}
                >
                  <Briefcase size={24} />
                  <h3>{t('dealer.registration.types.company')}</h3>
                </TypeOption>
              </TypeSelector>
            </FormGroup>

            <FormGroup>
              <Label>{t('dealer.registration.form.companyName')} *</Label>
              <Input
                value={dealerData.companyName}
                onChange={(e) => setDealerData({ ...dealerData, companyName: e.target.value })}
                placeholder={t('dealer.registration.form.companyNamePlaceholder')}
              />
            </FormGroup>
            <FormGroup>
              <Label>{t('dealer.registration.form.licenseNumber')} *</Label>
              <Input
                value={dealerData.licenseNumber}
                onChange={(e) => setDealerData({ ...dealerData, licenseNumber: e.target.value })}
                placeholder={t('dealer.registration.form.licenseNumberPlaceholder')}
              />
            </FormGroup>
            <FormGroup>
              <Label>{t('dealer.registration.form.address')} *</Label>
              <Input
                value={dealerData.address?.street}
                onChange={(e) => setDealerData({
                  ...dealerData,
                  address: { ...dealerData.address!, street: e.target.value }
                })}
                placeholder={t('dealer.registration.form.streetPlaceholder')}
              />
            </FormGroup>
            <FormGroup>
              <Label>{t('dealer.registration.form.city')} *</Label>
              <Select
                value={dealerData.address?.city}
                onChange={(e) => setDealerData({
                  ...dealerData,
                  address: { ...dealerData.address!, city: e.target.value }
                })}
              >
                <option value="">{t('dealer.registration.form.cityPlaceholder')}</option>
                <option value="Sofia">Sofia</option>
                <option value="Plovdiv">Plovdiv</option>
                <option value="Varna">Varna</option>
                <option value="Burgas">Burgas</option>
              </Select>
            </FormGroup>
          </Card>
        );

      case 2:
        return (
          <Card>
            <h2>{t('dealer.registration.steps.documents')}</h2>
            <FormGroup>
              <Label>{t('dealer.registration.form.uploadLicense')} *</Label>
              <FileUpload hasFile={!!licenseFile} onClick={() => document.getElementById('license-upload')?.click()}>
                <Upload size={40} color="var(--secondary-main)" />
                <p>{licenseFile ? licenseFile.name : t('dealer.registration.form.uploadLicense')}</p>
                <input
                  id="license-upload"
                  type="file"
                  onChange={(e) => handleFileSelect(e, 'license')}
                  style={{ display: 'none' }}
                />
              </FileUpload>
            </FormGroup>
            <FormGroup>
              <Label>{t('dealer.registration.form.uploadVat')}</Label>
              <FileUpload hasFile={!!vatFile} onClick={() => document.getElementById('vat-upload')?.click()}>
                <Upload size={40} color="var(--secondary-main)" />
                <p>{vatFile ? vatFile.name : t('dealer.registration.form.uploadVat')}</p>
                <input
                  id="vat-upload"
                  type="file"
                  onChange={(e) => handleFileSelect(e, 'vat')}
                  style={{ display: 'none' }}
                />
              </FileUpload>
            </FormGroup>
          </Card>
        );

      case 3:
        return (
          <Card>
            <h2>{t('dealer.registration.steps.bankDetails')}</h2>
            <FormGroup>
              <Label>{t('dealer.registration.form.bankName')} *</Label>
              <Input placeholder={t('dealer.registration.form.bankNamePlaceholder')} />
            </FormGroup>
            <FormGroup>
              <Label>{t('dealer.registration.form.iban')} *</Label>
              <Input placeholder={t('dealer.registration.form.ibanPlaceholder')} />
            </FormGroup>
          </Card>
        );

      case 4:
        return (
          <Card>
            <h2>{t('dealer.registration.form.reviewTitle')}</h2>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h3>{dealerData.companyName}</h3>
              <p>{t('dealer.registration.form.licenseNumber')}: {dealerData.licenseNumber}</p>
              <p>{t('dealer.registration.form.city')}: {dealerData.address?.city}</p>
              <p>Type: {dealerType === 'company' ? 'Company' : 'Dealer'}</p>
              <p>Files attached: {[licenseFile, vatFile].filter(Boolean).length}</p>
            </div>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255, 193, 7, 0.1)', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: 'var(--warning-dark)' }}>
                {t('dealer.registration.form.submitParams')}
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
      <Title>{t('dealer.registration.title')}</Title>
      <Subtitle>{t('dealer.registration.subtitle')}</Subtitle>

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
            {t('dealer.registration.form.back')}
          </Button>
        )}
        {currentStep < 4 ? (
          <Button onClick={handleNext}>
            {t('dealer.registration.form.next')}
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            <Send size={20} />
            {loading
              ? t('dealer.registration.form.submitting')
              : t('dealer.registration.form.submit')}
          </Button>
        )}
      </ButtonGroup>
    </Container>
  );
};

export default DealerRegistrationPage;

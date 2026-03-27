import { logger } from '../../../services/logger-service';
/**
 * Create Campaign Modal Component
 * Modal for creating and editing ad campaigns
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Campaign, CampaignType, CampaignCreateData, campaignService } from '../../../services/campaigns';
import { X, TrendingUp, DollarSign, Calendar, MapPin, Target, Info } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (campaignId: string) => void;
  userId: string;
  carId?: string;
  existingCampaign?: Campaign;
}

// Bulgarian regions
const BULGARIAN_REGIONS = [
  'София', 'Пловдив', 'Варна', 'Бургас', 'Русе',
  'Стара Загора', 'Плевен', 'Сливен', 'Добрич', 'Шумен',
  'Перник', 'Хасково', 'Ямбол', 'Пазарджик', 'Благоевград',
  'Велико Търново', 'Враца', 'Габрово', 'Видин', 'Асеновград',
  'Монтана', 'Кюстендил', 'Димитровград', 'Казанлък', 'Карлово',
  'Всички региони' // All regions option
];

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  carId,
  existingCampaign
}) => {
  const { language } = useTranslation();
  const isEditMode = !!existingCampaign;

  // Form state
  const [formData, setFormData] = useState<{
    type: CampaignType;
    title: string;
    description: string;
    budget: number;
    duration: number;
    dailyBudget: number;
    targetRegions: string[];
    targetAudience: {
      minAge?: number;
      maxAge?: number;
      interests?: string[];
      carBrands?: string[];
    };
  }>({
    type: CampaignType.CAR_LISTING,
    title: '',
    description: '',
    budget: 10,
    duration: 7,
    dailyBudget: 1.43,
    targetRegions: [],
    targetAudience: {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form

  // Load existing campaign data
  useEffect(() => {
    if (existingCampaign) {
      setFormData({
        type: existingCampaign.type,
        title: existingCampaign.title,
        description: existingCampaign.description,
        budget: existingCampaign.budget,
        duration: existingCampaign.duration,
        dailyBudget: existingCampaign.dailyBudget,
        targetRegions: existingCampaign.targetRegions,
        targetAudience: existingCampaign.targetAudience || {}
      });
    }
  }, [existingCampaign]);

  // Auto-calculate daily budget
  useEffect(() => {
    if (formData.budget > 0 && formData.duration > 0) {
      const calculated = formData.budget / formData.duration;
      setFormData(prev => ({
        ...prev,
        dailyBudget: Math.max(1, parseFloat(calculated.toFixed(2)))
      }));
    }
  }, [formData.budget, formData.duration]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleRegion = (region: string) => {
    if (region === 'Всички региони') {
      // Toggle all regions
      if (formData.targetRegions.includes('Всички региони')) {
        setFormData(prev => ({ ...prev, targetRegions: [] }));
      } else {
        setFormData(prev => ({ ...prev, targetRegions: ['Всички региони'] }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        targetRegions: prev.targetRegions.includes(region)
          ? prev.targetRegions.filter(r => r !== region && r !== 'Всички региони')
          : [...prev.targetRegions.filter(r => r !== 'Всички региони'), region]
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = language === 'bg' 
        ? 'Заглавието е задължително' 
        : 'Title is required';
    }

    if (formData.budget < 10) {
      newErrors.budget = language === 'bg'
        ? 'Минималният бюджет е 10 EUR'
        : 'Minimum budget is 10 EUR';
    }

    if (formData.duration < 1) {
      newErrors.duration = language === 'bg'
        ? 'Минималната продължителност е 1 ден'
        : 'Minimum duration is 1 day';
    }

    if (formData.dailyBudget < 1) {
      newErrors.dailyBudget = language === 'bg'
        ? 'Минималният дневен бюджет е 1 EUR'
        : 'Minimum daily budget is 1 EUR';
    }

    if (formData.targetRegions.length === 0) {
      newErrors.targetRegions = language === 'bg'
        ? 'Изберете поне един регион'
        : 'Select at least one region';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const campaignData: CampaignCreateData = {
        type: formData.type,
        carId: carId,
        budget: formData.budget,
        duration: formData.duration,
        dailyBudget: formData.dailyBudget,
        targetRegions: formData.targetRegions,
        targetAudience: formData.targetAudience,
        title: formData.title,
        description: formData.description
      };

      if (isEditMode && existingCampaign) {
        await campaignService.updateCampaign(existingCampaign.id, campaignData as any);
        onSuccess(existingCampaign.id);
      } else {
        const campaignId = await campaignService.createCampaign(userId, campaignData);
        onSuccess(campaignId);
      }

      onClose();
    } catch (error) {
      logger.error('Error creating/updating campaign:', error);
      setErrors({ 
        submit: language === 'bg' 
          ? 'Грешка при създаване на кампанията' 
          : 'Error creating campaign' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getCampaignTypeLabel = (type: CampaignType) => {
    switch (type) {
      case CampaignType.CAR_LISTING:
        return language === 'bg' ? 'Промоция на обява' : 'Car Listing Promotion';
      case CampaignType.PROFILE_BOOST:
        return language === 'bg' ? 'Популяризиране на профил' : 'Profile Boost';
      case CampaignType.FEATURED:
        return language === 'bg' ? 'Препоръчани обяви' : 'Featured Listing';
      case CampaignType.HOMEPAGE:
        return language === 'bg' ? 'Начална страница' : 'Homepage Spotlight';
      default:
        return type;
    }
  };

  const getCampaignTypeDescription = (type: CampaignType) => {
    switch (type) {
      case CampaignType.CAR_LISTING:
        return language === 'bg' 
          ? 'Покажете вашата обява на повече потребители' 
          : 'Show your listing to more users';
      case CampaignType.PROFILE_BOOST:
        return language === 'bg' 
          ? 'Увеличете видимостта на вашия профил' 
          : 'Increase your profile visibility';
      case CampaignType.FEATURED:
        return language === 'bg' 
          ? 'Появете се в препоръчаните обяви' 
          : 'Appear in featured listings';
      case CampaignType.HOMEPAGE:
        return language === 'bg' 
          ? 'Бъдете на първо място в началната страница' 
          : 'Be featured on the homepage';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {isEditMode 
              ? (language === 'bg' ? 'Редактиране на кампания' : 'Edit Campaign')
              : (language === 'bg' ? 'Създаване на кампания' : 'Create Campaign')
            }
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        {/* Progress Steps */}
        <StepsContainer>
          <Step $active={step === 1} $completed={step > 1} onClick={() => setStep(1)}>
            <StepNumber $active={step === 1} $completed={step > 1}>1</StepNumber>
            <StepLabel>{language === 'bg' ? 'Тип' : 'Type'}</StepLabel>
          </Step>
          <StepLine $active={step > 1} />
          <Step $active={step === 2} $completed={step > 2} onClick={() => setStep(2)}>
            <StepNumber $active={step === 2} $completed={step > 2}>2</StepNumber>
            <StepLabel>{language === 'bg' ? 'Детайли' : 'Details'}</StepLabel>
          </Step>
          <StepLine $active={step > 2} />
          <Step $active={step === 3} $completed={step > 3} onClick={() => setStep(3)}>
            <StepNumber $active={step === 3} $completed={step > 3}>3</StepNumber>
            <StepLabel>{language === 'bg' ? 'Таргетиране' : 'Targeting'}</StepLabel>
          </Step>
        </StepsContainer>

        <ModalContent>
          {/* Step 1: Campaign Type */}
          {step === 1 && (
            <StepContent>
              <SectionTitle>
                <TrendingUp size={20} />
                {language === 'bg' ? 'Изберете тип кампания' : 'Select Campaign Type'}
              </SectionTitle>
              <TypeGrid>
                {Object.values(CampaignType).map(type => (
                  <TypeCard
                    key={type}
                    $selected={formData.type === type}
                    onClick={() => handleInputChange('type', type)}
                  >
                    <TypeTitle>{getCampaignTypeLabel(type)}</TypeTitle>
                    <TypeDescription>{getCampaignTypeDescription(type)}</TypeDescription>
                  </TypeCard>
                ))}
              </TypeGrid>
            </StepContent>
          )}

          {/* Step 2: Campaign Details */}
          {step === 2 && (
            <StepContent>
              <SectionTitle>
                <Info size={20} />
                {language === 'bg' ? 'Детайли на кампанията' : 'Campaign Details'}
              </SectionTitle>
              
              <FormGroup>
                <Label>{language === 'bg' ? 'Заглавие' : 'Title'} *</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={language === 'bg' ? 'Например: Промоция BMW X5' : 'e.g., BMW X5 Promotion'}
                  $error={!!errors.title}
                />
                {errors.title && <ErrorText>{errors.title}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label>{language === 'bg' ? 'Описание' : 'Description'}</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={language === 'bg' 
                    ? 'Опишете вашата кампания...' 
                    : 'Describe your campaign...'}
                  rows={3}
                />
              </FormGroup>

              <BudgetGrid>
                <FormGroup>
                  <Label>
                    <DollarSign size={16} />
                    {language === 'bg' ? 'Общ бюджет (EUR)' : 'Total Budget (EUR)'} *
                  </Label>
                  <Input
                    type="number"
                    min="10"
                    step="1"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                    $error={!!errors.budget}
                  />
                  {errors.budget && <ErrorText>{errors.budget}</ErrorText>}
                  <HelpText>{language === 'bg' ? 'Минимум: €10' : 'Minimum: €10'}</HelpText>
                </FormGroup>

                <FormGroup>
                  <Label>
                    <Calendar size={16} />
                    {language === 'bg' ? 'Продължителност (дни)' : 'Duration (days)'} *
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 1)}
                    $error={!!errors.duration}
                  />
                  {errors.duration && <ErrorText>{errors.duration}</ErrorText>}
                  <HelpText>{language === 'bg' ? 'Минимум: 1 ден' : 'Minimum: 1 day'}</HelpText>
                </FormGroup>
              </BudgetGrid>

              <InfoBox>
                <InfoIcon><DollarSign size={18} /></InfoIcon>
                <InfoContent>
                  <InfoTitle>{language === 'bg' ? 'Дневен бюджет' : 'Daily Budget'}</InfoTitle>
                  <InfoValue>€{formData.dailyBudget.toFixed(2)} / {language === 'bg' ? 'ден' : 'day'}</InfoValue>
                  <InfoSubtext>
                    {language === 'bg' 
                      ? `Автоматично изчислен: €${formData.budget.toFixed(2)} ÷ ${formData.duration} ${formData.duration === 1 ? 'ден' : 'дни'}`
                      : `Auto-calculated: €${formData.budget.toFixed(2)} ÷ ${formData.duration} ${formData.duration === 1 ? 'day' : 'days'}`
                    }
                  </InfoSubtext>
                </InfoContent>
              </InfoBox>
            </StepContent>
          )}

          {/* Step 3: Targeting */}
          {step === 3 && (
            <StepContent>
              <SectionTitle>
                <MapPin size={20} />
                {language === 'bg' ? 'Таргетиране по региони' : 'Target Regions'}
              </SectionTitle>
              
              <RegionsGrid>
                {BULGARIAN_REGIONS.map(region => (
                  <RegionChip
                    key={region}
                    $selected={formData.targetRegions.includes(region)}
                    onClick={() => toggleRegion(region)}
                  >
                    {region}
                  </RegionChip>
                ))}
              </RegionsGrid>
              {errors.targetRegions && <ErrorText>{errors.targetRegions}</ErrorText>}

              <TargetingSummary>
                <Target size={18} />
                <div>
                  <strong>{language === 'bg' ? 'Избрани региони:' : 'Selected regions:'}</strong>{' '}
                  {formData.targetRegions.length === 0 
                    ? (language === 'bg' ? 'Няма избрани' : 'None selected')
                    : formData.targetRegions.includes('Всички региони')
                    ? (language === 'bg' ? 'Всички региони в България' : 'All regions in Bulgaria')
                    : `${formData.targetRegions.length} ${formData.targetRegions.length === 1 ? (language === 'bg' ? 'регион' : 'region') : (language === 'bg' ? 'региона' : 'regions')}`
                  }
                </div>
              </TargetingSummary>
            </StepContent>
          )}
        </ModalContent>

        {errors.submit && (
          <ErrorBox>{errors.submit}</ErrorBox>
        )}

        <ModalFooter>
          <SecondaryButton onClick={onClose} disabled={loading}>
            {language === 'bg' ? 'Отказ' : 'Cancel'}
          </SecondaryButton>
          
          <ButtonGroup>
            {step > 1 && (
              <SecondaryButton onClick={() => setStep(step - 1)} disabled={loading}>
                {language === 'bg' ? 'Назад' : 'Back'}
              </SecondaryButton>
            )}
            
            {step < 3 ? (
              <PrimaryButton onClick={() => setStep(step + 1)} disabled={loading}>
                {language === 'bg' ? 'Напред' : 'Next'}
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={handleSubmit} disabled={loading}>
                {loading 
                  ? (language === 'bg' ? 'Създаване...' : 'Creating...')
                  : isEditMode
                  ? (language === 'bg' ? 'Запази промените' : 'Save Changes')
                  : (language === 'bg' ? 'Създай кампания' : 'Create Campaign')
                }
              </PrimaryButton>
            )}
          </ButtonGroup>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
};

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #f0f0f0;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

const StepsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 28px;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${props => props.$active || props.$completed ? 1 : 0.5};

  &:hover {
    opacity: 1;
  }
`;

const StepNumber = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  background: ${props => 
    props.$active ? 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' :
    props.$completed ? '#10b981' : '#e5e7eb'
  };
  color: ${props => props.$active || props.$completed ? 'white' : '#6b7280'};
  transition: all 0.3s ease;
`;

const StepLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
`;

const StepLine = styled.div<{ $active: boolean }>`
  flex: 1;
  height: 3px;
  background: ${props => props.$active ? '#10b981' : '#e5e7eb'};
  border-radius: 2px;
  transition: all 0.3s ease;
`;

const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 28px;
`;

const StepContent = styled.div`
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 20px;
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const TypeCard = styled.div<{ $selected: boolean }>`
  padding: 20px;
  border-radius: 12px;
  border: 2px solid ${props => props.$selected ? '#3B82F6' : '#e5e7eb'};
  background: ${props => props.$selected ? '#fff7ed' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #3B82F6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
  }
`;

const TypeTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
`;

const TypeDescription = styled.div`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const Input = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => props.$error ? '#ef4444' : '#e5e7eb'};
  border-radius: 10px;
  font-size: 15px;
  color: #1f2937;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#ef4444' : '#3B82F6'};
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  color: #1f2937;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3B82F6;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const BudgetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const HelpText = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

const ErrorText = styled.div`
  font-size: 13px;
  color: #ef4444;
  margin-top: 6px;
  font-weight: 500;
`;

const InfoBox = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 12px;
  border: 1px solid #bfdbfe;
  margin-top: 20px;
`;

const InfoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: white;
  color: #2563eb;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoTitle = styled.div`
  font-size: 13px;
  color: #1e40af;
  font-weight: 600;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 2px;
`;

const InfoSubtext = styled.div`
  font-size: 12px;
  color: #3b82f6;
`;

const RegionsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
`;

const RegionChip = styled.div<{ $selected: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$selected ? '#3B82F6' : '#f3f4f6'};
  color: ${props => props.$selected ? 'white' : '#6b7280'};
  border: 2px solid ${props => props.$selected ? '#3B82F6' : 'transparent'};

  &:hover {
    background: ${props => props.$selected ? '#ff7a00' : '#e5e7eb'};
    transform: translateY(-2px);
  }
`;

const TargetingSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  font-size: 14px;
  color: #374151;
  border: 1px solid #e5e7eb;
`;

const ErrorBox = styled.div`
  padding: 16px;
  margin: 0 28px 20px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  border-top: 1px solid #f0f0f0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const SecondaryButton = styled.button`
  padding: 12px 24px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #6b7280;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled.button`
  padding: 12px 28px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

export default CreateCampaignModal;



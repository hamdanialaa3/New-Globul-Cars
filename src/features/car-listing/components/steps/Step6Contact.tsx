// Step 6: Contact & Publish
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { useCarListingStore } from '../../stores/car-listing-store';
import { step6Schema, Step6Data } from '../../schemas/car-listing.schema';
import BulgariaLocationDropdown from '@/components/BulgariaLocationDropdown/BulgariaLocationDropdown';
import { toast } from 'react-toastify';

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 0;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
    
    &:hover {
      background: var(--text-tertiary);
    }
  }
`;

const StepTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const StepDescription = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Label = styled.label<{ $hasValue?: boolean }>`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${props => props.$hasValue ? '#22c55e' : 'var(--text-primary)'};
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    color: #ff8f10;
  }
`;

const Input = styled.input<{ $hasValue?: boolean; $error?: boolean }>`
  width: 100%;
  max-width: 450px;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => {
    if (props.$error) return 'var(--error)';
    return props.$hasValue ? '#22c55e' : 'var(--border)';
  }};
  border-radius: 10px;
  background: var(--bg-card);
  color: ${props => props.$hasValue ? '#22c55e' : 'var(--text-primary)'};
  font-size: 0.95rem;
  font-weight: ${props => props.$hasValue ? '600' : 'normal'};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? 'var(--error)' : 'var(--accent-primary)'};
    box-shadow: 0 0 0 3px ${props => props.$error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }
`;

const Textarea = styled.textarea<{ $hasValue?: boolean }>`
  width: 100%;
  max-width: 450px;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.$hasValue ? '#22c55e' : 'var(--border)'};
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.95rem;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ErrorText = styled.p`
  color: var(--error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 1.5rem 0 1rem 0;
`;

const ContactMethodGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const ContactMethodButton = styled.button<{ $selected: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 2px solid ${props => props.$selected ? 'var(--accent-primary)' : 'var(--border)'};
  background: ${props => props.$selected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card)'};
  color: ${props => props.$selected ? 'var(--accent-primary)' : 'var(--text-primary)'};
  font-weight: ${props => props.$selected ? '600' : '500'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--accent-primary);
    transform: translateY(-1px);
  }
`;

const HintText = styled.span`
  font-size: 0.75rem;
  color: var(--text-muted);
`;

export const Step6Contact: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser, userProfile } = useAuth();
  const { formData, updateStepData, markStepComplete } = useCarListingStore();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step6Data>({
    resolver: zodResolver(step6Schema),
    defaultValues: formData.step6 || {
      sellerName: userProfile?.displayName || currentUser?.displayName || ''
      sellerEmail: currentUser?.email || '',
      sellerPhone: '',
      city: '',
      region: '',
      preferredContact: ['phone'],
      description: '',
    },
    mode: 'onChange',
  });

  const sellerName = watch('sellerName');
  const sellerEmail = watch('sellerEmail');
  const sellerPhone = watch('sellerPhone');
  const city = watch('city');
  const region = watch('region');
  const preferredContact = watch('preferredContact') || [];
  const description = watch('description');

  // Auto-fill from user profile
  useEffect(() => {
    if (currentUser) {
      const autoName = userProfile?.displayName || currentUser.displayName;
      if (!sellerName && autoName) {
        setValue('sellerName', autoName, { shouldValidate: true });
      }
      if (!sellerEmail && currentUser.email) {
        setValue('sellerEmail', currentUser.email, { shouldValidate: true });
      }
    }
  }, [currentUser, userProfile, sellerName, sellerEmail, setValue]);

  // Auto-update store when form changes
  useEffect(() => {
    const subscription = watch((data) => {
      updateStepData('step6', data as Partial<Step6Data>);
      
      // Mark complete if required fields are filled
      if (data.sellerName && data.sellerEmail && data.sellerPhone && data.city && data.region) {
        markStepComplete(5);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateStepData, markStepComplete]);

  const toggleContactMethod = (method: string) => {
    const current = preferredContact || [];
    const newMethods = current.includes(method)
      ? current.filter(m => m !== method)
      : [...current, method];
    
    setValue('preferredContact', newMethods, { shouldValidate: true });
  };

  const handleLocationChange = (region: string, city: string) => {
    setValue('region', region, { shouldValidate: true });
    setValue('city', city, { shouldValidate: true });
  };

  const CONTACT_METHODS = [
    { id: 'phone', labelBg: 'Телефон', labelEn: 'Phone' },
    { id: 'email', labelBg: 'Имейл', labelEn: 'Email' },
    { id: 'whatsapp', labelBg: 'WhatsApp', labelEn: 'WhatsApp' },
    { id: 'viber', labelBg: 'Viber', labelEn: 'Viber' },
  ];

  return (
    <StepContainer>
      <div>
        <StepTitle>
          {language === 'bg' ? 'Контакт и местоположение' : 'Contact & Location'}
        </StepTitle>
        <StepDescription>
          {language === 'bg'
            ? 'Въведете вашите контактни данни и местоположение'
            : 'Enter your contact information and location'}
        </StepDescription>
      </div>

      <form onSubmit={handleSubmit((data) => {
        updateStepData('step6', data);
        markStepComplete(5);
      })}>
        {/* Contact Information */}
        <SectionTitle>{language === 'bg' ? 'Контактна информация' : 'Contact Information'}</SectionTitle>

        <FieldGroup>
          <Label $hasValue={!!sellerName} htmlFor="sellerName">
            {language === 'bg' ? 'Име' : 'Name'} *
          </Label>
          <Input
            id="sellerName"
            type="text"
            $hasValue={!!sellerName}
            {...register('sellerName')}
            placeholder={language === 'bg' ? 'Вашето име' : 'Your name'}
          />
          {errors.sellerName && <ErrorText>{errors.sellerName.message}</ErrorText>}
        </FieldGroup>

        <FieldGroup>
          <Label $hasValue={!!sellerEmail} htmlFor="sellerEmail">
            {language === 'bg' ? 'Имейл' : 'Email'} *
          </Label>
          <Input
            id="sellerEmail"
            type="email"
            $hasValue={!!sellerEmail}
            $error={!!errors.sellerEmail}
            {...register('sellerEmail')}
            placeholder={language === 'bg' ? 'your@email.com' : 'your@email.com'}
          />
          {errors.sellerEmail && <ErrorText>{errors.sellerEmail.message}</ErrorText>}
        </FieldGroup>

        <FieldGroup>
          <Label $hasValue={!!sellerPhone} htmlFor="sellerPhone">
            {language === 'bg' ? 'Телефон' : 'Phone'} *
          </Label>
          <Input
            id="sellerPhone"
            type="tel"
            $hasValue={!!sellerPhone}
            $error={!!errors.sellerPhone}
            {...register('sellerPhone')}
            placeholder={language === 'bg' ? '+359XXXXXXXXX' : '+359XXXXXXXXX'}
          />
          <HintText>
            {language === 'bg'
              ? 'Формат: +359XXXXXXXXX'
              : 'Format: +359XXXXXXXXX'}
          </HintText>
          {errors.sellerPhone && <ErrorText>{errors.sellerPhone.message}</ErrorText>}
        </FieldGroup>

        <FieldGroup>
          <Label>
            {language === 'bg' ? 'Предпочитан начин на контакт' : 'Preferred Contact Method'}
          </Label>
          <ContactMethodGrid>
            {CONTACT_METHODS.map(method => (
              <ContactMethodButton
                key={method.id}
                type="button"
                $selected={preferredContact.includes(method.id)}
                onClick={() => toggleContactMethod(method.id)}
              >
                {language === 'bg' ? method.labelBg : method.labelEn}
              </ContactMethodButton>
            ))}
          </ContactMethodGrid>
        </FieldGroup>

        {/* Location */}
        <SectionTitle>{language === 'bg' ? 'Местоположение' : 'Location'}</SectionTitle>

        <FieldGroup>
          <Label>
            {language === 'bg' ? 'Регион и град' : 'Region & City'} *
          </Label>
          {/* ✅ Using the existing BulgariaLocationDropdown */}
          <BulgariaLocationDropdown
            value={{
              province: region || '',
              city: city || '',
              postalCode: watch('postalCode') || '',
              locationData: {
                cityName: city || '',
                cityNameEn: city || '',
              },
            } as any}
            onChange={(locationData) => {
              setValue('region', locationData.province, { shouldValidate: true });
              setValue('city', locationData.locationData?.cityName || locationData.city || '', { shouldValidate: true });
            }}
            disabled={false}
          />
          {(errors.region || errors.city) && (
            <ErrorText>{errors.region?.message || errors.city?.message}</ErrorText>
          )}
        </FieldGroup>

        {/* Description */}
        <FieldGroup>
          <Label $hasValue={!!description} htmlFor="description">
            {language === 'bg' ? 'Описание' : 'Description'}
          </Label>
          <Textarea
            id="description"
            $hasValue={!!description}
            {...register('description')}
            placeholder={language === 'bg'
              ? 'Добавете описание на вашето превозно средство (по избор)'
              : 'Add a description of your vehicle (optional)'}
            maxLength={5000}
          />
          <HintText>
            {description?.length || 0}/5000 {language === 'bg' ? 'символа' : 'characters'}
          </HintText>
          {errors.description && <ErrorText>{errors.description.message}</ErrorText>}
        </FieldGroup>
      </form>
    </StepContainer>
  );
};


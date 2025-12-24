// Sell Vehicle Step 6: Contact & Location
// الخطوة 6: معلومات الاتصال والموقع

import React, { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthProvider';
import { UnifiedWorkflowData } from '../../../services/unified-workflow-persistence.service';
import { BULGARIA_REGIONS, getCitiesByRegion } from '../../../data/bulgaria-locations';
import { getPostalCodesForCity } from '../../../data/bulgaria-postal-codes';
import { ALL_COUNTRIES } from '../../../data/country-codes';
import { BulgarianProfileService } from '../../../services/bulgarian-profile-service';
import { Check, AlertCircle } from 'lucide-react';

interface SellVehicleStep6Props {
  workflowData: Partial<UnifiedWorkflowData>;
  onUpdate: (updates: Partial<UnifiedWorkflowData>) => void;
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input<{ $valid?: boolean; $error?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.$error ? '#ef4444' : props.$valid ? '#22c55e' : 'var(--border)'};
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#ef4444' : props.$valid ? '#22c55e' : 'var(--accent-primary)'};
    box-shadow: 0 0 0 3px ${props => props.$error ? 'rgba(239, 68, 68, 0.1)' : props.$valid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }

  &::placeholder {
    color: var(--text-tertiary);
    opacity: 0.5;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--bg-secondary);
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 1rem 0 0.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: -0.25rem;
`;

// Phone Input Styles
const PhoneInputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const CountrySelectContainer = styled.div`
  position: relative;
  min-width: 140px;
  max-width: 160px;
`;

const CountrySelectStyled = styled.select`
  width: 100%;
  height: 100%;
  padding: 0.75rem 0.5rem 0.75rem 0.75rem; /* Reduced left padding since flag is in option */
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
  appearance: none;
  text-overflow: ellipsis;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
`;

const FlagIcon = styled.span`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.4rem;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PhoneInputStyled = styled(Input)`
  /* No special styles needed beyond Input */
`;

// Animation Components
const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
`;

const AttentionPulse = styled.div<{ $isActive: boolean }>`
  border-radius: 12px;
  animation: ${props => props.$isActive ? pulseAnimation : 'none'} 2s infinite;
  transition: all 0.3s ease;
  width: 100%;
`;

const RevealWrapper: React.FC<{ children: React.ReactNode; isActive?: boolean }> = ({ children, isActive = true }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [internalActive, setInternalActive] = useState(isActive);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    setInternalActive(isActive);
  }, [isActive]);

  const handleInteraction = () => {
    setInternalActive(false);
  };

  return (
    <AttentionPulse
      ref={ref}
      $isActive={internalActive}
      onClick={handleInteraction}
      onFocus={handleInteraction}
    >
      <FieldGroup>{children}</FieldGroup>
    </AttentionPulse>
  );
};

export const SellVehicleStep6: React.FC<SellVehicleStep6Props> = ({
  workflowData,
  onUpdate,
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [emailError, setEmailError] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+359');
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load profile data and set defaults
  useEffect(() => {
    const loadProfileData = async () => {
      if (!currentUser || profileLoaded) return;
      
      try {
        const profile = await BulgarianProfileService.getUserProfile(currentUser.uid);
        if (profile) {
          // Set defaults only if fields are empty
          const updates: Partial<UnifiedWorkflowData> = {};
          
          if (!workflowData.sellerName && (profile.displayName || profile.firstName || profile.lastName)) {
            updates.sellerName = profile.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || '';
          }
          
          if (!workflowData.sellerEmail && profile.email) {
            updates.sellerEmail = profile.email;
          }
          
          if (!workflowData.sellerPhone && profile.phoneNumber) {
            updates.sellerPhone = profile.phoneNumber;
            // Extract prefix from phone number
            const sortedCodes = [...ALL_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
            const match = sortedCodes.find(c => profile.phoneNumber?.startsWith(c.dial));
            if (match) {
              setPhonePrefix(match.dial);
            }
          }
          
          if (!workflowData.region && profile.location?.region) {
            updates.region = profile.location.region;
          }
          
          if (!workflowData.city && !workflowData.locationData?.cityName && profile.location?.city) {
            updates.city = profile.location.city;
            updates.locationData = { cityName: profile.location.city };
          }
          
          if (Object.keys(updates).length > 0) {
            onUpdate(updates);
          }
          
          setProfileLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setProfileLoaded(true); // Mark as loaded even on error to prevent infinite loop
      }
    };
    
    loadProfileData();
  }, [currentUser, profileLoaded, workflowData, onUpdate]);

  // Validation Regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateEmail = (email: string) => {
    if (!email) return '';
    if (!emailRegex.test(email)) {
      return language === 'bg' ? 'Моля въведете валиден имейл адрес' : 'Please enter a valid email address';
    }
    return '';
  };

  const handlEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    onUpdate({ sellerEmail: email });
    if (email) {
      setEmailError(validateEmail(email));
    } else {
      setEmailError('');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and spaces
    if (/^[\d\s]*$/.test(value)) {
      // Clean display value to just numbers for storage check, but keep spaces for display
      const cleanValue = value.replace(/\s/g, '');
      // Update parent with FULL number (prefix + value)
      // Note: we store it with space for readability: "+359 888123456"
      onUpdate({ sellerPhone: `${phonePrefix} ${value}` });
    }
  };

  // Extract number without prefix for display props
  const getDisplayPhone = () => {
    if (!workflowData.sellerPhone) return '';
    // If it starts with current prefix, strip it
    if (workflowData.sellerPhone.startsWith(phonePrefix)) {
      let num = workflowData.sellerPhone.substring(phonePrefix.length).trim();
      return num;
    }
    return workflowData.sellerPhone; // Fallback
  };

  // Memoized lists
  const availableCities = useMemo(() => {
    if (!workflowData.region) return [];
    return getCitiesByRegion(workflowData.region, language as 'bg' | 'en');
  }, [workflowData.region, language]);

  const availablePostalCodes = useMemo(() => {
    // Check both potential locations for City Name
    const city = workflowData.locationData?.cityName || workflowData.city;
    if (!city || !workflowData.region) return [];
    return getPostalCodesForCity(city, workflowData.region);
  }, [workflowData.locationData?.cityName, workflowData.city, workflowData.region]);

  const currentFlag = useMemo(() => {
    return ALL_COUNTRIES.find(c => c.dial === phonePrefix)?.flag || '🌍';
  }, [phonePrefix]);

  return (
    <FormContainer>
      {/* Contact Section */}
      <SectionTitle>
        {language === 'bg' ? 'Информация за контакт' : 'Contact Information'}
      </SectionTitle>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Име' : 'Name'} *</Label>
        <Input
          value={workflowData.sellerName || ''}
          onChange={(e) => onUpdate({ sellerName: e.target.value })}
          placeholder={language === 'bg' ? 'Иван Петров' : 'John Doe'}
          $valid={!!workflowData.sellerName && workflowData.sellerName.length > 2}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>
          {language === 'bg' ? 'Имейл' : 'Email'} *
          {validateEmail(workflowData.sellerEmail || '') === '' && workflowData.sellerEmail && (
            <Check size={16} color="#22c55e" />
          )}
        </Label>
        <Input
          value={workflowData.sellerEmail || ''}
          onChange={handlEmailChange}
          placeholder="name@example.com"
          type="email"
          $error={!!emailError}
          $valid={!emailError && !!workflowData.sellerEmail}
        />
        {emailError && (
          <ErrorText style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={14} /> {emailError}
          </ErrorText>
        )}
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Телефон' : 'Phone'} *</Label>
        <PhoneInputGroup>
          <CountrySelectContainer>
            <CountrySelectStyled
              value={phonePrefix}
              onChange={(e) => {
                const newPrefix = e.target.value;
                setPhonePrefix(newPrefix);
                // Update existing number with new prefix
                const currentNum = getDisplayPhone();
                onUpdate({ sellerPhone: `${newPrefix} ${currentNum}` });
              }}
            >
              {ALL_COUNTRIES.map(country => (
                <option key={country.code} value={country.dial}>
                  {country.flag} {country.dial} ({country.code})
                </option>
              ))}
            </CountrySelectStyled>
            <FlagIcon>
              {currentFlag} {phonePrefix}
            </FlagIcon>
          </CountrySelectContainer>

          <PhoneInputStyled
            value={getDisplayPhone()}
            onChange={handlePhoneChange}
            placeholder={phonePrefix === '+359' ? '888 123 456' : '123 456 789'}
            type="tel"
            inputMode="numeric"
            $valid={!!workflowData.sellerPhone && workflowData.sellerPhone.replace(/[^0-9]/g, '').length > 7}
          />
        </PhoneInputGroup>
      </FieldGroup>

      {/* Address Section */}
      <SectionTitle style={{ marginTop: '1rem' }}>
        {language === 'bg' ? 'Местоположение' : 'Location'}
      </SectionTitle>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Област' : 'Region'} *</Label>
        <Select
          value={workflowData.region || ''}
          onChange={(e) => {
            onUpdate({
              region: e.target.value,
              city: '',
              locationData: { cityName: '' },
              postalCode: ''
            });
          }}
        >
          <option value="">{language === 'bg' ? 'Изберете област' : 'Select Region'}</option>
          {BULGARIA_REGIONS.map(region => (
            <option key={region.name} value={region.name}>
              {language === 'bg' ? region.name : region.nameEn}
            </option>
          ))}
        </Select>
      </FieldGroup>

      {/* Cascading City */}
      {workflowData.region && (
        <RevealWrapper isActive={!workflowData.locationData?.cityName && !workflowData.city}>
          <Label>{language === 'bg' ? 'Град' : 'City'} *</Label>
          <Select
            // Check both locations for value
            value={workflowData.locationData?.cityName || workflowData.city || ''}
            onChange={(e) => {
              onUpdate({
                city: e.target.value,
                locationData: { cityName: e.target.value },
                postalCode: ''
              });
            }}
          >
            <option value="">{language === 'bg' ? 'Изберете град' : 'Select City'}</option>
            {availableCities.map(city => (
              <option key={city.name} value={city.name}>
                {language === 'bg' ? city.name : (city.nameEn || city.name)}
              </option>
            ))}
          </Select>
        </RevealWrapper>
      )}

      {/* Cascading Postal Code */}
      {(workflowData.locationData?.cityName || workflowData.city) && (
        <RevealWrapper isActive={!workflowData.postalCode}>
          <Label>{language === 'bg' ? 'Пощенски код' : 'Postal Code'}</Label>
          <Select
            value={workflowData.postalCode || ''}
            onChange={(e) => onUpdate({ postalCode: e.target.value })}
          >
            <option value="">{language === 'bg' ? 'Изберете код' : 'Select Code'}</option>
            {availablePostalCodes.map(pc => (
              <option key={pc.code} value={pc.code}>
                {pc.code} {pc.district ? `(${pc.district})` : ''}
              </option>
            ))}
          </Select>
        </RevealWrapper>
      )}

    </FormContainer>
  );
};

export default SellVehicleStep6;

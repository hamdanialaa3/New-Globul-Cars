/**
 * ✅ DEMO: Complete Working Example with WorkflowPageLayout
 * 
 * This demonstrates a REAL implementation of WorkflowPageLayout
 * in a simplified pricing page to show the pattern clearly.
 * 
 * Created: December 11, 2025
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useIsMobile } from '../../../hooks/useBreakpoint';
import { WorkflowPageLayout } from '../../../components/sell-workflow/WorkflowPageLayout';
import { SellProgressBar } from '../../../components/SellWorkflow';
import styled from 'styled-components';
import { Euro, Info } from 'lucide-react';

/**
 * SIMPLIFIED PRICING PAGE using WorkflowPageLayout
 * 
 * Before: 449 lines with complex layout logic
 * After: ~200 lines focused on business logic
 */
const SimplifiedPricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();

  // State
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<'fixed' | 'negotiable' | 'best_offer'>('fixed');
  const [negotiable, setNegotiable] = useState(false);

  // Validation
  const isValid = price && parseFloat(price) >= 100 && parseFloat(price) <= 1000000;

  // Handlers
  const handleBack = () => navigate(-1);
  
  const handleNext = () => {
    if (!isValid) return;
    
    // Save data to workflow
    console.log('Saving pricing:', { price, priceType, negotiable });
    
    // Navigate to next step
    navigate('/sell/inserat/car/contact');
  };

  // Format price with thousands separator
  const formattedPrice = price
    ? parseFloat(price).toLocaleString(language === 'bg' ? 'bg-BG' : 'en-US')
    : '';

  // ============================================================================
  // CONTENT SECTIONS - Organized clearly
  // ============================================================================

  const progressBar = <SellProgressBar currentStep="pricing" />;

  const pageContent = (
    <>
      {/* Main Price Input */}
      <PriceInputSection>
        <Label htmlFor="price">
          {t('sell.pricing.priceLabel')}
          <Required>*</Required>
        </Label>
        
        <PriceInputWrapper>
          <PriceIcon>
            <Euro size={20} />
          </PriceIcon>
          <PriceInput
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="15000"
            min="100"
            max="1000000"
            autoFocus={!isMobile}
          />
        </PriceInputWrapper>
        
        {formattedPrice && (
          <FormattedPrice>
            {formattedPrice} EUR
          </FormattedPrice>
        )}
        
        {price && !isValid && (
          <ErrorText>
            {language === 'bg'
              ? 'Цената трябва да бъде между 100 и 1,000,000 EUR'
              : 'Price must be between 100 and 1,000,000 EUR'}
          </ErrorText>
        )}
      </PriceInputSection>

      {/* Price Type Selection */}
      <PriceTypeSection>
        <Label htmlFor="priceType">
          {language === 'bg' ? 'Тип цена' : 'Price Type'}
        </Label>
        
        <Select
          id="priceType"
          value={priceType}
          onChange={(e) => {
            const newType = e.target.value as typeof priceType;
            setPriceType(newType);
            setNegotiable(newType === 'negotiable' || newType === 'best_offer');
          }}
        >
          <option value="fixed">
            {language === 'bg' ? 'Фиксирана' : 'Fixed'}
          </option>
          <option value="negotiable">
            {language === 'bg' ? 'Договаряема' : 'Negotiable'}
          </option>
          <option value="best_offer">
            {language === 'bg' ? 'Най-добра оферта' : 'Best Offer'}
          </option>
        </Select>
      </PriceTypeSection>

      {/* Negotiable Toggle */}
      <ToggleSection>
        <ToggleWrapper>
          <ToggleSwitch>
            <input
              type="checkbox"
              id="negotiable"
              checked={negotiable}
              onChange={(e) => setNegotiable(e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
          
          <ToggleLabel htmlFor="negotiable">
            {language === 'bg' ? 'Цената е договаряема' : 'Price is negotiable'}
          </ToggleLabel>
        </ToggleWrapper>
      </ToggleSection>

      {/* Info Box */}
      <InfoBox>
        <Info size={20} />
        <div>
          <InfoTitle>
            {language === 'bg' ? 'Съвети за ценообразуване' : 'Pricing Tips'}
          </InfoTitle>
          <InfoText>
            {language === 'bg'
              ? 'Използвайте реалистични цени въз основа на пазара. Можете да проверите подобни обяви за сравнение.'
              : 'Use realistic prices based on market value. You can check similar listings for comparison.'}
          </InfoText>
        </div>
      </InfoBox>
    </>
  );

  const navigation = (
    <NavigationButtons>
      <BackButton onClick={handleBack}>
        ← {t('common.back')}
      </BackButton>
      
      <NextButton onClick={handleNext} disabled={!isValid}>
        {t('common.next')} →
      </NextButton>
    </NavigationButtons>
  );

  // ============================================================================
  // RENDER - Clean and simple!
  // ============================================================================

  return (
    <WorkflowPageLayout
      progressBar={progressBar}
      title={language === 'bg' ? 'Цена на превозното средство' : 'Vehicle Price'}
      subtitle={language === 'bg' 
        ? 'Определете цената на вашето превозно средство' 
        : 'Set your vehicle price'}
      isMobile={isMobile}
    >
      {pageContent}
      {navigation}
    </WorkflowPageLayout>
  );
};

// ============================================================================
// STYLED COMPONENTS - Page-specific styles only
// ============================================================================

const PriceInputSection = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
  margin-bottom: 0.5rem;
  font-family: 'Martica', 'Arial', sans-serif;
`;

const Required = styled.span`
  color: #ff8f10;
  margin-left: 0.25rem;
`;

const PriceInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PriceIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: var(--text-tertiary, #999999);
  pointer-events: none;
`;

const PriceInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid var(--border, #e0e0e0);
  border-radius: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  font-family: 'Martica', 'Arial', sans-serif;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #ff8f10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }
  
  &::placeholder {
    color: var(--text-tertiary, #999999);
    font-weight: 400;
  }
`;

const FormattedPrice = styled.div`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary, #666666);
  font-weight: 500;
`;

const ErrorText = styled.div`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #dc3545;
`;

const PriceTypeSection = styled.div`
  margin-bottom: 2rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border, #e0e0e0);
  border-radius: 12px;
  font-size: 1rem;
  font-family: 'Martica', 'Arial', sans-serif;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #ff8f10;
  }
`;

const ToggleSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 12px;
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ToggleSwitch = styled.label`
  position: relative;
  width: 48px;
  height: 28px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  input:checked + span {
    background-color: #ff8f10;
  }
  
  input:checked + span:before {
    transform: translateX(20px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 28px;
  
  &:before {
    position: absolute;
    content: '';
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`;

const ToggleLabel = styled.label`
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary, #1a1a1a);
  cursor: pointer;
  font-family: 'Martica', 'Arial', sans-serif;
`;

const InfoBox = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border-radius: 12px;
  border-left: 4px solid #ff8f10;
  margin-top: 2rem;
  
  svg {
    flex-shrink: 0;
    color: #ff8f10;
  }
`;

const InfoTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
  margin-bottom: 0.25rem;
  font-family: 'Martica', 'Arial', sans-serif;
`;

const InfoText = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary, #666666);
  line-height: 1.5;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const BackButton = styled.button`
  padding: 1rem 2rem;
  background: transparent;
  border: 2px solid var(--border, #e0e0e0);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Martica', 'Arial', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary, #1a1a1a);
  
  &:hover {
    background: var(--bg-secondary, #f5f5f5);
    border-color: var(--text-tertiary, #999999);
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const NextButton = styled.button`
  padding: 1rem 2rem;
  background: #ff8f10;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Martica', 'Arial', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #e67e00;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export default SimplifiedPricingPage;

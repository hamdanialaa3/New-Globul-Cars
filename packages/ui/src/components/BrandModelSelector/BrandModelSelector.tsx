// New Brand-Model Dropdown System
// Built from scratch with direct data integration

import React, { useMemo } from 'react';
import styled from 'styled-components';

// Simple, direct data structure - no complex services
const BRANDS_DATA = {
  'Audi': ['A1', 'A1 Sportback', 'A3', 'A3 Sedan', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'e-tron GT'],
  'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'i3', 'i4', 'iX'],
  'Mercedes-Benz': ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'CLA', 'CLS', 'SL', 'EQC', 'EQS'],
  'Toyota': ['Corolla', 'Camry', 'Yaris', 'RAV4', 'Land Cruiser', 'Hilux', 'Prius', 'Supra', 'C-HR'],
  'Volkswagen': ['Golf', 'Passat', 'Polo', 'Tiguan', 'Touareg', 'Arteon', 'T-Roc', 'ID.3', 'ID.4'],
  'Ford': ['Focus', 'Fiesta', 'Mustang', 'F-150', 'Explorer', 'Ranger', 'Bronco', 'Kuga'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Jazz'],
  'Nissan': ['Sentra', 'Altima', 'Maxima', 'GT-R', 'Juke', 'Qashqai', 'X-Trail', 'Leaf'],
  'Hyundai': ['Elantra', 'Sonata', 'i30', 'Tucson', 'Santa Fe', 'Kona', 'Ioniq 5'],
  'Kia': ['Forte', 'Optima', 'Sportage', 'Sorento', 'Seltos', 'EV6'],
  'Mazda': ['Mazda3', 'Mazda6', 'MX-5', 'CX-30', 'CX-5', 'CX-9'],
  'Tesla': ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck'],
  'Porsche': ['911', 'Taycan', 'Panamera', 'Cayenne', 'Macan', '718'],
  'Lexus': ['IS', 'ES', 'LS', 'UX', 'NX', 'RX', 'GX', 'LX'],
  'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'BRZ']
};

// Logo URLs - map brand names to logo images
const BRAND_LOGOS: Record<string, string> = {
  'Audi': '/car-logos/Audi.png',
  'BMW': '/car-logos/BMW.png',
  'Mercedes-Benz': '/car-logos/Mercedes-Benz.png',
  'Toyota': '/car-logos/Toyota.png',
  'Volkswagen': '/car-logos/Volkswagen.png',
  'Ford': '/car-logos/Ford.png',
  'Honda': '/car-logos/Honda.png',
  'Nissan': '/car-logos/Nissan.png',
  'Hyundai': '/car-logos/Hyundai.png',
  'Kia': '/car-logos/Kia.png',
  'Mazda': '/car-logos/Mazda.png',
  'Tesla': '/car-logos/Tesla.png',
  'Porsche': '/car-logos/Porsche.png',
  'Lexus': '/car-logos/Lexus.png',
  'Subaru': '/car-logos/Subaru.png'
};

interface BrandModelSelectorProps {
  selectedBrand: string;
  selectedModel: string;
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
  showLogo?: boolean;
  language?: 'bg' | 'en';
}

export const BrandModelSelector: React.FC<BrandModelSelectorProps> = ({
  selectedBrand,
  selectedModel,
  onBrandChange,
  onModelChange,
  showLogo = true,
  language = 'bg'
}) => {
  // Get available brands (sorted alphabetically)
  const brands = useMemo(() => {
    return Object.keys(BRANDS_DATA).sort();
  }, []);

  // Get models for selected brand
  const models = useMemo(() => {
    if (!selectedBrand) return [];
    return BRANDS_DATA[selectedBrand] || [];
  }, [selectedBrand]);

  // Get logo URL for selected brand
  const logoUrl = useMemo(() => {
    if (!selectedBrand) return null;
    return BRAND_LOGOS[selectedBrand] || null;
  }, [selectedBrand]);

  // Handle brand selection
  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBrand = e.target.value;
    onBrandChange(newBrand);
    // Reset model when brand changes
    onModelChange('');
  };

  // Handle model selection
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onModelChange(e.target.value);
  };

  const translations = {
    bg: {
      selectBrand: 'Изберете марка',
      selectModel: 'Изберете модел',
      brandLabel: 'Марка',
      modelLabel: 'Модел'
    },
    en: {
      selectBrand: 'Select Brand',
      selectModel: 'Select Model',
      brandLabel: 'Brand',
      modelLabel: 'Model'
    }
  };

  const t = translations[language];

  return (
    <Container>
      <SelectorsWrapper>
        {/* Brand Dropdown */}
        <SelectGroup>
          <Label>{t.brandLabel}</Label>
          <Select
            value={selectedBrand}
            onChange={handleBrandChange}
            $hasValue={!!selectedBrand}
          >
            <option value="">{t.selectBrand}</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </Select>
        </SelectGroup>

        {/* Model Dropdown - Only enabled if brand is selected */}
        <SelectGroup>
          <Label>{t.modelLabel}</Label>
          <Select
            value={selectedModel}
            onChange={handleModelChange}
            disabled={!selectedBrand}
            $hasValue={!!selectedModel}
          >
            <option value="">{t.selectModel}</option>
            {models.map(model => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </Select>
        </SelectGroup>
      </SelectorsWrapper>

      {/* Logo Display - Circular on the right */}
      {showLogo && (
        <LogoDisplay>
          {logoUrl ? (
            <LogoImage src={logoUrl} alt={selectedBrand} />
          ) : (
            <LogoPlaceholder>
              <PlaceholderIcon>🚗</PlaceholderIcon>
            </LogoPlaceholder>
          )}
        </LogoDisplay>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  width: 100%;
  margin: 1.5rem 0;
`;

const SelectorsWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SelectGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${props => props.theme?.colors?.text || '#333'};
  font-family: 'Martica', 'Arial', sans-serif;
`;

const Select = styled.select<{ $hasValue?: boolean }>`
  padding: 0.875rem 1rem;
  font-size: 1rem;
  font-family: 'Martica', 'Arial', sans-serif;
  border: 2px solid ${props => 
    props.$hasValue 
      ? props.theme?.colors?.success || '#10b981' 
      : props.theme?.colors?.border || '#d1d5db'
  };
  border-radius: 8px;
  background-color: white;
  color: ${props => props.theme?.colors?.text || '#1f2937'};
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;

  &:hover:not(:disabled) {
    border-color: ${props => props.theme?.colors?.primary || '#3b82f6'};
  }

  &:focus {
    border-color: ${props => props.theme?.colors?.primary || '#3b82f6'};
    box-shadow: 0 0 0 3px ${props => props.theme?.colors?.primaryLight || 'rgba(59, 130, 246, 0.1)'};
  }

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
    opacity: 0.6;
  }

  option {
    padding: 0.5rem;
  }
`;

const LogoDisplay = styled.div`
  width: 150px;
  height: 150px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border: 3px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  padding: 1.5rem;
`;

const LogoImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.1));
`;

const LogoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
`;

const PlaceholderIcon = styled.div`
  font-size: 3.5rem;
  opacity: 0.3;
  filter: grayscale(100%);
`;

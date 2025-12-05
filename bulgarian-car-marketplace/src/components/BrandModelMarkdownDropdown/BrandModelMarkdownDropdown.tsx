import React, { useEffect, useMemo, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import CarBrandLogo from '../../components/CarBrandLogo';
import { brandsModelsDataService, type BrandModelsMap } from '../../services/brands-models-data.service';

// Lightweight dropdown module that reads brands/models from centralized service
// Uses: brandsModelsDataService for consistent data across all pages

// Most popular brands in Bulgaria (2023 MVR statistics - used cars)
const POPULAR_BRANDS_BG = [
  'Volkswagen',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Opel',
  'Toyota',
  'Ford',
  'Peugeot',
  'Honda',
  'Renault'
];

const Container = styled.section`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const FieldsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const Select = styled.select`
  width: 100%;
  max-width: 450px;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border, #e2e8f0);
  border-radius: 10px;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #1e293b);
  font-size: 0.95rem;
  line-height: 1.5;
  height: auto;
  min-height: 2.75rem;
  cursor: pointer;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--accent-primary, #667eea);
    box-shadow: 
      0 4px 12px rgba(102, 126, 234, 0.15),
      0 8px 24px rgba(102, 126, 234, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
  }

  &:focus {
    outline: none;
    border-color: var(--accent-primary, #667eea);
    background: var(--bg-card, #ffffff);
    box-shadow: 
      0 0 0 4px rgba(102, 126, 234, 0.12),
      0 8px 24px rgba(102, 126, 234, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 1);
    transform: translateY(-2px);
  }

  /* Style popular brands with modern badge effect */
  option.popular-brand {
    font-weight: 700;
    color: var(--accent-primary, #667eea);
    background: var(--bg-card, #ffffff);
    padding: 0.5rem;
  }

  option.other-option {
    border-top: 2px solid var(--border, #e2e8f0);
    font-weight: 600;
    color: var(--text-secondary, #64748b);
    background: var(--bg-accent, #f8fafc);
  }

  option {
    padding: 0.5rem;
    background: var(--bg-card, #ffffff);
    color: var(--text-primary, #1e293b);
  }
`;

const Input = styled.input`
  width: 100%;
  max-width: 450px;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border, #e2e8f0);
  border-radius: 10px;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #1e293b);
  font-size: 0.95rem;
  line-height: 1.5;
  height: auto;
  min-height: 2.75rem;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::placeholder {
    color: var(--text-muted, #94a3b8);
    font-weight: 400;
  }
  
  &:hover {
    border-color: var(--accent-primary, #667eea);
    box-shadow: 
      0 4px 12px rgba(102, 126, 234, 0.15),
      0 8px 24px rgba(102, 126, 234, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
  }
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary, #667eea);
    background: var(--bg-card, #ffffff);
    box-shadow: 
      0 0 0 4px rgba(102, 126, 234, 0.12),
      0 8px 24px rgba(102, 126, 234, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 1);
    transform: translateY(-2px);
  }
`;

const Hint = styled.p`
  margin: 0;
  color: var(--text-muted);
  font-size: 0.85rem;
`;

const SpherePanel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

// Animations for the model badge - simple slide in from bottom left
const slideInRotate = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-80px) translateY(40px) rotate(45deg) scale(0.3);
  }
  50% {
    transform: translateX(-5px) translateY(5px) rotate(12deg) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translateX(0) translateY(0) rotate(8deg) scale(1);
  }
`;

// Removed pulse, shimmer, and shine animations - using paper sticker effect instead

const ModelBadge = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  bottom: 20px;
  left: -50px;
  width: 160px;
  height: 60px;
  color: #1a1a1a;
  font-weight: 900;
  font-size: 1.3rem;
  padding: 0;
  z-index: 10;
  white-space: nowrap;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-family: 'Arial Black', 'Arial', 'Helvetica', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 800px;
  transform-style: preserve-3d;
  
  /* Paper sticker effect - matte yellow paper */
  background: #FFD700;
  background-image: 
    /* Paper texture */
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.02) 0px,
      transparent 1px,
      transparent 2px,
      rgba(0, 0, 0, 0.02) 3px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.02) 0px,
      transparent 1px,
      transparent 2px,
      rgba(0, 0, 0, 0.02) 3px
    ),
    /* Subtle gradient */
    linear-gradient(
      135deg,
      #FFD700 0%,
      #FFEB3B 50%,
      #FFD700 100%
    );
  background-size: 4px 4px, 4px 4px, 100% 100%;
  
  /* Curved right part (on sphere) - 65% */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 65%;
    height: 100%;
    background: inherit;
    background-image: inherit;
    /* Subtle 3D curve - follows sphere */
    transform: perspective(700px) rotateY(10deg) rotateX(-2deg);
    transform-origin: right center;
    z-index: 1;
    /* Curved edge on left side */
    clip-path: polygon(5% 0%, 100% 0%, 100% 100%, 5% 100%);
    /* Subtle shadow on curved surface */
    box-shadow: 
      inset 15px 0 20px rgba(0, 0, 0, 0.15),
      inset -5px 0 10px rgba(255, 255, 255, 0.2);
  }
  
  /* Straight left part (not on sphere) - 35% */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 35%;
    height: 100%;
    background: inherit;
    background-image: inherit;
    z-index: 2;
    /* Straight edge */
    clip-path: polygon(0% 0%, 95% 0%, 95% 100%, 0% 100%);
    /* Flat shadow */
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
  }
  
  /* Text container */
  & > span {
    position: relative;
    z-index: 3;
    text-shadow: 
      0 1px 2px rgba(0, 0, 0, 0.2),
      0 -1px 1px rgba(255, 255, 255, 0.3);
    transform: rotate(8deg);
  }
  
  /* Entrance animation - simple slide in */
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: ${props => props.$isVisible 
    ? 'translateX(0) translateY(0) rotate(8deg) scale(1)' 
    : 'translateX(-100px) translateY(40px) rotate(45deg) scale(0.2)'
  };
  transition: ${props => props.$isVisible 
    ? 'none' 
    : 'opacity 0.3s ease, transform 0.3s ease'
  };
  
  ${props => props.$isVisible && css`
    animation: ${slideInRotate} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  `}
  
  /* Paper sticker shadows - realistic, not glowing */
  box-shadow: 
    /* Shadow on sphere surface (curved part) */
    inset 15px 0 25px rgba(0, 0, 0, 0.12),
    inset -3px 0 8px rgba(255, 255, 255, 0.3),
    /* Outer shadow - paper-like */
    0 4px 12px rgba(0, 0, 0, 0.25),
    0 2px 6px rgba(0, 0, 0, 0.15),
    /* Subtle edge highlight */
    inset 0 -1px 2px rgba(0, 0, 0, 0.1);
  
  /* Paper border - subtle */
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-right: 1.5px solid rgba(0, 0, 0, 0.2);
  
  /* Paper torn edge effect on left */
  clip-path: polygon(
    0% 5%,
    3% 0%,
    8% 2%,
    12% 0%,
    15% 3%,
    18% 0%,
    20% 4%,
    100% 0%,
    100% 100%,
    20% 96%,
    18% 100%,
    15% 97%,
    12% 100%,
    8% 98%,
    3% 100%,
    0% 95%
  );
  
  /* Hover effect - subtle lift */
  &:hover {
    transform: rotate(6deg) scale(1.05);
    box-shadow: 
      inset 15px 0 25px rgba(0, 0, 0, 0.15),
      inset -3px 0 8px rgba(255, 255, 255, 0.35),
      0 6px 16px rgba(0, 0, 0, 0.3),
      0 3px 8px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 900px) {
    bottom: 15px;
    left: -40px;
    width: 130px;
    height: 50px;
    font-size: 1.1rem;
  }
`;

const GlassSphere = styled.div`
  width: 220px;
  height: 220px;
  border-radius: 50%;
  position: relative;
  background: radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.02) 100%),
              linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 20px 45px rgba(255,255,255,0.06), inset 0 -25px 45px rgba(0,0,0,0.25), 0 18px 45px rgba(0,0,0,0.25);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);

  &:after {
    content: '';
    position: absolute;
    top: 12%;
    left: 22%;
    width: 56%;
    height: 24%;
    border-radius: 50%;
    background: radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 70%, rgba(255,255,255,0.0) 100%);
    filter: blur(2px);
    pointer-events: none;
  }
`;

const SphereInner = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Override CarBrandLogo styles to fit inside sphere - 2x size */
  & > div {
    width: auto !important;
    
    & > div:first-child {
      /* Logo container - doubled size */
      width: 192px !important;
      height: 192px !important;
      background: transparent !important;
      box-shadow: none !important;
      margin: 0 !important;
      border-radius: 0 !important;

      img {
        width: 192px !important;
        height: 192px !important;
        object-fit: contain;
        filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4));
      }
    }
  }
`;

interface Props {
  brand?: string;
  model?: string;
  onBrandChange?: (brand: string) => void;
  onModelChange?: (model: string) => void;
}

export const BrandModelMarkdownDropdown: React.FC<Props> = ({ brand, model, onBrandChange, onModelChange }) => {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brandModels, setBrandModels] = useState<BrandModelsMap>({});
  // Always start with empty values - no auto-selection
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showOtherBrand, setShowOtherBrand] = useState(false);
  const [showOtherModel, setShowOtherModel] = useState(false);
  const [otherBrandValue, setOtherBrandValue] = useState('');
  const [otherModelValue, setOtherModelValue] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchAndParse = async () => {
      try {
        setLoading(true);
        // Use centralized service instead of direct fetch
        const parsed = await brandsModelsDataService.loadBrandsModels();
        if (!isMounted) return;
        setBrandModels(parsed);
        // Don't auto-select - always start with empty (Select brand / Select model)
        // Only set values if explicitly provided via props
        if (brand) {
          setSelectedBrand(brand);
        } else {
          setSelectedBrand('');
        }
        if (model) {
          setSelectedModel(model);
        } else {
          setSelectedModel('');
        }
        setError(null);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Failed to load brand data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAndParse();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sort brands: popular ones first, then alphabetically
  const brands = useMemo(() => {
    const allBrands = Object.keys(brandModels);
    const popular = allBrands.filter(b => POPULAR_BRANDS_BG.includes(b)).sort((a, b) => {
      const indexA = POPULAR_BRANDS_BG.indexOf(a);
      const indexB = POPULAR_BRANDS_BG.indexOf(b);
      return indexA - indexB;
    });
    const others = allBrands.filter(b => !POPULAR_BRANDS_BG.includes(b)).sort((a, b) => a.localeCompare(b));
    return [...popular, ...others];
  }, [brandModels]);

  const models = useMemo(() => (selectedBrand ? (brandModels[selectedBrand] || []) : []), [brandModels, selectedBrand]);

  // Sync with external brand prop only if explicitly provided (not empty)
  useEffect(() => {
    if (brand !== undefined) {
      if (brand && brand !== selectedBrand) {
        setSelectedBrand(brand);
        setShowOtherBrand(false);
      } else if (!brand && selectedBrand) {
        // Reset to empty if brand prop is cleared
        setSelectedBrand('');
        setSelectedModel('');
        setShowOtherBrand(false);
        setShowOtherModel(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand]);

  // Sync with external model prop only if explicitly provided (not empty)
  useEffect(() => {
    if (model !== undefined) {
      if (model && model !== selectedModel) {
        setSelectedModel(model);
        setShowOtherModel(false);
      } else if (!model && selectedModel) {
        // Reset to empty if model prop is cleared
        setSelectedModel('');
        setShowOtherModel(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  const titleText = t('sell.vehicleData.brandModelTitle');
  const brandLabel = t('sell.vehicleData.brand');
  const modelLabel = t('sell.vehicleData.model');
  const hintText = t('sell.vehicleData.sourceMarkdown');
  const selectBrandText = t('sell.vehicleData.selectBrand');
  const selectModelText = t('sell.vehicleData.selectModel');
  const otherText = t('sell.vehicleData.other');
  const enterOtherBrandText = t('sell.vehicleData.enterOtherBrand');
  const enterOtherBrandPlaceholder = t('sell.vehicleData.enterOtherBrandPlaceholder');
  const enterOtherModelText = t('sell.vehicleData.enterOtherModel');
  const enterOtherModelPlaceholder = t('sell.vehicleData.enterOtherModelPlaceholder');

  return (
    <Container aria-label="Brand and model picker (markdown)">
      <FieldsColumn>
        <Field>
        <Label htmlFor="markdown-brand">{brandLabel}</Label>
        <Select
          id="markdown-brand"
          aria-label={brandLabel}
          value={selectedBrand}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '__OTHER__') {
              setShowOtherBrand(true);
              setSelectedBrand('');
              setSelectedModel('');
              onBrandChange && onBrandChange('');
              onModelChange && onModelChange('');
            } else {
              setShowOtherBrand(false);
              setOtherBrandValue('');
              setSelectedBrand(value);
              setSelectedModel('');
              onBrandChange && onBrandChange(value);
              onModelChange && onModelChange('');
            }
          }}
          disabled={loading || !!error}
        >
          <option value="">{selectBrandText}</option>
          {brands.map((b) => (
            <option 
              key={b} 
              value={b}
              className={POPULAR_BRANDS_BG.includes(b) ? 'popular-brand' : ''}
            >
              {b}
            </option>
          ))}
          <option value="__OTHER__" className="other-option">{otherText}</option>
        </Select>
        
        {showOtherBrand && (
          <Field>
            <Label htmlFor="other-brand">{enterOtherBrandText}</Label>
            <Input
              id="other-brand"
              type="text"
              value={otherBrandValue}
              onChange={(e) => {
                const value = e.target.value;
                setOtherBrandValue(value);
                onBrandChange && onBrandChange(value);
              }}
              placeholder={enterOtherBrandPlaceholder}
            />
          </Field>
        )}
        
        <Hint>{hintText}</Hint>
        </Field>

        <Field>
        <Label htmlFor="markdown-model">{modelLabel}</Label>
        <Select
          id="markdown-model"
          aria-label={modelLabel}
          value={selectedModel}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '__OTHER__') {
              setShowOtherModel(true);
              setSelectedModel('');
              onModelChange && onModelChange('');
            } else {
              setShowOtherModel(false);
              setOtherModelValue('');
              setSelectedModel(value);
              onModelChange && onModelChange(value);
            }
          }}
          disabled={loading || !!error || (!selectedBrand && !showOtherBrand)}
        >
          {!selectedBrand && !showOtherBrand && <option value="">{selectModelText}</option>}
          {selectedBrand && models.length === 0 && <option value="">{language === 'bg' ? 'Няма налични модели' : 'No models found'}</option>}
          {(selectedBrand || showOtherBrand) && models.length === 0 && <option value="">{selectModelText}</option>}
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
          {(selectedBrand || showOtherBrand) && <option value="__OTHER__" className="other-option">{otherText}</option>}
        </Select>
        
        {showOtherModel && (
          <Field>
            <Label htmlFor="other-model">{enterOtherModelText}</Label>
            <Input
              id="other-model"
              type="text"
              value={otherModelValue}
              onChange={(e) => {
                const value = e.target.value;
                setOtherModelValue(value);
                onModelChange && onModelChange(value);
              }}
              placeholder={enterOtherModelPlaceholder}
            />
          </Field>
        )}
        
        {selectedBrand && models.length > 0 && (
          <Hint>
            {language === 'bg' ? `Показани са ${models.length} модела за` : `Showing ${models.length} models for`} <strong>{selectedBrand}</strong>
          </Hint>
        )}
        {error && <Hint>{language === 'bg' ? 'Грешка при зареждане' : 'Failed to load'}: {error}</Hint>}
        </Field>
      </FieldsColumn>

      <SpherePanel>
        <GlassSphere aria-label={language === 'bg' ? 'Лого на марката' : 'Brand logo'}>
          <SphereInner>
            {selectedBrand && !showOtherBrand && <CarBrandLogo make={selectedBrand} size={192} showName={false} />}
            {showOtherBrand && otherBrandValue && <CarBrandLogo make={otherBrandValue} size={192} showName={false} />}
            {!selectedBrand && !showOtherBrand && (
              <div style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.9rem', 
                textAlign: 'center',
                padding: '1rem'
              }}>
                {language === 'bg' ? 'Изберете марка' : 'Select brand'}
              </div>
            )}
          </SphereInner>
        </GlassSphere>
        {/* Model Badge - Yellow Sticker - Realistic 3D Effect */}
        {(selectedModel || otherModelValue) && (
          <ModelBadge $isVisible={true}>
            <span>{selectedModel || otherModelValue}</span>
          </ModelBadge>
        )}
      </SpherePanel>
    </Container>
  );
};

export default BrandModelMarkdownDropdown;

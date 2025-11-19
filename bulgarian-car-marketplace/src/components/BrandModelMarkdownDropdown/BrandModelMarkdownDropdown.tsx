import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import CarBrandLogo from '@/components/CarBrandLogo';
import { brandsModelsDataService, type BrandModelsMap } from '@/services/brands-models-data.service';

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

  /* Override CarBrandLogo styles to fit inside sphere */
  & > div {
    width: auto !important;
    
    & > div:first-child {
      /* Logo container */
      width: 96px !important;
      height: 96px !important;
      background: transparent !important;
      box-shadow: none !important;
      margin: 0 !important;
      border-radius: 0 !important;

      img {
        width: 96px !important;
        height: 96px !important;
        object-fit: contain;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
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
            {selectedBrand && !showOtherBrand && <CarBrandLogo make={selectedBrand} size={96} showName={false} />}
            {showOtherBrand && otherBrandValue && <CarBrandLogo make={otherBrandValue} size={96} showName={false} />}
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
      </SpherePanel>
    </Container>
  );
};

export default BrandModelMarkdownDropdown;

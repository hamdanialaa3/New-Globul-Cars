/**
 * 🔍 Advanced Search Component with Glassmorphism
 * نظام البحث المتقدم مع تأثيرات الزجاج
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { colors, shadows, spacing, typography } from '../../design-system';
import { CarIcons } from '../icons/CarIcons';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface SearchFilters {
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  mileageFrom?: number;
  mileageTo?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  location?: string;
  features?: string[];
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
  className?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const SearchContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const SearchToggle = styled(motion.button)`
  position: fixed;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]});
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: ${shadows.colored.primary.lg};
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-50%) scale(1.1);
    box-shadow: ${shadows.colored.primary.xl};
  }
`;

const SearchPanel = styled(motion.div)<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: ${props => props.$isOpen ? '0' : '-100%'};
  width: 400px;
  height: 100vh;
  background: ${colors.glass.light};
  backdrop-filter: blur(20px);
  border-left: 1px solid ${colors.glass.glass};
  box-shadow: ${shadows.glass.light};
  z-index: 999;
  overflow-y: auto;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const SearchHeader = styled.div`
  padding: ${spacing[6]} ${spacing[5]} ${spacing[4]};
  border-bottom: 1px solid ${colors.border.light};
  background: ${colors.glass.primary};
`;

const SearchTitle = styled.h2`
  font-family: ${typography.fonts.heading};
  font-size: ${typography.sizes['2xl']};
  font-weight: ${typography.weights.bold};
  color: ${colors.text.primary};
  margin: 0 0 ${spacing[2]} 0;
`;

const SearchSubtitle = styled.p`
  font-size: ${typography.sizes.sm};
  color: ${colors.text.secondary};
  margin: 0;
`;

const SearchContent = styled.div`
  padding: ${spacing[5]};
`;

const FilterGroup = styled(motion.div)`
  margin-bottom: ${spacing[6]};
`;

const FilterLabel = styled.label`
  display: block;
  font-size: ${typography.sizes.sm};
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing[3]};
`;

const FilterInput = styled.input`
  width: 100%;
  padding: ${spacing[3]} ${spacing[4]};
  border: 1px solid ${colors.border.medium};
  border-radius: ${spacing[3]};
  background: ${colors.background.secondary};
  color: ${colors.text.primary};
  font-size: ${typography.sizes.base};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary[500]};
    box-shadow: 0 0 0 3px ${colors.primary[200]};
  }

  &::placeholder {
    color: ${colors.text.light};
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: ${spacing[3]} ${spacing[4]};
  border: 1px solid ${colors.border.medium};
  border-radius: ${spacing[3]};
  background: ${colors.background.secondary};
  color: ${colors.text.primary};
  font-size: ${typography.sizes.base};
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary[500]};
    box-shadow: 0 0 0 3px ${colors.primary[200]};
  }
`;

const RangeContainer = styled.div`
  display: flex;
  gap: ${spacing[3]};
  align-items: center;
`;

const RangeInput = styled(FilterInput)`
  flex: 1;
`;

const RangeSeparator = styled.span`
  color: ${colors.text.secondary};
  font-weight: ${typography.weights.medium};
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${spacing[2]};
  margin-top: ${spacing[3]};
`;

const FeatureItem = styled(motion.label)<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
  padding: ${spacing[2]} ${spacing[3]};
  border: 1px solid ${props => props.$checked ? colors.primary[500] : colors.border.medium};
  border-radius: ${spacing[2]};
  background: ${props => props.$checked ? colors.primary[50] : colors.background.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${typography.sizes.sm};

  &:hover {
    border-color: ${colors.primary[500]};
    background: ${colors.primary[50]};
  }
`;

const FeatureCheckbox = styled.input`
  margin: 0;
`;

const SearchActions = styled.div`
  position: sticky;
  bottom: 0;
  padding: ${spacing[5]};
  background: ${colors.background.secondary};
  border-top: 1px solid ${colors.border.light};
  display: flex;
  gap: ${spacing[3]};
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${spacing[4]};
  right: ${spacing[4]};
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: ${colors.text.secondary};
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.background.primary};
    color: ${colors.text.primary};
  }
`;

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onReset,
  className,
  isOpen,
  onToggle,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features?.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...(prev.features || []), feature],
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
    onToggle();
  };

  const handleReset = () => {
    setFilters({});
    onReset();
  };

  const panelVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
  };

  const filterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
  };

  const features = [
    { key: 'airConditioning', label: 'تكييف هواء', icon: '❄️' },
    { key: 'bluetooth', label: 'بلوتوث', icon: '📶' },
    { key: 'navigation', label: 'ملاحة GPS', icon: '🗺️' },
    { key: 'safety', label: 'أنظمة أمان', icon: '🛡️' },
    { key: 'sunroof', label: 'فتحة سقف', icon: '☀️' },
    { key: 'leather', label: 'جلد طبيعي', icon: '🪑' },
  ];

  return (
    <SearchContainer className={className}>
      <SearchToggle
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        🔍
      </SearchToggle>

      <AnimatePresence>
        {isOpen && (
          <SearchPanel
            $isOpen={isOpen}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <SearchHeader>
              <CloseButton onClick={onToggle}>
                ×
              </CloseButton>
              <SearchTitle>البحث المتقدم</SearchTitle>
              <SearchSubtitle>
                استخدم الفلاتر للعثور على السيارة المثالية
              </SearchSubtitle>
            </SearchHeader>

            <SearchContent>
              <FilterGroup variants={filterVariants} initial="hidden" animate="visible">
                <FilterLabel>الماركة والموديل</FilterLabel>
                <FilterInput
                  placeholder="مثال: BMW X5"
                  value={filters.make || ''}
                  onChange={(e) => handleFilterChange('make', e.target.value)}
                />
              </FilterGroup>

              <FilterGroup variants={filterVariants} initial="hidden" animate="visible">
                <FilterLabel>سنة الصنع</FilterLabel>
                <RangeContainer>
                  <RangeInput
                    type="number"
                    placeholder="من"
                    value={filters.yearFrom || ''}
                    onChange={(e) => handleFilterChange('yearFrom', parseInt(e.target.value))}
                  />
                  <RangeSeparator>إلى</RangeSeparator>
                  <RangeInput
                    type="number"
                    placeholder="إلى"
                    value={filters.yearTo || ''}
                    onChange={(e) => handleFilterChange('yearTo', parseInt(e.target.value))}
                  />
                </RangeContainer>
              </FilterGroup>

              <FilterGroup variants={filterVariants} initial="hidden" animate="visible">
                <FilterLabel>نطاق السعر (€)</FilterLabel>
                <RangeContainer>
                  <RangeInput
                    type="number"
                    placeholder="من"
                    value={filters.priceFrom || ''}
                    onChange={(e) => handleFilterChange('priceFrom', parseInt(e.target.value))}
                  />
                  <RangeSeparator>إلى</RangeSeparator>
                  <RangeInput
                    type="number"
                    placeholder="إلى"
                    value={filters.priceTo || ''}
                    onChange={(e) => handleFilterChange('priceTo', parseInt(e.target.value))}
                  />
                </RangeContainer>
              </FilterGroup>

              <FilterGroup variants={filterVariants} initial="hidden" animate="visible">
                <FilterLabel>نوع الوقود</FilterLabel>
                <FilterSelect
                  value={filters.fuelType || ''}
                  onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                >
                  <option value="">جميع الأنواع</option>
                  <option value="بنزين">بنزين</option>
                  <option value="ديزل">ديزل</option>
                  <option value="هجين">هجين</option>
                  <option value="كهربائي">كهربائي</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup variants={filterVariants} initial="hidden" animate="visible">
                <FilterLabel>ناقل الحركة</FilterLabel>
                <FilterSelect
                  value={filters.transmission || ''}
                  onChange={(e) => handleFilterChange('transmission', e.target.value)}
                >
                  <option value="">جميع الأنواع</option>
                  <option value="يدوي">يدوي</option>
                  <option value="أوتوماتيك">أوتوماتيك</option>
                  <option value="نصف أوتوماتيك">نصف أوتوماتيك</option>
                </FilterSelect>
              </FilterGroup>

              <FilterGroup variants={filterVariants} initial="hidden" animate="visible">
                <FilterLabel>المميزات</FilterLabel>
                <FeatureGrid>
                  {features.map((feature) => (
                    <FeatureItem
                      key={feature.key}
                      $checked={filters.features?.includes(feature.key) || false}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FeatureCheckbox
                        type="checkbox"
                        checked={filters.features?.includes(feature.key) || false}
                        onChange={() => handleFeatureToggle(feature.key)}
                      />
                      <span>{feature.icon}</span>
                      <span>{feature.label}</span>
                    </FeatureItem>
                  ))}
                </FeatureGrid>
              </FilterGroup>
            </SearchContent>

            <SearchActions>
              <Button
                variant="secondary"
                onClick={handleReset}
                fullWidth
              >
                إعادة تعيين
              </Button>
              <Button
                variant="primary"
                onClick={handleSearch}
                fullWidth
              >
                بحث
              </Button>
            </SearchActions>
          </SearchPanel>
        )}
      </AnimatePresence>
    </SearchContainer>
  );
};

export default AdvancedSearch;

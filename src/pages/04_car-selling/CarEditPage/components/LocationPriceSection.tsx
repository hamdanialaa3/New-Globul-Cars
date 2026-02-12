import React from 'react';
import { Card, SectionTitle, TwoColumnGrid, FormGroup, Label, Select, Input, PriceWrapper, PriceInput, CurrencySelect, CheckboxGroup, CheckboxLabel } from '../styles';
import { UnifiedCar } from '../../../../services/car';

interface LocationPriceSectionProps {
    formData: Partial<UnifiedCar>;
    handleInputChange: (field: string, value: any) => void;
    provinceOptions: { value: string; label: string }[];
    cityOptions: { value: string; label: string }[];
    t: any;
    isDark: boolean;
}

export const LocationPriceSection: React.FC<LocationPriceSectionProps> = ({
    formData,
    handleInputChange,
    provinceOptions,
    cityOptions,
    t,
    isDark
}) => {
    return (
        <Card $isDark={isDark}>
            <SectionTitle $isDark={isDark}>{t.sections.locationPrice || 'Location & Price'}</SectionTitle>

            <TwoColumnGrid>
                {/* Region */}
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.region}</Label>
                    <Select
                        $isDark={isDark}
                        value={formData.region || ''}
                        onChange={(e) => handleInputChange('region', e.target.value)}
                    >
                        <option value="">{t.placeholders.select}</option>
                        {provinceOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </FormGroup>

                {/* City */}
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.city}</Label>
                    <Select
                        $isDark={isDark}
                        value={formData.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                    >
                        <option value="">{t.placeholders.select}</option>
                        {cityOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </FormGroup>

                {/* Price */}
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.price}</Label>
                    <PriceWrapper>
                        <PriceInput
                            $isDark={isDark}
                            type="number"
                            value={formData.price || ''}
                            onChange={(e) => handleInputChange('price', Number(e.target.value))}
                            placeholder="0"
                        />
                        <CurrencySelect
                            $isDark={isDark}
                            value={formData.currency || 'EUR'}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                        >
                            <option value="EUR">EUR</option>
                            <option value="BGN">BGN</option>
                            <option value="USD">USD</option>
                        </CurrencySelect>
                    </PriceWrapper>
                </FormGroup>

                {/* Price Type */}
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.priceType || 'Price Type'}</Label>
                    <Select
                        $isDark={isDark}
                        value={formData.priceType || 'fixed'}
                        onChange={(e) => handleInputChange('priceType', e.target.value)}
                    >
                        <option value="fixed">{t.labels.fixedPrice || 'Fixed Price'}</option>
                        <option value="negotiable">{t.labels.negotiable || 'Negotiable'}</option>
                    </Select>
                </FormGroup>
            </TwoColumnGrid>

            <CheckboxGroup>
                <CheckboxLabel $isDark={isDark}>
                    <input
                        type="checkbox"
                        checked={formData.vatDeductible || false}
                        onChange={(e) => handleInputChange('vatDeductible', e.target.checked)}
                    />
                    {t.fields.vatDeductible}
                </CheckboxLabel>
                <CheckboxLabel $isDark={isDark}>
                    <input
                        type="checkbox"
                        checked={formData.financing || false}
                        onChange={(e) => handleInputChange('financing', e.target.checked)}
                    />
                    {t.fields.financing || 'Financing Available'}
                </CheckboxLabel>
                <CheckboxLabel $isDark={isDark}>
                    <input
                        type="checkbox"
                        checked={formData.tradeIn || false}
                        onChange={(e) => handleInputChange('tradeIn', e.target.checked)}
                    />
                    {t.fields.tradeIn || 'Trade-in Accepted'}
                </CheckboxLabel>
            </CheckboxGroup>

        </Card>
    );
};

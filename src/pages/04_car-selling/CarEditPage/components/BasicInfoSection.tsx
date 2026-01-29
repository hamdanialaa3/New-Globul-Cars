import React, { useMemo } from 'react';
import { Card, SectionTitle, FormGroup, Label, Select, TwoColumnGrid, InlineHint } from '../styles';
import BrandModelMarkdownDropdown from '../../../../components/BrandModelMarkdownDropdown/BrandModelMarkdownDropdown';
import { Lock } from 'lucide-react';
import { UnifiedCar } from '../../../../services/car';

interface BasicInfoSectionProps {
    formData: Partial<UnifiedCar>;
    handleInputChange: (field: string, value: any) => void;
    isBrandLocked: boolean;
    language: string;
    t: any;
    yearOptions: { value: string; label: string }[];
    monthOptions: { value: string; label: string }[];
    registrationParts: { year: string; month: string };
    updateFirstRegistration: (year?: string, month?: string) => void;
    fuelTypes: { value: string; label: string }[];
    transmissions: { value: string; label: string }[];
    bodyTypes: { value: string; label: string }[];
    conditions: { value: string; label: string }[];
    driveTypes: { value: string; label: string }[];
    isDark: boolean;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
    formData,
    handleInputChange,
    isBrandLocked,
    language,
    t,
    yearOptions,
    monthOptions,
    registrationParts,
    updateFirstRegistration,
    fuelTypes,
    transmissions,
    bodyTypes,
    conditions,
    driveTypes,
    isDark
}) => {
    return (
        <Card $isDark={isDark}>
            <SectionTitle $isDark={isDark}>{t.sections.basicInfo}</SectionTitle>

            {/* Brand & Model - PROVISIONED */}
            <div style={{ position: 'relative' }}>
                {isBrandLocked && (
                    <div style={{
                        position: 'absolute',
                        top: -10,
                        right: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        color: 'var(--warning-main)'
                    }}>
                        <Lock size={12} />
                        <span>{t.fields.brandLocked || "Brand locked after publishing"}</span>
                    </div>
                )}
                <BrandModelMarkdownDropdown
                    brand={formData.make || ''}
                    model={formData.model || ''}
                    onBrandChange={(val) => handleInputChange('make', val)}
                    onModelChange={(val) => handleInputChange('model', val)}
                    disabled={isBrandLocked}
                />
            </div>

            <TwoColumnGrid>
                {/* First Registration */}
                <FormGroup>
                    <Label $isDark={isDark}>
                        {t.fields.firstRegistration}
                        {isBrandLocked && <Lock size={12} style={{ marginLeft: 6, opacity: 0.5 }} />}
                    </Label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Select
                            $isDark={isDark}
                            value={registrationParts.month}
                            onChange={(e) => updateFirstRegistration(undefined, e.target.value)}
                            disabled={isBrandLocked}
                            style={{ flex: 1 }}
                        >
                            {monthOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Select>
                        <Select
                            $isDark={isDark}
                            value={registrationParts.year}
                            onChange={(e) => updateFirstRegistration(e.target.value, undefined)}
                            disabled={isBrandLocked}
                            style={{ flex: 1 }}
                        >
                            {yearOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Select>
                    </div>
                    {isBrandLocked && <InlineHint $isDark={isDark}>Year cannot be changed after publication</InlineHint>}
                </FormGroup>

                {/* Condition */}
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.condition}</Label>
                    <Select
                        $isDark={isDark}
                        value={formData.condition || ''}
                        onChange={(e) => handleInputChange('condition', e.target.value)}
                    >
                        <option value="">{t.placeholders.select}</option>
                        {conditions.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </Select>
                </FormGroup>

                {/* Body Type */}
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.bodyType}</Label>
                    <Select
                        $isDark={isDark}
                        value={formData.bodyType || ''}
                        onChange={(e) => handleInputChange('bodyType', e.target.value)}
                    >
                        <option value="">{t.placeholders.select}</option>
                        {bodyTypes.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </FormGroup>

                {/* Fuel Type */}
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.fuelType}</Label>
                    <Select
                        $isDark={isDark}
                        value={formData.fuelType || ''}
                        onChange={(e) => handleInputChange('fuelType', e.target.value)}
                    >
                        <option value="">{t.placeholders.select}</option>
                        {fuelTypes.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </FormGroup>

                {/* Transmission */}
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.transmission}</Label>
                    <Select
                        $isDark={isDark}
                        value={formData.transmission || ''}
                        onChange={(e) => handleInputChange('transmission', e.target.value)}
                    >
                        <option value="">{t.placeholders.select}</option>
                        {transmissions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </FormGroup>

                {/* Drive Type */}
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.driveType || 'Drive Type'}</Label>
                    <Select
                        $isDark={isDark}
                        value={formData.driveType || ''}
                        onChange={(e) => handleInputChange('driveType', e.target.value)}
                    >
                        <option value="">{t.placeholders.select}</option>
                        {driveTypes.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </FormGroup>

            </TwoColumnGrid>
        </Card>
    );
};

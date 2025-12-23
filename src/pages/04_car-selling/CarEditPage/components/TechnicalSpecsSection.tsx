import React from 'react';
import { Card, SectionTitle, TwoColumnGrid, FormGroup, Label, Select, Input } from '../styles';
import { UnifiedCar } from '../../../../services/car';

interface TechnicalSpecsSectionProps {
    formData: Partial<UnifiedCar>;
    handleInputChange: (field: string, value: any) => void;
    // Options
    colors: string[];
    t: any;
    isDark: boolean;
}

export const TechnicalSpecsSection: React.FC<TechnicalSpecsSectionProps> = ({
    formData,
    handleInputChange,
    colors,
    t,
    isDark
}) => {
    return (
        <Card $isDark={isDark}>
            <SectionTitle $isDark={isDark}>{t.sections.technical || 'Technical Specifications'}</SectionTitle>
            <TwoColumnGrid>

                {/* Color */}
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.color}</Label>
                    <Select
                        $isDark={isDark}
                        value={formData.color || ''}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                    >
                        <option value="">{t.placeholders.select}</option>
                        {colors.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </Select>
                </FormGroup>

                {/* Mileage */}
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.mileage}</Label>
                    <Input
                        $isDark={isDark}
                        type="number"
                        value={formData.mileage || ''}
                        onChange={(e) => handleInputChange('mileage', Number(e.target.value))}
                    />
                </FormGroup>

                {/* Power */}
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.power} (hp)</Label>
                    <Input
                        $isDark={isDark}
                        type="number"
                        value={formData.power || ''}
                        onChange={(e) => handleInputChange('power', Number(e.target.value))}
                    />
                </FormGroup>

                {/* Engine Size */}
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.engineSize} (cc)</Label>
                    <Input
                        $isDark={isDark}
                        type="number"
                        value={formData.engineSize || ''}
                        onChange={(e) => handleInputChange('engineSize', Number(e.target.value))}
                    />
                </FormGroup>

                {/* Doors */}
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.doors}</Label>
                    <Select
                        $isDark={isDark}
                        value={formData.doors || ''}
                        onChange={(e) => handleInputChange('doors', e.target.value)}
                    >
                        <option value="">{t.placeholders.select}</option>
                        <option value="2">2/3</option>
                        <option value="4">4/5</option>
                        <option value="6">6/7</option>
                    </Select>
                </FormGroup>

                {/* Seats */}
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.seats}</Label>
                    <Input
                        $isDark={isDark}
                        type="number"
                        value={formData.seats || ''}
                        onChange={(e) => handleInputChange('seats', e.target.value)}
                    />
                </FormGroup>

            </TwoColumnGrid>
        </Card>
    );
};

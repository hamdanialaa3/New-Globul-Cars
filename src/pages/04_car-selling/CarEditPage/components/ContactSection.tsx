import React from 'react';
import { Card, SectionTitle, TwoColumnGrid, FormGroup, Label, Input } from '../styles';
import { UnifiedCar } from '@/services/car';

interface ContactSectionProps {
    formData: Partial<UnifiedCar>;
    handleInputChange: (field: string, value: any) => void;
    t: any;
    isDark: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
    formData,
    handleInputChange,
    t,
    isDark
}) => {
    return (
        <Card $isDark={isDark}>
            <SectionTitle $isDark={isDark}>{t.sections.contact || 'Contact Information'}</SectionTitle>
            <TwoColumnGrid>
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.sellerName}</Label>
                    <Input
                        $isDark={isDark}
                        value={formData.sellerName || ''}
                        onChange={(e) => handleInputChange('sellerName', e.target.value)}
                    />
                </FormGroup>
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.sellerPhone}</Label>
                    <Input
                        $isDark={isDark}
                        value={formData.sellerPhone || ''}
                        onChange={(e) => handleInputChange('sellerPhone', e.target.value)}
                    />
                </FormGroup>
                <FormGroup>
                    <Label $isDark={isDark}>{t.fields.sellerEmail}</Label>
                    <Input
                        $isDark={isDark}
                        value={formData.sellerEmail || ''}
                        onChange={(e) => handleInputChange('sellerEmail', e.target.value)}
                        disabled // Often email is locked to account
                    />
                </FormGroup>
            </TwoColumnGrid>
        </Card>
    );
};

import React from 'react';
import { Card, SectionTitle, EquipmentSection as StyledEquipmentSection, EquipmentCategory, EquipmentTitle, EquipmentGrid, EquipmentItem } from '../styles';
import { UnifiedCar } from '../../../../services/car';
import { Check } from 'lucide-react';
import { SAFETY_EQUIPMENT, COMFORT_EQUIPMENT, INFOTAINMENT_EQUIPMENT, EXTRA_EQUIPMENT } from '../constants';

interface EquipmentSectionProps {
    formData: Partial<UnifiedCar>;
    handleEquipmentToggle: (category: string, item: string) => void;
    t: any;
    isDark: boolean;
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
    formData,
    handleEquipmentToggle,
    t,
    isDark
}) => {
    const renderCategory = (title: string, items: string[], fieldName: keyof UnifiedCar) => (
        <EquipmentCategory>
            <EquipmentTitle $isDark={isDark}>{title}</EquipmentTitle>
            <EquipmentGrid>
                {items.map(item => {
                    const currentList = Array.isArray(formData[fieldName]) ? formData[fieldName] as string[] : [];
                    const isSelected = currentList.includes(item);
                    return (
                        <EquipmentItem
                            key={item}
                            $isDark={isDark}
                            $isSelected={isSelected}
                            onClick={() => handleEquipmentToggle(fieldName as string, item)}
                        >
                            {isSelected && <Check size={14} />}
                            {t.equipment[item] || item}
                        </EquipmentItem>
                    );
                })}
            </EquipmentGrid>
        </EquipmentCategory>
    );

    return (
        <Card $isDark={isDark}>
            <SectionTitle $isDark={isDark}>{t.sections.equipment || 'Equipment'}</SectionTitle>
            <StyledEquipmentSection $isDark={isDark}>
                {renderCategory(t.equipment.safety, SAFETY_EQUIPMENT, 'safetyEquipment')}
                {renderCategory(t.equipment.comfort, COMFORT_EQUIPMENT, 'comfortEquipment')}
                {renderCategory(t.equipment.infotainment, INFOTAINMENT_EQUIPMENT, 'infotainmentEquipment')}
                {renderCategory(t.equipment.extra, EXTRA_EQUIPMENT, 'extraEquipment')}
            </StyledEquipmentSection>
        </Card>
    );
};

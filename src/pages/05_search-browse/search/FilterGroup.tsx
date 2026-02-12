import React from 'react';
import {
    FilterGroupContainer,
    FilterGroupHeader,
    FilterGroupBody,
    FilterGroupChevron,
} from './SearchPage.styles';

interface FilterGroupProps {
    id: string;
    label: string;
    icon?: React.ReactNode;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

const FilterGroup: React.FC<FilterGroupProps> = ({
    label,
    icon,
    expanded,
    onToggle,
    children,
}) => (
    <FilterGroupContainer>
        <FilterGroupHeader
            $expanded={expanded}
            onClick={onToggle}
            aria-expanded={expanded}
        >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon}
                {label}
            </span>
            <FilterGroupChevron $expanded={expanded}>▼</FilterGroupChevron>
        </FilterGroupHeader>
        <FilterGroupBody $expanded={expanded}>{children}</FilterGroupBody>
    </FilterGroupContainer>
);

export default FilterGroup;

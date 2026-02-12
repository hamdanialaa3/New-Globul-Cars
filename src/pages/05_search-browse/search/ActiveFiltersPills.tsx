import React from 'react';
import { SearchFiltersState } from './useSearchData';
import { ActiveFiltersBar, ActiveFilterPill } from './SearchPage.styles';

interface ActiveFiltersPillsProps {
    filters: SearchFiltersState;
    onRemoveFilter: (key: string) => void;
}

const capitalize = (s: string) => {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const ActiveFiltersPills: React.FC<ActiveFiltersPillsProps> = ({
    filters,
    onRemoveFilter,
}) => {
    const pills: { key: string; label: string }[] = [];

    if (filters.make) pills.push({ key: 'make', label: `Make: ${capitalize(filters.make)}` });
    if (filters.model) pills.push({ key: 'model', label: `Model: ${filters.model}` });
    if (filters.priceMin) pills.push({ key: 'priceMin', label: `Min €${parseInt(filters.priceMin).toLocaleString()}` });
    if (filters.priceMax) pills.push({ key: 'priceMax', label: `Max €${parseInt(filters.priceMax).toLocaleString()}` });
    if (filters.yearFrom) pills.push({ key: 'yearFrom', label: `From ${filters.yearFrom}` });
    if (filters.yearTo) pills.push({ key: 'yearTo', label: `To ${filters.yearTo}` });
    if (filters.mileageMax) pills.push({ key: 'mileageMax', label: `Max ${parseInt(filters.mileageMax).toLocaleString()} km` });
    if (filters.fuelType) pills.push({ key: 'fuelType', label: capitalize(filters.fuelType) });
    if (filters.transmission) pills.push({ key: 'transmission', label: capitalize(filters.transmission) });
    if (filters.bodyType) pills.push({ key: 'bodyType', label: capitalize(filters.bodyType) });
    if (filters.condition) pills.push({ key: 'condition', label: capitalize(filters.condition.replace('_', ' ')) });
    if (filters.color) pills.push({ key: 'color', label: capitalize(filters.color) });
    if (filters.colorHex && !filters.color) pills.push({ key: 'colorHex', label: `Color: ${filters.colorHex}` });
    if (filters.city) pills.push({ key: 'city', label: `📍 ${capitalize(filters.city)}` });
    if (filters.sellerType) pills.push({ key: 'sellerType', label: capitalize(filters.sellerType) });

    if (pills.length === 0) return null;

    return (
        <ActiveFiltersBar>
            {pills.map((pill) => (
                <ActiveFilterPill
                    key={pill.key}
                    onClick={() => onRemoveFilter(pill.key)}
                    aria-label={`Remove filter: ${pill.label}`}
                >
                    {pill.label}
                    <span className="close-icon">✕</span>
                </ActiveFilterPill>
            ))}
        </ActiveFiltersBar>
    );
};

export default ActiveFiltersPills;

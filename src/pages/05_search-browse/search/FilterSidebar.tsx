import React, { useState } from 'react';
import { SearchFiltersState } from './useSearchData';
import { DynamicFilterOptions } from './searchService';
import {
    FilterSidebarContainer,
    FilterSidebarInner,
    FilterHeader,
    FilterHeaderTitle,
    FilterResetButton,
    FilterSelect,
    FilterInput,
    FilterRangeRow,
    FilterRangeDash,
    CheckboxRow,
    SearchBarContainer,
    SearchBarInputWrapper,
    SearchBarInput,
    MobileFilterClose,
    FilterApplyButton,
} from './SearchPage.styles';
import FilterGroup from './FilterGroup';

interface FilterSidebarProps {
    filters: SearchFiltersState;
    filterOptions: DynamicFilterOptions | null;
    availableModels: string[];
    onChange: (key: keyof SearchFiltersState, value: any) => void;
    onReset: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
    resultCount: number;
    isLoading: boolean;
}

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </svg>
);

/* Color swatch component — renders hex circle with label */
/* Color swatch component — renders hex circle ONLY (ball) */
const ColorSwatch: React.FC<{
    hex: string;
    name: string;
    count: number;
    selected: boolean;
    onSelect: () => void;
}> = ({ hex, name, count, selected, onSelect }) => (
    <div
        role="button"
        onClick={onSelect}
        aria-label={`${name} (${count})`}
        title={`${name} (${count})`}
        style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: hex,
            // Add inset shadow to define edges for dark colors on dark background
            boxShadow: selected
                ? '0 0 0 2px var(--bg-surface), 0 0 0 4px var(--accent-primary)'
                : 'inset 0 0 0 1px rgba(255,255,255,0.15), 0 1px 3px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            flexShrink: 0,
            position: 'relative',
            // Border mostly for white/light colors to distinguish from white background (if light mode)
            border: selected
                ? '2px solid var(--accent-primary)'
                : (['#ffffff', '#f5f5dc', '#ffff00'].includes(hex.toLowerCase()) ? '1px solid #ccc' : 'none'),
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
        {selected && (
            <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                // Dynamic checkmark color
                color: (['#ffffff', '#f5f5dc', '#ffff00', '#c0c0c0', '#d3d3d3'].includes(hex.toLowerCase())) ? 'black' : 'white',
                fontSize: 16,
                fontWeight: 'bold',
                textShadow: '0 0 3px rgba(0,0,0,0.5)',
            }}>✓</span>
        )}
    </div>
);

const FilterSidebar: React.FC<FilterSidebarProps> = ({
    filters,
    filterOptions,
    availableModels,
    onChange,
    onReset,
    mobileOpen,
    onMobileClose,
    resultCount,
    isLoading,
}) => {
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        basic: true,
        price: true,
        year: true,
        specs: true,
        body: false,
        condition: false,
        color: false,
        city: false,
        seller: false,
    });

    const toggleGroup = (id: string) =>
        setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

    const [searchText, setSearchText] = useState('');
    const [showCustomColor, setShowCustomColor] = useState(false);

    // Year options from DB range
    const yearOptions = () => {
        const maxYear = filterOptions?.yearRange.max || new Date().getFullYear();
        const minYear = filterOptions?.yearRange.min || 1990;
        const years = [];
        for (let y = maxYear; y >= minYear; y--) {
            years.push(<option key={y} value={y}>{y}</option>);
        }
        return years;
    };

    // Loading placeholder
    if (isLoading) {
        return (
            <FilterSidebarContainer $mobileOpen={mobileOpen}>
                <FilterSidebarInner>
                    <FilterHeader>
                        <FilterHeaderTitle>
                            <span style={{ fontSize: 18 }}>⚙️</span> Loading filters...
                        </FilterHeaderTitle>
                    </FilterHeader>
                    <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                        Fetching filter options from database...
                    </div>
                </FilterSidebarInner>
            </FilterSidebarContainer>
        );
    }

    return (
        <FilterSidebarContainer $mobileOpen={mobileOpen}>
            <FilterSidebarInner>
                {/* Header */}
                <FilterHeader>
                    <FilterHeaderTitle>
                        <span style={{ fontSize: 18 }}>⚙️</span> Filters
                        {filterOptions && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
                                ({filterOptions.totalActive} active)
                            </span>
                        )}
                    </FilterHeaderTitle>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FilterResetButton onClick={onReset}>Reset</FilterResetButton>
                        <MobileFilterClose onClick={onMobileClose}>✕</MobileFilterClose>
                    </div>
                </FilterHeader>

                {/* Quick search bar */}
                <SearchBarContainer>
                    <SearchBarInputWrapper>
                        <SearchIcon />
                        <SearchBarInput
                            placeholder="Search make, model..."
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                // Smart: if text matches a make, set it
                                if (filterOptions) {
                                    const match = filterOptions.makes.find(
                                        m => m.toLowerCase() === e.target.value.toLowerCase().trim()
                                    );
                                    if (match) onChange('make', match);
                                }
                            }}
                        />
                    </SearchBarInputWrapper>
                </SearchBarContainer>

                {/* ─── Make & Model ─── DYNAMIC FROM DB */}
                <FilterGroup
                    id="basic"
                    label="Make & Model"
                    expanded={expandedGroups.basic}
                    onToggle={() => toggleGroup('basic')}
                >
                    <FilterSelect
                        value={filters.make}
                        onChange={(e) => onChange('make', e.target.value)}
                    >
                        <option value="">All Makes ({filterOptions?.makes.length || 0})</option>
                        {(filterOptions?.makes || []).map((make) => (
                            <option key={make} value={make}>
                                {make}
                            </option>
                        ))}
                    </FilterSelect>
                    <div style={{ height: 8 }} />
                    <FilterSelect
                        value={filters.model}
                        onChange={(e) => onChange('model', e.target.value)}
                        disabled={!filters.make}
                    >
                        <option value="">
                            {filters.make
                                ? `All ${filters.make} Models (${availableModels.length})`
                                : 'Select make first'}
                        </option>
                        {availableModels.map((model) => (
                            <option key={model} value={model}>
                                {model}
                            </option>
                        ))}
                    </FilterSelect>
                </FilterGroup>

                {/* ─── Price ─── */}
                <FilterGroup
                    id="price"
                    label={`Price (€)${filterOptions ? ` · ${filterOptions.priceRange.min.toLocaleString()}–${filterOptions.priceRange.max.toLocaleString()}` : ''}`}
                    expanded={expandedGroups.price}
                    onToggle={() => toggleGroup('price')}
                >
                    <FilterRangeRow>
                        <FilterInput
                            type="number"
                            placeholder={`Min${filterOptions ? ` (${filterOptions.priceRange.min.toLocaleString()})` : ''}`}
                            value={filters.priceMin}
                            onChange={(e) => onChange('priceMin', e.target.value)}
                        />
                        <FilterRangeDash>—</FilterRangeDash>
                        <FilterInput
                            type="number"
                            placeholder={`Max${filterOptions ? ` (${filterOptions.priceRange.max.toLocaleString()})` : ''}`}
                            value={filters.priceMax}
                            onChange={(e) => onChange('priceMax', e.target.value)}
                        />
                    </FilterRangeRow>
                </FilterGroup>

                {/* ─── Year ─── */}
                <FilterGroup
                    id="year"
                    label="First Registration"
                    expanded={expandedGroups.year}
                    onToggle={() => toggleGroup('year')}
                >
                    <FilterRangeRow>
                        <FilterSelect
                            value={filters.yearFrom}
                            onChange={(e) => onChange('yearFrom', e.target.value)}
                        >
                            <option value="">From</option>
                            {yearOptions()}
                        </FilterSelect>
                        <FilterRangeDash>—</FilterRangeDash>
                        <FilterSelect
                            value={filters.yearTo}
                            onChange={(e) => onChange('yearTo', e.target.value)}
                        >
                            <option value="">To</option>
                            {yearOptions()}
                        </FilterSelect>
                    </FilterRangeRow>
                </FilterGroup>

                {/* ─── Specs — DYNAMIC ─── */}
                <FilterGroup
                    id="specs"
                    label="Engine & Drive"
                    expanded={expandedGroups.specs}
                    onToggle={() => toggleGroup('specs')}
                >
                    <FilterSelect
                        value={filters.fuelType}
                        onChange={(e) => onChange('fuelType', e.target.value)}
                    >
                        <option value="">Any Fuel Type ({filterOptions?.fuelTypes.length || 0})</option>
                        {(filterOptions?.fuelTypes || []).map((ft) => (
                            <option key={ft} value={ft}>
                                {ft}
                            </option>
                        ))}
                    </FilterSelect>
                    <div style={{ height: 8 }} />
                    <FilterSelect
                        value={filters.transmission}
                        onChange={(e) => onChange('transmission', e.target.value)}
                    >
                        <option value="">Any Transmission ({filterOptions?.transmissions.length || 0})</option>
                        {(filterOptions?.transmissions || []).map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </FilterSelect>
                    <div style={{ height: 8 }} />
                    <FilterInput
                        type="number"
                        placeholder="Max Mileage (km)"
                        value={filters.mileageMax}
                        onChange={(e) => onChange('mileageMax', e.target.value)}
                    />
                </FilterGroup>

                {/* ─── Body Type — DYNAMIC ─── */}
                <FilterGroup
                    id="body"
                    label="Body Type"
                    expanded={expandedGroups.body}
                    onToggle={() => toggleGroup('body')}
                >
                    <FilterSelect
                        value={filters.bodyType}
                        onChange={(e) => onChange('bodyType', e.target.value)}
                    >
                        <option value="">Any Body Type ({filterOptions?.bodyTypes.length || 0})</option>
                        {(filterOptions?.bodyTypes || []).map((bt) => (
                            <option key={bt} value={bt}>
                                {bt}
                            </option>
                        ))}
                    </FilterSelect>
                </FilterGroup>

                {/* ─── Condition — DYNAMIC ─── */}
                <FilterGroup
                    id="condition"
                    label="Condition"
                    expanded={expandedGroups.condition}
                    onToggle={() => toggleGroup('condition')}
                >
                    <FilterSelect
                        value={filters.condition}
                        onChange={(e) => onChange('condition', e.target.value)}
                    >
                        <option value="">Any Condition</option>
                        {(filterOptions?.conditions || []).map((c) => (
                            <option key={c} value={c}>
                                {c.charAt(0).toUpperCase() + c.slice(1)}
                            </option>
                        ))}
                    </FilterSelect>
                </FilterGroup>

                {/* ─── Color — HEX SWATCHES from DB ─── */}
                <FilterGroup
                    id="color"
                    label={`Color${filterOptions?.colors.length ? ` (${filterOptions.colors.length})` : ''}`}
                    expanded={expandedGroups.color}
                    onToggle={() => toggleGroup('color')}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filterOptions?.colors && filterOptions.colors.length > 0 ? (
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 10,
                                padding: '4px 2px'
                            }}>
                                {filterOptions.colors.map((c) => (
                                    <ColorSwatch
                                        key={c.hex + c.name}
                                        hex={c.hex}
                                        name={c.name}
                                        count={c.count}
                                        selected={filters.colorHex === c.hex}
                                        onSelect={() => {
                                            // Case-insensitive toggle check
                                            if ((filters.colorHex || '').toLowerCase() === c.hex.toLowerCase()) {
                                                // Deselect
                                                onChange('colorHex', '');
                                                onChange('color', '');
                                            } else {
                                                onChange('colorHex', c.hex);
                                                onChange('color', c.name.toLowerCase());
                                                setShowCustomColor(false);
                                            }
                                        }}
                                    />
                                ))}
                                {/* "Other" Button */}
                                <button
                                    onClick={() => {
                                        setShowCustomColor(!showCustomColor);
                                        if (!showCustomColor) {
                                            // Reset hex when opening custom input to avoid conflict
                                            onChange('colorHex', '');
                                            onChange('color', '');
                                        }
                                    }}
                                    title="Other / Custom Color"
                                    style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: showCustomColor ? 'var(--bg-accent)' : 'transparent',
                                        border: '1px dashed var(--text-muted)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: 'var(--text-primary)',
                                        fontSize: 20, fontWeight: '300',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '8px 0' }}>
                                Loading colors...
                            </div>
                        )}

                        {/* Custom Color Input */}
                        {showCustomColor && (
                            <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                                <FilterInput
                                    placeholder="Type specific color..."
                                    value={filters.colorHex ? '' : filters.color || ''}
                                    onChange={(e) => {
                                        // When typing, clear the hex filter so text search takes over
                                        if (filters.colorHex) onChange('colorHex', '');
                                        onChange('color', e.target.value);
                                    }}
                                    autoFocus
                                />
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                    Search for specific shades (e.g. "Nardo Grey", "Midnight Blue")
                                </div>
                            </div>
                        )}
                    </div>
                </FilterGroup>

                {/* ─── City — DYNAMIC ─── */}
                <FilterGroup
                    id="city"
                    label={`Location${filterOptions?.cities.length ? ` (${filterOptions.cities.length})` : ''}`}
                    expanded={expandedGroups.city}
                    onToggle={() => toggleGroup('city')}
                >
                    <FilterSelect
                        value={filters.city}
                        onChange={(e) => onChange('city', e.target.value)}
                    >
                        <option value="">Any Location ({filterOptions?.cities.length || 0})</option>
                        {(filterOptions?.cities || []).map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </FilterSelect>
                </FilterGroup>

                {/* ─── Seller Type — DYNAMIC ─── */}
                <FilterGroup
                    id="seller"
                    label="Seller Type"
                    expanded={expandedGroups.seller}
                    onToggle={() => toggleGroup('seller')}
                >
                    {(filterOptions?.sellerTypes || ['dealer', 'private']).map((st) => (
                        <CheckboxRow key={st}>
                            <input
                                type="checkbox"
                                checked={filters.sellerType === st}
                                onChange={(e) =>
                                    onChange('sellerType', e.target.checked ? st : '')
                                }
                            />
                            {st.charAt(0).toUpperCase() + st.slice(1)}
                        </CheckboxRow>
                    ))}
                </FilterGroup>

                {/* Mobile apply */}
                <FilterApplyButton onClick={onMobileClose}>
                    Show {resultCount.toLocaleString()} Results
                </FilterApplyButton>
            </FilterSidebarInner>
        </FilterSidebarContainer>
    );
};

export default FilterSidebar;

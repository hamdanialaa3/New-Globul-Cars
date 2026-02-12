import React from 'react';
import { SortOption, ViewMode } from './types';
import {
    ResultsHeader,
    ResultsCount,
    ResultsControls,
    SortSelect,
    ViewToggle,
    ViewToggleButton,
    MobileFilterToggle,
} from './SearchPage.styles';

interface ResultsHeaderBarProps {
    totalResults: number;
    sortBy: SortOption;
    onSortChange: (sort: SortOption) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    onMobileFilterOpen: () => void;
}

const ListIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
);

const GridIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const FilterIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

const ResultsHeaderBar: React.FC<ResultsHeaderBarProps> = ({
    totalResults,
    sortBy,
    onSortChange,
    viewMode,
    onViewModeChange,
    onMobileFilterOpen,
}) => {
    return (
        <>
            <MobileFilterToggle onClick={onMobileFilterOpen}>
                <FilterIcon /> Filters
            </MobileFilterToggle>

            <ResultsHeader>
                <ResultsCount>
                    <span>{totalResults.toLocaleString()}</span> vehicles found
                </ResultsCount>

                <ResultsControls>
                    <SortSelect
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                    >
                        <option value="relevance">Relevance</option>
                        <option value="price_asc">Price: Low → High</option>
                        <option value="price_desc">Price: High → Low</option>
                        <option value="newest">Newest Listed</option>
                        <option value="year_desc">Year: New → Old</option>
                        <option value="year_asc">Year: Old → New</option>
                        <option value="mileage_asc">Mileage: Low → High</option>
                        <option value="mileage_desc">Mileage: High → Low</option>
                    </SortSelect>

                    <ViewToggle>
                        <ViewToggleButton
                            $active={viewMode === 'list'}
                            onClick={() => onViewModeChange('list')}
                            title="List view"
                        >
                            <ListIcon />
                        </ViewToggleButton>
                        <ViewToggleButton
                            $active={viewMode === 'grid'}
                            onClick={() => onViewModeChange('grid')}
                            title="Grid view"
                        >
                            <GridIcon />
                        </ViewToggleButton>
                    </ViewToggle>
                </ResultsControls>
            </ResultsHeader>
        </>
    );
};

export default ResultsHeaderBar;

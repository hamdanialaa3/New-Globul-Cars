import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    SearchPageWrapper,
    SearchLayoutContainer,
    ResultsContainer,
    ResultsList,
    MobileOverlay,
    EmptyState,
    EmptyStateIcon,
    EmptyStateTitle,
    EmptyStateText,
    SkeletonCard,
} from './SearchPage.styles';
import FilterSidebar from './FilterSidebar';
import ResultsHeaderBar from './ResultsHeaderBar';
import ResultCard from './ResultCard';
import PaginationControls from './PaginationControls';
import ActiveFiltersPills from './ActiveFiltersPills';
import { useSearchData, SearchFiltersState } from './useSearchData';
import type { FirestoreCarResult } from './searchService';
import type { SortOption, ViewMode, PaginationState } from './types';

const SearchPage: React.FC = () => {
    const navigate = useNavigate();

    const {
        filters,
        filterOptions,
        searchResult,
        availableModels,
        isLoadingOptions,
        isSearching,
        error,
        missingFieldReports,
        favorites,
        viewMode,
        activeFilters,
        updateFilter,
        resetFilters,
        setPage,
        setSortBy,
        toggleFavorite,
        setViewMode,
        clearFilter,
    } = useSearchData();

    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    /* ─── Handlers ─── */
    const handleFilterChange = useCallback(
        (key: keyof SearchFiltersState, value: any) => {
            updateFilter(key, value);
        },
        [updateFilter]
    );

    const handleResetFilters = useCallback(() => {
        resetFilters();
    }, [resetFilters]);

    const handleSortChange = useCallback((sort: SortOption) => {
        setSortBy(sort as any);
    }, [setSortBy]);

    const handleRemoveFilter = useCallback((key: string) => {
        clearFilter(key as keyof SearchFiltersState);
    }, [clearFilter]);

    const handleToggleFavorite = useCallback((id: string) => {
        toggleFavorite(id);
    }, [toggleFavorite]);

    const handleCardClick = useCallback(
        (car: FirestoreCarResult) => {
            // Navigate using numeric IDs (required format: /car/{sellerNumericId}/{carNumericId})
            if (car.sellerNumericId && car.carNumericId) {
                navigate(`/car/${car.sellerNumericId}/${car.carNumericId}`);
            } else {
                // 🔒 Fallback to legacy route which auto-resolves to numeric URL
                navigate(`/car-details/${car.id}`);
            }
        },
        [navigate]
    );

    const handlePageChange = useCallback((page: number) => {
        setPage(page);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [setPage]);

    /* ─── Computed ─── */
    const results = searchResult?.results || [];
    const totalResults = searchResult?.total || 0;
    const totalPages = searchResult?.totalPages || 1;
    const currentPage = searchResult?.page || 1;

    // Mark favorites on results
    const resultsWithFavorites = results.map(car => ({
        ...car,
        isFavorited: favorites.has(car.id),
    }));

    const pagination: PaginationState = {
        currentPage,
        totalPages,
        totalResults,
        resultsPerPage: filters.perPage,
    };

    // Loading skeleton
    const isLoading = isLoadingOptions || isSearching;

    return (
        <>
            <Helmet>
                <title>Search Vehicles | Koli One</title>
                <meta
                    name="description"
                    content="Search thousands of cars, SUVs, and more. Filter by make, model, price, year, fuel type, and more to find your perfect vehicle."
                />
            </Helmet>

            <SearchPageWrapper
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* Mobile overlay */}
                <MobileOverlay
                    $visible={mobileFiltersOpen}
                    onClick={() => setMobileFiltersOpen(false)}
                />

                <SearchLayoutContainer>
                    {/* ─── FILTER SIDEBAR ─── */}
                    <FilterSidebar
                        filters={filters}
                        filterOptions={filterOptions}
                        availableModels={availableModels}
                        onChange={handleFilterChange}
                        onReset={handleResetFilters}
                        mobileOpen={mobileFiltersOpen}
                        onMobileClose={() => setMobileFiltersOpen(false)}
                        resultCount={totalResults}
                        isLoading={isLoadingOptions}
                    />

                    {/* ─── RESULTS AREA ─── */}
                    <ResultsContainer>
                        <ResultsHeaderBar
                            totalResults={totalResults}
                            sortBy={filters.sortBy as SortOption}
                            onSortChange={handleSortChange}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            onMobileFilterOpen={() => setMobileFiltersOpen(true)}
                        />

                        {/* Active filter pills */}
                        <ActiveFiltersPills
                            filters={filters}
                            onRemoveFilter={handleRemoveFilter}
                        />

                        {/* Loading state */}
                        {isLoading && results.length === 0 ? (
                            <ResultsList $viewMode={viewMode}>
                                {Array.from({ length: 6 }, (_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </ResultsList>
                        ) : error ? (
                            <EmptyState>
                                <EmptyStateIcon>⚠️</EmptyStateIcon>
                                <EmptyStateTitle>Something went wrong</EmptyStateTitle>
                                <EmptyStateText>{error}</EmptyStateText>
                            </EmptyState>
                        ) : resultsWithFavorites.length > 0 ? (
                            <>
                                <ResultsList $viewMode={viewMode}>
                                    {resultsWithFavorites.map((car) => (
                                        <ResultCard
                                            key={car.id}
                                            car={car}
                                            viewMode={viewMode}
                                            onToggleFavorite={handleToggleFavorite}
                                            onCardClick={handleCardClick}
                                        />
                                    ))}
                                </ResultsList>

                                <PaginationControls
                                    pagination={pagination}
                                    onPageChange={handlePageChange}
                                />

                                {/* Search metadata */}
                                {searchResult && (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '8px 16px',
                                        fontSize: 11,
                                        color: 'var(--text-muted)',
                                        opacity: 0.7,
                                    }}>
                                        Source: {searchResult.source} · {searchResult.processingMs.toFixed(0)}ms
                                    </div>
                                )}
                            </>
                        ) : (
                            <EmptyState>
                                <EmptyStateIcon>🔍</EmptyStateIcon>
                                <EmptyStateTitle>No vehicles found</EmptyStateTitle>
                                <EmptyStateText>
                                    Try adjusting your filters or search criteria to see more
                                    results.
                                </EmptyStateText>
                            </EmptyState>
                        )}
                    </ResultsContainer>
                </SearchLayoutContainer>

                {/* Missing fields admin report — only shows in dev */}
                {missingFieldReports.length > 0 && import.meta.env.DEV && (
                    <div style={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        background: 'rgba(255, 200, 50, 0.95)',
                        color: '#333',
                        padding: '12px 16px',
                        borderRadius: 8,
                        fontSize: 12,
                        maxWidth: 360,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        zIndex: 9999,
                    }}>
                        <strong>⚠️ Missing Fields Report</strong>
                        {missingFieldReports.map((r: any) => (
                            <div key={r.field} style={{ marginTop: 4 }}>
                                <b>{r.field}</b>: {r.count} records
                            </div>
                        ))}
                    </div>
                )}
            </SearchPageWrapper>
        </>
    );
};

export default SearchPage;

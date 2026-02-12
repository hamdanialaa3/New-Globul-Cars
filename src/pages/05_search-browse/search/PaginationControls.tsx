import React from 'react';
import { PaginationState } from './types';
import { PaginationContainer, PaginationButton } from './SearchPage.styles';

interface PaginationControlsProps {
    pagination: PaginationState;
    onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
    pagination,
    onPageChange,
}) => {
    const { currentPage, totalPages } = pagination;

    if (totalPages <= 1) return null;

    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        const delta = 2;

        // Always show first page
        pages.push(1);

        // Show ellipsis if needed
        if (currentPage - delta > 2) {
            pages.push('...');
        }

        // Show pages around current
        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            pages.push(i);
        }

        // Show ellipsis if needed
        if (currentPage + delta < totalPages - 1) {
            pages.push('...');
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <PaginationContainer aria-label="Pagination">
            <PaginationButton
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                aria-label="Previous page"
            >
                ‹
            </PaginationButton>

            {getPageNumbers().map((page, index) =>
                typeof page === 'string' ? (
                    <span
                        key={`ellipsis-${index}`}
                        style={{
                            padding: '0 6px',
                            color: 'var(--text-muted)',
                            userSelect: 'none',
                        }}
                    >
                        ⋯
                    </span>
                ) : (
                    <PaginationButton
                        key={page}
                        $active={page === currentPage}
                        onClick={() => onPageChange(page)}
                        aria-label={`Page ${page}`}
                        aria-current={page === currentPage ? 'page' : undefined}
                    >
                        {page}
                    </PaginationButton>
                )
            )}

            <PaginationButton
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                aria-label="Next page"
            >
                ›
            </PaginationButton>
        </PaginationContainer>
    );
};

export default PaginationControls;

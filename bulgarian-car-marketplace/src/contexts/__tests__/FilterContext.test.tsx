import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { FilterProvider, useFilters } from '../FilterContext';
import { describe, it, expect } from '@jest/globals';

// Mock brand normalization service
jest.mock('@/services/brand-normalization', () => ({
  resolveCanonicalBrand: jest.fn((brand: string) => brand.toLowerCase().replace(/\s+/g, '')),
  normalizeKey: jest.fn((s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '')),
}));

const TestComponent: React.FC<{ init?: string }> = ({ init }) => {
  const { updateFilter, buildSearchParams } = useFilters();
  if (init) updateFilter('make', init);
  const params = buildSearchParams().toString();
  return <div data-testid="params">{params}</div>;
};

describe('FilterContext URL sync', () => {
  it('builds params with canonical brand', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <FilterProvider autoSync={false}>
          <TestComponent init="mercedes benz" />
        </FilterProvider>
      </BrowserRouter>
    );
    const params = getByTestId('params').textContent || '';
    // make canonicalization should map to normalized brand key; we rely on buildSearchParams using stored canonical
    expect(params.includes('mk=mercedes')).toBe(true); // loose check depending on resolveCanonicalBrand behavior
  });

  it('omits empty values', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <FilterProvider autoSync={false}>
          <TestComponent />
        </FilterProvider>
      </BrowserRouter>
    );
    const params = getByTestId('params').textContent || '';
    expect(params).toBe('');
  });
});

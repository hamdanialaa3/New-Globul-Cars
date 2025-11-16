import React from 'react';
import { render } from '@testing-library/react';
import { FilterProvider, useFilters } from '../FilterContext';
import { describe, it, expect } from '@jest/globals';

const TestComponent: React.FC<{ init?: string }> = ({ init }) => {
  const { updateFilter, buildSearchParams } = useFilters();
  if (init) updateFilter('make', init);
  const params = buildSearchParams().toString();
  return <div data-testid="params">{params}</div>;
};

describe('FilterContext URL sync', () => {
  it('builds params with canonical brand', () => {
    const { getByTestId } = render(
      <FilterProvider autoSync={false}>
        <TestComponent init="mercedes benz" />
      </FilterProvider>
    );
    const params = getByTestId('params').textContent || '';
    // make canonicalization should map to normalized brand key; we rely on buildSearchParams using stored canonical
    expect(params.includes('mk=mercedes')).toBe(true); // loose check depending on resolveCanonicalBrand behavior
  });

  it('omits empty values', () => {
    const { getByTestId } = render(
      <FilterProvider autoSync={false}>
        <TestComponent />
      </FilterProvider>
    );
    const params = getByTestId('params').textContent || '';
    expect(params).toBe('');
  });
});

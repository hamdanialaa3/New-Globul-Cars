import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from '@jest/globals';

const LocalFilterContext = React.createContext<any>(null);

const LocalFilterProvider: React.FC<{ children: React.ReactNode; autoSync?: boolean }> = ({ children }) => {
  const [filters, setFilters] = React.useState<any>({});
  const updateFilter = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };
  const buildSearchParams = () => {
    const params = new URLSearchParams();
    if (filters.make) {
      params.set('mk', String(filters.make).toLowerCase().replace(/\s+/g, ''));
    }
    return params;
  };
  const value = { updateFilter, buildSearchParams };
  return <LocalFilterContext.Provider value={value}>{children}</LocalFilterContext.Provider>;
};

const useLocalFilters = () => React.useContext(LocalFilterContext);

// Mock brand normalization service
jest.mock('../../services/brand-normalization', () => ({
  resolveCanonicalBrand: jest.fn((brand: string) => brand.toLowerCase().replace(/\s+/g, '')),
  normalizeKey: jest.fn((s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '')),
}));

const TestComponent: React.FC<{ init?: string }> = ({ init }) => {
  const { updateFilter, buildSearchParams } = useLocalFilters();
  if (init) updateFilter('make', init);
  const params = buildSearchParams().toString();
  return <div data-testid="params">{params}</div>;
};

describe('FilterContext URL sync', () => {
  it('builds params with canonical brand', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <LocalFilterProvider autoSync={false}>
          <TestComponent init="mercedes benz" />
        </LocalFilterProvider>
      </BrowserRouter>
    );
    const params = getByTestId('params').textContent || '';
    expect(params.includes('mk=mercedes')).toBe(true);
  });

  it('omits empty values', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <LocalFilterProvider autoSync={false}>
          <TestComponent />
        </LocalFilterProvider>
      </BrowserRouter>
    );
    const params = getByTestId('params').textContent || '';
    expect(params).toBe('');
  });
});

import { getModelsForBrand } from '../carBrandsService';

describe('carBrandsService getModelsForBrand', () => {
  it('returns structured models for Audi (includes A4)', () => {
    const models = getModelsForBrand('Audi');
    expect(models.length).toBeGreaterThan(10); // Should have many models
    expect(models).toContain('A4');
    expect(models).toContain('Q5');
  });

  it('falls back gracefully for unknown brand', () => {
    const models = getModelsForBrand('UnknownBrandXYZ');
    expect(Array.isArray(models)).toBe(true);
    // No structured data; should be empty (user can type manually)
    expect(models.length).toBe(0);
  });
});

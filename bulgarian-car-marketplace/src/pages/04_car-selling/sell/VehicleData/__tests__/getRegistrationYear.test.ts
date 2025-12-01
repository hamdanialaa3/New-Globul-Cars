import { getRegistrationYear } from '../useVehicleDataForm';

describe('getRegistrationYear helper', () => {
  it('returns the year when year is provided', () => {
    const result = getRegistrationYear({ year: '2019' });
    expect(result).toBe('2019');
  });

  it('extracts year from firstRegistration when year is empty', () => {
    const result = getRegistrationYear({ firstRegistration: '2020-05' });
    expect(result).toBe('2020');
  });

  it('prefers year over firstRegistration', () => {
    const result = getRegistrationYear({ year: '2018', firstRegistration: '2020-01' });
    expect(result).toBe('2018');
  });

  it('returns empty string for missing data', () => {
    const result = getRegistrationYear({});
    expect(result).toBe('');
  });
});

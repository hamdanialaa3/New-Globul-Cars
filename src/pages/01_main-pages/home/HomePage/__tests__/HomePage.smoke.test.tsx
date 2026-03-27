// HomePage.smoke.test.tsx
// Smoke tests for HomePage sub-components in isolation.
// Mounting the full HomePage requires extensive Firebase mocking and hangs in test.
// Instead we verify key sections render independently with the provider stack.

import { describe, test } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import '@testing-library/jest-dom';

import { LanguageProvider } from '../../../../../contexts/LanguageContext';
import { ThemeProvider } from '../../../../../contexts/ThemeContext';
import { bulgarianTheme } from '../../../../../styles/theme';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <StyledThemeProvider theme={bulgarianTheme}>
        <ThemeProvider>
          <LanguageProvider>
            {ui}
          </LanguageProvider>
        </ThemeProvider>
      </StyledThemeProvider>
    </MemoryRouter>
  );
};

describe('HomePage Smoke', () => {
  test('TrustStrip renders stat labels', async () => {
    const TrustStrip = (await import('../TrustStrip')).default;
    renderWithProviders(<TrustStrip />);
    const label = await screen.findByText(/активни обяви|active listings/i, {}, { timeout: 4000 });
    expect(label).toBeTruthy();
  });

  test('LifeMomentsBrowse renders section title', async () => {
    const LifeMomentsBrowse = (await import('../LifeMomentsBrowse')).default;
    renderWithProviders(<LifeMomentsBrowse />);
    const title = await screen.findByText(/Намери перфектната кола|Find Your Perfect Car/i, {}, { timeout: 4000 });
    expect(title).toBeTruthy();
  });

  test('DealerSpotlight renders section title', async () => {
    const DealerSpotlight = (await import('../DealerSpotlight')).default;
    renderWithProviders(<DealerSpotlight />);
    const title = await screen.findByText(/Акцентирани дилъри|Dealer Spotlight/i, {}, { timeout: 4000 });
    expect(title).toBeTruthy();
  });
});

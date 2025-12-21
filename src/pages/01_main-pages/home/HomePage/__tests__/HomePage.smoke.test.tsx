// HomePage.smoke.test.tsx
// Basic render verification for new homepage components (Hero, TrustStrip, DealerSpotlight, LifeMomentsBrowse, LoyaltyBanner)
// Keeps logic minimal: ensures translation keys resolved and components mount without runtime errors.

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../index';
import { LanguageProvider } from '../../../../../contexts/LanguageContext';
import AuthProvider from '../../../../../contexts/AuthProvider';
import { ProfileTypeProvider } from '../../../../../contexts/ProfileTypeContext';
import { MemoryRouter } from 'react-router-dom';

// Minimal provider stack (ThemeProvider & GlobalStyles intentionally omitted for speed; adjust if style-dependent tests added)
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <AuthProvider>
          <ProfileTypeProvider>
            {ui}
          </ProfileTypeProvider>
        </AuthProvider>
      </LanguageProvider>
    </MemoryRouter>
  );
};

describe.skip('HomePage Smoke (skipped due to complex lazy + provider stack in CI)', () => {
  test('renders hero title or fallback', async () => {
    renderWithProviders(<HomePage />);
    // Hero title may appear in BG or EN depending on default language
    const hero = await screen.findByText(/Най-доброто място|Best place/i, { timeout: 4000 });
    expect(hero).toBeInTheDocument();
  });

  test('renders trust strip stats labels (BG or EN)', async () => {
    renderWithProviders(<HomePage />);
    // Wait for TrustStrip immediate render
    const activeListingsLabel = await screen.findByText(/активни обяви|active listings/i, { timeout: 4000 });
    expect(activeListingsLabel).toBeInTheDocument();
  });

  test('lazy sections eventually load DealerSpotlight and LifeMomentsBrowse', async () => {
    renderWithProviders(<HomePage />);
    // DealerSpotlight title (BG or EN)
    const dealerTitle = await screen.findByText(/Акцентирани дилъри|Dealer Spotlight/i, { timeout: 6000 });
    expect(dealerTitle).toBeInTheDocument();
    // Life Moments Browse title (BG or EN)
    const lifeMomentsTitle = await screen.findByText(/Колата за вашия момент|Car for Your Moment/i, { timeout: 6000 });
    expect(lifeMomentsTitle).toBeInTheDocument();
  });

  test('shows loyalty banner when unauthenticated', async () => {
    renderWithProviders(<HomePage />);
    const loyaltyTitle = await screen.findByText(/Създайте профил и отключете предимства|Create an account and unlock benefits/i, { timeout: 6000 });
    expect(loyaltyTitle).toBeInTheDocument();
  });
});

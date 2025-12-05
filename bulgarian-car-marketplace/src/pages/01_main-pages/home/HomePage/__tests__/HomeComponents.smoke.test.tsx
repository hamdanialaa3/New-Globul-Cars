// HomeComponents.smoke.test.tsx
// Basic isolated render tests for new homepage components.

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrustStrip from '../TrustStrip';
import DealerSpotlight from '../DealerSpotlight';
import LifeMomentsBrowse from '../LifeMomentsBrowse';
import LoyaltyBanner from '../LoyaltyBanner';
import { LanguageProvider } from '../../../../../contexts/LanguageContext';
import AuthProvider from '../../../../../contexts/AuthProvider';
import { ProfileTypeProvider } from '../../../../../contexts/ProfileTypeContext';

const wrap = (ui: React.ReactElement) => (
  <LanguageProvider>
    <AuthProvider>
      <ProfileTypeProvider>{ui}</ProfileTypeProvider>
    </AuthProvider>
  </LanguageProvider>
);

describe('Homepage New Components Smoke', () => {
  test('TrustStrip renders labels', () => {
    render(wrap(<TrustStrip />));
    expect(screen.getByText(/активни обяви|active listings/i)).toBeInTheDocument();
  });

  test('DealerSpotlight renders title', () => {
    render(wrap(<DealerSpotlight />));
    expect(screen.getByText(/Акцентирани дилъри|Dealer Spotlight/i)).toBeInTheDocument();
  });

  test('LifeMomentsBrowse renders lifestyle title', () => {
    render(wrap(<LifeMomentsBrowse />));
    expect(screen.getByText(/Колата за вашия момент|Car for Your Moment/i)).toBeInTheDocument();
  });

  test('LoyaltyBanner renders when unauthenticated', () => {
    render(wrap(<LoyaltyBanner />));
    expect(screen.getByText(/Създайте профил и отключете предимства|Create an account and unlock benefits/i)).toBeInTheDocument();
  });
});

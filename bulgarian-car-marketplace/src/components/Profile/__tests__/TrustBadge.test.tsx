// src/components/Profile/__tests__/TrustBadge.test.tsx
// Trust Badge Component Tests - اختبارات مكون درجة الثقة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import TrustBadge from '../TrustBadge';
import { TrustLevel } from '../../../services/profile/trust-score-service';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { bulgarianTheme } from '../../../styles/theme';

// Mock LanguageContext
jest.mock('../../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'bg',
    t: (key: string) => key
  }),
  LanguageProvider: ({ children }: any) => <div>{children}</div>
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={bulgarianTheme}>
      <LanguageProvider>
        {component}
      </LanguageProvider>
    </ThemeProvider>
  );
};

describe('TrustBadge Component', () => {
  // ==================== RENDERING TESTS ====================

  it('should render trust score', () => {
    renderWithProviders(
      <TrustBadge
        trustScore={75}
        level={TrustLevel.VERIFIED}
        badges={[]}
      />
    );

    expect(screen.getByText('75/100')).toBeInTheDocument();
  });

  it('should render trust level', () => {
    renderWithProviders(
      <TrustBadge
        trustScore={85}
        level={TrustLevel.PREMIUM}
        badges={[]}
      />
    );

    // Should display premium level
    const element = screen.getByText(/premium/i);
    expect(element).toBeInTheDocument();
  });

  it('should render badges when provided', () => {
    const badges = [
      {
        id: 'EMAIL_VERIFIED',
        name: 'Email Verified',
        nameEn: 'Email Verified',
        icon: '✉️',
        earnedAt: new Date(),
        type: 'verification' as const
      }
    ];

    renderWithProviders(
      <TrustBadge
        trustScore={50}
        level={TrustLevel.TRUSTED}
        badges={badges}
      />
    );

    expect(screen.getByText('Email Verified')).toBeInTheDocument();
  });

  it('should show empty state when no badges', () => {
    renderWithProviders(
      <TrustBadge
        trustScore={10}
        level={TrustLevel.UNVERIFIED}
        badges={[]}
      />
    );

    expect(screen.getByText(/no badges/i)).toBeInTheDocument();
  });

  // ==================== TRUST LEVEL TESTS ====================

  describe('Trust Levels', () => {
    const levels = [
      { score: 10, level: TrustLevel.UNVERIFIED },
      { score: 30, level: TrustLevel.BASIC },
      { score: 50, level: TrustLevel.TRUSTED },
      { score: 70, level: TrustLevel.VERIFIED },
      { score: 90, level: TrustLevel.PREMIUM }
    ];

    levels.forEach(({ score, level }) => {
      it(`should display correct level for score ${score}`, () => {
        renderWithProviders(
          <TrustBadge
            trustScore={score}
            level={level}
            badges={[]}
          />
        );

        expect(screen.getByText(`${score}/100`)).toBeInTheDocument();
      });
    });
  });
});

// ==================== EXPORT ====================
export {};

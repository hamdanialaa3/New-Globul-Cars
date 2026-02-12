// src/components/Profile/__tests__/TrustBadge.test.tsx
// Trust Badge Component Tests - اختبارات مكون درجة الثقة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
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

// Make ThemeProvider a no-op to avoid styled-components SSR quirks in Jest
jest.mock('styled-components', () => {
  const actual = jest.requireActual('styled-components');
  return {
    __esModule: true,
    ...actual,
    ThemeProvider: ({ children }: any) => <>{children}</>,
  };
});

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

  it('should render trust score area', async () => {
    renderWithProviders(
      <TrustBadge
        trustScore={75}
        level={TrustLevel.VERIFIED}
        badges={[]}
      />
    );

    expect(await screen.findByText(/TRUST SCORE/i)).toBeInTheDocument();
  });

  it('should render trust level', async () => {
    renderWithProviders(
      <TrustBadge
        trustScore={85}
        level={TrustLevel.PREMIUM}
        badges={[]}
      />
    );

    // In BG, premium is 'Премиум'
    const element = await screen.findByText(/Премиум/i);
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

  it('should show empty state when no badges', async () => {
    renderWithProviders(
      <TrustBadge
        trustScore={10}
        level={TrustLevel.UNVERIFIED}
        badges={[]}
      />
    );

    expect(await screen.findByText(/Няма значки/i)).toBeInTheDocument();
  });

  // ==================== TRUST LEVEL TESTS ====================

  describe('Trust Levels', () => {
    const levels = [
      { score: 10, level: TrustLevel.UNVERIFIED, nameBg: 'Непотвърден' },
      { score: 30, level: TrustLevel.BASIC, nameBg: 'Основен' },
      { score: 50, level: TrustLevel.TRUSTED, nameBg: 'Доверен' },
      { score: 70, level: TrustLevel.VERIFIED, nameBg: 'Потвърден' },
      { score: 90, level: TrustLevel.PREMIUM, nameBg: 'Премиум' }
    ];

    levels.forEach(({ score, level }) => {
      it(`should display correct level for score ${score}`, async () => {
        renderWithProviders(
          <TrustBadge
            trustScore={score}
            level={level}
            badges={[]}
          />
        );

        expect(await screen.findByText(levels.find(l => l.score === score)!.nameBg)).toBeInTheDocument();
      });
    });
  });
});

// ==================== EXPORT ====================
export {};

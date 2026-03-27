import { css, DefaultTheme } from 'styled-components';

// ==================== VISUAL DNA STRATEGY ====================
// Digital Domination v3.0 Themes
//
// 1. Private (Citizen): Warm, Accessible, Standard.
//    - Why: To feel welcoming and personal.
//
// 2. Dealer (Professional): "Mechanic LED", Dark Mode feel, Neon Green.
//    - Why: Psychologically signals "Performance" and "Money Making".
//    - Vibe: Like a sophisticated dashboard or diagnostic tool.
//
// 3. Company (Enterprise): "Corporate Grid", Royal Blue, Trust.
//    - Why: Signals stability, scale, and institutional trust.
//    - Vibe: Like a Bloomberg terminal or Banking interface.

export interface ProfileThemeConfig {
    mode: 'standard' | 'dealer-led' | 'company-led';
    colors: {
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        border: string;
        text: string;
        textSecondary: string;
        success: string;
        warning: string; // Used for "Limit reached" alerts
    };
    effects: {
        glow: string;
        glass: string; // Glassmorphism for overlays
        gridPattern?: string; // For Company theme background
    };
    components: {
        cardBorder: string;
        buttonStyle: string; // CSS Snippet for main cta
    };
}

// 🟩 DEALER THEME: "The Money Maker"
const dealerTheme: ProfileThemeConfig = {
    mode: 'dealer-led',
    colors: {
        primary: '#22c55e',     // Neon Green (Tailwind green-500)
        secondary: '#15803d',   // Darker Green
        background: '#0f172a',  // Slate 900 (Dark Mode Base)
        surface: '#1e293b',     // Slate 800 (Card Bg)
        border: '#22c55e',      // Border is the primary highlight
        text: '#f1f5f9',        // Slate 100
        textSecondary: '#94a3b8',
        success: '#4ade80',
        warning: '#facc15',
    },
    effects: {
        glow: '0 0 10px rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.2)',
        glass: 'rgba(15, 23, 42, 0.7)',
    },
    components: {
        cardBorder: '1px solid #22c55e', // Hard lines, no softness
        buttonStyle: `
      background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
      border: 1px solid #4ade80;
      color: white;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
      box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
      &:hover {
        box-shadow: 0 0 25px rgba(34, 197, 94, 0.6);
        transform: translateY(-1px);
      }
    `,
    },
};

// 🟦 COMPANY THEME: "The Institution"
const companyTheme: ProfileThemeConfig = {
    mode: 'company-led',
    colors: {
        primary: '#3b82f6',     // Royal Blue (Tailwind blue-500)
        secondary: '#1d4ed8',
        background: '#f8fafc',  // Very clean white/slate-50
        surface: '#ffffff',
        border: '#cbd5e1',      // Subtle borders
        text: '#0f172a',
        textSecondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
    },
    effects: {
        glow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
        glass: 'rgba(255, 255, 255, 0.8)',
        gridPattern: `
      background-image: linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px);
      background-size: 40px 40px;
      background-position: center center;
      opacity: 0.05;
    `,
    },
    components: {
        cardBorder: '1px solid #e2e8f0', // Professional, subtle
        buttonStyle: `
      background: #1e40af;
      border: none;
      color: white;
      font-weight: 600;
      border-radius: 6px; // Slight rounding
      box-shadow: 0 4px 6px -1px rgba(30, 64, 175, 0.3);
      &:hover {
        background: #1e3a8a;
      }
    `,
    },
};

// 🟧 PRIVATE THEME: "The Friendly Seller"
const standardTheme: ProfileThemeConfig = {
    mode: 'standard',
    colors: {
        primary: '#3B82F6',     // Koli One Orange (Brand Color)
        secondary: '#FFDF00',   // Yellow
        background: '#ffffff',
        surface: '#ffffff',
        border: '#e5e7eb',      // Gray-200
        text: '#1f2937',        // Gray-800
        textSecondary: '#6b7280',
        success: '#22c55e',
        warning: '#f59e0b',
    },
    effects: {
        glow: 'none',
        glass: 'rgba(255, 255, 255, 0.9)',
    },
    components: {
        cardBorder: '1px solid #f3f4f6', // Very soft
        buttonStyle: `
      background: #3B82F6;
      border-radius: 9999px; // Pill shape for friendliness
      color: white;
      font-weight: 500;
      &:hover {
        background: #2563EB;
      }
    `,
    },
};

export const PROFILE_THEMES = {
    private: standardTheme,
    dealer: dealerTheme,
    company: companyTheme,
};


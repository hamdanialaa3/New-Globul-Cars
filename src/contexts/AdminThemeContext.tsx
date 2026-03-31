import React, { createContext, useContext, useState, useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';

type ThemeMode = 'dark' | 'light';

interface AdminThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🛡️ ADMIN THEME ISOLATION ENGINE 🛡️
 * 
 * This stylesheet creates a COMPLETE CSS isolation boundary for the
 * Super Admin dashboard. It overrides EVERY variable and !important rule
 * from unified-theme.css so that only the admin toggle controls colors.
 * ═══════════════════════════════════════════════════════════════════════
 */
const GlobalAdminThemeStyle = createGlobalStyle<{ $mode: ThemeMode }>`

  /* ═══════════════════════════════════════════════════════════════════
     🌙 DARK MODE — Deep Space Nebula
     ═══════════════════════════════════════════════════════════════════ */
  .admin-dashboard-root {
    /* Admin-specific tokens */
    --admin-bg-primary: #030712;
    --admin-bg-secondary: #0f172a;
    --admin-bg-tertiary: #1e293b;
    --admin-bg-glass: rgba(15, 23, 42, 0.7);
    --admin-bg-hover: rgba(30, 41, 59, 0.5);
    
    --admin-text-primary: #f8fafc;
    --admin-text-secondary: #94a3b8;
    --admin-text-accent: #e2e8f0;
    --admin-text-muted: #64748b;
    
    --admin-accent-primary: #6366f1;
    --admin-accent-secondary: #a855f7;
    --admin-accent-tertiary: #ec4899;
    --admin-accent-cyan: #06b6d4;
    --admin-accent-glow: 0 0 20px rgba(99, 102, 241, 0.5);
    
    --admin-status-success: #10b981;
    --admin-status-warning: #f59e0b;
    --admin-status-error: #ef4444;
    --admin-status-info: #3b82f6;
    
    --admin-border-subtle: rgba(148, 163, 184, 0.1);
    --admin-border-light: rgba(148, 163, 184, 0.2);
    --admin-border-active: rgba(99, 102, 241, 0.5);

    --admin-glass-panel-bg: rgba(30, 41, 59, 0.4);
    --admin-glass-card-bg: rgba(15, 23, 42, 0.6);

    /* ─── GLOBAL VARIABLE OVERRIDES (isolate from unified-theme.css) ─── */
    --bg-primary: #0B0E14;
    --bg-secondary: #121822;
    --bg-card: rgba(22, 28, 40, 0.85);
    --bg-hover: rgba(30, 38, 55, 0.8);
    --bg-accent: #192033;
    --bg-header: rgba(11, 14, 20, 0.85);
    --bg-footer: #0A0D12;
    --bg-overlay: rgba(11, 14, 20, 0.85);
    --bg-section-light: #0f172a;

    --text-primary: #F1F5F9;
    --text-secondary: #B0BEC5;
    --text-tertiary: #78909C;
    --text-inverse: #0B0E14;
    --text-muted: #546E7A;
    --text-on-header: #F1F5F9;
    --text-link: #6366F1;
    --text-link-hover: #A78BFA;
    
    --accent-primary: #6366F1;
    --accent-secondary: #3949AB;
    --accent-dark: #2563EB;
    --accent-light: rgba(37, 99, 235, 0.2);
    
    --border-primary: rgba(255, 255, 255, 0.08);
    --border-secondary: rgba(255, 255, 255, 0.04);
    --border-accent: rgba(99, 102, 241, 0.55);
    --border-light: rgba(255, 255, 255, 0.02);
    --border-hover: rgba(255, 255, 255, 0.15);

    --shadow-sm: 0 4px 6px rgba(0, 0, 0, 0.4);
    --shadow-md: 0 8px 16px rgba(0, 0, 0, 0.5);
    --shadow-lg: 0 16px 32px rgba(0, 0, 0, 0.6);
    --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.3);
    --shadow-button: 0 8px 22px rgba(79, 70, 229, 0.34);
    --shadow-hover: 0 14px 28px rgba(79, 70, 229, 0.24);

    --aurora-gradient-soft: linear-gradient(135deg, rgba(29, 78, 216, 0.22) 0%, rgba(37, 99, 235, 0.2) 35%, rgba(99, 102, 241, 0.22) 68%, rgba(139, 92, 246, 0.22) 100%);

    --btn-primary-bg: linear-gradient(135deg, #1D4ED8 0%, #2563EB 35%, #6366F1 68%, #8B5CF6 100%);
    --btn-primary-text: #FFFFFF;
    --btn-primary-hover: linear-gradient(135deg, #1E40AF 0%, #2563EB 30%, #6366F1 65%, #7C3AED 100%);
    --btn-secondary-bg: rgba(255, 255, 255, 0.05);
    --btn-secondary-text: #F1F5F9;
    --btn-secondary-border: rgba(255, 255, 255, 0.1);
    --btn-outline-bg: transparent;
    --btn-outline-text: #6366F1;
    --btn-outline-border: #6366F1;

    --success: #00E676;
    --success-light: rgba(0, 230, 118, 0.1);
    --warning: #FFD600;
    --warning-light: rgba(255, 214, 0, 0.1);
    --error: #FF1744;
    --error-light: rgba(255, 23, 68, 0.1);
    --info: #448AFF;
    --info-light: rgba(68, 138, 255, 0.1);
  }

  /* ═══════════════════════════════════════════════════════════════════
     ☀️ LIGHT MODE — Clean & Crisp Professional
     ═══════════════════════════════════════════════════════════════════ */
  .admin-dashboard-root[data-theme='light'] {
    --admin-bg-primary: #f8fafc;
    --admin-bg-secondary: #ffffff;
    --admin-bg-tertiary: #f1f5f9;
    --admin-bg-glass: rgba(255, 255, 255, 0.8);
    --admin-bg-hover: rgba(226, 232, 240, 0.5);
    
    --admin-text-primary: #0f172a;
    --admin-text-secondary: #475569;
    --admin-text-accent: #334155;
    --admin-text-muted: #94a3b8;
    
    --admin-accent-primary: #4f46e5;
    --admin-accent-secondary: #9333ea;
    --admin-accent-tertiary: #db2777;
    --admin-accent-cyan: #0891b2;
    --admin-accent-glow: 0 0 15px rgba(79, 70, 229, 0.2);
    
    --admin-status-success: #059669;
    --admin-status-warning: #d97706;
    --admin-status-error: #dc2626;
    --admin-status-info: #2563eb;
    
    --admin-border-subtle: rgba(15, 23, 42, 0.05);
    --admin-border-light: rgba(15, 23, 42, 0.1);
    --admin-border-active: rgba(79, 70, 229, 0.5);

    --admin-glass-panel-bg: rgba(255, 255, 255, 0.6);
    --admin-glass-card-bg: rgba(255, 255, 255, 0.8);

    /* ─── GLOBAL VARIABLE OVERRIDES (isolate from unified-theme.css) ─── */
    --bg-primary: #FAFBFC;
    --bg-secondary: #F1F5F9;
    --bg-card: #FFFFFF;
    --bg-hover: #F1F5F9;
    --bg-accent: #FFF3E0;
    --bg-header: #FFFFFF;
    --bg-footer: #F8FAFC;
    --bg-overlay: rgba(255, 255, 255, 0.95);
    --bg-section-light: #F8FAFC;

    --text-primary: #0F172A;
    --text-secondary: #475569;
    --text-tertiary: #64748B;
    --text-inverse: #FFFFFF;
    --text-muted: #94A3B8;
    --text-on-header: #0F172A;
    --text-link: #2563EB;
    --text-link-hover: #8B5CF6;

    --accent-primary: #2563EB;
    --accent-secondary: #1A237E;
    --accent-dark: #8B5CF6;
    --accent-light: rgba(37, 99, 235, 0.16);

    --border-primary: #E2E8F0;
    --border-secondary: #CBD5E1;
    --border-accent: #2563EB;
    --border-light: #F1F5F9;
    --border-hover: #CBD5E1;

    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.1);
    --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
    --shadow-button: 0 6px 16px rgba(79, 70, 229, 0.22);
    --shadow-hover: 0 4px 16px rgba(0, 0, 0, 0.1);

    --aurora-gradient-soft: linear-gradient(135deg, rgba(29, 78, 216, 0.14) 0%, rgba(37, 99, 235, 0.14) 35%, rgba(99, 102, 241, 0.14) 68%, rgba(139, 92, 246, 0.14) 100%);

    --btn-primary-bg: linear-gradient(135deg, #1D4ED8 0%, #2563EB 35%, #6366F1 68%, #8B5CF6 100%);
    --btn-primary-text: #FFFFFF;
    --btn-primary-hover: linear-gradient(135deg, #1E40AF 0%, #2563EB 30%, #6366F1 65%, #7C3AED 100%);
    --btn-secondary-bg: #FFFFFF;
    --btn-secondary-text: #0F172A;
    --btn-secondary-border: #E2E8F0;
    --btn-outline-bg: transparent;
    --btn-outline-text: #2563EB;
    --btn-outline-border: #2563EB;

    --success: #00C853;
    --success-light: #E8F5E9;
    --warning: #FFD600;
    --warning-light: #FFFDE7;
    --error: #FF1744;
    --error-light: #FFEBEE;
    --info: #2979FF;
    --info-light: #E3F2FD;
  }

  /* ═══════════════════════════════════════════════════════════════════
     🛡️ NUCLEAR ISOLATION SHIELD 🛡️
     
     unified-theme.css uses extremely aggressive selectors like:
       p, span, h1-h6, td, th { color: var(--text-primary) !important }
       div[class*="Container"] { background-color: var(--bg-card) !important }
       section { background-color: var(--bg-section-light) !important }
       input, textarea, select { background: var(--aurora-gradient-soft) }
     
     Since we override --text-primary, --bg-card etc. LOCALLY on
     .admin-dashboard-root, those !important rules now READ OUR VALUES
     instead of the global ones. But some selectors are scoped to
     html[data-theme="light/dark"] which has higher specificity than
     our local variable declarations. The rules below neutralize those.
     ═══════════════════════════════════════════════════════════════════ */

  /* ─── TEXT: Override global html[data-theme] !important text rules ─── */
  .admin-dashboard-root p,
  .admin-dashboard-root span,
  .admin-dashboard-root h1,
  .admin-dashboard-root h2,
  .admin-dashboard-root h3,
  .admin-dashboard-root h4,
  .admin-dashboard-root h5,
  .admin-dashboard-root h6,
  .admin-dashboard-root label,
  .admin-dashboard-root li,
  .admin-dashboard-root td,
  .admin-dashboard-root th,
  .admin-dashboard-root div,
  .admin-dashboard-root section,
  .admin-dashboard-root article,
  .admin-dashboard-root aside {
    color: inherit !important;
  }

  /* ─── BACKGROUNDS: Override global container/section bg rules ─── */
  .admin-dashboard-root div[class*="Container"],
  .admin-dashboard-root div[class*="Section"],
  .admin-dashboard-root div[class*="Card"],
  .admin-dashboard-root section[class*="Container"],
  .admin-dashboard-root section[class*="Section"],
  .admin-dashboard-root section {
    background-color: inherit !important;
    border-color: inherit !important;
  }

  /* Override the section-light bg that unified-theme applies via html[data-theme] */
  html[data-theme="light"] .admin-dashboard-root section,
  html[data-theme="light"] .admin-dashboard-root div[class*="Section"],
  html[data-theme="light"] .admin-dashboard-root div[class*="Container"],
  html[data-theme="light"] .admin-dashboard-root [class*="SectionContainer"],
  html[data-theme="light"] .admin-dashboard-root [class^="sc-"] section,
  html[data-theme="light"] .admin-dashboard-root [class^="sc-"]:has(> section) {
    background-color: inherit !important;
    box-shadow: inherit !important;
  }

  html[data-theme="dark"] .admin-dashboard-root section,
  html[data-theme="dark"] .admin-dashboard-root div[class*="Section"],
  html[data-theme="dark"] .admin-dashboard-root div[class*="Container"],
  html[data-theme="dark"] .admin-dashboard-root [class*="SectionContainer"],
  html[data-theme="dark"] .admin-dashboard-root [class^="sc-"] section,
  html[data-theme="dark"] .admin-dashboard-root [class^="sc-"]:has(> section) {
    background-color: inherit !important;
    box-shadow: inherit !important;
  }

  /* ─── INPUTS/FORMS: Override global aurora-gradient-soft ─── */
  .admin-dashboard-root input,
  .admin-dashboard-root textarea,
  .admin-dashboard-root select {
    background: inherit !important;
    color: inherit !important;
    border-color: inherit !important;
  }

  /* ─── LINKS: Override global link color rules ─── */
  .admin-dashboard-root a {
    color: inherit !important;
  }

  /* ─── HEADERS/FOOTERS: Override global header/footer rules ─── */
  .admin-dashboard-root [class*="Header"],
  .admin-dashboard-root [class*="Footer"],
  .admin-dashboard-root header,
  .admin-dashboard-root footer {
    background-color: inherit !important;
    color: inherit !important;
    border-color: inherit !important;
  }

  /* ─── BUTTONS: Ensure admin buttons use local vars ─── */
  .admin-dashboard-root button {
    color: inherit;
  }

  /* ─── CARD/CONTAINER: Override .card, .container class rules ─── */
  .admin-dashboard-root .card,
  .admin-dashboard-root .container,
  .admin-dashboard-root .paper {
    background: inherit !important;
    border-color: inherit !important;
    color: inherit !important;
  }

  /* ─── DROPDOWNS: Global dropdown overrides use !important ─── */
  .admin-dashboard-root [role="listbox"],
  .admin-dashboard-root [role="menu"],
  .admin-dashboard-root .dropdown,
  .admin-dashboard-root [class*="Dropdown"],
  .admin-dashboard-root [class*="dropdown"] {
    background: inherit !important;
    border-color: inherit !important;
  }

  /* ─── DIVIDERS: Override global border-color rules ─── */
  .admin-dashboard-root hr,
  .admin-dashboard-root .divider,
  .admin-dashboard-root .separator {
    border-color: var(--admin-border-subtle) !important;
    background-color: var(--admin-border-subtle) !important;
  }

  /* ─── GLOBAL TRANSITION OVERRIDE ─── */
  /* unified-theme sets * { transition-property: background-color, color, border-color }
     which can cause unwanted flickering. We keep it but ensure duration is smooth. */
  .admin-dashboard-root * {
    transition-duration: 0.25s;
    transition-timing-function: ease;
  }

  /* ─── ROOT BACKGROUND ENFORCEMENT ─── */
  .admin-dashboard-root {
    background-color: var(--admin-bg-primary) !important;
    color: var(--admin-text-primary) !important;
  }
`;

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load preference from local storage
    const savedMode = localStorage.getItem('koli_admin_theme') as ThemeMode;
    if (savedMode === 'light' || savedMode === 'dark') {
      setMode(savedMode);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    localStorage.setItem('koli_admin_theme', newMode);
  };

  if (!mounted) return null;

  return (
    <AdminThemeContext.Provider value={{ mode, toggleTheme }}>
      <GlobalAdminThemeStyle $mode={mode} />
      <div className="admin-dashboard-root" data-theme={mode} style={{
        height: '100%',
        width: '100%',
        background: 'var(--admin-bg-primary)',
        color: 'var(--admin-text-primary)'
      }}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
};

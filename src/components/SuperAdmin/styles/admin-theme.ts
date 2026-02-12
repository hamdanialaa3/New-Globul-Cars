// src/components/SuperAdmin/styles/admin-theme.ts

export const adminTheme = {
    colors: {
        // Backgrounds - Deep Space
        bg: {
            primary: '#030712',   // Deepest black-blue
            secondary: '#0f172a', // Slate 900
            tertiary: '#1e293b',  // Slate 800
            glass: 'rgba(15, 23, 42, 0.7)', // For glassmorphism
            hover: 'rgba(30, 41, 59, 0.5)',
        },
        // Text
        text: {
            primary: '#f8fafc',   // Slate 50
            secondary: '#94a3b8', // Slate 400
            accent: '#e2e8f0',    // Slate 200
            muted: '#64748b',     // Slate 500
        },
        // Accents - Neon Nebula
        accent: {
            primary: '#6366f1',   // Indigo 500
            secondary: '#a855f7', // Purple 500
            tertiary: '#ec4899',  // Pink 500
            cyan: '#06b6d4',      // Cyan 500
            gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            glow: '0 0 20px rgba(99, 102, 241, 0.5)',
        },
        // Status
        status: {
            success: '#10b981',   // Emerald 500
            warning: '#f59e0b',   // Amber 500
            error: '#ef4444',     // Red 500
            info: '#3b82f6',      // Blue 500
        },
        // Borders
        border: {
            subtle: 'rgba(148, 163, 184, 0.1)',
            light: 'rgba(148, 163, 184, 0.2)',
            active: 'rgba(99, 102, 241, 0.5)',
        }
    },
    typography: {
        fontFamily: {
            sans: '"Inter", -apple-system, system-ui, sans-serif',
            mono: '"JetBrains Mono", "Fira Code", monospace',
        },
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
        }
    },
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        glow: '0 0 15px rgba(99, 102, 241, 0.3)',
        neon: '0 0 5px #6366f1, 0 0 10px #6366f1, 0 0 20px #6366f1',
    },
    glass: {
        panel: `
      background: rgba(30, 41, 59, 0.4);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    `,
        card: `
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(148, 163, 184, 0.08);
    `,
    },
    layout: {
        sidebarWidth: '260px',
        headerHeight: '70px',
    }
};

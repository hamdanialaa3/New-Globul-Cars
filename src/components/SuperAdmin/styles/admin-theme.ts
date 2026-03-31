// src/components/SuperAdmin/styles/admin-theme.ts

export const adminTheme = {
    colors: {
        // Backgrounds - Dynamic via CSS Variables
        bg: {
            primary: 'var(--admin-bg-primary)',
            secondary: 'var(--admin-bg-secondary)',
            tertiary: 'var(--admin-bg-tertiary)',
            glass: 'var(--admin-bg-glass)',
            hover: 'var(--admin-bg-hover)',
        },
        // Text
        text: {
            primary: 'var(--admin-text-primary)',
            secondary: 'var(--admin-text-secondary)',
            accent: 'var(--admin-text-accent)',
            muted: 'var(--admin-text-muted)',
        },
        // Accents
        accent: {
            primary: 'var(--admin-accent-primary)',
            secondary: 'var(--admin-accent-secondary)',
            tertiary: 'var(--admin-accent-tertiary)',
            cyan: 'var(--admin-accent-cyan)',
            gradient: 'linear-gradient(135deg, var(--admin-accent-primary) 0%, var(--admin-accent-secondary) 100%)',
            glow: 'var(--admin-accent-glow)',
        },
        // Status
        status: {
            success: 'var(--admin-status-success)',
            warning: 'var(--admin-status-warning)',
            error: 'var(--admin-status-error)',
            info: 'var(--admin-status-info)',
        },
        // Borders
        border: {
            subtle: 'var(--admin-border-subtle)',
            light: 'var(--admin-border-light)',
            active: 'var(--admin-border-active)',
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
        glow: 'var(--admin-accent-glow)',
        neon: 'var(--admin-accent-glow)',
    },
    glass: {
        panel: `
      background: var(--admin-glass-panel-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--admin-border-subtle);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    `,
        card: `
      background: var(--admin-glass-card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--admin-border-light);
    `,
    },
    layout: {
        sidebarWidth: '260px',
        headerHeight: '70px',
    }
};

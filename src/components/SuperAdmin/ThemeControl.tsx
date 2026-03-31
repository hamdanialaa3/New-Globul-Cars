import React, { useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import styled from 'styled-components';
import {
  Palette,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import { siteSettingsService } from '@/services/site-settings.service';
import type { ThemeSettings } from '@/services/site-settings-types';
import { DEFAULT_THEME_SETTINGS } from '@/services/site-settings-defaults';

const Container = styled.div`
  background: var(--admin-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--admin-border-subtle);
  padding: 24px;
  margin: 20px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #8B5CF6;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--admin-text-secondary);
  margin: 0;
`;

const Section = styled.div`
  margin-bottom: 32px;
  background: #1a1f2e;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #2d3748;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #e5e7eb;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #374151;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ColorItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ColorLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: #e5e7eb;
  text-transform: capitalize;
`;

const ColorInput = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ColorPicker = styled.input`
  width: 60px;
  height: 40px;
  border: 2px solid #374151;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
  }

  &:focus {
    outline: none;
    border-color: #8B5CF6;
  }
`;

const ColorText = styled.input`
  flex: 1;
  background: var(--admin-bg-secondary);
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 8px 12px;
  color: #e5e7eb;
  font-size: 13px;
  font-family: 'Courier New', monospace;

  &:focus {
    outline: none;
    border-color: #8B5CF6;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ColorPreview = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background-color: ${props => props.$color};
  border: 2px solid #374151;
`;

const InputField = styled.input`
  background: var(--admin-bg-secondary);
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 10px 12px;
  color: #e5e7eb;
  font-size: 13px;
  width: 100%;
  margin-top: 8px;

  &:focus {
    outline: none;
    border-color: #8B5CF6;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LogoItem = styled.div`
  margin-bottom: 16px;
`;

const LogoLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #e5e7eb;
  margin-bottom: 8px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #2d3748;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => {
    if (props.$variant === 'danger') {
      return `
        background: #ef4444;
        color: var(--admin-text-primary);
        &:hover {
          background: #dc2626;
        }
      `;
    }
    if (props.$variant === 'secondary') {
      return `
        background: #374151;
        color: #e5e7eb;
        &:hover {
          background: #4b5563;
        }
      `;
    }
    return `
      background: #8B5CF6;
      color: #0f1419;
      &:hover {
        background: #ff7a47;
      }
    `;
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.$type === 'success' ? `
    background: #064e3b;
    color: #6ee7b7;
    border: 1px solid #047857;
  ` : `
    background: #7f1d1d;
    color: #fca5a5;
    border: 1px solid #b91c1c;
  `}
`;

const PreviewSection = styled.div`
  background: var(--admin-bg-secondary);
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 20px;
  margin-top: 16px;
`;

const PreviewTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--admin-text-secondary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`;

const PreviewBox = styled.div<{ $bg: string }>`
  background: ${props => props.$bg};
  padding: 16px;
  border-radius: 6px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: var(--admin-text-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ThemeControl: React.FC = () => {
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const adminEmail = getAuth().currentUser?.email || 'unknown';

const loadTheme = useCallback(async () => {
    try {
      setLoading(true);
      const data = await siteSettingsService.getThemeSettings();
      setTheme(data);
    } catch (error) {
      showMessage('error', 'Failed to load theme settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await siteSettingsService.updateThemeSettings(theme, adminEmail);
      showMessage('success', '✅ Theme settings saved successfully');
    } catch (error) {
      showMessage('error', '❌ Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('⚠️ Are you sure you want to reset the theme to defaults?')) {
      return;
    }
    try {
      setSaving(true);
      await siteSettingsService.updateThemeSettings(DEFAULT_THEME_SETTINGS, adminEmail);
      setTheme(DEFAULT_THEME_SETTINGS);
      showMessage('success', '✅ Theme has been reset');
    } catch (error) {
      showMessage('error', '❌ Failed to reset');
    } finally {
      setSaving(false);
    }
  };

  const updateColor = (key: keyof ThemeSettings['colors'], value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value
      }
    }));
  };

  const updateLogo = (mode: 'lightMode' | 'darkMode', value: string) => {
    setTheme(prev => ({
      ...prev,
      logo: {
        ...prev.logo,
        [mode]: value
      }
    }));
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title><Palette size={24} /> Loading...</Title>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Palette size={24} />
          Theme Customization
        </Title>
        <Subtitle>
          Control colors, logo, and platform branding
        </Subtitle>
      </Header>

      {message && (
        <Message $type={message.type}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </Message>
      )}

      {/* ═══ Brand Colors ═══ */}
      <Section>
        <SectionTitle>
          <Palette size={18} />
          Brand Colors
        </SectionTitle>

        <ColorGrid>
          {Object.entries(theme.colors).map(([key, value]) => (
            <ColorItem key={key}>
              <ColorLabel>{key}</ColorLabel>
              <ColorInput>
                <ColorPicker
                  type="color"
                  value={value}
                  onChange={(e) => updateColor(key as keyof ThemeSettings['colors'], e.target.value)}
                  disabled={saving}
                />
                <ColorText
                  type="text"
                  value={value}
                  onChange={(e) => updateColor(key as keyof ThemeSettings['colors'], e.target.value)}
                  disabled={saving}
                  placeholder="#000000"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
                <ColorPreview $color={value} />
              </ColorInput>
            </ColorItem>
          ))}
        </ColorGrid>

        {/* Live Preview */}
        <PreviewSection>
          <PreviewTitle>
            <Eye size={14} />
            Live Preview
          </PreviewTitle>
          <PreviewGrid>
            <PreviewBox $bg={theme.colors.primary}>Primary</PreviewBox>
            <PreviewBox $bg={theme.colors.secondary}>Secondary</PreviewBox>
            <PreviewBox $bg={theme.colors.accent}>Accent</PreviewBox>
            <PreviewBox $bg={theme.colors.success}>Success</PreviewBox>
            <PreviewBox $bg={theme.colors.warning}>Warning</PreviewBox>
            <PreviewBox $bg={theme.colors.error}>Error</PreviewBox>
          </PreviewGrid>
        </PreviewSection>
      </Section>

      {/* ═══ Logos ═══ */}
      <Section>
        <SectionTitle>
          <ImageIcon size={18} />
          Logos & Icons
        </SectionTitle>

        <LogoItem>
          <LogoLabel>Light Mode Logo</LogoLabel>
          <InputField
            type="text"
            value={theme.logo.lightMode}
            onChange={(e) => updateLogo('lightMode', e.target.value)}
            disabled={saving}
            placeholder="/logo-light.svg"
          />
        </LogoItem>

        <LogoItem>
          <LogoLabel>Dark Mode Logo</LogoLabel>
          <InputField
            type="text"
            value={theme.logo.darkMode}
            onChange={(e) => updateLogo('darkMode', e.target.value)}
            disabled={saving}
            placeholder="/logo-dark.svg"
          />
        </LogoItem>

        <LogoItem>
          <LogoLabel>Favicon (Browser Icon)</LogoLabel>
          <InputField
            type="text"
            value={theme.favicon}
            onChange={(e) => setTheme(prev => ({ ...prev, favicon: e.target.value }))}
            disabled={saving}
            placeholder="/favicon.ico"
          />
        </LogoItem>
      </Section>

      {/* ═══ Action Buttons ═══ */}
      <ActionButtons>
        <Button
          $variant="primary"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>

        <Button
          $variant="secondary"
          onClick={loadTheme}
          disabled={saving}
        >
          <RefreshCw size={16} />
          Refresh
        </Button>

        <Button
          $variant="danger"
          onClick={handleReset}
          disabled={saving}
        >
          <AlertCircle size={16} />
          Reset
        </Button>
      </ActionButtons>
    </Container>
  );
};

export default ThemeControl;


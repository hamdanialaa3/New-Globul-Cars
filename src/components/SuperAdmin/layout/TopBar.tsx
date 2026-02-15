// src/components/SuperAdmin/layout/TopBar.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminTheme } from '../styles/admin-theme';
import { Search, Bell, HelpCircle, Loader2 } from 'lucide-react';
import AdminLanguageSwitcher from './AdminLanguageSwitcher';
import { useAdminLang } from '../../../contexts/AdminLanguageContext';
import { siteSettingsService } from '../../../services/site-settings.service';

const TopBarContainer = styled.header`
  height: ${adminTheme.layout.headerHeight};
  background: ${adminTheme.colors.bg.primary};
  border-bottom: 1px solid ${adminTheme.colors.border.subtle};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 40;
  
  /* Glass effect for content scrolling under */
  backdrop-filter: blur(10px);
  background: rgba(3, 7, 18, 0.8);
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 400px;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${adminTheme.colors.text.muted};
    width: 18px;
    height: 18px;
    
    [dir="rtl"] & {
      left: auto;
      right: 12px;
    }
  }
`;

const SearchInput = styled.input`
  width: 100%;
  background: ${adminTheme.colors.bg.tertiary};
  border: 1px solid ${adminTheme.colors.border.subtle};
  border-radius: 8px;
  padding: 10px 12px 10px 40px;
  color: ${adminTheme.colors.text.primary};
  font-size: 0.9rem;
  transition: all 0.2s ease;

  [dir="rtl"] & {
    padding: 10px 40px 10px 12px;
  }

  &::placeholder {
    color: ${adminTheme.colors.text.muted};
  }

  &:focus {
    outline: none;
    border-color: ${adminTheme.colors.accent.primary};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    background: ${adminTheme.colors.bg.secondary};
  }
`;

const ActionsArea = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: ${adminTheme.colors.text.secondary};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: ${adminTheme.colors.text.primary};
  }

  &.has-badge::after {
    content: '';
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: ${adminTheme.colors.status.error};
    border-radius: 50%;
    border: 2px solid ${adminTheme.colors.bg.primary};
    
    [dir="rtl"] & {
        right: auto;
        left: 8px;
    }
  }
`;

const ToggleContainer = styled.button<{ $mode: 'free' | 'paid' }>`
  display: flex;
  align-items: center;
  background: ${props => props.$mode === 'free' ? '#10b981' : '#6366f1'};
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 140px;
  height: 36px;
  margin-right: 16px;
  
  [dir="rtl"] & {
    margin-right: 0;
    margin-left: 16px;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
`;

const ToggleLabel = styled.span<{ $active: boolean }>`
  flex: 1;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 800;
  color: ${props => props.$active ? '#fff' : 'rgba(255,255,255,0.4)'};
  z-index: 2;
  transition: color 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const ToggleSlider = styled.div<{ $mode: 'free' | 'paid' }>`
  position: absolute;
  top: 4px;
  left: ${props => props.$mode === 'free' ? '4px' : 'calc(50% + 2px)'};
  width: calc(50% - 6px);
  height: calc(100% - 8px);
  background: rgba(0,0,0,0.25);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 1;

  [dir="rtl"] & {
    left: auto;
    right: ${props => props.$mode === 'free' ? '4px' : 'calc(50% + 2px)'};
  }
`;

const TopBar: React.FC = () => {
  const { t } = useAdminLang();
  const [subscriptionMode, setSubscriptionMode] = useState<'free' | 'paid'>('paid');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = siteSettingsService.subscribeSiteSettings((settings) => {
      // @ts-ignore - Handle missing field locally if not yet updated in types
      if (settings.pricing?.subscriptionMode) {
        // @ts-ignore
        setSubscriptionMode(settings.pricing.subscriptionMode);
      }
    });
    return unsubscribe;
  }, []);

  const handleToggleMode = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const newMode = subscriptionMode === 'free' ? 'paid' : 'free';
      const currentSettings = await siteSettingsService.getSiteSettings();

      await siteSettingsService.updateSiteSettings({
        pricing: {
          ...currentSettings.pricing,
          // @ts-ignore
          subscriptionMode: newMode
        }
      }, 'admin-toggle');

      // State updates automatically via subscription
    } catch (e) {
      logger.error('Failed to toggle subscription mode', e as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TopBarContainer>
      <SearchWrapper>
        <Search />
        <SearchInput placeholder={t.common.search} />
      </SearchWrapper>

      <ActionsArea>
        {/* Subscription Mode Toggle */}
        <ToggleContainer onClick={handleToggleMode} $mode={subscriptionMode} disabled={loading}>
          <ToggleSlider $mode={subscriptionMode} />
          <ToggleLabel $active={subscriptionMode === 'free'}>
            {loading ? <Loader2 size={12} className="animate-spin" /> : null}
            {t.common.free || 'Free'}
          </ToggleLabel>
          <ToggleLabel $active={subscriptionMode === 'paid'}>
            {t.common.paid || 'Paid'}
          </ToggleLabel>
        </ToggleContainer>

        <AdminLanguageSwitcher />

        <ActionButton>
          <HelpCircle size={20} />
        </ActionButton>

        <ActionButton className="has-badge">
          <Bell size={20} />
        </ActionButton>
      </ActionsArea>
      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </TopBarContainer>
  );
};

export default TopBar;

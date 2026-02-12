// src/pages/AdminPage/SettingsPanel.tsx
// Admin settings panel — Reads/writes via SiteSettingsService

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { siteSettingsService } from '@/services/site-settings.service';
import type { SiteSettings } from '@/services/site-settings-types';
import { serviceLogger } from '@/services/logger-service';

const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 2rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1a1a2e;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
`;

const Label = styled.span`
  font-size: 0.9rem;
  color: #4b5563;
`;

const Toggle = styled.button<{ $active: boolean }>`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: ${({ $active }) => $active ? '#22c55e' : '#d1d5db'};
  position: relative;
  cursor: pointer;
  transition: background 0.2s;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $active }) => $active ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s;
  }
`;

const SaveButton = styled.button`
  margin-top: 1.5rem;
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusMsg = styled.p<{ $error?: boolean }>`
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: ${({ $error }) => $error ? '#dc2626' : '#16a34a'};
  text-align: center;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

const SettingsPanel: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ msg: string; error?: boolean } | null>(null);

  useEffect(() => {
    let isActive = true;
    siteSettingsService.getSiteSettings().then((data) => {
      if (isActive) {
        setSettings(data);
        setLoading(false);
      }
    }).catch(() => {
      if (isActive) setLoading(false);
    });
    return () => { isActive = false; };
  }, []);

  const toggle = (path: string) => {
    if (!settings) return;
    setSettings(prev => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev)) as SiteSettings;
      const keys = path.split('.');
      let obj: Record<string, unknown> = copy as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]] as Record<string, unknown>;
      }
      obj[keys[keys.length - 1]] = !obj[keys[keys.length - 1]];
      return copy;
    });
    setStatus(null);
  };

  const handleSave = async () => {
    if (!settings || !user) return;
    setSaving(true);
    setStatus(null);
    try {
      await siteSettingsService.updateSiteSettings(settings, user.uid);
      setStatus({ msg: language === 'bg' ? 'Настройките са запазени' : 'Settings saved successfully' });
    } catch (err) {
      serviceLogger.error('SettingsPanel', 'Save failed', err);
      setStatus({ msg: language === 'bg' ? 'Грешка при запазване' : 'Failed to save settings', error: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</LoadingState>;
  }

  if (!settings) {
    return <Container><p>{language === 'bg' ? 'Грешка при зареждане' : 'Failed to load settings'}</p></Container>;
  }

  const t = (bg: string, en: string) => language === 'bg' ? bg : en;

  return (
    <Container>
      <Title>{t('Настройки на сайта', 'Site Settings')}</Title>

      <SectionTitle>{t('Статус на платформата', 'Platform Status')}</SectionTitle>
      <Row>
        <Label>{t('Режим на поддръжка', 'Maintenance Mode')}</Label>
        <Toggle $active={settings.maintenanceMode} onClick={() => toggle('maintenanceMode')} />
      </Row>
      <Row>
        <Label>{t('Регистрация', 'Registration')}</Label>
        <Toggle $active={settings.registrationEnabled} onClick={() => toggle('registrationEnabled')} />
      </Row>
      <Row>
        <Label>{t('Верификация на имейл', 'Email Verification Required')}</Label>
        <Toggle $active={settings.requireEmailVerification} onClick={() => toggle('requireEmailVerification')} />
      </Row>

      <SectionTitle>{t('Функции', 'Features')}</SectionTitle>
      <Row>
        <Label>{t('Съобщения', 'Messaging')}</Label>
        <Toggle $active={settings.features.messaging} onClick={() => toggle('features.messaging')} />
      </Row>
      <Row>
        <Label>{t('Отзиви', 'Reviews')}</Label>
        <Toggle $active={settings.features.reviews} onClick={() => toggle('features.reviews')} />
      </Row>
      <Row>
        <Label>{t('AI анализ', 'AI Analysis')}</Label>
        <Toggle $active={settings.features.aiAnalysis} onClick={() => toggle('features.aiAnalysis')} />
      </Row>
      <Row>
        <Label>{t('Ценови оценки', 'Price Estimator')}</Label>
        <Toggle $active={settings.features.priceEstimator} onClick={() => toggle('features.priceEstimator')} />
      </Row>
      <Row>
        <Label>{t('Любими', 'Favorites')}</Label>
        <Toggle $active={settings.features.favorites} onClick={() => toggle('features.favorites')} />
      </Row>
      <Row>
        <Label>{t('Сравнения', 'Comparisons')}</Label>
        <Toggle $active={settings.features.comparisons} onClick={() => toggle('features.comparisons')} />
      </Row>
      <Row>
        <Label>{t('Ценови известия', 'Price Alerts')}</Label>
        <Toggle $active={settings.features.priceAlerts} onClick={() => toggle('features.priceAlerts')} />
      </Row>

      <SectionTitle>{t('Обяви', 'Listings')}</SectionTitle>
      <Row>
        <Label>{t('Одобрение от админ', 'Admin Approval Required')}</Label>
        <Toggle $active={settings.listingLimits.requireAdminApproval} onClick={() => toggle('listingLimits.requireAdminApproval')} />
      </Row>

      <SaveButton onClick={handleSave} disabled={saving}>
        {saving
          ? t('Запазване...', 'Saving...')
          : t('Запази настройки', 'Save Settings')}
      </SaveButton>

      {status && <StatusMsg $error={status.error}>{status.msg}</StatusMsg>}
    </Container>
  );
};

export default SettingsPanel;
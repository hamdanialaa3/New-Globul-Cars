// Smart Alert Creator Component - مكون إنشاء التنبيهات الذكية
import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { smartAlertsService, SearchCriteria, NotificationChannel } from '../../services/advanced/smart-alerts.service';
import { logger } from '../../services/logger-service';

interface SmartAlertCreatorProps {
  initialCriteria?: Partial<SearchCriteria>;
  onCreated?: (alertId: string) => void;
  onCancel?: () => void;
}

export const SmartAlertCreator: React.FC<SmartAlertCreatorProps> = ({
  initialCriteria = {},
  onCreated,
  onCancel
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [criteria, setCriteria] = useState<SearchCriteria>(initialCriteria);
  const [channels, setChannels] = useState<NotificationChannel[]>(['inApp']);
  const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>('daily');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle create alert
   */
  const handleCreate = async () => {
    if (!user) {
      setError(t('alerts.loginRequired'));
      return;
    }

    if (!name.trim()) {
      setError(t('alerts.nameRequired'));
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const alertId = await smartAlertsService.createAlert({
        userId: user.uid,
        name: name.trim(),
        criteria,
        notificationChannels: channels,
        frequency,
        isActive: true
      });

      logger.info('Alert created', { alertId });

      if (onCreated) {
        onCreated(alertId);
      }

    } catch (err) {
      logger.error('Failed to create alert', err as Error);
      setError(t('alerts.createFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Update criteria field
   */
  const updateCriteria = <K extends keyof SearchCriteria>(
    key: K,
    value: SearchCriteria[K]
  ) => {
    setCriteria(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Toggle notification channel
   */
  const toggleChannel = (channel: NotificationChannel) => {
    setChannels(prev => 
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  return (
    <S.Container>
      <S.Header>
        <S.Title>{t('alerts.createAlert')}</S.Title>
        <S.Subtitle>{t('alerts.createSubtitle')}</S.Subtitle>
      </S.Header>

      <S.Form>
        {/* Alert Name */}
        <S.Section>
          <S.Label>{t('alerts.alertName')}</S.Label>
          <S.Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('alerts.namePlaceholder')}
            maxLength={50}
          />
        </S.Section>

        {/* Search Criteria */}
        <S.Section>
          <S.SectionTitle>{t('alerts.searchCriteria')}</S.SectionTitle>

          <S.Row>
            <S.Field>
              <S.Label>{t('common.make')}</S.Label>
              <S.Input
                type="text"
                value={criteria.make || ''}
                onChange={(e) => updateCriteria('make', e.target.value)}
                placeholder={t('common.anyMake')}
              />
            </S.Field>

            <S.Field>
              <S.Label>{t('common.model')}</S.Label>
              <S.Input
                type="text"
                value={criteria.model || ''}
                onChange={(e) => updateCriteria('model', e.target.value)}
                placeholder={t('common.anyModel')}
              />
            </S.Field>
          </S.Row>

          <S.Row>
            <S.Field>
              <S.Label>{t('common.yearFrom')}</S.Label>
              <S.Input
                type="number"
                value={criteria.yearFrom || ''}
                onChange={(e) => updateCriteria('yearFrom', parseInt(e.target.value))}
                placeholder="2000"
                min="1980"
                max={new Date().getFullYear() + 1}
              />
            </S.Field>

            <S.Field>
              <S.Label>{t('common.yearTo')}</S.Label>
              <S.Input
                type="number"
                value={criteria.yearTo || ''}
                onChange={(e) => updateCriteria('yearTo', parseInt(e.target.value))}
                placeholder={String(new Date().getFullYear())}
                min="1980"
                max={new Date().getFullYear() + 1}
              />
            </S.Field>
          </S.Row>

          <S.Row>
            <S.Field>
              <S.Label>{t('common.priceFrom')}</S.Label>
              <S.Input
                type="number"
                value={criteria.priceFrom || ''}
                onChange={(e) => updateCriteria('priceFrom', parseFloat(e.target.value))}
                placeholder="0"
                min="0"
                step="1000"
              />
            </S.Field>

            <S.Field>
              <S.Label>{t('common.priceTo')}</S.Label>
              <S.Input
                type="number"
                value={criteria.priceTo || ''}
                onChange={(e) => updateCriteria('priceTo', parseFloat(e.target.value))}
                placeholder="100000"
                min="0"
                step="1000"
              />
            </S.Field>
          </S.Row>

          <S.Row>
            <S.Field>
              <S.Label>{t('common.fuelType')}</S.Label>
              <S.Select
                value={criteria.fuelType || ''}
                onChange={(e) => updateCriteria('fuelType', e.target.value)}
              >
                <option value="">{t('common.anyFuel')}</option>
                <option value="petrol">{t('fuel.petrol')}</option>
                <option value="diesel">{t('fuel.diesel')}</option>
                <option value="lpg">{t('fuel.lpg')}</option>
                <option value="electric">{t('fuel.electric')}</option>
                <option value="hybrid">{t('fuel.hybrid')}</option>
              </S.Select>
            </S.Field>

            <S.Field>
              <S.Label>{t('common.transmission')}</S.Label>
              <S.Select
                value={criteria.transmission || ''}
                onChange={(e) => updateCriteria('transmission', e.target.value)}
              >
                <option value="">{t('common.anyTransmission')}</option>
                <option value="manual">{t('transmission.manual')}</option>
                <option value="automatic">{t('transmission.automatic')}</option>
              </S.Select>
            </S.Field>
          </S.Row>

          {/* Advanced Criteria */}
          <S.AdvancedSection>
            <S.SectionTitle>{t('alerts.advancedCriteria')}</S.SectionTitle>

            <S.Field>
              <S.Label>{t('alerts.minDealRating')}</S.Label>
              <S.Select
                value={criteria.dealRating || ''}
                onChange={(e) => updateCriteria('dealRating', e.target.value as any)}
              >
                <option value="">{t('alerts.anyRating')}</option>
                <option value="good">{t('dealRating.good')} (55+)</option>
                <option value="great">{t('dealRating.great')} (70+)</option>
                <option value="excellent">{t('dealRating.excellent')} (85+)</option>
              </S.Select>
              <S.Hint>{t('alerts.dealRatingHint')}</S.Hint>
            </S.Field>

            <S.Field>
              <S.Label>{t('alerts.priceDropAlert')}</S.Label>
              <S.Input
                type="number"
                value={criteria.priceDropPercentage || ''}
                onChange={(e) => updateCriteria('priceDropPercentage', parseFloat(e.target.value))}
                placeholder="5"
                min="1"
                max="50"
                step="1"
              />
              <S.Hint>{t('alerts.priceDropHint')}</S.Hint>
            </S.Field>
          </S.AdvancedSection>
        </S.Section>

        {/* Notification Settings */}
        <S.Section>
          <S.SectionTitle>{t('alerts.notificationSettings')}</S.SectionTitle>

          <S.Label>{t('alerts.notifyVia')}</S.Label>
          <S.CheckboxGroup>
            <S.CheckboxLabel>
              <S.Checkbox
                type="checkbox"
                checked={channels.includes('inApp')}
                onChange={() => toggleChannel('inApp')}
              />
              <S.Icon>🔔</S.Icon>
              {t('alerts.inApp')}
            </S.CheckboxLabel>

            <S.CheckboxLabel>
              <S.Checkbox
                type="checkbox"
                checked={channels.includes('email')}
                onChange={() => toggleChannel('email')}
              />
              <S.Icon>📧</S.Icon>
              {t('alerts.email')}
            </S.CheckboxLabel>

            <S.CheckboxLabel>
              <S.Checkbox
                type="checkbox"
                checked={channels.includes('push')}
                onChange={() => toggleChannel('push')}
              />
              <S.Icon>📱</S.Icon>
              {t('alerts.push')}
            </S.CheckboxLabel>

            <S.CheckboxLabel>
              <S.Checkbox
                type="checkbox"
                checked={channels.includes('sms')}
                onChange={() => toggleChannel('sms')}
              />
              <S.Icon>💬</S.Icon>
              {t('alerts.sms')}
            </S.CheckboxLabel>
          </S.CheckboxGroup>

          <S.Label>{t('alerts.frequency')}</S.Label>
          <S.RadioGroup>
            <S.RadioLabel>
              <S.Radio
                type="radio"
                name="frequency"
                value="instant"
                checked={frequency === 'instant'}
                onChange={(e) => setFrequency(e.target.value as any)}
              />
              {t('alerts.instant')}
            </S.RadioLabel>

            <S.RadioLabel>
              <S.Radio
                type="radio"
                name="frequency"
                value="daily"
                checked={frequency === 'daily'}
                onChange={(e) => setFrequency(e.target.value as any)}
              />
              {t('alerts.daily')}
            </S.RadioLabel>

            <S.RadioLabel>
              <S.Radio
                type="radio"
                name="frequency"
                value="weekly"
                checked={frequency === 'weekly'}
                onChange={(e) => setFrequency(e.target.value as any)}
              />
              {t('alerts.weekly')}
            </S.RadioLabel>
          </S.RadioGroup>
        </S.Section>

        {/* Error */}
        {error && (
          <S.ErrorMessage>
            <S.Icon>⚠️</S.Icon>
            {error}
          </S.ErrorMessage>
        )}

        {/* Actions */}
        <S.Actions>
          {onCancel && (
            <S.CancelButton onClick={onCancel}>
              {t('common.cancel')}
            </S.CancelButton>
          )}

          <S.CreateButton onClick={handleCreate} disabled={isSaving}>
            {isSaving ? (
              <>
                <S.Spinner />
                {t('alerts.creating')}
              </>
            ) : (
              <>
                <S.Icon>✅</S.Icon>
                {t('alerts.createAlert')}
              </>
            )}
          </S.CreateButton>
        </S.Actions>
      </S.Form>
    </S.Container>
  );
};

// Styled Components
namespace S {
  export const Container = styled.div`
    max-width: 800px;
    margin: 0 auto;
  `;

  export const Header = styled.div`
    margin-bottom: 30px;
  `;

  export const Title = styled.h2`
    font-size: 28px;
    color: #333;
    margin-bottom: 10px;
  `;

  export const Subtitle = styled.p`
    font-size: 16px;
    color: #666;
  `;

  export const Form = styled.div`
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  `;

  export const Section = styled.div`
    margin-bottom: 35px;

    &:last-child {
      margin-bottom: 0;
    }
  `;

  export const SectionTitle = styled.h3`
    font-size: 20px;
    color: #333;
    margin-bottom: 20px;
    font-weight: 600;
  `;

  export const Label = styled.label`
    display: block;
    font-size: 14px;
    color: #555;
    margin-bottom: 8px;
    font-weight: 500;
  `;

  export const Input = styled.input`
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 15px;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &::placeholder {
      color: #999;
    }
  `;

  export const Select = styled.select`
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 15px;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  `;

  export const Row = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  `;

  export const Field = styled.div``;

  export const Hint = styled.div`
    font-size: 13px;
    color: #888;
    margin-top: 6px;
  `;

  export const AdvancedSection = styled.div`
    margin-top: 25px;
    padding-top: 25px;
    border-top: 2px dashed #e0e0e0;
  `;

  export const CheckboxGroup = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 25px;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  `;

  export const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }
  `;

  export const Checkbox = styled.input`
    width: 20px;
    height: 20px;
    cursor: pointer;
  `;

  export const RadioGroup = styled.div`
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  `;

  export const RadioLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 15px;
    color: #555;
  `;

  export const Radio = styled.input`
    width: 18px;
    height: 18px;
    cursor: pointer;
  `;

  export const Icon = styled.span`
    font-size: 18px;
  `;

  export const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px 20px;
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 12px;
    color: #c33;
    font-size: 14px;
    margin-bottom: 20px;
  `;

  export const Actions = styled.div`
    display: flex;
    gap: 15px;
    justify-content: flex-end;
    margin-top: 30px;
  `;

  export const CancelButton = styled.button`
    padding: 14px 30px;
    border: 2px solid #ddd;
    border-radius: 12px;
    background: white;
    color: #666;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #999;
      color: #333;
    }
  `;

  export const CreateButton = styled.button`
    padding: 14px 30px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;

  export const Spinner = styled.div`
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
}

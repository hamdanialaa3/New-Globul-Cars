// src/components/messaging/AutoResponderSettings.tsx
// Auto Responder Settings Component
// Connected to Backend P2.1 Auto Responder System

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  getAutoResponderSettings,
  updateAutoResponderSettings,
  AutoResponderSettings as IAutoResponderSettings,
} from '../../services/messaging/cloud-messaging-service';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

const EnableToggle = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const ToggleSwitch = styled.div<{ $enabled?: boolean }>`
  position: relative;
  width: 50px;
  height: 26px;
  background: ${props => props.$enabled ? '#4267b2' : '#ccc'};
  border-radius: 13px;
  transition: background 0.3s;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${props => props.$enabled ? '27px' : '3px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: left 0.3s;
  }
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Section = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionIcon = styled.span`
  font-size: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4267b2;
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const WorkingHoursGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const DayRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
`;

const DayCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  cursor: pointer;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const DayName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const TimeInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const TimeInput = styled.input.attrs({ type: 'time' })`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    border-color: #4267b2;
  }
`;

const TimeLabel = styled.span`
  font-size: 13px;
  color: #666;
`;

const HolidayModeBox = styled.div`
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 16px;
`;

const HolidayCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  cursor: pointer;
`;

const DateInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
`;

const DateInput = styled.input.attrs({ type: 'date' })`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    border-color: #ffc107;
  }
`;

const InstantReplyBox = styled.div`
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 8px;
  padding: 16px;
`;

const InstantCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  cursor: pointer;
`;

const DelayInput = styled.input.attrs({ type: 'number' })`
  width: 100px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const DelayLabel = styled.span`
  font-size: 13px;
  color: #666;
  margin-left: 8px;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #f0f0f0;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => props.$variant === 'primary' ? `
    background: #4267b2;
    color: white;
    &:hover {
      background: #365899;
    }
  ` : `
    background: #f0f0f0;
    color: #666;
    &:hover {
      background: #e0e0e0;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ==================== COMPONENT ====================

interface Props {
  language?: 'bg' | 'en';
}

const AutoResponderSettings: React.FC<Props> = ({ language = 'bg' }) => {
  const [settings, setSettings] = useState<IAutoResponderSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const daysOfWeek = [
    { key: 'monday', label: language === 'bg' ? 'Понеделник' : 'Monday' },
    { key: 'tuesday', label: language === 'bg' ? 'Вторник' : 'Tuesday' },
    { key: 'wednesday', label: language === 'bg' ? 'Сряда' : 'Wednesday' },
    { key: 'thursday', label: language === 'bg' ? 'Четвъртък' : 'Thursday' },
    { key: 'friday', label: language === 'bg' ? 'Петък' : 'Friday' },
    { key: 'saturday', label: language === 'bg' ? 'Събота' : 'Saturday' },
    { key: 'sunday', label: language === 'bg' ? 'Неделя' : 'Sunday' },
  ];

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const result = await getAutoResponderSettings();
      if (result.success && result.settings) {
        setSettings(result.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const result = await updateAutoResponderSettings(settings);
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadSettings();
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</LoadingState>
      </Container>
    );
  }

  if (!settings) {
    return (
      <Container>
        <div>{language === 'bg' ? 'Грешка при зареждане' : 'Error loading settings'}</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>{language === 'bg' ? 'Настройки за Автоматичен Отговор' : 'Auto Responder Settings'}</Title>
        <EnableToggle>
          <ToggleLabel>{language === 'bg' ? 'Активен' : 'Enabled'}</ToggleLabel>
          <ToggleSwitch
            $enabled={settings.enabled}
            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
          />
          <input type="checkbox" checked={settings.enabled} onChange={() => {}} style={{ display: 'none' }} />
        </EnableToggle>
      </Header>

      {showSuccess && (
        <SuccessMessage>
          ✓ {language === 'bg' ? 'Настройките са запазени успешно!' : 'Settings saved successfully!'}
        </SuccessMessage>
      )}

      <Section>
        <SectionTitle>
          <SectionIcon>💬</SectionIcon>
          {language === 'bg' ? 'Съобщение за Автоматичен Отговор' : 'Auto Reply Message'}
        </SectionTitle>
        <FormGroup>
          <Label>{language === 'bg' ? 'Съобщение' : 'Message'}</Label>
          <Textarea
            value={settings.message}
            onChange={(e) => setSettings({ ...settings, message: e.target.value })}
            disabled={!settings.enabled}
            placeholder={language === 'bg' 
              ? 'Благодаря за съобщението! Ще ви отговоря скоро...'
              : 'Thanks for your message! I will reply soon...'}
            maxLength={500}
          />
        </FormGroup>
      </Section>

      <Section>
        <SectionTitle>
          <SectionIcon>🕐</SectionIcon>
          {language === 'bg' ? 'Работни Часове' : 'Working Hours'}
        </SectionTitle>
        <WorkingHoursGrid>
          {daysOfWeek.map(day => (
            <DayRow key={day.key}>
              <DayCheckbox>
                <Checkbox
                  checked={settings.workingHours[day.key]?.enabled || false}
                  onChange={(e) => setSettings({
                    ...settings,
                    workingHours: {
                      ...settings.workingHours,
                      [day.key]: {
                        ...settings.workingHours[day.key],
                        enabled: e.target.checked,
                      }
                    }
                  })}
                  disabled={!settings.enabled}
                />
                <DayName>{day.label}</DayName>
              </DayCheckbox>

              <TimeInputs>
                <TimeLabel>{language === 'bg' ? 'от' : 'from'}</TimeLabel>
                <TimeInput
                  value={settings.workingHours[day.key]?.start || '09:00'}
                  onChange={(e) => setSettings({
                    ...settings,
                    workingHours: {
                      ...settings.workingHours,
                      [day.key]: {
                        ...settings.workingHours[day.key],
                        start: e.target.value,
                      }
                    }
                  })}
                  disabled={!settings.enabled || !settings.workingHours[day.key]?.enabled}
                />

                <TimeLabel>{language === 'bg' ? 'до' : 'to'}</TimeLabel>
                <TimeInput
                  value={settings.workingHours[day.key]?.end || '18:00'}
                  onChange={(e) => setSettings({
                    ...settings,
                    workingHours: {
                      ...settings.workingHours,
                      [day.key]: {
                        ...settings.workingHours[day.key],
                        end: e.target.value,
                      }
                    }
                  })}
                  disabled={!settings.enabled || !settings.workingHours[day.key]?.enabled}
                />
              </TimeInputs>
            </DayRow>
          ))}
        </WorkingHoursGrid>
      </Section>

      <Section>
        <SectionTitle>
          <SectionIcon>🏖️</SectionIcon>
          {language === 'bg' ? 'Режим на Ваканция' : 'Holiday Mode'}
        </SectionTitle>
        <HolidayModeBox>
          <HolidayCheckbox>
            <Checkbox
              checked={settings.holidays?.enabled || false}
              onChange={(e) => setSettings({
                ...settings,
                holidays: {
                  ...settings.holidays,
                  enabled: e.target.checked,
                }
              })}
              disabled={!settings.enabled}
            />
            <span>{language === 'bg' ? 'Активиран режим на ваканция' : 'Enable holiday mode'}</span>
          </HolidayCheckbox>

          <DateInputs>
            <div>
              <Label>{language === 'bg' ? 'От дата' : 'Start Date'}</Label>
              <DateInput
                value={settings.holidays?.startDate || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  holidays: {
                    ...settings.holidays,
                    startDate: e.target.value,
                  }
                })}
                disabled={!settings.enabled || !settings.holidays?.enabled}
              />
            </div>

            <div>
              <Label>{language === 'bg' ? 'До дата' : 'End Date'}</Label>
              <DateInput
                value={settings.holidays?.endDate || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  holidays: {
                    ...settings.holidays,
                    endDate: e.target.value,
                  }
                })}
                disabled={!settings.enabled || !settings.holidays?.enabled}
              />
            </div>
          </DateInputs>

          <FormGroup>
            <Label>{language === 'bg' ? 'Съобщение за ваканция' : 'Holiday Message'}</Label>
            <Textarea
              value={settings.holidays?.message || ''}
              onChange={(e) => setSettings({
                ...settings,
                holidays: {
                  ...settings.holidays,
                  message: e.target.value,
                }
              })}
              disabled={!settings.enabled || !settings.holidays?.enabled}
              placeholder={language === 'bg' 
                ? 'Моментално съм на почивка и ще се върна на...'
                : 'I am currently on vacation and will be back on...'}
              maxLength={300}
            />
          </FormGroup>
        </HolidayModeBox>
      </Section>

      <Section>
        <SectionTitle>
          <SectionIcon>⚡</SectionIcon>
          {language === 'bg' ? 'Моментален Отговор' : 'Instant Reply'}
        </SectionTitle>
        <InstantReplyBox>
          <InstantCheckbox>
            <Checkbox
              checked={settings.instantReply?.enabled || false}
              onChange={(e) => setSettings({
                ...settings,
                instantReply: {
                  ...settings.instantReply,
                  enabled: e.target.checked,
                }
              })}
              disabled={!settings.enabled}
            />
            <span>{language === 'bg' ? 'Активирай моментален отговор' : 'Enable instant reply'}</span>
          </InstantCheckbox>

          <div>
            <Label>{language === 'bg' ? 'Забавяне (секунди)' : 'Delay (seconds)'}</Label>
            <DelayInput
              value={settings.instantReply?.delay || 0}
              onChange={(e) => setSettings({
                ...settings,
                instantReply: {
                  ...settings.instantReply,
                  delay: parseInt(e.target.value) || 0,
                }
              })}
              disabled={!settings.enabled || !settings.instantReply?.enabled}
              min="0"
              max="300"
            />
            <DelayLabel>{language === 'bg' ? '(0-300 секунди)' : '(0-300 seconds)'}</DelayLabel>
          </div>
        </InstantReplyBox>
      </Section>

      <Actions>
        <Button $variant="secondary" onClick={handleReset} disabled={saving}>
          {language === 'bg' ? 'Отмени' : 'Cancel'}
        </Button>
        <Button $variant="primary" onClick={handleSave} disabled={saving}>
          {saving 
            ? (language === 'bg' ? 'Запазване...' : 'Saving...')
            : (language === 'bg' ? 'Запази Промени' : 'Save Changes')
          }
        </Button>
      </Actions>
    </Container>
  );
};

export default AutoResponderSettings;

/**
 * Notification Settings Component
 * Settings modal for notification preferences
 * 
 * Features:
 * - Enable/disable sound toggle
 * - Volume slider
 * - Test sound button
 * - Modal with backdrop
 * - Smooth animations
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  ModernClose,
  ModernVolume,
  ModernVolumeX,
  ModernPlay
} from './icons/ModernIcons';
import { notificationSoundService } from '@/services/messaging/notification-sound.service';
import { useLanguage } from '@/contexts';
import { logger } from '@/services/logger-service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ModalBackdrop = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)')};
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')};
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const SettingItem = styled.div`
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)')};

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: ${({ theme }) => theme.colors.primary.main};
  }

  div {
    flex: 1;

    h4 {
      font-size: 16px;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text.primary};
      margin: 0 0 4px 0;
    }

    p {
      font-size: 14px;
      color: ${({ theme }) => theme.colors.text.secondary};
      margin: 0;
      line-height: 1.5;
    }
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background: ${({ theme }) => theme.colors.primary.main};
  }

  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => (theme.mode === 'dark' ? '#4a5568' : '#cbd5e0')};
  border-radius: 28px;
  transition: all 0.3s ease;

  &:before {
    content: '';
    position: absolute;
    height: 22px;
    width: 22px;
    left: 3px;
    bottom: 3px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const VolumeSlider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: ${({ theme }) => (theme.mode === 'dark' ? '#4a5568' : '#cbd5e0')};
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary.main};
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.2);
      box-shadow: 0 4px 12px rgba(0, 102, 204, 0.4);
    }
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary.main};
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
    border: none;

    &:hover {
      transform: scale(1.2);
    }
  }
`;

const TestButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(0, 102, 204, 0.15)' : 'rgba(0, 102, 204, 0.1)')};
  border: 1px solid ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.primary.main};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary.main};
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
`;

const VolumeIcon = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
`;

const VolumeLabel = styled.span`
  min-width: 40px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const NotificationSettings: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [soundEnabled, setSoundEnabled] = useState(notificationSoundService.isEnabled());
  const [volume, setVolume] = useState(notificationSoundService.getVolume());
  const [testing, setTesting] = useState(false);

  // Update service when settings change
  useEffect(() => {
    notificationSoundService.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    notificationSoundService.setVolume(volume);
  }, [volume]);

  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleTestSound = async () => {
    if (!soundEnabled || testing) return;

    setTesting(true);
    try {
      await notificationSoundService.testSound();
    } catch (error) {
      logger.error('Failed to test notification sound', error as Error);
    } finally {
      setTimeout(() => setTesting(false), 500);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop $isOpen={isOpen} onClick={handleBackdropClick}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>{t('settings.notifications', 'Notification Settings')}</h3>
          <CloseButton onClick={onClose}>
            <ModernClose size={20} />
          </CloseButton>
        </ModalHeader>

        <SettingItem>
          <SettingInfo>
            {soundEnabled ? <ModernVolume size={20} /> : <ModernVolumeX size={20} />}
            <div>
              <h4>{t('settings.soundNotifications', 'Sound Notifications')}</h4>
              <p>{t('settings.soundDescription', 'Play a sound when you receive a new message')}</p>
            </div>
            <ToggleSwitch>
              <ToggleInput type="checkbox" checked={soundEnabled} onChange={handleToggleSound} />
              <ToggleSlider />
            </ToggleSwitch>
          </SettingInfo>

          {soundEnabled && (
            <VolumeControl>
              <VolumeIcon>
                <ModernVolumeX size={16} />
              </VolumeIcon>
              <VolumeSlider type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolumeChange} />
              <VolumeIcon>
                <ModernVolume size={16} />
              </VolumeIcon>
              <VolumeLabel>{Math.round(volume * 100)}%</VolumeLabel>
            </VolumeControl>
          )}
        </SettingItem>

        <SettingItem>
          <TestButton onClick={handleTestSound} disabled={!soundEnabled || testing}>
            <ModernPlay size={16} />
            {testing
              ? t('settings.testing', 'Testing...')
              : t('settings.testSound', 'Test Sound')}
          </TestButton>
        </SettingItem>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default NotificationSettings;

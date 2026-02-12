import { logger } from '../services/logger-service';
// hCaptcha React Component
// (Comment removed - was in Arabic)

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface HCaptchaComponentProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  language?: string;
}

export const HCaptchaComponent = forwardRef<any, HCaptchaComponentProps>(
  ({ onVerify, onError, onExpire, theme = 'light', size = 'normal', language = 'bg' }, ref) => {
    const captchaRef = useRef<HCaptcha>(null);

    useImperativeHandle(ref, () => ({
      execute: () => captchaRef.current?.execute(),
    }));

    const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY || '';

    if (!siteKey || siteKey === 'your-hcaptcha-site-key') {
      return (
        <div style={{
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9',
          textAlign: 'center'
        }}>
          <p>hCaptcha не е конфигуриран</p>
          <small>Моля, конфигурирайте REACT_APP_HCAPTCHA_SITE_KEY във вашия .env файл</small>
        </div>
      );
    }

    return (
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        theme={theme}
        size={size}
        languageOverride={language}
        onVerify={(token) => {
          logger.info('Captcha verified:', token);
          onVerify(token);
        }}
        onError={(error) => {
          logger.error('Captcha error:', error);
          onError?.(error);
        }}
        onExpire={() => {
          logger.info('Captcha expired');
          onExpire?.();
        }}
      />
    );
  }
);

HCaptchaComponent.displayName = 'HCaptchaComponent';

export default HCaptchaComponent;
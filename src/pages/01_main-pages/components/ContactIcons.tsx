import React from 'react';

export const PhoneIcon = () => (
  <img 
    src="/assets/bottom/call.png" 
    alt="Phone"
  />
);

export const EmailIcon = () => (
  <img 
    src="/assets/bottom/email.png" 
    alt="Email"
  />
);

export const WhatsAppIcon = () => (
  <svg viewBox="0 0 48 48" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="whatsappGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'var(--success)' }} />
        <stop offset="100%" style={{ stopColor: 'var(--success)' }} />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="20" fill="url(#whatsappGradient)" />
    <path d="M24 4C12.95 4 4 12.95 4 24c0 3.53.92 6.84 2.53 9.71L4 44l10.57-2.47A19.93 19.93 0 0024 44c11.05 0 20-8.95 20-20S35.05 4 24 4zm10.19 28.38c-.43 1.21-2.14 2.22-3.51 2.51-.93.19-2.14.35-6.23-1.34-5.25-2.16-8.65-7.49-8.91-7.84-.26-.35-2.11-2.81-2.11-5.36s1.34-3.8 1.81-4.32c.47-.52 1.03-.65 1.37-.65.34 0 .69.01.99.02.32.01.74-.12 1.16.88.43 1.03 1.46 3.58 1.59 3.84.13.26.22.56.04.91-.17.35-.26.56-.52.86-.26.3-.55.67-.78.9-.26.26-.53.54-.23.98.3.52 1.34 2.21 2.88 3.58 1.98 1.76 3.65 2.31 4.17 2.57.52.26.82.22 1.12-.13.3-.35 1.29-1.51 1.64-2.03.34-.52.69-.43 1.16-.26.47.17 2.99 1.41 3.51 1.67.52.26.86.39.99.61.13.21.13 1.25-.3 2.46z" fill="white" />
  </svg>
);

export const ViberIcon = () => (
  <img 
    src="/assets/bottom/viber.png" 
    alt="Viber"
  />
);

export const TelegramIcon = () => (
  <img 
    src="/assets/bottom/telegram.png" 
    alt="Telegram"
  />
);

export const FacebookMessengerIcon = () => (
  <img 
    src="/assets/bottom/massenger.png" 
    alt="Messenger"
  />
);

export const SMSIcon = () => (
  <img 
    src="/assets/bottom/SMS.png" 
    alt="SMS"
  />
);


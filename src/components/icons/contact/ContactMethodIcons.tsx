import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

const buildIcon = (
  path: React.ReactNode,
  viewBox: string = '0 0 24 24'
): React.FC<IconProps> => {
  const Component: React.FC<IconProps> = ({ size = 24, color = 'currentColor', ...rest }) => (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
      {...rest}
    >
      <g fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {path}
      </g>
    </svg>
  );
  Component.displayName = 'ContactIcon';
  return Component;
};

export const PhoneIcon = buildIcon(
  <>
    <path d="M7.5 3h9a1.5 1.5 0 0 1 1.5 1.5v15A1.5 1.5 0 0 1 16.5 21h-9A1.5 1.5 0 0 1 6 19.5v-15A1.5 1.5 0 0 1 7.5 3Z" />
    <path d="M9 3v2.25M15 3v2.25M9 18.75h6" />
    <path d="M11 9.5c.5 1.5 1.5 2.5 3 3" />
  </>
);

export const EmailIcon = buildIcon(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </>
);

export const WhatsAppIcon = buildIcon(
  <>
    <path d="M12 4a8 8 0 0 0-7.78 9.64l-.72 3 3-.72A8 8 0 1 0 12 4Z" />
    <path d="M9 9c0 3 3 6 6 6l1.5-1.5" />
    <path d="M13.5 13.5 15 12" />
  </>
);

export const ViberIcon = buildIcon(
  <>
    <path d="M7 3h10a2 2 0 0 1 2 2v14l-4-2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
    <path d="M10 7.5h4" />
    <path d="M10 10.5h4" />
    <path d="M10 13.5h2.5" />
  </>
);

export const TelegramIcon = buildIcon(
  <>
    <path d="m20.5 4.5-17 7 6.5 2.5 2.5 6.5 8-16Z" />
    <path d="m10 14 6.5-6.5" />
  </>
);

export const MessengerIcon = buildIcon(
  <>
    <path d="M12 3a9 9 0 0 0-8.53 11.77L3 21l6.5-2A9 9 0 1 0 12 3Z" />
    <path d="m7.5 13 3-3 2.5 2.5 3.5-3.5" />
  </>
);

export const SMSIcon = buildIcon(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 9h10" />
    <path d="M7 13h6" />
    <path d="M9 20v-2" />
  </>
);

export const ContactIcons = {
  phone: PhoneIcon,
  email: EmailIcon,
  whatsapp: WhatsAppIcon,
  viber: ViberIcon,
  telegram: TelegramIcon,
  messenger: MessengerIcon,
  sms: SMSIcon
};

export type ContactIconId = keyof typeof ContactIcons;


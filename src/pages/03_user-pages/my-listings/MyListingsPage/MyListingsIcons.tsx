import React from 'react';

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
};

const buildIcon = (
  path: React.ReactNode,
  viewBox: string = '0 0 24 24'
): React.FC<IconProps> => ({ size = 20, color = 'currentColor', strokeWidth = 1.6, className }) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-hidden="true"
    className={className}
  >
    <g
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {path}
    </g>
  </svg>
);

export const ChartIcon = buildIcon(
  <>
    <path d="M4 19h16" />
    <path d="M6.5 15V9.5" />
    <path d="M12 19V6" />
    <path d="M17.5 19V11" />
  </>
);

export const ActiveIcon = buildIcon(
  <>
    <path d="M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Z" />
    <path d="m9.2 12 2.1 2.1L15 10" />
  </>
);

export const SoldIcon = buildIcon(
  <>
    <path d="M4.5 5.5h7.4l5.6 5.6a2 2 0 0 1 0 2.8l-4.1 4.1a2 2 0 0 1-2.8 0L5 12.6V5.5Z" />
    <path d="M9 8.5h.01" />
  </>
);

export const EyeIcon = buildIcon(
  <>
    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
    <circle cx="12" cy="12" r="3" />
  </>
);

export const MessageIcon = buildIcon(
  <>
    <path d="M4 5h16v11H7l-3 3V5Z" />
    <path d="M8 9.5h8" />
    <path d="M8 12.5h6" />
  </>
);

export const ClipboardIcon = buildIcon(
  <>
    <rect x="6" y="5.5" width="12" height="14" rx="2" />
    <path d="M10 5.5V4h4v1.5" />
    <path d="M10 9.5h4" />
    <path d="M10 12.5h4" />
  </>
);

export const CalendarIcon = buildIcon(
  <>
    <rect x="4.5" y="6" width="15" height="13" rx="2" />
    <path d="M8.5 4v4" />
    <path d="M15.5 4v4" />
    <path d="M4.5 10h15" />
  </>
);

export const RoadIcon = buildIcon(
  <>
    <path d="M7 19 10 5h4l3 14" />
    <path d="M12 5v3.5" />
    <path d="M12 13v3.5" />
  </>
);

export const FuelIcon = buildIcon(
  <>
    <path d="M7.5 5.5h6v13h-6z" />
    <path d="M9 3.5h3" />
    <path d="M16.5 9v5.5a2 2 0 0 1-2 2" />
    <path d="M16.5 11 19 9v2" />
  </>
);

export const GearIcon = buildIcon(
  <>
    <circle cx="12" cy="12" r="2.5" />
    <path d="m12 6 1.1-.4 0-1.6L12 4l-1.1 0 .1 1.6Z" />
    <path d="m12 18 1.1.4 0 1.6L12 20l-1.1 0 .1-1.6Z" />
    <path d="m6 12-.4-1.1-1.6 0L4 12l0 1.1 1.6-.1Z" />
    <path d="m18 12 .4-1.1 1.6 0L20 12l0 1.1-1.6-.1Z" />
    <path d="m8.5 7.5-.9-.9-1.1.6.2 1 .9.9Z" />
    <path d="m15.5 16.5.9.9 1.1-.6-.2-1-.9-.9Z" />
    <path d="m8.5 16.5-.9.9-1.1-.6.2-1 .9-.9Z" />
    <path d="m15.5 7.5.9-.9 1.1.6-.2 1-.9.9Z" />
  </>
);

export const DoorIcon = buildIcon(
  <>
    <path d="M9 4.5h6v15H9z" />
    <path d="M13.2 12h.1" />
    <path d="M9 4.5 11 4" />
  </>
);

export const SeatIcon = buildIcon(
  <>
    <path d="M9 6.5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v6.5" />
    <path d="M8.5 12l.5 5.5h7" />
    <path d="M7 17.5h10" />
  </>
);

export const ShieldIcon = buildIcon(
  <>
    <path d="M12 4 6 6v5.5c0 3 2.4 5.8 6 6.5 3.6-.7 6-3.5 6-6.5V6Z" />
    <path d="M12 9v5" />
    <path d="M9.5 11.5h5" />
  </>
);

export const ComfortIcon = buildIcon(
  <>
    <path d="M6.5 10c0-2 1.7-3.5 3.5-3.5h4c1.8 0 3.5 1.5 3.5 3.5" />
    <path d="M7.5 13.5h9" />
    <path d="M8.5 17h7" />
  </>
);

export const MusicIcon = buildIcon(
  <>
    <path d="M14.5 6v10.5" />
    <path d="M14.5 6 18 7" />
    <path d="M14.5 9.5 18 10.5" />
    <circle cx="9" cy="15.5" r="2" />
  </>
);

export const SparkIcon = buildIcon(
  <>
    <path d="M12 3.5 13.5 9 18 10.5 13.5 12 12 17 10.5 12 6 10.5 10.5 9Z" />
  </>
);

export const LocationIcon = buildIcon(
  <>
    <path d="M12 21s-5-4.5-5-9a5 5 0 1 1 10 0c0 4.5-5 9-5 9Z" />
    <circle cx="12" cy="12" r="1.7" />
  </>
);

export const UserIcon = buildIcon(
  <>
    <circle cx="12" cy="8" r="3" />
    <path d="M6.5 18.5c1.2-2.3 3.3-3.5 5.5-3.5s4.3 1.2 5.5 3.5" />
  </>
);

export const VideoIcon = buildIcon(
  <>
    <rect x="4" y="6.5" width="11" height="11" rx="2" />
    <path d="m15 11 5-3.5v8L15 12.5" />
  </>
);

export const StarIcon = buildIcon(
  <>
    <path d="M12 4.5 13.6 9l4.4.2-3.5 2.8 1.2 4.3L12 13.8l-3.7 2.5L9.5 12 6 9.2 10.4 9Z" />
  </>
);

export const BoltIcon = buildIcon(
  <>
    <path d="M12.5 4.5 8 12h4l-.5 7.5 4.5-7.5h-4z" />
  </>
);

export const PencilIcon = buildIcon(
  <>
    <path d="M6 16.5V20h3.5l8-8-3.5-3.5-8 8Z" />
    <path d="m14 6 3.5 3.5" />
  </>
);

export const TrashIcon = buildIcon(
  <>
    <path d="M6.5 8.5h11" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M8.5 8.5V6.5h7v2" />
    <path d="M7.5 8.5h9l-.6 9a1.5 1.5 0 0 1-1.5 1.4h-5.8a1.5 1.5 0 0 1-1.5-1.4Z" />
  </>
);

export const EyeOffIcon = buildIcon(
  <>
    <path d="M3 3l18 18" />
    <path d="M4.5 7.5C6.5 5.5 9 4 12 4c4.2 0 7.7 2.6 9.5 6-.6 1.2-1.4 2.3-2.4 3.2" />
    <path d="M9.2 9.2a3 3 0 0 1 4.1 4.1" />
    <path d="M12 18c-4.2 0-7.7-2.6-9.5-6a11 11 0 0 1 2-2.7" />
  </>
);

export const HeartIcon = buildIcon(
  <>
    <path d="M12 19s-5.5-3.4-7.3-7C2.7 9 4 6 6.8 6c1.4 0 2.5.9 3.2 1.9C10.7 6.9 11.8 6 13.2 6 16 6 17.3 9 17.3 12c-1.8 3.6-7.3 7-7.3 7Z" />
  </>
);

export const PauseIcon = buildIcon(
  <>
    <path d="M9 7.5h2.5v9H9z" />
    <path d="M12.5 7.5H15v9h-2.5z" />
  </>
);

export const PlayIcon = buildIcon(
  <>
    <path d="M9 7.5 17 12l-8 4.5z" />
  </>
);

export const CheckBadgeIcon = buildIcon(
  <>
    <path d="M12 4.5 9.8 6.7 6.5 6.3 6.9 9.6 4.7 11.8 7.5 13.1 8.2 16.3 11 15l3 1.3.7-3.2 2.8-1.3-2.2-2.2.4-3.3-3.3.4Z" />
    <path d="m9.7 12 1.5 1.5 3-3" />
  </>
);

export const TagIcon = buildIcon(
  <>
    <path d="M4.5 5.5h7l6 6-6 6h-7v-12Z" />
    <path d="M8.5 8.5h.01" />
  </>
);

export const SpinnerIcon = buildIcon(
  <>
    <circle cx="12" cy="12" r="8" strokeDasharray="40" strokeDashoffset="24" />
  </>,
  '0 0 24 24'
);

export default {
  ChartIcon,
  ActiveIcon,
  SoldIcon,
  EyeIcon,
  MessageIcon,
  ClipboardIcon,
  CalendarIcon,
  RoadIcon,
  FuelIcon,
  GearIcon,
  DoorIcon,
  SeatIcon,
  ShieldIcon,
  ComfortIcon,
  MusicIcon,
  SparkIcon,
  LocationIcon,
  UserIcon,
  VideoIcon,
  StarIcon,
  BoltIcon,
  PencilIcon,
  TrashIcon,
  EyeOffIcon,
  HeartIcon,
  PauseIcon,
  PlayIcon,
  CheckBadgeIcon,
  TagIcon,
  SpinnerIcon
};

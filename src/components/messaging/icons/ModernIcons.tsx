/**
 * 🎨 Modern Professional Icons
 * Source: SVGRepo.com
 * Style: Futuristic, Clean, Professional
 * All icons support theme colors
 */

import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

// ⬅️ Modern Back/Arrow Icon
export const ModernArrowLeft: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ⚡ Modern Lightning/Quick Actions Icon
export const ModernLightning: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} opacity="0.2"/>
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 📞 Modern Phone Icon
export const ModernPhone: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1469 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.09501 3.90347 2.12788 3.62476 2.21649 3.36162C2.30511 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 📹 Modern Video Camera Icon
export const ModernVideo: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M23 7L16 12L23 17V7Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} opacity="0.2"/>
    <rect x="1" y="5" width="15" height="14" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// � Modern Search/Eye Icon (View/Preview)
export const ModernSearch: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// �📤 Modern Send Icon (Paper Plane)
export const ModernSend: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M22 2L11 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} opacity="0.2"/>
  </svg>
);

// ⚙️ Modern Menu/Options Icon
export const ModernMenu: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="5" r="2" fill={color}/>
    <circle cx="12" cy="12" r="2" fill={color}/>
    <circle cx="12" cy="19" r="2" fill={color}/>
  </svg>
);

// 📎 Modern Paperclip/Attachment Icon
export const ModernPaperclip: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59723 21.9983 8.005 21.9983C6.41277 21.9983 4.88583 21.3658 3.76 20.24C2.63417 19.1142 2.00166 17.5872 2.00166 15.995C2.00166 14.4028 2.63417 12.8758 3.76 11.75L12.33 3.18C13.1049 2.40507 14.1568 1.96672 15.255 1.96672C16.3532 1.96672 17.4051 2.40507 18.18 3.18C18.9549 3.95493 19.3933 5.00683 19.3933 6.105C19.3933 7.20317 18.9549 8.25507 18.18 9.03L9.6 17.6C9.21251 17.9875 8.68658 18.2066 8.14 18.2066C7.59342 18.2066 7.06749 17.9875 6.68 17.6C6.29251 17.2125 6.07343 16.6866 6.07343 16.14C6.07343 15.5934 6.29251 15.0675 6.68 14.68L15.07 6.34" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 😊 Modern Emoji/Smile Icon
export const ModernSmile: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill={color} opacity="0.1"/>
    <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="9" cy="9" r="1.5" fill={color}/>
    <circle cx="15" cy="9" r="1.5" fill={color}/>
  </svg>
);

// 🖼️ Modern Image Icon
export const ModernImage: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill={color} opacity="0.1"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill={color}/>
    <path d="M21 15L16 10L5 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ❌ Modern Close/X Icon
export const ModernClose: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 👤 Modern User/Profile Icon
export const ModernUser: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 21C6 17.134 8.68629 14 12 14C15.3137 14 18 17.134 18 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 🚗 Modern Car/Vehicle Icon
export const ModernCar: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 17H19L18 9H6L5 17ZM5 17C3.89543 17 3 16.1046 3 15V12C3 10.8954 3.89543 10 5 10H19C20.1046 10 21 10.8954 21 12V15C21 16.1046 20.1046 17 19 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="17" r="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="17" cy="17" r="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ✅ Modern Check Icon
export const ModernCheck: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ✅✅ Modern Double Check Icon (Message Read)
export const ModernDoubleCheck: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 6L10 14L6 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 6L14 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 💰 Modern Dollar/Money Icon
export const ModernDollar: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill={color} opacity="0.1"/>
    <path d="M12 6V18M15 9H10.5C9.67157 9 9 9.67157 9 10.5C9 11.3284 9.67157 12 10.5 12H13.5C14.3284 12 15 12.6716 15 13.5C15 14.3284 14.3284 15 13.5 15H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 📅 Modern Calendar Icon
export const ModernCalendar: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill={color} opacity="0.1"/>
    <path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="8" cy="14" r="1" fill={color}/>
    <circle cx="12" cy="14" r="1" fill={color}/>
    <circle cx="16" cy="14" r="1" fill={color}/>
    <circle cx="8" cy="18" r="1" fill={color}/>
    <circle cx="12" cy="18" r="1" fill={color}/>
  </svg>
);

// 📍 Modern Map Pin/Location Icon
export const ModernMapPin: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} opacity="0.2"/>
    <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" fill="white"/>
  </svg>
);

// 🔧 Modern Wrench/Tools Icon
export const ModernWrench: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M14.7 6.3C15.4 7 16 8 16 9.2C16 11.1 14.5 12.6 12.6 12.6C11.4 12.6 10.4 12 9.7 11.3L2 19L5 22L12.7 14.3C13.4 15 14.4 15.6 15.6 15.6C17.5 15.6 19 14.1 19 12.2C19 11 18.4 10 17.7 9.3L15.5 11.5L12.5 8.5L14.7 6.3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} opacity="0.2"/>
    <path d="M14.7 6.3L17 4C18.1046 2.89543 19.8954 2.89543 21 4C22.1046 5.10457 22.1046 6.89543 21 8L18.7 10.3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ✨ Modern Sparkles/AI Icon
export const ModernSparkles: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3L13.5 7.5L18 9L13.5 10.5L12 15L10.5 10.5L6 9L10.5 7.5L12 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} opacity="0.3"/>
    <path d="M19 3L19.5 4.5L21 5L19.5 5.5L19 7L18.5 5.5L17 5L18.5 4.5L19 3Z" fill={color}/>
    <path d="M19 17L19.5 18.5L21 19L19.5 19.5L19 21L18.5 19.5L17 19L18.5 18.5L19 17Z" fill={color}/>
  </svg>
);

// 🔄 Modern Loader/Spinner Icon
export const ModernLoader: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${className} animate-spin`}>
    <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 💬 Modern Message Square Icon
export const ModernMessageSquare: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} opacity="0.1"/>
  </svg>
);

// 🔊 Modern Volume/Sound Icon
export const ModernVolume: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} opacity="0.2"/>
    <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// 🔇 Modern Volume X/Mute Icon
export const ModernVolumeX: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} opacity="0.2"/>
    <path d="M23 9L17 15M17 9L23 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ▶️ Modern Play Icon
export const ModernPlay: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill={color} opacity="0.1"/>
    <path d="M10 8L16 12L10 16V8Z" fill={color}/>
  </svg>
);

// 📥 Modern Download Icon
export const ModernDownload: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10L12 15L17 10M12 15V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default {
  ModernArrowLeft,
  ModernLightning,
  ModernPhone,
  ModernVideo,
  ModernSend,
  ModernMenu,
  ModernPaperclip,
  ModernSmile,
  ModernImage,
  ModernClose,
  ModernCheck,
  ModernDoubleCheck,
  ModernDollar,
  ModernCalendar,
  ModernMapPin,
  ModernWrench,
  ModernSparkles,
  ModernLoader,
  ModernSearch,
  ModernMessageSquare,
  ModernVolume,
  ModernVolumeX,
  ModernPlay,
  ModernDownload,
  ModernUser,
  ModernCar,
};

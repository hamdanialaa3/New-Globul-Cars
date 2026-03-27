import React from 'react';

interface CarIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Professional Car Icon Component
 * Replaces emoji 🚗 with a clean, scalable SVG icon
 */
export const CarIcon: React.FC<CarIconProps> = ({ 
  size = 24, 
  color = 'currentColor',
  className = '',
  style = {}
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Car Body */}
      <path
        d="M4 16C4 16.5304 4.21071 17.0391 4.58579 17.4142C4.96086 17.7893 5.46957 18 6 18H6.5C6.89782 18 7.27936 17.842 7.56066 17.5607C7.84196 17.2794 8 16.8978 8 16.5V16H16V16.5C16 16.8978 16.158 17.2794 16.4393 17.5607C16.7206 17.842 17.1022 18 17.5 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V12L18.5 6C18.3454 5.39689 17.9975 4.86301 17.5125 4.48159C17.0275 4.10016 16.4327 3.89427 15.82 3.89427H8.18C7.56728 3.89427 6.97254 4.10016 6.48751 4.48159C6.00248 4.86301 5.65456 5.39689 5.5 6L4 12V16Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Front Window */}
      <path
        d="M8 8H16L17 12H7L8 8Z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Front Wheel */}
      <circle
        cx="7.5"
        cy="16"
        r="1.5"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Rear Wheel */}
      <circle
        cx="16.5"
        cy="16"
        r="1.5"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Headlight detail */}
      <path
        d="M6 12H7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Taillight detail */}
      <path
        d="M17 12H18"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * Alternative Modern Car Icon (Filled Style)
 */
export const CarIconFilled: React.FC<CarIconProps> = ({ 
  size = 24, 
  color = '#2563EB',
  className = '',
  style = {}
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M5.5 6L7 12H17L18.5 6C18.6545 5.39689 19.0025 4.86301 19.4875 4.48159C19.9725 4.10016 20.5673 3.89427 21.18 3.89427H2.82C3.43272 3.89427 4.02746 4.10016 4.51249 4.48159C4.99752 4.86301 5.34544 5.39689 5.5 6Z"
        fill={color}
        opacity="0.2"
      />
      <path
        d="M4 12V16C4 16.5304 4.21071 17.0391 4.58579 17.4142C4.96086 17.7893 5.46957 18 6 18H6.5C6.89782 18 7.27936 17.842 7.56066 17.5607C7.84196 17.2794 8 16.8978 8 16.5V16H16V16.5C16 16.8978 16.158 17.2794 16.4393 17.5607C16.7206 17.842 17.1022 18 17.5 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V12L18.5 6C18.3454 5.39689 17.9975 4.86301 17.5125 4.48159C17.0275 4.10016 16.4327 3.89427 15.82 3.89427H8.18C7.56728 3.89427 6.97254 4.10016 6.48751 4.48159C6.00248 4.86301 5.65456 5.39689 5.5 6L4 12Z"
        fill={color}
      />
      <circle cx="7.5" cy="16" r="1.5" fill="white"/>
      <circle cx="16.5" cy="16" r="1.5" fill="white"/>
      <path d="M8 8H16L17 12H7L8 8Z" fill="white" fillOpacity="0.3"/>
    </svg>
  );
};

/**
 * Simplified Car Icon (for small sizes)
 */
export const CarIconSimple: React.FC<CarIconProps> = ({ 
  size = 16, 
  color = 'currentColor',
  className = '',
  style = {}
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M2.5 10.5V12.5C2.5 12.7761 2.72386 13 3 13H3.5C3.77614 13 4 12.7761 4 12.5V12H12V12.5C12 12.7761 12.2239 13 12.5 13H13C13.2761 13 13.5 12.7761 13.5 12.5V10.5L12.5 6.5C12.4 6.2 12.1 6 11.8 6H4.2C3.9 6 3.6 6.2 3.5 6.5L2.5 10.5Z"
        fill={color}
      />
      <circle cx="4.5" cy="12" r="0.8" fill="white"/>
      <circle cx="11.5" cy="12" r="0.8" fill="white"/>
      <path d="M5 7H11L11.5 10H4.5L5 7Z" fill="white" fillOpacity="0.3"/>
    </svg>
  );
};

export default CarIcon;



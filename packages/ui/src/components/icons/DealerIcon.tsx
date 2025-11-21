import React from 'react';

interface DealerIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

const DealerIcon: React.FC<DealerIconProps> = ({ 
  size = 28, 
  color,
  className = '',
  style
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <g>
        <path 
          d="M42.156 14.5c-.375-.625-.969-1-1.656-1h-6.219l-2.531-5.031c-.438-.875-1.344-1.469-2.344-1.469h-8.812c-.969 0-1.844.594-2.312 1.469l-2.563 5.031H9.5c-.688 0-1.281.375-1.656 1l-2 3.344c-.219.344-.344.75-.344 1.156v17c0 1.375 1.125 2.5 2.5 2.5h3.688l.312.469c.406.594 1.094 1.031 1.844 1.031h22.344c.75 0 1.438-.438 1.844-1.031l.281-.469H42c1.344 0 2.5-1.125 2.5-2.5V19c0-.406-.125-.813-.344-1.156l-2-3.344z"
          fill={color || 'currentColor'}
        />
        <circle cx="25" cy="30" r="3.5" fill="white" />
        <text x="24" y="32" fontSize="4" fontWeight="bold" fill={color || 'currentColor'} textAnchor="middle">$</text>
      </g>
    </svg>
  );
};

export default DealerIcon;

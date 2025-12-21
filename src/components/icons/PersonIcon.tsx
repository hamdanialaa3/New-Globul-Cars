import React from 'react';

interface PersonIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

const PersonIcon: React.FC<PersonIconProps> = ({ 
  size = 28, 
  color,
  className = '',
  style
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <circle cx="256" cy="256" r="256" fill={color || 'currentColor'} />
      <g transform="translate(256,256)">
        <g>
          <g>
            <path 
              d="M0-119.467c-30.72,0-56.516,25.796-56.516,56.516c0,30.72,25.796,56.516,56.516,56.516
              s56.516-25.796,56.516-56.516C56.516-93.671,30.72-119.467,0-119.467z"
              fill="white"
            />
          </g>
        </g>
        <g>
          <g>
            <path 
              d="M0,7.565c-66.002,0-119.467,30.498-119.467,80.676V153.6h238.933V88.242
              C119.467,38.063,66.002,7.565,0,7.565z"
              fill="white"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default PersonIcon;

import styled, { css } from 'styled-components';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
    variant?: BadgeVariant;
    size?: BadgeSize;
    $rounded?: boolean;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const variantStyles = {
    primary: css`
    background-color: var(--primary);
    color: white;
  `,
    secondary: css`
    background-color: var(--secondary);
    color: white;
  `,
    success: css`
    background-color: var(--success);
    color: white;
  `,
    danger: css`
    background-color: var(--danger);
    color: white;
  `,
    warning: css`
    background-color: var(--warning);
    color: var(--text-primary);
  `,
    info: css`
    background-color: var(--info);
    color: white;
  `,
    light: css`
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
  `,
    dark: css`
    background-color: var(--text-primary);
    color: var(--bg-primary);
  `
};

const sizeStyles = {
    sm: css`
    font-size: 0.75rem;
    padding: 2px 6px;
  `,
    md: css`
    font-size: 0.875rem;
    padding: 4px 8px;
  `,
    lg: css`
    font-size: 1rem;
    padding: 6px 12px;
  `
};

const StyledBadge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: ${props => props.$rounded ? '9999px' : '0.25rem'};
  transition: all 0.2s ease-in-out;
  cursor: ${props => props.onClick ? 'pointer' : 'default'};

  ${props => variantStyles[props.variant || 'primary']}
  ${props => sizeStyles[props.size || 'md']}

  &:hover {
    opacity: ${props => props.onClick ? 0.9 : 1};
    transform: ${props => props.onClick ? 'scale(1.05)' : 'none'};
  }
`;

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    $rounded = false,
    className,
    onClick
}) => {
    return (
        <StyledBadge
            variant={variant}
            size={size}
            $rounded={$rounded}
            className={className}
            onClick={onClick}
        >
            {children}
        </StyledBadge>
    );
};

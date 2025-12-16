import styled, { css } from 'styled-components';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string; // Used for initials if no image
    size?: AvatarSize;
    className?: string;
}

const sizeStyles = {
    sm: css`
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  `,
    md: css`
    width: 40px;
    height: 40px;
    font-size: 1rem;
  `,
    lg: css`
    width: 64px;
    height: 64px;
    font-size: 1.5rem;
  `,
    xl: css`
    width: 96px;
    height: 96px;
    font-size: 2.25rem;
  `
};

const AvatarContainer = styled.div<{ size: AvatarSize }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  border: 2px solid var(--border-color);
  
  ${props => sizeStyles[props.size]}

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt,
    name,
    size = 'md',
    className
}) => {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <AvatarContainer size={size} className={className} aria-label={alt || name}>
            {src ? (
                <img src={src} alt={alt || name || 'Avatar'} />
            ) : (
                <span>{name ? getInitials(name) : '?'}</span>
            )}
        </AvatarContainer>
    );
};

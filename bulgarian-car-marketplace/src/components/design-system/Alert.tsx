import styled, { css } from 'styled-components';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
    variant?: AlertVariant;
    title?: string;
    children: React.ReactNode;
    onClose?: () => void;
    className?: string;
}

const variantConfig = {
    success: {
        icon: CheckCircle,
        color: 'var(--success)',
        bg: 'rgba(var(--success-rgb), 0.1)',
        border: 'var(--success)'
    },
    error: {
        icon: XCircle,
        color: 'var(--danger)',
        bg: 'rgba(var(--danger-rgb), 0.1)',
        border: 'var(--danger)'
    },
    warning: {
        icon: AlertCircle,
        color: 'var(--warning)',
        bg: 'rgba(var(--warning-rgb), 0.1)',
        border: 'var(--warning)'
    },
    info: {
        icon: Info,
        color: 'var(--info)',
        bg: 'rgba(var(--info-rgb), 0.1)',
        border: 'var(--info)'
    }
};

const AlertContainer = styled.div<{ variant: AlertVariant }>`
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid ${props => variantConfig[props.variant].border};
  background-color: ${props => variantConfig[props.variant].bg};
  margin-bottom: 1rem;
  
  /* Use CSS variable if available, otherwise fallback */
  color: var(--text-primary); 
`;

const IconWrapper = styled.div<{ variant: AlertVariant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  color: ${props => variantConfig[props.variant].color};
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
`;

const Body = styled.div`
  font-size: 0.875rem;
  line-height: 1.5;
  opacity: 0.9;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  margin-left: 0.75rem;
  color: inherit;
  opacity: 0.5;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

export const Alert: React.FC<AlertProps> = ({
    variant = 'info',
    title,
    children,
    onClose,
    className
}) => {
    const Icon = variantConfig[variant].icon;

    return (
        <AlertContainer variant={variant} className={className}>
            <IconWrapper variant={variant}>
                <Icon size={20} />
            </IconWrapper>
            <Content>
                {title && <Title>{title}</Title>}
                <Body>{children}</Body>
            </Content>
            {onClose && (
                <CloseButton onClick={onClose} aria-label="Close alert">
                    <XCircle size={16} />
                </CloseButton>
            )}
        </AlertContainer>
    );
};

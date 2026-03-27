import React from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthProvider';
import { useLanguage } from '../contexts/LanguageContext';
import { Lock } from 'lucide-react';
import styled from 'styled-components';

const NavLinkWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const LockIcon = styled(Lock)`
  width: 14px;
  height: 14px;
  margin-left: 4px;
  color: #ff6b6b;
`;

const ProtectedNavLink = styled.span`
  color: #999;
  cursor: not-allowed;
  
  &:hover {
    color: #666;
  }
`;

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  requireAuth?: boolean;
}

const EnhancedNavLink: React.FC<NavLinkProps> = ({ 
  href, 
  children, 
  className = "", 
  onClick, 
  requireAuth = false 
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();

  // (Comment removed - was in Arabic)
  if (!requireAuth) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  // (Comment removed - was in Arabic)
  if (user) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  // (Comment removed - was in Arabic)
  return (
    <NavLinkWrapper>
      <ProtectedNavLink 
        className={className}
        title={language === 'bg' ? 'Изисква вход' : 'Requires login'}
        onClick={() => {
          toast.warning(language === 'bg'
            ? 'Трябва да влезете, за да получите достъп до тази страница'
            : 'You must log in to access this page');
          window.location.href = '/login';
        }}
      >
        {children}
        <LockIcon />
      </ProtectedNavLink>
    </NavLinkWrapper>
  );
};

export default EnhancedNavLink;

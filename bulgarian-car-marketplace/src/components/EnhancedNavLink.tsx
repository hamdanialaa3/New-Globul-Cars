import React from 'react';
import { useAuth } from '@/contexts/AuthProvider';
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
        title="يتطلب تسجيل الدخول"
        onClick={() => {
          alert('يجب تسجيل الدخول للوصول إلى هذه الصفحة');
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
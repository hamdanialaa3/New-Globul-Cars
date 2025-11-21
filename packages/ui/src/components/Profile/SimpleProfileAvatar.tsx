// Simple Profile Avatar - Without LED Ring
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Clean profile picture display without progress ring

import React from 'react';
import styled from 'styled-components';
import { User } from 'lucide-react';
// ✅ NEW: Import from canonical types
import type { BulgarianUser } from '@globul-cars/core/typesuser/bulgarian-user.types';

interface SimpleProfileAvatarProps {
  user: BulgarianUser | null;
  size?: number;
  onClick?: () => void;
}

const SimpleProfileAvatar: React.FC<SimpleProfileAvatarProps> = ({
  user,
  size = 120,
  onClick
}) => {
  const profileImageUrl = user?.photoURL; // canonical field from BaseProfile
  const isCompany = user?.profileType === 'company'; // square for premium/company

  return (
    <AvatarContainer size={size} onClick={onClick} $clickable={!!onClick}>
      {profileImageUrl ? (
        <AvatarImage $square={isCompany} src={profileImageUrl} alt={user?.displayName || 'Profile'} />
      ) : (
        <PlaceholderAvatar $square={isCompany}>
          <User size={size * 0.4} />
        </PlaceholderAvatar>
      )}
    </AvatarContainer>
  );
};

const AvatarContainer = styled.div<{ size: number; $clickable: boolean }>`
  position: relative;
  width: ${p => p.size}px;
  height: ${p => p.size}px;
  margin: 0 auto;
  cursor: ${p => p.$clickable ? 'pointer' : 'default'};
  transition: transform 0.3s ease;
  
  &:hover {
    transform: ${p => p.$clickable ? 'scale(1.05)' : 'none'};
  }

  &:active {
    transform: ${p => p.$clickable ? 'scale(1.02)' : 'none'};
  }

  @media (max-width: 768px) {
    width: ${p => p.size * 0.8}px;
    height: ${p => p.size * 0.8}px;
  }
`;

const AvatarImage = styled.img<{ $square: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${p => p.$square ? '12px' : '50%'};
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: #f0f0f0;
  
  @media (max-width: 768px) {
    border-width: 2px;
  }
`;

const PlaceholderAvatar = styled.div<{ $square: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: ${p => p.$square ? '12px' : '50%'};
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #adb5bd;
  
  @media (max-width: 768px) {
    border-width: 2px;
  }
`;

export default SimpleProfileAvatar;


/**
 * PublicProfileHero Component
 * Hero Section احترافي للبروفايل العام - مستوحى من Facebook/LinkedIn
 * 
 * Features:
 * - Cover photo with professional overlay
 * - Profile photo positioned to overlap cover (Facebook style)
 * - Full dark/light mode support
 * - Responsive design
 * - Smooth transitions
 * 
 * @author Senior Frontend Engineer
 * @version 2.0.0
 */

import React from 'react';
import styled from 'styled-components';

import { MapPin, Phone, CheckCircle, Shield, Star, Calendar, Users } from 'lucide-react';

import { useLanguage } from '../../../../../../contexts/LanguageContext';
import { useTheme } from '../../../../../../contexts/ThemeContext';
import type { BulgarianUser } from '../../../../../../types/user/bulgarian-user.types';

interface PublicProfileHeroProps {
  user: BulgarianUser;
}

// Theme colors based on profile type
const getThemeColor = (type: string): string => {
  switch(type) {
    case 'company': return '#1E3A8A';
    case 'dealer': return '#059669';
    case 'private': return '#EA580C';
    default: return '#64748B';
  }
};

const getThemeGradient = (type: string): string => {
  switch(type) {
    case 'company': return 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)';
    case 'dealer': return 'linear-gradient(135deg, #059669 0%, #10B981 100%)';
    case 'private': return 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)';
    default: return 'linear-gradient(135deg, #64748B 0%, #94A3B8 100%)';
  }
};

export const PublicProfileHero: React.FC<PublicProfileHeroProps> = ({ user }) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const profileType = user.profileType || 'private';
  const isDealer = profileType === 'dealer';
  const isCompany = profileType === 'company';

  // Type-safe access to profile-specific fields
  const userAny = user as any; // Type assertion for accessing profile-specific fields
  
  // ✅ STRICT: Show personal name (firstName + lastName) in Hero
  // Business/Company name is shown separately near the avatar
  const personalName = `${userAny.firstName || ''} ${userAny.lastName || ''}`.trim();
  const businessName = personalName || user.displayName;
  
  // ✅ STRICT: Use locationData from settings as primary source
  const businessAddress = userAny.locationData?.cityName 
    || userAny.locationData?.regionName
    || (isDealer 
        ? userAny.dealerSnapshot?.address 
        : isCompany 
          ? userAny.companySnapshot?.address 
          : user.location?.city);

  // Get cover image - handle both string and object format
  // Firebase stores as { url: string, uploadedAt: Date } but types may expect string
  const getCoverImageUrl = (): string => {
    // Check if coverImage exists
    const coverImg = user.coverImage || userAny.coverImage;
    if (coverImg) {
      // If it's a string, use directly
      if (typeof coverImg === 'string') {
        return coverImg;
      }
      // If it's an object with url property
      if (typeof coverImg === 'object' && coverImg.url) {
        return coverImg.url;
      }
    }
    
    // Default cover images based on profile type
    if (isCompany) {
      return 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=1920&h=400&fit=crop';
    }
    if (isDealer) {
      return 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&h=400&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&h=400&fit=crop';
  };

  const coverImage = getCoverImageUrl();

  // Stats - use type assertion for additional stats fields
  const statsAny = user.stats as any;
  const createdAtDate = user.createdAt instanceof Date 
    ? user.createdAt 
    : (user.createdAt && typeof user.createdAt === 'object' && 'toDate' in user.createdAt)
      ? (user.createdAt as { toDate: () => Date }).toDate()
      : new Date();
  const joinDate = createdAtDate.getFullYear();
  const followersCount = statsAny?.followers || 0;
  const carsCount = statsAny?.totalCars || user.stats?.totalListings || 0;

  return (
    <HeroWrapper $isDark={isDark}>
      {/* Cover Photo Section */}
      <CoverSection $coverImage={coverImage}>
        <CoverOverlay $isDark={isDark} $profileType={profileType} />
      </CoverSection>

      {/* Profile Info Section - Below Cover */}
      <ProfileInfoSection $isDark={isDark}>
        <ProfileInfoContainer>
          {/* Profile Avatar - Positioned to overlap cover */}
          <AvatarContainer>
            <AvatarWrapper $profileType={profileType} $isDark={isDark}>
              <ProfileAvatar 
                src={user.photoURL || '/default-avatar.png'} 
                alt={businessName || 'Profile'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />
              {user.verification?.id && (
                <VerifiedBadge $profileType={profileType}>
                  <CheckCircle size={18} strokeWidth={3} />
                </VerifiedBadge>
              )}
            </AvatarWrapper>
          </AvatarContainer>

          {/* Name and Info */}
          <InfoSection>
            <NameRow>
              <BusinessName $isDark={isDark}>
                {businessName || 'Anonymous Seller'}
              </BusinessName>
              <ProfileTypeBadge $profileType={profileType}>
                {profileType === 'private' && (language === 'bg' ? 'Частен Продавач' : 'Private Seller')}
                {isDealer && (language === 'bg' ? 'Дилър' : 'Dealer')}
                {isCompany && (language === 'bg' ? 'Компания' : 'Company')}
              </ProfileTypeBadge>
            </NameRow>

            {/* Contact Row */}
            <ContactRow $isDark={isDark}>
              {businessAddress && (
                <ContactItem $isDark={isDark}>
                  <MapPin size={16} />
                  <span>{businessAddress}</span>
                </ContactItem>
              )}
              {user.phoneNumber && (
                <ContactItem $isDark={isDark}>
                  <Phone size={16} />
                  <span>{user.phoneNumber}</span>
                </ContactItem>
              )}
            </ContactRow>

            {/* Stats Row */}
            <StatsRow $isDark={isDark}>
              <StatItem $isDark={isDark}>
                <Calendar size={16} />
                <span>
                  {language === 'bg' ? `Член от ${joinDate}` : `Member since ${joinDate}`}
                </span>
              </StatItem>
              <StatDivider $isDark={isDark} />
              <StatItem $isDark={isDark}>
                <Users size={16} />
                <span>
                  {followersCount} {language === 'bg' ? 'последователи' : 'followers'}
                </span>
              </StatItem>
              <StatDivider $isDark={isDark} />
              <StatItem $isDark={isDark}>
                <Star size={16} />
                <span>
                  {carsCount} {language === 'bg' ? 'обяви' : 'listings'}
                </span>
              </StatItem>
              {user.verification?.id && (
                <>
                  <StatDivider $isDark={isDark} />
                  <StatItem $isDark={isDark} $verified>
                    <Shield size={16} />
                    <span>{language === 'bg' ? 'Верифициран' : 'Verified'}</span>
                  </StatItem>
                </>
              )}
            </StatsRow>

            {/* ✨ Bio Section - Professional LinkedIn-style */}
            {user.bio && (
              <BioSection $isDark={isDark} $profileType={profileType}>
                <BioQuote $isDark={isDark}>"</BioQuote>
                <BioText $isDark={isDark}>{user.bio}</BioText>
                <BioQuote $isDark={isDark} $end>"</BioQuote>
              </BioSection>
            )}
          </InfoSection>
        </ProfileInfoContainer>
      </ProfileInfoSection>
    </HeroWrapper>
  );
};

// ============================================================================
// STYLED COMPONENTS - Full Dark/Light Mode Support
// ============================================================================

const HeroWrapper = styled.div<{ $isDark: boolean }>`
  width: 100%;
  background: ${props => props.$isDark ? '#0F172A' : '#FFFFFF'};
  transition: background 0.3s ease;
`;

const CoverSection = styled.div<{ $coverImage: string }>`
  position: relative;
  height: 320px;
  width: 100%;
  background: url(${props => props.$coverImage}) center/cover no-repeat;
  border-radius: 0 0 16px 16px;
  
  @media (max-width: 768px) {
    height: 200px;
    border-radius: 0;
  }
`;

const CoverOverlay = styled.div<{ $isDark: boolean; $profileType: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$isDark 
    ? 'linear-gradient(to bottom, transparent 0%, rgba(15, 23, 42, 0.4) 70%, rgba(15, 23, 42, 0.95) 100%)'
    : 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.15) 70%, rgba(255, 255, 255, 0.9) 100%)'
  };
  border-radius: 0 0 16px 16px;
  
  @media (max-width: 768px) {
    border-radius: 0;
  }
`;

const ProfileInfoSection = styled.div<{ $isDark: boolean }>`
  position: relative;
  background: ${props => props.$isDark ? '#0F172A' : '#FFFFFF'};
  border-bottom: 1px solid ${props => props.$isDark ? '#1E293B' : '#E2E8F0'};
  transition: all 0.3s ease;
`;

const ProfileInfoContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px 24px;
  display: flex;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 16px 20px;
  }
`;

const AvatarContainer = styled.div`
  flex-shrink: 0;
  margin-top: -80px;
  z-index: 10;

  @media (max-width: 768px) {
    margin-top: -60px;
  }
`;

const AvatarWrapper = styled.div<{ $profileType: string; $isDark: boolean }>`
  position: relative;
  width: 168px;
  height: 168px;
  border-radius: 50%;
  padding: 5px;
  background: ${props => getThemeGradient(props.$profileType)};
  box-shadow: ${props => props.$isDark 
    ? '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 4px #0F172A' 
    : '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 4px #FFFFFF'
  };

  @media (max-width: 768px) {
    width: 140px;
    height: 140px;
  }
`;

const ProfileAvatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  background: #1E293B;
`;

const VerifiedBadge = styled.div<{ $profileType: string }>`
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: ${props => getThemeColor(props.$profileType)};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 3px solid white;

  @media (max-width: 768px) {
    width: 34px;
    height: 34px;
    bottom: 8px;
    right: 8px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const InfoSection = styled.div`
  flex: 1;
  padding-top: 16px;
  min-width: 0;

  @media (max-width: 768px) {
    padding-top: 12px;
    width: 100%;
  }
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const BusinessName = styled.h1<{ $isDark: boolean }>`
  font-size: 32px;
  font-weight: 800;
  color: ${props => props.$isDark ? '#F8FAFC' : '#0F172A'};
  margin: 0;
  letter-spacing: -0.5px;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 26px;
  }
`;

const ProfileTypeBadge = styled.div<{ $profileType: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: ${props => getThemeColor(props.$profileType)};
  color: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ContactRow = styled.div<{ $isDark: boolean }>`
  display: flex;
  gap: 20px;
  margin-top: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 16px;
  }
`;

const ContactItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.$isDark ? '#94A3B8' : '#64748B'};
  font-size: 15px;
  transition: color 0.3s ease;

  svg {
    color: ${props => props.$isDark ? '#64748B' : '#94A3B8'};
    flex-shrink: 0;
  }
`;

const StatsRow = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 12px;
  }
`;

const StatItem = styled.div<{ $isDark: boolean; $verified?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${props => props.$verified 
    ? '#10B981' 
    : props.$isDark ? '#94A3B8' : '#64748B'
  };
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s ease;

  svg {
    color: ${props => props.$verified 
      ? '#10B981' 
      : props.$isDark ? '#64748B' : '#94A3B8'
    };
    flex-shrink: 0;
  }
`;

const StatDivider = styled.span<{ $isDark: boolean }>`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${props => props.$isDark ? '#475569' : '#CBD5E1'};

  @media (max-width: 768px) {
    display: none;
  }
`;

// ============================================================================
// BIO SECTION - Professional LinkedIn/Twitter Inspired Design
// ============================================================================

const BioSection = styled.div<{ $isDark: boolean; $profileType: string }>`
  position: relative;
  margin-top: 20px;
  padding: 20px 28px;
  background: ${props => props.$isDark 
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
    : 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.9) 100%)'
  };
  border-radius: 16px;
  border-left: 4px solid ${props => {
    switch(props.$profileType) {
      case 'dealer': return '#10B981';
      case 'company': return '#3B82F6';
      default: return '#F97316';
    }
  }};
  box-shadow: ${props => props.$isDark 
    ? '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    : '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
  };
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$isDark 
      ? '0 8px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
      : '0 8px 30px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
    };
  }

  @media (max-width: 768px) {
    padding: 16px 20px;
    margin-top: 16px;
  }
`;

const BioQuote = styled.span<{ $isDark: boolean; $end?: boolean }>`
  position: absolute;
  font-size: 48px;
  font-family: Georgia, 'Times New Roman', serif;
  color: ${props => props.$isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(100, 116, 139, 0.2)'};
  line-height: 1;
  user-select: none;
  pointer-events: none;
  
  ${props => props.$end ? `
    bottom: 8px;
    right: 16px;
    transform: rotate(180deg);
  ` : `
    top: 8px;
    left: 16px;
  `}

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const BioText = styled.p<{ $isDark: boolean }>`
  margin: 0;
  padding: 0 24px;
  font-size: 15px;
  line-height: 1.7;
  color: ${props => props.$isDark ? '#E2E8F0' : '#334155'};
  font-style: italic;
  text-align: center;
  white-space: pre-wrap;
  word-break: break-word;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 0 16px;
    line-height: 1.6;
  }
`;

export default PublicProfileHero;

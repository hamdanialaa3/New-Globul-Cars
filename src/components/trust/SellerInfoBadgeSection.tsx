/**
 * Seller Info Badge Section
 * عرض معلومات وشارات البائع في قائمة السيارات
 * 
 * Integrated component that shows:
 * - Seller name with verified badge
 * - Trust score
 * - All earned badges
 * - Verification level indicator
 * 
 * Usage: Place in CarListingCard.tsx under seller info section
 * @since January 17, 2026
 */

import React from 'react';
import styled from 'styled-components';
import { MapPin, MessageSquare } from 'lucide-react';
import { SellerBadgeDisplay } from './SellerBadgeDisplay';
import { BulgarianTrustService } from '@/services/bulgarian-trust-service';
import { UserProfile } from '@/types/user.types';
import { logger } from '@/services/logger-service';

interface SellerInfoBadgeSectionProps {
  seller: UserProfile;
  compact?: boolean;
  showContactButton?: boolean;
  onContact?: () => void;
}

// ==================== STYLES ====================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const SellerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SellerImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
`;

const SellerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SellerName = styled.div`
  font-weight: 700;
  font-size: 14px;
  color: #1f2937;
`;

const SellerLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
`;

const SellerActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ContactButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const BadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0;
`;

const ResponseMetrics = styled.div`
  display: flex;
  gap: 16px;
  padding: 8px 0;
  font-size: 12px;
  color: #6b7280;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
`;

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  strong {
    color: #1f2937;
    margin-right: 4px;
  }
`;

// ==================== MAIN COMPONENT ====================

export const SellerInfoBadgeSection: React.FC<SellerInfoBadgeSectionProps> = ({
  seller,
  compact = false,
  showContactButton = true,
  onContact
}) => {
  const [trustData, setTrustData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadTrustData = async () => {
      try {
        if (seller.uid) {
          const data = await BulgarianTrustService.getTrustBadges(seller.uid);
          setTrustData(data);
        }
      } catch (error) {
        logger.error('Failed to load trust data', error as Error);
      } finally {
        setLoading(false);
      }
    };

    loadTrustData();
  }, [seller.uid]);

  if (loading) {
    return null;
  }

  const badges = trustData?.badges || [];
  const trustScore = trustData?.score || 0;
  const verificationLevel = trustData?.verificationLevel || 'basic';
  const responseTime = trustData?.averageResponseTime || null;
  const responseRate = trustData?.responseRate || null;

  return (
    <Container>
      {/* Seller Header */}
      <SellerHeader>
        <SellerInfo>
          {seller.profileImage && (
            <SellerImage src={seller.profileImage} alt={seller.displayName} />
          )}
          <SellerDetails>
            <SellerName>{seller.displayName}</SellerName>
            {seller.city && (
              <SellerLocation>
                <MapPin size={12} />
                {seller.city}
              </SellerLocation>
            )}
          </SellerDetails>
        </SellerInfo>

        {showContactButton && (
          <SellerActions>
            <ContactButton onClick={onContact}>
              <MessageSquare size={14} />
              Contact
            </ContactButton>
          </SellerActions>
        )}
      </SellerHeader>

      {/* Badges Display */}
      {(badges.length > 0 || trustScore > 0 || verificationLevel !== 'basic') && (
        <BadgesContainer>
          <SellerBadgeDisplay
            badges={badges}
            sellerScore={trustScore}
            verificationLevel={verificationLevel as any}
            compact={compact}
            showTooltip={true}
          />
        </BadgesContainer>
      )}

      {/* Response Metrics */}
      {(responseTime || responseRate) && (
        <ResponseMetrics>
          {responseRate && (
            <MetricItem>
              <strong>{responseRate}%</strong>
              Response Rate
            </MetricItem>
          )}
          {responseTime && (
            <MetricItem>
              <strong>~{responseTime}h</strong>
              Avg Response
            </MetricItem>
          )}
        </ResponseMetrics>
      )}
    </Container>
  );
};

export default SellerInfoBadgeSection;

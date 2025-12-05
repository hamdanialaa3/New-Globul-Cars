/**
 * Campaign Card Component
 */

import React from 'react';
import styled from 'styled-components';
import { Campaign, CampaignStatus } from '@globul-cars/services/campaigns';
import { Play, Pause, Trash2, Edit, Eye, MousePointer, TrendingUp, Calendar } from 'lucide-react';
import { useTranslation } from '@globul-cars/coreuseTranslation';

interface CampaignCardProps {
  campaign: Campaign;
  onEdit?: (campaign: Campaign) => void;
  onDelete?: (campaignId: string) => void;
  onToggleStatus?: (campaignId: string, status: CampaignStatus) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const { language } = useTranslation();

  const handleToggle = () => {
    if (onToggleStatus) {
      const newStatus = campaign.status === CampaignStatus.ACTIVE 
        ? CampaignStatus.PAUSED 
        : CampaignStatus.ACTIVE;
      onToggleStatus(campaign.id, newStatus);
    }
  };

  const getStatusColor = () => {
    switch (campaign.status) {
      case CampaignStatus.ACTIVE: return '#16a34a';
      case CampaignStatus.PAUSED: return '#f59e0b';
      case CampaignStatus.COMPLETED: return '#3b82f6';
      case CampaignStatus.CANCELLED: return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (campaign.status) {
      case CampaignStatus.ACTIVE: return language === 'bg' ? 'Активна' : 'Active';
      case CampaignStatus.PAUSED: return language === 'bg' ? 'На пауза' : 'Paused';
      case CampaignStatus.COMPLETED: return language === 'bg' ? 'Завършена' : 'Completed';
      case CampaignStatus.CANCELLED: return language === 'bg' ? 'Отменена' : 'Cancelled';
      default: return language === 'bg' ? 'Чернова' : 'Draft';
    }
  };

  const getTypeText = () => {
    switch (campaign.type) {
      case 'car_listing': return language === 'bg' ? 'Обява' : 'Car Listing';
      case 'profile_boost': return language === 'bg' ? 'Профил' : 'Profile Boost';
      case 'featured': return language === 'bg' ? 'Препоръчани' : 'Featured';
      case 'homepage': return language === 'bg' ? 'Начална' : 'Homepage';
      default: return campaign.type;
    }
  };

  const remainingBudget = campaign.budget - campaign.spent;
  const budgetPercent = Math.min((campaign.spent / campaign.budget) * 100, 100);

  // Calculate days remaining
  const now = new Date();
  const endDate = campaign.endDate.toDate();
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <Card>
      <CardHeader>
        <TitleSection>
          <TitleRow>
            <Title>{campaign.title}</Title>
            <TypeBadge>{getTypeText()}</TypeBadge>
          </TitleRow>
          <StatusBadge $status={campaign.status} $color={getStatusColor()}>
            <StatusDot $color={getStatusColor()} />
            {getStatusText()}
          </StatusBadge>
        </TitleSection>
        <Actions>
          {(campaign.status === CampaignStatus.ACTIVE || campaign.status === CampaignStatus.PAUSED) && (
            <ActionButton 
              onClick={handleToggle}
              title={campaign.status === CampaignStatus.ACTIVE ? 'Pause' : 'Resume'}
            >
              {campaign.status === CampaignStatus.ACTIVE ? <Pause size={18} /> : <Play size={18} />}
            </ActionButton>
          )}
          {onEdit && campaign.status !== CampaignStatus.COMPLETED && (
            <ActionButton onClick={() => onEdit(campaign)} title="Edit">
              <Edit size={18} />
            </ActionButton>
          )}
          {onDelete && (
            <ActionButton onClick={() => onDelete(campaign.id)} title="Delete" $danger>
              <Trash2 size={18} />
            </ActionButton>
          )}
        </Actions>
      </CardHeader>

      {campaign.description && (
        <Description>{campaign.description}</Description>
      )}

      <MetricsGrid>
        <MetricCard>
          <MetricIcon><Eye size={20} color="#6b7280" /></MetricIcon>
          <MetricValue>{campaign.impressions.toLocaleString()}</MetricValue>
          <MetricLabel>{language === 'bg' ? 'Импресии' : 'Impressions'}</MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricIcon><MousePointer size={20} color="#6b7280" /></MetricIcon>
          <MetricValue>{campaign.clicks.toLocaleString()}</MetricValue>
          <MetricLabel>{language === 'bg' ? 'Кликове' : 'Clicks'}</MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricIcon><TrendingUp size={20} color="#6b7280" /></MetricIcon>
          <MetricValue>{campaign.ctr.toFixed(2)}%</MetricValue>
          <MetricLabel>CTR</MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricIcon><Calendar size={20} color="#6b7280" /></MetricIcon>
          <MetricValue>{daysRemaining}</MetricValue>
          <MetricLabel>{language === 'bg' ? 'Дни' : 'Days'}</MetricLabel>
        </MetricCard>
      </MetricsGrid>

      <BudgetSection>
        <BudgetHeader>
          <BudgetLabel>{language === 'bg' ? 'Бюджет' : 'Budget'}</BudgetLabel>
          <BudgetValues>
            <Spent>€{campaign.spent.toFixed(2)}</Spent>
            <Separator>/</Separator>
            <Total>€{campaign.budget.toFixed(2)}</Total>
          </BudgetValues>
        </BudgetHeader>
        <ProgressBar>
          <ProgressFill $percent={budgetPercent} />
        </ProgressBar>
        <BudgetFooter>
          <RemainingText $positive={remainingBudget > 0}>
            {language === 'bg' ? 'Оставащи' : 'Remaining'}: €{Math.max(0, remainingBudget).toFixed(2)}
          </RemainingText>
          <PerformanceText>
            {campaign.roi > 0 ? '+' : ''}{campaign.roi.toFixed(1)}% ROI
          </PerformanceText>
        </BudgetFooter>
      </BudgetSection>

      {campaign.targetRegions && campaign.targetRegions.length > 0 && (
        <TargetingInfo>
          <TargetingLabel>{language === 'bg' ? 'Целеви региони:' : 'Target regions:'}</TargetingLabel>
          <RegionTags>
            {campaign.targetRegions.slice(0, 3).map((region, index) => (
              <RegionTag key={index}>{region}</RegionTag>
            ))}
            {campaign.targetRegions.length > 3 && (
              <RegionTag>+{campaign.targetRegions.length - 3}</RegionTag>
            )}
          </RegionTags>
        </TargetingInfo>
      )}
    </Card>
  );
};

// Styled Components
const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
`;

const TitleSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
`;

const TypeBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: #f3f4f6;
  color: #6b7280;
  letter-spacing: 0.5px;
`;

const StatusBadge = styled.div<{ $status: string; $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
`;

const StatusDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$color};
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 10px;
  background: ${props => props.$danger ? '#fee2e2' : '#f3f4f6'};
  color: ${props => props.$danger ? '#dc2626' : '#6b7280'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$danger ? '#fecaca' : '#e5e7eb'};
    color: ${props => props.$danger ? '#b91c1c' : '#374151'};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Description = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const MetricCard = styled.div`
  text-align: center;
  padding: 16px 12px;
  background: #f9fafb;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    transform: translateY(-2px);
  }
`;

const MetricIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const BudgetSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
`;

const BudgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const BudgetLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

const BudgetValues = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Spent = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #ef4444;
`;

const Separator = styled.span`
  color: #d1d5db;
  font-weight: 500;
`;

const Total = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
`;

const ProgressBar = styled.div`
  height: 10px;
  background: #e5e7eb;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${props => props.$percent}%;
  background: ${props => 
    props.$percent > 90 
      ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
      : props.$percent > 70
      ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
      : 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
  };
  transition: width 0.5s ease;
  border-radius: 5px;
`;

const BudgetFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RemainingText = styled.div<{ $positive: boolean }>`
  font-size: 13px;
  color: ${props => props.$positive ? '#16a34a' : '#ef4444'};
  font-weight: 600;
`;

const PerformanceText = styled.div`
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
`;

const TargetingInfo = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

const TargetingLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
  font-weight: 500;
`;

const RegionTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const RegionTag = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
`;

export default CampaignCard;

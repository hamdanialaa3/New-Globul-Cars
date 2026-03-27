import { logger } from '../../../services/logger-service';
/**
 * Campaigns List Component
 * Displays all user campaigns with filters and actions
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Campaign, CampaignStatus, campaignService, CampaignAnalytics } from '../../../services/campaigns';
import CampaignCard from './CampaignCard';
import CreateCampaignModal from './CreateCampaignModal';
import { Plus, TrendingUp, Eye, MousePointer, DollarSign } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

interface CampaignsListProps {
  userId: string;
}

const CampaignsList: React.FC<CampaignsListProps> = ({ userId }) => {
  const { language } = useTranslation();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | CampaignStatus>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | undefined>();

  // Load campaigns
  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const userCampaigns = await campaignService.getUserCampaigns(userId);
      setCampaigns(userCampaigns);

      const analyticsData = await campaignService.getCampaignAnalytics(userId);
      setAnalytics(analyticsData);
    } catch (error) {
      logger.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleCreateSuccess = (campaignId: string) => {
    loadCampaigns();
    setShowCreateModal(false);
    setEditingCampaign(undefined);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowCreateModal(true);
  };

  const handleDelete = async (campaignId: string) => {
    if (window.confirm(language === 'bg' 
      ? 'Сигурни ли сте, че искате да изтриете тази кампания?' 
      : 'Are you sure you want to delete this campaign?'
    )) {
      try {
        await campaignService.deleteCampaign(campaignId);
        loadCampaigns();
      } catch (error) {
        logger.error('Error deleting campaign:', error);
      }
    }
  };

  const handleToggleStatus = async (campaignId: string, status: CampaignStatus) => {
    try {
      await campaignService.updateCampaignStatus(campaignId, status);
      loadCampaigns();
    } catch (error) {
      logger.error('Error updating campaign status:', error);
    }
  };

  const filteredCampaigns = filter === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.status === filter);

  const getFilterLabel = (status: 'all' | CampaignStatus) => {
    switch (status) {
      case 'all': return language === 'bg' ? 'Всички' : 'All';
      case CampaignStatus.ACTIVE: return language === 'bg' ? 'Активни' : 'Active';
      case CampaignStatus.PAUSED: return language === 'bg' ? 'На пауза' : 'Paused';
      case CampaignStatus.COMPLETED: return language === 'bg' ? 'Завършени' : 'Completed';
      case CampaignStatus.DRAFT: return language === 'bg' ? 'Чернови' : 'Drafts';
      case CampaignStatus.CANCELLED: return language === 'bg' ? 'Отменени' : 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      {/* Analytics Overview */}
      {analytics && campaigns.length > 0 && (
        <AnalyticsSection>
          <AnalyticsCard>
            <AnalyticsIcon $color="#2563eb">
              <TrendingUp size={24} />
            </AnalyticsIcon>
            <AnalyticsContent>
              <AnalyticsValue>{analytics.activeCampaigns}</AnalyticsValue>
              <AnalyticsLabel>{language === 'bg' ? 'Активни' : 'Active'}</AnalyticsLabel>
            </AnalyticsContent>
          </AnalyticsCard>

          <AnalyticsCard>
            <AnalyticsIcon $color="#10b981">
              <Eye size={24} />
            </AnalyticsIcon>
            <AnalyticsContent>
              <AnalyticsValue>{analytics.totalImpressions.toLocaleString()}</AnalyticsValue>
              <AnalyticsLabel>{language === 'bg' ? 'Импресии' : 'Impressions'}</AnalyticsLabel>
            </AnalyticsContent>
          </AnalyticsCard>

          <AnalyticsCard>
            <AnalyticsIcon $color="#f59e0b">
              <MousePointer size={24} />
            </AnalyticsIcon>
            <AnalyticsContent>
              <AnalyticsValue>{analytics.totalClicks.toLocaleString()}</AnalyticsValue>
              <AnalyticsLabel>{language === 'bg' ? 'Кликове' : 'Clicks'}</AnalyticsLabel>
            </AnalyticsContent>
          </AnalyticsCard>

          <AnalyticsCard>
            <AnalyticsIcon $color="#ef4444">
              <DollarSign size={24} />
            </AnalyticsIcon>
            <AnalyticsContent>
              <AnalyticsValue>€{analytics.totalSpent.toFixed(2)}</AnalyticsValue>
              <AnalyticsLabel>{language === 'bg' ? 'Изразходвано' : 'Spent'}</AnalyticsLabel>
            </AnalyticsContent>
          </AnalyticsCard>
        </AnalyticsSection>
      )}

      {/* Header with Filters */}
      <Header>
        <HeaderLeft>
          <Title>
            {language === 'bg' ? 'Моите кампании' : 'My Campaigns'}
          </Title>
          <FilterContainer>
            <FilterButton
              $active={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              {getFilterLabel('all')} ({campaigns.length})
            </FilterButton>
            <FilterButton
              $active={filter === CampaignStatus.ACTIVE}
              onClick={() => setFilter(CampaignStatus.ACTIVE)}
            >
              {getFilterLabel(CampaignStatus.ACTIVE)} ({campaigns.filter(c => c.status === CampaignStatus.ACTIVE).length})
            </FilterButton>
            <FilterButton
              $active={filter === CampaignStatus.PAUSED}
              onClick={() => setFilter(CampaignStatus.PAUSED)}
            >
              {getFilterLabel(CampaignStatus.PAUSED)} ({campaigns.filter(c => c.status === CampaignStatus.PAUSED).length})
            </FilterButton>
            <FilterButton
              $active={filter === CampaignStatus.COMPLETED}
              onClick={() => setFilter(CampaignStatus.COMPLETED)}
            >
              {getFilterLabel(CampaignStatus.COMPLETED)} ({campaigns.filter(c => c.status === CampaignStatus.COMPLETED).length})
            </FilterButton>
          </FilterContainer>
        </HeaderLeft>
        
        <CreateButton onClick={() => {
          setEditingCampaign(undefined);
          setShowCreateModal(true);
        }}>
          <Plus size={20} />
          {language === 'bg' ? 'Нова кампания' : 'New Campaign'}
        </CreateButton>
      </Header>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <TrendingUp size={64} />
          </EmptyIcon>
          <EmptyTitle>
            {filter === 'all'
              ? (language === 'bg' ? 'Няма кампании' : 'No campaigns yet')
              : (language === 'bg' ? `Няма ${getFilterLabel(filter).toLowerCase()} кампании` : `No ${getFilterLabel(filter).toLowerCase()} campaigns`)
            }
          </EmptyTitle>
          <EmptyText>
            {filter === 'all'
              ? (language === 'bg' 
                  ? 'Създайте вашата първа рекламна кампания за да увеличите видимостта на вашите обяви' 
                  : 'Create your first advertising campaign to increase visibility of your listings')
              : (language === 'bg'
                  ? 'Изберете друг филтър за да видите други кампании'
                  : 'Select another filter to see other campaigns')
            }
          </EmptyText>
          {filter === 'all' && (
            <CreateButton onClick={() => {
              setEditingCampaign(undefined);
              setShowCreateModal(true);
            }}>
              <Plus size={20} />
              {language === 'bg' ? 'Създай кампания' : 'Create Campaign'}
            </CreateButton>
          )}
        </EmptyState>
      ) : (
        <CampaignsGrid>
          {filteredCampaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </CampaignsGrid>
      )}

      {/* Create/Edit Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCampaign(undefined);
        }}
        onSuccess={handleCreateSuccess}
        userId={userId}
        existingCampaign={editingCampaign}
      />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 24px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: 16px;
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
`;

const AnalyticsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const AnalyticsCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const AnalyticsIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
`;

const AnalyticsContent = styled.div`
  flex: 1;
`;

const AnalyticsValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 6px;
`;

const AnalyticsLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;
  flex-wrap: wrap;
`;

const HeaderLeft = styled.div`
  flex: 1;
  min-width: 300px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: 2px solid ${props => props.$active ? '#3B82F6' : '#e5e7eb'};
  border-radius: 20px;
  background: ${props => props.$active ? '#3B82F6' : 'white'};
  color: ${props => props.$active ? 'white' : '#6b7280'};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#ff7a00' : '#f9fafb'};
    border-color: #3B82F6;
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CampaignsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  color: #d1d5db;
  margin-bottom: 24px;
`;

const EmptyTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: #6b7280;
  max-width: 500px;
  line-height: 1.6;
  margin-bottom: 32px;
`;

export default CampaignsList;



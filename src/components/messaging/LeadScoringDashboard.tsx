import { logger } from '../../services/logger-service';
// src/components/messaging/LeadScoringDashboard.tsx
// Lead Scoring Dashboard Component
// Connected to Backend P2.1 Lead Scoring System

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  getLeads,
  updateLeadStatus,
  Lead,
} from '../../services/messaging/cloud-messaging-service';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div<{ $color?: string }>`
  background: ${props => props.$color || 'white'};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: white;
`;

const FiltersBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border: 2px solid ${props => props.$active ? '#4267b2' : '#e0e0e0'};
  background: ${props => props.$active ? '#f0f4ff' : 'white'};
  color: ${props => props.$active ? '#4267b2' : '#666'};
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #4267b2;
    background: #f0f4ff;
  }
`;

const LeadsGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const LeadCard = styled.div<{ $priority?: string }>`
  border-left: 4px solid ${props => 
    props.$priority === 'hot' ? '#f44336' :
    props.$priority === 'warm' ? '#ff9800' :
    '#2196f3'
  };
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const LeadHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 16px;
`;

const LeadInfo = styled.div`
  flex: 1;
`;

const LeadId = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
`;

const ConversationId = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const PriorityBadge = styled.span<{ $priority?: string }>`
  background: ${props => 
    props.$priority === 'hot' ? '#f44336' :
    props.$priority === 'warm' ? '#ff9800' :
    '#2196f3'
  };
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
`;

const ScoreCircle = styled.div<{ $score?: number }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => 
    props.$score && props.$score >= 70 ? 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)' :
    props.$score && props.$score >= 40 ? 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)' :
    'linear-gradient(135deg, #2196f3 0%, #00bcd4 100%)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ScoreBreakdown = styled.div`
  flex: 1;
`;

const ScoreItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ScoreLabel = styled.span`
  font-size: 12px;
  color: #666;
`;

const ScoreBar = styled.div`
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin: 0 12px;
  overflow: hidden;
`;

const ScoreBarFill = styled.div<{ $width?: number; $color?: string }>`
  width: ${props => props.$width || 0}%;
  height: 100%;
  background: ${props => props.$color || '#4267b2'};
  transition: width 0.3s;
`;

const ScoreValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #333;
  min-width: 30px;
  text-align: right;
`;

const StatusSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4267b2;
  }
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  min-height: 60px;
  resize: vertical;
  margin-top: 12px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #4267b2;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => props.$variant === 'primary' ? `
    background: #4267b2;
    color: white;
    &:hover {
      background: #365899;
    }
  ` : `
    background: #f0f0f0;
    color: #666;
    &:hover {
      background: #e0e0e0;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const LastActivity = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 8px;
`;

// ==================== COMPONENT ====================

interface Props {
  language?: 'bg' | 'en';
}

const LeadScoringDashboard: React.FC<Props> = ({ language = 'bg' }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<{ [key: string]: string }>({});
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, priorityFilter, statusFilter]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const result = await getLeads();
      if (result.success && result.leads) {
        setLeads(result.leads);
        setStats(result.stats);
      }
    } catch (error) {
      logger.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(lead => lead.priority === priorityFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  };

  const handleUpdateStatus = async (leadId: string) => {
    const newStatus = editingStatus[leadId];
    const notes = editingNotes[leadId];

    if (!newStatus) return;

    try {
      const result = await updateLeadStatus(leadId, newStatus as any, notes);
      if (result.success) {
        await loadLeads();
        setExpandedLead(null);
        setEditingStatus({});
        setEditingNotes({});
      }
    } catch (error) {
      logger.error('Error updating lead status:', error);
    }
  };

  const toggleLead = (leadId: string) => {
    setExpandedLead(expandedLead === leadId ? null : leadId);
  };

  const getPriorityText = (priority: string): string => {
    const texts: Record<string, { bg: string; en: string }> = {
      hot: { bg: 'Горещ', en: 'Hot' },
      warm: { bg: 'Топъл', en: 'Warm' },
      cold: { bg: 'Студен', en: 'Cold' },
    };
    return texts[priority]?.[language] || priority;
  };

  const getStatusText = (status: string): string => {
    const texts: Record<string, { bg: string; en: string }> = {
      new: { bg: 'Нов', en: 'New' },
      contacted: { bg: 'Контактиран', en: 'Contacted' },
      qualified: { bg: 'Квалифициран', en: 'Qualified' },
      negotiating: { bg: 'Преговаряне', en: 'Negotiating' },
      won: { bg: 'Спечелен', en: 'Won' },
      lost: { bg: 'Загубен', en: 'Lost' },
    };
    return texts[status]?.[language] || status;
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(language === 'bg' ? 'bg-BG' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <Container>
      <Header>
        <Title>{language === 'bg' ? 'Оценка на Клиенти' : 'Lead Scoring'}</Title>
      </Header>

      {stats && (
        <StatsGrid>
          <StatCard $color="linear-gradient(135deg, #f44336 0%, #e91e63 100%)">
            <StatLabel>{language === 'bg' ? 'Горещи' : 'Hot'}</StatLabel>
            <StatValue>{stats.hot || 0}</StatValue>
          </StatCard>

          <StatCard $color="linear-gradient(135deg, #ff9800 0%, #ff5722 100%)">
            <StatLabel>{language === 'bg' ? 'Топли' : 'Warm'}</StatLabel>
            <StatValue>{stats.warm || 0}</StatValue>
          </StatCard>

          <StatCard $color="linear-gradient(135deg, #2196f3 0%, #00bcd4 100%)">
            <StatLabel>{language === 'bg' ? 'Студени' : 'Cold'}</StatLabel>
            <StatValue>{stats.cold || 0}</StatValue>
          </StatCard>

          <StatCard $color="linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)">
            <StatLabel>{language === 'bg' ? 'Спечелени' : 'Won'}</StatLabel>
            <StatValue>{stats.won || 0}</StatValue>
          </StatCard>
        </StatsGrid>
      )}

      <FiltersBar>
        <FilterButton
          $active={priorityFilter === 'all'}
          onClick={() => setPriorityFilter('all')}
        >
          {language === 'bg' ? 'Всички' : 'All'}
        </FilterButton>
        <FilterButton
          $active={priorityFilter === 'hot'}
          onClick={() => setPriorityFilter('hot')}
        >
          🔥 {language === 'bg' ? 'Горещи' : 'Hot'}
        </FilterButton>
        <FilterButton
          $active={priorityFilter === 'warm'}
          onClick={() => setPriorityFilter('warm')}
        >
          ☀️ {language === 'bg' ? 'Топли' : 'Warm'}
        </FilterButton>
        <FilterButton
          $active={priorityFilter === 'cold'}
          onClick={() => setPriorityFilter('cold')}
        >
          ❄️ {language === 'bg' ? 'Студени' : 'Cold'}
        </FilterButton>
      </FiltersBar>

      <FiltersBar>
        <FilterButton $active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
          {language === 'bg' ? 'Всички статуси' : 'All Statuses'}
        </FilterButton>
        <FilterButton $active={statusFilter === 'new'} onClick={() => setStatusFilter('new')}>
          {getStatusText('new')}
        </FilterButton>
        <FilterButton $active={statusFilter === 'contacted'} onClick={() => setStatusFilter('contacted')}>
          {getStatusText('contacted')}
        </FilterButton>
        <FilterButton $active={statusFilter === 'qualified'} onClick={() => setStatusFilter('qualified')}>
          {getStatusText('qualified')}
        </FilterButton>
        <FilterButton $active={statusFilter === 'negotiating'} onClick={() => setStatusFilter('negotiating')}>
          {getStatusText('negotiating')}
        </FilterButton>
      </FiltersBar>

      {loading ? (
        <LoadingState>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</LoadingState>
      ) : filteredLeads.length === 0 ? (
        <EmptyState>
          {language === 'bg' ? 'Няма намерени клиенти' : 'No leads found'}
        </EmptyState>
      ) : (
        <LeadsGrid>
          {filteredLeads.map(lead => (
            <LeadCard key={lead.id} $priority={lead.priority} onClick={() => toggleLead(lead.id)}>
              <LeadHeader>
                <LeadInfo>
                  <LeadId>ID: {lead.id.substring(0, 8)}...</LeadId>
                  <ConversationId>{lead.conversationId.substring(0, 12)}...</ConversationId>
                  <LastActivity>
                    {language === 'bg' ? 'Последна активност' : 'Last activity'}: {formatDate(lead.lastActivity)}
                  </LastActivity>
                </LeadInfo>
                <PriorityBadge $priority={lead.priority}>
                  {getPriorityText(lead.priority)}
                </PriorityBadge>
              </LeadHeader>

              {expandedLead === lead.id && (
                <>
                  <ScoreDisplay onClick={(e) => e.stopPropagation()}>
                    <ScoreCircle $score={lead.score}>{lead.score}</ScoreCircle>
                    <ScoreBreakdown>
                      <ScoreItem>
                        <ScoreLabel>{language === 'bg' ? 'Ангажираност' : 'Engagement'}</ScoreLabel>
                        <ScoreBar>
                          <ScoreBarFill $width={(lead.scoreBreakdown.engagement / 30) * 100} $color="#4267b2" />
                        </ScoreBar>
                        <ScoreValue>{lead.scoreBreakdown.engagement}/30</ScoreValue>
                      </ScoreItem>

                      <ScoreItem>
                        <ScoreLabel>{language === 'bg' ? 'Отговор' : 'Response'}</ScoreLabel>
                        <ScoreBar>
                          <ScoreBarFill $width={(lead.scoreBreakdown.responseTime / 20) * 100} $color="#00bcd4" />
                        </ScoreBar>
                        <ScoreValue>{lead.scoreBreakdown.responseTime}/20</ScoreValue>
                      </ScoreItem>

                      <ScoreItem>
                        <ScoreLabel>{language === 'bg' ? 'Сериозност' : 'Seriousness'}</ScoreLabel>
                        <ScoreBar>
                          <ScoreBarFill $width={(lead.scoreBreakdown.seriousness / 25) * 100} $color="#ff9800" />
                        </ScoreBar>
                        <ScoreValue>{lead.scoreBreakdown.seriousness}/25</ScoreValue>
                      </ScoreItem>

                      <ScoreItem>
                        <ScoreLabel>{language === 'bg' ? 'Бюджет' : 'Budget'}</ScoreLabel>
                        <ScoreBar>
                          <ScoreBarFill $width={(lead.scoreBreakdown.budget / 25) * 100} $color="#4caf50" />
                        </ScoreBar>
                        <ScoreValue>{lead.scoreBreakdown.budget}/25</ScoreValue>
                      </ScoreItem>
                    </ScoreBreakdown>
                  </ScoreDisplay>

                  <StatusSelect
                    value={editingStatus[lead.id] || lead.status}
                    onChange={(e) => setEditingStatus({ ...editingStatus, [lead.id]: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="new">{getStatusText('new')}</option>
                    <option value="contacted">{getStatusText('contacted')}</option>
                    <option value="qualified">{getStatusText('qualified')}</option>
                    <option value="negotiating">{getStatusText('negotiating')}</option>
                    <option value="won">{getStatusText('won')}</option>
                    <option value="lost">{getStatusText('lost')}</option>
                  </StatusSelect>

                  <NotesTextarea
                    placeholder={language === 'bg' ? 'Добави бележки...' : 'Add notes...'}
                    value={editingNotes[lead.id] || lead.notes || ''}
                    onChange={(e) => setEditingNotes({ ...editingNotes, [lead.id]: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                  />

                  <Actions onClick={(e) => e.stopPropagation()}>
                    <Button $variant="secondary" onClick={() => toggleLead(lead.id)}>
                      {language === 'bg' ? 'Затвори' : 'Close'}
                    </Button>
                    <Button
                      $variant="primary"
                      onClick={() => handleUpdateStatus(lead.id)}
                      disabled={!editingStatus[lead.id] || editingStatus[lead.id] === lead.status}
                    >
                      {language === 'bg' ? 'Обнови' : 'Update'}
                    </Button>
                  </Actions>
                </>
              )}
            </LeadCard>
          ))}
        </LeadsGrid>
      )}
    </Container>
  );
};

export default LeadScoringDashboard;

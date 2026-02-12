/**
 * Team Stats Component
 * Overview dashboard for team metrics
 * Target: 120 lines
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { teamManagementService } from '@/services/company/team-management-service';
import { FaUsers, FaUserCheck, FaClock, FaShieldAlt, FaUserTie, FaEye } from 'react-icons/fa';
import { logger } from '@/services/logger-service';

interface Props {
  companyId: string;
}

interface Stats {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  adminCount: number;
  agentCount: number;
  viewerCount: number;
}

export const TeamStats: React.FC<Props> = ({ companyId }) => {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingInvites: 0,
    adminCount: 0,
    agentCount: 0,
    viewerCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await teamManagementService.getTeamStats(companyId);
        setStats(data);
      } catch (error) {
        logger.error('Failed to fetch team stats', error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [companyId]);

  if (loading) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container>
      <StatCard color="#3b82f6">
        <Icon><FaUsers /></Icon>
        <Content>
          <Value>{stats.totalMembers}</Value>
          <Label>Total Members</Label>
        </Content>
      </StatCard>

      <StatCard color="#10b981">
        <Icon><FaUserCheck /></Icon>
        <Content>
          <Value>{stats.activeMembers}</Value>
          <Label>Active Members</Label>
        </Content>
      </StatCard>

      <StatCard color="#f59e0b">
        <Icon><FaClock /></Icon>
        <Content>
          <Value>{stats.pendingInvites}</Value>
          <Label>Pending Invites</Label>
        </Content>
      </StatCard>

      <StatCard color="#8b5cf6">
        <Icon><FaShieldAlt /></Icon>
        <Content>
          <Value>{stats.adminCount}</Value>
          <Label>Admins</Label>
        </Content>
      </StatCard>

      <StatCard color="#06b6d4">
        <Icon><FaUserTie /></Icon>
        <Content>
          <Value>{stats.agentCount}</Value>
          <Label>Agents</Label>
        </Content>
      </StatCard>

      <StatCard color="#6b7280">
        <Icon><FaEye /></Icon>
        <Content>
          <Value>{stats.viewerCount}</Value>
          <Label>Viewers</Label>
        </Content>
      </StatCard>
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{ color: string }>`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-top: 4px solid ${props => props.color};
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const Icon = styled.div`
  font-size: 2rem;
  color: inherit;
`;

const Content = styled.div`
  flex: 1;
`;

const Value = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const Label = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

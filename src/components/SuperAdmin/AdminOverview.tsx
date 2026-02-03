import React from 'react';
import styled from 'styled-components';
import {
  Users,
  Car,
  MessageSquare,
  Eye,
  DollarSign,
  TrendingUp,
  Activity,
  MapPin,
  Clock
} from 'lucide-react';
import { RealTimeAnalytics, UserActivity } from '../../services/super-admin-types';

interface AdminOverviewProps {
  analytics: RealTimeAnalytics | null;
  userActivity: UserActivity[];
  onUserClick: (user: any) => void;
}

const OverviewContainer = styled.div`
  background: #0f1419;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 24px;
  margin: 0 20px 20px 20px;
  color: #f8fafc;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: #1e2432;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #ff8c61;
    background: #252b3a;
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  background: #252b3a;
  color: #ff8c61;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 20px;
  border: 1px solid #2d3748;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 6px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #cbd5e1;
  font-weight: 600;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatChange = styled.div<{ $positive: boolean }>`
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.$positive ? '#4ade80' : '#f87171'};
`;

const SectionTitle = styled.h3`
  color: #ff8c61;
  font-size: 16px;
  font-weight: 700;
  margin: 32px 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const UserActivityTable = styled.div`
  background: #1e2432;
  border: 1px solid #2d3748;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const TableHeader = styled.div`
  background: #141a21;
  color: #cbd5e1;
  padding: 16px 20px;
  font-weight: 700;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  align-items: center;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const TableRow = styled.div`
  padding: 14px 20px;
  border-bottom: 1px solid #2d3748;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #252b3a;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #252b3a;
  color: #ff8c61;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  border: 1px solid #2d3748;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #f8fafc;
  font-size: 13px;
`;

const UserEmail = styled.div`
  color: #94a3b8;
  font-size: 11px;
`;

const StatusBadge = styled.div<{ $online: boolean }>`
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  background: ${props => props.$online ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)'};
  color: ${props => props.$online ? '#4ade80' : '#f87171'};
  border: 1px solid ${props => props.$online ? '#4ade80' : '#f87171'};
  text-transform: uppercase;
`;

const AdminOverview: React.FC<AdminOverviewProps> = ({
  analytics,
  userActivity,
  onUserClick
}) => {
  if (!analytics) {
    return (
      <OverviewContainer>
        <div style={{ textAlign: 'center', color: '#666666', fontSize: '14px' }}>
          Loading analytics data...
        </div>
      </OverviewContainer>
    );
  }

  return (
    <OverviewContainer>
      <StatsGrid>
        <StatCard>
          <StatIcon>
            <Users size={24} />
          </StatIcon>
          <StatValue>{analytics.totalUsers}</StatValue>
          <StatLabel>Total Users</StatLabel>
          <StatChange $positive={true}>+{analytics.activeUsers} active</StatChange>
        </StatCard>

        <StatCard>
          <StatIcon>
            <Car size={24} />
          </StatIcon>
          <StatValue>{analytics.totalCars}</StatValue>
          <StatLabel>Total Cars</StatLabel>
          <StatChange $positive={true}>+{analytics.activeCars} active</StatChange>
        </StatCard>

        <StatCard>
          <StatIcon>
            <MessageSquare size={24} />
          </StatIcon>
          <StatValue>{analytics.totalMessages}</StatValue>
          <StatLabel>Messages</StatLabel>
          <StatChange $positive={true}>Recent activity</StatChange>
        </StatCard>

        <StatCard>
          <StatIcon>
            <Eye size={24} />
          </StatIcon>
          <StatValue>{analytics.totalViews}</StatValue>
          <StatLabel>Total Views</StatLabel>
          <StatChange $positive={true}>Growing</StatChange>
        </StatCard>

        <StatCard>
          <StatIcon>
            <DollarSign size={24} />
          </StatIcon>
          <StatValue>€{analytics.revenue.toFixed(2)}</StatValue>
          <StatLabel>Revenue</StatLabel>
          <StatChange $positive={true}>+12% this month</StatChange>
        </StatCard>

        <StatCard>
          <StatIcon>
            <TrendingUp size={24} />
          </StatIcon>
          <StatValue>98.5%</StatValue>
          <StatLabel>Uptime</StatLabel>
          <StatChange $positive={true}>Excellent</StatChange>
        </StatCard>
      </StatsGrid>

      <SectionTitle>
        <Activity size={20} />
        Recent User Activity
      </SectionTitle>

      <UserActivityTable>
        <TableHeader>
          <div>User</div>
          <div>Status</div>
          <div>Location</div>
          <div>Last Login</div>
          <div>Activity</div>
        </TableHeader>

        {userActivity.slice(0, 5).map((user, index) => (
          <TableRow key={index} onClick={() => onUserClick(user)}>
            <UserInfo>
              <UserAvatar>
                {user.displayName?.charAt(0) || 'U'}
              </UserAvatar>
              <UserDetails>
                <UserName>{user.displayName || 'Unknown User'}</UserName>
                <UserEmail>{user.email || 'N/A'}</UserEmail>
              </UserDetails>
            </UserInfo>
            <StatusBadge $online={user.isOnline || false}>
              {user.isOnline ? 'Online' : 'Offline'}
            </StatusBadge>
            <div>{user.location || 'Unknown'}</div>
            <div>
              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
            </div>
            <div>
              {user.device || 'Unknown'} / {user.browser || 'Unknown'}
            </div>
          </TableRow>
        ))}
      </UserActivityTable>
    </OverviewContainer>
  );
};

export default AdminOverview;

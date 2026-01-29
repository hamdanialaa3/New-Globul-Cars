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
import { RealTimeAnalytics, UserActivity } from '../../services/super-admin-service';

interface AdminOverviewProps {
  analytics: RealTimeAnalytics | null;
  userActivity: UserActivity[];
  onUserClick: (user: any) => void;
}

const OverviewContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 24px;
  margin: 0 20px 20px 20px;
  color: #1a1a1a;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  text-align: center;
  transition: border-color 0.15s;
  
  &:hover {
    border-color: #999999;
  }
`;

const StatIcon = styled.div`
  background: #f5f5f5;
  color: #1a1a1a;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 20px;
  border: 1px solid #e0e0e0;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666666;
  font-weight: 500;
  margin-bottom: 8px;
`;

const StatChange = styled.div<{ $positive: boolean }>`
  font-size: 11px;
  font-weight: 500;
  color: ${props => props.$positive ? '#2d5a2d' : '#8b2d2d'};
`;

const SectionTitle = styled.h3`
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 600;
  margin: 24px 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserActivityTable = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  background: #f5f5f5;
  color: #1a1a1a;
  padding: 12px 16px;
  font-weight: 600;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  align-items: center;
  font-size: 12px;
`;

const TableRow = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.15s;
  
  &:hover {
    background: #f5f5f5;
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
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: #f5f5f5;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
  border: 1px solid #e0e0e0;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 500;
  color: #1a1a1a;
  font-size: 13px;
`;

const UserEmail = styled.div`
  color: #666666;
  font-size: 11px;
`;

const StatusBadge = styled.div<{ $online: boolean }>`
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => props.$online ? '#f0f9f0' : '#fff5f5'};
  color: ${props => props.$online ? '#2d5a2d' : '#8b2d2d'};
  border: 1px solid ${props => props.$online ? '#d0e8d0' : '#f0d0d0'};
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

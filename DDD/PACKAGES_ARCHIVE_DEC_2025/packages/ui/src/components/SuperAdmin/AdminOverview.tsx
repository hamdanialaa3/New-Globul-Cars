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
import { RealTimeAnalytics, UserActivity } from '@globul-cars/services/super-admin-service';

interface AdminOverviewProps {
  analytics: RealTimeAnalytics | null;
  userActivity: UserActivity[];
  onUserClick: (user: any) => void;
}

const OverviewContainer = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solidrgb(0, 170, 255);
  border-radius: 15px;
  padding: 30px;
  margin: 0 20px 20px 20px;
  box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
  color:rgb(0, 166, 255);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solidrgb(0, 106, 255);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
  color:rgb(0, 128, 255);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(255, 215, 0, 0.3);
  }
`;

const StatIcon = styled.div`
  background: linear-gradient(135deg,rgb(0, 170, 255) 0%,rgb(78, 196, 255) 100%);
  color: #000000;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 24px;
  border: 2px solidrgb(0, 157, 255);
  box-shadow: 0 3px 10px rgba(255, 215, 0, 0.3);
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  color:rgb(0, 162, 255);
  margin-bottom: 5px;
  text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
`;

const StatLabel = styled.div`
  font-size: 14px;
  color:rgb(0, 98, 255);
  font-weight: 600;
  margin-bottom: 10px;
`;

const StatChange = styled.div<{ $positive: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$positive ? '#ffd700' : '#ff6b6b'};
  text-shadow: 0 1px 2px rgba(255, 215, 0, 0.3);
`;

const SectionTitle = styled.h3`
  color: #ffd700;
  font-size: 20px;
  font-weight: 700;
  margin: 30px 0 20px 0;
  text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserActivityTable = styled.div`
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 2px solidrgb(0, 191, 255);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
`;

const TableHeader = styled.div`
  background: linear-gradient(135deg,rgb(0, 157, 255) 0%, #ffed4e 100%);
  color: #000000;
  padding: 15px 20px;
  font-weight: 700;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 15px;
  align-items: center;
`;

const TableRow = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solidrgb(0, 123, 255);
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 15px;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 215, 0, 0.1);
    transform: translateX(5px);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg,rgb(0, 183, 255) 0%,rgb(78, 146, 255) 100%);
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color:rgb(0, 195, 255);
  font-size: 14px;
`;

const UserEmail = styled.div`
  color:rgb(78, 211, 255);
  font-size: 12px;
  opacity: 0.8;
`;

const StatusBadge = styled.div<{ $online: boolean }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.$online ? '#4ade80' : '#f87171'};
  color: ${props => props.$online ? '#000000' : '#ffffff'};
`;

const AdminOverview: React.FC<AdminOverviewProps> = ({ 
  analytics, 
  userActivity, 
  onUserClick 
}) => {
  if (!analytics) {
    return (
      <OverviewContainer>
        <div style={{ textAlign: 'center', color: '#ffd700', fontSize: '18px' }}>
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

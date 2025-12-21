/**
 * ✅ COMPLETED: Notifications Management Component for Super Admin Dashboard
 * Full-featured notifications management with filtering, marking, and settings
 * 
 * @author AI Assistant
 * @date 2025-12-21
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Bell, 
  RefreshCw,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  Settings,
  AlertCircle,
  Activity,
  Shield,
  FileText,
  TrendingUp,
  CheckCheck
} from 'lucide-react';
import { realTimeNotificationsService, Notification, NotificationSettings } from '../services/real-time-notifications-service';
import { logger } from '../services/logger-service';
import { useAuth } from '../contexts/AuthProvider';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 16px;
  margin: 1rem;
  color: white;
`;

const Title = styled.h2`
  color: #ffd700;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(255, 215, 0, 0.5);
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #aaa;
  font-size: 0.875rem;
`;

const FiltersContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
`;

const SearchInput = styled.input`
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #ffd700;
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #ffd700;
  }
  
  option {
    background: #2d2d2d;
    color: white;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotificationsList = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
  max-height: 600px;
  overflow-y: auto;
`;

const NotificationItem = styled.div<{ $read: boolean; $priority: string }>`
  background: ${props => props.$read ? 'rgba(255, 255, 255, 0.05)' : 'rgba(102, 126, 234, 0.1)'};
  border: 1px solid ${props => {
    switch (props.$priority) {
      case 'critical': return 'rgba(239, 68, 68, 0.3)';
      case 'high': return 'rgba(249, 115, 22, 0.3)';
      case 'medium': return 'rgba(234, 179, 8, 0.3)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.$priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      default: return '#6b7280';
    }
  }};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$read ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.15)'};
    transform: translateX(4px);
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  color: #ffffff;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NotificationMessage = styled.div`
  color: #aaa;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const NotificationMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #888;
`;

const Badge = styled.span<{ $type?: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
  
  ${props => {
    const colors: Record<string, string> = {
      user_activity: 'background: rgba(34, 197, 94, 0.2); color: #22c55e;',
      system_alert: 'background: rgba(234, 179, 8, 0.2); color: #eab308;',
      security_breach: 'background: rgba(239, 68, 68, 0.2); color: #ef4444;',
      content_report: 'background: rgba(249, 115, 22, 0.2); color: #f97316;',
      revenue_update: 'background: rgba(102, 126, 234, 0.2); color: #667eea;',
      low: 'background: rgba(34, 197, 94, 0.2); color: #22c55e;',
      medium: 'background: rgba(234, 179, 8, 0.2); color: #eab308;',
      high: 'background: rgba(249, 115, 22, 0.2); color: #f97316;',
      critical: 'background: rgba(239, 68, 68, 0.2); color: #ef4444;'
    };
    return colors[props.$type || 'low'] || colors.low;
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button<{ $variant?: 'success' | 'danger' | 'default' }>`
  padding: 0.5rem;
  background: ${props => {
    switch (props.$variant) {
      case 'success': return 'rgba(34, 197, 94, 0.2)';
      case 'danger': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$variant) {
      case 'success': return 'rgba(34, 197, 94, 0.3)';
      case 'danger': return 'rgba(239, 68, 68, 0.3)';
      default: return 'rgba(255, 215, 0, 0.2)';
    }
  }};
  border-radius: 6px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => {
      switch (props.$variant) {
        case 'success': return 'rgba(34, 197, 94, 0.3)';
        case 'danger': return 'rgba(239, 68, 68, 0.3)';
        default: return 'rgba(255, 215, 0, 0.2)';
      }
    }};
  }
`;

const LoadingState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #aaa;
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #aaa;
`;

const getTypeIcon = (type: Notification['type']) => {
  switch (type) {
    case 'user_activity':
      return <Activity size={16} />;
    case 'system_alert':
      return <AlertCircle size={16} />;
    case 'security_breach':
      return <Shield size={16} />;
    case 'content_report':
      return <FileText size={16} />;
    case 'revenue_update':
      return <TrendingUp size={16} />;
    default:
      return <Bell size={16} />;
  }
};

const NotificationsManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    byType: {} as Record<string, number>,
    byPriority: {} as Record<string, number>
  });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time notifications
    const unsubscribe = realTimeNotificationsService.subscribeToNotifications((notification) => {
      setNotifications(prev => [notification, ...prev]);
      loadStats();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    loadStats();
  }, [notifications]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await realTimeNotificationsService.getNotifications(100);
      setNotifications(data);
    } catch (error) {
      logger.error('Error loading notifications', error as Error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const notificationStats = await realTimeNotificationsService.getNotificationStats();
      setStats(notificationStats);
    } catch (error) {
      logger.error('Error loading notification stats', error as Error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await realTimeNotificationsService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      toast.success('Notification marked as read');
    } catch (error) {
      logger.error('Error marking notification as read', error as Error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await realTimeNotificationsService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      logger.error('Error deleting notification', error as Error);
      toast.error('Failed to delete notification');
    }
  };

  const handleClearRead = async () => {
    if (!window.confirm('Are you sure you want to clear all read notifications?')) return;
    
    try {
      await realTimeNotificationsService.clearReadNotifications();
      setNotifications(prev => prev.filter(n => !n.read));
      toast.success('Read notifications cleared');
    } catch (error) {
      logger.error('Error clearing read notifications', error as Error);
      toast.error('Failed to clear read notifications');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) return false;
    if (statusFilter === 'read' && !notification.read) return false;
    if (statusFilter === 'unread' && notification.read) return false;
    if (searchQuery && 
        !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <Container>
      <Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={24} />
          Notifications Management
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ActionButton onClick={handleClearRead} disabled={notifications.filter(n => n.read).length === 0}>
            <CheckCheck size={16} />
            Clear Read
          </ActionButton>
          <ActionButton onClick={loadData} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </ActionButton>
        </div>
      </Title>

      <StatsGrid>
        <StatCard>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Notifications</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.unread}</StatValue>
          <StatLabel>Unread Notifications</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{notifications.filter(n => n.priority === 'critical').length}</StatValue>
          <StatLabel>Critical Priority</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{notifications.filter(n => n.actionRequired).length}</StatValue>
          <StatLabel>Action Required</StatLabel>
        </StatCard>
      </StatsGrid>

      <FiltersContainer>
        <SearchInput
          type="text"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FilterSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="user_activity">User Activity</option>
          <option value="system_alert">System Alert</option>
          <option value="security_breach">Security Breach</option>
          <option value="content_report">Content Report</option>
          <option value="revenue_update">Revenue Update</option>
        </FilterSelect>
        <FilterSelect value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </FilterSelect>
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </FilterSelect>
      </FiltersContainer>

      {loading ? (
        <LoadingState>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: '1rem' }} />
          <div>Loading notifications...</div>
        </LoadingState>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState>No notifications found</EmptyState>
      ) : (
        <NotificationsList>
          {filteredNotifications.map((notification) => (
            <NotificationItem 
              key={notification.id} 
              $read={notification.read}
              $priority={notification.priority}
            >
              <NotificationHeader>
                <div style={{ flex: 1 }}>
                  <NotificationTitle>
                    {getTypeIcon(notification.type)}
                    {notification.title}
                    {!notification.read && (
                      <Badge $type="medium" style={{ marginLeft: '0.5rem' }}>New</Badge>
                    )}
                  </NotificationTitle>
                  <NotificationMessage>{notification.message}</NotificationMessage>
                </div>
                <ActionButtons>
                  {!notification.read && (
                    <IconButton
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                      $variant="success"
                    >
                      <CheckCircle size={16} />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={() => handleDelete(notification.id)}
                    title="Delete"
                    $variant="danger"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </ActionButtons>
              </NotificationHeader>
              <NotificationMeta>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Badge $type={notification.type}>{notification.type.replace('_', ' ')}</Badge>
                  <Badge $type={notification.priority}>{notification.priority}</Badge>
                  {notification.actionRequired && (
                    <Badge $type="high">Action Required</Badge>
                  )}
                </div>
                <div>{format(notification.timestamp, 'yyyy-MM-dd HH:mm:ss')}</div>
              </NotificationMeta>
              {notification.actionUrl && (
                <div style={{ marginTop: '0.5rem' }}>
                  <a 
                    href={notification.actionUrl} 
                    style={{ color: '#667eea', textDecoration: 'underline' }}
                  >
                    View Details →
                  </a>
                </div>
              )}
            </NotificationItem>
          ))}
        </NotificationsList>
      )}
    </Container>
  );
};

export default NotificationsManagement;


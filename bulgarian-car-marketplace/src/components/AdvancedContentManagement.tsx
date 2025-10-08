import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Trash2, 
  RotateCcw, 
  Search,
  Filter,
  Download,
  Upload,
  Archive,
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Car,
  MessageSquare,
  Star
} from 'lucide-react';
import { 
  advancedContentManagementService, 
  ContentReport, 
  ContentStats 
} from '../services/advanced-content-management-service';

// Styled Components
const ContentManagementContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const ContentTitle = styled.h2`
  color: #1c1e21;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ContentControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ControlButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' | 'success' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover { background: #0056b3; }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #545b62; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover { background: #218838; }
        `;
    }
  }}
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #1c1e21;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
`;

const ReportsList = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  overflow: hidden;
`;

const ReportItem = styled.div<{ $priority: string }>`
  padding: 20px;
  border-bottom: 1px solid #f8f9fa;
  transition: background-color 0.2s;
  border-left: 4px solid ${props => {
    switch (props.$priority) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }};

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ReportInfo = styled.div`
  flex: 1;
`;

const ReportTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1c1e21;
  margin-bottom: 4px;
`;

const ReportMeta = styled.div`
  font-size: 12px;
  color: #6c757d;
  display: flex;
  gap: 16px;
`;

const ReportActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' | 'success' }>`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover { background: #0056b3; }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #545b62; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover { background: #218838; }
        `;
    }
  }}
`;

const PriorityBadge = styled.div<{ $priority: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.$priority) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }};
  color: white;
`;

const ContentTypeIcon = styled.div<{ $type: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  background: ${props => {
    switch (props.$type) {
      case 'car': return '#007bff';
      case 'user': return '#28a745';
      case 'message': return '#ffc107';
      case 'review': return '#17a2b8';
      default: return '#6c757d';
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  color: #495057;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  color: #6c757d;
  font-size: 14px;
  margin: 0;
`;

interface AdvancedContentManagementProps {
  onContentAction?: (action: string, contentId: string) => void;
}

const AdvancedContentManagement: React.FC<AdvancedContentManagementProps> = ({ onContentAction }) => {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [reportsData, statsData] = await Promise.all([
          advancedContentManagementService.getPendingReports(50),
          advancedContentManagementService.getContentStats()
        ]);
        
        setReports(reportsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading content management data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleReviewReport = async (reportId: string, action: 'approve' | 'dismiss') => {
    try {
      await advancedContentManagementService.reviewReport(
        reportId, 
        action, 
        'super_admin',
        action === 'approve' ? 'Approved by Super Admin' : 'Dismissed by Super Admin'
      );
      
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (error) {
      console.error('Error reviewing report:', error);
    }
  };

  const handleContentAction = async (
    contentId: string, 
    contentType: string, 
    action: 'hide' | 'delete' | 'flag' | 'restore'
  ) => {
    try {
      await advancedContentManagementService.applyContentAction(
        contentId,
        contentType,
        action,
        'super_admin',
        `Action performed by Super Admin: ${action}`
      );
      
      if (onContentAction) {
        onContentAction(action, contentId);
      }
    } catch (error) {
      console.error('Error performing content action:', error);
    }
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    try {
      const data = await advancedContentManagementService.exportContentData('cars', format);
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content_export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleCreateBackup = async () => {
    try {
      const backupId = await advancedContentManagementService.createBackup(
        `backup_${new Date().toISOString().split('T')[0]}`
      );
      console.log('Backup created:', backupId);
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'car': return <Car size={16} />;
      case 'user': return <User size={16} />;
      case 'message': return <MessageSquare size={16} />;
      case 'review': return <Star size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <ContentManagementContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading content management...
        </div>
      </ContentManagementContainer>
    );
  }

  return (
    <ContentManagementContainer>
      <ContentHeader>
        <ContentTitle>
          <Shield size={24} />
          Advanced Content Management
        </ContentTitle>
        <ContentControls>
          <ControlButton $variant="success" onClick={handleCreateBackup}>
            <Archive size={16} />
            Create Backup
          </ControlButton>
          <ControlButton $variant="secondary" onClick={() => handleExportData('json')}>
            <Download size={16} />
            Export JSON
          </ControlButton>
          <ControlButton $variant="secondary" onClick={() => handleExportData('csv')}>
            <Download size={16} />
            Export CSV
          </ControlButton>
        </ContentControls>
      </ContentHeader>

      {/* إحصائيات المحتوى */}
      {stats && (
        <StatsGrid>
          <StatCard>
            <StatValue>{stats.totalContent}</StatValue>
            <StatLabel>Total Content</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.activeContent}</StatValue>
            <StatLabel>Active</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.flaggedContent}</StatValue>
            <StatLabel>Flagged</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.pendingReports}</StatValue>
            <StatLabel>Pending Reports</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.resolvedReports}</StatValue>
            <StatLabel>Resolved</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.moderationActions}</StatValue>
            <StatLabel>Moderation Actions</StatLabel>
          </StatCard>
        </StatsGrid>
      )}

      {/* البحث والفلترة */}
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FilterSelect
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="car">Cars</option>
          <option value="user">Users</option>
          <option value="message">Messages</option>
          <option value="review">Reviews</option>
        </FilterSelect>
        <FilterSelect
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </FilterSelect>
      </SearchContainer>

      {/* قائمة التقارير */}
      <ReportsList>
        {reports.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🛡️</EmptyIcon>
            <EmptyTitle>No Content Reports</EmptyTitle>
            <EmptyDescription>
              All content is clean! New reports will appear here.
            </EmptyDescription>
          </EmptyState>
        ) : (
          reports.map((report) => (
            <ReportItem key={report.id} $priority={report.priority}>
              <ReportHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ContentTypeIcon $type={report.contentType}>
                    {getContentTypeIcon(report.contentType)}
                  </ContentTypeIcon>
                  <ReportInfo>
                    <ReportTitle>{report.reason}</ReportTitle>
                    <ReportMeta>
                      <span>ID: {report.contentId}</span>
                      <span>Reporter: {report.reporterEmail}</span>
                      <span>{formatTime(report.timestamp)}</span>
                    </ReportMeta>
                  </ReportInfo>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PriorityBadge $priority={report.priority}>
                    {report.priority}
                  </PriorityBadge>
                </div>
              </ReportHeader>

              <div style={{ marginBottom: '16px', color: '#495057', fontSize: '14px' }}>
                {report.description}
              </div>

              <ReportActions>
                <ActionButton 
                  $variant="success" 
                  onClick={() => handleReviewReport(report.id, 'approve')}
                >
                  <CheckCircle size={12} />
                  Approve
                </ActionButton>
                <ActionButton 
                  $variant="secondary" 
                  onClick={() => handleReviewReport(report.id, 'dismiss')}
                >
                  <XCircle size={12} />
                  Dismiss
                </ActionButton>
                <ActionButton 
                  $variant="primary" 
                  onClick={() => handleContentAction(report.contentId, report.contentType, 'hide')}
                >
                  <EyeOff size={12} />
                  Hide Content
                </ActionButton>
                <ActionButton 
                  $variant="danger" 
                  onClick={() => handleContentAction(report.contentId, report.contentType, 'delete')}
                >
                  <Trash2 size={12} />
                  Delete
                </ActionButton>
              </ReportActions>
            </ReportItem>
          ))
        )}
      </ReportsList>
    </ContentManagementContainer>
  );
};

export default AdvancedContentManagement;

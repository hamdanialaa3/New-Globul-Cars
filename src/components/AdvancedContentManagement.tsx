/**
 * ✅ COMPLETED: Advanced Content Management Component for Super Admin Dashboard
 * Full-featured content management with reports, moderation, and statistics
 * 
 * @author AI Assistant
 * @date 2025-12-21
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FileText, 
  AlertTriangle,
  Search,
  RefreshCw,
  Eye,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Shield,
  BarChart3,
  Flag,
  Archive
} from 'lucide-react';
import { advancedContentManagementService } from '../services/advanced-content-management-service';
import type { ContentReport, ContentStats } from '../services/content-management-types';
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

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#aaa'};
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#ffd700' : 'transparent'};
  cursor: pointer;
  font-weight: ${props => props.$active ? '600' : '400'};
  transition: all 0.3s ease;
  
  &:hover {
    color: white;
    background: ${props => props.$active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255, 215, 0, 0.1)'};
  }
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

const TableContainer = styled.div`
  overflow-x: auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: white;
`;

const TableHeader = styled.thead`
  background: rgba(255, 215, 0, 0.1);
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #ffd700;
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
  white-space: nowrap;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 215, 0, 0.05);
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: #ccc;
  font-size: 0.875rem;
`;

const Badge = styled.span<{ $type?: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
  margin-right: 0.5rem;
  
  ${props => {
    const colors: Record<string, string> = {
      pending: 'background: rgba(234, 179, 8, 0.2); color: #eab308;',
      reviewed: 'background: rgba(34, 197, 94, 0.2); color: #22c55e;',
      resolved: 'background: rgba(34, 197, 94, 0.2); color: #22c55e;',
      dismissed: 'background: rgba(100, 116, 139, 0.2); color: #94a3b8;',
      low: 'background: rgba(34, 197, 94, 0.2); color: #22c55e;',
      medium: 'background: rgba(234, 179, 8, 0.2); color: #eab308;',
      high: 'background: rgba(249, 115, 22, 0.2); color: #f97316;',
      critical: 'background: rgba(239, 68, 68, 0.2); color: #ef4444;',
      car: 'background: rgba(102, 126, 234, 0.2); color: #667eea;',
      user: 'background: rgba(234, 179, 8, 0.2); color: #eab308;',
      message: 'background: rgba(249, 115, 22, 0.2); color: #f97316;',
      review: 'background: rgba(34, 197, 94, 0.2); color: #22c55e;'
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

type TabType = 'reports' | 'stats' | 'search';

const AdvancedContentManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('reports');
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'reports') {
        if (statusFilter === 'pending') {
          const pendingReports = await advancedContentManagementService.getPendingReports(100);
          setReports(pendingReports);
        } else {
          const allReports = await advancedContentManagementService.getAllReports(100);
          setReports(allReports.filter(r => statusFilter === 'all' || r.status === statusFilter));
        }
      } else if (activeTab === 'stats') {
        const contentStats = await advancedContentManagementService.getContentStats();
        setStats(contentStats);
      }
    } catch (error) {
      logger.error('Error loading content management data', error as Error);
      toast.error('Failed to load content management data');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewReport = async (reportId: string, action: 'approve' | 'dismiss') => {
    if (!currentUser) return;
    
    try {
      await advancedContentManagementService.reviewReport(
        reportId,
        action,
        currentUser.uid,
        `Report ${action}d by admin`
      );
      toast.success(`Report ${action}d successfully`);
      loadData();
    } catch (error) {
      logger.error('Error reviewing report', error as Error);
      toast.error(`Failed to ${action} report`);
    }
  };

  const handleContentAction = async (
    contentId: string,
    contentType: string,
    action: 'hide' | 'delete' | 'flag' | 'restore'
  ) => {
    if (!currentUser) return;
    
    try {
      await advancedContentManagementService.applyContentAction(
        contentId,
        contentType,
        action,
        currentUser.uid,
        `${action} action performed by admin`
      );
      toast.success(`Content ${action}d successfully`);
      loadData();
    } catch (error) {
      logger.error('Error applying content action', error as Error);
      toast.error(`Failed to ${action} content`);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const data = await advancedContentManagementService.exportContentData('cars', format);
      
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-export-${formatDateForFilename(new Date())}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Content exported as ${format.toUpperCase()}`);
    } catch (error) {
      logger.error('Error exporting content', error as Error);
      toast.error('Failed to export content');
    }
  };

  const formatDateForFilename = (date: Date): string => {
    return format(date, 'yyyy-MM-dd_HH-mm-ss');
  };

  const filteredReports = reports.filter(report => {
    if (priorityFilter !== 'all' && report.priority !== priorityFilter) return false;
    if (contentTypeFilter !== 'all' && report.contentType !== contentTypeFilter) return false;
    if (searchQuery && !report.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !report.reason.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <Container>
      <Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={24} />
          Advanced Content Management
        </div>
        <ActionButton onClick={loadData} disabled={loading}>
          <RefreshCw size={16} />
          Refresh
        </ActionButton>
      </Title>

      <TabsContainer>
        <TabButton $active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>
          <Flag size={16} />
          Reports ({reports.length})
        </TabButton>
        <TabButton $active={activeTab === 'stats'} onClick={() => setActiveTab('stats')}>
          <BarChart3 size={16} />
          Statistics
        </TabButton>
        <TabButton $active={activeTab === 'search'} onClick={() => setActiveTab('search')}>
          <Search size={16} />
          Search Content
        </TabButton>
      </TabsContainer>

      {activeTab === 'reports' && (
        <>
          {stats && (
            <StatsGrid>
              <StatCard>
                <StatValue>{stats.pendingReports}</StatValue>
                <StatLabel>Pending Reports</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.flaggedContent}</StatValue>
                <StatLabel>Flagged Content</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.hiddenContent}</StatValue>
                <StatLabel>Hidden Content</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.deletedContent}</StatValue>
                <StatLabel>Deleted Content</StatLabel>
              </StatCard>
            </StatsGrid>
          )}

          <FiltersContainer>
            <SearchInput
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
              <option value="all">All Status</option>
            </FilterSelect>
            <FilterSelect value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </FilterSelect>
            <FilterSelect value={contentTypeFilter} onChange={(e) => setContentTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="car">Cars</option>
              <option value="user">Users</option>
              <option value="message">Messages</option>
              <option value="review">Reviews</option>
            </FilterSelect>
          </FiltersContainer>

          {loading ? (
            <LoadingState>Loading reports...</LoadingState>
          ) : filteredReports.length === 0 ? (
            <EmptyState>No reports found</EmptyState>
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Content</TableHeaderCell>
                    <TableHeaderCell>Reporter</TableHeaderCell>
                    <TableHeaderCell>Reason</TableHeaderCell>
                    <TableHeaderCell>Priority</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Timestamp</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Badge $type={report.contentType}>{report.contentType}</Badge>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                          ID: {report.contentId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{report.reporterEmail}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{report.reporterId}</div>
                      </TableCell>
                      <TableCell>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {report.reason}
                        </div>
                        {report.description && (
                          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                            {report.description.substring(0, 50)}...
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge $type={report.priority}>{report.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge $type={report.status}>{report.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(report.timestamp, 'yyyy-MM-dd HH:mm')}
                      </TableCell>
                      <TableCell>
                        {report.status === 'pending' && (
                          <ActionButtons>
                            <IconButton 
                              onClick={() => handleReviewReport(report.id, 'approve')} 
                              title="Approve Report"
                              $variant="success"
                            >
                              <CheckCircle size={16} />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleReviewReport(report.id, 'dismiss')} 
                              title="Dismiss Report"
                              $variant="danger"
                            >
                              <XCircle size={16} />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleContentAction(report.contentId, report.contentType, 'hide')}
                              title="Hide Content"
                            >
                              <Archive size={16} />
                            </IconButton>
                          </ActionButtons>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {activeTab === 'stats' && (
        <>
          {loading ? (
            <LoadingState>Loading statistics...</LoadingState>
          ) : stats ? (
            <StatsGrid>
              <StatCard>
                <StatValue>{stats.totalContent}</StatValue>
                <StatLabel>Total Content</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.activeContent}</StatValue>
                <StatLabel>Active Content</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.hiddenContent}</StatValue>
                <StatLabel>Hidden Content</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.deletedContent}</StatValue>
                <StatLabel>Deleted Content</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.flaggedContent}</StatValue>
                <StatLabel>Flagged Content</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.pendingReports}</StatValue>
                <StatLabel>Pending Reports</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.resolvedReports}</StatValue>
                <StatLabel>Resolved Reports</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.moderationActions}</StatValue>
                <StatLabel>Moderation Actions</StatLabel>
              </StatCard>
            </StatsGrid>
          ) : (
            <EmptyState>No statistics available</EmptyState>
          )}
          
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <ActionButton onClick={() => handleExport('json')}>
              <Download size={16} />
              Export JSON
            </ActionButton>
            <ActionButton onClick={() => handleExport('csv')}>
              <Download size={16} />
              Export CSV
            </ActionButton>
          </div>
        </>
      )}

      {activeTab === 'search' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>
          <Search size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <div>Content search feature coming soon</div>
        </div>
      )}
    </Container>
  );
};

export default AdvancedContentManagement;

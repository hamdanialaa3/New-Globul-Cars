import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Activity,
  FileText,
  Settings,
  BarChart3,
  Lock,
  Calendar,
  MapPin,
  Monitor,
  Smartphone,
  Globe
} from 'lucide-react';
import { 
  auditLoggingService, 
  AuditLog, 
  SecurityEvent 
} from '@/services/audit-logging-service';

// Styled Components
const AuditContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
`;

const HeaderTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderSubtitle = styled.p`
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 16px 24px;
  border: none;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#8b5cf6' : '#6b7280'};
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: ${props => props.$active ? '2px solid #8b5cf6' : '2px solid transparent'};
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.$active ? 'white' : '#f3f4f6'};
  }
`;

const TabContent = styled.div`
  padding: 24px;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
  }
`;

const DateInput = styled.input`
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #8b5cf6;
          color: white;
          &:hover {
            background: #7c3aed;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover {
            background: #dc2626;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          }
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
          &:hover {
            background: #e5e7eb;
          }
        `;
    }
  }}
`;

const LogsTable = styled.div`
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f9fafb;
`;

const TableHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
`;

const TableRow = styled.tr<{ $success?: boolean }>`
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
  }

  ${props => !props.$success && `
    background: #fef2f2;
  `}
`;

const TableCell = styled.td`
  padding: 16px;
  vertical-align: middle;
`;

const LogInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogIcon = styled.div<{ $success: boolean; $severity: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;

  ${props => {
    if (!props.$success) {
      return `background: #ef4444;`;
    }
    switch (props.$severity) {
      case 'critical':
        return `background: #dc2626;`;
      case 'high':
        return `background: #f59e0b;`;
      case 'medium':
        return `background: #3b82f6;`;
      case 'low':
        return `background: #10b981;`;
      default:
        return `background: #6b7280;`;
    }
  }}
`;

const LogDetails = styled.div`
  flex: 1;
`;

const LogAction = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const LogResource = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const LogUser = styled.div`
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
`;

const LogEmail = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const StatusBadge = styled.span<{ $success: boolean }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${props => props.$success ? `
    background: #dcfce7;
    color: #166534;
  ` : `
    background: #fef2f2;
    color: #dc2626;
  `}
`;

const SeverityBadge = styled.span<{ $severity: string }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;

  ${props => {
    switch (props.$severity) {
      case 'critical':
        return `background: #fef2f2; color: #dc2626;`;
      case 'high':
        return `background: #fef3c7; color: #92400e;`;
      case 'medium':
        return `background: #dbeafe; color: #1e40af;`;
      case 'low':
        return `background: #dcfce7; color: #166534;`;
      default:
        return `background: #f3f4f6; color: #6b7280;`;
    }
  }}
`;

const CategoryBadge = styled.span`
  padding: 4px 8px;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #6b7280;
`;

const DeviceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #6b7280;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-top: 24px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
`;

const PaginationInfo = styled.div`
  color: #6b7280;
  font-size: 14px;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button<{ $disabled?: boolean }>`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #8b5cf6;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingState = styled.div`
  padding: 40px;
  text-align: center;
  color: #6b7280;
  font-size: 16px;
`;

const ErrorState = styled.div`
  padding: 40px;
  text-align: center;
  color: #dc2626;
  font-size: 16px;
`;

const EmptyState = styled.div`
  padding: 60px 40px;
  text-align: center;
  color: #6b7280;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #9ca3af;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #374151;
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  margin: 0;
`;

// Main Component
const AuditLogging: React.FC = () => {
  const [activeTab, setActiveTab] = useState('logs');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [successFilter, setSuccessFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadData();
  }, [currentPage, actionFilter, severityFilter, categoryFilter, successFilter, dateFrom, dateTo]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'logs') {
        const logsResult = await auditLoggingService.getAuditLogs(
          currentPage,
          50,
          {
            action: actionFilter !== 'all' ? actionFilter : undefined,
            severity: severityFilter !== 'all' ? severityFilter : undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            success: successFilter !== 'all' ? successFilter === 'success' : undefined,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined
          }
        );

        setLogs(logsResult.logs);
        setTotalLogs(logsResult.total);
        setHasMore(logsResult.hasMore);
      } else {
        const eventsResult = await auditLoggingService.getSecurityEvents(
          currentPage,
          50,
          {
            severity: severityFilter !== 'all' ? severityFilter : undefined,
            resolved: successFilter !== 'all' ? successFilter === 'resolved' : undefined,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined
          }
        );

        setSecurityEvents(eventsResult.events);
        setTotalLogs(eventsResult.total);
        setHasMore(eventsResult.hasMore);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load audit data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  const handleExport = async () => {
    try {
      const dateFromObj = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const dateToObj = dateTo ? new Date(dateTo) : new Date();
      
      const exportData = await auditLoggingService.exportAuditLogs(
        dateFromObj,
        dateToObj,
        'json'
      );

      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('CREATE')) return <CheckCircle size={16} />;
    if (action.includes('UPDATE')) return <Settings size={16} />;
    if (action.includes('DELETE')) return <XCircle size={16} />;
    if (action.includes('LOGIN')) return <User size={16} />;
    if (action.includes('SECURITY')) return <Shield size={16} />;
    return <Activity size={16} />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <User size={16} />;
      case 'authorization': return <Shield size={16} />;
      case 'data_access': return <Eye size={16} />;
      case 'data_modification': return <Settings size={16} />;
      case 'system': return <Monitor size={16} />;
      case 'security': return <Lock size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return <Smartphone size={16} />;
    if (userAgent.includes('Tablet')) return <Monitor size={16} />;
    return <Monitor size={16} />;
  };

  if (loading) {
    return (
      <AuditContainer>
        <LoadingState>
          <div>Loading audit data...</div>
        </LoadingState>
      </AuditContainer>
    );
  }

  if (error) {
    return (
      <AuditContainer>
        <ErrorState>
          <div>{error}</div>
        </ErrorState>
      </AuditContainer>
    );
  }

  return (
    <AuditContainer>
      <Header>
        <HeaderTitle>
          <Shield size={24} />
          Audit & Security Logging
        </HeaderTitle>
        <HeaderSubtitle>
          Monitor system activities and security events in real-time
        </HeaderSubtitle>
      </Header>

      <TabsContainer>
        <Tab $active={activeTab === 'logs'} onClick={() => setActiveTab('logs')}>
          <FileText size={16} />
          Audit Logs
        </Tab>
        <Tab $active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
          <Lock size={16} />
          Security Events
        </Tab>
      </TabsContainer>

      <TabContent>
        <FiltersContainer>
          <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, gap: '12px' }}>
            <SearchInput
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ActionButton type="submit" $variant="primary">
              <Search size={16} />
              Search
            </ActionButton>
          </form>

          <FilterSelect
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value="USER_CREATED">User Created</option>
            <option value="USER_UPDATED">User Updated</option>
            <option value="USER_DELETED">User Deleted</option>
            <option value="LOGIN_SUCCESS">Login Success</option>
            <option value="LOGIN_FAILED">Login Failed</option>
          </FilterSelect>

          <FilterSelect
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </FilterSelect>

          <FilterSelect
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="authentication">Authentication</option>
            <option value="authorization">Authorization</option>
            <option value="data_access">Data Access</option>
            <option value="data_modification">Data Modification</option>
            <option value="system">System</option>
            <option value="security">Security</option>
          </FilterSelect>

          <FilterSelect
            value={successFilter}
            onChange={(e) => setSuccessFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </FilterSelect>

          <DateInput
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="From Date"
          />

          <DateInput
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="To Date"
          />

          <ActionButton $variant="primary" onClick={handleExport}>
            <Download size={16} />
            Export
          </ActionButton>
        </FiltersContainer>

        <LogsTable>
          {activeTab === 'logs' ? (
            logs.length === 0 ? (
              <EmptyState>
                <EmptyIcon>
                  <FileText size={24} />
                </EmptyIcon>
                <EmptyTitle>No audit logs found</EmptyTitle>
                <EmptyDescription>
                  No logs match your current filters
                </EmptyDescription>
              </EmptyState>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Action</TableHeaderCell>
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Severity</TableHeaderCell>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Location</TableHeaderCell>
                    <TableHeaderCell>Device</TableHeaderCell>
                    <TableHeaderCell>Timestamp</TableHeaderCell>
                  </tr>
                </TableHeader>
                <tbody>
                  {logs.map(log => (
                    <TableRow key={log.id} $success={log.success}>
                      <TableCell>
                        <LogInfo>
                          <LogIcon $success={log.success} $severity={log.severity}>
                            {getActionIcon(log.action)}
                          </LogIcon>
                          <LogDetails>
                            <LogAction>{log.action}</LogAction>
                            <LogResource>{log.resource}</LogResource>
                          </LogDetails>
                        </LogInfo>
                      </TableCell>
                      <TableCell>
                        <LogUser>{log.userName}</LogUser>
                        <LogEmail>{log.userEmail}</LogEmail>
                      </TableCell>
                      <TableCell>
                        <StatusBadge $success={log.success}>
                          {log.success ? 'Success' : 'Failed'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <SeverityBadge $severity={log.severity}>
                          {log.severity}
                        </SeverityBadge>
                      </TableCell>
                      <TableCell>
                        <CategoryBadge>
                          {getCategoryIcon(log.category)}
                          {log.category}
                        </CategoryBadge>
                      </TableCell>
                      <TableCell>
                        <LocationInfo>
                          <MapPin size={14} />
                          {log.location?.city || 'Unknown'}
                        </LocationInfo>
                      </TableCell>
                      <TableCell>
                        <DeviceInfo>
                          {getDeviceIcon(log.userAgent)}
                          {log.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
                        </DeviceInfo>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            )
          ) : (
            // Security Events Tab
            securityEvents.length === 0 ? (
              <EmptyState>
                <EmptyIcon>
                  <Lock size={24} />
                </EmptyIcon>
                <EmptyTitle>No security events found</EmptyTitle>
                <EmptyDescription>
                  No security events match your current filters
                </EmptyDescription>
              </EmptyState>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Event Type</TableHeaderCell>
                    <TableHeaderCell>Severity</TableHeaderCell>
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>IP Address</TableHeaderCell>
                    <TableHeaderCell>Details</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Timestamp</TableHeaderCell>
                  </tr>
                </TableHeader>
                <tbody>
                  {securityEvents.map(event => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <LogInfo>
                          <LogIcon $success={event.resolved} $severity={event.severity}>
                            <AlertTriangle size={16} />
                          </LogIcon>
                          <LogDetails>
                            <LogAction>{event.eventType}</LogAction>
                          </LogDetails>
                        </LogInfo>
                      </TableCell>
                      <TableCell>
                        <SeverityBadge $severity={event.severity}>
                          {event.severity}
                        </SeverityBadge>
                      </TableCell>
                      <TableCell>
                        <LogUser>{event.userEmail || 'Unknown'}</LogUser>
                      </TableCell>
                      <TableCell>
                        <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                          {event.ipAddress}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {event.details}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge $success={event.resolved}>
                          {event.resolved ? 'Resolved' : 'Pending'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} />
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            )
          )}
        </LogsTable>

        <Pagination>
          <PaginationInfo>
            Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, totalLogs)} of {totalLogs} entries
          </PaginationInfo>
          <PaginationButtons>
            <PaginationButton 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </PaginationButton>
            <PaginationButton 
              disabled={!hasMore}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </PaginationButton>
          </PaginationButtons>
        </Pagination>
      </TabContent>
    </AuditContainer>
  );
};

export default AuditLogging;

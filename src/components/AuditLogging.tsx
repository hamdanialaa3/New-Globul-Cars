/**
 * ✅ COMPLETED: Audit Logging Component for Super Admin Dashboard
 * Full-featured audit log viewer with filtering, search, and export
 * 
 * @author AI Assistant
 * @date 2025-12-21
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Shield,
  User,
  Database,
  Activity,
  RefreshCw
} from 'lucide-react';
import { auditLoggingService, type AuditLog, type SecurityEvent } from '../services/audit-logging-service';
import { format } from 'date-fns';
import { logger } from '../services/logger-service';
import { useAuth } from '../contexts/AuthProvider';
import { toast } from 'react-toastify';

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

const FiltersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  color: #aaa;
  font-size: 0.875rem;
  font-weight: 500;
`;

const FilterInput = styled.input`
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #ffd700;
  }
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 6px;
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

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
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

const Badge = styled.span<{ $severity?: string; $success?: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
  
  ${props => {
    if (props.$severity) {
      const colors: Record<string, string> = {
        low: 'background: rgba(34, 197, 94, 0.2); color: #22c55e;',
        medium: 'background: rgba(234, 179, 8, 0.2); color: #eab308;',
        high: 'background: rgba(249, 115, 22, 0.2); color: #f97316;',
        critical: 'background: rgba(239, 68, 68, 0.2); color: #ef4444;'
      };
      return colors[props.$severity] || colors.low;
    }
    if (props.$success !== undefined) {
      return props.$success 
        ? 'background: rgba(34, 197, 94, 0.2); color: #22c55e;'
        : 'background: rgba(239, 68, 68, 0.2); color: #ef4444;';
    }
    return 'background: rgba(100, 116, 139, 0.2); color: #94a3b8;';
  }}
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

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(255, 215, 0, 0.2);
`;

const StatLabel = styled.div`
  color: #aaa;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  color: #ffd700;
  font-size: 1.5rem;
  font-weight: 600;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  color: white;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
  padding-bottom: 1rem;
`;

const ModalTitle = styled.h3`
  color: #ffd700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background: rgba(255, 215, 0, 0.1);
    color: white;
  }
`;

const ModalBody = styled.div`
  color: #ccc;
  line-height: 1.6;
  
  pre {
    background: rgba(0, 0, 0, 0.3);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.875rem;
  }
`;

type TabType = 'audit' | 'security';

const AuditLogging: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('audit');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    category: '',
    severity: '',
    dateFrom: '',
    dateTo: '',
    success: ''
  });

  const [eventFilters, setEventFilters] = useState({
    eventType: '',
    severity: '',
    resolved: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab, page, filters, eventFilters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'audit') {
        const result = await auditLoggingService.getAuditLogs(page, 50, {
          userId: filters.userId || undefined,
          action: filters.action || undefined,
          category: filters.category as any || undefined,
          severity: filters.severity as any || undefined,
          dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
          dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
          success: filters.success !== '' ? filters.success === 'true' : undefined
        });
        
        setAuditLogs(result.logs);
        setHasMore(result.hasMore);
      } else {
        const result = await auditLoggingService.getSecurityEvents(page, 50, {
          eventType: eventFilters.eventType as any || undefined,
          severity: eventFilters.severity as any || undefined,
          resolved: eventFilters.resolved !== '' ? eventFilters.resolved === 'true' : undefined
        });
        
        setSecurityEvents(result.events);
        setHasMore(result.hasMore);
      }
    } catch (error) {
      logger.error('Error loading audit data', error as Error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    try {
      const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();
      
      const data = await auditLoggingService.exportAuditLogs(dateFrom, dateTo, format);
      
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${formatDateForFilename(new Date())}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Audit logs exported as ${format.toUpperCase()}`);
    } catch (error) {
      logger.error('Error exporting audit logs', error as Error);
      toast.error('Failed to export audit logs');
    }
  };

  const handleResolveEvent = async (eventId: string, resolution: string) => {
    if (!currentUser) return;
    
    try {
      await auditLoggingService.resolveSecurityEvent(eventId, currentUser.uid, resolution);
      toast.success('Security event resolved');
      loadData();
      setSelectedEvent(null);
    } catch (error) {
      logger.error('Error resolving security event', error as Error);
      toast.error('Failed to resolve security event');
    }
  };

  const formatDateForFilename = (date: Date): string => {
    return format(date, 'yyyy-MM-dd_HH-mm-ss');
  };

  return (
    <Container>
      <Title>
        <FileText size={24} />
        Audit Logging & Security Events
      </Title>

      <TabsContainer>
        <TabButton $active={activeTab === 'audit'} onClick={() => setActiveTab('audit')}>
          <Activity size={16} />
          Audit Logs ({auditLogs.length})
        </TabButton>
        <TabButton $active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
          <Shield size={16} />
          Security Events ({securityEvents.length})
        </TabButton>
      </TabsContainer>

      {activeTab === 'audit' && (
        <>
          <FiltersContainer>
            <FilterGroup>
              <FilterLabel>User ID</FilterLabel>
              <FilterInput
                type="text"
                placeholder="Filter by user ID"
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Action</FilterLabel>
              <FilterInput
                type="text"
                placeholder="Filter by action"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Category</FilterLabel>
              <FilterSelect
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="authentication">Authentication</option>
                <option value="authorization">Authorization</option>
                <option value="data_access">Data Access</option>
                <option value="data_modification">Data Modification</option>
                <option value="system">System</option>
                <option value="security">Security</option>
              </FilterSelect>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Severity</FilterLabel>
              <FilterSelect
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </FilterSelect>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Success</FilterLabel>
              <FilterSelect
                value={filters.success}
                onChange={(e) => setFilters({ ...filters, success: e.target.value })}
              >
                <option value="">All</option>
                <option value="true">Success</option>
                <option value="false">Failed</option>
              </FilterSelect>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Date From</FilterLabel>
              <FilterInput
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Date To</FilterLabel>
              <FilterInput
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </FilterGroup>
          </FiltersContainer>

          <ActionButtons>
            <ActionButton onClick={loadData}>
              <RefreshCw size={16} />
              Refresh
            </ActionButton>
            <ActionButton onClick={() => handleExport('json')}>
              <Download size={16} />
              Export JSON
            </ActionButton>
            <ActionButton onClick={() => handleExport('csv')}>
              <Download size={16} />
              Export CSV
            </ActionButton>
          </ActionButtons>

          {loading ? (
            <LoadingState>Loading audit logs...</LoadingState>
          ) : auditLogs.length === 0 ? (
            <EmptyState>No audit logs found</EmptyState>
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Timestamp</TableHeaderCell>
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>Action</TableHeaderCell>
                    <TableHeaderCell>Resource</TableHeaderCell>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Severity</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Details</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id} onClick={() => setSelectedLog(log)} style={{ cursor: 'pointer' }}>
                      <TableCell>{format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                      <TableCell>
                        <div>{log.userName || log.userEmail}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{log.userId}</div>
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>
                        <Badge>{log.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge $severity={log.severity}>{log.severity}</Badge>
                      </TableCell>
                      <TableCell>
                        {log.success ? (
                          <Badge $success={true}>
                            <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            Success
                          </Badge>
                        ) : (
                          <Badge $success={false}>
                            <XCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.details || 'No details'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {activeTab === 'security' && (
        <>
          <FiltersContainer>
            <FilterGroup>
              <FilterLabel>Event Type</FilterLabel>
              <FilterSelect
                value={eventFilters.eventType}
                onChange={(e) => setEventFilters({ ...eventFilters, eventType: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="login_success">Login Success</option>
                <option value="login_failed">Login Failed</option>
                <option value="logout">Logout</option>
                <option value="permission_denied">Permission Denied</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="data_breach_attempt">Data Breach Attempt</option>
                <option value="unauthorized_access">Unauthorized Access</option>
              </FilterSelect>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Severity</FilterLabel>
              <FilterSelect
                value={eventFilters.severity}
                onChange={(e) => setEventFilters({ ...eventFilters, severity: e.target.value })}
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </FilterSelect>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Status</FilterLabel>
              <FilterSelect
                value={eventFilters.resolved}
                onChange={(e) => setEventFilters({ ...eventFilters, resolved: e.target.value })}
              >
                <option value="">All</option>
                <option value="false">Unresolved</option>
                <option value="true">Resolved</option>
              </FilterSelect>
            </FilterGroup>
          </FiltersContainer>

          <ActionButtons>
            <ActionButton onClick={loadData}>
              <RefreshCw size={16} />
              Refresh
            </ActionButton>
          </ActionButtons>

          {loading ? (
            <LoadingState>Loading security events...</LoadingState>
          ) : securityEvents.length === 0 ? (
            <EmptyState>No security events found</EmptyState>
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Timestamp</TableHeaderCell>
                    <TableHeaderCell>Event Type</TableHeaderCell>
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>Severity</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Details</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {securityEvents.map((event) => (
                    <TableRow key={event.id} onClick={() => setSelectedEvent(event)} style={{ cursor: 'pointer' }}>
                      <TableCell>{format(event.timestamp, 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                      <TableCell>{event.eventType}</TableCell>
                      <TableCell>{event.userEmail || event.userId || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge $severity={event.severity}>{event.severity}</Badge>
                      </TableCell>
                      <TableCell>
                        {event.resolved ? (
                          <Badge $success={true}>Resolved</Badge>
                        ) : (
                          <Badge $success={false}>Unresolved</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {event.details}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Audit Log Detail Modal */}
      {selectedLog && (
        <ModalOverlay onClick={() => setSelectedLog(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Audit Log Details</ModalTitle>
              <CloseButton onClick={() => setSelectedLog(null)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Timestamp:</strong> {format(selectedLog.timestamp, 'yyyy-MM-dd HH:mm:ss')}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>User:</strong> {selectedLog.userName} ({selectedLog.userEmail})
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Action:</strong> {selectedLog.action}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Resource:</strong> {selectedLog.resource} {selectedLog.resourceId && `(${selectedLog.resourceId})`}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Details:</strong> {selectedLog.details}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>IP Address:</strong> {selectedLog.ipAddress}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Location:</strong> {selectedLog.location ? `${selectedLog.location.city}, ${selectedLog.location.country}` : 'N/A'}
              </div>
              {selectedLog.metadata && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Metadata:</strong>
                  <pre>{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                </div>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Security Event Detail Modal */}
      {selectedEvent && (
        <ModalOverlay onClick={() => setSelectedEvent(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Security Event Details</ModalTitle>
              <CloseButton onClick={() => setSelectedEvent(null)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Timestamp:</strong> {format(selectedEvent.timestamp, 'yyyy-MM-dd HH:mm:ss')}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Event Type:</strong> {selectedEvent.eventType}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>User:</strong> {selectedEvent.userEmail || selectedEvent.userId || 'N/A'}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Severity:</strong> <Badge $severity={selectedEvent.severity}>{selectedEvent.severity}</Badge>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Status:</strong> {selectedEvent.resolved ? 'Resolved' : 'Unresolved'}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Details:</strong> {selectedEvent.details}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>IP Address:</strong> {selectedEvent.ipAddress}
              </div>
              {selectedEvent.resolved && selectedEvent.resolution && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Resolution:</strong> {selectedEvent.resolution}
                </div>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default AuditLogging;

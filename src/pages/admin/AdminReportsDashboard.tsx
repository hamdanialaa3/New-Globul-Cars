/**
 * Admin Reports Dashboard
 * =======================
 * Review and manage user reports
 * 
 * @gpt-suggestion Phase 5.6 - Admin dashboard for reports
 * @author Implementation - January 14, 2026
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  ChevronDown,
  Eye,
  Ban,
  RefreshCw
} from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';
import { userReportService } from '@/services/messaging/user-report.service';

/**
 * Report interface (matches user-report.service.ts)
 */
interface UserReport {
  reportId: string;
  reportedUserId: number;
  reportedByUserId: number;
  category: string;
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: number;
  updatedAt: number;
  reviewedBy?: number;
  reviewNotes?: string;
  autoFlagged?: boolean;
}

/**
 * Filter options
 */
interface FilterOptions {
  status: string;
  category: string;
  priority: string;
  searchTerm: string;
}

interface AdminReportsDashboardProps {
  /** Admin user's numeric ID */
  adminNumericId: number;
  /** Custom className */
  className?: string;
}

/**
 * Admin Reports Dashboard Component
 * 
 * @description Review and manage user reports with bulk actions
 * @example
 * <AdminReportsDashboard adminNumericId={1} />
 */
export const AdminReportsDashboard: React.FC<AdminReportsDashboardProps> = ({
  adminNumericId,
  className
}) => {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<UserReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    category: 'all',
    priority: 'all',
    searchTerm: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    resolved: 0,
    dismissed: 0,
    autoFlagged: 0
  });
  
  /**
   * Load reports from Firestore
   */
  useEffect(() => {
    let isActive = true; // CRITICAL: Memory leak protection
    
    const reportsRef = collection(db, 'reports');
    const q = query(
      reportsRef,
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!isActive) return; // Prevent setState on unmounted component
      
      const reportsData: UserReport[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        reportsData.push({
          reportId: doc.id,
          reportedUserId: data.reportedUserId,
          reportedByUserId: data.reportedByUserId,
          category: data.category,
          description: data.description,
          status: data.status,
          priority: data.priority,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          updatedAt: data.updatedAt?.toMillis() || Date.now(),
          reviewedBy: data.reviewedBy,
          reviewNotes: data.reviewNotes,
          autoFlagged: data.autoFlagged
        });
      });
      
      setReports(reportsData);
      calculateStats(reportsData);
      setIsLoading(false);
      
      logger.info('[AdminReportsDashboard] Reports loaded', {
        count: reportsData.length
      });
    }, (error) => {
      logger.error('[AdminReportsDashboard] Listener error', error as Error);
      setIsLoading(false);
    });
    
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);
  
  /**
   * Apply filters
   */
  useEffect(() => {
    let filtered = [...reports];
    
    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    
    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(r => r.category === filters.category);
    }
    
    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter(r => r.priority === filters.priority);
    }
    
    // Search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.description.toLowerCase().includes(term) ||
        r.reportId.toLowerCase().includes(term)
      );
    }
    
    setFilteredReports(filtered);
  }, [reports, filters]);
  
  /**
   * Calculate statistics
   */
  const calculateStats = (reportsData: UserReport[]) => {
    setStats({
      total: reportsData.length,
      pending: reportsData.filter(r => r.status === 'pending').length,
      underReview: reportsData.filter(r => r.status === 'under_review').length,
      resolved: reportsData.filter(r => r.status === 'resolved').length,
      dismissed: reportsData.filter(r => r.status === 'dismissed').length,
      autoFlagged: reportsData.filter(r => r.autoFlagged).length
    });
  };
  
  /**
   * Update report status
   */
  const handleUpdateStatus = async (
    reportId: string,
    newStatus: UserReport['status'],
    reviewNotes?: string
  ) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: newStatus,
        reviewedBy: adminNumericId,
        reviewNotes: reviewNotes || '',
        updatedAt: Timestamp.now()
      });
      
      logger.info('[AdminReportsDashboard] Report updated', {
        reportId,
        newStatus,
        adminId: adminNumericId
      });
      
      setSelectedReport(null);
      
    } catch (error) {
      logger.error('[AdminReportsDashboard] Update failed', error as Error, {
        reportId
      });
    }
  };
  
  /**
   * Format timestamp
   */
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Get priority color
   */
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };
  
  /**
   * Get status icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'under_review': return <Eye size={16} />;
      case 'resolved': return <CheckCircle size={16} />;
      case 'dismissed': return <XCircle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };
  
  if (isLoading) {
    return (
      <DashboardContainer className={className}>
        <LoadingState>
          <LoadingSpinner />
          Loading reports...
        </LoadingState>
      </DashboardContainer>
    );
  }
  
  return (
    <DashboardContainer className={className}>
      <Header>
        <HeaderLeft>
          <Shield size={24} />
          <Title>Reports Dashboard</Title>
        </HeaderLeft>
        
        <RefreshButton onClick={() => window.location.reload()}>
          <RefreshCw size={18} />
          Refresh
        </RefreshButton>
      </Header>
      
      {/* Statistics */}
      <StatsGrid>
        <StatCard>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Reports</StatLabel>
        </StatCard>
        
        <StatCard $color="#f59e0b">
          <StatValue>{stats.pending}</StatValue>
          <StatLabel>Pending</StatLabel>
        </StatCard>
        
        <StatCard $color="#3b82f6">
          <StatValue>{stats.underReview}</StatValue>
          <StatLabel>Under Review</StatLabel>
        </StatCard>
        
        <StatCard $color="#10b981">
          <StatValue>{stats.resolved}</StatValue>
          <StatLabel>Resolved</StatLabel>
        </StatCard>
        
        <StatCard $color="#ef4444">
          <StatValue>{stats.autoFlagged}</StatValue>
          <StatLabel>Auto-Flagged</StatLabel>
        </StatCard>
      </StatsGrid>
      
      {/* Filters */}
      <FiltersBar>
        <SearchInput>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search reports..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
          />
        </SearchInput>
        
        <FilterSelect
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </FilterSelect>
        
        <FilterSelect
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="all">All Categories</option>
          <option value="spam">Spam</option>
          <option value="harassment">Harassment</option>
          <option value="scam">Scam</option>
          <option value="inappropriate">Inappropriate</option>
          <option value="fake">Fake Listing</option>
          <option value="other">Other</option>
        </FilterSelect>
        
        <FilterSelect
          value={filters.priority}
          onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </FilterSelect>
      </FiltersBar>
      
      {/* Reports List */}
      <ReportsList>
        {filteredReports.length === 0 && (
          <EmptyState>
            <Shield size={48} />
            <EmptyTitle>No reports found</EmptyTitle>
            <EmptyText>All clear! No reports match your filters.</EmptyText>
          </EmptyState>
        )}
        
        {filteredReports.map((report) => (
          <ReportCard
            key={report.reportId}
            onClick={() => setSelectedReport(report)}
            $selected={selectedReport?.reportId === report.reportId}
          >
            <ReportHeader>
              <ReportMeta>
                <StatusBadge $status={report.status}>
                  {getStatusIcon(report.status)}
                  {report.status.replace('_', ' ')}
                </StatusBadge>
                
                {report.autoFlagged && (
                  <AutoFlaggedBadge>
                    <Ban size={12} />
                    Auto-Flagged
                  </AutoFlaggedBadge>
                )}
              </ReportMeta>
              
              <PriorityBadge $color={getPriorityColor(report.priority)}>
                {report.priority.toUpperCase()}
              </PriorityBadge>
            </ReportHeader>
            
            <ReportContent>
              <ReportCategory>{report.category}</ReportCategory>
              <ReportDescription>{report.description}</ReportDescription>
            </ReportContent>
            
            <ReportFooter>
              <ReportInfo>
                Reported User: <strong>#{report.reportedUserId}</strong>
              </ReportInfo>
              <ReportTime>{formatTime(report.createdAt)}</ReportTime>
            </ReportFooter>
          </ReportCard>
        ))}
      </ReportsList>
      
      {/* Selected Report Modal */}
      {selectedReport && (
        <>
          <ModalOverlay onClick={() => setSelectedReport(null)} />
          <Modal>
            <ModalHeader>
              <ModalTitle>Report Details</ModalTitle>
              <CloseButton onClick={() => setSelectedReport(null)}>
                <XCircle size={24} />
              </CloseButton>
            </ModalHeader>
            
            <ModalContent>
              <DetailRow>
                <DetailLabel>Report ID:</DetailLabel>
                <DetailValue>{selectedReport.reportId}</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Reported User:</DetailLabel>
                <DetailValue>#{selectedReport.reportedUserId}</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Reported By:</DetailLabel>
                <DetailValue>#{selectedReport.reportedByUserId}</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Category:</DetailLabel>
                <DetailValue>{selectedReport.category}</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Priority:</DetailLabel>
                <PriorityBadge $color={getPriorityColor(selectedReport.priority)}>
                  {selectedReport.priority.toUpperCase()}
                </PriorityBadge>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Status:</DetailLabel>
                <StatusBadge $status={selectedReport.status}>
                  {getStatusIcon(selectedReport.status)}
                  {selectedReport.status.replace('_', ' ')}
                </StatusBadge>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Description:</DetailLabel>
                <DetailValue>{selectedReport.description}</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Created:</DetailLabel>
                <DetailValue>{formatTime(selectedReport.createdAt)}</DetailValue>
              </DetailRow>
              
              {selectedReport.reviewNotes && (
                <DetailRow>
                  <DetailLabel>Review Notes:</DetailLabel>
                  <DetailValue>{selectedReport.reviewNotes}</DetailValue>
                </DetailRow>
              )}
            </ModalContent>
            
            <ModalActions>
              <ActionButton
                $color="#3b82f6"
                onClick={() => handleUpdateStatus(selectedReport.reportId, 'under_review')}
              >
                <Eye size={16} />
                Review
              </ActionButton>
              
              <ActionButton
                $color="#10b981"
                onClick={() => handleUpdateStatus(selectedReport.reportId, 'resolved', 'Resolved by admin')}
              >
                <CheckCircle size={16} />
                Resolve
              </ActionButton>
              
              <ActionButton
                $color="#6b7280"
                onClick={() => handleUpdateStatus(selectedReport.reportId, 'dismissed', 'Dismissed - no violation')}
              >
                <XCircle size={16} />
                Dismiss
              </ActionButton>
            </ModalActions>
          </Modal>
        </>
      )}
    </DashboardContainer>
  );
};

// ==================== STYLED COMPONENTS ====================

const DashboardContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1f2937;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div<{ $color?: string }>`
  padding: 20px;
  border-radius: 12px;
  background: ${props => props.$color ? `${props.$color}15` : '#f9fafb'};
  border: 1px solid ${props => props.$color ? `${props.$color}30` : '#e5e7eb'};
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const FiltersBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SearchInput = styled.div`
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  
  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
  }
`;

const FilterSelect = styled.select`
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ReportsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReportCard = styled.div<{ $selected?: boolean }>`
  padding: 16px;
  border: 2px solid ${props => props.$selected ? '#3b82f6' : '#e5e7eb'};
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ReportMeta = styled.div`
  display: flex;
  gap: 8px;
`;

const StatusBadge = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  background: ${props => {
    switch (props.$status) {
      case 'pending': return '#fef3c7';
      case 'under_review': return '#dbeafe';
      case 'resolved': return '#d1fae5';
      case 'dismissed': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'pending': return '#92400e';
      case 'under_review': return '#1e40af';
      case 'resolved': return '#065f46';
      case 'dismissed': return '#4b5563';
      default: return '#4b5563';
    }
  }};
`;

const AutoFlaggedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: #fef2f2;
  color: #991b1b;
`;

const PriorityBadge = styled.div<{ $color: string }>`
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
`;

const ReportContent = styled.div`
  margin-bottom: 12px;
`;

const ReportCategory = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 6px;
`;

const ReportDescription = styled.div`
  font-size: 14px;
  color: #1f2937;
  line-height: 1.5;
`;

const ReportFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
`;

const ReportInfo = styled.div`
  font-size: 13px;
  color: #6b7280;
  
  strong {
    color: #1f2937;
    font-weight: 600;
  }
`;

const ReportTime = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  color: #9ca3af;
`;

const EmptyTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #4b5563;
  margin: 16px 0 8px;
`;

const EmptyText = styled.div`
  font-size: 14px;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px;
  font-size: 16px;
  color: #6b7280;
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  z-index: 9999;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #4b5563;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const DetailRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  min-width: 140px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
`;

const DetailValue = styled.div`
  flex: 1;
  font-size: 14px;
  color: #1f2937;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
`;

const ActionButton = styled.button<{ $color: string }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: ${props => props.$color};
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

export default AdminReportsDashboard;

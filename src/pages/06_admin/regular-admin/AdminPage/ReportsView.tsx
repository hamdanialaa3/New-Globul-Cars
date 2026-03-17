import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/firebase/firebase-config';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { logger } from '@/services/logger-service';
import { toast } from 'react-toastify';
import {
  AlertTriangle,
  Trash2,
  CheckCircle,
  Ban,
  ExternalLink,
  Clock,
  MessageSquare,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

// --- Glassmorphism Design System ---

const GlassContainer = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  border-radius: 24px;
  padding: 24px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
    border-color: rgba(255, 255, 255, 0.6);
  }
`;

const GlassHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  h2 {
    font-size: 24px;
    font-weight: 800;
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const GlassTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
`;

const GlassRow = styled.tr`
  transition: all 0.2s ease;
  
  td {
    padding: 16px;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(4px);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    
    &:first-child {
      border-top-left-radius: 12px;
      border-bottom-left-radius: 12px;
      border-left: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    &:last-child {
      border-top-right-radius: 12px;
      border-bottom-right-radius: 12px;
      border-right: 1px solid rgba(255, 255, 255, 0.2);
    }
  }

  &:hover td {
    background: rgba(255, 255, 255, 0.6);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Badge = styled.span<{ $type: 'danger' | 'warning' | 'info' | 'success' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
  backdrop-filter: blur(4px);
  
  ${props => {
    switch (props.$type) {
      case 'danger': return `
        background: rgba(254, 226, 226, 0.5);
        color: #b91c1c;
        border-color: rgba(254, 202, 202, 0.5);
      `;
      case 'warning': return `
        background: rgba(254, 243, 199, 0.5);
        color: #b45309;
        border-color: rgba(253, 230, 138, 0.5);
      `;
      case 'success': return `
        background: rgba(220, 252, 231, 0.5);
        color: #15803d;
        border-color: rgba(187, 247, 208, 0.5);
      `;
      default: return `
        background: rgba(226, 232, 240, 0.5);
        color: #475569;
        border-color: rgba(203, 213, 225, 0.5);
      `;
    }
  }}
`;

const ActionButton = styled.button<{ $variant: 'danger' | 'success' | 'ghost' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-right: 8px;
  position: relative;
  overflow: hidden;

  ${props => {
    switch (props.$variant) {
      case 'danger': return `
        background: rgba(254, 226, 226, 0.4);
        color: #dc2626;
        &:hover { background: rgba(254, 226, 226, 0.8); transform: translateY(-2px); }
      `;
      case 'success': return `
        background: rgba(220, 252, 231, 0.4);
        color: #16a34a;
        &:hover { background: rgba(220, 252, 231, 0.8); transform: translateY(-2px); }
      `;
      default: return `
        background: transparent;
        color: #64748b;
        &:hover { background: rgba(0, 0, 0, 0.05); color: #0f172a; }
      `;
    }
  }}

  &:active {
    transform: scale(0.95) translateY(0);
  }
`;

interface Report {
  id: string;
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
  reason: string;
  description: string;
  reportedBy: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: any;
}

const ReportsView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for reports
    const q = query(
      collection(db, 'reports'),
      orderBy('createdAt', 'desc')
    );

    let isActive = true;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!isActive) return;
      const reportsData = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as Report));
      setReports(reportsData);
      setLoading(false);
    }, (error) => {
      if (!isActive) return;
      logger.error('Error fetching reports:', error);
      setLoading(false);
    });

    return () => { isActive = false; unsubscribe(); };
  }, []);

  const handleDismiss = async (reportId: string) => {
    if (!window.confirm('Dismiss this report?')) return;
    try {
      await deleteDoc(doc(db, 'reports', reportId));
      toast.success('Report dismissed');
    } catch (error) {
      logger.error('Error dismissing report:', error);
      toast.error('Failed to dismiss report');
    }
  };

  const handleDeleteContent = async (report: Report) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY DELETE this content?')) return;

    try {
      if (report.targetType === 'post') {
        await deleteDoc(doc(db, 'posts', report.targetId));
      } else if (report.targetType === 'comment') {
        // Complex: need parent post ID usually, simplifying for now
        toast.info('Comment deletion requires implementation of recursive delete');
        return;
      }

      // Mark report as resolved
      await updateDoc(doc(db, 'reports', report.id), {
        status: 'resolved',
        resolution: 'content_deleted',
        resolvedBy: user?.uid,
        resolvedAt: serverTimestamp()
      });

      toast.success('Content deleted and report resolved');
    } catch (error) {
      logger.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!window.confirm('Ban this user? They will lose access immediately.')) return;

    try {
      await updateDoc(doc(db, 'users', userId), {
        accountStatus: 'banned',
        bannedAt: serverTimestamp(),
        bannedBy: user?.uid
      });
      toast.success('User banned successfully');
    } catch (error) {
      logger.error('Error banning user:', error);
      toast.error('Failed to ban user');
    }
  };

  if (loading) return (
    <div className="flex justify-center p-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <GlassContainer>
        <GlassHeader>
          <h2>
            <Shield size={28} className="text-blue-500" />
            Moderation Dashboard
          </h2>
          <Badge $type="info">
            {reports.length} Pending Reports
          </Badge>
        </GlassHeader>

        {reports.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-400 opacity-50" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-sm">No pending reports to review.</p>
          </div>
        ) : (
          <GlassTable>
            <thead>
              <tr>
                <TableHeader>Reported Item</TableHeader>
                <TableHeader>Reason</TableHeader>
                <TableHeader>Details</TableHeader>
                <TableHeader>Time</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <GlassRow key={report.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${report.targetType === 'post' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}
                      `}>
                        {report.targetType === 'post' ? <ExternalLink size={18} /> : <MessageSquare size={18} />}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 capitalize">{report.targetType}</div>
                        <div className="text-xs text-gray-500 font-mono">{report.targetId.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge $type="warning">
                      <AlertTriangle size={12} />
                      {report.reason}
                    </Badge>
                  </td>
                  <td>
                    <p className="text-sm text-gray-600 truncate max-w-[200px]" title={report.description}>
                      {report.description || 'No description provided'}
                    </p>
                    <div className="text-xs text-gray-400 mt-1">
                      By: {report.reportedBy ? 'User' : 'Anonymous'}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock size={14} />
                      {report.createdAt?.toDate
                        ? format(report.createdAt.toDate(), 'MMM d, HH:mm')
                        : 'Just now'}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <ActionButton
                        $variant="success"
                        onClick={() => handleDismiss(report.id)}
                        title="Dismiss Report"
                      >
                        <CheckCircle size={18} />
                      </ActionButton>

                      <ActionButton
                        $variant="danger"
                        onClick={() => handleDeleteContent(report)}
                        title="Delete Content"
                      >
                        <Trash2 size={18} />
                      </ActionButton>

                      <ActionButton
                        $variant="danger"
                        onClick={() => handleBanUser(report.targetId)} // Assuming targetId might be user or we fetch author
                        title="Ban User (Requires Author ID)"
                        style={{ marginLeft: 8, opacity: 0.5 }}
                      >
                        <Ban size={18} />
                      </ActionButton>
                    </div>
                  </td>
                </GlassRow>
              ))}
            </tbody>
          </GlassTable>
        )}
      </GlassContainer>
    </div>
  );
};

export default ReportsView;

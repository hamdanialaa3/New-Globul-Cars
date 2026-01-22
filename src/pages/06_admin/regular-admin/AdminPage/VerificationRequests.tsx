import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../../../contexts/AuthProvider';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { idVerificationService, type IDVerificationRequest } from '../../../../services/verification/id-verification-service';
import { db } from '../../../../firebase/firebase-config';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { logger } from '../../../../services/logger-service';
import { toast } from 'react-toastify';
import {
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    ExternalLink,
    User,
    Shield,
    Briefcase
} from 'lucide-react';
import { format } from 'date-fns';

const PageContainer = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
  
  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 8px 0;
  }
  
  p {
    color: #64748b;
    font-size: 14px;
  }
`;

const RequestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const RequestCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div<{ $status: string }>`
  padding: 16px;
  background: ${props => {
        switch (props.$status) {
            case 'pending': return '#fefce8';
            case 'approved': return '#f0fdf4';
            case 'rejected': return '#fef2f2';
            default: return '#f8fafc';
        }
    }};
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusBadge = styled.span<{ $status: string }>`
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: capitalize;
  
  ${props => {
        switch (props.$status) {
            case 'pending': return 'background: #fef9c3; color: #854d0e;';
            case 'approved': return 'background: #dcfce7; color: #166534;';
            case 'rejected': return 'background: #fee2e2; color: #991b1b;';
            default: return 'background: #f1f5f9; color: #475569;';
        }
    }}
`;

const UserInfo = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 12px;
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
  }
  
  .details {
    display: flex;
    flex-direction: column;
    
    .name { font-weight: 600; color: #0f172a; font-size: 14px; }
    .email { color: #64748b; font-size: 12px; }
  }
`;

const DocumentsList = styled.div`
  padding: 16px;
  flex: 1;
  
  h4 {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    margin: 0 0 12px 0;
  }
`;

const DocumentItem = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
  text-decoration: none;
  color: #334155;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
  
  &:last-child { margin-bottom: 0; }
  
  span { flex: 1; font-size: 13px; font-weight: 500; }
`;

const Actions = styled.div`
  padding: 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button<{ $variant: 'success' | 'danger' }>`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  
  ${props => props.$variant === 'success'
        ? 'background: #dcfce7; color: #166534; &:hover { background: #bbf7d0; }'
        : 'background: #fee2e2; color: #991b1b; &:hover { background: #fecaca; }'
    }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const VerificationRequests: React.FC = () => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const [requests, setRequests] = useState<IDVerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const q = query(
            collection(db, 'verificationRequests'),
            orderBy('submittedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
                submittedAt: doc.data().submittedAt?.toDate(),
                reviewedAt: doc.data().reviewedAt?.toDate()
            })) as any[];

            setRequests(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleApprove = async (request: any) => {
        if (!user || processingId) return;

        if (!window.confirm('Approve this verification request?')) return;

        setProcessingId(request.id);
        try {
            const success = await idVerificationService.approveVerification(request.id, user.uid);
            if (success) {
                toast.success('Request approved successfully');
            } else {
                toast.error('Failed to approve request');
            }
        } catch (error) {
            logger.error('Error approving request', error as Error);
            toast.error('An error occurred');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (request: any) => {
        if (!user || processingId) return;

        const reason = prompt('Reason for rejection:');
        if (reason === null) return;

        setProcessingId(request.id);
        try {
            // Direct update for rejection for now, eventually move to service
            await updateDoc(doc(db, 'verificationRequests', request.id), {
                status: 'rejected',
                rejectionReason: reason,
                reviewedBy: user.uid,
                reviewedAt: serverTimestamp()
            });

            await updateDoc(doc(db, 'users', request.userId), {
                'verification.identity.status': 'rejected',
                'verification.identity.rejectionReason': reason,
                updatedAt: serverTimestamp()
            });

            toast.info('Request rejected');
        } catch (error) {
            logger.error('Error rejecting request', error as Error);
            toast.error('An error occurred');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div>Loading requests...</div>;

    return (
        <PageContainer>
            <Header>
                <h2>Verification Requests</h2>
                <p>Review and approve user identity verifications.</p>
            </Header>

            <RequestsGrid>
                {requests.map((req: any) => (
                    <RequestCard key={req.id}>
                        <CardHeader $status={req.status}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {req.type === 'identity' ? <User size={16} /> : <Briefcase size={16} />}
                                <span style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>
                                    {req.type} Verification
                                </span>
                            </div>
                            <StatusBadge $status={req.status}>{req.status}</StatusBadge>
                        </CardHeader>

                        <UserInfo>
                            <div className="avatar">
                                <User size={20} />
                            </div>
                            <div className="details">
                                <span className="name">User ID: {req.userId.substring(0, 8)}...</span>
                                <span className="email">
                                    Submitted: {req.submittedAt ? format(req.submittedAt, 'MMM d, yyyy') : '-'}
                                </span>
                            </div>
                        </UserInfo>

                        <DocumentsList>
                            <h4>Documents</h4>
                            {req.documents?.front && (
                                <DocumentItem href={req.documents.front} target="_blank" rel="noopener noreferrer">
                                    <FileText size={16} />
                                    <span>Front ID</span>
                                    <ExternalLink size={14} />
                                </DocumentItem>
                            )}
                            {req.documents?.back && (
                                <DocumentItem href={req.documents.back} target="_blank" rel="noopener noreferrer">
                                    <FileText size={16} />
                                    <span>Back ID</span>
                                    <ExternalLink size={14} />
                                </DocumentItem>
                            )}
                            {req.documents?.selfie && (
                                <DocumentItem href={req.documents.selfie} target="_blank" rel="noopener noreferrer">
                                    <User size={16} />
                                    <span>Selfie</span>
                                    <ExternalLink size={14} />
                                </DocumentItem>
                            )}
                        </DocumentsList>

                        {req.status === 'pending' && (
                            <Actions>
                                <ActionButton
                                    $variant="danger"
                                    onClick={() => handleReject(req)}
                                    disabled={!!processingId}
                                >
                                    <XCircle size={16} /> Reject
                                </ActionButton>
                                <ActionButton
                                    $variant="success"
                                    onClick={() => handleApprove(req)}
                                    disabled={!!processingId}
                                >
                                    <CheckCircle size={16} /> Approve
                                </ActionButton>
                            </Actions>
                        )}
                    </RequestCard>
                ))}

                {requests.length === 0 && (
                    <div style={{ colSpan: 3, textAlign: 'center', padding: 40, color: '#64748b' }}>
                        No verification requests found.
                    </div>
                )}
            </RequestsGrid>
        </PageContainer>
    );
};

export default VerificationRequests;

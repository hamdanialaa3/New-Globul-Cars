import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { adminService, PendingVerification } from '../../../../services/admin/admin-service';
import { logger } from '../../../../services/logger-service';
import { toast } from 'react-toastify';
import { Check, X, FileText, ExternalLink, RefreshCw } from 'lucide-react';

const Container = styled.div`
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-secondary);
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-primary);
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s;

  &:hover {
    border-color: var(--secondary-main);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const Info = styled.div`
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: var(--text-primary);
  }
  p {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
`;

const Badge = styled.span<{ type: 'dealer' | 'company' }>`
  background: ${props => props.type === 'company' ? 'rgba(29, 78, 216, 0.1)' : 'rgba(22, 163, 74, 0.1)'};
  color: ${props => props.type === 'company' ? '#1d4ed8' : '#16a34a'};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const DocGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DocLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-card);
  border: 1px dashed var(--border-secondary);
  border-radius: 6px;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    border-color: var(--secondary-main);
    color: var(--secondary-main);
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 1rem;
  border-top: 1px solid var(--border-secondary);
  padding-top: 1rem;
`;

const Button = styled.button<{ variant: 'approve' | 'reject' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  background: ${props => props.variant === 'approve' ? 'var(--success-main)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${props => props.variant === 'approve' ? 'white' : 'var(--error-main)'};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
  
  svg {
    margin-bottom: 1rem;
    color: var(--border-secondary);
  }
`;

export const VerificationQueue: React.FC = () => {
    const [items, setItems] = useState<PendingVerification[]>([]);
    const [loading, setLoading] = useState(true);

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await adminService.getPendingVerifications();
            setItems(data);
        } catch (error) {
            toast.error('Failed to load pending verifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const handleApprove = async (id: string, uid: string) => {
        try {
            if (!confirm('Are you sure you want to approve this dealer?')) return;
            await adminService.approveVerification(id, uid);
            toast.success('Dealer approved successfully');
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            toast.error('Failed to approve dealer');
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Enter rejection reason:');
        if (reason === null) return; // Cancelled

        try {
            await adminService.rejectVerification(id, reason || 'Did not meet requirements');
            toast.success('Dealer rejected');
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            toast.error('Failed to reject dealer');
        }
    };

    if (loading) return <div>Loading queue...</div>;

    return (
        <Container>
            <Title>
                Verification Queue
                <span style={{
                    background: 'var(--secondary-main)',
                    color: 'white',
                    fontSize: '0.8rem',
                    padding: '2px 8px',
                    borderRadius: '12px'
                }}>
                    {items.length}
                </span>
                <button
                    onClick={loadItems}
                    style={{
                        marginLeft: 'auto',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                    }}
                >
                    <RefreshCw size={18} />
                </button>
            </Title>

            {items.length === 0 ? (
                <EmptyState>
                    <p>No pending verifications. All clear!</p>
                </EmptyState>
            ) : (
                <List>
                    {items.map(item => (
                        <Item key={item.id}>
                            <Header>
                                <Info>
                                    <h3>{item.name}</h3>
                                    <p>UID: {item.uid.substring(0, 8)}... • {item.submittedAt.toLocaleDateString()}</p>
                                    {item.userData?.email && <p>{item.userData.email}</p>}
                                </Info>
                                <Badge type={item.type}>{item.type}</Badge>
                            </Header>

                            <DocGrid>
                                {item.documents.license ? (
                                    <DocLink href={item.documents.license} target="_blank" rel="noopener noreferrer">
                                        <FileText size={16} /> License Document <ExternalLink size={12} />
                                    </DocLink>
                                ) : (
                                    <p style={{ color: 'var(--error-main)', fontSize: '0.9rem' }}>Missing License</p>
                                )}

                                {item.documents.vat && (
                                    <DocLink href={item.documents.vat} target="_blank" rel="noopener noreferrer">
                                        <FileText size={16} /> VAT Document <ExternalLink size={12} />
                                    </DocLink>
                                )}
                            </DocGrid>

                            <ActionRow>
                                <Button variant="reject" onClick={() => handleReject(item.id)}>
                                    <X size={18} /> Reject
                                </Button>
                                <Button variant="approve" onClick={() => handleApprove(item.id, item.uid)}>
                                    <Check size={18} /> Approve & Unlock
                                </Button>
                            </ActionRow>
                        </Item>
                    ))}
                </List>
            )}
        </Container>
    );
};

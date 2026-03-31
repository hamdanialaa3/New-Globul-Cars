import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Send, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useBulkUploadJob } from '../../hooks/useBulkUploadJob';
import { bulkUploadService } from '../../services/dealer/bulk-upload.service';
import { BulkUploadProgress } from '../../components/dealer/BulkUploadProgress';
import { toast } from 'react-toastify';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

const BulkReviewPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { job, loading, error } = useBulkUploadJob(batchId);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [publishing, setPublishing] = useState(false);

  if (loading) {
    return (
      <Container>
        <BulkUploadProgress progress={0} status="Loading job data…" />
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container>
        <EmptyState>
          <AlertTriangle size={40} />
          <p>{error ?? 'Bulk upload job not found.'}</p>
          <BackButton onClick={() => navigate('/dealer-dashboard')}>Back to Dashboard</BackButton>
        </EmptyState>
      </Container>
    );
  }

  const percentage =
    job.totalCars > 0 ? Math.round((job.processedCars / job.totalCars) * 100) : 0;

  const items = job.reviewItems ?? [];
  const pendingCount = items.filter(i => i.reviewStatus === 'pending').length;
  const approvedCount = items.filter(i => i.reviewStatus === 'approved').length;
  const rejectedCount = items.filter(i => i.reviewStatus === 'rejected').length;

  const filtered = items.filter(i => filter === 'all' || i.reviewStatus === filter);

  const handleApprove = async (numericId: number) => {
    if (!batchId) return;
    try {
      await bulkUploadService.approveReviewItem(batchId, numericId);
    } catch {
      toast.error('Failed to approve item');
    }
  };

  const handleReject = async (numericId: number) => {
    if (!batchId) return;
    try {
      await bulkUploadService.rejectReviewItem(batchId, numericId);
    } catch {
      toast.error('Failed to reject item');
    }
  };

  const handlePublish = async () => {
    if (!batchId) return;
    const toPublish = items.filter(
      i => i.reviewStatus === 'approved' || i.reviewStatus === 'pending'
    ).length;
    if (!toPublish) {
      toast.info('No items to publish. Approve at least one vehicle first.');
      return;
    }
    setPublishing(true);
    try {
      const count = await bulkUploadService.publishApprovedItems(batchId);
      toast.success(`${count} vehicle${count !== 1 ? 's' : ''} published successfully!`);
      navigate('/dealer-dashboard');
    } catch (err) {
      toast.error('Publish failed. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const isProcessing = job.status === 'uploading' || job.status === 'processing';
  const isCompleted = job.status === 'completed';

  return (
    <Container>
      <Header>
        <LeftGroup>
          <IconButton onClick={() => navigate('/dealer-dashboard')}>
            <ArrowLeft size={18} />
          </IconButton>
          <h1>Bulk Review Dashboard</h1>
        </LeftGroup>
        <PublishButton
          onClick={handlePublish}
          disabled={publishing || isProcessing || isCompleted || approvedCount + pendingCount === 0}
        >
          <Send size={16} />
          {publishing ? 'Publishing…' : `Publish ${approvedCount + pendingCount} Vehicles`}
        </PublishButton>
      </Header>

      {/* Job status summary */}
      <SummaryCards>
        <SummaryCard>
          <SummaryLabel>Status</SummaryLabel>
          <StatusBadge $status={job.status}>{job.status}</StatusBadge>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Source</SummaryLabel>
          <SummaryValue>{job.sourceType.replace('_', ' ')}</SummaryValue>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Processing</SummaryLabel>
          <SummaryValue>{job.processedCars} / {job.totalCars}</SummaryValue>
        </SummaryCard>
        <SummaryCard $highlight="pending">
          <SummaryLabel>Pending</SummaryLabel>
          <SummaryValue>{pendingCount}</SummaryValue>
        </SummaryCard>
        <SummaryCard $highlight="approved">
          <SummaryLabel>Approved</SummaryLabel>
          <SummaryValue>{approvedCount}</SummaryValue>
        </SummaryCard>
        <SummaryCard $highlight="rejected">
          <SummaryLabel>Rejected</SummaryLabel>
          <SummaryValue>{rejectedCount}</SummaryValue>
        </SummaryCard>
      </SummaryCards>

      {isProcessing && (
        <ProgressWrapper>
          <BulkUploadProgress progress={percentage} status={job.status} />
        </ProgressWrapper>
      )}

      {job.errors?.length > 0 && (
        <ErrorCard>
          <h3>Upload Errors</h3>
          {job.errors.map((item, idx) => (
            <ErrorLine key={idx}>
              #{item.index ?? '-'}: {item.message}
            </ErrorLine>
          ))}
        </ErrorCard>
      )}

      {/* Filter tabs */}
      {items.length > 0 && (
        <>
          <FilterRow>
            {(['all', 'pending', 'approved', 'rejected'] as FilterTab[]).map(tab => (
              <FilterTab key={tab} $active={filter === tab} onClick={() => setFilter(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <FilterCount>
                  {tab === 'all' ? items.length
                    : tab === 'pending' ? pendingCount
                    : tab === 'approved' ? approvedCount
                    : rejectedCount}
                </FilterCount>
              </FilterTab>
            ))}
          </FilterRow>

          {/* Review table */}
          <Table>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Make / Model</Th>
                <Th>Year</Th>
                <Th>Fuel</Th>
                <Th>Gearbox</Th>
                <Th>Mileage</Th>
                <Th>Price (€)</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <Tr key={item.numericId} $status={item.reviewStatus}>
                  <Td>{idx + 1}</Td>
                  <Td><strong>{item.make} {item.model}</strong></Td>
                  <Td>{item.year}</Td>
                  <Td>{item.fuelType ?? '—'}</Td>
                  <Td>{item.transmission ?? '—'}</Td>
                  <Td>{item.mileage != null ? `${item.mileage.toLocaleString()} km` : '—'}</Td>
                  <Td>{item.price != null ? item.price.toLocaleString() : '—'}</Td>
                  <Td>
                    <RowBadge $status={item.reviewStatus}>{item.reviewStatus}</RowBadge>
                  </Td>
                  <Td>
                    <ActionRow>
                      {item.reviewStatus !== 'approved' && (
                        <ApproveBtn
                          title="Approve"
                          onClick={() => handleApprove(item.numericId)}
                          disabled={isProcessing || isCompleted}
                        >
                          <CheckCircle size={16} />
                        </ApproveBtn>
                      )}
                      {item.reviewStatus !== 'rejected' && (
                        <RejectBtn
                          title="Reject"
                          onClick={() => handleReject(item.numericId)}
                          disabled={isProcessing || isCompleted}
                        >
                          <XCircle size={16} />
                        </RejectBtn>
                      )}
                    </ActionRow>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {items.length === 0 && !isProcessing && (
        <EmptyState>
          <p>No vehicles in this batch yet.</p>
        </EmptyState>
      )}
    </Container>
  );
};

/* ─── Styled components ─────────────────────────────────────────────── */

const Container = styled.div`
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;

  h1 {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IconButton = styled.button`
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #374151;

  &:hover {
    background: #e5e7eb;
  }
`;

const PublishButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #1d4ed8;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;

  &:hover:not(:disabled) {
    background: #1e40af;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BackButton = styled.button`
  background: #1d4ed8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
  margin-top: 12px;
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const SummaryCard = styled.div<{ $highlight?: string }>`
  background: ${({ $highlight }) =>
    $highlight === 'approved' ? '#f0fdf4' :
    $highlight === 'rejected' ? '#fef2f2' :
    $highlight === 'pending' ? '#fffbeb' : '#fff'};
  border: 1px solid ${({ $highlight }) =>
    $highlight === 'approved' ? '#bbf7d0' :
    $highlight === 'rejected' ? '#fecaca' :
    $highlight === 'pending' ? '#fde68a' : '#e5e7eb'};
  border-radius: 10px;
  padding: 12px 16px;
`;

const SummaryLabel = styled.div`
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const SummaryValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  background: ${({ $status }) =>
    $status === 'review' ? '#dbeafe' :
    $status === 'completed' ? '#d1fae5' :
    $status === 'failed' ? '#fee2e2' :
    $status === 'processing' ? '#fef3c7' : '#f3f4f6'};
  color: ${({ $status }) =>
    $status === 'review' ? '#1d4ed8' :
    $status === 'completed' ? '#065f46' :
    $status === 'failed' ? '#b91c1c' :
    $status === 'processing' ? '#92400e' : '#374151'};
`;

const ProgressWrapper = styled.div`
  margin-bottom: 16px;
`;

const ErrorCard = styled.div`
  background: #fff5f5;
  border: 1px solid #fee2e2;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;

  h3 {
    margin: 0 0 8px;
    color: #b91c1c;
  }
`;

const ErrorLine = styled.div`
  color: #b91c1c;
  font-size: 13px;
  margin-bottom: 4px;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
`;

const FilterTab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? '#2563eb' : '#e5e7eb')};
  background: ${({ $active }) => ($active ? '#dbeafe' : '#fff')};
  color: ${({ $active }) => ($active ? '#1d4ed8' : '#374151')};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  font-size: 13px;
  cursor: pointer;
`;

const FilterCount = styled.span`
  background: #e5e7eb;
  color: #374151;
  border-radius: 999px;
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 700;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  background: #f9fafb;
  color: #6b7280;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.4px;
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
`;

const Tr = styled.tr<{ $status: string }>`
  background: ${({ $status }) =>
    $status === 'approved' ? '#f0fdf4' :
    $status === 'rejected' ? '#fef2f2' : '#fff'};
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ $status }) =>
      $status === 'approved' ? '#dcfce7' :
      $status === 'rejected' ? '#fee2e2' : '#f9fafb'};
  }
`;

const Td = styled.td`
  padding: 10px 12px;
  vertical-align: middle;
  color: #374151;
`;

const RowBadge = styled.span<{ $status: string }>`
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ $status }) =>
    $status === 'approved' ? '#d1fae5' :
    $status === 'rejected' ? '#fee2e2' : '#fef3c7'};
  color: ${({ $status }) =>
    $status === 'approved' ? '#065f46' :
    $status === 'rejected' ? '#b91c1c' : '#92400e'};
`;

const ActionRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const ApproveBtn = styled.button`
  background: #d1fae5;
  border: none;
  border-radius: 6px;
  padding: 5px;
  cursor: pointer;
  color: #065f46;
  display: flex;
  align-items: center;

  &:hover:not(:disabled) {
    background: #a7f3d0;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const RejectBtn = styled.button`
  background: #fee2e2;
  border: none;
  border-radius: 6px;
  padding: 5px;
  cursor: pointer;
  color: #b91c1c;
  display: flex;
  align-items: center;

  &:hover:not(:disabled) {
    background: #fecaca;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: #9ca3af;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

export default BulkReviewPage;


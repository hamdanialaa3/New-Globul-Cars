// ReviewModerationPage.tsx
// Admin page for moderating user reviews
// Cloud Apps 4.6 - B4: Review Moderation

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/firebase/firebase-config';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { logger } from '@/services/logger-service';
import { toast } from 'react-toastify';
import {
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Flag,
  Clock,
  Filter
} from 'lucide-react';

type ReviewStatus = 'pending' | 'approved' | 'rejected';
type FilterStatus = ReviewStatus | 'all' | 'reported';

interface ModerationReview {
  id: string;
  reviewerId: string;
  targetUserId?: string;
  sellerId?: string;
  buyerId?: string;
  rating: number;
  comment?: string;
  title?: string;
  status: ReviewStatus;
  reportCount: number;
  verified: boolean;
  createdAt: any;
}

const ReviewModerationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<ModerationReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const t = {
    title: language === 'bg' ? 'Модерация на отзиви' : 'Review Moderation',
    pending: language === 'bg' ? 'Чакащи' : 'Pending',
    approved: language === 'bg' ? 'Одобрени' : 'Approved',
    rejected: language === 'bg' ? 'Отхвърлени' : 'Rejected',
    reported: language === 'bg' ? 'Докладвани' : 'Reported',
    all: language === 'bg' ? 'Всички' : 'All',
    approve: language === 'bg' ? 'Одобри' : 'Approve',
    reject: language === 'bg' ? 'Отхвърли' : 'Reject',
    noReviews: language === 'bg' ? 'Няма отзиви' : 'No reviews found',
    rating: language === 'bg' ? 'Рейтинг' : 'Rating',
    reviewer: language === 'bg' ? 'Рецензент' : 'Reviewer',
    target: language === 'bg' ? 'Цел' : 'Target',
    status: language === 'bg' ? 'Статус' : 'Status',
    reports: language === 'bg' ? 'Доклади' : 'Reports',
    actions: language === 'bg' ? 'Действия' : 'Actions',
    date: language === 'bg' ? 'Дата' : 'Date',
  };

  useEffect(() => {
    fetchReviews();
  }, [filterStatus]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const reviewsRef = collection(db, 'reviews');
      let q;

      if (filterStatus === 'all') {
        q = query(reviewsRef, orderBy('createdAt', 'desc'), limit(100));
      } else if (filterStatus === 'reported') {
        q = query(reviewsRef, where('reportCount', '>', 0), orderBy('reportCount', 'desc'), limit(100));
      } else {
        q = query(reviewsRef, where('status', '==', filterStatus), orderBy('createdAt', 'desc'), limit(100));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as ModerationReview));

      setReviews(data);
    } catch (error) {
      logger.error('Failed to fetch reviews for moderation', error as Error);
      toast.error(language === 'bg' ? 'Грешка при зареждане' : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewId: string, newStatus: ReviewStatus) => {
    setActionLoading(reviewId);
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        status: newStatus,
        moderatedBy: currentUser?.uid,
        moderatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, status: newStatus } : r
      ));

      toast.success(
        newStatus === 'approved'
          ? (language === 'bg' ? 'Отзивът е одобрен' : 'Review approved')
          : (language === 'bg' ? 'Отзивът е отхвърлен' : 'Review rejected')
      );
    } catch (error) {
      logger.error('Failed to update review status', error as Error, { reviewId, newStatus });
      toast.error(language === 'bg' ? 'Грешка' : 'Failed to update');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getStatusBadge = (status: ReviewStatus) => {
    const colors = {
      pending: { bg: '#FEF3C7', text: '#92400E', icon: <Clock size={14} /> },
      approved: { bg: '#D1FAE5', text: '#065F46', icon: <CheckCircle size={14} /> },
      rejected: { bg: '#FEE2E2', text: '#991B1B', icon: <XCircle size={14} /> }
    };
    const c = colors[status];
    return (
      <StatusBadge style={{ background: c.bg, color: c.text }}>
        {c.icon} {status}
      </StatusBadge>
    );
  };

  return (
    <Container>
      <Header>
        <h2><Flag size={24} /> {t.title}</h2>
        <FilterBar>
          {(['pending', 'approved', 'rejected', 'reported', 'all'] as FilterStatus[]).map(status => (
            <FilterButton
              key={status}
              $active={filterStatus === status}
              onClick={() => setFilterStatus(status)}
            >
              {t[status]}
            </FilterButton>
          ))}
        </FilterBar>
      </Header>

      {loading ? (
        <LoadingState>Loading...</LoadingState>
      ) : reviews.length === 0 ? (
        <EmptyState>
          <Eye size={48} />
          <p>{t.noReviews}</p>
        </EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>{t.date}</Th>
              <Th>{t.reviewer}</Th>
              <Th>{t.target}</Th>
              <Th>{t.rating}</Th>
              <Th>Comment</Th>
              <Th>{t.status}</Th>
              <Th>{t.reports}</Th>
              <Th>{t.actions}</Th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <Tr key={review.id}>
                <Td>{formatDate(review.createdAt)}</Td>
                <Td><code>{review.reviewerId?.slice(0, 8)}...</code></Td>
                <Td><code>{(review.targetUserId || review.sellerId || '—').slice(0, 8)}...</code></Td>
                <Td>
                  <RatingDisplay>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={14} fill={i <= review.rating ? '#fbbf24' : 'none'} color="#fbbf24" />
                    ))}
                  </RatingDisplay>
                </Td>
                <Td>
                  <CommentCell>
                    {review.title && <strong>{review.title}</strong>}
                    {review.comment?.slice(0, 100)}{(review.comment?.length || 0) > 100 ? '...' : ''}
                  </CommentCell>
                </Td>
                <Td>{getStatusBadge(review.status)}</Td>
                <Td>
                  {review.reportCount > 0 && (
                    <ReportBadge>
                      <AlertTriangle size={14} /> {review.reportCount}
                    </ReportBadge>
                  )}
                </Td>
                <Td>
                  <Actions>
                    {review.status !== 'approved' && (
                      <ActionBtn
                        $variant="approve"
                        onClick={() => handleStatusChange(review.id, 'approved')}
                        disabled={actionLoading === review.id}
                      >
                        <CheckCircle size={16} />
                      </ActionBtn>
                    )}
                    {review.status !== 'rejected' && (
                      <ActionBtn
                        $variant="reject"
                        onClick={() => handleStatusChange(review.id, 'rejected')}
                        disabled={actionLoading === review.id}
                      >
                        <XCircle size={16} />
                      </ActionBtn>
                    )}
                  </Actions>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ReviewModerationPage;

// Styled Components

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
`;

const Header = styled.div`
  margin-bottom: 32px;

  h2 {
    font-size: 28px;
    font-weight: 800;
    color: #1E293B;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid ${p => p.$active ? '#2563EB' : '#E2E8F0'};
  background: ${p => p.$active ? '#2563EB' : 'white'};
  color: ${p => p.$active ? 'white' : '#64748B'};
  transition: all 0.2s;

  &:hover {
    border-color: #2563EB;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 6px;
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #94A3B8;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #F1F5F9;
`;

const Tr = styled.tr`
  transition: background 0.2s;
  &:hover { background: #F8FAFC; }
`;

const Td = styled.td`
  padding: 14px 16px;
  font-size: 14px;
  color: #334155;
  border-bottom: 1px solid #F1F5F9;
  vertical-align: middle;

  code {
    font-size: 12px;
    background: #F1F5F9;
    padding: 2px 6px;
    border-radius: 4px;
    color: #475569;
  }
`;

const RatingDisplay = styled.div`
  display: flex;
  gap: 2px;
`;

const CommentCell = styled.div`
  max-width: 300px;
  font-size: 13px;
  line-height: 1.4;

  strong {
    display: block;
    margin-bottom: 4px;
    color: #1E293B;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
`;

const ReportBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #DC2626;
  font-weight: 600;
  font-size: 14px;
`;

const Actions = styled.div`
  display: flex;
  gap: 6px;
`;

const ActionBtn = styled.button<{ $variant: 'approve' | 'reject' }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  background: ${p => p.$variant === 'approve' ? '#D1FAE5' : '#FEE2E2'};
  color: ${p => p.$variant === 'approve' ? '#065F46' : '#991B1B'};

  &:hover {
    transform: scale(1.1);
    background: ${p => p.$variant === 'approve' ? '#A7F3D0' : '#FECACA'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #94A3B8;
  font-size: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #94A3B8;

  p {
    margin-top: 16px;
    font-size: 16px;
  }
`;

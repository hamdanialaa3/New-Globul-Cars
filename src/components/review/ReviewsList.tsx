/**
 * ReviewsList
 * Displays a paginated list of approved reviews for a user
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Star, ThumbsUp, Flag, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase-config';
import { collection, query, where, orderBy, limit, startAfter, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { logger } from '../../services/logger-service';

interface ReviewItem {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  wouldRecommend: boolean;
  aspectRatings?: { communication?: number; reliability?: number; fairness?: number };
  helpful: number;
  reportCount: number;
  createdAt: any;
  status: string;
}

interface ReviewsListProps {
  targetUserId: string;
  refreshKey?: number;
}

const PAGE_SIZE = 10;

export const ReviewsList: React.FC<ReviewsListProps> = ({ targetUserId, refreshKey }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);
  const [helpedIds, setHelpedIds] = useState<Set<string>>(new Set());

  const t = useCallback((bg: string, en: string) => language === 'bg' ? bg : en, [language]);

  const fetchReviews = useCallback(async (afterDoc?: any) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'reviews'),
        where('targetUserId', '==', targetUserId),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      );
      if (afterDoc) {
        q = query(
          collection(db, 'reviews'),
          where('targetUserId', '==', targetUserId),
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc'),
          startAfter(afterDoc),
          limit(PAGE_SIZE)
        );
      }
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as ReviewItem));

      if (afterDoc) {
        setReviews(prev => [...prev, ...items]);
      } else {
        setReviews(items);
      }
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      logger.error('Failed to fetch reviews', { error: err });
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshKey]);

  const handleLoadMore = () => {
    if (lastDoc) fetchReviews(lastDoc);
  };

  const handleHelpful = async (reviewId: string) => {
    if (!user?.uid || helpedIds.has(reviewId)) return;
    try {
      await updateDoc(doc(db, 'reviews', reviewId), { helpful: increment(1) });
      setHelpedIds(prev => new Set(prev).add(reviewId));
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r));
    } catch (err) {
      logger.error('Failed to mark helpful', { error: err });
    }
  };

  const handleReport = async (reviewId: string) => {
    if (!user?.uid) return;
    try {
      await updateDoc(doc(db, 'reviews', reviewId), { reportCount: increment(1) });
      logger.info('Review reported', { reviewId, reportedBy: user.uid });
    } catch (err) {
      logger.error('Failed to report review', { error: err });
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && reviews.length === 0) {
    return <EmptyState>{t('Зареждане...', 'Loading...')}</EmptyState>;
  }

  if (!loading && reviews.length === 0) {
    return (
      <EmptyState>
        {t('Все още няма оценки', 'No reviews yet')}
      </EmptyState>
    );
  }

  return (
    <Container>
      {reviews.map(review => (
        <ReviewCard key={review.id}>
          <CardHeader>
            <ReviewerInfo>
              {review.reviewerAvatar ? (
                <ReviewerAvatar src={review.reviewerAvatar} alt={review.reviewerName} />
              ) : (
                <ReviewerInitial>
                  {review.reviewerName?.[0]?.toUpperCase() || '?'}
                </ReviewerInitial>
              )}
              <ReviewerDetails>
                <ReviewerName>{review.reviewerName}</ReviewerName>
                <ReviewDate>{formatDate(review.createdAt)}</ReviewDate>
              </ReviewerDetails>
            </ReviewerInfo>
            <StarsDisplay>
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  size={16}
                  fill={i <= review.rating ? '#f59e0b' : 'none'}
                  stroke={i <= review.rating ? '#f59e0b' : '#CBD5E1'}
                />
              ))}
            </StarsDisplay>
          </CardHeader>

          <ReviewTitle>{review.title}</ReviewTitle>
          <ReviewComment>{review.comment}</ReviewComment>

          {review.wouldRecommend !== undefined && (
            <RecommendBadge $recommend={review.wouldRecommend}>
              {review.wouldRecommend
                ? t('✓ Препоръчва', '✓ Recommends')
                : t('✗ Не препоръчва', '✗ Does not recommend')}
            </RecommendBadge>
          )}

          <CardFooter>
            <HelpfulButton
              onClick={() => handleHelpful(review.id)}
              $active={helpedIds.has(review.id)}
              disabled={helpedIds.has(review.id)}
              type="button"
            >
              <ThumbsUp size={14} />
              {t('Полезно', 'Helpful')} ({review.helpful || 0})
            </HelpfulButton>
            <ReportButton onClick={() => handleReport(review.id)} type="button">
              <Flag size={14} />
            </ReportButton>
          </CardFooter>
        </ReviewCard>
      ))}

      {hasMore && (
        <LoadMoreButton onClick={handleLoadMore} disabled={loading} type="button">
          <ChevronDown size={18} />
          {loading ? t('Зареждане...', 'Loading...') : t('Зареди още', 'Load more')}
        </LoadMoreButton>
      )}
    </Container>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ReviewCard = styled.div`
  padding: 20px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ReviewerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ReviewerAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const ReviewerInitial = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563EB, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
`;

const ReviewerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ReviewerName = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  color: #1E293B;
`;

const ReviewDate = styled.span`
  font-size: 0.75rem;
  color: #94A3B8;
`;

const StarsDisplay = styled.div`
  display: flex;
  gap: 2px;
`;

const ReviewTitle = styled.h4`
  margin: 0 0 8px;
  font-size: 1.05rem;
  font-weight: 600;
  color: #1E293B;
`;

const ReviewComment = styled.p`
  margin: 0 0 12px;
  color: #475569;
  line-height: 1.6;
  font-size: 0.925rem;
`;

const RecommendBadge = styled.div<{ $recommend: boolean }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 12px;
  background: ${p => p.$recommend ? '#ECFDF5' : '#FEF2F2'};
  color: ${p => p.$recommend ? '#059669' : '#DC2626'};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #F1F5F9;
`;

const HelpfulButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid ${p => p.$active ? '#2563EB' : '#E2E8F0'};
  border-radius: 8px;
  background: ${p => p.$active ? '#EFF6FF' : 'white'};
  color: ${p => p.$active ? '#2563EB' : '#64748B'};
  font-size: 0.825rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #2563EB;
    color: #2563EB;
  }

  &:disabled { cursor: default; }
`;

const ReportButton = styled.button`
  background: none;
  border: none;
  color: #CBD5E1;
  cursor: pointer;
  padding: 6px;
  display: flex;
  transition: color 0.2s;

  &:hover { color: #EF4444; }
`;

const LoadMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  color: #2563EB;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) { background: #EFF6FF; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const EmptyState = styled.div`
  padding: 48px 20px;
  text-align: center;
  color: #94A3B8;
  font-size: 0.95rem;
`;

export default ReviewsList;

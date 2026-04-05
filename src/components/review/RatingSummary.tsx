/**
 * RatingSummary
 * Displays overall rating with distribution bars and "Write Review" CTA
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Star, PenLine } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { db } from '../../firebase/firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { logger } from '../../services/logger-service';

interface RatingSummaryProps {
  targetUserId: string;
  averageRating?: number;
  totalReviews?: number;
  onWriteReview?: () => void;
  showWriteButton?: boolean;
}

interface Distribution {
  [key: number]: number;
}

export const RatingSummary: React.FC<RatingSummaryProps> = ({
  targetUserId,
  averageRating: propAverage,
  totalReviews: propTotal,
  onWriteReview,
  showWriteButton = true,
}) => {
  const { language } = useLanguage();
  const [distribution, setDistribution] = useState<Distribution>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [average, setAverage] = useState(propAverage || 0);
  const [total, setTotal] = useState(propTotal || 0);
  const [loading, setLoading] = useState(!propAverage);

  const t = (bg: string, en: string) => language === 'bg' ? bg : en;

  useEffect(() => {
    if (propAverage !== undefined && propTotal !== undefined) {
      setAverage(propAverage);
      setTotal(propTotal);
      return;
    }
    // Don't query if we have no valid user ID
    if (!targetUserId) {
      setLoading(false);
      return;
    }
    let isActive = true;
    const load = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('targetUserId', '==', targetUserId),
          where('status', '==', 'approved')
        );
        const snap = await getDocs(q);
        if (!isActive) return;

        const dist: Distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let sum = 0;
        snap.docs.forEach(d => {
          const rating = d.data().rating as number;
          if (rating >= 1 && rating <= 5) {
            dist[rating] = (dist[rating] || 0) + 1;
            sum += rating;
          }
        });
        setDistribution(dist);
        setTotal(snap.size);
        setAverage(snap.size > 0 ? sum / snap.size : 0);
      } catch (err) {
        logger.error('Failed to load rating summary', { error: err });
      } finally {
        if (isActive) setLoading(false);
      }
    };
    load();
    return () => { isActive = false; };
  }, [targetUserId, propAverage, propTotal]);

  if (loading) return null;

  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <Container>
      <TopRow>
        <ScoreSection>
          <BigScore>{average > 0 ? average.toFixed(1) : '—'}</BigScore>
          <StarsRow>
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                size={20}
                fill={i <= Math.round(average) ? '#f59e0b' : 'none'}
                stroke={i <= Math.round(average) ? '#f59e0b' : '#CBD5E1'}
              />
            ))}
          </StarsRow>
          <TotalLabel>
            {total} {t('оценки', 'reviews')}
          </TotalLabel>
        </ScoreSection>

        <BarsSection>
          {[5, 4, 3, 2, 1].map(star => {
            const count = distribution[star] || 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <BarRow key={star}>
                <BarLabel>{star}</BarLabel>
                <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                <BarTrack>
                  <BarFill style={{ width: `${(count / maxCount) * 100}%` }} />
                </BarTrack>
                <BarCount>{count}</BarCount>
              </BarRow>
            );
          })}
        </BarsSection>
      </TopRow>

      {showWriteButton && onWriteReview && (
        <WriteButton onClick={onWriteReview} type="button">
          <PenLine size={16} />
          {t('Напиши оценка', 'Write a Review')}
        </WriteButton>
      )}
    </Container>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  padding: 24px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
`;

const TopRow = styled.div`
  display: flex;
  gap: 32px;
  align-items: center;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const ScoreSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 100px;
`;

const BigScore = styled.div`
  font-size: 3rem;
  font-weight: 800;
  color: #1E293B;
  line-height: 1;
`;

const StarsRow = styled.div`
  display: flex;
  gap: 2px;
`;

const TotalLabel = styled.span`
  font-size: 0.825rem;
  color: #94A3B8;
  margin-top: 2px;
`;

const BarsSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BarLabel = styled.span`
  width: 12px;
  text-align: right;
  font-size: 0.825rem;
  font-weight: 600;
  color: #64748B;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 8px;
  background: #F1F5F9;
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  border-radius: 4px;
  transition: width 0.4s ease;
`;

const BarCount = styled.span`
  width: 28px;
  font-size: 0.75rem;
  color: #94A3B8;
`;

const WriteButton = styled.button`
  width: 100%;
  margin-top: 20px;
  padding: 12px;
  background: linear-gradient(135deg, #2563EB, #1d4ed8);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  font-size: 0.925rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
`;

export default RatingSummary;

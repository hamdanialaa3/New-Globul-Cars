/**
 * ReviewComposerModal
 * Modal dialog for writing a review about a user
 * Wrapped in ProfileCompletionGate to enforce profile requirements
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { X, Send, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { StarRatingInput } from './StarRatingInput';
import { ProfileCompletionGate } from './ProfileCompletionGate';
import { logger } from '../../services/logger-service';

interface ReviewComposerModalProps {
  targetUserId: string;
  targetUserName: string;
  onClose: () => void;
  onSubmit: (data: ReviewFormData) => Promise<void>;
}

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  wouldRecommend: boolean;
  aspectRatings: {
    communication: number;
    reliability: number;
    fairness: number;
  };
}

const MAX_TITLE = 100;
const MAX_COMMENT = 1000;
const MIN_COMMENT = 20;

export const ReviewComposerModal: React.FC<ReviewComposerModalProps> = ({
  targetUserName,
  onClose,
  onSubmit,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [aspectRatings, setAspectRatings] = useState({
    communication: 0,
    reliability: 0,
    fairness: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const t = useCallback((bg: string, en: string) => language === 'bg' ? bg : en, [language]);

  const canSubmit = rating > 0
    && comment.trim().length >= MIN_COMMENT
    && title.trim().length > 0
    && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        rating,
        title: title.trim(),
        comment: comment.trim(),
        wouldRecommend,
        aspectRatings,
      });
      onClose();
    } catch (err: any) {
      const msg = err?.message || t('Грешка при изпращане', 'Failed to submit review');
      setError(msg);
      logger.error('Review submit failed', { error: err });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAspect = (key: keyof typeof aspectRatings, val: number) => {
    setAspectRatings(prev => ({ ...prev, [key]: val }));
  };

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <HeaderTitle>
            {t('Оценка за', 'Review for')} {targetUserName}
          </HeaderTitle>
          <CloseButton onClick={onClose} type="button" aria-label="Close">
            <X size={20} />
          </CloseButton>
        </Header>

        <ProfileCompletionGate user={user}>
          <Body>
            {/* Overall Rating */}
            <Section>
              <SectionLabel>{t('Обща оценка', 'Overall Rating')} *</SectionLabel>
              <StarRatingInput
                value={rating}
                onChange={setRating}
                size={36}
                language={language}
              />
            </Section>

            {/* Aspect Ratings */}
            <Section>
              <SectionLabel>{t('Детайлни оценки', 'Detailed Ratings')}</SectionLabel>
              <AspectGrid>
                <AspectRow>
                  <AspectLabel>{t('Комуникация', 'Communication')}</AspectLabel>
                  <StarRatingInput value={aspectRatings.communication} onChange={v => handleAspect('communication', v)} size={20} showLabel={false} language={language} />
                </AspectRow>
                <AspectRow>
                  <AspectLabel>{t('Надеждност', 'Reliability')}</AspectLabel>
                  <StarRatingInput value={aspectRatings.reliability} onChange={v => handleAspect('reliability', v)} size={20} showLabel={false} language={language} />
                </AspectRow>
                <AspectRow>
                  <AspectLabel>{t('Коректност', 'Fairness')}</AspectLabel>
                  <StarRatingInput value={aspectRatings.fairness} onChange={v => handleAspect('fairness', v)} size={20} showLabel={false} language={language} />
                </AspectRow>
              </AspectGrid>
            </Section>

            {/* Title */}
            <Section>
              <SectionLabel>{t('Заглавие', 'Title')} *</SectionLabel>
              <TitleInput
                value={title}
                onChange={e => setTitle(e.target.value.slice(0, MAX_TITLE))}
                placeholder={t('Кратко заглавие', 'Brief title for your review')}
                maxLength={MAX_TITLE}
              />
              <CharCount>{title.length}/{MAX_TITLE}</CharCount>
            </Section>

            {/* Comment */}
            <Section>
              <SectionLabel>{t('Коментар', 'Comment')} *</SectionLabel>
              <CommentArea
                value={comment}
                onChange={e => setComment(e.target.value.slice(0, MAX_COMMENT))}
                placeholder={t(
                  `Опишете вашия опит (мин. ${MIN_COMMENT} символа)`,
                  `Describe your experience (min. ${MIN_COMMENT} characters)`
                )}
                rows={5}
                maxLength={MAX_COMMENT}
              />
              <CharRow>
                <CharCount $warn={comment.length > 0 && comment.length < MIN_COMMENT}>
                  {comment.length}/{MAX_COMMENT}
                </CharCount>
                {comment.length > 0 && comment.length < MIN_COMMENT && (
                  <MinWarning>
                    {t(`Минимум ${MIN_COMMENT} символа`, `Minimum ${MIN_COMMENT} characters`)}
                  </MinWarning>
                )}
              </CharRow>
            </Section>

            {/* Would Recommend */}
            <RecommendRow>
              <RecommendLabel>
                {t('Бихте ли го препоръчали?', 'Would you recommend?')}
              </RecommendLabel>
              <ToggleGroup>
                <ToggleBtn $active={wouldRecommend} onClick={() => setWouldRecommend(true)} type="button">
                  {t('Да', 'Yes')}
                </ToggleBtn>
                <ToggleBtn $active={!wouldRecommend} onClick={() => setWouldRecommend(false)} type="button">
                  {t('Не', 'No')}
                </ToggleBtn>
              </ToggleGroup>
            </RecommendRow>

            {error && (
              <ErrorBanner>
                <AlertTriangle size={16} />
                {error}
              </ErrorBanner>
            )}
          </Body>

          <Footer>
            <CancelButton onClick={onClose} type="button">
              {t('Отказ', 'Cancel')}
            </CancelButton>
            <SubmitButton onClick={handleSubmit} disabled={!canSubmit} type="button">
              <Send size={16} />
              {submitting
                ? t('Изпращане...', 'Submitting...')
                : t('Изпрати оценка', 'Submit Review')}
            </SubmitButton>
          </Footer>
        </ProfileCompletionGate>
      </Modal>
    </Overlay>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #E2E8F0;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1E293B;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  border-radius: 8px;

  &:hover { background: #F1F5F9; color: #64748B; }
`;

const Body = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
`;

const AspectGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: #F8FAFC;
  border-radius: 10px;
`;

const AspectRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AspectLabel = styled.span`
  font-size: 0.85rem;
  color: #64748B;
`;

const TitleInput = styled.input`
  padding: 12px 16px;
  border: 2px solid #E2E8F0;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  color: #1E293B;

  &:focus { border-color: #2563EB; }
  &::placeholder { color: #94A3B8; }
`;

const CommentArea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid #E2E8F0;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: border-color 0.2s;
  color: #1E293B;

  &:focus { border-color: #2563EB; }
  &::placeholder { color: #94A3B8; }
`;

const CharRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CharCount = styled.span<{ $warn?: boolean }>`
  font-size: 0.75rem;
  color: ${p => p.$warn ? '#f59e0b' : '#94A3B8'};
`;

const MinWarning = styled.span`
  font-size: 0.75rem;
  color: #f59e0b;
`;

const RecommendRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #F8FAFC;
  border-radius: 10px;
`;

const RecommendLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: 4px;
  background: #E2E8F0;
  border-radius: 8px;
  padding: 2px;
`;

const ToggleBtn = styled.button<{ $active: boolean }>`
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${p => p.$active ? 'white' : 'transparent'};
  color: ${p => p.$active ? '#2563EB' : '#64748B'};
  box-shadow: ${p => p.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 10px;
  color: #DC2626;
  font-size: 0.875rem;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #E2E8F0;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: #F1F5F9;
  border: none;
  border-radius: 10px;
  color: #64748B;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover { background: #E2E8F0; }
`;

const SubmitButton = styled.button`
  padding: 10px 24px;
  background: linear-gradient(135deg, #2563EB, #1d4ed8);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default ReviewComposerModal;

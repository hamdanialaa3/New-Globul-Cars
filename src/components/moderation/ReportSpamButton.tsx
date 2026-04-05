/**
 * 🔴 CRITICAL: Report Spam Button Component
 * مكون زر الإبلاغ عن الإساءة
 * 
 * @constitution
 * - Follows PROJECT_CONSTITUTION.md rules
 * - Uses PascalCase for component name (CONSTITUTION Section 2.2)
 * 
 * @author CTO & Lead Architect
 * @date January 2026
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Flag, AlertCircle, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { reportSpamService, ReportType } from '@/services/moderation/report-spam.service';
import { logger } from '@/services/logger-service';
import { useToast } from '@/components/Toast';

interface ReportSpamButtonProps {
  targetUserFirebaseId: string;
  targetUserName?: string;
  contentType: 'message' | 'listing' | 'profile' | 'review' | 'image' | 'other';
  contentId?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button = styled.button<{ $variant: string; $size: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: ${props => props.$size === 'small' ? '6px 12px' : props.$size === 'large' ? '12px 24px' : '8px 16px'};
  font-size: ${props => props.$size === 'small' ? '0.875rem' : props.$size === 'large' ? '1rem' : '0.9375rem'};
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => {
    if (props.$variant === 'danger') {
      return `
        background: #EF4444;
        color: white;
        &:hover { background: #DC2626; }
      `;
    }
    return `
      background: transparent;
      color: #6B7280;
      border: 1px solid #E5E7EB;
      &:hover { background: #F9FAFB; }
    `;
  }}
  
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ReportSpamButton: React.FC<ReportSpamButtonProps> = ({
  targetUserFirebaseId,
  targetUserName = 'User',
  contentType,
  contentId,
  size = 'medium',
  variant = 'secondary',
}) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const toast = useToast();
  const isBg = language === 'bg';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('spam_message');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReported, setIsReported] = useState(false);

  const handleReport = async () => {
    if (!currentUser?.uid || !reason.trim() || !description.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await reportSpamService.createReport(
        currentUser.uid,
        targetUserFirebaseId,
        reportType,
        contentType,
        reason.trim(),
        description.trim(),
        contentId
      );

      if (result.success) {
        setIsReported(true);
        setIsModalOpen(false);
        toast.success(
          isBg
            ? '✅ Благодарим за доклада. Ще го прегледаме възможно най-скоро.'
            : '✅ Thank you for your report. We will review it as soon as possible.'
        );
      } else {
        toast.error(
          isBg
            ? `❌ Грешка: ${result.error || 'Unknown error'}`
            : `❌ Error: ${result.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      logger.error('Failed to submit report', error as Error, {
        targetUserFirebaseId,
        contentType,
      });
      toast.error(
        isBg
          ? '❌ Грешка при изпращане на доклада'
          : '❌ Error submitting report'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser?.uid || currentUser.uid === targetUserFirebaseId || isReported) {
    return null;
  }

  const reportTypes: { value: ReportType; label: { bg: string; en: string } }[] = [
    { value: 'spam_message', label: { bg: 'Спам съобщение', en: 'Spam Message' } },
    { value: 'inappropriate_listing', label: { bg: 'Неподходящ обява', en: 'Inappropriate Listing' } },
    { value: 'fake_profile', label: { bg: 'Фалшив профил', en: 'Fake Profile' } },
    { value: 'scam', label: { bg: 'Измама', en: 'Scam' } },
    { value: 'harassment', label: { bg: 'Помеха', en: 'Harassment' } },
    { value: 'fake_review', label: { bg: 'Фалшив отзив', en: 'Fake Review' } },
    { value: 'inappropriate_image', label: { bg: 'Неподходящо изображение', en: 'Inappropriate Image' } },
    { value: 'other', label: { bg: 'Друго', en: 'Other' } },
  ];

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        $variant={variant}
        $size={size}
        aria-label={isBg ? 'Докладвай' : 'Report'}
      >
        <Flag size={16} />
        {isBg ? 'Докладвай' : 'Report'}
      </Button>

      <Modal $isOpen={isModalOpen} onClick={() => setIsModalOpen(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 600 }}>
            {isBg ? 'Докладвай за' : 'Report'} {targetUserName}
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              {isBg ? 'Тип доклад' : 'Report Type'}:
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E5E7EB' }}
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {isBg ? type.label.bg : type.label.en}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              {isBg ? 'Причина' : 'Reason'}:
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isBg ? 'Кратко описание' : 'Brief description'}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E5E7EB' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              {isBg ? 'Описание' : 'Description'}:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isBg ? 'Повече детайли...' : 'More details...'}
              rows={4}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E5E7EB', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => setIsModalOpen(false)}
              $variant="secondary"
              $size="medium"
            >
              {isBg ? 'Отказ' : 'Cancel'}
            </Button>
            <Button
              onClick={handleReport}
              disabled={!reason.trim() || !description.trim() || isSubmitting}
              $variant="danger"
              $size="medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  {isBg ? 'Изпращане...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Flag size={16} />
                  {isBg ? 'Изпрати доклад' : 'Submit Report'}
                </>
              )}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ReportSpamButton;

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../../services/logger-service';
import { toast } from 'react-toastify';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
  padding: 16px;
`;

const ModalContainer = styled.div`
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: ${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const ReasonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ReasonButton = styled.button<{ $selected: boolean }>`
  padding: 12px;
  border: 1px solid ${props => props.$selected ? '#3b82f6' : '#e2e8f0'};
  background: ${props => props.$selected ? '#eff6ff' : 'white'};
  color: ${props => props.$selected ? '#1d4ed8' : '#334155'};
  border-radius: 8px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 20px;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Footer = styled.div`
  padding: 20px;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #f1f5f9;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  
  ${props => props.$variant === 'primary' ? `
    background: #3b82f6;
    color: white;
    &:hover { background: #2563eb; }
    &:disabled { opacity: 0.7; cursor: not-allowed; }
  ` : `
    background: white;
    color: #475569;
    border: 1px solid #e2e8f0;
    &:hover { background: #f1f5f9; color: #0f172a; }
  `}
`;

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetId: string;
    targetType: 'post' | 'comment' | 'user' | 'car';
}

const REASONS = [
    { id: 'spam', labelEn: 'Spam', labelBg: 'Спам' },
    { id: 'harassment', labelEn: 'Harassment', labelBg: 'Тормоз' },
    { id: 'hate_speech', labelEn: 'Hate Speech', labelBg: 'Реч на омразата' },
    { id: 'false_info', labelEn: 'False Information', labelBg: 'Невярна информация' },
    { id: 'scam', labelEn: 'Scam / Fraud', labelBg: 'Изгуба / Измама' },
    { id: 'inappropriate', labelEn: 'Inappropriate Content', labelBg: 'Неподходящо съдържание' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
    isOpen,
    onClose,
    targetId,
    targetType
}) => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!selectedReason) {
            toast.error(language === 'bg' ? 'Моля изберете причина' : 'Please select a reason');
            return;
        }

        if (!user) {
            toast.error(language === 'bg' ? 'Моля влезте в профила си' : 'Please log in');
            return;
        }

        setIsSubmitting(true);

        try {
            await addDoc(collection(db, 'reports'), {
                targetId,
                targetType,
                reason: selectedReason,
                description,
                status: 'pending',
                reportedBy: user.uid,
                reportedAt: serverTimestamp(),
                createdAt: serverTimestamp()
            });

            toast.success(
                language === 'bg'
                    ? 'Докладът е изпратен успешно'
                    : 'Report submitted successfully'
            );
            onClose();
        } catch (error) {
            logger.error('Failed to submit report', error as Error);
            toast.error(
                language === 'bg'
                    ? 'Грешка при изпращане на доклада'
                    : 'Error submitting report'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={e => e.stopPropagation()}>
                <Header>
                    <h3>
                        <AlertTriangle size={24} color="#f59e0b" />
                        {language === 'bg' ? 'Докладвай' : 'Report Content'}
                    </h3>
                    <CloseButton onClick={onClose}>
                        <X size={20} />
                    </CloseButton>
                </Header>

                <Content>
                    <div style={{ marginBottom: 12, fontWeight: 500, color: '#475569' }}>
                        {language === 'bg' ? 'Защо докладвате това?' : 'Why are you reporting this?'}
                    </div>

                    <ReasonGrid>
                        {REASONS.map(reason => (
                            <ReasonButton
                                key={reason.id}
                                $selected={selectedReason === reason.id}
                                onClick={() => setSelectedReason(reason.id)}
                            >
                                {language === 'bg' ? reason.labelBg : reason.labelEn}
                            </ReasonButton>
                        ))}
                    </ReasonGrid>

                    <TextArea
                        placeholder={language === 'bg'
                            ? 'Допълнителна информация (по избор)...'
                            : 'Additional details (optional)...'}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </Content>

                <Footer>
                    <Button $variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        {language === 'bg' ? 'Отказ' : 'Cancel'}
                    </Button>
                    <Button $variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting
                            ? (language === 'bg' ? 'Изпращане...' : 'Sending...')
                            : (language === 'bg' ? 'Изпрати Доклад' : 'Submit Report')}
                    </Button>
                </Footer>
            </ModalContainer>
        </Overlay>
    );
};

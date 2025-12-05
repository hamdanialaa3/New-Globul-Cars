// src/components/Verification/BusinessVerificationModal.tsx
// Business Verification Modal - نافذة التحقق من البيزنس
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Building2, FileText, Upload, CheckCircle, AlertCircle, Loader, Info } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { useTheme } from '@globul-cars/core/contexts/ThemeContext';
import { useAuth } from '@globul-cars/core/contextsAuthProvider';
import DocumentUpload from './DocumentUpload';

// ==================== STYLED COMPONENTS ====================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  overflow-y: auto;
  padding: 20px;
`;

const ModalContainer = styled.div<{ $isDark?: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#071025' : 'white')};
  border-radius: 16px;
  padding: 32px;
  max-width: 650px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div<{ $isDark?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
    color: ${({ $isDark }) => ($isDark ? '#e6eef9' : '#333')};
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const CloseButton = styled.button<{ $isDark?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: ${({ $isDark }) => ($isDark ? '#0b1220' : '#f0f0f0')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: ${({ $isDark }) => ($isDark ? '#121827' : '#e0e0e0')};
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  width: ${props => props.$active ? '40px' : '12px'};
  height: 12px;
  border-radius: 6px;
  background: ${props => props.$completed ? '#0d7a3f' : props.$active ? '#FF7900' : '#e0e0e0'};
  transition: all 0.3s ease;
`;

const ContentSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h4`
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoBox = styled.div<{ $type?: 'info' | 'warning' | 'success'; $isDark?: boolean }>`
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  
  ${props => {
    switch (props.$type) {
      case 'warning':
        return `
          background: ${props.$isDark ? '#2a2a1e' : '#fff3cd'};
          border-left: 4px solid #ffc107;
          color: ${props.$isDark ? '#f2c66b' : '#856404'};
        `;
      case 'success':
        return `
          background: ${props.$isDark ? '#0d2b1c' : '#d1f4e0'};
          border-left: 4px solid #0d7a3f;
          color: ${props.$isDark ? '#9be6bb' : '#0d7a3f'};
        `;
      default:
        return `
          background: ${props.$isDark ? '#07162a' : '#e3f2fd'};
          border-left: 4px solid #1976d2;
          color: ${props.$isDark ? '#8ebcf7' : '#1565c0'};
        `;
    }
  }}
  
  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const DocumentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DocumentItem = styled.div<{ $isDark?: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#071025' : '#f8f9fa')};
  border: 2px dashed ${({ $isDark }) => ($isDark ? '#1f2937' : '#dee2e6')};
  border-radius: 8px;
  padding: 16px;
`;

const DocumentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const DocumentTitle = styled.div<{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  
  h5 {
    margin: 0;
    font-size: 0.95rem;
    color: ${({ $isDark }) => ($isDark ? '#e6eef9' : '#333')};
  }
`;

const RequiredBadge = styled.span<{ $optional?: boolean }>`
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  background: ${props => props.$optional ? '#e0e0e0' : '#ff7900'};
  color: ${props => props.$optional ? '#666' : 'white'};
  font-weight: 600;
`;

const DocumentDescription = styled.p<{ $isDark?: boolean }>`
  font-size: 0.85rem;
  color: ${({ $isDark }) => ($isDark ? '#9aa6b2' : '#666')};
  margin: 8px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const SubmitButton = styled.button<{ $disabled?: boolean; $isDark?: boolean }>`
  flex: 1;
  padding: 12px 24px;
  background: ${props => props.$disabled ? (props.$isDark ? '#2a2a2a' : '#ccc') : (props.$isDark ? 'linear-gradient(135deg, #1f6fe8, #0f4fbf)' : 'linear-gradient(135deg, #FF7900 0%, #FF9500 100%)')};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props => props.$isDark ? '0 4px 12px rgba(31, 111, 232, 0.3)' : '0 4px 12px rgba(255, 121, 0, 0.3)'};
  }
`;

const CancelButton = styled.button<{ $isDark?: boolean }>`
  flex: 1;
  padding: 12px 24px;
  background: ${({ $isDark }) => ($isDark ? '#071025' : 'white')};
  color: ${({ $isDark }) => ($isDark ? '#cbd5e1' : '#666')};
  border: 2px solid ${({ $isDark }) => ($isDark ? '#1f2937' : '#dee2e6')};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ $isDark }) => ($isDark ? '#0b1220' : '#f8f9fa')};
  }
`;

const LoadingSpinner = styled.div`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const SuccessOverlay = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const SuccessIcon = styled.div<{ $isDark?: boolean }>`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  border-radius: 50%;
  background: ${({ $isDark }) => ($isDark ? '#08342b' : '#d1f4e0')};
  color: ${({ $isDark }) => ($isDark ? '#9be6bb' : '#0d7a3f')};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SuccessTitle = styled.h3<{ $isDark?: boolean }>`
  font-size: 1.5rem;
  color: ${({ $isDark }) => ($isDark ? '#e6eef9' : '#333')};
  margin: 0 0 12px 0;
`;

const SuccessMessage = styled.p<{ $isDark?: boolean }>`
  font-size: 1rem;
  color: ${({ $isDark }) => ($isDark ? '#9aa6b2' : '#666')};
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const FilePreview = styled.div<{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${({ $isDark }) => ($isDark ? '#071025' : 'white')};
  border: 1px solid ${({ $isDark }) => ($isDark ? '#1f2937' : '#dee2e6')};
  border-radius: 6px;
  margin-top: 8px;
  
  svg {
    color: ${({ $isDark }) => ($isDark ? '#6ee7b7' : '#0d7a3f')};
  }
  
  span {
    flex: 1;
    font-size: 0.85rem;
    color: ${({ $isDark }) => ($isDark ? '#e6eef9' : '#333')};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  button {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: ${({ $isDark }) => ($isDark ? '#9aa6b2' : '#666')};
    
    &:hover {
      color: #d32f2f;
    }
  }
`;

// ==================== COMPONENT ====================

interface BusinessVerificationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const BusinessVerificationModal: React.FC<BusinessVerificationModalProps> = ({
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<{
    businessLicense?: File;
    vatCertificate?: File;
    tradeRegister?: File;
  }>({});

  const handleFileSelect = (type: 'businessLicense' | 'vatCertificate' | 'tradeRegister', file: File | null) => {
    if (file) {
      setDocuments(prev => ({ ...prev, [type]: file }));
    } else {
      setDocuments(prev => {
        const updated = { ...prev };
        delete updated[type];
        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    if (!currentUser || !documents.businessLicense) return;

    setIsSubmitting(true);

    try {
      // Simulate upload and verification request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Integrate with Firebase Storage and Firestore
      // 1. Upload documents to Firebase Storage
      // 2. Update user verification status in Firestore
      // 3. Send notification to admin for review

      setStep(2);
    } catch (error) {
      console.error('Error submitting business verification:', error);
      alert(
        language === 'bg'
          ? 'Грешка при изпращане на документите'
          : 'Error submitting documents'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = documents.businessLicense !== undefined;

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer $isDark={isDark} onClick={(e) => e.stopPropagation()}>
        <ModalHeader $isDark={isDark}>
          <h3>
            <Building2 color="#FF7900" />
            {language === 'bg' ? 'Потвърждение на бизнес' : 'Business Verification'}
          </h3>
          <CloseButton $isDark={isDark} onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <StepIndicator>
          <Step $active={step === 1} $completed={step > 1} />
          <Step $active={step === 2} $completed={step > 2} />
        </StepIndicator>

        {step === 1 && (
          <>
            <ContentSection>
              <InfoBox $type="info">
                <Info size={20} />
                <p>
                  {language === 'bg'
                    ? 'За да потвърдите бизнес акаунта си, моля качете следните документи. Проверката отнема 1-3 работни дни.'
                    : 'To verify your business account, please upload the following documents. Verification takes 1-3 business days.'}
                </p>
              </InfoBox>

              <SectionTitle>
                <FileText size={20} />
                {language === 'bg' ? 'Необходими документи' : 'Required Documents'}
              </SectionTitle>

              <DocumentsList>
                {/* Business License */}
                <DocumentItem $isDark={isDark}>
                  <DocumentHeader>
                    <DocumentTitle $isDark={isDark}>
                      <FileText size={18} color="#FF7900" />
                      <h5>
                        {language === 'bg' ? 'Удостоверение за регистрация' : 'Business Registration Certificate'}
                      </h5>
                    </DocumentTitle>
                    <RequiredBadge>
                      {language === 'bg' ? 'Задължително' : 'Required'}
                    </RequiredBadge>
                  </DocumentHeader>
                  <DocumentDescription>
                    {language === 'bg'
                      ? 'Официално удостоверение за регистрация на фирмата от Агенция по вписванията (BULSTAT)'
                      : 'Official company registration certificate from the Registry Agency (BULSTAT)'}
                  </DocumentDescription>
                  <DocumentUpload
                    label={language === 'bg' ? 'Качи документ' : 'Upload Document'}
                    icon={<Upload size={18} />}
                    onFileSelect={(file) => handleFileSelect('businessLicense', file)}
                    accept="image/*,.pdf"
                    optional={false}
                  />
                  {documents.businessLicense && (
                    <FilePreview $isDark={isDark}>
                      <CheckCircle size={16} />
                      <span>{documents.businessLicense.name}</span>
                      <button onClick={() => handleFileSelect('businessLicense', null)}>
                        <X size={16} />
                      </button>
                    </FilePreview>
                  )}
                </DocumentItem>

                {/* VAT Certificate */}
                <DocumentItem $isDark={isDark}>
                  <DocumentHeader>
                    <DocumentTitle $isDark={isDark}>
                      <FileText size={18} color="#FF7900" />
                      <h5>
                        {language === 'bg' ? 'Удостоверение за ДДС' : 'VAT Certificate'}
                      </h5>
                    </DocumentTitle>
                    <RequiredBadge $optional>
                      {language === 'bg' ? 'Незадължително' : 'Optional'}
                    </RequiredBadge>
                  </DocumentHeader>
                  <DocumentDescription>
                    {language === 'bg'
                      ? 'Удостоверение за регистрация по ДДС (ако е приложимо)'
                      : 'VAT registration certificate (if applicable)'}
                  </DocumentDescription>
                  <DocumentUpload
                    label={language === 'bg' ? 'Качи документ' : 'Upload Document'}
                    icon={<Upload size={18} />}
                    onFileSelect={(file) => handleFileSelect('vatCertificate', file)}
                    accept="image/*,.pdf"
                    optional={true}
                  />
                  {documents.vatCertificate && (
                    <FilePreview $isDark={isDark}>
                      <CheckCircle size={16} />
                      <span>{documents.vatCertificate.name}</span>
                      <button onClick={() => handleFileSelect('vatCertificate', null)}>
                        <X size={16} />
                      </button>
                    </FilePreview>
                  )}
                </DocumentItem>

                {/* Trade Register */}
                <DocumentItem $isDark={isDark}>
                  <DocumentHeader>
                    <DocumentTitle $isDark={isDark}>
                      <FileText size={18} color="#FF7900" />
                      <h5>
                        {language === 'bg' ? 'Извлечение от Търговския регистър' : 'Trade Register Extract'}
                      </h5>
                    </DocumentTitle>
                    <RequiredBadge $optional>
                      {language === 'bg' ? 'Незадължително' : 'Optional'}
                    </RequiredBadge>
                  </DocumentHeader>
                  <DocumentDescription>
                    {language === 'bg'
                      ? 'Актуално извлечение от Търговския регистър (не по-старо от 6 месеца)'
                      : 'Current trade register extract (not older than 6 months)'}
                  </DocumentDescription>
                  <DocumentUpload
                    label={language === 'bg' ? 'Качи документ' : 'Upload Document'}
                    icon={<Upload size={18} />}
                    onFileSelect={(file) => handleFileSelect('tradeRegister', file)}
                    accept="image/*,.pdf"
                    optional={true}
                  />
                  {documents.tradeRegister && (
                    <FilePreview $isDark={isDark}>
                      <CheckCircle size={16} />
                      <span>{documents.tradeRegister.name}</span>
                      <button onClick={() => handleFileSelect('tradeRegister', null)}>
                        <X size={16} />
                      </button>
                    </FilePreview>
                  )}
                </DocumentItem>
              </DocumentsList>
            </ContentSection>

            <ButtonGroup>
              <CancelButton $isDark={isDark} onClick={onClose}>
                {language === 'bg' ? 'Отказ' : 'Cancel'}
              </CancelButton>
              <SubmitButton $isDark={isDark}
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                $disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner>
                      <Loader size={18} />
                    </LoadingSpinner>
                    {language === 'bg' ? 'Изпращане...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    {language === 'bg' ? 'Изпрати документи' : 'Submit Documents'}
                  </>
                )}
              </SubmitButton>
            </ButtonGroup>
          </>
        )}

        {step === 2 && (
            <SuccessOverlay>
            <SuccessIcon $isDark={isDark}>
              <CheckCircle size={40} />
            </SuccessIcon>
            <SuccessTitle $isDark={isDark}>
              {language === 'bg' ? 'Документите са изпратени!' : 'Documents Submitted!'}
            </SuccessTitle>
            <SuccessMessage $isDark={isDark}>
              {language === 'bg'
                ? 'Вашите документи са изпратени успешно. Екипът ни ще ги прегледа в рамките на 1-3 работни дни. Ще получите имейл с резултата от проверката.'
                : 'Your documents have been submitted successfully. Our team will review them within 1-3 business days. You will receive an email with the verification result.'}
            </SuccessMessage>
            <SubmitButton $isDark={isDark} onClick={onSuccess}>
              {language === 'bg' ? 'Затвори' : 'Close'}
            </SubmitButton>
          </SuccessOverlay>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

export default BusinessVerificationModal;


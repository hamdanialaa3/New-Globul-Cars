// src/components/Verification/BusinessVerificationModal.tsx
// Business Verification Modal - نافذة التحقق من البيزنس
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Building2, FileText, Upload, CheckCircle, AlertCircle, Loader, Info } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
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

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 650px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: #e0e0e0;
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

const InfoBox = styled.div<{ $type?: 'info' | 'warning' | 'success' }>`
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
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          color: #856404;
        `;
      case 'success':
        return `
          background: #d1f4e0;
          border-left: 4px solid #0d7a3f;
          color: #0d7a3f;
        `;
      default:
        return `
          background: #e3f2fd;
          border-left: 4px solid #1976d2;
          color: #1565c0;
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

const DocumentItem = styled.div`
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 16px;
`;

const DocumentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const DocumentTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  h5 {
    margin: 0;
    font-size: 0.95rem;
    color: #333;
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

const DocumentDescription = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 8px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const SubmitButton = styled.button<{ $disabled?: boolean }>`
  flex: 1;
  padding: 12px 24px;
  background: ${props => props.$disabled ? '#ccc' : 'linear-gradient(135deg, #FF7900 0%, #FF9500 100%)'};
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
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: white;
  color: #666;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f8f9fa;
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

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  border-radius: 50%;
  background: #d1f4e0;
  color: #0d7a3f;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SuccessTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 12px 0;
`;

const SuccessMessage = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  margin-top: 8px;
  
  svg {
    color: #0d7a3f;
  }
  
  span {
    flex: 1;
    font-size: 0.85rem;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  button {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #666;
    
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
      
      console.log('📄 Business documents submitted:', {
        userId: currentUser.uid,
        documents: Object.keys(documents)
      });

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

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>
            <Building2 color="#FF7900" />
            {language === 'bg' ? 'Потвърждение на бизнес' : 'Business Verification'}
          </h3>
          <CloseButton onClick={onClose}>
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
                <DocumentItem>
                  <DocumentHeader>
                    <DocumentTitle>
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
                    <FilePreview>
                      <CheckCircle size={16} />
                      <span>{documents.businessLicense.name}</span>
                      <button onClick={() => handleFileSelect('businessLicense', null)}>
                        <X size={16} />
                      </button>
                    </FilePreview>
                  )}
                </DocumentItem>

                {/* VAT Certificate */}
                <DocumentItem>
                  <DocumentHeader>
                    <DocumentTitle>
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
                    <FilePreview>
                      <CheckCircle size={16} />
                      <span>{documents.vatCertificate.name}</span>
                      <button onClick={() => handleFileSelect('vatCertificate', null)}>
                        <X size={16} />
                      </button>
                    </FilePreview>
                  )}
                </DocumentItem>

                {/* Trade Register */}
                <DocumentItem>
                  <DocumentHeader>
                    <DocumentTitle>
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
                    <FilePreview>
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
              <CancelButton onClick={onClose}>
                {language === 'bg' ? 'Отказ' : 'Cancel'}
              </CancelButton>
              <SubmitButton
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
            <SuccessIcon>
              <CheckCircle size={40} />
            </SuccessIcon>
            <SuccessTitle>
              {language === 'bg' ? 'Документите са изпратени!' : 'Documents Submitted!'}
            </SuccessTitle>
            <SuccessMessage>
              {language === 'bg'
                ? 'Вашите документи са изпратени успешно. Екипът ни ще ги прегледа в рамките на 1-3 работни дни. Ще получите имейл с резултата от проверката.'
                : 'Your documents have been submitted successfully. Our team will review them within 1-3 business days. You will receive an email with the verification result.'}
            </SuccessMessage>
            <SubmitButton onClick={onSuccess}>
              {language === 'bg' ? 'Затвори' : 'Close'}
            </SubmitButton>
          </SuccessOverlay>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

export default BusinessVerificationModal;


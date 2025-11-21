// src/features/verification/VerificationPage.tsx
// Verification Page - Document Upload and Status

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@globul-cars/core/contextsAuthProvider';  // FIXED: Correct path
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { useToast } from '@globul-cars/ui/componentsToast';
import { FileText, CheckCircle, XCircle, AlertCircle, ArrowRight, Loader } from 'lucide-react';  // FIXED: Added Loader
import DocumentUpload from './DocumentUpload';
import verificationService from './VerificationService';
import { VerificationDocument } from './types';

// Styled Components
const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6c757d;
  font-size: 1rem;
  line-height: 1.6;
`;

const StepsIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
`;

const Step = styled.div<{ active?: boolean; completed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  
  ${p => p.completed ? `
    background: #dcfce7;
    color: #16a34a;
  ` : p.active ? `
    background: #dbeafe;
    color: #1d4ed8;
  ` : `
    background: #f3f4f6;
    color: #9ca3af;
  `}
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1a1a1a;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: #3b82f6;
  }
`;

const RequirementsChecklist = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const RequirementItem = styled.div<{ met?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${p => p.met ? '#f0fdf4' : '#fef3c7'};
  border-radius: 8px;
  
  svg {
    width: 20px;
    height: 20px;
    color: ${p => p.met ? '#16a34a' : '#d97706'};
  }
`;

const DocumentsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 2rem 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  ${p => p.variant === 'primary' ? `
    background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(29, 78, 216, 0.4);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    border: 2px solid #d1d5db;
    color: #6c757d;
    
    &:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }
  `}
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const StatusMessage = styled.div<{ type: 'info' | 'success' | 'error' }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin: 2rem 0;
  
  ${p => {
    if (p.type === 'success') return `
      background: #dcfce7;
      color: #15803d;
    `;
    if (p.type === 'error') return `
      background: #fee2e2;
      color: #b91c1c;
    `;
    return `
      background: #dbeafe;
      color: #1e40af;
    `;
  }}
  
  svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }
`;

/**
 * Verification Page Component
 * Handles dealer/company verification workflow
 */
export const VerificationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();

  const [targetType, setTargetType] = useState<'dealer' | 'company'>('dealer');
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [requirements, setRequirements] = useState<any[]>([]);

  // Load requirements
  useEffect(() => {
    const reqs = verificationService.getRequirements(targetType);
    setRequirements(reqs);
  }, [targetType]);

  // Handle document upload complete
  const handleDocumentUpload = (doc: VerificationDocument) => {
    setDocuments(prev => {
      const existing = prev.findIndex(d => d.type === doc.type);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = doc;
        return updated;
      }
      return [...prev, doc];
    });
  };

  // Check if all required documents uploaded
  const allRequiredUploaded = requirements
    .filter(r => r.required)
    .every(r => documents.some(d => d.type === r.type));

  // Handle submit
  const handleSubmit = async () => {
    if (!currentUser) return;

    try {
      setSubmitting(true);

      await verificationService.submitVerification(
        currentUser.uid,
        targetType,
        documents
      );

      toast.success(
        language === 'bg' 
          ? 'Заявката е подадена успешно! Ще получите отговор в рамките на 24-48 часа.'
          : 'Application submitted successfully! You will receive a response within 24-48 hours.'
      );

      // Navigate back to profile
      setTimeout(() => navigate('/profile'), 2000);
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      toast.error(error.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          {language === 'bg' 
            ? (targetType === 'dealer' ? 'Регистрация като дилър' : 'Регистрация като фирма')
            : (targetType === 'dealer' ? 'Dealer Registration' : 'Company Registration')}
        </Title>
        <Subtitle>
          {language === 'bg' 
            ? 'Моля, качете необходимите документи за проверка'
            : 'Please upload the required documents for verification'}
        </Subtitle>
      </Header>

      {/* Steps Indicator */}
      <StepsIndicator>
        <Step completed>
          <CheckCircle />
          {language === 'bg' ? '1. Избор' : '1. Select Type'}
        </Step>
        <ArrowRight size={20} color="#d1d5db" />
        <Step active>
          <FileText />
          {language === 'bg' ? '2. Документи' : '2. Documents'}
        </Step>
        <ArrowRight size={20} color="#d1d5db" />
        <Step>
          <AlertCircle />
          {language === 'bg' ? '3. Преглед' : '3. Review'}
        </Step>
      </StepsIndicator>

      {/* Info Message */}
      <StatusMessage type="info">
        <AlertCircle />
        <div>
          <strong>
            {language === 'bg' ? 'Важно:' : 'Important:'}
          </strong>
          <br />
          {language === 'bg' 
            ? 'Вашата заявка ще бъде прегледана от нашия екип в рамките на 24-48 работни часа. Ще получите имейл уведомление след одобрение.'
            : 'Your application will be reviewed by our team within 24-48 business hours. You will receive an email notification upon approval.'}
        </div>
      </StatusMessage>

      {/* Requirements Checklist */}
      <Card>
        <SectionTitle>
          <CheckCircle />
          {language === 'bg' ? 'Изисквания' : 'Requirements'}
        </SectionTitle>
        
        <RequirementsChecklist>
          {requirements.map(req => {
            const uploaded = documents.some(d => d.type === req.type);
            return (
              <RequirementItem key={req.type} met={uploaded || !req.required}>
                {uploaded ? <CheckCircle /> : <AlertCircle />}
                <span>
                  {language === 'bg' ? req.label.bg : req.label.en}
                  {!req.required && ` (${language === 'bg' ? 'опционално' : 'optional'})`}
                </span>
              </RequirementItem>
            );
          })}
        </RequirementsChecklist>
      </Card>

      {/* Document Upload Section */}
      <Card>
        <SectionTitle>
          <FileText />
          {language === 'bg' ? 'Качване на документи' : 'Upload Documents'}
        </SectionTitle>
        
        <DocumentsSection>
          {requirements.map(req => (
            <DocumentUpload
              key={req.type}
              documentType={req.type}
              label={req.label}
              description={req.description}
              required={req.required}
              maxSize={req.maxSize}
              acceptedFormats={req.acceptedFormats}
              onUploadComplete={handleDocumentUpload}
              existingDocument={documents.find(d => d.type === req.type)}
            />
          ))}
        </DocumentsSection>
      </Card>

      {/* Submit Button */}
      <ButtonContainer>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/profile')}
        >
          {language === 'bg' ? 'Отказ' : 'Cancel'}
        </Button>
        
        <Button 
          variant="primary"
          onClick={handleSubmit}
          disabled={!allRequiredUploaded || submitting}
        >
          {submitting ? (
            <>
              <Loader className="spinner" />
              {language === 'bg' ? 'Изпращане...' : 'Submitting...'}
            </>
          ) : (
            <>
              {language === 'bg' ? 'Подай заявка' : 'Submit Application'}
              <ArrowRight />
            </>
          )}
        </Button>
      </ButtonContainer>
    </Container>
  );
};

export default VerificationPage;


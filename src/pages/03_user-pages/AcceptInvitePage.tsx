import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { CheckCircle, AlertCircle, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { teamManagementService } from '@/services/company/team-management-service';
import { logger } from '@/services/logger-service';

/**
 * AcceptInvitePage - Team Invitation Acceptance Flow
 * 
 * Purpose: Allow invited agents to join a company team using 8-char invite code
 * 
 * Features:
 * - Auto-fill code from URL (?code=XK7P2M9Q)
 * - Manual code entry with validation
 * - Real-time company details preview
 * - Success redirect to /company/team
 * 
 * Validation:
 * - Code must be 8 chars (alphanumeric, no I/O/0/1)
 * - User must be authenticated
 * - Code must exist and not be expired (7 days)
 * - Code must not be already accepted
 * 
 * @created Phase 3 - Team Management
 * @author AI Agent (Mobile.de Style)
 */

// Types
interface CompanyPreview {
  companyName: string;
  ownerName: string;
  role: 'admin' | 'agent' | 'viewer';
  teamSize: number;
}

const AcceptInvitePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  // State
  const [inviteCode, setInviteCode] = useState<string>('');
  const [companyPreview, setCompanyPreview] = useState<CompanyPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [step, setStep] = useState<'input' | 'preview' | 'success'>('input');

  // Auto-fill code from URL on mount
  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      const cleanCode = codeParam.trim().toUpperCase();
      if (cleanCode.length === 8) {
        setInviteCode(cleanCode);
        handleValidateCode(cleanCode);
      }
    }
  }, [searchParams]);

  // Handle code input change
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    setInviteCode(value);
    setErrorMessage('');
    
    // Auto-validate when 8 chars entered
    if (value.length === 8) {
      handleValidateCode(value);
    }
  };

  // Validate invite code and fetch company details
  const handleValidateCode = async (code: string) => {
    if (!currentUser) {
      setErrorMessage('يجب تسجيل الدخول أولاً | You must be logged in first');
      return;
    }

    setIsValidating(true);
    setErrorMessage('');
    
    try {
      // Call service to validate code (service will check expiration, existence, etc.)
      const invitation = await teamManagementService.getInvitationByCode(code);
      
      if (!invitation) {
        setErrorMessage('كود غير صحيح | Invalid invite code');
        setIsValidating(false);
        return;
      }

      // Check if expired (7 days)
      if (invitation.expiresAt.toMillis() < Date.now()) {
        setErrorMessage('انتهت صلاحية الكود | Invite code has expired');
        setIsValidating(false);
        return;
      }

      // Check if already accepted
      if (invitation.status === 'accepted') {
        setErrorMessage('تم قبول الدعوة مسبقاً | Invitation already accepted');
        setIsValidating(false);
        return;
      }

      // Fetch company preview
      setCompanyPreview({
        companyName: invitation.companyName || 'Company',
        ownerName: invitation.invitedBy || 'Team Admin',
        role: invitation.role,
        teamSize: invitation.teamSize || 0,
      });

      setStep('preview');
      
    } catch (error) {
      logger.error('Error validating invite code', error as Error, { code });
      setErrorMessage('حدث خطأ أثناء التحقق من الكود | Error validating code');
    } finally {
      setIsValidating(false);
    }
  };

  // Accept invitation
  const handleAcceptInvitation = async () => {
    if (!currentUser || !inviteCode) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      await teamManagementService.acceptInvitation(inviteCode, currentUser.uid);
      
      setSuccessMessage(`مرحباً بك في ${companyPreview?.companyName || 'الفريق'}! | Welcome to ${companyPreview?.companyName || 'the team'}!`);
      setStep('success');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/company/team');
      }, 2000);

    } catch (error: any) {
      logger.error('Error accepting invitation', error as Error, { code: inviteCode });
      setErrorMessage(error.message || 'فشل قبول الدعوة | Failed to accept invitation');
      setIsLoading(false);
    }
  };

  // Render different steps
  const renderStep = () => {
    switch (step) {
      case 'input':
        return (
          <>
            <Title>انضم إلى فريق | Join a Team</Title>
            <Subtitle>أدخل كود الدعوة المكون من 8 أحرف | Enter the 8-character invite code</Subtitle>
            
            <CodeInputWrapper>
              <CodeInput
                type="text"
                value={inviteCode}
                onChange={handleCodeChange}
                placeholder="XK7P2M9Q"
                maxLength={8}
                disabled={isValidating}
                $hasError={!!errorMessage}
              />
              {isValidating && <LoadingSpinner />}
            </CodeInputWrapper>

            {errorMessage && (
              <ErrorBox>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </ErrorBox>
            )}

            <InfoText>
              💡 الكود يتكون من 8 أحرف (A-Z, 2-9) بدون مسافات<br />
              Codes are 8 characters (A-Z, 2-9) without spaces
            </InfoText>
          </>
        );

      case 'preview':
        return (
          <>
            <SuccessIcon>
              <CheckCircle size={60} color="#10B981" />
            </SuccessIcon>
            
            <Title>تفاصيل الدعوة | Invitation Details</Title>
            
            <CompanyCard>
              <CompanyHeader>
                <CompanyName>{companyPreview?.companyName}</CompanyName>
                <RoleBadge $role={companyPreview?.role || 'agent'}>
                  {companyPreview?.role === 'admin' ? 'مسؤول | Admin' : 
                   companyPreview?.role === 'agent' ? 'وكيل | Agent' : 
                   'مشاهد | Viewer'}
                </RoleBadge>
              </CompanyHeader>
              
              <CompanyInfo>
                <InfoRow>
                  <strong>دعاك:</strong> {companyPreview?.ownerName}
                </InfoRow>
                <InfoRow>
                  <strong>حجم الفريق:</strong> {companyPreview?.teamSize} عضو
                </InfoRow>
                <InfoRow>
                  <strong>الصلاحيات:</strong> {
                    companyPreview?.role === 'admin' ? 'كامل الصلاحيات' :
                    companyPreview?.role === 'agent' ? 'إنشاء وتعديل إعلانات' :
                    'مشاهدة فقط'
                  }
                </InfoRow>
              </CompanyInfo>
            </CompanyCard>

            <ActionButton 
              onClick={handleAcceptInvitation} 
              disabled={isLoading}
              $variant="primary"
            >
              {isLoading ? 'جاري الانضمام...' : 'انضم الآن | Join Now'}
              {!isLoading && <ArrowRight size={20} style={{ marginLeft: '8px' }} />}
            </ActionButton>

            {errorMessage && (
              <ErrorBox>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </ErrorBox>
            )}
          </>
        );

      case 'success':
        return (
          <>
            <SuccessIcon>
              <CheckCircle size={80} color="#10B981" />
            </SuccessIcon>
            
            <Title>{successMessage}</Title>
            <Subtitle>سيتم تحويلك إلى لوحة الفريق... | Redirecting to team dashboard...</Subtitle>
            
            <LoadingSpinner />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <ContentCard>
        <IconHeader>
          <Users size={40} color="#1E3A8A" />
        </IconHeader>
        
        {renderStep()}
        
        {step === 'input' && (
          <BackLink onClick={() => navigate('/')}>
            العودة للصفحة الرئيسية | Back to Home
          </BackLink>
        )}
      </ContentCard>
    </PageContainer>
  );
};

export default AcceptInvitePage;

// Styled Components (Mobile.de German Style)
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 48px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;

  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const IconHeader = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 12px;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: #64748b;
  margin-bottom: 32px;
  line-height: 1.5;
`;

const CodeInputWrapper = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const CodeInput = styled.input<{ $hasError: boolean }>`
  width: 100%;
  padding: 16px 20px;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  letter-spacing: 4px;
  border: 2px solid ${(props) => (props.$hasError ? '#ef4444' : '#e2e8f0')};
  border-radius: 12px;
  outline: none;
  transition: all 0.2s;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;

  &:focus {
    border-color: ${(props) => (props.$hasError ? '#ef4444' : '#1e3a8a')};
    box-shadow: 0 0 0 3px ${(props) => (props.$hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(30, 58, 138, 0.1)')};
  }

  &::placeholder {
    color: #cbd5e1;
    letter-spacing: 2px;
  }

  &:disabled {
    background: #f1f5f9;
    cursor: not-allowed;
  }
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 16px;
`;

const InfoText = styled.p`
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.6;
  margin-top: 20px;
`;

const SuccessIcon = styled.div`
  margin-bottom: 24px;
  animation: scaleIn 0.3s ease-out;

  @keyframes scaleIn {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }
`;

const CompanyCard = styled.div`
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: left;
`;

const CompanyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const CompanyName = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const RoleBadge = styled.span<{ $role: 'admin' | 'agent' | 'viewer' }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) =>
    props.$role === 'admin' ? '#dbeafe' : props.$role === 'agent' ? '#d1fae5' : '#f1f5f9'};
  color: ${(props) =>
    props.$role === 'admin' ? '#1e40af' : props.$role === 'agent' ? '#047857' : '#475569'};
`;

const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InfoRow = styled.div`
  font-size: 14px;
  color: #475569;
  
  strong {
    color: #1e293b;
    margin-right: 8px;
  }
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.$variant === 'primary' ? '#1e3a8a' : '#e2e8f0')};
  color: ${(props) => (props.$variant === 'primary' ? 'white' : '#475569')};

  &:hover:not(:disabled) {
    background: ${(props) => (props.$variant === 'primary' ? '#1e40af' : '#cbd5e1')};
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  margin-top: 24px;
  padding: 8px;
  transition: color 0.2s;

  &:hover {
    color: #1e3a8a;
    text-decoration: underline;
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #1e3a8a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

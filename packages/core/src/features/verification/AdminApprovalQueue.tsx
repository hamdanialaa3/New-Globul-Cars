// src/features/verification/AdminApprovalQueue.tsx
// Admin Approval Queue - Review and approve verification requests

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { useToast } from '@globul-cars/ui/componentsToast';
import { useAuth } from '@globul-cars/core/contextsAuthProvider';  // FIXED: Correct path
import { CheckCircle, XCircle, File, User, Building2, AlertCircle, ExternalLink } from 'lucide-react';
import verificationService from './VerificationService';
import { VerificationRequest } from './types';
import { formatDistance } from 'date-fns';
import { bg } from 'date-fns/locale/bg';
import { enUS } from 'date-fns/locale/en-US';

// Styled Components
const Container = styled.div`
  padding: 1.5rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  color: #6c757d;
  font-size: 0.9rem;
`;

const RequestCard = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  }
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
`;

const UserDetails = styled.div``;

const UserName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1rem;
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
`;

const TypeBadge = styled.span<{ type: string }>`
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  
  ${p => p.type === 'dealer' ? `
    background: #dcfce7;
    color: #16a34a;
  ` : `
    background: #dbeafe;
    color: #1d4ed8;
  `}
`;

const DocumentsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const DocumentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.85rem;
  
  svg {
    width: 18px;
    height: 18px;
    color: #3b82f6;
  }
`;

const DocumentLink = styled.a`
  color: #3b82f6;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &:hover {
    text-decoration: underline;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const NotesSection = styled.div`
  margin: 1rem 0;
`;

const NotesLabel = styled.label`
  display: block;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant: 'approve' | 'reject' | 'verify' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  ${p => {
    if (p.variant === 'approve') return `
      background: #16a34a;
      color: white;
      &:hover { background: #15803d; }
    `;
    if (p.variant === 'reject') return `
      background: #dc2626;
      color: white;
      &:hover { background: #b91c1c; }
    `;
    return `
      background: #3b82f6;
      color: white;
      &:hover { background: #2563eb; }
    `;
  }}
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
  
  svg {
    width: 64px;
    height: 64px;
    color: #d1d5db;
    margin-bottom: 1rem;
  }
`;

const TimeAgo = styled.div`
  color: #9ca3af;
  font-size: 0.8rem;
  margin-top: 0.5rem;
`;

/**
 * Admin Approval Queue Component
 * Shows pending verification requests for admin review
 */
export const AdminApprovalQueue: React.FC = () => {
  const { language } = useLanguage();
  const toast = useToast();
  const { currentUser } = useAuth();
  
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Load pending requests
  const loadRequests = async () => {
    try {
      setLoading(true);
      const pending = await verificationService.getPendingVerifications();
      setRequests(pending);
    } catch (error) {
      console.error('Error loading verification requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Handle approve
  const handleApprove = async (request: VerificationRequest) => {
    if (!currentUser) return;

    try {
      await verificationService.approveVerification(
        request.userId,
        currentUser.uid,
        request.targetProfileType
      );

      toast.success(
        language === 'bg' 
          ? 'Заявката е одобрена успешно!'
          : 'Application approved successfully!'
      );

      // Reload requests
      loadRequests();
    } catch (error: any) {
      console.error('Error approving verification:', error);
      toast.error(error.message || 'Approval failed');
    }
  };

  // Handle reject
  const handleReject = async (request: VerificationRequest) => {
    if (!currentUser) return;

    const reason = notes[request.userId] || '';
    if (!reason) {
      toast.error(language === 'bg' ? 'Моля, добавете причина' : 'Please add a reason');
      return;
    }

    try {
      await verificationService.rejectVerification(
        request.userId,
        currentUser.uid,
        reason
      );

      toast.success(
        language === 'bg' 
          ? 'Заявката е отхвърлена'
          : 'Application rejected'
      );

      // Reload requests
      loadRequests();
    } catch (error: any) {
      console.error('Error rejecting verification:', error);
      toast.error(error.message || 'Rejection failed');
    }
  };

  // Handle verify EIK (placeholder)
  const handleVerifyEIK = async (bulstat: string) => {
    toast.info(
      language === 'bg' 
        ? 'EIK проверка (TODO: API интеграция)'
        : 'EIK verification (TODO: API integration)'
    );
    // TODO: Call Bulgarian Trade Registry API
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
          Loading requests...
        </div>
      </Container>
    );
  }

  if (requests.length === 0) {
    return (
      <Container>
        <EmptyState>
          <CheckCircle />
          <div>
            <strong>{language === 'bg' ? 'Няма чакащи заявки' : 'No pending requests'}</strong>
            <p>{language === 'bg' ? 'Всички заявки са прегледани' : 'All requests have been reviewed'}</p>
          </div>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          {language === 'bg' ? 'Чакащи заявки за проверка' : 'Pending Verification Requests'}
        </Title>
        <Stats>
          <span>{requests.length} {language === 'bg' ? 'заявки' : 'requests'}</span>
        </Stats>
      </Header>

      {requests.map(request => (
        <RequestCard key={request.userId}>
          <RequestHeader>
            <UserInfo>
              <Avatar src="/assets/images/default-avatar.png" alt="User" />
              <UserDetails>
                <UserName>User ID: {request.userId.substring(0, 8)}...</UserName>
                <UserEmail>
                  {language === 'bg' ? 'Тип:' : 'Type:'}{' '}
                  <TypeBadge type={request.targetProfileType}>
                    {request.targetProfileType === 'dealer' 
                      ? (language === 'bg' ? 'Дилър' : 'Dealer')
                      : (language === 'bg' ? 'Фирма' : 'Company')}
                  </TypeBadge>
                </UserEmail>
                <TimeAgo>
                  {language === 'bg' ? 'Подадена' : 'Submitted'}{' '}
                  {formatDistance(request.submittedAt, new Date(), {
                    addSuffix: true,
                    locale: language === 'bg' ? bg : enUS
                  })}
                </TimeAgo>
              </UserDetails>
            </UserInfo>
          </RequestHeader>

          {/* Documents List */}
          <DocumentsList>
            {request.documents.map((doc, idx) => (
              <DocumentItem key={idx}>
                <File />
                <DocumentLink href={doc.url} target="_blank" rel="noopener noreferrer">
                  {doc.type}
                  <ExternalLink />
                </DocumentLink>
              </DocumentItem>
            ))}
          </DocumentsList>

          {/* Admin Notes */}
          <NotesSection>
            <NotesLabel>
              {language === 'bg' ? 'Бележки (видими за потребителя при отхвърляне)' : 'Notes (visible to user if rejected)'}
            </NotesLabel>
            <NotesTextarea
              placeholder={language === 'bg' 
                ? 'Добавете причина при отхвърляне...'
                : 'Add reason if rejecting...'}
              value={notes[request.userId] || ''}
              onChange={(e) => setNotes(prev => ({ ...prev, [request.userId]: e.target.value }))}
            />
          </NotesSection>

          {/* Action Buttons */}
          <ActionButtons>
            <Button 
              variant="verify" 
              onClick={() => handleVerifyEIK('placeholder')}
            >
              <Building2 />
              {language === 'bg' ? 'Провери ЕИК' : 'Verify EIK'}
            </Button>

            <Button 
              variant="reject" 
              onClick={() => handleReject(request)}
            >
              <XCircle />
              {language === 'bg' ? 'Отхвърли' : 'Reject'}
            </Button>

            <Button 
              variant="approve" 
              onClick={() => handleApprove(request)}
            >
              <CheckCircle />
              {language === 'bg' ? 'Одобри' : 'Approve'}
            </Button>
          </ActionButtons>
        </RequestCard>
      ))}
    </Container>
  );
};

export default AdminApprovalQueue;


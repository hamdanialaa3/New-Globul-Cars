/**
 * Invite Member Modal Component
 * Form to invite new team members
 * Target: 220 lines
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { teamManagementService, TeamRole, InviteMemberParams } from '@/services/company/team-management-service';
import { RoleBadge } from './RoleBadge';
import { FaTimes, FaEnvelope, FaUser, FaShieldAlt, FaUserTie, FaEye } from 'react-icons/fa';
import { logger } from '@/services/logger-service';

interface Props {
  companyId: string;
  invitedBy: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const InviteMemberModal: React.FC<Props> = ({ companyId, invitedBy, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<InviteMemberParams>({
    email: '',
    displayName: '',
    role: 'agent'
  });
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.displayName) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const invitation = await teamManagementService.inviteMember(
        companyId,
        invitedBy,
        formData
      );

      setInviteCode(invitation.inviteCode);
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        onSuccess();
      }, 5000);
    } catch (err: any) {
      logger.error('Failed to invite member', err);
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  // If invite successful, show code
  if (inviteCode) {
    return (
      <Overlay onClick={onClose}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <SuccessHeader>
            <h2>✅ Invitation sent successfully!</h2>
          </SuccessHeader>
          <SuccessContent>
            <InviteCodeBox>
              <Label>Invite Code:</Label>
              <Code>{inviteCode}</Code>
              <Hint>Send this code to {formData.email}</Hint>
            </InviteCodeBox>
            <Instructions>
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Copy the invite code above</li>
                <li>Send it to {formData.email} via email or WhatsApp</li>
                <li>The user will use it to join your team</li>
                <li>Code validity: 7 days</li>
              </ol>
            </Instructions>
            <CloseButton onClick={onSuccess}>Got it</CloseButton>
          </SuccessContent>
        </Modal>
      </Overlay>
    );
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Invite New Member</Title>
          <CloseIcon onClick={onClose}><FaTimes /></CloseIcon>
        </Header>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorBanner>{error}</ErrorBanner>}

          <FormGroup>
            <Label>
              <FaEnvelope />
              Email
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@company.com"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <FaUser />
              Full Name
            </Label>
            <Input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="John Doe"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Role</Label>
            <RoleSelector>
              <RoleOption
                selected={formData.role === 'admin'}
                onClick={() => setFormData({ ...formData, role: 'admin' })}
              >
                <FaShieldAlt />
                <span>Admin</span>
                <RoleDescription>Full permissions</RoleDescription>
              </RoleOption>
              <RoleOption
                selected={formData.role === 'agent'}
                onClick={() => setFormData({ ...formData, role: 'agent' })}
              >
                <FaUserTie />
                <span>Agent</span>
                <RoleDescription>Add listings only</RoleDescription>
              </RoleOption>
              <RoleOption
                selected={formData.role === 'viewer'}
                onClick={() => setFormData({ ...formData, role: 'viewer' })}
              >
                <FaEye />
                <span>Viewer</span>
                <RoleDescription>View only</RoleDescription>
              </RoleOption>
            </RoleSelector>
          </FormGroup>

          <Actions>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Invitation'}
            </SubmitButton>
          </Actions>
        </Form>
      </Modal>
    </Overlay>
  );
};

// Styled Components

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const Title = styled.h2`
  margin: 0;
  color: #1f2937;
`;

const CloseIcon = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;

  &:hover {
    color: #1f2937;
  }
`;

const Form = styled.form`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const RoleSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
`;

const RoleOption = styled.div<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid ${props => props.selected ? '#3b82f6' : '#e5e7eb'};
  background: ${props => props.selected ? '#eff6ff' : 'white'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  svg {
    font-size: 1.5rem;
    color: ${props => props.selected ? '#3b82f6' : '#6b7280'};
    margin-bottom: 0.5rem;
  }

  span {
    font-weight: 600;
    color: ${props => props.selected ? '#3b82f6' : '#374151'};
  }

  &:hover {
    border-color: #3b82f6;
  }
`;

const RoleDescription = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  text-align: center;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    border-color: #d1d5db;
    background: #f9fafb;
  }
`;

const SubmitButton = styled.button`
  flex: 2;
  padding: 0.75rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorBanner = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
`;

const SuccessHeader = styled.div`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  border-radius: 16px 16px 0 0;

  h2 {
    margin: 0;
  }
`;

const SuccessContent = styled.div`
  padding: 2rem;
`;

const InviteCodeBox = styled.div`
  background: #eff6ff;
  border: 2px solid #3b82f6;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Code = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1e3a8a;
  letter-spacing: 0.25rem;
  margin: 1rem 0;
  font-family: monospace;
`;

const Hint = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const Instructions = styled.div`
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;

  p {
    margin: 0 0 0.75rem 0;
    font-weight: 600;
  }

  ol {
    margin: 0;
    padding-right: 1.5rem;

    li {
      margin-bottom: 0.5rem;
      color: #374151;
    }
  }
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
`;

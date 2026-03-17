import { logger } from '@/services/logger-service';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { uniqueOwnerService } from '@/services/unique-owner-service';
import { auth } from '@/firebase/firebase-config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { signOut } from 'firebase/auth';

// Styled Components - Professional Minimal Design
// Styled Components - Professional Minimal Design
const LoginContainer = styled.div`
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
`;

const LoginCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 48px;
  width: 100%;
  max-width: 440px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1001;
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const LoginIcon = styled.div`
  width: 56px;
  height: 56px;
  background: #000000;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const LoginTitle = styled.h1`
  color: #000000 !important;
  font-size: 13px;
  font-weight: 300;
  margin: 0 0 8px 0;
  line-height: 1.2;
`;

const LoginSubtitle = styled.p`
  color: #555555 !important;
  font-size: 15px;
  margin: 0;
  font-weight: 400;
  line-height: 1.5;
`;

const RepairButton = styled.button`
  background: transparent;
  border: 1px solid #cccccc;
  color: #444444 !important;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;

  &:hover {
    background: #f5f5f5;
    border-color: #999999;
    color: #000000 !important;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  color: #1a1a1a !important;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #cccccc;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  box-sizing: border-box;
  background: #ffffff !important;
  color: #000000 !important;
  font-weight: 500;

  &::placeholder {
    color: #999999 !important;
    font-weight: 400;
  }

  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
  }

  &:disabled {
    background: #f5f5f5 !important;
    cursor: not-allowed;
    color: #888888 !important;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666666 !important;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #000000 !important;
    background: rgba(0,0,0,0.05);
  }
`;

const LoginButton = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  padding: 14px;
  background: ${props => props.$disabled ? '#cccccc' : '#000000'} !important;
  color: #ffffff !important;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: ${props => props.$disabled ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.15)'};

  &:hover:not(:disabled) {
    background: #222222 !important;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const MessageContainer = styled.div<{ $type: 'success' | 'error' }>`
  padding: 14px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${props => props.$type === 'success' ? '#e8f5e9' : '#ffebee'} !important;
  color: ${props => props.$type === 'success' ? '#1b5e20' : '#c62828'} !important;
  border: 1px solid ${props => props.$type === 'success' ? '#c8e6c9' : '#ffcdd2'};
  font-size: 14px;
  font-weight: 500;
`;

const AdminInfo = styled.div`
  background: #f8f9fa !important;
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
  border: 1px solid #e9ecef;
`;

const AdminInfoTitle = styled.h3`
  color: #212529 !important;
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AdminInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const AdminInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const AdminInfoLabel = styled.span`
  font-size: 11px;
  color: #6c757d !important;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AdminInfoValue = styled.span`
  font-size: 13px;
  color: #212529 !important;
  font-weight: 600;
  font-family: monospace;
`;

const SecurityBadge = styled.div`
  background: #000000 !important;
  color: #ffffff !important;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  letter-spacing: 0.5px;
`;

const SuperAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      const user = auth.currentUser;
      if (!user) {
        throw new Error('Missing authenticated user session');
      }

      const isAdmin = await uniqueOwnerService.startAdminSession(user);
      if (!isAdmin) {
        await signOut(auth);
        setMessage({ type: 'error', text: 'Access denied. Admin role is required.' });
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: 'Admin authenticated. Redirecting to Super Admin dashboard…' });
      setTimeout(() => {
        navigate('/super-admin');
      }, 1000);
    } catch (error) {
      logger.error('Authentication error:', error as Error);
      setMessage({ type: 'error', text: 'Authentication failed. Please check your credentials.' });
      setLoading(false);
    }
  };

  // التحقق من الجلسة الموجودة
  useEffect(() => {
    const checkExistingSession = async () => {
      const isValid = await uniqueOwnerService.validateCurrentSession();
      if (isValid) {
        navigate('/super-admin');
      }
    };

    checkExistingSession();
  }, [navigate]);

  return (
    <LoginContainer>
      <LoginCard>
        <LoginHeader>
          <LoginIcon>
            <Shield size={24} color="white" />
          </LoginIcon>
          <LoginTitle>Super Admin Login</LoginTitle>
          <LoginSubtitle>Owner Access Only</LoginSubtitle>
          <RepairButton onClick={() => navigate('/admin/data-fix')} type="button">
            Data Fix Tools
          </RepairButton>
        </LoginHeader>

        <form onSubmit={handleLogin}>
          <FormGroup>
            <Label>Owner Email Address</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter owner email"
              required
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label>Owner Password</Label>
            <InputContainer>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter owner password"
                required
                disabled={loading}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </InputContainer>
          </FormGroup>

          <LoginButton type="submit" $disabled={loading}>
            {loading ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Authenticating...
              </>
            ) : (
              <>
                <Lock size={16} />
                Sign In
              </>
            )}
          </LoginButton>

          {message && (
            <MessageContainer $type={message.type}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {message.text}
            </MessageContainer>
          )}
        </form>

        <AdminInfo>
          <AdminInfoTitle>
            <Shield size={20} />
            Unique Owner Information
          </AdminInfoTitle>
          <AdminInfoGrid>
            <AdminInfoItem>
              <AdminInfoLabel>Owner Name</AdminInfoLabel>
              <AdminInfoValue>{import.meta.env.VITE_OWNER_NAME || 'Alaa Hamid'}</AdminInfoValue>
            </AdminInfoItem>
            <AdminInfoItem>
              <AdminInfoLabel>Email</AdminInfoLabel>
              <AdminInfoValue>{email || 'Enter admin email'}</AdminInfoValue>
            </AdminInfoItem>
            <AdminInfoItem>
              <AdminInfoLabel>Phone</AdminInfoLabel>
              <AdminInfoValue>{import.meta.env.VITE_OWNER_PHONE || '+359879839671'}</AdminInfoValue>
            </AdminInfoItem>
            <AdminInfoItem>
              <AdminInfoLabel>Location</AdminInfoLabel>
              <AdminInfoValue>Sofia, Bulgaria</AdminInfoValue>
            </AdminInfoItem>
          </AdminInfoGrid>
          <SecurityBadge>
            <Shield size={12} />
            Owner Access
          </SecurityBadge>
        </AdminInfo>
      </LoginCard>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </LoginContainer>
  );
};

export default SuperAdminLogin;

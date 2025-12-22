import { logger } from '../../../../services/logger-service';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { uniqueOwnerService } from '../../../../services/unique-owner-service';
import { auth } from '../../../../firebase/firebase-config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAdminEmail, isAdminConfigured } from '../../../../config/env-validation';

// Styled Components - Professional Minimal Design
const LoginContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const LoginIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #2c2c2c;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
`;

const LoginTitle = styled.h1`
  color: #1a1a1a;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const LoginSubtitle = styled.p`
  color: #666666;
  font-size: 14px;
  margin: 0;
  font-weight: 400;
`;

const RepairButton = styled.button`
  background: transparent;
  border: 1px solid #d0d0d0;
  color: #666666;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #f5f5f5;
    border-color: #999999;
    color: #333333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: #333333;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.15s;
  box-sizing: border-box;
  background: #ffffff;
  color: #1a1a1a;

  &:focus {
    outline: none;
    border-color: #666666;
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666666;
  padding: 4px;
  border-radius: 2px;
  transition: color 0.15s;

  &:hover {
    color: #333333;
  }
`;

const LoginButton = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  padding: 12px;
  background: ${props => props.$disabled ? '#e0e0e0' : '#1a1a1a'};
  color: ${props => props.$disabled ? '#999999' : '#ffffff'};
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.15s;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: #333333;
  }
`;

const MessageContainer = styled.div<{ $type: 'success' | 'error' }>`
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$type === 'success' ? '#f0f9f0' : '#fff5f5'};
  color: ${props => props.$type === 'success' ? '#2d5a2d' : '#8b2d2d'};
  border: 1px solid ${props => props.$type === 'success' ? '#d0e8d0' : '#f0d0d0'};
  font-size: 13px;
`;

const AdminInfo = styled.div`
  background: #f9f9f9;
  border-radius: 4px;
  padding: 16px;
  margin-top: 20px;
  border: 1px solid #e0e0e0;
`;

const AdminInfoTitle = styled.h3`
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AdminInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const AdminInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AdminInfoLabel = styled.span`
  font-size: 11px;
  color: #666666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const AdminInfoValue = styled.span`
  font-size: 13px;
  color: #1a1a1a;
  font-weight: 500;
`;

const SecurityBadge = styled.div`
  background: #2c2c2c;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
`;

const SuperAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  // ✅ Security: Use environment variables instead of hardcoded credentials
  const [email, setEmail] = useState(getAdminEmail());
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Warn if admin credentials are not configured
  useEffect(() => {
    if (!isAdminConfigured()) {
      setMessage({
        type: 'error',
        text: 'Admin credentials not configured. Please set REACT_APP_ADMIN_EMAIL and REACT_APP_ADMIN_PASSWORD in your .env file.'
      });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Step 1: Validate unique owner session (local gate)
      const isAuthenticated = await uniqueOwnerService.authenticateUniqueOwner(email, password);
      if (!isAuthenticated) {
        setMessage({ type: 'error', text: 'Invalid credentials. Only the unique owner can access this system.' });
        setLoading(false);
        return;
      }

      // Step 2: Sign in to Firebase Auth (required for 100% REAL data)
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (authErr) {
        const error = authErr as Error; // Type assertion to fix lint error
        logger.warn('Firebase Auth sign-in failed, proceeding with local admin session:', { message: error.message });
        // Continue anyway because the local uniqueOwnerService check passed
        // This allows the admin to access the dashboard even if not present in Firebase Auth users yet
      }

      setMessage({ type: 'success', text: 'Owner authenticated. Redirecting to Super Admin dashboard…' });
      setTimeout(() => {
        navigate('/super-admin');
      }, 1000);
    } catch (error) {
      logger.error('Authentication error:', error);
      setMessage({ type: 'error', text: 'Authentication failed. Please try again.' });
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
              <AdminInfoValue>Alaa Hamid</AdminInfoValue>
            </AdminInfoItem>
            <AdminInfoItem>
              <AdminInfoLabel>Email</AdminInfoLabel>
              <AdminInfoValue>alaa.hamdani@yahoo.com</AdminInfoValue>
            </AdminInfoItem>
            <AdminInfoItem>
              <AdminInfoLabel>Phone</AdminInfoLabel>
              <AdminInfoValue>+359879839671</AdminInfoValue>
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

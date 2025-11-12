import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { uniqueOwnerService } from '@/services/unique-owner-service';
import { auth } from '@/firebase/firebase-config';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Styled Components
const LoginContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
`;

const LoginCard = styled.div`
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 480px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
  position: relative;
  z-index: 1;
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const LoginIcon = styled.div`
  width: 80px;
  height: 80px;
  background: var(--accent-primary);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: var(--shadow-md);
`;

const LoginTitle = styled.h1`
  color: var(--text-primary);
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 8px 0;
`;

const LoginSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 16px;
  margin: 0;
  font-weight: 500;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e4e6ea;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.8);

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    background: white;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #65676b;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;

  &:hover {
    color: #667eea;
  }
`;

const LoginButton = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  padding: 16px;
  background: ${props => props.$disabled ? '#e4e6ea' : 'linear-gradient(135deg, #667eea, #764ba2)'};
  color: ${props => props.$disabled ? '#bcc0c4' : 'white'};
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: ${props => props.$disabled ? 'none' : '0 10px 30px rgba(102, 126, 234, 0.3)'};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
  }
`;

const MessageContainer = styled.div<{ $type: 'success' | 'error' }>`
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${props => props.$type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$type === 'success' ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.$type === 'success' ? '#c3e6cb' : '#f5c6cb'};
`;

const AdminInfo = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  margin-top: 24px;
  border: 1px solid var(--border);
`;

const AdminInfoTitle = styled.h3`
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
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
  font-size: 12px;
  color: #65676b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AdminInfoValue = styled.span`
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
`;

const SecurityBadge = styled.div`
  background: var(--success);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
`;

const SuperAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('alaa.hamdani@yahoo.com');
  const [password, setPassword] = useState('Alaa1983');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

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
        console.error('Firebase Auth sign-in failed:', authErr);
        setMessage({ type: 'error', text: 'Firebase sign-in failed. Please ensure the owner account exists in Firebase Auth and the password is correct.' });
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: 'Owner authenticated. Redirecting to Super Admin dashboard…' });
      setTimeout(() => {
        navigate('/super-admin');
      }, 1000);
    } catch (error) {
      console.error('Authentication error:', error);
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
            <Shield size={40} color="white" />
          </LoginIcon>
          <LoginTitle>🔐 Super Admin Access</LoginTitle>
          <LoginSubtitle>Unique Owner Authentication System</LoginSubtitle>
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
                <div style={{ width: '20px', height: '20px', border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Authenticating...
              </>
            ) : (
              <>
                <Lock size={20} />
                Access Super Admin Dashboard
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
            <Shield size={14} />
            Unique Owner - Full System Access
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

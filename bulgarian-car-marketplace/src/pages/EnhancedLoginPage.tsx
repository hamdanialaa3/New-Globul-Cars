import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { SocialAuthService } from '../firebase/social-auth-service';
import { useAuth } from '../hooks/useAuth';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  Loader,
  ArrowRight,
  Shield,
  Globe
} from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  padding: ${({ theme }) => theme.spacing.lg};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(1px);
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing['3xl']};
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 450px;
  animation: ${fadeIn} 0.8s ease-out;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xl};
    margin: ${({ theme }) => theme.spacing.md};
  }
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const LoginTitle = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${slideIn} 0.6s ease-out 0.2s both;
`;

const LoginSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  animation: ${slideIn} 0.6s ease-out 0.4s both;
`;

const BulgarianInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: #b45309;
  animation: ${slideIn} 0.6s ease-out 0.6s both;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FormGroup = styled.div`
  position: relative;
  
  .form-icon {
    position: absolute;
    left: ${({ theme }) => theme.spacing.md};
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.secondary};
    z-index: 1;
  }
  
  .password-toggle {
    position: absolute;
    right: ${({ theme }) => theme.spacing.md};
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing.xs};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    transition: all 0.2s ease;
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary.main};
      background: rgba(102, 126, 234, 0.1);
    }
    
    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.primary.main}50;
    }
  }
`;

const Label = styled.label`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  padding-left: ${({ theme }) => theme.spacing['2xl']};
  padding-right: ${({ theme }) => theme.spacing['2xl']};
  border: 2px solid ${({ hasError, theme }) => 
    hasError ? theme.colors.error.main : theme.colors.grey[300]
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  transition: all 0.3s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.grey[100]};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.error.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
  animation: ${fadeIn} 0.3s ease-out;
  background: ${({ theme }) => theme.colors.error.light}20;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 3px solid ${({ theme }) => theme.colors.error.main};
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.success.main};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  animation: ${fadeIn} 0.3s ease-out;
  background: ${({ theme }) => theme.colors.success.light}20;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 3px solid ${({ theme }) => theme.colors.success.main};
`;

const LoginButton = styled.button<{ loading?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  ${({ loading }) => loading && `
    pointer-events: none;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      animation: shimmer 2s infinite;
    }
    
    @keyframes shimmer {
      0% { left: -100%; }
      100% { left: 100%; }
    }
  `}
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.spacing.xl} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.grey[300]};
  }
  
  span {
    padding: 0 ${({ theme }) => theme.spacing.lg};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    background: white;
  }
`;

const SocialButtonsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const SocialButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: 2px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: white;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ theme }) => theme.colors.primary.light}20;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RememberForgotContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: ${({ theme }) => theme.spacing.lg} 0;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  user-select: none;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: ${({ theme }) => theme.colors.primary.main};
    cursor: pointer;
  }
  
  span {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  &:hover span {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ForgotLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary.main};
  text-decoration: none;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: all 0.3s ease;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary.dark};
    background: ${({ theme }) => theme.colors.primary.main}10;
    text-decoration: underline;
  }
  
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main}50;
  }
`;

const RegisterPrompt = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
  
  span {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
  
  a {
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    margin-left: ${({ theme }) => theme.spacing.sm};
    transition: all 0.3s ease;
    padding: ${({ theme }) => theme.spacing.xs};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    
    &:hover {
      text-decoration: underline;
      background: ${({ theme }) => theme.colors.primary.main}10;
    }
    
    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.primary.main}50;
    }
  }
`;

const SecurityInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(102, 126, 234, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.primary.dark};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const EnhancedLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // إعادة توجيه المستخدم إذا كان مسجلاً دخوله
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      errors.email = t('auth.emailRequired', 'Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('auth.emailInvalid', 'Please enter a valid email');
    }
    
    if (!formData.password) {
      errors.password = t('auth.passwordRequired', 'Password is required');
    } else if (formData.password.length < 6) {
      errors.password = t('auth.passwordTooShort', 'Password must be at least 6 characters');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // مسح رسائل الخطأ عند التعديل
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await SocialAuthService.signInWithEmailAndPassword(
        formData.email,
        formData.password
      );
      
      if (result && result.user) {
        setSuccess(t('auth.loginSuccess', 'Login successful! Redirecting...'));
        
        // انتظار قصير لعرض رسالة النجاح
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setError(t('auth.loginFailed', 'Login failed. Please try again.'));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(t('auth.unexpectedError', 'An unexpected error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLoginSuccess = () => {
    setSuccess(t('auth.loginSuccess', 'Login successful! Redirecting...'));
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LoginHeader>
          <LoginTitle>{t('auth.welcomeBack', 'Welcome Back!')}</LoginTitle>
          <LoginSubtitle>{t('auth.loginSubtitle', 'Sign in to continue to your account')}</LoginSubtitle>
          <BulgarianInfo>
            <Globe size={16} />
            <span>{t('auth.bulgarianMarketplace', 'Bulgarian Car Marketplace')}</span>
          </BulgarianInfo>
        </LoginHeader>

        {success && (
          <SuccessMessage>
            <CheckCircle size={18} />
            <span>{success}</span>
          </SuccessMessage>
        )}

        {error && (
          <ErrorMessage>
            <AlertCircle size={18} />
            <span>{error}</span>
          </ErrorMessage>
        )}

        <LoginForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">{t('auth.email', 'Email Address')}</Label>
            <Mail className="form-icon" size={20} />
            <Input
              id="email"
              type="email"
              name="email"
              placeholder={t('auth.emailPlaceholder', 'Enter your email address')}
              value={formData.email}
              onChange={handleInputChange}
              hasError={!!validationErrors.email}
              disabled={loading}
              required
              autoComplete="email"
            />
            {validationErrors.email && (
              <ErrorMessage>
                <AlertCircle size={16} />
                <span>{validationErrors.email}</span>
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">{t('auth.password', 'Password')}</Label>
            <Lock className="form-icon" size={20} />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder={t('auth.passwordPlaceholder', 'Enter your password')}
              value={formData.password}
              onChange={handleInputChange}
              hasError={!!validationErrors.password}
              disabled={loading}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? t('auth.hidePassword', 'Hide password') : t('auth.showPassword', 'Show password')}
              tabIndex={0}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {validationErrors.password && (
              <ErrorMessage>
                <AlertCircle size={16} />
                <span>{validationErrors.password}</span>
              </ErrorMessage>
            )}
          </FormGroup>

          <RememberForgotContainer>
            <CheckboxContainer>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={loading}
              />
              <span>{t('auth.rememberMe', 'Remember me')}</span>
            </CheckboxContainer>
            
            <ForgotLink to="/forgot-password">
              {t('auth.forgotPassword', 'Forgot password?')}
            </ForgotLink>
          </RememberForgotContainer>

          <LoginButton type="submit" disabled={loading} loading={loading}>
            {loading ? (
              <>
                <Loader size={20} />
                {t('auth.signingIn', 'Signing in...')}
              </>
            ) : (
              <>
                {t('auth.signIn', 'Sign In')}
                <ArrowRight size={20} />
              </>
            )}
          </LoginButton>
        </LoginForm>

        <Divider>
          <span>{t('auth.orContinueWith', 'Or continue with')}</span>
        </Divider>

        <SocialButtonsContainer>
          <SocialButton 
            onClick={async () => {
              try {
                const result = await SocialAuthService.signInWithGoogle();
                if (result) {
                  handleSocialLoginSuccess();
                }
              } catch (error) {
                console.error('Google login error:', error);
              }
            }}
            disabled={loading}
          >
            Google
          </SocialButton>
          
          <SocialButton 
            onClick={async () => {
              try {
                const result = await SocialAuthService.signInWithFacebook();
                if (result) {
                  handleSocialLoginSuccess();
                }
              } catch (error) {
                console.error('Facebook login error:', error);
              }
            }}
            disabled={loading}
          >
            Facebook
          </SocialButton>
        </SocialButtonsContainer>

        <SecurityInfo>
          <Shield size={16} />
          <span>{t('auth.secureConnection', 'Your connection is secure and encrypted')}</span>
        </SecurityInfo>

        <RegisterPrompt>
          <span>{t('auth.noAccount', "Don't have an account?")}</span>
          <Link to="/register">{t('auth.createAccount', 'Create one here')}</Link>
        </RegisterPrompt>
      </LoginCard>
    </LoginContainer>
  );
};

export default EnhancedLoginPage;
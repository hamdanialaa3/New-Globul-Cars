// RegisterPageGlass.tsx - Premium Glass Morphism Register Page
// With Cinematic Background Slideshow and All Authentication Methods

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User,
  Chrome, 
  Facebook, 
  Apple, 
  Phone, 
  UserCheck,
  ArrowRight,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { SocialAuthService } from '../../firebase/social-auth-service';
import PhoneAuthModal from '../../components/PhoneAuthModal';
import BackgroundSlideshow from '../../components/BackgroundSlideshow';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../services/logger-service';

// Premium background images array
const backgroundImages = [
  '/assets/images/Pic/pexels-bylukemiller-29566898.jpg',
  '/assets/images/Pic/pexels-boris-dahm-2150922402-31729752.jpg',
  '/assets/images/Pic/pexels-alexgtacar-745150-1592384.jpg',
  '/assets/images/Pic/car_inside (3).jpg',
  '/assets/images/Pic/car_inside (7).jpg',
  '/assets/images/Pic/car_inside (12).jpg',
  '/assets/images/Pic/pexels-pixabay-315938.jpg',
  '/assets/images/Pic/pexels-maoriginalphotography-1454253.jpg',
];

// Reuse animations from Login
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components (reusing from Login with minor adjustments)
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;


const GlassWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 480px;
  min-height: 600px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 60px rgba(255, 255, 255, 0.1),
    inset 0 0 60px rgba(255, 255, 255, 0.05);
  padding: 40px;
  z-index: 10;
  animation: ${fadeIn} 0.6s ease;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 30px 20px;
    min-height: auto;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    padding: 25px 15px;
    border-radius: 16px;
  }
`;

const Title = styled.h1`
  font-size: 42px;
  font-weight: 700;
  text-align: center;
  color: #fff;
  margin-bottom: 12px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  animation: ${slideIn} 0.6s ease;

  @media (max-width: 768px) {
    font-size: 36px;
  }

  @media (max-width: 480px) {
    font-size: 30px;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  margin-bottom: 25px;
  animation: ${slideIn} 0.6s ease 0.1s backwards;

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 20px;
  }
`;

const Form = styled.form`
  width: 100%;
`;

const InputBox = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 20px;
  animation: ${slideIn} 0.6s ease 0.2s backwards;

  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

const Input = styled.input`
  width: 100%;
  height: 52px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  font-size: 16px;
  color: #fff;
  padding: 0 50px 0 20px;
  transition: all 0.3s ease;
  font-family: 'Poppins', 'Segoe UI', sans-serif;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 480px) {
    height: 48px;
    font-size: 15px;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #fff;
  }
`;

const TermsCheckbox = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  margin-bottom: 20px;
  cursor: pointer;
  animation: ${slideIn} 0.6s ease 0.3s backwards;

  input[type="checkbox"] {
    margin-top: 2px;
    accent-color: #fff;
    width: 16px;
    height: 16px;
    cursor: pointer;
    flex-shrink: 0;
  }

  a {
    color: #fff;
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const SubmitButton = styled.button<{ $loading?: boolean }>`
  width: 100%;
  height: 52px;
  background: #fff;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  animation: ${slideIn} 0.6s ease 0.4s backwards;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 255, 255, 0.4);
    background: #f0f0f0;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spin {
    animation: ${spin} 1s linear infinite;
  }

  @media (max-width: 480px) {
    height: 48px;
    font-size: 15px;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  animation: ${slideIn} 0.6s ease 0.5s backwards;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.3);
  }

  span {
    padding: 0 15px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    white-space: nowrap;
  }

  @media (max-width: 480px) {
    margin: 16px 0;
    span {
      font-size: 13px;
      padding: 0 10px;
    }
  }
`;

const SocialButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
  animation: ${slideIn} 0.6s ease 0.6s backwards;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const SocialButton = styled.button<{ $provider: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    font-size: 13px;
    padding: 11px;
  }
`;

const GuestButton = styled(SocialButton)`
  grid-column: 1 / -1;
  background: rgba(255, 255, 255, 0.15);
  font-weight: 600;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  animation: ${slideIn} 0.6s ease 0.7s backwards;

  a {
    color: #fff;
    text-decoration: none;
    font-weight: 600;
    margin-left: 5px;
    transition: all 0.3s ease;

    &:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const Message = styled.div<{ $type: 'error' | 'success' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  animation: ${fadeIn} 0.3s ease;
  
  ${props => props.$type === 'error' ? `
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.5);
    color: #fff;
  ` : `
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.5);
    color: #fff;
  `}

  @media (max-width: 480px) {
    font-size: 13px;
    padding: 10px 14px;
  }
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  animation: ${slideIn} 0.6s ease 0.8s backwards;

  @media (max-width: 480px) {
    font-size: 11px;
    padding: 6px;
  }
`;

// Main Component
const RegisterPageGlass: React.FC = () => {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError(language === 'bg' ? 'Паролите не съвпадат' : 'Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      setError(language === 'bg' ? 'Трябва да приемете условията' : 'You must agree to the terms');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await SocialAuthService.createUserWithEmailAndPassword(formData.email, formData.password);
      if (formData.name) {
        await SocialAuthService.updateUserProfile({ displayName: formData.name });
      }
      setSuccess(language === 'bg' ? 'Успешна регистрация!' : 'Registration successful!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
      setError(err.message || (language === 'bg' ? 'Грешка при регистрация' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Starting Google registration');
      }
      const result = await SocialAuthService.signInWithGoogle();
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Google registration successful', { email: result.user.email });
      }
      setSuccess(language === 'bg' ? 'Успешна регистрация с Google!' : 'Google registration successful!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      logger.error('Google registration error', err as Error);
      
      if (err.message === 'REDIRECT_INITIATED') {
        return;
      }
      
      setError(err.message || (language === 'bg' ? 'Грешка при регистрация с Google' : 'Google registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookRegister = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Starting Facebook registration');
      }
      const result = await SocialAuthService.signInWithFacebook();
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Facebook registration successful', { email: result.user.email });
      }
      setSuccess(language === 'bg' ? 'Успешна регистрация с Facebook!' : 'Facebook registration successful!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      logger.error('Facebook registration error', err as Error);
      setError(err.message || (language === 'bg' ? 'Грешка при регистрация с Facebook' : 'Facebook registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleRegister = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Starting Apple registration');
      }
      const result = await SocialAuthService.signInWithApple();
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Apple registration successful', { email: result.user.email });
      }
      setSuccess(language === 'bg' ? 'Успешна регистрация с Apple!' : 'Apple registration successful!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      logger.error('Apple registration error', err as Error);
      setError(err.message || (language === 'bg' ? 'Грешка при регистрация с Apple' : 'Apple registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousRegister = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Starting anonymous sign-in');
      }
      const result = await SocialAuthService.signInAnonymously();
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Anonymous sign-in successful', { uid: result.user.uid });
      }
      setSuccess(language === 'bg' ? 'Влезли сте като гост!' : 'Signed in as guest!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      logger.error('Anonymous sign-in error', err as Error);
      setError(err.message || (language === 'bg' ? 'Грешка при влизане като гост' : 'Anonymous sign-in failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <BackgroundSlideshow 
        images={backgroundImages} 
        interval={7000}
        transitionDuration={7}
      />
      
      <GlassWrapper>
        <Title>{language === 'bg' ? 'Регистрация' : 'Register'}</Title>
        <Subtitle>
          {language === 'bg' 
            ? 'Създайте акаунт в Bulgarian Car Marketplace' 
            : 'Create your Bulgarian Car Marketplace account'}
        </Subtitle>

        {error && (
          <Message $type="error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </Message>
        )}

        {success && (
          <Message $type="success">
            <CheckCircle size={18} />
            <span>{success}</span>
          </Message>
        )}

        <Form onSubmit={handleSubmit}>
          <InputBox>
            <Input
              type="text"
              placeholder={language === 'bg' ? 'Пълно име' : 'Full name'}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
            />
            <InputIcon>
              <User size={20} />
            </InputIcon>
          </InputBox>

          <InputBox>
            <Input
              type="email"
              placeholder={language === 'bg' ? 'Имейл адрес' : 'Email address'}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading}
            />
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
          </InputBox>

          <InputBox>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={language === 'bg' ? 'Парола' : 'Password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
            />
            <InputIcon onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </InputIcon>
          </InputBox>

          <InputBox>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={language === 'bg' ? 'Потвърдете паролата' : 'Confirm password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={loading}
            />
            <InputIcon onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </InputIcon>
          </InputBox>

          <TermsCheckbox>
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
              disabled={loading}
            />
            <span>
              {language === 'bg' ? 'Приемам ' : 'I agree to the '}
              <Link to="/terms">{language === 'bg' ? 'условията' : 'terms'}</Link>
              {language === 'bg' ? ' и ' : ' and '}
              <Link to="/privacy">{language === 'bg' ? 'политиката за поверителност' : 'privacy policy'}</Link>
            </span>
          </TermsCheckbox>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader size={20} className="spin" />
                {language === 'bg' ? 'Регистриране...' : 'Registering...'}
              </>
            ) : (
              <>
                {language === 'bg' ? 'Регистрирай се' : 'Register'}
                <ArrowRight size={20} />
              </>
            )}
          </SubmitButton>
        </Form>

        <Divider>
          <span>{language === 'bg' ? 'Или регистрирайте се с' : 'Or register with'}</span>
        </Divider>

        <SocialButtons>
          <SocialButton $provider="google" onClick={handleGoogleRegister} disabled={loading}>
            <Chrome size={16} />
            Google
          </SocialButton>

          <SocialButton $provider="facebook" onClick={handleFacebookRegister} disabled={loading}>
            <Facebook size={16} />
            Facebook
          </SocialButton>

          <SocialButton $provider="apple" onClick={handleAppleRegister} disabled={loading}>
            <Apple size={16} />
            Apple
          </SocialButton>

          <SocialButton $provider="phone" onClick={() => setShowPhoneModal(true)} disabled={loading}>
            <Phone size={16} />
            {language === 'bg' ? 'Телефон' : 'Phone'}
          </SocialButton>

          <GuestButton $provider="anonymous" onClick={handleAnonymousRegister} disabled={loading}>
            <UserCheck size={16} />
            {language === 'bg' ? 'Продължи като гост' : 'Continue as Guest'}
          </GuestButton>
        </SocialButtons>

        <LoginLink>
          {language === 'bg' ? 'Вече имате акаунт?' : 'Already have an account?'}
          <Link to="/login">{language === 'bg' ? 'Влезте' : 'Login'}</Link>
        </LoginLink>

        <SecurityBadge>
          <Shield size={14} />
          {language === 'bg' 
            ? 'Защитена връзка с шифроване' 
            : 'Secure & encrypted connection'}
        </SecurityBadge>
      </GlassWrapper>

      <PhoneAuthModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSuccess={() => {
          setShowPhoneModal(false);
          navigate('/dashboard');
        }}
      />
    </PageContainer>
  );
};

export default RegisterPageGlass;


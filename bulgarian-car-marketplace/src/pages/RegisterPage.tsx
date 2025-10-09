import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import SocialLogin from '../components/SocialLogin';
import { SocialAuthService } from '../firebase/social-auth-service';
import { useAuth } from '../hooks/useAuth';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: ${({ theme }) => theme.spacing.lg};
`;

const RegisterCard = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing['2xl']};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  width: 100%;
  max-width: 400px;
`;

const RegisterTitle = styled.h1`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
    color: ${({ theme }) => theme.colors.text.primary};
`;

const RegisterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
    font-size: ${({ theme }) => theme.typography.fontSize.base};

    &:focus {
      outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.secondary};

  a {
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  background: ${({ theme }) => theme.colors.error.light};
  color: ${({ theme }) => theme.colors.error.main};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
`;

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!executeRecaptcha) {
      setError('reCAPTCHA not ready. Please try again.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // 1. Get reCAPTCHA token
      const recaptchaToken = await executeRecaptcha('register');

      // 2. Verify token with backend
      const verifyFunction = httpsCallable(functions, 'verifyRecaptchaToken');
      await verifyFunction({ token: recaptchaToken, action: 'register' });

      // 3. If verification is successful, proceed with registration
      await register(formData.email, formData.password, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });
      
      navigate('/dashboard');

    } catch (err: any) {
      console.error("Registration or reCAPTCHA error:", err);
      if (err.code === 'functions/unauthenticated') {
        setError('reCAPTCHA validation failed. Please try again.');
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await SocialAuthService.signInWithGoogle();
      console.log('Google registration successful:', result.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await SocialAuthService.signInWithFacebook();
      console.log('Facebook registration successful:', result.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Facebook registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await SocialAuthService.signInWithApple();
      console.log('Apple registration successful:', result.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Apple registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
        <RegisterCard>
        <RegisterTitle>{t('auth.register.title', 'Register')}</RegisterTitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <RegisterForm onSubmit={handleSubmit}>
            <FormGroup>
            <Label htmlFor="firstName">{t('auth.register.firstName', 'First Name')}</Label>
            <Input
                type="text"
              id="firstName"
                name="firstName"
                value={formData.firstName}
              onChange={handleChange}
              required
              disabled={loading}
            />
            </FormGroup>
            <FormGroup>
            <Label htmlFor="lastName">{t('auth.register.lastName', 'Last Name')}</Label>
            <Input
                type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={loading}
            />
            </FormGroup>
            <FormGroup>
            <Label htmlFor="email">{t('auth.register.email', 'Email')}</Label>
            <Input
                type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            </FormGroup>
            <FormGroup>
            <Label htmlFor="password">{t('auth.register.password', 'Password')}</Label>
            <Input
                type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            </FormGroup>
            <FormGroup>
            <Label htmlFor="confirmPassword">{t('auth.register.confirmPassword', 'Confirm Password')}</Label>
            <Input
                type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </FormGroup>
          <Button type="submit" disabled={loading}>
            {loading ? t('auth.register.loading', 'Creating account...') : t('auth.register.submit', 'Register')}
          </Button>
        </RegisterForm>

        <SocialLogin
          onGoogleLogin={handleGoogleLogin}
          onFacebookLogin={handleFacebookLogin}
          onAppleLogin={handleAppleLogin}
          loading={loading}
          disabled={loading}
        />

        <LinkText>
          {t('auth.register.haveAccount', 'Already have an account?')}{' '}
          <Link to="/login">
            {t('auth.register.login', 'Login here')}
          </Link>
        </LinkText>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage;
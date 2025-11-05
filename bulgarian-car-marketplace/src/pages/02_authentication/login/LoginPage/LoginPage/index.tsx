import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../../../../hooks/useTranslation';
import SocialLogin from '../../components/SocialLogin';
import { FirebaseStatus } from '../../components/FirebaseStatusSimple';
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
import { useLogin } from './hooks/useLogin';
import {
  LoginContainer,
  LoginCard,
  LoginHeader,
  LoginTitle,
  LoginSubtitle,
  BulgarianInfo,
  LoginForm,
  FormGroup,
  Label,
  Input,
  ErrorMessage,
  SuccessMessage,
  LoginButton,
  Divider,
  RememberForgotContainer,
  CheckboxContainer,
  ForgotLink,
  SecurityInfo,
  RegisterPrompt
} from './styles';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { state, actions } = useLogin();

  const {
    formData,
    showPassword,
    loading,
    error,
    success,
    validationErrors
  } = state;

  const {
    handleInputChange,
    handleSubmit,
    handleGoogleLogin,
    handleFacebookLogin,
    handleAppleLogin,
    handleSocialLoginError
  } = actions;

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
              onClick={() => actions.setShowPassword(!showPassword)}
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

        <SocialLogin
          onGoogleLogin={handleGoogleLogin}
          onFacebookLogin={handleFacebookLogin}
          onAppleLogin={handleAppleLogin}
          onError={handleSocialLoginError}
          loading={loading}
          disabled={loading}
        />

        <SecurityInfo>
          <Shield size={16} />
          <span>{t('auth.secureConnection', 'Your connection is secure and encrypted')}</span>
        </SecurityInfo>

        <RegisterPrompt>
          <span>{t('auth.noAccount', "Don't have an account?")}</span>
          <Link to="/register">{t('auth.createAccount', 'Create one here')}</Link>
        </RegisterPrompt>
      </LoginCard>
      
      {/* Firebase Status Component for Development */}
      <FirebaseStatus />
    </LoginContainer>
  );
};

export default LoginPage;
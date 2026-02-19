// src/components/auth/LoginRequiredModal.tsx
// Lightweight login gate modal — shown when unauthenticated user clicks Message/Call on CarDetailsPage.
// On successful login, calls onLoginSuccess() so the parent can continue the pending action.

import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase-config';
import { logger } from '../../services/logger-service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginRequiredModalProps {
  isOpen: boolean;
  language: 'bg' | 'en';
  /** Called after the user has successfully authenticated */
  onLoginSuccess: () => void;
  /** Called when the user dismisses the modal without logging in */
  onClose: () => void;
}

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)           scale(1);  }
`;

// ─── Styled Components ────────────────────────────────────────────────────────

const Overlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  ${({ $visible }) =>
    $visible
      ? css`animation: ${fadeIn} 0.2s ease forwards;`
      : css`display: none;`}
`;

const Panel = styled.div`
  position: relative;
  background: var(--surface-primary, #1e1e2e);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem 2rem 1.75rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  animation: ${slideUp} 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  z-index: 9999;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary, #94a3b8);
  font-size: 18px;
  line-height: 1;
  transition: background 0.15s;
  &:hover { background: rgba(255, 255, 255, 0.16); }
`;

const Icon = styled.div`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 0.75rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
  text-align: center;
  margin: 0 0 0.4rem;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary, #94a3b8);
  text-align: center;
  margin: 0 0 1.5rem;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1.5px solid ${({ $hasError }) => ($hasError ? 'var(--error, #f87171)' : 'rgba(255,255,255,0.15)')};
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary, #f1f5f9);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  &::placeholder { color: var(--text-tertiary, #64748b); }
  &:focus { border-color: var(--accent-primary, #ff8f10); }
`;

const ErrorMessage = styled.p`
  font-size: 0.82rem;
  color: var(--error, #f87171);
  margin: -0.25rem 0 0;
  padding-left: 0.25rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #ff8f10, #ff7900);
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  margin-top: 0.25rem;
  &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.75rem 0 0.5rem;
  color: var(--text-tertiary, #64748b);
  font-size: 0.8rem;
  &::before, &::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.1); }
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 0.82rem;
  color: var(--text-secondary, #94a3b8);
  margin-top: 0.75rem;
  flex-wrap: wrap;

  a {
    color: var(--accent-primary, #ff8f10);
    text-decoration: none;
    font-weight: 600;
    &:hover { text-decoration: underline; }
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  isOpen,
  language,
  onLoginSuccess,
  onClose,
}) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Focus email field when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setTimeout(() => emailRef.current?.focus(), 50);
    } else {
      // Reset form when closed
      setEmail('');
      setPassword('');
      setError(null);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) {
        setError(language === 'bg' ? 'Моля, попълнете всички полета.' : 'Please fill in all fields.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // Firebase will update currentUser in AuthProvider.
        // CarDetailsPage useEffect watching currentUser will fire onLoginSuccess.
        onLoginSuccess();
      } catch (err: any) {
        logger.error('LoginRequiredModal: sign-in failed', err);
        const code: string = err?.code ?? '';
        if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
          setError(language === 'bg' ? 'Невалиден имейл или парола.' : 'Invalid email or password.');
        } else if (code === 'auth/invalid-email') {
          setError(language === 'bg' ? 'Невалиден имейл адрес.' : 'Invalid email address.');
        } else if (code === 'auth/too-many-requests') {
          setError(language === 'bg' ? 'Твърде много опити. Опитайте по-късно.' : 'Too many attempts. Try again later.');
        } else {
          setError(language === 'bg' ? 'Грешка при влизане. Опитайте отново.' : 'Login failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [email, password, language, onLoginSuccess]
  );

  if (!isOpen) return null;

  return (
    <Overlay $visible={isOpen} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Panel role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
        <CloseButton onClick={onClose} aria-label="Close" type="button">×</CloseButton>

        <Icon>💬</Icon>
        <Title id="login-modal-title">
          {language === 'bg' ? 'Влезте, за да изпратите съобщение' : 'Sign in to contact the seller'}
        </Title>
        <Subtitle>
          {language === 'bg'
            ? 'Имате нужда от акаунт, за да се свържете с продавача.'
            : 'You need an account to contact the seller.'}
        </Subtitle>

        <Form onSubmit={handleSubmit} noValidate>
          <Input
            ref={emailRef}
            type="email"
            placeholder={language === 'bg' ? 'Имейл' : 'Email'}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            autoComplete="email"
            $hasError={!!error}
            disabled={loading}
          />
          <Input
            type="password"
            placeholder={language === 'bg' ? 'Парола' : 'Password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            autoComplete="current-password"
            $hasError={!!error}
            disabled={loading}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <SubmitButton type="submit" disabled={loading}>
            {loading
              ? (language === 'bg' ? 'Влизане...' : 'Signing in...')
              : (language === 'bg' ? 'Влезте' : 'Sign In')}
          </SubmitButton>
        </Form>

        <Divider>{language === 'bg' ? 'или' : 'or'}</Divider>

        <FooterLinks>
          <Link to="/login" onClick={onClose}>
            {language === 'bg' ? 'Всички опции за вход' : 'All sign-in options'}
          </Link>
          <span>·</span>
          <Link to="/register" onClick={onClose}>
            {language === 'bg' ? 'Регистрация' : 'Register'}
          </Link>
        </FooterLinks>
      </Panel>
    </Overlay>
  );
};

export default LoginRequiredModal;

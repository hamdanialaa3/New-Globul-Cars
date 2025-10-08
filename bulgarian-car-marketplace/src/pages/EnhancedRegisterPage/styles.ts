import styled, { keyframes } from 'styled-components';

// Keyframe animations
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

export const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Container components
export const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('/assets/backgrounds/metal-bg-2.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  padding: ${({ theme }) => theme.spacing.lg};
  position: relative;
  overflow: hidden;
  filter: blur(0.5px);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(102, 126, 234, 0.25);
    backdrop-filter: blur(0.5px);
  }
`;

export const RegisterCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing['3xl']};
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 550px;
  animation: ${fadeIn} 0.8s ease-out;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xl};
    margin: ${({ theme }) => theme.spacing.md};
    max-height: 95vh;
  }
`;

// Header components
export const RegisterHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

export const RegisterTitle = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${slideIn} 0.6s ease-out 0.2s both;
`;

export const RegisterSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  animation: ${slideIn} 0.6s ease-out 0.4s both;
`;

export const BulgarianInfo = styled.div`
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

// Step indicator components
export const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  gap: ${({ theme }) => theme.spacing.md};
`;

export const Step = styled.div<{ active?: boolean; completed?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: all 0.3s ease;

  ${({ active, completed, theme }) => {
    if (completed) {
      return `
        background: ${theme.colors.success.main};
        color: white;
        animation: ${pulse} 0.5s ease-out;
      `;
    }
    if (active) {
      return `
        background: ${theme.colors.primary.main};
        color: white;
        box-shadow: 0 0 0 3px ${theme.colors.primary.main}30;
      `;
    }
    return `
      background: ${theme.colors.grey[300]};
      color: ${theme.colors.text.secondary};
    `;
  }}
`;

// Form components
export const RegisterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
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

export const Label = styled.label`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export const Input = styled.input<{ hasError?: boolean }>`
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

export const Select = styled.select<{ hasError?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  padding-left: ${({ theme }) => theme.spacing['2xl']};
  border: 2px solid ${({ hasError, theme }) =>
    hasError ? theme.colors.error.main : theme.colors.grey[300]
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.grey[100]};
    cursor: not-allowed;
  }
`;

// Message components
export const ErrorMessage = styled.div`
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

export const SuccessMessage = styled.div`
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

// Password strength components
export const PasswordStrengthIndicator = styled.div<{ strength: number }>`
  height: 4px;
  background: ${({ theme }) => theme.colors.grey[200]};
  border-radius: 2px;
  margin-top: ${({ theme }) => theme.spacing.sm};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${({ strength }) => (strength / 4) * 100}%;
    background: ${({ strength, theme }) => {
      if (strength <= 1) return theme.colors.error.main;
      if (strength <= 2) return '#fbbf24';
      if (strength <= 3) return '#3b82f6';
      return theme.colors.success.main;
    }};
    border-radius: 2px;
    transition: all 0.3s ease;
  }
`;

export const PasswordStrengthText = styled.div<{ strength: number }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
  color: ${({ strength, theme }) => {
    if (strength <= 1) return theme.colors.error.main;
    if (strength <= 2) return '#d97706';
    if (strength <= 3) return '#2563eb';
    return theme.colors.success.main;
  }};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

// Checkbox component
export const CheckboxContainer = styled.label`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  user-select: none;
  margin: ${({ theme }) => theme.spacing.lg} 0;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: ${({ theme }) => theme.colors.primary.main};
    cursor: pointer;
    margin-top: 2px;
    flex-shrink: 0;
  }

  span {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.4;

    a {
      color: ${({ theme }) => theme.colors.primary.main};
      text-decoration: none;
      font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

// Button component
export const RegisterButton = styled.button<{ loading?: boolean }>`
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
  margin-top: ${({ theme }) => theme.spacing.lg};

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

// Divider component
export const Divider = styled.div`
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

// Footer components
export const LoginPrompt = styled.div`
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
  }
`;

export const SecurityInfo = styled.div`
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
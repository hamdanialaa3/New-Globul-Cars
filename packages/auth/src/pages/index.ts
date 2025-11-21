// Auth Pages Exports
export { default as LoginPage } from './LoginPage';
export { default as RegisterPage } from './RegisterPage';
export { default as EmailVerificationPage } from './EmailVerificationPage';

// LoginPage exports
export { useLogin } from './LoginPage/hooks/useLogin';
export type { LoginFormData, LoginState, LoginActions, UseLoginReturn } from './LoginPage/types';

// RegisterPage exports
export { useEnhancedRegister } from './RegisterPage/hooks/useEnhancedRegister';
export type { RegisterFormData, RegisterStep, ValidationErrors, RegisterStepNumber } from './RegisterPage/types';

// EmailVerificationPage exports
export { default as EmailVerificationPageComponent } from './EmailVerificationPage';

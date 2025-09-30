export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginState {
  formData: LoginFormData;
  showPassword: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
  validationErrors: Record<string, string>;
}

export interface LoginActions {
  setFormData: React.Dispatch<React.SetStateAction<LoginFormData>>;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
  handleFacebookLogin: () => Promise<void>;
  handleAppleLogin: () => Promise<void>;
  handleSocialLoginError: (error: string) => void;
  validateForm: () => boolean;
}

export interface UseLoginReturn {
  state: LoginState;
  actions: LoginActions;
}
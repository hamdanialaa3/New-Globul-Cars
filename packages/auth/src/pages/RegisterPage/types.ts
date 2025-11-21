// Register Page Types - Moved to @globul-cars/auth package

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  location: string;
  agreeToTerms: boolean;
  subscribeToNewsletter: boolean;
}

export interface RegisterStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  location?: string;
  agreeToTerms?: string;
}

export type RegisterStepNumber = 1 | 2 | 3;


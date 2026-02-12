// Enhanced Form Components - Perfect Typography & Spacing
// مكونات النماذج المحسّنة - طباعة ومسافات مثالية

import styled, { css } from 'styled-components';

// Form Group Container
export const FormGroup = styled.div<{ $marginBottom?: string }>`
  margin-bottom: ${({ $marginBottom = '1.5rem' }) => $marginBottom};
  width: 100%;
`;

// Form Label - Clear and Readable
export const FormLabel = styled.label<{ $required?: boolean }>`
  display: block;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 0.9375rem;      // 15px - Larger for better readability
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
  
  ${({ $required }) => $required && css`
    &::after {
      content: ' *';
      color: ${({ theme }) => theme.colors.error.main};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    }
  `}
`;

// Form Input - Perfect Size for Touch & Desktop
export const FormInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 1rem;           // 16px - Prevents iOS zoom
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background.paper};
  
  padding: 0.875rem 1rem;    // 14px 16px - Comfortable padding
  border: 2px solid ${({ theme, $hasError }) => 
    $hasError ? theme.colors.error.main : theme.colors.grey[300]
  };
  border-radius: 8px;
  transition: all 0.2s ease;
  
  /* Better placeholder visibility */
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.disabled};
    font-size: 0.9375rem;    // 15px - Slightly smaller
    opacity: 0.7;
  }
  
  /* Focus State - Clear Visual Feedback */
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
    background-color: ${({ theme }) => theme.colors.background.default};
  }
  
  /* Hover State */
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.grey[400]};
  }
  
  /* Disabled State */
  &:disabled {
    background-color: ${({ theme }) => theme.colors.grey[100]};
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  /* Error State */
  ${({ $hasError, theme }) => $hasError && css`
    border-color: ${theme.colors.error.main};
    
    &:focus {
      box-shadow: 0 0 0 3px ${theme.colors.error.main}20;
    }
  `}
  
  /* Mobile Optimization */
  @media (max-width: 768px) {
    padding: 0.75rem 0.875rem;  // Slightly smaller on mobile
  }
`;

// Textarea - Same styling as input
export const FormTextarea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 1rem;           // 16px
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background.paper};
  
  padding: 0.875rem 1rem;
  border: 2px solid ${({ theme, $hasError }) => 
    $hasError ? theme.colors.error.main : theme.colors.grey[300]
  };
  border-radius: 8px;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 120px;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.disabled};
    font-size: 0.9375rem;
    opacity: 0.7;
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
    background-color: ${({ theme }) => theme.colors.background.default};
  }
  
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.grey[400]};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.grey[100]};
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  ${({ $hasError, theme }) => $hasError && css`
    border-color: ${theme.colors.error.main};
    
    &:focus {
      box-shadow: 0 0 0 3px ${theme.colors.error.main}20;
    }
  `}
`;

// Select - Styled dropdown
export const FormSelect = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background.paper};
  
  padding: 0.875rem 1rem;
  padding-right: 2.5rem;     // Space for dropdown arrow
  border: 2px solid ${({ theme, $hasError }) => 
    $hasError ? theme.colors.error.main : theme.colors.grey[300]
  };
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  appearance: none;
  
  /* Custom dropdown arrow */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 12px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
    background-color: ${({ theme }) => theme.colors.background.default};
  }
  
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.grey[400]};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.grey[100]};
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  ${({ $hasError, theme }) => $hasError && css`
    border-color: ${theme.colors.error.main};
    
    &:focus {
      box-shadow: 0 0 0 3px ${theme.colors.error.main}20;
    }
  `}
  
  /* Style for options */
  option {
    font-size: 1rem;
    padding: 0.5rem;
  }
`;

// Helper Text - Below inputs
export const FormHelperText = styled.span<{ $error?: boolean; $success?: boolean }>`
  display: block;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 0.8125rem;      // 13px - Readable but secondary
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  margin-top: 0.375rem;
  
  color: ${({ theme, $error, $success }) => {
    if ($error) return theme.colors.error.main;
    if ($success) return theme.colors.success.main;
    return theme.colors.text.secondary;
  }};
`;

// Checkbox/Radio Label - Better spacing
export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 0.9375rem;      // 15px
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  user-select: none;
  
  input[type="checkbox"],
  input[type="radio"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    flex-shrink: 0;
  }
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

// Form Row - Multiple inputs in a row
export const FormRow = styled.div<{ $columns?: number; $gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns = 2 }) => $columns}, 1fr);
  gap: ${({ $gap = '1rem' }) => $gap};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

// Submit Button - Enhanced
export const SubmitButton = styled.button<{ $variant?: 'primary' | 'secondary'; $fullWidth?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 1rem;           // 16px - Comfortable for buttons
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: 0.025em;
  line-height: 1;
  
  padding: 0.875rem 2rem;    // Generous padding for easy clicking
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
  
  ${({ $variant = 'primary', theme }) => {
    if ($variant === 'secondary') {
      return css`
        background-color: ${theme.colors.grey[200]};
        color: ${theme.colors.text.primary};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.grey[300]};
        }
      `;
    }
    
    return css`
      background-color: ${theme.colors.primary.main};
      color: ${theme.colors.primary.contrastText};
      
      &:hover:not(:disabled) {
        background-color: ${theme.colors.primary.dark};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px ${theme.colors.primary.main}40;
      }
    `;
  }}
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.grey[300]};
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;    // Slightly smaller on mobile
  }
`;

// Field Set - Group related inputs
export const FieldSet = styled.fieldset`
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  
  legend {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: 1.125rem;     // 18px
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
    padding: 0 0.5rem;
  }
`;

// Export all components
const FormComponents = {
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormHelperText,
  CheckboxLabel,
  FormRow,
  SubmitButton,
  FieldSet,
};

export default FormComponents;

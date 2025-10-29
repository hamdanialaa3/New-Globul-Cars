// Create Post Form - Styled Components
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import styled from 'styled-components';

export const FormContainer = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 80vh;
  height: auto;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 95vh;
    height: 95vh;
    border-radius: 0;
  }
`;

export const FormHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
`;

export const FormTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #212529;
  margin: 0;
`;

export const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f8f9fa;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
    color: #212529;
  }
`;

export const FormBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;  /* ⚡ Fix: Establish stacking context */
  
  /* ⚡ Fix: Ensure children respect z-index */
  > * {
    position: relative;
  }
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
`;

export const FormFooter = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  flex-shrink: 0;
`;

export const CharacterCount = styled.span<{ $error?: boolean }>`
  font-size: 0.875rem;
  color: ${p => p.$error ? '#dc3545' : '#6c757d'};
  font-weight: ${p => p.$error ? 600 : 400};
`;

export const SubmitButton = styled.button`
  padding: 10px 24px;
  background: linear-gradient(135deg, #FF7900, #FF8F10);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 127, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;


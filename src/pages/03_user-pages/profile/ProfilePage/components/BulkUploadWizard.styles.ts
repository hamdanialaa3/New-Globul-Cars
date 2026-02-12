/**
 * Bulk Upload Wizard - Styled Components
 * Constitution Compliance: Max 300 lines per file
 */

import styled from 'styled-components';

export const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

export const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

export const Subtitle = styled.p`
  color: #6b7280;
  margin: 0.5rem 0 0 0;
`;

export const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  color: #374151;
  
  &:hover {
    background: #f9fafb;
  }
`;

export const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  margin-bottom: 1rem;
`;

export const UploadStep = styled.div`
  text-align: center;
  padding: 3rem 2rem;
`;

export const UploadIcon = styled.div`
  color: #3b82f6;
  margin-bottom: 1.5rem;
`;

export const UploadInstructions = styled.div`
  margin-bottom: 2rem;
  color: #6b7280;
  
  p {
    margin: 0.5rem 0;
  }
`;

export const FileInputWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const FileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

export const UploadButton = styled.button`
  padding: 0.75rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #2563eb;
  }
`;

export const MappingStep = styled.div`
  padding: 1rem 0;
`;

export const StepTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1f2937;
`;

export const MappingGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const MappingRow = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  align-items: center;
`;

export const FieldLabel = styled.label`
  font-weight: 600;
  color: #374151;
`;

export const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
`;

export const Actions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

export const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    background: #f9fafb;
  }
`;

export const ImportButton = styled.button`
  padding: 0.75rem 2rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #059669;
  }
`;

export const ImportingStep = styled.div`
  text-align: center;
  padding: 3rem 2rem;
`;

export const LoaderIcon = styled.div`
  color: #3b82f6;
  margin-bottom: 1.5rem;
  
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const ImportingText = styled.p`
  color: #6b7280;
  font-size: 1.125rem;
`;

export const CompleteStep = styled.div`
  text-align: center;
  padding: 2rem;
`;

export const ResultIcon = styled.div<{ success: boolean }>`
  color: ${props => props.success ? '#10b981' : '#ef4444'};
  margin-bottom: 1.5rem;
`;

export const ResultTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #1f2937;
`;

export const ResultStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
`;

export const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const StatLabel = styled.span`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

export const StatValue = styled.span<{ success?: boolean; error?: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => 
    props.success ? '#10b981' : 
    props.error ? '#ef4444' : 
    '#1f2937'};
`;

export const ErrorList = styled.div`
  text-align: left;
  margin-top: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
`;

export const ErrorListTitle = styled.h4`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
`;

export const ErrorItem = styled.div`
  color: #dc2626;
  font-size: 0.875rem;
  margin: 0.25rem 0;
`;


// src/components/Verification/DocumentUpload.tsx
// Document Upload Component - مكون رفع المستندات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Upload, X, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// ==================== STYLED COMPONENTS ====================

const UploadContainer = styled.div`
  width: 100%;
`;

const UploadBox = styled.div<{ $hasFile: boolean }>`
  border: 2px dashed ${props => props.$hasFile ? '#4caf50' : '#e0e0e0'};
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$hasFile ? '#f1f8e9' : '#fafafa'};
  
  &:hover {
    border-color: ${props => props.$hasFile ? '#4caf50' : '#FF7900'};
    background: ${props => props.$hasFile ? '#f1f8e9' : '#fff5e6'};
  }
`;

const IconWrapper = styled.div<{ $hasFile: boolean }>`
  width: 60px;
  height: 60px;
  margin: 0 auto 16px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${props => props.$hasFile ? '#4caf50' : '#FF7900'};
  color: white;
  transition: all 0.3s ease;
`;

const UploadText = styled.div`
  h4 {
    margin: 0 0 8px 0;
    font-size: 1rem;
    color: #333;
  }
  
  p {
    margin: 0;
    font-size: 0.875rem;
    color: #666;
  }
`;

const FilePreview = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  span {
    font-size: 0.875rem;
    color: #333;
    font-weight: 500;
  }
`;

const RemoveButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #ffebee;
  color: #c62828;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ffcdd2;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const OptionalBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background: #e0e0e0;
  color: #666;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 8px;
`;

// ==================== COMPONENT ====================

interface DocumentUploadProps {
  label: string;
  icon: React.ReactNode;
  onFileSelect: (file: File | null) => void;
  accept?: string;
  optional?: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  icon,
  onFileSelect,
  accept = 'image/*',
  optional = false
}) => {
  const { language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <UploadContainer>
      <UploadBox $hasFile={!!file} onClick={handleClick}>
        <IconWrapper $hasFile={!!file}>
          {file ? <CheckCircle size={32} /> : icon}
        </IconWrapper>
        
        <UploadText>
          <h4>
            {label}
            {optional && (
              <OptionalBadge>
                {language === 'bg' ? 'По избор' : 'Optional'}
              </OptionalBadge>
            )}
          </h4>
          <p>
            {file ? (
              language === 'bg' ? 'Файлът е качен' : 'File uploaded'
            ) : (
              language === 'bg' 
                ? 'Кликнете за избор на файл'
                : 'Click to select file'
            )}
          </p>
        </UploadText>
        
        <HiddenInput
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
        />
      </UploadBox>

      {file && (
        <FilePreview>
          <FileInfo>
            <CheckCircle size={20} color="#4caf50" />
            <span>{file.name}</span>
            <span style={{ color: '#999' }}>({formatFileSize(file.size)})</span>
          </FileInfo>
          <RemoveButton onClick={handleRemove}>
            <X size={16} />
          </RemoveButton>
        </FilePreview>
      )}
    </UploadContainer>
  );
};

export default DocumentUpload;

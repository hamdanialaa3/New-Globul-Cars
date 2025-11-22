// src/features/verification/DocumentUpload.tsx
// Document Upload Component for Verification

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Upload, File, CheckCircle, XCircle, Loader } from 'lucide-react';
import { DocumentType, VerificationDocument } from './types';
import { useLanguage } from '@globul-cars/core/contexts/LanguageContext';

// Props
interface DocumentUploadProps {
  documentType: DocumentType;
  label: { bg: string; en: string };
  description: { bg: string; en: string };
  required: boolean;
  maxSize: number;  // in MB
  acceptedFormats: string[];
  onUploadComplete: (document: VerificationDocument) => void;
  existingDocument?: VerificationDocument;
}

// Styled Components
const Container = styled.div`
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: #f9fafb;
  }
  
  &.uploading {
    border-color: #3b82f6;
    background: #eff6ff;
  }
  
  &.uploaded {
    border-color: #16a34a;
    border-style: solid;
    background: #f0fdf4;
  }
  
  &.error {
    border-color: #dc2626;
    background: #fef2f2;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Label = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RequiredBadge = styled.span`
  background: #dc2626;
  color: white;
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
`;

const Description = styled.p`
  color: #6c757d;
  font-size: 0.85rem;
  margin: 0.5rem 0 1rem 0;
  line-height: 1.5;
`;

const UploadArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  cursor: pointer;
  
  svg {
    width: 48px;
    height: 48px;
    color: #9ca3af;
    margin-bottom: 0.5rem;
  }
`;

const UploadText = styled.p`
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0.5rem 0;
`;

const FileInput = styled.input`
  display: none;
`;

const PreviewContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
`;

const FileIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #3b82f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const FileSize = styled.div`
  color: #6c757d;
  font-size: 0.8rem;
`;

const StatusBadge = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  
  ${p => {
    if (p.status === 'approved') return `
      background: #dcfce7;
      color: #16a34a;
    `;
    if (p.status === 'rejected') return `
      background: #fee2e2;
      color: #dc2626;
    `;
    return `
      background: #fef3c7;
      color: #d97706;
    `;
  }}
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
  
  &:hover {
    background: #fee2e2;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

/**
 * Document Upload Component
 * Handles individual document upload with preview and status
 */
export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  label,
  description,
  required,
  maxSize,
  acceptedFormats,
  onUploadComplete,
  existingDocument
}) => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadedDoc, setUploadedDoc] = useState<VerificationDocument | undefined>(existingDocument);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(language === 'bg' 
        ? `Файлът е твърде голям (макс ${maxSize}MB)`
        : `File too large (max ${maxSize}MB)`);
      return;
    }

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      setError(language === 'bg' 
        ? 'Неподдържан формат на файла'
        : 'Unsupported file format');
      return;
    }

    try {
      setUploading(true);

      // Simulate upload (replace with actual verificationService.uploadDocument)
      // For now, create a local preview
      const mockDocument: VerificationDocument = {
        type: documentType,
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
        status: 'pending',
        fileName: file.name,
        fileSize: file.size
      };

      setUploadedDoc(mockDocument);
      onUploadComplete(mockDocument);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Handle click to open file picker
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Handle remove document
  const handleRemove = () => {
    setUploadedDoc(undefined);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get container class
  const getContainerClass = () => {
    if (error) return 'error';
    if (uploading) return 'uploading';
    if (uploadedDoc) return 'uploaded';
    return '';
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Container className={getContainerClass()}>
      <Header>
        <Label>
          {language === 'bg' ? label.bg : label.en}
          {required && (
            <RequiredBadge>
              {language === 'bg' ? 'Задължително' : 'Required'}
            </RequiredBadge>
          )}
        </Label>
      </Header>

      <Description>
        {language === 'bg' ? description.bg : description.en}
      </Description>

      {/* Upload Area or Preview */}
      {!uploadedDoc ? (
        <>
          <UploadArea onClick={handleClick}>
            {uploading ? (
              <>
                <Loader className="spinner" />
                <UploadText>
                  {language === 'bg' ? 'Качване...' : 'Uploading...'}
                </UploadText>
              </>
            ) : (
              <>
                <Upload />
                <UploadText>
                  {language === 'bg' 
                    ? 'Кликнете за избор на файл'
                    : 'Click to select file'}
                </UploadText>
                <UploadText style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  {language === 'bg' 
                    ? `PDF, JPG, PNG • Макс ${maxSize}MB`
                    : `PDF, JPG, PNG • Max ${maxSize}MB`}
                </UploadText>
              </>
            )}
          </UploadArea>

          <FileInput
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileSelect}
          />

          {error && (
            <ErrorMessage>
              <XCircle />
              {error}
            </ErrorMessage>
          )}
        </>
      ) : (
        <PreviewContainer>
          <FileIcon>
            <File />
          </FileIcon>
          
          <FileInfo>
            <FileName>{uploadedDoc.fileName || 'Document'}</FileName>
            <FileSize>
              {uploadedDoc.fileSize ? formatFileSize(uploadedDoc.fileSize) : 'Unknown size'}
            </FileSize>
          </FileInfo>
          
          <StatusBadge status={uploadedDoc.status}>
            {uploadedDoc.status === 'approved' && <CheckCircle />}
            {uploadedDoc.status === 'rejected' && <XCircle />}
            {uploadedDoc.status === 'pending' && <Loader />}
            {language === 'bg' 
              ? (uploadedDoc.status === 'approved' ? 'Одобрено' : 
                 uploadedDoc.status === 'rejected' ? 'Отхвърлено' : 'В изчакване')
              : (uploadedDoc.status === 'approved' ? 'Approved' : 
                 uploadedDoc.status === 'rejected' ? 'Rejected' : 'Pending')}
          </StatusBadge>
          
          {uploadedDoc.status === 'pending' && (
            <RemoveButton onClick={handleRemove} title="Remove">
              <XCircle />
            </RemoveButton>
          )}
        </PreviewContainer>
      )}
    </Container>
  );
};

export default DocumentUpload;


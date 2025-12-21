/**
 * Verification Document Uploader
 * Phase 3: UI Components
 * 
 * Component for uploading verification documents (business license, VAT, etc.)
 * Uses VerificationWorkflowService for document management.
 * 
 * File: src/components/Profile/VerificationUploader.tsx
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { VerificationWorkflowService } from '../../services/profile/VerificationWorkflowService';
import { useToast } from '../Toast';
import type { ProfileType } from '../../types/user/bulgarian-user.types';

interface VerificationUploaderProps {
  uid: string;
  profileType: ProfileType;
  onUploadComplete?: () => void;
  themeColor?: string;
}

const UploaderContainer = styled.div`
  background: #3e3e3e;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 
    6px 6px 12px rgba(0, 0, 0, 0.4),
    -6px -6px 12px rgba(255, 255, 255, 0.08);
`;

const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
`;

const UploadArea = styled.div<{ $isDragging?: boolean; $themeColor?: string }>`
  border: 2px dashed ${props => props.$isDragging ? props.$themeColor : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$isDragging ? `${props.$themeColor}10` : 'transparent'};

  &:hover {
    border-color: ${props => props.$themeColor || '#16a34a'};
    background: ${props => props.$themeColor || '#16a34a'}10;
  }
`;

const UploadIcon = styled.div<{ $themeColor?: string }>`
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: ${props => props.$themeColor || '#16a34a'}20;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$themeColor || '#16a34a'};
`;

const UploadText = styled.p`
  font-size: 0.938rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 8px 0;
`;

const UploadHint = styled.p`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
`;

const DocumentList = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DocumentItem = styled.div<{ $status?: 'pending' | 'uploading' | 'uploaded' }>`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  ${props => props.$status === 'uploaded' && `
    border-left: 3px solid #16a34a;
  `}
`;

const DocumentIcon = styled.div<{ $color?: string }>`
  width: 40px;
  height: 40px;
  background: ${props => props.$color || '#4a4a4a'}20;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color || '#ffffff'};
`;

const DocumentInfo = styled.div`
  flex: 1;
`;

const DocumentName = styled.div`
  font-size: 0.938rem;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 4px;
`;

const DocumentSize = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
`;

const DocumentAction = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`;

const SubmitButton = styled.button<{ $themeColor?: string }>`
  width: 100%;
  background: linear-gradient(135deg, ${props => props.$themeColor || '#16a34a'} 0%, ${props => props.$themeColor || '#15803d'} 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      5px 5px 10px rgba(0, 0, 0, 0.4),
      -5px -5px 10px rgba(255, 255, 255, 0.08);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const VerificationUploader: React.FC<VerificationUploaderProps> = ({
  uid,
  profileType,
  onUploadComplete,
  themeColor = '#16a34a'
}) => {
  const toast = useToast();
  const [documents, setDocuments] = useState<Array<{ type: string; file: File; url?: string }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValid = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValid) {
        toast.error(`${file.name} غير مدعوم. الرجاء رفع PDF أو صورة`);
      }
      return isValid;
    });

    const newDocuments = validFiles.map(file => ({
      type: 'business_license',
      file
    }));

    setDocuments(prev => [...prev, ...newDocuments]);
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (documents.length === 0) {
      toast.error('الرجاء رفع مستند واحد على الأقل');
      return;
    }

    setUploading(true);
    try {
      const uploadedDocs: Array<{ type: any; url: string; fileName: string }> = [];

      for (const doc of documents) {
        const url = await VerificationWorkflowService.uploadDocument(uid, doc.file, doc.type as any);
        uploadedDocs.push({
          type: doc.type,
          url,
          fileName: doc.file.name
        });
      }

      await VerificationWorkflowService.submitVerification(uid, profileType, uploadedDocs);

      toast.success('تم إرسال طلب التحقق بنجاح');
      setDocuments([]);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      toast.error('فشل رفع المستندات');
    } finally {
      setUploading(false);
    }
  };

  return (
    <UploaderContainer>
      <Title>رفع مستندات التحقق</Title>

      <UploadArea
        $isDragging={isDragging}
        $themeColor={themeColor}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <UploadIcon $themeColor={themeColor}>
          <Upload size={32} />
        </UploadIcon>
        <UploadText>اسحب الملفات هنا أو انقر للاختيار</UploadText>
        <UploadHint>PDF أو صور (حتى 10 MB)</UploadHint>
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </UploadArea>

      {documents.length > 0 && (
        <>
          <DocumentList>
            {documents.map((doc, index) => (
              <DocumentItem key={index} $status={doc.url ? 'uploaded' : 'pending'}>
                <DocumentIcon $color={themeColor}>
                  <File size={20} />
                </DocumentIcon>
                <DocumentInfo>
                  <DocumentName>{doc.file.name}</DocumentName>
                  <DocumentSize>{(doc.file.size / 1024).toFixed(0)} KB</DocumentSize>
                </DocumentInfo>
                {doc.url ? (
                  <DocumentIcon $color="#16a34a">
                    <Check size={20} />
                  </DocumentIcon>
                ) : (
                  <DocumentAction onClick={() => handleRemoveDocument(index)}>
                    <X size={20} />
                  </DocumentAction>
                )}
              </DocumentItem>
            ))}
          </DocumentList>

          <SubmitButton
            $themeColor={themeColor}
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? 'جاري الرفع...' : `إرسال ${documents.length} مستند للتحقق`}
          </SubmitButton>
        </>
      )}
    </UploaderContainer>
  );
};

export default VerificationUploader;


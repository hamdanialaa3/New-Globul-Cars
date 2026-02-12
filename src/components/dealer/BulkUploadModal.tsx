/**
 * Bulk Upload Modal - Part 1 (UI Component)
 * Allows dealers to upload multiple listings via CSV/Excel
 * Location: Bulgaria
 * 
 * File: src/components/dealer/BulkUploadModal.tsx
 * Created: February 8, 2026
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { csvParserService, type ParseResult } from '../../services/dealer/csv-parser.service';
import { bulkUploadService } from '../../services/dealer/bulk-upload.service';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import { logger } from '@/services/logger-service';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete
}) => {
  const { t, language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      toast.error(language === 'bg' ? 'Моля, качете CSV или Excel файл' : 'Please upload a CSV or Excel file');
      return;
    }

    setFile(selectedFile);
    setParseResult(null);
    setUploadComplete(false);

    try {
      let result: ParseResult;
      if (fileExtension === 'csv') {
        result = await csvParserService.parseCSV(selectedFile);
      } else {
        result = await csvParserService.parseExcel(selectedFile);
      }

      setParseResult(result);
    } catch (error) {
      logger.error('File parsing error:', error);
      toast.error(language === 'bg' ? 'Неуспешно обработване на файла. Проверете формата и опитайте отново.' : 'Failed to parse file. Please check the format and try again.');
    }
  };

  const handleUpload = async () => {
    if (!parseResult || parseResult.data.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      await bulkUploadService.uploadCars(
        parseResult.data,
        (progress) => setUploadProgress(progress)
      );

      setUploadComplete(true);
      setTimeout(() => {
        onUploadComplete();
        handleClose();
      }, 2000);
    } catch (error) {
      logger.error('Upload error:', error);
      toast.error(language === 'bg' ? 'Качването не бе успешно. Моля, опитайте отново.' : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParseResult(null);
    setUploadProgress(0);
    setUploadComplete(false);
    onClose();
  };

  const downloadSample = () => {
    const csv = csvParserService.generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-bulk-upload.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>Bulk Upload Listings</Title>
          <CloseButton onClick={handleClose}>
            <X size={24} />
          </CloseButton>
        </Header>

        <Content>
          {!file && (
            <UploadSection>
              <UploadIcon>
                <Upload size={48} />
              </UploadIcon>
              <Instructions>
                Upload a CSV or Excel file with your car listings (max 50 cars per upload)
              </Instructions>
              <FileInput
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                id="bulk-upload-input"
              />
              <UploadButton as="label" htmlFor="bulk-upload-input">
                Select File
              </UploadButton>
              <SampleLink onClick={downloadSample}>
                <Download size={16} />
                Download Sample CSV
              </SampleLink>
            </UploadSection>
          )}

          {file && parseResult && (
            <ResultsSection>
              <FileName>
                <FileText size={20} />
                {file.name}
              </FileName>

              <Stats>
                <StatItem>
                  <StatLabel>Total Rows:</StatLabel>
                  <StatValue>{parseResult.totalRows}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Valid:</StatLabel>
                  <StatValue success>{parseResult.validRows}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Errors:</StatLabel>
                  <StatValue error>{parseResult.errors.length}</StatValue>
                </StatItem>
              </Stats>

              {parseResult.errors.length > 0 && (
                <ErrorsSection>
                  <ErrorsHeader>
                    <AlertCircle size={20} />
                    Validation Errors
                  </ErrorsHeader>
                  <ErrorsList>
                    {parseResult.errors.slice(0, 10).map((error, index) => (
                      <ErrorItem key={index}>
                        Row {error.row}: {error.field} - {error.message}
                      </ErrorItem>
                    ))}
                    {parseResult.errors.length > 10 && (
                      <ErrorItem>...and {parseResult.errors.length - 10} more errors</ErrorItem>
                    )}
                  </ErrorsList>
                </ErrorsSection>
              )}

              {uploading && (
                <ProgressSection>
                  <ProgressBar>
                    <ProgressFill progress={uploadProgress} />
                  </ProgressBar>
                  <ProgressText>{Math.round(uploadProgress)}% uploaded</ProgressText>
                </ProgressSection>
              )}

              {uploadComplete && (
                <SuccessMessage>
                  <CheckCircle size={24} />
                  Upload completed successfully!
                </SuccessMessage>
              )}

              <Actions>
                <CancelButton onClick={handleClose} disabled={uploading}>
                  Cancel
                </CancelButton>
                <UploadButton
                  onClick={handleUpload}
                  disabled={parseResult.validRows === 0 || uploading || uploadComplete}
                >
                  {uploading ? 'Uploading...' : `Upload ${parseResult.validRows} Cars`}
                </UploadButton>
              </Actions>
            </ResultsSection>
          )}
        </Content>
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  &:hover {
    opacity: 0.7;
  }
`;

const Content = styled.div`
  padding: 24px;
  overflow-y: auto;
`;

const UploadSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const UploadIcon = styled.div`
  color: #666;
`;

const Instructions = styled.p`
  text-align: center;
  color: #666;
  margin: 0;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  &:hover:not(:disabled) {
    background: #0052a3;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SampleLink = styled.button`
  background: none;
  border: none;
  color: #0066cc;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    text-decoration: underline;
  }
`;

const ResultsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FileName = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const StatValue = styled.div<{ success?: boolean; error?: boolean }>`
  font-size: 24px;
  font-weight: 600;
  color: ${props => (props.success ? '#28a745' : props.error ? '#dc3545' : '#333')};
`;

const ErrorsSection = styled.div`
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 16px;
`;

const ErrorsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #856404;
  margin-bottom: 12px;
`;

const ErrorsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
`;

const ErrorItem = styled.div`
  font-size: 14px;
  color: #856404;
`;

const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  width: ${props => props.progress}%;
  height: 100%;
  background: #0066cc;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  text-align: center;
  font-size: 14px;
  color: #666;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: #d4edda;
  border: 1px solid #28a745;
  border-radius: 8px;
  color: #155724;
  font-weight: 500;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  background: white;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  &:hover:not(:disabled) {
    background: #f5f5f5;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { X, Upload, FileText, AlertCircle, CheckCircle, Download, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { csvParserService, type ParseResult } from '../../services/dealer/csv-parser.service';
import { bulkUploadService } from '../../services/dealer/bulk-upload.service';
import { zipProcessorService } from '../../services/dealer/zip-processor.service';
import { cloudSyncService } from '../../services/dealer/cloud-sync.service';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
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
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'csv' | 'zip' | 'smart' | 'cloud'>('csv');
  const [file, setFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [smartImages, setSmartImages] = useState<FileList | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  // Cloud sync form state
  const [cloudProvider, setCloudProvider] = useState<'google_drive' | 'dropbox'>('google_drive');
  const [cloudFolderUrl, setCloudFolderUrl] = useState('');
  const [cloudAutoProcess, setCloudAutoProcess] = useState(true);

  if (!isOpen) return null;

  const modeTitle = useMemo(() => {
    if (mode === 'zip') return 'ZIP + CSV + Images';
    if (mode === 'smart') return 'Smart Image Upload';
    if (mode === 'cloud') return 'Cloud Sync';
    return 'CSV / Excel Upload';
  }, [mode]);

  const handleDataFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleZipSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    setZipFile(selected);
    if (selected && !selected.name.toLowerCase().endsWith('.zip')) {
      toast.error(language === 'bg' ? 'Качете ZIP файл' : 'Please upload a ZIP file');
      setZipFile(null);
    }
  };

  const handleSmartImagesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSmartImages(event.target.files || null);
  };

  const handleUpload = async () => {
    const hasRows = parseResult && parseResult.data.length > 0;
    if ((mode === 'csv' || mode === 'zip') && !hasRows) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      if (mode === 'csv') {
        await bulkUploadService.uploadCars(
          parseResult!.data,
          (progress) => setUploadProgress(progress),
          'csv'
        );
      }

      if (mode === 'zip') {
        if (!currentUser?.uid) throw new Error('Authentication required');
        if (zipFile) {
          const job = await bulkUploadService.createUploadJob(currentUser.uid, parseResult?.data.length ?? 0, 'zip');
          await zipProcessorService.stageZipForBackgroundProcessing(
            zipFile,
            currentUser.uid,
            job.id,
            (pct) => setUploadProgress(pct * 0.5)
          );
          await bulkUploadService.uploadCars(
            parseResult?.data ?? [],
            (p) => setUploadProgress(50 + p * 0.5),
            'zip',
            job.id
          );
        } else {
          await bulkUploadService.uploadCars(
            parseResult!.data,
            (progress) => setUploadProgress(progress),
            'zip'
          );
        }
      }

      if (mode === 'smart') {
        if (!currentUser?.uid) {
          throw new Error('Authentication required for smart upload');
        }
        const count = smartImages?.length || 0;
        const job = await bulkUploadService.createUploadJob(
          currentUser.uid,
          count,
          'smart_images'
        );
        navigate(`/dealer/bulk-review/${job.id}`);
      }

      if (mode === 'cloud') {
        if (!currentUser?.uid) {
          throw new Error('Authentication required for cloud sync');
        }
        if (!cloudFolderUrl.trim()) {
          toast.error(language === 'bg' ? 'Въведете URL на папката' : 'Please enter a folder URL');
          setUploading(false);
          return;
        }
        // Extract folder ID from URL (Google Drive share links)
        const folderIdMatch = cloudFolderUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
        const folderId = folderIdMatch ? folderIdMatch[1] : cloudFolderUrl.trim();

        await cloudSyncService.saveSyncConfig(currentUser.uid, {
          provider: cloudProvider,
          folderId,
          folderName: folderId,
          autoProcessing: cloudAutoProcess,
          syncFrequency: 'hourly',
          fileFilter: ['image/jpeg', 'image/png', 'image/webp'],
        });

        const job = await bulkUploadService.createUploadJob(
          currentUser.uid,
          0,
          'cloud_sync'
        );
        toast.success(language === 'bg' ? 'Облачната синхронизация е настроена!' : 'Cloud sync configured!');
        navigate(`/dealer/bulk-review/${job.id}`);
      }

      setUploadComplete(true);
      onUploadComplete();

      if (mode === 'csv' || mode === 'zip') {
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (error) {
      logger.error('Upload error:', error);
      toast.error(language === 'bg' ? 'Качването не бе успешно. Моля, опитайте отново.' : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setMode('csv');
    setFile(null);
    setZipFile(null);
    setSmartImages(null);
    setParseResult(null);
    setUploadProgress(0);
    setUploadComplete(false);
    setCloudFolderUrl('');
    setCloudAutoProcess(true);
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
          <Title>{modeTitle}</Title>
          <CloseButton onClick={handleClose}>
            <X size={24} />
          </CloseButton>
        </Header>

        <Content>
          <ModeTabs>
            <ModeTabButton $active={mode === 'csv'} onClick={() => setMode('csv')}>CSV</ModeTabButton>
            <ModeTabButton $active={mode === 'zip'} onClick={() => setMode('zip')}>ZIP</ModeTabButton>
            <ModeTabButton $active={mode === 'smart'} onClick={() => setMode('smart')}>Smart</ModeTabButton>
            <ModeTabButton $active={mode === 'cloud'} onClick={() => setMode('cloud')}>Cloud</ModeTabButton>
          </ModeTabs>

          {mode === 'cloud' && (
            <UploadSection>
              <UploadIcon>
                <Cloud size={48} />
              </UploadIcon>
              <Instructions>
                {language === 'bg'
                  ? 'Свържете Google Drive или Dropbox за автоматична синхронизация на снимки'
                  : 'Connect Google Drive or Dropbox for automatic media sync'}
              </Instructions>

              <CloudForm>
                <CloudLabel>
                  {language === 'bg' ? 'Доставчик' : 'Provider'}
                </CloudLabel>
                <CloudSelect
                  value={cloudProvider}
                  onChange={e => setCloudProvider(e.target.value as 'google_drive' | 'dropbox')}
                >
                  <option value="google_drive">Google Drive</option>
                  <option value="dropbox">Dropbox</option>
                </CloudSelect>

                <CloudLabel>
                  {language === 'bg' ? 'URL на споделена папка' : 'Shared folder URL or ID'}
                </CloudLabel>
                <CloudInput
                  type="text"
                  placeholder={cloudProvider === 'google_drive'
                    ? 'https://drive.google.com/drive/folders/...'
                    : 'https://www.dropbox.com/sh/...'}
                  value={cloudFolderUrl}
                  onChange={e => setCloudFolderUrl(e.target.value)}
                />

                <CloudCheckboxRow>
                  <input
                    type="checkbox"
                    id="auto-process"
                    checked={cloudAutoProcess}
                    onChange={e => setCloudAutoProcess(e.target.checked)}
                  />
                  <label htmlFor="auto-process">
                    {language === 'bg' ? 'Автоматична обработка при нови файлове' : 'Auto-process when new files arrive'}
                  </label>
                </CloudCheckboxRow>
              </CloudForm>

              <Actions>
                <UploadButton
                  onClick={handleUpload}
                  disabled={uploading || uploadComplete || !cloudFolderUrl.trim()}
                >
                  {uploading
                    ? (language === 'bg' ? 'Опазване...' : 'Saving...')
                    : (language === 'bg' ? 'Свържи и синхронизирай' : 'Connect & Sync')}
                </UploadButton>
              </Actions>
            </UploadSection>
          )}

          {(mode === 'csv' || mode === 'zip' || mode === 'smart') && !file && mode !== 'smart' && (
            <UploadSection>
              <UploadIcon>
                <Upload size={48} />
              </UploadIcon>
              <Instructions>
                {mode === 'zip'
                  ? 'Upload CSV/Excel first, then optional ZIP archive for staged background processing'
                  : 'Upload a CSV or Excel file with your car listings'}
              </Instructions>
              <FileInput
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleDataFileSelect}
                id="bulk-upload-input"
              />
              <UploadButton as="label" htmlFor="bulk-upload-input">
                Select File
              </UploadButton>
              <SampleLink onClick={downloadSample}>
                <Download size={16} />
                Download Sample CSV
              </SampleLink>

              {mode === 'zip' && (
                <>
                  <FileInput
                    type="file"
                    accept=".zip"
                    onChange={handleZipSelect}
                    id="zip-upload-input"
                  />
                  <UploadButton as="label" htmlFor="zip-upload-input">
                    {zipFile ? `ZIP: ${zipFile.name}` : 'Attach ZIP (Optional)'}
                  </UploadButton>
                </>
              )}
            </UploadSection>
          )}

          {mode === 'smart' && (
            <UploadSection>
              <UploadIcon>
                <Upload size={48} />
              </UploadIcon>
              <Instructions>
                {language === 'bg'
                  ? 'Качете много снимки. AI ще ги групира автоматично по автомобили.'
                  : 'Upload many images. AI will auto-group them into car clusters.'}
              </Instructions>
              <FileInput
                type="file"
                accept="image/*"
                multiple
                onChange={handleSmartImagesSelect}
                id="smart-images-input"
              />
              <UploadButton as="label" htmlFor="smart-images-input">
                {smartImages?.length ? `${smartImages.length} images selected` : 'Select Images'}
              </UploadButton>

              <Actions>
                <UploadButton
                  onClick={handleUpload}
                  disabled={!smartImages?.length || uploading || uploadComplete}
                >
                  {uploading ? 'Queuing...' : 'Queue Smart Processing'}
                </UploadButton>
              </Actions>
            </UploadSection>
          )}

          {(mode === 'csv' || mode === 'zip') && file && parseResult && (
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
                  {uploading
                    ? 'Uploading...'
                    : mode === 'zip'
                      ? `Upload ${parseResult.validRows} Cars + ZIP`
                      : `Upload ${parseResult.validRows} Cars`}
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

const ModeTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
`;

const ModeTabButton = styled.button<{ $active: boolean }>`
  border: 1px solid ${props => (props.$active ? '#2563eb' : '#d1d5db')};
  background: ${props => (props.$active ? '#dbeafe' : '#ffffff')};
  color: #111827;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
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

const CloudForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 440px;
  text-align: left;
`;

const CloudLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #374151;
`;

const CloudSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  color: #111827;
`;

const CloudInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #111827;
  background: #fff;

  &::placeholder {
    color: #9ca3af;
  }
`;

const CloudCheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
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

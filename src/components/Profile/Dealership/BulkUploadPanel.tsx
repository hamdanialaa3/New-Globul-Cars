import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { Upload, FileSpreadsheet, Play, CheckCircle, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { useLanguage } from '../../../contexts/LanguageContext';
import { toast } from 'react-toastify';

// Make sure to add this component route in `AppRoutes.tsx` mapping to `/dealer/bulk-upload`
// OR mount it as a tab in DeveloperPro dashboard

const PanelContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const HeaderBox = styled.div`
  background: linear-gradient(135deg, rgba(255, 121, 0, 0.1) 0%, rgba(255, 143, 16, 0.05) 100%);
  border-left: 4px solid #FF7900;
  padding: 16px 24px;
  border-radius: 8px;
  
  h2 {
    margin: 0 0 8px 0;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.95rem;
  }
`;

const UploadZone = styled.div<{ $isDragging: boolean }>`
  border: 2px dashed ${props => props.$isDragging ? '#FF7900' : 'rgba(255,255,255,0.2)'};
  background: ${props => props.$isDragging ? 'rgba(255, 121, 0, 0.05)' : 'rgba(255,255,255,0.02)'};
  border-radius: 12px;
  padding: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255,255,255,0.04);
  }

  p {
    margin-top: 16px;
    color: #fff;
    font-weight: 500;
  }
  
  small {
    color: rgba(255,255,255,0.5);
    margin-top: 8px;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const StatusBoard = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background: #FF7900;
  transition: width 0.4s ease;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  span:first-child {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
  }
  
  span:last-child {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid ${props => props.$variant === 'secondary' ? 'rgba(255,255,255,0.2)' : 'transparent'};
  background: ${props => {
        if (props.$variant === 'primary') return '#FF7900';
        if (props.$variant === 'danger') return '#EF4444';
        return 'transparent';
    }};
  color: ${props => props.$variant === 'secondary' ? '#fff' : '#fff'};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Helper interfaces
interface JobStatus {
    jobId: string;
    status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    totalRows: number;
    successCount: number;
    failCount: number;
    errorsUrl?: string;
}

export const BulkUploadPanel: React.FC = () => {
    const { language } = useLanguage();
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [jobState, setJobState] = useState<JobStatus | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const functions = getFunctions();
    const pollingRef = useRef<number | null>(null);

    const startPolling = (jobId: string) => {
        const getStatus = httpsCallable(functions, 'getBulkUploadStatus');

        pollingRef.current = window.setInterval(async () => {
            try {
                const result = await getStatus({ jobId });
                const data = result.data as JobStatus;
                setJobState(data);

                if (data.status === 'completed' || data.status === 'failed') {
                    if (pollingRef.current) clearInterval(pollingRef.current);
                    if (data.status === 'completed') toast.success("Upload finished processing!");
                    if (data.status === 'failed') toast.error("Processing failed.");
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 3000);
    };

    React.useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
                toast.error("Please upload a valid CSV or XLSX file");
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
        }
    }, []);

    const uploadAndStartJob = async () => {
        if (!file) return;
        setIsUploading(true);

        try {
            // 1. Init Job
            const initBulkUpload = httpsCallable(functions, 'initBulkUpload');
            // For simplicity in UX, row count is estimated
            const initResult = await initBulkUpload({ filename: file.name, rowCount: 100 });
            const { jobId, uploadUrl } = initResult.data as { jobId: string, uploadUrl: string };

            // 2. Upload to Signed URL
            await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": "text/csv" } });

            // 3. Start Processor
            const startProcessor = httpsCallable(functions, 'startBulkProcessor');
            await startProcessor({ jobId });

            // 4. Begin Tracking Progress
            setJobState({ jobId, status: 'queued', progress: 5, totalRows: 0, successCount: 0, failCount: 0 });
            startPolling(jobId);
        } catch (err) {
            console.error(err);
            toast.error(language === 'bg' ? 'Възникна грешка при качването' : 'Error starting upload process');
            setIsUploading(false);
        }
    };

    const translatedTexts = {
        title: language === 'bg' ? 'Масово качване (Bulk Upload)' : 'Bulk Inventory Upload',
        subtitle: language === 'bg' ? 'Качете вашите автомобили чрез CSV/XML файл директно от вашата DMS система.' : 'Upload your vehicles via CSV/XML file directly from your DMS system.',
        dragDrop: language === 'bg' ? 'Плъзнете и пуснете файл тук или кликнете за избор' : 'Drag & drop a file here or click to browse',
        startUpload: language === 'bg' ? 'Започни качване' : 'Start Upload',
        processing: language === 'bg' ? 'Обработка...' : 'Processing...',
    };

    return (
        <PanelContainer>
            <HeaderBox>
                <h2><FileSpreadsheet size={24} /> {translatedTexts.title}</h2>
                <p>{translatedTexts.subtitle}</p>
            </HeaderBox>

            {/* DRAG AND DROP ZONE */}
            {!jobState && !isUploading && (
                <UploadZone
                    $isDragging={isDragging}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload size={48} color={isDragging ? '#FF7900' : 'rgba(255,255,255,0.4)'} />
                    <p>{file ? file.name : translatedTexts.dragDrop}</p>
                    <small>Supported formats: .CSV, .XLSX (max 500 rows)</small>
                    <FileInput type="file" accept=".csv,.xlsx" ref={fileInputRef} onChange={handleFileSelect} />
                </UploadZone>
            )}

            {file && !jobState && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                    <Button $variant="secondary" onClick={() => setFile(null)} disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button $variant="primary" onClick={uploadAndStartJob} disabled={isUploading}>
                        {isUploading ? <RefreshCw className="spin" size={18} /> : <Play size={18} />}
                        {isUploading ? translatedTexts.processing : translatedTexts.startUpload}
                    </Button>
                </div>
            )}

            {/* Live Polling Status */}
            {jobState && (
                <StatusBoard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, color: '#fff' }}>
                            Upload Status: <span style={{ textTransform: 'uppercase', color: '#FF7900' }}>{jobState.status}</span>
                        </h3>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{jobState.progress}%</span>
                    </div>

                    <ProgressBarContainer>
                        <ProgressBar $progress={jobState.progress} />
                    </ProgressBarContainer>

                    <StatsGrid>
                        <StatCard>
                            <span>Processed</span>
                            <span>{jobState.successCount + jobState.failCount}</span>
                        </StatCard>
                        <StatCard>
                            <span>Inserted</span>
                            <span style={{ color: '#22C55E' }}>{jobState.successCount}</span>
                        </StatCard>
                        <StatCard>
                            <span>Failed</span>
                            <span style={{ color: '#EF4444' }}>{jobState.failCount}</span>
                        </StatCard>
                    </StatsGrid>

                    {jobState.errorsUrl && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '16px', borderRadius: '8px' }}>
                            <p style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '0.9rem' }}>
                                <AlertCircle size={16} color="#EF4444" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                Some rows failed validation. You can download the error log to correct them.
                            </p>
                            <a href={jobState.errorsUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                <Button $variant="danger">
                                    <Download size={16} /> Download Errors CSV
                                </Button>
                            </a>
                        </div>
                    )}

                    {(jobState.status === 'completed' || jobState.status === 'failed') && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <Button $variant="primary" onClick={() => { setJobState(null); setFile(null); setIsUploading(false); }}>
                                Upload Another File
                            </Button>
                        </div>
                    )}
                </StatusBoard>
            )}

        </PanelContainer>
    );
};

/**
 * Bulk Upload Wizard Component
 * Wizard for uploading multiple cars via CSV import
 * 
 * Constitution Compliance: Max 300 lines per file
 * Route: Used in Profile My-Ads tab
 */

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useProfileType } from '@/contexts/ProfileTypeContext';
import { importCarsFromCSV, validateCSVFile, type CSVColumnMapping, type CSVImportResult } from '@/services/company/csv-import-service';
import { logger } from '@/services/logger-service';
import { XCircle } from 'lucide-react';
import * as S from './BulkUploadWizard.styles';
import {
  UploadStepComponent,
  MappingStepComponent,
  ImportingStepComponent,
  CompleteStepComponent
} from './BulkUploadWizard.steps';

interface BulkUploadWizardProps {
  onComplete?: (result: CSVImportResult) => void;
  onCancel?: () => void;
}

type WizardStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

const BulkUploadWizard: React.FC<BulkUploadWizardProps> = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const { permissions } = useProfileType();
  
  const [step, setStep] = useState<WizardStep>('upload');
  const [csvContent, setCsvContent] = useState<string>('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<CSVColumnMapping>({
    make: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    city: '',
    region: '',
    description: ''
  });
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const validation = validateCSVFile(content);
      
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        return;
      }

      // Parse headers
      const lines = content.split(/\r?\n/);
      const headerLine = lines[0];
      const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
      
      setCsvContent(content);
      setCsvHeaders(headers);
      setError(null);
      setStep('mapping');
    };

    reader.readAsText(file);
  }, []);

  const handleMappingChange = (field: keyof CSVColumnMapping, value: string) => {
    setMapping(prev => ({ ...prev, [field]: value }));
  };

  const handleStartImport = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    // Validate required mappings
    const required: (keyof CSVColumnMapping)[] = ['make', 'model', 'year', 'price'];
    const missing = required.filter(field => !mapping[field]);
    
    if (missing.length > 0) {
      setError(`Missing required mappings: ${missing.join(', ')}`);
      return;
    }

    setStep('importing');
    setError(null);

    try {
      const maxRows = permissions.bulkUploadLimit || 5;
      const result = await importCarsFromCSV(csvContent, {
        userId: user.uid,
        mapping,
        maxRows,
        skipFirstRow: true
      });

      setImportResult(result);
      setStep('complete');

      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      logger.error('Bulk upload failed', err as Error);
      setError(err instanceof Error ? err.message : 'Import failed');
      setStep('mapping');
    }
  };

  const maxRows = permissions.bulkUploadLimit || 5;

  return (
    <S.Container>
      <S.Header>
        <div>
          <S.Title>Bulk Upload Cars</S.Title>
          <S.Subtitle>Upload up to {maxRows} cars via CSV file</S.Subtitle>
        </div>
        {onCancel && (
          <S.CancelButton onClick={onCancel}>Cancel</S.CancelButton>
        )}
      </S.Header>

      {error && (
        <S.ErrorBox>
          <XCircle size={20} />
          <span>{error}</span>
        </S.ErrorBox>
      )}

      {step === 'upload' && (
        <UploadStepComponent
          maxRows={maxRows}
          onFileSelect={handleFileUpload}
        />
      )}

      {step === 'mapping' && (
        <MappingStepComponent
          csvHeaders={csvHeaders}
          mapping={mapping}
          onMappingChange={handleMappingChange}
          onBack={() => setStep('upload')}
          onStartImport={handleStartImport}
        />
      )}

      {step === 'importing' && (
        <ImportingStepComponent />
      )}

      {step === 'complete' && importResult && (
        <CompleteStepComponent result={importResult} />
      )}
    </S.Container>
  );
};

export default BulkUploadWizard;

/**
 * Bulk Upload Wizard - Step Components
 * Constitution Compliance: Max 300 lines per file
 */

import React from 'react';
import { Upload, Loader, CheckCircle, XCircle } from 'lucide-react';
import type { CSVColumnMapping, CSVImportResult } from '@/services/company/csv-import-service';
import * as S from './BulkUploadWizard.styles';

interface UploadStepProps {
  maxRows: number;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadStepComponent: React.FC<UploadStepProps> = ({ maxRows, onFileSelect }) => {
  return (
    <S.UploadStep>
      <S.UploadIcon>
        <Upload size={48} />
      </S.UploadIcon>
      <S.UploadInstructions>
        <p>Upload a CSV file with your car listings</p>
        <p>Required columns: Make, Model, Year, Price</p>
        <p>Maximum {maxRows} rows allowed</p>
      </S.UploadInstructions>
      <S.FileInputWrapper>
        <S.FileInput
          type="file"
          accept=".csv"
          onChange={onFileSelect}
        />
        <S.UploadButton>Choose CSV File</S.UploadButton>
      </S.FileInputWrapper>
    </S.UploadStep>
  );
};

interface MappingStepProps {
  csvHeaders: string[];
  mapping: CSVColumnMapping;
  onMappingChange: (field: keyof CSVColumnMapping, value: string) => void;
  onBack: () => void;
  onStartImport: () => void;
}

export const MappingStepComponent: React.FC<MappingStepProps> = ({
  csvHeaders,
  mapping,
  onMappingChange,
  onBack,
  onStartImport
}) => {
  const requiredFields: Array<{ key: keyof CSVColumnMapping; label: string }> = [
    { key: 'make', label: 'Make *' },
    { key: 'model', label: 'Model *' },
    { key: 'year', label: 'Year *' },
    { key: 'price', label: 'Price *' }
  ];

  const optionalFields: Array<{ key: keyof CSVColumnMapping; label: string }> = [
    { key: 'mileage', label: 'Mileage' },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'transmission', label: 'Transmission' },
    { key: 'city', label: 'City' },
    { key: 'region', label: 'Region' },
    { key: 'description', label: 'Description' }
  ];

  return (
    <S.MappingStep>
      <S.StepTitle>Map CSV Columns</S.StepTitle>
      <S.MappingGrid>
        {requiredFields.map(field => (
          <S.MappingRow key={field.key}>
            <S.FieldLabel>{field.label}</S.FieldLabel>
            <S.Select
              value={mapping[field.key] || ''}
              onChange={(e) => onMappingChange(field.key, e.target.value)}
            >
              <option value="">Select column...</option>
              {csvHeaders.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </S.Select>
          </S.MappingRow>
        ))}
        
        {optionalFields.map(field => (
          <S.MappingRow key={field.key}>
            <S.FieldLabel>{field.label}</S.FieldLabel>
            <S.Select
              value={mapping[field.key] || ''}
              onChange={(e) => onMappingChange(field.key, e.target.value)}
            >
              <option value="">Select column...</option>
              {csvHeaders.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </S.Select>
          </S.MappingRow>
        ))}
      </S.MappingGrid>

      <S.Actions>
        <S.BackButton onClick={onBack}>Back</S.BackButton>
        <S.ImportButton onClick={onStartImport}>Start Import</S.ImportButton>
      </S.Actions>
    </S.MappingStep>
  );
};

interface ImportingStepProps {}

export const ImportingStepComponent: React.FC<ImportingStepProps> = () => {
  return (
    <S.ImportingStep>
      <S.LoaderIcon>
        <Loader size={48} className="spin" />
      </S.LoaderIcon>
      <S.ImportingText>Importing cars, please wait...</S.ImportingText>
    </S.ImportingStep>
  );
};

interface CompleteStepProps {
  result: CSVImportResult;
}

export const CompleteStepComponent: React.FC<CompleteStepProps> = ({ result }) => {
  return (
    <S.CompleteStep>
      <S.ResultIcon success={result.success}>
        {result.success ? <CheckCircle size={48} /> : <XCircle size={48} />}
      </S.ResultIcon>
      <S.ResultTitle>
        {result.success ? 'Import Complete!' : 'Import Completed with Errors'}
      </S.ResultTitle>
      <S.ResultStats>
        <S.Stat>
          <S.StatLabel>Total Rows:</S.StatLabel>
          <S.StatValue>{result.totalRows}</S.StatValue>
        </S.Stat>
        <S.Stat>
          <S.StatLabel>Successful:</S.StatLabel>
          <S.StatValue success>{result.successful}</S.StatValue>
        </S.Stat>
        <S.Stat>
          <S.StatLabel>Failed:</S.StatLabel>
          <S.StatValue error>{result.failed}</S.StatValue>
        </S.Stat>
      </S.ResultStats>
      
      {result.errors.length > 0 && (
        <S.ErrorList>
          <S.ErrorListTitle>Errors:</S.ErrorListTitle>
          {result.errors.slice(0, 5).map((err, idx) => (
            <S.ErrorItem key={idx}>
              Row {err.row}: {err.message}
            </S.ErrorItem>
          ))}
          {result.errors.length > 5 && (
            <S.ErrorItem>... and {result.errors.length - 5} more errors</S.ErrorItem>
          )}
        </S.ErrorList>
      )}
    </S.CompleteStep>
  );
};


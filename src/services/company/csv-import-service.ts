/**
 * CSV Import Service
 * Service for importing car listings from CSV files
 * 
 * Constitution Compliance: Max 300 lines per file
 * 
 * Features:
 * - CSV parsing and validation
 * - Column mapping
 * - Batch car creation
 * - Plan limit enforcement
 * - Error handling and reporting
 */

import { unifiedCarService } from '../car/unified-car-service';
import { logger } from '../logger-service';
import type { UnifiedCar } from '../car/unified-car-types';

export interface CSVImportResult {
  success: boolean;
  totalRows: number;
  successful: number;
  failed: number;
  errors: CSVImportError[];
  createdCars: Array<{ id: string; make: string; model: string }>;
}

export interface CSVImportError {
  row: number;
  field?: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface CSVColumnMapping {
  make: string;
  model: string;
  year: string;
  price: string;
  mileage?: string;
  fuelType?: string;
  transmission?: string;
  city?: string;
  region?: string;
  description?: string;
  [key: string]: string | undefined;
}

export interface CSVImportOptions {
  userId: string;
  mapping: CSVColumnMapping;
  maxRows?: number;
  skipFirstRow?: boolean;
}

/**
 * Parse CSV content into rows
 */
function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  for (const line of lines) {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    row.push(current.trim());
    rows.push(row);
  }
  
  return rows;
}

/**
 * Extract header row from CSV
 */
function extractHeaderRow(rows: string[][]): string[] {
  if (rows.length === 0) {
    throw new Error('CSV file is empty');
  }
  return rows[0].map(col => col.trim().toLowerCase());
}

/**
 * Map CSV row to car data object
 */
function mapRowToCarData(
  row: string[],
  headers: string[],
  mapping: CSVColumnMapping,
  userId: string
): Partial<UnifiedCar> {
  const getValue = (field: string): string => {
    const csvColumn = mapping[field];
    if (!csvColumn) return '';
    
    const index = headers.findIndex(h => h === csvColumn.toLowerCase());
    if (index === -1 || index >= row.length) return '';
    
    return row[index].trim();
  };

  const make = getValue('make');
  const model = getValue('model');
  const yearStr = getValue('year');
  const priceStr = getValue('price');
  
  // Required fields validation
  if (!make || !model || !yearStr || !priceStr) {
    throw new Error(`Missing required fields: make=${make}, model=${model}, year=${yearStr}, price=${priceStr}`);
  }

  const year = parseInt(yearStr, 10);
  const price = parseFloat(priceStr.replace(/[^\d.]/g, ''));
  
  if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
    throw new Error(`Invalid year: ${yearStr}`);
  }
  
  if (isNaN(price) || price <= 0) {
    throw new Error(`Invalid price: ${priceStr}`);
  }

  const carData: Partial<UnifiedCar> = {
    sellerId: userId,
    make,
    model,
    year,
    price,
    vehicleType: 'passenger_car',
    sellerType: 'dealer',
    status: 'active',
    isActive: true,
    isSold: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Optional fields
  const mileageStr = getValue('mileage');
  if (mileageStr) {
    const mileage = parseFloat(mileageStr.replace(/[^\d]/g, ''));
    if (!isNaN(mileage)) {
      carData.mileage = mileage;
    }
  }

  const fuelType = getValue('fuelType');
  if (fuelType) {
    carData.fuelType = normalizeFuelType(fuelType);
  }

  const transmission = getValue('transmission');
  if (transmission) {
    carData.transmission = normalizeTransmission(transmission);
  }

  const city = getValue('city');
  if (city) {
    carData.city = city;
  }

  const region = getValue('region');
  if (region) {
    carData.region = region;
  }

  const description = getValue('description');
  if (description) {
    carData.description = description;
  }

  return carData;
}

/**
 * Normalize fuel type to standard values
 */
function normalizeFuelType(fuelType: string): string {
  const normalized = fuelType.toLowerCase().trim();
  
  const mapping: Record<string, string> = {
    'diesel': 'diesel',
    'дизел': 'diesel',
    'бензин': 'petrol',
    'petrol': 'petrol',
    'gasoline': 'petrol',
    'hybrid': 'hybrid',
    'хебрид': 'hybrid',
    'electric': 'electric',
    'електрически': 'electric',
    'lpg': 'lpg',
    'cng': 'cng'
  };

  return mapping[normalized] || normalized;
}

/**
 * Normalize transmission to standard values
 */
function normalizeTransmission(transmission: string): string {
  const normalized = transmission.toLowerCase().trim();
  
  const mapping: Record<string, string> = {
    'automatic': 'automatic',
    'автоматична': 'automatic',
    'manual': 'manual',
    'ръчна': 'manual',
    'cvt': 'cvt',
    'semi-automatic': 'semi-automatic'
  };

  return mapping[normalized] || normalized;
}

/**
 * Import cars from CSV file
 */
export async function importCarsFromCSV(
  csvContent: string,
  options: CSVImportOptions
): Promise<CSVImportResult> {
  const { userId, mapping, maxRows = 100, skipFirstRow = true } = options;
  
  const result: CSVImportResult = {
    success: false,
    totalRows: 0,
    successful: 0,
    failed: 0,
    errors: [],
    createdCars: []
  };

  try {
    // Parse CSV
    const rows = parseCSV(csvContent);
    if (rows.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Extract headers
    const headers = extractHeaderRow(rows);
    result.totalRows = skipFirstRow ? rows.length - 1 : rows.length;

    // Validate mapping
    const requiredFields = ['make', 'model', 'year', 'price'];
    for (const field of requiredFields) {
      if (!mapping[field]) {
        throw new Error(`Missing required mapping for field: ${field}`);
      }
      const headerExists = headers.includes(mapping[field].toLowerCase());
      if (!headerExists) {
        throw new Error(`CSV column not found: ${mapping[field]}`);
      }
    }

    // Limit rows
    const dataRows = skipFirstRow ? rows.slice(1) : rows;
    const rowsToProcess = dataRows.slice(0, maxRows);

    logger.info('Starting CSV import', {
      userId,
      totalRows: rowsToProcess.length,
      maxRows
    });

    // Process each row
    for (let i = 0; i < rowsToProcess.length; i++) {
      const row = rowsToProcess[i];
      const rowNumber = skipFirstRow ? i + 2 : i + 1; // 1-indexed, accounting for header

      try {
        // Map row to car data
        const carData = mapRowToCarData(row, headers, mapping, userId);

        // Create car
        const createResult = await unifiedCarService.createCar(carData);

        result.successful++;
        result.createdCars.push({
          id: createResult.id,
          make: carData.make || '',
          model: carData.model || ''
        });

        logger.debug('CSV import: car created', {
          rowNumber,
          carId: createResult.id,
          make: carData.make,
          model: carData.model
        });
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : 'Unknown error',
          data: Object.fromEntries(
            headers.map((header, idx) => [header, row[idx] || ''])
          )
        });

        logger.warn('CSV import: row failed', {
          rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    result.success = result.failed === 0;
    
    logger.info('CSV import completed', {
      userId,
      successful: result.successful,
      failed: result.failed,
      total: result.totalRows
    });

    return result;
  } catch (error) {
    logger.error('CSV import failed', error as Error, { userId });
    
    result.errors.push({
      row: 0,
      message: error instanceof Error ? error.message : 'Unknown error'
    });

    return result;
  }
}

/**
 * Validate CSV file before import
 */
export function validateCSVFile(csvContent: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!csvContent || csvContent.trim().length === 0) {
    errors.push('CSV file is empty');
    return { valid: false, errors };
  }

  const rows = parseCSV(csvContent);
  if (rows.length === 0) {
    errors.push('CSV file contains no rows');
    return { valid: false, errors };
  }

  if (rows.length < 2) {
    errors.push('CSV file must contain at least a header row and one data row');
  }

  const headers = rows[0];
  const requiredColumns = ['make', 'model', 'year', 'price'];
  
  for (const required of requiredColumns) {
    const found = headers.some(h => h.toLowerCase().includes(required.toLowerCase()));
    if (!found) {
      errors.push(`Missing required column: ${required}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}


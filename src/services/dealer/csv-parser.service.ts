/**
 * CSV/Excel Parser for Bulk Car Upload
 * Parses and validates car data from CSV/Excel files
 * Location: Bulgaria
 * Currency: EUR
 * 
 * File: src/services/dealer/csv-parser.service.ts
 * Created: February 8, 2026
 */

import { serviceLogger } from '../logger-service';

export interface ParsedCarData {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  engineSize: number;
  doors: number;
  seats: number;
  color: string;
  description: string;
  location: string;
  images?: string[];
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
}

export interface ParseResult {
  success: boolean;
  data: ParsedCarData[];
  errors: ValidationError[];
  totalRows: number;
  validRows: number;
}

class CSVParserService {
  private static instance: CSVParserService;

  private readonly REQUIRED_FIELDS = [
    'make',
    'model',
    'year',
    'price',
    'mileage',
    'fuelType',
    'transmission'
  ];

  private readonly FUEL_TYPES = [
    'petrol',
    'diesel',
    'electric',
    'hybrid',
    'lpg',
    'cng'
  ];

  private readonly TRANSMISSIONS = ['manual', 'automatic', 'semi-automatic'];

  private constructor() {}

  static getInstance(): CSVParserService {
    if (!CSVParserService.instance) {
      CSVParserService.instance = new CSVParserService();
    }
    return CSVParserService.instance;
  }

  async parseCSV(file: File): Promise<ParseResult> {
    try {
      const text = await file.text();
      const rows = this.parseCSVText(text);
      return this.processRows(rows);
    } catch (error) {
      serviceLogger.error('CSV parsing failed', error as Error);
      return {
        success: false,
        data: [],
        errors: [
          {
            row: 0,
            field: 'file',
            message: error instanceof Error ? error.message : 'Unknown error',
            value: null
          }
        ],
        totalRows: 0,
        validRows: 0
      };
    }
  }

  private parseCSVText(text: string): Record<string, any>[] {
    const lines = text.split('\n').filter((line: string) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0]
      .split(',')
      .map((h: string) => h.trim().toLowerCase());

    const rows: Record<string, any>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v: string) => v.trim());
      const row: Record<string, any> = {};

      headers.forEach((header: string, index: number) => {
        row[header] = values[index] || '';
      });

      rows.push(row);
    }

    return rows;
  }

  async parseExcel(file: File): Promise<ParseResult> {
    try {
      // For Excel files, treat as CSV for now
      // In production, use a lightweight library like SheetJS-lite
      const text = await file.text();
      const rows = this.parseCSVText(text);
      return this.processRows(rows);
    } catch (error) {
      serviceLogger.error('Excel parsing failed', error as Error);
      return {
        success: false,
        data: [],
        errors: [
          {
            row: 0,
            field: 'file',
            message: error instanceof Error ? error.message : 'Unknown error',
            value: null
          }
        ],
        totalRows: 0,
        validRows: 0
      };
    }
  }

  private processRows(rows: any[]): ParseResult {
    const data: ParsedCarData[] = [];
    const errors: ValidationError[] = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      const rowErrors = this.validateRow(row, rowNumber);

      if (rowErrors.length === 0) {
        const carData = this.mapRowToCarData(row);
        data.push(carData);
      } else {
        errors.push(...rowErrors);
      }
    });

    return {
      success: errors.length === 0,
      data,
      errors,
      totalRows: rows.length,
      validRows: data.length
    };
  }

  private validateRow(row: any, rowNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];

    this.REQUIRED_FIELDS.forEach((field) => {
      if (!row[field] || String(row[field]).trim() === '') {
        errors.push({
          row: rowNumber,
          field,
          message: `${field} is required`,
          value: row[field]
        });
      }
    });

    if (row.year) {
      const year = parseInt(row.year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        errors.push({
          row: rowNumber,
          field: 'year',
          message: `Year must be between 1900 and ${currentYear + 1}`,
          value: row.year
        });
      }
    }

    if (row.price) {
      const price = parseFloat(row.price);
      if (isNaN(price) || price <= 0) {
        errors.push({
          row: rowNumber,
          field: 'price',
          message: 'Price must be a positive number in EUR',
          value: row.price
        });
      }
    }

    if (row.mileage) {
      const mileage = parseInt(row.mileage);
      if (isNaN(mileage) || mileage < 0) {
        errors.push({
          row: rowNumber,
          field: 'mileage',
          message: 'Mileage must be a non-negative number',
          value: row.mileage
        });
      }
    }

    if (row.fuelType) {
      const fuelType = String(row.fuelType).toLowerCase();
      if (!this.FUEL_TYPES.includes(fuelType)) {
        errors.push({
          row: rowNumber,
          field: 'fuelType',
          message: `Fuel type must be one of: ${this.FUEL_TYPES.join(', ')}`,
          value: row.fuelType
        });
      }
    }

    if (row.transmission) {
      const transmission = String(row.transmission).toLowerCase();
      if (!this.TRANSMISSIONS.includes(transmission)) {
        errors.push({
          row: rowNumber,
          field: 'transmission',
          message: `Transmission must be one of: ${this.TRANSMISSIONS.join(', ')}`,
          value: row.transmission
        });
      }
    }

    return errors;
  }

  private mapRowToCarData(row: any): ParsedCarData {
    return {
      make: String(row.make).trim(),
      model: String(row.model).trim(),
      year: parseInt(row.year),
      price: parseFloat(row.price),
      mileage: parseInt(row.mileage),
      fuelType: String(row.fuelType).toLowerCase(),
      transmission: String(row.transmission).toLowerCase(),
      engineSize: row.engineSize ? parseFloat(row.engineSize) : 0,
      doors: row.doors ? parseInt(row.doors) : 4,
      seats: row.seats ? parseInt(row.seats) : 5,
      color: row.color ? String(row.color).trim() : '',
      description: row.description ? String(row.description).trim() : '',
      location: row.location ? String(row.location).trim() : 'Bulgaria',
      images: row.images ? String(row.images).split('|').map(url => url.trim()) : []
    };
  }

  generateSampleCSV(): string {
    const headers = [
      'make',
      'model',
      'year',
      'price',
      'mileage',
      'fuelType',
      'transmission',
      'engineSize',
      'doors',
      'seats',
      'color',
      'description',
      'location',
      'images'
    ];

    const sampleData = [
      [
        'Mercedes-Benz',
        'E 220',
        '2020',
        '25000',
        '45000',
        'diesel',
        'automatic',
        '2.0',
        '4',
        '5',
        'Black',
        'Premium sedan in excellent condition',
        'Sofia',
        'https://example.com/img1.jpg|https://example.com/img2.jpg'
      ],
      [
        'BMW',
        '320d',
        '2019',
        '22000',
        '60000',
        'diesel',
        'manual',
        '2.0',
        '4',
        '5',
        'White',
        'Sport package, leather interior',
        'Plovdiv',
        ''
      ]
    ];

    const csv = [headers.join(','), ...sampleData.map(row => row.join(','))].join('\n');

    return csv;
  }
}

export const csvParserService = CSVParserService.getInstance();

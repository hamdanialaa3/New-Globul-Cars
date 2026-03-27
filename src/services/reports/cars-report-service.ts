// src/services/reports/cars-report-service.ts
// Car reports export service

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { queryAllCollections, countAllVehicles, VEHICLE_COLLECTIONS } from '../search/multi-collection-helper';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';

export interface CarReportData {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  location: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone?: string;
  sellerType: 'private' | 'dealer';
  status: 'active' | 'sold' | 'inactive';
  views: number;
  favorites: number;
  createdAt: Date;
  images: number;
}

export class CarsReportService {
  private static instance: CarsReportService;

  static getInstance(): CarsReportService {
    if (!CarsReportService.instance) {
      CarsReportService.instance = new CarsReportService();
    }
    return CarsReportService.instance;
  }

  /**
   * Fetch all cars with filters
   */
  async getAllCars(filters?: {
    city?: string;
    status?: 'active' | 'sold' | 'inactive';
    make?: string;
    yearFrom?: number;
    yearTo?: number;
    priceFrom?: number;
    priceTo?: number;
  }): Promise<CarReportData[]> {
    try {
      let q = query(collection(db, 'cars'), orderBy('createdAt', 'desc'));

      // City filter
      if (filters?.city) {
        q = query(q, where('location', '==', filters.locationData?.cityName));
      }

      // Status filter
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      // Make filter
      if (filters?.make) {
        q = query(q, where('make', '==', filters.make));
      }

      const snapshot = await getDocs(q);
      
      const cars: CarReportData[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // Additional filters (in memory)
        if (filters?.yearFrom && data.year < filters.yearFrom) continue;
        if (filters?.yearTo && data.year > filters.yearTo) continue;
        if (filters?.priceFrom && data.price < filters.priceFrom) continue;
        if (filters?.priceTo && data.price > filters.priceTo) continue;

        // Fetch seller info
        const sellerData = await this.getSellerInfo(data.sellerId);

        cars.push({
          id: doc.id,
          make: data.make || '',
          model: data.model || '',
          year: data.year || 0,
          price: data.price || 0,
          mileage: data.mileage || 0,
          fuelType: data.fuelType || '',
          transmission: data.transmission || '',
          location: data.location || '',
          sellerName: sellerData.name,
          sellerEmail: sellerData.email,
          sellerPhone: sellerData.phone,
          sellerType: data.sellerType || 'private',
          status: data.status || 'active',
          views: data.views || 0,
          favorites: data.favorites || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          images: data.images?.length || 0,
        });
      }

      return cars;
    } catch (error) {
      serviceLogger.error('Error fetching cars for report', error as Error);
      throw error;
    }
  }

  /**
   * Fetch seller info
   */
  private async getSellerInfo(sellerId: string): Promise<{
    name: string;
    email: string;
    phone?: string;
  }> {
    try {
      const userDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', sellerId))
      );

      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        return {
          name: userData.displayName || 'Unknown',
          email: userData.email || '',
          phone: userData.phoneNumber,
        };
      }

      return { name: 'Unknown', email: '' };
    } catch (error) {
      return { name: 'Fetch error', email: '' };
    }
  }

  /**
   * Export to CSV
   */
  async exportToCSV(cars: CarReportData[]): Promise<string> {
    const headers = [
      'ID',
      'Make',
      'Model',
      'Year',
      'Price (EUR)',
      'Mileage (km)',
      'Fuel',
      'Transmission',
      'Location',
      'Seller Name',
      'Seller Email',
      'Seller Phone',
      'Seller Type',
      'Status',
      'Views',
      'Favorites',
      'Photos',
      'Date Added'
    ];

    const rows = cars.map((car: any) => [
      car.id,
      car.make,
      car.model,
      car.year.toString(),
      car.price.toString(),
      car.mileage.toString(),
      car.fuelType,
      car.transmission,
      car.location,
      car.sellerName,
      car.sellerEmail,
      car.sellerPhone || '-',
      car.sellerType === 'private' ? 'Private' : 'Dealer',
      this.translateStatus(car.status),
      car.views.toString(),
      car.favorites.toString(),
      car.images.toString(),
      car.createdAt.toLocaleDateString('bg-BG')
    ]);

    const csvContent = [
      '\uFEFF' + headers.join(','), // BOM for Excel UTF-8
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Export to JSON
   */
  async exportToJSON(cars: CarReportData[]): Promise<string> {
    return JSON.stringify(cars, null, 2);
  }

  /**
   * Export to Excel (HTML Table)
   */
  async exportToExcel(cars: CarReportData[]): Promise<string> {
    const headers = [
      'ID', 'Make', 'Model', 'Year', 'Price (EUR)', 
      'Mileage', 'Fuel', 'Transmission', 'Location',
      'Seller Name', 'Seller Email', 'Seller Phone', 'Seller Type',
      'Status', 'Views', 'Favorites', 'Photos', 'Date Added'
    ];

    const rows = cars.map((car: any) => `
      <tr>
        <td>${car.id}</td>
        <td>${car.make}</td>
        <td>${car.model}</td>
        <td>${car.year}</td>
        <td>${car.price.toLocaleString()} €</td>
        <td>${car.mileage.toLocaleString()} km</td>
        <td>${car.fuelType}</td>
        <td>${car.transmission}</td>
        <td>${car.location}</td>
        <td>${car.sellerName}</td>
        <td>${car.sellerEmail}</td>
        <td>${car.sellerPhone || '-'}</td>
        <td>${car.sellerType === 'private' ? 'Private' : 'Dealer'}</td>
        <td>${this.translateStatus(car.status)}</td>
        <td>${car.views}</td>
        <td>${car.favorites}</td>
        <td>${car.images}</td>
        <td>${car.createdAt.toLocaleDateString('bg-BG')}</td>
      </tr>
    `).join('');

    return `
      <html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #6366F1; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .sold { background-color: #ffebee; }
          .active { background-color: #e8f5e9; }
        </style>
      </head>
      <body>
        <h2>Car Report - Koli One</h2>
        <p>Report Date: ${new Date().toLocaleDateString('bg-BG')}</p>
        <p>Total Cars: ${cars.length}</p>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Download report
   */
  downloadReport(content: string, filename: string, type: 'csv' | 'json' | 'xls') {
    const mimeTypes = {
      csv: 'text/csv;charset=utf-8;',
      json: 'application/json',
      xls: 'application/vnd.ms-excel'
    };

    const blob = new Blob([content], { type: mimeTypes[type] });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.${type}`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Translate status
   */
  private translateStatus(status: string): string {
    const translations: { [key: string]: string } = {
      'active': 'Active',
      'sold': 'Sold',
      'inactive': 'Inactive'
    };
    return translations[status] || status;
  }

  /**
   * Quick statistics
   */
  async getCarStatistics(city?: string): Promise<{
    total: number;
    active: number;
    sold: number;
    inactive: number;
    totalValue: number;
    averagePrice: number;
    averageMileage: number;
  }> {
    try {
      const cars = await this.getAllCars(city ? { city } : undefined);
      
      const totalValue = cars.reduce((sum, car) => sum + car.price, 0);
      const totalMileage = cars.reduce((sum, car) => sum + car.mileage, 0);

      return {
        total: cars.length,
        active: cars.filter(c => c.status === 'active').length,
        sold: cars.filter(c => c.status === 'sold').length,
        inactive: cars.filter(c => c.status === 'inactive').length,
        totalValue,
        averagePrice: cars.length > 0 ? totalValue / cars.length : 0,
        averageMileage: cars.length > 0 ? totalMileage / cars.length : 0,
      };
    } catch (error) {
      serviceLogger.error('Error getting car statistics', error as Error);
      throw error;
    }
  }
}

export const carsReportService = CarsReportService.getInstance();



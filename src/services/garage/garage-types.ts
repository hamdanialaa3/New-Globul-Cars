import { Timestamp } from 'firebase/firestore';

export interface ServiceHistoryEntry {
  id: string;
  date: string | Timestamp;
  type: 'oil_change' | 'repair' | 'tires' | 'maintenance';
  description: string;
  cost: number;
  mileageAtService?: number;
  shopName?: string;
}

export interface GarageVehicleDocuments {
  motExpiry?: string | Timestamp;
  insuranceExpiry?: string | Timestamp;
  vignetteExpiry?: string | Timestamp;
}

export interface GarageVehicle {
  id: string;
  ownerUid: string;
  vin: string;
  licensePlate?: string;
  make: string;
  model: string;
  generation?: string;
  year: number;
  color?: string;
  mileage?: number;
  
  documents?: GarageVehicleDocuments;
  serviceHistory?: ServiceHistoryEntry[];

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GarageAlert {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: 'mot' | 'insurance' | 'vignette';
  severity: 'high' | 'medium' | 'low';
  message: string;
  daysRemaining: number;
}

import { Timestamp } from 'firebase/firestore';

export type AuctionStatus = 'active' | 'pending_payment' | 'completed' | 'cancelled';

export interface AuctionCarDetails {
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  imageUrl: string;
}

export interface AuctionPricing {
  startPrice: number;
  currentBid: number;
  winningBidderId?: string | null;
}

export interface AuctionTiming {
  startTime: Timestamp | Date | string; // Handled differently in UI vs DB
  endTime: Timestamp | Date | string;
}

export interface AuctionListing {
  id: string;
  sellerId: string;
  carId: string;
  carDetails: AuctionCarDetails;
  status: AuctionStatus;
  pricing: AuctionPricing;
  timing: AuctionTiming;
  bidsCount: number;
  createdAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
}

export interface AuctionBid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  timestamp: Timestamp | Date | string;
}

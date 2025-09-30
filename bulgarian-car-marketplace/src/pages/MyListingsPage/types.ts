// src/pages/MyListingsPage/types.ts
// TypeScript interfaces for MyListingsPage

export interface MyListing {
  id: string;
  title: string;
  price: number;
  currency: 'EUR';
  location: string;
  status: 'active' | 'sold' | 'pending' | 'inactive';
  views: number;
  inquiries: number;
  createdAt: Date;
  updatedAt: Date;
  images: string[];
  featured: boolean;
}

export interface MyListingsStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalViews: number;
  totalInquiries: number;
}

export interface MyListingsFilters {
  status: string;
  sortBy: 'date' | 'price' | 'views' | 'inquiries';
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
}

export interface MyListingsSection {
  title: string;
  description?: string;
  component: string;
}
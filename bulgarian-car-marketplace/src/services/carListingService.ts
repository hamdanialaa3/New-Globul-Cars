import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/firebase-config';
import { CarListing, CarListingFilters, CarListingSearchResult } from '../types/CarListing';
import { ProfileStatsService } from './profile/profile-stats-service';
import { serviceLogger } from './logger-wrapper';

class CarListingService {
  private collectionName = 'cars'; // ✅ Unified with sellWorkflowService

  // Create a new car listing
  async createListing(listing: Omit<CarListing, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...listing,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'draft',
        views: 0,
        favorites: 0,
        isFeatured: false,
        isUrgent: false
      });
      return docRef.id;
    } catch (error) {
      throw new Error('Failed to create car listing');
    }
  }

  // Update an existing car listing
  async updateListing(id: string, updates: Partial<CarListing>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      serviceLogger.error('Failed to update car listing', error as Error, { listingId: id });
      throw new Error('Failed to update car listing');
    }
  }

  // Delete a car listing
  async deleteListing(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      serviceLogger.error('Failed to delete car listing', error as Error, { listingId: id });
      throw new Error('Failed to delete car listing');
    }
  }

  // Get a single car listing by ID
  async getListing(id: string): Promise<CarListing | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate()
        } as CarListing;
      }
      return null;
    } catch (error) {
      serviceLogger.error('Failed to get car listing', error as Error, { listingId: id });
      throw new Error('Failed to get car listing');
    }
  }

  // Get all car listings with filters
  async getListings(filters: CarListingFilters = {}): Promise<CarListingSearchResult> {
    try {
      serviceLogger.debug('getListings called', { filters });
      let q = query(collection(db, this.collectionName));

      // Apply filters
      if (filters.vehicleType) {
        serviceLogger.debug('Adding vehicleType filter', { vehicleType: filters.vehicleType });
        q = query(q, where('vehicleType', '==', filters.vehicleType));
      }
      if (filters.make) {
        serviceLogger.debug('Adding make filter', { make: filters.make });
        q = query(q, where('make', '==', filters.make));
      }
      if (filters.model) {
        q = query(q, where('model', '==', filters.model));
      }
      if (filters.yearFrom) {
        q = query(q, where('year', '>=', filters.yearFrom));
      }
      if (filters.yearTo) {
        q = query(q, where('year', '<=', filters.yearTo));
      }
      if (filters.mileageFrom) {
        q = query(q, where('mileage', '>=', filters.mileageFrom));
      }
      if (filters.mileageTo) {
        q = query(q, where('mileage', '<=', filters.mileageTo));
      }
      if (filters.priceFrom) {
        q = query(q, where('price', '>=', filters.priceFrom));
      }
      if (filters.priceTo) {
        q = query(q, where('price', '<=', filters.priceTo));
      }
      if (filters.fuelType) {
        q = query(q, where('fuelType', '==', filters.fuelType));
      }
      if (filters.transmission) {
        q = query(q, where('transmission', '==', filters.transmission));
      }
      // ✅ FIXED: Use REGION for filtering (not city!)
      // Region = المحافظة (PRIMARY for filtering)
      // City = المدينة التابعة (decorative only)
      if ((filters as any).cityId) {
        // cityId in URL actually means regionId!
        q = query(q, where('region', '==', (filters as any).cityId));
      } else if (filters.location) {
        // Backward compatibility
        q = query(q, where('region', '==', filters.location));
      } else if (filters.region) {
        // Direct region filter
        q = query(q, where('region', '==', filters.region));
      }
      
      if ((filters as any).regionId) {
        // Region filter
        q = query(q, where('region', '==', (filters as any).regionId));
      }
      
      if (filters.sellerType) {
        q = query(q, where('sellerType', '==', filters.sellerType));
      }

      // Apply sorting - ONLY if no filters that require composite index
      // Skip orderBy if using: region, make, model, or any other where clause
      const hasFiltersThatNeedIndex = (
        (filters as any).cityId || 
        filters.location || 
        filters.region || 
        (filters as any).regionId ||
        filters.make ||
        filters.model ||
        filters.vehicleType ||
        filters.fuelType ||
        filters.transmission
      );
      
      if (!hasFiltersThatNeedIndex) {
      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'desc';
      q = query(q, orderBy(sortBy, sortOrder));
      }

      // Apply pagination
      const page = filters.page || 1;
      const limitCount = filters.limit || 20;
      const startIndex = (page - 1) * limitCount;
      
      if (startIndex > 0) {
        // For pagination, we need to implement cursor-based pagination
        // This is a simplified version
        q = query(q, limit(limitCount));
      } else {
        q = query(q, limit(limitCount));
      }

      serviceLogger.debug('Executing Firebase query for car listings');
      const querySnapshot = await getDocs(q);
      serviceLogger.debug('Query returned documents', { count: querySnapshot.size });
      
      const listings: CarListing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        listings.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate()
        } as CarListing);
      });
      
      serviceLogger.debug('Processed listings', { count: listings.length });

      // ✅ Client-side sorting if we couldn't use orderBy in Firebase
      if (hasFiltersThatNeedIndex && listings.length > 0) {
        const sortBy = (filters.sortBy || 'createdAt') as string;
        const sortOrder = filters.sortOrder || 'desc';
        
        listings.sort((a, b) => {
          const aValue = (a as any)[sortBy];
          const bValue = (b as any)[sortBy];
          
          if (aValue === undefined || bValue === undefined) return 0;
          
          // Handle date sorting
          if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
            const aTime = aValue instanceof Date ? aValue.getTime() : 0;
            const bTime = bValue instanceof Date ? bValue.getTime() : 0;
            return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
          }
          
          // Handle number sorting
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
          }
          
          // Handle string sorting
          const aStr = String(aValue).toLowerCase();
          const bStr = String(bValue).toLowerCase();
          if (sortOrder === 'desc') {
            return bStr.localeCompare(aStr);
          }
          return aStr.localeCompare(bStr);
        });
        
        serviceLogger.debug('Client-side sorted listings', { count: listings.length, sortBy, sortOrder });
      }

      const total = listings.length; // This is simplified - in production, you'd want to get the total count separately
      const totalPages = Math.ceil(total / limitCount);

      return {
        listings,
        total,
        page,
        limit: limitCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error: any) {
      serviceLogger.error('Failed to get car listings', error as Error, { filters });
      
      // If index error, retry without orderBy
      if (error.message?.includes('index') || error.code === 'failed-precondition') {
        serviceLogger.info('Index not ready - retrying without orderBy');
        
        // Remove orderBy from query by clearing sort params
        const newFilters = { ...filters };
        delete (newFilters as any).sortBy;
        delete (newFilters as any).sortOrder;
        
        // Retry the query (this will skip the orderBy since sortBy is undefined)
        return this.getListings(newFilters);
      }
      
      throw new Error('Failed to get car listings');
    }
  }

  // Upload images for a car listing
  async uploadImages(listingId: string, images: File[]): Promise<string[]> {
    try {
      const uploadPromises = images.map(async (image, index) => {
        const imageRef = ref(storage, `carListings/${listingId}/images/${index}_${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        return getDownloadURL(snapshot.ref);
      });

      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      serviceLogger.error('Failed to upload car listing images', error as Error, { listingId });
      throw new Error('Failed to upload images');
    }
  }

  // Delete images for a car listing
  async deleteImages(listingId: string, imageUrls: string[]): Promise<void> {
    try {
      const deletePromises = imageUrls.map(async (url) => {
        const imageRef = ref(storage, url);
        await deleteObject(imageRef);
      });

      await Promise.all(deletePromises);
    } catch (error) {
      serviceLogger.error('Failed to delete car listing images', error as Error, { listingId });
      throw new Error('Failed to delete images');
    }
  }

  // Increment view count
  async incrementViews(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentViews = docSnap.data().views || 0;
        await updateDoc(docRef, {
          views: currentViews + 1,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      serviceLogger.error('Failed to increment car listing views', error as Error, { listingId: id });
      throw new Error('Failed to increment views');
    }
  }

  // Toggle favorite status
  async toggleFavorite(userId: string, listingId: string): Promise<boolean> {
    try {
      // This would typically involve a separate favorites collection
      // For now, we'll just increment/decrement the favorites count
      const docRef = doc(db, this.collectionName, listingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentFavorites = docSnap.data().favorites || 0;
        // In a real implementation, you'd check if the user has already favorited this listing
        const newFavorites = currentFavorites + 1; // Simplified logic
        await updateDoc(docRef, {
          favorites: newFavorites,
          updatedAt: serverTimestamp()
        });
        return true;
      }
      return false;
    } catch (error) {
      serviceLogger.error('Failed to toggle favorite for car listing', error as Error, { userId, listingId });
      throw new Error('Failed to toggle favorite');
    }
  }

  // Get listings by seller
  async getListingsBySeller(sellerEmail: string): Promise<CarListing[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('sellerEmail', '==', sellerEmail),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const listings: CarListing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        listings.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate()
        } as CarListing);
      });

      return listings;
    } catch (error) {
      serviceLogger.error('Failed to get car listings by seller', error as Error, { sellerEmail });
      throw new Error('Failed to get listings by seller');
    }
  }

  // Search listings by text
  async searchListings(searchTerm: string, filters: CarListingFilters = {}): Promise<CarListingSearchResult> {
    try {
      // Firestore doesn't support full-text search natively
      // This is a simplified implementation that searches in specific fields
      let q = query(collection(db, this.collectionName));

      // Apply text search in make and model fields
      if (searchTerm) {
        // This is a simplified approach - in production, you'd want to use Algolia or similar
        q = query(q, where('make', '>=', searchTerm));
      }

      // Apply other filters
      if (filters.vehicleType) {
        q = query(q, where('vehicleType', '==', filters.vehicleType));
      }
      if (filters.priceFrom) {
        q = query(q, where('price', '>=', filters.priceFrom));
      }
      if (filters.priceTo) {
        q = query(q, where('price', '<=', filters.priceTo));
      }

      q = query(q, orderBy('createdAt', 'desc'));
      q = query(q, limit(filters.limit || 20));

      const querySnapshot = await getDocs(q);
      const listings: CarListing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const listing = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate()
        } as CarListing;

        // Filter by search term in client-side (simplified)
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matches = 
            listing.make?.toLowerCase().includes(searchLower) ||
            listing.model?.toLowerCase().includes(searchLower) ||
            listing.description?.toLowerCase().includes(searchLower);
          
          if (matches) {
            listings.push(listing);
          }
        } else {
          listings.push(listing);
        }
      });

      return {
        listings,
        total: listings.length,
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: Math.ceil(listings.length / (filters.limit || 20)),
        hasNext: false,
        hasPrev: false
      };
    } catch (error) {
      serviceLogger.error('Failed to search car listings', error as Error, { searchTerm, filters });
      throw new Error('Failed to search car listings');
    }
  }

  // Publish a draft listing
  async publishListing(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        status: 'active',
        updatedAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });
    } catch (error) {
      serviceLogger.error('Failed to publish car listing', error as Error, { listingId: id });
      throw new Error('Failed to publish listing');
    }
  }

  // Mark listing as sold
  async markAsSold(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      
      // Get car data to find owner
      const carDoc = await getDoc(docRef);
      if (!carDoc.exists()) {
        throw new Error('Car not found');
      }
      
      const carData = carDoc.data() as CarListing;
      const sellerId = carData.sellerId;
      
      // Update car status
      await updateDoc(docRef, {
        status: 'sold',
        updatedAt: serverTimestamp(),
        soldAt: serverTimestamp()
      });
      
      // ✅ Increment cars sold stat
      if (sellerId) {
        try {
          await ProfileStatsService.getInstance().incrementCarsSold(sellerId);
          serviceLogger.info('Stats updated: Cars sold +1', { sellerId });
        } catch (statsError) {
          serviceLogger.error('Failed to update stats', statsError as Error, { sellerId });
          // Continue anyway - don't block the main flow
        }
      }
    } catch (error) {
      serviceLogger.error('Failed to mark car listing as sold', error as Error, { listingId: id });
      throw new Error('Failed to mark listing as sold');
    }
  }

  // Get featured listings
  async getFeaturedListings(limitCount: number = 10): Promise<CarListing[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isFeatured', '==', true),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const listings: CarListing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        listings.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate()
        } as CarListing);
      });

      return listings;
    } catch (error) {
      serviceLogger.error('Failed to get featured car listings', error as Error, { limitCount });
      throw new Error('Failed to get featured listings');
    }
  }

  // Get urgent listings
  async getUrgentListings(limitCount: number = 10): Promise<CarListing[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isUrgent', '==', true),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const listings: CarListing[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        listings.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate()
        } as CarListing);
      });

      return listings;
    } catch (error) {
      serviceLogger.error('Failed to get urgent car listings', error as Error, { limitCount });
      throw new Error('Failed to get urgent listings');
    }
  }
}

export default new CarListingService();

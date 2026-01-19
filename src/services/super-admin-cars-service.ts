import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import { normalizeError } from '@/utils/error-helpers';

export interface CarListing {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  city: string;
  region: string;
  country: string;
  images: string[];
  description: string;
  features: string[];
  status: 'active' | 'inactive' | 'sold' | 'suspended' | 'deleted';
  views: number;
  favorites: number;
  contactCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  soldAt?: Date;
  suspendedAt?: Date;
  suspensionReason?: string;
  moderationNotes?: string;
}

export interface PostData {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  content: string;
  images: string[];
  type: 'text' | 'image' | 'car_showcase' | 'question' | 'tip';
  carId?: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  views: number;
  status: 'active' | 'hidden' | 'reported' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
  reportCount: number;
  reportReasons: string[];
  moderationNotes?: string;
}

export interface UserStats {
  totalCars: number;
  activeCars: number;
  soldCars: number;
  totalPosts: number;
  activePosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  joinDate: Date;
  lastActivity: Date;
  trustScore: number;
  verificationLevel: 'none' | 'email' | 'phone' | 'identity' | 'business';
}

class SuperAdminCarsService {
  private static instance: SuperAdminCarsService;

  private constructor() {}

  public static getInstance(): SuperAdminCarsService {
    if (!SuperAdminCarsService.instance) {
      SuperAdminCarsService.instance = new SuperAdminCarsService();
    }
    return SuperAdminCarsService.instance;
  }

  // Get all cars with advanced filtering
  public async getAllCars(filters?: {
    status?: string;
    userId?: string;
    make?: string;
    priceMin?: number;
    priceMax?: number;
    city?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<CarListing[]> {
    try {
      let carsQuery = query(collection(db, 'cars'), orderBy('createdAt', 'desc'));
      
      if (filters?.status) {
        carsQuery = query(carsQuery, where('status', '==', filters.status));
      }
      
      if (filters?.userId) {
        carsQuery = query(carsQuery, where('userId', '==', filters.userId));
      }
      
      if (filters?.make) {
        carsQuery = query(carsQuery, where('make', '==', filters.make));
      }
      
      if (filters?.city) {
        carsQuery = query(carsQuery, where('city', '==', filters.locationData?.cityName));
      }

      const snapshot = await getDocs(carsQuery);
      const cars = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        publishedAt: doc.data().publishedAt?.toDate(),
        soldAt: doc.data().soldAt?.toDate(),
        suspendedAt: doc.data().suspendedAt?.toDate()
      } as CarListing));

      // Apply additional filters
      let filteredCars = cars;
      
      if (filters?.priceMin) {
        filteredCars = filteredCars.filter(car => car.price >= filters.priceMin!);
      }
      
      if (filters?.priceMax) {
        filteredCars = filteredCars.filter(car => car.price <= filters.priceMax!);
      }
      
      if (filters?.dateFrom) {
        filteredCars = filteredCars.filter(car => car.createdAt >= filters.dateFrom!);
      }
      
      if (filters?.dateTo) {
        filteredCars = filteredCars.filter(car => car.createdAt <= filters.dateTo!);
      }

      return filteredCars;
    } catch (error) {
      serviceLogger.error('Error getting all cars', error as Error, { filters });
      return [];
    }
  }

  // Get all posts with advanced filtering
  public async getAllPosts(filters?: {
    status?: string;
    userId?: string;
    type?: string;
    hasReports?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<PostData[]> {
    try {
      let postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      
      if (filters?.status) {
        postsQuery = query(postsQuery, where('status', '==', filters.status));
      }
      
      if (filters?.userId) {
        postsQuery = query(postsQuery, where('userId', '==', filters.userId));
      }
      
      if (filters?.type) {
        postsQuery = query(postsQuery, where('type', '==', filters.type));
      }

      const snapshot = await getDocs(postsQuery);
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as PostData));

      // Apply additional filters
      let filteredPosts = posts;
      
      if (filters?.hasReports) {
        filteredPosts = filteredPosts.filter(post => post.reportCount > 0);
      }
      
      if (filters?.dateFrom) {
        filteredPosts = filteredPosts.filter(post => post.createdAt >= filters.dateFrom!);
      }
      
      if (filters?.dateTo) {
        filteredPosts = filteredPosts.filter(post => post.createdAt <= filters.dateTo!);
      }

      return filteredPosts;
    } catch (error) {
      serviceLogger.error('Error getting all posts', error as Error, { filters });
      return [];
    }
  }

  // Get user statistics
  public async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      // Get user's cars
      const carsQuery = query(collection(db, 'cars'), where('userId', '==', userId));
      const carsSnapshot = await getDocs(carsQuery);
      const cars = carsSnapshot.docs.map(doc => doc.data());

      // Get user's posts
      const postsQuery = query(collection(db, 'posts'), where('userId', '==', userId));
      const postsSnapshot = await getDocs(postsQuery);
      const posts = postsSnapshot.docs.map(doc => doc.data());

      // Get user data
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : null;

      if (!userData) return null;

      const activeCars = cars.filter(car => car.status === 'active').length;
      const soldCars = cars.filter(car => car.status === 'sold').length;
      const activePosts = posts.filter(post => post.status === 'active').length;
      
      const totalViews = cars.reduce((sum, car) => sum + (car.views || 0), 0) +
                        posts.reduce((sum, post) => sum + (post.views || 0), 0);
      
      const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
      const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);

      return {
        totalCars: cars.length,
        activeCars,
        soldCars,
        totalPosts: posts.length,
        activePosts,
        totalViews,
        totalLikes,
        totalComments,
        joinDate: userData.createdAt?.toDate() || new Date(),
        lastActivity: userData.lastActivity?.toDate() || new Date(),
        trustScore: userData.trustScore || 0,
        verificationLevel: userData.verificationLevel || 'none'
      };
    } catch (error) {
      serviceLogger.error('Error getting user stats', error as Error, { userId });
      return null;
    }
  }

  // Update car status
  public async updateCarStatus(
    carId: string, 
    status: CarListing['status'], 
    reason?: string,
    adminId?: string
  ): Promise<void> {
    try {
      const carRef = doc(db, 'cars', carId);
      const updateData: Record<string, unknown> = {
        status,
        updatedAt: serverTimestamp()
      };

      if (status === 'suspended') {
        updateData.suspendedAt = serverTimestamp();
        updateData.suspensionReason = reason;
      }

      if (status === 'sold') {
        updateData.soldAt = serverTimestamp();
      }

      if (reason) {
        updateData.moderationNotes = reason;
      }

      await updateDoc(carRef, updateData);
      
      serviceLogger.info('Car status updated', { carId, status, reason, adminId });
    } catch (error) {
      serviceLogger.error('Error updating car status', error as Error, { carId, status });
      throw error;
    }
  }

  // Update post status
  public async updatePostStatus(
    postId: string, 
    status: PostData['status'], 
    reason?: string,
    adminId?: string
  ): Promise<void> {
    try {
      const postRef = doc(db, 'posts', postId);
      const updateData: Record<string, unknown> = {
        status,
        updatedAt: serverTimestamp()
      };

      if (reason) {
        updateData.moderationNotes = reason;
      }

      await updateDoc(postRef, updateData);
      
      serviceLogger.info('Post status updated', { postId, status, reason, adminId });
    } catch (error) {
      serviceLogger.error('Error updating post status', error as Error, { postId, status });
      throw error;
    }
  }

  // Delete car
  public async deleteCar(carId: string, adminId?: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'cars', carId));
      serviceLogger.info('Car deleted', { carId, adminId });
    } catch (error) {
      serviceLogger.error('Error deleting car', error as Error, { carId });
      throw error;
    }
  }

  // Delete post
  public async deletePost(postId: string, adminId?: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      serviceLogger.info('Post deleted', { postId, adminId });
    } catch (error) {
      serviceLogger.error('Error deleting post', error as Error, { postId });
      throw error;
    }
  }

  // Bulk operations
  public async bulkUpdateCarStatus(
    carIds: string[], 
    status: CarListing['status'], 
    reason?: string,
    adminId?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      carIds.forEach(carId => {
        const carRef = doc(db, 'cars', carId);
        const updateData: Record<string, unknown> = {
          status,
          updatedAt: serverTimestamp()
        };

        if (status === 'suspended') {
          updateData.suspendedAt = serverTimestamp();
          updateData.suspensionReason = reason;
        }

        if (reason) {
          updateData.moderationNotes = reason;
        }

        batch.update(carRef, updateData);
      });

      await batch.commit();
      serviceLogger.info('Bulk car status update completed', { carIds, status, reason, adminId });
    } catch (error) {
      serviceLogger.error('Error in bulk car status update', error as Error, { carIds, status });
      throw error;
    }
  }

  // Get platform statistics
  public async getPlatformStats(): Promise<{
    totalCars: number;
    activeCars: number;
    soldCars: number;
    suspendedCars: number;
    totalPosts: number;
    activePosts: number;
    reportedPosts: number;
    totalUsers: number;
    activeUsers: number;
    totalViews: number;
    totalRevenue: number;
  }> {
    try {
      const [carsSnapshot, postsSnapshot, usersSnapshot] = await Promise.all([
        queryAllCollections(),
        getDocs(collection(db, 'posts')),
        getDocs(collection(db, 'users'))
      ]);

      const cars = carsSnapshot.docs.map(doc => doc.data());
      const posts = postsSnapshot.docs.map(doc => doc.data());
      const users = usersSnapshot.docs.map(doc => doc.data());

      const activeCars = cars.filter(car => car.status === 'active').length;
      const soldCars = cars.filter(car => car.status === 'sold').length;
      const suspendedCars = cars.filter(car => car.status === 'suspended').length;
      
      const activePosts = posts.filter(post => post.status === 'active').length;
      const reportedPosts = posts.filter(post => post.reportCount > 0).length;
      
      const activeUsers = users.filter(user => user.status === 'active').length;
      
      const totalViews = cars.reduce((sum, car) => sum + (car.views || 0), 0) +
                        posts.reduce((sum, post) => sum + (post.views || 0), 0);

      return {
        totalCars: cars.length,
        activeCars,
        soldCars,
        suspendedCars,
        totalPosts: posts.length,
        activePosts,
        reportedPosts,
        totalUsers: users.length,
        activeUsers,
        totalViews,
        totalRevenue: 0 // Calculate from transactions if available
      };
    } catch (error) {
      serviceLogger.error('Error getting platform stats', error as Error);
      return {
        totalCars: 0,
        activeCars: 0,
        soldCars: 0,
        suspendedCars: 0,
        totalPosts: 0,
        activePosts: 0,
        reportedPosts: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalViews: 0,
        totalRevenue: 0
      };
    }
  }

  // Search functionality
  public async searchContent(searchTerm: string, type: 'cars' | 'posts' | 'all' = 'all'): Promise<{
    cars: CarListing[];
    posts: PostData[];
  }> {
    try {
      const results = { cars: [] as CarListing[], posts: [] as PostData[] };
      
      if (type === 'cars' || type === 'all') {
        const carsSnapshot = await queryAllCollections();
        const cars = carsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        } as CarListing));

        results.cars = cars.filter(car => 
          car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (type === 'posts' || type === 'all') {
        const postsSnapshot = await getDocs(collection(db, 'posts'));
        const posts = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        } as PostData));

        results.posts = posts.filter(post => 
          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      return results;
    } catch (error) {
      serviceLogger.error('Error searching content', error as Error, { searchTerm, type });
      return { cars: [], posts: [] };
    }
  }
}

export const superAdminCarsService = SuperAdminCarsService.getInstance();
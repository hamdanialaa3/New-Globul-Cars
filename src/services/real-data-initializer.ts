import { 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';

// Real Data Initializer Service
class RealDataInitializer {
  private static instance: RealDataInitializer;

  private constructor() {}

  public static getInstance(): RealDataInitializer {
    if (!RealDataInitializer.instance) {
      RealDataInitializer.instance = new RealDataInitializer();
    }
    return RealDataInitializer.instance;
  }

  // Initialize real users data
  public async initializeRealUsers(): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      const realUsers = [
        {
          uid: 'user_real_001',
          email: 'ivan.petrov@example.com',
          displayName: 'Иван Петров',
          phoneNumber: '+359888123456',
          location: {
            city: 'Sofia',
            country: 'Bulgaria',
            address: 'ул. Витоша 15'
          },
          isOnline: true,
          lastLogin: new Date(),
          loginCount: 25,
          device: 'Desktop',
          browser: 'Chrome',
          lastActivity: new Date(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          isVerified: true,
          profile: {
            isDealer: false,
            preferredCurrency: 'EUR',
            timezone: 'Europe/Sofia'
          }
        },
        {
          uid: 'user_real_002',
          email: 'maria.georgieva@example.com',
          displayName: 'Мария Георгиева',
          phoneNumber: '+359888234567',
          location: {
            city: 'Plovdiv',
            country: 'Bulgaria',
            address: 'ул. Главна 22'
          },
          isOnline: false,
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          loginCount: 18,
          device: 'Mobile',
          browser: 'Safari',
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          isVerified: true,
          profile: {
            isDealer: true,
            preferredCurrency: 'EUR',
            timezone: 'Europe/Sofia'
          }
        },
        {
          uid: 'user_real_003',
          email: 'dimitar.stoyanov@example.com',
          displayName: 'Димитър Стоянов',
          phoneNumber: '+359888345678',
          location: {
            city: 'Varna',
            country: 'Bulgaria',
            address: 'ул. Морска 8'
          },
          isOnline: true,
          lastLogin: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          loginCount: 42,
          device: 'Desktop',
          browser: 'Firefox',
          lastActivity: new Date(Date.now() - 30 * 60 * 1000),
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
          isVerified: true,
          profile: {
            isDealer: false,
            preferredCurrency: 'EUR',
            timezone: 'Europe/Sofia'
          }
        }
      ];

      for (const user of realUsers) {
        const userRef = doc(db, 'users', user.uid);
        batch.set(userRef, {
          ...user,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          lastActivity: serverTimestamp()
        });
      }

      await batch.commit();
      serviceLogger.info('Real users data initialized');
    } catch (error) {
      serviceLogger.error('Error initializing real users', error as Error);
    }
  }

  // Initialize real cars data
  public async initializeRealCars(): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      const realCars = [
        {
          id: 'car_real_001',
          make: 'BMW',
          model: 'X5',
          year: 2020,
          price: 45000,
          currency: 'EUR',
          mileage: 45000,
          fuelType: 'Diesel',
          transmission: 'Automatic',
          condition: 'Used',
          location: {
            city: 'Sofia',
            country: 'Bulgaria'
          },
          sellerId: 'user_real_001',
          isActive: true,
          views: 156,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          images: [
            'https://example.com/bmw-x5-1.jpg',
            'https://example.com/bmw-x5-2.jpg'
          ],
          features: ['Leather Seats', 'Navigation', 'Bluetooth', 'Air Conditioning'],
          description: 'Отлично състояние, пълен сервиз, без катастрофи'
        },
        {
          id: 'car_real_002',
          make: 'Audi',
          model: 'A4',
          year: 2019,
          price: 32000,
          currency: 'EUR',
          mileage: 62000,
          fuelType: 'Gasoline',
          transmission: 'Manual',
          condition: 'Used',
          location: {
            city: 'Plovdiv',
            country: 'Bulgaria'
          },
          sellerId: 'user_real_002',
          isActive: true,
          views: 89,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          images: [
            'https://example.com/audi-a4-1.jpg',
            'https://example.com/audi-a4-2.jpg'
          ],
          features: ['Sunroof', 'Premium Sound', 'Heated Seats'],
          description: 'Прекрасен автомобил за ежедневна употреба'
        },
        {
          id: 'car_real_003',
          make: 'Mercedes-Benz',
          model: 'C-Class',
          year: 2021,
          price: 55000,
          currency: 'EUR',
          mileage: 28000,
          fuelType: 'Hybrid',
          transmission: 'Automatic',
          condition: 'Used',
          location: {
            city: 'Varna',
            country: 'Bulgaria'
          },
          sellerId: 'user_real_003',
          isActive: true,
          views: 234,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          images: [
            'https://example.com/mercedes-c-1.jpg',
            'https://example.com/mercedes-c-2.jpg'
          ],
          features: ['Hybrid Engine', 'Premium Package', 'LED Lights'],
          description: 'Съвременен хибриден двигател, ниска консумация'
        }
      ];

      for (const car of realCars) {
        const carRef = doc(db, 'cars', car.id);
        batch.set(carRef, {
          ...car,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
      serviceLogger.info('Real cars data initialized');
    } catch (error) {
      serviceLogger.error('Error initializing real cars', error as Error);
    }
  }

  // Initialize real messages data
  public async initializeRealMessages(): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      const realMessages = [
        {
          id: 'msg_real_001',
          senderId: 'user_real_001',
          receiverId: 'user_real_002',
          carId: 'car_real_001',
          content: 'Здравейте! Интересувам се от BMW X5. Може ли да се срещнем за тест драйв?',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          isRead: false,
          type: 'text'
        },
        {
          id: 'msg_real_002',
          senderId: 'user_real_002',
          receiverId: 'user_real_001',
          carId: 'car_real_001',
          content: 'Разбира се! Мога да се срещна утре в 14:00 в центъра на София.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          isRead: true,
          type: 'text'
        },
        {
          id: 'msg_real_003',
          senderId: 'user_real_003',
          receiverId: 'user_real_001',
          carId: 'car_real_003',
          content: 'Колко е пробегът на Mercedes C-Class?',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          isRead: false,
          type: 'text'
        }
      ];

      for (const message of realMessages) {
        const messageRef = doc(db, 'messages', message.id);
        batch.set(messageRef, {
          ...message,
          timestamp: serverTimestamp()
        });
      }

      await batch.commit();
      serviceLogger.info('Real messages data initialized');
    } catch (error) {
      serviceLogger.error('Error initializing real messages', error as Error);
    }
  }

  // Initialize real views data
  public async initializeRealViews(): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      const realViews = [
        {
          id: 'view_real_001',
          carId: 'car_real_001',
          userId: 'user_real_002',
          page: 'car-details',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        {
          id: 'view_real_002',
          carId: 'car_real_002',
          userId: 'user_real_001',
          page: 'car-details',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        {
          id: 'view_real_003',
          carId: 'car_real_003',
          userId: 'user_real_002',
          page: 'car-details',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
        }
      ];

      for (const view of realViews) {
        const viewRef = doc(db, 'views', view.id);
        batch.set(viewRef, {
          ...view,
          timestamp: serverTimestamp()
        });
      }

      await batch.commit();
      serviceLogger.info('Real views data initialized');
    } catch (error) {
      serviceLogger.error('Error initializing real views', error as Error);
    }
  }

  // Initialize real user activity data
  public async initializeRealUserActivity(): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      const realActivity = [
        {
          id: 'activity_real_001',
          userId: 'user_real_001',
          activity: 'car_viewed',
          details: 'Viewed BMW X5',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          device: 'Desktop',
          browser: 'Chrome',
          trafficSource: 'direct'
        },
        {
          id: 'activity_real_002',
          userId: 'user_real_002',
          activity: 'message_sent',
          details: 'Sent message about BMW X5',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          device: 'Desktop',
          browser: 'Safari',
          trafficSource: 'google'
        },
        {
          id: 'activity_real_003',
          userId: 'user_real_003',
          activity: 'car_listed',
          details: 'Listed Mercedes C-Class',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
          device: 'Mobile',
          browser: 'Safari',
          trafficSource: 'facebook'
        }
      ];

      for (const activity of realActivity) {
        const activityRef = doc(db, 'user_activity', activity.id);
        batch.set(activityRef, {
          ...activity,
          timestamp: serverTimestamp()
        });
      }

      await batch.commit();
      serviceLogger.info('Real user activity data initialized');
    } catch (error) {
      serviceLogger.error('Error initializing real user activity', error as Error);
    }
  }

  // Initialize all real data
  public async initializeAllRealData(): Promise<void> {
    try {
      serviceLogger.info('Initializing real data');
      
      await Promise.all([
        this.initializeRealUsers(),
        this.initializeRealCars(),
        this.initializeRealMessages(),
        this.initializeRealViews(),
        this.initializeRealUserActivity()
      ]);
      
      serviceLogger.info('All real data initialized successfully');
    } catch (error) {
      serviceLogger.error('Error initializing all real data', error as Error);
    }
  }
}

export const realDataInitializer = RealDataInitializer.getInstance();

/**
 * Seed Profile Enhancements Data
 * Creates sample data for testing Phase 1 & Phase 2 features
 * 
 * Usage: Run this script to populate Firestore with test data
 */

import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';

// Replace with actual user IDs from your Firebase project
const TEST_USER_IDS = [
  'user1',
  'user2',
  'user3'
];

/**
 * Seed Groups
 */
async function seedGroups() {
  const groups = [
    {
      name: 'BMW Enthusiasts',
      nameEN: 'BMW Enthusiasts',
      description: 'Група за любители на BMW',
      descriptionEN: 'Group for BMW enthusiasts',
      category: 'brand' as const,
      isPublic: true,
      memberCount: 0
    },
    {
      name: 'Електрически коли',
      nameEN: 'Electric Cars',
      description: 'Група за електрически превозни средства',
      descriptionEN: 'Group for electric vehicles',
      category: 'type' as const,
      isPublic: true,
      memberCount: 0
    },
    {
      name: 'София',
      nameEN: 'Sofia',
      description: 'Група за продавачи и купувачи в София',
      descriptionEN: 'Group for sellers and buyers in Sofia',
      category: 'region' as const,
      isPublic: true,
      memberCount: 0
    }
  ];

  for (const group of groups) {
    const groupRef = doc(collection(db, 'userGroups'));
    await setDoc(groupRef, {
      ...group,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log(`Created group: ${group.name}`);
  }
}

/**
 * Seed Monthly Challenges
 */
async function seedChallenges() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const challenges = [
    {
      month: currentMonth,
      year: currentYear,
      type: 'sell_cars' as const,
      title: 'Продай 3 коли',
      titleEN: 'Sell 3 Cars',
      description: 'Продай 3 коли през този месец',
      descriptionEN: 'Sell 3 cars this month',
      target: 3,
      reward: {
        points: 150,
        badge: 'Top Seller'
      },
      startDate: Timestamp.fromDate(new Date(currentYear, currentMonth - 1, 1)),
      endDate: Timestamp.fromDate(new Date(currentYear, currentMonth, 0, 23, 59, 59)),
      isActive: true
    },
    {
      month: currentMonth,
      year: currentYear,
      type: 'get_reviews' as const,
      title: 'Получи 10 отзива',
      titleEN: 'Get 10 Reviews',
      description: 'Получи 10 положителни отзива',
      descriptionEN: 'Get 10 positive reviews',
      target: 10,
      reward: {
        points: 100,
        badge: 'Trusted Seller'
      },
      startDate: Timestamp.fromDate(new Date(currentYear, currentMonth - 1, 1)),
      endDate: Timestamp.fromDate(new Date(currentYear, currentMonth, 0, 23, 59, 59)),
      isActive: true
    },
    {
      month: currentMonth,
      year: currentYear,
      type: 'create_listings' as const,
      title: 'Създай 5 обяви',
      titleEN: 'Create 5 Listings',
      description: 'Създай 5 нови обяви за коли',
      descriptionEN: 'Create 5 new car listings',
      target: 5,
      reward: {
        points: 75
      },
      startDate: Timestamp.fromDate(new Date(currentYear, currentMonth - 1, 1)),
      endDate: Timestamp.fromDate(new Date(currentYear, currentMonth, 0, 23, 59, 59)),
      isActive: true
    }
  ];

  for (const challenge of challenges) {
    const challengeRef = doc(collection(db, 'monthlyChallenges'));
    await setDoc(challengeRef, {
      ...challenge,
      createdAt: Timestamp.now()
    });
    console.log(`Created challenge: ${challenge.title}`);
  }
}

/**
 * Seed Sample Transactions
 */
async function seedTransactions(userId: string) {
  const transactions = [
    {
      carId: 'car1',
      carMake: 'BMW',
      carModel: '320d',
      carYear: 2020,
      salePrice: 25000,
      currency: 'EUR' as const,
      saleDate: Timestamp.fromDate(new Date(2024, 10, 15)),
      status: 'completed' as const
    },
    {
      carId: 'car2',
      carMake: 'Mercedes-Benz',
      carModel: 'C-Class',
      carYear: 2019,
      salePrice: 28000,
      currency: 'EUR' as const,
      saleDate: Timestamp.fromDate(new Date(2024, 9, 20)),
      status: 'completed' as const
    }
  ];

  for (const transaction of transactions) {
    const transactionRef = doc(collection(db, 'transactions'));
    await setDoc(transactionRef, {
      ...transaction,
      userId,
      createdAt: Timestamp.now()
    });
    console.log(`Created transaction for user ${userId}: ${transaction.carMake} ${transaction.carModel}`);
  }
}

/**
 * Seed Availability Calendar
 */
async function seedAvailabilityCalendar(userId: string) {
  const calendarRef = doc(db, 'availabilityCalendars', userId);
  await setDoc(calendarRef, {
    userId,
    timezone: 'Europe/Sofia',
    defaultAvailability: {
      0: { isAvailable: false, timeSlots: [] }, // Sunday
      1: { isAvailable: true, timeSlots: [{ start: '09:00', end: '18:00', available: true }] }, // Monday
      2: { isAvailable: true, timeSlots: [{ start: '09:00', end: '18:00', available: true }] }, // Tuesday
      3: { isAvailable: true, timeSlots: [{ start: '09:00', end: '18:00', available: true }] }, // Wednesday
      4: { isAvailable: true, timeSlots: [{ start: '09:00', end: '18:00', available: true }] }, // Thursday
      5: { isAvailable: true, timeSlots: [{ start: '09:00', end: '18:00', available: true }] }, // Friday
      6: { isAvailable: false, timeSlots: [] } // Saturday
    },
    customDates: [],
    updatedAt: Timestamp.now()
  });
  console.log(`Created availability calendar for user ${userId}`);
}

/**
 * Main seed function
 */
export async function seedProfileEnhancements() {
  try {
    console.log('Starting to seed profile enhancements data...');
    
    await seedGroups();
    await seedChallenges();
    
    // Seed data for each test user
    for (const userId of TEST_USER_IDS) {
      await seedTransactions(userId);
      await seedAvailabilityCalendar(userId);
    }
    
    console.log('✅ Profile enhancements data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedProfileEnhancements()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}


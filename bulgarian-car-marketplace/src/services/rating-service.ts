import { CarDataFromFile } from '../types/CarData';

export interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  categoryRatings: {
    condition: number;
    price: number;
    performance: number;
    reliability: number;
    comfort: number;
  };
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CarRating {
  id: string;
  carId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  overallRating: number;
  categoryRatings: {
    condition: number;
    price: number;
    performance: number;
    reliability: number;
    comfort: number;
  };
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  verifiedPurchase: boolean;
  helpful: number;
  notHelpful: number;
  timestamp: Date;
  language: 'bg' | 'en';
}

export class BulgarianRatingService {
  private ratings: CarRating[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // (Comment removed - was in Arabic)
    this.ratings = [
      {
        id: '1',
        carId: 'bmw-3-series-2020',
        userId: 'user1',
        userName: 'Иван Петров',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Иван',
        overallRating: 4.5,
        categoryRatings: {
          condition: 5,
          price: 4,
          performance: 4.5,
          reliability: 4,
          comfort: 5
        },
        title: 'Отлична кола за цената',
        comment: 'Купих тази кола преди 6 месеца и съм много доволен. Двигателят е мощен, разходът на гориво е приемлив, а комфортът е на високо ниво.',
        pros: ['Мощен двигател', 'Комфортна', 'Добър разход', 'Стилна'],
        cons: ['Скъпа поддръжка'],
        verifiedPurchase: true,
        helpful: 12,
        notHelpful: 1,
        timestamp: new Date('2024-01-15'),
        language: 'bg'
      },
      {
        id: '2',
        carId: 'audi-a4-2019',
        userId: 'user2',
        userName: 'Мария Димитрова',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Мария',
        overallRating: 4.2,
        categoryRatings: {
          condition: 4,
          price: 4.5,
          performance: 4,
          reliability: 4.5,
          comfort: 4
        },
        title: 'Добра кола за ежедневно ползване',
        comment: 'Audi A4 е чудесен избор за семейство. Има достатъчно място, сигурността е на ниво, а технологиите са модерни.',
        pros: ['Сигурност', 'Технологии', 'Комфорт', 'Надеждност'],
        cons: ['Цената', 'Разход на гориво'],
        verifiedPurchase: true,
        helpful: 8,
        notHelpful: 0,
        timestamp: new Date('2024-02-20'),
        language: 'bg'
      }
    ];
  }

  async getRatingSummary(carId: string): Promise<RatingSummary | null> {
    const carRatings = this.ratings.filter(r => r.carId === carId);

    if (carRatings.length === 0) {
      return null;
    }

    const averageRating = carRatings.reduce((sum, r) => sum + r.overallRating, 0) / carRatings.length;

    const categoryRatings = {
      condition: carRatings.reduce((sum, r) => sum + r.categoryRatings.condition, 0) / carRatings.length,
      price: carRatings.reduce((sum, r) => sum + r.categoryRatings.price, 0) / carRatings.length,
      performance: carRatings.reduce((sum, r) => sum + r.categoryRatings.performance, 0) / carRatings.length,
      reliability: carRatings.reduce((sum, r) => sum + r.categoryRatings.reliability, 0) / carRatings.length,
      comfort: carRatings.reduce((sum, r) => sum + r.categoryRatings.comfort, 0) / carRatings.length
    };

    const distribution = {
      1: carRatings.filter(r => Math.floor(r.overallRating) === 1).length,
      2: carRatings.filter(r => Math.floor(r.overallRating) === 2).length,
      3: carRatings.filter(r => Math.floor(r.overallRating) === 3).length,
      4: carRatings.filter(r => Math.floor(r.overallRating) === 4).length,
      5: carRatings.filter(r => Math.floor(r.overallRating) === 5).length
    };

    return {
      averageRating,
      totalRatings: carRatings.length,
      categoryRatings,
      distribution
    };
  }

  async getCarRatings(carId: string, page: number = 1, limit: number = 10): Promise<CarRating[]> {
    const carRatings = this.ratings
      .filter(r => r.carId === carId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return carRatings.slice(startIndex, endIndex);
  }

  async addRating(rating: Omit<CarRating, 'id' | 'timestamp'>): Promise<string> {
    const newRating: CarRating = {
      ...rating,
      id: `rating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.ratings.push(newRating);
    return newRating.id;
  }

  async updateRatingHelpful(ratingId: string, isHelpful: boolean): Promise<void> {
    const rating = this.ratings.find(r => r.id === ratingId);
    if (rating) {
      if (isHelpful) {
        rating.helpful++;
      } else {
        rating.notHelpful++;
      }
    }
  }

  async getUserRatings(userId: string): Promise<CarRating[]> {
    return this.ratings
      .filter(r => r.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const bulgarianRatingService = new BulgarianRatingService();
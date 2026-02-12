/**
 * Social Media Content Service
 * Auto-generates social media posts for car listings
 */

import { serviceLogger } from '../logger-service';

export type SocialPlatform = 'facebook' | 'instagram' | 'twitter' | 'linkedin';

export interface SocialMediaPost {
  platform: SocialPlatform;
  content: string;
  hashtags: string[];
  image?: string;
  link?: string;
}

export interface CarPostData {
  brand: string;
  model: string;
  year: number;
  price: number;
  city: string;
  condition: 'new' | 'used';
  mileage?: number;
  fuelType?: string;
  images: string[];
  url: string;
}

class SocialMediaContentService {
  private static instance: SocialMediaContentService;

  private constructor() {}

  static getInstance(): SocialMediaContentService {
    if (!SocialMediaContentService.instance) {
      SocialMediaContentService.instance = new SocialMediaContentService();
    }
    return SocialMediaContentService.instance;
  }

  /**
   * Generate social media posts for a car listing
   */
  generateCarPosts(car: CarPostData, language: 'bg' | 'en' = 'bg'): SocialMediaPost[] {
    const posts: SocialMediaPost[] = [];

    // Facebook Post (detailed)
    posts.push(this.generateFacebookPost(car, language));

    // Instagram Post (visual, hashtag-heavy)
    posts.push(this.generateInstagramPost(car, language));

    // Twitter Post (short, link-focused)
    posts.push(this.generateTwitterPost(car, language));

    // LinkedIn Post (professional)
    posts.push(this.generateLinkedInPost(car, language));

    return posts;
  }

  /**
   * Generate Facebook post
   */
  private generateFacebookPost(car: CarPostData, language: 'bg' | 'en'): SocialMediaPost {
    const templates = {
      bg: {
        new: `🚗 Нов ${car.brand} ${car.model} ${car.year} г. в ${car.city}!\n\n💰 Цена: ${this.formatPrice(car.price)}\n✅ Състояние: Нов\n🔧 Гориво: ${car.fuelType || 'N/A'}\n📍 Локация: ${car.city}\n\nНе пропускайте тази уникална възможност! Свържете се с нас още днес.\n\n👉 Виж повече тук:`,
        used: `🚙 ${car.brand} ${car.model} ${car.year} г. на изключителна цена в ${car.city}!\n\n💰 Само ${this.formatPrice(car.price)}\n⏱️ Пробег: ${this.formatMileage(car.mileage)}\n🔧 Гориво: ${car.fuelType || 'N/A'}\n📍 ${car.city}\n\nОтлично състояние, проверена история!\n\n👉 Подробности:`
      },
      en: {
        new: `🚗 Brand New ${car.brand} ${car.model} ${car.year} in ${car.city}!\n\n💰 Price: ${this.formatPrice(car.price)}\n✅ Condition: New\n🔧 Fuel: ${car.fuelType || 'N/A'}\n📍 Location: ${car.city}\n\nDon't miss this unique opportunity! Contact us today.\n\n👉 See more:`,
        used: `🚙 ${car.brand} ${car.model} ${car.year} at an amazing price in ${car.city}!\n\n💰 Only ${this.formatPrice(car.price)}\n⏱️ Mileage: ${this.formatMileage(car.mileage)}\n🔧 Fuel: ${car.fuelType || 'N/A'}\n📍 ${car.city}\n\nExcellent condition, verified history!\n\n👉 Details:`
      }
    };

    const template = templates[language][car.condition];
    const hashtags = this.generateHashtags(car, language, 'facebook');

    return {
      platform: 'facebook',
      content: `${template} ${car.url}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`,
      hashtags,
      image: car.images[0],
      link: car.url
    };
  }

  /**
   * Generate Instagram post
   */
  private generateInstagramPost(car: CarPostData, language: 'bg' | 'en'): SocialMediaPost {
    const templates = {
      bg: `${car.brand} ${car.model} ${car.year} 🚗✨\n\n💰 ${this.formatPrice(car.price)}\n📍 ${car.city}\n\n${car.condition === 'new' ? '✨ Нов автомобил' : `⏱️ ${this.formatMileage(car.mileage)}`}\n\n🔗 Линк в био`,
      en: `${car.brand} ${car.model} ${car.year} 🚗✨\n\n💰 ${this.formatPrice(car.price)}\n📍 ${car.city}\n\n${car.condition === 'new' ? '✨ Brand New' : `⏱️ ${this.formatMileage(car.mileage)}`}\n\n🔗 Link in bio`
    };

    const hashtags = this.generateHashtags(car, language, 'instagram');

    return {
      platform: 'instagram',
      content: `${templates[language]}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`,
      hashtags,
      image: car.images[0],
      link: car.url
    };
  }

  /**
   * Generate Twitter post
   */
  private generateTwitterPost(car: CarPostData, language: 'bg' | 'en'): SocialMediaPost {
    const templates = {
      bg: `🚗 ${car.brand} ${car.model} ${car.year}\n💰 ${this.formatPrice(car.price)}\n📍 ${car.city}\n\n${car.condition === 'new' ? 'Нов' : this.formatMileage(car.mileage)}`,
      en: `🚗 ${car.brand} ${car.model} ${car.year}\n💰 ${this.formatPrice(car.price)}\n📍 ${car.city}\n\n${car.condition === 'new' ? 'New' : this.formatMileage(car.mileage)}`
    };

    const hashtags = this.generateHashtags(car, language, 'twitter').slice(0, 3); // Twitter limit

    return {
      platform: 'twitter',
      content: `${templates[language]}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}\n\n${car.url}`,
      hashtags,
      image: car.images[0],
      link: car.url
    };
  }

  /**
   * Generate LinkedIn post
   */
  private generateLinkedInPost(car: CarPostData, language: 'bg' | 'en'): SocialMediaPost {
    const templates = {
      bg: `Представяме ви ${car.brand} ${car.model} ${car.year} г.\n\nТози автомобил е на разположение в ${car.city} на конкурентна цена от ${this.formatPrice(car.price)}.\n\n${car.condition === 'new' ? 'Нов автомобил с пълна гаранция.' : `Употребяван автомобил с ${this.formatMileage(car.mileage)}, в отлично състояние.`}\n\nЗа повече информация и оглед:\n${car.url}\n\n#КолиБългария #АвтомобилиБългария #${car.city}`,
      en: `Introducing ${car.brand} ${car.model} ${car.year}\n\nThis vehicle is available in ${car.city} at a competitive price of ${this.formatPrice(car.price)}.\n\n${car.condition === 'new' ? 'Brand new car with full warranty.' : `Used car with ${this.formatMileage(car.mileage)}, in excellent condition.`}\n\nFor more information and viewing:\n${car.url}\n\n#CarsBulgaria #AutomotiveBulgaria #${car.city}`
    };

    const hashtags = this.generateHashtags(car, language, 'linkedin');

    return {
      platform: 'linkedin',
      content: templates[language],
      hashtags,
      image: car.images[0],
      link: car.url
    };
  }

  /**
   * Generate platform-specific hashtags
   */
  private generateHashtags(car: CarPostData, language: 'bg' | 'en', platform: SocialPlatform): string[] {
    const baseHashtags = {
      bg: [
        'КолиБългария',
        'АвтомобилиБългария',
        'БългарскиАвтомобили',
        car.brand,
        car.model.replace(/\s/g, ''),
        car.city,
        car.condition === 'new' ? 'НовАвтомобил' : 'УпотребяванАвтомобил',
        'КупиКола',
        'ПродамКола'
      ],
      en: [
        'CarsBulgaria',
        'BulgariaCars',
        'BulgarianCars',
        car.brand,
        car.model.replace(/\s/g, ''),
        car.city,
        car.condition === 'new' ? 'NewCar' : 'UsedCar',
        'BuyCar',
        'SellCar'
      ]
    };

    let hashtags = baseHashtags[language];

    // Platform-specific adjustments
    if (platform === 'instagram') {
      // Instagram allows more hashtags
      hashtags.push(
        ...(language === 'bg' 
          ? ['АвтоБългария', 'КолиНаПродан', 'АвтомобилиПродажба']
          : ['CarsForSale', 'AutoBulgaria', 'CarSale'])
      );
    } else if (platform === 'twitter') {
      // Twitter - keep it short
      hashtags = hashtags.slice(0, 5);
    }

    return hashtags;
  }

  /**
   * Format price for display
   */
  private formatPrice(price: number): string {
    return `${price.toLocaleString('bg-BG')} лв`;
  }

  /**
   * Format mileage for display
   */
  private formatMileage(mileage?: number): string {
    if (!mileage) return 'N/A';
    return `${mileage.toLocaleString('bg-BG')} км`;
  }

  /**
   * Generate post for new listing (convenience method)
   */
  async generatePostsForNewListing(carId: string, carData: CarPostData): Promise<SocialMediaPost[]> {
    try {
      const posts = this.generateCarPosts(carData, 'bg');
      serviceLogger.info('Generated social media posts for car:', carId);
      return posts;
    } catch (error) {
      serviceLogger.error('Error generating social media posts:', error);
      throw new Error('Failed to generate social media posts');
    }
  }

  /**
   * Schedule post (placeholder - integrate with actual social media APIs)
   */
  async schedulePost(post: SocialMediaPost, scheduledTime?: Date): Promise<string> {
    try {
      serviceLogger.info(`Scheduling ${post.platform} post${scheduledTime ? ` for ${scheduledTime}` : ' immediately'}`);
      
      // TODO: Integrate with:
      // - Facebook Graph API
      // - Instagram Graph API
      // - Twitter API v2
      // - LinkedIn API
      
      // For now, just log
      serviceLogger.info('Post content:', post.content);
      
      return 'mock-post-id';
    } catch (error) {
      serviceLogger.error('Error scheduling post:', error);
      throw new Error('Failed to schedule post');
    }
  }

  /**
   * Generate promotional campaign posts
   */
  generatePromotionalCampaign(theme: string, language: 'bg' | 'en' = 'bg'): SocialMediaPost[] {
    const campaigns = {
      bg: {
        weekend: {
          content: `🎉 Уикенд оферти в Koli.one! 🎉\n\nСпециални цени на избрани автомобили само този уикенд!\n\n🚗 Над 1000 автомобила на изключителни цени\n💰 Финансиране на място\n✅ Проверена история\n\n👉 Разгледайте офертите:`,
          hashtags: ['УикендОферти', 'АвтомобилиБългария', 'СпециалниЦени']
        },
        seasonal: {
          content: `🍂 Есенни оферти в Koli.one! 🍂\n\nПодгответе се за зимата с надежден автомобил!\n\n❄️ Зимни гуми на промоция\n🔧 Безплатна проверка\n💰 Най-добри цени\n\n👉 Вижте офертите:`,
          hashtags: ['ЕсенниОферти', 'ЗимниГуми', 'АвтомобилиБългария']
        }
      },
      en: {
        weekend: {
          content: `🎉 Weekend Deals at Koli.one! 🎉\n\nSpecial prices on selected cars this weekend only!\n\n🚗 Over 1000 cars at amazing prices\n💰 On-site financing\n✅ Verified history\n\n👉 Check offers:`,
          hashtags: ['WeekendDeals', 'CarsBulgaria', 'SpecialPrices']
        },
        seasonal: {
          content: `🍂 Autumn Offers at Koli.one! 🍂\n\nGet ready for winter with a reliable car!\n\n❄️ Winter tires on sale\n🔧 Free inspection\n💰 Best prices\n\n👉 See offers:`,
          hashtags: ['AutumnOffers', 'WinterTires', 'CarsBulgaria']
        }
      }
    };

    const campaign = campaigns[language][theme as keyof typeof campaigns['bg']] || campaigns[language].weekend;

    return [
      {
        platform: 'facebook',
        content: `${campaign.content} https://koli.one\n\n${campaign.hashtags.map(tag => `#${tag}`).join(' ')}`,
        hashtags: campaign.hashtags,
        link: 'https://koli.one'
      },
      {
        platform: 'instagram',
        content: `${campaign.content.split('\n').slice(0, 3).join('\n')}\n\n🔗 Link in bio\n\n${campaign.hashtags.map(tag => `#${tag}`).join(' ')}`,
        hashtags: campaign.hashtags,
        link: 'https://koli.one'
      }
    ];
  }
}

export const socialMediaContentService = SocialMediaContentService.getInstance();

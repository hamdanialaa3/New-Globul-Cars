// src/services/social/expert-badges.service.ts
// Expert Badges Service - Gamification system
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@globul-cars/services/firebase/firebase-config';
import { logger } from '../logger-service';

// ==================== BADGE DEFINITIONS ====================

export interface Badge {
  id: string;
  nameEn: string;
  nameBg: string;
  descriptionEn: string;
  descriptionBg: string;
  icon: string;
  color: string;
  requirement: {
    totalConsultations?: number;
    averageRating?: number;
    responseTime?: number;
    successRate?: number;
  };
}

export const BADGES: Record<string, Badge> = {
  FIRST_CONSULTATION: {
    id: 'first_consultation',
    nameEn: 'First Step',
    nameBg: 'Първа стъпка',
    descriptionEn: 'Completed your first consultation',
    descriptionBg: 'Завършена първа консултация',
    icon: 'target',
    color: '#4CAF50',
    requirement: { totalConsultations: 1 }
  },
  
  HELPFUL_ADVISOR: {
    id: 'helpful_advisor',
    nameEn: 'Helpful Advisor',
    nameBg: 'Полезен съветник',
    descriptionEn: '10+ consultations with 4.0+ rating',
    descriptionBg: '10+ консултации с рейтинг 4.0+',
    icon: 'heart',
    color: '#E91E63',
    requirement: { totalConsultations: 10, averageRating: 4.0 }
  },
  
  TOP_EXPERT: {
    id: 'top_expert',
    nameEn: 'Top Expert',
    nameBg: 'Топ експерт',
    descriptionEn: '50+ consultations with 4.5+ rating',
    descriptionBg: '50+ консултации с рейтинг 4.5+',
    icon: 'trophy',
    color: '#FFD700',
    requirement: { totalConsultations: 50, averageRating: 4.5 }
  },
  
  QUICK_RESPONDER: {
    id: 'quick_responder',
    nameEn: 'Quick Responder',
    nameBg: 'Бърз отговор',
    descriptionEn: 'Average response time under 30 minutes',
    descriptionBg: 'Среден отговор под 30 минути',
    icon: 'zap',
    color: '#FF9800',
    requirement: { responseTime: 30 }
  },
  
  TRUSTED_ADVISOR: {
    id: 'trusted_advisor',
    nameEn: 'Trusted Advisor',
    nameBg: 'Доверен съветник',
    descriptionEn: '100+ consultations with 95%+ success rate',
    descriptionBg: '100+ консултации с 95%+ успеваемост',
    icon: 'shield',
    color: '#1976D2',
    requirement: { totalConsultations: 100, successRate: 95 }
  }
};

// ==================== SERVICE ====================

class ExpertBadgesService {
  
  async checkAndAwardBadges(expertId: string): Promise<string[]> {
    try {
      const expertProfileDoc = await getDoc(doc(db, 'expert_profiles', expertId));
      
      if (!expertProfileDoc.exists()) return [];
      
      const profile = expertProfileDoc.data();
      const stats = profile.consultationStats || {};
      const currentBadges = profile.badges || [];
      
      const newBadges: string[] = [];
      
      for (const [key, badge] of Object.entries(BADGES)) {
        if (currentBadges.includes(badge.id)) continue;
        
        const req = badge.requirement;
        let qualifies = true;
        
        if (req.totalConsultations && stats.totalConsultations < req.totalConsultations) {
          qualifies = false;
        }
        
        if (req.averageRating && stats.averageRating < req.averageRating) {
          qualifies = false;
        }
        
        if (req.responseTime && stats.responseTime > req.responseTime) {
          qualifies = false;
        }
        
        if (req.successRate && stats.successRate < req.successRate) {
          qualifies = false;
        }
        
        if (qualifies) {
          newBadges.push(badge.id);
        }
      }
      
      if (newBadges.length > 0) {
        await updateDoc(doc(db, 'expert_profiles', expertId), {
          badges: arrayUnion(...newBadges)
        });
      }
      
      return newBadges;
    } catch (error) {
      logger.error('Error checking expert badges', error as Error, { expertId });
      return [];
    }
  }
  
  getBadgeInfo(badgeId: string, language: 'bg' | 'en'): { name: string; description: string; icon: string; color: string } | null {
    const badge = Object.values(BADGES).find(b => b.id === badgeId);
    if (!badge) return null;
    
    return {
      name: language === 'bg' ? badge.nameBg : badge.nameEn,
      description: language === 'bg' ? badge.descriptionBg : badge.descriptionEn,
      icon: badge.icon,
      color: badge.color
    };
  }
}

export const expertBadgesService = new ExpertBadgesService();


// src/pages/ProfilePage/ConsultationsTab.tsx
// Consultations Tab Component
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  MessageSquare, 
  Star, 
  Clock, 
  Award,
  Send,
  CheckCircle
} from 'lucide-react';
import { 
  consultationsService, 
  Consultation 
} from '@/services/social/consultations.service';
import RequestConsultationModal from '@/components/Consultations/RequestConsultationModal';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  width: 100%;
`;

const ExpertCard = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 2px solid var(--border-primary);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: var(--shadow-lg);
    border-color: var(--border-secondary);
  }
`;

const ExpertHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  
  svg {
    color: var(--accent-primary);
  }
  
  h3 {
    margin: 0 0 4px 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
`;

const ExpertStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatBox = styled.div`
  text-align: center;
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent-primary);
    margin-bottom: 4px;
  }
  
  .label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
  }
`;

const RequestButton = styled.button`
  width: 100%;
  padding: 16px;
  border: none;
  background: var(--accent-primary);
  color: var(--text-inverse);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    opacity: 0.9;
  }
`;

const ConsultationsList = styled.div`
  h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 20px 0;
  }
`;

const ConsultationCard = styled.div`
  background: var(--bg-card);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--accent-primary);
  }
`;

const ConsultationHeader = styled.div<{ $status?: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  .category {
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: 12px;
    background: #e3f2fd;
    color: #1976d2;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .status {
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 600;
    background: ${(props) => {
      switch (props.$status) {
        case 'completed': return '#e8f5e9';
        case 'in_progress': return '#fff3e0';
        case 'open': return '#f3e5f5';
        default: return '#f5f5f5';
      }
    }};
    color: ${(props) => {
      switch (props.$status) {
        case 'completed': return '#2e7d32';
        case 'in_progress': return '#ef6c00';
        case 'open': return '#6a1b9a';
        default: return '#616161';
      }
    }};
  }
`;

const ConsultationBody = styled.div`
  h4 {
    margin: 0 0 8px 0;
    font-size: 1.05rem;
    font-weight: 600;
    color: #212529;
  }
  
  p {
    margin: 0 0 12px 0;
    font-size: 0.9rem;
    color: #495057;
    line-height: 1.6;
  }
`;

const ConsultationFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  
  .meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85rem;
    color: #6c757d;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
  
  .rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #f59e0b;
  }
  
  button {
    margin-left: auto;
    padding: 6px 14px;
    border: 1px solid #dee2e6;
    background: white;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #495057;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f8f9fa;
      border-color: #FF8F10;
      color: #FF7900;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  
  svg {
    color: #dee2e6;
    margin-bottom: 16px;
  }
  
  h4 {
    font-size: 1.2rem;
    color: #495057;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 0.95rem;
    color: #6c757d;
  }
`;

// ==================== COMPONENT ====================

interface ConsultationsTabProps {
  userId: string;
  isOwnProfile: boolean;
}

const ConsultationsTab: React.FC<ConsultationsTabProps> = ({ 
  userId, 
  isOwnProfile 
}) => {
  const { language } = useLanguage();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  useEffect(() => {
    loadConsultations();
  }, [userId]);
  
  const loadConsultations = async () => {
    try {
      // ✅ CRITICAL FIX: Guard against null/undefined userId
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        console.warn('[ConsultationsTab] loadConsultations called with invalid userId', { userId });
        setConsultations([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      const [userConsults, expertConsults] = await Promise.all([
        consultationsService.getUserConsultations(userId),
        consultationsService.getExpertConsultations(userId)
      ]);
      
      const allConsults = [...userConsults, ...expertConsults]
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      
      setConsultations(allConsults);
    } catch (error) {
      console.error('Error loading consultations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const t = (key: string) => {
    const translations: Record<string, any> = {
      bg: {
        title: 'Консултации',
        request: 'Поискайте консултация',
        yourConsultations: 'Вашите консултации',
        noConsultations: 'Все още няма консултации',
        noConsultationsDesc: 'Започнете, като поискате съвет от експерт',
        viewDetails: 'Виж детайли'
      },
      en: {
        title: 'Consultations',
        request: 'Request Consultation',
        yourConsultations: 'Your Consultations',
        noConsultations: 'No consultations yet',
        noConsultationsDesc: 'Start by requesting advice from an expert',
        viewDetails: 'View Details'
      }
    };
    return translations[language]?.[key] || key;
  };
  
  if (loading) {
    return (
      <Container>
        <EmptyState>
          <MessageSquare size={48} />
          <p>Loading...</p>
        </EmptyState>
      </Container>
    );
  }
  
  return (
    <Container>
      {!isOwnProfile && (
        <RequestButton onClick={() => setShowRequestModal(true)}>
          <MessageSquare size={20} />
          {t('request')}
        </RequestButton>
      )}
      
      <RequestConsultationModal
        isOpen={showRequestModal}
        expertId={userId}
        onClose={() => setShowRequestModal(false)}
        onSuccess={loadConsultations}
      />
      
      <ConsultationsList>
        <h3>{t('yourConsultations')}</h3>
        
        {consultations.length === 0 ? (
          <EmptyState>
            <MessageSquare size={48} />
            <h4>{t('noConsultations')}</h4>
            <p>{t('noConsultationsDesc')}</p>
          </EmptyState>
        ) : (
          consultations.map(consultation => (
            <ConsultationCard key={consultation.id}>
              <ConsultationHeader $status={consultation.status}>
                <div className="category">{consultation.category}</div>
                <div className="status">{consultation.status}</div>
              </ConsultationHeader>
              
              <ConsultationBody>
                <h4>{consultation.topic}</h4>
                <p>{consultation.description}</p>
              </ConsultationBody>
              
              <ConsultationFooter>
                <div className="meta">
                  <Clock size={14} />
                  {consultation.createdAt.toDate().toLocaleDateString()}
                </div>
                
                {consultation.rating && (
                  <div className="rating">
                    <Star size={14} fill="currentColor" />
                    {consultation.rating.score}/5
                  </div>
                )}
                
                <button>{t('viewDetails')}</button>
              </ConsultationFooter>
            </ConsultationCard>
          ))
        )}
      </ConsultationsList>
    </Container>
  );
};

export default ConsultationsTab;


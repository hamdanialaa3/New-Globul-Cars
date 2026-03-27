// My Drafts Page - View and manage saved drafts
// صفحة مسوداتي - عرض وإدارة المسودات المحفوظة

import React, { useEffect, useState } from 'react';
import { logger } from '@/services/logger-service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import DraftsService, { Draft } from '@/services/drafts-service';
import styled from 'styled-components';
import { FileText, Trash2, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 1rem;
`;

const DraftsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const DraftCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.15);
  }
`;

const DraftHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const DraftTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
`;

const ProgressBadge = styled.div<{ $percentage: number }>`
  background: ${props => 
    props.$percentage === 100 ? '#10b981' :
    props.$percentage >= 50 ? '#3b82f6' : '#64748b'
  };
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const DraftMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
  padding: 1rem 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const DraftActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;

  ${props => {
    if (props.$variant === 'danger') {
      return `
        background: #fee2e2;
        color: #dc2626;
        &:hover {
          background: #fecaca;
        }
      `;
    }
    return `
      background: linear-gradient(135deg, #3b82f6, #005ca9);
      color: white;
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
      }
    `;
  }}

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const EmptyText = styled.p`
  color: #7f8c8d;
  margin: 0 0 1.5rem 0;
`;

const StartButton = styled.button`
  background: linear-gradient(135deg, #3b82f6, #005ca9);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const MyDraftsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrafts();
  }, [currentUser]);

  const loadDrafts = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const userDrafts = await DraftsService.getUserDrafts(currentUser.uid);
      setDrafts(userDrafts);
    } catch (error) {
        logger.error('Error loading drafts', error as Error, { userId: currentUser?.uid });
      toast.error('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = (draft: Draft) => {
    // Store draft ID in localStorage for retrieval
    localStorage.setItem('current_draft_id', draft.id);
    
    // Navigate to appropriate step
    const stepRoutes = [
      '/sell/auto',
      '/sell/inserat/car/verkaeufertyp',
      '/sell/inserat/car/fahrzeugdaten',
      '/sell/inserat/car/equipment',
      '/sell/inserat/car/images',
      '/sell/inserat/car/pricing',
      '/sell/contact'
    ];

    const route = stepRoutes[Math.min(draft.currentStep, stepRoutes.length - 1)];
    navigate(route);
  };

  const handleDelete = async (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm(language === 'bg' 
      ? 'Сигурни ли сте, че искате да изтриете тази чернова?' 
      : 'Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      await DraftsService.deleteDraft(draftId);
      setDrafts(prev => prev.filter(d => d.id !== draftId));
      toast.success(language === 'bg' ? 'Черновата е изтрита' : 'Draft deleted');
    } catch (error) {
      logger.error('Error deleting draft', error as Error, { draftId });
      toast.error('Failed to delete draft');
    }
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return language === 'bg' ? 'Днес' : 'Today';
    if (days === 1) return language === 'bg' ? 'Вчера' : 'Yesterday';
    if (days < 7) return `${days} ${language === 'bg' ? 'дни' : 'days'} ${language === 'bg' ? 'преди' : 'ago'}`;
    
    return date.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US');
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <RefreshCw size={48} className="animate-spin" color="#3b82f6" />
          <p>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</p>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FileText />
          {language === 'bg' ? 'Моите чернови' : 'My Drafts'}
        </Title>
        <Subtitle>
          {language === 'bg' 
            ? `${drafts.length} ${drafts.length === 1 ? 'чернова' : 'чернови'} запазени` 
            : `${drafts.length} ${drafts.length === 1 ? 'draft' : 'drafts'} saved`}
        </Subtitle>
      </Header>

      {drafts.length === 0 ? (
        <EmptyState>
          <EmptyIcon>📝</EmptyIcon>
          <EmptyTitle>
            {language === 'bg' ? 'Нямате чернови' : 'No drafts yet'}
          </EmptyTitle>
          <EmptyText>
            {language === 'bg' 
              ? 'Започнете да добавяте кола и тя ще бъде автоматично запазена като чернова' 
              : 'Start adding a car and it will be automatically saved as a draft'}
          </EmptyText>
          <StartButton onClick={() => navigate('/sell')}>
            {language === 'bg' ? 'Започнете сега' : 'Start Now'}
          </StartButton>
        </EmptyState>
      ) : (
        <DraftsGrid>
          {drafts.map(draft => (
            <DraftCard key={draft.id} onClick={() => handleContinue(draft)}>
              <DraftHeader>
                <DraftTitle>
                  {DraftsService.getDraftSummary(draft)}
                </DraftTitle>
                <ProgressBadge $percentage={draft.completionPercentage}>
                  {draft.completionPercentage}%
                </ProgressBadge>
              </DraftHeader>

              <DraftMeta>
                <MetaItem>
                  <Clock />
                  {language === 'bg' ? 'Последна промяна: ' : 'Last updated: '}
                  {formatDate(draft.updatedAt)}
                </MetaItem>
                <MetaItem>
                  <FileText />
                  {language === 'bg' ? 'Стъпка ' : 'Step '}
                  {draft.currentStep + 1} / {draft.totalSteps}
                </MetaItem>
              </DraftMeta>

              <DraftActions>
                <Button onClick={(e) => { e.stopPropagation(); handleContinue(draft); }}>
                  <ArrowRight />
                  {language === 'bg' ? 'Продължи' : 'Continue'}
                </Button>
                <Button $variant="danger" onClick={(e) => handleDelete(draft.id, e)}>
                  <Trash2 />
                  {language === 'bg' ? 'Изтрий' : 'Delete'}
                </Button>
              </DraftActions>
            </DraftCard>
          ))}
        </DraftsGrid>
      )}
    </Container>
  );
};

export default MyDraftsPage;




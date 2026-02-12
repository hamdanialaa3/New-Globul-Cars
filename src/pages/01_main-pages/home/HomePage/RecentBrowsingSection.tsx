import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import PremiumHomeCarCard from '../../../../components/CarCard/PremiumHomeCarCard';
import { getBrowsingHistory, clearBrowsingHistory, BrowsingHistoryItem } from './browsingHistory';
import { History, Clock, Eye, Trash2, Search, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import HorizontalScrollContainer from '../../../../components/HorizontalScrollContainer/HorizontalScrollContainer';
import { glassPrimaryButton, glassDangerButton } from '../../../../styles/glassmorphism-buttons';

// Styled Components
const SectionContainer = styled.section<{ $isDark: boolean }>`
  padding: 80px 20px;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'};
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease;

  @media (max-width: 768px) {
    padding: 50px 16px;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
  position: relative;
  z-index: 2;
`;

const SmartBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 16px;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
`;

const SectionTitle = styled.h2<{ $isDark: boolean }>`
  font-size: 2.75rem;
  font-weight: 900;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 20px;
  letter-spacing: -0.5px;
  text-shadow: ${props => props.$isDark
    ? '0 4px 20px rgba(0, 0, 0, 0.5)'
    : '0 2px 10px rgba(0, 0, 0, 0.1)'};
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled.p<{ $isDark: boolean }>`
  font-size: 1.25rem;
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 1.0625rem;
  }
`;

const CarsContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const EmptyState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 80px 20px;
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  
  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const EmptyIcon = styled.div<{ $isDark: boolean }>`
  margin-bottom: 24px;
  opacity: 0.5;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  
  svg {
    width: 80px;
    height: 80px;
  }
`;

const EmptyTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 12px;
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const EmptyText = styled.p<{ $isDark: boolean }>`
  font-size: 1.125rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  max-width: 500px;
  margin: 0 auto 32px;
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const BrowseButton = styled.button`
  ${glassPrimaryButton}
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 700;
  
  /* Orange glass effect */
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.4) 0%, 
    rgba(217, 119, 6, 0.2) 100%
  );
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fff;

  &:hover {
    background: linear-gradient(135deg, 
      rgba(245, 158, 11, 0.6) 0%, 
      rgba(217, 119, 6, 0.3) 100%
    );
    box-shadow: 
      0 8px 32px 0 rgba(245, 158, 11, 0.5),
      0 0 20px rgba(245, 158, 11, 0.4);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 12px 28px;
    font-size: 0.9375rem;
  }
`;

const ClearButton = styled.button`
  ${glassDangerButton}
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 40px auto 0;
  padding: 12px 28px;
  border-radius: 30px;
  font-size: 0.9375rem;
  font-weight: 700;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 10px 24px;
    font-size: 0.875rem;
  }
`;

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.05;
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px);
  pointer-events: none;
`;

const TimeBadgeOverlay = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 3;
  
  @media (max-width: 768px) {
    top: 12px;
    left: 12px;
    padding: 6px 12px;
    font-size: 0.75rem;
  }
`;

const ViewCountBadge = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
  z-index: 3;
  
  @media (max-width: 768px) {
    bottom: 12px;
    right: 12px;
    padding: 5px 12px;
    font-size: 0.6875rem;
  }
`;

// Export utility for external use (re-exporting from helper)
export { addToBrowsingHistory } from './browsingHistory';

const RecentBrowsingSection: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [browsingHistory, setBrowsingHistory] = useState<BrowsingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const history = getBrowsingHistory();
    setBrowsingHistory(history);
    setLoading(false);
  }, []);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (language === 'bg') {
      if (diffMins < 1) return 'Току-що';
      if (diffMins < 60) return `преди ${diffMins} мин`;
      if (diffHours < 24) return `преди ${diffHours} ч`;
      if (diffDays < 7) return `преди ${diffDays} дни`;
      return date.toLocaleDateString('bg-BG');
    } else {
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US');
    }
  };

  const handleClearHistory = () => {
    clearBrowsingHistory();
    setBrowsingHistory([]);
  };

  const handleBrowseClick = () => {
    navigate('/search');
  };

  const sortedHistory = useMemo(() => {
    return [...browsingHistory].sort((a, b) =>
      b.viewedAt.getTime() - a.viewedAt.getTime()
    );
  }, [browsingHistory]);

  if (loading) {
    return (
      <SectionContainer $isDark={isDark}>
        <BackgroundPattern />
        <SectionHeader>
          <SmartBadge>
            <History size={16} />
            <span>{language === 'bg' ? 'История' : 'History'}</span>
          </SmartBadge>
          <SectionTitle $isDark={isDark}>
            {language === 'bg' ? 'Последно разгледани' : 'Recently Viewed'}
          </SectionTitle>
          <SectionSubtitle $isDark={isDark}>
            {language === 'bg' ? 'Зареждане...' : 'Loading...'}
          </SectionSubtitle>
        </SectionHeader>
      </SectionContainer>
    );
  }

  if (sortedHistory.length === 0) {
    return (
      <SectionContainer $isDark={isDark}>
        <BackgroundPattern />
        <SectionHeader>
          <SmartBadge>
            <History size={16} />
            <span>{language === 'bg' ? 'История' : 'History'}</span>
          </SmartBadge>
          <SectionTitle $isDark={isDark}>
            {language === 'bg' ? 'Последно разгледани' : 'Recently Viewed'}
          </SectionTitle>
          <SectionSubtitle $isDark={isDark}>
            {language === 'bg'
              ? 'Вашата лична история на разгледаните автомобили'
              : 'Your personal history of viewed cars'}
          </SectionSubtitle>
        </SectionHeader>
        <EmptyState $isDark={isDark}>
          <EmptyIcon $isDark={isDark}>
            <Search />
          </EmptyIcon>
          <EmptyTitle $isDark={isDark}>
            {language === 'bg'
              ? 'Все още не сте разглеждали автомобили'
              : "You haven't viewed any cars yet"}
          </EmptyTitle>
          <EmptyText $isDark={isDark}>
            {language === 'bg'
              ? 'Започнете да разглеждате наличните автомобили и вашата история ще се запази тук автоматично.'
              : 'Start browsing available cars and your history will be saved here automatically.'}
          </EmptyText>
          <BrowseButton onClick={handleBrowseClick}>
            {language === 'bg' ? 'Разгледай автомобили' : 'Browse Cars'}
            <ArrowRight size={18} />
          </BrowseButton>
        </EmptyState>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer $isDark={isDark}>
      <BackgroundPattern />

      <SectionHeader>
        <SmartBadge>
          <History size={16} />
          <span>{language === 'bg' ? 'История' : 'History'}</span>
        </SmartBadge>
        <SectionTitle $isDark={isDark}>
          {language === 'bg' ? 'Последно разгледани' : 'Recently Viewed'}
        </SectionTitle>
        <SectionSubtitle $isDark={isDark}>
          {language === 'bg'
            ? `Вашата лична история с ${sortedHistory.length} разгледани автомобила`
            : `Your personal history with ${sortedHistory.length} viewed cars`}
        </SectionSubtitle>
      </SectionHeader>

      <CarsContainer>
        <HorizontalScrollContainer
          gap="32px"
          padding="0"
          itemMinWidth="320px"
          showArrows={true}
        >
          {sortedHistory.map((item, index) => (
              <div key={`${item.listing.id}-${index}`} style={{ position: 'relative', perspective: '1000px' }}>
                <PremiumHomeCarCard car={item.listing as any} />
                <TimeBadgeOverlay>
                  <Clock size={14} />
                  {formatTimeAgo(item.viewedAt)}
                </TimeBadgeOverlay>
                <ViewCountBadge>
                  <Eye size={14} />
                  {item.viewCount} {language === 'bg'
                    ? (item.viewCount === 1 ? 'преглед' : 'прегледа')
                    : (item.viewCount === 1 ? 'view' : 'views')}
                </ViewCountBadge>
              </div>
          ))}
        </HorizontalScrollContainer>
      </CarsContainer>

      <ClearButton onClick={handleClearHistory}>
        <Trash2 size={18} />
        {language === 'bg' ? 'Изчисти историята' : 'Clear History'}
      </ClearButton>
    </SectionContainer>
  );
};

export default RecentBrowsingSection;

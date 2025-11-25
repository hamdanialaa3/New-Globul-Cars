// Recent Browsing Section with Modern Car Cards
// شاهدت مؤخراً مع بطاقات سيارات حديثة

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { CarListing } from '@globul-cars/core/typesCarListing';
import ModernCarCard from './ModernCarCard';

// Styled Components
const SectionContainer = styled.section`
  padding: 80px 20px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  position: relative;
  overflow: hidden;

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

const SectionTitle = styled.h2`
  font-size: 2.75rem;
  font-weight: 900;
  color: white;
  margin-bottom: 20px;
  letter-spacing: -0.5px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.25rem;
  color: #cbd5e1;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.0625rem;
  }
`;

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #cbd5e1;
  
  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

const EmptyIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 24px;
  opacity: 0.5;
  
  @media (max-width: 768px) {
    font-size: 4rem;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const EmptyText = styled.p`
  font-size: 1.125rem;
  color: #94a3b8;
  max-width: 500px;
  margin: 0 auto 32px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const BrowseButton = styled.button`
  padding: 14px 32px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
  }

  @media (max-width: 768px) {
    padding: 12px 28px;
    font-size: 0.9375rem;
  }
`;

const ClearButton = styled.button`
  display: block;
  margin: 40px auto 0;
  padding: 12px 28px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 2px solid #ef4444;
  border-radius: 30px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #ef4444;
    color: white;
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

// Browsing History Interface
interface BrowsingHistoryItem {
    listing: CarListing;
    viewedAt: Date;
    viewCount: number;
}

// Local Storage Key
const BROWSING_HISTORY_KEY = 'globul_cars_browsing_history';
const MAX_HISTORY_ITEMS = 12;

const RecentBrowsingSection: React.FC = () => {
    const navigate = useNavigate();
    const [browsingHistory, setBrowsingHistory] = useState<BrowsingHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Load browsing history
    useEffect(() => {
        const loadBrowsingHistory = () => {
            try {
                const historyJson = localStorage.getItem(BROWSING_HISTORY_KEY);
                if (historyJson) {
                    const history = JSON.parse(historyJson);
                    const parsedHistory = history.map((item: any) => ({
                        ...item,
                        viewedAt: new Date(item.viewedAt)
                    }));
                    setBrowsingHistory(parsedHistory);
                }
            } catch (error) {
                console.error('Error loading browsing history:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBrowsingHistory();
    }, []);

    // Format time ago
    const formatTimeAgo = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        if (diffDays < 7) return `منذ ${diffDays} يوم`;
        return date.toLocaleDateString('ar-SA');
    };

    // Clear browsing history
    const clearHistory = () => {
        localStorage.removeItem(BROWSING_HISTORY_KEY);
        setBrowsingHistory([]);
    };

    // Handle browse click
    const handleBrowseClick = () => {
        navigate('/search');
    };

    // Sort by most recent
    const sortedHistory = useMemo(() => {
        return [...browsingHistory].sort((a, b) =>
            b.viewedAt.getTime() - a.viewedAt.getTime()
        );
    }, [browsingHistory]);

    if (loading) {
        return (
            <SectionContainer>
                <BackgroundPattern />
                <SectionHeader>
                    <SmartBadge>🔍 تتبع ذكي</SmartBadge>
                    <SectionTitle>شاهدت مؤخراً</SectionTitle>
                    <SectionSubtitle>جاري التحميل...</SectionSubtitle>
                </SectionHeader>
            </SectionContainer>
        );
    }

    if (sortedHistory.length === 0) {
        return (
            <SectionContainer>
                <BackgroundPattern />
                <SectionHeader>
                    <SmartBadge>🔍 تتبع ذكي</SmartBadge>
                    <SectionTitle>شاهدت مؤخراً</SectionTitle>
                    <SectionSubtitle>
                        سجل تصفحك الشخصي للمركبات التي شاهدتها
                    </SectionSubtitle>
                </SectionHeader>
                <EmptyState>
                    <EmptyIcon>🔍</EmptyIcon>
                    <EmptyTitle>لم تشاهد أي مركبات بعد</EmptyTitle>
                    <EmptyText>
                        ابدأ بتصفح المركبات المتاحة وسيتم حفظ سجل مشاهداتك هنا تلقائياً
                    </EmptyText>
                    <BrowseButton onClick={handleBrowseClick}>
                        تصفح المركبات
                    </BrowseButton>
                </EmptyState>
            </SectionContainer>
        );
    }

    return (
        <SectionContainer>
            <BackgroundPattern />

            <SectionHeader>
                <SmartBadge>🔍 تتبع ذكي</SmartBadge>
                <SectionTitle>شاهدت مؤخراً</SectionTitle>
                <SectionSubtitle>
                    سجل تصفحك الشخصي مع {sortedHistory.length} مركبة شاهدتها
                </SectionSubtitle>
            </SectionHeader>

            <CarsGrid>
                {sortedHistory.slice(0, MAX_HISTORY_ITEMS).map((item, index) => (
                    <div key={`${item.listing.id}-${index}`} style={{ position: 'relative' }}>
                        <ModernCarCard
                            car={item.listing}
                            showStatus={false}
                        />
                        <TimeBadgeOverlay>
                            🕒 {formatTimeAgo(item.viewedAt)}
                        </TimeBadgeOverlay>
                        <ViewCountBadge>
                            👁️ {item.viewCount} {item.viewCount === 1 ? 'مشاهدة' : 'مشاهدات'}
                        </ViewCountBadge>
                    </div>
                ))}
            </CarsGrid>

            <ClearButton onClick={clearHistory}>
                🗑️ مسح سجل المشاهدات
            </ClearButton>
        </SectionContainer>
    );
};

// Export utility function to add to browsing history
export const addToBrowsingHistory = (listing: CarListing) => {
    try {
        const historyJson = localStorage.getItem(BROWSING_HISTORY_KEY);
        let history: BrowsingHistoryItem[] = historyJson ? JSON.parse(historyJson) : [];

        const existingIndex = history.findIndex(item => item.listing.id === listing.id);

        if (existingIndex !== -1) {
            history[existingIndex] = {
                listing,
                viewedAt: new Date(),
                viewCount: history[existingIndex].viewCount + 1
            };
        } else {
            history.unshift({
                listing,
                viewedAt: new Date(),
                viewCount: 1
            });
        }

        history = history.slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(BROWSING_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Error adding to browsing history:', error);
    }
};

export default RecentBrowsingSection;

// src/components/seo/RelatedContent.tsx
// Smart Internal Linking Component — SEO Topic Clusters
// Automatically suggests related content based on context
// Improves Google's understanding of site structure and topical authority

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { ArrowRight, TrendingUp, Calculator, Search, BookOpen, Car } from 'lucide-react';

// ==================== TYPES ====================

interface RelatedItem {
    path: string;
    titleEn: string;
    titleBg: string;
    descEn: string;
    descBg: string;
    icon: React.ReactNode;
    category: 'tool' | 'article' | 'browse';
}

interface RelatedContentProps {
    /** Current page context to determine relevant links */
    context: 'car-detail' | 'blog' | 'search' | 'valuation' | 'financing' | 'city-page' | 'home';
    /** Optional: current car brand to personalize suggestions */
    brand?: string;
    /** Optional: current city */
    city?: string;
    /** Max number of items to show */
    maxItems?: number;
}

// ==================== CONTENT MAP ====================

const ALL_ITEMS: RelatedItem[] = [
    {
        path: '/valuation',
        titleEn: 'AI Car Valuation',
        titleBg: 'AI Оценка на автомобил',
        descEn: 'Get an instant AI-powered price estimate for any car',
        descBg: 'Получете моментална AI оценка на цената на всеки автомобил',
        icon: <TrendingUp size={20} />,
        category: 'tool',
    },
    {
        path: '/financing',
        titleEn: 'Financing Calculator',
        titleBg: 'Калкулатор за финансиране',
        descEn: 'Calculate monthly payments and compare financing options',
        descBg: 'Изчислете месечните вноски и сравнете опциите за финансиране',
        icon: <Calculator size={20} />,
        category: 'tool',
    },
    {
        path: '/search',
        titleEn: 'Smart Car Search',
        titleBg: 'Умно търсене на кола',
        descEn: 'Find your perfect car with our AI-powered search',
        descBg: 'Намерете перфектната кола с нашето AI търсене',
        icon: <Search size={20} />,
        category: 'tool',
    },
    {
        path: '/blog/ai-valuation-works',
        titleEn: 'How AI Valuation Works',
        titleBg: 'Как работи AI оценката',
        descEn: 'Deep dive into our AI pricing technology',
        descBg: 'Задълбочен преглед на нашата AI технология за ценообразуване',
        icon: <BookOpen size={20} />,
        category: 'article',
    },
    {
        path: '/blog/bulgarian-market-2026',
        titleEn: 'Bulgarian Car Market 2026',
        titleBg: 'Български автомобилен пазар 2026',
        descEn: 'Analysis and trends of the Bulgarian car market',
        descBg: 'Анализ и тенденции на българския автомобилен пазар',
        icon: <BookOpen size={20} />,
        category: 'article',
    },
    {
        path: '/blog/marketplace-comparison',
        titleEn: 'Platform Comparison 2026',
        titleBg: 'Сравнение на платформи 2026',
        descEn: 'How Koli One compares to other car marketplaces',
        descBg: 'Как Koli One се сравнява с други платформи за автомобили',
        icon: <BookOpen size={20} />,
        category: 'article',
    },
    {
        path: '/cars/all',
        titleEn: 'Browse All Cars',
        titleBg: 'Разгледайте всички коли',
        descEn: 'Explore our full inventory of cars for sale',
        descBg: 'Разгледайте пълния ни каталог от коли за продажба',
        icon: <Car size={20} />,
        category: 'browse',
    },
    {
        path: '/blog/neural-pricing',
        titleEn: 'Neural Pricing Explained',
        titleBg: 'Обяснение на Neural Pricing',
        descEn: 'How our multi-source pricing intelligence works',
        descBg: 'Как работи нашата ценова интелигентност от множество източници',
        icon: <BookOpen size={20} />,
        category: 'article',
    },
];

// Context → which categories are most relevant
const CONTEXT_RELEVANCE: Record<string, string[]> = {
    'car-detail': ['tool', 'article'],
    'blog': ['tool', 'browse'],
    'search': ['article', 'tool'],
    'valuation': ['article', 'browse'],
    'financing': ['tool', 'article'],
    'city-page': ['tool', 'browse'],
    'home': ['tool', 'article', 'browse'],
};

// Items to exclude when on a specific page
const SELF_EXCLUSIONS: Record<string, string> = {
    'valuation': '/valuation',
    'financing': '/financing',
    'search': '/search',
};

// ==================== STYLED COMPONENTS ====================

const Wrapper = styled.section`
  margin: 3rem 0;
  padding: 2rem;
  background: ${({ theme }) => theme.mode === 'dark'
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 121, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text?.primary || '#1e293b'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 24px;
    background: #FF7900;
    border-radius: 2px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const Card = styled(Link)`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(15, 20, 25, 0.6)' : 'white'};
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.25s ease;
  border: 1px solid transparent;

  &:hover {
    transform: translateY(-2px);
    border-color: #FF7900;
    box-shadow: 0 8px 24px rgba(255, 121, 0, 0.12);
  }
`;

const IconWrap = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 121, 0, 0.1);
  border-radius: 10px;
  color: #FF7900;
  flex-shrink: 0;
`;

const CardContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardTitle = styled.span`
  display: block;
  font-weight: 600;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text?.primary || '#1e293b'};
  margin-bottom: 0.25rem;
`;

const CardDesc = styled.span`
  display: block;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
  line-height: 1.4;
`;

// ==================== COMPONENT ====================

export const RelatedContent: React.FC<RelatedContentProps> = ({
    context,
    brand,
    city,
    maxItems = 3,
}) => {
    const { language } = useLanguage();
    const isBg = language === 'bg';

    const items = useMemo(() => {
        const relevantCategories = CONTEXT_RELEVANCE[context] || ['tool', 'article'];
        const selfExclusion = SELF_EXCLUSIONS[context];

        let filtered = ALL_ITEMS
            .filter(item => relevantCategories.includes(item.category))
            .filter(item => item.path !== selfExclusion);

        // Prioritize by category order from relevance map
        filtered.sort((a, b) => {
            const aIdx = relevantCategories.indexOf(a.category);
            const bIdx = relevantCategories.indexOf(b.category);
            return aIdx - bIdx;
        });

        return filtered.slice(0, maxItems);
    }, [context, maxItems]);

    if (items.length === 0) return null;

    return (
        <Wrapper>
            <Title>
                {isBg ? 'Може да ви бъде полезно' : 'You might find useful'}
            </Title>
            <Grid>
                {items.map((item, i) => (
                    <Card key={i} to={item.path}>
                        <IconWrap>{item.icon}</IconWrap>
                        <CardContent>
                            <CardTitle>{isBg ? item.titleBg : item.titleEn}</CardTitle>
                            <CardDesc>{isBg ? item.descBg : item.descEn}</CardDesc>
                        </CardContent>
                    </Card>
                ))}
            </Grid>
        </Wrapper>
    );
};

export default RelatedContent;

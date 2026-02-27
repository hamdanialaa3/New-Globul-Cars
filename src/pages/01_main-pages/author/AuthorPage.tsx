// src/pages/01_main-pages/author/AuthorPage.tsx
// Author Pages — E-E-A-T Enhancement for Google
// Establishes trust by linking content to real people/teams

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../../../contexts/LanguageContext';
import styled from 'styled-components';
import { BookOpen, Award, Users, ArrowRight, ExternalLink } from 'lucide-react';

// ==================== AUTHORS DATA ====================

interface AuthorData {
    slug: string;
    name: string;
    nameBg: string;
    role: string;
    roleBg: string;
    bio: string;
    bioBg: string;
    expertise: string[];
    expertiseBg: string[];
    articles: Array<{ slug: string; title: string; titleBg: string; date: string }>;
    socialLinks: Array<{ platform: string; url: string }>;
    avatar: string;
}

const AUTHORS: Record<string, AuthorData> = {
    'koli-one-research': {
        slug: 'koli-one-research',
        name: 'Koli One Research Team',
        nameBg: 'Изследователски екип на Koli One',
        role: 'Market Research & Data Analysis',
        roleBg: 'Пазарни проучвания и анализ на данни',
        bio: 'The Koli One Research Team specializes in analyzing Bulgarian and European automotive markets. With access to real-time pricing data from 7+ European markets and proprietary AI models, the team produces industry-leading reports on car pricing trends, market dynamics, and consumer behavior in Bulgaria.',
        bioBg: 'Изследователският екип на Koli One е специализиран в анализа на българския и европейския автомобилен пазар. С достъп до данни за цени в реално време от 7+ европейски пазара и собствени AI модели, екипът създава водещи в индустрията доклади за тенденциите в цените на автомобилите, пазарната динамика и потребителското поведение в България.',
        expertise: [
            'Car market price analysis',
            'European automotive market trends',
            'AI-driven price estimation',
            'Consumer behavior research',
            'Data-driven market reports'
        ],
        expertiseBg: [
            'Анализ на цени на автомобилния пазар',
            'Тенденции на европейския автомобилен пазар',
            'AI-базирана оценка на цени',
            'Проучване на потребителското поведение',
            'Доклади, базирани на данни'
        ],
        articles: [
            { slug: '/blog/bulgarian-market-2026', title: 'Bulgarian Car Market 2026 Analysis', titleBg: 'Анализ на българския автомобилен пазар 2026', date: '2026-01-15' },
            { slug: '/blog/marketplace-comparison', title: 'Marketplace Comparison 2026', titleBg: 'Сравнение на платформи 2026', date: '2026-01-10' },
            { slug: '/blog/ai-valuation-works', title: 'How AI Car Valuation Works', titleBg: 'Как работи AI оценката на автомобили', date: '2026-01-05' },
        ],
        socialLinks: [
            { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/koli-one-a011993a9/' },
            { platform: 'Twitter', url: 'https://x.com/kolionebg' },
        ],
        avatar: '/logo.png',
    },
    'koli-one-engineering': {
        slug: 'koli-one-engineering',
        name: 'Koli One Engineering Team',
        nameBg: 'Инженерен екип на Koli One',
        role: 'Software Engineering & AI Development',
        roleBg: 'Софтуерно инженерство и разработка на AI',
        bio: 'The Koli One Engineering Team builds Bulgaria\'s most advanced AI-powered car marketplace. The team has developed proprietary systems including Neural Pricing (multi-source price intelligence), Hybrid Search (combining Algolia + Firestore + AI), Constitutional Coding methodology, and real-time market analysis engines.',
        bioBg: 'Инженерният екип на Koli One изгражда най-модерната AI-базирана платформа за автомобили в България. Екипът е разработил собствени системи, включително Neural Pricing (ценова интелигентност от множество източници), Hybrid Search (комбиниране на Algolia + Firestore + AI), методология Constitutional Coding и двигатели за анализ на пазара в реално време.',
        expertise: [
            'AI/ML systems for automotive',
            'Full-stack web development',
            'Cloud architecture (Firebase/GCP)',
            'Search engine technology',
            'Real-time data processing'
        ],
        expertiseBg: [
            'AI/ML системи за автомобилния сектор',
            'Full-stack уеб разработка',
            'Cloud архитектура (Firebase/GCP)',
            'Технология за търсачки',
            'Обработка на данни в реално време'
        ],
        articles: [
            { slug: '/blog/technical-deep-dive', title: 'Hybrid Search Architecture Deep Dive', titleBg: 'Задълбочен преглед на Hybrid Search архитектурата', date: '2026-01-20' },
            { slug: '/blog/neural-pricing', title: 'Neural Pricing System Explained', titleBg: 'Обяснение на Neural Pricing системата', date: '2026-01-12' },
            { slug: '/blog/constitutional-coding', title: 'Constitutional Coding Methodology', titleBg: 'Методология Constitutional Coding', date: '2026-01-08' },
        ],
        socialLinks: [
            { platform: 'GitHub', url: 'https://github.com/koli-one' },
            { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/koli-one-a011993a9/' },
        ],
        avatar: '/logo.png',
    },
};

// ==================== STYLED COMPONENTS ====================

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.mode === 'dark'
        ? 'linear-gradient(135deg, #0F1419 0%, #1A1F2E 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'};
  padding: 2rem 1rem;
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const AuthorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 2.5rem;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'white'};
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #FF7900;
  box-shadow: 0 4px 20px rgba(255, 121, 0, 0.3);
`;

const AuthorInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text?.primary || '#1e293b'};
  margin-bottom: 0.5rem;
`;

const AuthorRole = styled.p`
  font-size: 1.1rem;
  color: #FF7900;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const AuthorBio = styled.p`
  font-size: 1rem;
  line-height: 1.8;
  color: ${({ theme }) => theme.text?.secondary || '#64748b'};
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'white'};
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text?.primary || '#1e293b'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg { color: #FF7900; }
`;

const ExpertiseGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const ExpertiseBadge = styled.span`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 121, 0, 0.15)' : 'rgba(255, 121, 0, 0.08)'};
  color: #FF7900;
  padding: 0.5rem 1rem;
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid rgba(255, 121, 0, 0.2);
`;

const ArticleCard = styled(Link)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(15, 20, 25, 0.6)' : '#f8fafc'};
  border-radius: 12px;
  margin-bottom: 0.75rem;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    transform: translateX(4px);
    border-color: #FF7900;
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 121, 0, 0.08)' : 'rgba(255, 121, 0, 0.04)'};
  }
`;

const ArticleTitle = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.text?.primary || '#1e293b'};
  font-size: 1rem;
`;

const ArticleDate = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
  white-space: nowrap;
  margin-left: 1rem;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(15, 20, 25, 0.6)' : '#f1f5f9'};
  border-radius: 8px;
  text-decoration: none;
  color: ${({ theme }) => theme.text?.primary || '#475569'};
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 121, 0, 0.1);
    color: #FF7900;
  }

  svg { width: 16px; height: 16px; }
`;

// ==================== COMPONENT ====================

const AuthorPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { language } = useLanguage();

    const author = slug ? AUTHORS[slug] : null;

    if (!author) {
        return (
            <PageWrapper>
                <Container>
                    <h1>Author not found</h1>
                    <Link to="/blog">← Back to Blog</Link>
                </Container>
            </PageWrapper>
        );
    }

    const isBg = language === 'bg';
    const displayName = isBg ? author.nameBg : author.name;
    const displayRole = isBg ? author.roleBg : author.role;
    const displayBio = isBg ? author.bioBg : author.bio;
    const displayExpertise = isBg ? author.expertiseBg : author.expertise;

    // JSON-LD Schema for E-E-A-T
    const personSchema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: author.name,
        alternateName: author.nameBg,
        jobTitle: author.role,
        description: author.bio,
        url: `https://koli.one/author/${author.slug}`,
        image: `https://koli.one${author.avatar}`,
        worksFor: {
            '@type': 'Organization',
            name: 'Koli One',
            url: 'https://koli.one',
        },
        knowsAbout: author.expertise,
        sameAs: author.socialLinks.map(l => l.url),
    };

    return (
        <>
            <Helmet>
                <title>{displayName} | Koli One</title>
                <meta name="description" content={displayBio.slice(0, 155) + '...'} />
                <link rel="canonical" href={`https://koli.one/author/${author.slug}`} />
                <meta property="og:type" content="profile" />
                <meta property="og:title" content={`${displayName} | Koli One`} />
                <meta property="og:description" content={displayBio.slice(0, 155)} />
                <meta property="og:image" content={`https://koli.one${author.avatar}`} />
                <meta property="og:url" content={`https://koli.one/author/${author.slug}`} />
                <script type="application/ld+json">
                    {JSON.stringify(personSchema)}
                </script>
            </Helmet>

            <PageWrapper>
                <Container>
                    <AuthorHeader>
                        <Avatar src={author.avatar} alt={displayName} width="120" height="120" />
                        <AuthorInfo>
                            <AuthorName>{displayName}</AuthorName>
                            <AuthorRole>{displayRole}</AuthorRole>
                            <AuthorBio>{displayBio}</AuthorBio>
                        </AuthorInfo>
                    </AuthorHeader>

                    <Section>
                        <SectionTitle>
                            <Award size={24} />
                            {isBg ? 'Области на експертиза' : 'Areas of Expertise'}
                        </SectionTitle>
                        <ExpertiseGrid>
                            {displayExpertise.map((item, i) => (
                                <ExpertiseBadge key={i}>{item}</ExpertiseBadge>
                            ))}
                        </ExpertiseGrid>
                    </Section>

                    <Section>
                        <SectionTitle>
                            <BookOpen size={24} />
                            {isBg ? 'Публикувани статии' : 'Published Articles'}
                        </SectionTitle>
                        {author.articles.map((article, i) => (
                            <ArticleCard key={i} to={article.slug}>
                                <ArticleTitle>{isBg ? article.titleBg : article.title}</ArticleTitle>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ArticleDate>{article.date}</ArticleDate>
                                    <ArrowRight size={16} color="#FF7900" />
                                </div>
                            </ArticleCard>
                        ))}
                    </Section>

                    {author.socialLinks.length > 0 && (
                        <Section>
                            <SectionTitle>
                                <Users size={24} />
                                {isBg ? 'Социални мрежи' : 'Connect'}
                            </SectionTitle>
                            <SocialLinks>
                                {author.socialLinks.map((link, i) => (
                                    <SocialLink key={i} href={link.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink /> {link.platform}
                                    </SocialLink>
                                ))}
                            </SocialLinks>
                        </Section>
                    )}
                </Container>
            </PageWrapper>
        </>
    );
};

export default AuthorPage;

/**
 * AI Valuation Deep Dive Blog Post
 * 
 * A high-quality, data-driven article explaining the Koli One AI valuation system.
 * Includes interactive charts and deep technical analysis.
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Sector,
    ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import {
    TrendingUp, ShieldCheck, Zap, Database, Cpu,
    ArrowLeft, Calendar, User, Clock, Share2,
    ChevronRight, CheckCircle2, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

// --- Styled Components ---

const PageContainer = styled.div<{ $isDark: boolean }>`
    min-height: 100vh;
    background: ${props => props.$isDark ? '#020617' : '#f8fafc'};
    color: ${props => props.$isDark ? '#f8fafc' : '#0f172a'};
    font-family: 'Inter', sans-serif;
    padding-bottom: 5rem;
`;

const HeaderSection = styled.div<{ $isDark: boolean }>`
    background: ${props => props.$isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff'};
    border-bottom: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(12px);
`;

const NavContent = styled.div`
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const BackLink = styled.button<{ $isDark: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { color: #10b981; transform: translateX(-4px); }
`;

const Hero = styled.div<{ $isDark: boolean }>`
    max-width: 900px;
    margin: 4rem auto 2rem;
    padding: 0 1.5rem;
    text-align: center;
`;

const Category = styled.span`
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    padding: 0.5rem 1rem;
    border-radius: 99px;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const Title = styled.h1`
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 900;
    line-height: 1.1;
    margin: 1.5rem 0;
    background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

const Meta = styled.div`
    display: flex;
    justify-content: center;
    gap: 2rem;
    color: #64748b;
    font-size: 0.938rem;
    margin-bottom: 3rem;
    
    @media (max-width: 640px) {
        flex-direction: column;
        gap: 0.75rem;
        align-items: center;
    }
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const FeaturedImage = styled.div`
    max-width: 1000px;
    margin: 0 auto 4rem;
    padding: 0 1rem;
    
    img {
        width: 100%;
        height: auto;
        border-radius: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
`;

const Content = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1.5rem;
    font-size: 1.188rem;
    line-height: 1.8;
    color: inherit;

    h2 {
        font-size: 2rem;
        font-weight: 800;
        margin: 3.5rem 0 1.5rem;
        border-left: 4px solid #10b981;
        padding-left: 1.25rem;
    }

    h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 2rem 0 1rem;
    }

    p { margin-bottom: 2rem; }

    ul, ol {
        margin-bottom: 2rem;
        padding-left: 1.5rem;
        li { margin-bottom: 0.75rem; }
    }
`;

const ChartContainer = styled.div<{ $isDark: boolean }>`
    background: ${props => props.$isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff'};
    border: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
    border-radius: 20px;
    padding: 2rem;
    margin: 3rem 0;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h4`
    text-align: center;
    margin-bottom: 2rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #94a3b8;
`;

const InfoBox = styled.div<{ $isDark: boolean }>`
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
    border-radius: 16px;
    padding: 2rem;
    margin: 3rem 0;
    display: flex;
    gap: 1.5rem;
    
    svg { flex-shrink: 0; color: #10b981; }
`;

const CTABox = styled.div`
    background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
    border-radius: 24px;
    padding: 4rem 2rem;
    text-align: center;
    color: white;
    margin-top: 5rem;
    
    h3 { font-size: 2.25rem; margin-bottom: 1rem; color: white !important; }
    p { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; }
`;

const CTAButton = styled.button`
    background: white;
    color: #10b981;
    padding: 1rem 2.5rem;
    border-radius: 99px;
    border: none;
    font-size: 1.125rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { transform: scale(1.05); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
`;

// --- Mock Data for Charts ---

const featureImportanceData = [
    { name: 'Пробег (Mileage)', value: 28, fill: '#10b981' },
    { name: 'Година (Year)', value: 22, fill: '#3b82f6' },
    { name: 'Състояние (Condition)', value: 18, fill: '#6366f1' },
    { name: 'Екстри (Options)', value: 15, fill: '#8b5cf6' },
    { name: 'Регион (Location)', value: 10, fill: '#ec4899' },
    { name: 'Сезонност (Season)', value: 7, fill: '#f59e0b' },
];

const errorDistributionData = [
    { range: '±0-2%', count: 45 },
    { range: '±2-5%', count: 25 },
    { range: '±5-10%', count: 22 },
    { range: '±10-15%', count: 5 },
    { range: '>15%', count: 3 },
];

const marketSpreadData = [
    { x: 50000, y: 15000, z: 200, name: 'Eco' },
    { x: 120000, y: 12000, z: 260, name: 'Eco' },
    { x: 30000, y: 45000, z: 400, name: 'Premium' },
    { x: 80000, y: 35000, z: 350, name: 'Premium' },
    { x: 150000, y: 8000, z: 150, name: 'Budget' },
    { x: 200000, y: 5000, z: 120, name: 'Budget' },
    { x: 10000, y: 65000, z: 500, name: 'Luxury' },
];

// --- Main Component ---

const AiValuationDeepDive: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { language } = useLanguage();
    const isDark = theme === 'dark';
    const isBg = true; // Forcing BG as requested by the provided text

    // Structured Data (Schema.org)
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "How Koli One's AI Car Valuation System Works: A Deep Dive",
        "author": {
            "@type": "Organization",
            "name": "Koli One"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Koli One",
            "logo": {
                "@type": "ImageObject",
                "url": "https://koli.one/logo.webp"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://koli.one/blog/ai-valuation-deep-dive"
        },
        "datePublished": "2026-02-12",
        "image": "https://koli.one/blog/images/ai-valuation-cover.jpg"
    };

    return (
        <PageContainer $isDark={isDark}>
            <Helmet>
                <title>AI Car Valuation Explained | Koli One Blog</title>
                <meta name="description" content="Discover how Koli One's AI uses 200,000+ data points to provide the most accurate car valuations in Bulgaria." />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Helmet>

            <HeaderSection $isDark={isDark}>
                <NavContent>
                    <BackLink $isDark={isDark} onClick={() => navigate('/blog')}>
                        <ArrowLeft size={18} />
                        Назад към Блога (Back to Blog)
                    </BackLink>
                    <Share2 size={20} color={isDark ? '#94a3b8' : '#64748b'} style={{ cursor: 'pointer' }} />
                </NavContent>
            </HeaderSection>

            <Hero $isDark={isDark}>
                <Category>AI & Технологии</Category>
                <Title>How Koli One’s AI Car Valuation System Works: A Deep Dive</Title>
                <Meta>
                    <MetaItem><User size={16} /> Екипът на Koli One</MetaItem>
                    <MetaItem><Calendar size={16} /> 12 Февруари, 2026</MetaItem>
                    <MetaItem><Clock size={16} /> 8 мин четене</MetaItem>
                </Meta>
            </Hero>

            <FeaturedImage>
                <img src="https://koli.one/blog/images/ai-valuation-cover.jpg" alt="AI Valuation System" />
            </FeaturedImage>

            <Content>
                <section>
                    <h2>1. Introduction</h2>
                    <p>
                        Определянето на реалната пазарна цена на автомобил в България винаги е било предизвикателство.
                        Ръчните оценки често са неточни, субективни и силно зависими от опита на продавача или дилъра.
                        Един и същ автомобил може да бъде оценен на 40 000 лв. от един търговец и на 48 000 лв. от друг,
                        което води до объркване, загуба на време и пропуснати продажби.
                    </p>
                    <p>
                        <strong>Koli One решава този проблем</strong> чрез AI‑базиран модел за оценка, обучен върху реални данни
                        от българския автомобилен пазар. Системата използва машинно обучение, за да анализира хиляди фактори
                        и да предостави точна, обективна и актуална цена за секунди.
                    </p>
                </section>

                <section>
                    <h2>2. Data Sources: The Backbone of Accuracy</h2>
                    <p>
                        За да бъде една AI система надеждна, тя трябва да бъде захранена с качествени и разнообразни данни.
                        Моделът на Koli One използва над <strong>200 000+ реални автомобилни транзакции</strong> от България,
                        събрани между 2020 и 2026 г.
                    </p>

                    <h3>2.1. Реални пазарни сделки</h3>
                    <p>
                        Основният източник са реални продажби на автомобили в България. Данните включват реална продажна цена,
                        дата на продажба, регион и техническо състояние. Това позволява на модела да разбере какво реално се случва на пазара.
                    </p>

                    <h3>2.3. Регионални разлики</h3>
                    <p>
                        Цените в София често са по-високи от тези в Пловдив или Варна. Моделът отчита тези разлики чрез географски
                        embedding-и и регионални индикатори.
                    </p>
                </section>

                <section>
                    <h2>3. The ML Pipeline: How the Model Thinks</h2>
                    <p>
                        AI системата на Koli One използва модерен ML pipeline, който комбинира feature engineering,
                        ensemble модели и непрекъснато обучение.
                    </p>

                    <ChartContainer $isDark={isDark}>
                        <ChartTitle>Диаграма 1: Feature Importance Map (%)</ChartTitle>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={featureImportanceData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke={isDark ? '#94a3b8' : '#64748b'} width={150} />
                                <Tooltip
                                    contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: 'none' }}
                                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                                />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                                    {featureImportanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <h3>3.2. Model Architecture</h3>
                    <p>
                        Основният модел е <strong>XGBoost Gradient Boosting Regressor</strong>, комбиниран с Random Forest и LightGBM.
                        Това е "ensemble" модел, който намалява грешките и подобрява стабилността.
                    </p>

                    <ChartContainer $isDark={isDark}>
                        <ChartTitle>Диаграма 2: Error Distribution (Model Accuracy)</ChartTitle>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={errorDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="range"
                                >
                                    {errorDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][index]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: isDark ? '#1e293b' : '#fff', borderRadius: '12px' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </section>

                <section>
                    <h2>4. How It Works for Users</h2>
                    <p>
                        AI оценката е проектирана да бъде максимално проста. Вие въвеждате данните, а AI сравнява колата ви с
                        хиляди подобни обяви, за да генерира точен диапазон.
                    </p>

                    <ChartContainer $isDark={isDark}>
                        <ChartTitle>Диаграма 3: Market Analysis Sample (Price vs Mileage)</ChartTitle>
                        <ResponsiveContainer width="100%" height={300}>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis type="number" dataKey="x" name="Пробег (km)" unit="km" stroke={isDark ? '#94a3b8' : '#64748b'} />
                                <YAxis type="number" dataKey="y" name="Цена (EUR)" unit="€" stroke={isDark ? '#94a3b8' : '#64748b'} />
                                <ZAxis type="number" dataKey="z" range={[60, 400]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Market Stats" data={marketSpreadData} fill="#10b981" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <InfoBox $isDark={isDark}>
                        <Zap size={24} />
                        <div>
                            <strong>Confidence Score:</strong> Всяка оценка включва процент на сигурност.
                            Когато е над 90%, можете да сте сигурни, че цената е "точно в целта".
                        </div>
                    </InfoBox>
                </section>

                <section>
                    <h2>Case Study: 2018 BMW X5</h2>
                    <p>
                        Продавач в София оценява своя BMW X5 (2018, дизел, 120 000 км) на 48 000 EUR.
                        AI моделът дава оценка <strong>42 500 EUR ± 2 000 EUR</strong>.
                        След корекция на цената, автомобилът се продава за 43 200 EUR само за 2 седмици.
                    </p>
                </section>

                <CTABox>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
                        <h3>Готови ли сте за точна оценка?</h3>
                        <p>Изпробвайте нашата AI система напълно безплатно още днес.</p>
                        <CTAButton onClick={() => navigate('/valuation')}>Оцени автомобил сега</CTAButton>
                    </motion.div>
                </CTABox>
            </Content>
        </PageContainer>
    );
};

export default AiValuationDeepDive;

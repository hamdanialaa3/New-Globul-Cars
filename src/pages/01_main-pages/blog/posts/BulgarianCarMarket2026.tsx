/**
 * Bulgarian Car Market 2026 Trends & Predictions Blog Post
 * 
 * A comprehensive market analysis with data visualization.
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    TrendingUp, BarChart3, Globe, Zap, Car,
    ArrowLeft, Calendar, User, Clock, Share2,
    Activity, ShoppingBag, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    &:hover { color: #3b82f6; transform: translateX(-4px); }
`;

const Hero = styled.div<{ $isDark: boolean }>`
    max-width: 900px;
    margin: 4rem auto 2rem;
    padding: 0 1.5rem;
    text-align: center;
`;

const Category = styled.span`
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
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
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
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
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Content = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1.5rem;
    font-size: 1.125rem;
    line-height: 1.8;

    h2 {
        font-size: 2rem;
        font-weight: 800;
        margin: 3.5rem 0 1.5rem;
        color: #3b82f6;
    }

    h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 2rem 0 1rem;
    }

    p { margin-bottom: 1.5rem; }

    ul {
        margin-bottom: 2rem;
        li { margin-bottom: 0.5rem; }
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin: 2rem 0;
    @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const StatCard = styled.div<{ $isDark: boolean }>`
    background: ${props => props.$isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff'};
    border: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
    padding: 1.5rem;
    border-radius: 16px;
    text-align: center;
    
    h5 { font-size: 0.875rem; color: #94a3b8; margin-bottom: 0.5rem; }
    p { font-size: 1.5rem; font-weight: 800; margin: 0; color: #3b82f6; }
`;

const ChartWrapper = styled.div<{ $isDark: boolean }>`
    background: ${props => props.$isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff'};
    border-radius: 20px;
    padding: 2rem;
    margin: 3rem 0;
    border: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
`;

const ChartTitle = styled.h4`
    text-align: center;
    margin-bottom: 2rem;
    color: #94a3b8;
    font-weight: 600;
`;

// --- Mock Data ---

const brandData = [
    { name: 'BMW', value: 22, fill: '#3b82f6' },
    { name: 'Volkswagen', value: 20, fill: '#10b981' },
    { name: 'Audi', value: 18, fill: '#6366f1' },
    { name: 'Mercedes', value: 16, fill: '#8b5cf6' },
    { name: 'Toyota', value: 14, fill: '#f59e0b' },
    { name: 'Other', value: 10, fill: '#94a3b8' },
];

const priceHistoryData = [
    { year: '2020', price: 100 },
    { year: '2021', price: 102 },
    { year: '2022', price: 104 },
    { year: '2023', price: 106 },
    { year: '2024', price: 108 },
    { year: '2025', price: 110 },
    { year: '2026', price: 112 },
];

// --- Main Component ---

const BulgarianCarMarket2026: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "The Bulgarian Car Market in 2026: Data, Trends, and Predictions",
        "author": { "@type": "Organization", "name": "Koli One Research" },
        "datePublished": "2026-02-12",
        "image": "https://koli.one/blog/images/market-2026-cover.jpg"
    };

    return (
        <PageContainer $isDark={isDark}>
            <Helmet>
                <title>Bulgarian Car Market 2026 | Trends & Predictions | Koli One</title>
                <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
            </Helmet>

            <HeaderSection $isDark={isDark}>
                <NavContent>
                    <BackLink $isDark={isDark} onClick={() => navigate('/blog')}>
                        <ArrowLeft size={18} /> Back to Blog
                    </BackLink>
                </NavContent>
            </HeaderSection>

            <Hero $isDark={isDark}>
                <Category>Market Analysis</Category>
                <Title>The Bulgarian Car Market in 2026: Data, Trends, and Predictions</Title>
                <Meta>
                    <MetaItem><User size={16} /> Koli One Research</MetaItem>
                    <MetaItem><Calendar size={16} /> Feb 12, 2026</MetaItem>
                    <MetaItem><Clock size={16} /> 10 min read</MetaItem>
                </Meta>
            </Hero>

            <Content>
                <section>
                    <h2>1. Market Overview</h2>
                    <p>
                        The Bulgarian automotive market continues to evolve rapidly as the country enters 2026.
                        After a strong rebound in 2024, passenger car sales continued to rise into 2025, reaching <strong>49,419 new registrations</strong>,
                        a 15.1% year‑over‑year increase.
                    </p>
                    <Grid>
                        <StatCard $isDark={isDark}>
                            <h5>Used-Car Dominance</h5>
                            <p>85%</p>
                        </StatCard>
                        <StatCard $isDark={isDark}>
                            <h5>Average Fleet Age</h5>
                            <p>15.2 Years</p>
                        </StatCard>
                    </Grid>
                    <p>
                        Market revenue in the passenger car segment is projected to reach <strong>€1.2 billion</strong> in 2025,
                        with SUVs representing the largest share of value at over €608 million.
                    </p>
                </section>

                <ChartWrapper $isDark={isDark}>
                    <ChartTitle>Chart 1: Brand Popularity in Bulgaria (2026)</ChartTitle>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={brandData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {brandData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: isDark ? '#1e293b' : '#fff', borderRadius: '12px' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartWrapper>

                <section>
                    <h2>2. Top Trends Shaping the Market</h2>
                    <h3>2.1. Electric Vehicle Adoption</h3>
                    <p>
                        Electric vehicle (EV) adoption in Bulgaria remains low but is growing steadily. In 2025, 2,420 battery‑electric cars
                        were newly registered. While this is still far behind Western Europe, the growth trajectory is positive.
                    </p>

                    <h3>2.3. SUV Dominance</h3>
                    <p>
                        SUVs remain the most popular body type in Bulgaria, accounting for <strong>45% of all listings</strong>.
                        Bulgarian buyers prefer SUVs for their practicality, higher driving position, and suitability for mixed urban‑rural driving conditions.
                    </p>

                    <h3>2.4. Import Sources</h3>
                    <ul>
                        <li><strong>Germany:</strong> 60% (Gold Standard)</li>
                        <li><strong>Italy:</strong> 15%</li>
                        <li><strong>Belgium:</strong> 10%</li>
                    </ul>
                </section>

                <ChartWrapper $isDark={isDark}>
                    <ChartTitle>Chart 2: Price Trend Index (2020–2026)</ChartTitle>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={priceHistoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                            <XAxis dataKey="year" stroke={isDark ? '#94a3b8' : '#64748b'} />
                            <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke={isDark ? '#94a3b8' : '#64748b'} hide />
                            <Tooltip
                                contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: 'none' }}
                                labelStyle={{ color: '#3b82f6' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke="#3b82f6"
                                strokeWidth={4}
                                dot={{ fill: '#3b82f6', r: 6 }}
                                activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartWrapper>

                <section>
                    <h2>3. Price Trends by Segment</h2>
                    <p>
                        The budget segment remains the most stable portion of the Bulgarian car market.
                        Mid-range models (10k-25k EUR) experienced a 5% increase, while Luxury vehicles ({'>'}50k EUR)
                        saw the strongest growth at 8%.
                    </p>
                </section>

                <section>
                    <h2>4. Predictions for 2026</h2>
                    <p>
                        Looking ahead, Bulgaria’s automotive market is expected to continue modernizing.
                        Electric vehicles are projected to reach <strong>5% market share</strong> by the end of 2026.
                        AI‑powered tools will become standard across online marketplaces, enabling instant valuations
                        and personalized recommendations.
                    </p>
                </section>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <p>Ready to find your next car in this evolving market?</p>
                    <CTAButton onClick={() => navigate('/cars')}>Browse 10,000+ Cars</CTAButton>
                </div>
            </Content>
        </PageContainer>
    );
};

const CTAButton = styled.button`
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    color: white;
    padding: 1.25rem 3rem;
    border-radius: 99px;
    border: none;
    font-size: 1.25rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    &:hover { transform: scale(1.05); box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4); }
`;

export default BulgarianCarMarket2026;

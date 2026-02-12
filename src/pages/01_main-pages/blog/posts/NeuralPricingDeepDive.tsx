/**
 * Neural Pricing System: Deep Dive Blog Post
 * 
 * Explains how the AI scraper works across Europe to normalize prices.
 * Target: Tech-savvy users and investors.
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    Globe, BrainCircuit, TrendingUp, BadgeEuro, Server,
    ArrowLeft, User, Calendar, Clock, Lock, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

// --- Styled Components ---

const PageContainer = styled.div<{ $isDark: boolean }>`
    min-height: 100vh;
    background: ${props => props.$isDark ? '#020617' : '#ffffff'};
    color: ${props => props.$isDark ? '#f8fafc' : '#0f172a'};
    font-family: 'Inter', sans-serif;
    padding-bottom: 8rem;
`;

const HeaderSection = styled.div<{ $isDark: boolean }>`
    background: ${props => props.$isDark ? 'rgba(2, 6, 23, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(16px);
    border-bottom: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
`;

const NavContent = styled.div`
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
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
    &:hover { color: #10b981; }
`;

const Hero = styled.div`
    max-width: 900px;
    margin: 4rem auto 3rem;
    padding: 0 1.5rem;
    text-align: center;
`;

const Badge = styled.span`
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
    padding: 0.5rem 1rem;
    border-radius: 99px;
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    display: inline-block;
    margin-bottom: 2rem;
`;

const Title = styled.h1`
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
    font-size: 1.25rem;
    color: ${props => props.$isDark ? '#cbd5e1' : '#475569'};
    margin-bottom: 3rem;
    line-height: 1.6;
`;

const Meta = styled.div`
    display: flex;
    justify-content: center;
    gap: 2rem;
    color: #64748b;
    font-size: 0.9rem;
    margin-bottom: 4rem;
`;

const Content = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1.5rem;
    font-size: 1.125rem;
    line-height: 1.8;
    
    h2 { font-size: 2rem; font-weight: 800; margin: 4rem 0 1.5rem; color: #6366f1; display: flex; align-items: center; gap: 0.75rem; }
    h3 { font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem; }
    p { margin-bottom: 1.5rem; }
    ul { margin-bottom: 2rem; padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
`;

const ChartBox = styled.div<{ $isDark: boolean }>`
    background: ${props => props.$isDark ? 'rgba(30, 41, 59, 0.4)' : '#f8fafc'};
    border: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'};
    border-radius: 20px;
    padding: 2rem;
    margin: 3rem 0;
`;

const MapVisual = styled.div`
    height: 300px;
    background: #1e293b;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1.5rem;
    margin: 2rem 0;
    position: relative;
    overflow: hidden;

    &::after {
        content: 'EU DATA STREAM ACTIVE';
        position: absolute;
        bottom: 1rem;
        right: 1.5rem;
        font-size: 0.75rem;
        color: #10b981;
        font-family: monospace;
    }
`;

// --- Mock Data ---

const priceVarianceData = [
    { country: 'DE', price: 22000 },
    { country: 'IT', price: 21500 },
    { country: 'FR', price: 23000 },
    { country: 'BG (Mkt)', price: 26000 },
    { country: 'Koli One (AI)', price: 24500 },
];

const NeuralPricingDeepDive: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "Neural Pricing System: How AI Normalizes Car Prices Across Europe",
        "author": { "@type": "Organization", "name": "Koli One Research" },
        "datePublished": "2026-02-12",
        "image": "https://koli.one/blog/images/neural-pricing-cover.jpg"
    };

    return (
        <PageContainer $isDark={isDark}>
            <Helmet>
                <title>Neural Pricing System | AI Market Intelligence | Koli One</title>
                <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
            </Helmet>

            <HeaderSection $isDark={isDark}>
                <NavContent>
                    <BackLink $isDark={isDark} onClick={() => navigate('/blog')}>
                        <ArrowLeft size={18} /> Back to Blog
                    </BackLink>
                </NavContent>
            </HeaderSection>

            <Hero>
                <Badge>Artificial Intelligence</Badge>
                <Title>Neural Pricing System:<br />Reverse-Engineering the Market</Title>
                <Subtitle $isDark={isDark}>
                    How we built a multi-market crawler that analyzes 7 European countries to find the "True Fair Value" of any vehicle in Bulgaria.
                </Subtitle>
                <Meta>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><User size={16} /> Koli One Research</div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Calendar size={16} /> Feb 12, 2026</div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Clock size={16} /> 12 min read</div>
                </Meta>
            </Hero>

            <Content>
                <section>
                    <h2><BrainCircuit size={28} /> 1. The Arbitrage Problem</h2>
                    <p>
                        Car prices in Bulgaria are often inflated due to import costs and lack of transparency.
                        Dealers import cars from Germany or Italy, add a margin, and sell them locally.
                    </p>
                    <p>
                        But what is the <strong>Fair Market Value</strong>? Is it the German price + transport?
                        Or the average Bulgarian asking price?
                    </p>
                    <p>
                        Our **Neural Pricing Engine** answers this by scraping listing data from:
                    </p>
                    <ul>
                        <li>🇩🇪 Germany (mobile.de)</li>
                        <li>🇮🇹 Italy (autoscout24.it)</li>
                        <li>🇫🇷 France (lacentrale.fr)</li>
                        <li>🇧🇬 Bulgaria (competitor sites)</li>
                    </ul>
                </section>

                <section>
                    <h2><Globe size={28} /> 2. Cross-Border Normalization</h2>
                    <p>
                        Comparing a 2020 BMW 320d in Munich to one in Sofia isn't simple.
                        We built a normalization layer that adjusts for:
                    </p>
                    <ul>
                        <li><strong>Transport Costs:</strong> +€800 to +€1500 depending on distance.</li>
                        <li><strong>VAT Rules:</strong> Difference between margin scheme vs net price.</li>
                        <li><strong>Equipment Level:</strong> German "Business Package" vs Bulgarian "Base".</li>
                    </ul>

                    <MapVisual>
                        <Globe size={64} style={{ opacity: 0.2, marginRight: '1rem' }} />
                        7-MARKET DATA FUSION
                    </MapVisual>
                </section>

                <section>
                    <h2><TrendingUp size={28} /> 3. The "True Price" Algorithm</h2>
                    <p>
                        Once normalized, we feed the data into our deep learning model. The output is a price curve that shows
                        not just the average, but the **optimal selling probability**.
                    </p>

                    <ChartBox $isDark={isDark}>
                        <h4 style={{ textAlign: 'center', marginBottom: '2rem' }}>Price Variance: Import vs Local Market</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={priceVarianceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="country" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ background: isDark ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none' }}
                                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                                />
                                <Bar dataKey="price" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartBox>
                </section>

                <section>
                    <h2><ShieldCheck size={28} /> 4. Constitutional Guardrails</h2>
                    <p>
                        To prevent AI hallucinations, we wrapped the model in **Constitutional Rules**:
                    </p>
                    <ul>
                        <li><strong>Rule #1:</strong> Never suggest a price below the raw import cost excluding VAT.</li>
                        <li><strong>Rule #2:</strong> Flag anomalies {'>'} 20% deviation from the cluster mean.</li>
                        <li><strong>Rule #3:</strong> Always prioritize recent (last 30 days) sales data over active listings.</li>
                    </ul>
                </section>

                <div style={{ textAlign: 'center', marginTop: '5rem' }}>
                    <h3>Want to see the data?</h3>
                    <p>Use our free valuation tool powered by this exact engine.</p>
                    <button
                        onClick={() => navigate('/valuation')}
                        style={{
                            background: '#6366f1', color: 'white', padding: '1rem 2.5rem',
                            borderRadius: '99px', border: 'none', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', marginTop: '1rem'
                        }}
                    >
                        Try AI Valuation
                    </button>
                </div>
            </Content>
        </PageContainer>
    );
};

export default NeuralPricingDeepDive;

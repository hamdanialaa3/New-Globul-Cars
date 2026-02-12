/**
 * Marketplace Comparison 2026 Blog Post
 * 
 * Objectives: Compare Koli One with legacy platforms like Mobile.bg and Auto.bg.
 * Features: Comparison Table, Pricing Grid, and Tech Analysis.
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    Check, X, Zap, ShieldCheck, Smartphone,
    ArrowLeft, Calendar, User, Clock, Comparison,
    Trophy, Award, Rocket
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
    &:hover { color: #8b5cf6; transform: translateX(-4px); }
`;

const Hero = styled.div<{ $isDark: boolean }>`
    max-width: 900px;
    margin: 4rem auto 2rem;
    padding: 0 1.5rem;
    text-align: center;
`;

const Category = styled.span`
    background: rgba(139, 92, 246, 0.1);
    color: #8b5cf6;
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
    background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
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
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1.5rem;
    font-size: 1.125rem;
    line-height: 1.8;

    h2 {
        font-size: 2rem;
        font-weight: 800;
        margin: 3.5rem 0 1.5rem;
        color: #8b5cf6;
    }

    h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 2rem 0 1rem;
    }

    p { margin-bottom: 1.5rem; }
`;

const TableContainer = styled.div<{ $isDark: boolean }>`
    overflow-x: auto;
    margin: 3rem 0;
    background: ${props => props.$isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff'};
    border-radius: 20px;
    border: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
    padding: 1rem;
`;

const ComparisonTable = styled.table<{ $isDark: boolean }>`
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
    
    th, td {
        padding: 1.25rem;
        text-align: left;
        border-bottom: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
    }
    
    th {
        font-weight: 700;
        color: #94a3b8;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    tr:last-child td { border-bottom: none; }
    
    .koli-one {
        color: #10b981;
        font-weight: 700;
    }
`;

const PricingGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin: 3rem 0;
    @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const PriceCard = styled.div<{ $isDark: boolean; $preferred?: boolean }>`
    background: ${props => props.$preferred
        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(217, 70, 239, 0.1) 100%)'
        : (props.$isDark ? 'rgba(30, 41, 59, 0.5)' : '#fff')};
    border: 2px solid ${props => props.$preferred ? '#8b5cf6' : (props.$isDark ? 'rgba(255,255,255,0.05)' : 'transparent')};
    border-radius: 24px;
    padding: 2rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    position: relative;
    
    h4 { font-size: 1.5rem; margin-bottom: 1rem; }
    .price { font-size: 2.5rem; font-weight: 900; color: #8b5cf6; margin-bottom: 1.5rem; }
    ul { list-style: none; padding: 0; li { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; font-size: 0.938rem; } }
`;

const Badge = styled.div`
    position: absolute;
    top: -12px;
    right: 24px;
    background: #8b5cf6;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 99px;
    font-size: 0.75rem;
    font-weight: 700;
`;

// --- Main Component ---

const MarketplaceComparison2026: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Koli One vs Mobile.bg vs Auto.bg: A 2026 Comparison",
        "author": { "@type": "Organization", "name": "Koli One Insights" },
        "datePublished": "2026-02-12",
        "image": "https://koli.one/blog/images/comparison-2026-cover.jpg"
    };

    return (
        <PageContainer $isDark={isDark}>
            <Helmet>
                <title>Koli One vs Mobile.bg vs Auto.bg | 2026 Comparison</title>
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
                <Category>Industry Insights</Category>
                <Title>Koli One vs Mobile.bg vs Auto.bg: A 2026 Comparison</Title>
                <Meta>
                    <MetaItem><User size={16} /> Koli One Research Team</MetaItem>
                    <MetaItem><Calendar size={16} /> Feb 12, 2026</MetaItem>
                    <MetaItem><Clock size={16} /> 12 min read</MetaItem>
                </Meta>
            </Hero>

            <Content>
                <section>
                    <h2>1. Introduction</h2>
                    <p>
                        The Bulgarian automotive marketplace landscape has evolved significantly. While legacy platforms like Mobile.bg and Auto.bg
                        continue to dominate in listing volume, Koli One is reshaping the market with modern tech and AI.
                    </p>
                </section>

                <TableContainer $isDark={isDark}>
                    <ComparisonTable $isDark={isDark}>
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th className="koli-one">Koli One</th>
                                <th>Mobile.bg</th>
                                <th>Auto.bg</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Founded</td>
                                <td>2024</td>
                                <td>2005</td>
                                <td>2002</td>
                            </tr>
                            <tr>
                                <td>AI Valuation</td>
                                <td><Check size={18} color="#10b981" /> Free</td>
                                <td><X size={18} color="#ef4444" /></td>
                                <td><X size={18} color="#ef4444" /></td>
                            </tr>
                            <tr>
                                <td>AI Description</td>
                                <td><Check size={18} color="#10b981" /></td>
                                <td><X size={18} color="#ef4444" /></td>
                                <td><X size={18} color="#ef4444" /></td>
                            </tr>
                            <tr>
                                <td>Mobile App</td>
                                <td><Check size={18} color="#10b981" /> Native</td>
                                <td><Check size={18} color="#f59e0b" /> Hybrid</td>
                                <td><X size={18} color="#ef4444" /></td>
                            </tr>
                            <tr>
                                <td>API Access</td>
                                <td><Check size={18} color="#10b981" /></td>
                                <td><X size={18} color="#ef4444" /></td>
                                <td><X size={18} color="#ef4444" /></td>
                            </tr>
                        </tbody>
                    </ComparisonTable>
                </TableContainer>

                <section>
                    <h2>2. Feature Comparison</h2>
                    <p>
                        Where Koli One truly differentiates itself is in search quality and automation. Its NLP‑powered search allows users to type queries like
                        “diesel SUV under 15k in Sofia” and instantly get relevant results, moving beyond rigid legacy filters.
                    </p>
                    <p>
                        Another key advantage is <strong>API access</strong> for corporate clients, enabling dealerships to sync inventory automatically.
                    </p>
                </section>

                <section>
                    <h2>3. Pricing Comparison</h2>
                    <PricingGrid>
                        <PriceCard $isDark={isDark} $preferred>
                            <Badge>Best Value</Badge>
                            <h4>Koli One</h4>
                            <div className="price">€50-500</div>
                            <ul>
                                <li><Check size={14} /> 3 Free Listings / mo</li>
                                <li><Check size={14} /> All AI Tools Included</li>
                                <li><Check size={14} /> Native Mobile App</li>
                                <li><Check size={14} /> Free API Integration</li>
                            </ul>
                        </PriceCard>
                        <PriceCard $isDark={isDark}>
                            <h4>Mobile.bg</h4>
                            <div className="price">€30-80</div>
                            <ul>
                                <li><Check size={14} /> 1 Free Listing</li>
                                <li><X size={14} /> No AI Tools</li>
                                <li><Check size={14} /> Hybrid App</li>
                                <li><X size={14} /> No API</li>
                            </ul>
                        </PriceCard>
                        <PriceCard $isDark={isDark}>
                            <h4>Auto.bg</h4>
                            <div className="price">€40-100</div>
                            <ul>
                                <li><Check size={14} /> 3 Free Listings</li>
                                <li><X size={14} /> No AI Tools</li>
                                <li><X size={14} /> No Mobile App</li>
                                <li><X size={14} /> No API</li>
                            </ul>
                        </PriceCard>
                    </PricingGrid>
                </section>

                <section>
                    <h2>4. Technology & UX</h2>
                    <p>
                        Built with React and Firebase, Koli One provides real-time updates and a slick UI. Mobile.bg and Auto.bg rely on legacy architectures (PHP),
                        which often results in slower load times and a cluttered experience.
                    </p>
                </section>

                <section>
                    <h2>5. Results: Which is for you?</h2>
                    <p>
                        <strong>Private Sellers:</strong> Koli One is the clear winner for its free AI assistance.
                        <br /><strong>Dealers:</strong> Use Mobile.bg for volume, but Koli One for automation and tech-savvy buyers.
                    </p>
                </section>
            </Content>

            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <CTAButton onClick={() => navigate('/sell')}>Sell Your Car with AI</CTAButton>
            </div>
        </PageContainer>
    );
};

const CTAButton = styled.button`
    background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
    color: white;
    padding: 1.25rem 3rem;
    border-radius: 99px;
    border: none;
    font-size: 1.25rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    &:hover { transform: scale(1.05); box-shadow: 0 10px 25px rgba(217, 70, 239, 0.4); }
`;

export default MarketplaceComparison2026;

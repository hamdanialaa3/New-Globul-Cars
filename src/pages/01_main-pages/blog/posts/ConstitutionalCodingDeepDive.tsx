/**
 * Constitutional Coding: Deep Dive Blog Post
 * 
 * Explains Koli One's unique development philosophy.
 * Target: CTOs, Regulators, Engineering Managers
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    Scale, ShieldCheck, HeartHandshake, CheckCircle2, AlertTriangle, FileText,
    ArrowLeft, User, Calendar, Clock, Gavel, BookOpen
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
    &:hover { color: #f59e0b; }
`;

const Hero = styled.div`
    max-width: 900px;
    margin: 4rem auto 3rem;
    padding: 0 1.5rem;
    text-align: center;
`;

const Badge = styled.span`
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
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
    background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
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
    
    h2 { font-size: 2rem; font-weight: 800; margin: 4rem 0 1.5rem; color: #f59e0b; display: flex; align-items: center; gap: 0.75rem; }
    p { margin-bottom: 1.5rem; }
    ul { margin-bottom: 2rem; padding-left: 1.5rem; }
    li { margin-bottom: 0.75rem; }
`;

const ConstitutionCard = styled.div<{ $isDark: boolean }>`
    background: ${props => props.$isDark ? '#0f172a' : '#fff7ed'};
    border: 2px solid #f59e0b;
    padding: 2.5rem;
    border-radius: 12px;
    margin: 3rem 0;
    position: relative;
    box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.2);

    &::before {
        content: 'ARTICLE I';
        position: absolute;
        top: -1rem;
        left: 2rem;
        background: #f59e0b;
        color: white;
        padding: 0.25rem 1rem;
        font-weight: 800;
        border-radius: 4px;
        font-size: 0.8rem;
    }
`;

const ConstitutionalCodingDeepDive: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "Constitutional Coding: Why Koli One treats code as law",
        "author": { "@type": "Organization", "name": "Koli One Engineering" },
        "datePublished": "2026-02-12",
        "image": "https://koli.one/blog/images/constitution-cover.jpg"
    };

    return (
        <PageContainer $isDark={isDark}>
            <Helmet>
                <title>Constitutional Coding | Engineering Philosophy | Koli One</title>
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
                <Badge>Engineering Philosophy</Badge>
                <Title>Constitutional Coding:<br />Why Our Code Obey's The Law</Title>
                <Subtitle $isDark={isDark}>
                    In highly regulated markets, you can't just "move fast and break things".
                    How we codified legal compliance directly into our TypeScript interfaces.
                </Subtitle>
                <Meta>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><User size={16} /> Engineering Leadership</div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Calendar size={16} /> Feb 12, 2026</div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Clock size={16} /> 10 min read</div>
                </Meta>
            </Hero>

            <Content>
                <section>
                    <h2><Gavel size={28} /> 1. Code is Law</h2>
                    <p>
                        Most startups treat compliance as an afterthought. They build the product, launch it,
                        and then try to patch legal holes when the lawyers complain.
                    </p>
                    <p>
                        At Koli One, we took a radical approach: **Constitutional Coding**.
                    </p>
                    <p>
                        We wrote a "constitution" document (Start_from_0.md) that defines the immutable laws of our platform.
                        Every pull request is checked against these articles, not just for bugs, but for "constitutional violations".
                    </p>
                </section>

                <section>
                    <h2><BookOpen size={28} /> 2. The 18 Articles</h2>
                    <p>
                        Our constitution consists of 18 inviolable articles covering everything from data privacy to margin calculations.
                    </p>

                    <ConstitutionCard $isDark={isDark}>
                        <h3 style={{ marginTop: 0, color: '#f59e0b' }}>Payment Sovereignty</h3>
                        <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>
                            "No transaction shall occur on the platform that subjects the user to hidden fees greater than 1.5%.
                            Revolut Merchant API shall be the primary gateway to ensure 0% peer-to-peer transfers where possible."
                        </p>
                    </ConstitutionCard>
                </section>

                <section>
                    <h2><ShieldCheck size={28} /> 3. DAC7 Compliance by Design</h2>
                    <p>
                        With the new EU DAC7 directive requiring platforms to report seller income, we didn't wait for the deadline.
                        We built a **Tax Reporting Module** directly into our user schema.
                    </p>
                    <ul>
                        <li><CheckCircle2 color="#10b981" size={16} /> Automatic VAT ID validation via VIES API.</li>
                        <li><CheckCircle2 color="#10b981" size={16} /> Real-time threshold tracking (€2,000 / 30 sales).</li>
                        <li><CheckCircle2 color="#10b981" size={16} /> Immutable audit logs for every transaction.</li>
                    </ul>
                </section>

                <section>
                    <h2><HeartHandshake size={28} /> 4. Conclusion</h2>
                    <p>
                        Constitutional Coding slows us down initially. We debate rules before we write code.
                        But in the long run, it makes us faster because we don't have to rewrite our core logic every time a regulation changes.
                    </p>
                    <p>
                        Our code is not just functional; it is **ethical by design**.
                    </p>
                </section>
            </Content>
        </PageContainer>
    );
};

export default ConstitutionalCodingDeepDive;

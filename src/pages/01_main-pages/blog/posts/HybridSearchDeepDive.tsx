/**
 * Hybrid Search Technical Deep-Dive Blog Post (Premium Edition)
 * 
 * Target: Global Engineering Community, Auto-Tech Enthusiasts
 * Content: Algolia + Firestore architecture, Cloud Functions sync, Query routing.
 */

import React from 'react';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    Database, Search, Code, Cpu, Layers, X,
    ArrowLeft, Calendar, User, Clock, CheckCircle2,
    Zap, Share2, Terminal, Workflow, Server,
    Code2, Network, BarChart3, TrendingUp, Briefcase,
    ShieldCheck, Globe, Smartphone, CloudLightning
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { SystemArchitectureCover } from './components/SystemArchitectureCover';

// --- Premium Styled Components ---

const PageContainer = styled.div<{ $isDark: boolean }>`
    min-height: 100vh;
    background: ${props => props.$isDark ? '#020617' : '#ffffff'};
    color: ${props => props.$isDark ? '#f8fafc' : '#0f172a'};
    font-family: 'Inter', sans-serif;
    padding-bottom: 8rem;
    overflow-x: hidden;
`;

const HeaderSection = styled.div<{ $isDark: boolean }>`
    background: ${props => props.$isDark ? 'rgba(2, 6, 23, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
    border-bottom: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(16px);
`;

const NavContent = styled.div`
    max-width: 1000px;
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
    max-width: 1000px;
    margin: 4rem auto 3rem;
    padding: 0 1.5rem;
    text-align: center;
`;

const TechBadge = styled.span`
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
    color: #10b981;
    padding: 0.5rem 1.25rem;
    border-radius: 99px;
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: inline-block;
    margin-bottom: 2rem;
    border: 1px solid rgba(16, 185, 129, 0.2);
`;

const Title = styled.h1`
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 900;
    line-height: 1.1;
    margin: 1.5rem 0;
    letter-spacing: -0.03em;
    background: linear-gradient(to right, #10b981, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
    font-size: 1.35rem;
    color: ${props => props.$isDark ? '#cbd5e1' : '#475569'};
    max-width: 800px;
    margin: 0 auto 3rem;
    line-height: 1.6;
`;

const Meta = styled.div`
    display: flex;
    justify-content: center;
    gap: 2.5rem;
    color: #64748b;
    font-size: 0.938rem;
    margin-bottom: 4rem;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    padding-bottom: 2rem;
    
    @media (max-width: 640px) {
        flex-direction: column;
        gap: 1rem;
        align-items: center;
    }
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-weight: 500;
`;

const Content = styled.div`
    max-width: 850px;
    margin: 0 auto;
    padding: 0 1.5rem;
    font-size: 1.18rem;
    line-height: 1.85;
    color: ${props => props.theme === 'dark' ? '#cbd5e1' : '#334155'};

    h2 {
        font-size: 2.25rem;
        font-weight: 800;
        margin: 5rem 0 2rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: #0f172a;
        letter-spacing: -0.02em;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(0,0,0,0.05);

        @media (prefers-color-scheme: dark) {
            color: #f8fafc;
            border-bottom-color: rgba(255,255,255,0.05);
        }
    }

    h3 {
        font-size: 1.6rem;
        font-weight: 700;
        margin: 3rem 0 1.25rem;
        color: #3b82f6;
    }

    p { margin-bottom: 2rem; }

    strong { color: #10b981; font-weight: 700; }

    ul {
        margin-bottom: 2.5rem;
        li { margin-bottom: 0.75rem; display: flex; align-items: start; gap: 0.5rem; }
    }
`;

const CodeBlock = styled.div<{ $isDark: boolean; $label?: string }>`
    background: #0f172a; /* Always dark for code */
    color: #e2e8f0;
    padding: 2rem;
    border-radius: 16px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.9rem;
    line-height: 1.6;
    margin: 2.5rem 0;
    overflow-x: auto;
    border: 1px solid rgba(255,255,255,0.1);
    position: relative;
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);

    &::before {
        content: '${props => props.$label || 'TYPESCRIPT'}';
        position: absolute;
        top: 0;
        right: 0;
        background: rgba(255,255,255,0.1);
        padding: 0.5rem 1rem;
        font-size: 0.7rem;
        font-weight: 800;
        border-bottom-left-radius: 16px;
        color: #94a3b8;
    }
`;

const DiagramBox = styled.div<{ $isDark: boolean }>`
    background: ${props => props.$isDark ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(15, 23, 42, 0) 100%)' : '#f8fafc'};
    border: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'};
    border-radius: 24px;
    padding: 3rem;
    margin: 4rem 0;
    overflow: hidden;
    position: relative;
`;

const FlexDiagram = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    text-align: center;
    position: relative;
    z-index: 2;
`;

const DiagramNode = styled.div<{ $color: string; $bg?: string }>`
    padding: 1.25rem 2rem;
    background: ${props => props.$bg || props.$color};
    color: white;
    border-radius: 16px;
    font-weight: 700;
    font-size: 1rem;
    min-width: 160px;
    box-shadow: 0 10px 25px -5px ${props => props.$color}40;
    border: 2px solid ${props => props.$color};
    transition: transform 0.2s;
    &:hover { transform: translateY(-2px); }
`;

const ComparisonGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin: 3rem 0;
    @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const SystemCard = styled.div<{ $isDark: boolean; $type: 'firestore' | 'algolia' }>`
    background: ${props => props.$isDark ? 'rgba(30, 41, 59, 0.3)' : '#fff'};
    padding: 2.5rem;
    border-radius: 24px;
    border: 1px solid ${props => props.$type === 'firestore' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(245, 158, 11, 0.3)'};
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05);
    transition: transform 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 25px 50px -12px ${props => props.$type === 'firestore' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)'};
    }
    
    h4 { 
        display: flex; 
        align-items: center; 
        gap: 0.75rem; 
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
        font-weight: 800;
        color: ${props => props.$type === 'firestore' ? '#3b82f6' : '#f59e0b'};
    }
    
    ul { list-style: none; padding: 0; margin: 0; }
    li { 
        display: flex; 
        align-items: center; 
        gap: 0.75rem; 
        margin-bottom: 0.75rem; 
        font-size: 1rem; 
        font-weight: 500;
        color: ${props => props.$isDark ? '#e2e8f0' : '#475569'};
    }
`;

const PerformanceTable = styled.table<{ $isDark: boolean }>`
    width: 100%;
    margin: 2rem 0;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 16px;
    overflow: hidden;
    background: ${props => props.$isDark ? 'rgba(30, 41, 59, 0.3)' : '#f8fafc'};
    border: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'};

    th, td {
        padding: 1.25rem 1.5rem;
        text-align: left;
        border-bottom: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
    }
    th { 
        background: ${props => props.$isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)'};
        color: #10b981; 
        font-weight: 800; 
        text-transform: uppercase; 
        font-size: 0.85rem; 
        letter-spacing: 0.05em;
    }
    tr:last-child td { border-bottom: none; }
`;

const HiringFooter = styled.div<{ $isDark: boolean }>`
    margin-top: 8rem;
    padding: 5rem 2rem;
    background: ${props => props.$isDark ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)' : '#f0fdf4'};
    border-radius: 40px;
    text-align: center;
    border: 1px solid ${props => props.$isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7'};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, #10b981, transparent);
    }

    h2 { justify-content: center; margin-top: 0; font-size: 2.5rem; border: none; padding: 0; }
    p { font-size: 1.25rem; max-width: 600px; margin: 1rem auto 2rem; }
    a { 
        display: inline-block;
        background: #10b981;
        color: white; 
        font-weight: 800; 
        text-decoration: none; 
        font-size: 1.25rem;
        padding: 1rem 2.5rem;
        border-radius: 99px;
        transition: transform 0.2s, box-shadow 0.2s;
        &:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4); }
    }
`;

// --- Main Component ---

const HybridSearchDeepDive: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "The Ultimate Guide to Hybrid Search Architecture: Algolia + Firestore",
        "alternativeHeadline": "How Koli One built the fastest car search engine in the Balkans",
        "author": { "@type": "Organization", "name": "Koli One Engineering" },
        "datePublished": "2026-02-12",
        "description": "A comprehensive deep dive into building a high-performance hybrid search engine using Firestore as the source of truth and Algolia for fuzzy search.",
        "image": "https://koli.one/blog/images/hybrid-search-cover.jpg",
        "proficiencyLevel": "Expert"
    };

    return (
        <PageContainer $isDark={isDark}>
            <Helmet>
                <title>Hybrid Search Architecture | The Definitive Guide | Koli One</title>
                <meta name="description" content="Learn how we built a millisecond-latency hybrid search engine combining Firestore's consistency with Algolia's speed." />
                <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
            </Helmet>

            <HeaderSection $isDark={isDark}>
                <NavContent>
                    <BackLink $isDark={isDark} onClick={() => navigate('/blog')}>
                        <ArrowLeft size={18} /> Back to Blog
                    </BackLink>
                    <div style={{ display: 'flex', gap: '1rem', opacity: 0.7 }}>
                        <Share2 size={18} />
                        <motion.div whileHover={{ scale: 1.1 }}><Globe size={18} /></motion.div>
                    </div>
                </NavContent>
            </HeaderSection>

            <Hero $isDark={isDark}>
                <TechBadge>System Architecture</TechBadge>
                <Title>Building the "Impossible" Search:<br />Hybrid Architecture Deep Dive</Title>
                <Subtitle $isDark={isDark}>
                    How we combined <strong>Firestore's reliability</strong> with <strong>Algolia's speed</strong> to create
                    the ultimate automotive search experience for 2026.
                </Subtitle>

                <Meta>
                    <MetaItem><User size={18} color="#3b82f6" /> Engineering Team</MetaItem>
                    <MetaItem><Calendar size={18} color="#3b82f6" /> Feb 12, 2026</MetaItem>
                    <MetaItem><Clock size={18} color="#3b82f6" /> 18 min read</MetaItem>
                    <MetaItem><Briefcase size={18} color="#10b981" /> Hiring</MetaItem>
                </Meta>

                <SystemArchitectureCover />
            </Hero>

            <Content theme={theme}>
                <section>
                    <h2><Terminal size={32} color="#10b981" /> 1. The Engineering Challenge</h2>
                    <p>
                        In the automotive industry, search isn't just a feature—it's the product. Unlike e-commerce where queries
                        are broad ("men's shoes"), car buyers are hyper-specific ("2019 BMW X5 M-Sport, Diesel, under 100k km").
                    </p>
                    <p>
                        We faced a trilemma. We needed:
                    </p>
                    <ul>
                        <li><CheckCircle2 size={16} color="#10b981" /> <strong>Transactional Consistency:</strong> When a car is sold, it must vanish instantly. (Firestore's strength)</li>
                        <li><CheckCircle2 size={16} color="#10b981" /> <strong>Fuzzy Search:</strong> "Volksvagen" should find "Volkswagen". (Algolia's strength)</li>
                        <li><CheckCircle2 size={16} color="#10b981" /> <strong>Complex Filtering:</strong> Faceting by 20+ attributes in milliseconds.</li>
                    </ul>

                    <ComparisonGrid>
                        <SystemCard $isDark={isDark} $type="firestore">
                            <h4><Database size={24} /> Firestore</h4>
                            <ul>
                                <li><CheckCircle2 size={18} color="#10b981" /> Source of Truth consistency</li>
                                <li><CheckCircle2 size={18} color="#10b981" /> Real-time listeners</li>
                                <li><CheckCircle2 size={18} color="#10b981" /> Powerful Geo-hashing</li>
                                <li><X size={18} color="#ef4444" /> Poor text search capabilities</li>
                            </ul>
                        </SystemCard>
                        <SystemCard $isDark={isDark} $type="algolia">
                            <h4><Search size={24} /> Algolia</h4>
                            <ul>
                                <li><CheckCircle2 size={18} color="#10b981" /> 5ms Query Latency</li>
                                <li><CheckCircle2 size={18} color="#10b981" /> Native Typo Tolerance</li>
                                <li><CheckCircle2 size={18} color="#10b981" /> Dynamic Faceting</li>
                                <li><X size={18} color="#ef4444" /> Expensive for non-search reads</li>
                            </ul>
                        </SystemCard>
                    </ComparisonGrid>
                </section>

                <section>
                    <h2><Layers size={32} color="#3b82f6" /> 2. The Solution: Intelligent Routing</h2>
                    <p>
                        The breakthrough came when we stopped trying to make one database do everything. instead,
                        we built an **Intelligent Query Router** at the application layer.
                    </p>

                    <DiagramBox $isDark={isDark}>
                        <div style={{ position: 'absolute', top: 20, left: 20, fontWeight: 700, color: '#94a3b8', fontSize: '0.8rem' }}>DECISION TREE</div>
                        <FlexDiagram>
                            <DiagramNode $color="#10b981" $bg="#0f172a">Incoming Query</DiagramNode>
                            <div style={{ height: 40, width: 2, background: '#cbd5e1' }}></div>
                            <div style={{ display: 'flex', gap: '4rem', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ padding: '0.5rem 1rem', background: '#3b82f6', borderRadius: 99, color: 'white', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 700 }}>Exact ID / VIN</div>
                                    <DiagramNode $color="#3b82f6">Firestore</DiagramNode>
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>Direct Read</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ padding: '0.5rem 1rem', background: '#f59e0b', borderRadius: 99, color: 'white', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 700 }}>Fuzzy / Filters</div>
                                    <DiagramNode $color="#f59e0b">Algolia</DiagramNode>
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>Search Index</div>
                                </div>
                            </div>
                        </FlexDiagram>
                    </DiagramBox>

                    <h3>Code Implementation</h3>
                    <p>Here is the actual TypeScript logic running in our query orchestrator:</p>

                    <CodeBlock $isDark={isDark} $label="QUERY_ROUTER.TS">
                        {`export const routeQuery = (query: SearchQuery): DataSource => {
  // 1. Direct Vehicle Access -> Firestore
  // (Fastest, cheapest, most consistent)
  if (query.vin || query.licensePlate || query.internalId) {
    return DataSource.FIRESTORE_DIRECT;
  }

  // 2. Geo-Radius Only -> Firestore Geohash
  // (Algolia Geo is good, but Firestore is free for this)
  if (query.geoRadius && !query.text && query.filters.length === 0) {
    return DataSource.FIRESTORE_GEO;
  }

  // 3. Complex Search -> Algolia
  // (Text search, multiple facets, sorting)
  return DataSource.ALGOLIA_MAIN_INDEX;
};`}
                    </CodeBlock>
                </section>

                <section>
                    <h2><CloudLightning size={32} color="#f59e0b" /> 3. Real-Time Sync Strategy</h2>
                    <p>
                        A hybrid system is only as good as its synchronization. Stale data allows users to buy cars
                        that are already sold—a <strong>critical failure</strong> for a marketplace.
                    </p>
                    <p>
                        We utilize **Cloud Functions triggers** with a specialized idempotency layer.
                    </p>
                    <CodeBlock $isDark={isDark} $label="CLOUD_FUNCTIONS/SYNC.TS">
                        {`// Triggered strictly on Write events
exports.syncCarToAlgolia = functions.firestore
  .document("cars/{carId}")
  .onWrite(async (change, context) => {
    const data = change.after.data();
    const previous = change.before.data();

    // OPTIMIZATION: Skip sync if only non-searchable fields changed
    // (e.g. view count, internal notes)
    if (isSearchRelevantUpdate(data, previous)) {
       // ... Update Algolia Index
    }
    
    // COST SAVING: Remove from index if sold or hidden
    if (data.status !== 'published') {
      return index.deleteObject(context.params.carId);
    }
  });`}
                    </CodeBlock>
                </section>

                <section>
                    <h2><BarChart3 size={32} color="#8b5cf6" /> 4. Performance Benchmarks</h2>
                    <p>The results speak for themselves. By hybridizing, we achieved P95 latencies that rival social media apps.</p>
                    <PerformanceTable $isDark={isDark}>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Result</th>
                                <th>Improvement</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Cold Start Latency</strong></td>
                                <td>120 ms</td>
                                <td style={{ color: '#10b981' }}>-60% vs Legacy</td>
                            </tr>
                            <tr>
                                <td><strong>Typo Tolerance Accuracy</strong></td>
                                <td>98.5%</td>
                                <td style={{ color: '#10b981' }}>New Capability</td>
                            </tr>
                            <tr>
                                <td><strong>Infrastructure Cost</strong></td>
                                <td>€0.004 / search</td>
                                <td style={{ color: '#10b981' }}>-30% Optimization</td>
                            </tr>
                            <tr>
                                <td><strong>Sync Lag</strong></td>
                                <td>&lt; 400 ms</td>
                                <td style={{ color: '#10b981' }}>Near Real-Time</td>
                            </tr>
                        </tbody>
                    </PerformanceTable>
                </section>

                <section>
                    <h2><Globe size={32} color="#6366f1" /> 5. The Verdict</h2>
                    <p>
                        For high-stakes marketplaces, "Hybrid" is not just an option—it is the standard.
                        By leveraging Firestore for truth and Algolia for discovery, we delivered a user experience
                        that feels instantaneous and magical.
                    </p>
                    <p>
                        This architecture now powers <strong>30,000+ daily searches</strong> on Koli One without breaking a sweat.
                    </p>
                </section>

                <HiringFooter $isDark={isDark}>
                    <Briefcase size={48} color="#10b981" style={{ marginBottom: '1.5rem' }} />
                    <h2>Join the Elite Engineering Team</h2>
                    <p>
                        We are solving complex distributed system problems for the automotive world.
                        If this architecture excites you, we want to talk.
                    </p>
                    <a href="https://koli.one/careers">View Open Positions</a>
                    <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.7 }}>
                        Sofia, Bulgaria • Remote Friendly • Competitive Equity
                    </div>
                </HiringFooter>
            </Content>
        </PageContainer>
    );
};

export default HybridSearchDeepDive;

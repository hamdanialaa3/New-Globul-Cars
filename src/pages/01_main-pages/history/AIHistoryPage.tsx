/**
 * AI Car History Page
 * 
 * Visualizes vehicle history on an interactive timeline.
 * Features:
 * - Timeline view of events (Service, Accidents, Ownership)
 * - AI Analysis of potential red flags
 * - VIN Decoder integration (placeholder)
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
    FileText, Shield, AlertTriangle, CheckCircle,
    Calendar, Wrench, Search, Clock, MapPin, Car
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

// Styled Components
const PageContainer = styled.div<{ $isDark: boolean }>`
  min-height: 100vh;
  padding-top: 100px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  color: ${props => props.$isDark ? '#f8fafc' : '#1e293b'};
  font-family: 'Martica', sans-serif;
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SearchBar = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1e293b' : 'white'};
  padding: 1rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 0 auto 3rem;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e2e8f0'};
`;

const Input = styled.input<{ $isDark: boolean }>`
  flex: 1;
  background: transparent;
  border: none;
  font-size: 1.125rem;
  color: ${props => props.$isDark ? 'white' : '#1e293b'};
  padding: 0 1rem;
  
  &:focus {
    outline: none;
  }
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.75rem 2rem;
  font-weight: 700;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }
`;

const TimelineContainer = styled.div`
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 2px;
    background: #e2e8f0;
    transform: translateX(-50%);
    
    @media (max-width: 768px) {
      left: 20px;
    }
  }
`;

const EventCard = styled(motion.div) <{ $isDark: boolean; $side: 'left' | 'right' }>`
  background: ${props => props.$isDark ? '#1e293b' : 'white'};
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e2e8f0'};
  margin-bottom: 2rem;
  position: relative;
  width: 45%;
  margin-left: ${props => props.$side === 'right' ? 'auto' : '0'};
  margin-right: ${props => props.$side === 'left' ? 'auto' : '0'};

  @media (max-width: 768px) {
    width: calc(100% - 60px);
    margin-left: 60px;
  }
`;

const EventDot = styled.div<{ $type: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => {
        if (props.$type === 'accident') return '#ef4444';
        if (props.$type === 'service') return '#3b82f6';
        if (props.$type === 'owner') return '#10b981';
        return '#94a3b8';
    }};
  border: 4px solid white;
  box-shadow: 0 0 0 2px ${props => {
        if (props.$type === 'accident') return '#ef4444';
        if (props.$type === 'service') return '#3b82f6';
        if (props.$type === 'owner') return '#10b981';
        return '#94a3b8';
    }};
  position: absolute;
  top: 20px;
  left: 50%; // Relative to container, fixed by JS or CSS logic usually
  // Quick hack for centered line:
  ${props => props.theme.dir === 'rtl' ? 'right' : 'left'}: auto;
`;

// Types
interface HistoryEvent {
    id: string;
    date: string;
    title: string;
    description: string;
    type: 'service' | 'accident' | 'owner' | 'inspection';
    km?: number;
}

const mockHistory: HistoryEvent[] = [
    { id: '1', date: '2025-12-10', title: 'Vehicle Listed for Sale', description: 'Listed on Koli One by Verified Dealer.', type: 'inspection', km: 45000 },
    { id: '2', date: '2024-06-15', title: 'Regular Maintenance', description: 'Oil change, filter replacement at Official BMW Service.', type: 'service', km: 38000 },
    { id: '3', date: '2023-01-20', title: 'Ownership Change', description: 'Vehicle purchased by second owner.', type: 'owner', km: 25000 },
    { id: '4', date: '2021-05-10', title: 'First Registration', description: 'Vehicle registered in Germany.', type: 'owner', km: 0 },
];

const AIHistoryPage: React.FC = () => {
    const { theme } = useTheme();
    const { language } = useLanguage();
    const isDark = theme === 'dark';
    const isBg = language === 'bg';

    const [vin, setVin] = useState('');
    const [report, setReport] = useState<HistoryEvent[] | null>(null);

    const handleSearch = () => {
        if (vin.length < 3) return;
        setReport(mockHistory);
    };

    const t = {
        title: isBg ? 'AI История на автомобил' : 'AI Car History',
        subtitle: isBg ? 'Пълна прозрачност за всяко превозно средство.' : 'Complete transparency for every vehicle.',
        placeholder: isBg ? 'Въведете VIN номер...' : 'Enter VIN Number...',
        search: isBg ? 'Провери' : 'Check Report',
        km: isBg ? 'км' : 'km'
    };

    return (
        <PageContainer $isDark={isDark}>
            <ContentWrapper>
                <HeroSection>
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <FileText size={48} color="#f59e0b" />
                    </motion.div>
                    <Title>{t.title}</Title>
                    <p style={{ fontSize: '1.25rem', color: isDark ? '#cbd5e1' : '#64748b' }}>{t.subtitle}</p>
                </HeroSection>

                <SearchBar $isDark={isDark}>
                    <Search size={20} color="#94a3b8" />
                    <Input
                        $isDark={isDark}
                        placeholder={t.placeholder}
                        value={vin}
                        onChange={e => setVin(e.target.value)}
                    />
                    <SearchButton onClick={handleSearch}>{t.search}</SearchButton>
                </SearchBar>

                {report && (
                    <TimelineContainer>
                        {report.map((event, index) => (
                            <EventCard
                                key={event.id}
                                $isDark={isDark}
                                $side={index % 2 === 0 ? 'left' : 'right'}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#64748b' }}>
                                    <Calendar size={14} />
                                    <small>{event.date}</small>
                                    {event.km && (
                                        <>
                                            <span>•</span>
                                            <small>{event.km.toLocaleString()} {t.km}</small>
                                        </>
                                    )}
                                </div>
                                <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {event.type === 'accident' && <AlertTriangle size={18} color="#ef4444" />}
                                    {event.type === 'service' && <Tool size={18} color="#3b82f6" />}
                                    {event.type === 'owner' && <Car size={18} color="#10b981" />}
                                    {event.title}
                                </h3>
                                <p style={{ color: isDark ? '#94a3b8' : '#475569', lineHeight: 1.5 }}>
                                    {event.description}
                                </p>
                            </EventCard>
                        ))}
                    </TimelineContainer>
                )}

            </ContentWrapper>
        </PageContainer>
    );
};

export default AIHistoryPage;

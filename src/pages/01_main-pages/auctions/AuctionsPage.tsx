import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Search, Gavel, Users, Ship, Ghost, Volume2, VolumeX, Star, Trash2 } from 'lucide-react';
import { LiveTicker } from './components/LiveTicker';
import { soundService } from '@/services/sound-service';
import { 
    AuctionsWrapper, AuctionsContainer, AuctionsHeader, SearchContainer, SearchWrapper, SearchInput,
    LiveStatsContainer, StatsBar, StatItem, StatIcon, StatContent, StatNumber, StatLabel, LiveDot,
    MarketSection, SectionHeader, SectionFlagIcon, AuctionsGrid, AuctionCardWrapper, 
    CardBgFlag, CardTag, CardHeaderRow, FlagBadge, CardTitle, CardDesc, BtnVisit, BtnFlagImg,
    GarageSection, GarageHeader, EmptyGarage, SoundToggleButton, StarButton, GarageGrid, GarageCard
} from './components/AuctionsStyles';
import { AUCTIONS_DATA, AUCTION_TRANSLATIONS, Lang, AuctionItem } from './components/AuctionsData';

// --- Auction Card Component ---
interface AuctionCardProps {
    item: AuctionItem;
    t: any;
    isWatched: boolean;
    onToggleWatch: (e: React.MouseEvent) => void;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ item, t, isWatched, onToggleWatch }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 3D Tilt Calculation
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            cardRef.current.style.setProperty("--mouse-x", `${x}px`);
            cardRef.current.style.setProperty("--mouse-y", `${y}px`);
            cardRef.current.style.setProperty("--rotate-x", `${rotateX}deg`);
            cardRef.current.style.setProperty("--rotate-y", `${rotateY}deg`);
        }
    };

    const handleMouseLeave = () => {
        if (cardRef.current) {
            cardRef.current.style.setProperty("--rotate-x", `0deg`);
            cardRef.current.style.setProperty("--rotate-y", `0deg`);
        }
    };

    return (
        <AuctionCardWrapper 
            ref={cardRef} 
            onMouseMove={handleMouseMove} 
            onMouseLeave={handleMouseLeave}
            className="auction-card"
            $region={item.region} // Chameleon UI Trigger
            onMouseEnter={() => soundService.playHover()} // Audio UX
        >
            <StarButton 
                $active={isWatched} 
                onClick={onToggleWatch}
                title={isWatched ? "Remove from Garage" : "Park in Virtual Garage"}
            >
                <Star size={18} />
            </StarButton>

            <CardBgFlag src={item.flagBg} className="card-bg-flag" alt="" />
            <CardTag $tagClass={item.tagClass}>{t[item.tagKey] || item.tagKey}</CardTag>
            <CardHeaderRow>
                <CardTitle>{item.title}</CardTitle>
                <FlagBadge><img src={item.badge} alt="" /></FlagBadge>
            </CardHeaderRow>
            <CardDesc>{t[item.descKey] || item.descKey}</CardDesc>
            <BtnVisit 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => soundService.playClick()} // Audio UX
            >
                <BtnFlagImg src={item.btnFlag} className="btn-flag-img" alt="" />
                <span>{t.btn_visit}</span>
            </BtnVisit>
        </AuctionCardWrapper>
    );
};

// --- Main Page Component ---
const AuctionsPage: React.FC = () => {
    // Context Hooks
    const { language } = useLanguage(); 
    
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [watchlist, setWatchlist] = useState<AuctionItem[]>([]);

    // Stats State
    const [liveAuctions, setLiveAuctions] = useState(4285);
    const [soldToday, setSoldToday] = useState(15492);
    const [activeBidders, setActiveBidders] = useState(124050);

    // Resolve Translations based on context language
    const currentLang: Lang = (language === 'bg' || language === 'en') ? language : 'en';
    const t = AUCTION_TRANSLATIONS[currentLang];

    // Live Stats Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.5) {
                setSoldToday(prev => prev + Math.floor(Math.random() * 3));
            }
            setLiveAuctions(prev => prev + (Math.floor(Math.random() * 10) - 5));
            setActiveBidders(prev => prev + (Math.floor(Math.random() * 50) - 20));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Filter Logic
    const filteredAuctions = AUCTIONS_DATA.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const descMatch = t[item.descKey]?.toLowerCase().includes(searchTerm.toLowerCase());
        const regionMatch = item.region.toLowerCase().includes(searchTerm.toLowerCase());
        return titleMatch || descMatch || regionMatch;
    });

    const renderSection = (regionCode: string, titleKey: string, flagUrl: string) => {
        const regionItems = filteredAuctions.filter(item => item.region === regionCode);
        if (regionItems.length === 0) return null;

        return (
            <MarketSection>
                <SectionHeader>
                    <SectionFlagIcon src={flagUrl} alt="Region Flag" />
                    <h2>{t[titleKey] || titleKey}</h2>
                </SectionHeader>
                <AuctionsGrid>
                    {regionItems.map(item => (
                        <AuctionCard 
                            key={item.id}
                            item={item}
                            t={t}
                            isWatched={watchlist.some(w => w.id === item.id)}
                            onToggleWatch={(e) => toggleWatch(e, item)}
                        />
                    ))}
                </AuctionsGrid>
            </MarketSection>
        );
    };

    const toggleSound = () => {
        const newState = !isSoundEnabled;
        setIsSoundEnabled(newState);
        soundService.setMuted(!newState);
        if (newState) soundService.playSuccess();
    };

    const toggleWatch = (e: React.MouseEvent, item: AuctionItem) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isWatched = watchlist.some(w => w.id === item.id);
        if (isWatched) {
            setWatchlist(prev => prev.filter(w => w.id !== item.id));
            soundService.playClick();
        } else {
            setWatchlist(prev => [...prev, item]);
            soundService.playSuccess();
        }
    };

    return (
        <AuctionsWrapper>
            <LiveTicker /> {/* Live Market Pulse */}

            {/* Sound Toggle */}
            <SoundToggleButton 
                $active={isSoundEnabled} 
                onClick={toggleSound}
                title={isSoundEnabled ? "Mute UI Sounds" : "Unmute UI Sounds"}
            >
                {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </SoundToggleButton>

            <AuctionsContainer>
                {/* Header */}
                <AuctionsHeader>
                    <h1>{t.header_title}</h1>
                    <p>{t.header_sub}</p>
                </AuctionsHeader>

                {/* Search Bar */}
                <SearchContainer>
                    <SearchWrapper>
                        <Search className="search-icon" size={20} />
                        <SearchInput 
                            type="text" 
                            placeholder={t.search_placeholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </SearchWrapper>
                </SearchContainer>

                {/* Live Stats */}
                <LiveStatsContainer>
                    <StatsBar>
                        <StatItem>
                            <LiveDot />
                            <StatContent>
                                <StatNumber>{liveAuctions.toLocaleString()}</StatNumber>
                                <StatLabel>{t.stat_live}</StatLabel>
                            </StatContent>
                        </StatItem>
                        <StatItem>
                            <StatIcon><Gavel /></StatIcon>
                            <StatContent>
                                <StatNumber>{soldToday.toLocaleString()}</StatNumber>
                                <StatLabel>{t.stat_sold}</StatLabel>
                            </StatContent>
                        </StatItem>
                        <StatItem>
                            <StatIcon><Users /></StatIcon>
                            <StatContent>
                                <StatNumber>{activeBidders.toLocaleString()}</StatNumber>
                                <StatLabel>{t.stat_bidders}</StatLabel>
                            </StatContent>
                        </StatItem>
                        <StatItem>
                            <StatIcon><Ship /></StatIcon>
                            <StatContent>
                                <StatNumber>8,730</StatNumber>
                                <StatLabel>{t.stat_transit}</StatLabel>
                            </StatContent>
                        </StatItem>
                    </StatsBar>
                </LiveStatsContainer>

                {/* Dynamic Sections */}
                {renderSection('usa', 'usa_title', 'https://flagcdn.com/w80/us.png')}
                {renderSection('de', 'de_title', 'https://flagcdn.com/w80/de.png')}
                {renderSection('eu', 'eu_title', 'https://flagcdn.com/w80/eu.png')}
                {renderSection('jp', 'jp_title', 'https://flagcdn.com/w80/jp.png')}
                {renderSection('global', 'global_title', 'https://flagcdn.com/w80/kr.png')}

                {/* Virtual Garage (Watchlist) */}
                <GarageSection>
                    <GarageHeader>
                        <h2 style={{margin:0}}>🏎️ My Virtual Garage ({watchlist.length})</h2>
                    </GarageHeader>
                    
                    {watchlist.length === 0 ? (
                        <EmptyGarage>
                            Your dream garage is waiting! Start watching auctions to park them here.
                            <div style={{marginTop: '10px', fontSize: '0.8rem', opacity: 0.7}}>
                                (Coming Soon: 3D Visualization of your monitored cars)
                            </div>
                        </EmptyGarage>
                    ) : (
                        <GarageGrid>
                            {watchlist.map(item => (
                                <GarageCard key={item.id}>
                                    <button 
                                        className="remove-btn" 
                                        onClick={(e) => toggleWatch(e, item)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <img src={item.badge} alt={item.title} />
                                    <h4>{item.title}</h4>
                                    <div style={{fontSize: '0.7rem', opacity: 0.6}}>
                                        {item.region.toUpperCase()}
                                    </div>
                                </GarageCard>
                            ))}
                        </GarageGrid>
                    )}
                </GarageSection>

                {/* Empty State */}
                {filteredAuctions.length === 0 && (
                    <div style={{textAlign: 'center', padding: '50px', color: '#94a3b8'}}>
                        <Ghost size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                        <p>No auctions found matching "{searchTerm}"</p>
                    </div>
                )}
            </AuctionsContainer>
        </AuctionsWrapper>
    );
};

export default AuctionsPage;

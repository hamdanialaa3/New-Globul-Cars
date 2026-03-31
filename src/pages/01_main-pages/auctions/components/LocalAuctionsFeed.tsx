import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { AuctionListing } from '../../../../services/auctions/auction-types';
import { auctionService } from '../../../../services/auctions/auction-service';
import { Clock, TrendingUp, Gavel } from 'lucide-react';
import { soundService } from '../../../../services/sound-service';

// --- Styled Components ---
const FeedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const LiveBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--error, #e53e3e);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(229, 62, 62, 0.4);

  &::before {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: white;
    animation: ${pulseAnimation} 1.5s infinite ease-in-out;
  }
`;

const CardWrapper = styled.div`
  background: var(--bg-card, #ffffff);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-primary, #e2e8f0);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border-color: var(--accent-primary, #3182ce);
  }

  .dark-theme & {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
`;

const CarImage = styled.div<{ $bg: string }>`
  height: 180px;
  background-image: url(${props => props.$bg});
  background-size: cover;
  background-position: center;
  position: relative;
`;

const CardContent = styled.div`
  padding: 16px;
`;

const CarTitle = styled.h3`
  font-size: 1.1rem;
  margin: 0 0 10px 0;
  color: var(--text-primary);
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

const BidPrice = styled.div<{ $isUrgent?: boolean }>`
  font-size: 1.4rem;
  font-weight: 800;
  color: ${props => props.$isUrgent ? 'var(--error, #e53e3e)' : 'var(--success, #38a169)'};
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
`;

const CountdownTime = styled.div<{ $isUrgent?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: ${props => props.$isUrgent ? 'var(--error, #e53e3e)' : 'var(--text-primary)'};
  background: ${props => props.$isUrgent ? 'rgba(229, 62, 62, 0.1)' : 'var(--bg-secondary)'};
  padding: 6px 12px;
  border-radius: 8px;
  margin-top: 15px;
  ${props => props.$isUrgent && css`
    animation: ${pulseAnimation} 2s infinite ease-in-out;
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  background: var(--bg-card);
  border-radius: 16px;
  border: 1px dashed var(--border-primary);
  margin-top: 20px;

  svg {
    opacity: 0.5;
    margin-bottom: 15px;
  }
`;

// --- Timer Helper ---
const formatTimeRemaining = (endTime: any) => {
  let endMs = 0;
  if (endTime && typeof endTime.toMillis === 'function') {
    endMs = endTime.toMillis();
  } else if (typeof endTime === 'string') {
    endMs = new Date(endTime).getTime();
  }

  const nowMs = Date.now();
  const diff = endMs - nowMs;

  if (diff <= 0) return { text: 'Auction Ended', isUrgent: false, ended: true };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const isUrgent = hours === 0 && minutes < 60; // Less than an hour left

  if (hours > 24) {
    return { text: `${Math.floor(hours / 24)} days left`, isUrgent: false, ended: false };
  }

  return { 
    text: `${hours}h ${minutes}m ${seconds}s`, 
    isUrgent, 
    ended: false 
  };
};

export interface LocalAuctionsFeedProps {
  onSelectAuction: (auction: AuctionListing) => void;
}

export const LocalAuctionsFeed: React.FC<LocalAuctionsFeedProps> = ({ onSelectAuction }) => {
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      const data = await auctionService.getActiveAuctions();
      setAuctions(data);
      setLoading(false);
    };

    fetchAuctions();

    // Timer trigger to re-render countdowns
    const interval = setInterval(() => {
      setTicker(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCardClick = (auction: AuctionListing) => {
    soundService.playClick();
    onSelectAuction(auction);
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Live Auctions...</div>;
  }

  if (auctions.length === 0) {
    return (
      <EmptyState>
        <Gavel size={48} />
        <h3 style={{margin: '10px 0'}}>Няма активни търгове в момента</h3>
        <p>Няма превозни средства, предлагани на живо (B2B Local). Опитайте по-късно.</p>
      </EmptyState>
    );
  }

  return (
    <FeedGrid>
      {auctions.map(auction => {
        const timeStatus = formatTimeRemaining(auction.timing.endTime);
        
        return (
          <CardWrapper key={auction.id} onClick={() => handleCardClick(auction)}>
            <LiveBadge>ПО НАДДАВАНЕ</LiveBadge>
            <CarImage $bg={auction.carDetails.imageUrl} />
            <CardContent>
              <CarTitle>{auction.carDetails.make} {auction.carDetails.model} {auction.carDetails.year}</CarTitle>
              
              <DetailRow>
                <span>ПРОБЕГ</span>
                <strong>{auction.carDetails.mileage.toLocaleString()} км</strong>
              </DetailRow>
              <DetailRow>
                <span>ГОРИВО</span>
                <strong>{auction.carDetails.fuelType}</strong>
              </DetailRow>

              <BidPrice $isUrgent={timeStatus.isUrgent}>
                <TrendingUp size={24} />
                {auction.pricing.currentBid.toLocaleString()} BGN
              </BidPrice>

              <CountdownTime $isUrgent={timeStatus.isUrgent}>
                <Clock size={18} /> 
                {timeStatus.ended ? 'ПРИКЛЮЧИЛ' : `Остават ${timeStatus.text}`}
              </CountdownTime>

              <div style={{ fontSize: '0.75rem', marginTop: '10px', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                {auction.bidsCount} наддавания
              </div>
            </CardContent>
          </CardWrapper>
        );
      })}
    </FeedGrid>
  );
};

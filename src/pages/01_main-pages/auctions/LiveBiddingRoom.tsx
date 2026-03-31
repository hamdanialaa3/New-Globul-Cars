import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { AuctionListing } from '../../../services/auctions/auction-types';
import { auctionService } from '../../../services/auctions/auction-service';
import { useAuth } from '../../../contexts/AuthProvider';
import { Clock, TrendingUp, AlertTriangle, ArrowLeft, Loader2, CheckCircle, Gavel } from 'lucide-react';
import { soundService } from '../../../services/sound-service';

// --- Styled Components ---
const RoomOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const RoomContainer = styled.div`
  width: 100%;
  max-width: 900px;
  background: var(--bg-primary);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  position: relative;
  
  @media (min-width: 768px) {
    flex-direction: row;
    height: 600px;
  }
`;

const CarPanel = styled.div<{ $bg: string }>`
  flex: 1;
  background-image: url(${props => props.$bg});
  background-size: cover;
  background-position: center;
  position: relative;
  min-height: 250px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  }
`;

const CarInfo = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 2;
  color: white;

  h2 {
    font-size: 2rem;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }

  p {
    margin: 5px 0 0 0;
    font-size: 1.1rem;
    opacity: 0.9;
  }
`;

const BiddingPanel = styled.div`
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

const TimerBox = styled.div<{ $urgent: boolean }>`
  background: ${props => props.$urgent ? 'var(--error)' : 'var(--bg-card)'};
  color: ${props => props.$urgent ? 'white' : 'var(--text-primary)'};
  border: 1px solid ${props => props.$urgent ? 'transparent' : 'var(--border-primary)'};
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 20px;
  box-shadow: ${props => props.$urgent ? '0 0 20px rgba(229, 62, 62, 0.5)' : 'none'};
  transition: all 0.3s ease;
`;

const PriceArea = styled.div`
  text-align: center;
  margin: 30px 0;

  .label {
    text-transform: uppercase;
    font-size: 0.9rem;
    color: var(--text-secondary);
    letter-spacing: 1px;
  }

  .price {
    font-size: 3rem;
    font-weight: 900;
    color: var(--success);
    margin: 10px 0;
  }

  .bids {
    font-size: 0.9rem;
    color: var(--text-tertiary);
  }
`;

const BidButtonsCard = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--border-primary);
  margin-top: auto;
`;

const BidGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 15px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 15px;
  border-radius: 10px;
  border: none;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  background: ${props => props.$primary ? 'var(--accent-primary)' : 'var(--bg-button)'};
  color: ${props => props.$primary ? 'var(--text-inverse)' : 'var(--text-primary)'};
  transition: transform 0.1s;

  &:hover {
    filter: brightness(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// Helper
const getRemainingMs = (endTime: any) => {
  if (!endTime) return 0;
  const ms = typeof endTime.toMillis === 'function' ? endTime.toMillis() : new Date(endTime).getTime();
  return ms - Date.now();
};

export interface LiveBiddingRoomProps {
  auctionId: string;
  onClose: () => void;
}

export const LiveBiddingRoom: React.FC<LiveBiddingRoomProps> = ({ auctionId, onClose }) => {
  const { user, userProfile } = useAuth();
  const [auction, setAuction] = useState<AuctionListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ text: string, urgent: boolean, ended: boolean }>({ text: '', urgent: false, ended: false });

  // 1. Subscribe to Live Auction
  useEffect(() => {
    let unsubscribe: () => void;
    setLoading(true);

    try {
      unsubscribe = auctionService.subscribeToAuction(auctionId, (data: AuctionListing | null) => {
        if (data) {
          // Play sound if price increased and we aren't the winner
          if (auction && data.pricing.currentBid > auction.pricing.currentBid) {
            if (data.pricing.winningBidderId !== user?.uid) {
              soundService.playError(); // Someone outbid
            } else {
              soundService.playSuccess(); // We placed a valid bid
            }
          }
          setAuction(data);
        } else {
          setAuction(null); // Deleted or error
        }
        setLoading(false);
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [auctionId, user?.uid]); // removed `auction` from deps to avoid infinite loop

  // 2. Local Countdown Timer (Updates every second locally)
  useEffect(() => {
    if (!auction) return;

    const interval = setInterval(() => {
      const diff = getRemainingMs(auction.timing.endTime);
      
      if (diff <= 0) {
        setTimeLeft({ text: 'Аукционът Приключи', urgent: false, ended: true });
        clearInterval(interval);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        text: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
        urgent: h === 0 && m < 5, // Urgent if less than 5 minutes
        ended: false
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [auction?.timing.endTime]);

  const placeBid = async (amountToAdd: number) => {
    if (!user || !auction) return;
    
    // Auth Check
    if (userProfile?.accountType !== 'company' && userProfile?.accountType !== 'dealer') {
      alert('Само оторизирани търговци могат да наддават. Моля, надстройте акаунта си.');
      return;
    }

    setPlacingBid(true);
    try {
      const newBid = auction.pricing.currentBid + amountToAdd;
      await auctionService.placeBid(auction.id, user.uid, newBid);
      // Wait for snapshot to update normally
    } catch (err: any) {
      soundService.playError();
      alert('Неуспешно наддаване: ' + err.message);
    } finally {
      setPlacingBid(false);
    }
  };

  if (loading) {
    return (
      <RoomOverlay>
        <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Loader2 className="animate-spin" /> Зареждане на Аукциона на живо...
        </div>
      </RoomOverlay>
    );
  }

  if (!auction) return null;

  const isWinning = auction.pricing.winningBidderId === user?.uid;

  return (
    <RoomOverlay>
      <CloseButton onClick={onClose}><ArrowLeft /></CloseButton>
      <RoomContainer>
        {/* Left Side: Car Hero */}
        <CarPanel $bg={auction.carDetails.imageUrl}>
          <CarInfo>
            <h2>{auction.carDetails.make} {auction.carDetails.model}</h2>
            <p>{auction.carDetails.year} • {auction.carDetails.mileage.toLocaleString()} км • {auction.carDetails.fuelType}</p>
          </CarInfo>
        </CarPanel>

        {/* Right Side: Action Room */}
        <BiddingPanel>
          <TimerBox $urgent={timeLeft.urgent && !timeLeft.ended}>
            <Clock /> 
            {timeLeft.urgent && !timeLeft.ended && <span className="animate-pulse">ОСТАВАТ: </span>}
            {timeLeft.text}
          </TimerBox>

          <PriceArea>
            <div className="label">ТЕКУЩА НАЙ-ВИСОКА ЦЕНА</div>
            <div className="price">{auction.pricing.currentBid.toLocaleString()} лв.</div>
            <div className="bids">{auction.bidsCount} наддавания до момента</div>
          </PriceArea>

          {isWinning && !timeLeft.ended && (
            <div style={{ background: 'var(--success)', color: 'white', padding: '10px', borderRadius: '8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              <CheckCircle size={20} /> Вие водите търга!
            </div>
          )}

          {!user && (
            <div style={{ background: 'var(--warning)', color: 'black', padding: '15px', borderRadius: '8px', textAlign: 'center', marginTop: 'auto' }}>
              Трябва да влезете в профила си като Дийлър, за да наддавате.
            </div>
          )}

          {user && !timeLeft.ended && (
            <BidButtonsCard>
              <h4 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Бързо Наддаване (B2B)</h4>
              <BidGrid>
                <ActionButton 
                  disabled={placingBid || isWinning} 
                  onClick={() => placeBid(100)}
                >
                  {placingBid ? <Loader2 className="animate-spin" size={20} style={{margin:'auto'}}/> : '+ 100 лв.'}
                </ActionButton>
                <ActionButton 
                  $primary 
                  disabled={placingBid || isWinning} 
                  onClick={() => placeBid(500)}
                >
                  {placingBid ? <Loader2 className="animate-spin" size={20} style={{margin:'auto'}}/> : '+ 500 лв.'}
                </ActionButton>
              </BidGrid>
            </BidButtonsCard>
          )}

          {timeLeft.ended && (
            <div style={{ textAlign: 'center', marginTop: 'auto', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
              <Gavel size={48} color={isWinning ? "var(--success)" : "var(--text-tertiary)"} style={{margin: '0 auto 10px'}} />
              <h3>МЗАДЪТ ПРИКЛЮЧИ</h3>
              {isWinning ? <h4 style={{color: 'var(--success)'}}>ЧЕСТИТО! АВТОМОБИЛЪТ Е ВАШ!</h4> : <p>Автомобилът беше продаден за {auction.pricing.currentBid} лв.</p>}
            </div>
          )}
        </BiddingPanel>

      </RoomContainer>
    </RoomOverlay>
  );
};

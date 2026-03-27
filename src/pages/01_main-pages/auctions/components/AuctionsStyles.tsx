import styled, { keyframes, css } from 'styled-components';
import { media } from '../../../../styles/design-system';

// --- Animations ---
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
`;

const gradientText = css`
  background: linear-gradient(90deg, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

// --- Components ---

export const AuctionsWrapper = styled.div`
  font-family: 'Exo 2', sans-serif;
  background-color: transparent;
  width: 100%;
  min-height: 100vh;
  padding-top: 80px; // account for fixed header
`;

export const AuctionsContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px 50px;
`;

export const AuctionsHeader = styled.header`
  text-align: center;
  padding: 50px 0 30px;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    line-height: 1.2;
    background: linear-gradient(to right, ${props => props.theme.colors.text.primary || '#ffffff'}, ${props => props.theme.colors.primary.light || '#a5b4fc'});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    
    ${media.maxMobile} {
      font-size: 2rem;
    }
  }

  p {
    color: ${props => props.theme.colors.text.secondary || '#94a3b8'};
    font-size: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  padding: 0 20px;
`;

export const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;

  .search-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.text.hint || '#94a3b8'};
    pointer-events: none;
    z-index: 2;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 45px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 30px;
  color: ${props => props.theme.colors.text.primary || '#fff'};
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);

  &:focus {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'};
    border-color: ${props => props.theme.colors.primary.main || '#3b82f6'};
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
    outline: none;
  }
`;

export const LiveStatsContainer = styled.div`
  margin-bottom: 60px;
  display: flex;
  justify-content: center;
`;

export const StatsBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.2);
  padding: 15px 30px;
  border-radius: 50px;
  backdrop-filter: blur(5px);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);

  ${media.maxMobile} {
    flex-direction: column;
    gap: 10px;
    border-radius: 20px;
    width: 100%;
  }
`;

export const StatItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0 15px;
  border-right: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};

  &:last-child {
    border-right: none;
  }

  ${media.maxMobile} {
    border-right: none;
    border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
    padding-bottom: 10px;
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

export const StatIcon = styled.div`
  color: #10b981;
  margin-right: 10px;
  
  svg {
    width: 1.2rem;
    height: 1.2rem;
    animation: ${pulse} 2s infinite;
  }
`;

export const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StatNumber = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  font-variant-numeric: tabular-nums;
`;

export const StatLabel = styled.span`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${props => props.theme.colors.text.secondary};
`;

export const LiveDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 8px #ef4444;
  animation: ${blink} 1s infinite;
`;

export const MarketSection = styled.section`
  margin-bottom: 50px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${props => props.theme.colors.text.primary};
  }
`;

export const SectionFlagIcon = styled.img`
  width: 32px;
  height: 24px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
`;

export const AuctionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;

  ${media.maxMobile} {
    grid-template-columns: 1fr;
  }
`;

export const AuctionCardWrapper = styled.div<{ $region?: string }>`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 12px;
  padding: 24px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  z-index: 1;

  /* CHAMELEON UI: Dynamic Ambient Glow based on Region */
  ${props => {
    switch(props.$region) {
        case 'usa': return css`
            &:hover { border-color: rgba(59, 130, 246, 0.5); box-shadow: 0 15px 40px rgba(59, 130, 246, 0.15); }
            &::after { content: ''; position: absolute; top:0; left:0; right:0; height: 3px; background: linear-gradient(90deg, #ef4444, #ffffff, #3b82f6); opacity: 0; transition: opacity 0.3s; }
            &:hover::after { opacity: 1; }
        `;
        case 'de': return css`
            &:hover { border-color: rgba(245, 158, 11, 0.5); box-shadow: 0 15px 40px rgba(245, 158, 11, 0.15); }
            &::after { content: ''; position: absolute; top:0; left:0; right:0; height: 3px; background: linear-gradient(90deg, #000000, #ef4444, #fbbf24); opacity: 0; transition: opacity 0.3s; }
            &:hover::after { opacity: 1; }
        `;
        case 'jp': return css`
            &:hover { border-color: rgba(239, 68, 68, 0.5); box-shadow: 0 15px 40px rgba(239, 68, 68, 0.15); }
            &::after { content: ''; position: absolute; top:0; left:0; right:0; height: 3px; background: linear-gradient(90deg, #ffffff, #ef4444, #ffffff); opacity: 0; transition: opacity 0.3s; }
            &:hover::after { opacity: 1; }
        `;
        case 'eu': return css`
            &:hover { border-color: rgba(37, 99, 235, 0.5); box-shadow: 0 15px 40px rgba(37, 99, 235, 0.15); }
            &::after { content: ''; position: absolute; top:0; left:0; right:0; height: 3px; background: linear-gradient(90deg, #2563eb, #fbbf24); opacity: 0; transition: opacity 0.3s; }
            &:hover::after { opacity: 1; }
        `;
        default: return css`
             &:hover {
                transform: translateY(-5px);
                border-color: ${props.theme.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'};
                box-shadow: 0 15px 30px rgba(0,0,0,0.2);
             }
        `;
    }
  }}

  @property --mouse-x {
    syntax: '<length>';
    initial-value: 0px;
    inherits: false;
  }
    
  @property --mouse-y {
    syntax: '<length>';
    initial-value: 0px;
    inherits: false;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}, transparent 40%);
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;
    z-index: 0;
  }
  
    transform: perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg)) translateY(-5px);
    border-color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'};
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);

    &::before {
      opacity: 1;
    }

    .card-bg-flag {
        opacity: 0.2;
        transform: rotate(0deg) scale(1.1);
        filter: grayscale(0);
    }
  }
`;

export const SoundToggleButton = styled.button<{ $active: boolean }>`
    position: fixed;
    bottom: 30px;
    left: 30px;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
    background: ${props => props.theme.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
    backdrop-filter: blur(10px);
    color: ${props => props.$active ? (props.theme.colors.primary.main || '#2563EB') : props.theme.colors.text.secondary};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1000;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 15px 30px rgba(0,0,0,0.2);
    }
`;

export const CardBgFlag = styled.img`
  position: absolute;
  top: -20px;
  right: -30px;
  width: 140px;
  height: auto;
  opacity: 0.07;
  transform: rotate(15deg);
  z-index: -1;
  filter: grayscale(0.3);
  transition: all 0.4s ease;
  pointer-events: none;
`;

export const CardTag = styled.span<{ $tagClass: string }>`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
  margin-bottom: 12px;
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
  align-self: flex-start;
  
  // Dynamic colors based on class (could be prop based but mapping classic classes)
  color: ${props => {
    switch(props.$tagClass) {
        case 'us-tag': return '#ef4444';
        case 'de-tag': return '#f59e0b';
        case 'eu-tag': return '#3b82f6';
        case 'jp-tag': return '#8b5cf6';
        case 'gl-tag': return '#14b8a6';
        default: return 'inherit';
    }
  }};
  
  border: 1px solid ${props => {
     switch(props.$tagClass) {
        case 'us-tag': return 'rgba(239, 68, 68, 0.2)';
        case 'de-tag': return 'rgba(245, 158, 11, 0.2)';
        case 'eu-tag': return 'rgba(59, 130, 246, 0.2)';
        case 'jp-tag': return 'rgba(139, 92, 246, 0.2)';
        case 'gl-tag': return 'rgba(20, 184, 166, 0.2)';
        default: return 'transparent';
    }
  }};
`;

export const CardHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const FlagBadge = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const CardTitle = styled.h3`
  font-size: 1.35rem;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

export const CardDesc = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.9rem;
  margin-bottom: 20px;
  line-height: 1.4;
  flex-grow: 1;
  position: relative;
  z-index: 1;
`;

export const BtnVisit = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 10px;
  background: ${props => props.theme.mode === 'dark' ? 'linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' : 'linear-gradient(90deg, #f1f5f9, #e2e8f0)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  color: ${props => props.theme.colors.text.primary};
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: 0.3s;
  position: relative;
  z-index: 10;
  overflow: hidden;

  &:hover {
    background: ${props => props.theme.colors.text.primary};
    color: ${props => props.theme.colors.background.default || '#ffffff'};
    transform: scale(1.01);
    box-shadow: 0 0 15px rgba(0,0,0,0.1);
    
    .btn-flag-img {
       transform: scale(1.2) rotate(5deg);
    }
  }
`;

export const StarButton = styled.button<{ $active?: boolean }>`
    position: absolute;
    top: 15px;
    right: 15px;
    background: ${props => props.$active 
        ? (props.theme.colors.primary.main || '#2563EB') 
        : 'rgba(0, 0, 0, 0.4)'};
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    z-index: 5;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    backdrop-filter: blur(5px);
    
    &:hover {
        transform: scale(1.15) rotate(15deg);
        background: ${props => props.$active 
            ? (props.theme.colors.primary.main || '#2563EB') 
            : 'rgba(0, 0, 0, 0.6)'};
    }

    svg {
        fill: ${props => props.$active ? '#fff' : 'none'};
    }
`;

export const BtnFlagImg = styled.img`
  width: 20px;
  height: 15px;
  object-fit: cover;
  border-radius: 2px;
  margin-right: 10px;
  transition: transform 0.3s;
`;

// --- Garage Section ---
export const GarageSection = styled.div`
  margin-top: 60px;
  padding: 40px;
  background: ${props => props.theme.mode === 'dark' ? 'linear-gradient(180deg, rgba(30,41,59,0.5), rgba(15,23,42,0.8))' : 'linear-gradient(180deg, #f8fafc, #e2e8f0)'};
  border-radius: 20px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
  position: relative;
  overflow: hidden;
  
  /* Floor texture effect */
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    background-image: radial-gradient(${props => props.theme.colors.text.secondary} 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.05;
    transform: perspective(500px) rotateX(20deg);
    transform-origin: bottom;
    pointer-events: none;
  }
`;

export const GarageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 15px;
  
  h2 {
    font-size: 1.8rem;
    color: ${props => props.theme.colors.text.primary};
  }
`;

export const EmptyGarage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.text.secondary};
  border: 2px dashed ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  border-radius: 12px;
`;

export const GarageGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    position: relative;
    z-index: 1;
`;

export const GarageCard = styled.div`
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff'};
    border-radius: 12px;
    padding: 15px;
    border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }

    img {
        width: 60px;
        height: auto;
        opacity: 0.8;
    }

    h4 {
        margin: 0;
        font-size: 1rem;
        color: ${props => props.theme.colors.text.primary};
    }

    .remove-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        background: none;
        border: none;
        color: #ef4444;
        cursor: pointer;
        padding: 5px;
        opacity: 0;
        transition: opacity 0.3s;
    }

    &:hover .remove-btn {
        opacity: 1;
    }
`;



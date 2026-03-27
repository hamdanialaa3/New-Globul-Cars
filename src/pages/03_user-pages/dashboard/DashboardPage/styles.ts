import styled, { keyframes } from 'styled-components';

// Modern Dark Glass Color Palette
export const colors = {
  primary: {
    blue: '#00D4FF',
    blueMedium: '#0099CC',
    blueDark: '#006699',
    blueDeep: '#003D66',
  },
  neutral: {
    black: '#000000',
    blackLight: '#0A0A0A',
    blackMedium: '#1A1A1A',
    blackSoft: '#2A2A2A',
    gray: '#404040',
    grayLight: '#666666',
    grayLighter: '#999999',
    white: '#FFFFFF',
  },
  glass: {
    dark: 'rgba(0, 0, 0, 0.8)',
    medium: 'rgba(0, 0, 0, 0.6)',
    light: 'rgba(0, 0, 0, 0.4)',
    border: 'rgba(255, 255, 255, 0.1)',
    highlight: 'rgba(0, 212, 255, 0.1)',
  },
  accent: {
    success: '#00FF88',
    warning: '#FFB800',
    error: '#FF4444',
    info: '#00D4FF',
  }
};

// Modern Animations
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

export const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.6); }
`;

export const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Main Container - Enhanced Dark Glass Theme
export const DashboardContainer = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 25%, #2A2A2A 50%, #1A1A1A 75%, #0A0A0A 100%),
    radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.08) 0%, transparent 60%),
    radial-gradient(circle at 80% 20%, rgba(0, 212, 255, 0.04) 0%, transparent 60%),
    radial-gradient(circle at 40% 40%, rgba(0, 212, 255, 0.02) 0%, transparent 60%);
  position: relative;
  overflow-x: hidden;
  padding: 1.5rem 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      linear-gradient(45deg, transparent 30%, rgba(0, 212, 255, 0.015) 50%, transparent 70%);
    animation: ${shimmer} 4s ease-in-out infinite;
    pointer-events: none;
  }
`;

// Header Section - Enhanced Glass Effect
export const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  background: ${colors.glass.dark};
  backdrop-filter: blur(25px);
  border: 1px solid ${colors.glass.border};
  border-radius: 32px;
  padding: 2.5rem 2rem;
  animation: ${fadeIn} 0.8s ease-out;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: ${colors.neutral.white};
    margin-bottom: 0.75rem;
    text-shadow: 0 2px 16px rgba(0, 212, 255, 0.3);
    position: relative;
    z-index: 1;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, ${colors.primary.blue}, ${colors.primary.blueDark});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    font-size: 1.1rem;
    color: ${colors.neutral.grayLighter};
    opacity: 0.9;
    position: relative;
    z-index: 1;
    line-height: 1.6;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, ${colors.glass.highlight} 50%, transparent 70%);
    opacity: 0.03;
    pointer-events: none;
  }
`;

// Container
export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

// Statistics Grid
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

// Stat Card - Enhanced Glass Effect
export const StatCard = styled.div`
  background: ${colors.glass.medium};
  backdrop-filter: blur(30px);
  border: 1px solid ${colors.glass.border};
  border-radius: 24px;
  padding: 2rem;
  animation: ${slideIn} 0.8s ease-out;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 212, 255, 0.08);
    border-color: ${colors.primary.blue};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, ${colors.glass.highlight} 50%, transparent 70%);
    opacity: 0.025;
    pointer-events: none;
  }

  .stat-icon {
    font-size: 2.5rem;
    margin-bottom: 1.25rem;
    box-shadow: 0 6px 16px rgba(0, 212, 255, 0.25);
    position: relative;
    z-index: 1;
  }

  .stat-value {
    font-size: 2.2rem;
    font-weight: 600;
    color: ${colors.primary.blue};
    margin-bottom: 0.4rem;
    text-shadow: 0 1px 8px rgba(0, 212, 255, 0.2);
    position: relative;
    z-index: 1;
    letter-spacing: -0.01em;
  }

  .stat-label {
    font-size: 0.95rem;
    color: ${colors.neutral.grayLighter};
    opacity: 0.85;
    margin-bottom: 0.4rem;
    position: relative;
    z-index: 1;
    line-height: 1.4;
  }

  .stat-change {
    font-size: 0.85rem;
    font-weight: 500;
    position: relative;
    z-index: 1;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);

    &.positive {
      color: ${colors.accent.success};
      text-shadow: 0 1px 6px rgba(0, 255, 136, 0.2);
    }

    &.negative {
      color: ${colors.accent.error};
      text-shadow: 0 1px 6px rgba(255, 68, 68, 0.2);
    }

    &.warning {
      color: ${colors.accent.warning};
      text-shadow: 0 1px 6px rgba(255, 184, 0, 0.2);
    }

    &.info {
      color: ${colors.accent.info};
      text-shadow: 0 1px 6px rgba(0, 212, 255, 0.2);
    }
  }
`;

// Content Grid - Enhanced
export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2.25rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.75rem;
  }
`;

// Main Content
export const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
`;

// Sidebar
export const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
`;

// Content Card - Enhanced Glass Effect
export const ContentCard = styled.div`
  background: ${colors.glass.medium};
  backdrop-filter: blur(30px);
  border: 1px solid ${colors.glass.border};
  border-radius: 28px;
  padding: 2.25rem 2rem;
  animation: ${slideIn} 0.8s ease-out;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0, 212, 255, 0.08);
    border-color: ${colors.primary.blue};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, ${colors.glass.highlight} 50%, transparent 70%);
    opacity: 0.025;
    pointer-events: none;
  }

  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: ${colors.primary.blue};
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-shadow: 0 1px 6px rgba(0, 212, 255, 0.2);
    position: relative;
    z-index: 1;
    letter-spacing: -0.01em;

    &::before {
      content: '';
      width: 3px;
      height: 20px;
      background: linear-gradient(135deg, ${colors.primary.blue}, ${colors.primary.blueDark});
      border-radius: 2px;
      box-shadow: 0 1px 6px rgba(0, 212, 255, 0.2);
    }
  }
`;

// Car List
export const CarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const CarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: ${colors.glass.light};
  border: 1px solid ${colors.glass.border};
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  margin-bottom: 0.75rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, ${colors.glass.highlight} 50%, transparent 70%);
    opacity: 0.015;
    pointer-events: none;
  }

  &:hover {
    background: ${colors.glass.medium};
    transform: translateX(6px);
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.08);
    border-color: ${colors.primary.blue};
  }

  .car-image {
    width: 72px;
    height: 54px;
    background: linear-gradient(135deg, ${colors.neutral.gray}, ${colors.neutral.blackSoft});
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${colors.neutral.white};
    font-size: 0.75rem;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
  }

  .car-info {
    flex: 1;
    position: relative;
    z-index: 1;

    .car-title {
      font-weight: 600;
      color: ${colors.neutral.white};
      margin-bottom: 0.2rem;
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
      font-size: 0.95rem;
    }

    .car-details {
      font-size: 0.85rem;
      color: ${colors.neutral.grayLighter};
      line-height: 1.4;
    }
  }

  .car-status {
    padding: 0.4rem 0.9rem;
    border-radius: 24px;
    font-size: 0.75rem;
    font-weight: 500;
    position: relative;
    z-index: 1;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;

    &.active {
      background: rgba(0, 255, 136, 0.15);
      color: ${colors.accent.success};
      border: 1px solid rgba(0, 255, 136, 0.25);
      box-shadow: 0 2px 8px rgba(0, 255, 136, 0.15);
    }

    &.pending {
      background: rgba(255, 184, 0, 0.15);
      color: ${colors.accent.warning};
      border: 1px solid rgba(255, 184, 0, 0.25);
      box-shadow: 0 2px 8px rgba(255, 184, 0, 0.15);
    }

    &.sold {
      background: rgba(255, 68, 68, 0.15);
      color: ${colors.accent.error};
      border: 1px solid rgba(255, 68, 68, 0.25);
      box-shadow: 0 2px 8px rgba(255, 68, 68, 0.15);
    }
  }
`;

// Message List
export const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const MessageItem = styled.div`
  padding: 1.25rem;
  background: ${colors.glass.light};
  border: 1px solid ${colors.glass.border};
  border-radius: 16px;
  border-left: 3px solid ${colors.primary.blue};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  margin-bottom: 0.75rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, ${colors.glass.highlight} 50%, transparent 70%);
    opacity: 0.015;
    pointer-events: none;
  }

  &:hover {
    background: ${colors.glass.medium};
    transform: translateX(6px);
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.08);
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.4rem;
    position: relative;
    z-index: 1;

    .sender {
      font-weight: 600;
      color: ${colors.neutral.white};
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
      font-size: 0.9rem;
    }

    .time {
      font-size: 0.75rem;
      color: ${colors.neutral.grayLighter};
    }
  }

  .message-preview {
    color: ${colors.neutral.grayLighter};
    font-size: 0.85rem;
    line-height: 1.4;
    position: relative;
    z-index: 1;
  }
`;

// Notification List
export const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const NotificationItem = styled.div`
  padding: 1.25rem;
  background: ${colors.glass.light};
  border: 1px solid ${colors.glass.border};
  border-radius: 16px;
  border-left: 3px solid ${colors.accent.info};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  margin-bottom: 0.75rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, ${colors.glass.highlight} 50%, transparent 70%);
    opacity: 0.015;
    pointer-events: none;
  }

  &:hover {
    background: ${colors.glass.medium};
    transform: translateX(6px);
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.08);
  }

  .notification-content {
    color: ${colors.neutral.white};
    margin-bottom: 0.4rem;
    position: relative;
    z-index: 1;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .notification-time {
    font-size: 0.75rem;
    color: ${colors.neutral.grayLighter};
    position: relative;
    z-index: 1;
  }
`;

// Action Button - Enhanced Glass Effect
export const ActionButton = styled.button`
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, ${colors.primary.blue}, ${colors.primary.blueDark});
  color: ${colors.neutral.white};
  border: 1px solid ${colors.glass.border};
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
  box-shadow: 0 3px 12px rgba(0, 212, 255, 0.15);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    transition: left 0.6s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.25);
    animation: ${glow} 1.5s ease-in-out infinite;

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Quick Actions - Enhanced
export const QuickActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

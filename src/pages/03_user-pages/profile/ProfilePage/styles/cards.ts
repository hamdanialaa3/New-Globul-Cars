import defaultStyled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

import type { ProfileType } from '../../../../../types/user/bulgarian-user.types';

const styled = defaultStyled;

// ==================== STATS & BADGES ====================

export const StatsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    margin: 16px 0 0;
    padding: 16px 0;
    border-top: 1px solid var(--border-primary);
    border-bottom: 1px solid var(--border-primary);
    background: rgba(0, 0, 0, 0.01);
  }
  
  @media (max-width: 480px) {
    margin: 12px 0 0;
    padding: 12px 0;
  }
`;

export const Stat = styled(Link)`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  font-weight: 600;

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
  }

  span {
    font-weight: 400;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 8px;
    font-size: 0.875rem;
    gap: 2px;
    
    &::before {
      content: attr(data-count);
      font-size: 1.125rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.text.primary};
      display: block;
      line-height: 1.2;
    }
    
    span {
      font-size: 0.75rem;
      font-weight: 400;
      color: ${({ theme }) => theme.colors.text.secondary};
      line-height: 1.2;
    }
    
    -webkit-tap-highlight-color: transparent;
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.95);
      background: rgba(0, 0, 0, 0.02);
      border-radius: 8px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 0 6px;
    
    &::before {
      font-size: 1rem;
    }
    
    span {
      font-size: 0.6875rem;
    }
  }
`;

export const CompletionBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--border-secondary);
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

export const CompletionPercentage = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-primary);
  line-height: 1;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

export const CompletionLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

export const ProfileDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
  
  @media (max-width: 768px) {
    justify-content: center;
    gap: 12px;
    margin-top: 8px;
  }
`;

export const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--text-tertiary);
  
  svg {
    color: var(--accent-primary);
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

export const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--accent-primary);
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: 12px;
  }
`;

export const ProfileTypeBadge = styled.span<{ type: ProfileType }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 0.75rem;
  vertical-align: middle;
  
  ${({ type, theme }) => {
    switch (type) {
      case 'private':
        return css`
          background-color: ${theme.colors.accent.main};
          color: #fff;
        `;
      case 'dealer':
        return css`
          background-color: ${theme.colors.success.main};
          color: #fff;
        `;
      case 'company':
        return css`
          background-color: ${theme.colors.info.main};
          color: #fff;
        `;
      default:
        return css`
          background-color: ${theme.colors.grey[300]};
          color: ${theme.colors.text.primary};
        `;
    }
  }}
`;

// ==================== CAR CARDS & GRID ====================

export const CarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2px;
    margin: 0 -16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
  }
  
  @media (max-width: 380px) {
    grid-template-columns: 1fr;
    gap: 8px;
    margin: 0;
  }
`;

export const CarCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    border-radius: 0;
    box-shadow: none;
    border: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
    
    &:active {
      opacity: 0.9;
    }
  }
`;

export const CarImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  
  @media (max-width: 768px) {
    height: 0;
    padding-bottom: 100%;
    position: relative;
    
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

export const CarInfo = styled.div`
  padding: 1rem;
  
  @media (max-width: 768px) {
    padding: 8px;
    position: relative;
  }
  
  @media (max-width: 480px) {
    padding: 6px;
  }
`;

export const CarName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8125rem;
  }
`;

export const CarPrice = styled.p`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
  margin: 0.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 0.9375rem;
    font-weight: 700;
    margin: 4px 0 0;
    color: var(--accent-primary);
  }
  
  @media (max-width: 480px) {
    font-size: 0.875rem;
  }
`;

export const CarDetails = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  @media (max-width: 768px) {
    display: none;
  }
`;

// ==================== STAT CARDS (NEW UI) ====================

export const SingleStatsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-primary);
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  gap: 2rem;
  
  @media (min-width: 961px) {
    margin-top: 2rem;
    padding-top: 6rem;
    position: relative;
  }
  
  html[data-theme="dark"] & {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }
  
  @media (max-width: 960px) {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem 1rem;
    align-items: stretch;
  }
`;

export const StatBarNameSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 200px;
  
  @media (min-width: 961px) {
    position: relative;
    z-index: 1;
    
    &::before {
      content: '';
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: transparent;
      z-index: -1;
      pointer-events: none;
    }
  }
  
  @media (max-width: 960px) {
    min-width: auto;
    text-align: center;
    
    &::before {
      display: none;
    }
  }
`;

export const StatBarStatsSection = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex: 1;
  gap: 1.5rem;
  
  @media (min-width: 961px) {
    position: relative;
    z-index: 1;
    
    &::before {
      content: '';
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: transparent;
      z-index: -1;
      pointer-events: none;
    }
  }
  
  @media (max-width: 960px) {
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    
    &::before {
      display: none;
    }
  }
`;

export const StatBarActionsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: fit-content;
  
  @media (max-width: 960px) {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

export const StatCard = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
  
  html[data-theme="dark"] & {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  @media (max-width: 960px) {
    padding: 1.25rem;
  }
`;

export const StatCardHeader = styled.div`
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
  
  html[data-theme="dark"] & {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
`;

export const StatCardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  
  html[data-theme="dark"] & {
    color: #f8fafc;
  }
`;

export const UserNameCompact = styled.h2`
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  
  html[data-theme="dark"] & {
    color: #f8fafc;
  }
`;

// NEW: Public Display Name - Shows above username based on profile type
export const PublicDisplayName = styled.div<{ $profileType?: string }>`
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
  color: ${props => {
    switch(props.$profileType) {
      case 'dealer': return '#16a34a'; // Green
      case 'company': return '#1d4ed8'; // Blue  
      default: return '#ea580c'; // Orange for private
    }
  }};
  
  html[data-theme="dark"] & {
    color: ${props => {
      switch(props.$profileType) {
        case 'dealer': return '#4ade80';
        case 'company': return '#60a5fa';
        default: return '#fb923c';
      }
    }};
  }
  
  transition: color 0.3s ease;
`;

export const UserEmailCompact = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  
  html[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

export const StatCardContent = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 1rem;
  
  @media (max-width: 960px) {
    justify-content: space-between;
  }
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

export const StatNumber = styled.span`
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--accent-primary);
  line-height: 1;
  
  html[data-theme="dark"] & {
    color: #fb923c;
  }
`;

export const StatLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  
  html[data-theme="dark"] & {
    color: #cbd5e1;
  }
`;

export const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  span.number {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    
    html[data-theme="dark"] & {
      color: #f8fafc;
    }
  }
  
  span.label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    
    html[data-theme="dark"] & {
      color: #cbd5e1;
    }
  }
  
  transition: color 0.3s ease;
`;

export const StatCardActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  @media (max-width: 960px) {
    flex-direction: row;
    flex-wrap: wrap;
  }
`;

// ==================== PLAN BAR ====================

export const PlanBar = styled.div<{ $themeColor?: string; $profileType?: 'private' | 'dealer' | 'company' }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  
  /* Background Image based on profile type */
  background-image: ${props => {
    const imageFile = props.$profileType === 'dealer' 
      ? 'dealer-bg.png' 
      : props.$profileType === 'company' 
        ? 'company-bg.png' 
        : 'private-bg.png';
    return `url('/assets/images/profile-backgrounds/${imageFile}')`;
  }};
  background-size: cover;
  background-position: center;
  
  /* Color overlay on top of image */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$themeColor 
      ? `linear-gradient(90deg, ${props.$themeColor}CC 0%, ${props.$themeColor}99 100%)` 
      : 'rgba(0, 0, 0, 0.55)'};
    z-index: 0;
  }
  
  /* Ensure content is above overlay */
  > * {
    position: relative;
    z-index: 1;
  }
  
  border: 1px solid ${props => props.$themeColor ? `${props.$themeColor}30` : 'var(--border-primary)'};
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  margin-bottom: 1.5rem;
  min-height: 48px;
  color: white;
  
  html[data-theme="dark"] & {
    border-color: ${props => props.$themeColor
    ? `${props.$themeColor}40`
    : 'rgba(255, 255, 255, 0.1)'};
    color: #f8fafc;
  }
  
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    border-radius: 12px;
    padding: 1rem;
    gap: 0.75rem;
  }
`;

export const PlanInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: white;
  
  span.label {
    opacity: 0.85;
    font-weight: 500;
    font-size: 0.85rem;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.9);
  }
  
  span.value {
    font-weight: 700;
    font-size: 0.95rem;
    color: white;
  }
  
  transition: color 0.3s ease;
  
  @media (min-width: 769px) {
    &:not(:last-child)::after {
      content: '';
      display: block;
      width: 1px;
      height: 16px;
      background: rgba(255, 255, 255, 0.3);
      margin-left: 16px;
      margin-right: 8px;
      opacity: 0.5;
    }
  }
`;

export const PlanUpgradeButton = styled.button<{ $themeColor?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: ${props => props.$themeColor || 'var(--accent-primary)'};
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// ============================================================================
// BIO SECTION - Professional LinkedIn/Twitter Inspired Design
// ============================================================================

export const BioCard = styled.div<{ $profileType?: string }>`
  position: relative;
  margin: 16px 0;
  padding: 24px 32px;
  background: var(--bg-card);
  border-radius: 16px;
  border-left: 4px solid ${props => {
    switch(props.$profileType) {
      case 'dealer': return '#10B981';
      case 'company': return '#3B82F6';
      default: return '#F97316';
    }
  }};
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }

  @media (max-width: 768px) {
    padding: 20px 24px;
    margin: 12px 0;
  }
`;

export const BioHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  
  svg {
    color: var(--accent-primary);
  }
`;

export const BioTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  
  html[data-theme="dark"] & {
    color: #f1f5f9;
  }
`;

export const BioContent = styled.div`
  position: relative;
  padding: 0 24px;
`;

export const BioQuoteIcon = styled.span<{ $end?: boolean }>`
  position: absolute;
  font-size: 48px;
  font-family: Georgia, 'Times New Roman', serif;
  color: var(--text-tertiary);
  opacity: 0.3;
  line-height: 1;
  user-select: none;
  pointer-events: none;
  
  ${props => props.$end ? `
    bottom: -16px;
    right: 0;
    transform: rotate(180deg);
  ` : `
    top: -8px;
    left: 0;
  `}

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

export const BioText = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-secondary);
  font-style: italic;
  text-align: center;
  white-space: pre-wrap;
  word-break: break-word;
  
  html[data-theme="dark"] & {
    color: #e2e8f0;
  }

  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 1.6;
  }
`;

export const BioEditHint = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-primary);
  font-size: 13px;
  color: var(--text-tertiary);
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  a {
    color: var(--accent-primary);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

import styled, { css, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import type { ProfileType } from '../../../../contexts/ProfileTypeContext';

// Keyframes for animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = (color: string) => keyframes`
  0% { box-shadow: 0 0 0 0 ${color}; }
  70% { box-shadow: 0 0 0 10px rgba(204,169,44, 0); }
  100% { box-shadow: 0 0 0 0 rgba(204,169,44, 0); }
`;

// Base styles
const baseButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Martica', 'Arial', sans-serif;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 50px; // Circular buttons
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;
  position: relative;
  z-index: 1;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    transition: transform 0.3s ease;
    pointer-events: none;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    svg {
      transform: scale(1.1);
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
`;

// Styled Components
export const ProfilePageContainer = styled.div<{ $isBusinessMode?: boolean }>`
  position: relative;
  padding-top: 2rem;
  padding-bottom: 4rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #0f172a;
    color: #f8fafc;
  }
  animation: ${fadeIn} 0.5s ease-out;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  transition: background-color 0.3s ease, color 0.3s ease;
  box-sizing: border-box;
  overflow-x: hidden;
  
  /* MOBILE - Clean background (Instagram/Facebook) */
  @media (max-width: 768px) {
    padding-top: 0;
    padding-bottom: 80px;  /* Space for bottom nav */
    background: var(--bg-primary);
    max-width: 100%;
  }
  
  @media (max-width: 480px) {
    padding-bottom: 70px;
  }
`;

export const ProfileHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-primary);
  flex-wrap: wrap;
  
  /* MOBILE OPTIMIZATION - Instagram/LinkedIn inspired */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    margin-bottom: 1rem;
    padding-bottom: 0;
    border-bottom: none;
    
    /* Card-based layout (Airbnb pattern) */
    background: var(--bg-card);
    
    html[data-theme="dark"] & {
      background: #1e293b;
    }
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }
  
  @media (max-width: 480px) {
    border-radius: 12px;
    margin-bottom: 0.75rem;
  }
`;

export const ProfileLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const ProfileImageContainer = styled.div`
  position: relative;
  flex-shrink: 0;
  
  /* MOBILE - Centered, overlapping cover */
  @media (max-width: 768px) {
    margin: -44px auto 16px;
    z-index: 2;
  }
  
  @media (max-width: 480px) {
    margin-top: -40px;
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

export const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.colors.primary.main};
  object-fit: cover;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  /* MOBILE - Instagram style: Smaller avatar, white border */
  @media (max-width: 768px) {
    width: 88px;  /* Instagram standard */
    height: 88px;
    border: 4px solid white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 480px) {
    width: 80px;
    height: 80px;
  }
  
  @media (max-width: 380px) {
    width: 72px;
    height: 72px;
    border-width: 3px;
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

export const ProfileInfo = styled.div`
  flex-grow: 1;
  
  /* MOBILE - Centered layout (Instagram pattern) */
  @media (max-width: 768px) {
    text-align: center;
    padding: 16px 20px 0;
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px 0;
  }
`;

export const ProfileName = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.primary.main};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  /* MOBILE - Professional typography (LinkedIn/Airbnb) */
  @media (max-width: 768px) {
    font-size: 1.375rem;  /* 22px - readable on mobile */
    font-weight: 700;
    justify-content: center;
    line-height: 1.3;
    margin-bottom: 4px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;  /* 20px */
  }
  
  @media (max-width: 380px) {
    font-size: 1.125rem;  /* 18px - minimum for h1 */
  }
`;

export const ProfileBio = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.5rem;
  max-width: 600px;
  
  /* MOBILE - Compact bio (Instagram pattern) */
  @media (max-width: 768px) {
    font-size: 0.875rem;  /* 14px */
    line-height: 1.4;
    margin: 6px auto 0;
    max-width: none;
    
    /* Limit to 3 lines with ellipsis */
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8125rem;  /* 13px */
    -webkit-line-clamp: 2;  /* 2 lines on small screens */
  }
`;

export const StatsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  
  /* MOBILE - Grid layout (Instagram pattern) */
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
  
  /* MOBILE - Instagram-style stat display */
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 8px;
    font-size: 0.875rem;
    gap: 2px;
    
    /* Number on top */
    &::before {
      content: attr(data-count);
      font-size: 1.125rem;  /* 18px - prominent */
      font-weight: 700;
      color: ${({ theme }) => theme.colors.text.primary};
      display: block;
      line-height: 1.2;
    }
    
    /* Label below */
    span {
      font-size: 0.75rem;  /* 12px */
      font-weight: 400;
      color: ${({ theme }) => theme.colors.text.secondary};
      line-height: 1.2;
    }
    
    /* Tap feedback */
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
      font-size: 1rem;  /* 16px */
    }
    
    span {
      font-size: 0.6875rem;  /* 11px */
    }
  }
`;

export const ActionsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  
  /* MOBILE - Full-width buttons (Facebook/Instagram pattern) */
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin: 16px 20px;
    padding: 0;
  }
  
  @media (max-width: 480px) {
    margin: 12px 16px;
    gap: 6px;
  }
  
  @media (max-width: 380px) {
    grid-template-columns: 1fr;  /* Stack on very small screens */
    margin: 12px 12px;
  }
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger'; $themeColor?: string }>`
  ${baseButtonStyles}

  ${({ $variant = 'secondary', theme, $themeColor }) => {
    const mainColor = $themeColor || theme.colors.primary.main;
    switch ($variant) {
      case 'primary':
        return css`
          background-color: ${mainColor};
          color: #fff;
          border-color: ${mainColor};
          animation: ${pulse(mainColor)} 2s infinite;

          &:hover:not(:disabled) {
            background-color: ${mainColor};
            filter: brightness(1.1);
          }
          
          /* MOBILE - Stop animation, optimize for touch */
          @media (max-width: 768px) {
            animation: none;
            padding: 10px 16px;
            font-size: 0.875rem;  /* 14px */
            font-weight: 600;
            border-radius: 8px;  /* Less rounded on mobile */
            min-height: 44px;  /* Touch target */
            
            &:active {
              transform: scale(0.98);
              filter: brightness(0.95);
            }
          }
        `;
      case 'danger':
        return css`
          background-color: ${theme.colors.error.main};
          color: #fff;
          border-color: ${theme.colors.error.main};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.error.dark};
            filter: brightness(1.1);
          }
          
          @media (max-width: 768px) {
            padding: 10px 16px;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 8px;
            min-height: 44px;
            
            &:active {
              transform: scale(0.98);
              filter: brightness(0.95);
            }
          }
        `;
      case 'secondary':
      default:
        return css`
          background-color: transparent;
          color: ${theme.colors.text.primary};
          border-color: ${theme.colors.grey[300]};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.grey[100]};
            border-color: ${theme.colors.primary.main};
            color: ${theme.colors.primary.main};
          }
          
          /* MOBILE - Filled background (easier to tap) */
          @media (max-width: 768px) {
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            color: ${theme.colors.text.primary};
            padding: 10px 16px;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 8px;
            min-height: 44px;
            
            &:active {
              transform: scale(0.98);
              background-color: var(--bg-hover);
            }
          }
        `;
    }
  }}
`;

export const FollowButton = styled.button<{ $following: boolean }>`
  ${baseButtonStyles}
  background-color: ${({ $following, theme }) => $following ? 'transparent' : theme.colors.accent.main};
  color: ${({ $following, theme }) => $following ? theme.colors.accent.main : '#fff'};
  border-color: ${({ theme }) => theme.colors.accent.main};
  min-width: 120px;

  &:hover:not(:disabled) {
    background-color: ${({ $following, theme }) => $following ? theme.colors.accent.light : theme.colors.accent.dark};
    color: #fff;
    filter: brightness(1.1);
  }
`;

export const ProfileContent = styled.main`
  margin-top: 2rem;
  
  /* MOBILE - Full-width content */
  @media (max-width: 768px) {
    margin-top: 0;
    width: 100%;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary.main};
  display: inline-block;
  
  /* MOBILE - Smaller section titles */
  @media (max-width: 768px) {
    font-size: 1.125rem;  /* 18px */
    font-weight: 700;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--accent-primary);
    width: 100%;  /* Full-width underline */
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;  /* 16px */
    margin-bottom: 10px;
  }
`;

export const ProfileSidebar = styled.aside<{ $isBusinessMode: boolean; $themeColor: string }>`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  align-self: start;
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: ${({ theme }) => theme.shadows.md};
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }
  
  /* MOBILE - Hidden (content in main area) */
  @media (max-width: 768px) {
    display: none;
  }
`;

export const ProfileActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  position: relative;
  z-index: 1;
  pointer-events: auto;
`;

export const ContentSection = styled.section<{ $themeColor?: string; $isBusinessMode?: boolean }>`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  box-shadow: ${({ theme }) => theme.shadows.base};
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }
  
  /* ✅ FIX: Desktop - Add margin-top to push content below cover */
  @media (min-width: 961px) {
    margin-top: 1rem; /* ✅ Add space below stats bar */
    
    &:first-of-type {
      margin-top: 1rem; /* ✅ First section also has space */
    }
  }
  
  /* MOBILE - Card-based design (Airbnb/Facebook) */
  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 0;  /* Full-width cards */
    margin-bottom: 8px;  /* Tight spacing between cards */
    border: none;
    border-top: 1px solid var(--border-primary);
    border-bottom: 1px solid var(--border-primary);
    box-shadow: none;
    
    /* CRITICAL FIX: Space for sticky TabNavigation */
    /* TabNavigation is ~130px tall (2 rows × 48px + padding) */
    margin-top: 140px;  /* Clear space above sticky tabs */
    
    /* First section - clear spacing */
    &:first-of-type {
      border-radius: 0;
      margin-top: 140px;  /* Ensure first content visible */
    }
    
    /* Last section - rounded bottom */
    &:last-of-type {
      border-radius: 0;
      margin-bottom: 16px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 6px;
    margin-top: 135px;  /* Slightly less for smaller tabs */
    
    &:first-of-type {
      margin-top: 135px;
    }
  }
  
  @media (max-width: 380px) {
    margin-top: 130px;
    
    &:first-of-type {
      margin-top: 130px;
    }
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-primary);
    text-shadow: 0 0 10px rgba(76, 175, 80, 0.6), 0 0 20px rgba(76, 175, 80, 0.4);
  }

  .edit-btn {
    padding: 8px 16px;
    background: linear-gradient(135deg,rgb(16, 255, 100) 0%,rgb(0, 255, 26) 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(16, 255, 56, 0.3);
    z-index: 1;
    pointer-events: auto;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    white-space: nowrap;

    &:hover {
      background: linear-gradient(135deg,rgb(42, 255, 42) 0%,rgb(26, 255, 102) 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(16, 255, 68, 0.4);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(16, 255, 64, 0.2);
    }

    svg {
      pointer-events: none;
    }
  }
  
  /* MOBILE - Compact section header */
  @media (max-width: 768px) {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-primary);
    
    h2 {
      font-size: 1.125rem;  /* 18px */
      font-weight: 700;
    }
    
    .edit-btn {
      padding: 6px 12px;
      font-size: 0.8125rem;  /* 13px */
      border-radius: 6px;
      min-height: 32px;
      
      &:active {
        transform: scale(0.95);
      }
    }
  }
  
  @media (max-width: 480px) {
    h2 {
      font-size: 1rem;  /* 16px */
    }
    
    .edit-btn {
      padding: 6px 10px;
      font-size: 0.75rem;  /* 12px */
    }
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  
  /* MOBILE - Single column forms (easier input) */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 600;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.grey[300]};
    background-color: ${({ theme }) => theme.colors.background.default};
    font-family: 'Martica', 'Arial', sans-serif;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary.main};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}30;
    }
  }
  
  /* MOBILE - Touch-optimized forms (Facebook/Google best practices) */
  @media (max-width: 768px) {
    gap: 6px;
    
    label {
      font-size: 0.875rem;  /* 14px */
      font-weight: 600;
    }
    
    input, select, textarea {
      padding: 12px 16px;
      font-size: 16px;  /* Prevent iOS zoom */
      min-height: 48px;  /* Touch target */
      border-radius: 8px;
      border: 1px solid var(--border-primary);
      background: white;
      
      /* Better touch feedback */
      -webkit-tap-highlight-color: transparent;
      
      &:focus {
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 2px var(--accent-light);
      }
      
      &::placeholder {
        color: var(--text-muted);
        font-size: 15px;
      }
    }
    
    textarea {
      min-height: 100px;
      resize: vertical;
    }
    
    select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 36px;
    }
  }
  
  @media (max-width: 480px) {
    label {
      font-size: 0.8125rem;  /* 13px */
    }
    
    input, select, textarea {
      padding: 10px 14px;
      min-height: 46px;
    }
  }
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  
  /* MOBILE - Sticky bottom actions (WhatsApp/Telegram pattern) */
  @media (max-width: 768px) {
    position: sticky;
    bottom: 70px;  /* Above bottom nav */
    left: 0;
    right: 0;
    margin: 0 -16px;  /* Full-width */
    padding: 12px 16px;
    background: white;
    border-top: 1px solid var(--border-primary);
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06);
    z-index: 8;
    justify-content: stretch;
    gap: 8px;
    
    button {
      flex: 1;  /* Equal width buttons */
      margin: 0;
    }
  }
  
  @media (max-width: 480px) {
    bottom: 60px;
    padding: 10px 12px;
  }
`;

export const SaveButton = styled(ActionButton).attrs({ $variant: 'primary' })``;

export const CancelButton = styled(ActionButton).attrs({ $variant: 'secondary' })``;

export const NeumorphicInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

export const NeumorphicFieldWrapper = styled.div`
  position: relative;
`;

export const NeumorphicFieldLabel = styled.label<{ $themeColor?: string }>`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme, $themeColor }) => $themeColor || theme.colors.primary.main};
  margin-bottom: 0.5rem;
  display: block;
`;

export const NeumorphicInfoField = styled.div`
  background: ${({ theme }) => theme.colors.grey[100]};
  border-radius: 12px;
  padding: 0.75rem 1rem;
  box-shadow: inset 5px 5px 10px ${({ theme }) => theme.colors.grey[200]},
              inset -5px -5px 10px #ffffff;
`;

export const NeumorphicFieldValue = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const PageContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
  overflow-x: hidden;
  background: transparent;
  color: var(--text-primary);
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: transparent;
    color: #f8fafc;
  }
  
  transition: background-color 0.3s ease, color 0.3s ease;
  
  /* MOBILE - No horizontal padding (full-width) */
  @media (max-width: 768px) {
    padding: 0 12px;
    max-width: 100%;
  }
  
  @media (max-width: 480px) {
    padding: 0 8px;
  }
`;

export const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
  
  /* MOBILE - Single column, no sidebar */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0;
    
    /* Hide sidebar on mobile */
    > aside {
      display: none;
    }
  }
`;

export const CarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  /* MOBILE - Instagram-style grid */
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);  /* 2 columns like Instagram */
    gap: 2px;  /* Minimal gap (Instagram pattern) */
    margin: 0 -16px;  /* Edge-to-edge */
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
  }
  
  /* Very small screens - single column */
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
  
  /* MOBILE - Compact card (Instagram gallery style) */
  @media (max-width: 768px) {
    border-radius: 0;
    box-shadow: none;
    border: none;
    
    /* Remove hover on mobile */
    &:hover {
      transform: none;
      box-shadow: none;
    }
    
    /* Touch feedback */
    &:active {
      opacity: 0.9;
    }
  }
`;

export const CarImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  
  /* MOBILE - Square images (Instagram pattern) */
  @media (max-width: 768px) {
    height: 0;
    padding-bottom: 100%;  /* 1:1 aspect ratio (square) */
    position: relative;
    
    /* Make image fill square */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

export const CarInfo = styled.div`
  padding: 1rem;
  
  /* MOBILE - Minimal info (Instagram pattern) */
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
  
  /* MOBILE - Compact text */
  @media (max-width: 768px) {
    font-size: 0.875rem;  /* 14px */
    font-weight: 600;
    line-height: 1.3;
    
    /* Single line with ellipsis */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8125rem;  /* 13px */
  }
`;

export const CarPrice = styled.p`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
  margin: 0.5rem 0;
  
  /* MOBILE - Prominent price */
  @media (max-width: 768px) {
    font-size: 0.9375rem;  /* 15px */
    font-weight: 700;
    margin: 4px 0 0;
    color: var(--accent-primary);
  }
  
  @media (max-width: 480px) {
    font-size: 0.875rem;  /* 14px */
  }
`;

export const CarDetails = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  /* MOBILE - Hide details for compact view */
  @media (max-width: 768px) {
    display: none;  /* Show only in detail view */
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

// ==================== NEW UI COMPONENTS (DEC 2025) ====================

/* Container that holds Cover Image + Centered Profile Picture */
export const CoverAndProfileWrapper = styled.div`
  position: relative;
  margin-bottom: -75px; /* Pull the info bar up to overlap with profile picture */
  z-index: 5;
  
  /* ✅ FIX: Desktop - Add margin-bottom to push content down */
  @media (min-width: 961px) {
    margin-bottom: 0; /* ✅ Remove negative margin on desktop */
    padding-bottom: 1rem; /* ✅ Add space below cover */
  }
  
  /* ✅ FIX: Mobile - Remove overlap completely */
  @media (max-width: 960px) {
    margin-bottom: 0 !important; /* ✅ Remove overlap on mobile - separate sections */
    padding-bottom: 0; /* ✅ No extra padding */
  }
`;

export const UserInfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  padding: 1.5rem 2rem;
  padding-top: 90px; /* Space for the overlapping profile picture */
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  margin-top: 0;
  margin-bottom: 16px;
  position: relative;
  border: 1px solid var(--border-primary);
  z-index: 0;
  color: var(--text-primary);
  
  /* ✅ FIX: Desktop - Add margin-top to push content below cover */
  @media (min-width: 961px) {
    margin-top: 1rem; /* ✅ Add space below cover image */
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.1);
    color: #f8fafc;
    box-shadow: none;
  }
  
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  
  /* ✅ FIX: Desktop - Add margin-top to push content below cover */
  @media (min-width: 961px) {
    margin-top: 1.5rem; /* ✅ Add space below cover image */
  }
  
  /* ✅ FIX: Mobile - Separate bar without overlap */
  @media (max-width: 960px) {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem 1rem !important; /* ✅ Normal padding, no space for overlapping image */
    padding-top: 1.5rem !important; /* ✅ Start from top, no overlap - CRITICAL */
    margin-top: 1rem; /* ✅ Add space between cover image and info bar */
    text-align: center;
    z-index: 1; /* ✅ Ensure it's above the profile image */
  }
`;

export const UserInfoLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  color: var(--text-primary);
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #f8fafc;
  }
  
  transition: color 0.3s ease;
  
  /* ✅ FIX: Mobile - Center align for better layout */
  @media (max-width: 960px) {
    align-items: center; /* ✅ Center instead of flex-start */
    text-align: center; /* ✅ Center text */
    width: 100%; /* ✅ Full width */
  }
`;

export const UserInfoCenter = styled.div`
  display: flex;
  gap: 32px;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #f8fafc;
  }
  
  @media (max-width: 960px) {
    width: 100%;
    justify-content: center;
    padding: 16px 0;
    border-top: 1px solid var(--border-secondary);
    border-bottom: 1px solid var(--border-secondary);
    
    /* Dark Mode Support for borders */
    html[data-theme="dark"] & {
      border-top-color: rgba(255, 255, 255, 0.1);
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

export const UserInfoRight = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #f8fafc;
  }
  
  @media (max-width: 960px) {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }
`;

/* ✅ New container for stats on the right side of UserInfoBar */
export const UserInfoStatsContainer = styled.div`
  display: flex;
  gap: 32px;
  align-items: center;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #f8fafc;
  }
  
  @media (max-width: 960px) {
    gap: 16px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;

/* ✅ Single Modern Stats Bar - One unified bar */
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
  
  /* ✅ FIX: Desktop - Add margin-top and padding to avoid profile image */
  @media (min-width: 961px) {
    margin-top: 2rem; /* ✅ Add more space below cover image */
    padding-top: 6rem; /* ✅ Add space for profile image above */
    position: relative;
  }
  
  /* Dark Mode Support */
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
  
  /* ✅ FIX: Desktop - Prevent text from going behind profile image */
  @media (min-width: 961px) {
    position: relative;
    z-index: 1; /* ✅ Lower than profile image */
    
    /* ✅ Create exclusion zone - push text away from center */
    &::before {
      content: '';
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 220px; /* ✅ Wider than profile image */
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
      display: none; /* ✅ Hide on mobile */
    }
  }
`;

export const StatBarStatsSection = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex: 1;
  gap: 1.5rem;
  
  /* ✅ FIX: Desktop - Prevent stats from going behind profile image */
  @media (min-width: 961px) {
    position: relative;
    z-index: 1; /* ✅ Lower than profile image */
    
    /* ✅ Create exclusion zone in center - push stats away */
    &::before {
      content: '';
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 220px; /* ✅ Wider than profile image */
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
      display: none; /* ✅ Hide on mobile */
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
  
  /* Dark Mode Support */
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

export const StatCardActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  @media (max-width: 960px) {
    flex-direction: row;
    flex-wrap: wrap;
  }
`;

export const ActionButtonCompact = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  width: 100%;
  
  ${props => props.$variant === 'primary' ? `
    background: var(--accent-primary);
    color: white;
    
    &:hover {
      background: var(--accent-primary-hover);
      transform: translateY(-1px);
    }
  ` : `
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
    
    &:hover {
      background: var(--bg-hover);
    }
  `}
  
  html[data-theme="dark"] & {
    ${props => props.$variant === 'primary' ? `
      background: #fb923c;
      color: white;
    ` : `
      background: #2a2a2a;
      color: #f8fafc;
      border-color: rgba(255, 255, 255, 0.1);
    `}
  }
`;

export const PlanBar = styled.div<{ $themeColor?: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.$themeColor ? `linear-gradient(90deg, ${props.$themeColor}15 0%, ${props.$themeColor}05 100%)` : 'var(--bg-secondary)'};
  border: 1px solid ${props => props.$themeColor ? `${props.$themeColor}30` : 'var(--border-primary)'};
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
  min-height: 48px;
  color: var(--text-primary);
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: ${props => props.$themeColor 
      ? `linear-gradient(90deg, ${props.$themeColor}20 0%, ${props.$themeColor}10 100%)`
      : '#1e293b'};
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
  color: var(--text-primary);
  
  span.label {
    opacity: 0.7;
    font-weight: 500;
    font-size: 0.85rem;
    text-transform: uppercase;
    color: var(--text-secondary);
    
    /* Dark Mode Support */
    html[data-theme="dark"] & {
      color: #cbd5e1;
      opacity: 0.8;
    }
  }
  
  span.value {
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--text-primary);
    
    /* Dark Mode Support */
    html[data-theme="dark"] & {
      color: #f8fafc;
    }
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #f8fafc;
  }
  
  transition: color 0.3s ease;
  
  /* Separator for desktop */
  @media (min-width: 769px) {
    &:not(:last-child)::after {
      content: '';
      display: block;
      width: 1px;
      height: 16px;
      background: var(--border-primary);
      margin-left: 16px;
      margin-right: 8px;
      opacity: 0.5;
      
      /* Dark Mode Support for separator */
      html[data-theme="dark"] & {
        background: rgba(255, 255, 255, 0.1);
        opacity: 0.6;
      }
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

export const CenteredProfileImageWrapper = styled.div`
  position: absolute;
  bottom: -75px; /* Half of profile picture hangs below cover */
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  
  /* ✅ FIX: Professional mechanical gear shadow - subtle and elegant */
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.12)) 
          drop-shadow(0 3px 6px rgba(0,0,0,0.08));
  
  /* ✅ FIX: Create mechanical gear-shaped exclusion zone - professional look */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 220px; /* ✅ Much wider than image (typically 120-150px) */
    height: 220px; /* ✅ Much taller than image */
    /* ✅ Professional mechanical gear shape - 12 teeth for smoother, elegant look */
    clip-path: polygon(
      50% 0%, 53% 0%, 56% 7%, 62% 4%, 68% 0%, 75% 0%, 78% 4%, 84% 7%, 87% 0%, 93% 0%, 96% 7%, 100% 10%,
      100% 15%, 97% 18%, 100% 22%, 100% 28%, 97% 32%, 100% 35%, 100% 40%, 100% 45%, 100% 50%,
      100% 55%, 100% 60%, 100% 65%, 97% 68%, 100% 72%, 100% 78%, 97% 82%, 100% 85%, 100% 90%,
      96% 93%, 93% 100%, 87% 100%, 84% 93%, 78% 96%, 75% 100%, 68% 100%, 62% 96%, 56% 93%, 53% 100%, 50% 100%,
      47% 100%, 44% 93%, 38% 96%, 32% 100%, 25% 100%, 22% 96%, 16% 93%, 13% 100%, 7% 100%, 4% 93%,
      0% 90%, 0% 85%, 3% 82%, 0% 78%, 0% 72%, 3% 68%, 0% 65%, 0% 60%, 0% 55%, 0% 50%,
      0% 45%, 0% 40%, 0% 35%, 3% 32%, 0% 28%, 0% 22%, 3% 18%, 0% 15%, 0% 10%, 4% 7%,
      7% 0%, 13% 0%, 16% 7%, 22% 4%, 25% 0%, 32% 0%, 38% 4%, 44% 7%, 47% 0%
    );
    background: var(--bg-card);
    z-index: 99; /* ✅ High z-index to block text */
    opacity: 0.88; /* ✅ Subtle transparency - professional look */
    box-shadow: 
      0 0 35px rgba(0,0,0,0.1),
      0 0 18px rgba(0,0,0,0.06),
      inset 0 0 25px rgba(0,0,0,0.04);
    pointer-events: none;
  }
  
  /* ✅ FIX: Additional gear layer for depth and shadow effect */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 240px; /* ✅ Even wider exclusion zone */
    height: 240px;
    /* ✅ Outer gear shape - 12 teeth matching inner gear, slightly larger */
    clip-path: polygon(
      50% 0%, 53% 0%, 56% 6%, 62% 3%, 68% 0%, 75% 0%, 78% 3%, 84% 6%, 87% 0%, 93% 0%, 96% 6%, 100% 9%,
      100% 14%, 97% 17%, 100% 21%, 100% 27%, 97% 31%, 100% 34%, 100% 39%, 100% 44%, 100% 50%,
      100% 56%, 100% 61%, 100% 66%, 97% 69%, 100% 73%, 100% 79%, 97% 83%, 100% 86%, 100% 91%,
      96% 94%, 93% 100%, 87% 100%, 84% 94%, 78% 97%, 75% 100%, 68% 100%, 62% 97%, 56% 94%, 53% 100%, 50% 100%,
      47% 100%, 44% 94%, 38% 97%, 32% 100%, 25% 100%, 22% 97%, 16% 94%, 13% 100%, 7% 100%, 4% 94%,
      0% 91%, 0% 86%, 3% 83%, 0% 79%, 0% 73%, 3% 69%, 0% 66%, 0% 61%, 0% 56%, 0% 50%,
      0% 44%, 0% 39%, 0% 34%, 3% 31%, 0% 27%, 0% 21%, 3% 17%, 0% 14%, 0% 9%, 4% 6%,
      7% 0%, 13% 0%, 16% 6%, 22% 3%, 25% 0%, 32% 0%, 38% 3%, 44% 6%, 47% 0%
    );
    background: var(--bg-card);
    z-index: 98; /* ✅ Slightly lower but still blocks text */
    opacity: 0.82; /* ✅ More transparent for depth */
    box-shadow: 
      0 0 45px rgba(0,0,0,0.08),
      0 0 22px rgba(0,0,0,0.05);
    pointer-events: none;
  }
  
  /* ✅ FIX: Ensure image itself has highest z-index */
  > * {
    position: relative;
    z-index: 101; /* ✅ Image above all exclusion zones */
  }
  
  /* ✅ FIX: Force all children (including ProfileImageUploader) to have proper z-index */
  > div {
    position: relative;
    z-index: 101;
  }
  
  /* ✅ FIX: Mobile - Position image above the info bar, not overlapping */
  @media (max-width: 960px) {
    position: relative !important; /* ✅ Change from absolute to relative - CRITICAL */
    bottom: auto !important; /* ✅ Remove negative bottom */
    left: auto !important; /* ✅ Remove centering via left */
    transform: none !important; /* ✅ Remove transform */
    margin: -60px auto 1rem !important; /* ✅ Center with margin, add space below */
    width: fit-content; /* ✅ Fit content width */
    z-index: 0; /* ✅ Lower z-index so it doesn't overlap text */
    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.2)); /* ✅ Lighter shadow on mobile */
    
    &::before,
    &::after {
      display: none; /* ✅ Hide exclusion zones on mobile */
    }
  }
`;

export const UserName = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-start;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #f8fafc;
  }
  
  transition: color 0.3s ease;
  
  @media (max-width: 960px) {
    justify-content: flex-start;
    font-size: 1.5rem;
  }
`;

export const UserEmail = styled.div`
  color: var(--text-secondary);
  font-size: 0.95rem;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #cbd5e1;
  }
  
  transition: color 0.3s ease;
`;

export const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  span.number {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    
    /* Dark Mode Support */
    html[data-theme="dark"] & {
      color: #f8fafc;
    }
  }
  
  span.label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    
    /* Dark Mode Support */
    html[data-theme="dark"] & {
      color: #cbd5e1;
    }
  }
  
  transition: color 0.3s ease;
`;

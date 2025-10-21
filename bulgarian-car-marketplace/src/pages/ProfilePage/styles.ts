import styled, { css, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import type { ProfileType } from '../../contexts/ProfileTypeContext';

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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    svg {
      transform: scale(1.1);
    }
  }
`;

// Styled Components
export const ProfilePageContainer = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background.default};
  color: ${({ theme }) => theme.colors.text.primary};
  animation: ${fadeIn} 0.5s ease-out;
  max-width: 1200px;
  margin: 0 auto;
`;

export const ProfileHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  flex-wrap: wrap;
`;

export const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.colors.primary.main};
  object-fit: cover;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

export const ProfileInfo = styled.div`
  flex-grow: 1;
`;

export const ProfileName = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.primary.main};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ProfileBio = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.5rem;
  max-width: 600px;
`;

export const StatsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
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
`;

export const ActionsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
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
`;

export const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary.main};
  display: inline-block;
`;

export const CarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
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
`;

export const CarImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

export const CarInfo = styled.div`
  padding: 1rem;
`;

export const CarName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
`;

export const CarPrice = styled.p`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
  margin: 0.5rem 0;
`;

export const CarDetails = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
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

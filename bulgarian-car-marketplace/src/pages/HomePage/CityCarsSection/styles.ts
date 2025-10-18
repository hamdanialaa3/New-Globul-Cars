// City Cars Section Styles
// تنسيقات قسم السيارات حسب المدن

import styled from 'styled-components';

export const SectionContainer = styled.section`
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(240, 248, 255, 0.95) 0%,
    rgba(230, 243, 255, 0.95) 100%
  );
  padding: 4rem 0;
  overflow: hidden;

  /* Background pattern */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(0, 92, 169, 0.02) 10px,
        rgba(0, 92, 169, 0.02) 20px
      );
    pointer-events: none;
    z-index: 0;
  }
`;

export const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
`;

export const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #005ca9;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #005ca9, #0066cc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 600px) {
    font-size: 1.375rem;
  }
`;

export const SectionSubtitle = styled.p`
  font-size: 0.95rem;
  color: #6c757d;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 600px) {
    font-size: 0.875rem;
  }
`;

export const ViewAllButton = styled.button`
  display: inline-block;
  background: linear-gradient(135deg, #005ca9, #0066cc);
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 92, 169, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 92, 169, 0.4);
    background: linear-gradient(135deg, #0066cc, #007bff);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const MapHint = styled.p`
  text-align: center;
  color: #6c757d;
  font-size: 0.95rem;
  margin: 1.5rem 0 3rem;
  font-style: italic;
`;

// City Grid Styles
export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
`;

export const CityCard = styled.div<{ $isActive?: boolean }>`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid ${props => props.$isActive ? '#005ca9' : '#e9ecef'};
  box-shadow: ${props => props.$isActive 
    ? '0 8px 25px rgba(0, 92, 169, 0.25)' 
    : '0 4px 15px rgba(0, 92, 169, 0.08)'};
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 143, 16, 0.08),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 16px 40px rgba(0, 92, 169, 0.25);
    border-color: #FF8F10;
    background: linear-gradient(135deg, #ffffff 0%, #fffbf0 100%);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-3px) scale(1.01);
  }
`;

export const CityName = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 92, 169, 0.05);
  border-radius: 8px;
  border-left: 3px solid #005ca9;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  
  @media (max-width: 600px) {
    font-size: 1rem;
    padding: 0.4rem 0.6rem;
  }
`;

export const CityIcon = styled.span`
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  filter: drop-shadow(0 1px 2px rgba(0, 92, 169, 0.3));
  
  @media (max-width: 600px) {
    font-size: 1.125rem;
  }
`;

export const CarCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, rgba(255, 143, 16, 0.08), rgba(255, 223, 0, 0.08));
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 600px) {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }
`;

export const CarCountNumber = styled.span`
  font-weight: 700;
  color: #FF8F10;
  font-size: 1.375rem;
  text-shadow: 0 1px 2px rgba(255, 143, 16, 0.3);
  
  @media (max-width: 600px) {
    font-size: 1.25rem;
  }
`;

export const ViewCarsButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #005ca9, #0066cc);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 92, 169, 0.2);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

  &:hover {
    background: linear-gradient(135deg, #FF8F10, #FFDF00);
    color: #000;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 143, 16, 0.4);
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 600px) {
    font-size: 0.85rem;
    padding: 0.65rem;
  }
`;

export const LoadingCard = styled(CityCard)`
  pointer-events: none;
  opacity: 0.6;
  
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 0.8; }
  }
  
  animation: pulse 1.5s ease-in-out infinite;
`;

export const LoadingText = styled.div`
  height: 1.5rem;
  background: linear-gradient(
    90deg,
    #e9ecef 25%,
    #f8f9fa 50%,
    #e9ecef 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  
  svg {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }
  
  p {
    font-size: 1.1rem;
  }
`;

export const ShowMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  margin: 2.5rem auto 0;
  padding: 1rem 2rem;
  background: white;
  border: 3px solid #005ca9;
  border-radius: 50px;
  color: #005ca9;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 92, 169, 0.15);
  position: relative;
  overflow: hidden;
  
  @media (max-width: 600px) {
    font-size: 0.875rem;
    padding: 0.875rem 1.75rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #005ca9, #0066cc);
    transition: left 0.3s ease;
    z-index: -1;
  }

  &:hover {
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 92, 169, 0.3);
    
    &::before {
      left: 0;
    }
  }

  &:active {
    transform: translateY(-1px);
  }

  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: scale(1.1);
  }
`;

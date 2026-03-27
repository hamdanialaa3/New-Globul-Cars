// Top Brands Page Styled Components
// Professional styling without emojis

import styled from 'styled-components';

export const PageContainer = styled.div<{ $isDark?: boolean }>`
  min-height: 100vh;
  background: ${props => props.$isDark ? '#0F1419' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'};
  padding: 40px 0;
  transition: all 0.3s ease;
`;

export const PageHeader = styled.div<{ $isDark?: boolean }>`
  text-align: center;
  padding: 60px 24px;
  background: ${props => props.$isDark ? '#1A1F2E' : 'white'};
  margin-bottom: 32px;
  box-shadow: ${props => props.$isDark ? '0 10px 30px rgba(0, 0, 0, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  border-bottom: 1px solid ${props => props.$isDark ? '#2d3748' : 'transparent'};
`;

export const PageTitle = styled.h1<{ $isDark?: boolean }>`
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 800;
  color: ${props => props.$isDark ? '#8B5CF6' : '#005ca9'};
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const PageSubtitle = styled.p<{ $isDark?: boolean }>`
  font-size: 1.1rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#6c757d'};
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
  font-weight: 500;
`;

export const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
`;

export const CategorySection = styled.section<{ $isDark?: boolean }>`
  background: ${props => props.$isDark ? '#1E2432' : 'white'};
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: ${props => props.$isDark ? '0 15px 40px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.08)'};
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'rgba(0,0,0,0.05)'};
  
  @media (max-width: 768px) {
    padding: 24px;
  }
`;

export const CategoryHeader = styled.div<{ $isDark?: boolean }>`
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 3px solid ${props => props.$isDark ? '#8B5CF6' : '#005ca9'};
`;

export const CategoryTitle = styled.h2<{ $isDark?: boolean }>`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f8fafc' : '#212529'};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  .icon {
    font-size: 2rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const CategoryDescription = styled.p<{ $isDark?: boolean }>`
  font-size: 1rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#6c757d'};
  line-height: 1.6;
`;

export const BrandsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const BrandCard = styled.div<{ featured?: boolean; $isDark?: boolean }>`
  background: ${props => {
    if (props.featured) return 'linear-gradient(135deg, #8B5CF6 0%, #FF5C00 100%)';
    return props.$isDark ? '#0F1419' : 'white';
  }};
  border: ${props => {
    if (props.featured) return 'none';
    return props.$isDark ? '1px solid #2d3748' : '2px solid #e9ecef';
  }};
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  
  ${props => props.featured && `
    color: white;
  `}
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: ${props => props.$isDark ? '0 20px 40px rgba(0, 0, 0, 0.5)' : '0 12px 30px rgba(0, 0, 0, 0.12)'};
    border-color: ${props => props.featured ? 'transparent' : (props.$isDark ? '#8B5CF6' : '#005ca9')};
  }
`;

export const BrandLogoWrapper = styled.div<{ featured?: boolean; $isDark?: boolean }>`
  width: 100%;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    if (props.featured) return 'rgba(255, 255, 255, 0.2)';
    return props.$isDark ? '#1A1F2E' : '#f8f9fa';
  }};
  border-radius: 12px;
  margin-bottom: 16px;
  padding: 12px;
  transition: background 0.3s ease;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: ${props => (props.featured || props.$isDark) ? 'brightness(0) invert(1)' : 'none'};
  }
`;

export const BrandName = styled.h3<{ featured?: boolean; $isDark?: boolean }>`
  font-size: 1.25rem;
  font-weight: 800;
  color: ${props => {
    if (props.featured) return 'white';
    return props.$isDark ? '#f8fafc' : '#212529';
  }};
  margin-bottom: 8px;
  text-align: center;
`;

export const BrandStats = styled.div<{ featured?: boolean; $isDark?: boolean }>`
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${props => {
    if (props.featured) return 'rgba(255, 255, 255, 0.2)';
    return props.$isDark ? '#2d3748' : '#e9ecef';
  }};
`;

export const StatItem = styled.div<{ featured?: boolean; $isDark?: boolean }>`
  text-align: center;
  
  .label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${props => {
    if (props.featured) return 'rgba(255, 255, 255, 0.8)';
    return props.$isDark ? '#4a5568' : '#6c757d';
  }};
    margin-bottom: 4px;
  }
  
  .value {
    font-size: 1.25rem;
    font-weight: 800;
    color: ${props => {
    if (props.featured) return 'white';
    return props.$isDark ? '#8B5CF6' : '#005ca9';
  }};
  }
`;

export const BadgeContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
`;

export const Badge = styled.span<{ variant?: 'popular' | 'electric' | 'commercial' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${props => {
    switch (props.variant) {
      case 'popular':
        return `
          background: #ffc107;
          color: #212529;
        `;
      case 'electric':
        return `
          background: #28a745;
          color: white;
        `;
      case 'commercial':
        return `
          background: #17a2b8;
          color: white;
        `;
      default:
        return `
          background: #6c757d;
          color: white;
        `;
    }
  }}
`;

export const LoadingContainer = styled.div<{ $isDark?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.2rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#6c757d'};
  font-weight: 600;
`;



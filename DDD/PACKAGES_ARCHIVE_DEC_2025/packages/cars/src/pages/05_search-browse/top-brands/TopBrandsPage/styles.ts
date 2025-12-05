// Top Brands Page Styled Components
// Professional styling without emojis

import styled from 'styled-components';

export const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
`;

export const PageHeader = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #005ca9;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

export const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
`;

export const CategorySection = styled.section`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

export const CategoryHeader = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #005ca9;
`;

export const CategoryTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  .icon {
    font-size: 2rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const CategoryDescription = styled.p`
  font-size: 1rem;
  color: #6c757d;
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

export const BrandCard = styled.div<{ featured?: boolean }>`
  background: ${props => props.featured ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  border: ${props => props.featured ? 'none' : '2px solid #e9ecef'};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  ${props => props.featured && `
    color: white;
  `}
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.featured ? 'transparent' : '#005ca9'};
  }
`;

export const BrandLogoWrapper = styled.div<{ featured?: boolean }>`
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.featured ? 'rgba(255, 255, 255, 0.2)' : '#f8f9fa'};
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 0.75rem;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: ${props => props.featured ? 'brightness(0) invert(1)' : 'none'};
  }
`;

export const BrandName = styled.h3<{ featured?: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.featured ? 'white' : '#212529'};
  margin-bottom: 0.5rem;
  text-align: center;
`;

export const BrandStats = styled.div<{ featured?: boolean }>`
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.featured ? 'rgba(255, 255, 255, 0.3)' : '#e9ecef'};
`;

export const StatItem = styled.div<{ featured?: boolean }>`
  text-align: center;
  
  .label {
    font-size: 0.75rem;
    color: ${props => props.featured ? 'rgba(255, 255, 255, 0.8)' : '#6c757d'};
    margin-bottom: 0.25rem;
  }
  
  .value {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.featured ? 'white' : '#005ca9'};
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

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.2rem;
  color: #6c757d;
`;


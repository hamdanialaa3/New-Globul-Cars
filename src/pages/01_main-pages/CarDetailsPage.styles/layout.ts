import defaultStyled from 'styled-components';

const styled = defaultStyled;

// ==================== Layout Components ====================

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--bg-primary);
  min-height: 100vh;
  transition: background-color 0.3s ease;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-card);
  gap: 1rem;
  flex-wrap: wrap;
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;

export const InfoBar = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

// ==================== Seller Info Components ====================

export const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const SellerAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--btn-primary-text);
  text-transform: uppercase;
  box-shadow: var(--shadow-button);
  transition: background-color 0.3s ease, color 0.3s ease;
`;

export const SellerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const SellerName = styled.div`
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.3s ease;
`;

export const SellerPhone = styled.a`
  font-size: 0.813rem;
  font-weight: 500;
  color: var(--text-tertiary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.3s ease;

  &:hover {
    color: var(--accent-secondary);
    text-decoration: underline;
  }

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }
`;

export const VehicleInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: var(--bg-accent);
  border: 1px solid var(--border-accent);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;

export const VehicleBrand = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  transition: color 0.3s ease;
`;

export const VehicleModel = styled.div`
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: color 0.3s ease;
`;

// ==================== Title Components ====================

export const CarTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  transition: color 0.3s ease;
`;

export const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid var(--border-accent);
  text-transform: none;
  letter-spacing: 0.3px;
  transition: color 0.3s ease, border-color 0.3s ease;
`;

export const SectionIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--accent-primary);
  margin-right: 0.625rem;
  box-shadow: var(--shadow-button);
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  will-change: transform;
  transition: background-color 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.3), transparent 30%);
    opacity: 0.6;
  }

  svg {
    position: relative;
    z-index: 1;
    width: 18px;
    height: 18px;
  }
`;

// ==================== Location Components ====================

export const LocationMapContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin: 1.5rem 0;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

// ==================== Loading Components ====================

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.25rem;
  color: var(--text-tertiary);
  transition: color 0.3s ease;
`;

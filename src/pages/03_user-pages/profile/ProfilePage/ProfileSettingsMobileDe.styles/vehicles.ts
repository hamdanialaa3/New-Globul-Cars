import defaultStyled from 'styled-components';

const styled = defaultStyled;

// ==================== Vehicle Grid ====================

export const VehicleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

export const VehiclesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

export const VehicleCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #0f172a;
    
    &:hover {
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: #f8f9fa;
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }
  }
`;

export const VehicleImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
`;

export const VehicleImagePlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  
  svg {
    width: 64px;
    height: 64px;
  }
`;

export const VehicleContent = styled.div`
  padding: 16px;
`;

export const VehicleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
`;

export const VehicleTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
`;

export const VehicleDetails = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
`;

export const VehiclePrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-primary);
  white-space: nowrap;
`;

export const VehicleInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
`;

export const VehicleBrand = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const VehicleModel = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const VehicleYear = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap;
`;

export const VehicleFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-primary);
  margin-top: 12px;
`;

export const VehicleStats = styled.div`
  display: flex;
  gap: 16px;
`;

export const VehicleStat = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const VehicleActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--bg-hover);
    color: var(--accent-primary);
    border-color: var(--accent-primary);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

import defaultStyled from 'styled-components';

const styled = defaultStyled;

// ==================== Action Cards ====================

export const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

export const ActionCard = styled.div`
  background: var(--bg-card);
  padding: 24px;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
`;

export const ActionIcon = styled.div`
  width: 64px;
  height: 64px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--accent-primary);
`;

export const ActionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
`;

export const ActionSubtext = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
`;

// ==================== Service Cards ====================

export const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

export const ServiceCard = styled.div`
  background: var(--bg-card);
  padding: 20px 24px;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
`;

export const ServiceIcon = styled.div`
  width: 48px;
  height: 48px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  flex-shrink: 0;
`;

export const ServiceContent = styled.div`
  flex: 1;
`;

export const ServiceTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
`;

export const ServiceSubtext = styled.p`
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
`;

export const MoreServiceCard = styled.div`
  display: flex;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-primary);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    padding-left: 8px;
    background: var(--bg-hover);
    margin: 0 -24px;
    padding-left: 24px;
    padding-right: 24px;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

export const ShowAllLink = styled.button`
  font-size: 14px;
  color: var(--accent-primary);
  text-decoration: none;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

// ==================== Filter Bar ====================

export const SortFilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  flex-wrap: wrap;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #0f172a;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: #f8f9fa;
  }
  
  @media (max-width: 768px) {
    gap: 12px;
  }
`;

export const FiltersBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  flex-wrap: wrap;
  align-items: center;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #0f172a;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: #f8f9fa;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

export const FilterIcon = styled.div`
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  flex-shrink: 0;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #e2e8f0;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    color: #1e293b;
  }
`;

export const FilterSelect = styled.select`
  flex: 1;
  padding: 10px 14px;
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 0;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }
  
  option {
    background: var(--bg-card);
    color: var(--text-primary);
    padding: 8px;
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #0f172a;
    border-color: rgba(255, 255, 255, 0.2);
    color: #e2e8f0;
    
    &:hover {
      border-color: var(--accent-primary);
    }
    
    option {
      background: #0f172a;
      color: #e2e8f0;
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    border-color: rgba(0, 0, 0, 0.15);
    color: #1e293b;
    
    &:hover {
      border-color: var(--accent-primary);
    }
    
    option {
      background: white;
      color: #1e293b;
    }
  }
`;

export const AddVehicleButton = styled.button`
  width: 100%;
  padding: 14px;
  background: transparent;
  border: 2px dashed var(--border-primary);
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }
`;

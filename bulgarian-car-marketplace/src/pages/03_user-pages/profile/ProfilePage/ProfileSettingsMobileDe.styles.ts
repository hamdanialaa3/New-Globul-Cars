// ProfileSettingsMobileDe - Styled Components
// Extracted from ProfileSettingsMobileDe.tsx for better code organization
// Mobile.de inspired profile overview/settings page styles

import styled from 'styled-components';

export const PageContainer = styled.div`
  background: var(--bg-primary);
  min-height: 100vh;
  transition: background 0.3s ease;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #0f172a;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: #f8f9fa;
  }
`;

export const LayoutWrapper = styled.div`
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 24px;
  padding: 20px;
`;

export const Sidebar = styled.aside`
  width: 280px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-radius: 8px;
  padding: 24px 0;
  box-shadow: var(--shadow-sm);
  height: fit-content;
  position: sticky;
  top: 20px;
  transition: background 0.3s ease;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

export const UserProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 24px 24px;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 16px;
`;

export const AvatarContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 12px;
`;

export const UserAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-secondary);
`;

export const UserAvatarPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 3px solid var(--border-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  
  svg {
    width: 40px;
    height: 40px;
  }
`;

export const UploadOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  .spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const UserName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
`;

export const EditButton = styled.button`
  background: transparent;
  border: 2px solid var(--accent-primary);
  color: var(--accent-primary);
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: var(--accent-primary);
    color: var(--text-inverse);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SidebarSection = styled.div`
  margin-bottom: 24px;
`;

export const SidebarSectionTitle = styled.h4`
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 24px;
  margin: 0 0 8px 0;
`;

export const SidebarItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '500'};
  color: ${props => props.active ? 'var(--accent-primary)' : 'var(--text-primary)'};
  background: ${props => props.active ? 'var(--bg-hover)' : 'transparent'};
  border-left: 3px solid ${props => props.active ? 'var(--accent-primary)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--bg-hover);
    color: var(--accent-primary);
  }
`;

export const Badge = styled.span`
  background: var(--accent-primary);
  color: var(--text-inverse);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
`;

export const MainContent = styled.main`
  flex: 1;
  min-width: 0;
`;

export const WelcomeSection = styled.div`
  background: var(--bg-card);
  padding: 32px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
  transition: background 0.3s ease;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

export const WelcomeTitle = styled.h1`
  font-size: 26px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

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

export const SectionContainer = styled.section`
  background: var(--bg-card);
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
  transition: background 0.3s ease;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

export const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
`;

export const VehicleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
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

export const EmptyGarage = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

export const EmptyGarageIcon = styled.div`
  width: 96px;
  height: 96px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: var(--text-tertiary);
`;

export const EmptyGarageText = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 24px 0;
`;

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

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
  
  .spinning {
    animation: spin 1s linear infinite;
    color: var(--accent-primary);
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const LoadingText = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #cbd5e1;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    color: #64748b;
  }
`;

export const VehiclesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
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

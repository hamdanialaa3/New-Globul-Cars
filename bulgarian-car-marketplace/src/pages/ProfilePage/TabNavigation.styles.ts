// src/pages/ProfilePage/TabNavigation.styles.ts
import styled from 'styled-components';

export const TabNavigation = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
  
  @media (max-width: 768px) {
    gap: 4px;
    padding: 6px;
  }
`;

export const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  min-width: 120px;
  padding: 12px 20px;
  background: ${props => props.$active ? '#FF7900' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#6c757d'};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? '#e66d00' : '#f8f9fa'};
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    min-width: 100px;
    padding: 10px 12px;
    font-size: 0.85rem;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const SyncButton = styled.button`
  padding: 10px 16px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  
  &:hover:not(:disabled) {
    background: #3367d6;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const FollowButton = styled.button<{ $following: boolean }>`
  padding: 10px 20px;
  background: ${props => props.$following ? '#6c757d' : '#FF7900'};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$following ? '#5a6268' : '#e66d00'};
    transform: translateY(-1px);
  }
`;


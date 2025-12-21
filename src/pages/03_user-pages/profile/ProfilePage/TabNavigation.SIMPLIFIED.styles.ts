// TabNavigation.SIMPLIFIED.styles.ts - نسخة مبسطة بدون gradients
// ✅ تستخدم CSS Variables فقط من unified-theme.css
import styled from 'styled-components';

export const TabNavigation = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px;
  border-radius: 18px;
  min-height: 70px;
  flex-wrap: nowrap;
  
  /* ✅ CLEAN: CSS Variables فقط */
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
  
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  
  /* Hide scrollbar but keep functionality */
  scrollbar-width: thin;
  scrollbar-color: var(--accent-primary) transparent;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--accent-primary);
    border-radius: 4px;
    
    &:hover {
      background: var(--accent-secondary);
    }
  }
  
  /* TABLET & MOBILE */
  @media (max-width: 1024px) {
    flex-wrap: wrap;
    min-height: auto;
    gap: 10px;
    padding: 14px;
    justify-content: space-between;
  }
  
  @media (max-width: 768px) {
    gap: 8px;
    padding: 12px;
    border-radius: 16px;
    position: sticky;
    top: 56px;
    z-index: 9;
    box-shadow: var(--shadow-md);
  }
`;

export const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  min-width: 90px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  
  /* ✅ ACTIVE/INACTIVE states with CSS Variables */
  background: ${props => props.$active ? 'var(--btn-primary-bg)' : 'var(--btn-secondary-bg)'};
  color: ${props => props.$active ? 'var(--btn-primary-text)' : 'var(--btn-secondary-text)'};
  border: 2px solid ${props => props.$active ? 'var(--accent-primary)' : 'var(--border-primary)'};
  box-shadow: ${props => props.$active ? 'var(--shadow-button)' : 'var(--shadow-sm)'};
  
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$active ? 'var(--btn-primary-hover)' : 'var(--btn-secondary-hover)'};
    transform: translateY(-2px);
    box-shadow: ${props => props.$active ? 'var(--shadow-md)' : 'var(--shadow-card)'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  /* TABLET & MOBILE: Larger tap targets */
  @media (max-width: 1024px) {
    flex: 1 1 calc(33.333% - 8px);
    min-width: 0;
    max-width: calc(33.333% - 8px);
  }
  
  @media (max-width: 768px) {
    padding: 14px 12px;
    font-size: 13px;
    border-radius: 10px;
  }
`;

export const TabIcon = styled.span`
  font-size: 18px;
  margin-right: 6px;
  display: inline-block;
  vertical-align: middle;
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-right: 4px;
  }
`;

export const TabBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--error);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  line-height: 1;
  min-width: 16px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 9px;
    padding: 2px 5px;
  }
`;

import defaultStyled from 'styled-components';

const styled = defaultStyled;

// ==================== Sidebar Components ====================

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

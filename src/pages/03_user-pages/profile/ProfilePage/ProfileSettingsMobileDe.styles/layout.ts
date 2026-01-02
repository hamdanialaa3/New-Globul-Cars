import defaultStyled from 'styled-components';

const styled = defaultStyled;

// ==================== Page Container ====================

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

export const MainContent = styled.main`
  flex: 1;
  min-width: 0;
`;

// ==================== Welcome & Sections ====================

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

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

// ==================== Loading & Empty States ====================

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

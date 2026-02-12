import styled from 'styled-components';

export const DashboardContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

export const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

export const StatIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: 12px;
`;

export const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
`;

export const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 8px;
`;

export const StatSubtext = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-top: 8px;
`;

export const BadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

export const Badge = styled.span`
  background: ${({ theme }) => theme.colors.primary.light};
  color: ${({ theme }) => theme.colors.primary.main};
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
`;

export const ActionsContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ActionButton = styled.button<{ primary?: boolean }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: ${({ primary, theme }) => primary ? 'none' : `2px solid ${theme.colors.primary.main}`};
  background: ${({ primary, theme }) => primary ? theme.colors.primary.main : 'transparent'};
  color: ${({ primary, theme }) => primary ? '#fff' : theme.colors.primary.main};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${({ theme }) => theme.colors.error.main};
`;

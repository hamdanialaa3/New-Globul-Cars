import styled from 'styled-components';

export const Card = styled.div<{ flagged: boolean }>`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  opacity: ${({ flagged }) => flagged ? 0.6 : 1};
  border-left: ${({ flagged, theme }) => flagged ? `4px solid ${theme.colors.error.main}` : 'none'};
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const TypeBadge = styled.span<{ type: string }>`
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ type, theme }) => {
    if (type === 'market') return theme.colors.primary.light;
    if (type === 'tips') return theme.colors.success.light;
    return theme.colors.info.light;
  }};
  color: ${({ type, theme }) => {
    if (type === 'market') return theme.colors.primary.main;
    if (type === 'tips') return theme.colors.success.main;
    return theme.colors.info.main;
  }};
`;

export const Date = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Body = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 16px;
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

export const Tag = styled.span`
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
`;

export const MetricsContainer = styled.div`
  display: flex;
  gap: 16px;
`;

export const Metric = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const MetricIcon = styled.span`
  font-size: 14px;
`;

export const ActionsContainer = styled.div`
  display: flex;
  gap: 12px;
`;

export const ActionButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.divider};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background.default};
    border-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

export const FlaggedBanner = styled.div`
  margin-top: 12px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.error.light};
  color: ${({ theme }) => theme.colors.error.main};
  border-radius: 6px;
  font-size: 12px;
`;

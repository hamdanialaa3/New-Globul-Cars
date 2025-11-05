// src/pages/HomePage/styles.ts
// Shared styles for HomePage components

import styled from 'styled-components';

export const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.default};
`;

export const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

export const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};

  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    color: ${({ theme }) => theme.colors.text.secondary};
    max-width: 600px;
    margin: 0 auto;
  }
`;

export const ViewAllButton = styled.a`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing['2xl']};
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all 0.3s ease-in-out;
  text-align: center;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
    transform: translateY(-2px);
  }
`;
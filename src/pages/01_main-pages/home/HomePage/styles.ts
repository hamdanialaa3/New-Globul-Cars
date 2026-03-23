// src/pages/HomePage/styles.ts
// Shared styles for HomePage components

import styled from 'styled-components';

export const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary, #F8FAFC);
`;

export const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.75rem;
  }
`;

export const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary, #0F172A);
    margin-bottom: 1rem;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  p {
    font-size: 1.25rem;
    color: var(--text-secondary, #475569);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 1.125rem;
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

export const ViewAllButton = styled.a`
  display: inline-block;
  padding: 1rem 2rem;
  background: var(--btn-primary-bg, linear-gradient(135deg, #FF6B35, #F54B64));
  color: white;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.125rem;
  border-radius: 12px;
  transition: all 0.3s ease-in-out;
  text-align: center;

  &:hover {
    background: var(--btn-primary-hover, linear-gradient(135deg, #FF8F6B, #FE7084));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(245, 75, 100, 0.3);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
`;
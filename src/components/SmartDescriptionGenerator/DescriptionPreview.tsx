/**
 * Description Preview Component
 * Read-only display of vehicle description for public view
 */

import React from 'react';
import styled from 'styled-components';
import { FileText } from 'lucide-react';

interface DescriptionPreviewProps {
  description: string;
  title?: string;
  maxLines?: number;
}

const Container = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--border);
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
`;

const Content = styled.div<{ $maxLines?: number }>`
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  
  ${props => props.$maxLines && `
    display: -webkit-box;
    -webkit-line-clamp: ${props.$maxLines};
    -webkit-box-orient: vertical;
    overflow: hidden;
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);
  font-style: italic;
`;

export const DescriptionPreview: React.FC<DescriptionPreviewProps> = ({
  description,
  title,
  maxLines
}) => {
  if (!description || description.trim().length === 0) {
    return (
      <Container>
        <EmptyState>
          No description available
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      {title && (
        <Header>
          <IconWrapper>
            <FileText size={18} />
          </IconWrapper>
          <Title>{title}</Title>
        </Header>
      )}
      <Content $maxLines={maxLines}>
        {description}
      </Content>
    </Container>
  );
};

export default DescriptionPreview;

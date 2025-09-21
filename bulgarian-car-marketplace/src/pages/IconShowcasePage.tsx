// src/pages/IconShowcasePage.tsx
// Icon Showcase Page

import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import IconShowcase from '../components/IconShowcase';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.grey[50]};
`;

const IconShowcasePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <IconShowcase />
    </PageContainer>
  );
};

export default IconShowcasePage;
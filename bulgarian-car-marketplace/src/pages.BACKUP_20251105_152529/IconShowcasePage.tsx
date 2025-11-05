// Icon Showcase Page - Temporarily disabled due to icon library migration
// (Comment removed - was in Arabic)

import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.grey[50]};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlaceholderMessage = styled.div`
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const IconShowcasePage: React.FC = () => {
  // const { t } = useTranslation();

  return (
    <PageContainer>
      <PlaceholderMessage>
        <h2>Галерия на икони</h2>
        <p>Показването на икони е временно деактивирано по време на миграцията на библиотеката с икони.</p>
      </PlaceholderMessage>
    </PageContainer>
  );
};

export default IconShowcasePage;
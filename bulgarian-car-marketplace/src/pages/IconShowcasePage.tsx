// Icon Showcase Page - Temporarily disabled due to icon library migration
// صفحة عرض الأيقونات - معطلة مؤقتاً بسبب ترحيل مكتبة الأيقونات

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
        <h2>Icon Showcase</h2>
        <p>Icon showcase temporarily disabled during icon library migration.</p>
        <p>عرض الأيقونات معطل مؤقتاً أثناء ترحيل مكتبة الأيقونات.</p>
      </PlaceholderMessage>
    </PageContainer>
  );
};

export default IconShowcasePage;
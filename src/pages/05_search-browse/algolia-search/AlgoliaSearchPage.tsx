// AlgoliaSearchPage.tsx
// Advanced search page with Algolia integration

import React from 'react';
import styled from 'styled-components';
import AlgoliaInstantSearch from '@/components/Search/AlgoliaInstantSearch';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  padding-top: 90px;
  padding-bottom: 3rem;
`;

const AlgoliaSearchPage: React.FC = () => {
  return (
    <PageWrapper>
      <AlgoliaInstantSearch />
    </PageWrapper>
  );
};

export default AlgoliaSearchPage;


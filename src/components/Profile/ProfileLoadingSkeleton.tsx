// ProfileLoadingSkeleton.tsx - هيكل تحميل البروفايل بتأثير الوميض
// Shimmer skeleton for profile page loading state
import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    rgba(200, 200, 200, 0.2) 25%,
    rgba(200, 200, 200, 0.4) 50%,
    rgba(200, 200, 200, 0.2) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: 8px;

  html[data-theme='dark'] & {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06) 25%,
      rgba(255, 255, 255, 0.12) 50%,
      rgba(255, 255, 255, 0.06) 75%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s ease-in-out infinite;
  }
`;

const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const CoverSkeleton = styled(SkeletonBase)`
  width: 100%;
  height: 200px;
  border-radius: 12px;

  @media (max-width: 768px) {
    height: 140px;
    border-radius: 8px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 20px;
  margin-top: -40px;
  padding: 0 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    margin-top: -30px;
    padding: 0 12px;
    gap: 12px;
  }
`;

const AvatarSkeleton = styled(SkeletonBase)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 4px solid var(--bg-primary, #fff);

  @media (max-width: 768px) {
    width: 88px;
    height: 88px;
  }
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  padding-bottom: 8px;

  @media (max-width: 768px) {
    align-items: center;
    width: 100%;
  }
`;

const NameSkeleton = styled(SkeletonBase)`
  width: 180px;
  height: 24px;

  @media (max-width: 768px) {
    width: 140px;
    height: 20px;
  }
`;

const SubInfoSkeleton = styled(SkeletonBase)`
  width: 120px;
  height: 16px;
`;

const TabBarSkeleton = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 24px;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    margin-top: 16px;
  }
`;

const TabSkeleton = styled(SkeletonBase)`
  flex: 1;
  min-width: 90px;
  height: 48px;
  border-radius: 12px;

  @media (max-width: 1024px) {
    flex: 0 0 calc(33.333% - 7px);
  }
`;

const ContentSkeleton = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    margin-top: 16px;
  }
`;

const CardSkeleton = styled(SkeletonBase)`
  height: 200px;
  border-radius: 12px;

  @media (max-width: 768px) {
    height: 160px;
  }
`;

const ProfileLoadingSkeleton: React.FC = () => (
  <Wrapper>
    <CoverSkeleton />
    <HeaderRow>
      <AvatarSkeleton />
      <InfoBlock>
        <NameSkeleton />
        <SubInfoSkeleton />
      </InfoBlock>
    </HeaderRow>
    <TabBarSkeleton>
      {Array.from({ length: 5 }, (_, i) => (
        <TabSkeleton key={i} />
      ))}
    </TabBarSkeleton>
    <ContentSkeleton>
      {Array.from({ length: 3 }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </ContentSkeleton>
  </Wrapper>
);

export default ProfileLoadingSkeleton;

import React, { memo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  mobileColors,
  mobileSpacing,
  mobileTypography,
  mobileBorderRadius,
  mobileShadows,
  mobileZIndex,
  mobileMixins,
  mobileAnimations
} from '../../styles/mobile-design-system';

export type MobileHeaderProps = {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightActions?: React.ReactNode;
};

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: ${mobileZIndex.sticky};
  background: ${mobileColors.surface.card};
  border-bottom: 1px solid ${mobileColors.surface.border};
  box-shadow: ${mobileShadows.sticky};
  ${mobileMixins.safeAreaPadding};
`;

const HeaderContent = styled.div`
  ${mobileMixins.flexBetween};
  height: 64px;
  padding: 0 ${mobileSpacing.md};
`;

const Left = styled.div`
  ${mobileMixins.flexCenter};
  gap: ${mobileSpacing.sm};
  min-width: 64px;
`;

const Center = styled.div`
  flex: 1;
  text-align: center;
`;

const Right = styled.div`
  ${mobileMixins.flexCenter};
  gap: ${mobileSpacing.sm};
  min-width: 64px;
  justify-content: flex-end;
`;

const Title = styled.h1`
  ${mobileMixins.truncate};
  font-size: ${mobileTypography.h3.fontSize};
  line-height: ${mobileTypography.h3.lineHeight};
  font-weight: ${mobileTypography.h3.fontWeight};
  margin: 0;
  color: ${mobileColors.neutral.gray900};
`;

const BackButton = styled.button`
  ${mobileMixins.touchTarget};
  padding: 0 ${mobileSpacing.sm};
  border: none;
  background: transparent;
  color: ${mobileColors.neutral.gray700};
  border-radius: ${mobileBorderRadius.md};
  cursor: pointer;
  transition: background 160ms ${mobileAnimations.easing.easeInOut};

  &:active {
    background: ${mobileColors.neutral.gray100};
  }
`;

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBackButton,
  onBackClick,
  rightActions
}) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBackClick) return onBackClick();
    navigate(-1);
  };

  return (
    <HeaderWrapper>
      <HeaderContent>
        <Left>
          {showBackButton ? (
            <BackButton onClick={handleBack}>Back</BackButton>
          ) : null}
        </Left>
        <Center>
          <Title>{title || 'Globul Cars'}</Title>
        </Center>
        <Right>
          {rightActions}
        </Right>
      </HeaderContent>
    </HeaderWrapper>
  );
};

export default memo(MobileHeader);

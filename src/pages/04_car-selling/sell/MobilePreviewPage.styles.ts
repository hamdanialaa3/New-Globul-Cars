// Styles for MobilePreviewPage
import styled from 'styled-components';
import {
  mobileSpacing,
  mobileTypography,
  mobileBorderRadius,
  mobileShadows,
  mobileMixins
} from '../../../styles/mobile-design-system';

const Container = styled.div`
  padding: ${mobileSpacing.md};
  ${mobileMixins.safeAreaPadding};
  display: flex;
  flex-direction: column;
  gap: ${mobileSpacing.md};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  font-size: ${mobileTypography.h3.fontSize};
  line-height: ${mobileTypography.h3.lineHeight};
  font-weight: ${mobileTypography.h3.fontWeight};
  color: var(--text-primary);
  margin: 0;
`;

const Card = styled.section`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: ${mobileBorderRadius.lg};
  box-shadow: ${mobileShadows.card};
  padding: ${mobileSpacing.md};
`;

const CardTitle = styled.h2`
  font-size: ${mobileTypography.h4.fontSize};
  line-height: ${mobileTypography.h4.lineHeight};
  font-weight: ${mobileTypography.h4.fontWeight};
  color: var(--text-primary);
  margin: 0 0 ${mobileSpacing.sm};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${mobileSpacing.sm};
  margin-top: ${mobileSpacing.xs};
`;

const Label = styled.span`
  color: var(--text-secondary);
  font-size: ${mobileTypography.caption.fontSize};
`;

const Value = styled.span`
  color: var(--text-primary);
  font-weight: 600;
  font-size: ${mobileTypography.bodyMedium.fontSize};
  justify-self: end;
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${mobileSpacing.xs};
`;

const Thumb = styled.img`
  width: 100%;
  height: 82px;
  object-fit: cover;
  border-radius: ${mobileBorderRadius.md};
  border: 1px solid var(--border);
  background: var(--bg-secondary);
`;

const Actions = styled.div`
  position: sticky;
  bottom: 0;
  ${mobileMixins.safeAreaPadding};
  background: var(--bg-primary);
  padding: ${mobileSpacing.md};
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${mobileSpacing.sm};
  border-top: 1px solid var(--border);
`;

const Button = styled.button`
  ${mobileMixins.touchTarget};
  border-radius: ${mobileBorderRadius.lg};
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  font-weight: 600;
`;

const PrimaryButton = styled.button`
  ${mobileMixins.touchTarget};
  border-radius: ${mobileBorderRadius.lg};
  border: none;
  background: var(--accent-primary);
  color: var(--text-on-accent, #ffffff);
  font-weight: 700;
`;

const EquipmentGroup = styled.div`
  &:not(:last-child) {
    margin-bottom: ${mobileSpacing.md};
    padding-bottom: ${mobileSpacing.md};
    border-bottom: 1px solid var(--border);
  }
`;

const EquipmentHeading = styled.h4`
  margin: 0 0 ${mobileSpacing.xs} 0;
  font-size: ${mobileTypography.bodyLarge.fontSize};
  color: var(--text-primary);
`;

const EquipmentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${mobileSpacing.xs};
`;

const EquipmentTag = styled.span`
  display: inline-flex;
  padding: 4px 10px;
  border-radius: ${mobileBorderRadius.full};
  background: var(--bg-accent);
  color: var(--text-primary);
  font-size: ${mobileTypography.caption.fontSize};
  border: 1px solid var(--border);
`;

const EmptyState = styled.div`
  padding: ${mobileSpacing.sm} 0;
  color: var(--text-secondary);
  font-size: ${mobileTypography.bodySmall.fontSize};
`;

export const S = {
  Container,
  Header,
  Title,
  Card,
  CardTitle,
  Row,
  Label,
  Value,
  ImagesGrid,
  Thumb,
  Actions,
  Button,
  PrimaryButton,
  EquipmentGroup,
  EquipmentHeading,
  EquipmentList,
  EquipmentTag,
  EmptyState
};

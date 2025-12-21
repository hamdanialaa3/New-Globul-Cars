import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

const BackgroundTestContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.xl} 0;
  background: ${({ theme }) => theme.colors.background.default};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const PageTitle = styled.h1`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const BackgroundTestCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const BackgroundTestTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const BackgroundTestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const BackgroundTestItem = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const BackgroundTestItemTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const BackgroundTestItemText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  line-height: 1.5;
`;

const BackgroundTestButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.primary.contrastText};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
  }
`;

const BackgroundTestInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const BackgroundTestSelect = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const BackgroundTestTextArea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  min-height: 100px;
  resize: vertical;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const BackgroundTestCheckbox = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const BackgroundTestCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const BackgroundTestRadio = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const BackgroundTestRadioLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const BackgroundTestProgress = styled.progress`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.grey[200]};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &::-webkit-progress-bar {
    background: ${({ theme }) => theme.colors.grey[200]};
    border-radius: 4px;
  }

  &::-webkit-progress-value {
    background: ${({ theme }) => theme.colors.primary.main};
    border-radius: 4px;
  }
`;

const BackgroundTestAlert = styled.div<{ type: 'success' | 'warning' | 'error' | 'info' }>`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-left: 4px solid ${({ theme, type }) => {
    switch (type) {
      case 'success': return theme.colors.success.main;
      case 'warning': return theme.colors.warning.main;
      case 'error': return theme.colors.error.main;
      case 'info': return theme.colors.info.main;
      default: return theme.colors.grey[300];
    }
  }};
  background: ${({ theme, type }) => {
    switch (type) {
      case 'success': return theme.colors.success.light + '20';
      case 'warning': return theme.colors.warning.light + '20';
      case 'error': return theme.colors.error.light + '20';
      case 'info': return theme.colors.info.light + '20';
      default: return theme.colors.grey[50];
    }
  }};
  color: ${({ theme, type }) => {
    switch (type) {
      case 'success': return theme.colors.success.dark;
      case 'warning': return theme.colors.warning.dark;
      case 'error': return theme.colors.error.dark;
      case 'info': return theme.colors.info.dark;
      default: return theme.colors.text.primary;
    }
  }};
`;

const BackgroundTestBadge = styled.span<{ variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background: ${({ theme, variant }) => {
    switch (variant) {
      case 'primary': return theme.colors.primary.main;
      case 'secondary': return theme.colors.secondary.main;
      case 'success': return theme.colors.success.main;
      case 'warning': return theme.colors.warning.main;
      case 'error': return theme.colors.error.main;
      default: return theme.colors.grey[300];
    }
  }};
  color: white;
  margin-right: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const BackgroundTestTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const BackgroundTestTableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  background: ${({ theme }) => theme.colors.grey[100]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[300]};
`;

const BackgroundTestTableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const BackgroundTest: React.FC = () => {
  const { t } = useTranslation();

  return (
    <BackgroundTestContainer>
      <PageContainer>
        <PageTitle>{t('backgroundTest.title', 'Background Test Page')}</PageTitle>

        <BackgroundTestCard>
          <BackgroundTestTitle>{t('backgroundTest.overview', 'Overview')}</BackgroundTestTitle>
          <BackgroundTestGrid>
            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.primaryBackground', 'Primary Background')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test the primary background color and its variations.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testPrimary', 'Test Primary')}</BackgroundTestButton>
            </BackgroundTestItem>

            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.secondaryBackground', 'Secondary Background')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test the secondary background color and its variations.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testSecondary', 'Test Secondary')}</BackgroundTestButton>
            </BackgroundTestItem>

            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.accentBackground', 'Accent Background')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test the accent background color and its variations.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testAccent', 'Test Accent')}</BackgroundTestButton>
            </BackgroundTestItem>

            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.neutralBackground', 'Neutral Background')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test the neutral background color and its variations.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testNeutral', 'Test Neutral')}</BackgroundTestButton>
            </BackgroundTestItem>
          </BackgroundTestGrid>
        </BackgroundTestCard>

        <BackgroundTestCard>
          <BackgroundTestTitle>{t('backgroundTest.backgrounds', 'Backgrounds')}</BackgroundTestTitle>
          <BackgroundTestGrid>
            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.solidBackgrounds', 'Solid Backgrounds')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test solid background colors and their variations.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testSolid', 'Test Solid')}</BackgroundTestButton>
            </BackgroundTestItem>

            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.gradientBackgrounds', 'Gradient Backgrounds')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test gradient background colors and their variations.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testGradient', 'Test Gradient')}</BackgroundTestButton>
            </BackgroundTestItem>

            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.patternBackgrounds', 'Pattern Backgrounds')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test pattern background colors and their variations.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testPattern', 'Test Pattern')}</BackgroundTestButton>
            </BackgroundTestItem>

            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.imageBackgrounds', 'Image Backgrounds')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test image background colors and their variations.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testImage', 'Test Image')}</BackgroundTestButton>
            </BackgroundTestItem>
          </BackgroundTestGrid>
        </BackgroundTestCard>

        <BackgroundTestCard>
          <BackgroundTestTitle>{t('backgroundTest.effects', 'Effects')}</BackgroundTestTitle>
          <BackgroundTestGrid>
            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.blurEffects', 'Blur Effects')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test blur effects on background elements.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testBlur', 'Test Blur')}</BackgroundTestButton>
            </BackgroundTestItem>

            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.overlayEffects', 'Overlay Effects')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test overlay effects on background elements.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testOverlay', 'Test Overlay')}</BackgroundTestButton>
            </BackgroundTestItem>

            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.animationEffects', 'Animation Effects')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test animation effects on background elements.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testAnimation', 'Test Animation')}</BackgroundTestButton>
            </BackgroundTestItem>

            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.transitionEffects', 'Transition Effects')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test transition effects on background elements.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testTransition', 'Test Transition')}</BackgroundTestButton>
            </BackgroundTestItem>
          </BackgroundTestGrid>
        </BackgroundTestCard>

        <BackgroundTestCard>
          <BackgroundTestTitle>{t('backgroundTest.responsiveness', 'Responsiveness')}</BackgroundTestTitle>
          <BackgroundTestGrid>
            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.mobileBackgrounds', 'Mobile Backgrounds')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test background responsiveness on mobile devices.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testMobile', 'Test Mobile')}</BackgroundTestButton>
            </BackgroundTestItem>

            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.tabletBackgrounds', 'Tablet Backgrounds')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test background responsiveness on tablet devices.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testTablet', 'Test Tablet')}</BackgroundTestButton>
            </BackgroundTestItem>

            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.desktopBackgrounds', 'Desktop Backgrounds')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test background responsiveness on desktop devices.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testDesktop', 'Test Desktop')}</BackgroundTestButton>
            </BackgroundTestItem>

            <BackgroundTestItem>
              <BackgroundTestItemTitle>{t('backgroundTest.wideScreenBackgrounds', 'Wide Screen Backgrounds')}</BackgroundTestItemTitle>
              <BackgroundTestItemText>
                Test background responsiveness on wide screen devices.
              </BackgroundTestItemText>
              <BackgroundTestButton>{t('backgroundTest.testWideScreen', 'Test Wide Screen')}</BackgroundTestButton>
            </BackgroundTestItem>
          </BackgroundTestGrid>
        </BackgroundTestCard>
      </PageContainer>
    </BackgroundTestContainer>
  );
};

export default BackgroundTest;
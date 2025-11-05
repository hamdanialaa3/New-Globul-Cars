import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '@/hooks/useTranslation';

const ThemeTestContainer = styled.div`
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

const ThemeTestCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ThemeTestTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const ThemeTestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ThemeTestItem = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const ThemeTestItemTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const ThemeTestItemText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  line-height: 1.5;
`;

const ThemeTestButton = styled.button`
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

const ThemeTestInput = styled.input`
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

const ThemeTestSelect = styled.select`
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

const ThemeTestTextArea = styled.textarea`
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

const ThemeTestCheckbox = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const ThemeTestCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ThemeTestRadio = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const ThemeTestRadioLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ThemeTestProgress = styled.progress`
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

const ThemeTestAlert = styled.div<{ type: 'success' | 'warning' | 'error' | 'info' }>`
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

const ThemeTestBadge = styled.span<{ variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' }>`
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

const ThemeTestTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ThemeTestTableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  background: ${({ theme }) => theme.colors.grey[100]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[300]};
`;

const ThemeTestTableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ThemeTest: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ThemeTestContainer>
      <PageContainer>
        <PageTitle>{t('themeTest.title', 'Theme Test Page')}</PageTitle>

        <ThemeTestCard>
          <ThemeTestTitle>{t('themeTest.overview', 'Overview')}</ThemeTestTitle>
          <ThemeTestGrid>
            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.primaryColors', 'Primary Colors')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test the primary color scheme and its variations.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testPrimary', 'Test Primary')}</ThemeTestButton>
            </ThemeTestItem>

            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.secondaryColors', 'Secondary Colors')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test the secondary color scheme and its variations.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testSecondary', 'Test Secondary')}</ThemeTestButton>
            </ThemeTestItem>

            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.accentColors', 'Accent Colors')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test the accent color scheme and its variations.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testAccent', 'Test Accent')}</ThemeTestButton>
            </ThemeTestItem>

            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.neutralColors', 'Neutral Colors')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test the neutral color scheme and its variations.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testNeutral', 'Test Neutral')}</ThemeTestButton>
            </ThemeTestItem>
          </ThemeTestGrid>
        </ThemeTestCard>

        <ThemeTestCard>
          <ThemeTestTitle>{t('themeTest.typography', 'Typography')}</ThemeTestTitle>
          <ThemeTestGrid>
            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.headings', 'Headings')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test different heading sizes and weights.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testHeadings', 'Test Headings')}</ThemeTestButton>
            </ThemeTestItem>

            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.bodyText', 'Body Text')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test body text styles and variations.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testBodyText', 'Test Body Text')}</ThemeTestButton>
            </ThemeTestItem>

            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.captions', 'Captions')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test caption and small text styles.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testCaptions', 'Test Captions')}</ThemeTestButton>
            </ThemeTestItem>

            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.links', 'Links')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test link styles and hover effects.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testLinks', 'Test Links')}</ThemeTestButton>
            </ThemeTestItem>
          </ThemeTestGrid>
        </ThemeTestCard>

        <ThemeTestCard>
          <ThemeTestTitle>{t('themeTest.components', 'Components')}</ThemeTestTitle>
          <ThemeTestGrid>
            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.buttons', 'Buttons')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test different button styles and states.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testButtons', 'Test Buttons')}</ThemeTestButton>
            </ThemeTestItem>

            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.inputs', 'Inputs')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test input field styles and states.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testInputs', 'Test Inputs')}</ThemeTestButton>
            </ThemeTestItem>

            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.cards', 'Cards')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test card component styles and variations.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testCards', 'Test Cards')}</ThemeTestButton>
            </ThemeTestItem>

            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.modals', 'Modals')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test modal component styles and states.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testModals', 'Test Modals')}</ThemeTestButton>
            </ThemeTestItem>
          </ThemeTestGrid>
        </ThemeTestCard>

        <ThemeTestCard>
          <ThemeTestTitle>{t('themeTest.layout', 'Layout')}</ThemeTestTitle>
          <ThemeTestGrid>
            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.grid', 'Grid')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test grid layout system and responsiveness.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testGrid', 'Test Grid')}</ThemeTestButton>
            </ThemeTestItem>

            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.spacing', 'Spacing')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test spacing system and consistency.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testSpacing', 'Test Spacing')}</ThemeTestButton>
            </ThemeTestItem>

            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.borders', 'Borders')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test border styles and radius variations.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testBorders', 'Test Borders')}</ThemeTestButton>
            </ThemeTestItem>

            <ThemeTestItem>
              <ThemeTestItemTitle>{t('themeTest.shadows', 'Shadows')}</ThemeTestItemTitle>
              <ThemeTestItemText>
                Test shadow styles and depth variations.
              </ThemeTestItemText>
              <ThemeTestButton>{t('themeTest.testShadows', 'Test Shadows')}</ThemeTestButton>
            </ThemeTestItem>
          </ThemeTestGrid>
        </ThemeTestCard>
      </PageContainer>
    </ThemeTestContainer>
  );
};

export default ThemeTest;
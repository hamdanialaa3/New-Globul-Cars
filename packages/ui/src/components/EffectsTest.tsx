import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '@globul-cars/coreuseTranslation';

const EffectsTestContainer = styled.div`
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

const EffectsTestCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const EffectsTestTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const EffectsTestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const EffectsTestItem = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const EffectsTestItemTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const EffectsTestItemText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  line-height: 1.5;
`;

const EffectsTestButton = styled.button`
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

const EffectsTestInput = styled.input`
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

const EffectsTestSelect = styled.select`
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

const EffectsTestTextArea = styled.textarea`
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

const EffectsTestCheckbox = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const EffectsTestCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const EffectsTestRadio = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const EffectsTestRadioLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const EffectsTestProgress = styled.progress`
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

const EffectsTestAlert = styled.div<{ type: 'success' | 'warning' | 'error' | 'info' }>`
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

const EffectsTestBadge = styled.span<{ variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' }>`
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

const EffectsTestTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EffectsTestTableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  background: ${({ theme }) => theme.colors.grey[100]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[300]};
`;

const EffectsTestTableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const EffectsTest: React.FC = () => {
  const { t } = useTranslation();

  return (
    <EffectsTestContainer>
      <PageContainer>
        <PageTitle>{t('effectsTest.title', 'Effects Test Page')}</PageTitle>

        <EffectsTestCard>
          <EffectsTestTitle>{t('effectsTest.overview', 'Overview')}</EffectsTestTitle>
          <EffectsTestGrid>
            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.primaryEffects', 'Primary Effects')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test the primary effects and their variations.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testPrimary', 'Test Primary')}</EffectsTestButton>
            </EffectsTestItem>

            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.secondaryEffects', 'Secondary Effects')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test the secondary effects and their variations.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testSecondary', 'Test Secondary')}</EffectsTestButton>
            </EffectsTestItem>

            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.accentEffects', 'Accent Effects')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test the accent effects and their variations.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testAccent', 'Test Accent')}</EffectsTestButton>
            </EffectsTestItem>

            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.neutralEffects', 'Neutral Effects')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test the neutral effects and their variations.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testNeutral', 'Test Neutral')}</EffectsTestButton>
            </EffectsTestItem>
          </EffectsTestGrid>
        </EffectsTestCard>

        <EffectsTestCard>
          <EffectsTestTitle>{t('effectsTest.typography', 'Typography')}</EffectsTestTitle>
          <EffectsTestGrid>
            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.headings', 'Headings')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test different heading sizes and weights.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testHeadings', 'Test Headings')}</EffectsTestButton>
            </EffectsTestItem>

            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.bodyText', 'Body Text')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test body text styles and variations.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testBodyText', 'Test Body Text')}</EffectsTestButton>
            </EffectsTestItem>

            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.captions', 'Captions')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test caption and small text styles.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testCaptions', 'Test Captions')}</EffectsTestButton>
            </EffectsTestItem>

            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.links', 'Links')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test link styles and hover effects.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testLinks', 'Test Links')}</EffectsTestButton>
            </EffectsTestItem>
          </EffectsTestGrid>
        </EffectsTestCard>

        <EffectsTestCard>
          <EffectsTestTitle>{t('effectsTest.components', 'Components')}</EffectsTestTitle>
          <EffectsTestGrid>
            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.buttons', 'Buttons')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test different button styles and states.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testButtons', 'Test Buttons')}</EffectsTestButton>
            </EffectsTestItem>

            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.inputs', 'Inputs')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test input field styles and states.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testInputs', 'Test Inputs')}</EffectsTestButton>
            </EffectsTestItem>

            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.cards', 'Cards')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test card component styles and variations.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testCards', 'Test Cards')}</EffectsTestButton>
            </EffectsTestItem>

            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.modals', 'Modals')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test modal component styles and states.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testModals', 'Test Modals')}</EffectsTestButton>
            </EffectsTestItem>
          </EffectsTestGrid>
        </EffectsTestCard>

        <EffectsTestCard>
          <EffectsTestTitle>{t('effectsTest.layout', 'Layout')}</EffectsTestTitle>
          <EffectsTestGrid>
            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.grid', 'Grid')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test grid layout system and responsiveness.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testGrid', 'Test Grid')}</EffectsTestButton>
            </EffectsTestItem>

            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.spacing', 'Spacing')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test spacing system and consistency.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testSpacing', 'Test Spacing')}</EffectsTestButton>
            </EffectsTestItem>

            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.borders', 'Borders')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test border styles and radius variations.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testBorders', 'Test Borders')}</EffectsTestButton>
            </EffectsTestItem>

            <EffectsTestItem>
              <EffectsTestItemTitle>{t('effectsTest.shadows', 'Shadows')}</EffectsTestItemTitle>
              <EffectsTestItemText>
                Test shadow styles and depth variations.
              </EffectsTestItemText>
              <EffectsTestButton>{t('effectsTest.testShadows', 'Test Shadows')}</EffectsTestButton>
            </EffectsTestItem>
          </EffectsTestGrid>
        </EffectsTestCard>
      </PageContainer>
    </EffectsTestContainer>
  );
};

export default EffectsTest;
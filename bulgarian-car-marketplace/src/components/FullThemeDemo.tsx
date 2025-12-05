import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

const FullThemeDemoContainer = styled.div`
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

const FullThemeDemoCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FullThemeDemoTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const FullThemeDemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FullThemeDemoItem = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const FullThemeDemoItemTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const FullThemeDemoItemText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  line-height: 1.5;
`;

const FullThemeDemoButton = styled.button`
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

const FullThemeDemoInput = styled.input`
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

const FullThemeDemoSelect = styled.select`
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

const FullThemeDemoTextArea = styled.textarea`
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

const FullThemeDemoCheckbox = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const FullThemeDemoCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FullThemeDemoRadio = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const FullThemeDemoRadioLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FullThemeDemoProgress = styled.progress`
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

const FullThemeDemoAlert = styled.div<{ type: 'success' | 'warning' | 'error' | 'info' }>`
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

const FullThemeDemoBadge = styled.span<{ variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' }>`
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

const FullThemeDemoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FullThemeDemoTableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  background: ${({ theme }) => theme.colors.grey[100]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[300]};
`;

const FullThemeDemoTableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FullThemeDemo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <FullThemeDemoContainer>
      <PageContainer>
        <PageTitle>{t('fullThemeDemo.title', 'Full Theme Demo Page')}</PageTitle>

        <FullThemeDemoCard>
          <FullThemeDemoTitle>{t('fullThemeDemo.overview', 'Overview')}</FullThemeDemoTitle>
          <FullThemeDemoGrid>
            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.primaryTheme', 'Primary Theme')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test the primary theme and its variations.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testPrimary', 'Test Primary')}</FullThemeDemoButton>
            </FullThemeDemoItem>

            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.secondaryTheme', 'Secondary Theme')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test the secondary theme and its variations.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testSecondary', 'Test Secondary')}</FullThemeDemoButton>
            </FullThemeDemoItem>

            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.accentTheme', 'Accent Theme')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test the accent theme and its variations.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testAccent', 'Test Accent')}</FullThemeDemoButton>
            </FullThemeDemoItem>

            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.neutralTheme', 'Neutral Theme')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test the neutral theme and its variations.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testNeutral', 'Test Neutral')}</FullThemeDemoButton>
            </FullThemeDemoItem>
          </FullThemeDemoGrid>
        </FullThemeDemoCard>

        <FullThemeDemoCard>
          <FullThemeDemoTitle>{t('fullThemeDemo.typography', 'Typography')}</FullThemeDemoTitle>
          <FullThemeDemoGrid>
            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.headings', 'Headings')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test different heading sizes and weights.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testHeadings', 'Test Headings')}</FullThemeDemoButton>
            </FullThemeDemoItem>

            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.bodyText', 'Body Text')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test body text styles and variations.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testBodyText', 'Test Body Text')}</FullThemeDemoButton>
            </FullThemeDemoItem>

            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.captions', 'Captions')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test caption and small text styles.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testCaptions', 'Test Captions')}</FullThemeDemoButton>
            </FullThemeDemoItem>

            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.links', 'Links')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test link styles and hover effects.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testLinks', 'Test Links')}</FullThemeDemoButton>
            </FullThemeDemoItem>
          </FullThemeDemoGrid>
        </FullThemeDemoCard>

        <FullThemeDemoCard>
          <FullThemeDemoTitle>{t('fullThemeDemo.components', 'Components')}</FullThemeDemoTitle>
          <FullThemeDemoGrid>
            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.buttons', 'Buttons')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test different button styles and states.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testButtons', 'Test Buttons')}</FullThemeDemoButton>
            </FullThemeDemoItem>

            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.inputs', 'Inputs')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test input field styles and states.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testInputs', 'Test Inputs')}</FullThemeDemoButton>
            </FullThemeDemoItem>

            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.cards', 'Cards')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test card component styles and variations.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testCards', 'Test Cards')}</FullThemeDemoButton>
            </FullThemeDemoItem>

            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.modals', 'Modals')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test modal component styles and states.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testModals', 'Test Modals')}</FullThemeDemoButton>
            </FullThemeDemoItem>
          </FullThemeDemoGrid>
        </FullThemeDemoCard>

        <FullThemeDemoCard>
          <FullThemeDemoTitle>{t('fullThemeDemo.layout', 'Layout')}</FullThemeDemoTitle>
          <FullThemeDemoGrid>
            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.grid', 'Grid')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test grid layout system and responsiveness.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testGrid', 'Test Grid')}</FullThemeDemoButton>
            </FullThemeDemoItem>

            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.spacing', 'Spacing')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test spacing system and consistency.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testSpacing', 'Test Spacing')}</FullThemeDemoButton>
            </FullThemeDemoItem>

            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.borders', 'Borders')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test border styles and radius variations.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testBorders', 'Test Borders')}</FullThemeDemoButton>
            </FullThemeDemoItem>

            <FullThemeDemoItem>
              <FullThemeDemoItemTitle>{t('fullThemeDemo.shadows', 'Shadows')}</FullThemeDemoItemTitle>
              <FullThemeDemoItemText>
                Test shadow styles and depth variations.
              </FullThemeDemoItemText>
              <FullThemeDemoButton>{t('fullThemeDemo.testShadows', 'Test Shadows')}</FullThemeDemoButton>
            </FullThemeDemoItem>
          </FullThemeDemoGrid>
        </FullThemeDemoCard>
      </PageContainer>
    </FullThemeDemoContainer>
  );
};

export default FullThemeDemo;
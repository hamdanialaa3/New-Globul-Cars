import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

const DashboardContainer = styled.div`
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

const DashboardCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const DashboardTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const DashboardItem = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const DashboardItemTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const DashboardItemText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  line-height: 1.5;
`;

const DashboardButton = styled.button`
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

const DashboardInput = styled.input`
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

const DashboardSelect = styled.select`
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

const DashboardTextArea = styled.textarea`
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

const DashboardCheckbox = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const DashboardCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const DashboardRadio = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const DashboardRadioLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const DashboardProgress = styled.progress`
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

const DashboardAlert = styled.div<{ type: 'success' | 'warning' | 'error' | 'info' }>`
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

const DashboardBadge = styled.span<{ variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' }>`
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

const DashboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const DashboardTableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  background: ${({ theme }) => theme.colors.grey[100]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[300]};
`;

const DashboardTableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DashboardContainer>
      <PageContainer>
        <PageTitle>{t('dashboard.title', 'Dashboard Page')}</PageTitle>

        <DashboardCard>
          <DashboardTitle>{t('dashboard.overview', 'Overview')}</DashboardTitle>
          <DashboardGrid>
            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.totalCars', 'Total Cars')}</DashboardItemTitle>
              <DashboardItemText>1,234 cars listed</DashboardItemText>
              <DashboardButton>{t('dashboard.viewCars', 'View Cars')}</DashboardButton>
            </DashboardItem>

            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.totalUsers', 'Total Users')}</DashboardItemTitle>
              <DashboardItemText>5,678 registered users</DashboardItemText>
              <DashboardButton>{t('dashboard.viewUsers', 'View Users')}</DashboardButton>
            </DashboardItem>

            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.totalMessages', 'Total Messages')}</DashboardItemTitle>
              <DashboardItemText>9,012 messages sent</DashboardItemText>
              <DashboardButton>{t('dashboard.viewMessages', 'View Messages')}</DashboardButton>
            </DashboardItem>

            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.totalRevenue', 'Total Revenue')}</DashboardItemTitle>
              <DashboardItemText>€123,456 generated</DashboardItemText>
              <DashboardButton>{t('dashboard.viewRevenue', 'View Revenue')}</DashboardButton>
            </DashboardItem>
          </DashboardGrid>
        </DashboardCard>

        <DashboardCard>
          <DashboardTitle>{t('dashboard.recentActivity', 'Recent Activity')}</DashboardTitle>
          <DashboardGrid>
            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.newCars', 'New Cars')}</DashboardItemTitle>
              <DashboardItemText>5 new cars added today</DashboardItemText>
              <DashboardButton>{t('dashboard.viewNewCars', 'View New Cars')}</DashboardButton>
            </DashboardItem>

            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.newUsers', 'New Users')}</DashboardItemTitle>
              <DashboardItemText>12 new users registered today</DashboardItemText>
              <DashboardButton>{t('dashboard.viewNewUsers', 'View New Users')}</DashboardButton>
            </DashboardItem>

            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.newMessages', 'New Messages')}</DashboardItemTitle>
              <DashboardItemText>23 new messages received today</DashboardItemText>
              <DashboardButton>{t('dashboard.viewNewMessages', 'View New Messages')}</DashboardButton>
            </DashboardItem>

            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.systemStatus', 'System Status')}</DashboardItemTitle>
              <DashboardItemText>All systems operational</DashboardItemText>
              <DashboardButton>{t('dashboard.viewSystemStatus', 'View System Status')}</DashboardButton>
            </DashboardItem>
          </DashboardGrid>
        </DashboardCard>

        <DashboardCard>
          <DashboardTitle>{t('dashboard.analytics', 'Analytics')}</DashboardTitle>
          <DashboardGrid>
            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.pageViews', 'Page Views')}</DashboardItemTitle>
              <DashboardItemText>45,678 page views today</DashboardItemText>
              <DashboardProgress value={75} max={100} />
              <DashboardItemText>75% increase from yesterday</DashboardItemText>
            </DashboardItem>

            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.userEngagement', 'User Engagement')}</DashboardItemTitle>
              <DashboardItemText>Average session duration: 8 minutes</DashboardItemText>
              <DashboardProgress value={60} max={100} />
              <DashboardItemText>60% engagement rate</DashboardItemText>
            </DashboardItem>

            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.conversionRate', 'Conversion Rate')}</DashboardItemTitle>
              <DashboardItemText>3.2% conversion rate</DashboardItemText>
              <DashboardProgress value={32} max={100} />
              <DashboardItemText>32% of visitors convert</DashboardItemText>
            </DashboardItem>

            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.bounceRate', 'Bounce Rate')}</DashboardItemTitle>
              <DashboardItemText>25% bounce rate</DashboardItemText>
              <DashboardProgress value={25} max={100} />
              <DashboardItemText>25% of visitors leave immediately</DashboardItemText>
            </DashboardItem>
          </DashboardGrid>
        </DashboardCard>

        <DashboardCard>
          <DashboardTitle>{t('dashboard.settings', 'Settings')}</DashboardTitle>
          <DashboardGrid>
            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.generalSettings', 'General Settings')}</DashboardItemTitle>
              <DashboardInput
                type="text"
                placeholder={t('dashboard.siteName', 'Site Name')}
                defaultValue="Bulgarian Car Marketplace"
              />
              <DashboardInput
                type="text"
                placeholder={t('dashboard.siteDescription', 'Site Description')}
                defaultValue="The best place to buy and sell cars in Bulgaria"
              />
              <DashboardButton>{t('dashboard.saveSettings', 'Save Settings')}</DashboardButton>
            </DashboardItem>

            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.notificationSettings', 'Notification Settings')}</DashboardItemTitle>
              <DashboardCheckboxLabel>
                <DashboardCheckbox type="checkbox" defaultChecked />
                {t('dashboard.emailNotifications', 'Email Notifications')}
              </DashboardCheckboxLabel>
              <DashboardCheckboxLabel>
                <DashboardCheckbox type="checkbox" defaultChecked />
                {t('dashboard.smsNotifications', 'SMS Notifications')}
              </DashboardCheckboxLabel>
              <DashboardCheckboxLabel>
                <DashboardCheckbox type="checkbox" defaultChecked />
                {t('dashboard.pushNotifications', 'Push Notifications')}
              </DashboardCheckboxLabel>
            </DashboardItem>

            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.securitySettings', 'Security Settings')}</DashboardItemTitle>
              <DashboardInput
                type="password"
                placeholder={t('dashboard.currentPassword', 'Current Password')}
              />
              <DashboardInput
                type="password"
                placeholder={t('dashboard.newPassword', 'New Password')}
              />
              <DashboardInput
                type="password"
                placeholder={t('dashboard.confirmPassword', 'Confirm Password')}
              />
              <DashboardButton>{t('dashboard.updatePassword', 'Update Password')}</DashboardButton>
            </DashboardItem>

            <DashboardItem>
              <DashboardItemTitle>{t('dashboard.help', 'Help & Support')}</DashboardItemTitle>
              <DashboardItemText>
                Need help with your dashboard? Contact our support team.
              </DashboardItemText>
              <DashboardButton>{t('dashboard.contactSupport', 'Contact Support')}</DashboardButton>
            </DashboardItem>
          </DashboardGrid>
        </DashboardCard>
      </PageContainer>
    </DashboardContainer>
  );
};

export default DashboardPage;











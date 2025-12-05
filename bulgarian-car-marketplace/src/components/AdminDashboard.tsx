import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

const AdminContainer = styled.div`
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

const AdminCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const AdminTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const AdminItem = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const AdminItemTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const AdminItemText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  line-height: 1.5;
`;

const AdminButton = styled.button`
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

const AdminInput = styled.input`
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

const AdminSelect = styled.select`
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

const AdminTextArea = styled.textarea`
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

const AdminCheckbox = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const AdminCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const AdminRadio = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const AdminRadioLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const AdminProgress = styled.progress`
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

const AdminAlert = styled.div<{ type: 'success' | 'warning' | 'error' | 'info' }>`
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

const AdminBadge = styled.span<{ variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' }>`
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

const AdminTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const AdminTableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  background: ${({ theme }) => theme.colors.grey[100]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[300]};
`;

const AdminTableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AdminContainer>
      <PageContainer>
        <PageTitle>{t('admin.title', 'Admin Dashboard')}</PageTitle>

        <AdminCard>
          <AdminTitle>{t('admin.overview', 'Overview')}</AdminTitle>
          <AdminGrid>
            <AdminItem>
              <AdminItemTitle>{t('admin.totalCars', 'Total Cars')}</AdminItemTitle>
              <AdminItemText>1,234 cars listed</AdminItemText>
              <AdminButton>{t('admin.viewCars', 'View Cars')}</AdminButton>
            </AdminItem>

            <AdminItem>
              <AdminItemTitle>{t('admin.totalUsers', 'Total Users')}</AdminItemTitle>
              <AdminItemText>5,678 registered users</AdminItemText>
              <AdminButton>{t('admin.viewUsers', 'View Users')}</AdminButton>
            </AdminItem>

            <AdminItem>
              <AdminItemTitle>{t('admin.totalMessages', 'Total Messages')}</AdminItemTitle>
              <AdminItemText>9,012 messages sent</AdminItemText>
              <AdminButton>{t('admin.viewMessages', 'View Messages')}</AdminButton>
            </AdminItem>

            <AdminItem>
              <AdminItemTitle>{t('admin.totalRevenue', 'Total Revenue')}</AdminItemTitle>
              <AdminItemText>€123,456 generated</AdminItemText>
              <AdminButton>{t('admin.viewRevenue', 'View Revenue')}</AdminButton>
            </AdminItem>
          </AdminGrid>
        </AdminCard>

        <AdminCard>
          <AdminTitle>{t('admin.recentActivity', 'Recent Activity')}</AdminTitle>
          <AdminGrid>
            <AdminItem>
              <AdminItemTitle>{t('admin.newCars', 'New Cars')}</AdminItemTitle>
              <AdminItemText>5 new cars added today</AdminItemText>
              <AdminButton>{t('admin.viewNewCars', 'View New Cars')}</AdminButton>
            </AdminItem>

            <AdminItem>
              <AdminItemTitle>{t('admin.newUsers', 'New Users')}</AdminItemTitle>
              <AdminItemText>12 new users registered today</AdminItemText>
              <AdminButton>{t('admin.viewNewUsers', 'View New Users')}</AdminButton>
            </AdminItem>

            <AdminItem>
              <AdminItemTitle>{t('admin.newMessages', 'New Messages')}</AdminItemTitle>
              <AdminItemText>23 new messages received today</AdminItemText>
              <AdminButton>{t('admin.viewNewMessages', 'View New Messages')}</AdminButton>
            </AdminItem>

            <AdminItem>
              <AdminItemTitle>{t('admin.systemStatus', 'System Status')}</AdminItemTitle>
              <AdminItemText>All systems operational</AdminItemText>
              <AdminButton>{t('admin.viewSystemStatus', 'View System Status')}</AdminButton>
            </AdminItem>
          </AdminGrid>
        </AdminCard>

        <AdminCard>
          <AdminTitle>{t('admin.analytics', 'Analytics')}</AdminTitle>
          <AdminGrid>
            <AdminItem>
              <AdminItemTitle>{t('admin.pageViews', 'Page Views')}</AdminItemTitle>
              <AdminItemText>45,678 page views today</AdminItemText>
              <AdminProgress value={75} max={100} />
              <AdminItemText>75% increase from yesterday</AdminItemText>
            </AdminItem>

            <AdminItem>
              <AdminItemTitle>{t('admin.userEngagement', 'User Engagement')}</AdminItemTitle>
              <AdminItemText>Average session duration: 8 minutes</AdminItemText>
              <AdminProgress value={60} max={100} />
              <AdminItemText>60% engagement rate</AdminItemText>
            </AdminItem>

            <AdminItem>
              <AdminItemTitle>{t('admin.conversionRate', 'Conversion Rate')}</AdminItemTitle>
              <AdminItemText>3.2% conversion rate</AdminItemText>
              <AdminProgress value={32} max={100} />
              <AdminItemText>32% of visitors convert</AdminItemText>
            </AdminItem>

            <AdminItem>
              <AdminItemTitle>{t('admin.bounceRate', 'Bounce Rate')}</AdminItemTitle>
              <AdminItemText>25% bounce rate</AdminItemText>
              <AdminProgress value={25} max={100} />
              <AdminItemText>25% of visitors leave immediately</AdminItemText>
            </AdminItem>
          </AdminGrid>
        </AdminCard>

        <AdminCard>
          <AdminTitle>{t('admin.settings', 'Settings')}</AdminTitle>
          <AdminGrid>
            <AdminItem>
              <AdminItemTitle>{t('admin.generalSettings', 'General Settings')}</AdminItemTitle>
              <AdminInput
                type="text"
                placeholder={t('admin.siteName', 'Site Name')}
                defaultValue="Bulgarian Car Marketplace"
              />
              <AdminInput
                type="text"
                placeholder={t('admin.siteDescription', 'Site Description')}
                defaultValue="The best place to buy and sell cars in Bulgaria"
              />
              <AdminButton>{t('admin.saveSettings', 'Save Settings')}</AdminButton>
            </AdminItem>

            <AdminItem>
              <AdminItemTitle>{t('admin.notificationSettings', 'Notification Settings')}</AdminItemTitle>
              <AdminCheckboxLabel>
                <AdminCheckbox type="checkbox" defaultChecked />
                {t('admin.emailNotifications', 'Email Notifications')}
              </AdminCheckboxLabel>
              <AdminCheckboxLabel>
                <AdminCheckbox type="checkbox" defaultChecked />
                {t('admin.smsNotifications', 'SMS Notifications')}
              </AdminCheckboxLabel>
              <AdminCheckboxLabel>
                <AdminCheckbox type="checkbox" defaultChecked />
                {t('admin.pushNotifications', 'Push Notifications')}
              </AdminCheckboxLabel>
            </AdminItem>

            <AdminItem>
              <AdminItemTitle>{t('admin.securitySettings', 'Security Settings')}</AdminItemTitle>
              <AdminInput
                type="password"
                placeholder={t('admin.currentPassword', 'Current Password')}
              />
              <AdminInput
                type="password"
                placeholder={t('admin.newPassword', 'New Password')}
              />
              <AdminInput
                type="password"
                placeholder={t('admin.confirmPassword', 'Confirm Password')}
              />
              <AdminButton>{t('admin.updatePassword', 'Update Password')}</AdminButton>
            </AdminItem>

            <AdminItem>
              <AdminItemTitle>{t('admin.help', 'Help & Support')}</AdminItemTitle>
              <AdminItemText>
                Need help with your admin dashboard? Contact our support team.
              </AdminItemText>
              <AdminButton>{t('admin.contactSupport', 'Contact Support')}</AdminButton>
            </AdminItem>
          </AdminGrid>
        </AdminCard>
      </PageContainer>
    </AdminContainer>
  );
};

export default AdminDashboard;
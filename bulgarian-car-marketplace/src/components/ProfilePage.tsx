import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

const ProfileContainer = styled.div`
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

const ProfileCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ProfileTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ProfileItem = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const ProfileItemTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const ProfileItemText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  line-height: 1.5;
`;

const ProfileButton = styled.button`
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

const ProfileInput = styled.input`
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

const ProfileSelect = styled.select`
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

const ProfileTextArea = styled.textarea`
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

const ProfileCheckbox = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const ProfileCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ProfileRadio = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const ProfileRadioLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ProfileProgress = styled.progress`
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

const ProfileAlert = styled.div<{ type: 'success' | 'warning' | 'error' | 'info' }>`
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

const ProfileBadge = styled.span<{ variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' }>`
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

const ProfileTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProfileTableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  background: ${({ theme }) => theme.colors.grey[100]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[300]};
`;

const ProfileTableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ProfileContainer>
      <PageContainer>
        <PageTitle>{t('profile.title', 'Profile Page')}</PageTitle>

        <ProfileCard>
          <ProfileTitle>{t('profile.overview', 'Overview')}</ProfileTitle>
          <ProfileGrid>
            <ProfileItem>
              <ProfileItemTitle>{t('profile.personalInfo', 'Personal Information')}</ProfileItemTitle>
              <ProfileItemText>Name, email, phone, and other personal details</ProfileItemText>
              <ProfileButton>{t('profile.editPersonalInfo', 'Edit Personal Info')}</ProfileButton>
            </ProfileItem>

            <ProfileItem>
              <ProfileItemTitle>{t('profile.accountSettings', 'Account Settings')}</ProfileItemTitle>
              <ProfileItemText>Password, security, and privacy settings</ProfileItemText>
              <ProfileButton>{t('profile.editAccountSettings', 'Edit Account Settings')}</ProfileButton>
            </ProfileItem>

            <ProfileItem>
              <ProfileItemTitle>{t('profile.preferences', 'Preferences')}</ProfileItemTitle>
              <ProfileItemText>Language, notifications, and display preferences</ProfileItemText>
              <ProfileButton>{t('profile.editPreferences', 'Edit Preferences')}</ProfileButton>
            </ProfileItem>

            <ProfileItem>
              <ProfileItemTitle>{t('profile.activity', 'Activity')}</ProfileItemTitle>
              <ProfileItemText>Recent activity and account history</ProfileItemText>
              <ProfileButton>{t('profile.viewActivity', 'View Activity')}</ProfileButton>
            </ProfileItem>
          </ProfileGrid>
        </ProfileCard>

        <ProfileCard>
          <ProfileTitle>{t('profile.personalInfo', 'Personal Information')}</ProfileTitle>
          <ProfileGrid>
            <ProfileItem>
              <ProfileItemTitle>{t('profile.basicInfo', 'Basic Information')}</ProfileItemTitle>
              <ProfileInput
                type="text"
                placeholder={t('profile.firstName', 'First Name')}
                defaultValue="John"
              />
              <ProfileInput
                type="text"
                placeholder={t('profile.lastName', 'Last Name')}
                defaultValue="Doe"
              />
              <ProfileInput
                type="email"
                placeholder={t('profile.email', 'Email')}
                defaultValue="john.doe@example.com"
              />
              <ProfileButton>{t('profile.saveBasicInfo', 'Save Basic Info')}</ProfileButton>
            </ProfileItem>

            <ProfileItem>
              <ProfileItemTitle>{t('profile.contactInfo', 'Contact Information')}</ProfileItemTitle>
              <ProfileInput
                type="tel"
                placeholder={t('profile.phone', 'Phone')}
                defaultValue="+359 123 456 789"
              />
              <ProfileInput
                type="text"
                placeholder={t('profile.address', 'Address')}
                defaultValue="Sofia, Bulgaria"
              />
              <ProfileInput
                type="text"
                placeholder={t('profile.city', 'City')}
                defaultValue="Sofia"
              />
              <ProfileButton>{t('profile.saveContactInfo', 'Save Contact Info')}</ProfileButton>
            </ProfileItem>

            <ProfileItem>
              <ProfileItemTitle>{t('profile.profilePicture', 'Profile Picture')}</ProfileItemTitle>
              <ProfileItemText>Upload and manage your profile picture</ProfileItemText>
              <ProfileButton>{t('profile.uploadPicture', 'Upload Picture')}</ProfileButton>
            </ProfileItem>

            <ProfileItem>
              <ProfileItemTitle>{t('profile.bio', 'Bio')}</ProfileItemTitle>
              <ProfileTextArea
                placeholder={t('profile.writeBio', 'Write a short bio about yourself')}
                defaultValue="Car enthusiast and marketplace user"
              />
              <ProfileButton>{t('profile.saveBio', 'Save Bio')}</ProfileButton>
            </ProfileItem>
          </ProfileGrid>
        </ProfileCard>

        <ProfileCard>
          <ProfileTitle>{t('profile.accountSettings', 'Account Settings')}</ProfileTitle>
          <ProfileGrid>
            <ProfileItem>
              <ProfileItemTitle>{t('profile.changePassword', 'Change Password')}</ProfileItemTitle>
              <ProfileInput
                type="password"
                placeholder={t('profile.currentPassword', 'Current Password')}
              />
              <ProfileInput
                type="password"
                placeholder={t('profile.newPassword', 'New Password')}
              />
              <ProfileInput
                type="password"
                placeholder={t('profile.confirmPassword', 'Confirm Password')}
              />
              <ProfileButton>{t('profile.updatePassword', 'Update Password')}</ProfileButton>
            </ProfileItem>

            <ProfileItem>
              <ProfileItemTitle>{t('profile.securitySettings', 'Security Settings')}</ProfileItemTitle>
              <ProfileCheckboxLabel>
                <ProfileCheckbox type="checkbox" defaultChecked />
                {t('profile.twoFactorAuth', 'Two-Factor Authentication')}
              </ProfileCheckboxLabel>
              <ProfileCheckboxLabel>
                <ProfileCheckbox type="checkbox" defaultChecked />
                {t('profile.loginAlerts', 'Login Alerts')}
              </ProfileCheckboxLabel>
              <ProfileCheckboxLabel>
                <ProfileCheckbox type="checkbox" defaultChecked />
                {t('profile.securityQuestions', 'Security Questions')}
              </ProfileCheckboxLabel>
            </ProfileItem>

            <ProfileItem>
              <ProfileItemTitle>{t('profile.privacySettings', 'Privacy Settings')}</ProfileItemTitle>
              <ProfileCheckboxLabel>
                <ProfileCheckbox type="checkbox" defaultChecked />
                {t('profile.profileVisibility', 'Profile Visibility')}
              </ProfileCheckboxLabel>
              <ProfileCheckboxLabel>
                <ProfileCheckbox type="checkbox" defaultChecked />
                {t('profile.contactVisibility', 'Contact Information Visibility')}
              </ProfileCheckboxLabel>
              <ProfileCheckboxLabel>
                <ProfileCheckbox type="checkbox" defaultChecked />
                {t('profile.activityVisibility', 'Activity Visibility')}
              </ProfileCheckboxLabel>
            </ProfileItem>

            <ProfileItem>
              <ProfileItemTitle>{t('profile.dataManagement', 'Data Management')}</ProfileItemTitle>
              <ProfileItemText>Download or delete your account data</ProfileItemText>
              <ProfileButton>{t('profile.downloadData', 'Download Data')}</ProfileButton>
              <ProfileButton>{t('profile.deleteAccount', 'Delete Account')}</ProfileButton>
            </ProfileItem>
          </ProfileGrid>
        </ProfileCard>

        <ProfileCard>
          <ProfileTitle>{t('profile.preferences', 'Preferences')}</ProfileTitle>
          <ProfileGrid>
            <ProfileItem>
              <ProfileItemTitle>{t('profile.language', 'Language')}</ProfileItemTitle>
              <ProfileSelect defaultValue="bg">
                <option value="bg">Български</option>
                <option value="en">English</option>
              </ProfileSelect>
              <ProfileButton>{t('profile.saveLanguage', 'Save Language')}</ProfileButton>
            </ProfileItem>

            <ProfileItem>
              <ProfileItemTitle>{t('profile.notifications', 'Notifications')}</ProfileItemTitle>
              <ProfileCheckboxLabel>
                <ProfileCheckbox type="checkbox" defaultChecked />
                {t('profile.emailNotifications', 'Email Notifications')}
              </ProfileCheckboxLabel>
              <ProfileCheckboxLabel>
                <ProfileCheckbox type="checkbox" defaultChecked />
                {t('profile.smsNotifications', 'SMS Notifications')}
              </ProfileCheckboxLabel>
              <ProfileCheckboxLabel>
                <ProfileCheckbox type="checkbox" defaultChecked />
                {t('profile.pushNotifications', 'Push Notifications')}
              </ProfileCheckboxLabel>
            </ProfileItem>

            <ProfileItem>
              <ProfileItemTitle>{t('profile.displaySettings', 'Display Settings')}</ProfileItemTitle>
              <ProfileCheckboxLabel>
                <ProfileCheckbox type="checkbox" defaultChecked />
                {t('profile.darkMode', 'Dark Mode')}
              </ProfileCheckboxLabel>
              <ProfileCheckboxLabel>
                <ProfileCheckbox type="checkbox" defaultChecked />
                {t('profile.compactView', 'Compact View')}
              </ProfileCheckboxLabel>
              <ProfileCheckboxLabel>
                <ProfileCheckbox type="checkbox" defaultChecked />
                {t('profile.accessibility', 'Accessibility Features')}
              </ProfileCheckboxLabel>
            </ProfileItem>

            <ProfileItem>
              <ProfileItemTitle>{t('profile.help', 'Help & Support')}</ProfileItemTitle>
              <ProfileItemText>
                Need help with your profile? Contact our support team.
              </ProfileItemText>
              <ProfileButton>{t('profile.contactSupport', 'Contact Support')}</ProfileButton>
            </ProfileItem>
          </ProfileGrid>
        </ProfileCard>
      </PageContainer>
    </ProfileContainer>
  );
};

export default ProfilePage;
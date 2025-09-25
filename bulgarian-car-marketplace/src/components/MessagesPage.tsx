import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

const MessagesContainer = styled.div`
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

const MessagesCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const MessagesTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const MessagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const MessageItem = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const MessageTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const MessageText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  line-height: 1.5;
`;

const MessageButton = styled.button`
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

const MessageInput = styled.input`
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

const MessageSelect = styled.select`
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

const MessageTextArea = styled.textarea`
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

const MessageCheckbox = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const MessageCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MessageRadio = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const MessageRadioLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MessageProgress = styled.progress`
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

const MessageAlert = styled.div<{ type: 'success' | 'warning' | 'error' | 'info' }>`
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

const MessageBadge = styled.span<{ variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' }>`
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

const MessageTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const MessageTableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  background: ${({ theme }) => theme.colors.grey[100]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[300]};
`;

const MessageTableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MessagesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MessagesContainer>
      <PageContainer>
        <PageTitle>{t('messages.title', 'Messages Page')}</PageTitle>

        <MessagesCard>
          <MessagesTitle>{t('messages.inbox', 'Inbox')}</MessagesTitle>
          <MessagesGrid>
            <MessageItem>
              <MessageTitle>{t('messages.newMessage', 'New Message')}</MessageTitle>
              <MessageText>
                You have received a new message from John Doe about your car listing.
              </MessageText>
              <MessageButton>{t('messages.readMessage', 'Read Message')}</MessageButton>
            </MessageItem>

            <MessageItem>
              <MessageTitle>{t('messages.messageUpdate', 'Message Update')}</MessageTitle>
              <MessageText>
                Your message to Jane Smith has been updated with new information.
              </MessageText>
              <MessageButton>{t('messages.viewUpdate', 'View Update')}</MessageButton>
            </MessageItem>

            <MessageItem>
              <MessageTitle>{t('messages.systemMessage', 'System Message')}</MessageTitle>
              <MessageText>
                System maintenance is scheduled for tonight from 2:00 AM to 4:00 AM.
              </MessageText>
              <MessageButton>{t('messages.viewDetails', 'View Details')}</MessageButton>
            </MessageItem>
          </MessagesGrid>
        </MessagesCard>

        <MessagesCard>
          <MessagesTitle>{t('messages.compose', 'Compose Message')}</MessagesTitle>
          <MessagesGrid>
            <MessageItem>
              <MessageTitle>{t('messages.newMessage', 'New Message')}</MessageTitle>
              <MessageInput
                type="text"
                placeholder={t('messages.recipient', 'Recipient')}
              />
              <MessageInput
                type="text"
                placeholder={t('messages.subject', 'Subject')}
              />
              <MessageTextArea
                placeholder={t('messages.messageBody', 'Message Body')}
              />
              <MessageButton>{t('messages.sendMessage', 'Send Message')}</MessageButton>
            </MessageItem>

            <MessageItem>
              <MessageTitle>{t('messages.messageSettings', 'Message Settings')}</MessageTitle>
              <MessageCheckboxLabel>
                <MessageCheckbox type="checkbox" />
                {t('messages.emailNotifications', 'Email Notifications')}
              </MessageCheckboxLabel>
              <MessageCheckboxLabel>
                <MessageCheckbox type="checkbox" />
                {t('messages.smsNotifications', 'SMS Notifications')}
              </MessageCheckboxLabel>
              <MessageCheckboxLabel>
                <MessageCheckbox type="checkbox" />
                {t('messages.pushNotifications', 'Push Notifications')}
              </MessageCheckboxLabel>
            </MessageItem>

            <MessageItem>
              <MessageTitle>{t('messages.messageTemplates', 'Message Templates')}</MessageTitle>
              <MessageSelect>
                <option>{t('messages.selectTemplate', 'Select Template')}</option>
                <option>{t('messages.template1', 'Template 1')}</option>
                <option>{t('messages.template2', 'Template 2')}</option>
                <option>{t('messages.template3', 'Template 3')}</option>
              </MessageSelect>
              <MessageButton>{t('messages.useTemplate', 'Use Template')}</MessageButton>
            </MessageItem>

            <MessageItem>
              <MessageTitle>{t('messages.messageHistory', 'Message History')}</MessageTitle>
              <MessageTable>
                <thead>
                  <tr>
                    <MessageTableHeader>{t('messages.recipient', 'Recipient')}</MessageTableHeader>
                    <MessageTableHeader>{t('messages.subject', 'Subject')}</MessageTableHeader>
                    <MessageTableHeader>{t('messages.timestamp', 'Timestamp')}</MessageTableHeader>
                    <MessageTableHeader>{t('messages.status', 'Status')}</MessageTableHeader>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <MessageTableCell>John Doe</MessageTableCell>
                    <MessageTableCell>Car Inquiry</MessageTableCell>
                    <MessageTableCell>2024-01-15 10:30</MessageTableCell>
                    <MessageTableCell>
                      <MessageBadge variant="success">Sent</MessageBadge>
                    </MessageTableCell>
                  </tr>
                  <tr>
                    <MessageTableCell>Jane Smith</MessageTableCell>
                    <MessageTableCell>Price Negotiation</MessageTableCell>
                    <MessageTableCell>2024-01-15 10:25</MessageTableCell>
                    <MessageTableCell>
                      <MessageBadge variant="warning">Pending</MessageBadge>
                    </MessageTableCell>
                  </tr>
                  <tr>
                    <MessageTableCell>Bob Johnson</MessageTableCell>
                    <MessageTableCell>Meeting Request</MessageTableCell>
                    <MessageTableCell>2024-01-15 10:20</MessageTableCell>
                    <MessageTableCell>
                      <MessageBadge variant="error">Failed</MessageBadge>
                    </MessageTableCell>
                  </tr>
                </tbody>
              </MessageTable>
            </MessageItem>
          </MessagesGrid>
        </MessagesCard>

        <MessagesCard>
          <MessagesTitle>{t('messages.notifications', 'Notifications')}</MessagesTitle>
          <MessagesGrid>
            <MessageItem>
              <MessageTitle>{t('messages.systemNotifications', 'System Notifications')}</MessageTitle>
              <MessageAlert type="success">
                {t('messages.messageSent', 'Your message has been sent successfully')}
              </MessageAlert>
              <MessageAlert type="warning">
                {t('messages.messagePending', 'Your message is pending delivery')}
              </MessageAlert>
              <MessageAlert type="error">
                {t('messages.messageFailed', 'Failed to send message')}
              </MessageAlert>
              <MessageAlert type="info">
                {t('messages.newFeature', 'New messaging feature available')}
              </MessageAlert>
            </MessageItem>

            <MessageItem>
              <MessageTitle>{t('messages.messageStatistics', 'Message Statistics')}</MessageTitle>
              <MessageText>Total Messages Sent: 1,234</MessageText>
              <MessageProgress value={75} max={100} />
              <MessageText>Message Delivery Rate: 75%</MessageText>
              <MessageText>Average Response Time: 2 hours</MessageText>
              <MessageText>Unread Messages: 5</MessageText>
            </MessageItem>

            <MessageItem>
              <MessageTitle>{t('messages.messagePreferences', 'Message Preferences')}</MessageTitle>
              <MessageCheckboxLabel>
                <MessageCheckbox type="checkbox" />
                {t('messages.autoReply', 'Auto Reply')}
              </MessageCheckboxLabel>
              <MessageCheckboxLabel>
                <MessageCheckbox type="checkbox" />
                {t('messages.messageFiltering', 'Message Filtering')}
              </MessageCheckboxLabel>
              <MessageCheckboxLabel>
                <MessageCheckbox type="checkbox" />
                {t('messages.messageArchiving', 'Message Archiving')}
              </MessageCheckboxLabel>
            </MessageItem>

            <MessageItem>
              <MessageTitle>{t('messages.help', 'Help & Support')}</MessageTitle>
              <MessageText>
                Need help with messaging? Contact our support team.
              </MessageText>
              <MessageButton>{t('messages.contactSupport', 'Contact Support')}</MessageButton>
            </MessageItem>
          </MessagesGrid>
        </MessagesCard>
      </PageContainer>
    </MessagesContainer>
  );
};

export default MessagesPage;


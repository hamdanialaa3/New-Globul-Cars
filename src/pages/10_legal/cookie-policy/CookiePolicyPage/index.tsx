// src/pages/CookiePolicyPage.tsx
// Cookie Policy Page for Koli One

import React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../../../hooks/useTranslation';
import { 
  Cookie,
  Shield,
  Settings,
  BarChart3,
  User,
  Lock,
  Eye,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';

// Styled Components
const CookieContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Header = styled.section`
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  border-radius: 24px;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  p {
    font-size: 1.1rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const ContentSection = styled.section`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;

  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #1e40af;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  h3 {
    font-size: 1.4rem;
    font-weight: 600;
    color: #374151;
    margin: 2rem 0 1rem 0;
  }

  p {
    font-size: 1rem;
    line-height: 1.8;
    color: #64748b;
    margin-bottom: 1.5rem;
  }

  ul, ol {
    margin: 1rem 0;
    padding-left: 2rem;
    
    li {
      font-size: 1rem;
      line-height: 1.8;
      color: #64748b;
      margin-bottom: 0.5rem;
    }
  }
`;

const CookieType = styled.div`
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1.5rem 0;
  border-left: 4px solid #3b82f6;

  h4 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1e40af;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    margin-bottom: 0.75rem;
  }

  .example {
    background: white;
    padding: 0.75rem;
    border-radius: 8px;
    font-family: monospace;
    font-size: 0.9rem;
    color: #374151;
    border: 1px solid #e2e8f0;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }

  th {
    background: #f8fafc;
    font-weight: 600;
    color: #1e40af;
  }

  td {
    color: #64748b;
  }
`;

const ContactInfo = styled.div`
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  padding: 2rem;
  border-radius: 20px;
  text-align: center;

  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #1e40af;
    margin-bottom: 1rem;
  }

  p {
    color: #64748b;
    margin-bottom: 1.5rem;
  }

  .contact-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .contact-item {
    background: white;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

    .icon {
      width: 40px;
      height: 40px;
      background: #3b82f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 0.75rem;
      color: white;
    }

    h4 {
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 0.25rem;
    }

    p {
      color: #64748b;
      margin: 0;
      font-size: 0.9rem;
    }
  }
`;

const CookiePolicyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <CookieContainer>
      <Container>
        <Header>
          <h1>
            <Cookie size={40} />
            {t('cookiePolicy.title', 'Cookie Policy')}
          </h1>
          <p>
            {t('cookiePolicy.subtitle', 'Learn about how we use cookies and similar technologies on our website.')}
          </p>
        </Header>

        <ContentSection>
          <h2>
            <Shield size={24} />
            {t('cookiePolicy.whatAreCookies.title', 'What Are Cookies?')}
          </h2>
          <p>
            {t('cookiePolicy.whatAreCookies.text', 'Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our site.')}
          </p>
        </ContentSection>

        <ContentSection>
          <h2>
            <Settings size={24} />
            {t('cookiePolicy.types.title', 'Types of Cookies We Use')}
          </h2>
          
          <CookieType>
            <h4>
              <Lock size={20} />
              {t('cookiePolicy.types.essential.title', 'Essential Cookies')}
            </h4>
            <p>
              {t('cookiePolicy.types.essential.description', 'These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and remembering your login status.')}
            </p>
            <p>
              <strong>{t('cookiePolicy.types.essential.retention', 'Retention:')}</strong> {t('cookiePolicy.types.essential.retentionText', 'Session or up to 1 year')}
            </p>
            <div className="example">
              {t('cookiePolicy.types.essential.example', 'Example: auth_token, session_id')}
            </div>
          </CookieType>

          <CookieType>
            <h4>
              <BarChart3 size={20} />
              {t('cookiePolicy.types.analytics.title', 'Analytics Cookies')}
            </h4>
            <p>
              {t('cookiePolicy.types.analytics.description', 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.')}
            </p>
            <p>
              <strong>{t('cookiePolicy.types.analytics.retention', 'Retention:')}</strong> {t('cookiePolicy.types.analytics.retentionText', 'Up to 2 years')}
            </p>
            <div className="example">
              {t('cookiePolicy.types.analytics.example', 'Example: _ga, _gid, _gat')}
            </div>
          </CookieType>

          <CookieType>
            <h4>
              <User size={20} />
              {t('cookiePolicy.types.preferences.title', 'Preference Cookies')}
            </h4>
            <p>
              {t('cookiePolicy.types.preferences.description', 'These cookies remember your choices and preferences to provide you with a personalized experience.')}
            </p>
            <p>
              <strong>{t('cookiePolicy.types.preferences.retention', 'Retention:')}</strong> {t('cookiePolicy.types.preferences.retentionText', 'Up to 1 year')}
            </p>
            <div className="example">
              {t('cookiePolicy.types.preferences.example', 'Example: language_preference, theme_setting')}
            </div>
          </CookieType>

          <CookieType>
            <h4>
              <Eye size={20} />
              {t('cookiePolicy.types.marketing.title', 'Marketing Cookies')}
            </h4>
            <p>
              {t('cookiePolicy.types.marketing.description', 'These cookies are used to track visitors across websites to display relevant advertisements.')}
            </p>
            <p>
              <strong>{t('cookiePolicy.types.marketing.retention', 'Retention:')}</strong> {t('cookiePolicy.types.marketing.retentionText', 'Up to 1 year')}
            </p>
            <div className="example">
              {t('cookiePolicy.types.marketing.example', 'Example: _fbp, _fbc, ads_id')}
            </div>
          </CookieType>
        </ContentSection>

        <ContentSection>
          <h2>
            <Settings size={24} />
            {t('cookiePolicy.management.title', 'Managing Your Cookie Preferences')}
          </h2>
          <p>
            {t('cookiePolicy.management.text', 'You can control and manage cookies in several ways:')}
          </p>
          <ol>
            <li>
              <strong>{t('cookiePolicy.management.browser.title', 'Browser Settings:')}</strong> {t('cookiePolicy.management.browser.text', 'Most browsers allow you to refuse or delete cookies through their settings.')}
            </li>
            <li>
              <strong>{t('cookiePolicy.management.optOut.title', 'Opt-out Tools:')}</strong> {t('cookiePolicy.management.optOut.text', 'Use industry opt-out tools for advertising cookies.')}
            </li>
            <li>
              <strong>{t('cookiePolicy.management.ourSettings.title', 'Our Cookie Settings:')}</strong> {t('cookiePolicy.management.ourSettings.text', 'Use our cookie preference center to manage your choices.')}
            </li>
          </ol>
        </ContentSection>

        <ContentSection>
          <h2>
            <BarChart3 size={24} />
            {t('cookiePolicy.thirdParty.title', 'Third-Party Cookies')}
          </h2>
          <p>
            {t('cookiePolicy.thirdParty.text', 'We may use third-party services that set their own cookies. Here are the main third-party cookies we use:')}
          </p>
          
          <Table>
            <thead>
              <tr>
                <th>{t('cookiePolicy.table.service', 'Service')}</th>
                <th>{t('cookiePolicy.table.purpose', 'Purpose')}</th>
                <th>{t('cookiePolicy.table.retention', 'Retention')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Google Analytics</td>
                <td>{t('cookiePolicy.table.googleAnalytics', 'Website analytics and performance')}</td>
                <td>2 years</td>
              </tr>
              <tr>
                <td>Facebook Pixel</td>
                <td>{t('cookiePolicy.table.facebookPixel', 'Advertising and conversion tracking')}</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>Firebase</td>
                <td>{t('cookiePolicy.table.firebase', 'Authentication and app functionality')}</td>
                <td>Session</td>
              </tr>
            </tbody>
          </Table>
        </ContentSection>

        <ContentSection>
          <h2>
            <Trash2 size={24} />
            {t('cookiePolicy.deletion.title', 'Cookie Deletion')}
          </h2>
          <p>
            {t('cookiePolicy.deletion.text', 'You can delete cookies at any time through your browser settings. However, please note that deleting cookies may affect the functionality of our website.')}
          </p>
          <p>
            <strong>{t('cookiePolicy.deletion.note', 'Note:')}</strong> {t('cookiePolicy.deletion.noteText', 'Some cookies are essential for the website to function properly and cannot be disabled.')}
          </p>
        </ContentSection>

        <ContentSection>
          <h2>
            <Shield size={24} />
            {t('cookiePolicy.updates.title', 'Updates to This Policy')}
          </h2>
          <p>
            {t('cookiePolicy.updates.text', 'We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.')}
          </p>
          <p>
            <strong>{t('cookiePolicy.updates.lastUpdated', 'Last Updated:')}</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </ContentSection>

        <ContactInfo>
          <h2>{t('cookiePolicy.contact.title', 'Questions About Cookies?')}</h2>
          <p>
            {t('cookiePolicy.contact.subtitle', 'If you have any questions about our use of cookies, please contact us.')}
          </p>
          
          <div className="contact-details">
            <div className="contact-item">
              <div className="icon">
                <Mail size={20} />
              </div>
              <h4>{t('cookiePolicy.contact.email', 'Email')}</h4>
              <p>privacy@globulcars.bg</p>
            </div>
            <div className="contact-item">
              <div className="icon">
                <Phone size={20} />
              </div>
              <h4>{t('cookiePolicy.contact.phone', 'Phone')}</h4>
              <p>+359 2 123 4567</p>
            </div>
            <div className="contact-item">
              <div className="icon">
                <Settings size={20} />
              </div>
              <h4>{t('cookiePolicy.contact.settings', 'Cookie Settings')}</h4>
              <p>{t('cookiePolicy.contact.settingsText', 'Manage your preferences')}</p>
            </div>
          </div>
        </ContactInfo>
      </Container>
    </CookieContainer>
  );
};

export default CookiePolicyPage;


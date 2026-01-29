/**
 * Privacy Policy Page
 * GDPR compliant privacy policy
 * 
 * @author CTO
 * @version 1.0
 * @since January 9, 2026
 */

import React from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import { useLanguage } from '../contexts/LanguageContext';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1a1a2e' : (theme.colors.background.default || theme.colors?.background?.default || '#ffffff')};
  color: ${({ theme }) => theme.mode === 'dark' ? '#e5e7eb' : '#1f2937'};
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid ${({ theme }) => theme.mode === 'dark' ? '#374151' : (theme.colors.border.default || theme.colors?.border || '#e2e8f0')};
`;

const Title = styled.h1`
  font-size: 32px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f9fafb' : (theme.text?.primary || '#1f2937')};
  margin: 0 0 10px 0;
`;

const UpdatedDate = styled.p`
  color: ${({ theme }) => theme.mode === 'dark' ? '#9ca3af' : (theme.text?.secondary || '#6b7280')};
  font-size: 14px;
  margin: 0;
`;

const Section = styled.section`
  margin-bottom: 40px;

  h2 {
    font-size: 20px;
    color: ${({ theme }) => theme.mode === 'dark' ? '#f9fafb' : (theme.text?.primary || '#1f2937')};
    margin-bottom: 12px;
  }

  h3 {
    font-size: 16px;
    color: ${({ theme }) => theme.mode === 'dark' ? '#f3f4f6' : (theme.text?.primary || '#1f2937')};
    margin: 16px 0 8px 0;
  }

  p {
    color: ${({ theme }) => theme.mode === 'dark' ? '#d1d5db' : (theme.text?.secondary || '#6b7280')};
    line-height: 1.6;
    margin-bottom: 12px;
  }

  ul {
    color: ${({ theme }) => theme.mode === 'dark' ? '#d1d5db' : (theme.text?.secondary || '#6b7280')};
    line-height: 1.8;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }
`;

const HighlightBox = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : (theme.colors.background.light || theme.colors?.background?.light || '#f8f9fa')};
  border-left: 4px solid ${props => props.theme.colors.primary.main || props.theme.colors?.primary?.main || '#3b82f6'};
  padding: 16px;
  margin: 20px 0;
  border-radius: 4px;
`;

const TableofContents = styled.nav`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(30, 64, 175, 0.1)' : (theme.colors.background.light || theme.colors?.background?.light || '#f8f9fa')};
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 40px;

  h2 {
    margin-top: 0;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: 8px;
  }

  a {
    color: ${({ theme }) => theme.mode === 'dark' ? '#60a5fa' : (theme.colors.primary.main || theme.colors?.primary?.main || '#3b82f6')};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ContactInfo = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(30, 64, 175, 0.1)' : (theme.colors.background.light || theme.colors?.background?.light || '#f8f9fa')};
  padding: 20px;
  border-radius: 8px;
  margin-top: 40px;

  h3 {
    margin-top: 0;
  }

  p {
    margin-bottom: 8px;
  }
`;

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - New Globul Cars</title>
        <meta
          name="description"
          content="Read our Privacy Policy to understand how we collect, use, and protect your personal data"
        />
      </Helmet>

      <Container>
        <Header>
          <Title>Privacy Policy</Title>
          <UpdatedDate>Last updated: January 9, 2026 | GDPR Compliant</UpdatedDate>
        </Header>

        <HighlightBox>
          <strong>Your privacy is important to us.</strong> This Privacy Policy explains how New Globul Cars
          collects, uses, discloses, and safeguards your information when you use our website and mobile application.
        </HighlightBox>

        <TableofContents>
          <h2>Table of Contents</h2>
          <ul>
            <li><a href="#information-we-collect">1. Information We Collect</a></li>
            <li><a href="#how-we-use">2. How We Use Your Information</a></li>
            <li><a href="#legal-basis">3. Legal Basis for Processing</a></li>
            <li><a href="#data-sharing">4. Data Sharing</a></li>
            <li><a href="#data-retention">5. Data Retention</a></li>
            <li><a href="#your-rights">6. Your GDPR Rights</a></li>
            <li><a href="#security">7. Data Security</a></li>
            <li><a href="#cookies">8. Cookies and Tracking</a></li>
            <li><a href="#contact">9. Contact Us</a></li>
          </ul>
        </TableofContents>

        <Section id="information-we-collect">
          <h2>1. Information We Collect</h2>

          <h3>A. Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Name, email, phone number, profile picture, location</li>
            <li><strong>Payment Information:</strong> Bank transfer details for manual payments (IBAN, reference numbers - processed securely via Revolut/iCard)</li>
            <li><strong>Verification Documents:</strong> ID, proof of address, business registration (for dealers)</li>
            <li><strong>Listing Information:</strong> Car details, photos, pricing, descriptions</li>
            <li><strong>Communication:</strong> Messages, reviews, support requests</li>
          </ul>

          <h3>B. Information Automatically Collected</h3>
          <ul>
            <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent, clicks, searches, interactions</li>
            <li><strong>Location Data:</strong> GPS coordinates (if permitted)</li>
            <li><strong>Cookies:</strong> Session data, preferences, analytics</li>
          </ul>

          <h3>C. Third-Party Information</h3>
          <p>
            We may receive information from third parties such as payment processors, authentication providers,
            and social media platforms (if you connect your account).
          </p>
        </Section>

        <Section id="how-we-use">
          <h2>2. How We Use Your Information</h2>
          <p>We use your information for:</p>
          <ul>
            <li>Providing and maintaining our platform</li>
            <li>Processing transactions and payments</li>
            <li>Sending transactional emails and notifications</li>
            <li>Verifying user identity and preventing fraud</li>
            <li>Improving user experience and platform features</li>
            <li>Responding to customer support requests</li>
            <li>Analyzing platform usage and trends</li>
            <li>Complying with legal obligations</li>
            <li>Enforcing Terms of Service and other agreements</li>
          </ul>
        </Section>

        <Section id="legal-basis">
          <h2>3. Legal Basis for Processing (GDPR)</h2>
          <p>We process your personal data based on:</p>
          <ul>
            <li><strong>Consent:</strong> With your explicit consent for marketing communications</li>
            <li><strong>Contract:</strong> To fulfill the service agreement between you and us</li>
            <li><strong>Legal Obligation:</strong> To comply with Bulgarian and EU laws</li>
            <li><strong>Legitimate Interest:</strong> To improve security, prevent fraud, and enhance services</li>
            <li><strong>Vital Interest:</strong> To protect health and safety in emergency situations</li>
          </ul>
        </Section>

        <Section id="data-sharing">
          <h2>4. Data Sharing</h2>
          <h3>We share your data with:</h3>
          <ul>
            <li><strong>Service Providers:</strong> Revolut & iCard (manual bank transfers), Firebase (hosting), Google (analytics)</li>
            <li><strong>Other Users:</strong> Profile information visible to other users per your privacy settings</li>
            <li><strong>Law Enforcement:</strong> When required by law or court order</li>
            <li><strong>Business Partners:</strong> Only with your explicit consent</li>
          </ul>

          <h3>We Do NOT:</h3>
          <ul>
            <li>Sell your personal data to third parties</li>
            <li>Share bank transfer information (handled securely via Revolut/iCard)</li>
            <li>Share more than necessary to fulfill your requests</li>
          </ul>
        </Section>

        <Section id="data-retention">
          <h2>5. Data Retention</h2>
          <p>We retain personal data for:</p>
          <ul>
            <li><strong>Active Accounts:</strong> As long as you maintain your account</li>
            <li><strong>Deleted Accounts:</strong> 90 days for recovery purposes, then deleted</li>
            <li><strong>Transaction Records:</strong> 7 years (for tax and legal compliance)</li>
            <li><strong>Support Communications:</strong> 2 years unless longer retention is required</li>
            <li><strong>Analytics Data:</strong> 2 years in anonymized form</li>
          </ul>
        </Section>

        <Section id="your-rights">
          <h2>6. Your GDPR Rights</h2>
          <p>As a user in the EU/Bulgaria, you have the following rights:</p>

          <h3>Right of Access</h3>
          <p>You can request a copy of the personal data we hold about you.</p>

          <h3>Right to Rectification</h3>
          <p>You can request correction of inaccurate or incomplete data.</p>

          <h3>Right to Erasure ("Right to be Forgotten")</h3>
          <p>
            You can request deletion of your personal data, except where we have a legal obligation to retain it.
            We will process deletion requests within 30 days.
          </p>

          <h3>Right to Data Portability</h3>
          <p>You can request your data in a structured, machine-readable format.</p>

          <h3>Right to Object</h3>
          <p>You can object to specific processing activities, including marketing communications.</p>

          <h3>Right to Restrict Processing</h3>
          <p>You can request we limit how we use your data.</p>

          <h3>How to Exercise Your Rights</h3>
          <p>
            To exercise any of these rights, please contact our Data Protection Officer at privacy@newglobulcars.bg
            with proof of identity.
          </p>
        </Section>

        <Section id="security">
          <h2>7. Data Security</h2>
          <HighlightBox>
            We implement industry-standard security measures to protect your personal data.
          </HighlightBox>

          <h3>Security Measures Include:</h3>
          <ul>
            <li>End-to-end encryption for sensitive communications</li>
            <li>HTTPS/TLS for all data transmission</li>
            <li>Secure Firestore database with role-based access control</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Strict access controls and authentication</li>
            <li>Employee training on data protection</li>
          </ul>

          <h3>Data Breach Notification</h3>
          <p>
            In the event of a data breach, we will notify affected users within 72 hours as required by GDPR,
            unless the breach poses no risk to rights and freedoms.
          </p>
        </Section>

        <Section id="cookies">
          <h2>8. Cookies and Tracking</h2>
          <h3>We use cookies for:</h3>
          <ul>
            <li><strong>Essential:</strong> Session management, authentication, security</li>
            <li><strong>Functional:</strong> Remembering preferences, language selection</li>
            <li><strong>Analytics:</strong> Understanding user behavior (Google Analytics)</li>
            <li><strong>Marketing:</strong> Retargeting ads (with your consent)</li>
          </ul>

          <h3>Managing Cookies</h3>
          <p>
            You can manage cookie preferences in your browser settings. Note that disabling essential cookies
            may impact platform functionality.
          </p>
        </Section>

        <Section id="contact">
          <h2>9. Contact Us</h2>
          <p>For privacy-related questions or to exercise your rights:</p>
        </Section>

        <ContactInfo>
          <h3>Data Protection Officer</h3>
          <p>Email: privacy@newglobulcars.bg</p>
          <p>Address: Sofia, Bulgaria</p>
          <p>Phone: +359 2 XXXX XXXX</p>

          <h3>Response Time</h3>
          <p>We will respond to data subject access requests within 30 days of receipt.</p>

          <h3>Supervisory Authority</h3>
          <p>
            If you believe your rights have been violated, you have the right to lodge a complaint with the
            Bulgarian Commission for Personal Data Protection (CPDP).
          </p>
        </ContactInfo>
      </Container>
    </>
  );
};

export default PrivacyPolicyPage;

/**
 * Terms of Service Page
 * Legal terms and conditions for the platform
 * 
 * @author CTO
 * @version 1.0
 * @since January 9, 2026
 */

import React from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  background: ${props => props.theme.bg.default};
`;

const Header = styled.div`
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid ${props => props.theme.border};
`;

const Title = styled.h1`
  font-size: 32px;
  color: ${props => props.theme.text.primary};
  margin: 0 0 10px 0;
`;

const UpdatedDate = styled.p`
  color: ${props => props.theme.text.secondary};
  font-size: 14px;
  margin: 0;
`;

const Section = styled.section`
  margin-bottom: 40px;

  h2 {
    font-size: 20px;
    color: ${props => props.theme.text.primary};
    margin-bottom: 12px;
  }

  h3 {
    font-size: 16px;
    color: ${props => props.theme.text.primary};
    margin: 16px 0 8px 0;
  }

  p {
    color: ${props => props.theme.text.secondary};
    line-height: 1.6;
    margin-bottom: 12px;
  }

  ul {
    color: ${props => props.theme.text.secondary};
    line-height: 1.8;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }
`;

const HighlightBox = styled.div`
  background: ${props => props.theme.bg.light};
  border-left: 4px solid ${props => props.theme.primary};
  padding: 16px;
  margin: 20px 0;
  border-radius: 4px;
`;

const TableofContents = styled.nav`
  background: ${props => props.theme.bg.light};
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
    color: ${props => props.theme.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ContactInfo = styled.div`
  background: ${props => props.theme.bg.light};
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

export const TermsOfServicePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - New Globul Cars</title>
        <meta
          name="description"
          content="Read our Terms of Service to understand the rules and guidelines for using New Globul Cars"
        />
      </Helmet>

      <Container>
        <Header>
          <Title>Terms of Service</Title>
          <UpdatedDate>Last updated: January 9, 2026</UpdatedDate>
        </Header>

        <TableofContents>
          <h2>Table of Contents</h2>
          <ul>
            <li><a href="#acceptance">1. Acceptance of Terms</a></li>
            <li><a href="#use">2. Use License</a></li>
            <li><a href="#restrictions">3. Restrictions</a></li>
            <li><a href="#disclaimer">4. Disclaimer of Warranties</a></li>
            <li><a href="#limitation">5. Limitation of Liability</a></li>
            <li><a href="#disputes">6. Disputes and Resolution</a></li>
            <li><a href="#modifications">7. Modifications to Terms</a></li>
          </ul>
        </TableofContents>

        <Section id="acceptance">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using New Globul Cars, you accept and agree to be bound by the terms
            and provision of this agreement. If you do not agree to abide by the above, please do
            not use this service.
          </p>
        </Section>

        <Section id="use">
          <h2>2. Use License</h2>
          <p>
            New Globul Cars grants you a limited license to access and use the platform for lawful purposes.
            You agree not to:
          </p>
          <ul>
            <li>Harass or cause distress or inconvenience to any person</li>
            <li>Obscene or offensive language or comments</li>
            <li>Disrupt normal flow of dialogue within our website</li>
            <li>Post or transmit unlawful, fraudulent or deceptive information</li>
            <li>Use the platform for commercial purposes without authorization</li>
            <li>Attempt to access systems or networks connected to the platform</li>
          </ul>
        </Section>

        <Section id="restrictions">
          <h2>3. Restrictions</h2>
          <h3>User Conduct</h3>
          <p>
            Users must conduct themselves in a professional and respectful manner. Any behavior
            that violates these Terms will result in account suspension or termination.
          </p>

          <h3>Prohibited Content</h3>
          <p>You may not post, transmit, or distribute:</p>
          <ul>
            <li>Content that is illegal or promotes illegal activities</li>
            <li>Content that infringes on intellectual property rights</li>
            <li>Hateful, abusive, or discriminatory content</li>
            <li>Content containing malware or harmful code</li>
            <li>Spam or unsolicited promotional content</li>
          </ul>

          <h3>Account Responsibility</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials.
            You agree to accept responsibility for all activities that occur under your account.
          </p>
        </Section>

        <Section id="disclaimer">
          <h2>4. Disclaimer of Warranties</h2>
          <HighlightBox>
            <strong>This platform is provided "as is" without warranties of any kind.</strong>
          </HighlightBox>
          <p>
            New Globul Cars makes no representations or warranties, express or implied, regarding:
          </p>
          <ul>
            <li>The accuracy or completeness of any content on the platform</li>
            <li>The fitness of content for any particular purpose</li>
            <li>Uninterrupted or error-free access to the platform</li>
            <li>Freedom from viruses or harmful code</li>
          </ul>
        </Section>

        <Section id="limitation">
          <h2>5. Limitation of Liability</h2>
          <p>
            In no event shall New Globul Cars be liable for any damages (including, without limitation,
            damages for loss of data or profit, or due to business interruption) arising out of the use
            or inability to use the materials on this website.
          </p>
        </Section>

        <Section id="disputes">
          <h2>6. Disputes and Resolution</h2>
          <h3>Dispute Resolution Process</h3>
          <p>
            In case of a dispute between buyers and sellers, we will attempt to mediate and resolve
            the issue fairly. Our dispute resolution process includes:
          </p>
          <ul>
            <li>Initial contact and communication between parties</li>
            <li>Mediation by our support team (7-14 days)</li>
            <li>Evidence review and decision (14-30 days)</li>
            <li>Appeal process available if needed</li>
          </ul>

          <h3>Governing Law</h3>
          <p>
            These Terms are governed by the laws of Bulgaria. Any legal action or proceeding shall
            be brought exclusively in the courts of Bulgaria.
          </p>
        </Section>

        <Section id="modifications">
          <h2>7. Modifications to Terms</h2>
          <p>
            New Globul Cars reserves the right to modify these Terms at any time. We will notify
            users of significant changes via email. Your continued use of the platform after such
            modifications constitutes your acceptance of the updated Terms.
          </p>
        </Section>

        <ContactInfo>
          <h3>Questions About These Terms?</h3>
          <p>If you have any questions about our Terms of Service, please contact us:</p>
          <p>Email: legal@newglobulcars.bg</p>
          <p>Address: Sofia, Bulgaria</p>
          <p>Phone: +359 2 XXXX XXXX</p>
        </ContactInfo>
      </Container>
    </>
  );
};

export default TermsOfServicePage;

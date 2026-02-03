// src/pages/ContactPage.tsx
// Contact Page for Koli One - Redesigned with Obsidian & Peach Theme

import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { SOCIAL_LINKS } from '../../../../constants/socialLinks';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  User,
  CheckCircle,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter
} from 'lucide-react';

// Styled Components
const ContactContainer = styled.div<{ $isDark: boolean }>`
  min-height: 100vh;
  background: ${props => props.$isDark ? '#0F1419' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'};
  padding: 40px 0;
  transition: all 0.3s ease;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Header = styled.section<{ $isDark: boolean }>`
  text-align: center;
  padding: 64px 24px;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #1A1F2E 0%, #0F1419 100%)'
    : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'};
  color: white;
  border-radius: 24px;
  margin-bottom: 48px;
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'transparent'};

  h1 {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 800;
    margin-bottom: 16px;
    color: ${props => props.$isDark ? '#FF8C61' : 'white'};
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  p {
    font-size: 1.15rem;
    color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.9)'};
    max-width: 650px;
    margin: 0 auto;
    font-weight: 500;
  }
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ContactInfo = styled.div<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1E2432' : 'white'};
  padding: 32px;
  border-radius: 24px;
  box-shadow: ${props => props.$isDark ? '0 15px 40px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'rgba(0,0,0,0.05)'};

  h2 {
    font-size: 1.8rem;
    font-weight: 800;
    color: ${props => props.$isDark ? '#f8fafc' : '#1e40af'};
    margin-bottom: 32px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ContactItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 0;
  border-bottom: 1px solid ${props => props.$isDark ? '#2d3748' : '#e2e8f0'};

  &:last-child {
    border-bottom: none;
  }

  .icon {
    width: 60px;
    height: 60px;
    background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #FF8C61 0%, #FF5C00 100%)'
    : 'linear-gradient(135deg, #3b82f6, #1e40af)'};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    box-shadow: ${props => props.$isDark ? '0 4px 15px rgba(255, 140, 97, 0.3)' : 'none'};
  }

  .content {
    h3 {
      font-weight: 700;
      color: ${props => props.$isDark ? '#f8fafc' : '#1e40af'};
      margin-bottom: 4px;
      font-size: 1.1rem;
    }

    p {
      color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
      margin: 0;
      white-space: pre-line;
      font-weight: 500;
    }
  }
`;

const ContactSocials = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-start;
`;

const ContactSocialIcon = styled.a<{ $color?: string; $isDark?: boolean }>`
  width: 48px;
  height: 48px;
  background: ${props => props.$isDark ? '#0F1419' : '#f8fafc'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color || '#3b82f6'};
  border: 1px solid ${props => props.$isDark ? '#2d3748' : '#e2e8f0'};
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    background: ${props => props.$color || (props.$isDark ? '#FF8C61' : '#3b82f6')};
    color: white;
    transform: translateY(-5px) scale(1.1);
    box-shadow: ${props => props.$isDark ? '0 10px 20px rgba(0,0,0,0.4)' : '0 5px 15px rgba(0, 0, 0, 0.1)'};
    border-color: transparent;
  }
`;

const ContactForm = styled.form<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1E2432' : 'white'};
  padding: 32px;
  border-radius: 24px;
  box-shadow: ${props => props.$isDark ? '0 15px 40px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'rgba(0,0,0,0.05)'};

  h2 {
    font-size: 1.8rem;
    font-weight: 800;
    color: ${props => props.$isDark ? '#FF8C61' : '#1e40af'};
    margin-bottom: 32px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const FormGroup = styled.div<{ $isDark?: boolean }>`
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-weight: 700;
    color: ${props => props.$isDark ? '#cbd5e1' : '#374151'};
    margin-bottom: 8px;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
  }

  input, textarea, select {
    width: 100%;
    padding: 12px 16px;
    background: ${props => props.$isDark ? '#0F1419' : 'white'};
    border: 2px solid ${props => props.$isDark ? '#2d3748' : '#e2e8f0'};
    border-radius: 12px;
    font-size: 1rem;
    color: ${props => props.$isDark ? '#f8fafc' : '#1F2937'};
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: ${props => props.$isDark ? '#FF8C61' : '#3b82f6'};
      box-shadow: ${props => props.$isDark ? '0 0 10px rgba(255, 140, 97, 0.2)' : '0 0 10px rgba(59, 130, 246, 0.1)'};
    }

    &::placeholder {
      color: ${props => props.$isDark ? '#4a5568' : '#94a3b8'};
    }
  }

  textarea {
    resize: vertical;
    min-height: 120px;
  }
`;

const SubmitButton = styled.button<{ $isDark: boolean }>`
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #FF8C61 0%, #FF5C00 100%)'
    : 'linear-gradient(135deg, #3b82f6, #1e40af)'};
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: ${props => props.$isDark ? '0 4px 15px rgba(255, 140, 97, 0.3)' : '0 4px 10px rgba(59, 130, 246, 0.2)'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div<{ $isDark?: boolean }>`
  background: ${props => props.$isDark ? '#064e3b' : '#f0fdf4'};
  border: 1px solid ${props => props.$isDark ? '#059669' : '#22c55e'};
  color: ${props => props.$isDark ? '#10b981' : '#166534'};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FAQSection = styled.section<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1E2432' : 'white'};
  padding: 48px;
  border-radius: 24px;
  box-shadow: ${props => props.$isDark ? '0 15px 40px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${props => props.$isDark ? '#2d3748' : 'rgba(0,0,0,0.05)'};

  h2 {
    font-size: 2.2rem;
    font-weight: 800;
    color: ${props => props.$isDark ? '#FF8C61' : '#1e40af'};
    margin-bottom: 32px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const FAQItem = styled.div<{ $isDark: boolean }>`
  margin-bottom: 16px;
  border: 1px solid ${props => props.$isDark ? '#2d3748' : '#e2e8f0'};
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.$isDark ? '#FF8C61' : '#3b82f6'};
  }

  .question {
    background: ${props => props.$isDark ? '#1A1F2E' : '#f8fafc'};
    padding: 16px 20px;
    font-weight: 700;
    color: ${props => props.$isDark ? '#f8fafc' : '#1e40af'};
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.3s ease;

    &:hover {
      background: ${props => props.$isDark ? '#2D3748' : '#f1f5f9'};
    }
  }

  .answer {
    padding: 16px 20px;
    color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
    line-height: 1.7;
    border-top: 1px solid ${props => props.$isDark ? '#2d3748' : '#e2e8f0'};
    background: ${props => props.$isDark ? '#1E2432' : 'white'};
    font-weight: 500;
  }
`;

const ContactPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      inquiryType: 'general'
    });
  };

  return (
    <ContactContainer $isDark={isDark}>
      <Container>
        <Header $isDark={isDark}>
          <h1>{t('contact.title')}</h1>
          <p>
            {t('contact.subtitle')}
          </p>
        </Header>

        <ContactGrid>
          <ContactInfo $isDark={isDark}>
            <h2>{t('contact.info.title') || 'Contact Information'}</h2>

            <ContactItem $isDark={isDark}>
              <div className="icon">
                <MapPin size={24} />
              </div>
              <div className="content">
                <h3>{t('contact.info.address.title')}</h3>
                <p>{t('contact.info.address.text')}</p>
              </div>
            </ContactItem>

            <ContactItem $isDark={isDark}>
              <div className="icon">
                <Phone size={24} />
              </div>
              <div className="content">
                <h3>{t('contact.info.phone.title')}</h3>
                <p>
                  {t('contact.info.phone.text')}<br />
                  <span style={{ fontSize: '0.9em', opacity: 0.8 }}>
                    {t('contact.info.phone.subtext')}
                  </span>
                </p>
              </div>
            </ContactItem>

            <ContactItem $isDark={isDark}>
              <div className="icon">
                <Mail size={24} />
              </div>
              <div className="content">
                <h3>{t('contact.info.email.title')}</h3>
                <p>
                  <strong>{t('contact.info.email.general')}: </strong> <a href="mailto:support@koli.one" style={{ color: isDark ? '#FF8C61' : '#3b82f6', textDecoration: 'none' }}>support@koli.one</a><br />
                  <strong>{t('contact.info.email.sales')}: </strong> <a href="mailto:sales@koli.one" style={{ color: isDark ? '#FF8C61' : '#3b82f6', textDecoration: 'none' }}>sales@koli.one</a><br />
                  <strong>{t('contact.info.email.ai')}: </strong> <a href="mailto:ai@koli.one" style={{ color: isDark ? '#FF8C61' : '#3b82f6', textDecoration: 'none' }}>ai@koli.one</a><br />
                  <strong>{t('contact.info.email.gdpr')}: </strong> <a href="mailto:support@koli.one" style={{ color: isDark ? '#FF8C61' : '#3b82f6', textDecoration: 'none' }}>support@koli.one</a>
                </p>
              </div>
            </ContactItem>

            <ContactItem $isDark={isDark}>
              <div className="icon">
                <Clock size={24} />
              </div>
              <div className="content">
                <h3>{t('contact.info.hours.title')}</h3>
                <p>{t('contact.info.hours.text')}</p>
              </div>
            </ContactItem>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: isDark ? '#FF8C61' : '#1e40af', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('contact.social.title')}
              </h3>
              <ContactSocials>
                <ContactSocialIcon href={SOCIAL_LINKS.facebook} target="_blank" $color="#1877F2" title="Facebook" $isDark={isDark}>
                  <Facebook size={20} />
                </ContactSocialIcon>
                <ContactSocialIcon href={SOCIAL_LINKS.instagram} target="_blank" $color="#E4405F" title="Instagram" $isDark={isDark}>
                  <Instagram size={20} />
                </ContactSocialIcon>
                <ContactSocialIcon href={SOCIAL_LINKS.tiktok} target="_blank" $color={isDark ? '#FF8C61' : '#000000'} title="TikTok" $isDark={isDark}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </ContactSocialIcon>
                <ContactSocialIcon href={SOCIAL_LINKS.youtube} target="_blank" $color="#FF0000" title="YouTube" $isDark={isDark}>
                  <Youtube size={20} />
                </ContactSocialIcon>
                <ContactSocialIcon href={SOCIAL_LINKS.linkedin} target="_blank" $color="#0077B5" title="LinkedIn" $isDark={isDark}>
                  <Linkedin size={20} />
                </ContactSocialIcon>
                <ContactSocialIcon href={SOCIAL_LINKS.twitter} target="_blank" $color={isDark ? '#FF8C61' : '#000000'} title="X (Twitter)" $isDark={isDark}>
                  <Twitter size={20} />
                </ContactSocialIcon>
              </ContactSocials>
            </div>
          </ContactInfo>

          <ContactForm onSubmit={handleSubmit} $isDark={isDark}>
            <h2>{t('contact.form.title')}</h2>

            {isSubmitted && (
              <SuccessMessage $isDark={isDark}>
                <CheckCircle size={20} />
                {t('contact.form.success')}
              </SuccessMessage>
            )}

            <FormGroup $isDark={isDark}>
              <label htmlFor="name">{t('contact.form.name')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup $isDark={isDark}>
              <label htmlFor="email">{t('contact.form.email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup $isDark={isDark}>
              <label htmlFor="phone">{t('contact.form.phone')}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup $isDark={isDark}>
              <label htmlFor="inquiryType">{t('contact.form.inquiryType')}</label>
              <select
                id="inquiryType"
                name="inquiryType"
                value={formData.inquiryType}
                onChange={handleInputChange}
              >
                <option value="general">{t('contact.form.inquiryTypes.general')}</option>
                <option value="support">{t('contact.form.inquiryTypes.support')}</option>
                <option value="sales">{t('contact.form.inquiryTypes.sales')}</option>
                <option value="partnership">{t('contact.form.inquiryTypes.partnership')}</option>
              </select>
            </FormGroup>

            <FormGroup $isDark={isDark}>
              <label htmlFor="subject">{t('contact.form.subject')}</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup $isDark={isDark}>
              <label htmlFor="message">{t('contact.form.message')}</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <SubmitButton type="submit" disabled={isSubmitting} $isDark={isDark}>
              <Send size={20} />
              {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
            </SubmitButton>
          </ContactForm>
        </ContactGrid>

        <FAQSection $isDark={isDark}>
          <h2>{t('contact.faq.title')}</h2>

          <FAQItem $isDark={isDark}>
            <div className="question">
              {t('contact.faq.q1')}
            </div>
            <div className="answer">
              {t('contact.faq.a1')}
            </div>
          </FAQItem>

          <FAQItem $isDark={isDark}>
            <div className="question">
              {t('contact.faq.q2')}
            </div>
            <div className="answer">
              {t('contact.faq.a2')}
            </div>
          </FAQItem>

          <FAQItem $isDark={isDark}>
            <div className="question">
              {t('contact.faq.q3')}
            </div>
            <div className="answer">
              {t('contact.faq.a3')}
            </div>
          </FAQItem>

          <FAQItem $isDark={isDark}>
            <div className="question">
              {t('contact.faq.q4')}
            </div>
            <div className="answer">
              {t('contact.faq.a4')}
            </div>
          </FAQItem>
        </FAQSection>
      </Container>
    </ContactContainer>
  );
};

export default ContactPage;

// src/pages/ContactPage.tsx
// Contact Page for Bulgarian Car Marketplace

import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageCircle,
  User,
  Mail as MailIcon,
  CheckCircle
} from 'lucide-react';

// Styled Components
const ContactContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
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
  }

  p {
    font-size: 1.1rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
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

const ContactInfo = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #1e40af;
    margin-bottom: 1.5rem;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }

  .icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #3b82f6, #1e40af);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .content {
    h3 {
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 0.25rem;
    }

    p {
      color: #64748b;
      margin: 0;
    }
  }
`;

const ContactForm = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #1e40af;
    margin-bottom: 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  input, textarea, select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: #3b82f6;
    }
  }

  textarea {
    resize: vertical;
    min-height: 120px;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #22c55e;
  color: #166534;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FAQSection = styled.section`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #1e40af;
    margin-bottom: 1.5rem;
    text-align: center;
  }
`;

const FAQItem = styled.div`
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;

  .question {
    background: #f8fafc;
    padding: 1rem;
    font-weight: 600;
    color: #1e40af;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
      background: #f1f5f9;
    }
  }

  .answer {
    padding: 1rem;
    color: #64748b;
    line-height: 1.6;
    border-top: 1px solid #e2e8f0;
  }
`;

const ContactPage: React.FC = () => {
  const { t } = useLanguage();
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
    <ContactContainer>
      <Container>
        <Header>
          <h1>{t('contact.title')}</h1>
          <p>
            {t('contact.subtitle')}
          </p>
        </Header>

        <ContactGrid>
          <ContactInfo>
            <h2>{t('contact.info.title')}</h2>
            
            <ContactItem>
              <div className="icon">
                <MapPin size={24} />
              </div>
              <div className="content">
                <h3>{t('contact.info.address.title')}</h3>
                <p>{t('contact.info.address.text')}</p>
              </div>
            </ContactItem>

            <ContactItem>
              <div className="icon">
                <Phone size={24} />
              </div>
              <div className="content">
                <h3>{t('contact.info.phone.title')}</h3>
                <p>{t('contact.info.phone.text')}</p>
              </div>
            </ContactItem>

            <ContactItem>
              <div className="icon">
                <Mail size={24} />
              </div>
              <div className="content">
                <h3>{t('contact.info.email.title')}</h3>
                <p>{t('contact.info.email.text')}</p>
              </div>
            </ContactItem>

            <ContactItem>
              <div className="icon">
                <Clock size={24} />
              </div>
              <div className="content">
                <h3>{t('contact.info.hours.title')}</h3>
                <p>{t('contact.info.hours.text')}</p>
              </div>
            </ContactItem>
          </ContactInfo>

          <ContactForm onSubmit={handleSubmit}>
            <h2>{t('contact.form.title')}</h2>
            
            {isSubmitted && (
              <SuccessMessage>
                <CheckCircle size={20} />
                {t('contact.form.success')}
              </SuccessMessage>
            )}

            <FormGroup>
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

            <FormGroup>
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

            <FormGroup>
              <label htmlFor="phone">{t('contact.form.phone')}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
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

            <FormGroup>
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

            <FormGroup>
              <label htmlFor="message">{t('contact.form.message')}</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <SubmitButton type="submit" disabled={isSubmitting}>
              <Send size={20} />
              {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
            </SubmitButton>
          </ContactForm>
        </ContactGrid>

        <FAQSection>
          <h2>{t('contact.faq.title')}</h2>
          
          <FAQItem>
            <div className="question">
              {t('contact.faq.q1')}
            </div>
            <div className="answer">
              {t('contact.faq.a1')}
            </div>
          </FAQItem>

          <FAQItem>
            <div className="question">
              {t('contact.faq.q2')}
            </div>
            <div className="answer">
              {t('contact.faq.a2')}
            </div>
          </FAQItem>

          <FAQItem>
            <div className="question">
              {t('contact.faq.q3')}
            </div>
            <div className="answer">
              {t('contact.faq.a3')}
            </div>
          </FAQItem>

          <FAQItem>
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


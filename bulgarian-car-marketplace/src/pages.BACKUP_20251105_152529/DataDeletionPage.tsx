// src/pages/DataDeletionPage.tsx
// Data Deletion Request Page for Facebook Integration
// (Comment removed - was in Arabic)

import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1.5rem;
  }
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.primary};
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  font-size: 1.3rem;
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.theme.colors.primary};
  padding-left: 1rem;
`;

const Paragraph = styled.p`
  line-height: 1.6;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.secondary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid ${props => props.theme.colors.grey[300]};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &:invalid {
    border-color: #dc3545;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid ${props => props.theme.colors.grey[300]};
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary.dark};
  }

  &:disabled {
    background: ${props => props.theme.colors.grey[300]};
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  background: ${props => {
    switch (props.type) {
      case 'success': return '#d4edda';
      case 'error': return '#f8d7da';
      case 'info': return '#d1ecf1';
      default: return '#f8f9fa';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return '#155724';
      case 'error': return '#721c24';
      case 'info': return '#0c5460';
      default: return '#495057';
    }
  }};
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success': return '#c3e6cb';
      case 'error': return '#f5c6cb';
      case 'info': return '#bee5eb';
      default: return '#dee2e6';
    }
  }};
`;

const WarningBox = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

const InfoBox = styled.div`
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

const DataDeletionPage: React.FC = () => {
  const { language } = useTranslation();
  const [formData, setFormData] = useState({
    facebookId: '',
    email: '',
    reason: '',
    confirmDeletion: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const content = {
    bg: {
      title: "Заявка за изтриване на данни",
      subtitle: "Изтриване на данни, свързани с Facebook интеграцията",
      
      warning: {
        title: "⚠️ Важно предупреждение",
        text: "Това действие е необратимо. След потвърждаване на заявката, всички ваши данни ще бъдат изтрити завинagi от нашите системи."
      },

      info: {
        title: "ℹ️ Какво ще бъде изтрито",
        items: [
          "Всички лични данни, получени от Facebook",
          "История на активността ви в платформата", 
          "Съобщения и комуникации",
          "Предпочитания и настройки",
          "Данни от Facebook Pixel и Analytics"
        ]
      },

      form: {
        facebookId: "Facebook ID (задължително)",
        facebookIdPlaceholder: "Въведете вашия Facebook ID",
        email: "Имейл адрес (задължително)",
        emailPlaceholder: "example@domain.com",
        reason: "Причина за изтриване (по избор)",
        reasonPlaceholder: "Моля, споделете защо искате да изтриете данните си...",
        confirmLabel: "Потвърждавам, че искам да изтрия всички мои данни",
        submitButton: "Изпрати заявка за изтриване",
        submitting: "Обработва се..."
      },

      process: {
        title: "Процес на изтриване",
        steps: [
          "1. Подаване на заявката чрез тази форма",
          "2. Проверка на самоличността (до 2 работни дни)",
          "3. Обработка и изтриване на данните (до 30 дни)",
          "4. Потвърждение за завършване по имейл"
        ]
      },

      contact: {
        title: "Необходима помощ?",
        text: "За въпроси относно изтриването на данни, свържете се с нас:",
        email: "privacy@bulgariancarmarketplace.com",
        phone: "+359 888 123 456"
      },

      messages: {
        success: "Вашата заявка за изтриване беше изпратена успешно. Ще получите потвърждение по имейл в рамките на 24 часа.",
        error: "Възникна грешка при изпращането на заявката. Моля, опитайте отново или се свържете с нас директно.",
        validation: "Моля, попълнете всички задължителни полета правилно."
      }
    },

    en: {
      title: "Data Deletion Request",
      subtitle: "Delete data related to Facebook integration",
      
      warning: {
        title: "⚠️ Important Warning",
        text: "This action is irreversible. After confirming the request, all your data will be permanently deleted from our systems."
      },

      info: {
        title: "ℹ️ What will be deleted",
        items: [
          "All personal data received from Facebook",
          "Your activity history on the platform",
          "Messages and communications", 
          "Preferences and settings",
          "Facebook Pixel and Analytics data"
        ]
      },

      form: {
        facebookId: "Facebook ID (required)",
        facebookIdPlaceholder: "Enter your Facebook ID",
        email: "Email address (required)",
        emailPlaceholder: "example@domain.com",
        reason: "Reason for deletion (optional)",
        reasonPlaceholder: "Please share why you want to delete your data...",
        confirmLabel: "I confirm that I want to delete all my data",
        submitButton: "Submit Deletion Request",
        submitting: "Processing..."
      },

      process: {
        title: "Deletion Process",
        steps: [
          "1. Submit request through this form",
          "2. Identity verification (up to 2 business days)",
          "3. Data processing and deletion (up to 30 days)",
          "4. Email confirmation of completion"
        ]
      },

      contact: {
        title: "Need Help?",
        text: "For questions about data deletion, contact us:",
        email: "privacy@bulgariancarmarketplace.com",
        phone: "+359 888 123 456"
      },

      messages: {
        success: "Your deletion request has been successfully submitted. You will receive email confirmation within 24 hours.",
        error: "An error occurred while submitting the request. Please try again or contact us directly.",
        validation: "Please fill in all required fields correctly."
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.facebookId || !formData.email || !formData.confirmDeletion) {
      setStatus({ type: 'error', message: currentContent.messages.validation });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      // Simulate API call for data deletion request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, send data to your backend API
      const response = await fetch('/api/facebook/data-deletion-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facebookId: formData.facebookId,
          email: formData.email,
          reason: formData.reason,
          timestamp: new Date().toISOString(),
          language: language
        })
      });

      if (response.ok) {
        setStatus({ type: 'success', message: currentContent.messages.success });
        setFormData({ facebookId: '', email: '', reason: '', confirmDeletion: false });
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      setStatus({ type: 'error', message: currentContent.messages.error });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <Container>
      <Title>{currentContent.title}</Title>
      <Paragraph style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '2rem' }}>
        {currentContent.subtitle}
      </Paragraph>

      <WarningBox>
        <strong>{currentContent.warning.title}</strong>
        <p style={{ margin: '0.5rem 0 0 0' }}>{currentContent.warning.text}</p>
      </WarningBox>

      <InfoBox>
        <strong>{currentContent.info.title}</strong>
        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
          {currentContent.info.items.map((item, index) => (
            <li key={index} style={{ margin: '0.25rem 0' }}>{item}</li>
          ))}
        </ul>
      </InfoBox>

      <Section>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="facebookId">{currentContent.form.facebookId}</Label>
            <Input
              type="text"
              id="facebookId"
              name="facebookId"
              value={formData.facebookId}
              onChange={handleInputChange}
              placeholder={currentContent.form.facebookIdPlaceholder}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">{currentContent.form.email}</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={currentContent.form.emailPlaceholder}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="reason">{currentContent.form.reason}</Label>
            <TextArea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder={currentContent.form.reasonPlaceholder}
            />
          </FormGroup>

          <FormGroup>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="confirmDeletion"
                checked={formData.confirmDeletion}
                onChange={handleInputChange}
                required
              />
              <span>{currentContent.form.confirmLabel}</span>
            </label>
          </FormGroup>

          <Button 
            type="submit" 
            disabled={isSubmitting || !formData.confirmDeletion}
          >
            {isSubmitting ? currentContent.form.submitting : currentContent.form.submitButton}
          </Button>
        </Form>

        {status && (
          <StatusMessage type={status.type}>
            {status.message}
          </StatusMessage>
        )}
      </Section>

      <Section>
        <SectionTitle>{currentContent.process.title}</SectionTitle>
        <ol style={{ paddingLeft: '1.5rem' }}>
          {currentContent.process.steps.map((step, index) => (
            <li key={index} style={{ margin: '0.5rem 0', color: '#6c757d' }}>{step}</li>
          ))}
        </ol>
      </Section>

      <Section>
        <SectionTitle>{currentContent.contact.title}</SectionTitle>
        <Paragraph>{currentContent.contact.text}</Paragraph>
        <InfoBox>
          <p><strong>{language === 'bg' ? 'Имейл' : 'Email'}:</strong> <a href={`mailto:${currentContent.contact.email}`}>{currentContent.contact.email}</a></p>
          <p><strong>{language === 'bg' ? 'Телефон' : 'Phone'}:</strong> <a href={`tel:${currentContent.contact.phone}`}>{currentContent.contact.phone}</a></p>
        </InfoBox>
      </Section>
    </Container>
  );
};

export default DataDeletionPage;
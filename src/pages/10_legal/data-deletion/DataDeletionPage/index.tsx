// src/pages/DataDeletionPage.tsx
// Data Deletion Request Page for Facebook Integration
// (Comment removed - was in Arabic)

import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../../../hooks/useTranslation';

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1e293b' : (theme.colors?.background?.paper || '#ffffff')};
  border-radius: 12px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'};

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1.5rem;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.mode === 'dark' ? '#60a5fa' : (theme.colors?.primary?.main || '#3b82f6')};
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.mode === 'dark' ? '#f3f4f6' : (theme.colors?.text?.primary || '#1f2937')};
  font-size: 1.3rem;
  margin-bottom: 1rem;
  border-left: 4px solid ${({ theme }) => theme.mode === 'dark' ? '#60a5fa' : (theme.colors?.primary?.main || '#3b82f6')};
  padding-left: 1rem;
`;

const Paragraph = styled.p`
  line-height: 1.6;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#d1d5db' : (theme.colors?.text?.secondary || '#6b7280')};
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
  color: ${({ theme }) => theme.mode === 'dark' ? '#e5e7eb' : (theme.colors?.text?.primary || '#1f2937')};
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid ${({ theme }) => theme.mode === 'dark' ? '#475569' : (theme.colors?.border || '#dee2e6')};
  background: ${({ theme }) => theme.mode === 'dark' ? '#0f172a' : (theme.colors?.background?.default || '#ffffff')};
  color: ${({ theme }) => theme.mode === 'dark' ? '#e5e7eb' : (theme.colors?.text?.primary || '#333')};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.mode === 'dark' ? '#60a5fa' : (theme.colors?.primary?.main || '#3b82f6')};
  }

  &:invalid {
    border-color: #dc3545;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid ${({ theme }) => theme.mode === 'dark' ? '#475569' : (theme.colors?.border || '#dee2e6')};
  background: ${({ theme }) => theme.mode === 'dark' ? '#0f172a' : (theme.colors?.background?.default || '#ffffff')};
  color: ${({ theme }) => theme.mode === 'dark' ? '#e5e7eb' : (theme.colors?.text?.primary || '#333')};
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.mode === 'dark' ? '#60a5fa' : (theme.colors?.primary?.main || '#3b82f6')};
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#3b82f6' : (theme.colors?.primary?.main || '#3b82f6')};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.mode === 'dark' ? '#2563eb' : (theme.colors?.primary?.dark || '#2563eb')};
  }

  &:disabled {
    background: ${({ theme }) => theme.mode === 'dark' ? '#475569' : '#d1d5db'};
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  background: ${({ type, theme }) => {
    const dark = theme.mode === 'dark';
    switch (type) {
      case 'success': return dark ? 'rgba(34, 197, 94, 0.2)' : '#d4edda';
      case 'error': return dark ? 'rgba(239, 68, 68, 0.2)' : '#f8d7da';
      case 'info': return dark ? 'rgba(59, 130, 246, 0.2)' : '#d1ecf1';
      default: return dark ? 'rgba(148, 163, 184, 0.2)' : '#f8f9fa';
    }
  }};
  color: ${({ type, theme }) => {
    const dark = theme.mode === 'dark';
    switch (type) {
      case 'success': return dark ? '#86efac' : '#155724';
      case 'error': return dark ? '#fca5a5' : '#721c24';
      case 'info': return dark ? '#93c5fd' : '#0c5460';
      default: return theme.colors?.text?.secondary || theme.text?.secondary || '#495057';
    }
  }};
  border: 1px solid ${({ type, theme }) => {
    const dark = theme.mode === 'dark';
    switch (type) {
      case 'success': return dark ? 'rgba(34, 197, 94, 0.5)' : '#c3e6cb';
      case 'error': return dark ? 'rgba(239, 68, 68, 0.5)' : '#f5c6cb';
      case 'info': return dark ? 'rgba(59, 130, 246, 0.5)' : '#bee5eb';
      default: return theme.colors?.border || '#dee2e6';
    }
  }};
`;

const WarningBox = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : '#fff3cd'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.5)' : '#ffeaa7'};
  color: ${({ theme }) => theme.mode === 'dark' ? '#fcd34d' : '#856404'};
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

const InfoBox = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#d1ecf1'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.5)' : '#bee5eb'};
  color: ${({ theme }) => theme.mode === 'dark' ? '#93c5fd' : '#0c5460'};
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
      title: "Заявка за изтриване на данни (GDPR)",
      subtitle: "Изтриване на лични данни, обработвани от Alaa Technologies за Koli One",
      
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
        text: "За въпроси относно изтриването на данни по GDPR, свържете се с Alaa Technologies:",
        company: "Alaa Technologies",
        address: "бул. Цар Симеон 77, София, България",
        email: "support@koli.one",
        phone: "+359 87 983 9671",
        phoneNote: "(само текстови съобщения)"
      },

      messages: {
        success: "Вашата заявка за изтриване беше изпратена успешно. Ще получите потвърждение по имейл в рамките на 24 часа.",
        error: "Възникна грешка при изпращането на заявката. Моля, опитайте отново или се свържете с нас директно.",
        validation: "Моля, попълнете всички задължителни полета правилно."
      }
    },

    en: {
      title: "Data Deletion Request (GDPR)",
      subtitle: "Delete personal data processed by Alaa Technologies for Koli One",
      
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
        text: "For questions about data deletion under GDPR, contact Alaa Technologies:",
        company: "Alaa Technologies",
        address: "77 Tsar Simeon Blvd, Sofia, Bulgaria",
        email: "support@koli.one",
        phone: "+359 87 983 9671",
        phoneNote: "(text messages only)"
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

      {/* Email-Based Deletion Alternative - GDPR Compliant */}
      <InfoBox>
        <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.75rem' }}>
          {language === 'bg' ? '📧 Бързо изтриване по имейл' : '📧 Quick Email Deletion'}
        </strong>
        <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>
          {language === 'bg'
            ? 'Можете също да поискате изтриване на данни чрез имейл:'
            : 'You can also request data deletion via email:'}
        </p>
        <p style={{ 
          margin: '1rem 0 0 0', 
          padding: '1rem', 
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '0.95rem',
          wordBreak: 'break-all'
        }}>
          <strong>{language === 'bg' ? 'Изпратете имейл на:' : 'Send email to:'}</strong><br/>
          <a href="mailto:support@koli.one?subject=DELETE%20MY%20DATA" style={{ color: 'inherit', textDecoration: 'underline' }}>
            support@koli.one
          </a>
        </p>
        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
          {language === 'bg'
            ? 'Тема: DELETE MY DATA'
            : 'Subject: DELETE MY DATA'}
        </p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
          {language === 'bg'
            ? 'Заявката ще бъде обработена в срок до 30 дни.'
            : 'Your request will be processed within 30 days.'}
        </p>
      </InfoBox>

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
          <p><strong>{currentContent.contact.company}</strong></p>
          <p>{currentContent.contact.address}</p>
          <p><strong>{language === 'bg' ? 'Имейл' : 'Email'}:</strong> <a href={`mailto:${currentContent.contact.email}`}>{currentContent.contact.email}</a></p>
          <p><strong>{language === 'bg' ? 'Телефон' : 'Phone'}:</strong> {currentContent.contact.phone} {currentContent.contact.phoneNote && <span style={{ fontSize: '0.9em', opacity: 0.7 }}>{currentContent.contact.phoneNote}</span>}</p>
        </InfoBox>
      </Section>
    </Container>
  );
};

export default DataDeletionPage;
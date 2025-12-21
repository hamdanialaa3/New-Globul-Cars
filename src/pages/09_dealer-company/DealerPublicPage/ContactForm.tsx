import { logger } from '../../../services/logger-service';
// src/pages/DealerPublicPage/ContactForm.tsx
// Contact Form for Dealer Public Page

import React, { useState } from 'react';
import styled from 'styled-components';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../contexts';

interface ContactFormProps {
  dealerId: string;
  dealerName: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ dealerId, dealerName }) => {
  const { currentUser } = useAuth();
  const functions = getFunctions();

  const [formData, setFormData] = useState<FormData>({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.message) {
        throw new Error('Please fill in all required fields');
      }

      // Send message via Firebase Function
      const sendMessage = httpsCallable(functions, 'sendMessage');
      await sendMessage({
        recipientId: dealerId,
        subject: `Inquiry from ${formData.name}`,
        message: formData.message,
        contactInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
      });

      setSuccess(true);
      setFormData({
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        phone: '',
        message: '',
      });

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      logger.error('Error sending message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <FormTitle>Send a Message to {dealerName}</FormTitle>

      {success && <SuccessMessage>✓ Your message has been sent successfully!</SuccessMessage>}
      {error && <ErrorMessage>❌ {error}</ErrorMessage>}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">
            Name <Required>*</Required>
          </Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your full name"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">
            Email <Required>*</Required>
          </Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your.email@example.com"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+359 XXX XXX XXX"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="message">
            Message <Required>*</Required>
          </Label>
          <TextArea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Tell us what you're interested in..."
            rows={5}
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Message'}
        </SubmitButton>
      </Form>
    </FormContainer>
  );
};

export default ContactForm;

// Styled Components

const FormContainer = styled.div`
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 14px;
  color: #555;
`;

const Required = styled.span`
  color: #f44336;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const SubmitButton = styled.button`
  padding: 15px 30px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;

  &:hover:not(:disabled) {
    background: #2980b9;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  padding: 15px;
  background: #4caf50;
  color: white;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
`;

const ErrorMessage = styled.div`
  padding: 15px;
  background: #f44336;
  color: white;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
`;

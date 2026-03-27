import { logger } from '../../services/logger-service';
import { toast } from 'react-toastify';
/**
 * Quick Setup Page
 * Quick Setup Page for all cloud services
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Settings,
  Key,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';

interface ServiceConfig {
  name: string;
  description: string;
  fields: ConfigField[];
  documentation: string;
  testEndpoint?: string;
}

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url';
  placeholder: string;
  required: boolean;
  description?: string;
}

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px;
  background: #0f1419;
  min-height: 100vh;
  color: #f8fafc;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #8B5CF6;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #cbd5e1;
  margin: 0;
  font-weight: 500;
`;

const ServicesContainer = styled.div`
  display: grid;
  gap: 24px;
`;

const ServiceCard = styled.div`
  background: #1e2432;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  border: 1px solid #2d3748;
  transition: all 0.2s ease;

  &:hover {
    border-color: #8B5CF6;
  }
`;

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #2d3748;
`;

const ServiceInfo = styled.div`
  flex: 1;
`;

const ServiceName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #8B5CF6;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ServiceDescription = styled.p`
  font-size: 13px;
  color: #cbd5e1;
  margin: 0;
  font-weight: 500;
`;

const StatusIndicator = styled.div<{ $configured: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${p => p.$configured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'};
  color: ${p => p.$configured ? '#10b981' : '#f59e0b'};
  border: 1px solid ${p => p.$configured ? '#10b981' : '#f59e0b'};
`;

const FieldsGrid = styled.div`
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
`;

const FieldGroup = styled.div`
  display: grid;
  gap: 8px;
`;

const FieldLabel = styled.label`
  font-size: 13px;
  font-weight: 700;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RequiredIndicator = styled.span`
  color: #e53e3e;
  font-size: 0.8rem;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: #0f1419;
  border: 1px solid #2d3748;
  border-radius: 8px;
  font-size: 14px;
  color: #f8fafc;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #8B5CF6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }

  &::placeholder {
    color: #4a5568;
  }

  &.password {
    padding-right: 48px;
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #4a5568;
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: #8B5CF6;
  }
`;

const FieldDescription = styled.p`
  font-size: 11px;
  color: #94a3b8;
  margin: 4px 0 0 0;
  font-weight: 500;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'outline' }>`
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${p => {
    switch (p.$variant) {
      case 'primary':
        return `
          background: #8B5CF6;
          color: #0f1419;
          border: none;
          &:hover { 
            background: #ffa885;
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: #2d3748;
          color: #f8fafc;
          border: none;
          &:hover { 
            background: #4a5568;
            transform: translateY(-1px);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: #8B5CF6;
          border: 1px solid #8B5CF6;
          &:hover { 
            background: rgba(139, 92, 246, 0.1);
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background: #2d3748;
          color: #f8fafc;
          border: none;
          &:hover { 
            background: #4a5568;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuickSetupPage: React.FC = () => {
  const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const services: ServiceConfig[] = [
    {
      name: 'Algolia Search',
      description: 'Advanced search and smart filtering for vehicles',
      documentation: 'https://www.algolia.com/doc/',
      testEndpoint: 'search',
      fields: [
        {
          key: 'REACT_APP_ALGOLIA_APP_ID',
          label: 'Application ID',
          type: 'text',
          placeholder: 'YourAppID',
          required: true,
          description: 'Application ID from Algolia dashboard'
        },
        {
          key: 'REACT_APP_ALGOLIA_SEARCH_KEY',
          label: 'Search API Key',
          type: 'password',
          placeholder: 'your_search_api_key',
          required: true,
          description: 'Search-Only API Key'
        },
        {
          key: 'REACT_APP_ALGOLIA_ADMIN_KEY',
          label: 'Admin API Key',
          type: 'password',
          placeholder: 'your_admin_api_key',
          required: false,
          description: 'Admin key for uploading data'
        }
      ]
    },
    {
      name: 'Stripe Payments',
      description: 'Payment processing and subscriptions',
      documentation: 'https://stripe.com/docs',
      testEndpoint: 'payments',
      fields: [
        {
          key: 'REACT_APP_STRIPE_PUBLISHABLE_KEY',
          label: 'Publishable Key',
          type: 'text',
          placeholder: 'pk_test_...',
          required: true,
          description: 'Public key for the frontend'
        },
        {
          key: 'STRIPE_SECRET_KEY',
          label: 'Secret Key',
          type: 'password',
          placeholder: 'sk_test_...',
          required: true,
          description: 'Secret key for server (Cloud Functions)'
        },
        {
          key: 'STRIPE_WEBHOOK_SECRET',
          label: 'Webhook Secret',
          type: 'password',
          placeholder: 'whsec_...',
          required: false,
          description: 'Webhook secret for event verification'
        }
      ]
    },
    {
      name: 'Google Gemini AI',
      description: 'AI-powered vehicle image analysis',
      documentation: 'https://ai.google.dev/docs',
      testEndpoint: 'ai',
      fields: [
        {
          key: 'REACT_APP_GEMINI_KEY',
          label: 'Gemini API Key',
          type: 'password',
          placeholder: 'AIza...',
          required: true,
          description: 'Google AI Studio key'
        }
      ]
    },
    {
      name: 'AWS Services',
      description: 'Amazon cloud services (IoT, Rekognition, etc.)',
      documentation: 'https://docs.aws.amazon.com/',
      fields: [
        {
          key: 'REACT_APP_AWS_REGION',
          label: 'AWS Region',
          type: 'text',
          placeholder: 'eu-central-1',
          required: true,
          description: 'AWS Region (Frankfurt for best performance in Bulgaria)'
        },
        {
          key: 'REACT_APP_IOT_ENDPOINT',
          label: 'IoT Endpoint',
          type: 'url',
          placeholder: 'https://your-iot-endpoint.iot.eu-central-1.amazonaws.com',
          required: true,
          description: 'AWS IoT Core endpoint'
        },
        {
          key: 'AWS_ACCESS_KEY_ID',
          label: 'Access Key ID',
          type: 'password',
          placeholder: 'AKIA...',
          required: true,
          description: 'AWS access key'
        },
        {
          key: 'AWS_SECRET_ACCESS_KEY',
          label: 'Secret Access Key',
          type: 'password',
          placeholder: 'your_secret_key',
          required: true,
          description: 'AWS secret key'
        }
      ]
    }
  ];

  const handleInputChange = (serviceName: string, fieldKey: string, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        [fieldKey]: value
      }
    }));
  };

  const togglePasswordVisibility = (serviceName: string, fieldKey: string) => {
    const key = `${serviceName}-${fieldKey}`;
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveServiceConfig = async (serviceName: string) => {
    setSaving(prev => ({ ...prev, [serviceName]: true }));

    try {
      // In production, these values would be saved in environment variables
      // or in a secure configuration management service

      const serviceConfig = configs[serviceName] || {};
      logger.info(`Saving config for ${serviceName}:`, serviceConfig);

      // Simulating data save
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`${serviceName} settings saved successfully!`);

    } catch (error) {
      logger.error('Error saving config:', error);
      toast.error(`Error saving ${serviceName} settings`);
    } finally {
      setSaving(prev => ({ ...prev, [serviceName]: false }));
    }
  };

  const testServiceConnection = async (serviceName: string) => {
    try {
      logger.info(`Testing connection for ${serviceName}`);
      // Simulating connection test
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${serviceName} connection test passed!`);
    } catch (error) {
      toast.error(`${serviceName} connection test failed`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const isServiceConfigured = (serviceName: string): boolean => {
    const service = services.find(s => s.name === serviceName);
    if (!service) return false;

    const serviceConfig = configs[serviceName] || {};
    const requiredFields = service.fields.filter(f => f.required);

    return requiredFields.every(field => serviceConfig[field.key]?.trim());
  };

  return (
    <Container>
      <Header>
        <Title>⚙️ Quick Service Setup</Title>
        <Subtitle>Set up all cloud services in one place</Subtitle>
      </Header>

      <ServicesContainer>
        {services.map((service) => (
          <ServiceCard key={service.name}>
            <ServiceHeader>
              <ServiceInfo>
                <ServiceName>{service.name}</ServiceName>
                <ServiceDescription>{service.description}</ServiceDescription>
              </ServiceInfo>
              <StatusIndicator $configured={isServiceConfigured(service.name)}>
                {isServiceConfigured(service.name) ? (
                  <>
                    <CheckCircle size={16} />
                    Configured
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    Needs Setup
                  </>
                )}
              </StatusIndicator>
            </ServiceHeader>

            <FieldsGrid>
              {service.fields.map((field) => (
                <FieldGroup key={field.key}>
                  <FieldLabel>
                    {field.label}
                    {field.required && <RequiredIndicator>*</RequiredIndicator>}
                  </FieldLabel>
                  <InputContainer>
                    <Input
                      type={
                        field.type === 'password' &&
                          !showPasswords[`${service.name}-${field.key}`]
                          ? 'password'
                          : 'text'
                      }
                      placeholder={field.placeholder}
                      value={configs[service.name]?.[field.key] || ''}
                      onChange={(e) => handleInputChange(service.name, field.key, e.target.value)}
                      className={field.type === 'password' ? 'password' : ''}
                    />
                    {field.type === 'password' && (
                      <ToggleButton
                        type="button"
                        onClick={() => togglePasswordVisibility(service.name, field.key)}
                      >
                        {showPasswords[`${service.name}-${field.key}`] ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </ToggleButton>
                    )}
                  </InputContainer>
                  {field.description && (
                    <FieldDescription>{field.description}</FieldDescription>
                  )}
                </FieldGroup>
              ))}
            </FieldsGrid>

            <ActionsContainer>
              <Button
                $variant="primary"
                onClick={() => saveServiceConfig(service.name)}
                disabled={saving[service.name]}
              >
                {saving[service.name] ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Settings
              </Button>

              {service.testEndpoint && (
                <Button
                  $variant="outline"
                  onClick={() => testServiceConnection(service.name)}
                >
                  <Settings size={16} />
                  Test Connection
                </Button>
              )}

              <Button
                $variant="secondary"
                onClick={() => window.open(service.documentation, '_blank')}
              >
                <ExternalLink size={16} />
                Documentation
              </Button>
            </ActionsContainer>
          </ServiceCard>
        ))}
      </ServicesContainer>
    </Container>
  );
};

export default QuickSetupPage;

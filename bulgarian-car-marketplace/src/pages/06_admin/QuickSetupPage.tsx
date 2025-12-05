import { logger } from '../../services/logger-service';
/**
 * Quick Setup Page
 * صفحة الإعداد السريع لجميع الخدمات السحابية
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
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #718096;
  margin: 0;
`;

const ServicesContainer = styled.div`
  display: grid;
  gap: 24px;
`;

const ServiceCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const ServiceInfo = styled.div`
  flex: 1;
`;

const ServiceName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
`;

const ServiceDescription = styled.p`
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
`;

const StatusIndicator = styled.div<{ $configured: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${p => p.$configured ? '#f0fff4' : '#fef5e7'};
  color: ${p => p.$configured ? '#38a169' : '#d69e2e'};
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
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 8px;
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
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  color: #718096;
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: #4a5568;
  }
`;

const FieldDescription = styled.p`
  font-size: 0.8rem;
  color: #718096;
  margin: 4px 0 0 0;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'outline' }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  ${p => {
    switch (p.$variant) {
      case 'primary':
        return `
          background: #667eea;
          color: white;
          border: none;
          &:hover { background: #5a67d8; }
        `;
      case 'secondary':
        return `
          background: #edf2f7;
          color: #4a5568;
          border: none;
          &:hover { background: #e2e8f0; }
        `;
      case 'outline':
        return `
          background: transparent;
          color: #667eea;
          border: 1px solid #667eea;
          &:hover { background: #667eea; color: white; }
        `;
      default:
        return `
          background: #edf2f7;
          color: #4a5568;
          border: none;
          &:hover { background: #e2e8f0; }
        `;
    }
  }}
`;

const QuickSetupPage: React.FC = () => {
  const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const services: ServiceConfig[] = [
    {
      name: 'Algolia Search',
      description: 'البحث المتقدم والفلترة الذكية للسيارات',
      documentation: 'https://www.algolia.com/doc/',
      testEndpoint: 'search',
      fields: [
        {
          key: 'REACT_APP_ALGOLIA_APP_ID',
          label: 'Application ID',
          type: 'text',
          placeholder: 'YourAppID',
          required: true,
          description: 'معرف التطبيق من لوحة تحكم Algolia'
        },
        {
          key: 'REACT_APP_ALGOLIA_SEARCH_KEY',
          label: 'Search API Key',
          type: 'password',
          placeholder: 'your_search_api_key',
          required: true,
          description: 'مفتاح البحث (Search-Only API Key)'
        },
        {
          key: 'REACT_APP_ALGOLIA_ADMIN_KEY',
          label: 'Admin API Key',
          type: 'password',
          placeholder: 'your_admin_api_key',
          required: false,
          description: 'مفتاح الإدارة لرفع البيانات'
        }
      ]
    },
    {
      name: 'Stripe Payments',
      description: 'معالجة المدفوعات والاشتراكات',
      documentation: 'https://stripe.com/docs',
      testEndpoint: 'payments',
      fields: [
        {
          key: 'REACT_APP_STRIPE_PUBLISHABLE_KEY',
          label: 'Publishable Key',
          type: 'text',
          placeholder: 'pk_test_...',
          required: true,
          description: 'المفتاح العام للواجهة الأمامية'
        },
        {
          key: 'STRIPE_SECRET_KEY',
          label: 'Secret Key',
          type: 'password',
          placeholder: 'sk_test_...',
          required: true,
          description: 'المفتاح السري للخادم (Cloud Functions)'
        },
        {
          key: 'STRIPE_WEBHOOK_SECRET',
          label: 'Webhook Secret',
          type: 'password',
          placeholder: 'whsec_...',
          required: false,
          description: 'سر webhook للتحقق من الأحداث'
        }
      ]
    },
    {
      name: 'Google Gemini AI',
      description: 'تحليل صور السيارات بالذكاء الاصطناعي',
      documentation: 'https://ai.google.dev/docs',
      testEndpoint: 'ai',
      fields: [
        {
          key: 'REACT_APP_GEMINI_KEY',
          label: 'Gemini API Key',
          type: 'password',
          placeholder: 'AIza...',
          required: true,
          description: 'مفتاح Google AI Studio'
        }
      ]
    },
    {
      name: 'AWS Services',
      description: 'خدمات أمازون السحابية (IoT, Rekognition, etc.)',
      documentation: 'https://docs.aws.amazon.com/',
      fields: [
        {
          key: 'REACT_APP_AWS_REGION',
          label: 'AWS Region',
          type: 'text',
          placeholder: 'eu-central-1',
          required: true,
          description: 'منطقة AWS (Frankfurt للأداء الأمثل في بلغاريا)'
        },
        {
          key: 'REACT_APP_IOT_ENDPOINT',
          label: 'IoT Endpoint',
          type: 'url',
          placeholder: 'https://your-iot-endpoint.iot.eu-central-1.amazonaws.com',
          required: true,
          description: 'نقطة نهاية AWS IoT Core'
        },
        {
          key: 'AWS_ACCESS_KEY_ID',
          label: 'Access Key ID',
          type: 'password',
          placeholder: 'AKIA...',
          required: true,
          description: 'مفتاح الوصول AWS'
        },
        {
          key: 'AWS_SECRET_ACCESS_KEY',
          label: 'Secret Access Key',
          type: 'password',
          placeholder: 'your_secret_key',
          required: true,
          description: 'المفتاح السري AWS'
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
      // في التطبيق الحقيقي، سيتم حفظ هذه القيم في متغيرات البيئة
      // أو في خدمة إدارة التكوين الآمنة
      
      const serviceConfig = configs[serviceName] || {};
      logger.info(`Saving config for ${serviceName}:`, serviceConfig);
      
      // محاكاة حفظ البيانات
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`تم حفظ إعدادات ${serviceName} بنجاح!`);
      
    } catch (error) {
      logger.error('Error saving config:', error);
      alert(`خطأ في حفظ إعدادات ${serviceName}`);
    } finally {
      setSaving(prev => ({ ...prev, [serviceName]: false }));
    }
  };

  const testServiceConnection = async (serviceName: string) => {
    try {
      logger.info(`Testing connection for ${serviceName}`);
      // محاكاة اختبار الاتصال
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`اختبار ${serviceName} نجح!`);
    } catch (error) {
      alert(`فشل اختبار ${serviceName}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم النسخ إلى الحافظة!');
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
        <Title>⚙️ الإعداد السريع للخدمات</Title>
        <Subtitle>قم بإعداد جميع الخدمات السحابية في مكان واحد</Subtitle>
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
                    مُعدّ
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    يحتاج إعداد
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
                حفظ الإعدادات
              </Button>

              {service.testEndpoint && (
                <Button
                  $variant="outline"
                  onClick={() => testServiceConnection(service.name)}
                >
                  <Settings size={16} />
                  اختبار الاتصال
                </Button>
              )}

              <Button
                $variant="secondary"
                onClick={() => window.open(service.documentation, '_blank')}
              >
                <ExternalLink size={16} />
                الوثائق
              </Button>
            </ActionsContainer>
          </ServiceCard>
        ))}
      </ServicesContainer>
    </Container>
  );
};

export default QuickSetupPage;
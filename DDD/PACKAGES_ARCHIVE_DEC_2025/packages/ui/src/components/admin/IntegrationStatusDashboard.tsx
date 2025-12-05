/**
 * Integration Status Dashboard
 * لوحة تحكم لعرض حالة تكامل جميع الخدمات
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Settings, 
  Cloud, 
  Zap,
  Shield,
  Search,
  CreditCard,
  Brain,
  BarChart3,
  Wifi
} from 'lucide-react';
import { unifiedPlatformService } from '@globul-cars/services/UnifiedPlatformService';

interface ServiceStatus {
  name: string;
  status: 'active' | 'inactive' | 'warning';
  description: string;
  icon: React.ReactNode;
  details?: string;
  actionRequired?: boolean;
}

const Dashboard = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
  color: white;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ServiceCard = styled.div<{ $status: 'active' | 'inactive' | 'warning' }>`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border-left: 4px solid ${p => 
    p.$status === 'active' ? '#10B981' : 
    p.$status === 'warning' ? '#F59E0B' : '#EF4444'
  };
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  }
`;

const ServiceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const ServiceIcon = styled.div<{ $status: 'active' | 'inactive' | 'warning' }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => 
    p.$status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 
    p.$status === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'
  };
  color: ${p => 
    p.$status === 'active' ? '#10B981' : 
    p.$status === 'warning' ? '#F59E0B' : '#EF4444'
  };
`;

const ServiceInfo = styled.div`
  flex: 1;
`;

const ServiceName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1F2937;
`;

const ServiceDescription = styled.p`
  font-size: 0.9rem;
  color: #6B7280;
  margin: 0;
`;

const StatusBadge = styled.div<{ $status: 'active' | 'inactive' | 'warning' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${p => 
    p.$status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 
    p.$status === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'
  };
  color: ${p => 
    p.$status === 'active' ? '#10B981' : 
    p.$status === 'warning' ? '#F59E0B' : '#EF4444'
  };
`;

const ServiceDetails = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ActionButton = styled.button`
  margin-top: 16px;
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #5a67d8;
  }
`;

const OverallStatus = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 32px;
`;

const StatusIndicator = styled.div<{ $healthy: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  background: ${p => p.$healthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'};
  color: ${p => p.$healthy ? '#10B981' : '#F59E0B'};
`;

const IntegrationStatusDashboard: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallHealth, setOverallHealth] = useState(0);

  useEffect(() => {
    loadServiceStatus();
  }, []);

  const loadServiceStatus = async () => {
    try {
      const status = unifiedPlatformService.getServiceStatus();
      
      const serviceList: ServiceStatus[] = [
        {
          name: 'Firebase',
          status: status.services.firebase ? 'active' : 'inactive',
          description: 'قاعدة البيانات الأساسية والمصادقة',
          icon: <Cloud size={24} />,
          details: 'Firestore, Auth, Storage, Functions'
        },
        {
          name: 'Google Gemini AI',
          status: status.services.gemini ? 'active' : 'inactive',
          description: 'تحليل صور السيارات بالذكاء الاصطناعي',
          icon: <Brain size={24} />,
          details: 'Image analysis, Car recognition'
        },
        {
          name: 'AWS IoT Core',
          status: status.services.iot ? 'active' : 'warning',
          description: 'تتبع السيارات في الوقت الفعلي',
          icon: <Wifi size={24} />,
          details: 'Real-time telemetry, Device management',
          actionRequired: !status.services.iot
        },
        {
          name: 'Algolia Search',
          status: status.services.algolia ? 'active' : 'warning',
          description: 'البحث المتقدم والفلترة الذكية',
          icon: <Search size={24} />,
          details: 'Advanced search, Autocomplete, Facets',
          actionRequired: !status.services.algolia
        },
        {
          name: 'Stripe Payments',
          status: status.services.stripe ? 'active' : 'warning',
          description: 'معالجة المدفوعات الآمنة',
          icon: <CreditCard size={24} />,
          details: 'Payment processing, Subscriptions',
          actionRequired: !status.services.stripe
        },
        {
          name: 'AWS Analytics',
          status: status.services.aws ? 'active' : 'inactive',
          description: 'تحليلات متقدمة وذكاء الأعمال',
          icon: <BarChart3 size={24} />,
          details: 'QuickSight, Kinesis, Personalize'
        },
        {
          name: 'Security & Compliance',
          status: 'warning',
          description: 'الأمان والامتثال للقوانين',
          icon: <Shield size={24} />,
          details: 'WAF, Macie, GDPR compliance',
          actionRequired: true
        },
        {
          name: 'Performance Monitoring',
          status: 'active',
          description: 'مراقبة الأداء والتحسين',
          icon: <Zap size={24} />,
          details: 'Real-time monitoring, Alerts'
        }
      ];

      setServices(serviceList);
      
      // حساب الصحة العامة
      const activeServices = serviceList.filter(s => s.status === 'active').length;
      const healthPercentage = (activeServices / serviceList.length) * 100;
      setOverallHealth(healthPercentage);
      
    } catch (error) {
      console.error('Failed to load service status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: 'active' | 'inactive' | 'warning') => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} />;
      case 'warning':
        return <AlertCircle size={16} />;
      case 'inactive':
        return <XCircle size={16} />;
    }
  };

  const getStatusText = (status: 'active' | 'inactive' | 'warning') => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'warning':
        return 'يحتاج إعداد';
      case 'inactive':
        return 'غير مفعل';
    }
  };

  if (loading) {
    return (
      <Dashboard>
        <Header>
          <Title>جاري التحميل...</Title>
        </Header>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <Header>
        <Title>🚀 حالة التكامل السحابي</Title>
        <Subtitle>Bulgarian Car Marketplace - Cloud Services Integration</Subtitle>
      </Header>

      <OverallStatus>
        <StatusIndicator $healthy={overallHealth >= 70}>
          {overallHealth >= 70 ? <CheckCircle size={40} /> : <AlertCircle size={40} />}
        </StatusIndicator>
        <h2 style={{ margin: '0 0 8px 0', color: '#1F2937' }}>
          الصحة العامة: {Math.round(overallHealth)}%
        </h2>
        <p style={{ margin: 0, color: '#6B7280' }}>
          {services.filter(s => s.status === 'active').length} من {services.length} خدمة نشطة
        </p>
      </OverallStatus>

      <ServicesGrid>
        {services.map((service, index) => (
          <ServiceCard key={index} $status={service.status}>
            <ServiceHeader>
              <ServiceIcon $status={service.status}>
                {service.icon}
              </ServiceIcon>
              <ServiceInfo>
                <ServiceName>{service.name}</ServiceName>
                <ServiceDescription>{service.description}</ServiceDescription>
              </ServiceInfo>
              <StatusBadge $status={service.status}>
                {getStatusIcon(service.status)}
                {getStatusText(service.status)}
              </StatusBadge>
            </ServiceHeader>

            {service.details && (
              <ServiceDetails>
                <DetailItem>
                  <span style={{ color: '#6B7280' }}>المميزات:</span>
                  <span style={{ color: '#1F2937', fontWeight: 500 }}>{service.details}</span>
                </DetailItem>
              </ServiceDetails>
            )}

            {service.actionRequired && (
              <ActionButton onClick={() => window.open('/admin/setup', '_blank')}>
                <Settings size={16} style={{ marginRight: '6px' }} />
                إعداد الخدمة
              </ActionButton>
            )}
          </ServiceCard>
        ))}
      </ServicesGrid>
    </Dashboard>
  );
};

export default IntegrationStatusDashboard;
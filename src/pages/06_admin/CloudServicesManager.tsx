import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { cloudServicesConfig, ServiceConfig } from '../../services/cloud-services-config';
import { Check, X, Settings, ExternalLink } from 'lucide-react';

const CloudServicesManager: React.FC = () => {
  const [services, setServices] = useState<ServiceConfig[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceConfig | null>(null);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    setServices(cloudServicesConfig.getAllServices());
  };

  const handleActivate = (serviceId: string) => {
    if (selectedService?.id === serviceId && apiKey) {
      cloudServicesConfig.activateService(serviceId, apiKey);
      setApiKey('');
      setSelectedService(null);
      loadServices();
    } else {
      const service = services.find(s => s.id === serviceId);
      setSelectedService(service || null);
    }
  };

  const handleDeactivate = (serviceId: string) => {
    if (window.confirm('Are you sure you want to deactivate this service?')) {
      cloudServicesConfig.deactivateService(serviceId);
      loadServices();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#ef4444';
      case 'needs-setup': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'needs-setup': return 'Needs Setup';
      default: return status;
    }
  };

  return (
    <Container>
      <Header>
        <Title>🌐 Cloud Services Management</Title>
        <Subtitle>Activate and manage AWS, Google AI, and payment services</Subtitle>
      </Header>

      <ServicesGrid>
        {services.map(service => (
          <ServiceCard key={service.id}>
            <ServiceIcon>{service.icon}</ServiceIcon>
            <ServiceName>{service.nameAr}</ServiceName>
            <ServiceDesc>{service.descriptionAr}</ServiceDesc>
            
            <StatusBadge color={getStatusColor(service.status)}>
              {getStatusText(service.status)}
            </StatusBadge>

            <FeaturesList>
              <FeaturesTitle>Features:</FeaturesTitle>
              {service.featuresAr.map((feature, idx) => (
                <Feature key={idx}>{feature}</Feature>
              ))}
            </FeaturesList>

            {selectedService?.id === service.id && (
              <SetupForm>
                <Input
                  type="password"
                  placeholder="Enter API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </SetupForm>
            )}

            <ButtonGroup>
              {service.status === 'active' ? (
                <DeactivateBtn onClick={() => handleDeactivate(service.id)}>
                  <X size={16} />
                  Deactivate
                </DeactivateBtn>
              ) : (
                <ActivateBtn onClick={() => handleActivate(service.id)}>
                  <Check size={16} />
                  {selectedService?.id === service.id ? 'Confirm Activation' : 'Activate'}
                </ActivateBtn>
              )}
              
              {service.setupUrl && (
                <SetupBtn onClick={() => window.open(service.setupUrl, '_blank')}>
                  <Settings size={16} />
                  Service Setup
                </SetupBtn>
              )}
              
              {service.docsUrl && (
                <DocsBtn onClick={() => window.open(service.docsUrl, '_blank')}>
                  <ExternalLink size={16} />
                  Documentation
                </DocsBtn>
              )}
            </ButtonGroup>
          </ServiceCard>
        ))}
      </ServicesGrid>
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #ffd700;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #aaa;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

const ServiceCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 2px solid rgba(255, 215, 0, 0.2);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 215, 0, 0.5);
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(255, 215, 0, 0.2);
  }
`;

const ServiceIcon = styled.div`
  font-size: 4rem;
  text-align: center;
  margin-bottom: 1rem;
`;

const ServiceName = styled.h2`
  font-size: 1.5rem;
  color: #fff;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const ServiceDesc = styled.p`
  font-size: 1rem;
  color: #aaa;
  text-align: center;
  margin-bottom: 1rem;
`;

const StatusBadge = styled.div<{ color: string }>`
  display: inline-block;
  padding: 0.5rem 1rem;
  background: ${props => props.color}22;
  color: ${props => props.color};
  border: 1px solid ${props => props.color};
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 1rem auto;
  display: block;
  width: fit-content;
`;

const FeaturesList = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const FeaturesTitle = styled.div`
  font-size: 0.9rem;
  color: #ffd700;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Feature = styled.div`
  font-size: 0.85rem;
  color: #ccc;
  padding: 0.25rem 0;
  padding-right: 1rem;
  position: relative;

  &:before {
    content: '•';
    position: absolute;
    right: 0;
    color: #ffd700;
  }
`;

const SetupForm = styled.div`
  margin: 1rem 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #ffd700;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
`;

const BaseBtn = styled.button`
  flex: 1;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ActivateBtn = styled(BaseBtn)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;

  &:hover {
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
`;

const DeactivateBtn = styled(BaseBtn)`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;

  &:hover {
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }
`;

const SetupBtn = styled(BaseBtn)`
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;

  &:hover {
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  }
`;

const DocsBtn = styled(BaseBtn)`
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;

  &:hover {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }
`;

export default CloudServicesManager;

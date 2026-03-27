import React from 'react';
import styled from 'styled-components';
import { Activity, Globe, BarChart2, Zap, Database, Layers, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IoTManagementLinks: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Section>
            <SectionTitle><Globe size={18} /> IoT Management</SectionTitle>
            <LinksGrid>
                <LinkCard onClick={() => navigate('/iot-dashboard')}>
                    <LinkIcon><Activity size={20} /></LinkIcon>
                    <LinkName>IoT Dashboard</LinkName>
                    <LinkDesc>IoT device dashboard</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => navigate('/car-tracking')}>
                    <LinkIcon><Globe size={20} /></LinkIcon>
                    <LinkName>Car Tracking</LinkName>
                    <LinkDesc>Live car tracking</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => navigate('/iot-analytics')}>
                    <LinkIcon><BarChart2 size={20} /></LinkIcon>
                    <LinkName>IoT Analytics</LinkName>
                    <LinkDesc>IoT data analytics</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => window.open('https://700633997329-ggu6enoq.us-east-1.console.aws.amazon.com/iot/home?region=us-east-1#/connectdevice', '_blank')}>
                    <LinkIcon><Zap size={20} /></LinkIcon>
                    <LinkName>AWS IoT Console</LinkName>
                    <LinkDesc>AWS IoT console</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => window.open('https://700633997329-ggu6enoq.us-east-1.console.aws.amazon.com/dynamodb/home?region=us-east-1#tables:', '_blank')}>
                    <LinkIcon><Database size={20} /></LinkIcon>
                    <LinkName>DynamoDB Tables</LinkName>
                    <LinkDesc>IoT data tables</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => window.open('https://700633997329-ggu6enoq.us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1', '_blank')}>
                    <LinkIcon><Activity size={20} /></LinkIcon>
                    <LinkName>CloudWatch</LinkName>
                    <LinkDesc>Performance monitoring</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => navigate('/admin/integration-status')}>
                    <LinkIcon><Layers size={20} /></LinkIcon>
                    <LinkName>Integration Status</LinkName>
                    <LinkDesc>Cloud services integration status</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => navigate('/admin/setup')}>
                    <LinkIcon><Settings size={20} /></LinkIcon>
                    <LinkName>Quick Setup</LinkName>
                    <LinkDesc>Quick service setup</LinkDesc>
                </LinkCard>
            </LinksGrid>
        </Section>
    );
};

const Section = styled.div`
  padding: 24px 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid #2d3748;
  background: #0f1419;
  border-radius: 8px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  color: #f8fafc;
  text-align: center;
  margin-bottom: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const LinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto;
`;

const LinkCard = styled.div`
  background: #1e2432;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    border-color: #8B5CF6;
    background: #252b3a;
    transform: translateY(-2px);
  }
`;

const LinkIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
  color: #8B5CF6;
`;

const LinkName = styled.div`
  font-size: 13px;
  color: #f8fafc;
  font-weight: 600;
  margin-bottom: 4px;
`;

const LinkDesc = styled.div`
  font-size: 11px;
  color: #94a3b8;
`;

export default IoTManagementLinks;


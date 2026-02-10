import React from 'react';
import styled from 'styled-components';
import { BarChart2, Settings, DollarSign, FileText, Key, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIManagementLinks: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Section>
            <SectionTitle><Cpu size={18} /> إدارة الذكاء الاصطناعي</SectionTitle>
            <LinksGrid>
                <LinkCard onClick={() => navigate('/ai-dashboard')}>
                    <LinkIcon><BarChart2 size={20} /></LinkIcon>
                    <LinkName>AI Dashboard</LinkName>
                    <LinkDesc>لوحة تحكم الذكاء الاصطناعي</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => navigate('/admin/ai-quotas')}>
                    <LinkIcon><Settings size={20} /></LinkIcon>
                    <LinkName>AI Quotas Manager</LinkName>
                    <LinkDesc>إدارة حصص المستخدمين</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/firestore/databases/-default-/data/~2Fai_quotas', '_blank')}>
                    <LinkIcon><DollarSign size={20} /></LinkIcon>
                    <LinkName>AI Quotas</LinkName>
                    <LinkDesc>حصص المستخدمين</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/firestore/databases/-default-/data/~2Fai_usage_logs', '_blank')}>
                    <LinkIcon><FileText size={20} /></LinkIcon>
                    <LinkName>Usage Logs</LinkName>
                    <LinkDesc>سجل الاستخدام</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}>
                    <LinkIcon><Key size={20} /></LinkIcon>
                    <LinkName>Gemini API Keys</LinkName>
                    <LinkDesc>مفاتيح API</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => window.open('https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com', '_blank')}>
                    <LinkIcon><Settings size={20} /></LinkIcon>
                    <LinkName>API Settings</LinkName>
                    <LinkDesc>إعدادات API</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => window.open('https://console.cloud.google.com/billing', '_blank')}>
                    <LinkIcon><DollarSign size={20} /></LinkIcon>
                    <LinkName>Billing</LinkName>
                    <LinkDesc>الفوترة والتكاليف</LinkDesc>
                </LinkCard>
            </LinksGrid>
        </Section>
    );
};

// Reusing styles for consistency
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
    border-color: #ff8c61;
    background: #252b3a;
    transform: translateY(-2px);
  }
`;

const LinkIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
  color: #ff8c61;
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

export default AIManagementLinks;

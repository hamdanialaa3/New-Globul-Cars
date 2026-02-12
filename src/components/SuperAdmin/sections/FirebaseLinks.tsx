import React from 'react';
import styled from 'styled-components';
import { Database, Image, Users, Zap, Globe, BarChart2, Flame } from 'lucide-react';

const FirebaseLinks: React.FC = () => {
    return (
        <Section>
            <SectionTitle><Flame size={18} /> Firebase Quick Links</SectionTitle>
            <LinksGrid>
                <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/firestore/databases/-default-/data', '_blank')}>
                    <LinkIcon><Database size={20} /></LinkIcon>
                    <LinkName>Firestore Database</LinkName>
                    <LinkDesc>View & manage data</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/storage', '_blank')}>
                    <LinkIcon><Image size={20} /></LinkIcon>
                    <LinkName>Storage</LinkName>
                    <LinkDesc>Images & files</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/authentication/users', '_blank')}>
                    <LinkIcon><Users size={20} /></LinkIcon>
                    <LinkName>Authentication</LinkName>
                    <LinkDesc>Registered users</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/functions', '_blank')}>
                    <LinkIcon><Zap size={20} /></LinkIcon>
                    <LinkName>Cloud Functions</LinkName>
                    <LinkDesc>Cloud functions</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/hosting', '_blank')}>
                    <LinkIcon><Globe size={20} /></LinkIcon>
                    <LinkName>Hosting</LinkName>
                    <LinkDesc>Website hosting</LinkDesc>
                </LinkCard>

                <LinkCard onClick={() => window.open('https://console.firebase.google.com/project/fire-new-globul/analytics', '_blank')}>
                    <LinkIcon><BarChart2 size={20} /></LinkIcon>
                    <LinkName>Analytics</LinkName>
                    <LinkDesc>Usage statistics</LinkDesc>
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
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #f8fafc;
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

export default FirebaseLinks;

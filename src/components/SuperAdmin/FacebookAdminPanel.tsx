// Facebook Admin Panel for Super Admin Dashboard
// Complete Facebook management interface
// Koli One

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Facebook, MessageCircle, TrendingUp, Users, DollarSign, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

const PanelContainer = styled.div`
  background: #0f1419;
  border-radius: 12px;
  padding: 32px;
  border: 1px solid #2d3748;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #2d3748;
`;

const PanelTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #ff8c61;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #ff8c61;
  color: #0f1419;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ffa885;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #1e2432;
  color: #f8fafc;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #2d3748;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #ff8c61;
    background: #252b3a;
    transform: translateY(-4px);
  }

  .stat-label {
    font-size: 11px;
    font-weight: 700;
    color: #cbd5e1;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .stat-value {
    font-size: 26px;
    font-weight: 700;
    color: #f8fafc;
    margin-bottom: 4px;
  }
  
  .stat-icon {
    color: #ff8c61;
    opacity: 1;
  }
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #ff8c61;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const QuickLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const QuickLinkButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #141a21;
  border: 1px solid #2d3748;
  border-radius: 8px;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background: #1e2432;
    border-color: #ff8c61;
    color: #f8fafc;
    transform: translateY(-2px);
  }
  
  .link-content {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 600;
  }
`;

const StatusBadge = styled.span<{ status: 'active' | 'inactive' | 'pending' }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'active':
        return 'background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid #10b981;';
      case 'inactive':
        return 'background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444;';
      case 'pending':
        return 'background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid #f59e0b;';
    }
  }}
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  
  th {
    text-align: left;
    padding: 16px;
    background: #141a21;
    font-weight: 700;
    color: #cbd5e1;
    border-bottom: 1px solid #2d3748;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  td {
    padding: 16px;
    border-bottom: 1px solid #2d3748;
    color: #cbd5e1;
    font-size: 13px;
    font-weight: 500;
  }

  tr:hover td {
    background: #1e2432;
    color: #f8fafc;
  }
`;

interface FacebookAdminPanelProps {
  language: 'bg' | 'en';
}

const FacebookAdminPanel: React.FC<FacebookAdminPanelProps> = ({ language }) => {
  const [stats, setStats] = useState({
    pageFollowers: 0,
    monthlyReach: 0,
    activeAds: 0,
    messagePending: 0,
    deletionRequests: 0
  });

  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    // Simulated stats - replace with actual Facebook API calls
    setTimeout(() => {
      setStats({
        pageFollowers: 1250,
        monthlyReach: 15800,
        activeAds: 3,
        messagePending: 5,
        deletionRequests: 0
      });
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>
          <Facebook size={24} />
          {language === 'bg' ? 'Управление на Facebook' : 'Facebook Management'}
        </PanelTitle>
        <RefreshButton onClick={loadStats} disabled={loading}>
          <RefreshCw size={16} />
          {language === 'bg' ? 'Обнови' : 'Refresh'}
        </RefreshButton>
      </PanelHeader>

      {/* Statistics */}
      <StatsGrid>
        <StatCard>
          <div className="stat-label">
            {language === 'bg' ? 'Последователи' : 'Followers'}
          </div>
          <div className="stat-value">{stats.pageFollowers.toLocaleString()}</div>
          <div className="stat-icon">
            <Users size={20} />
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-label">
            {language === 'bg' ? 'Месечен обхват' : 'Monthly Reach'}
          </div>
          <div className="stat-value">{stats.monthlyReach.toLocaleString()}</div>
          <div className="stat-icon">
            <TrendingUp size={20} />
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-label">
            {language === 'bg' ? 'Активни реклами' : 'Active Ads'}
          </div>
          <div className="stat-value">{stats.activeAds}</div>
          <div className="stat-icon">
            <DollarSign size={20} />
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-label">
            {language === 'bg' ? 'Чакащи съобщения' : 'Pending Messages'}
          </div>
          <div className="stat-value">{stats.messagePending}</div>
          <div className="stat-icon">
            <MessageCircle size={20} />
          </div>
        </StatCard>
      </StatsGrid>

      {/* Quick Links */}
      <SectionTitle>
        <ExternalLink size={18} />
        {language === 'bg' ? 'Бързи връзки' : 'Quick Links'}
      </SectionTitle>

      <QuickLinks>
        <QuickLinkButton
          href="https://www.facebook.com/people/Bulgarian-Car-Marketplace/100080260449528/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="link-content">
            <Facebook size={18} color="#1877f2" />
            <span>{language === 'bg' ? 'Facebook страница' : 'Facebook Page'}</span>
          </div>
          <ExternalLink size={16} />
        </QuickLinkButton>

        <QuickLinkButton
          href="https://business.facebook.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="link-content">
            <DollarSign size={18} />
            <span>{language === 'bg' ? 'Ads Manager' : 'Ads Manager'}</span>
          </div>
          <ExternalLink size={16} />
        </QuickLinkButton>

        <QuickLinkButton
          href="https://developers.facebook.com/apps/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="link-content">
            <AlertCircle size={18} />
            <span>{language === 'bg' ? 'App настройки' : 'App Settings'}</span>
          </div>
          <ExternalLink size={16} />
        </QuickLinkButton>

        <QuickLinkButton
          href="https://www.facebook.com/business/help"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="link-content">
            <MessageCircle size={18} />
            <span>{language === 'bg' ? 'Messenger входяща кутия' : 'Messenger Inbox'}</span>
          </div>
          <ExternalLink size={16} />
        </QuickLinkButton>
      </QuickLinks>

      {/* Integration Status */}
      <SectionTitle>
        {language === 'bg' ? 'Състояние на интеграцията' : 'Integration Status'}
      </SectionTitle>

      <DataTable>
        <thead>
          <tr>
            <th>{language === 'bg' ? 'Компонент' : 'Component'}</th>
            <th>{language === 'bg' ? 'Състояние' : 'Status'}</th>
            <th>{language === 'bg' ? 'Забележка' : 'Note'}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Facebook Login</td>
            <td><StatusBadge status="active">{language === 'bg' ? 'Активен' : 'Active'}</StatusBadge></td>
            <td>{language === 'bg' ? 'Работи' : 'Working'}</td>
          </tr>
          <tr>
            <td>Facebook Pixel</td>
            <td><StatusBadge status="active">{language === 'bg' ? 'Активен' : 'Active'}</StatusBadge></td>
            <td>{language === 'bg' ? 'Проследяване' : 'Tracking'}</td>
          </tr>
          <tr>
            <td>Messenger Widget</td>
            <td><StatusBadge status="active">{language === 'bg' ? 'Активен' : 'Active'}</StatusBadge></td>
            <td>{language === 'bg' ? 'Чат налични' : 'Chat available'}</td>
          </tr>
          <tr>
            <td>Data Deletion API</td>
            <td><StatusBadge status="active">{language === 'bg' ? 'Активен' : 'Active'}</StatusBadge></td>
            <td>GDPR {language === 'bg' ? 'съответствие' : 'compliant'}</td>
          </tr>
          <tr>
            <td>Messenger Webhook</td>
            <td><StatusBadge status="active">{language === 'bg' ? 'Активен' : 'Active'}</StatusBadge></td>
            <td>{language === 'bg' ? 'Автоматични отговори' : 'Auto-responses'}</td>
          </tr>
        </tbody>
      </DataTable>
    </PanelContainer>
  );
};

export default FacebookAdminPanel;


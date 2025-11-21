// Facebook Admin Panel for Super Admin Dashboard
// Complete Facebook management interface
// Bulgarian Car Marketplace

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Facebook, MessageCircle, TrendingUp, Users, DollarSign, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

const PanelContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #1877f2;
`;

const PanelTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1877f2;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #1877f2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    background: #166fe5;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  
  .stat-label {
    font-size: 0.875rem;
    opacity: 0.9;
    margin-bottom: 0.5rem;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }
  
  .stat-icon {
    opacity: 0.7;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  padding: 1rem;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  color: #212529;
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
    border-color: #1877f2;
    transform: translateY(-2px);
  }
  
  .link-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
`;

const StatusBadge = styled.span<{ status: 'active' | 'inactive' | 'pending' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${props => {
    switch (props.status) {
      case 'active':
        return 'background: #d4edda; color: #155724;';
      case 'inactive':
        return 'background: #f8d7da; color: #721c24;';
      case 'pending':
        return 'background: #fff3cd; color: #856404;';
    }
  }}
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 0.75rem;
    background: #f8f9fa;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
  }
  
  td {
    padding: 0.75rem;
    border-bottom: 1px solid #dee2e6;
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


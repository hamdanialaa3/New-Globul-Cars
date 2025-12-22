import React from 'react';
import styled from 'styled-components';
import {
  BarChart3,
  Users,
  Shield,
  FileText,
  Bell,
  Settings,
  Database,
  Activity,
  Facebook,
  FolderOpen,
  Network
} from 'lucide-react';

interface AdminNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationTabs = styled.div`
  display: flex;
  gap: 4px;
  background: #ffffff;
  padding: 4px;
  border-radius: 4px;
  margin: 0 20px 20px 20px;
  border: 1px solid #e0e0e0;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #d0d0d0 #f5f5f5;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d0d0d0;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #999999;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 8px 14px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  min-width: fit-content;
  
  ${props => props.$active ? `
    background: #1a1a1a;
    color: #ffffff;
    border-color: #d0d0d0;
  ` : `
    background: transparent;
    color: #666666;
    border-color: transparent;
    &:hover {
      background: #f5f5f5;
      color: #1a1a1a;
    }
  `}
`;

const AdminNavigation: React.FC<AdminNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'project', label: 'Project', icon: FolderOpen },
    { id: 'architecture', label: 'Architecture', icon: Network },
    { id: 'facebook', label: 'Facebook', icon: Facebook },
    { id: 'realdata', label: 'Real Data', icon: Database },
    { id: 'charts', label: 'Charts', icon: Activity },
    { id: 'data', label: 'Data', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'audit', label: 'Audit', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'content', label: 'Content', icon: Settings }
  ];

  return (
    <NavigationTabs>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <TabButton
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            <IconComponent size={14} />
            {tab.label}
          </TabButton>
        );
      })}
    </NavigationTabs>
  );
};

export default AdminNavigation;

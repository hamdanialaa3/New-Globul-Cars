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
  gap: 6px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 6px;
  border-radius: 12px;
  margin: 0 20px 30px 20px;
  border: 2px solidrgb(0, 153, 255);
  box-shadow: 0 5px 20px rgba(0, 255, 204, 0.2);
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color:rgb(17, 203, 231) #1a1a1a;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background:rgb(7, 156, 236);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background:rgb(78, 214, 255);
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: 2px solid transparent;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  min-width: fit-content;
  
  ${props => props.$active ? `
    background: linear-gradient(135deg,rgb(59, 166, 243) 0%,rgb(3, 167, 222) 100%);
    color: #000000;
    border-color:rgb(21, 200, 255);
    box-shadow: 0 3px 10px rgba(0, 157, 255, 0.4);
    transform: translateY(-1px);
  ` : `
    background: transparent;
    color:rgb(0, 179, 255);
    border-color: transparent;
    &:hover {
      background: rgba(255, 215, 0, 0.1);
      color:rgb(39, 232, 236);
      border-color:rgb(25, 216, 216);
      transform: translateY(-1px);
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

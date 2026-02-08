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
  Network,
  Sparkles,
  Target,
  Megaphone,
  LayoutGrid,
  Sliders,
  Palette,
  Tag,
  Globe as GlobeIcon,
  Zap,
  Archive
} from 'lucide-react';

interface AdminNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationTabs = styled.div`
  display: flex;
  gap: 6px;
  background: #1e2432;
  padding: 6px;
  border-radius: 8px;
  margin: 0 20px 24px 20px;
  border: 1px solid #2d3748;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #ff8c61 #0f1419;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #0f1419;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #2d3748;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #ff8c61;
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
    background: #ff8c61;
    color: #0f1419;
    font-weight: 700;
  ` : `
    background: transparent;
    color: #cbd5e1;
    border-color: transparent;
    &:hover {
      background: #2d3748;
      color: #ff8c61;
    }
  `}
`;

const AdminNavigation: React.FC<AdminNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sections', label: 'Sections', icon: LayoutGrid },
    { id: 'settings', label: 'Site Settings', icon: Sliders },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'featured', label: 'Featured', icon: Tag },
    { id: 'seo', label: 'SEO', icon: GlobeIcon },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'backup', label: 'Backup', icon: Archive },
    { id: 'actions', label: 'Quick Actions', icon: Zap },
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
    { id: 'content', label: 'Content', icon: Settings },
    { id: 'ads', label: 'Ads Management', icon: Target },
    { id: 'ai', label: 'DeepSeek AI', icon: Sparkles }
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

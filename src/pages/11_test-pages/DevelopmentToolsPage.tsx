import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { 
  Home, User, Box, Shield, Settings, FileText, 
  Map, MessageSquare, CreditCard, ChevronDown, 
  ChevronRight, LayoutDashboard, Globe, ExternalLink, Zap, Activity
} from 'lucide-react';

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 100px 40px;
  background: var(--bg-primary, #0B0E14);
  color: var(--text-primary, #ffffff);
  font-family: 'Exo 2', sans-serif;
  overflow-x: auto;
  
  @media (max-width: 768px) {
    padding: 80px 20px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto;
`;

const TreeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  gap: 80px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

// Tree Node Hierarchy CSS
const Branch = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  
  /* Vertical line going down from parent */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 30px;
    background: linear-gradient(to bottom, rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.5));
    transform: translateX(-50%);
    z-index: -1;
  }
`;

const ChildrenContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding-top: 30px;
  position: relative;
  width: 100%;
  
  /* Horizontal connective line */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 5%;
    right: 5%;
    height: 2px;
    background: linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.5), rgba(59, 130, 246, 0.2));
    z-index: -1;
  }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
`;

const NodeCard = styled.div<{ $isRoot?: boolean, $isTerminal?: boolean }>`
  width: ${props => props.$isRoot ? '240px' : '180px'};
  background: rgba(20, 25, 40, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  padding: ${props => props.$isRoot ? '24px 20px' : '16px 12px'};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 10;
  
  ${props => props.$isRoot && css`
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9));
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1);
  `}

  &:hover {
    transform: translateY(-8px) scale(1.05);
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(139, 92, 246, 0.8);
    box-shadow: 0 15px 40px rgba(139, 92, 246, 0.3);
    ${props => !props.$isRoot && css`
      animation: ${pulse} 1.5s infinite;
    `}
  }
`;

const NodeIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px ${props => props.$color}40;
`;

const NodeTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 4px;
`;

const NodePath = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
  font-family: monospace;
  background: rgba(0,0,0,0.3);
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  
  &:hover {
    color: #38bdf8;
  }
`;

interface PageNode {
  title: string;
  path: string;
  icon: any;
  color: string;
  children?: PageNode[];
}

const siteMap: PageNode[] = [
  {
    title: 'Core & Search',
    path: '/',
    icon: Globe,
    color: '#00F2FE',
    children: [
      { title: 'Home', path: '/', icon: Home, color: '#38bdf8' },
      { title: 'Search', path: '/search', icon: Zap, color: '#38bdf8' },
      { title: 'Advanced Search', path: '/advanced-search', icon: Zap, color: '#38bdf8' },
      { title: 'Visual Search', path: '/visual-search', icon: Globe, color: '#38bdf8' },
      { title: 'Interactive Map', path: '/map', icon: Map, color: '#38bdf8' },
      { title: 'Top Brands', path: '/top-brands', icon: Box, color: '#38bdf8' },
      { title: 'Brand Gallery', path: '/brand-gallery', icon: Box, color: '#38bdf8' },
      { title: 'All Cars', path: '/all-cars', icon: Box, color: '#38bdf8' }
    ]
  },
  {
    title: 'Car Details & Selling',
    path: '/sell/auto',
    icon: FileText,
    color: '#a855f7',
    children: [
      { title: 'Car Specs', path: '/car/1/1', icon: FileText, color: '#c084fc' },
      { title: 'Car History', path: '/car/1/1/history', icon: FileText, color: '#c084fc' },
      { title: 'Sell Auto', path: '/sell/auto', icon: Zap, color: '#c084fc' },
      { title: 'Edit Car', path: '/car/1/1/edit', icon: Settings, color: '#c084fc' },
      { title: 'AI Valuation', path: '/valuation', icon: ExternalLink, color: '#c084fc' },
      { title: 'AI Pricing', path: '/pricing', icon: ExternalLink, color: '#c084fc' },
      { title: 'AI Analysis', path: '/ai-analysis', icon: ExternalLink, color: '#c084fc' }
    ]
  },
  {
    title: 'User Portal',
    path: '/profile/1',
    icon: User,
    color: '#10b981',
    children: [
      { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, color: '#34d399' },
      { title: 'Profile', path: '/profile/1', icon: User, color: '#34d399' },
      { title: 'Realtime Messages', path: '/messages', icon: MessageSquare, color: '#34d399' },
      { title: 'My Listings', path: '/my-listings', icon: Box, color: '#34d399' },
      { title: 'My Drafts', path: '/my-drafts', icon: Box, color: '#34d399' },
      { title: 'Saved Searches', path: '/saved-searches', icon: Box, color: '#34d399' },
      { title: 'Favorites', path: '/favorites', icon: Box, color: '#34d399' },
      { title: 'Notifications', path: '/notifications', icon: Globe, color: '#34d399' },
      { title: 'Car Tracking', path: '/car-tracking', icon: Activity, color: '#34d399' }
    ]
  },
  {
    title: 'Billing & Market',
    path: '/marketplace',
    icon: CreditCard,
    color: '#f59e0b',
    children: [
      { title: 'Parts Market', path: '/marketplace', icon: Box, color: '#fbbf24' },
      { title: 'Auctions', path: '/auctions', icon: Globe, color: '#fbbf24' },
      { title: 'Finance Calc', path: '/finance', icon: CreditCard, color: '#fbbf24' },
      { title: 'Checkout', path: '/checkout/1', icon: CreditCard, color: '#fbbf24' },
      { title: 'Invoices', path: '/invoices', icon: FileText, color: '#fbbf24' },
      { title: 'Manual Pay', path: '/billing/manual-checkout', icon: CreditCard, color: '#fbbf24' },
      { title: 'Subscription', path: '/subscription', icon: Shield, color: '#fbbf24' },
      { title: 'Stripe Setup', path: '/dealer/stripe-setup', icon: CreditCard, color: '#fbbf24' }
    ]
  },
  {
    title: 'Dealers & Admins',
    path: '/admin',
    icon: Shield,
    color: '#ef4444',
    children: [
      { title: 'Admin Dash', path: '/admin', icon: Shield, color: '#f87171' },
      { title: 'Super Admin', path: '/super-admin', icon: Shield, color: '#f87171' },
      { title: 'Car Mgmt', path: '/admin-car-management', icon: Box, color: '#f87171' },
      { title: 'Cloud Svcs', path: '/admin/cloud-services', icon: Globe, color: '#f87171' },
      { title: 'Algolia Sync', path: '/admin/algolia-sync', icon: Zap, color: '#f87171' },
      { title: 'Dealer Dash', path: '/dealer-dashboard', icon: LayoutDashboard, color: '#f87171' },
      { title: 'Dealer Public', path: '/dealer/public', icon: User, color: '#f87171' },
      { title: 'Company Team', path: '/company/team', icon: User, color: '#f87171' },
      { title: 'Analytics', path: '/company/analytics', icon: Activity, color: '#f87171' }
    ]
  },
  {
    title: 'Content & SEO',
    path: '/blog',
    icon: Globe,
    color: '#ec4899',
    children: [
      { title: 'Blog Hub', path: '/blog', icon: FileText, color: '#f472b6' },
      { title: 'Social Hub', path: '/social-hub', icon: Globe, color: '#f472b6' },
      { title: 'City: Sofia', path: '/city/sofia', icon: Map, color: '#f472b6' },
      { title: 'Launch Offer', path: '/launch-offer', icon: Box, color: '#f472b6' },
      { title: 'Comparison', path: '/competitive-comparison', icon: FileText, color: '#f472b6' },
      { title: 'About Us', path: '/about', icon: FileText, color: '#f472b6' },
      { title: 'Why Us', path: '/why-us', icon: Globe, color: '#f472b6' }
    ]
  },
  {
    title: 'Legal & Help',
    path: '/help',
    icon: Box,
    color: '#64748b',
    children: [
      { title: 'Help & Support', path: '/help', icon: ExternalLink, color: '#94a3b8' },
      { title: 'Contact Us', path: '/contact', icon: ExternalLink, color: '#94a3b8' },
      { title: 'Privacy Policy', path: '/privacy-policy', icon: FileText, color: '#94a3b8' },
      { title: 'Terms of Service', path: '/terms-of-service', icon: FileText, color: '#94a3b8' },
      { title: 'Cookie Policy', path: '/cookie-policy', icon: FileText, color: '#94a3b8' },
      { title: 'Data Deletion', path: '/data-deletion', icon: FileText, color: '#94a3b8' }
    ]
  }
];

const TreeNode: React.FC<{ node: PageNode, isRoot?: boolean }> = ({ node, isRoot }) => {
  const navigate = useNavigate();
  const Icon = node.icon;

  return (
    <Branch>
      <NodeCard 
        $isRoot={isRoot} 
        onClick={() => {
          if (node.path !== '#') {
            window.open(node.path, '_blank');
          }
        }}
      >
        <NodeIcon $color={node.color}>
          <Icon size={isRoot ? 28 : 20} strokeWidth={2.5} />
        </NodeIcon>
        <NodeTitle>{node.title}</NodeTitle>
        <NodePath>
          {node.path}
          {!isRoot && <ExternalLink size={12} />}
        </NodePath>
      </NodeCard>
      
      {node.children && node.children.length > 0 && (
        <ChildrenContainer>
          {node.children.map((child, idx) => (
            <TreeNode key={idx} node={child} isRoot={false} />
          ))}
        </ChildrenContainer>
      )}
    </Branch>
  );
};

export const DevelopmentToolsPage: React.FC = () => {
  return (
    <PageContainer>
      <Header>
        <Title>Site Architecture</Title>
        <Subtitle>
          Interactive programmatic tree view of Koli One's routing ecosystem.
          Click any miniature node to teleport into that section of the platform.
        </Subtitle>
      </Header>
      
      <TreeContainer>
        {siteMap.map((root, index) => (
          <TreeNode key={index} node={root} isRoot={true} />
        ))}
      </TreeContainer>
    </PageContainer>
  );
};

export default DevelopmentToolsPage;

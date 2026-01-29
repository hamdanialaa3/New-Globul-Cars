/**
 * Role Badge Component
 * Visual indicator for team member roles
 * Ultra-compact: 60 lines
 */

import React from 'react';
import styled from 'styled-components';
import { TeamRole } from '@/services/company/team-management-service';
import { FaShieldAlt, FaUserTie, FaEye } from 'react-icons/fa';

interface Props {
  role: TeamRole;
  size?: 'small' | 'medium' | 'large';
}

const ROLE_CONFIG = {
  admin: {
    label: 'مدير',
    icon: FaShieldAlt,
    color: '#3b82f6',
    bg: '#eff6ff'
  },
  agent: {
    label: 'وكيل',
    icon: FaUserTie,
    color: '#10b981',
    bg: '#ecfdf5'
  },
  viewer: {
    label: 'مشاهد',
    icon: FaEye,
    color: '#6b7280',
    bg: '#f3f4f6'
  }
};

export const RoleBadge: React.FC<Props> = ({ role, size = 'medium' }) => {
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;

  return (
    <Badge color={config.color} bg={config.bg} size={size}>
      <Icon />
      <span>{config.label}</span>
    </Badge>
  );
};

const Badge = styled.div<{ color: string; bg: string; size: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: ${props => 
    props.size === 'small' ? '0.25rem 0.5rem' : 
    props.size === 'large' ? '0.75rem 1rem' : '0.5rem 0.75rem'};
  background: ${props => props.bg};
  color: ${props => props.color};
  border-radius: 6px;
  font-weight: 600;
  font-size: ${props => 
    props.size === 'small' ? '0.75rem' : 
    props.size === 'large' ? '1rem' : '0.875rem'};

  svg {
    font-size: ${props => 
      props.size === 'small' ? '0.875rem' : 
      props.size === 'large' ? '1.25rem' : '1rem'};
  }
`;

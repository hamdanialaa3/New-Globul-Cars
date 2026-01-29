import React from 'react';
import { ToggleSwitchContainer, ToggleLabel } from '../CarDetailsPage.styles';

export const ToggleSwitch: React.FC<{ 
  isOn: boolean; 
  onToggle: () => void;
  label?: string;
}> = ({ isOn, onToggle, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    <ToggleSwitchContainer $isOn={isOn} onClick={onToggle} title={isOn ? 'Active' : 'Inactive'} />
    {label && <ToggleLabel>{label}</ToggleLabel>}
  </div>
);


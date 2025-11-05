// src/pages/AdvancedSearchPage/styles.ts
// Styled components for Advanced Search Page
// Inspired by mobile.de design system

import styled from 'styled-components';

// Mobile.de Exact Colors - Professional Design System
export const colors = {
  primary: {
    orange: '#FF7900',      // Mobile.de main orange
    orangeHover: '#E86900', // Orange hover state
    orangeLight: '#FFF4ED', // Light orange background
    blue: '#0066CC',        // Mobile.de blue
    blueHover: '#0052A3',   // Blue hover state
  },
  neutral: {
    white: '#FFFFFF',
    grayBg: '#F8F9FA',      // Main background
    grayLight: '#F1F3F4',   // Light gray
    grayBorder: '#E1E5E9',  // Border color
    grayText: '#5F6368',    // Secondary text
    grayDark: '#3C4043',    // Primary text
    black: '#000000',
  },
  text: {
    primary: '#202124',     // Main text color
    secondary: '#5F6368',   // Secondary text
    link: '#1A73E8',        // Link color
  }
};

// Mobile.de Exact Layout Container
export const SearchContainer = styled.div`
  min-height: 100vh;
  background: ${colors.neutral.grayBg};
  padding: 24px 0;
  direction: ltr;
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  direction: ltr;
`;

// Mobile.de Header Style - Simple and Clean
export const HeaderSection = styled.div`
  margin-bottom: 24px;
  text-align: left;

  h1 {
    font-size: 28px;
    font-weight: 400;
    color: ${colors.text.primary};
    margin: 0 0 8px 0;
    line-height: 1.2;
  }

  p {
    font-size: 14px;
    color: ${colors.text.secondary};
    margin: 0;
    line-height: 1.4;
  }
`;

// Mobile.de Form Container - Exact Style with Sections
export const SearchForm = styled.form`
  background: ${colors.neutral.white};
  border: 1px solid ${colors.neutral.grayBorder};
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  overflow: hidden;
`;

// Section Card - Mobile.de Style
export const SectionCard = styled.div`
  border-bottom: 1px solid ${colors.neutral.grayBorder};

  &:last-child {
    border-bottom: none;
  }
`;

// Section Header - Clickable Mobile.de Style
export const SectionHeader = styled.div<{ $isOpen: boolean }>`
  background: ${props => props.$isOpen ? colors.neutral.grayLight : colors.neutral.white};
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${colors.neutral.grayLight};
  }
`;

// Section Content - Expandable
export const SectionContent = styled.div<{ $isOpen: boolean }>`
  max-height: ${props => props.$isOpen ? '2000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: ${colors.neutral.white};
`;

// Section Body - Padding for content
export const SectionBody = styled.div`
  padding: 20px;
`;

// Mobile.de Section Title Style
export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.text.primary};
  margin: 0;
  padding: 0;
  border: none;
`;

// Expand/Collapse Icon
export const ExpandIcon = styled.span<{ $isOpen: boolean }>`
  font-size: 14px;
  color: ${colors.text.secondary};
  transition: transform 0.2s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};

  &::before {
    content: '▼';
  }
`;

// Mobile.de Grid Layout - Multi-column like original
export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Mobile.de Form Group Style
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-weight: 400;
    color: ${colors.text.primary};
    font-size: 14px;
    margin: 0;
    line-height: 1.4;
  }
`;

// Mobile.de Input Style - Exact Match
export const SearchInput = styled.input`
  padding: 12px 16px;
  background: ${colors.neutral.white};
  border: 1px solid ${colors.neutral.grayBorder};
  border-radius: 4px;
  font-size: 14px;
  color: ${colors.text.primary};
  transition: border-color 0.2s ease;
  height: 44px;
  line-height: 1.4;
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    color: ${colors.text.secondary};
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary.blue};
  }

  &:hover {
    border-color: ${colors.primary.blue};
  }
`;

// Mobile.de Select Style - Exact Match
export const SearchSelect = styled.select`
  padding: 12px 16px;
  background: ${colors.neutral.white};
  border: 1px solid ${colors.neutral.grayBorder};
  border-radius: 4px;
  font-size: 14px;
  color: ${colors.text.primary};
  cursor: pointer;
  transition: border-color 0.2s ease;
  height: 44px;
  line-height: 1.4;
  width: 100%;
  box-sizing: border-box;

  option {
    background: ${colors.neutral.white};
    color: ${colors.text.primary};
    padding: 8px 16px;
    font-size: 14px;
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary.blue};
  }

  &:hover {
    border-color: ${colors.primary.blue};
  }
`;

// Mobile.de Checkbox Group Style
export const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${colors.text.primary};
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  line-height: 1.4;
  white-space: nowrap;
  user-select: none;

  &:hover {
    background: rgba(0, 102, 204, 0.05);
  }

  /* Hide the default checkbox */
  input[type="checkbox"] {
    display: none;
  }
`;

// Custom circular checkbox style
export const CustomCheckbox = styled.div<{ checked: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.checked ? '#10B981' : 'rgba(239, 68, 68, 0.3)'};
  background: ${props => props.checked ? '#10B981' : 'rgba(239, 68, 68, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  flex-shrink: 0;

  /* Checkmark icon */
  &::after {
    content: '✓';
    color: white;
    font-size: 12px;
    font-weight: bold;
    opacity: ${props => props.checked ? 1 : 0};
    transform: ${props => props.checked ? 'scale(1)' : 'scale(0.3)'};
    transition: all 0.2s ease;
  }

  /* Hover effect */
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

// Mobile.de Range Input Group Style
export const RangeGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;

  span {
    color: ${colors.text.secondary};
    font-size: 14px;
    white-space: nowrap;
    padding: 0 4px;
  }

  input {
    flex: 1;
  }
`;

// Mobile.de Action Section - Horizontal Layout
export const ActionSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${colors.neutral.grayBorder};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchButton = styled.button`
  padding: 12px 32px;
  background: ${colors.primary.orange};
  color: ${colors.neutral.white};
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  height: 44px;
  min-width: 120px;

  &:hover {
    background: ${colors.primary.orangeHover};
  }

  &:active {
    background: ${colors.primary.orangeHover};
  }

  &:disabled {
    background: ${colors.neutral.grayBorder};
    cursor: not-allowed;
  }
`;

export const ResetButton = styled.button`
  padding: 12px 24px;
  background: ${colors.neutral.white};
  color: ${colors.text.secondary};
  border: 1px solid ${colors.neutral.grayBorder};
  border-radius: 4px;
  font-weight: 400;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 44px;
  min-width: 100px;

  &:hover {
    background: ${colors.neutral.grayLight};
    border-color: ${colors.primary.blue};
  }
`;

// Results Summary - Clean White Card
export const ResultsSummary = styled.div`
  background: ${colors.neutral.white};
  border: 1px solid ${colors.neutral.grayBorder};
  border-radius: 8px;
  padding: 2rem;
  margin-top: 2rem;
  text-align: left; /* Left align content */
  direction: ltr; /* Left-to-right direction */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h4 {
    color: ${colors.primary.blue};
    font-size: 1.3rem;
    margin-bottom: 1rem;
    text-align: left; /* Left align heading */
    direction: ltr; /* Left-to-right direction */
  }

  p {
    color: ${colors.text.secondary};
    font-size: 1rem;
    text-align: left; /* Left align paragraph */
    direction: ltr; /* Left-to-right direction */
  }
`;
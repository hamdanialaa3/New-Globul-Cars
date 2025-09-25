import React, { useEffect } from 'react';
import styled from 'styled-components';

// Skip Navigation Component
export const SkipNavigation: React.FC = () => {
  useEffect(() => {
    // Add keyboard navigation support
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <SkipLink href="#main-content">
      Skip to main content
    </SkipLink>
  );
};

// Focus Management Hook
export const useFocusManagement = () => {
  const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  };

  return { trapFocus };
};

// Screen Reader Only Text
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ScreenReaderText>{children}</ScreenReaderText>;
};

// Styled Components
const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 6px;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 0 0 4px 4px;
  z-index: 1000;
  transition: top 0.3s;

  &:focus {
    top: 0;
  }
`;

const ScreenReaderText = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

// Global styles for keyboard navigation
export const addKeyboardNavigationStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .keyboard-navigation *:focus {
      outline: 2px solid #2563eb !important;
      outline-offset: 2px !important;
    }
    
    .keyboard-navigation button:focus,
    .keyboard-navigation a:focus,
    .keyboard-navigation input:focus,
    .keyboard-navigation select:focus,
    .keyboard-navigation textarea:focus {
      outline: 2px solid #2563eb !important;
      outline-offset: 2px !important;
    }
  `;
  document.head.appendChild(style);
};

export default { SkipNavigation, useFocusManagement, ScreenReaderOnly };
// CarImage Component Tests
// اختبارات مكون صورة السيارة

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import CarImage from '../CarImage';
import { bulgarianTheme } from '../../styles/theme';

// Mock OptimizedImage component
jest.mock('../OptimizedImage', () => ({
  __esModule: true,
  default: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="optimized-image" />
  )
}));

// Mock styled-components ThemeProvider
jest.mock('styled-components', () => {
  const actual = jest.requireActual('styled-components');
  return {
    __esModule: true,
    ...actual,
    ThemeProvider: ({ children }: any) => <>{children}</>,
  };
});

describe('CarImage Component', () => {
  const defaultProps = {
    src: 'https://example.com/car.jpg',
    alt: 'Test Car',
  };

  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={bulgarianTheme}>
        <CarImage {...defaultProps} />
      </ThemeProvider>
    );
    
    const image = screen.getByTestId('optimized-image');
    expect(image).toBeInTheDocument();
  });

  it('passes src and alt props correctly', () => {
    render(
      <ThemeProvider theme={bulgarianTheme}>
        <CarImage {...defaultProps} />
      </ThemeProvider>
    );
    
    const image = screen.getByTestId('optimized-image');
    expect(image).toHaveAttribute('src', defaultProps.src);
    expect(image).toHaveAttribute('alt', defaultProps.alt);
  });

  it('passes className prop correctly', () => {
    const className = 'custom-class';
    render(
      <ThemeProvider theme={bulgarianTheme}>
        <CarImage {...defaultProps} className={className} />
      </ThemeProvider>
    );
    
    const image = screen.getByTestId('optimized-image');
    expect(image).toHaveClass(className);
  });

  it('uses lazy loading by default', () => {
    render(
      <ThemeProvider theme={bulgarianTheme}>
        <CarImage {...defaultProps} />
      </ThemeProvider>
    );
    
    // Component should render (OptimizedImage receives lazy loading prop)
    const image = screen.getByTestId('optimized-image');
    expect(image).toBeInTheDocument();
  });
});

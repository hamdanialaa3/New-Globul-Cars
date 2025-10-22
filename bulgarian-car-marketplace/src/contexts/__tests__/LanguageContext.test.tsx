// src/contexts/__tests__/LanguageContext.test.tsx
// Language Context Tests - Testing toggleLanguage functionality

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../LanguageContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.dispatchEvent
const mockDispatchEvent = jest.fn();
window.dispatchEvent = mockDispatchEvent;

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockDispatchEvent.mockClear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LanguageProvider>{children}</LanguageProvider>
  );

  // ==================== TOGGLE LANGUAGE TESTS ====================

  it('should have toggleLanguage method', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.toggleLanguage).toBeDefined();
    expect(typeof result.current.toggleLanguage).toBe('function');
  });

  it('should toggle from bg to en', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    // Default language should be 'bg'
    expect(result.current.language).toBe('bg');

    // Toggle language
    act(() => {
      result.current.toggleLanguage();
    });

    // Language should now be 'en'
    expect(result.current.language).toBe('en');
  });

  it('should toggle from en to bg', () => {
    // Set initial language to 'en'
    localStorageMock.setItem('globul-cars-language', 'en');

    const { result } = renderHook(() => useLanguage(), { wrapper });

    // Initial language should be 'en'
    expect(result.current.language).toBe('en');

    // Toggle language
    act(() => {
      result.current.toggleLanguage();
    });

    // Language should now be 'bg'
    expect(result.current.language).toBe('bg');
  });

  it('should toggle language multiple times', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    // Start with 'bg'
    expect(result.current.language).toBe('bg');

    // Toggle to 'en'
    act(() => {
      result.current.toggleLanguage();
    });
    expect(result.current.language).toBe('en');

    // Toggle back to 'bg'
    act(() => {
      result.current.toggleLanguage();
    });
    expect(result.current.language).toBe('bg');

    // Toggle to 'en' again
    act(() => {
      result.current.toggleLanguage();
    });
    expect(result.current.language).toBe('en');
  });

  it('should persist language to localStorage when toggled', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    // Toggle language
    act(() => {
      result.current.toggleLanguage();
    });

    // Should persist to localStorage
    expect(localStorageMock.getItem('globul-cars-language')).toBe('en');

    // Toggle again
    act(() => {
      result.current.toggleLanguage();
    });

    // Should update localStorage
    expect(localStorageMock.getItem('globul-cars-language')).toBe('bg');
  });

  it('should dispatch languageChange event when toggled', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    mockDispatchEvent.mockClear();

    // Toggle language
    act(() => {
      result.current.toggleLanguage();
    });

    // Should dispatch event
    expect(mockDispatchEvent).toHaveBeenCalled();
    const event = mockDispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe('languageChange');
    expect(event.detail).toEqual({ language: 'en' });
  });

  it('should update document language attribute when toggled', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    // Toggle to 'en'
    act(() => {
      result.current.toggleLanguage();
    });

    // Should update document lang attribute
    expect(document.documentElement.lang).toBe('en-US');

    // Toggle back to 'bg'
    act(() => {
      result.current.toggleLanguage();
    });

    // Should update document lang attribute
    expect(document.documentElement.lang).toBe('bg-BG');
  });
});

// ==================== EXPORT ====================
export {};

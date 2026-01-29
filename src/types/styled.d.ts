// src/types/styled.d.ts
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    mode?: 'light' | 'dark'; // Theme mode from ThemeContext
    colors: {
      primary: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      secondary: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      success: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      warning: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      error: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      info: {
        main: string;
        light: string;
        dark: string;
        contrastText: string;
      };
      background: {
        default: string;
        paper: string;
        dark: string;
        semiDark: string;
        lightOverlay: string;
        darkOverlay: string;
      };
      text: {
        primary: string;
        secondary: string;
        onDark: string;
        onLight: string;
        disabled: string;
        hint: string;
      };
      grey: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
      };
      // Additional color groups for design-system components
      interactive?: {
        primary: string;
        primaryHover: string;
        primaryActive: string;
      };
      content?: {
        primary: string;
        inverse: string;
        heading?: string;
      };
      surface?: {
        card: string;
        hover: string;
        selected: string;
        elevated?: string;
      };
      brand?: {
        main: string;
        light: string;
        dark: string;
      };
      feedback?: {
        error: {
          main: string;
          dark: string;
        };
      };
      border: {
        default: string;
        muted: string;
        strong: string;
        focus: string;
        light: string;
        medium: string;
        dark: string;
      };
      [key: string]: any;
    };
    // Root-level text mirror used by some components
    text?: {
      primary: string;
      secondary: string;
      onDark?: string;
      onLight?: string;
      disabled?: string;
      hint?: string;
    };

    typography: {
      fontFamily: {
        primary: string;
        secondary: string;
        accent: string;
        base?: string; // alias used by components
      };
      fontSize: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
        '5xl': string;
        '6xl': string;
      };
      fontWeight: {
        light: number;
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
        extrabold: number;
      };
      lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
        loose: number;
      };
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    shadows: {
      none: string;
      sm: string;
      base: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      inner: string;
      outline: string;
      // Aliases used by design-system components
      button?: string;
      hover?: string;
      card?: string;
    };
    borderRadius: {
      none: string;
      sm: string;
      base: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      full: string;
    };
    components: {
      button: any;
      input: any;
      card: any;
    };
  }
}
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from 'styled-components';

// Mock the presence monitor - MUST be before imports
jest.mock('@/services/messaging/core');

import { PresenceIndicator, PresenceWithAvatar } from '../PresenceIndicator';
import { LanguageProvider, ThemeProvider as CustomThemeProvider } from '@/contexts';
import { bulgarianTheme } from '@/styles/theme';
import { presenceMonitor } from '@/services/messaging/core';

describe('PresenceIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows online status', async () => {
    const mockUnsubscribe = jest.fn();
    (presenceMonitor.watchUserPresence as jest.Mock).mockImplementation((userId, callback) => {
      callback({ status: 'online', lastSeen: new Date() });
      return mockUnsubscribe;
    });

    render(
      <ThemeProvider theme={bulgarianTheme}>
        <CustomThemeProvider>
          <LanguageProvider>
            <PresenceIndicator userId="user-1" />
          </LanguageProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      // Check for Bulgarian or English text
      expect(screen.getByText((content) => /Онлайн|Online/.test(content))).toBeInTheDocument();
    });
  });

  it('shows offline status with last seen', async () => {
    const lastSeen = new Date(Date.now() - 3600000); // 1 hour ago
    const mockUnsubscribe = jest.fn();
    (presenceMonitor.watchUserPresence as jest.Mock).mockImplementation((userId, callback) => {
      callback({ status: 'offline', lastSeen });
      return mockUnsubscribe;
    });

    render(
      <ThemeProvider theme={bulgarianTheme}>
        <CustomThemeProvider>
          <LanguageProvider>
            <PresenceIndicator userId="user-1" />
          </LanguageProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      // Check for Bulgarian or English text
      expect(screen.getByText((content) => /последно видян|last seen/.test(content))).toBeInTheDocument();
    });
  });

  it('shows typing indicator when user is typing', async () => {
    const mockUnsubscribe = jest.fn();
    (presenceMonitor.watchUserPresence as jest.Mock).mockImplementation((userId, callback) => {
      callback({ status: 'online', lastSeen: new Date() });
      return mockUnsubscribe;
    });
    (presenceMonitor.watchConversationTyping as jest.Mock).mockImplementation((conversationId, callback) => {
      callback(['user-1']); // User is typing
      return mockUnsubscribe;
    });

    render(
      <ThemeProvider theme={bulgarianTheme}>
        <CustomThemeProvider>
          <LanguageProvider>
            <PresenceIndicator userId="user-1" conversationId="conv-1" />
          </LanguageProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      // Check for Bulgarian or English text
      expect(screen.getByText((content) => /Пише\.\.\.|Typing\.\.\./.test(content))).toBeInTheDocument();
    });
  });

  it('renders compact variant correctly', async () => {
    const mockUnsubscribe = jest.fn();
    (presenceMonitor.watchUserPresence as jest.Mock).mockImplementation((userId, callback) => {
      callback({ status: 'online', lastSeen: new Date() });
      return mockUnsubscribe;
    });

    const { container } = render(
      <ThemeProvider theme={bulgarianTheme}>
        <CustomThemeProvider>
          <LanguageProvider>
            <PresenceIndicator userId="user-1" compact />
          </LanguageProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    );

    // Compact should only show dot, not text
    expect(container.querySelector('span')).toBeInTheDocument();
    expect(screen.queryByText((content) => /Онлайн|Online/.test(content))).not.toBeInTheDocument();
  });

  it('cleans up listeners on unmount', async () => {
    const mockUnsubscribe = jest.fn();
    (presenceMonitor.watchUserPresence as jest.Mock).mockReturnValue(mockUnsubscribe);
    (presenceMonitor.watchConversationTyping as jest.Mock).mockReturnValue(mockUnsubscribe);

    const { unmount } = render(
      <ThemeProvider theme={bulgarianTheme}>
        <CustomThemeProvider>
          <LanguageProvider>
            <PresenceIndicator userId="user-1" />
          </LanguageProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    );

    unmount();

    await waitFor(() => {
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});

describe('PresenceWithAvatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders avatar with name and presence', async () => {
    const mockUnsubscribe = jest.fn();
    (presenceMonitor.watchUserPresence as jest.Mock).mockImplementation((userId, callback) => {
      callback({ status: 'online', lastSeen: new Date() });
      return mockUnsubscribe;
    });

    render(
      <ThemeProvider theme={bulgarianTheme}>
        <CustomThemeProvider>
          <LanguageProvider>
            <PresenceWithAvatar
              userId="user-1"
              userName="John Doe"
              avatarUrl="https://example.com/avatar.jpg"
              avatarSize={40}
            />
          </LanguageProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('John Doe'))).toBeInTheDocument();
      expect(screen.getByRole('img', { hidden: true })).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  it('shows fallback avatar when no URL provided', async () => {
    const mockUnsubscribe = jest.fn();
    (presenceMonitor.watchUserPresence as jest.Mock).mockReturnValue(mockUnsubscribe);

    render(
      <ThemeProvider theme={bulgarianTheme}>
        <CustomThemeProvider>
          <LanguageProvider>
            <PresenceWithAvatar
              userId="user-1"
              userName="John Doe"
              avatarSize={40}
            />
          </LanguageProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    );

    // Should show initials or default avatar
    expect(screen.getByText((content) => content.includes('John Doe'))).toBeInTheDocument();
  });

  it('handles different sizes', async () => {
    const mockUnsubscribe = jest.fn();
    (presenceMonitor.watchUserPresence as jest.Mock).mockReturnValue(mockUnsubscribe);

    const { rerender } = render(
      <ThemeProvider theme={bulgarianTheme}>
        <CustomThemeProvider>
          <LanguageProvider>
            <PresenceWithAvatar
              userId="user-1"
              userName="John Doe"
              avatarSize={32}
            />
          </LanguageProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    );

    rerender(
      <ThemeProvider theme={bulgarianTheme}>
        <CustomThemeProvider>
          <LanguageProvider>
            <PresenceWithAvatar
              userId="user-1"
              userName="John Doe"
              avatarSize={48}
            />
          </LanguageProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    );

    // Component should re-render without errors
    expect(screen.getByText((content) => content.includes('John Doe'))).toBeInTheDocument();
  });
});

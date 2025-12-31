import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConversationView } from '../ConversationView';
import { messagingOrchestrator } from '@/services/messaging/core';
import { useAuth } from '@/contexts';

// Mock dependencies
jest.mock('@/services/messaging/core', () => ({
  messagingOrchestrator: {
    sendMessage: jest.fn(),
    sendOffer: jest.fn()
  }
}));

jest.mock('@/contexts', () => ({
  useAuth: jest.fn()
}));

describe('ConversationView Integration', () => {
  const mockUser = {
    uid: 'user-1',
    email: 'user@example.com',
    displayName: 'Current User',
    photoURL: 'https://example.com/user1.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('renders conversation view with all components', async () => {
    render(
      <ConversationView
        conversationId="conv-1"
        carId="car-123"
        render(
          <LanguageProvider>
            <ConversationView
              conversationId="conv-1"
              carId="car-123"
              otherUserId="user-2"
              otherUserName="John Doe"
              otherUserAvatar="https://example.com/john.jpg"
            />
          </LanguageProvider>
        );
      
      // Quick actions button
      expect(screen.getByText(/إجراءات سريعة/)).toBeInTheDocument();
      
      // Message input
      expect(screen.getByPlaceholderText(/اكتب رسالتك/)).toBeInTheDocument();
    });
  });

  it('sends text message successfully', async () => {
    (messagingOrchestrator.sendMessage as jest.Mock).mockResolvedValue('msg-123');

    render(
      <ConversationView
        conversationId="conv-1"
        render(
          <LanguageProvider>
            <ConversationView
              conversationId="conv-1"
              carId="car-123"
              otherUserId="user-2"
              otherUserName="John Doe"
            />
          </LanguageProvider>
        );
      fireEvent.change(input, { target: { value: 'Hello, is the car available?' } });

      const sendButton = screen.getByText('📤');
      fireEvent.click(sendButton);
    });

    await waitFor(() => {
      expect(messagingOrchestrator.sendMessage).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        content: 'Hello, is the car available?',
        type: 'text'
      });
    });
  });

  it('opens quick actions panel', async () => {
    render(
      <ConversationView
        conversationId="conv-1"
        render(
          <LanguageProvider>
            <ConversationView
              conversationId="conv-1"
              carId="car-123"
              otherUserId="user-2"
              otherUserName="John Doe"
            />
          </LanguageProvider>
        );
      fireEvent.click(quickActionsButton);
    });

    await waitFor(() => {
      // Should show action cards
      expect(screen.getByText(/إرسال عرض/)).toBeInTheDocument();
      expect(screen.getByText(/حجز موعد/)).toBeInTheDocument();
      expect(screen.getByText(/مشاركة الموقع/)).toBeInTheDocument();
    });
  });

  it('sends offer through quick actions', async () => {
    (messagingOrchestrator.sendOffer as jest.Mock).mockResolvedValue('offer-123');

    render(
      <ConversationView
        conversationId="conv-1"
        render(
          <LanguageProvider>
            <ConversationView
              conversationId="conv-1"
              carId="car-123"
              otherUserId="user-2"
              otherUserName="John Doe"
            />
          </LanguageProvider>
        );
      fireEvent.click(screen.getByText(/إجراءات سريعة/));
    });

    // Click offer action
    await waitFor(() => {
      fireEvent.click(screen.getByText(/إرسال عرض/));
    });

    // Fill offer form
    await waitFor(() => {
      const amountInput = screen.getByPlaceholderText('25000');
      fireEvent.change(amountInput, { target: { value: '23000' } });

      const sendButton = screen.getByText(/إرسال العرض/);
      fireEvent.click(sendButton);
    });

    await waitFor(() => {
      expect(messagingOrchestrator.sendOffer).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        carId: 'car-123',
        offerAmount: 23000,
        currency: 'EUR',
        message: ''
      });
    });
  });

  it('handles send message with Enter key', async () => {
    (messagingOrchestrator.sendMessage as jest.Mock).mockResolvedValue('msg-123');

    render(
      <ConversationView
        conversationId="conv-1"
        render(
          <LanguageProvider>
            <ConversationView
              conversationId="conv-1"
              carId="car-123"
              otherUserId="user-2"
              otherUserName="John Doe"
            />
          </LanguageProvider>
        );
      fireEvent.change(input, { target: { value: 'Quick message' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    });

    await waitFor(() => {
      expect(messagingOrchestrator.sendMessage).toHaveBeenCalled();
    });
  });

  it('disables send button when input is empty', async () => {
    render(
      <ConversationView
        conversationId="conv-1"
        render(
          <LanguageProvider>
            <ConversationView
              conversationId="conv-1"
              carId="car-123"
              otherUserId="user-2"
              otherUserName="John Doe"
            />
          </LanguageProvider>
        );
      expect(sendButton).toBeDisabled();
    });
  });

  it('shows empty state when no messages', async () => {
    render(
      <ConversationView
        conversationId="conv-1"
        render(
          <LanguageProvider>
            <ConversationView
              conversationId="conv-1"
              carId="car-123"
              otherUserId="user-2"
              otherUserName="John Doe"
            />
          </LanguageProvider>
        );
      expect(screen.getByText(/ابدأ المحادثة/)).toBeInTheDocument();
    });
  });

  it('handles network errors gracefully', async () => {
    (messagingOrchestrator.sendMessage as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(
      <ConversationView
        conversationId="conv-1"
        render(
          <LanguageProvider>
            <ConversationView
              conversationId="conv-1"
              carId="car-123"
              otherUserId="user-2"
              otherUserName="John Doe"
            />
          </LanguageProvider>
        );
      fireEvent.change(input, { target: { value: 'Test message' } });

      const sendButton = screen.getByText('📤');
      fireEvent.click(sendButton);
    });

    // Should not crash, error should be logged
    await waitFor(() => {
      expect(messagingOrchestrator.sendMessage).toHaveBeenCalled();
    });
  });
});

describe('Full Messaging Flow Integration', () => {
  const mockUser = {
    uid: 'user-1',
    email: 'buyer@example.com',
    displayName: 'Buyer',
    photoURL: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('complete negotiation flow: message → offer → counter → accept', async () => {
    (messagingOrchestrator.sendMessage as jest.Mock).mockResolvedValue('msg-1');
    (messagingOrchestrator.sendOffer as jest.Mock).mockResolvedValue('offer-1');

    render(
      <ConversationView
        conversationId="conv-1"
        render(
          <LanguageProvider>
            <ConversationView
              conversationId="conv-1"
              carId="car-123"
              otherUserId="seller-1"
              otherUserName="Seller"
            />
          </LanguageProvider>
        );
      const input = screen.getByPlaceholderText(/اكتب رسالتك/);
      fireEvent.change(input, { target: { value: 'Is the car still available?' } });
      fireEvent.click(screen.getByText('📤'));
    });

    expect(messagingOrchestrator.sendMessage).toHaveBeenCalledTimes(1);

    // Step 2: Send offer via quick actions
    await waitFor(() => {
      fireEvent.click(screen.getByText(/إجراءات سريعة/));
      fireEvent.click(screen.getByText(/إرسال عرض/));
    });

    await waitFor(() => {
      const amountInput = screen.getByPlaceholderText('25000');
      fireEvent.change(amountInput, { target: { value: '24000' } });
      fireEvent.click(screen.getByText(/إرسال العرض/));
    });

    expect(messagingOrchestrator.sendOffer).toHaveBeenCalledWith(
      expect.objectContaining({
        offerAmount: 24000,
        currency: 'EUR'
      })
    );
  });

  it('handles rapid message sending correctly', async () => {
    (messagingOrchestrator.sendMessage as jest.Mock).mockResolvedValue('msg-123');

    render(
      <ConversationView
        conversationId="conv-1"
        render(
          <LanguageProvider>
            <ConversationView
              conversationId="conv-1"
              carId="car-123"
              otherUserId="user-2"
              otherUserName="Seller"
            />
          </LanguageProvider>
        );
      await waitFor(() => {
        const input = screen.getByPlaceholderText(/اكتب رسالتك/);
        fireEvent.change(input, { target: { value: `Message ${i + 1}` } });
        fireEvent.click(screen.getByText('📤'));
      });
    }

    // All messages should be sent
    expect(messagingOrchestrator.sendMessage).toHaveBeenCalledTimes(3);
  });
});

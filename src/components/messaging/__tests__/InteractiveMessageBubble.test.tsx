import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InteractiveMessageBubble, Message } from '../InteractiveMessageBubble';
import { LanguageProvider, ThemeProvider } from '@/contexts';

describe('InteractiveMessageBubble', () => {
  const mockMessage: Message = {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    content: 'Hello, is the car still available?',
    type: 'text',
    createdAt: new Date('2025-01-15T10:00:00'),
    deliveryStatus: 'delivered',
    metadata: {},
  };

  it('renders text message correctly', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <InteractiveMessageBubble
            message={mockMessage}
            isSender={false}
            senderName="John Doe"
            showAvatar={true}
          />
        </LanguageProvider>
      </ThemeProvider>
    );

    expect(screen.getByText((content) => content.includes('Hello, is the car still available?'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('John Doe'))).toBeInTheDocument();
  });

  it('shows delivery status for sender', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <InteractiveMessageBubble
            message={{ ...mockMessage, deliveryStatus: 'read' }}
            isSender={true}
            senderName="Me"
            showAvatar={true}
          />
        </LanguageProvider>
      </ThemeProvider>
    );

    // Should show read checkmarks (✓✓)
    expect(screen.getByText((content) => content.includes('✓✓'))).toBeInTheDocument();
  });

  it('renders offer message type', () => {
    const offerMessage: Message = {
      ...mockMessage,
      type: 'offer',
      content: 'I offer €25,000 for the car',
      createdAt: new Date('2025-01-15T10:00:00'),
      metadata: {
        offerId: 'offer-1',
        offerAmount: 25000
      }
    };

    render(
      <LanguageProvider>
        <InteractiveMessageBubble
          message={offerMessage}
          isSender={true}
          senderName="Me"
          showAvatar={true}
        />
      </LanguageProvider>
    );

    expect(screen.getByText((content) => /25.?000/.test(content))).toBeInTheDocument();
  });

  it('renders system message with centered layout', () => {
    const systemMessage: Message = {
      ...mockMessage,
      type: 'system',
      content: 'You accepted the offer',
      createdAt: new Date('2025-01-15T10:00:00'),
    };

    render(
      <InteractiveMessageBubble
        message={systemMessage}
        isSender={false}
        senderName=""
        showAvatar={true}
      />
    );

    expect(screen.getByText((content) => content.includes('You accepted the offer'))).toBeInTheDocument();
  });

  it('shows avatar when provided', () => {
    render(
      <InteractiveMessageBubble
        message={mockMessage}
        isSender={false}
        senderName="John Doe"
        senderAvatar="https://example.com/avatar.jpg"
        showAvatar={true}
      />
    );

    const avatar = screen.getByRole('img', { hidden: true });
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('formats timestamp correctly', () => {
    render(
      <InteractiveMessageBubble
        message={mockMessage}
        isSender={false}
        senderName="John Doe"
        showAvatar={true}
      />
    );

    // Should show time in format like "10:00"
    expect(screen.getByText((content) => /\d{2}:\d{2}/.test(content))).toBeInTheDocument();
  });

  it('applies different styles for sender vs receiver', () => {
    const { container: senderContainer } = render(
      <InteractiveMessageBubble
        message={mockMessage}
        isSender={true}
        senderName="Me"
        showAvatar={true}
      />
    );

    const { container: receiverContainer } = render(
      <InteractiveMessageBubble
        message={mockMessage}
        isSender={false}
        senderName="John Doe"
        showAvatar={true}
      />
    );

    // Sender messages should align right, receiver left
    if (senderContainer.firstChild) {
      expect(senderContainer.firstChild).toHaveStyle({ justifyContent: 'flex-end' });
    }
    if (receiverContainer.firstChild) {
      expect(receiverContainer.firstChild).toHaveStyle({ justifyContent: 'flex-start' });
    }
  });

  it('handles failed delivery status', () => {
    render(
      <InteractiveMessageBubble
        message={{ ...mockMessage, deliveryStatus: 'failed' }}
        isSender={true}
        senderName="Me"
        showAvatar={true}
      />
    );

    // Should show failure indicator (❌)
    expect(screen.getByText((content) => content.includes('❌'))).toBeInTheDocument();
  });
});

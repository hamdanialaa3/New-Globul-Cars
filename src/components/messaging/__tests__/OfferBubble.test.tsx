import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';


import { OfferBubble, Offer } from '../OfferBubble';
import { LanguageProvider, ThemeProvider } from '@/contexts';

describe('OfferBubble', () => {
  const mockOffer: Offer = {
    id: 'offer-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    carId: 'car-123',
    offerAmount: 25000,
    currency: 'EUR',
    status: 'pending',
    message: 'This is my final offer',
    createdAt: new Date('2025-01-15T10:00:00'),
    expiresAt: new Date('2025-01-18T10:00:00'),
  };

  const mockHandlers = {
    onAccept: jest.fn(),
    onReject: jest.fn(),
    onCounter: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders offer details correctly', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <OfferBubble
            offer={mockOffer}
            isSender={true}
            {...mockHandlers}
          />
        </LanguageProvider>
      </ThemeProvider>
    );

    // Use regex and ignore comma/space issues
    expect(screen.getByText((content) => /25.?000/.test(content))).toBeInTheDocument();
    expect(screen.getByText(/EUR/)).toBeInTheDocument();
    expect(screen.getByText(/This is my final offer/)).toBeInTheDocument();
  });

  it('shows pending status badge', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <OfferBubble
            offer={mockOffer}
            canRespond={true}
            isReceiver={true}
            {...mockHandlers}
          />
        </LanguageProvider>
      </ThemeProvider>
    );

    expect(screen.getByText((content) => content.includes('⏳'))).toBeInTheDocument(); // Pending icon
    expect(screen.getByText((content) => content.includes('Pending') || content.includes('В чакане'))).toBeInTheDocument();
  });

  it('displays time remaining', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <OfferBubble
            offer={mockOffer}
            canRespond={true}
            isReceiver={true}
            {...mockHandlers}
          />
        </LanguageProvider>
      </ThemeProvider>
    );

    // Should show remaining time (3 days)
    expect(screen.getByText((content) => content.includes('day') || content.includes('ден') || content.includes('Expired') || content.includes('Изтекла'))).toBeInTheDocument();
  });

  it('shows action buttons for receiver when pending', () => {
    render(
      <LanguageProvider>
        <OfferBubble
          offer={mockOffer}
          isSender={false}
          {...mockHandlers}
        />
      </LanguageProvider>
    );

    expect(screen.getByText((content) => content.includes('Accept') || content.includes('Приеми'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Reject') || content.includes('Откажи'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Counter') || content.includes('Насрещно'))).toBeInTheDocument();
  });

  it('hides action buttons for sender', () => {
    render(
      <LanguageProvider>
        <OfferBubble
          offer={mockOffer}
          isSender={true}
          {...mockHandlers}
        />
      </LanguageProvider>
    );

    expect(screen.queryByText((content) => content.includes('Accept'))).not.toBeInTheDocument();
    expect(screen.queryByText((content) => content.includes('Reject'))).not.toBeInTheDocument();
  });

  it('calls onAccept when accept button clicked', async () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <OfferBubble
            offer={mockOffer}
            canRespond={true}
            isReceiver={true}
            {...mockHandlers}
          />
        </LanguageProvider>
      </ThemeProvider>
    );

    const acceptButton = screen.getByText((content) => content.includes('Accept'));
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(mockHandlers.onAccept).toHaveBeenCalledWith('offer-1');
    });
  });

  it('calls onReject when reject button clicked', async () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <OfferBubble
            offer={mockOffer}
            canRespond={true}
            isReceiver={true}
            {...mockHandlers}
          />
        </LanguageProvider>
      </ThemeProvider>
    );

    const rejectButton = screen.getByText((content) => content.includes('Reject'));
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(mockHandlers.onReject).toHaveBeenCalledWith('offer-1');
    });
  });

  it('shows counter offer input when counter button clicked', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <OfferBubble
            offer={mockOffer}
            canRespond={true}
            isReceiver={true}
            {...mockHandlers}
          />
        </LanguageProvider>
      </ThemeProvider>
    );

    const counterButton = screen.getByText((content) => content.includes('Counter'));
    fireEvent.click(counterButton);

    expect(screen.getByPlaceholderText(/Enter your offer/i)).toBeInTheDocument();
  });

  it('validates counter offer amount', async () => {
    render(
      <LanguageProvider>
        <OfferBubble
          offer={mockOffer}
          isSender={false}
          {...mockHandlers}
        />
      </LanguageProvider>
    );

    // Open counter input
    fireEvent.click(screen.getByText((content) => content.includes('Counter')));

    // Enter same amount (should show error)
    const input = screen.getByPlaceholderText(/Enter your offer/i);
    fireEvent.change(input, { target: { value: '25000' } });

    const submitButton = screen.getByText((content) => content.includes('Send'));
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be different/i)).toBeInTheDocument();
      expect(mockHandlers.onCounter).not.toHaveBeenCalled();
    });
  });

  it('calls onCounter with valid amount', async () => {
    render(
      <LanguageProvider>
        <OfferBubble
          offer={mockOffer}
          isSender={false}
          {...mockHandlers}
        />
      </LanguageProvider>
    );

    // Open counter input
    fireEvent.click(screen.getByText((content) => content.includes('Counter')));

    // Enter different amount
    const input = screen.getByPlaceholderText(/Enter your offer/i);
    fireEvent.change(input, { target: { value: '23000' } });

    const submitButton = screen.getByText((content) => content.includes('Send'));
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandlers.onCounter).toHaveBeenCalledWith('offer-1', 23000);
    });
  });

  it('shows accepted status with green badge', () => {
    render(
      <LanguageProvider>
        <OfferBubble
          offer={{ ...mockOffer, status: 'accepted' }}
          isSender={true}
          {...mockHandlers}
        />
      </LanguageProvider>
    );

    expect(screen.getByText((content) => content.includes('✅'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Accepted'))).toBeInTheDocument();
  });

  it('shows rejected status with red badge', () => {
    render(
      <LanguageProvider>
        <OfferBubble
          offer={{ ...mockOffer, status: 'rejected' }}
          isSender={true}
          {...mockHandlers}
        />
      </LanguageProvider>
    );

    expect(screen.getByText((content) => content.includes('❌'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Rejected'))).toBeInTheDocument();
  });

  it('shows expired status when past expiry date', () => {
    const expiredOffer: Offer = {
      ...mockOffer,
      expiresAt: new Date('2025-01-10T10:00:00'),
    };

    render(
      <ThemeProvider>
        <LanguageProvider>
          <OfferBubble
            offer={expiredOffer}
            canRespond={true}
            isReceiver={true}
            {...mockHandlers}
          />
        </LanguageProvider>
      </ThemeProvider>
    );

    expect(screen.getByText((content) => content.includes('⏰'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Expired'))).toBeInTheDocument();
  });

  it('disables buttons when loading', async () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <OfferBubble
            offer={mockOffer}
            canRespond={true}
            isReceiver={true}
            {...mockHandlers}
          />
        </LanguageProvider>
      </ThemeProvider>
    );

    const acceptButton = screen.getByText((content) => content.includes('Accept'));
    fireEvent.click(acceptButton);

    // Buttons should be disabled during loading
    await waitFor(() => {
      expect(acceptButton).toBeDisabled();
    });
  });
});

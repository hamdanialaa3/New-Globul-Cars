// Share Utils Tests
// اختبارات أدوات المشاركة

import { shareContent, isShareSupported, copyToClipboard } from '../shareUtils';

// Mock navigator
const mockNavigator = {
  share: jest.fn(),
  clipboard: {
    writeText: jest.fn()
  }
};

describe('shareUtils', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock navigator.share
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true
    });
  });

  describe('isShareSupported', () => {
    it('returns true when Web Share API is available', () => {
      Object.defineProperty(global, 'navigator', {
        value: { share: jest.fn() },
        writable: true
      });
      
      expect(isShareSupported()).toBe(true);
    });

    it('returns false when Web Share API is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true
      });
      
      expect(isShareSupported()).toBe(false);
    });
  });

  describe('shareContent', () => {
    it('uses Web Share API when available', async () => {
      mockNavigator.share.mockResolvedValue(undefined);
      
      const shareData = {
        title: 'Test Car',
        text: 'Check out this car',
        url: 'https://example.com/car/1'
      };
      
      await shareContent(shareData);
      
      expect(mockNavigator.share).toHaveBeenCalledWith(shareData);
    });

    it('falls back to clipboard when Web Share API is not available', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: {
            writeText: jest.fn().mockResolvedValue(undefined)
          }
        },
        writable: true
      });
      
      // Mock alert
      global.alert = jest.fn();
      
      const shareData = {
        url: 'https://example.com/car/1'
      };
      
      await shareContent(shareData);
      
      expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith(shareData.url);
      expect(global.alert).toHaveBeenCalled();
    });

    it('handles AbortError gracefully', async () => {
      const abortError = new Error('User cancelled');
      abortError.name = 'AbortError';
      mockNavigator.share.mockRejectedValue(abortError);
      
      const shareData = {
        url: 'https://example.com/car/1'
      };
      
      // Should not throw
      await expect(shareContent(shareData)).resolves.toBeUndefined();
    });
  });

  describe('copyToClipboard', () => {
    it('copies text to clipboard successfully', async () => {
      mockNavigator.clipboard.writeText.mockResolvedValue(undefined);
      
      const result = await copyToClipboard('test text');
      
      expect(result).toBe(true);
      expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('test text');
    });

    it('returns false on error', async () => {
      mockNavigator.clipboard.writeText.mockRejectedValue(new Error('Failed'));
      
      const result = await copyToClipboard('test text');
      
      expect(result).toBe(false);
    });
  });
});

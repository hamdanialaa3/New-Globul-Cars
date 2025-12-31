/**
 * Notification Sound Service
 * Manages sound notifications for new messages
 * 
 * Features:
 * - Play notification sound on new message
 * - User preference storage (enable/disable)
 * - Volume control
 * - Browser permission handling
 * - Singleton pattern
 */

import { logger } from '../logger-service';

class NotificationSoundService {
  private static instance: NotificationSoundService;
  private audio: HTMLAudioElement | null = null;
  private sentAudio: HTMLAudioElement | null = null;
  private enabled: boolean;
  private volume: number;
  // Lightweight built-in beep to avoid 404s if file missing
  private readonly fallbackDataUrl =
    'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA' +
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

  private constructor() {
    // Load user preferences
    this.enabled = localStorage.getItem('notifications-sound') !== 'false';
    this.volume = parseFloat(localStorage.getItem('notifications-volume') || '0.7');
    
    // Initialize audio
    this.initAudio();
    
    logger.info('[NotificationSound] Service initialized', {
      enabled: this.enabled,
      volume: this.volume
    });
  }

  static getInstance(): NotificationSoundService {
    if (!this.instance) {
      this.instance = new NotificationSoundService();
    }
    return this.instance;
  }

  private initAudio(): void {
    this.audio = this.createAudio('/sounds/notification.mp3');
    this.sentAudio = this.createAudio('/sounds/message-sent.mp3') || this.audio;
  }

  private createAudio(src: string): HTMLAudioElement | null {
    try {
      const audio = new Audio(src);
      audio.volume = this.volume;
      audio.preload = 'auto';

      audio.addEventListener('error', (e) => {
        e.preventDefault();
        try {
          audio.src = this.fallbackDataUrl;
          audio.load();
        } catch (fallbackError) {
          logger.warn('[NotificationSound] Fallback beep failed, disabling', fallbackError as Error);
          this.enabled = false;
        }
      });

      return audio;
    } catch (error) {
      logger.error('[NotificationSound] Failed to initialize audio', error as Error);
      return null;
    }
  }

  /**
   * Play notification sound
   */
  async playNotification(): Promise<void> {
    if (!this.enabled || !this.audio) {
      return;
    }

    try {
      // Reset audio to start
      this.audio.currentTime = 0;
      
      // Play sound
      const playPromise = this.audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        logger.info('[NotificationSound] Sound played successfully');
      }
    } catch (error: any) {
      // Browser blocked autoplay or user hasn't interacted yet
      if (error.name === 'NotAllowedError') {
        logger.warn('[NotificationSound] Autoplay blocked by browser', error);
      } else {
        logger.error('[NotificationSound] Failed to play sound', error);
      }
    }
  }

  /**
   * Enable or disable notifications
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem('notifications-sound', String(enabled));
    logger.info('[NotificationSound] Notifications ' + (enabled ? 'enabled' : 'disabled'));
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0-1
    if (this.audio) this.audio.volume = this.volume;
    if (this.sentAudio) this.sentAudio.volume = this.volume;
    localStorage.setItem('notifications-volume', String(this.volume));
    logger.info('[NotificationSound] Volume set to', this.volume);
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Test sound (for settings)
   */
  async testSound(): Promise<void> {
    if (!this.audio) {
      logger.warn('[NotificationSound] Audio not initialized');
      return;
    }

    try {
      this.audio.currentTime = 0;
      await this.audio.play();
      logger.info('[NotificationSound] Test sound played');
    } catch (error) {
      logger.error('[NotificationSound] Test sound failed', error as Error);
      throw error;
    }
  }

  /**
   * Request browser permission (if needed)
   */
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        return true;
      }
      
      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    }
    return false;
  }

  /** Play a softer beep when the user sends a message */
  async playSent(): Promise<void> {
    if (!this.enabled || !this.sentAudio) return;

    try {
      this.sentAudio.currentTime = 0;
      const playPromise = this.sentAudio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (error) {
      logger.warn('[NotificationSound] Send beep failed', error as Error);
    }
  }
}

// Export singleton instance
export const notificationSoundService = NotificationSoundService.getInstance();
export default notificationSoundService;

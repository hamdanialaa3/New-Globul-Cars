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
  private enabled: boolean;
  private volume: number;

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
    try {
      this.audio = new Audio('/sounds/notification.mp3');
      this.audio.volume = this.volume;
      this.audio.preload = 'auto';
      
      // Handle errors - silence 404 errors in console
      this.audio.addEventListener('error', (e) => {
        // Suppress 404 errors (file not found) - optional feature
        if (this.audio && (this.audio as any).error?.code === 4) {
          logger.warn('[NotificationSound] Audio file not found (optional feature disabled)');
          this.enabled = false; // Auto-disable if file missing
        } else {
          logger.error('[NotificationSound] Audio failed to load', e as any);
        }
      });
    } catch (error) {
      logger.error('[NotificationSound] Failed to initialize audio', error as Error);
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
    if (this.audio) {
      this.audio.volume = this.volume;
    }
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
}

// Export singleton instance
export const notificationSoundService = NotificationSoundService.getInstance();
export default notificationSoundService;

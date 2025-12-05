// src/services/email-service.ts
// Email Service for Globul Cars using Firebase Trigger Email Extension

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-wrapper';

interface EmailAttachment {
  filename: string;
  path: string;
}

interface EmailMessage {
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
}

interface EmailData {
  to: string | string[];
  message?: EmailMessage;
  template?: {
    name: string;
    data: Record<string, any>;
  };
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  createdAt: any;
}

export class EmailService {
  private static instance: EmailService;
  private mailCollection = 'mail';

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
    verificationLink: string
  ): Promise<void> {
    try {
      const emailData: EmailData = {
        to: userEmail,
        template: {
          name: 'welcome-email',
          data: {
            userName,
            verificationLink,
          },
        },
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, this.mailCollection), emailData);
      serviceLogger.info('Welcome email queued successfully', { email: userEmail });
    } catch (error) {
      serviceLogger.error('Error sending welcome email', error as Error, { email: userEmail });
      throw error;
    }
  }

  /**
   * Send car listing approved email
   */
  async sendCarApprovedEmail(
    userEmail: string,
    carMake: string,
    carModel: string,
    listingId: string,
    carUrl: string
  ): Promise<void> {
    try {
      const emailData: EmailData = {
        to: userEmail,
        template: {
          name: 'car-approved',
          data: {
            carMake,
            carModel,
            listingId,
            carUrl,
          },
        },
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, this.mailCollection), emailData);
      serviceLogger.info('Car approved email queued', { listingId, email: userEmail });
    } catch (error) {
      serviceLogger.error('Error sending car approved email', error as Error, { listingId });
      throw error;
    }
  }

  /**
   * Send car listing rejected email
   */
  async sendCarRejectedEmail(
    userEmail: string,
    carMake: string,
    carModel: string,
    listingId: string,
    reason: string
  ): Promise<void> {
    try {
      const emailData: EmailData = {
        to: userEmail,
        template: {
          name: 'car-rejected',
          data: {
            carMake,
            carModel,
            listingId,
            reason,
          },
        },
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, this.mailCollection), emailData);
      serviceLogger.info('Car rejected email queued', { listingId });
    } catch (error) {
      serviceLogger.error('Error sending car rejected email', error as Error, { listingId });
      throw error;
    }
  }

  /**
   * Send new message notification
   */
  async sendNewMessageNotification(
    recipientEmail: string,
    senderName: string,
    messagePreview: string,
    messagesUrl: string
  ): Promise<void> {
    try {
      const emailData: EmailData = {
        to: recipientEmail,
        template: {
          name: 'new-message',
          data: {
            senderName,
            messagePreview: messagePreview.substring(0, 100) + (messagePreview.length > 100 ? '...' : ''),
            messagesUrl,
          },
        },
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, this.mailCollection), emailData);
      serviceLogger.info('New message notification queued', { recipient: recipientEmail });
    } catch (error) {
      serviceLogger.error('Error sending message notification', error as Error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    userEmail: string,
    resetLink: string,
    userName?: string
  ): Promise<void> {
    try {
      const emailData: EmailData = {
        to: userEmail,
        template: {
          name: 'password-reset',
          data: {
            userName: userName || 'User',
            resetLink,
          },
        },
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, this.mailCollection), emailData);
      serviceLogger.info('Password reset email queued', { email: userEmail });
    } catch (error) {
      serviceLogger.error('Error sending password reset email', error as Error);
      throw error;
    }
  }

  /**
   * Send car inquiry notification to seller
   */
  async sendCarInquiryNotification(
    sellerEmail: string,
    buyerName: string,
    carMake: string,
    carModel: string,
    inquiryMessage: string,
    conversationUrl: string
  ): Promise<void> {
    try {
      const emailData: EmailData = {
        to: sellerEmail,
        template: {
          name: 'car-inquiry',
          data: {
            buyerName,
            carMake,
            carModel,
            inquiryMessage: inquiryMessage.substring(0, 200),
            conversationUrl,
          },
        },
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, this.mailCollection), emailData);
      serviceLogger.info('Car inquiry notification queued', { seller: sellerEmail });
    } catch (error) {
      serviceLogger.error('Error sending car inquiry notification', error as Error);
      throw error;
    }
  }

  /**
   * Send newsletter email
   */
  async sendNewsletterEmail(
    recipients: string[],
    subject: string,
    content: string
  ): Promise<void> {
    try {
      const emailData: EmailData = {
        to: recipients,
        message: {
          subject,
          html: content,
        },
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, this.mailCollection), emailData);
      serviceLogger.info('Newsletter email queued', { recipientCount: recipients.length });
    } catch (error) {
      serviceLogger.error('Error sending newsletter', error as Error);
      throw error;
    }
  }

  /**
   * Send custom email with full control
   */
  async sendCustomEmail(
    to: string | string[],
    subject: string,
    html: string,
    options?: {
      text?: string;
      cc?: string | string[];
      bcc?: string | string[];
      replyTo?: string;
      attachments?: EmailAttachment[];
    }
  ): Promise<void> {
    try {
      const emailData: EmailData = {
        to,
        message: {
          subject,
          html,
          text: options?.text,
          attachments: options?.attachments,
        },
        cc: options?.cc,
        bcc: options?.bcc,
        replyTo: options?.replyTo,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, this.mailCollection), emailData);
      serviceLogger.info('Custom email queued', { to: Array.isArray(to) ? to.length : to });
    } catch (error) {
      serviceLogger.error('Error sending custom email', error as Error);
      throw error;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(
    userEmail: string,
    userName: string,
    verificationCode: string
  ): Promise<void> {
    try {
      const emailData: EmailData = {
        to: userEmail,
        template: {
          name: 'email-verification',
          data: {
            userName,
            verificationCode,
          },
        },
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, this.mailCollection), emailData);
      serviceLogger.info('Verification email queued', { email: userEmail });
    } catch (error) {
      serviceLogger.error('Error sending verification email', error as Error);
      throw error;
    }
  }

  /**
   * Send car sold notification
   */
  async sendCarSoldNotification(
    sellerEmail: string,
    carMake: string,
    carModel: string,
    listingId: string
  ): Promise<void> {
    try {
      const emailData: EmailData = {
        to: sellerEmail,
        template: {
          name: 'car-sold',
          data: {
            carMake,
            carModel,
            listingId,
          },
        },
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, this.mailCollection), emailData);
      serviceLogger.info('Car sold notification queued', { listingId });
    } catch (error) {
      serviceLogger.error('Error sending car sold notification', error as Error);
      throw error;
    }
  }

  /**
   * Send contact form submission
   */
  async sendContactFormEmail(
    adminEmail: string,
    senderName: string,
    senderEmail: string,
    subject: string,
    message: string
  ): Promise<void> {
    try {
      const emailData: EmailData = {
        to: adminEmail,
        message: {
          subject: `Contact Form: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h2>New Contact Form Submission</h2>
              <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <div style="background: #f5f5f5; padding: 15px; margin-top: 10px;">
                <p><strong>Message:</strong></p>
                <p>${message}</p>
              </div>
            </div>
          `,
        },
        replyTo: senderEmail,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, this.mailCollection), emailData);
      serviceLogger.info('Contact form email queued');
    } catch (error) {
      serviceLogger.error('Error sending contact form email', error as Error);
      throw error;
    }
  }
}

export default EmailService.getInstance();


// facebook-data-deletion-api.ts
// Facebook Data Deletion API Implementation
// تنفيذ API حذف البيانات لفيسبوك

import type { Request, Response } from 'express';
import nodemailer from 'nodemailer';

interface DataDeletionRequest {
  facebookId: string;
  email: string;
  reason?: string;
  timestamp: string;
  language: 'bg' | 'en';
}

interface FacebookWebhookDeletionRequest {
  signed_request: string; // JWT token from Facebook
}

class FacebookDataDeletionService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    // Configure email transporter for notifications
    // Correct nodemailer factory method is createTransport
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Handle manual data deletion request from user form
   */
  async handleManualDeletionRequest(req: Request, res: Response) {
    try {
      const requestData: DataDeletionRequest = req.body;
      
      // Validate request data
      if (!requestData.facebookId || !requestData.email) {
        return res.status(400).json({
          success: false,
          message: requestData.language === 'bg' 
            ? 'Липсват задължителни полета'
            : 'Missing required fields'
        });
      }

      // Generate unique request ID
      const requestId = `DEL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store deletion request in database
      await this.storeDeletionRequest({
        requestId,
        facebookId: requestData.facebookId,
        email: requestData.email,
        reason: requestData.reason,
        timestamp: requestData.timestamp,
        language: requestData.language,
        status: 'pending',
        source: 'manual'
      });

      // Send confirmation email to user
      await this.sendConfirmationEmail(requestData, requestId);
      
      // Notify administrators
      await this.notifyAdministrators(requestData, requestId);

      res.json({
        success: true,
        requestId,
        message: requestData.language === 'bg'
          ? 'Заявката за изтриване беше изпратена успешно'
          : 'Deletion request submitted successfully'
      });

    } catch (error) {
      console.error('Data deletion request error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Handle Facebook webhook deletion request
   * Required for Facebook App compliance
   */
  async handleFacebookWebhookDeletion(req: Request, res: Response) {
    try {
      const { signed_request }: FacebookWebhookDeletionRequest = req.body;
      
      if (!signed_request) {
        return res.status(400).json({ error: 'Missing signed_request' });
      }

      // Decode Facebook signed request
      const decodedRequest = this.decodeSignedRequest(signed_request);
      
      if (!decodedRequest || !decodedRequest.user_id) {
        return res.status(400).json({ error: 'Invalid signed_request' });
      }

      const facebookId = decodedRequest.user_id;
      const requestId = `FB_DEL_${Date.now()}_${facebookId}`;

      // Store deletion request
      await this.storeDeletionRequest({
        requestId,
        facebookId,
        email: decodedRequest.email || 'unknown@facebook.com',
        reason: 'Facebook user data deletion request',
        timestamp: new Date().toISOString(),
        language: 'en',
        status: 'pending',
        source: 'facebook_webhook'
      });

      // Process deletion immediately for Facebook compliance
      await this.processDeletion(facebookId, requestId);

      // Return required response format for Facebook
      res.json({
        url: `https://bulgariancarmarketplace.com/data-deletion-status?id=${requestId}`,
        confirmation_code: requestId
      });

    } catch (error) {
      console.error('Facebook webhook deletion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Store deletion request in database
   */
  private async storeDeletionRequest(requestData: any) {
    // In a real implementation, store in your database
    // Here's a mock implementation
    console.log('Storing deletion request:', requestData);
    
    // Example with Firebase Firestore
    /*
    import { firestore } from '../firebase-config';
    
    await firestore.collection('data_deletion_requests').doc(requestData.requestId).set({
      ...requestData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    */
  }

  /**
   * Process actual data deletion
   */
  private async processDeletion(facebookId: string, requestId: string) {
    try {
      console.log(`Processing deletion for Facebook ID: ${facebookId}`);

      // 1. Delete user data from main database
      await this.deleteUserData(facebookId);
      
      // 2. Delete Facebook-specific data
      await this.deleteFacebookData(facebookId);
      
      // 3. Delete analytics data
      await this.deleteAnalyticsData(facebookId);
      
      // 4. Delete cached data
      await this.deleteCachedData(facebookId);
      
      // 5. Update deletion request status
      await this.updateDeletionStatus(requestId, 'completed');
      
      console.log(`Deletion completed for request: ${requestId}`);
      
    } catch (error) {
      console.error('Deletion process error:', error);
      await this.updateDeletionStatus(requestId, 'failed');
      throw error;
    }
  }

  /**
   * Delete user data from main database
   */
  private async deleteUserData(facebookId: string) {
    // Delete from users collection
    console.log(`Deleting user data for Facebook ID: ${facebookId}`);
    
    // Example implementation:
    /*
    import { firestore } from '../firebase-config';
    
    // Find user by Facebook ID
    const userQuery = await firestore
      .collection('users')
      .where('facebookId', '==', facebookId)
      .get();
    
    // Delete user document and all subcollections
    for (const doc of userQuery.docs) {
      await this.deleteUserDocument(doc.ref);
    }
    */
  }

  /**
   * Delete Facebook-specific data
   */
  private async deleteFacebookData(facebookId: string) {
    console.log(`Deleting Facebook data for ID: ${facebookId}`);
    
    // Delete from facebook_users collection
    // Delete Facebook tokens and permissions
    // Delete social connections
    // Delete Facebook marketing data
  }

  /**
   * Delete analytics data
   */
  private async deleteAnalyticsData(facebookId: string) {
    console.log(`Deleting analytics data for Facebook ID: ${facebookId}`);
    
    // Delete Facebook Pixel data
    // Delete conversion tracking data
    // Delete behavioral analytics
  }

  /**
   * Delete cached data
   */
  private async deleteCachedData(facebookId: string) {
    console.log(`Deleting cached data for Facebook ID: ${facebookId}`);
    
    // Clear Redis cache
    // Clear CDN cache
    // Clear session data
  }

  /**
   * Send confirmation email to user
   */
  private async sendConfirmationEmail(requestData: DataDeletionRequest, requestId: string) {
    const emailContent = requestData.language === 'bg' ? {
      subject: 'Потвърждение за заявка за изтриване на данни - Bulgarian Car Marketplace',
      html: `
        <h2>Заявка за изтриване на данни</h2>
        <p>Здравейте,</p>
        <p>Получихме вашата заявка за изтриване на лични данни от Bulgarian Car Marketplace.</p>
        <p><strong>ID на заявката:</strong> ${requestId}</p>
        <p><strong>Facebook ID:</strong> ${requestData.facebookId}</p>
        <p><strong>Дата на заявката:</strong> ${new Date(requestData.timestamp).toLocaleDateString('bg-BG')}</p>
        
        <h3>Следващи стъпки:</h3>
        <ol>
          <li>Ще проверим вашата самоличност (до 2 работни дни)</li>
          <li>Ще обработим и изтрием данните ви (до 30 дни)</li>
          <li>Ще ви изпратим потвърждение за завършване</li>
        </ol>
        
        <p>За въпроси, свържете се с нас на privacy@bulgariancarmarketplace.com</p>
        <p>С уважение,<br>Екипът на Bulgarian Car Marketplace</p>
      `
    } : {
      subject: 'Data Deletion Request Confirmation - Bulgarian Car Marketplace',
      html: `
        <h2>Data Deletion Request</h2>
        <p>Hello,</p>
        <p>We have received your request to delete personal data from Bulgarian Car Marketplace.</p>
        <p><strong>Request ID:</strong> ${requestId}</p>
        <p><strong>Facebook ID:</strong> ${requestData.facebookId}</p>
        <p><strong>Request Date:</strong> ${new Date(requestData.timestamp).toLocaleDateString('en-US')}</p>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>We will verify your identity (up to 2 business days)</li>
          <li>We will process and delete your data (up to 30 days)</li>
          <li>We will send you confirmation of completion</li>
        </ol>
        
        <p>For questions, contact us at privacy@bulgariancarmarketplace.com</p>
        <p>Best regards,<br>Bulgarian Car Marketplace Team</p>
      `
    };

    await this.transporter.sendMail({
      from: '"Bulgarian Car Marketplace" <noreply@bulgariancarmarketplace.com>',
      to: requestData.email,
      subject: emailContent.subject,
      html: emailContent.html
    });
  }

  /**
   * Notify administrators of deletion request
   */
  private async notifyAdministrators(requestData: DataDeletionRequest, requestId: string) {
    await this.transporter.sendMail({
      from: '"Bulgarian Car Marketplace" <noreply@bulgariancarmarketplace.com>',
      to: 'privacy@bulgariancarmarketplace.com',
      subject: `New Data Deletion Request - ${requestId}`,
      html: `
        <h2>New Data Deletion Request</h2>
        <p><strong>Request ID:</strong> ${requestId}</p>
        <p><strong>Facebook ID:</strong> ${requestData.facebookId}</p>
        <p><strong>Email:</strong> ${requestData.email}</p>
        <p><strong>Language:</strong> ${requestData.language}</p>
        <p><strong>Reason:</strong> ${requestData.reason || 'Not specified'}</p>
        <p><strong>Timestamp:</strong> ${requestData.timestamp}</p>
        
        <p>Please process this request within 30 days as per GDPR requirements.</p>
        
        <p><a href="https://bulgariancarmarketplace.com/admin/data-deletion/${requestId}">Review Request</a></p>
      `
    });
  }

  /**
   * Decode Facebook signed request
   */
  private decodeSignedRequest(signedRequest: string): any {
    try {
      const [encodedSig, payload] = signedRequest.split('.');
      
      // Decode base64url
      const sig = Buffer.from(encodedSig, 'base64url');
      const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
      
      // Verify signature with app secret
      const crypto = require('crypto');
      const expectedSig = crypto
        .createHmac('sha256', process.env.FACEBOOK_APP_SECRET)
        .update(payload)
        .digest();
      
      if (!crypto.timingSafeEqual(sig, expectedSig)) {
        throw new Error('Invalid signature');
      }
      
      return data;
    } catch (error) {
      console.error('Error decoding signed request:', error);
      return null;
    }
  }

  /**
   * Update deletion request status
   */
  private async updateDeletionStatus(requestId: string, status: string) {
    console.log(`Updating deletion status: ${requestId} -> ${status}`);
    
    // Update in database
    /*
    await firestore.collection('data_deletion_requests').doc(requestId).update({
      status,
      updatedAt: new Date(),
      ...(status === 'completed' && { completedAt: new Date() })
    });
    */
  }

  /**
   * Get deletion status for user or Facebook
   */
  async getDeletionStatus(req: Request, res: Response) {
    try {
      const { id: requestId } = req.params;
      
      if (!requestId) {
        return res.status(400).json({ error: 'Missing request ID' });
      }

      // Get status from database
      const status = await this.getDeletionRequestStatus(requestId);
      
      if (!status) {
        return res.status(404).json({ error: 'Request not found' });
      }

      res.json({
        requestId,
        status: status.status,
        createdAt: status.createdAt,
        completedAt: status.completedAt,
        message: status.status === 'completed' 
          ? 'Your data has been successfully deleted'
          : status.status === 'pending'
          ? 'Your deletion request is being processed'
          : 'There was an error processing your request'
      });

    } catch (error) {
      console.error('Get deletion status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get deletion request status from database
   */
  private async getDeletionRequestStatus(requestId: string): Promise<any> {
    // Mock implementation
    return {
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };
    
    /*
    const doc = await firestore.collection('data_deletion_requests').doc(requestId).get();
    return doc.exists ? doc.data() : null;
    */
  }
}

// Export service instance
export const facebookDataDeletionService = new FacebookDataDeletionService();

// Express route handlers
export const handleManualDeletionRequest = (req: Request, res: Response) => {
  return facebookDataDeletionService.handleManualDeletionRequest(req, res);
};

export const handleFacebookWebhookDeletion = (req: Request, res: Response) => {
  return facebookDataDeletionService.handleFacebookWebhookDeletion(req, res);
};

export const getDeletionStatus = (req: Request, res: Response) => {
  return facebookDataDeletionService.getDeletionStatus(req, res);
};

/**
 * Express routes configuration example:
 * 
 * import express from 'express';
 * import { handleManualDeletionRequest, handleFacebookWebhookDeletion, getDeletionStatus } from './facebook-data-deletion-api';
 * 
 * const app = express();
 * 
 * // Manual deletion request from user form
 * app.post('/api/facebook/data-deletion-request', handleManualDeletionRequest);
 * 
 * // Facebook webhook for automatic deletion
 * app.post('/api/facebook/webhook/data-deletion', handleFacebookWebhookDeletion);
 * 
 * // Check deletion status
 * app.get('/api/facebook/data-deletion-status/:id', getDeletionStatus);
 * 
 * // Alternative status check (for Facebook app validation)
 * app.get('/data-deletion-status', (req, res) => {
 *   const { id } = req.query;
 *   res.redirect(`/api/facebook/data-deletion-status/${id}`);
 * });
 */

export default FacebookDataDeletionService;
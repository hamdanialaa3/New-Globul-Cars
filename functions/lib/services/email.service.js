"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const nodemailer = require("nodemailer");
class EmailService {
    constructor() {
        // Determine transport configuration
        // 1. Try environment variables
        // 2. Fallback to a dummy "stream" transport for local dev if config is missing
        const smtpConfig = {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        };
        if (!smtpConfig.host || !smtpConfig.auth.user) {
            console.warn('⚠️ SMTP Configuration missing. Emails will not be sent (or will dry-run). Set SMTP_HOST, SMTP_USER, etc.');
            // Fallback for development/testing without credentials
            this.transporter = nodemailer.createTransport({
                jsonTransport: true // Just logs the output
            });
        }
        else {
            this.transporter = nodemailer.createTransport(smtpConfig);
        }
    }
    /**
     * Send an email using a predefined template
     */
    async sendEmail(email) {
        try {
            const html = this.generateHtml(email.template, email.data);
            const from = process.env.SMTP_FROM || '"Koli One" <noreply@koli.one>';
            const info = await this.transporter.sendMail({
                from,
                to: email.to,
                subject: email.subject,
                html,
            });
            console.log(`📧 Email sent: ${email.template} to ${email.to}`, info.messageId || info);
        }
        catch (error) {
            console.error(`❌ Failed to send email: ${email.template} to ${email.to}`, error);
            // We don't throw here to ensure other operations don't fail just because email failed
        }
    }
    generateHtml(template, data) {
        const header = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">Koli One</h1>
        </div>
        <div style="padding: 24px; background-color: #ffffff; color: #333333;">
    `;
        const footer = `
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888888;">
          <p>© ${new Date().getFullYear()} Koli One. All rights reserved.</p>
          <p>
            <a href="https://koli.one" style="color: #1a1a1a; text-decoration: none;">Visit Website</a>
          </p>
        </div>
      </div>
    `;
        let content = '';
        switch (template) {
            case 'welcome':
                content = `
          <h2 style="color: #1a1a1a;">Welcome to Koli One! 🎉</h2>
          <p>Hi ${data.name || 'there'},</p>
          <p>Thank you for joining Koli One, the premier automotive marketplace.</p>
          <p>We're excited to have you on board. You can now:</p>
          <ul>
            <li>List your vehicles for sale</li>
            <li>Browse thousands of listings</li>
            <li>Contact sellers directly</li>
          </ul>
          <p style="text-align: center; margin-top: 24px;">
            <a href="https://koli.one" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Start Browsing</a>
          </p>
        `;
                break;
            case 'adPending':
                content = `
          <h2 style="color: #1a1a1a;">Ad Under Review 🕒</h2>
          <p>Hi ${data.name || 'there'},</p>
          <p>Your listing for <strong>${data.brand} ${data.model}</strong> has been received and is currently under review.</p>
          <p>Our team verifies all listings to ensure quality and safety. We usually process listings within 2 hours.</p>
          <p>You will receive another email once your ad is live.</p>
        `;
                break;
            case 'adApproved':
                content = `
          <h2 style="color: #2e7d32;">Your Ad is Live! ✅</h2>
          <p>Hi ${data.name || 'there'},</p>
          <p>Great news! Your listing for <strong>${data.brand} ${data.model}</strong> has been approved and is now visible to thousands of potential buyers.</p>
          <p style="text-align: center; margin-top: 24px;">
            <a href="https://koli.one/car/${data.id}" style="display: inline-block; background-color: #2e7d32; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Your Ad</a>
          </p>
        `;
                break;
            case 'adRejected':
                content = `
          <h2 style="color: #d32f2f;">Ad Requires Changes ⚠️</h2>
          <p>Hi ${data.name || 'there'},</p>
          <p>We couldn't approve your listing for <strong>${data.brand} ${data.model}</strong> at this time.</p>
          <p><strong>Reason:</strong> ${data.reason || 'Does not meet our community guidelines.'}</p>
          <p>Please edit your listing to address these issues and submit it again.</p>
          <p style="text-align: center; margin-top: 24px;">
            <a href="https://koli.one/profile" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Edit Listing</a>
          </p>
        `;
                break;
            case 'subscriptionActivated':
                content = `
          <h2 style="color: #2e7d32;">Subscription Active 🌟</h2>
          <p>Hi ${data.name || 'there'},</p>
          <p>Your <strong>${data.plan}</strong> subscription has been successfully activated.</p>
          <p>You now have access to premium features:</p>
          <ul>
            <li>${data.limit === Infinity ? 'Unlimited' : data.limit} Active Listings</li>
            <li>Priority Support</li>
            <li>Advanced Analytics</li>
          </ul>
        `;
                break;
            case 'paymentReceipt':
                content = `
          <h2 style="color: #1a1a1a;">Payment Receipt 🧾</h2>
          <p>Hi ${data.name || 'there'},</p>
          <p>We received your payment of <strong>€${data.amount}</strong>.</p>
          <p><strong>Invoice ID:</strong> ${data.invoiceId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p>Thank you for your business!</p>
        `;
                break;
            case 'newMessage':
                content = `
          <h2 style="color: #1a1a1a;">New Message 💬</h2>
          <p>You have a new message from <strong>${data.senderName}</strong> regarding your listing.</p>
          <blockquote style="border-left: 4px solid #e0e0e0; padding-left: 12px; margin: 16px 0; color: #666;">
            "${data.preview}"
          </blockquote>
          <p style="text-align: center; margin-top: 24px;">
            <a href="https://koli.one/messages" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reply Now</a>
          </p>
        `;
                break;
            default:
                content = `<p>${JSON.stringify(data)}</p>`;
        }
        return header + content + footer;
    }
}
exports.EmailService = EmailService;
exports.emailService = new EmailService();
//# sourceMappingURL=email.service.js.map
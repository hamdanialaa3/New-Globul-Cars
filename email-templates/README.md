# Email Notification Templates
## Manual Payment System - Globul Cars

This directory contains HTML email templates for the manual payment system.

## Templates

1. **payment_submitted.html** - Sent when user submits payment
2. **payment_verified.html** - Sent when admin verifies payment
3. **payment_rejected.html** - Sent when admin rejects payment
4. **payment_expired.html** - Sent when payment expires after 7 days
5. **admin_new_payment.html** - Sent to admins for new pending payments

## Variables

All templates support the following variables (use Handlebars syntax):

### User Variables
- `{{userName}}` - User's full name
- `{{userEmail}}` - User's email address

### Transaction Variables
- `{{referenceNumber}}` - Payment reference number
- `{{amount}}` - Payment amount
- `{{currency}}` - Currency (EUR/BGN)
- `{{itemDescription}}` - Description of purchase
- `{{bankAccount}}` - Selected bank (Revolut/iCard)
- `{{createdAt}}` - Transaction creation date
- `{{expiresAt}}` - Transaction expiration date

### Links
- `{{dashboardUrl}}` - User dashboard URL
- `{{supportUrl}}` - Support page URL
- `{{retryUrl}}` - Retry payment URL

### Contact
- `{{supportEmail}}` - support@mobilebg.eu
- `{{supportPhone}}` - +359 87 983 9671
- `{{whatsappLink}}` - Direct WhatsApp link

## Usage with Email Service

### SendGrid Example
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: transaction.userEmail,
  from: 'noreply@mobilebg.eu',
  subject: 'Payment Submitted - Globul Cars',
  templateId: 'd-xxxxxxxxxxxxx', // SendGrid template ID
  dynamicTemplateData: {
    userName: transaction.userName,
    referenceNumber: transaction.referenceNumber,
    amount: transaction.amount,
    // ... other variables
  }
};

await sgMail.send(msg);
```

### Mailgun Example
```javascript
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: 'mobilebg.eu'
});

const data = {
  from: 'Globul Cars <noreply@mobilebg.eu>',
  to: transaction.userEmail,
  subject: 'Payment Submitted',
  template: 'payment_submitted',
  'h:X-Mailgun-Variables': JSON.stringify({
    userName: transaction.userName,
    referenceNumber: transaction.referenceNumber,
    // ... other variables
  })
};

await mailgun.messages().send(data);
```

## Testing

Use Ethereal Email (https://ethereal.email/) for testing without sending real emails.

## Localization

Templates support Bulgarian (bg) and English (en). Use language parameter in email service.

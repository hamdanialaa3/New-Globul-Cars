// local-facebook-deletion-server.ts
// Lightweight Express server to run Facebook Data Deletion endpoints locally.
// Usage (development only): ts-node local-facebook-deletion-server.ts
// أوامر تشغيل الخادم المحلي لحذف بيانات فيسبوك

// Using require style to avoid dependency on @types/express for now
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');
import dotenv from 'dotenv';
import { 
  handleManualDeletionRequest,
  handleFacebookWebhookDeletion,
  getDeletionStatus
} from './facebook-data-deletion-api';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health endpoint
app.get('/healthz', (_req: any, res: any) => {
  res.json({ ok: true, service: 'facebook-data-deletion', ts: Date.now() });
});

// Manual deletion request
app.post('/api/facebook/data-deletion-request', handleManualDeletionRequest);
// Webhook deletion request
app.post('/api/facebook/webhook/data-deletion', handleFacebookWebhookDeletion);
// Status lookup
app.get('/api/facebook/data-deletion-status/:id', getDeletionStatus);

const PORT = Number(process.env.FB_DELETION_PORT || 5055);
app.listen(PORT, () => {
  console.log(`[local-facebook-deletion-server] Listening on port ${PORT}`);
});

export default app;
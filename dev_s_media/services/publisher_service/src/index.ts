import express from 'express';
import { config } from './config/env';
import { handleAdPublished } from './handlers/webhook';

const app = express();

app.use(express.json());

// Main Entry Point
app.post('/webhooks/ad-published', handleAdPublished);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'publisher' });
});

app.listen(config.PORT, () => {
    console.log(`🚀 Publisher Service running on port ${config.PORT}`);
    console.log(`🔧 Env: ${config.NODE_ENV}`);
});

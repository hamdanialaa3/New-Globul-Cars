"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const webhook_1 = require("./handlers/webhook");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Main Entry Point
app.post('/webhooks/ad-published', webhook_1.handleAdPublished);
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'publisher' });
});
app.listen(env_1.config.PORT, () => {
    console.log(`🚀 Publisher Service running on port ${env_1.config.PORT}`);
    console.log(`🔧 Env: ${env_1.config.NODE_ENV}`);
});

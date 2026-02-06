"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishToFacebook = publishToFacebook;
exports.publishToInstagram = publishToInstagram;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
async function publishToFacebook(message, imageUrl) {
    const url = `https://graph.facebook.com/v19.0/${env_1.config.FB_PAGE_ID}/photos`;
    try {
        const response = await axios_1.default.post(url, {
            url: imageUrl,
            message: message, // Caption
            access_token: env_1.config.PAGE_ACCESS_TOKEN,
            published: true
        });
        return {
            success: true,
            platform: 'facebook',
            id: response.data.id,
            post_id: response.data.post_id
        };
    }
    catch (error) {
        console.error('FB Publish Error:', error.response?.data || error.message);
        throw new Error(`FB Publish Failed: ${error.response?.data?.error?.message || error.message}`);
    }
}
async function publishToInstagram(caption, imageUrl) {
    if (!env_1.config.IG_USER_ID) {
        console.warn('Skipping Instagram: No IG_USER_ID configured.');
        return { success: false, reason: 'no_config' };
    }
    // IG requires 2 steps: Create Container -> Publish Container
    try {
        // 1. Create Media Container
        const containerUrl = `https://graph.facebook.com/v19.0/${env_1.config.IG_USER_ID}/media`;
        const containerRes = await axios_1.default.post(containerUrl, {
            image_url: imageUrl,
            caption: caption,
            access_token: env_1.config.PAGE_ACCESS_TOKEN
        });
        const containerId = containerRes.data.id;
        // 2. Publish
        const publishUrl = `https://graph.facebook.com/v19.0/${env_1.config.IG_USER_ID}/media_publish`;
        const publishRes = await axios_1.default.post(publishUrl, {
            creation_id: containerId,
            access_token: env_1.config.PAGE_ACCESS_TOKEN
        });
        return {
            success: true,
            platform: 'instagram',
            id: publishRes.data.id
        };
    }
    catch (error) {
        console.error('IG Publish Error:', error.response?.data || error.message);
        throw new Error(`IG Publish Failed: ${error.response?.data?.error?.message || error.message}`);
    }
}

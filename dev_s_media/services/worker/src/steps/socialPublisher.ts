import axios from 'axios';
import { config } from '../config/env';

export async function publishToFacebook(message: string, imageUrl: string) {
    const url = `https://graph.facebook.com/v19.0/${config.FB_PAGE_ID}/photos`;

    try {
        const response = await axios.post(url, {
            url: imageUrl,
            message: message, // Caption
            access_token: config.PAGE_ACCESS_TOKEN,
            published: true
        });

        return {
            success: true,
            platform: 'facebook',
            id: response.data.id,
            post_id: response.data.post_id
        };
    } catch (error: any) {
        console.error('FB Publish Error:', error.response?.data || error.message);
        throw new Error(`FB Publish Failed: ${error.response?.data?.error?.message || error.message}`);
    }
}

export async function publishToInstagram(caption: string, imageUrl: string) {
    if (!config.IG_USER_ID) {
        console.warn('Skipping Instagram: No IG_USER_ID configured.');
        return { success: false, reason: 'no_config' };
    }

    // IG requires 2 steps: Create Container -> Publish Container
    try {
        // 1. Create Media Container
        const containerUrl = `https://graph.facebook.com/v19.0/${config.IG_USER_ID}/media`;
        const containerRes = await axios.post(containerUrl, {
            image_url: imageUrl,
            caption: caption,
            access_token: config.PAGE_ACCESS_TOKEN
        });
        const containerId = containerRes.data.id;

        // 2. Publish
        const publishUrl = `https://graph.facebook.com/v19.0/${config.IG_USER_ID}/media_publish`;
        const publishRes = await axios.post(publishUrl, {
            creation_id: containerId,
            access_token: config.PAGE_ACCESS_TOKEN
        });

        return {
            success: true,
            platform: 'instagram',
            id: publishRes.data.id
        };

    } catch (error: any) {
        console.error('IG Publish Error:', error.response?.data || error.message);
        throw new Error(`IG Publish Failed: ${error.response?.data?.error?.message || error.message}`);
    }
}

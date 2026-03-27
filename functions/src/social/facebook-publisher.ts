import * as functions from 'firebase-functions/v1';
import axios from 'axios';

// The function triggers when a new Car is created in Firestore
export const autoPublishToFacebookPages = functions
    .runWith({ memory: '512MB', timeoutSeconds: 60 })
    .firestore.document('cars/{carId}')
    .onCreate(async (snap, context) => {
        const car = snap.data();

        // 1. Array of all Managed Facebook Pages dynamically linked via ENV
        const targetPages = [
            {
                name: 'Koli One',
                id: process.env.FACEBOOK_PAGE_KOLI_ID,
                token: process.env.FACEBOOK_PAGE_KOLI_TOKEN
            },
            {
                name: 'Mobilebg e Koli One',
                id: process.env.FACEBOOK_PAGE_MOBILEBG_ID,
                token: process.env.FACEBOOK_PAGE_MOBILEBG_TOKEN
            },
            {
                name: 'Glo-Bul Markt',
                id: process.env.FACEBOOK_PAGE_GLOBUL_ID,
                token: process.env.FACEBOOK_PAGE_GLOBUL_TOKEN
            }
        ].filter(page => page.id && page.token); // Only keep configured pages

        if (targetPages.length === 0) {
            functions.logger.warn('No Facebook Page Keys found. Skipping Auto-Publish.');
            return;
        }

        if (car.status !== 'active' || !car.make) {
            functions.logger.info(`Car ${context.params.carId} not active or missing make. Skipping FB post.`);
            return;
        }

        try {
            const carUrl = `https://koli.one/car/${car.sellerNumericId}/${car.carNumericId}`;
            const message = `🚘 عرض مميز لليوم: ${car.make} ${car.model} (${car.year})\n\n`
                + `💰 السعر: €${Number(car.price).toLocaleString('bg-BG')}\n`
                + `${car.mileage ? `📊 كيلومتر: ${Number(car.mileage).toLocaleString('bg-BG')} كم\n` : ''}`
                + `${car.fuelType ? `⛽ المحرك: ${car.fuelType}\n` : ''}`
                + `📍 ${car.city}, България\n\n`
                + `👉 اضغط هنا لمشاهدة التفاصيل الكاملة والصور:\n${carUrl}`;

            const imageUrl = Array.isArray(car.images) && car.images.length > 0 ? car.images[0] : null;

            // 2. Publish to all pages concurrently using Promise.allSettled
            const publishingPromises = targetPages.map(async (page) => {
                let fbUrl = `https://graph.facebook.com/v19.0/${page.id}/photos`;
                let payload: any = {
                    message: message,
                    access_token: page.token
                };

                if (imageUrl) {
                    // Publish as a high-engagement Photo Post
                    payload.url = imageUrl;
                } else {
                    // Publish as a Standard Link Post
                    fbUrl = `https://graph.facebook.com/v19.0/${page.id}/feed`;
                    payload.link = carUrl;
                }

                try {
                    const response = await axios.post(fbUrl, payload);
                    functions.logger.info(`✅ Successfully Auto-Published car ${context.params.carId} to [${page.name}]. Post ID: ${response.data.id}`);
                    return { success: true, page: page.name, postId: response.data.id };
                } catch (error: any) {
                    functions.logger.error(`❌ Failed to publish to [${page.name}]:`, error.response?.data || error.message);
                    return { success: false, page: page.name, error: error.message };
                }
            });

            await Promise.allSettled(publishingPromises);
            functions.logger.info(`🚀 Multi-page publishing payload dispatched for Car ${context.params.carId}.`);

        } catch (error: any) {
            functions.logger.error('❌ Critical failure in FB Publisher Engine:', error.message);
        }
    });

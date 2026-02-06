# 🚀 Integration Next Steps (Hooking it up)

Your Social Media Automation System is now **LIVE** locally.
- **Publisher:** Listening on `http://localhost:3005/webhooks/ad-published`
- **Worker:** Connected to Facebook Page `109254638332601`

Since your Main App (Firebase Functions) runs in the cloud (or different local port), it needs to trigger this system.

## 1. Update Firebase Functions (Trigger)
In your main project (`functions/src/triggers/onAdCreate.ts` or similar), add this logic:

```typescript
import axios from 'axios';

exports.onAdCreate = functions.firestore.document('ads/{adId}').onCreate(async (snap, context) => {
  const adData = snap.data();
  
  // URL of your Automation System (Tunnel or deployed URL)
  // For local testing, you might need ngrok if Firebase is in cloud
  const AUTOMATION_URL = 'http://localhost:3005/webhooks/ad-published'; 

  try {
    await axios.post(AUTOMATION_URL, {
      ad_id: context.params.adId,
      content: {
        description: `${adData.make} ${adData.model} - ${adData.price} BGN`,
        images: adData.images || []
      }
    });
    console.log('Triggered Social Automation');
  } catch (err) {
    console.error('Failed to trigger automation:', err);
  }
});
```

## 2. Deploying the Automation System
To make this run 24/7 (not just on your laptop), you should deploy these Docker containers.
Koli One is hosted on Firebase? Firebase Hosting doesn't support long-running workers easily.
**Recommendation:** Deploy this specific part to **Fly.io**, **Railway**, or a **VPS (DigitalOcean/Hetzner)** using the `docker-compose.yml` we created.

## 3. Verify Now
Check your Facebook Page. You should see the test post:
"🚀 AUTO-POSTING SYSTEM IS LIVE (Port 3005)..."

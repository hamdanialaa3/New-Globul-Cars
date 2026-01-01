# 🔊 Sound Files - Updated

This directory contains audio files for notifications.

## ✅ Current Status (Jan 2, 2026)

**Files present:**
- ✅ `notification.mp3` - Placeholder (replace with real audio)
- ✅ `message-sent.mp3` - Placeholder (replace with real audio)
- 📄 `README.md` - This file

## 📋 Required Files

### 1. notification.mp3
- **Purpose:** Played when a new message arrives
- **Format:** MP3, WebM, or OGG
- **Duration:** 0.5-2 seconds recommended
- **Volume:** Moderate (not too loud)
- **Current Status:** Placeholder text file (needs replacement)

### 2. message-sent.mp3
- **Purpose:** Played when a message is sent (confirmation)
- **Format:** MP3, WebM, or OGG
- **Duration:** 0.3-1 second recommended
- **Volume:** Soft confirmation sound
- **Current Status:** Placeholder text file (needs replacement)

## 🔄 Fallback Mechanism

The app (`notification-sound.service.ts`) has a built-in fallback:
- ✅ If MP3 files fail to load → Uses base64 encoded beep sound
- ✅ If all sounds fail → Disables audio gracefully
- ✅ No errors shown to user
- ✅ No 404 errors in console (placeholders prevent this)

## 🎵 Where to Get Sounds (Free)

### 1. Freesound.org
- URL: https://freesound.org/search/?q=notification
- Search: "notification bell", "message pop"
- Filter: Creative Commons licenses
- Download: Free registration required

### 2. Mixkit.co
- URL: https://mixkit.co/free-sound-effects/notification/
- Category: Notification Sounds
- License: Free for commercial use
- Download: No registration needed

### 3. Sound Bible
- URL: https://soundbible.com/tags-notification.html
- Search: "beep", "pop", "notification"
- License: Public domain sounds available
- Download: Direct download links

### 4. ZapSplat
- URL: https://www.zapsplat.com/sound-effect-category/notifications/
- Quality: High-quality professional sounds
- License: Free with attribution

## 🛠️ How to Replace Placeholders

### Step 1: Download Sounds
```bash
# Example using wget (Linux/Mac)
wget https://example.com/notification.mp3 -O notification.mp3
wget https://example.com/message-sent.mp3 -O message-sent.mp3
```

### Step 2: Convert to MP3 (if needed)
```bash
# Using ffmpeg
ffmpeg -i input.wav -acodec libmp3lame -ab 128k notification.mp3
```

### Step 3: Replace Files
1. Delete current placeholder files
2. Add your new MP3 files
3. Ensure names match exactly:
   - `notification.mp3`
   - `message-sent.mp3`

### Step 4: Test
Open browser console and run:
```javascript
const sound = new Audio('/sounds/notification.mp3');
sound.play();
```

## 📐 Audio Specifications

### Recommended Settings:
- **Sample Rate:** 44100 Hz (standard)
- **Bit Rate:** 128-192 kbps
- **Channels:** Stereo or Mono
- **File Size:** < 100 KB per file

### Volume Guidelines:
- **notification.mp3:** -6 dB to 0 dB (noticeable but not jarring)
- **message-sent.mp3:** -12 dB to -6 dB (subtle confirmation)

## 🔊 Sound Preferences

Users can control sound in the app:
- Settings → Notifications → Sound Preferences
- Toggle: Enable/Disable sounds
- Volume: Adjust notification volume

## 🧪 Testing Checklist

- [ ] Files load without 404 errors
- [ ] Sounds play on message received
- [ ] Sounds play on message sent
- [ ] Volume is appropriate
- [ ] Fallback beep works if files removed
- [ ] Settings toggle works correctly

## 📝 Implementation Details

### Service: `notification-sound.service.ts`
```typescript
// Location: src/services/messaging/notification-sound.service.ts

// Load sounds
this.notificationSound = new Audio('/sounds/notification.mp3');
this.messageSentSound = new Audio('/sounds/message-sent.mp3');

// Fallback if loading fails
if (loadError) {
  this.notificationSound = new Audio(this.fallbackBeep);
  // fallbackBeep = base64 encoded simple beep
}
```

## 🐛 Troubleshooting

### Problem: Sounds don't play
**Solution:**
1. Check browser console for errors
2. Verify file paths are correct
3. Test with direct URL: `http://localhost:3000/sounds/notification.mp3`
4. Check browser sound permissions

### Problem: Files show as text in browser
**Cause:** Files are text placeholders, not actual audio  
**Solution:** Replace with real MP3 files (see "How to Replace" above)

### Problem: Volume too loud/quiet
**Solution:**
1. Edit MP3 with Audacity
2. Effect → Amplify
3. Adjust by ±6 dB

## 📚 Resources

- **Audacity (Free Audio Editor):** https://www.audacityteam.org/
- **FFmpeg (Audio Converter):** https://ffmpeg.org/
- **Online MP3 Converter:** https://online-audio-converter.com/

---

**Last Updated:** January 2, 2026  
**Status:** ✅ Placeholders in place (prevents 404 errors)  
**Next Step:** Replace placeholders with real audio files  
**Priority:** Low (fallback beep works fine)


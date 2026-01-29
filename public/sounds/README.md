# 🔔 Notification Sounds

## Required Files

Please download and add the following sound files to this directory:

### 1. notification.mp3 (Primary notification sound)
- **Duration**: 0.5-1 second
- **Volume**: Moderate
- **Use**: New message received alert

### Recommended Sources (Free):
1. **Freesound.org**: https://freesound.org/search/?q=notification
2. **Mixkit**: https://mixkit.co/free-sound-effects/notification/
3. **Sound Bible**: https://soundbible.com/tags-notification.html

### Search Keywords:
- "notification bell"
- "message pop"
- "notification sound"
- "alert tone"

## How to Add:

1. Download a notification sound from one of the sources above
2. Rename it to `notification.mp3`
3. Place it in this directory: `public/sounds/notification.mp3`
4. Test it in the Messages page settings

## File Structure:
```
public/
  sounds/
    notification.mp3   ← Add this file
    README.md         ← You are here
```

## Testing:
1. Navigate to `/messages`
2. Open a conversation
3. Click Settings icon (⚙️) in chat header
4. Enable sound notifications
5. Click "Test Sound" button
6. Adjust volume if needed

## Note:
If the sound file is missing, the notification system will silently fail (no errors) and just won't play any sound.

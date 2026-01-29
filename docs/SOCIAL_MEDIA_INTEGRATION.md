# Koli One - Social Media Integration

## 🌐 Official Social Media Accounts

All official social media accounts for **Koli One** (Alaa Technologies):

| Platform | Account | URL |
|----------|---------|-----|
| **Facebook** | @koli.one | [https://www.facebook.com/koli.one/](https://www.facebook.com/koli.one/) |
| **Instagram** | @kolione | [https://www.instagram.com/kolione/](https://www.instagram.com/kolione/) |
| **YouTube** | @Kolionebg | [https://www.youtube.com/@Kolionebg](https://www.youtube.com/@Kolionebg) |
| **LinkedIn** | koli-one-a011993a9 | [https://www.linkedin.com/in/koli-one-a011993a9/](https://www.linkedin.com/in/koli-one-a011993a9/) |
| **X (Twitter)** | @kolionebg | [https://x.com/kolionebg](https://x.com/kolionebg) |
| **TikTok** | @mobilebg.eu | [https://www.tiktok.com/@mobilebg.eu](https://www.tiktok.com/@mobilebg.eu) |
| **Threads** | @kolione | [https://www.threads.com/@kolione](https://www.threads.com/@kolione) |

---

## 📍 Where Social Media Links Are Displayed

### 1. **Global Footer Component**
- **File**: `src/components/Footer/Footer.tsx`
- **Description**: Displays social media icons in circular buttons with hover effects
- **Visibility**: Appears on every page except `/cars`
- **Icons**: All 7 platforms with branded colors

### 2. **Help/Support Page**
- **File**: `src/pages/01_main-pages/help/HelpPage/index.tsx`
- **Description**: Large, prominent social media section with gradient background
- **Features**: 
  - Animated hover effects (scale + shadow)
  - Bilingual support (bg/en)
  - Call-to-action text encouraging users to follow
- **Section Title**: "Follow Us on Social Media" / "Последвайте ни в социалните мрежи"

### 3. **Brand Gallery Page**
- **File**: `src/pages/05_search-browse/brand-gallery/BrandGalleryPage/index.tsx`
- **Description**: Social media icons in footer section
- **Style**: Compact inline icons with hover scale animation

### 4. **HTML Meta Tags**
- **File**: `public/index.html`
- **Features**:
  - Open Graph tags for Facebook sharing
  - Twitter Card tags for Twitter sharing
  - `rel="me"` links for profile verification
  - Social media profile links in `<head>`
- **Benefits**: 
  - Better SEO
  - Rich social media previews
  - Profile ownership verification

---

## 🛠️ Configuration File

**Central Configuration**: `src/config/social-media.ts`

This file contains:
- `SOCIAL_MEDIA_LINKS`: Object with all platform URLs
- `SOCIAL_MEDIA_NAMES`: Display names for each platform
- `SOCIAL_MEDIA_COLORS`: Brand colors for each platform
- `getSocialMediaLinks()`: Helper function to get all links as array

### Example Usage:

```typescript
import { SOCIAL_MEDIA_LINKS, getSocialMediaLinks } from '@/config/social-media';

// Access specific platform
const facebookUrl = SOCIAL_MEDIA_LINKS.facebook;

// Get all platforms
const allPlatforms = getSocialMediaLinks();
// Returns: [{ platform: 'facebook', name: 'Facebook', url: '...', color: '...' }, ...]
```

---

## 🎨 Styling Guidelines

### Icon Sizes
- **Footer**: 20px icons in 40px circular buttons
- **Help Page**: 24px icons in 50px circular buttons
- **Brand Gallery**: 18px icons in 38px circular buttons

### Colors
Each platform uses its official brand color:
- Facebook: `#1877f2`
- Instagram: Gradient `linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)`
- YouTube: `#ff0000`
- LinkedIn: `#0077b5`
- X (Twitter): `#000000`
- TikTok: `#000000`
- Threads: `#000000`

### Hover Effects
- Scale transform: `1.1` or `1.15`
- Shadow enhancement
- Smooth transition: `0.3s ease`

---

## 🔧 Maintenance

### To Update a Social Media Link:

1. **Update the central config**:
   ```typescript
   // src/config/social-media.ts
   export const SOCIAL_MEDIA_LINKS = {
     facebook: 'NEW_URL_HERE',
     // ... other platforms
   };
   ```

2. **For manual implementations** (Footer, Help Page, Brand Gallery):
   - Search for the old URL across the codebase
   - Replace with new URL
   - Ensure `target="_blank" rel="noopener noreferrer"` is present

3. **Update HTML meta tags**:
   - Edit `public/index.html`
   - Update `<link rel="me">` tags
   - Update Twitter handle in meta tags if changed

---

## ✅ SEO Benefits

1. **Social Proof**: Displays active social media presence
2. **Profile Verification**: `rel="me"` links verify ownership
3. **Rich Previews**: Open Graph and Twitter Card tags provide rich previews when sharing
4. **Brand Consistency**: Unified social media links across all pages
5. **User Engagement**: Easy access to follow brand on preferred platform

---

## 📝 Implementation Checklist

- [x] Footer component with all 7 social media platforms
- [x] Help/Support page with prominent social media section
- [x] Brand Gallery page with social media icons
- [x] HTML meta tags (Open Graph, Twitter Card, rel="me")
- [x] Central configuration file (`social-media.ts`)
- [x] Consistent styling across all implementations
- [x] Hover animations and effects
- [x] Accessibility (aria-labels, titles)
- [x] Bilingual support (bg/en)
- [x] Mobile-responsive design

---

## 🚀 Future Enhancements

Consider adding:
- Social media feed integration
- Share buttons on car listing pages
- Social login using Facebook/Google
- Instagram gallery widget
- YouTube video embeds
- Social media analytics tracking

---

## 📞 Contact

**Company**: Alaa Technologies  
**Address**: 77 Tsar Simeon Blvd, Sofia, Bulgaria  
**Email**: info@koli.one  
**Phone**: +359 87 983 9671 (Text only)

---

*Last Updated: January 28, 2026*

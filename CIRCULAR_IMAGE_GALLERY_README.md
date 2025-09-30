# Circular Image Gallery Component

## Overview
The `CircularImageGallery` component creates a dynamic, rotating image gallery where images are displayed in circular frames that change automatically with smooth transitions.

## Features

### 🎯 **Dynamic Image Rotation**
- Images change automatically every few seconds
- Smooth fade-in/fade-out transitions
- Configurable rotation speed

### 🎨 **Circular Display**
- Images displayed in perfect circular frames
- Hover effects with scaling and shadow enhancement
- Professional border styling

### 🔄 **Smart Algorithms**
- Sequential rotation through all images
- Random image selection for added variety
- Prevents duplicate images in the same display cycle

### 📱 **Responsive Design**
- Flexible layout that adapts to different screen sizes
- Configurable image sizes and count
- Mobile-friendly design

## Usage

```tsx
import CircularImageGallery from '../components/CircularImageGallery';

// Basic usage
<CircularImageGallery />

// Advanced configuration
<CircularImageGallery
  imageSize={200}        // Size of each circular frame in pixels
  rotationSpeed={3000}   // Time between rotations in milliseconds
  showCount={6}          // Number of circles to display
  className="my-gallery" // Custom CSS class
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageSize` | `number` | `200` | Diameter of each circular frame in pixels |
| `rotationSpeed` | `number` | `3000` | Time between image rotations in milliseconds |
| `showCount` | `number` | `6` | Number of circular frames to display |
| `className` | `string` | `''` | Additional CSS class for styling |

## Image Sources

The component automatically loads images from `src/assets/images/gallery/` directory. Currently supports:
- JPEG images (`.jpg`, `.jpeg`)
- WebP images (`.webp`)

## Styling

The component uses styled-components with the following key styles:

```css
/* Circular Frame */
border: 3px solid primary color
border-radius: 50%
box-shadow: professional shadow
transition: smooth hover effects

/* Image Display */
object-fit: cover
width: 100%
height: 100%
border-radius: 50%

/* Animations */
fadeInOut: 4-second smooth transition
hover: scale and enhanced shadow
```

## Integration

### In Brand Gallery Page
```tsx
// src/pages/BrandGalleryPage.tsx
import CircularImageGallery from '../components/CircularImageGallery';

<CircularImageGallery
  imageSize={180}
  rotationSpeed={4000}
  showCount={8}
/>
```

### In Other Pages
The component can be easily integrated into any page:

```tsx
// In HomePage, CarsPage, etc.
import CircularImageGallery from '../components/CircularImageGallery';

function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      <CircularImageGallery showCount={4} imageSize={150} />
    </div>
  );
}
```

## Performance Considerations

- Images are pre-loaded and cached
- Smooth animations prevent jank
- Memory-efficient rotation algorithm
- No duplicate image loading

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Smooth animations require CSS transitions support
- Fallbacks for older browsers

## Customization

### Adding More Images
1. Place new images in `src/assets/images/gallery/`
2. Update the imports in `CircularImageGallery.tsx`
3. Add to the images array

### Custom Styling
```tsx
const CustomGallery = styled(CircularImageGallery)`
  .circular-frame {
    border-color: #ff6b6b;
  }
`;
```

## Future Enhancements

- [ ] Touch/swipe navigation for mobile
- [ ] Image preloading for better performance
- [ ] Custom transition effects
- [ ] Image captions and descriptions
- [ ] Pause on hover functionality
- [ ] Keyboard navigation support

## Dependencies

- React 16.8+ (hooks)
- styled-components
- TypeScript (optional but recommended)

## File Structure

```
src/
├── components/
│   └── CircularImageGallery.tsx
├── assets/
│   └── images/
│       └── gallery/
│           ├── image1.jpg
│           ├── image2.jpg
│           └── ...
└── pages/
    └── BrandGalleryPage.tsx (example usage)
```
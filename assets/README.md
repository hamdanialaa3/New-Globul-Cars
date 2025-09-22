# Assets Directory Structure

This directory contains all multimedia assets for the Globul Auto Platform project.

## Directory Structure

```
assets/
├── images/                    # Static images
│   ├── cars/                 # Car images and photos
│   │   ├── thumbnails/       # Small car preview images
│   │   ├── full-size/        # High-resolution car images
│   │   └── gallery/          # Car photo galleries
│   ├── logos/                # Company and brand logos
│   │   ├── main-logo/        # Primary platform logo
│   │   └── partner-logos/    # Partner company logos
│   ├── users/                # User profile images
│   │   ├── avatars/          # User profile pictures
│   │   └── verification/     # ID verification documents
│   ├── icons/                # UI icons and symbols
│   │   ├── navigation/       # Navigation menu icons
│   │   ├── actions/          # Action button icons
│   │   └── status/           # Status indicator icons
│   └── backgrounds/          # Background images
│       ├── gradients/        # Gradient backgrounds
│       └── patterns/         # Pattern backgrounds
├── videos/                   # Video files
│   ├── car-showcase/         # Car demonstration videos
│   ├── tutorials/            # User tutorials
│   └── advertisements/       # Marketing videos
├── models/                   # 3D models and AR content
│   ├── cars/                 # 3D car models
│   └── environments/         # AR environment models
├── audio/                    # Audio files
│   ├── notifications/        # Notification sounds
│   ├── background/           # Background music
│   └── voiceovers/           # Voice narration files
├── fonts/                    # Custom fonts
│   ├── primary/              # Main UI fonts
│   └── secondary/            # Secondary/accent fonts
└── documents/                # Document files
    ├── templates/            # Document templates
    ├── manuals/              # User manuals
    └── certificates/         # Certification documents
```

## Naming Conventions

- Use lowercase with hyphens: `car-image-001.jpg`
- Include descriptive names: `bmw-x5-interior-front.jpg`
- Use consistent file formats:
  - Images: `.jpg`, `.png`, `.webp`, `.svg`
  - Videos: `.mp4`, `.webm`
  - Audio: `.mp3`, `.wav`
  - 3D Models: `.gltf`, `.glb`, `.obj`

## File Organization Guidelines

1. **Cars Images**: Organize by make/model/year
   ```
   cars/
   ├── bmw/
   │   ├── x5/
   │   │   ├── 2023/
   │   │   └── 2024/
   │   └── m3/
   └── toyota/
       └── camry/
   ```

2. **User Content**: Use user IDs for organization
   ```
   users/
   ├── user-12345/
   │   ├── profile.jpg
   │   └── documents/
   └── user-67890/
   ```

3. **Version Control**: Keep multiple versions
   ```
   logos/
   ├── main-logo-v1.png
   ├── main-logo-v2.png
   └── main-logo-current.png
   ```

## Optimization Guidelines

- Compress images for web use
- Use WebP format for better compression
- Optimize videos for streaming
- Minify SVG files
- Use appropriate resolutions for different devices

## Usage in Code

```typescript
// Example usage in Vue components
import carImage from '@/assets/images/cars/bmw-x5-2024.jpg'
import mainLogo from '@/assets/images/logos/main-logo.png'

// Dynamic imports
const carImagePath = `/assets/images/cars/${make}-${model}-${year}.jpg`
```

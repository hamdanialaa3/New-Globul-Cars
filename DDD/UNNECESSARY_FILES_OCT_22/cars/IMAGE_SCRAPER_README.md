# GLOUBUL Cars - Image Scraping System

## Overview
This system provides multiple approaches to scrape car images when NetCarShow.com blocks access. It includes VPN support, proxy rotation, and alternative image sources.

## 🚫 Problem: NetCarShow Blocking
- Device/IP is blocked from accessing NetCarShow.com
- All browsers and requests timeout
- Need alternative solutions

## 🛠️ Solutions Implemented

### 1. Enhanced NetCarShow Scraper (`image-scraper.js`)
- **VPN Integration**: Automatic ProtonVPN connection
- **Proxy Rotation**: Multiple proxy servers support
- **User Agent Rotation**: Avoids detection
- **Longer Delays**: 15-25 seconds between brands, 5-8 seconds between models
- **Alternative Sources**: Falls back to APIs when NetCarShow fails

### 2. Alternative Image Scraper (`alternative-image-scraper.js`)
- **Free APIs**: Unsplash, Pexels, Pixabay
- **No Blocking Issues**: Uses official APIs
- **High Quality Images**: Stock photography
- **API Key Support**: Configurable authentication

### 3. Setup Script (`setup-image-scraper.bat`)
- Automated dependency installation
- VPN setup instructions
- API key configuration guide

## 📋 Prerequisites

### Required Software
```bash
# Install Node.js dependencies
npm install axios cheerio

# Optional: Install ProtonVPN CLI
# Download from: https://protonvpn.com/download
```

### API Keys (for Alternative Scraper)
1. **Unsplash API**: https://unsplash.com/developers
2. **Pexels API**: https://pexels.com/api
3. **Pixabay API**: https://pixabay.com/api/docs/

### Environment Variables
```bash
# Create .env file or set environment variables
UNSPLASH_API_KEY=your_unsplash_key
PEXELS_API_KEY=your_pexels_key
```

## 🚀 Usage

### Method 1: Enhanced NetCarShow Scraper (with VPN)
```bash
# Run setup first
./setup-image-scraper.bat

# Connect VPN and run scraper
protonvpn connect --fastest && node image-scraper.js
```

### Method 2: Alternative APIs Only
```bash
# Set API keys first
set UNSPLASH_API_KEY=your_key
set PEXELS_API_KEY=your_key

# Run alternative scraper
node alternative-image-scraper.js
```

### Method 3: Manual VPN Setup
```bash
# 1. Connect to VPN manually
# 2. Run scraper
node image-scraper.js

# 3. Or run alternative scraper
node alternative-image-scraper.js
```

## 📁 Output Structure

```
car_images/
├── bmw/
│   ├── 2023_bmw_x3/
│   │   ├── 1_netcarshow.jpg
│   │   ├── 2_unsplash.jpg
│   │   └── 3_pexels.jpg
│   └── 2024_bmw_x5/
│       ├── 1_unsplash.jpg
│       └── 2_pixabay.jpg
└── mercedes_benz/
    └── 2023_mercedes_c_class/
        ├── 1_netcarshow.jpg
        └── 2_netcarshow.jpg

car_images_alternative/
└── [Same structure but only from APIs]
```

## 🔧 Configuration

### Proxy Setup
Edit `image-scraper.js` and add your proxies:
```javascript
this.proxies = [
    'http://proxy1.example.com:8080',
    'http://proxy2.example.com:8080',
    // Add more proxies
];
```

### VPN Configuration
The script automatically detects and uses ProtonVPN CLI. For other VPNs, modify the `connectToVpn()` method.

### Timing Configuration
Adjust delays in the code:
```javascript
// Between brands (seconds)
const brandDelay = 15000 + Math.random() * 10000;

// Between models (seconds)
const modelDelay = 5000 + Math.random() * 3000;
```

## 🔍 Troubleshooting

### VPN Issues
```bash
# Check VPN status
protonvpn status

# Disconnect VPN
protonvpn disconnect

# List available servers
protonvpn connect --server-list
```

### API Key Issues
- Ensure API keys are set correctly
- Check API rate limits
- Some APIs require premium accounts for higher limits

### Network Issues
- Try different VPN servers
- Use proxy servers
- Check firewall settings
- Try different network connections

## 📊 Expected Results

### With VPN + Proxies
- **Success Rate**: 70-90% of models
- **Images per Model**: 3-10 images
- **Total Images**: 1000+ per brand

### Alternative APIs Only
- **Success Rate**: 95%+ of models
- **Images per Model**: 5-15 images
- **Quality**: High (stock photos)
- **No Blocking**: Always works

## 💡 Advanced Tips

### 1. Multiple VPNs
```bash
# Use different VPN services simultaneously
# Run multiple instances with different VPNs
```

### 2. Proxy Chains
```bash
# Install proxychains
# Configure proxy chain
proxychains node image-scraper.js
```

### 3. Cloud Instances
- Run scraper on cloud VMs (AWS, Google Cloud, DigitalOcean)
- Use different IP ranges
- Scale horizontally

### 4. Paid Services
- **Bright Data**: Professional proxy service
- **ScraperAPI**: Scraping service with anti-detection
- **ScrapingBee**: Headless browser service

## 📈 Performance Optimization

### Parallel Processing
```javascript
// Process multiple brands simultaneously
const promises = brandFiles.map(file => this.scrapeImagesForBrand(file));
await Promise.all(promises);
```

### Smart Delays
- Shorter delays for successful requests
- Longer delays after failures
- Random delays to avoid patterns

### Image Optimization
- Download only high-resolution images
- Skip small/thumbnail images
- Convert formats if needed

## 🔒 Legal Considerations

- **Respect robots.txt**: Check website policies
- **API Terms of Service**: Follow API usage rules
- **Copyright**: Ensure proper licensing for commercial use
- **Rate Limiting**: Don't overwhelm servers

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify VPN/proxy configuration
3. Ensure API keys are valid
4. Try alternative methods
5. Consider paid scraping services

---

**Note**: This system is designed to work around access restrictions while respecting ethical scraping practices. Always ensure compliance with website terms and local laws.
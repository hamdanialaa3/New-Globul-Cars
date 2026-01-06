# 🕷️ New Globul Cars - Scraper Engine

This system is designed to scrape car listings from external sources (e.g., mobile.bg) and prepare them for import into Firestore.

## 🚀 Quick Start

1.  **Install Dependencies** (if you haven't already):
    ```bash
    npm install
    ```

2.  **Run the Scraper**:
    ```bash
    npm run scrape
    ```

## 📂 Structure

- `base-scraper.ts`: Core logic (Browser management, rate limiting).
- `mobile-bg-scraper.ts`: Specific logic for mobile.bg (selectors, parsing).
- `run-scraper.ts`: CLI entry point.
- `data/`: Extracted JSON files will be saved here.
- `images/`: Downloaded images (if enabled) will be saved here.

## ⚙️ Configuration

Edit `run-scraper.ts` to change:
- `maxPages`: How many pages to scrape (Default: 5).
- `headless`: Set to `false` to watch the browser in action.
- `delayBetweenRequests`: Rate limiting (Default: 3000ms).

## ⚠️ Legal Note
Ensure you comply with the Terms of Service of the target website. This tool is for educational and authorized data migration purposes only.

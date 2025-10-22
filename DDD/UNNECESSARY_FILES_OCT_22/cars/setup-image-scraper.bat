@echo off
echo ===========================================
echo    GLOUBUL Cars - Image Scraper Setup
echo ===========================================
echo.

echo This script will help you set up the image scraper with VPN and proxy support.
echo.

echo 1. VPN Setup Options:
echo    - ProtonVPN: Download from https://protonvpn.com/download
echo    - Windscribe: Download from https://windscribe.com/download
echo    - ExpressVPN: Download from https://expressvpn.com/download
echo.

echo 2. Proxy Setup:
echo    You can add free proxies to the scraper or use paid proxy services.
echo.

echo 3. API Keys for Alternative Sources:
echo    - Unsplash API: Get key from https://unsplash.com/developers
echo    - Pexels API: Get key from https://pexels.com/api
echo.

echo 4. Alternative Image Sources:
echo    - CarQuery API: https://carqueryapi.com
echo    - AutoTrader API: https://autotrader.com
echo    - Stock Photo Sites: Unsplash, Pexels, Pixabay
echo.

echo Press any key to continue...
pause >nul

echo.
echo Setting up Node.js dependencies...
call npm install axios cheerio

echo.
echo Setup complete! Now run the scraper with:
echo node image-scraper.js
echo.

echo Alternative: Run with VPN (if ProtonVPN CLI is installed):
echo protonvpn connect --fastest && node image-scraper.js
echo.

pause
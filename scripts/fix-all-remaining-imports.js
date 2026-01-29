const fs = require('fs-extra');
const path = require('path');

console.log('\n🔧 Fixing ALL remaining imports in App.tsx...\n');

const appFile = path.join(__dirname, '../src/App.tsx');

// كل الملفات التي تم نقلها بالفعل وتحتاج تحديث imports
const FIXES = {
  // User Pages
  "./pages/FavoritesPage": "./pages/03_user-pages/favorites/FavoritesPage",
  "./pages/NotificationsPage": "./pages/03_user-pages/notifications/NotificationsPage",
  "./pages/SavedSearchesPage": "./pages/03_user-pages/saved-searches/SavedSearchesPage",
  "./pages/MyDraftsPage": "./pages/03_user-pages/my-drafts/MyDraftsPage",
  "./pages/MessagingPage": "./pages/03_user-pages/messages/MessagingPage",
  
  // Search & Browse
  "./pages/BrandGalleryPage": "./pages/05_search-browse/brand-gallery/BrandGalleryPage",
  "./pages/DealersPage": "./pages/05_search-browse/dealers/DealersPage",
  "./pages/FinancePage": "./pages/05_search-browse/finance/FinancePage",
  
  // Dealer Pages → معظمها لا تزال في الجذر أو نحتاج نقلها
  "./pages/DealerPublicPage": "./pages/09_dealer-company/DealerPublicPage",
  
  // Events → Social
  "./pages/EventsPage": "./pages/03_user-pages/social/EventsPage",
};

async function main() {
  try {
    let content = await fs.readFile(appFile, 'utf8');
    let fixed = 0;
    
    for (const [old, newPath] of Object.entries(FIXES)) {
      // escape special regex characters
      const escaped = old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      
      if (content.match(regex)) {
        content = content.replace(regex, newPath);
        console.log(`✅ Fixed: ${old} → ${newPath}`);
        fixed++;
      }
    }
    
    await fs.writeFile(appFile, content, 'utf8');
    
    console.log(`\n✅ Total fixed: ${fixed} imports\n`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();


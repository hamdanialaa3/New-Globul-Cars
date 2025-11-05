const fs = require('fs');
const path = require('path');

const APP_FILE = path.join(__dirname, '../src/App.tsx');

// خريطة شاملة للاستبدالات
const REPLACEMENTS = {
  // Main Pages
  "./pages/HomePage": "./pages/01_main-pages/home/HomePage",
  "./pages/AboutPage": "./pages/01_main-pages/about/AboutPage",
  "./pages/ContactPage": "./pages/01_main-pages/contact/ContactPage",
  "./pages/HelpPage": "./pages/01_main-pages/help/HelpPage",
  
  // User Pages
  "./pages/ProfilePage": "./pages/03_user-pages/profile/ProfilePage",
  "./pages/UsersDirectoryPage": "./pages/03_user-pages/users-directory/UsersDirectoryPage",
  "./pages/MyListingsPage": "./pages/03_user-pages/my-listings/MyListingsPage",
  "./pages/SocialFeedPage": "./pages/03_user-pages/social/SocialFeedPage",
  "./pages/CreatePostPage": "./pages/03_user-pages/social/CreatePostPage",
  "./pages/AllPostsPage": "./pages/03_user-pages/social/AllPostsPage",
  
  // Search & Browse
  "./pages/AdvancedSearchPage": "./pages/05_search-browse/advanced-search/AdvancedSearchPage",
  
  // Admin
  "./pages/AdminPage": "./pages/06_admin/regular-admin/AdminPage",
  "./pages/AdminDashboard": "./pages/06_admin/regular-admin/AdminDashboard",
  "./pages/SuperAdminDashboardNew": "./pages/06_admin/super-admin/SuperAdminDashboard",
};

try {
  let content = fs.readFileSync(APP_FILE, 'utf8');
  let count = 0;
  
  Object.entries(REPLACEMENTS).forEach(([old, newPath]) => {
    if (content.includes(old)) {
      content = content.replaceAll(old, newPath);
      count++;
      console.log(`✅ ${old} → ${newPath}`);
    }
  });
  
  fs.writeFileSync(APP_FILE, content, 'utf8');
  console.log(`\n✅ Updated App.tsx: ${count} imports`);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}


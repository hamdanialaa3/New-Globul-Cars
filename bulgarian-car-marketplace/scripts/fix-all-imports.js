const fs = require('fs');
const path = require('path');

const APP_FILE = path.join(__dirname, '../src/App.tsx');

console.log('🔧 Fixing all imports in App.tsx...\n');

let content = fs.readFileSync(APP_FILE, 'utf8');
let changes = 0;

// Main Pages
content = content.replace(/import\(['\"]\.\/pages\/HomePage['\"]\)/g, "import('./pages/01_main-pages/home/HomePage')");
content = content.replace(/import\(['\"]\.\/pages\/AboutPage['\"]\)/g, "import('./pages/01_main-pages/about/AboutPage')");
content = content.replace(/import\(['\"]\.\/pages\/ContactPage['\"]\)/g, "import('./pages/01_main-pages/contact/ContactPage')");
content = content.replace(/import\(['\"]\.\/pages\/HelpPage['\"]\)/g, "import('./pages/01_main-pages/help/HelpPage')");

// User Pages
content = content.replace(/import\(['\"]\.\/pages\/ProfilePage['\"]\)/g, "import('./pages/03_user-pages/profile/ProfilePage')");
content = content.replace(/import\(['\"]\.\/pages\/UsersDirectoryPage['\"]\)/g, "import('./pages/03_user-pages/users-directory/UsersDirectoryPage')");
content = content.replace(/import\(['\"]\.\/pages\/MyListingsPage['\"]\)/g, "import('./pages/03_user-pages/my-listings/MyListingsPage')");
content = content.replace(/import\(['\"]\.\/pages\/SocialFeedPage['\"]\)/g, "import('./pages/03_user-pages/social/SocialFeedPage')");
content = content.replace(/import\(['\"]\.\/pages\/CreatePostPage['\"]\)/g, "import('./pages/03_user-pages/social/CreatePostPage')");
content = content.replace(/import\(['\"]\.\/pages\/AllPostsPage['\"]\)/g, "import('./pages/03_user-pages/social/AllPostsPage')");

// Search
content = content.replace(/import\(['\"]\.\/pages\/AdvancedSearchPage['\"]\)/g, "import('./pages/05_search-browse/advanced-search/AdvancedSearchPage')");

// Admin
content = content.replace(/import\(['\"]\.\/pages\/AdminPage['\"]\)/g, "import('./pages/06_admin/regular-admin/AdminPage')");
content = content.replace(/import\(['\"]\.\/pages\/AdminDashboard['\"]\)/g, "import('./pages/06_admin/regular-admin/AdminDashboard')");
content = content.replace(/import\(['\"]\.\/pages\/SuperAdminDashboardNew['\"]\)/g, "import('./pages/06_admin/super-admin/SuperAdminDashboard')");

fs.writeFileSync(APP_FILE, content, 'utf8');
console.log('✅ App.tsx updated!\n');

// Fix relative imports in all migrated sections
console.log('🔧 Fixing relative imports in migrated files...\n');

function fixRelativeImports(dir, depth) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      fixRelativeImports(fullPath, depth);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let changed = false;
        
        // Fix all relative imports to hooks, contexts, firebase, etc.
        const fixes = [
          [/from ['"]\.\.\/hooks\//g, "from '../../../../../hooks/"],
          [/from ['"]\.\.\/\.\.\/hooks\//g, "from '../../../../../hooks/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/hooks\//g, "from '../../../../../hooks/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/hooks\//g, "from '../../../../../hooks/"],
          [/from ['"]\.\.\/contexts\//g, "from '../../../../../contexts/"],
          [/from ['"]\.\.\/\.\.\/contexts\//g, "from '../../../../../contexts/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/contexts\//g, "from '../../../../../contexts/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/contexts\//g, "from '../../../../../contexts/"],
          [/from ['"]\.\.\/firebase\//g, "from '../../../../../firebase/"],
          [/from ['"]\.\.\/\.\.\/firebase\//g, "from '../../../../../firebase/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/firebase\//g, "from '../../../../../firebase/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/firebase\//g, "from '../../../../../firebase/"],
          [/from ['"]\.\.\/services\//g, "from '../../../../../services/"],
          [/from ['"]\.\.\/\.\.\/services\//g, "from '../../../../../services/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/services\//g, "from '../../../../../services/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/services\//g, "from '../../../../../services/"],
          [/from ['"]\.\.\/utils\//g, "from '../../../../../utils/"],
          [/from ['"]\.\.\/\.\.\/utils\//g, "from '../../../../../utils/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/utils\//g, "from '../../../../../utils/"],
          [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/utils\//g, "from '../../../../../utils/"],
        ];
        
        fixes.forEach(([pattern, replacement]) => {
          if (pattern.test(content)) {
            content = content.replace(pattern, replacement);
            changed = true;
          }
        });
        
        if (changed) {
          fs.writeFileSync(fullPath, content, 'utf8');
        }
      } catch (error) {
        // Skip
      }
    }
  });
}

const sections = [
  'src/pages/01_main-pages',
  'src/pages/02_authentication',
  'src/pages/03_user-pages',
  'src/pages/05_search-browse',
  'src/pages/06_admin',
  'src/pages/10_legal',
  'src/pages/11_testing-dev'
];

sections.forEach(section => {
  const fullPath = path.join(__dirname, '..', section);
  fixRelativeImports(fullPath, 0);
});

console.log('✅ All relative imports fixed!\n');


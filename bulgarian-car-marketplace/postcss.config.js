// ═══════════════════════════════════════════════════════════════════════════
// 🔧 PostCSS Configuration - Bulgarian Car Marketplace
// تكوين PostCSS - السوق البلغاري للسيارات
// 
// Purpose: Configure PostCSS to process Tailwind CSS and apply autoprefixer
// الهدف: تكوين PostCSS لمعالجة Tailwind CSS وتطبيق autoprefixer
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  plugins: {
    // Tailwind CSS - Modern utility-first CSS framework
    '@tailwindcss/postcss': {},
    
    // Autoprefixer - Automatically add vendor prefixes for browser compatibility
    // يضيف البادئات التلقائية للمتصفحات (e.g., -webkit-, -moz-, -ms-)
    autoprefixer: {},
  },
};

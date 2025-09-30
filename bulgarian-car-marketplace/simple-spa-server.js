const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = 3001;
const buildDir = path.join(__dirname, 'build');

// أنواع الملفات ومحتوياتها
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // إذا كان المسار "/" أو فارغ، اجعله "/index.html"
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  let filePath = path.join(buildDir, pathname);
  
  // التحقق من وجود الملف
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // إذا لم يوجد الملف، إرجاع index.html (للـ React Router)
      filePath = path.join(buildDir, 'index.html');
    }
    
    // قراءة وإرسال الملف
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end(`خطأ في الخادم: ${err.code} ..\n`);
        return;
      }
      
      // تحديد نوع المحتوى
      const ext = path.parse(filePath).ext;
      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(data);
    });
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 خادم SPA يعمل على http://localhost:${port}`);
  console.log('📱 التطبيق جاهز للاستخدام!');
  console.log('🔗 جرب هذه الروابط:');
  console.log(`   • الرئيسية: http://localhost:${port}/`);
  console.log(`   • السيارات: http://localhost:${port}/cars`);
  console.log(`   • البحث المتقدم: http://localhost:${port}/advanced-search`);
  console.log(`   • بيع السيارة: http://localhost:${port}/sell`);
  console.log(`   • الوكلاء: http://localhost:${port}/dealers`);
  console.log(`   • التمويل: http://localhost:${port}/finance`);
  console.log('');
  console.log('✅ جميع روابط React Router تعمل الآن!');
});

// معالجة الأخطاء
server.on('error', (err) => {
  console.error('خطأ في الخادم:', err);
});

process.on('SIGINT', () => {
  console.log('\n🛑 إيقاف الخادم...');
  server.close(() => {
    console.log('✅ تم إيقاف الخادم بنجاح');
    process.exit(0);
  });
});
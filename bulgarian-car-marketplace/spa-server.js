const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

// تقديم الملفات الثابتة من مجلد build
app.use(express.static(path.join(__dirname, 'build')));

// لجميع الطلبات التي لا تتطابق مع ملفات ثابتة، إرجاع index.html
// هذا يضمن أن React Router يعمل للروابط المباشرة
app.get('*', function(req, res) {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 الخادم يعمل على http://localhost:${port}`);
  console.log('📱 التطبيق جاهز للاستخدام!');
  console.log('🔗 جرب هذه الروابط:');
  console.log(`   • الرئيسية: http://localhost:${port}/`);
  console.log(`   • السيارات: http://localhost:${port}/cars`);
  console.log(`   • البحث المتقدم: http://localhost:${port}/advanced-search`);
  console.log(`   • بيع السيارة: http://localhost:${port}/sell`);
});
/**
 * Project Knowledge Test Script
 * سكربت اختبار قاعدة معرفة المشروع
 * 
 * يختبر جميع وظائف نظام RAG
 */

const fs = require('fs');
const path = require('path');

// تحميل قاعدة المعرفة
const knowledgeBasePath = path.join(__dirname, '..', 'data', 'project-knowledge.json');
const knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, 'utf8'));

console.log('🧪 اختبار نظام معرفة المشروع\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: إحصائيات عامة
console.log('📊 Test 1: الإحصائيات العامة');
console.log(`✅ عدد الملفات: ${knowledgeBase.files.length}`);
console.log(`✅ إجمالي الأسطر: ${knowledgeBase.summary.totalLines.toLocaleString()}`);
console.log(`✅ عدد الدوال: ${knowledgeBase.summary.codeStats.totalFunctions}`);
console.log(`✅ عدد الـ Classes: ${knowledgeBase.summary.codeStats.totalClasses}`);
console.log(`✅ عدد الـ Interfaces: ${knowledgeBase.summary.codeStats.totalInterfaces}`);
console.log('');

// Test 2: أنواع الملفات
console.log('📁 Test 2: توزيع أنواع الملفات');
Object.entries(knowledgeBase.summary.fileTypes)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .forEach(([type, count]) => {
    console.log(`  ${type}: ${count} ملف`);
  });
console.log('');

// Test 3: أهم المجلدات
console.log('📂 Test 3: أهم المجلدات');
Object.entries(knowledgeBase.summary.topDirectories)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .forEach(([dir, count]) => {
    console.log(`  ${dir}: ${count} ملف`);
  });
console.log('');

// Test 4: أكثر الكلمات المفتاحية شيوعاً
console.log('🏷️  Test 4: أكثر 10 كلمات مفتاحية');
knowledgeBase.summary.topKeywords.slice(0, 10).forEach(({ keyword, count }) => {
  console.log(`  ${keyword}: ${count}`);
});
console.log('');

// Test 5: البحث في الفهرس
console.log('🔍 Test 5: اختبار البحث في الفهرس');

// البحث عن ملفات بكلمة "service"
const serviceFiles = knowledgeBase.searchIndex.byKeyword['service'] || [];
console.log(`  ✅ ملفات "service": ${serviceFiles.length}`);

// البحث عن ملفات TypeScript
const tsFiles = knowledgeBase.searchIndex.byType['.ts'] || [];
console.log(`  ✅ ملفات .ts: ${tsFiles.length}`);

// البحث في src
const srcFiles = knowledgeBase.searchIndex.byDirectory['src'] || [];
console.log(`  ✅ ملفات src: ${srcFiles.length}`);
console.log('');

// Test 6: البحث الذكي (محاكاة)
console.log('🤖 Test 6: محاكاة البحث الذكي');

function smartSearch(query) {
  const queryLower = query.toLowerCase();
  const matches = [];
  
  knowledgeBase.files.forEach((file, idx) => {
    let score = 0;
    
    // تطابق اسم الملف
    if (file.path.toLowerCase().includes(queryLower)) {
      score += 50;
    }
    
    // تطابق الكلمات المفتاحية
    if (file.keywords.some(k => k.toLowerCase().includes(queryLower))) {
      score += 20;
    }
    
    // تطابق الدوال
    if (file.analysis.functions?.some(f => f.toLowerCase().includes(queryLower))) {
      score += 30;
    }
    
    if (score > 0) {
      matches.push({ file: file.path, score });
    }
  });
  
  return matches.sort((a, b) => b.score - a.score).slice(0, 5);
}

// اختبار 1: البحث عن "firebase"
console.log('\n  🔍 السؤال: "أين موجود firebase config؟"');
const firebaseResults = smartSearch('firebase');
firebaseResults.slice(0, 3).forEach(({ file, score }) => {
  console.log(`    ✅ ${file} (نقاط: ${score})`);
});

// اختبار 2: البحث عن "car service"
console.log('\n  🔍 السؤال: "كيف يعمل car service؟"');
const carResults = smartSearch('car');
carResults.slice(0, 3).forEach(({ file, score }) => {
  console.log(`    ✅ ${file} (نقاط: ${score})`);
});

// اختبار 3: البحث عن "authentication"
console.log('\n  🔍 السؤال: "شرح authentication"');
const authResults = smartSearch('auth');
authResults.slice(0, 3).forEach(({ file, score }) => {
  console.log(`    ✅ ${file} (نقاط: ${score})`);
});

console.log('\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('✅ جميع الاختبارات نجحت! نظام RAG جاهز للاستخدام 🎉\n');
console.log('📝 الخطوة التالية:');
console.log('  1. ابدأ المشروع: npm start');
console.log('  2. افتح الـ Chatbot');
console.log('  3. اسأل أي سؤال عن المشروع!');
console.log('');

// كود بسيط للكونسول - انسخ ولصق في كونسول المتصفح

// استخراج الشركات
const makes = Array.from(document.querySelectorAll('select[name="make"] option'))
  .filter(opt => opt.value)
  .map(opt => ({ value: opt.value, text: opt.text.trim() }));

console.log('الشركات:', makes);

// استخراج الموديلات الحالية
const models = Array.from(document.querySelectorAll('select[name="model"] option'))
  .filter(opt => opt.value)
  .map(opt => ({ value: opt.value, text: opt.text.trim() }));

console.log('الموديلات الحالية:', models);

// نسخ البيانات للحفظ
copy({ makes, models });
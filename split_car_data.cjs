const fs = require('fs');
const path = require('path');

// قراءة الملف الكبير
const data = JSON.parse(fs.readFileSync('c:/Users/hamda/Desktop/New Globul Cars/temp_car_data.json', 'utf8'));

console.log('عدد الشركات:', data.length);

// إنشاء مجلد للملفات المقسمة
const outputDir = 'c:/Users/hamda/Desktop/New Globul Cars/car_data_split';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// تقسيم البيانات إلى ملفات أصغر (5 شركات لكل ملف)
const chunkSize = 5;
for (let i = 0; i < data.length; i += chunkSize) {
  const chunk = data.slice(i, i + chunkSize);
  const fileName = `car_data_part_${Math.floor(i / chunkSize) + 1}.json`;
  const filePath = path.join(outputDir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(chunk, null, 2));
  console.log(`تم إنشاء: ${fileName} (${chunk.length} شركات)`);
}

// إنشاء ملف فهرس
const indexData = data.map((make, index) => ({
  id: make.id,
  name: make.name,
  file: `car_data_part_${Math.floor(index / chunkSize) + 1}.json`,
  indexInFile: index % chunkSize
}));

fs.writeFileSync(path.join(outputDir, 'index.json'), JSON.stringify(indexData, null, 2));
console.log('تم إنشاء ملف الفهرس');
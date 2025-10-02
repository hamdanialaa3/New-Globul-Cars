const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../bulgarian-car-marketplace/src/constants/carData_static.ts');
const outputDir = path.join(__dirname, '../bulgarian-car-marketplace/src/constants/carData/brands');

console.log('🔍 Reading carData_static.ts...');
const content = fs.readFileSync(sourceFile, 'utf-8');

// استخراج CAR_DATA array
const dataMatch = content.match(/export const CAR_DATA: CarMake\[\] = \[([\s\S]*)\];/);
if (!dataMatch) {
  console.error('❌ Could not find CAR_DATA array!');
  process.exit(1);
}

console.log('✅ Found CAR_DATA array');

// تحويل إلى JSON
const jsonData = dataMatch[1].trim();
let brands;
try {
  brands = eval(`[${jsonData}]`);
} catch (e) {
  console.error('❌ Could not parse data:', e.message);
  process.exit(1);
}

console.log(`✅ Parsed ${brands.length} brands`);

// تحديد الماركات الشهيرة
const popularBrandIds = [
  'bmw', 'mercedes', 'audi', 'volkswagen', 'toyota', 'honda', 'ford',
  'opel', 'renault', 'peugeot', 'citroen', 'skoda', 'seat', 'mazda', 'nissan'
];

const popularBrands = brands.filter(b => popularBrandIds.includes(b.id));
const otherBrands = brands.filter(b => !popularBrandIds.includes(b.id));

console.log(`✅ Popular brands: ${popularBrands.length}`);
console.log(`✅ Other brands: ${otherBrands.length}`);

// تقسيم الباقي حسب الحروف
const ranges = {
  'a-c': (id) => id[0] >= 'a' && id[0] <= 'c',
  'd-f': (id) => id[0] >= 'd' && id[0] <= 'f',
  'g-l': (id) => id[0] >= 'g' && id[0] <= 'l',
  'm-p': (id) => id[0] >= 'm' && id[0] <= 'p',
  'q-s': (id) => id[0] >= 'q' && id[0] <= 's',
  't-z': (id) => id[0] >= 't' && id[0] <= 'z'
};

const splitBrands = {
  'a-c': [],
  'd-f': [],
  'g-l': [],
  'm-p': [],
  'q-s': [],
  't-z': []
};

otherBrands.forEach(brand => {
  const firstChar = brand.id[0].toLowerCase();
  for (const [range, test] of Object.entries(ranges)) {
    if (test(firstChar)) {
      splitBrands[range].push(brand);
      break;
    }
  }
});

// كتابة الملفات
const writeFile = (filename, varName, data) => {
  const content = `import { CarMake } from '../types';

export const ${varName}: CarMake[] = ${JSON.stringify(data, null, 2)};
`;
  fs.writeFileSync(path.join(outputDir, filename), content, 'utf-8');
  console.log(`✅ Created ${filename} (${data.length} brands)`);
};

// كتابة Popular brands
writeFile('popular.ts', 'POPULAR_BRANDS', popularBrands);

// كتابة الملفات المقسمة
Object.entries(splitBrands).forEach(([range, data]) => {
  const varName = `BRANDS_${range.toUpperCase().replace('-', '_')}`;
  writeFile(`${range}.ts`, varName, data);
});

console.log('\n✅ All files created successfully!');
console.log('\n📊 Summary:');
console.log(`   Popular brands: ${popularBrands.length} brands`);
Object.entries(splitBrands).forEach(([range, data]) => {
  console.log(`   ${range}: ${data.length} brands`);
});
console.log(`\n   Total: ${brands.length} brands\n`);


